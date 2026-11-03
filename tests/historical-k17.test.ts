import { readFileSync } from 'node:fs';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { describe, expect, it } from 'vitest';
import { buildK17, verifyK17 } from '../scripts/lib/historical/k17.ts';
import { derivePolling, verifyPolling, verifyElectedRoster, type ReviewedRoster } from '../scripts/lib/historical/k16-k17-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k17.json', import.meta.url), 'utf8'));
const loc: LocalityDataset = JSON.parse(readFileSync(new URL('../public/data/k17-localities.json', import.meta.url), 'utf8'));


const publishedCounts = {"אמת": 120, "ג": 120, "ד": 120, "ה": 22, "ו": 119, "ז": 30, "זה": 10, "זך": 16, "חץ": 61, "טב": 120, "יש": 100, "כ": 10, "כן": 120, "כץ": 10, "ל": 23, "מחל": 119, "מרצ": 120, "נץ": 19, "עם": 117, "פ": 24, "פז": 7, "פכ": 21, "פץ": 10, "ף": 11, "צה": 11, "ק": 55, "קז": 14, "קנ": 27, "קפ": 32, "רק": 26, "שס": 118};
const counts = {"אמת": 19, "ג": 120, "ד": 3, "ה": 22, "ו": 3, "ז": 30, "זה": 10, "זך": 16, "חץ": 0, "טב": 9, "יש": 0, "כ": 0, "כן": 120, "כץ": 10, "ל": 23, "מחל": 12, "מרצ": 5, "נץ": 0, "עם": 4, "פ": 24, "פז": 7, "פכ": 21, "פץ": 10, "ף": 0, "צה": 11, "ק": 55, "קז": 14, "קנ": 27, "קפ": 0, "רק": 26, "שס": 118};

describe('k17 — released national and locality datasets; explicit roster limitations', () => {
  it('reproduces every gazetted seat through the application scenario pipeline', () => {
    const r = allocate(toEngineInput(scenarioFromDataset(ds)));
    // YP 5514 p. 2465, read from the scan; never derived from engine output.
    const elected = { אמת: 19, ג: 6, ד: 3, ו: 3, זך: 7, טב: 9, כן: 29, ל: 11, מחל: 12, מרצ: 5, עם: 4, שס: 12 };
    for (const l of r.lists) expect(l.seats, l.id).toBe(elected[l.id.slice(3) as keyof typeof elected] ?? 0);
    expect(r.seatsAllocated).toBe(120);
    expect(r.thresholdVotes).toBe(62_742n);
    expect(r.quota).toEqual({ num: 24_619n, den: 1n });
    expect(r.warnings).toEqual([]);
  });
  it('retains the complete four-pair official notice', () => {
    const a = verifyK17({ log: false });
    expect(a.review.agreements.pairs).toEqual([['אמת', 'מרצ'], ['שס', 'ג'], ['ו', 'ד'], ['ל', 'מחל']]);
    expect(a.review.agreements.complete).toBe(true);
    expect(ds.agreements.map(a => a.members.map(id => id.slice(3)))).toEqual([['אמת', 'מרצ'], ['שס', 'ג'], ['ו', 'ד'], ['ל', 'מחל']]);
  });
  it('publishes the verified leader and actual terminal rank', () => {
    const list = ds.lists.find(l => l.letters === 'כן')!;
    expect(list.candidates[0]).toMatchObject({ id: '17-כן#1', rank: 1, nameHe: 'אולמרט אהוד' });
    expect(list.candidates.at(-1)?.rank).toBe(120);
  });
  it('retains the nine-invalid-vote gap and never invents missing locality fields', () => {
    const a = verifyK17({ log: false });
    expect(a.review.gazetteTotals).toEqual({ registered: null, votesCast: null, valid: 3_137_064, invalid: 49_684 });
    expect(a.reconciliation.totals).toMatchObject({ registered: null, votesCast: 3_186_739, valid: 3_137_064, invalid: 49_675 });
    expect(a.reconciliation.missingLocalityFields).toEqual(['code', 'committee', 'registered']);
    expect(a.reconciliation.derivedRowsSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyPolling(a.review, a.reconciliation, { log: false, file: '/nonexistent-k17-source' })).toBe('skipped');
  });
  it('derives null locality metadata and rejects missing ballots or negative invalid counts', () => {
    const { review } = verifyK17({ log: false });
    const row: Record<string, unknown> = {
      _id: 1, 'מספר קלפי': 1, 'שם ישוב': 'בדיקה', 'כתובת': '', 'מצביעים': 0, 'כשרים': 0,
      ...Object.fromEntries(review.lists.map(l => [l.letters, 0])),
    };
    const table = (patch: Record<string, unknown>) => Buffer.from(JSON.stringify({ fields: Object.keys(row).map(id => ({ id })), records: [{ ...row, ...patch }] }));
    expect(derivePolling(review, table({})).rows[0]).toMatchObject({ code: null, committee: null, registered: null });
    expect(() => derivePolling(review, table({ 'אמת': null }))).toThrow(/missing\/non-numeric/);
    expect(() => derivePolling(review, table({ 'כשרים': 1 }))).toThrow(/cast ≠ valid/);
  });
  it('builds from retained reviewed inputs and exposes complete, truncated or explicitly unavailable rosters', () => {
    expect(buildK17({ log: false })).toHaveLength(1);
    expect(verifyK17({ log: false, available: true }).releaseReady).toBe(true);
    const reviewed = JSON.parse(readFileSync(new URL('../data/raw/k17/candidates.reviewed.json', import.meta.url), 'utf8'));
    for (const l of ds.lists) {
      const r = reviewed.lists.find((r: { letters: string }) => r.letters === l.letters);
      expect(r.publishedCount, l.id).toBe(publishedCounts[l.letters as keyof typeof publishedCounts]);
      expect(l.candidates.length, l.id).toBe(counts[l.letters as keyof typeof counts]);
      expect(l.candidatesUnavailable ?? false, l.id).toBe(r.candidatesUnavailable);
      expect(l.candidatesTruncated ?? false, l.id).toBe(!r.candidatesUnavailable && l.candidates.length < r.publishedCount);
      expect(l.candidatesTruncated ?? false, l.id).toBe(r.candidatesTruncated ?? false);
      if (r.candidatesUnavailable) {
        expect(l.candidates).toEqual([]);
        expect(l.notesHe).toContain(r.unavailableReasonHe);
        expect(r.unresolvedRanks.length).toBeGreaterThan(0);
      } else {
        if (r.candidatesTruncated) {
          expect(l.candidates.length).toBeLessThan(r.publishedCount);
          expect(l.notesHe).toContain(r.truncatedReasonHe);
        } else expect(l.candidates.length).toBe(r.publishedCount);
        expect(l.candidates.map(c => c.rank)).toEqual(Array.from({ length: l.candidates.length }, (_, i) => i + 1));
        expect(l.candidates.map(c => c.nameHe)).toEqual(r.candidates.map((c: { nameHe: string }) => c.nameHe));
      }
      if ((ds.officialSeats?.[l.id] ?? 0) > 0) {
        expect(r.electedCrossCheck.namesHe).toHaveLength(ds.officialSeats![l.id]);
        expect(r.reserveSecondReading.ranks).toEqual(Array.from({ length: 5 }, (_, i) => ds.officialSeats![l.id] + i + 1));
      }
    }
  });
  it('includes every elected rank and matches the independent section 4 results transcription', () => {
    const reviewed: { lists: ReviewedRoster[] } = JSON.parse(readFileSync(new URL('../data/raw/k17/candidates.reviewed.json', import.meta.url), 'utf8'));
    const winners = ds.lists.filter(l => ds.officialSeats![l.id] > 0);
    expect(winners).toHaveLength(12);
    expect(winners.reduce((sum, l) => sum + ds.officialSeats![l.id], 0)).toBe(120);
    for (const l of winners) {
      const seats = ds.officialSeats![l.id];
      const r = reviewed.lists.find(r => r.letters === l.letters)!;
      expect(l.candidatesUnavailable ?? false, l.id).toBe(false);
      expect(l.candidates.length, l.id).toBeGreaterThanOrEqual(seats);
      const check = r.electedCrossCheck!;
      expect(check.sourceId).toBe('k17-results-gazette');
      expect(check.section).toBe(4);
      expect(check.pages).toEqual([l.letters === 'אמת' ? 2465 : ['ג', 'ד', 'ו', 'זך', 'טב'].includes(l.letters) ? 2466 : ['כן', 'ל'].includes(l.letters) ? 2467 : 2468]);
      expect(check.resultsNamesHe).toHaveLength(seats);
      expect(l.candidates.slice(0, seats).map(c => c.rank)).toEqual(Array.from({ length: seats }, (_, i) => i + 1));
      expect(l.candidates.slice(0, seats).map(c => c.nameHe)).toEqual(check.namesHe);
      expect(check.resultsNamesHe.map((name, i) => check.nameVariants.find(v => v.rank === i + 1)?.candidateNameHe ?? name)).toEqual(check.namesHe);
      expect(() => verifyElectedRoster(r, seats, 'k17-results-gazette')).not.toThrow();

      // The gate rejects gaps in elected coverage and unknown spelling differences.
      const missing = structuredClone(r);
      missing.candidates = missing.candidates.slice(0, seats - 1);
      expect(() => verifyElectedRoster(missing, seats, 'k17-results-gazette')).toThrow(/elected ranks missing/);
      const wrong = structuredClone(r);
      wrong.electedCrossCheck!.resultsNamesHe[0] = 'שם שגוי';
      expect(() => verifyElectedRoster(wrong, seats, 'k17-results-gazette')).toThrow();
      const secondary = structuredClone(r);
      secondary.electedCrossCheck!.sourceId = 'k17-membership-secondary';
      expect(() => verifyElectedRoster(secondary, seats, 'k17-results-gazette')).toThrow(/official elected cross-check/);
    }
    expect(ds.status.noteEn).toContain('Every winning list includes all elected ranks');
    expect(ds.status.noteHe).toContain('סעיף 4');
  });
  it('uses both official notices to resolve the former misspellings and wrapped surname', () => {
    const labor = ds.lists.find(l => l.letters === 'אמת')!;
    const yb = ds.lists.find(l => l.letters === 'ל')!;
    expect(labor.candidates[18].nameHe).toBe('מגדלה גאלב');
    expect(yb.candidates[2].nameHe).toBe('חסון ארדי ישראל');
    expect(yb.candidates.slice(6, 8).map(c => c.nameHe)).toEqual(['לנדבר אהרון- סופיה סוניה', 'אהרונוביץ יצחק']);
    const reviewed = JSON.parse(readFileSync(new URL('../data/raw/k17/candidates.reviewed.json', import.meta.url), 'utf8'));
    const check = reviewed.lists.find((r: { letters: string }) => r.letters === 'ל').electedCrossCheck;
    expect(check.resultsNamesHe.slice(6, 8)).toEqual(['לנדבר אהרון סופיה סוניה', 'אהרונוביץ יצחק']);
    expect(check.nameVariants.map((v: { rank: number }) => v.rank)).toEqual([7]);
  });
  it('has aligned locality columns, null metadata, envelope flags and reconciling totals', () => {
    expect(loc.noteEn).toMatch(/summed from official polling-station/);
    expect(loc.noteHe).toMatch(/לא קיימת טבלת יישובים רשמית/);
    expect(loc.rows).toHaveLength(1150);
    expect(loc.rows.filter(r => r.envelopes)).toHaveLength(1);
    expect(loc.rows.find(r => r.envelopes)?.registered).toBe(null);
    expect(loc.rows.every(r => r.committee === null)).toBe(true);
    expect(loc.rows.every(r => r.code === null && r.registered === null)).toBe(true);
    for (const row of loc.rows) {
      expect(row.votes.reduce((a, b) => a + b, 0)).toBe(row.valid);
      expect(row.valid + row.invalid).toBe(row.votesCast);
    }
    for (const l of ds.lists) {
      const column = loc.listIds.indexOf(l.id);
      expect(column).toBeGreaterThanOrEqual(0);
      expect(loc.rows.reduce((s, r) => s + r.votes[column], 0)).toBe(l.votes);
    }
    expect(ds.totals.valid + ds.totals.invalid).toBe(ds.totals.votesCast);
    expect(ds.lists.reduce((s, l) => s + l.votes, 0)).toBe(ds.totals.valid);
    expect(ds.totals).toMatchObject({ registered: 5_014_622, votesCast: 3_186_748, valid: 3_137_064, invalid: 49_684, ballotBoxes: 8426, localities: 1149 });
    expect(loc.rows.reduce((s, r) => s + r.votesCast, 0)).toBe(ds.totals.votesCast - 9);
    expect(ds.status.noteEn).toMatch(/CBS/);
  });
});
