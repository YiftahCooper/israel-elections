// First-stage (whole-quota) and remainder seat counts, checked against the Central Elections
// Committee's own calculation sheets (Form 30 appendix, "פרטי חישוב של חלוקת המנדטים", section ו
// "חלוקת המנדטים": "ס"ה חולקו … מנדטים" / "נותרו לחלוקה"). Values are transcribed by eye from
// the official PDFs, never from engine output. See docs/decisions/0073 (addendum of 9 November
// 2026 on stage counts) for URLs, hashes and pages.
//
// The statute (1969 consolidated law, §81(c) and §82(a); the 1973 amendment replaced only §81(d))
// gives whole quotas list by list; an agreement pair is one list only for §81(d), "with the seats
// that both won together". The engine follows that text. From 1981 the CEC sheets do the same.
// The 1973 sheet, and section ו of the 1977 sheet, instead floor each pair's combined votes in the
// first stage. Final seats are identical either way; only the stage split differs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import type { AllocationResult } from '../src/engine/types.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

const load = (k: number) => {
  const ds = JSON.parse(readFileSync(join(import.meta.dirname, '..', `public/data/k${k}.json`), 'utf8')) as ElectionDataset;
  return { ds, res: allocate(toEngineInput(scenarioFromDataset(ds))) };
};
const lettersOf = (ds: ElectionDataset, id: string) => ds.lists.find((l) => l.id === id)!.letters;
const unitName = (ds: ElectionDataset, res: AllocationResult, unitId: string) =>
  res.units.find((u) => u.id === unitId)!.memberIds.map((id) => lettersOf(ds, id)).join('+');
/** The CEC's 1973 reading: an active pair floors its combined votes in the first stage. */
const pairJointFirstStage = (res: AllocationResult) =>
  res.units.reduce((s, u) => s + (u.isAgreement ? Number((u.votes * res.quota.den) / res.quota.num) : u.initialSeats), 0);

// [knesset, quota, first-stage seats, remainder seats, sheet and PDF page]
const OFFICIAL: [number, number, number, number, string][] = [
  [10, 15312, 113, 7, 'archive_knesset10_memorandum-apdx10.pdf p.6'],
  [11, 16786, 112, 8, 'archive_knesset11_memorandum11.pdf p.5'],
  [12, 18563, 112, 8, 'archive_knesset12_memorandum-apdx1.pdf p.5'],
  [13, 20715, 117, 3, 'archive_knesset13_memorandum-apdx13.pdf p.5'],
  [14, 24779, 114, 6, 'archive_knesset14_memorandum-apdx14.pdf p.5'],
  [15, 25936, 112, 8, 'archive_knesset15_memorandum-apdx15.pdf p.6'],
  [16, 25138, 113, 7, 'archive_knesset16_memorandum-apdx16.pdf p.5'],
  [17, 24619, 114, 6, 'archive_knesset17_memorandum-apdx17.pdf p.5'],
  [18, 27246, 115, 5, 'data/raw/k18/allocation.pdf p.5'],
  [19, 29366, 113, 7, 'data/raw/k19/seat-allocation-appendix.pdf p.5'],
  [20, 33511, 116, 4, 'archive_knesset20_memorandum-apdx20.pdf p.6'],
  [21, 32860, 113, 7, 'archive_knesset21_memorandum-apdx21.pdf p.6'],
  [22, 35917, 117, 3, 'archive_knesset22_memorandum-apdx22.pdf p.6'],
  [23, 37943, 117, 3, 'archive_knesset23_memorandum-apdx23.pdf p.6'],
  [24, 36210, 112, 8, 'archive_knesset24_memorandum-apdx24.pdf p.6'],
];

describe('stage counts against the CEC calculation sheets', () => {
  it.each(OFFICIAL)('k%i: quota %i, %i whole-quota seats and %i remainder seats, as printed', (k, quota, first, rest) => {
    const { res } = load(k);
    expect(res.quota).toEqual({ num: BigInt(quota), den: 1n });
    expect(res.initialSeatsTotal).toBe(first);
    expect(res.remainderSeatsTotal).toBe(rest);
    expect(res.seatsAllocated).toBe(120);
  });

  it('1973: the sheet floors each pair jointly (117 + 3); the statute, as the engine reads it, gives 114 + 6', () => {
    // archive_knesset8_memorandum-apdx.pdf p.5 (printed 9): ב+גד 15, לע+רצ 7, רא+עא 3; "ס"ה חולקו 117", "נותרו 3"
    const { ds, res } = load(8);
    expect(res.quota).toEqual({ num: 12424n, den: 1n });
    expect([res.initialSeatsTotal, res.remainderSeatsTotal]).toEqual([114, 6]);
    expect(pairJointFirstStage(res)).toBe(117);
    for (const l of res.lists) expect(l.seats, l.id).toBe(ds.officialSeats![l.id] ?? 0);
  });

  it('1977: section ו prints 114 + 6 (pairs jointly); section ח hands out 7 seats from 113, as the engine does', () => {
    // archive_knesset9_memorandum-apdx9.pdf p.6 (printed 9): "ס"ה חולקו 114", "נותרו לחלוקה 6" (אמת+ימ 32).
    // pp.8–9 (printed 12–13), section ח "חלוקת 7 המנדטים הנותרים": אמת+ימ starts at 31; winners in order with
    // the quotient printed for each seat; section ט (p.10) totals 7.
    const { ds, res } = load(9);
    expect(res.quota).toEqual({ num: 14173n, den: 1n });
    expect([res.initialSeatsTotal, res.remainderSeatsTotal]).toEqual([113, 7]);
    expect(pairJointFirstStage(res)).toBe(114);
    const sheet: [string, number][] = [['אמת+ימ', 14194], ['מחל+כנ', 14043], ['לע+יש', 13915], ['אמת+ימ', 13763], ['מחל+כנ', 13731], ['ב+ג', 13714], ['ש', 13640]];
    expect(res.remainderSteps.map((s) => {
      const q = s.quotients.find((x) => x.unitId === s.winnerUnitId)!.value;
      return [unitName(ds, res, s.winnerUnitId), Number(q.num / q.den)];
    })).toEqual(sheet);
    for (const l of res.lists) expect(l.seats, l.id).toBe(ds.officialSeats![l.id] ?? 0);
  });
});
