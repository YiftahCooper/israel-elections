// Pure geometry and tallies behind the Charts screen (kept free of React so they can be unit-tested).
import type { AllocationResult } from '../engine/types.ts';
import type { Scenario } from '../model/scenario.ts';

/** Valid votes cast for lists that won no seat: below the threshold, or (1949, or a capped list) short of
 *  a whole seat. Withdrawn lists are outside the valid total, so they are left out. This is the figure the
 *  overview calls "Votes with no seat"; the threshold-only `unrepresentedVotes` misses the 1949 losers. */
export function noSeatVotes(s: Scenario, r: AllocationResult) {
  let t = 0;
  for (const l of s.lists) {
    if (l.withdrawn || l.votes <= 0) continue;
    if ((r.lists.find((x) => x.id === l.id)?.seats ?? 0) === 0) t += l.votes;
  }
  return t;
}

/** The boundaries between unlike neighbours in a row-major grid of `cols` columns, as line segments
 *  laid in the gaps, so every group in a waffle has an unmistakable edge even beside a similar colour.
 *  `pitch` is cell size plus gap; segments run through the middle of each gap. */
export function regionEdges(ids: (string | null)[], cols: number, pitch: number, gap: number) {
  const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const h = gap / 2, bottom = Math.ceil(ids.length / cols) * pitch - gap;
  ids.forEach((id, i) => {
    const c = i % cols, rw = Math.floor(i / cols);
    if (c < cols - 1 && i + 1 < ids.length && ids[i + 1] !== id) {
      const x = (c + 1) * pitch - h;
      out.push({ x1: x, y1: Math.max(0, rw * pitch - h), x2: x, y2: Math.min(bottom, (rw + 1) * pitch - h) });
    }
    if (i + cols < ids.length && ids[i + cols] !== id) {
      const y = (rw + 1) * pitch - h;
      out.push({ x1: Math.max(0, c * pitch - h), y1: y, x2: Math.min(cols * pitch - gap, (c + 1) * pitch - h), y2: y });
    }
  });
  return out;
}
