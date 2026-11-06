import { describe, expect, it } from 'vitest';
import { buildK13, verifyK13 } from '../scripts/lib/historical/k13.ts';
import { releasedElection } from './historical-k13-k15.helpers.ts';

describe('k13 — 1992 released gazetted results and elected-prefix rosters', () => {
  // YP 4021 pp. 3776–3777 sections 3–4, independent of engine output.
  releasedElection('k13', {
    seats: { אמת: 44, ב: 6, ג: 4, ו: 3, ט: 3, מחל: 32, מרצ: 12, ע: 2, ץ: 8, שס: 6 },
    totals: { valid: 2616841, invalid: 21102, registered: 3409015, votesCast: 2637943 },
    threshold: 39253n, quota: 20715n, pairs: [],
    rosterSizes: { אמת: 44, ב: 6, ג: 4, ו: 3, ט: 3, מחל: 33, מרצ: 12, ע: 2, ץ: 8, שס: 6 },
  });
  it('emits a public job, reconciles Arens and reads Labor #14 as אור אורי in both notices', () => {
    expect(buildK13({ log: false })).toHaveLength(1);
    const a = verifyK13({ log: false });
    expect(a.elected.lists.find(l => l.letters === 'מחל')!.candidateRanks).toEqual([1, ...Array.from({ length: 31 }, (_, i) => i + 3)]);
    expect(a.rosters.lists.find(l => l.letters === 'מחל')!.candidates[1].nameHe).toBe('ארנס משה');
    // the earlier "given-name variant" אור אריה was a misreading (corrected 4 November 2026)
    expect(a.rosters.lists.find(l => l.letters === 'אמת')!.electedCrossCheck.differences).toEqual([]);
    expect(a.rosters.lists.find(l => l.letters === 'אמת')!.candidates[13].nameHe).toBe('אור אורי');
  });
});

// Audit regression: YP 4021 p. 3776 letters/titles; YP 4017 pp. 3620, 3629, 3638, 3642 names.
it('preserves corrected official identities and distinct registered Ben-Elissar punctuation', () => {
  const { review, rosters } = verifyK13({ log: false });
  expect(review.lists.filter(l => ['נד', 'נכ', 'קן'].includes(l.letters)).map(l => l.votes).sort((a,b) => a-b)).toEqual([2886, 5962, 16669]);
  expect(review.lists.find(l => l.letters === 'זה')!.nameHe).toBe('ציפור');
  for (const [letters, rank, name] of [
    ['אמת', 10, 'זוילי נסים'], ['מרצ', 7, 'פורז פוזמנטיר אברהם'],
    ['ו', 3, 'גוז׳נסקי תמר'], ['ע', 1, 'דראושה עבד-אלוהאב'], ['מחל', 12, 'בן-אלישר אליהו'],
  ] as const) expect(rosters.lists.find(l => l.letters === letters)!.candidates[rank - 1].nameHe).toBe(name);
});
