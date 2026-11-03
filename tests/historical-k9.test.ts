import { describe, expect, it } from 'vitest';
import { buildK9, verifyK9 } from '../scripts/lib/historical/k9.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 2326, pp. 1494, 1495.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 32, "ב": 12, "ג": 4, "ד": 1, "ו": 5, "ים": 1, "יש": 15, "כנ": 2, "לע": 1, "מחל": 43, "פש": 1, "רצ": 1, "ש": 2};
const unresolved: Record<string, number> = {"פש": 2, "ש": 1};
describe('k9 — checked research evidence; release remains blocked', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK9({ log: false });
    expect(r.lists).toHaveLength(22);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(1747820);
    expect(r.gazetteTotals).toMatchObject({ valid: 1747820, invalid: 23906 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2236293, votesCast: 1771726 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and reproduces every published seat with the inferred capacity procedure', () => {
    const a = verifyK9({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(17479n);
    expect(result.quota).toEqual({ num: 14173n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) {
      const letters = l.id.slice(2);
      expect(l.seats, l.id).toBe(published[letters] ?? 0);
    }
    expect(a.review.allocationCheck.exact).toBe(true);
    expect(a.review.allocationCheck.differences.map(d => d.letters)).toEqual([]);
  });
  it('retains the sourced agreement set without inventing missing pairs', () => {
    const a = verifyK9({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "ים"], ["לע", "יש"], ["מחל", "כנ"], ["ב", "ג"], ["ש", "נס"], ["רצ", "סם"]]);
  });
  it('cannot publish an incomplete fixture, including a premature availability flip', () => {
    expect(buildK9({ log: false })).toEqual([]);
    expect(verifyK9({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK9({ log: false, available: true })).toThrow(/release blocked/);
    expect(researchDataset(verifyK9({ log: false })).hasLocalities).toBe(false);
  });
});

it('checks the complete Flatto-Sharon roster against the gazetted elected member', () => {
  const a = verifyK9({ log: false });
  expect(a.rosters).toHaveLength(13);
  expect(a.rosters[0]).toMatchObject({ letters: 'פש', publishedCount: 1, pages: [1330], candidates: [{ rank: 1, nameHe: 'שרון סמואל', page: 1330 }], electedCrossCheck: { pages: [1496], ranks: [1] } });
  // The opt-in cap is disclosed as inferred; all other presets retain their results.
  const result = allocate(toEngineInput(scenarioFromDataset(researchDataset(a))));
  expect(result.lists.find(l => l.id === '9-פש')?.seats).toBe(1);
  expect(a.review.lists.find(l => l.letters === 'פש')?.officialSeats).toBe(1);
});

it('retains the uncapped seat table and the missing Ratz elected-name check', () => {
  const a = verifyK9({ log: false });
  const s = scenarioFromDataset(researchDataset(a));
  s.mode = 'experimental'; s.rules.seatsCappedAtCandidates = false;
  expect(validateScenario(s)).toEqual([]);
  const result = allocate(toEngineInput(s));
  for (const l of result.lists) expect(l.seats).toBe(unresolved[l.id.slice(2)] ?? published[l.id.slice(2)] ?? 0);
  expect(a.rosters.find(r => r.letters === 'רצ')?.electedCrossCheck).toBeNull();
  expect(a.rosters.reduce((sum, r) => sum + (r.electedCrossCheck?.namesHe?.length ?? 0), 0)).toBe(119);
  const capped = scenarioFromDataset(researchDataset(a));
  expect(capped.rules.seatsCappedAtCandidates).toBe(true);
  capped.rules.seatsCappedAtCandidates = false;
  expect(validateScenario(capped)).toContain('historical rules must match the election statutory preset');
});
