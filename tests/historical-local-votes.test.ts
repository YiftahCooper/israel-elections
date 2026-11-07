import { expect, it } from 'vitest';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { mapToScenario, groupChange } from '../src/model/voterGroups.ts';
import { localityTotals } from '../src/app/locality-map-model.ts';
import { loadDataset } from './helpers.ts';

const base = scenarioFromDataset(loadDataset('k25'));
function fixture(weights: number[]) {
  const [a, b] = base.lists;
  return { ...base, lists: [
    ...weights.map((votes, i) => ({ ...a, id: `child-${i}`, votes })),
    { ...b, votes: 100 },
  ] };
}

it.each([
  { weights: [0, 0], expected: [50, 50, 100], added: [25, 25, 50] },
  { weights: [1, 3], expected: [25, 75, 100], added: [13, 37, 50] },
])('maps a historical column once with national weights $weights in Turnout and the map', ({ weights, expected, added }) => {
  const s = fixture(weights), ids = base.lists.slice(0, 2).map(l => l.id);
  const mix = mapToScenario(s, ids, [100, 100]);
  expect(mix).toEqual(expected);
  const totals = new Map(localityTotals(s, ids, [100, 100], 'list').map(x => [x.key, x.votes]));
  expect(s.lists.map(l => totals.get(l.id))).toEqual(expected);
  const change = groupChange(s, { electorate: 1000, cast: 200, invalid: 0 }, 10, mix);
  expect(change.allocations.map(a => a.votes)).toEqual(added);
  expect(mix.reduce((a, b) => a + b, 0)).toBe(200);
});

it.each([{ weights: [0, 0, 0] }, { weights: [1, 2, 4] }])('preserves a non-divisible column exactly with weights $weights', async ({ weights }) => {
  const { historicalLocalVotes } = await import('../src/model/historicalLocalVotes.ts');
  const { rat, reduce } = await import('../src/engine/rational.ts');
  const s = fixture(weights);
  const values = [...historicalLocalVotes(s.lists, [base.lists[0].id], [100]).values()];
  const sum = values.reduce((a, b) => reduce(rat(a.num * b.den + b.num * a.den, a.den * b.den)), rat(0));
  expect(sum).toEqual(rat(100));
  expect(values[0]).toEqual(weights[0] === 0 ? rat(100, 3) : rat(100, 7));
});

it('adds shared origins after merge/split and retains missing origins as unassigned', async () => {
  const { historicalLocalVotes } = await import('../src/model/historicalLocalVotes.ts');
  const { rat } = await import('../src/engine/rational.ts');
  const s = fixture([0, 0]);
  s.lists[0].originIds = [base.lists[0].id, base.lists[1].id];
  const totals = historicalLocalVotes(s.lists, [base.lists[0].id, base.lists[1].id, 'missing'], [100, 60, 7]);
  expect([...totals.values()]).toEqual([rat(50), rat(50), rat(60), rat(7)]);
});
