import { readFileSync } from 'node:fs';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { describe, expect, it } from 'vitest';
import { buildK17, verifyK17 } from '../scripts/lib/historical/k17.ts';
import { derivePolling, verifyPolling } from '../scripts/lib/historical/k16-k17-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k17.json', import.meta.url), 'utf8'));
const loc: LocalityDataset = JSON.parse(readFileSync(new URL('../public/data/k17-localities.json', import.meta.url), 'utf8'));


const publishedCounts = {"אמת": 120, "ג": 120, "ד": 120, "ה": 22, "ו": 119, "ז": 30, "זה": 10, "זך": 16, "חץ": 61, "טב": 120, "יש": 100, "כ": 10, "כן": 120, "כץ": 10, "ל": 23, "מחל": 119, "מרצ": 120, "נץ": 19, "עם": 117, "פ": 24, "פז": 7, "פכ": 21, "פץ": 10, "ף": 11, "צה": 11, "ק": 55, "קז": 14, "קנ": 27, "קפ": 32, "רק": 26, "שס": 118};
const counts = {"אמת": 0, "ג": 120, "ד": 0, "ה": 22, "ו": 0, "ז": 30, "זה": 10, "זך": 16, "חץ": 0, "טב": 0, "יש": 0, "כ": 0, "כן": 120, "כץ": 10, "ל": 23, "מחל": 0, "מרצ": 0, "נץ": 0, "עם": 0, "פ": 24, "פז": 7, "פכ": 21, "פץ": 10, "ף": 0, "צה": 11, "ק": 55, "קז": 14, "קנ": 27, "קפ": 0, "רק": 26, "שס": 118};

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
  it('builds from retained reviewed inputs and exposes complete or explicitly unavailable rosters', () => {
    expect(buildK17({ log: false })).toHaveLength(1);
    expect(verifyK17({ log: false, available: true }).releaseReady).toBe(true);
    const reviewed = JSON.parse(readFileSync(new URL('../data/raw/k17/candidates.reviewed.json', import.meta.url), 'utf8'));
    for (const l of ds.lists) {
      const r = reviewed.lists.find((r: { letters: string }) => r.letters === l.letters);
      expect(r.publishedCount, l.id).toBe(publishedCounts[l.letters as keyof typeof publishedCounts]);
      expect(l.candidates.length, l.id).toBe(counts[l.letters as keyof typeof counts]);
      expect(l.candidatesUnavailable ?? false, l.id).toBe(r.candidatesUnavailable);
      if (r.candidatesUnavailable) {
        expect(l.candidates).toEqual([]);
        expect(l.notesHe).toContain(r.unavailableReasonHe);
        expect(r.unresolvedRanks.length).toBeGreaterThan(0);
      } else {
        expect(l.candidates.length).toBe(r.publishedCount);
        expect(l.candidates.map(c => c.rank)).toEqual(Array.from({ length: l.candidates.length }, (_, i) => i + 1));
        expect(l.candidates.map(c => c.nameHe)).toEqual(r.candidates.map((c: { nameHe: string }) => c.nameHe));
      }
      if ((ds.officialSeats?.[l.id] ?? 0) > 0) {
        expect(r.electedCrossCheck.namesHe).toHaveLength(ds.officialSeats![l.id]);
        expect(r.reserveSecondReading.ranks).toEqual(Array.from({ length: 5 }, (_, i) => ds.officialSeats![l.id] + i + 1));
      }
    }
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
