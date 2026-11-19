// The members the app shows as elected (electedOf, which skips candidates the official notice did
// not seat) must be exactly the names in the official results notice, list by list, except where the Knesset's
// opening membership shows that a candidate the notice declared elected did not take the seat
// (scripts/lib/build/seat-takers.ts): that seat passes down the list, and the candidate's own note says why.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

const normalize = (s: string) => s.replace(/[\s\-־–—׳’'"״]/g, '');
const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];
/** official elected registered ranks per list, from whichever reviewed record the election has */
function noticeRanks(id: string): { letters: string; ranks: number[]; names?: string[] }[] | null {
  if (existsSync(`data/raw/${id}/elected.reviewed.json`)) {
    const e = JSON.parse(readFileSync(`data/raw/${id}/elected.reviewed.json`, 'utf8')) as { lists: { letters: string; names: string[]; candidateRanks: number[] }[] };
    return e.lists.map((l) => ({ letters: l.letters, ranks: l.candidateRanks, names: l.names }));
  }
  if (existsSync(`data/raw/${id}/rosters.reviewed.json`)) {
    const r = JSON.parse(readFileSync(`data/raw/${id}/rosters.reviewed.json`, 'utf8')) as { lists: { letters: string; electedCandidateRanks?: number[]; electedNames?: string[] }[] };
    const lists = r.lists.filter((l) => l.electedCandidateRanks?.length).map((l) => ({ letters: l.letters, ranks: l.electedCandidateRanks!, names: l.electedNames }));
    if (lists.length) return lists;
  }
  if (!existsSync(`data/raw/${id}/candidates.reviewed.json`)) return null;
  const c = JSON.parse(readFileSync(`data/raw/${id}/candidates.reviewed.json`, 'utf8')) as { lists: { letters: string; electedCrossCheck?: { ranks?: number[] } }[] };
  const lists = c.lists.filter((l) => l.electedCrossCheck?.ranks?.length).map((l) => ({ letters: l.letters, ranks: l.electedCrossCheck!.ranks! }));
  return lists.length ? lists : null;
}
const ids = index.filter((e) => e.available && noticeRanks(e.id)).map((e) => e.id);

describe('elected members match the official results notice', () => {
  for (const id of ids) {
    it(id, () => {
      const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
      const notice = { lists: noticeRanks(id)! };
      const s = scenarioFromDataset(ds);
      for (const e of notice.lists) {
        const l = s.lists.find((x) => x.letters === e.letters)!;
        const seats = ds.officialSeats[l.id];
        const shown = electedOf(l, seats);
        // declared elected but not at the opening: each such candidate carries the note that says so
        const declined = l.candidates.filter((c) => c.notSeated && e.ranks.includes(Number(c.id.split('#')[1])));
        const listNotes: string[] = ds.lists.find((x: { id: string }) => x.id === l.id)?.notesHe ?? [];
        for (const c of declined) expect(c.notes?.length || listNotes.some((t) => t.includes(c.nameHe)), `${c.id} has no note`).toBeTruthy();
        const kept = e.ranks.filter((r) => !declined.some((c) => Number(c.id.split('#')[1]) === r));
        const next = l.candidates.filter((c) => !c.notSeated && !e.ranks.includes(Number(c.id.split('#')[1]))).map((c) => Number(c.id.split('#')[1]));
        const expected = [...kept, ...next.slice(0, seats - kept.length)].sort((a, b) => a - b);
        // the same registered candidates, in order (names may differ in spelling, hence ranks)
        expect(shown.map((c) => Number(c.id.split('#')[1])), `${id} ${e.letters}`).toEqual(expected);
        if (e.names) {
          // and the names agree where the spelling does
          const same = shown.filter((c) => { const k = e.ranks.indexOf(Number(c.id.split('#')[1])); return k >= 0 && normalize(c.nameHe) === normalize(e.names![k]); }).length;
          expect(same / kept.length, `${id} ${e.letters} names`).toBeGreaterThan(0.8);
        }
      }
    });
  }
});
