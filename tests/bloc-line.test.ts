// The bloc line as pure geometry: correct side, few bends, same answer every time.
import { describe, expect, test } from 'vitest';
import { arcLayout } from '../src/app/layout.ts';
import { arcBlocRegions, arcSeatSlots, centreLine, frontRowFirst, directionChanges, roundCorners, simplify, smoothLine, trayBlocRegions, trayCell, trayShape, TRAY, type Pt } from '../src/app/blocLine.ts';
import { regionErrors, sharpest, trayRegionErrors } from './bloc-line-check.ts';

/** A turn of about 6° or more: one the eye sees. */
const SEEN = 0.1;
/** Bands for blocs of the given sizes, in seat order. */
const split = (sizes: number[]) => sizes.flatMap((n, b) => Array<number>(n).fill(b));

describe('centreLine', () => {
  test('in a straight corridor it runs down the middle', () => {
    const xs = [0, 1, 2, 3, 4], lo = [0, 0, 0, 0, 0], hi = [2, 2, 2, 2, 2];
    const { angles } = centreLine(xs, lo, hi, [1, 1, 1, 1, 1], [2, 2, 2, 2, 2]);
    for (const a of angles) expect(a).toBeCloseTo(1, 3);
  });
  test('it never leaves the corridor, even where the middle is far off', () => {
    const xs = [0, 1, 2, 3, 4], lo = [0, 0, 1.5, 1.5, 1.5], hi = [1, 2, 2, 2, 2];
    const { angles } = centreLine(xs, lo, hi, [0.5, 1, 1.75, 1.75, 1.75], [1, 2, 0.5, 0.5, 0.5]);
    angles.forEach((a, k) => { expect(a).toBeGreaterThanOrEqual(lo[k] - 1e-9); expect(a).toBeLessThanOrEqual(hi[k] + 1e-9); });
  });
});

describe('roundCorners and smoothLine', () => {
  test('a right angle becomes a curve; the ends and straight runs stay', () => {
    const corner: Pt[] = [[0, 0], [10, 0], [10, 10]], round = roundCorners(corner, 2);
    expect(round[0]).toEqual([0, 0]);
    expect(round.at(-1)).toEqual([10, 10]);
    expect(round.length).toBeGreaterThan(3);
    expect(round.some(([x, y]) => x === 10 && y === 0)).toBe(false);
    expect(roundCorners(corner, 2, 3, () => false)).toEqual(corner);
  });
  test('smoothing irons out a bump but stops where something must stay clear', () => {
    const bumpy: Pt[] = [[0, 0], [1, 0], [2, 1], [3, 0], [4, 0]];
    expect(Math.abs(smoothLine(bumpy, 20, () => true)[2][1])).toBeLessThan(0.3);
    expect(smoothLine(bumpy, 20, () => false)).toEqual(bumpy);
  });
});

describe('directionChanges', () => {
  test('straight 0, one step 1, a zigzag counts every change', () => {
    expect(directionChanges([[0, 0], [1, 0], [2, 0]])).toBe(0);
    expect(directionChanges([[0, 0], [1, 0], [2, 1], [3, 1]])).toBe(1);
    expect(directionChanges([[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]])).toBe(2);
  });
  test('tiny turns along a sampled curve are not direction changes', () => {
    const arc: Pt[] = Array.from({ length: 50 }, (_, i) => [Math.cos(i / 50), Math.sin(i / 50)]);
    expect(directionChanges(arc)).toBe(0);
  });
  test('simplify keeps the ends and drops points on a straight run', () => {
    expect(simplify([[0, 0], [1, 0.001], [2, 0], [3, 5]], 0.01)).toEqual([[0, 0], [2, 0], [3, 5]]);
  });
});

describe('half circle', () => {
  const chambers = [7, 61, 100, 120, 151];
  const splits = (n: number): number[][] => [
    [Math.floor(n / 2), n - Math.floor(n / 2)],
    [Math.max(1, Math.round(n * 0.53)), n - Math.max(1, Math.round(n * 0.53))],
    [Math.round(n * 0.3), Math.round(n * 0.25), n - Math.round(n * 0.3) - Math.round(n * 0.25)],
    [Math.round(n * 0.4), Math.round(n * 0.2), Math.round(n * 0.06) || 1, n - Math.round(n * 0.4) - Math.round(n * 0.2) - (Math.round(n * 0.06) || 1)],
    [7, Math.max(0, n - 21), 7, 7].filter((x) => x > 0),
  ].filter((s) => s.every((x) => x > 0) && s.reduce((a, b) => a + b, 0) === n);

  for (const n of chambers) test(`${n} seats: placement is a permutation with exact bloc sizes, every seat on its side`, () => {
    const arc = arcLayout(n);
    for (const sizes of splits(n)) {
      const bands = split(sizes), slots = arcSeatSlots(arc.seats, bands, arc.r);
      expect([...slots].sort((a, b) => a - b)).toEqual(arc.seats.map((_, i) => i));
      const placed = slots.map((k) => arc.seats[k]);
      expect(regionErrors(placed, bands, arc.r)).toEqual([]);
      const { lines, regions } = arcBlocRegions(placed, bands, arc.r);
      expect(lines).toHaveLength(sizes.length - 1);
      expect(regions).toHaveLength(sizes.length);
      // smooth: no sharp corner (small blocs in a small chamber can still make it wind round them)
      for (const line of lines) {
        expect(directionChanges(line.points, SEEN), `${sizes.join("/")}`).toBeLessThanOrEqual(12);
        expect(sharpest(line.points), `${sizes.join("/")}`).toBeLessThan(1.8);
      }
    }
  });

  test('within a bloc, seats keep the chamber order, so a list stays together', () => {
    const arc = arcLayout(120), bands = split([62, 4, 10, 44]), slots = arcSeatSlots(arc.seats, bands, arc.r);
    for (let b = 0; b < 4; b++) {
      const mine = bands.flatMap((x, i) => (x === b ? [slots[i]] : []));
      expect(mine).toEqual([...mine].sort((x, y) => x - y));
    }
  });

  test('neighbouring regions share their boundary exactly', () => {
    const arc = arcLayout(120), bands = split([40, 30, 50]), placed = arcSeatSlots(arc.seats, bands, arc.r).map((k) => arc.seats[k]);
    const { regions, lines } = arcBlocRegions(placed, bands, arc.r);
    const has = (poly: Pt[], p: Pt) => poly.some((q) => q[0] === p[0] && q[1] === p[1]);
    lines.forEach((line, j) => line.points.forEach((p) => { expect(has(regions[j].polygon, p)).toBe(true); expect(has(regions[j + 1].polygon, p)).toBe(true); }));
  });

  test('one bloc keeps today\'s order and draws no line', () => {
    const arc = arcLayout(120), bands = split([120]);
    expect(arcSeatSlots(arc.seats, bands, arc.r)).toEqual(arc.seats.map((_, i) => i));
    expect(arcBlocRegions(arc.seats, bands, arc.r).lines).toEqual([]);
  });

  test('deterministic: the same input gives the same places and lines', () => {
    const arc = arcLayout(120), bands = split([56, 4, 6, 54]);
    const a = arcSeatSlots(arc.seats, bands, arc.r), placed = a.map((k) => arc.seats[k]);
    const first = JSON.stringify(arcBlocRegions(placed, bands, arc.r));
    // bypass the cache with a fresh but equal input
    const again = arcSeatSlots(arc.seats.map((p) => ({ ...p })), [...bands], arc.r);
    expect(again).toEqual(a);
    expect(JSON.stringify(arcBlocRegions(again.map((k) => ({ ...arc.seats[k] })), [...bands], arc.r))).toBe(first);
  });
});

describe('Blocks tray', () => {
  test('cells fill row by row, left to right, so blocs are horizontal stripes', () => {
    expect(trayCell(0)).toEqual([TRAY.x0, TRAY.y0]);
    expect(trayCell(1)).toEqual([TRAY.x0 + TRAY.pitch, TRAY.y0]);
    expect(trayCell(TRAY.cols)).toEqual([TRAY.x0, TRAY.y0 + TRAY.pitch]);
  });
  test('every boundary is a straight cut or one rounded step, and every seat is on its side', () => {
    for (const sizes of [[60, 60], [64, 56], [7, 106, 7], [30, 25, 7, 58], [13, 13, 13, 13, 68]]) {
      const bands = split(sizes);
      expect(trayRegionErrors(bands)).toEqual([]);
      for (const line of trayBlocRegions(bands).lines) {
        expect(line.points[0][0]).toBeLessThan(TRAY.x0);
        expect(line.points.at(-1)![0]).toBeGreaterThan(TRAY.x0 + (TRAY.cols - 1) * TRAY.pitch + TRAY.cell);
        expect(line.points.every((p, i) => !i || p[0] >= line.points[i - 1][0] - 1e-9)).toBe(true);
        expect(directionChanges(line.points)).toBeLessThanOrEqual(1);
      }
    }
  });
  // audit 12 Nov 2026 (ax-screens-a-03): above 120 seats the fixed 1000 × 320 drawing cut off seat 121 onwards
  test('every seat of every chamber size Rules allows is inside the drawing', () => {
    expect(trayShape(120)).toEqual({ rows: 6, cols: 20, width: 1000, height: 320 });
    for (let n = 1; n <= 1000; n++) {
      const { rows, cols, width, height } = trayShape(n);
      expect(rows * cols, `${n}`).toBeGreaterThanOrEqual(n);
      const [x, y] = trayCell(n - 1, cols);
      expect(x + TRAY.cell, `${n}`).toBeLessThanOrEqual(width - TRAY.end);
      expect(y + TRAY.cell, `${n}`).toBeLessThanOrEqual(height - TRAY.end);
      // the drawing keeps the 120-seat proportions, more or less: never a strip
      expect(width / height, `${n}`).toBeLessThan(4);
    }
  });
  test('bloc regions still hold their own seats in a larger chamber', () => {
    for (const sizes of [[61, 60], [75, 75], [400, 7, 593]]) expect(trayRegionErrors(split(sizes)), sizes.join('/')).toEqual([]);
  });
});

describe('frontRowFirst', () => {
  test("a list's candidates fill its places front row first, each row left to right", () => {
    const arc = arcLayout(120), bands = split([62, 58]), placed = arcSeatSlots(arc.seats, bands, arc.r).map((k) => arc.seats[k]);
    // three lists: the first two share bloc 0, the third is bloc 1
    const groups = bands.map((b, i) => (b === 1 ? 'c' : i < 32 ? 'a' : 'b'));
    const out = frontRowFirst(placed, groups);
    expect(new Set(out).size).toBe(120);
    for (const g of ['a', 'b', 'c']) {
      const mine = out.filter((_, i) => groups[i] === g);
      // the same places as before, only in a new order
      expect(new Set(mine)).toEqual(new Set(placed.filter((_, i) => groups[i] === g)));
      const radius = (p: { x: number; y: number }) => Math.round(Math.hypot(p.x, p.y) * 1e4);
      for (let k = 1; k < mine.length; k++) {
        const a = mine[k - 1], b = mine[k];
        expect(radius(a) < radius(b) || (radius(a) === radius(b) && a.x < b.x), `${g} ${k}`).toBe(true);
      }
    }
  });
});
