// The language the app opens in (owner, 24 Nov 2026): a stored language always wins; without one, `?lang=` in the link,
// then the address's ending (.il Hebrew, .com English), then Hebrew. The default is not stored by itself, `?lang=` leaves
// the visible address, and index.html sets <html lang/dir> the same way before the first paint.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { langFromHost, langFromQuery, startLanguage, withoutLangParam } from '../src/app/startLanguage.ts';

describe('precedence: stored > ?lang= > address > Hebrew', () => {
  const cases: [saved: 'he' | 'en' | null, search: string, hostname: string, want: 'he' | 'en'][] = [
    ['he', '?lang=en', 'elections.example.com', 'he'], // stored wins over both
    ['en', '?lang=he', 'elections.example.co.il', 'en'],
    [null, '?lang=en', 'elections.example.co.il', 'en'], // the link wins over the address
    [null, '?lang=he', 'elections.example.com', 'he'],
    [null, '', 'elections.example.co.il', 'he'],
    [null, '', 'elections.example.org.il', 'he'],
    [null, '', 'elections.example.com', 'en'],
    [null, '', 'ELECTIONS.EXAMPLE.COM.', 'en'], // case and a trailing root dot
    [null, '?lang=fr', 'elections.example.com', 'en'], // an unknown language is ignored
    [null, '', 'yiftahcooper.github.io', 'he'], // unchanged: github.io and local addresses keep Hebrew
    [null, '', 'localhost', 'he'],
    [null, '?lang=en', 'localhost', 'en'],
    [null, '', '', 'he'],
  ];
  test.each(cases)('stored %s, link %j, address %j → %s', (saved, search, hostname, want) => {
    expect(startLanguage({ saved, search, hostname })).toBe(want);
  });
  test('the parts', () => {
    expect(langFromQuery('?map-order=biggest&lang=EN')).toBe('en');
    expect(langFromQuery('?lang=')).toBeNull();
    expect(langFromHost('il')).toBeNull(); // only an ending after a dot counts
    expect(langFromHost('example.community')).toBeNull();
  });
});

describe('?lang= leaves the visible address', () => {
  test('other parameters and a #s= share link stay', () => {
    expect(withoutLangParam('https://x.example.com/israel-elections/?lang=en&map-order=biggest#s=abc-_123'))
      .toBe('/israel-elections/?map-order=biggest#s=abc-_123');
    expect(withoutLangParam('https://x.example.com/?map-order=biggest&lang=he')).toBe('/?map-order=biggest');
    expect(withoutLangParam('https://x.example.com/?lang=en#g=12')).toBe('/#g=12');
  });
  test('an address without it is left alone', () => {
    expect(withoutLangParam('https://x.example.com/?map-order=biggest#s=abc')).toBeNull();
  });
});

describe('the store', () => {
  const mem = new Map<string, string>();
  const replaced: string[] = [];
  const at = (href: string) => {
    const u = new URL(href);
    vi.stubGlobal('location', { href, search: u.search, hostname: u.hostname, hash: u.hash, origin: u.origin, pathname: u.pathname });
  };
  const files = (url: string) => { const m = /data\/(.+\.json)$/.exec(url); return m ? new Response(readFileSync(`public/data/${m[1]}`, 'utf8')) : new Response('', { status: 404 }); };
  const open = async (href: string) => { at(href); vi.resetModules(); return import('../src/app/store.ts'); };
  const storedLang = () => (JSON.parse(mem.get('israel-elections:v1') ?? '{}') as { lang?: string }).lang;
  beforeEach(() => {
    mem.clear(); replaced.length = 0;
    vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0 });
    vi.stubGlobal('history', { state: null, replaceState: (_: unknown, __: string, url: string) => void replaced.push(url) });
    vi.stubGlobal('fetch', async (url: string) => files(String(url)));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  test('a .com address opens a new visitor in English, and a .co.il one in Hebrew', async () => {
    expect((await open('https://elections.example.com/')).getState().lang).toBe('en');
    expect((await open('https://elections.example.co.il/')).getState().lang).toBe('he');
    expect((await open('https://yiftahcooper.github.io/israel-elections/')).getState().lang).toBe('he');
  });

  test('a stored language wins over the link and the address', async () => {
    mem.set('israel-elections:v1', JSON.stringify({ lang: 'he' }));
    expect((await open('https://elections.example.com/?lang=en')).getState().lang).toBe('he');
  });

  test('?lang= is read, then removed from the address with the rest kept', async () => {
    const store = await open('https://elections.example.co.il/israel-elections/?lang=en&map-order=biggest#s=abc');
    expect(store.getState().lang).toBe('en');
    expect(replaced).toEqual(['/israel-elections/?map-order=biggest#s=abc']);
  });

  test('the default is not stored by itself; it is stored with the first thing the app stores', async () => {
    const store = await open('https://elections.example.com/');
    await store.openElection('k26');
    expect(storedLang()).toBeUndefined(); // only visiting: nothing says English was chosen
    store.setState({ tool: 'charts' }); // the app stores the user's state as it always has
    expect(storedLang()).toBe('en');
    // from now on this browser's language is the stored one, whatever the address
    expect((await open('https://elections.example.co.il/')).getState().lang).toBe('en');
  });

  test('a language the user picks is stored', async () => {
    const store = await open('https://elections.example.com/');
    store.setState({ lang: 'he' });
    expect(storedLang()).toBe('he');
  });
});

describe('index.html sets <html lang/dir> before the first paint in the same order', () => {
  const html = readFileSync('index.html', 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes('documentElement.dir'))!;
  const run = (stored: string | null, href: string) => {
    const u = new URL(href), root = { lang: 'he', dir: 'rtl' };
    runInNewContext(script, { localStorage: { getItem: (k: string) => (k === 'israel-elections:v1' ? stored : null) }, location: { search: u.search, hostname: u.hostname }, document: { documentElement: root }, URLSearchParams, JSON });
    return root;
  };
  const cases: [stored: string | null, href: string][] = [
    [null, 'https://elections.example.com/'], [null, 'https://elections.example.co.il/'], [null, 'https://elections.example.org.il/'],
    [null, 'https://yiftahcooper.github.io/israel-elections/'], [null, 'http://localhost:4174/?lang=en'], [null, 'https://elections.example.com/?lang=he'],
    [JSON.stringify({ lang: 'he' }), 'https://elections.example.com/?lang=en'], [JSON.stringify({ lang: 'en' }), 'https://elections.example.co.il/'],
    [JSON.stringify({ lang: 'fr' }), 'https://elections.example.com/'], ['not json', 'https://elections.example.com/'], [JSON.stringify({ level: 'simple' }), 'https://elections.example.co.il/?lang=en'],
  ];
  test.each(cases)('stored %s at %s', (stored, href) => {
    const u = new URL(href);
    let saved: 'he' | 'en' | null = null;
    try { const x = JSON.parse(stored ?? 'null') as { lang?: unknown } | null; saved = x?.lang === 'he' || x?.lang === 'en' ? x.lang : null; } catch { /* unreadable: none */ }
    const want = startLanguage({ saved, search: u.search, hostname: u.hostname });
    expect(run(stored, href)).toEqual({ lang: want, dir: want === 'he' ? 'rtl' : 'ltr' });
  });
});
