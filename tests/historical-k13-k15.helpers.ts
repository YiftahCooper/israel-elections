import { existsSync, readFileSync } from 'node:fs';
import { finalizeDataset } from '../scripts/lib/build/finalize.ts';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { verifyHistoricalProgress, historicalDataset, type ElectedReview } from '../scripts/lib/historical/k13-k15-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

export function releasedElection(id: 'k13' | 'k14' | 'k15', expected: {
  seats: Record<string, number>; totals: { registered: number; votesCast: number; valid: number; invalid: number };
  threshold: bigint; quota: bigint; pairs: [string, string][]; rosterSizes: Record<string, number>;
}) {
  const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
  const n = id.slice(1);
  const audit = () => verifyHistoricalProgress(id, { log: false });
  it('releases the built file with exact national totals and every official seat, including zero seats', () => {
    const a = audit();
    expect(a.releaseReady).toBe(true);
    expect(a.seatDifferences).toEqual([]);
    const rebuilt = finalizeDataset(historicalDataset(a)); // as the build writes it
    expect({ ...ds, buildInfo: { ...ds.buildInfo, builtAt: '' } }).toEqual({ ...rebuilt, buildInfo: { ...rebuilt.buildInfo, builtAt: '' } });
    expect(ds.totals).toMatchObject(expected.totals);
    expect(ds.totals.valid + ds.totals.invalid).toBe(ds.totals.votesCast);
    expect(ds.lists.reduce((s, l) => s + l.votes, 0)).toBe(ds.totals.valid);
    expect(ds.ruleSetId).toBe('il-1992-bader-ofer-1.5');
    const s = scenarioFromDataset(ds);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    expect(result.thresholdVotes).toBe(expected.threshold);
    expect(result.quota).toEqual({ num: expected.quota, den: 1n });
    expect(Object.keys(ds.officialSeats!)).toHaveLength(ds.lists.length);
    expect(ds.officialSeats).toEqual(Object.fromEntries(ds.lists.map(l => [l.id, expected.seats[l.letters] ?? 0])));
    for (const l of result.lists) expect(l.seats, l.id).toBe(expected.seats[l.id.slice(n.length + 1)] ?? 0);
    const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')).find((e: { id: string }) => e.id === id);
    expect(index.available).toBe(true);
    expect(index.status).toEqual({ stage: ds.status.stage, noteEn: ds.status.noteEn, noteHe: ds.status.noteHe });
    expect(ds.status.noteEn).toMatch(/Rosters: everyone elected/);
    expect(ds.status.noteHe).toMatch(/כל הנבחרים/);
    expect(ds.hasLocalities).toBe(false);
    expect(ds.totals.localities).toBe(0);
    expect(existsSync(`public/data/${id}-localities.json`)).toBe(false);
  });
  it('retains the complete sourced agreement pairs, or the explicit 1992 search caveat', () => {
    const a = audit();
    expect(ds.agreements.map(p => p.members.map(m => m.slice(n.length + 1)))).toEqual(expected.pairs);
    expect(a.review.agreements.pairs).toEqual(expected.pairs);
    if (id === 'k13') {
      expect(a.review.agreements).toMatchObject({ sourceId: null, complete: false });
      expect(ds.status.noteEn).toMatch(/notice was not found; agreements that did not affect seats may be missing/);
      expect(ds.status.noteHe).toMatch(/ייתכן שחסרים הסכמים שלא השפיעו/);
    } else {
      expect(a.review.agreements.complete).toBe(true);
      expect(ds.agreements.every(p => p.sourceId === a.review.agreements.sourceId && ds.sourceIds.includes(p.sourceId))).toBe(true);
    }
  });
  it('has contiguous registered ranks covering all elected names, with explicit truncation and omissions', () => {
    const a = audit();
    const elected = JSON.parse(readFileSync(`data/raw/${id}/elected.reviewed.json`, 'utf8')) as ElectedReview;
    expect(a.rosters.allWinningElectedPrefixesVerified).toBe(true);
    expect(elected.lists.reduce((s, l) => s + l.names.length, 0)).toBe(120);
    expect(elected.lists).toHaveLength(Object.keys(expected.seats).length);
    for (const list of ds.lists) {
      expect(list.candidates.map(c => c.rank)).toEqual(list.candidates.map((_, i) => i + 1));
      expect(list.candidates.map(c => c.id)).toEqual(list.candidates.map(c => `${list.id}#${c.rank}`));
      const won = expected.seats[list.letters] ?? 0;
      if (list.withdrawn && id === 'k15') {
        expect(list.votes).toBe(0);
        expect(list.candidates).toHaveLength(list.letters === 'ני' ? 1 : 4);
        expect(list.candidatesTruncated).not.toBe(true);
        expect(list.candidatesUnavailable).not.toBe(true);
        continue;
      }
      if (won === 0) {
        expect(list.candidates).toEqual([]);
        expect(list.candidatesUnavailable).toBe(true);
        expect(list.candidatesTruncated).not.toBe(true);
        continue;
      }
      const roster = a.rosters.lists.find(l => l.letters === list.letters)!;
      const members = elected.lists.find(l => l.letters === list.letters)!;
      expect(list.candidates).toHaveLength(expected.rosterSizes[list.letters]);
      expect(list.candidates.length).toBeGreaterThanOrEqual(won);
      expect(list.candidatesUnavailable).not.toBe(true);
      expect(list.candidatesTruncated).toBe(!roster.complete);
      expect(list.candidatesSecondary).toBe(false);
      expect(ds.sourceIds).toContain(list.candidatesSource);
      expect(list.candidates.map(c => c.nameHe)).toEqual(roster.candidates.map(c => c.nameHe));
      expect(members.names).toHaveLength(won);
      expect(members.candidateRanks).toHaveLength(won);
      const normalize = (s: string) => s.replace(/[\s\-־–—׳’']/g, '');
      for (const [i, name] of members.names.entries()) {
        const candidateRank = members.candidateRanks[i];
        expect(candidateRank).toBeGreaterThan(members.candidateRanks[i - 1] ?? 0);
        const candidate = list.candidates[candidateRank - 1];
        expect(candidate, `${list.id}, elected ${i + 1}: ${name}`).toBeDefined();
        const resolution = roster.electedCrossCheck.differences?.find(d => d.electedRank === i + 1);
        if (resolution) {
          expect(resolution).toMatchObject({ candidateRank, candidateNameHe: candidate.nameHe, electedNameHe: name });
          expect(resolution.reason.length).toBeGreaterThan(20);
        } else expect(normalize(candidate.nameHe), `${list.id}, elected ${i + 1}`).toBe(normalize(name));
      }
    }
    expect(a.rosters.lists.filter(l => l.complete).map(l => l.letters)).toEqual(id === 'k14' ? ['הד'] : id === 'k15' ? ['ני', 'ק'] : []);
  });
}
