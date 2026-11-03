import { describe, expect, it } from 'vitest';
import { buildK8, verifyK8 } from '../scripts/lib/historical/k8.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 1979, pp. 608.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 51, "ב": 10, "גד": 5, "ו": 4, "חל טעם": 39, "ל": 4, "עא": 1, "קנ": 1, "רא": 2, "רצ": 3};
const unresolved: Record<string, number> = {"אמת": 52, "ב": 11, "רא": 1, "רצ": 2};
describe('k8 — checked research evidence; release remains blocked', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK8({ log: false });
    expect(r.lists).toHaveLength(21);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(1566855);
    expect(r.gazetteTotals).toMatchObject({ valid: 1566855, invalid: 34243 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2037478, votesCast: 1601098 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK8({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(15669n);
    expect(result.quota).toEqual({ num: 12424n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) {
      const letters = l.id.slice(2);
      expect(l.seats, l.id).toBe(unresolved[letters] ?? published[letters] ?? 0);
    }
    expect(a.review.allocationCheck.exact).toBe(false);
    expect(a.review.allocationCheck.differences.map(d => d.letters)).toEqual(Object.keys(unresolved));
  });
  it('retains the sourced agreement set without inventing missing pairs', () => {
    const a = verifyK8({ log: false });
    expect(a.review.agreements.complete).toBe(false);
    expect(a.review.agreements.pairs).toEqual([]);
  });
  it('cannot publish an incomplete fixture, including a premature availability flip', () => {
    expect(buildK8({ log: false })).toEqual([]);
    expect(verifyK8({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK8({ log: false, available: true })).toThrow(/release blocked/);
    expect(researchDataset(verifyK8({ log: false })).hasLocalities).toBe(false);
  });
});
