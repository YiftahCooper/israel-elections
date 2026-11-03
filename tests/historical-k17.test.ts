import { describe, expect, it } from 'vitest';
import { buildK17, verifyK17 } from '../scripts/lib/historical/k17.ts';
import { derivePolling, researchDataset, verifyPolling } from '../scripts/lib/historical/k16-k17-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

describe('k17 — verified research evidence; release remains blocked', () => {
  it('reproduces every gazetted seat through the application scenario pipeline', () => {
    const ds = researchDataset(verifyK17({ log: false }));
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
  });
  it('checks Olmert and Kadima’s terminal rank without pretending to have full rosters', () => {
    expect(verifyK17({ log: false }).review.candidateChecks).toMatchObject({
      completeRostersVerified: false,
      lists: [{ letters: 'כן', publishedCount: 120, first: { rank: 1, nameHe: 'אולמרט אהוד' } }],
    });
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
  it('does not register a public dataset or permit premature availability', () => {
    expect(buildK17({ log: false })).toEqual([]);
    expect(verifyK17({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK17({ log: false, available: true })).toThrow(/release blocked/);
  });
});
