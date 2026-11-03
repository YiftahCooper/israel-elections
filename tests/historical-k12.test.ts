import { describe, expect, it } from 'vitest';
import { buildK12, verifyK12 } from '../scripts/lib/historical/k12.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 3591, pp. 242.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 39, "ב": 5, "ג": 5, "הן": 2, "ו": 4, "ט": 2, "מחל": 40, "מפם": 3, "ע": 1, "עץ": 2, "פ": 1, "ץ": 2, "רצ": 5, "שס": 6, "ת": 3};
const unresolved: Record<string, number> = {};
describe('k12 — checked research evidence; release remains blocked', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK12({ log: false });
    expect(r.lists).toHaveLength(27);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(2283123);
    expect(r.gazetteTotals).toMatchObject({ valid: 2283123, invalid: 22444 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2894267, votesCast: 2305567 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK12({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(22832n);
    expect(result.quota).toEqual({ num: 18563n, den: 1n });
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
    const a = verifyK12({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "רצ"], ["הן", "מפם"], ["מחל", "ת"], ["קז", "יע"], ["שס", "עץ"]]);
  });
  it('cannot publish an incomplete fixture, including a premature availability flip', () => {
    expect(buildK12({ log: false })).toEqual([]);
    expect(verifyK12({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK12({ log: false, available: true })).toThrow(/release blocked/);
    expect(researchDataset(verifyK12({ log: false })).hasLocalities).toBe(false);
  });
});
