// Every copy Compare offers commits exactly what its preview showed (audit 12 Nov 2026, ax-screens-c-08). The work is a
// saved experiment (threshold 5%) that is also the marker reference, the case where the preview once used the
// experiment as "the law". Each plan is made with the context the screen gives it and with the marker reference, and
// both must equal the result of committing the same action as the screen does.
import { readFileSync } from 'node:fs';
import { beforeEach, expect, test, vi } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import type { Action, Scenario } from '../src/model/scenario.ts';

vi.stubGlobal('localStorage', { getItem: () => null, setItem() {}, removeItem() {} });
const store = await import('../src/app/store.ts');
const copy = await import('../src/app/compare/copy.ts');
const { planOther } = await import('../src/app/compare/copyOther.ts');
const { pairedRows } = await import('../src/app/compare/listRows.ts');
const { copyUnit } = await import('../src/app/compare/match.ts');
const { dispatchSide } = await import('../src/app/compare/sides.ts');
const { baselineOf } = await import('../src/app/factionDefaults.ts');

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const d25 = load('k25'), d26 = load('k26');
const k25 = baselineOf(d25), k26 = baselineOf(d26);
let work: Scenario = applyAction(k26, { type: 'setMode', mode: 'experimental' });
work = applyAction(work, { type: 'setRules', patch: { thresholdPct: '5' } });
work = applyAction(work, { type: 'transfer', from: work.lists[0].id, to: work.lists[1].id, votes: 5000 });
const ref = { key: 'prev', id: 'election:k25', sc: k25, initial: k25, start: k25, ds: d25, year: '2022', name: 'Official result', official: true, same: false };
const workCtx = () => store.baseContext(d26, work.factionSplitBaseline ?? false);
const inputs = (s: Scenario) => { const { log: _l, ...rest } = s; return JSON.parse(JSON.stringify(rest)); };

beforeEach(() => store.setState({ datasets: { k25: d25, k26: d26 }, electionId: 'k26', scenario: work, reference: work, past: [], future: [], compare: { drafts: {}, overrides: {}, snapshot: null, swapped: null, chamber: 'work', back: null } }));

type Planned = { what: string; into: 'work' | 'ref'; plan: (ctx: { base?: Scenario }) => ReturnType<typeof copy.planVotes> };
const rows = pairedRows(work, k25, [], true);
const units = (d: 'toRight' | 'toLeft') => rows.map((r) => copyUnit(r, rows, d)).filter((u): u is { src: string[]; dst: string[] } => !!u);
const fromRef = { sc: k25, start: k25, name: '2022', official: true };
const fromWork = { sc: work, start: k26, name: 'Experiment', official: false };
const cases: Planned[] = [];
// rows are reference (left) ↔ work (right): toRight copies into the work, toLeft into the reference
for (const [into, d, from, to] of [['work', 'toRight', fromRef, work], ['ref', 'toLeft', fromWork, k25]] as const) {
  for (const u of units(d)) {
    for (const mode of ['eligible', 'share', 'count', 'change', 'ratio'] as const) for (const policy of [{ kind: 'proportional' }, { kind: 'new' }] as const)
      cases.push({ what: `votes ${mode} ${policy.kind} ${u.src}→${u.dst}`, into, plan: (ctx) => copy.planVotes({ from, to, ctx, units: [u], mode, policy }) });
    if (u.src.length === 1 && u.dst.length === 1) {
      cases.push({ what: `roster ${u.src}→${u.dst}`, into, plan: (ctx) => copy.planRoster({ from, to, ctx, srcId: u.src[0], dstId: u.dst[0] }) });
      cases.push({ what: `colour ${u.src}→${u.dst}`, into, plan: (ctx) => copy.planColour({ from, to, ctx, srcId: u.src[0], dstId: u.dst[0] }) });
      cases.push({ what: `whole list ${u.src}→${u.dst}`, into, plan: (ctx) => copy.planWholeList({ from, to, ctx, srcId: u.src[0], dstId: u.dst[0], opts: { votes: true, candidates: true, identity: true, appearance: true, mode: 'share', policy: { kind: 'proportional' } } }) });
    }
  }
  for (const field of ['turnout', 'registered', 'invalid'] as const) cases.push({ what: field, into, plan: (ctx) => copy.planTotals({ from, to, ctx, field }) });
  for (const what of ['threshold', 'rules'] as const) cases.push({ what, into, plan: (ctx) => copy.planRules({ from, to, ctx, what }) });
  cases.push({ what: 'agreements', into, plan: (ctx) => copy.planAgreements({ from, to, ctx, rows, direction: d }) });
}
// the copies offered on other screens (Turnout, Rules) go through planOther with the context copyOther gives
for (const what of ['registered', 'turnout', 'invalid', 'threshold', 'rules', 'agreements'] as const)
  cases.push({ what: `other ${what}`, into: 'work', plan: (ctx) => planOther(ref as never, work, what, { base: ctx.base, workDate: d26.electionDate }) });

test('every offered copy commits exactly its preview', () => {
  let made = 0;
  for (const c of cases) {
    const screen = c.into === 'work' ? workCtx() : { base: k25 };
    const p = c.plan(screen);
    if (!p.ok) continue;
    made++;
    // the preview does not depend on which result the markers compare with
    const marked = c.plan({ base: c.into === 'work' ? work : k25 });
    expect(marked.ok, c.what).toBe(true);
    if (marked.ok) expect(inputs(marked.result), c.what).toEqual(inputs(p.result));
    let committed: Scenario;
    if (c.into === 'work') {
      store.setState({ scenario: work, past: [], future: [] });
      expect(store.dispatch(p.action), c.what).toBe(true);
      committed = store.getState().scenario!;
    } else {
      const st = store.getState();
      store.setState({ compare: { ...st.compare, drafts: {} } });
      expect(dispatchSide(ref.id, k25, ref.start, p.action as Action), c.what).toBe(true);
      committed = store.getState().compare.drafts[ref.id].scenario;
    }
    expect(inputs(committed), c.what).toEqual(inputs(p.result));
  }
  expect(made).toBeGreaterThan(50);
});

test('copying the official threshold into a saved experiment gives the law\'s rules in the preview and the result', () => {
  const p = planOther(ref as never, work, 'threshold', { base: workCtx().base, workDate: d26.electionDate });
  expect(p.ok).toBe(true);
  if (!p.ok) return;
  expect(p.result.mode).toBe('historical');
  expect(p.result.rules).toEqual(k26.rules);
  expect(store.dispatch(p.action)).toBe(true);
  expect(store.getState().scenario!.rules).toEqual(p.result.rules);
});
