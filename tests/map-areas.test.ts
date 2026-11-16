// The Localities map's Vote mix (U4, 16 Nov 2026): each list's share of a town's tiles is its share of the votes, in one
// connected block; Hebron's hand-placed point is found by code and, in 2006, by name.
import { describe, expect, it } from 'vitest';
import { apportion, groupCells, type Cell } from '../src/app/voteMix.ts';
import { manualPoint, MANUAL_POINTS } from '../src/data/locality-manual-points.ts';

const grid = (w: number, h: number, keep: (i: number, j: number) => boolean = () => true): Cell[] =>
  Array.from({ length: w * h }, (_, k) => ({ i: k % w, j: Math.floor(k / w), g: -1 })).filter(c => keep(c.i, c.j));
const connected = (cells: Cell[]) => {
  if (!cells.length) return true;
  const at = new Set(cells.map(c => `${c.i},${c.j}`)), seen = new Set<string>(), stack = [`${cells[0].i},${cells[0].j}`];
  while (stack.length) { const k = stack.pop()!; if (seen.has(k)) continue; seen.add(k); const [i, j] = k.split(',').map(Number);
    for (const n of [`${i + 1},${j}`, `${i - 1},${j}`, `${i},${j + 1}`, `${i},${j - 1}`]) if (at.has(n) && !seen.has(n)) stack.push(n); }
  return seen.size === cells.length;
};

describe('vote mix tiles', () => {
  it('apportions every tile, by largest remainder', () => {
    expect(apportion([{ votes: 87227 }, { votes: 45000 }, { votes: 133569 }], 1000).reduce((a, b) => a + b, 0)).toBe(1000);
    expect(apportion([{ votes: 1 }, { votes: 1 }, { votes: 1 }], 10)).toEqual([4, 3, 3]);
    expect(apportion([{ votes: 2 }, { votes: 1 }], 4)).toEqual([3, 1]);
    // a place with no votes has no parts and its tiles stay unassigned
    const none = grid(5, 5); groupCells(none, []); expect(none.every(c => c.g === -1)).toBe(true);
  });
  it('gives each list its count of tiles as one connected block', () => {
    for (const [w, h, shape] of [[40, 30, null], [12, 60, null], [50, 50, (i: number, j: number) => (i - 25) ** 2 + (j - 25) ** 2 < 600]] as const) {
      const cells = grid(w, h, shape ?? undefined), votes = [41, 19, 14, 12, 6, 5, 3];
      const counts = apportion(votes.map(v => ({ votes: v })), cells.length);
      groupCells(cells, counts);
      votes.forEach((_, g) => {
        const own = cells.filter(c => c.g === g);
        expect(own.length).toBe(counts[g]);
        expect(connected(own), `group ${g} in ${w}x${h}`).toBe(true);
      });
    }
  });
  it('keeps the list order: the first list starts at the west end of a wide town', () => {
    const cells = grid(60, 10); groupCells(cells, apportion([{ votes: 50 }, { votes: 50 }], cells.length));
    expect(Math.max(...cells.filter(c => c.g === 0).map(c => c.i))).toBeLessThan(Math.min(...cells.filter(c => c.g === 1).map(c => c.i)));
  });
});

describe('places placed by hand', () => {
  it('places Hebron (CEC locality 3400; the 2006 row has no code) and marks it approximate in both languages', () => {
    expect(manualPoint({ code: 3400, nameHe: 'חברון' })).toBe(MANUAL_POINTS[0]);
    expect(manualPoint({ code: null, nameHe: 'חברון ' })).toBe(MANUAL_POINTS[0]);
    expect(manualPoint({ code: 3000, nameHe: 'ירושלים' })).toBeNull();
    expect(manualPoint({ code: 9999, nameHe: 'חברון' })).toBeNull();
    const h = MANUAL_POINTS[0];
    expect(h.lat).toBeCloseTo(31.525, 2); expect(h.lon).toBeCloseTo(35.108, 2);
    expect(h.noteEn).toMatch(/^Approximate/); expect(h.noteHe).toMatch(/^מיקום משוער/);
  });
});
