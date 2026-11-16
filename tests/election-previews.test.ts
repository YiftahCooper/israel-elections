// The election picker draws each election's result strip from the election list (owner, 16 Nov 2026: opening the
// list must not download every election). The strips shipped there must match the data: run `npm run data:previews`.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { electionPreview } from '../src/data/electionPreview.ts';
import type { ElectionDataset, ElectionIndexEntry } from '../src/data/schema.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as ElectionIndexEntry[];
it('every available election ships its result strip, in step with its data', () => {
  for (const e of index.filter((x) => x.available)) {
    const ds = JSON.parse(readFileSync(`public/data/${e.id}.json`, 'utf8')) as ElectionDataset;
    expect(e.preview, `${e.id}: run npm run data:previews`).toEqual(electionPreview(ds));
    // and it is the official result: the seats each list won, in list order
    expect(e.preview!.map(([, n]) => n), e.id).toEqual(ds.lists.map((l) => ds.officialSeats?.[l.id] ?? 0).filter((n) => n > 0));
  }
});
