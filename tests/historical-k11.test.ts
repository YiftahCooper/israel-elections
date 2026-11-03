import { describe, expect, it } from 'vitest';
import { buildK11, verifyK11 } from '../scripts/lib/historical/k11.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 3081, pp. 3006, 3007.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 44, "ב": 4, "ג": 2, "הן": 3, "ו": 4, "ט": 3, "יש": 1, "כך": 1, "מחל": 41, "ני": 1, "עי": 2, "פ": 2, "רצ": 3, "שס": 4, "ת": 5};
const unresolved: Record<string, number> = {};
describe('k11 — checked research evidence; release remains blocked', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK11({ log: false });
    expect(r.lists).toHaveLength(26);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(2073321);
    expect(r.gazetteTotals).toMatchObject({ valid: 2073321, invalid: 18081 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2654613, votesCast: 2091402 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK11({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(20734n);
    expect(result.quota).toEqual({ num: 16786n, den: 1n });
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
    const a = verifyK11({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "רצ"], ["ג", "שס"], ["הן", "ט"], ["מחל", "ת"]]);
  });
  it('cannot publish an incomplete fixture, including a premature availability flip', () => {
    expect(buildK11({ log: false })).toEqual([]);
    expect(verifyK11({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK11({ log: false, available: true })).toThrow(/release blocked/);
    expect(researchDataset(verifyK11({ log: false })).hasLocalities).toBe(false);
  });
});

it('retains all 120 Alignment candidates, contiguous ranks and the elected 44-rank check', () => {
  const a = verifyK11({ log: false });
  const roster = a.rosters.find(r => r.letters === 'אמת')!;
  expect(roster.publishedCount).toBe(120);
  expect(roster.candidates.map(c => c.rank)).toEqual(Array.from({ length: 120 }, (_, i) => i + 1));
  expect(roster.candidates[0].nameHe).toBe('פרס שמעון');
  expect(roster.candidates[43].nameHe).toBe('נחמיאס אהרן רפאל');
  expect(roster.candidates.at(-1)?.nameHe).toBe('קציר אפרים');
  expect(roster.electedCrossCheck?.ranks).toEqual(Array.from({ length: 44 }, (_, i) => i + 1));
  expect(a.review.candidateChecks.completeWinningRostersVerified).toBe(false);
});
