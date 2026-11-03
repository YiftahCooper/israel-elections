import { describe, expect, it } from 'vitest';
import { buildK16, verifyK16 } from '../scripts/lib/historical/k16.ts';
import { derivePolling, researchDataset, verifyPolling } from '../scripts/lib/historical/k16-k17-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

describe('k16 — verified research evidence; release remains blocked', () => {
  it('reproduces every gazetted seat using the explicitly reconciled polling counts', () => {
    const audit = verifyK16({ log: false });
    const ds = researchDataset(audit);
    const r = allocate(toEngineInput(scenarioFromDataset(ds)));
    // YP 5155 pp. 1406–1407, read from the scan; never derived from engine output.
    const elected = { אמת: 19, ב: 6, ג: 5, ד: 3, ו: 3, יש: 15, כן: 2, ל: 7, ם: 3, מחל: 38, מרצ: 6, עם: 2, שס: 11 };
    for (const l of r.lists) expect(l.seats, l.id).toBe(elected[l.id.slice(3) as keyof typeof elected] ?? 0);
    expect(r.seatsAllocated).toBe(120);
    expect(r.thresholdVotes).toBe(47_226n);
    expect(r.quota).toEqual({ num: 25_138n, den: 1n });
    expect(r.warnings).toEqual([]);
  });
  it('retains all six official agreement pairs, including the ineffective Shinui–Greens pair', () => {
    const a = verifyK16({ log: false });
    expect(a.review.agreements.pairs).toEqual([['אמת', 'מרצ'], ['יש', 'רק'], ['ל', 'כן'], ['ב', 'ם'], ['שס', 'ג'], ['ו', 'ד']]);
    expect(a.review.agreements.complete).toBe(true);
    const r = allocate(toEngineInput(scenarioFromDataset(researchDataset(a))));
    expect(r.agreements.find(x => x.members.includes('16-יש'))?.active).toBe(false);
  });
  it('preserves the actual gazette terminal rank, Sharon, and the unverified-roster gap', () => {
    expect(verifyK16({ log: false }).review.candidateChecks).toMatchObject({
      completeRostersVerified: false,
      lists: [{ letters: 'מחל', publishedCount: 114, first: { rank: 1, nameHe: 'שרון אריאל' } }],
    });
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
  it('does not register a public dataset or permit premature availability', () => {
    expect(buildK16({ log: false })).toEqual([]);
    expect(verifyK16({ log: false }).releaseReady).toBe(false);
    expect(() => verifyK16({ log: false, available: true })).toThrow(/release blocked/);
  });
});
