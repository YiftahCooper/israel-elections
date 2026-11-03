import { describe, expect, it } from 'vitest';
import { buildK14, verifyK14 } from '../scripts/lib/historical/k14.ts';
import { releasedElection } from './historical-k13-k15.helpers.ts';

describe('k14 — 1996 released gazetted results and elected-prefix rosters', () => {
  // YP 4414 pp. 3482–3483 sections 3–4; YP 4411 p. 3398 agreements.
  releasedElection('k14', {
    seats: { אמת: 34, ב: 9, ג: 4, הד: 4, ו: 5, ט: 2, כן: 7, מחל: 32, מרצ: 9, ע: 4, שס: 10 },
    totals: { valid: 3052130, invalid: 67702, registered: 3933250, votesCast: 3119832 },
    threshold: 45782n, quota: 24779n,
    pairs: [['אמת', 'מרצ'], ['ב', 'ג'], ['הד', 'כן'], ['ו', 'ע'], ['ט', 'ת'], ['מחל', 'שס']],
    rosterSizes: { אמת: 35, ב: 9, ג: 4, הד: 12, ו: 5, ט: 2, כן: 7, מחל: 32, מרצ: 9, ע: 4, שס: 10 },
  });
  it('retains the full Third Way roster, Namir at registered rank 18, and the correct Likud vote count', () => {
    expect(buildK14({ log: false })).toHaveLength(1);
    const a = verifyK14({ log: false });
    expect(a.review.lists.find(l => l.letters === 'מחל')!.votes).toBe(767401);
    const thirdWay = a.rosters.lists.find(l => l.letters === 'הד')!;
    expect(thirdWay).toMatchObject({ complete: true, publishedCount: 12 });
    expect(thirdWay.candidates.at(-1)?.nameHe).toBe('קרלבסקי אברהם');
    expect(a.rosters.lists.find(l => l.letters === 'אמת')!.candidates[17].nameHe).toBe('נמיר אורה');
    expect(a.elected.lists.find(l => l.letters === 'אמת')!.candidateRanks).toEqual([...Array.from({ length: 17 }, (_, i) => i + 1), ...Array.from({ length: 17 }, (_, i) => i + 19)]);
  });
});
