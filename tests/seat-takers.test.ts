// Who took each seat: one rule for every election (as the 1999 notice records for Aryeh Deri). A candidate the count
// elected who was not in the Knesset's opening membership is "not seated", and the seat passes down the list
// (scripts/lib/build/seat-takers.ts). Review V3 F8, 19 Nov 2026: 2021 showed Alon Davidi as elected and Idit Silman as
// "next in line"; 2026 showed Aryeh Deri and Dror David Amos as elected and Uriel Busso and Yosef Taieb unmarked.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { knessetMemberSure } from '../scripts/lib/build/bios.ts';
import { compileMkHistory, type MkReview } from '../scripts/mk-history-runtime.ts';

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const K = Array.from({ length: 26 }, (_, i) => i + 1);

describe('the seat goes to whoever sat at the opening, in every election', () => {
  it('every elected candidate with a Knesset identity sat at the opening, and every opening member tied to a candidate is elected', () => {
    const wrong: string[] = [];
    for (const k of K) {
      const ds = read(`public/data/k${k}.json`), ch = read(`data/research/knesset-member-changes/k${k}.json`), bios = read(`data/meta/bios/k${k}.json`).candidates;
      const opening = ch.checks.openingDateReported as string;
      const atOpening = new Set((ch.tenures as { personId: number; start: string }[]).filter((t) => t.start <= opening).map((t) => t.personId));
      const s = scenarioFromDataset(ds);
      for (const l of s.lists) {
        const elected = new Set(electedOf(l, ds.officialSeats[l.id] ?? 0).map((c) => c.id));
        for (const c of l.candidates) {
          const b = bios[c.id], p = b?.knessetPersonId && knessetMemberSure(b) ? b.knessetPersonId : null;
          if (p === null) continue;
          if (elected.has(c.id) && !atOpening.has(p)) wrong.push(`k${k} ${c.id} ${c.nameHe}: shown elected, not at the opening`);
          if (!elected.has(c.id) && atOpening.has(p)) wrong.push(`k${k} ${c.id} ${c.nameHe}: sat at the opening, not shown elected`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('the cases the sweep found: declared elected, did not sit, and who took the seat', () => {
    const cases: [number, string, number[], number[]][] = [
      [3, '3-פ', [2], [6]], // Moshe Kol → Idov Cohen
      [16, '16-כן', [1], [3]], // Natan Sharansky → Marina Solodkin
      [20, '20-ל', [4], [7]], // Ilan Shohat → Robert Ilatov
      [23, '23-פה', [13], [34]], // Yael German → Idan Roll
      [24, '24-ב', [3], [8]], // Alon Davidi → Idit Silman
      [26, '26-שס', [1, 6, 7], [8, 9]], // Aryeh Deri, Dror David Amos (and No. 7 Moshe Abutbul) → Uriel Busso, Yosef Taieb
    ];
    for (const [k, id, out, took] of cases) {
      const ds = read(`public/data/k${k}.json`);
      const l = scenarioFromDataset(ds).lists.find((x) => x.id === id)!;
      const rank = (c: { id: string }) => Number(c.id.split('#')[1]);
      expect(l.candidates.filter((c) => c.notSeated).map(rank), id).toEqual(out);
      const shown = electedOf(l, ds.officialSeats[id]).map(rank);
      for (const r of took) expect(shown, `${id} #${r}`).toContain(r);
      // each one's official record is on screen beside the mark
      const listNotes: string[] = ds.lists.find((x: { id: string }) => x.id === id)?.notesHe ?? [];
      for (const c of l.candidates.filter((x) => x.notSeated)) expect(c.notes?.length || listNotes.some((t) => t.includes(c.nameHe)), c.id).toBeTruthy();
    }
  });

  it('MK history: the one who took the seat sat from the first sitting, the one who declined is "elected; did not sit"', () => {
    const rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview);
    const run = (person: number, k: number) => rt.people[person]?.runs.find((r) => r[0] === k)?.[3];
    expect(run(30765, 26), 'Busso').toBe('first');
    expect(run(2291, 26), 'Deri 2026').toBe('declined');
    // Idit Silman: Yamina No. 8, 2021
    const silman = Object.entries(rt.people).find(([, p]) => p.runs.some((r) => r[1] === '24-ב' && r[2] === 8))?.[1];
    expect(silman?.runs.find((r) => r[0] === 24)?.[3]).toBe('first');
  });
});
