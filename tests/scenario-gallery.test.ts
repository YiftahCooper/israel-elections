import { describe, expect, it, vi } from 'vitest';
import { buildBody, parseBody, normalizeSearch, filterEntries, GalleryClient, validShareLink } from '../src/app/gallery/gallery.ts';
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
  it('rejects unsafe index entries and falls back to validated issue data', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ timestamp: Date.now(), entries: [{ ...scenario, shareLink: 'https://evil.example/#s=abc' }] })))
      .mockResolvedValueOnce(new Response('[]'));
    expect((await new GalleryClient(site, fetcher).load()).entries).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toContain('api.github.com');
  });

  it('calls the global fetch unbound by default (browsers reject fetch called as a method)', async () => {
    const strict = vi.fn(function (this: unknown) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(new Response('[]', { status: 200 }));
    });
    vi.stubGlobal('fetch', strict);
    try { await expect(new GalleryClient(site).load()).resolves.toMatchObject({ entries: [] }); }
    finally { vi.unstubAllGlobals(); }
  });
  const issue = { number: 1, body: buildBody(scenario), user: { login: 'alice' }, created_at: '2026-01-01', reactions: { '+1': 3 } };
  it('paginates and caches, including manual refresh within ten minutes', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 404 })).mockResolvedValueOnce(new Response(JSON.stringify(Array(100).fill(issue)))).mockResolvedValueOnce(new Response('[]'));
    const values = new Map<string, string>();
    const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    const client = new GalleryClient(site, fetcher, storage);
    expect((await client.load()).entries).toHaveLength(100);
    await client.load();
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[2][0]).toContain('page=2');
    expect((await new GalleryClient(site, fetcher, storage).load()).entries).toHaveLength(100);
  });
  it('reports rate limits and network errors and throttles retries', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 403 }));
    const client = new GalleryClient(site, fetcher);
    await expect(client.load()).rejects.toThrow('rate-limit');
    await expect(client.load()).rejects.toThrow('rate-limit');
    expect(fetcher).toHaveBeenCalledTimes(2);
    await expect(new GalleryClient(site, vi.fn().mockRejectedValue(new Error('offline'))).load()).rejects.toThrow('network');
  });
});
