import { describe, expect, it, vi } from 'vitest';
import { buildBody, parseBody, normalizeSearch, filterEntries, GalleryClient, GalleryError, retryAfterMs, validShareLink } from '../src/app/gallery/gallery.ts';
const site = 'https://yiftahcooper.github.io/israel-elections/';
const scenario = { name: 'שלום', description: '<img src=x onerror=alert(1)>\nDetails', electionId: 'k26', year: '2026', tags: ['test'], shareLink: `${site}#s=abc_12` };
describe('gallery template', () => {
  it('round trips multiline text without interpreting HTML', () => expect(parseBody(buildBody(scenario), site)).toEqual(scenario));
  it('rejects missing fields, malformed bodies and foreign links', () => {
    expect(parseBody('{}', site)).toBeNull();
    for (const key of Object.keys(scenario)) {
      const incomplete: Record<string, unknown> = { ...scenario };
      delete incomplete[key];
      expect(parseBody('Scenario gallery v1\n\n```json\n' + JSON.stringify(incomplete) + '\n```', site)).toBeNull();
    }
    expect(parseBody(buildBody({ ...scenario, name: '' }), site)).toBeNull();
    expect(validShareLink('https://evil.example/#s=abc', site)).toBe(false);
    expect(validShareLink(`${site}#s=abc&x=1`, site)).toBe(false);
  });
  it('normalizes Hebrew niqqud, punctuation and English case', () => expect(normalizeSearch('שָׁלוֹם, HELLO!')).toBe('שלום hello'));
  it('searches descriptions and intersects year and tag filters', () => {
    const entry = { ...scenario, issue: 1, author: 'a', date: '2026-01-01', likes: 2 };
    expect(filterEntries([entry], 'details', '2026', 'test', 'likes')).toEqual([entry]);
    expect(filterEntries([entry], '', '2022', '', 'newest')).toEqual([]);
    expect(filterEntries([entry], '', '', 'other', 'likes')).toEqual([]);
    const newer = { ...entry, issue: 2, date: '2026-02-01', likes: 0 };
    expect(filterEntries([newer, entry], '', '', '', 'likes')[0]).toEqual(entry);
    expect(filterEntries([entry, newer], '', '', '', 'newest')[0]).toEqual(newer);
  });
});
describe('API', () => {
  it('uses the static index without consuming any GitHub quota', async () => {
    const entry = { ...scenario, issue: 1, author: 'alice', date: '2026-01-01', likes: 3 };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ timestamp: Date.now(), entries: [entry] })));
    const client = new GalleryClient(site, fetcher);
    expect((await client.load()).entries).toEqual([entry]);
    await client.load();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe(`${site}data/scenarios.json`);
  });
  it('caches an old static index by retrieval time while retaining its update date', async () => {
    const timestamp = Date.now() - 86_400_000;
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ timestamp, entries: [] })));
    const values = new Map<string, string>();
    const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    const client = new GalleryClient(site, fetcher, storage);
    expect((await client.load()).timestamp).toBe(timestamp);
    await client.load();
    await new GalleryClient(site, fetcher, storage).load();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  const memory = () => { const values = new Map<string, string>(); return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } }; };
  it('rejects unsafe index entries and never falls back to the GitHub API', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ timestamp: Date.now(), entries: [{ ...scenario, shareLink: 'https://evil.example/#s=abc' }] })));
    await expect(new GalleryClient(site, fetcher).load()).rejects.toThrow('network');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls.every(([url]) => !String(url).includes('api.github.com'))).toBe(true);
  });
  it('calls the global fetch unbound by default (browsers reject fetch called as a method)', async () => {
    const strict = vi.fn(function (this: unknown) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(new Response(JSON.stringify({ timestamp: Date.now(), entries: [] }), { status: 200 }));
    });
    vi.stubGlobal('fetch', strict);
    try { await expect(new GalleryClient(site).load()).resolves.toMatchObject({ entries: [] }); }
    finally { vi.unstubAllGlobals(); }
  });
  it('honours 429 Retry-After across reloads and keeps cached entries', async () => {
    const storage = memory();
    const entry = { ...scenario, issue: 1, author: 'alice', date: '2026-01-01', likes: 3 };
    const stamp = Date.now(), ok = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ timestamp: stamp, entries: [entry] })));
    await new GalleryClient(site, ok, storage).load();
    vi.useFakeTimers({ now: Date.now() + 11 * 60_000 });
    try {
      const limited = vi.fn().mockResolvedValue(new Response('', { status: 429, headers: { 'Retry-After': '3600' } }));
      const client = new GalleryClient(site, limited, storage);
      const error = await client.load().then(() => { throw new Error('loaded'); }, (e: unknown) => e as GalleryError);
      expect(error).toBeInstanceOf(GalleryError);
      expect(error.message).toBe('rate-limit');
      expect(error.retryAt - Date.now()).toBe(3_600_000);
      expect(client.cached()?.entries).toEqual([entry]);
      // a reload (a new client) within the hour does not ask again
      await expect(new GalleryClient(site, limited, storage).load()).rejects.toThrow('rate-limit');
      vi.setSystemTime(Date.now() + 30 * 60_000);
      await expect(new GalleryClient(site, limited, storage).load()).rejects.toThrow('rate-limit');
      expect(limited).toHaveBeenCalledTimes(1);
      vi.setSystemTime(Date.now() + 31 * 60_000);
      await expect(new GalleryClient(site, ok, storage).load()).resolves.toMatchObject({ entries: [entry] });
    } finally { vi.useRealTimers(); }
  });
  it('waits at least ten minutes after network errors and reads HTTP-date Retry-After', async () => {
    const offline = vi.fn().mockRejectedValue(new Error('offline'));
    const client = new GalleryClient(site, offline);
    await expect(client.load()).rejects.toThrow('network');
    await expect(client.load()).rejects.toThrow('network');
    expect(offline).toHaveBeenCalledTimes(1);
    const now = Date.parse('2026-11-05T10:00:00Z');
    expect(retryAfterMs('120', now)).toBe(120_000);
    expect(retryAfterMs('Thu, 05 Nov 2026 10:05:00 GMT', now)).toBe(300_000);
    expect(retryAfterMs('soon', now)).toBeNull();
    expect(retryAfterMs(null, now)).toBeNull();
  });
});
