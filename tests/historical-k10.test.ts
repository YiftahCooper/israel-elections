import { existsSync, readFileSync } from 'node:fs';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { describe, expect, it } from 'vitest';
import { buildK10, verifyK10 } from '../scripts/lib/historical/k10.ts';
import { researchDataset, releasedDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 2727, pp. 2190, 2191.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 47, "ב": 6, "ג": 4, "הן": 2, "ו": 4, "כן": 2, "מחל": 48, "ני": 3, "רצ": 1, "ת": 3};
const unresolved: Record<string, number> = {};
describe('k10 — released national dataset', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK10({ log: false });
    expect(r.lists).toHaveLength(31);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(1937366);
    expect(r.gazetteTotals).toMatchObject({ valid: 1937366, invalid: 17243 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2490014, votesCast: 1954609 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK10({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(19374n);
    expect(result.quota).toEqual({ num: 15312n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) {
      const letters = l.id.slice(3);
      expect(l.seats, l.id).toBe(unresolved[letters] ?? published[letters] ?? 0);
    }
    expect(a.review.allocationCheck.exact).toBe(true);
    expect(a.review.allocationCheck.differences.map(d => d.letters)).toEqual(Object.keys(unresolved));
  });
  it('corrects printed ballot identities in both list and candidate keys', () => {
    const ds = researchDataset(verifyK10({ log: false }));
    // YP 2727 p. 2190, independently checked against YP 2721 headers.
    const corrected = { 'הם': 'הס', 'טן': 'טז', 'יש': 'טי', 'ים': 'ימ', 'יפ': 'יס',
      'נן': 'נז', 'נכ': 'נס', 'פז': 'סז', 'קנ': 'קז', 'קן': 'קי' };
    for (const printed of Object.values(corrected)) {
      const list = ds.lists.find(l => l.id === `10-${printed}`)!;
      expect(list.letters).toBe(printed);
      expect(ds.officialSeats?.[list.id]).toBe(0);
    }
    expect(ds.lists.find(l => l.id === '10-ט')).toMatchObject({ shortHe: 'ישראל אחת', shortEn: 'One Israel' });
    expect(ds.lists.find(l => l.id === '10-קז')).toMatchObject({ shortHe: 'רשימת הגימלאים', shortEn: 'Pensioners and Elderly List' });
    expect(ds.lists.find(l => l.id === '10-ני')?.candidates[0]).toMatchObject({ id: '10-ני#1', nameHe: 'אבוחצירא אהרון' });
  });
  it('retains the sourced agreement set without inventing missing pairs', () => {
    const a = verifyK10({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "לע"], ["ג", "ד"], ["הן", "רצ"]]);
  });
  it('builds the committed national-only release with every elected rank cross-checked', () => {
    const a = verifyK10({ log: false });
    expect(a.releaseReady).toBe(true);
    expect(buildK10({ log: false })).toHaveLength(1);
    const ds = JSON.parse(readFileSync('public/data/k10.json', 'utf8'));
    const rebuilt = finalizeDataset(releasedDataset(a)); // as the build writes it
    expect({ ...ds, buildInfo: { ...ds.buildInfo, builtAt: '' } }).toEqual({ ...rebuilt, lists: ds.lists.map((l: {id: string}) => rebuilt.lists.find(x => x.id === l.id)), buildInfo: { ...rebuilt.buildInfo, builtAt: '' } });
    expect(ds.hasLocalities).toBe(false);
    expect(existsSync('public/data/k10-localities.json')).toBe(false);
    expect(validateScenario(scenarioFromDataset(ds))).toEqual([]);
    const result = allocate(toEngineInput(scenarioFromDataset(ds)));
    for (const l of result.lists) expect(l.seats, l.id).toBe(published[l.id.slice(3)] ?? 0);
    for (const l of ds.lists) {
      const seats = ds.officialSeats[l.id];
      if (!seats) { expect(l.candidatesUnavailable).toBe(true); expect(l.candidates).toEqual([]); continue; }
      const r = a.rosters.find(r => r.letters === l.letters)!;
      expect(l.candidates.length).toBeGreaterThanOrEqual(seats);
      expect(l.candidates.map((c: {rank: number}) => c.rank)).toEqual(Array.from({length: l.candidates.length}, (_, i) => i + 1));
      expect(r.electedCrossCheck?.ranks).toEqual(Array.from({length: seats}, (_, i) => i + 1));
      expect(r.electedCrossCheck?.namesHe).toHaveLength(seats);
      expect(Boolean(l.candidatesTruncated)).toBe(!r.complete);
      expect(l.candidatesUnavailable).toBeUndefined();
    }
    expect(a.rosters.reduce((sum, r) => sum + (r.electedCrossCheck?.namesHe?.length ?? 0), 0)).toBe(120);
  });
});
