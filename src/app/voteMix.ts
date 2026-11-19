// The Vote mix's arithmetic, apart from the map layer that draws it (src/app/components/mapAreas.ts).
import { fmtPct } from './format.ts';
/** Largest-remainder split of `total` units over the parts' votes. */
export function apportion(parts: { votes: number }[], total: number): number[] {
  const sum = parts.reduce((a, p) => a + p.votes, 0) || 1;
  const raw = parts.map(p => p.votes / sum * total), n = raw.map(Math.floor);
  let left = total - n.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - n[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { n[i]++; left--; } });
  return n;
}
export const tileSize = (z: number) => z < 11.25 ? 5 : z < 12.25 ? 6 : 8;
export const circleR = (z: number, valid: number) => Math.max(2.5, 0.031 * Math.pow(2, (z - 8) * 0.48) * Math.sqrt(valid));
/** Fewer tiles than this and a town keeps its circle. */
export const MIN_TILES = 24;
export type Cell = { i: number; j: number; g: number };

/** Gives each part its apportioned number of cells as one compact block: the list sequence is split in two near-equal
 *  halves (keeping its order) and the cells are cut across their longer side, again and again. */
export function groupCells(cells: Cell[], counts: number[]): void {
  const rec = (cs: Cell[], groups: number[]) => {
    if (!cs.length) return;
    if (groups.length === 1) { cs.forEach(c => { c.g = groups[0]; }); return; }
    const total = groups.reduce((a, g) => a + counts[g], 0);
    let best = 1, bestD = Infinity, acc = 0;
    for (let s = 1; s < groups.length; s++) { acc += counts[groups[s - 1]]; const d = Math.abs(acc - total / 2); if (d < bestD) { bestD = d; best = s; } }
    const A = groups.slice(0, best), B = groups.slice(best), nA = A.reduce((a, g) => a + counts[g], 0);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const c of cs) { if (c.i < x0) x0 = c.i; if (c.i > x1) x1 = c.i; if (c.j < y0) y0 = c.j; if (c.j > y1) y1 = c.j; }
    // the west part first when cutting across the width (the blocks read left to right in both languages); north first otherwise
    if (x1 - x0 >= y1 - y0) cs.sort((a, b) => a.i - b.i || a.j - b.j); else cs.sort((a, b) => a.j - b.j || a.i - b.i);
    rec(cs.slice(0, nA), A); rec(cs.slice(nA), B);
  };
  if (counts.length) rec(cells, counts.map((_, g) => g));
}

/** A place's biggest parts with their shares of its votes, as text for the map's hover box ("Likud 16.2%"), at most
 *  `digits` decimals like every share in the app (fmtPct). */
export function topShares(parts: { label: string; votes: number }[], digits: number, n = 3): string[] {
  const sum = parts.reduce((a, q) => a + q.votes, 0);
  return [...parts].sort((a, b) => b.votes - a.votes).slice(0, n).map(q => `${q.label} ${sum > 0 ? fmtPct(q.votes, sum, digits) : '—%'}`);
}
