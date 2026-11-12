import { readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { notSeatedReasons } from '../src/app/components/Candidates.tsx';

// Audit 12 Nov 2026 (c-levels-07): a candidate shown as "not seated" carries the reason at that place. Every such
// candidate in every election must find exactly one note of their own list that names them or their place.
const files = readdirSync('public/data').filter((f) => /^k\d+\.json$/.test(f));

it('every "not seated" candidate has exactly one source note that explains it', () => {
  let count = 0;
  for (const f of files) {
    const ds = JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as ElectionDataset;
    const why = notSeatedReasons(ds);
    for (const l of ds.lists) for (const c of l.candidates.filter((x) => x.notSeated)) {
      count++;
      const matches = (l.notesHe ?? []).filter((t) => t.includes(c.nameHe) || t.includes(`(מקום ${c.rank})`));
      expect(matches, `${f} ${l.id} #${c.rank} ${c.nameHe}`).toHaveLength(1);
      expect(why[c.id]).toBe(matches[0]);
    }
  }
  expect(count).toBeGreaterThan(10);
});

it('1949 Mapai: Moshe Dayan (place 10) is explained by his own note', () => {
  const ds = JSON.parse(readFileSync('public/data/k1.json', 'utf8')) as ElectionDataset;
  const mapai = ds.lists.find((l) => l.id === '1-א')!;
  const dayan = mapai.candidates.find((c) => c.rank === 10)!;
  expect(dayan.nameHe).toBe('דיין משה');
  expect(notSeatedReasons(ds)[dayan.id]).toMatch(/^דיין משה \(מקום 10\) אינו מופיע בין הנבחרים/);
});
