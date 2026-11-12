// Paths where a user's work could be lost or misreported (audit 12 Nov 2026, ax-screens-c): import and reload,
// saved-card export, sourced groupings after merges and splits, roster restore, and Compare's copy plans.
import { beforeEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, type Action, type Scenario } from '../src/model/scenario.ts';

const mem = new Map<string, string>();
vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) });
const store = await import('../src/app/store.ts');
const copy = await import('../src/app/compare/copy.ts');
const mode = await import('../src/app/compare/mode.ts');

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
const k26 = load('k26'), k25 = load('k25');
const base = scenarioFromDataset(k26);
/** what a person sees and what the engine reads: everything but identity, name, description and the log itself */
const inputs = (s: Scenario) => { const { id: _i, name: _n, description: _d, log: _l, ...rest } = s; return JSON.parse(JSON.stringify(rest)); };

beforeEach(() => {
  mem.clear();
  store.setState({ datasets: { k26, k25 }, electionId: 'k26', scenario: null, reference: null, past: [], future: [], saved: [], sessions: {}, scenarioDrafts: {}, comparing: null, lang: 'en' });
});

test('ax-screens-c-01: an imported file whose inputs disagree with its change log is refused, never silently changed on reload', async () => {
  const doctored = structuredClone(base);
  doctored.lists[0].votes += 12345;
  const before = store.getState().scenario;
  await expect(store.openImported(doctored)).resolves.toBe(false);
  expect(store.getState().scenario).toBe(before);
  expect(store.getState().toast?.kind).toBe('error');
  expect(store.getState().toast?.text).not.toMatch(/[א-ת]/);
});

test('ax-screens-c-01: a consistent file opens exactly as exported, and saving and reloading keeps it', async () => {
  let s = base;
  for (const a of [{ type: 'transfer', from: base.lists[0].id, to: base.lists[1].id, votes: 12345 }, { type: 'setDescription', description: 'Round trip' }, { type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: '2.15' } }] as Action[]) s = applyAction(s, a, undefined, { base });
  const file = JSON.parse(JSON.stringify({ ...s, name: 'Imported' }));
  await expect(store.openImported(file)).resolves.toBe(true);
  const opened = store.getState().scenario!;
  expect(inputs(opened)).toEqual(inputs(file));
  expect(opened.description).toBe('Round trip');
  expect(store.saveCurrent('Imported')).toBe(true);
  const entry = store.getState().saved[0];
  expect(inputs({ ...store.replay(k26, entry.name, entry.log, entry.factionSplitBaseline).scenario, identityColor: opened.identityColor })).toEqual(inputs(opened));
});

test('ax-screens-c-01: a file made on older data opens on the current data and says so', async () => {
  let s = base;
  s = applyAction(s, { type: 'transfer', from: base.lists[0].id, to: base.lists[1].id, votes: 1000 }, undefined, { base });
  const old = { ...JSON.parse(JSON.stringify(s)), baseBuiltAt: '2000-01-01T00:00:00Z' };
  old.lists[2].votes += 7; // the old data differed
  await expect(store.openImported(old)).resolves.toBe(true);
  const opened = store.getState().scenario!;
  expect(opened.lists[2].votes).toBe(s.lists[2].votes);
  expect(store.getState().notice).toMatch(/rebuilt/);
});

test('ax-screens-c-04: applying a sourced grouping again keeps the shared bloc of merged and split lists', () => {
  const pair = base.lists.filter((l) => l.bloc && l.bloc === base.lists[0].bloc).slice(0, 2);
  expect(pair).toHaveLength(2);
  let s = applyAction(base, { type: 'merge', ids: pair.map((l) => l.id), newId: 'sim-m', nameHe: 'איחוד', letters: 'א', color: '#123456', retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' });
  expect(s.lists.find((l) => l.id === 'sim-m')!.bloc).toBe(pair[0].bloc);
  const joint = s.lists.find((l) => l.id !== 'sim-m' && l.bloc && l.candidates.length >= 2 && l.votes >= 2)!;
  s = applyAction(s, { type: 'split', id: joint.id, parts: [
    { newId: 'sim-a', nameHe: 'א', letters: 'א1', color: '#111111', votes: Math.floor(joint.votes / 2), candidateIds: [joint.candidates[0].id] },
    { newId: 'sim-b', nameHe: 'ב', letters: 'ב1', color: '#222222', votes: joint.votes - Math.floor(joint.votes / 2), candidateIds: [joint.candidates[1].id] }] });
  // mixed origins: a merger of lists in different blocs belongs to none
  const apart = base.lists.filter((l) => l.bloc && l.bloc !== pair[0].bloc && !pair.some((p) => p.id === l.id) && l.id !== joint.id)[0];
  s = applyAction(s, { type: 'merge', ids: ['sim-a', apart.id], newId: 'sim-x', nameHe: 'מעורב', letters: 'מ', color: '#333333', retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' });
  s = applyAction(s, { type: 'applyBlocScheme', schemeId: base.blocSchemeId! });
  expect(s.lists.find((l) => l.id === 'sim-m')!.bloc).toBe(pair[0].bloc);
  expect(s.lists.find((l) => l.id === 'sim-b')!.bloc).toBe(joint.bloc);
  expect(s.lists.find((l) => l.id === 'sim-x')!.bloc).toBeNull();
});

test('ax-screens-c-05: a renamed candidate is a real difference: Compare shows it and copies it', () => {
  const id = base.lists[0].id;
  const renamed = applyAction(base, { type: 'candidates', listId: id, candidates: base.lists[0].candidates.map((c, i) => (i ? c : { ...c, nameHe: 'שם אחר', nameEn: undefined })), note: 'test' });
  store.setState({ scenario: renamed, comparing: 'official' });
  expect(mode.resolveReference(renamed, store.getState()).status).toBe('ready');
  const plan = copy.planRoster({ from: { sc: renamed, start: base, name: 'Changed', official: false }, to: base, ctx: { base }, srcId: id, dstId: id });
  expect(plan.ok).toBe(true);
  if (plan.ok) expect(plan.result.lists[0].candidates[0].nameHe).toBe('שם אחר');
  // an unchanged roster is still "already the same", whatever list it was copied onto
  expect(copy.planRoster({ from: { sc: base, start: base, name: 'Official', official: true }, to: base, ctx: { base }, srcId: id, dstId: id }).ok).toBe(false);
});

test('ax-screens-c-07: restoring the official roster restores its parties and completeness flags too', () => {
  const old = scenarioFromDataset(k25);
  const dst = '26-ב', src = old.lists.find((l) => l.id === '25-ט')!;
  let s = base;
  for (const a of copy.rosterActions({ sc: old, start: old, name: '2022', official: true }, src, base, dst)) s = applyAction(s, a, undefined, { base });
  expect(s.lists.find((l) => l.id === dst)!.parties?.map((p) => p.id)).not.toEqual(base.lists.find((l) => l.id === dst)!.parties?.map((p) => p.id));
  const official = base.lists.find((l) => l.id === dst)!;
  for (const a of [{ type: 'startPart', part: 'candidates', listId: dst, source: 'official' }, { type: 'resetCandidates', listId: dst }] as Action[]) {
    const restored = applyAction(s, a, undefined, { base }).lists.find((l) => l.id === dst)!;
    expect(restored.candidates).toEqual(official.candidates);
    expect(restored.parties).toEqual(official.parties);
    expect(!!restored.rosterUnavailable).toBe(!!official.rosterUnavailable);
    expect(!!restored.rosterTruncated).toBe(!!official.rosterTruncated);
  }
});

test('ax-screens-c-07: restoring a joint list\'s parties restores how its faction is counted', () => {
  const split = scenarioFromDataset(k26, '', true);
  const old = scenarioFromDataset(k25);
  const joint = split.lists.find((l) => (l.parties?.length ?? 0) >= 2)!;
  const single = old.lists.find((l) => (l.parties?.length ?? 0) < 2 && l.candidates.length)!;
  let s = split;
  for (const a of copy.rosterActions({ sc: old, start: old, name: '2022', official: true }, single, split, joint.id)) s = applyAction(s, a, undefined, { base: split });
  expect(s.factionSplits).not.toContain(joint.id);
  const restored = applyAction(s, { type: 'startPart', part: 'candidates', listId: joint.id, source: 'official' }, undefined, { base: split });
  expect(restored.factionSplits).toContain(joint.id);
});

test('ax-screens-c-08: historical rules always come from the law, never from a saved experiment', () => {
  let exp = applyAction(base, { type: 'setMode', mode: 'experimental' });
  exp = applyAction(exp, { type: 'setRules', patch: { thresholdPct: '5' } });
  // even when the reset context is a saved experiment of the same election
  expect(applyAction(exp, { type: 'setMode', mode: 'historical' }, undefined, { base: exp }).rules).toEqual(base.rules);
});

test('the statutory rule set of every election is the one its dataset uses', async () => {
  const { electionRuleSetId } = await import('../src/model/scenario.ts');
  for (let i = 1; i <= 26; i++) expect(electionRuleSetId(`k${i}` as never), `k${i}`).toBe(load(`k${i}`).ruleSetId);
});
