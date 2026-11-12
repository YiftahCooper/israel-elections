// A failed data request never loses or changes the user's work, and Try again asks again for what was asked for
// (audit 12 Nov 2026: c-robustness-11, the remainders of c-robustness-04 and -05, c-robustness-08, c-analysis-code-04).
import { readFileSync } from 'node:fs';
import { beforeEach, expect, onTestFinished, test, vi } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import type { Action } from '../src/model/scenario.ts';

const mem = new Map<string, string>();
let quota = Infinity;
const used = () => [...mem].reduce((n, [k, v]) => n + k.length + v.length, 0);
const storage = new Proxy({
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => { const was = mem.get(k); mem.set(k, v); if (used() > quota) { if (was === undefined) mem.delete(k); else mem.set(k, was); throw new DOMException('full', 'QuotaExceededError'); } },
  removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0,
}, { ownKeys: () => [...mem.keys()], getOwnPropertyDescriptor: (_, k) => (mem.has(String(k)) ? { enumerable: true, configurable: true, value: mem.get(String(k)) } : undefined) });
vi.stubGlobal('localStorage', storage);
const files = (url: string) => { const m = /data\/(.+\.json)$/.exec(url); return m ? new Response(readFileSync(`public/data/${m[1]}`, 'utf8')) : new Response('', { status: 404 }); };
/** elections whose data file answers 503, until taken off */
const down = new Set<string>();
const requests: { url: string; cache?: string }[] = [];
vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
  requests.push({ url: String(url), cache: init?.cache });
  const id = /data\/(k\d+)\.json$/.exec(String(url))?.[1];
  return id && down.has(id) ? new Response('', { status: 503 }) : files(String(url));
});
vi.stubGlobal('location', { origin: 'https://example.test', pathname: '/', search: '', hash: '' });
vi.stubGlobal('history', { replaceState: () => { location.hash = ''; } });

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
const k26 = load('k26'), k25 = load('k25');
const transfer = (ds: ElectionDataset, votes: number): Action => ({ type: 'transfer', from: ds.lists[0].id, to: ds.lists[1].id, votes });
const snap = (ds: ElectionDataset, votes: number, name = 'My work') => ({ id: `${ds.id}-w`, name, electionId: ds.id, log: [{ at: '2026-11-01T00:00:00.000Z', action: transfer(ds, votes) }], ref: null });
const kept = (ws: object) => JSON.stringify({ v: 2, tabs: { earlier: { at: 1, ws } } });
const holds = (votes: number) => (s: { log: { action: Action }[] } | null | undefined) => !!s?.log.some((e) => e.action.type === 'transfer' && e.action.votes === votes);
const settle = () => new Promise((r) => setTimeout(r, 300));

/** A new visit with this stored, started as App.tsx starts it. */
async function visit(values: Record<string, string>) {
  mem.clear();
  for (const [k, v] of Object.entries(values)) mem.set(k, v);
  if (!mem.has('israel-elections:v1')) mem.set('israel-elections:v1', JSON.stringify({ lang: 'en' }));
  vi.resetModules();
  const store = await import('../src/app/store.ts');
  await store.restoreWorkspace();
  const opened = await store.openSharedFromHash();
  if (!opened && !store.getState().scenario && !store.getState().loadError) await store.openElection('k26');
  return store;
}

beforeEach(() => { down.clear(); requests.length = 0; quota = Infinity; location.hash = ''; });

test('c-robustness-11 (a): last visit\'s open work whose data does not load is kept, untouched, and Try again reopens it', async () => {
  const stored = kept({ electionId: 'k25', current: snap(k25, 2022), sessions: [], drafts: [] });
  down.add('k25');
  const store = await visit({ 'israel-elections:workspace:v1': stored });
  const st = store.getState();
  expect(st.scenario).toBeNull(); // 2026 is not opened over it
  expect(st.loadError).toMatchObject({ id: 'k25', kind: 'network', kept: true });
  await settle();
  expect(mem.get('israel-elections:workspace:v1')).toBe(stored); // nothing stored changed
  down.clear();
  st.loadError!.retry!();
  await vi.waitFor(() => expect(store.getState().scenario).not.toBeNull());
  expect(holds(2022)(store.getState().scenario)).toBe(true);
  expect(store.getState().scenario!.name).toBe('My work');
  expect(store.getState().loadError).toBeNull();
  await settle();
  const tabs = JSON.parse(mem.get('israel-elections:workspace:v1')!).tabs;
  expect(Object.keys(tabs)).not.toContain('earlier'); // taken over, and kept under this visit's entry
  expect(Object.values(tabs).some((e) => holds(2022)((e as { ws: { current: never } }).ws.current))).toBe(true);
});

test('c-robustness-11 (b): another election\'s work whose data does not load stays stored for the next visit', async () => {
  down.add('k25');
  const store = await visit({ 'israel-elections:workspace:v1': kept({ electionId: 'k26', current: snap(k26, 2026), sessions: [snap(k25, 2022)], drafts: [] }) });
  expect(holds(2026)(store.getState().scenario)).toBe(true);
  expect(store.getState().loadError).toMatchObject({ id: 'k25', kept: true });
  store.dispatch(transfer(k26, 5)); // working on: the workspace is written
  await settle();
  down.clear();
  const next = await visit(Object.fromEntries(mem));
  expect(holds(2022)(next.getState().sessions.k25?.scenario)).toBe(true);
  expect(holds(5)(next.getState().scenario)).toBe(true);
});

test('c-robustness-04: a valid link whose data does not load: Try again opens the link, and nothing changes until it does', async () => {
  const before = await visit({});
  before.dispatch(transfer(k26, 11)); // unsaved work of this visit
  await settle();
  const storedWork = mem.get('israel-elections:workspace:v1');
  const payload = { e: 'k25', n: 'Linked', b: k25.buildInfo.builtAt, l: [transfer(k25, 4321)] };
  const z = new Uint8Array(await new Response(new Blob([JSON.stringify(payload)]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  let bin = ''; for (const b of z) bin += String.fromCharCode(b);
  location.hash = `#s=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  down.add('k25');
  expect(await before.openSharedFromHash()).toBe(true);
  const st = before.getState();
  expect(st.loadError).toMatchObject({ id: 'k25', kind: 'network' });
  expect(location.hash).toMatch(/^#s=/); // the link stays, so a reload retries it too
  expect(holds(11)(st.scenario)).toBe(true);
  await settle();
  expect(mem.get('israel-elections:workspace:v1')).toBe(storedWork);
  down.clear();
  st.loadError!.retry!();
  await vi.waitFor(() => expect(before.getState().scenario?.name).toBe('Linked'));
  expect(holds(4321)(before.getState().scenario)).toBe(true);
  expect(location.hash).toBe('');
  expect(before.getState().loadError).toBeNull();
});

test('c-robustness-04: a saved scenario whose data does not load: Try again opens that scenario, not the plain election', async () => {
  const store = await visit({});
  await store.openElection('k25');
  store.dispatch(transfer(k25, 777));
  expect(store.saveCurrent('Saved one')).toBe(true);
  await store.openElection('k26');
  store.setState({ datasets: { k26 }, preferences: { comparison: 'reference' } });
  down.add('k25');
  await store.openSaved(store.getState().saved[0]);
  expect(store.getState().loadError).toMatchObject({ id: 'k25' });
  down.clear();
  store.getState().loadError!.retry!();
  await vi.waitFor(() => expect(store.getState().scenario?.name).toBe('Saved one'));
});

test('c-robustness-05: a data file of another version is fetched once more from the server, then said to be of another version', async () => {
  const store = await visit({});
  requests.length = 0;
  const stale = JSON.stringify({ ...k25, schemaVersion: 99 });
  let answers = [stale, readFileSync('public/data/k25.json', 'utf8')];
  const real = globalThis.fetch;
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => { requests.push({ url, cache: init?.cache }); return new Response(answers.shift() ?? stale); });
  onTestFinished(() => { vi.stubGlobal('fetch', real); });
  expect(await store.openElection('k25')).toBe(true); // the browser's stale copy, then the server's
  expect(requests.map((r) => r.cache)).toEqual([undefined, 'reload']);
  store.setState({ datasets: {} });
  answers = [stale, stale];
  expect(await store.openElection('k25')).toBe(false);
  expect(store.getState().loadError).toMatchObject({ id: 'k25', kind: 'version', message: 'data/k25.json: made for another version of the app' });
  answers = ['{"trunc', '{"trunc'];
  expect(await store.openElection('k25')).toBe(false);
  expect(store.getState().loadError).toMatchObject({ kind: 'network' });
});

test('c-robustness-08: a link whose name or description is not text is a damaged link, and changes nothing', async () => {
  const store = await visit({});
  const link = async (p: object) => {
    const z = new Uint8Array(await new Response(new Blob([JSON.stringify(p)]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    let bin = ''; for (const b of z) bin += String.fromCharCode(b);
    return `#s=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  };
  for (const p of [{ e: 'k26', n: { a: 1 }, b: 'b', l: [] }, { e: 'k26', n: 12345, b: 'b', l: [] }, { e: 'k26', n: 'x', d: { a: 1 }, b: 'b', l: [] }, { e: 'k26', n: 'x', b: 5, l: [] }]) {
    location.hash = await link(p);
    const scenario = store.getState().scenario;
    expect(await store.openSharedFromHash()).toBe(false);
    expect(store.getState().toast?.text).toMatch(/damaged or incomplete/);
    expect(store.getState().scenario).toBe(scenario);
  }
});

test('c-robustness-08: a browser that kept such a scenario from before the fix starts, and says what it left out', async () => {
  const bad = { ...snap(k26, 1), name: { a: 1 } };
  const store = await visit({ 'israel-elections:workspace:v1': kept({ electionId: 'k26', current: bad, sessions: [{ ...snap(k25, 2), name: 12345 }], drafts: [] }) });
  expect(store.getState().scenario?.electionId).toBe('k26');
  expect(typeof store.getState().scenario!.name).toBe('string');
  expect(store.storageLossText(store.getState().storageLoss, 'en')).toMatch(/unsaved work from your last visit/);
});

test('c-analysis-code-04: saving work in a browser whose storage the analysis cache filled clears the cache and saves', async () => {
  const store = await visit({});
  const { ANALYSIS_VERSION } = await import('../src/app/analysisCache.ts');
  // results kept by an earlier build of the app, before the cache had a budget, fill the storage to the brim
  for (let i = 0; i < 30; i++) mem.set(`israel-elections:analysis:${ANALYSIS_VERSION}:old${i}`, 'x'.repeat(150_000));
  quota = used() + 2_000;
  store.dispatch(transfer(k26, 100));
  for (let i = 0; i < 40; i++) store.dispatch(transfer(k26, 1)); // a long log: more than the room left
  expect(store.saveCurrent('Big')).toBe(true);
  expect(JSON.parse(mem.get('israel-elections:v1')!).saved.map((x: { name: string }) => x.name)).toEqual(['Big']);
  expect([...mem.keys()].some((k) => k.startsWith('israel-elections:analysis:'))).toBe(false);
  // and with nothing left to clear, the refusal is said, and nothing changes
  quota = used();
  store.dispatch(transfer(k26, 1));
  expect(store.saveCurrent('Bigger', { newIdentity: true })).toBe(false);
  expect(store.getState().toast?.text).toMatch(/refused to save/);
});
