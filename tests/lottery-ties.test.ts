// One rule for every list (audit 12 Nov 2026, c-results-engine-02; decided by the integrator): a "votes to gain / lose a
// seat" figure is the first count at which the seat changes whatever the outcome of an exact tie (no lottery needed);
// where a smaller count reaches the seat only through a tie, that count is kept as `lotteryFrom`, to be said beside it.
// Checked here vote by vote against an independent reading of the engine's traced tie records.
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { goals, minimalChange, perturb, type Goal, type VoteSource } from '../src/engine/analysis.ts';
import type { AllocationInput, AllocationResult, TieRecord } from '../src/engine/types.ts';
import { runTask } from '../src/app/analysisTasks.ts';
import { RULESETS } from '../src/engine/rules.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

const inputOf = (id: string) => toEngineInput(scenarioFromDataset(JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'))));

/** Every outcome of the undecided exact ties met at these votes, read from the traced allocation (not the search's own
 *  tie collector): the goal under each, deciding the first open tie each way, then the next on that path. */
function outcomes(input: AllocationInput, goal: Goal, before: AllocationResult): boolean[] {
  const r = allocate(input);
  const open = [...r.remainderSteps, ...r.internalDivisions.flatMap((d) => d.steps)].map((s) => s.tie).filter((t): t is TieRecord => !!t && !t.forced);
  if (!open.length) return [goal(r, before)];
  const t = open[0];
  return t.tiedUnitIds.flatMap((id) => outcomes({ ...input, lotteryWinners: { ...input.lotteryWinners, [t.key]: id } }, goal, before));
}
/** vote by vote up to `to`: the first count where the goal holds under every outcome, and the first where under some */
function brute(input: AllocationInput, target: string, src: VoteSource, goal: Goal, dir: 'gain' | 'lose', to: bigint) {
  const before = allocate(input);
  let possible: bigint | null = null;
  for (let k = 1n; k <= to; k++) {
    const x = perturb(input, target, src, k, dir);
    if (!x) continue;
    const o = outcomes(x, goal, before);
    if (o.every(Boolean)) return { certain: k, possible: possible ?? k };
    if (possible === null && o.some(Boolean)) possible = k;
  }
  return { certain: null, possible };
}

test('the audit\'s cases: a tie at the boundary is not counted as the seat, for any list', () => {
  const k26 = inputOf('k26'), k25 = inputOf('k25');
  const joint = runTask({ kind: 'security', input: k26, src: { kind: 'new' }, part: 'gain', item: { id: '26-ודם', qualified: true, seats: allocate(k26).lists.find((l) => l.id === '26-ודם')!.seats } });
  expect(joint).toMatchObject({ value: 5826, exact: true, lotteryFrom: 5825 });
  const shas = runTask({ kind: 'security', input: k25, src: { kind: 'new' }, part: 'gain', item: { id: '25-שס', qualified: true, seats: allocate(k25).lists.find((l) => l.id === '25-שס')!.seats } });
  expect(shas).toMatchObject({ value: 27328, exact: true, lotteryFrom: 27327 });
  // the other kind: the tie one vote earlier was counted as "no change"; the figure stays, and the tie is now said
  const together = minimalChange(k26, '26-רק', { kind: 'transfer', listId: allocate(k26).lists[0].id }, goals.seatLoss('26-רק'), 'lose');
  const brute1 = brute(k26, '26-רק', { kind: 'transfer', listId: allocate(k26).lists[0].id }, goals.seatLoss('26-רק'), 'lose', together.votes!);
  expect(together.votes).toBe(brute1.certain);
  expect(together.lotteryFrom ?? together.votes).toBe(brute1.possible);
});

test('vote by vote: real elections, every source, gain and lose (answers up to 6,000 votes)', () => {
  let checked = 0, withTie = 0;
  for (const id of ['k1', 'k6', 'k9', 'k26']) {
    const input = inputOf(id), before = allocate(input);
    for (const l of before.lists.filter((x) => x.qualified && !x.withdrawn)) {
      for (const src of [{ kind: 'new' }, { kind: 'proportional', listIds: [] }, { kind: 'transfer', listId: before.lists.find((x) => x.id !== l.id)!.id }] as VoteSource[]) {
        for (const [goal, dir] of [[goals.seatGain(l.id), 'gain'], ...(l.seats > 0 ? [[goals.seatLoss(l.id), 'lose']] : [])] as [Goal, 'gain' | 'lose'][]) {
          const m = minimalChange(input, l.id, src, goal, dir);
          if (!m.found || m.votes! > 6000n || !m.exact) continue;
          const b = brute(input, l.id, src, goal, dir, m.votes!);
          expect(m.votes, `${id} ${l.id} ${src.kind} ${dir}`).toBe(b.certain);
          expect(m.lotteryFrom ?? m.votes, `${id} ${l.id} ${src.kind} ${dir} lottery`).toBe(b.possible);
          checked++; if (m.lotteryFrom !== undefined) withTie++;
        }
      }
    }
  }
  expect(checked).toBeGreaterThan(40);
  expect(withTie).toBeGreaterThan(0);
}, 120_000);

test('vote by vote: small elections built to tie, under every rule era', () => {
  let checked = 0, withTie = 0;
  for (const era of Object.keys(RULESETS)) for (let seed = 1; seed <= 12; seed++) {
    const rules = { ...RULESETS[era], seats: 7 + (seed % 3) * 3 };
    // equal and near-equal vote counts, so exact ties are common
    const lists = Array.from({ length: 4 + (seed % 3) }, (_, i) => ({ id: `L${i}`, votes: BigInt(1000 + ((seed * 37 + i * 211) % 5) * 250) }));
    const input: AllocationInput = { rules, lists, agreements: seed % 2 ? [{ id: 'P', members: ['L0', 'L1'] }] : [] };
    const r = allocate(input);
    for (const l of r.lists.filter((x) => x.qualified)) for (const src of [{ kind: 'new' }, { kind: 'proportional', listIds: [] }] as VoteSource[]) {
      for (const [goal, dir] of [[goals.seatGain(l.id), 'gain'], ...(l.seats > 0 ? [[goals.seatLoss(l.id), 'lose']] : [])] as [Goal, 'gain' | 'lose'][]) {
        const m = minimalChange(input, l.id, src, goal, dir);
        if (!m.exact) continue;
        const b = brute(input, l.id, src, goal, dir, m.found ? m.votes! : m.limit);
        expect(m.found ? m.votes : null, `${era} ${seed} ${l.id} ${src.kind} ${dir}`).toBe(b.certain);
        expect(m.lotteryFrom ?? (m.found ? m.votes : null), `${era} ${seed} ${l.id} ${src.kind} ${dir} lottery`).toBe(b.possible);
        checked++; if (m.lotteryFrom !== undefined) withTie++;
      }
    }
  }
  expect(checked).toBeGreaterThan(100);
  expect(withTie).toBeGreaterThan(5);
}, 120_000);
