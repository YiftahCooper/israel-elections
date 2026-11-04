// Checks that seat-winning lists have clearly different colours (decision 0087, revised 2026-11-04): every pair at
// least MIN_LIST_DELTA_E apart (CIEDE2000) and lists next to each other in seat order at least MIN_NEIGHBOUR_DELTA_E.
// The full check, with the app's own chamber and list-column orders, is tests/party-colours.test.ts.
// Usage: node scripts/check-colours.ts k20 k21 …  (no ids = every available election)

import { readFileSync } from 'node:fs';
import { deltaE2000, MIN_LIST_DELTA_E, MIN_NEIGHBOUR_DELTA_E } from '../src/data/colour.ts';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[]).filter((e) => e.available).map((e) => e.id);
let failed = false;
for (const id of ids) {
  const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
  const thr = Number(ds.ruleSetId.split('-').pop()) / 100;
  const won = ds.lists.filter((l: any) => (ds.officialSeats ? ds.officialSeats[l.id] > 0 : l.votes >= thr * ds.totals.valid)); // seat order
  const bad: string[] = [];
  won.forEach((a: any, i: number) => won.slice(i + 1).forEach((b: any, j: number) => {
    const d = deltaE2000(a.color, b.color), need = j === 0 ? MIN_NEIGHBOUR_DELTA_E : MIN_LIST_DELTA_E;
    if (d < need - 0.05) bad.push(`${a.shortEn}/${b.shortEn} ${d.toFixed(1)}`);
  }));
  if (bad.length) failed = true;
  console.log(id, bad.length ? 'CLOSE: ' + bad.join('; ') : 'ok');
}
if (failed) process.exitCode = 1;
