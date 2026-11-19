// The Localities map writes place names only where they cover no coloured mark (F1, 19 Nov 2026), and its Vote mix
// hover box gives each list's share as text (it read "[object Object]": a React element put into a string).
import { describe, expect, it } from 'vitest';
import { CELL, MarkGrid, placeName, spotsBeside, type Box } from '../src/app/mapNames.ts';
import { topShares } from '../src/app/voteMix.ts';

const overlaps = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
const touchesCircle = (b: Box, x: number, y: number, r: number) => {
  const nx = Math.max(b[0], Math.min(x, b[2])), ny = Math.max(b[1], Math.min(y, b[3]));
  return (nx - x) ** 2 + (ny - y) ** 2 < r * r;
};

describe('place names beside their marks', () => {
  it('puts a name on the reading side: right in English, left in Hebrew', () => {
    const m = { kind: 'circle' as const, x: 200, y: 100, r: 7 };
    const en = placeName(new MarkGrid(400, 200), m, 60, 16, false)!.box, he = placeName(new MarkGrid(400, 200), m, 60, 16, true)!.box;
    expect(en[0]).toBeGreaterThanOrEqual(207); expect(he[2]).toBeLessThanOrEqual(193);
  });
  it('never covers its own circle, a neighbour, or another name, and moves to a free side', () => {
    const g = new MarkGrid(400, 200);
    g.circle(200, 100, 7, 0); g.circle(240, 100, 9, 1); // a neighbour right where the English name would go
    const box = placeName(g, { kind: 'circle', x: 200, y: 100, r: 7 }, 60, 16, false)!.box;
    expect(touchesCircle(box, 200, 100, 7)).toBe(false);
    expect(touchesCircle(box, 240, 100, 9)).toBe(false);
    expect(box[2]).toBeLessThanOrEqual(193); // it went to the left
    // the next name may not sit on the first one
    const next = placeName(g, { kind: 'circle', x: 200, y: 100, r: 7 }, 60, 16, false);
    if (next) expect(overlaps(next.box, box)).toBe(false);
  });
  it('sets a name further out, with a leader line, when the dots crowd right round its place', () => {
    const g = new MarkGrid(400, 300);
    // a crowd of dots 60 px wide round the place, open sea to the west
    for (let x = 170; x <= 230; x += 10) for (let y = 120; y <= 180; y += 10) g.circle(x, y, 5, 1);
    g.circle(200, 150, 5, 0);
    const spot = placeName(g, { kind: 'circle', x: 200, y: 150, r: 5 }, 70, 16, true)!;
    expect(spot.leader).not.toBeNull();
    for (let x = 170; x <= 230; x += 10) for (let y = 120; y <= 180; y += 10) expect(touchesCircle(spot.box, x, y, 5)).toBe(false);
    expect(spot.box[2]).toBeLessThan(170); // Hebrew reads west: out to the west of the crowd
    // without setting out, there is no room
    expect(placeName(g, { kind: 'circle', x: 200, y: 150, r: 5 }, 70, 16, true, false)).toBeNull();
  });
  it('leaves a name out when every side is covered (it is then a tap away)', () => {
    const g = new MarkGrid(300, 300);
    for (let x = 0; x < 300; x += 12) for (let y = 0; y < 300; y += 12) g.circle(x, y, 6, 1);
    expect(placeName(g, { kind: 'circle', x: 150, y: 150, r: 6 }, 60, 16, false)).toBeNull();
    expect(placeName(g, { kind: 'circle', x: 150, y: 150, r: 6 }, 60, 16, true)).toBeNull();
  });
  it('puts a tiled town\'s name beside its whole block, not on it', () => {
    const g = new MarkGrid(500, 300), block: Box = [150, 80, 300, 220];
    g.rect(block, 3);
    const box = placeName(g, { kind: 'area', x: 200, y: 150, box: block }, 70, 16, true)!.box;
    expect(overlaps(box, block)).toBe(false);
    expect(box[2]).toBeLessThanOrEqual(150); // Hebrew: to the west of the block
  });
  it('keeps names inside the frame', () => {
    const g = new MarkGrid(200, 100);
    const box = placeName(g, { kind: 'circle', x: 190, y: 50, r: 5 }, 80, 16, false)!.box;
    expect(box[2]).toBeLessThanOrEqual(200); expect(box[0]).toBeGreaterThanOrEqual(0);
    expect(spotsBeside({ kind: 'circle', x: 190, y: 50, r: 5 }, 80, 16, false)[0][0]).toBeGreaterThan(190); // first try was the right
  });
  it('finds the place under the pointer, the last drawn on top', () => {
    const g = new MarkGrid(200, 200);
    g.circle(100, 100, 30, 7); g.circle(100, 100, 6, 9);
    expect(g.at(100, 100)).toBe(9); expect(g.at(120, 100)).toBe(7); expect(g.at(10, 10)).toBeNull();
    g.rect([0, 0, 3 * CELL, 3 * CELL]); expect(g.at(1, 1)).toBeNull(); // a name or control is not a place
  });
});

describe('the Vote mix hover box', () => {
  const parts = [{ label: 'Likud', votes: 1620 }, { label: 'Yesh Atid', votes: 4210 }, { label: 'Other', votes: 1000 }, { label: 'Shas', votes: 3170 }];
  it('gives the biggest three lists as text with their shares, never an object', () => {
    const t = topShares(parts, 1);
    expect(t).toEqual(['Yesh Atid 42.1%', 'Shas 31.7%', 'Likud 16.2%']);
    expect(t.join(' · ')).not.toMatch(/object/i);
  });
  it('follows the decimals setting, without trailing zeros', () => {
    expect(topShares(parts, 0)).toEqual(['Yesh Atid 42%', 'Shas 32%', 'Likud 16%']);
    expect(topShares([{ label: 'A', votes: 1 }, { label: 'B', votes: 1 }], 3)).toEqual(['A 50%', 'B 50%']);
  });
  it('splits that are estimates (fractional votes) still read as shares', () => {
    expect(topShares([{ label: 'A', votes: 2.5 }, { label: 'B', votes: 7.5 }], 2)).toEqual(['B 75%', 'A 25%']);
  });
});
