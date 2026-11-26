// The Shas seats of the 26th Knesset. The results notice (YP 15100 §4) declared Nos. 1–6 elected, but Nos. 1
// (Aryeh Deri), 6 (Dror David Amos) and 7 (Moshe Abutbul) resigned from the list on 8 Nov 2026 (YP 15121 p. 1890,
// section 87(b), signed 9 Nov) and Nos. 8 (Uriel Busso) and 9 (Yosef Taieb) sat from the first sitting on
// 10 Nov 2026 (Knesset OData, opening protocol). The app shows both: who was elected by the count, and who took
// the seat. Two more post-election resignations (YP 15107, YP 15139) are below the seats and change none.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { compileMkHistory, type MkReview, type MkRuntime } from '../scripts/mk-history-runtime.ts';

const DERI = 2291, AMOS = 30989, BUSSO = 30765, TAIEB = 30770, ABUTBUL = 30749, MOSHIASHVILI = 30872;
const ds = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
const shas = ds.lists.find((l: { id: string }) => l.id === '26-שס');
const note = (rank: number) => shas.candidates.find((c: { rank: number }) => c.rank === rank).notes?.[0];
const NOTES = (JSON.parse(readFileSync('data/meta/candidate-notes.json', 'utf8')) as { notes: { candidateId: string; sources: string[] }[] }).notes;
const noteSources = (rank: number) => NOTES.find((n) => n.candidateId === `26-שס#${rank}`)?.sources ?? [];
let rt: MkRuntime;
beforeAll(() => { rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview); });

describe('26th Knesset, Shas seats', () => {
  it('the seats go to those who sat (as in 1999): Nos. 1, 6 and 7 not seated, Nos. 8 and 9 elected', () => {
    expect(ds.officialSeats['26-שס']).toBe(6);
    const l = scenarioFromDataset(ds).lists.find((x) => x.id === '26-שס')!;
    // the count declared Nos. 1–6 elected (YP 15100 §4); the Knesset's opening membership has Nos. 8 and 9 instead of 1 and 6
    expect(l.candidates.filter((c) => c.notSeated).map((c) => Number(c.id.split('#')[1]))).toEqual([1, 6, 7]);
    expect(electedOf(l, 6).map((c) => Number(c.id.split('#')[1]))).toEqual([2, 3, 4, 5, 8, 9]);
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
      // the basis is the official notice, not the press: it is kept with the note (the shown wording names no source)
      expect(noteSources(rank).join(' '), `#${rank}`).toContain('Yalkut HaPirsumim 15121 p. 1890');
      expect(noteSources(rank).join(' '), `#${rank}`).toContain('signed 9 Nov 2026');
      expect(noteSources(rank).join(' '), `#${rank}`).not.toMatch(/Israel Hayom|Ynet|Kikar/i);
      expect(`${note(rank)?.en} ${note(rank)?.he}`, `#${rank}`).not.toMatch(/Israel Hayom|Ynet|Kikar|ישראל היום|כיכר השבת/i);
    }
    expect(note(1).en).toMatch(/Aryeh Deri.*Uriel Busso \(#8\) and Yosef Taieb \(#9\)/);
    // Amos's gender is not on record: the note never says he or she, and the Hebrew uses no gendered verb
    expect(note(6).en).not.toMatch(/\b(he|she|his|her)\b/i);
    expect(note(6).he).not.toMatch(/התפטר(?!ות)|התפטרה|פרש|פרשה/);
  });

  it('the official notice is retained and registered: YP 15121, section 87(b), all three names, 8 Nov 2026', () => {
    const src = (JSON.parse(readFileSync('data/raw/SOURCES.json', 'utf8')) as { id: string; file?: string; url?: string; sha256?: string; official?: boolean }[]);
    const s = src.find((x) => x.id === 'k26-withdrawals-yp15121')!;
    expect(s).toMatchObject({ file: 'k26/yp15121-withdrawals.pdf', url: 'https://reshumot.justice.gov.il/officialGazette/publicNotices/15121', official: true });
    expect(createHash('sha256').update(readFileSync(`data/raw/${s.file}`)).digest('hex')).toBe(s.sha256);
    for (const id of ['k26-withdrawals-yp15107', 'k26-withdrawals-yp15139']) expect(src.find((x) => x.id === id)?.official, id).toBe(true);
  });

  it('later resignations below the seats: noted on the candidates, roster and seats unchanged', () => {
    const otzma = ds.lists.find((l: { id: string }) => l.id === '26-ב');
    expect(ds.officialSeats['26-ב']).toBe(7);
    const cases: [typeof shas, number, string, string][] = [
      [shas, 11, '2 November 2026', '15107'], [shas, 13, '3 November 2026', '15107'], [shas, 15, '2 November 2026', '15107'], [otzma, 11, '10 November 2026', '15139']];
    for (const [l, rank, date, issue] of cases) {
      const c = l.candidates.find((x: { rank: number }) => x.rank === rank);
      expect(c.notes?.[0]?.en, `${l.id}#${rank}`).toBe(`Resigned from the list on ${date}, after polling day.`);
      expect(c.notes?.[0]?.he, `${l.id}#${rank}`).toMatch(/^התפטרות מהרשימה/);
      expect(NOTES.find((n) => n.candidateId === `${l.id}#${rank}`)?.sources.join(' '), `${l.id}#${rank}`).toContain(`Yalkut HaPirsumim ${issue}`);
      expect(c.notSeated, `${l.id}#${rank}`).toBeUndefined();
    }
    // the next in line is unchanged by them: No. 10 for Shas (after Nos. 8 and 9 took the seats), No. 8 for Otzma Yehudit
    expect(shas.candidates.filter((c: { notSeated?: boolean }) => !c.notSeated)[6].rank).toBe(10);
    expect(otzma.candidates.filter((c: { notSeated?: boolean }) => !c.notSeated)[7].rank).toBe(8);
  });

  it('MK history: No. 1 elected but did not sit, Nos. 8 and 9 sat from the opening; No. 6 never sat, so has no history', () => {
    const k26 = (p: number) => rt.people[p].runs.find((r) => r[0] === 26)!;
    expect(k26(DERI).slice(0, 4)).toEqual([26, '26-שס', 1, 'declined']);
    // Dror David Amos never sat in any Knesset: like Alon Davidi (2021), the candidate row and its note tell it
    expect(rt.people[AMOS]).toBeUndefined();
    expect(k26(BUSSO).slice(0, 4)).toEqual([26, '26-שס', 8, 'first']);
    expect(k26(TAIEB).slice(0, 4)).toEqual([26, '26-שס', 9, 'first']);
    for (const p of [BUSSO, TAIEB]) expect(rt.people[p].terms.find((t) => t[0] === 26)?.[1]).toBe('2026-11-10');
    // the official notes reach MK history: on the rows of those who did not sit, and of those below the seats
    for (const [p, date] of [[DERI, '8 November 2026'], [ABUTBUL, '8 November 2026'], [MOSHIASHVILI, '3 November 2026']] as const) expect(k26(p)[6].map(([en]) => en).join(' '), `person ${p}`).toContain(date);
    expect(k26(ABUTBUL)[3]).toBe('out');
    expect(k26(MOSHIASHVILI).slice(1, 4)).toEqual(['26-שס', 13, 'out']);
  });
});
