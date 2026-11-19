import { describe, expect, it } from 'vitest';
import { aftermathRecords } from '../src/data/aftermath-runtime.ts';

// V2 fault A5 (19 Nov 2026): a list whose MKs split their recommendation showed twice under one name. Every part but
// one now names the faction that took it, in both languages, so no two rows read the same.
describe('split recommendations', () => {
  it('every split names the faction of each part beyond the first, in English and Hebrew', () => {
    let splits = 0;
    for (const r of Object.values(aftermathRecords)) for (const round of r!.recommendationRounds) for (const e of round.entries) {
      if (!e.split || e.split.length < 2) continue;
      splits++;
      const unnamed = e.split.filter(p => !p.partEn);
      expect(unnamed.length, `${r!.electionId} ${round.id} ${e.letters}`).toBeLessThanOrEqual(1);
      for (const p of e.split) if (p.partEn) expect(p.partHe, `${r!.electionId} ${round.id}`).toMatch(/[א-ת]/);
    }
    expect(splits).toBe(3);
  });
});
