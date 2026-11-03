import { describe, expect, it } from 'vitest';
import { buildK14, verifyK14 } from '../scripts/lib/historical/k14.ts';
import { researchDataset } from '../scripts/lib/historical/k13-k15-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

describe('k14 — gazetted seats reproduced; release gated on rosters', () => {
  it('reproduces every gazetted seat through the application scenario pipeline', () => {
    const a = verifyK14({ log: false });
    const ds = researchDataset(a);
    // YP 4414 pp. 3482–3483, sections 3–4, read from the official scan; never engine output.
    const seats: Record<string, number> = { אמת: 34, ב: 9, ג: 4, הד: 4, ו: 5, ט: 2, כן: 7, מחל: 32, מרצ: 9, ע: 4, שס: 10 };
    const s = scenarioFromDataset(ds);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const r = allocate(toEngineInput(s));
    for (const l of r.lists) expect(l.seats, l.id).toBe(seats[l.id.slice(3)] ?? 0);
    expect(r.seatsAllocated).toBe(120);
    expect(r.thresholdVotes).toBe(45782n);
    expect(r.quota).toEqual({ num: 24779n, den: 1n });
    expect(r.warnings).toEqual([]);
    expect(a.seatDifferences).toEqual([]);
    expect(a.review.gazetteTotals).toEqual({ valid: 3052130, invalid: 67702 });
    expect(a.review.supplementalTotals).toMatchObject({ registered: 3933250, votesCast: 3119832 });
  });
  it('retains the entire numbered agreement notice including ineffective pairs', () => {
    const a = verifyK14({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([['אמת', 'מרצ'], ['ב', 'ג'], ['הד', 'כן'], ['ו', 'ע'], ['ט', 'ת'], ['מחל', 'שס']]);
  });
  it('retains the checked Labor prefix and refuses premature publication', () => {
    const a = verifyK14({ log: false });
    expect(a.rosters.lists).toHaveLength(2);
    expect(a.rosters.lists[0]).toMatchObject({ letters: 'אמת', complete: false, publishedCount: 117 });
    expect(a.rosters.lists[0].candidates).toHaveLength(10);
    expect(a.rosters.lists[1]).toMatchObject({ letters: 'הד', complete: true, publishedCount: 12 });
    expect(a.rosters.lists[1].candidates.at(-1)?.nameHe).toBe('קרלבסקי אברהם');
    expect(a.rosters.allWinningRostersVerified).toBe(false);
    expect(buildK14({ log: false })).toEqual([]);
    expect(() => verifyK14({ log: false, available: true })).toThrow(/release blocked/);
  });
});
