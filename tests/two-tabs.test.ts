// Two open tabs share one browser storage (audit 12 Nov 2026, c-robustness-07): what one tab saved is never erased by
// the other. A tab writes only what it changed itself, on top of what is stored now, and takes in the other tab's
// changes as they happen. Each "tab" here is a separate copy of the store module on one shared storage.
import { readFileSync } from 'node:fs';
import { beforeEach, expect, test, vi } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import type { Action } from '../src/model/scenario.ts';

const mem = new Map<string, string>();
vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0 });
const files = (url: string) => { const m = /data\/(.+\.json)$/.exec(url); return m ? new Response(readFileSync(`public/data/${m[1]}`, 'utf8')) : new Response('', { status: 404 }); };
vi.stubGlobal('fetch', async (url: string) => files(String(url)));
// each copy of the store registers its own 'storage' listener; the browser calls those of the other tabs only
let registering: ((e: { key: string | null }) => void)[] = [];
vi.stubGlobal('addEventListener', (type: string, f: (e: { key: string | null }) => void) => { if (type === 'storage') registering.push(f); });

const k26 = JSON.parse(readFileSync('public/data/k26.json', 'utf8')) as ElectionDataset;
const k25 = JSON.parse(readFileSync('public/data/k25.json', 'utf8')) as ElectionDataset;
const transfer = (ds: ElectionDataset, votes: number): Action => ({ type: 'transfer', from: ds.lists[0].id, to: ds.lists[1].id, votes });
const savedNames = () => (JSON.parse(mem.get('israel-elections:v1') ?? '{}').saved ?? []).map((x: { name: string }) => x.name).sort();

async function openTab() {
  vi.resetModules();
  registering = [];
  const store = await import('../src/app/store.ts');
  const listeners = registering;
  await store.restoreWorkspace();
  if (!store.getState().scenario) await store.openElection('k26');
  store.setState({ lang: 'en', preferences: { ...store.getState().preferences, comparison: 'reference' } });
  /** the browser telling this tab that another tab changed `key` */
  const told = (key: string) => listeners.forEach((f) => f({ key }));
  return { store, told };
}
const settle = () => new Promise((r) => setTimeout(r, 300)); // the workspace is written 250 ms after the last change

beforeEach(() => { mem.clear(); });

test('a scenario saved in one tab survives any action in the other (the audit case)', async () => {
  const a = await openTab(), b = await openTab();
  a.store.dispatch(transfer(k26, 1000));
  expect(a.store.saveCurrent('Scenario')).toBe(true);
  expect(savedNames()).toEqual(['Scenario']);
  b.store.setState({ tool: 'coal' }); // B has not heard of A's save yet
  expect(savedNames()).toEqual(['Scenario']);
  const again = await openTab(); // A reloaded
  expect(again.store.getState().saved.map((x) => x.name)).toEqual(['Scenario']);
});

test('both tabs save: both scenarios are kept; a delete removes only that scenario', async () => {
  const a = await openTab(), b = await openTab();
  a.store.dispatch(transfer(k26, 1000));
  expect(a.store.saveCurrent('From A')).toBe(true);
  b.store.dispatch(transfer(k26, 2000));
  expect(b.store.saveCurrent('From B')).toBe(true);
  expect(savedNames()).toEqual(['From A', 'From B']);
  // B learns of A's save as it writes, and shows it
  expect(b.store.getState().saved.map((x) => x.name).sort()).toEqual(['From A', 'From B']);
  b.store.deleteSaved(b.store.getState().saved.find((x) => x.name === 'From B')!.id);
  expect(savedNames()).toEqual(['From A']);
  a.store.setState({ tool: 'charts' }); // A still lists From B, but did not delete or change it: nothing is undone
  expect(savedNames()).toEqual(['From A']);
});

test('the other tab takes in a save as it happens', async () => {
  const a = await openTab(), b = await openTab();
  a.store.dispatch(transfer(k26, 1000));
  a.store.saveCurrent('Scenario');
  b.told('israel-elections:v1');
  expect(b.store.getState().saved.map((x) => x.name)).toEqual(['Scenario']);
});

test('settings, remembered answers, Custom choices and Mark changes since: each tab\'s change is kept', async () => {
  const a = await openTab(), b = await openTab();
  a.store.setSetting('decimals', 3);
  b.store.setSetting('keepMessages', true);
  a.store.setPreference('voteSource', 'new');
  b.store.setPreference('jointSeats', 'off');
  a.store.keepFeature('charts', 'hidden');
  b.store.setState({ markOfficial: true });
  const c = await openTab();
  const st = c.store.getState();
  expect(st.settings).toMatchObject({ decimals: 3, keepMessages: true });
  expect(st.preferences).toMatchObject({ voteSource: 'new', jointSeats: 'off' });
  expect(st.customFeatures).toMatchObject({ charts: 'hidden' });
  expect(st.markOfficial).toBe(true);
  // and taken in by the other tab as they happen (theme and the joint-list count follow)
  a.told('israel-elections:settings'); a.told('israel-elections:preferences');
  expect(a.store.getState().settings).toMatchObject({ decimals: 3, keepMessages: true });
  expect(a.store.getState().preferences.jointSeats).toBe('off');
  b.told('israel-elections:v1');
  expect(b.store.getState().customFeatures).toMatchObject({ charts: 'hidden' });
});

test('the language and the open tool stay as each tab shows them; storage keeps the last chosen', async () => {
  const a = await openTab(), b = await openTab();
  a.store.setState({ lang: 'he' });
  b.told('israel-elections:v1');
  expect(b.store.getState().lang).toBe('en');
  b.store.setState({ tool: 'coal' });
  expect(JSON.parse(mem.get('israel-elections:v1')!)).toMatchObject({ lang: 'he', tool: 'coal' });
});

test('unsaved work of two tabs: both are kept for the next visit', async () => {
  const a = await openTab(), b = await openTab();
  a.store.dispatch(transfer(k26, 1111));
  await b.store.openElection('k25');
  b.store.dispatch(transfer(k25, 2222));
  await settle();
  const c = await openTab();
  const st = c.store.getState();
  const all = [st.scenario!, ...Object.values(st.sessions).map((x) => x!.scenario), ...Object.values(st.scenarioDrafts).map((x) => x.scenario)];
  const has = (votes: number) => all.some((s) => s.log.some((e) => e.action.type === 'transfer' && e.action.votes === votes));
  expect(has(1111) && has(2222)).toBe(true);
  // the new visit took over both entries; a tab still open writes its own again when told
  await settle();
  const tabs = () => Object.keys(JSON.parse(mem.get('israel-elections:workspace:v1')!).tabs);
  expect(tabs()).toHaveLength(1);
  a.told('israel-elections:workspace:v1');
  expect(tabs()).toHaveLength(2);
});

test('saved comparisons: one tab\'s save is not erased by the other\'s', async () => {
  const link = (e: string) => ({ v: 1 as const, main: { e: 'k26' as const, n: '', f: false, l: [] }, other: { e: e as 'k25', n: '', f: false, l: [] }, m: [] });
  vi.resetModules(); const a = await import('../src/app/compare/sides.ts');
  vi.resetModules(); const b = await import('../src/app/compare/sides.ts');
  expect(b.savedComparisons()).toEqual([]); // B has read them (none) before A saves
  expect(a.saveComparison('From A', link('k25'))).toBe(true);
  expect(b.saveComparison('From B', link('k24'))).toBe(true);
  expect(JSON.parse(mem.get('israel-elections:comparisons')!).map((c: { name: string }) => c.name).sort()).toEqual(['From A', 'From B']);
  b.deleteComparison(b.savedComparisons().find((c) => c.name === 'From B')!.id);
  expect(JSON.parse(mem.get('israel-elections:comparisons')!).map((c: { name: string }) => c.name)).toEqual(['From A']);
});

test('saved voter groups and personal families: one tab\'s save is not erased by the other\'s', async () => {
  const { VOTER_GROUP_KIND } = await import('../src/model/voterGroups.ts');
  const group = (id: string) => ({ kind: VOTER_GROUP_KIND as typeof VOTER_GROUP_KIND, schemaVersion: 1 as const, id, name: id, createdAt: '2026-11-05T00:00:00Z', members: { type: 'sourced' as const, groupId: 'arab' }, turnoutChange: 10, vote: { type: 'observed' as const } });
  vi.resetModules(); const a = await import('../src/app/voterGroupStore.ts');
  vi.resetModules(); const b = await import('../src/app/voterGroupStore.ts');
  a.saveVoterGroup(group('vg-a'));
  b.saveVoterGroup(group('vg-b'));
  expect(JSON.parse(mem.get('israel-elections:voter-groups')!).map((g: { id: string }) => g.id).sort()).toEqual(['vg-a', 'vg-b']);
  b.deleteVoterGroup('vg-b');
  expect(JSON.parse(mem.get('israel-elections:voter-groups')!).map((g: { id: string }) => g.id)).toEqual(['vg-a']);

  const { readCatalogue, writeCatalogue, builtins } = await import('../src/families/catalogue.ts');
  const { fork } = await import('../src/families/model.ts');
  const seenByA = readCatalogue(), seenByB = readCatalogue();
  const fa = fork(builtins[0]), fb = fork(builtins[1]);
  writeCatalogue({ ...seenByA, users: [...seenByA.users, fa] }, seenByA);
  writeCatalogue({ ...seenByB, users: [...seenByB.users, fb], hidden: [builtins[2].id] }, seenByB);
  const now = readCatalogue();
  expect(now.users.map((f) => f.id).sort()).toEqual([fa.id, fb.id].sort());
  expect(now.hidden).toEqual([builtins[2].id]);
});
