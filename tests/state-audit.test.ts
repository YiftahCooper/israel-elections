// Saved work, links and storage (audit 12 Nov 2026, c-state-code and c-robustness): no path may discard unsaved work,
// a remembered answer survives a reload, a link or stored value the app cannot read is said to be so, and a failed
// save changes nothing.
import { beforeEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { factLog } from '../src/model/actionClassification.ts';
import { applyAction } from '../src/model/actions.ts';
import type { Action } from '../src/model/scenario.ts';

const mem = new Map<string, string>();
let refuse: string | null = null;
const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (k === refuse) throw new Error('QuotaExceededError'); mem.set(k, v); }, removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0 };
vi.stubGlobal('localStorage', storage);
const files = (url: string) => { const m = /data\/(.+\.json)$/.exec(url); return m ? new Response(readFileSync(`public/data/${m[1]}`, 'utf8')) : new Response('', { status: 404 }); };
vi.stubGlobal('fetch', async (url: string) => files(String(url)));
const store = await import('../src/app/store.ts');

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
const k26 = load('k26'), k25 = load('k25'), k24 = load('k24');
const transfer = (ds: ElectionDataset, votes: number): Action => ({ type: 'transfer', from: ds.lists[0].id, to: ds.lists[1].id, votes });
const holds = (votes: number) => (x: { scenario: { log: { action: Action }[] } }) => x.scenario.log.some((e) => e.action.type === 'transfer' && e.action.votes === votes);

beforeEach(() => {
  mem.clear(); refuse = null;
  store.setState({ datasets: { k26, k25, k24 }, electionId: 'k26', scenario: null, reference: null, past: [], future: [], saved: [], sessions: {}, scenarioDrafts: {}, comparing: null, lang: 'en', notice: null, toast: null, loadError: null, preferenceAsk: null, preferenceFor: {}, preferences: {} });
});

test('c-state-code-01: opening a link of another election keeps that election\'s unsaved work as a draft', async () => {
  await store.openElection('k25');
  expect(store.dispatch(transfer(k25, 50000))).toBe(true);
  await store.openElection('k26');
  expect(store.getState().sessions.k25).toBeTruthy();
  await store.openElection('k25', { name: 'Shared scenario', log: [] });
  const st = store.getState();
  expect(st.scenario!.name).toBe('Shared scenario');
  const kept = [...Object.values(st.scenarioDrafts), ...Object.values(st.sessions)].filter((x) => x && holds(50000)(x));
  expect(kept).toHaveLength(1);
});

test('c-state-code-02: a saved scenario that only changes colours is that scenario, not the official result', async () => {
  await store.openElection('k25');
  store.dispatch({ type: 'setListMeta', listId: k25.lists[0].id, patch: { color: '#123456' } });
  expect(store.saveCurrent('My colours')).toBe(true);
  const id = store.getState().scenario!.id;
  expect(store.scenarioKey()).toBe(id);
  store.openOfficial();
  expect(store.getState().scenario!.name).not.toBe('My colours');
  expect(store.scenarioKey()).toBe('official');
});

test('c-state-code-02: a saved scenario whose facts went back to official, with a colour change, is still unsaved work', async () => {
  await store.openElection('k25');
  store.dispatch(transfer(k25, 1000));
  expect(store.saveCurrent('Plan B')).toBe(true);
  store.dispatch(transfer(k25, -1000));
  store.dispatch({ type: 'setListMeta', listId: k25.lists[0].id, patch: { color: '#123456' } });
  expect(store.scenarioKey()).toMatch(/^draft:/);
});

test('c-state-code-03: "For this scenario" in Mark changes since survives a reload', async () => {
  await store.openElection('k25');
  store.dispatch(transfer(k25, 1000));
  expect(store.saveCurrent('A')).toBe(true);
  const saved = store.getState().saved[0];
  const opened = store.openSaved(saved);
  expect(store.getState().preferenceAsk?.id).toBe('comparison');
  store.answerPreference('official', 'item');
  await opened;
  const kept = JSON.parse(mem.get('israel-elections:item-preferences') ?? '{}');
  expect(Object.values(kept)).toContain('official');
  vi.resetModules();
  const again = await import('../src/app/store.ts');
  expect(Object.entries(again.getState().preferenceFor ?? {})).toContainEqual([`comparison::${saved.id}`, 'official']);
});

test('c-state-code-07: a link step the app does not know is reported as not re-applied, and a malformed name is not used', async () => {
  await store.openElection('k26', { name: 'Bogus', log: [{ type: 'bogus' }, { type: 'rename', name: 42 }] as unknown as Action[] });
  const st = store.getState();
  expect(st.scenario!.name).toBe('Bogus');
  expect(st.scenario!.log).toHaveLength(0);
  expect(st.notice).toMatch(/^2 change/);
});

test('c-state-code-07: the engine refuses an action it does not know instead of logging it', () => {
  const s = store.replay(k26, 'x', []).scenario;
  expect(() => applyAction(s, { type: 'bogus' } as unknown as Action)).toThrow();
});

const linkOf = async (payload: unknown) => {
  const z = new Uint8Array(await new Response(new Blob([JSON.stringify(payload)]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  let bin = ''; for (const b of z) bin += String.fromCharCode(b);
  return `#s=${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
};

test('c-robustness-04, c-state-code-07: a link naming an unknown election or without a list of changes is a damaged link', async () => {
  vi.stubGlobal('location', { origin: 'https://example.test', pathname: '/', search: '', hash: '' });
  vi.stubGlobal('history', { replaceState: () => { location.hash = ''; } });
  for (const p of [{ e: 'k99', n: 'x', b: 'b', l: [] }, { n: 'x', b: 'b', l: [] }, { e: { a: 1 }, n: 'x', b: 'b', l: [] }, { e: 'k26', n: 'x', b: 'b', l: 5 }, { e: 'k26', n: 7, b: 'b', l: [] }]) {
    location.hash = await linkOf(p);
    expect(await store.readSharedFromHash(), JSON.stringify(p)).toBeNull();
    store.setState({ toast: null, loadError: null });
    expect(await store.openSharedFromHash(), JSON.stringify(p)).toBe(false);
    expect(store.getState().toast?.text, JSON.stringify(p)).toMatch(/damaged or incomplete/);
    expect(store.getState().loadError).toBeNull();
  }
  location.hash = await linkOf({ e: 'k26', n: 'ok', b: 'b', l: [] });
  expect(await store.readSharedFromHash()).toMatchObject({ electionId: 'k26', name: 'ok' });
  vi.unstubAllGlobals();
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('fetch', async (url: string) => files(String(url)));
});

const snap = (ds: ElectionDataset, log: Action[], extra: object = {}) => ({ id: `${ds.id}-x`, name: 'Work', electionId: ds.id, log: log.map((action) => ({ at: '2026-11-01T00:00:00.000Z', action })), ref: null, ...extra });

test('c-state-code-09: an election picked while the last visit is being restored wins, and the restored work is kept', async () => {
  mem.set('israel-elections:workspace:v1', JSON.stringify({ v: 1, electionId: 'k26', current: snap(k26, [transfer(k26, 777)]), sessions: [], drafts: [] }));
  store.setState({ datasets: { k24 } });
  let release!: () => void;
  const gate = new Promise<void>((r) => { release = r; });
  vi.stubGlobal('fetch', async (url: string) => { await gate; return files(String(url)); });
  const restoring = store.restoreWorkspace();
  await store.openElection('k24');
  release();
  await restoring;
  vi.stubGlobal('fetch', async (url: string) => files(String(url)));
  const st = store.getState();
  expect(st.electionId).toBe('k24');
  expect(st.scenario!.electionId).toBe('k24');
  expect([...Object.values(st.sessions), ...Object.values(st.scenarioDrafts)].some((x) => x && holds(777)(x))).toBe(true);
});

test('c-state-code-10: a duplicate the browser refuses to save leaves the original open with its undo history', async () => {
  await store.openElection('k25');
  store.dispatch(transfer(k25, 1000));
  expect(store.saveCurrent('Work')).toBe(true);
  store.dispatch(transfer(k25, 2000));
  store.dispatch(transfer(k25, 3000));
  const before = store.getState();
  refuse = 'israel-elections:v1';
  store.duplicateCurrent();
  const st = store.getState();
  expect(st.toast?.kind).toBe('error');
  expect(st.scenario).toBe(before.scenario);
  expect(st.past).toBe(before.past);
  expect(st.scenario!.name).toBe('Work');
});

test('c-state-code-13: unsaved work made on older data is restored with the "data rebuilt" notice', async () => {
  await store.openElection('k26');
  store.dispatch(transfer(k26, 500));
  await new Promise((r) => setTimeout(r, 300)); // the workspace is written 250 ms after the last change
  const ws = JSON.parse(mem.get('israel-elections:workspace:v1')!);
  expect(ws.current.baseBuiltAt).toBe(k26.buildInfo.builtAt);
  await expect(store.restoreWorkspace()).resolves.toBe(true);
  expect(store.getState().notice).toBeNull();
  ws.current.baseBuiltAt = '2000-01-01T00:00:00Z';
  mem.set('israel-elections:workspace:v1', JSON.stringify(ws));
  await expect(store.restoreWorkspace()).resolves.toBe(true);
  expect(store.getState().notice).toMatch(/rebuilt/);
  expect(store.getState().scenario!.log.at(-1)!.action).toEqual(transfer(k26, 500));
});

test('c-robustness-05: an election data file of another shape is a load error, never a blank page', async () => {
  for (const body of ['{}', JSON.stringify({ ...k24, schemaVersion: 99 }), JSON.stringify({ ...k24, totals: undefined }), JSON.stringify({ ...k24, blocs: undefined }), JSON.stringify({ ...k24, lists: [{ ...k24.lists[0], candidates: null }] }), '<!doctype html>']) {
    store.setState({ datasets: {}, loadError: null });
    vi.stubGlobal('fetch', async () => new Response(body));
    await expect(store.openElection('k24')).resolves.toBe(false);
    expect(store.getState().loadError?.message).toMatch(/^data\/k24\.json: /);
    expect(store.getState().loadError?.message).not.toMatch(/Unexpected token|undefined|is not/);
  }
  vi.stubGlobal('fetch', async (url: string) => files(String(url)));
});

test('a saved scenario with a step the app does not know is kept, and opening it says the step was not re-applied', async () => {
  const entry = { id: 'k26-old', name: 'Old', electionId: 'k26', savedAt: 'x', baseBuiltAt: k26.buildInfo.builtAt, log: [transfer(k26, 900), { type: 'renamedAction', x: 1 }] };
  store.setState({ saved: [entry as never] });
  store.setState({ preferences: { comparison: 'reference' } });
  await expect(store.openSaved(store.getState().saved[0])).resolves.toBe(true);
  expect(store.getState().scenario!.name).toBe('Old');
  expect(factLog(store.getState().scenario!)).toHaveLength(1);
  expect(store.getState().notice).toMatch(/^1 change/);
});

// One plain line says what could not be read; everything readable stays.
const restart = async (values: Record<string, string>) => {
  mem.clear();
  for (const [k, v] of Object.entries(values)) mem.set(k, v);
  vi.resetModules();
  const s = await import('../src/app/store.ts');
  await s.restoreWorkspace();
  return s;
};
const good = (id: string) => ({ id, name: id, electionId: 'k26', savedAt: 'x', baseBuiltAt: 'x', log: [] });

test('c-robustness-02: unreadable saved scenarios are left out and counted; the readable ones stay', async () => {
  const s = await restart({ 'israel-elections:v1': JSON.stringify({ lang: 'en', saved: [good('a'), null, { id: 1 }, good('b'), { ...good('c'), log: null }] }) });
  expect(s.getState().saved.map((x) => x.id)).toEqual(['a', 'b']);
  const line = s.storageLossText(s.getState().storageLoss, 'en')!;
  expect(line).toMatch(/3 saved scenarios/);
  expect(s.storageLossText(s.getState().storageLoss, 'he')).toMatch(/3 תרחישים שמורים/);
});

test('nothing unreadable, nothing said', async () => {
  const s = await restart({ 'israel-elections:v1': JSON.stringify({ lang: 'en', level: 'expert', tool: null, customFeatures: null, markOfficial: false, saved: [good('a')] }),
    'israel-elections:settings': JSON.stringify({ v: 2, values: { theme: 'dark' } }) });
  expect(s.getState().storageLoss).toBeNull();
  expect(s.getState().saved).toHaveLength(1);
});

test('c-robustness-01: unreadable settings are said to be so', async () => {
  const cases: Record<string, string>[] = [{ 'israel-elections:v1': 'null' }, { 'israel-elections:v1': '{"lang":' }, { 'israel-elections:v1': JSON.stringify({ lang: 'fr' }) },
    { 'israel-elections:settings': JSON.stringify({ v: 2, values: { theme: 'purple' } }) }, { 'israel-elections:settings': '5' }];
  for (const values of cases) {
    const s = await restart(values);
    expect(s.storageLossText(s.getState().storageLoss, 'en'), JSON.stringify(values)).toMatch(/settings/);
  }
});

test('c-robustness-03: a workspace with one unreadable part keeps the rest and says so', async () => {
  const ws = { v: 1, electionId: 'k26', current: snap(k26, [transfer(k26, 321)]), sessions: [snap(k25, [transfer(k25, 654)]), { id: 5 }], drafts: [['d', 7]] };
  const s = await restart({ 'israel-elections:workspace:v1': JSON.stringify(ws) });
  const st = s.getState();
  expect(st.scenario && holds(321)({ scenario: st.scenario })).toBe(true);
  expect(st.sessions.k25 && holds(654)(st.sessions.k25)).toBe(true);
  expect(s.storageLossText(st.storageLoss, 'en')).toMatch(/unsaved work from your last visit/);
  const broken = await restart({ 'israel-elections:workspace:v1': JSON.stringify({ v: 1, electionId: 'k26', current: { id: 5 }, sessions: [snap(k25, [transfer(k25, 654)])], drafts: [] }) });
  expect(broken.getState().sessions.k25 && holds(654)(broken.getState().sessions.k25!)).toBe(true);
  expect(broken.storageLossText(broken.getState().storageLoss, 'en')).toMatch(/unsaved work/);
  const garbage = await restart({ 'israel-elections:workspace:v1': '{"v":1,' });
  expect(garbage.storageLossText(garbage.getState().storageLoss, 'en')).toMatch(/unsaved work/);
});

test('c-robustness-06: unreadable saved comparisons are left out and counted', async () => {
  const link = { v: 1, main: { e: 'k26', n: 'a', f: false, l: [] }, other: { e: 'k25', n: 'b', f: false, l: [] }, m: [] };
  const s = await restart({ 'israel-elections:comparisons': JSON.stringify([{ id: 'c1', name: 'C1', savedAt: 'x', link }, { id: 'c', name: 'C', savedAt: 'x', link: { v: 1 } }, { id: 'k', name: 'K', savedAt: 'x', link: { ...link, main: { ...link.main, e: 'k99' } } }]) });
  const sides = await import('../src/app/compare/sides.ts');
  expect(sides.savedComparisons().map((c) => c.id)).toEqual(['c1']);
  await Promise.resolve(); // reported just after the read
  expect(JSON.parse(mem.get('israel-elections:comparisons')!).map((c: { id: string }) => c.id)).toEqual(['c1']);
  expect(s.storageLossText(s.getState().storageLoss, 'en')).toMatch(/2 saved comparisons/);
});

test('c-state-code-15: removing a withdrawn list takes its held ballots out of the invalid count; merging or splitting one is refused', () => {
  const base = store.replay(k25, 'x', []).scenario, ctx = { base };
  const rz = base.lists.find((l) => l.shortEn === 'Religious Zionism')!;
  let s = applyAction(base, { type: 'addList', newId: 'sim-new', nameHe: 'חדשה', letters: 'חד', color: '#123456', votes: 0 }, undefined, ctx);
  s = applyAction(s, { type: 'transfer', from: base.lists[0].id, to: 'sim-new', votes: 40000 }, undefined, ctx);
  const before = s.invalid;
  s = applyAction(s, { type: 'setWithdrawn', listId: 'sim-new', withdrawn: true }, undefined, ctx);
  expect(s.invalid).toBe(before + 40000);
  expect(applyAction(s, { type: 'removeList', listId: 'sim-new' }, undefined, ctx).invalid).toBe(before);
  // the real 2022 figures: withdrawing Religious Zionism makes its 516,470 ballots invalid; removing it takes them out again
  const w = applyAction(base, { type: 'setWithdrawn', listId: rz.id, withdrawn: true }, undefined, ctx);
  expect([base.invalid, w.invalid]).toEqual([29851, 546321]);
  expect(applyAction(w, { type: 'removeList', listId: rz.id }, undefined, ctx).invalid).toBe(29851);
  const merge: Action = { type: 'merge', ids: [base.lists[0].id, rz.id], newId: 'sim-m', nameHe: 'איחוד', letters: 'א', color: '#123456', retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' };
  expect(() => applyAction(w, merge, undefined, ctx)).toThrow(/withdrawn/);
  expect(() => applyAction(w, { type: 'split', id: rz.id, parts: [{ newId: 'a', nameHe: 'א', letters: 'א1', color: '#111111', votes: 0, candidateIds: [] }, { newId: 'b', nameHe: 'ב', letters: 'ב1', color: '#222222', votes: 0, candidateIds: [] }] }, undefined, ctx)).toThrow(/withdrawn/);
});
