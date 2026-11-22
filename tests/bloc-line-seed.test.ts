// The opening chamber's bloc line ships worked out (scripts/bloc-line-seed.ts, src/app/blocLineSeed.ts): what the page
// finds must be exactly what the seat chart's own functions give for that chamber, and nothing else may match it.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import seed from 'virtual:bloc-line-seed';
import { chamberInput, compileBlocLineSeed, FRAME, OPENING_ELECTION } from '../scripts/bloc-line-seed.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

// worked out here before the page's module puts the shipped answers into the caches
const fresh = compileBlocLineSeed();
const ds = JSON.parse(readFileSync(`public/data/${OPENING_ELECTION}.json`, 'utf8')) as ElectionDataset;

it('the build ships the seat chart functions\' own answers for the opening chamber', () => {
  expect(seed).toEqual(fresh);
  expect(seed.slots.length).toBeGreaterThan(0);
  expect(seed.regions.length).toBeGreaterThan(0);
});

it('the opening chamber finds them, joint lists whole or split, and they equal the regions routed in place', async () => {
  const { seededRegions } = await import('../src/app/blocLineSeed.ts');
  const { arcSeatSlots, frontRowFirst, arcBlocRegions } = await import('../src/app/blocLine.ts');
  for (const split of [false, true]) {
    const { pos, rad, bandOf, groups } = chamberInput(ds, split);
    const placed = frontRowFirst(arcSeatSlots(pos, bandOf, rad).map((k) => pos[k]), groups);
    const found = seededRegions(placed, bandOf, rad, FRAME.cx, FRAME.cy, FRAME.scale);
    expect(found, `split ${split}`).toBeDefined();
    expect(found).toEqual(arcBlocRegions(placed, bandOf, rad, FRAME.cx, FRAME.cy, FRAME.scale).regions.map(({ band, fill }) => ({ band, fill })));
    // another chamber (one seat moved between blocs) is not taken for it
    const moved = bandOf.map((b, i) => (i === bandOf.indexOf(1) ? 0 : b));
    expect(seededRegions(placed, moved, rad, FRAME.cx, FRAME.cy, FRAME.scale)).toBeUndefined();
  }
});
