// The Shas seats of the 26th Knesset. The results notice (YP 15100 §4) declared Nos. 1–6 elected, but Nos. 1
// (Aryeh Deri) and 6 (Dror David Amos) withdrew before the opening and Nos. 8 (Uriel Busso) and 9 (Yosef Taieb)
// sat from the first sitting on 10 Nov 2026 (Knesset OData, opening protocol). The app shows both: who was
// elected by the count, and who took the seat.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { compileMkHistory, type MkReview, type MkRuntime } from '../scripts/mk-history-runtime.ts';

const DERI = 2291, AMOS = 30989, BUSSO = 30765, TAIEB = 30770;
const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
const shas = ds.lists.find((l: { id: string }) => l.id === '26-שס');
const note = (rank: number) => shas.candidates.find((c: { rank: number }) => c.rank === rank).notes?.[0];
let rt: MkRuntime;
beforeAll(() => { rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview); });

describe('26th Knesset, Shas seats', () => {
  it('elected by the count: ranks 1–6, as in the results notice', () => {
    expect(ds.officialSeats['26-שס']).toBe(6);
    const l = scenarioFromDataset(ds).lists.find((x) => x.id === '26-שס')!;
    expect(electedOf(l, 6).map((c) => Number(c.id.split('#')[1]))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('took the seat: the opening membership has Nos. 8 and 9, not Nos. 1 and 6', () => {
    const m = JSON.parse(readFileSync('data/raw/k26/knesset-odata-members.json', 'utf8')) as { positions: { PersonID: number; StartDate: string }[]; factionMemberships: { PersonID: number; FactionID: number }[] };
    expect(m.positions).toHaveLength(120);
    const sat = new Set(m.positions.map((r) => r.PersonID));
    expect([BUSSO, TAIEB].every((p) => sat.has(p))).toBe(true);
    expect([DERI, AMOS].some((p) => sat.has(p))).toBe(false);
    for (const p of [BUSSO, TAIEB]) expect(m.positions.find((r) => r.PersonID === p)!.StartDate.slice(0, 10)).toBe('2026-11-10');
    // faction 1116, "התאחדות הספרדים העולמית שומרי תורה" (Shas): six members, Nos. 8 and 9 among them
    const shasFaction = m.factionMemberships.filter((r) => r.FactionID === 1116).map((r) => r.PersonID);
    expect(shasFaction).toHaveLength(6);
    expect(shasFaction).toEqual(expect.arrayContaining([BUSSO, TAIEB]));
  });

  it('the withdrawals and replacements are written on the candidates, in both languages', () => {
    for (const rank of [1, 6, 7]) {
      expect(note(rank)?.en, `#${rank}`).toContain('8 November 2026');
      expect(note(rank)?.he, `#${rank}`).toContain('8 בנובמבר 2026');
    }
    expect(note(1).en).toMatch(/Aryeh Deri.*Uriel Busso \(#8\) and Yosef Taieb \(#9\)/);
    // Amos's gender is not on record: the note never says he or she
    expect(note(6).en).not.toMatch(/\b(he|she|his|her)\b/i);
  });

  it('MK history: Nos. 1 and 6 elected but did not sit, Nos. 8 and 9 sat from the opening', () => {
    const k26 = (p: number) => rt.people[p].runs.find((r) => r[0] === 26)!;
    expect(k26(DERI).slice(0, 4)).toEqual([26, '26-שס', 1, 'declined']);
    expect(k26(AMOS).slice(0, 4)).toEqual([26, '26-שס', 6, 'declined']);
    expect(k26(BUSSO).slice(0, 4)).toEqual([26, '26-שס', 8, 'first']);
    expect(k26(TAIEB).slice(0, 4)).toEqual([26, '26-שס', 9, 'first']);
    for (const p of [BUSSO, TAIEB]) expect(rt.people[p].terms.find((t) => t[0] === 26)?.[1]).toBe('2026-11-10');
    expect(rt.people[AMOS].gender ?? null).toBeNull();
  });
});
