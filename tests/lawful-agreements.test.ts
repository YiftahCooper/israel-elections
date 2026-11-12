// Returning to the law's rules leaves a scenario the law allows, by every path, and its exported file imports
// (audit 12 Nov 2026, c-screens-compare-03): section 67(a) allows each list one surplus agreement, with one other list.
import { readFileSync } from 'node:fs';
import { expect, test, vi } from 'vitest';
import { applyAction, collectSwitchedOff } from '../src/model/actions.ts';
import { scenarioFromDataset, validateScenario, electionRuleSetId, type Action, type Scenario } from '../src/model/scenario.ts';
import { planRules } from '../src/app/compare/copy.ts';
import { exportAnnotations } from '../src/app/scenarioExport.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

const mem = new Map<string, string>();
vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k), key: () => null, length: 0 });
vi.stubGlobal('fetch', async (url: string) => new Response(readFileSync(`public/data/${/data\/(.+\.json)$/.exec(String(url))![1]}`, 'utf8')));

const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8')) as ElectionDataset;
const base = scenarioFromDataset(ds, 'historical');
const ctx = { base };
const run = (s: Scenario, ...actions: Action[]) => actions.reduce((x, a) => applyAction(x, a, undefined, ctx), s);
/** the file the app writes (Scenarios → Export), read back as Import reads it */
const exported = (s: Scenario) => validateScenario(JSON.parse(JSON.stringify({ ...s, ...exportAnnotations(s, 'en'), datasetBuiltAt: ds.buildInfo.builtAt })));

// the audit's state: experimental rules, then a second agreement for a list that already has one
const agreed = base.agreements.find((a) => a.enabled)!;
const partner = base.lists.find((l) => !base.agreements.some((a) => a.members.includes(l.id)) && !l.withdrawn)!;
const extra: Action = { type: 'setAgreement', agreement: { id: 'extra', members: [agreed.members[0], partner.id], enabled: true } };
const threeWay: Action = { type: 'setAgreement', agreement: { id: 'three', members: [...base.lists.filter((l) => !base.agreements.some((a) => a.members.includes(l.id)) && !l.withdrawn).slice(1, 4).map((l) => l.id)], enabled: true } };
const experiment = run(base, { type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { maxAgreementSize: 3 } }, extra, threeWay);

test('the audit case reproduced: the experiment itself exports and imports', () => {
  expect(exported(experiment)).toEqual([]);
});

const ways: [string, Action][] = [
  ['Official rules (start the rules from the official result)', { type: 'startPart', part: 'rules', source: 'official' }],
  ['the law\'s rules chosen as a preset', { type: 'startPart', part: 'rules', source: 'preset', presetId: electionRuleSetId('k26') }],
  ['Historically valid mode', { type: 'setMode', mode: 'historical' }],
];
for (const [what, action] of ways) test(`${what}: the agreements the law forbids are switched off and named, and the file imports`, () => {
  const { value: back, off } = collectSwitchedOff(() => run(experiment, action));
  expect(back.mode).toBe('historical');
  expect(exported(back)).toEqual([]);
  expect(off.map((a) => a.id).sort()).toEqual(['extra', 'three']);
  expect(back.agreements.find((a) => a.id === agreed.id)!.enabled).toBe(true); // the first, lawful agreement stays
});

test('copying the law\'s rules from the compared side does the same', () => {
  const plan = planRules({ from: { sc: base, start: base, name: '2026', official: true }, to: experiment, ctx, what: 'rules' });
  expect(plan.ok).toBe(true);
  if (!plan.ok) return;
  const { value: back, off } = collectSwitchedOff(() => run(experiment, plan.action));
  expect(back.mode).toBe('historical');
  expect(off.map((a) => a.id).sort()).toEqual(['extra', 'three']);
  expect(exported(back)).toEqual([]);
});

test('agreements started from a saved experiment, under the law\'s rules, are made lawful too', () => {
  const { value: back, off } = collectSwitchedOff(() => run(base, { type: 'startPart', part: 'agreements', source: 'saved', snapshot: { agreements: experiment.agreements }, name: 'Experiment' }));
  expect(back.mode).toBe('historical');
  expect(off.map((a) => a.id).sort()).toEqual(['extra', 'three']);
  expect(exported(back)).toEqual([]);
});

test('the screen names what was switched off, with Undo that brings it all back', async () => {
  vi.resetModules();
  mem.set('israel-elections:v1', JSON.stringify({ lang: 'en' }));
  const store = await import('../src/app/store.ts');
  await store.openElection('k26');
  expect(store.dispatchMany([{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { maxAgreementSize: 3 } }, extra])).toBe(true);
  expect(store.dispatch({ type: 'startPart', part: 'rules', source: 'official' })).toBe(true);
  const t = store.getState().toast!;
  expect(t.text).toMatch(/^Surplus agreement .+ ⇄ .+ switched off: by law, each list may have one agreement, with one other list\.$/);
  expect(t.action?.label).toBe('Undo');
  t.action!.run();
  expect(store.getState().scenario!.mode).toBe('experimental');
  expect(store.getState().scenario!.agreements.find((a) => a.id === 'extra')?.enabled).toBe(true);
  // a change that switches nothing off says nothing about agreements
  store.setState({ toast: null });
  store.dispatch({ type: 'setMode', mode: 'historical' });
  expect(store.getState().toast?.text).toMatch(/switched off/);
  store.setState({ toast: null });
  store.dispatch({ type: 'startPart', part: 'rules', source: 'official' });
  expect(store.getState().toast).toBeNull();
});

test('every other setting the rules bind (candidate cap, threshold, seats, agreement size) is back to the law, in every rule era', () => {
  for (const id of ['k1', 'k3', 'k9', 'k15', 'k20', 'k26']) {
    const d = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
    const b = scenarioFromDataset(d, 'historical'), c = { base: b };
    const free = b.lists.filter((l) => !b.agreements.some((a) => a.members.includes(l.id)) && !l.withdrawn);
    const exp = [{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { maxAgreementSize: 4, thresholdPct: '0', seats: 99, seatsCappedAtCandidates: true } },
      { type: 'setAgreement', agreement: { id: 'x1', members: free.slice(0, 3).map((l) => l.id), enabled: true } },
      { type: 'setAgreement', agreement: { id: 'x2', members: [free[0].id, free[4].id], enabled: true } }] as Action[];
    const s = exp.reduce((x, a) => applyAction(x, a, undefined, c), b);
    for (const back of [applyAction(s, { type: 'startPart', part: 'rules', source: 'official' }, undefined, c), applyAction(s, { type: 'setMode', mode: 'historical' }, undefined, c)]) {
      expect(back.rules, id).toEqual(b.rules);
      expect(validateScenario(JSON.parse(JSON.stringify(back))), id).toEqual([]);
    }
  }
});
