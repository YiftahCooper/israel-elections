// The members the app shows as elected (electedOf, which skips candidates the official notice did
// not seat) must be exactly the names in the official results notice, list by list.
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
        const shown = electedOf(l, ds.officialSeats[l.id]);
        // the same registered candidates, in order (names may differ in spelling, hence ranks)
        expect(shown.map((c) => Number(c.id.split('#')[1])), `${id} ${e.letters}`).toEqual(e.ranks);
        if (e.names) {
          // and the names agree where the spelling does
          const same = shown.filter((c, k) => normalize(c.nameHe) === normalize(e.names![k])).length;
          expect(same / shown.length, `${id} ${e.letters} names`).toBeGreaterThan(0.8);
        }
      }
    });
  }
});
