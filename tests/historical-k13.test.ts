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
  it('emits a public job and explicitly reconciles Arens and the Or given-name variant', () => {
    expect(buildK13({ log: false })).toHaveLength(1);
    const a = verifyK13({ log: false });
    expect(a.elected.lists.find(l => l.letters === 'מחל')!.candidateRanks).toEqual([1, ...Array.from({ length: 31 }, (_, i) => i + 3)]);
    expect(a.rosters.lists.find(l => l.letters === 'מחל')!.candidates[1].nameHe).toBe('ארנס משה');
    expect(a.rosters.lists.find(l => l.letters === 'אמת')!.electedCrossCheck.differences).toEqual([
      expect.objectContaining({ electedRank: 14, candidateNameHe: 'אור אריה', electedNameHe: 'אור אורי' }),
    ]);
  });
});
