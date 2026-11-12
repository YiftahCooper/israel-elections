// Browser storage the app does not control must never stop it starting (audit 12 Nov 2026, ax-screens-c-06: the JSON
// text null under israel-elections:v1 left a blank page). Every key the app reads, with every kind of bad value.
import { readFileSync } from 'node:fs';
import { expect, test, vi } from 'vitest';

const KEYS = [
  'israel-elections:v1', 'israel-elections:settings', 'israel-elections:preferences', 'israel-elections:item-preferences',
  'israel-elections:workspace:v1', 'israel-elections:appearance:k26', 'israel-elections:comparisons',
  'israel-elections:families:v1', 'israel-elections:families:policy', 'israel-elections:families:partners',
  'israel-elections:voter-groups', 'israel-elections:gallery:v1', 'israel-elections:gallery:retry:v1',
];
// every field any of these keys holds, each with the wrong type
const WRONG = JSON.stringify({ lang: 5, level: {}, tool: 3, markOfficial: 'yes', customFeatures: [1], saved: 'x', v: 1, values: 'x', voteSource: 7,
  electionId: 'k26', current: { id: 5, log: 'x' }, sessions: 'x', drafts: 3, version: 1, users: 'x', hidden: 4, timestamp: 'x', entries: {}, kind: 'network', until: 'x' });
const BAD = ['null', '5', '"text"', '[]', '[1,"a",null]', '{"lang":', WRONG,
  // nearly right: one malformed entry among good ones
  JSON.stringify({ lang: 'en', level: 'expert', saved: [null, { id: 1 }, { id: 's', name: 'n', electionId: 'k26', savedAt: 'x', baseBuiltAt: 'x', log: [{ type: 'nope' }] }], customFeatures: { compare: 'weird', nope: 'show' } }),
  JSON.stringify({ v: 1, electionId: 'k26', current: { id: 'a', name: 'n', electionId: 'k26', log: [], ref: null }, sessions: [null], drafts: [['k', 5]] }),
  JSON.stringify([{ id: 'c', name: 'n', savedAt: 'x', link: { v: 1, main: null } }]),
];

const files = (url: string) => { const m = /data\/(.+\.json)$/.exec(url); return m ? new Response(readFileSync(`public/data/${m[1]}`, 'utf8')) : new Response('', { status: 404 }); };

test.each(KEYS)('the app starts whatever %s holds', async (key) => {
  for (const value of BAD) {
    const mem = new Map([[key, value]]);
    vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0 });
    vi.stubGlobal('fetch', async (url: string) => files(String(url)));
    vi.resetModules();
    const where = `${key} = ${value}`;
    const store = await import('../src/app/store.ts');
    const st = store.getState();
    expect(['he', 'en'], where).toContain(st.lang);
    expect(['simple', 'standard', 'expert'], where).toContain(st.level);
    expect(Array.isArray(st.saved) && st.saved.every((x) => typeof x.id === 'string' && typeof x.name === 'string' && Array.isArray(x.log)), where).toBe(true);
    expect(st.customFeatures === null || Object.values(st.customFeatures).every((v) => ['show', 'collapsed', 'hidden'].includes(v as string)), where).toBe(true);
    // the start-up sequence (App.tsx): restore the workspace, else open the newest election
    await expect(store.restoreWorkspace(), where).resolves.toBeTypeOf('boolean');
    await expect(store.openElection('k26'), where).resolves.toBe(true);
    expect(store.getState().scenario, where).not.toBeNull();
    const sides = await import('../src/app/compare/sides.ts');
    expect(sides.savedComparisons().every((c) => typeof c.link.main.e === 'string' && typeof c.link.other.e === 'string'), where).toBe(true);
    const { readCatalogue } = await import('../src/families/catalogue.ts');
    expect(() => readCatalogue(), where).not.toThrow();
    const { GalleryClient } = await import('../src/app/gallery/gallery.ts');
    expect(() => new GalleryClient('http://localhost/', fetch, localStorage), where).not.toThrow();
    await expect(import('../src/app/voterGroupStore.ts'), where).resolves.toBeTruthy();
  }
});
