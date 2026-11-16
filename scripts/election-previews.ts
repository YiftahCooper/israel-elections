// Writes each available election's result strip (its lists' colours and seats, as the election picker draws it) into
// public/data/elections.json, so opening the picker downloads no election data. Run after the datasets change:
//   npm run data:previews        (tests/election-previews.test.ts fails while the strips are out of step)
import { readFileSync, writeFileSync } from 'node:fs';
import { electionPreview } from '../src/data/electionPreview.ts';
import type { ElectionDataset, ElectionIndexEntry } from '../src/data/schema.ts';

const path = 'public/data/elections.json';
const index = JSON.parse(readFileSync(path, 'utf8')) as ElectionIndexEntry[];
for (const e of index) {
  if (!e.available) { delete e.preview; continue; }
  e.preview = electionPreview(JSON.parse(readFileSync(`public/data/${e.id}.json`, 'utf8')) as ElectionDataset);
}
// one line per strip, the rest as before
writeFileSync(path, JSON.stringify(index, null, 2).replace(/"preview": \[[\s\S]*?\n {4}\]/g, (m) => `"preview": ${JSON.stringify(JSON.parse(m.slice(11)))}`) + '\n');
console.log(`result strips written for ${index.filter((e) => e.preview).length} elections`);
