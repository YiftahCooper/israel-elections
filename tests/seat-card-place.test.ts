import { expect, test } from 'vitest';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, seatCandidate } from '../src/app/derive.ts';
import { dataset } from './graphics-cases.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

// The seat card names a seat's member and their place on the list. The place is the candidate's place on the full
// stored roster, never the seat's number among the seated (audit c-screens-overview-01).
test('every seat of every list names the member at their stored list place', () => {
  let checked = 0, shifted = 0;
  for (let n = 1; n <= 26; n++) {
    const ds = dataset(n) as ElectionDataset;
    const s = scenarioFromDataset(ds), r = allocationOf(s);
    for (const l of s.lists) {
      const seats = r.lists.find(x => x.id === l.id)?.seats ?? 0;
      const stored = ds.lists.find(x => x.id === l.id)!.candidates;
      for (let i = 0; i < seats; i++) {
        const { candidate, place } = seatCandidate(l, i);
        if (!candidate) continue;
        const rec = stored.find(c => c.id === candidate.id)!;
        expect(place, `k${n} ${l.id} seat ${i + 1}`).toBe(rec.rank);
        checked++; if (rec.rank !== i + 1) shifted++;
      }
    }
  }
  expect(checked).toBeGreaterThan(2500);
  // the class exists: seats after a candidate who was not seated
  expect(shifted).toBeGreaterThan(0);
});

test('1999 Shas: the first seat is Arieh Gamliel, No. 2 (Aryeh Deri, No. 1, was not seated)', () => {
  const ds = dataset(15) as ElectionDataset;
  const s = scenarioFromDataset(ds);
  const shas = s.lists.find(l => l.shortEn === 'Shas')!;
  const { candidate, place } = seatCandidate(shas, 0);
  expect(candidate?.nameHe).toMatch(/גמליאל/);
  expect(place).toBe(2);
});
