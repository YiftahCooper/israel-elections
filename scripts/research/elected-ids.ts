// Prints, as JSON, the candidate ids the app shows as elected in every released election
// (electedOf over the historical scenario; official seats, or the engine's seats where the
// dataset has none, as for k26). Used by scripts/research/build-bios.py.
import { readFileSync } from 'node:fs';
import { allocationOf, baselineOf, electedOf } from '../../src/app/derive.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];
const out: Record<string, string[]> = {};
for (const { id, available } of index) {
  if (!available) continue;
  const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
  const s = baselineOf(ds);
  const r = allocationOf(s);
  const seats = (lid: string): number => ds.officialSeats?.[lid] ?? r.lists.find((x) => x.id === lid)?.seats ?? 0;
  out[id] = s.lists.flatMap((l) => electedOf(l, seats(l.id)).map((c) => c.id));
}
process.stdout.write(JSON.stringify(out));
