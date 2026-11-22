// The opening chamber's bloc line, worked out at build time (scripts/bloc-line-seed.ts): the seat chart finds it under
// the same keys its own caches use (src/app/blocLine.ts), so the first board is drawn without routing the line on the
// visitor's device. Any other chamber (another election, an edit, another grouping) is worked out as before.
import seed from 'virtual:bloc-line-seed';
import { keyHash, regionKey, seedSlots, type BlocRegion } from './blocLine.ts';
import type { SeatPos } from './layout.ts';

for (const [key, slots] of seed.slots) seedSlots(key, slots);
const drawings = seed.drawings.map((d) => d.map(([band, fill]) => ({ band, fill })));
const regions = new Map(seed.regions.map(([hash, bands, at]) => [hash, { bands, regions: drawings[at] }]));

/** The regions worked out at build time for exactly this chamber, if it is one of them. */
export function seededRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx: number, cy: number, scale: number): Pick<BlocRegion, 'band' | 'fill'>[] | undefined {
  if (!regions.size) return undefined;
  const hit = regions.get(keyHash(regionKey(seats, bands, seatRadius, cx, cy, scale)));
  return hit && hit.bands === bands.join(',') ? hit.regions : undefined;
}
