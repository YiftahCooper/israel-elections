import { describe, expect, it } from 'vitest';
import { buildK10, verifyK10 } from '../scripts/lib/historical/k10.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 2727, pp. 2190, 2191.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 47, "ב": 6, "ג": 4, "הן": 2, "ו": 4, "כן": 2, "מחל": 48, "ני": 3, "רצ": 1, "ת": 3};
const unresolved: Record<string, number> = {};
describe('k10 — checked research evidence; release remains blocked', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK10({ log: false });
    expect(r.lists).toHaveLength(31);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(1937366);
    expect(r.gazetteTotals).toMatchObject({ valid: 1937366, invalid: 17243 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2490014, votesCast: 1954609 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK10({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(19374n);
    expect(result.quota).toEqual({ num: 15312n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) {
      const letters = l.id.slice(3);
      expect(l.seats, l.id).toBe(unresolved[letters] ?? published[letters] ?? 0);
    }
    expect(a.review.allocationCheck.exact).toBe(true);
    expect(a.review.allocationCheck.differences.map(d => d.letters)).toEqual(Object.keys(unresolved));
  });
  it('retains the sourced agreement set without inventing missing pairs', () => {
    const a = verifyK10({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "לע"], ["ג", "ד"], ["הן", "רצ"]]);
  });
  it('cannot publish an incomplete fixture, including a premature availability flip', () => {
    expect(buildK10({ log: false })).toEqual([]);
    expect(verifyK10({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK10({ log: false, available: true })).toThrow(/release blocked/);
    expect(researchDataset(verifyK10({ log: false })).hasLocalities).toBe(false);
  });
});
