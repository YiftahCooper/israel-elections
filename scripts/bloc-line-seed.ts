// The opening chamber's bloc line, worked out at build time (vite.config.ts serves it as virtual:bloc-line-seed;
// src/app/blocLineSeed.ts hands it to the seat chart). The answers are the seat chart's own functions' (src/app/blocLine.ts)
// for the official 2026 result, with joint lists whole and split by party (the two ways a visitor's first board can
// be), stored under the same keys their caches use, so any other chamber is still worked out in the browser. Every
// browser then draws Chrome's (V8's) line for this chamber; a browser whose seat positions differ in the sixth decimal
// misses the key and works out its own.
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf } from '../src/app/derive.ts';
import { seatOrder, seatGroup } from '../src/app/seatOrder.ts';
import { arcLayout } from '../src/app/layout.ts';
import { arcBlocRegions, arcSeatSlots, frontRowFirst, keyHash, regionKey, slotKey } from '../src/app/blocLine.ts';

/** The election the site opens on (src/app/App.tsx) and the chamber's drawing frame (components/Hemicycle.tsx). */
export const OPENING_ELECTION = 'k26', FRAME = { cx: 500, cy: 470, scale: 400 } as const;

export interface BlocLineSeed {
  /** arcSeatSlots answers: [cache key, slots] */
  slots: [string, number[]][];
  /** arcBlocRegions answers' regions: [hash of the cache key, the bands (checked on use), its regions in `drawings`] */
  regions: [string, string, number][];
  /** [band, fill path] per region; chambers that differ only in how seats sit within a list share one */
  drawings: [number, string][][];
}

/** The chamber input the seat chart builds for a scenario (Hemicycle.tsx: bands by bloc runs, places front row first). */
export function chamberInput(ds: ElectionDataset, splitJointLists: boolean) {
  const s = scenarioFromDataset(ds, 'historical', splitJointLists);
  const seats = seatOrder(s, allocationOf(s), 'list', 'both');
  const blocs: string[] = [], bandOf: number[] = [];
  for (const st of seats) { const bloc = st.bloc ?? '__none'; if (blocs[blocs.length - 1] !== bloc) blocs.push(bloc); bandOf.push(blocs.length - 1); }
  const { seats: pos, r: rad } = arcLayout(s.rules.seats);
  return { pos, rad, bandOf, groups: seats.map(seatGroup) };
}

export function compileBlocLineSeed(root = '.'): BlocLineSeed {
  const ds = JSON.parse(readFileSync(`${root}/public/data/${OPENING_ELECTION}.json`, 'utf8')) as ElectionDataset;
  const seed: BlocLineSeed = { slots: [], regions: [], drawings: [] };
  for (const split of [false, true]) {
    const { pos, rad, bandOf, groups } = chamberInput(ds, split);
    const slotsKey = slotKey(pos, bandOf, rad), slots = arcSeatSlots(pos, bandOf, rad);
    if (!seed.slots.some(([k]) => k === slotsKey)) seed.slots.push([slotsKey, slots]);
    const placed = frontRowFirst(slots.map((k) => pos[k]), groups);
    const hash = keyHash(regionKey(placed, bandOf, rad, FRAME.cx, FRAME.cy, FRAME.scale));
    if (seed.regions.some(([h]) => h === hash)) continue;
    const { regions } = arcBlocRegions(placed, bandOf, rad, FRAME.cx, FRAME.cy, FRAME.scale);
    const drawing: [number, string][] = regions.map((w) => [w.band, w.fill]);
    let at = seed.drawings.findIndex((d) => JSON.stringify(d) === JSON.stringify(drawing));
    if (at < 0) at = seed.drawings.push(drawing) - 1;
    seed.regions.push([hash, bandOf.join(','), at]);
  }
  return seed;
}
