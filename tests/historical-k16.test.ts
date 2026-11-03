import { readFileSync } from 'node:fs';
import type { ElectionDataset, LocalityDataset } from '../src/data/schema.ts';
import { describe, expect, it } from 'vitest';
import { buildK16, verifyK16 } from '../scripts/lib/historical/k16.ts';
import { derivePolling, researchDataset, verifyPolling, verifyElectedRoster, type ReviewedRoster } from '../scripts/lib/historical/k16-k17-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
const ds: ElectionDataset = JSON.parse(readFileSync(new URL('../public/data/k16.json', import.meta.url), 'utf8'));
const loc: LocalityDataset = JSON.parse(readFileSync(new URL('../public/data/k16-localities.json', import.meta.url), 'utf8'));


const publishedCounts = {"אמת": 120, "ב": 120, "ג": 120, "ד": 118, "ו": 118, "ז": 17, "זנ": 10, "ט": 7, "יש": 120, "כן": 24, "ל": 35, "מחל": 114, "מרצ": 120, "ם": 119, "נ": 17, "נץ": 25, "עם": 119, "פה": 18, "ף": 11, "צ": 11, "צף": 77, "ק": 7, "קך": 10, "קנ": 18, "קץ": 12, "רק": 7, "שס": 111};
const counts = {"אמת": 19, "ב": 6, "ג": 5, "ד": 3, "ו": 3, "ז": 17, "זנ": 10, "ט": 7, "יש": 15, "כן": 24, "ל": 35, "מחל": 114, "מרצ": 6, "ם": 3, "נ": 17, "נץ": 0, "עם": 2, "פה": 18, "ף": 0, "צ": 11, "צף": 0, "ק": 7, "קך": 10, "קנ": 18, "קץ": 0, "רק": 7, "שס": 11};

describe('k16 — released national and locality datasets; explicit roster limitations', () => {
  it('reproduces every gazetted seat using the explicitly reconciled polling counts', () => {
    const r = allocate(toEngineInput(scenarioFromDataset(ds)));
    // YP 5155 pp. 1406–1407, read from the scan; never derived from engine output.
    const elected = { אמת: 19, ב: 6, ג: 5, ד: 3, ו: 3, יש: 15, כן: 2, ל: 7, ם: 3, מחל: 38, מרצ: 6, עם: 2, שס: 11 };
    for (const l of r.lists) expect(l.seats, l.id).toBe(elected[l.id.slice(3) as keyof typeof elected] ?? 0);
    expect(r.seatsAllocated).toBe(120);
    expect(r.thresholdVotes).toBe(47_226n);
    expect(r.quota).toEqual({ num: 25_138n, den: 1n });
    expect(r.warnings).toEqual([]);
  });
  it('reproduces the same seats with the inconsistent printed vote figures, while changing threshold and quota', () => {
    const printed = structuredClone(ds);
    const review = verifyK16({ log: false }).review;
    printed.lists.forEach(l => { l.votes = review.lists.find(r => r.letters === l.letters)!.gazetteVotes; });
    printed.totals.valid = 3_148_774;
    printed.totals.votesCast = printed.totals.valid + printed.totals.invalid;
    const r = allocate(toEngineInput(scenarioFromDataset(printed)));
    expect(r.thresholdVotes).toBe(47_232n);
    expect(r.quota).toEqual({ num: 25_141n, den: 1n });
    for (const l of r.lists) expect(l.seats, l.id).toBe(ds.officialSeats![l.id]);
    expect(r.seatsAllocated).toBe(120);
    expect(r.warnings).toEqual([]);
    expect(ds.lists.find(l => l.letters === 'ב')?.notesHe.join(' ')).toContain('132,730');
    expect(ds.lists.find(l => l.letters === 'ף')?.notesHe.join(' ')).toContain('883');
  });
  it('retains all six official agreement pairs, including the ineffective Shinui–Greens pair', () => {
    const a = verifyK16({ log: false });
    expect(a.review.agreements.pairs).toEqual([['אמת', 'מרצ'], ['יש', 'רק'], ['ל', 'כן'], ['ב', 'ם'], ['שס', 'ג'], ['ו', 'ד']]);
    expect(a.review.agreements.complete).toBe(true);
    expect(ds.agreements.map(a => a.members.map(id => id.slice(3)))).toEqual([['אמת', 'מרצ'], ['יש', 'רק'], ['ל', 'כן'], ['ב', 'ם'], ['שס', 'ג'], ['ו', 'ד']]);
    const r = allocate(toEngineInput(scenarioFromDataset(researchDataset(a))));
    expect(r.agreements.find(x => x.members.includes('16-יש'))?.active).toBe(false);
  });
  it('publishes the verified leader and actual terminal rank', () => {
    const list = ds.lists.find(l => l.letters === 'מחל')!;
    expect(list.candidates[0]).toMatchObject({ id: '16-מחל#1', rank: 1, nameHe: 'שרון אריאל' });
    expect(list.candidates.at(-1)?.rank).toBe(114);
  });
  it('preserves both gazette discrepancies and the derived-locality checksum', () => {
    const a = verifyK16({ log: false });
    expect(a.review.discrepancies.map(x => [x.field, x.gazette, x.polling])).toEqual([
      ['votes:ב', 132_730, 132_370], ['votes:ף', 883, 833],
    ]);
    expect(a.reconciliation.totals).toMatchObject({ valid: 3_148_364, votesCast: 3_200_773, invalid: 52_409, registered: 4_720_075 });
    expect(a.reconciliation.derivedRowsSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyPolling(a.review, a.reconciliation, { log: false, file: '/nonexistent-k16-source' })).toBe('skipped');
  });
  it('rejects missing numbers, unexplained row totals and nonempty EOF records', () => {
    const { review } = verifyK16({ log: false });
    const row: Record<string, unknown> = {
      _id: 1, 'סמל ישוב': '1.0', 'סמל קלפי': 1, 'בוחרים': 1,
      'מצביעים': 0, 'פסולים': 0, 'כשרים': 0, 'שם ישוב': 'בדיקה',
      ...Object.fromEntries([...review.lists.map(l => l.letters), 'זך'].map(l => [l, 0])),
    };
    const table = (patch: Record<string, unknown>) => Buffer.from(JSON.stringify({ fields: Object.keys(row).map(id => ({ id })), records: [{ ...row, ...patch }] }));
    expect(() => derivePolling(review, table({ 'בוחרים': null }))).toThrow(/missing\/non-numeric/);
    expect(() => derivePolling(review, table({ 'אמת': 1 }))).toThrow(/list votes ≠ valid/);
    expect(() => derivePolling(review, table({ 'סמל ישוב': '\x1a', 'שם ישוב': '' }))).toThrow(/nonempty EOF/);
  });
  it('builds from retained reviewed inputs and exposes complete, truncated or explicitly unavailable rosters', () => {
    expect(buildK16({ log: false })).toHaveLength(1);
    expect(verifyK16({ log: false, available: true }).releaseReady).toBe(true);
    const reviewed = JSON.parse(readFileSync(new URL('../data/raw/k16/candidates.reviewed.json', import.meta.url), 'utf8'));
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
    const reviewed: { lists: ReviewedRoster[] } = JSON.parse(readFileSync(new URL('../data/raw/k16/candidates.reviewed.json', import.meta.url), 'utf8'));
    const winners = ds.lists.filter(l => ds.officialSeats![l.id] > 0);
    expect(winners).toHaveLength(13);
    expect(winners.reduce((sum, l) => sum + ds.officialSeats![l.id], 0)).toBe(120);
    for (const l of winners) {
      const seats = ds.officialSeats![l.id];
      const r = reviewed.lists.find(r => r.letters === l.letters)!;
      expect(l.candidatesUnavailable ?? false, l.id).toBe(false);
      expect(l.candidates.length, l.id).toBeGreaterThanOrEqual(seats);
      const check = r.electedCrossCheck!;
      expect(check.sourceId).toBe('k16-results-gazette');
      expect(check.section).toBe(4);
      expect(check.pages).toEqual([['ם', 'עם', 'שס'].includes(l.letters) ? 1408 : 1407]);
      expect(check.resultsNamesHe).toHaveLength(seats);
      expect(l.candidates.slice(0, seats).map(c => c.rank)).toEqual(Array.from({ length: seats }, (_, i) => i + 1));
      expect(l.candidates.slice(0, seats).map(c => c.nameHe)).toEqual(check.namesHe);
      expect(check.resultsNamesHe.map((name, i) => check.nameVariants.find(v => v.rank === i + 1)?.candidateNameHe ?? name)).toEqual(check.namesHe);
      expect(() => verifyElectedRoster(r, seats, 'k16-results-gazette')).not.toThrow();

      // The gate rejects gaps in elected coverage and unknown spelling differences.
      const missing = structuredClone(r);
      missing.candidates = missing.candidates.slice(0, seats - 1);
      expect(() => verifyElectedRoster(missing, seats, 'k16-results-gazette')).toThrow(/elected ranks missing/);
      const wrong = structuredClone(r);
      wrong.electedCrossCheck!.resultsNamesHe[0] = 'שם שגוי';
      expect(() => verifyElectedRoster(wrong, seats, 'k16-results-gazette')).toThrow();
      const secondary = structuredClone(r);
      secondary.electedCrossCheck!.sourceId = 'k16-membership-secondary';
      expect(() => verifyElectedRoster(secondary, seats, 'k16-results-gazette')).toThrow(/official elected cross-check/);
    }
    expect(ds.status.noteEn).toContain('Every winning list includes all elected ranks');
    expect(ds.status.noteHe).toContain('סעיף 4');
  });
  it('distinguishes the gazetted election of Sharansky from his later withdrawal', () => {
    const list = ds.lists.find(l => l.letters === 'כן')!;
    expect(list.candidates.slice(0, 3).map(c => c.nameHe)).toEqual(['שרנסקי נתן', 'אדלשטיין יולי-יואל', 'סולודקין מרינה']);
    const reviewed = JSON.parse(readFileSync(new URL('../data/raw/k16/candidates.reviewed.json', import.meta.url), 'utf8'));
    const check = reviewed.lists.find((r: { letters: string }) => r.letters === 'כן').electedCrossCheck;
    expect(check.resultsNamesHe).toEqual(['שרנסקי נתן', 'אדלשטיין יולי-יואל']);
    expect(check.nameVariants).toEqual([]);
    expect(list.notesHe.join(' ')).toContain('ויתר לאחר הבחירות');
  });
  it('has aligned locality columns, null metadata, envelope flags and reconciling totals', () => {
    expect(loc.noteEn).toMatch(/summed from official polling-station/);
    expect(loc.noteHe).toMatch(/לא קיימת טבלת יישובים רשמית/);
    expect(loc.rows).toHaveLength(1172);
    expect(loc.rows.filter(r => r.envelopes)).toHaveLength(1);
    expect(loc.rows.find(r => r.envelopes)?.registered).toBe(null);
    expect(loc.rows.every(r => r.committee === null)).toBe(true);
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
    expect(ds.totals).toMatchObject({ registered: 4_720_075, votesCast: 3_200_773, valid: 3_148_364, invalid: 52_409, ballotBoxes: 7885, localities: 1171 });
    expect(loc.rows.reduce((s, r) => s + r.votesCast, 0)).toBe(ds.totals.votesCast - 0);
    expect(ds.status.noteEn).toMatch(/CBS/);
  });
});
