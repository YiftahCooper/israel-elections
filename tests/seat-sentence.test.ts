import { describe, expect, it } from 'vitest';
import { seatChangeSentence } from '../src/app/analysisWords.ts';

const names: Record<string, [string, string]> = { oy: ['Otzma Yehudit', 'עוצמה יהודית'], raam: ["Ra'am", 'רע"ם'], likud: ['Likud', 'הליכוד'], ya: ['Yesh Atid', 'יש עתיד'] };
const en = (id: string) => names[id][0], he = (id: string) => names[id][1];
const oy = (lang: 'en' | 'he') => ({ ids: ['oy'], name: names.oy[lang === 'en' ? 0 : 1] });

describe('seat change sentences (owner, 26 Nov 2026: say what changes, by how many votes, at whose expense)', () => {
  it('a gain names the votes, the seat and the list it comes from', () => {
    expect(seatChangeSentence([{ id: 'oy', d: 1 }, { id: 'raam', d: -1 }], en, false, { subject: oy('en'), votes: 24629 }))
      .toBe("With 24,629 more votes, Otzma Yehudit wins 1 more seat, taken from Ra'am.");
    expect(seatChangeSentence([{ id: 'oy', d: 1 }, { id: 'raam', d: -1 }], he, true, { subject: oy('he'), votes: 24629 }))
      .toBe('עם 24,629 קולות נוספים, עוצמה יהודית זוכה במנדט נוסף, על חשבון רע"ם.');
  });
  it('a loss says who gets the seat', () => {
    expect(seatChangeSentence([{ id: 'likud', d: 1 }, { id: 'oy', d: -1 }], en, false, { subject: oy('en'), votes: -19592 }))
      .toBe('With 19,592 fewer votes, Otzma Yehudit loses 1 seat, to Likud.');
    expect(seatChangeSentence([{ id: 'likud', d: 1 }, { id: 'oy', d: -1 }], he, true, { subject: oy('he'), votes: -19592 }))
      .toBe('עם 19,592 קולות פחות, עוצמה יהודית מאבדת מנדט אחד, לטובת הליכוד.');
  });
  it('several lists are joined in words, with counts only where they differ', () => {
    expect(seatChangeSentence([{ id: 'oy', d: 4 }, { id: 'likud', d: -2 }, { id: 'ya', d: -1 }, { id: 'raam', d: -1 }], en, false, { subject: oy('en'), votes: 12000, crossing: true }))
      .toBe("With 12,000 more votes, Otzma Yehudit passes the threshold and wins 4 seats, taken from Likud (2), Yesh Atid (1) and Ra'am (1).");
  });
  it('a change that moves other lists only names the edited list in the vote phrase', () => {
    expect(seatChangeSentence([{ id: 'raam', d: 1 }, { id: 'likud', d: -1 }], en, false, { subject: oy('en'), votes: 5000 }))
      .toBe("With 5,000 more votes for Otzma Yehudit, Ra'am wins 1 more seat, taken from Likud.");
  });
  it('no change, with and without a vote count', () => {
    expect(seatChangeSentence([], en, false, { subject: oy('en'), votes: 1 })).toBe('With 1 more vote, no seats change.');
    expect(seatChangeSentence([], he, true)).toBe('אף מנדט לא עובר.');
  });
});
