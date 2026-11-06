import { describe, expect, it } from 'vitest';
import { buildK15, verifyK15 } from '../scripts/lib/historical/k15.ts';
import { releasedElection } from './historical-k13-k15.helpers.ts';

describe('k15 — 1999 released gazetted results and elected-prefix rosters', () => {
  // YP 4757 pp. 3376–3378 sections 3–4; YP 4755 p. 3305 agreements.
  releasedElection('k15', {
    seats: { אמת: 26, ב: 5, ג: 5, ד: 2, ו: 3, יט: 4, יש: 6, כן: 6, ל: 4, ם: 2, מחל: 19, מרצ: 10, עם: 5, פה: 6, שס: 17 },
    totals: { valid: 3309416, invalid: 64332, registered: 4285428, votesCast: 3373748 },
    threshold: 49642n, quota: 25936n,
    pairs: [['אמת', 'מרצ'], ['יט', 'כן'], ['יש', 'רק'], ['ם', 'ל'], ['מחל', 'ב'], ['עם', 'ו'], ['פ', 'פז'], ['פה', 'הד'], ['שס', 'ג']],
    rosterSizes: { אמת: 26, ב: 5, ג: 5, ד: 2, ו: 3, יט: 5, יש: 6, כן: 6, ל: 4, ם: 2, מחל: 19, מרצ: 10, עם: 5, פה: 6, שס: 18 },
  });
  it('retains both statutorily withdrawn registrations and the gazetted name of Gagula', () => {
    const a = verifyK15({ log: false });
    expect(a.review.lists.filter(l => l.withdrawn).map(l => l.letters)).toEqual(['ני', 'ק']);
    expect(a.rosters.lists.find(l => l.letters === 'ק')!.candidates.map(c => c.nameHe)).toEqual(['קרמר רוני', 'קליין דוד', 'שוגרמן דוד', 'בסעוד שחל']);
    expect(a.rosters.lists.find(l => l.letters === 'שס')!.candidates[17].nameHe).toBe('גאגולה איסק');
    expect(a.review.lists.find(l => l.letters === 'קפ')!.nameHe).toBe('הערבי החדש');
  });
  it('preserves original registered heads and includes every elected successor, without silently shifting ranks', () => {
    expect(buildK15({ log: false })).toHaveLength(1);
    const a = verifyK15({ log: false });
    for (const [letters, head, count] of [['יט', 'בגין זאב בנימין', 4], ['שס', 'דרעי אריה מכלוף', 17]] as const) {
      expect(a.rosters.lists.find(l => l.letters === letters)!.candidates[0].nameHe).toBe(head);
      expect(a.elected.lists.find(l => l.letters === letters)!.candidateRanks).toEqual(Array.from({ length: count }, (_, i) => i + 2));
    }
    expect(a.rosters.lists.find(l => l.letters === 'שס')!.electedCrossCheck.note).toMatch(/19 May 1999 after the election/);
  });
});
