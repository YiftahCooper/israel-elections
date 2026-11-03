import { describe, expect, it } from 'vitest';
import { buildK13, verifyK13 } from '../scripts/lib/historical/k13.ts';
import { researchDataset } from '../scripts/lib/historical/k13-k15-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

describe('k13 — gazetted evidence, release gated', () => {
  // YP 4021 pp. 3776–3777, sections 3–4, transcribed independently of allocation.
  const seats: Record<string, number> = { אמת: 44, ב: 6, ג: 4, ו: 3, ט: 3, מחל: 32, מרצ: 12, ע: 2, ץ: 8, שס: 6 };
  it('preserves every official seat and reconciles gazette votes with CBS turnout', () => {
    const a = verifyK13({ log: false });
    for (const l of a.review.lists) expect(l.officialSeats, l.letters).toBe(seats[l.letters] ?? 0);
    expect(a.review.gazetteTotals).toEqual({ valid: 2616841, invalid: 21102 });
    expect(a.review.supplementalTotals).toMatchObject({ registered: 3409015, votesCast: 2637943 });
    const ds = researchDataset(a);
    expect(validateScenario(JSON.parse(JSON.stringify(scenarioFromDataset(ds))))).toEqual([]);
    const r = allocate(toEngineInput(scenarioFromDataset(ds)));
    expect(r.seatsAllocated).toBe(120);
    expect(r.warnings).toEqual([]);
    for (const l of r.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3)] ?? 0);
    expect(r.thresholdVotes).toBe(39_253n);
    expect(r.quota).toEqual({ num: 20_715n, den: 1n });
    // Seat reproduction cannot prove agreement completeness.
    expect(a.seatDifferences).toEqual(r.lists.filter(l => l.seats !== (seats[l.id.slice(3)] ?? 0)).map(l => ({ letters: l.id.slice(3), official: seats[l.id.slice(3)] ?? 0, computed: l.seats })));
    expect(a.review.agreements).toMatchObject({ complete: false, pairs: [], sourceId: null });
  });
  it('retains a checked Labor prefix, without claiming coverage of other winners', () => {
    const a = verifyK13({ log: false });
    expect(a.rosters.lists).toHaveLength(1);
    expect(a.rosters.lists[0]).toMatchObject({ letters: 'אמת', complete: false, publishedCount: 120 });
    expect(a.rosters.lists[0].candidates[0].nameHe).toBe('רבין יצחק');
    expect(a.rosters.lists[0].candidates).toHaveLength(10);
    expect(a.rosters.allWinningRostersVerified).toBe(false);
  });
  it('registers no public job and refuses a premature availability change', () => {
    expect(buildK13({ log: false })).toEqual([]);
    expect(() => verifyK13({ log: false, available: true })).toThrow(/release blocked/);
  });
});
