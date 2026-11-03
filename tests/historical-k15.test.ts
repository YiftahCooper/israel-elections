import { describe, expect, it } from 'vitest';
import { buildK15, verifyK15 } from '../scripts/lib/historical/k15.ts';
import { researchDataset } from '../scripts/lib/historical/k13-k15-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

describe('k15 — gazetted seats reproduced; release gated on rosters', () => {
  it('reproduces every gazetted seat through the application scenario pipeline', () => {
    const a = verifyK15({ log: false });
    const ds = researchDataset(a);
    // YP 4757 pp. 3376–3378, sections 3–4, read from the official scan; never engine output.
    const seats: Record<string, number> = { אמת: 26, ב: 5, ג: 5, ד: 2, ו: 3, ט: 4, יש: 6, כן: 6, ל: 4, ם: 2, מחל: 19, מרצ: 10, עם: 5, פה: 6, שס: 17 };
    const s = scenarioFromDataset(ds);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const r = allocate(toEngineInput(s));
    for (const l of r.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3)] ?? 0);
    expect(r.seatsAllocated).toBe(120);
    expect(r.thresholdVotes).toBe(49642n);
    expect(r.quota).toEqual({ num: 25936n, den: 1n });
    expect(r.warnings).toEqual([]);
    expect(a.seatDifferences).toEqual([]);
    expect(a.review.gazetteTotals).toEqual({ valid: 3309416, invalid: 64332 });
    expect(a.review.supplementalTotals).toMatchObject({ registered: 4285428, votesCast: 3373748 });
  });
  it('retains the entire numbered agreement notice including ineffective pairs', () => {
    const a = verifyK15({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([['אמת', 'מרצ'], ['ט', 'כן'], ['יש', 'רק'], ['ם', 'ל'], ['מחל', 'ב'], ['עם', 'ו'], ['פ', 'פז'], ['פה', 'הד'], ['שס', 'ג']]);
  });
  it('retains the checked Labor prefix and refuses premature publication', () => {
    const a = verifyK15({ log: false });
    expect(a.rosters.lists).toHaveLength(1);
    expect(a.rosters.lists[0]).toMatchObject({ letters: 'אמת', complete: false, publishedCount: 120 });
    expect(a.rosters.lists[0].candidates).toHaveLength(10);
    expect(a.rosters.allWinningRostersVerified).toBe(false);
    expect(buildK15({ log: false })).toEqual([]);
    expect(() => verifyK15({ log: false, available: true })).toThrow(/release blocked/);
  });
});
