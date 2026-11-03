import { existsSync, readFileSync } from 'node:fs';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { describe, expect, it } from 'vitest';
import { buildK12, verifyK12 } from '../scripts/lib/historical/k12.ts';
import { researchDataset, releasedDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 3591, pp. 242.
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = {"אמת": 39, "ב": 5, "ג": 5, "הן": 2, "ו": 4, "ט": 2, "מחל": 40, "מפם": 3, "ע": 1, "עץ": 2, "פ": 1, "ץ": 2, "רצ": 5, "שס": 6, "ת": 3};
const unresolved: Record<string, number> = {};
describe('k12 — released national dataset', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK12({ log: false });
    expect(r.lists).toHaveLength(27);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(2283123);
    expect(r.gazetteTotals).toMatchObject({ valid: 2283123, invalid: 22444 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2894267, votesCast: 2305567 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('tests every official seat through the application pipeline and preserves any unresolved mismatch', () => {
    const a = verifyK12({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(22832n);
    expect(result.quota).toEqual({ num: 18563n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) {
      const letters = l.id.slice(3);
      expect(l.seats, l.id).toBe(unresolved[letters] ?? published[letters] ?? 0);
    }
    expect(a.review.allocationCheck.exact).toBe(true);
    expect(a.review.allocationCheck.differences.map(d => d.letters)).toEqual(Object.keys(unresolved));
  });
  it('retains the sourced agreement set without inventing missing pairs', () => {
    const a = verifyK12({ log: false });
    expect(a.review.agreements.complete).toBe(true);
    expect(a.review.agreements.pairs).toEqual([["אמת", "רצ"], ["הן", "מפם"], ["מחל", "ת"], ["קז", "יע"], ["שס", "עץ"]]);
  });
  it('builds the committed national-only release with every elected rank cross-checked', () => {
    const a = verifyK12({ log: false });
    expect(a.releaseReady).toBe(true);
    expect(buildK12({ log: false })).toHaveLength(1);
    const ds = JSON.parse(readFileSync('public/data/k12.json', 'utf8'));
    const rebuilt = finalizeDataset(releasedDataset(a)); // as the build writes it
    expect({ ...ds, buildInfo: { ...ds.buildInfo, builtAt: '' } }).toEqual({ ...rebuilt, lists: ds.lists.map((l: {id: string}) => rebuilt.lists.find(x => x.id === l.id)), buildInfo: { ...rebuilt.buildInfo, builtAt: '' } });
    expect(ds.hasLocalities).toBe(false);
    expect(existsSync('public/data/k12-localities.json')).toBe(false);
    expect(validateScenario(scenarioFromDataset(ds))).toEqual([]);
    const result = allocate(toEngineInput(scenarioFromDataset(ds)));
    for (const l of result.lists) expect(l.seats, l.id).toBe(published[l.id.slice(3)] ?? 0);
    for (const l of ds.lists) {
      const seats = ds.officialSeats[l.id];
      if (!seats) { expect(l.candidatesUnavailable).toBe(true); expect(l.candidates).toEqual([]); continue; }
      const r = a.rosters.find(r => r.letters === l.letters)!;
      expect(l.candidates.length).toBeGreaterThanOrEqual(seats);
      expect(l.candidates.map((c: {rank: number}) => c.rank)).toEqual(Array.from({length: l.candidates.length}, (_, i) => i + 1));
      // registered ranks 1..seats, except Likud: the results notice does not seat rank 25 (Reiser)
      const expected = l.letters === 'מחל' ? [...Array.from({length: 24}, (_, i) => i + 1), ...Array.from({length: 16}, (_, i) => i + 26)] : Array.from({length: seats}, (_, i) => i + 1);
      expect(r.electedCrossCheck?.ranks).toEqual(expected);
      expect(l.candidates.filter((c: {notSeated?: boolean}) => c.notSeated).map((c: {rank: number}) => c.rank)).toEqual(l.letters === 'מחל' ? [25] : []);
      expect(r.electedCrossCheck?.namesHe).toHaveLength(seats);
      expect(Boolean(l.candidatesTruncated)).toBe(!r.complete);
      expect(l.candidatesUnavailable).toBeUndefined();
    }
    expect(a.rosters.reduce((sum, r) => sum + (r.electedCrossCheck?.namesHe?.length ?? 0), 0)).toBe(120);
  });
  it('restores Likud rank 32 (Goldberg) and does not seat rank 25 (Reiser), as printed', () => {
    const ds = JSON.parse(readFileSync('public/data/k12.json', 'utf8'));
    const likud = ds.lists.find((l: {letters: string}) => l.letters === 'מחל');
    expect(likud.candidates.slice(23, 34).map((c: {nameHe: string}) => c.nameHe)).toEqual(['עלי עובדיה', 'רייסר מיכאל', 'ויינשטיין אריאל', 'ריבלין ראובן', 'כהן יגאל', 'פרח יהודה', 'איתן מיכאל', 'מצא יהושע', 'גולדברג יוסף', 'גדות גדעון', 'שילנסקי דב']);
    expect(likud.candidates.at(-1)).toMatchObject({ rank: 41, nameHe: 'שגיא יהושע' });
    expect(likud.candidates[24].notSeated).toBe(true);
  });
});
