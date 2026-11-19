// Where the Localities map may write a place's name: never over a coloured mark (a dot, a circle, a town's tiles, the
// envelope island) and never over another name. The map layer paints every mark into a coarse grid of the screen,
// each cell remembering the place it belongs to; a name is tried beside its own mark (on the reading side first, then
// the other side, then above and below) and is left out where no spot is clear: the place's name is then a tap or
// hover away. The same grid answers which place is under the pointer, so the hover box matches what is drawn.

/** Screen cell size in pixels: fine enough that a name never touches a mark by more than a sliver. */
export const CELL = 3;
export type Box = [number, number, number, number];

export class MarkGrid {
  readonly cols: number; readonly rows: number;
  /** 0 empty, -1 taken by something that is not a place (a name, a control, the island), else place index + 1 */
  readonly owner: Int32Array;
  constructor(readonly width: number, readonly height: number) {
    this.cols = Math.max(1, Math.ceil(width / CELL)); this.rows = Math.max(1, Math.ceil(height / CELL));
    this.owner = new Int32Array(this.cols * this.rows);
  }
  private span(b: Box) {
    return [Math.max(0, Math.floor(b[0] / CELL)), Math.max(0, Math.floor(b[1] / CELL)), Math.min(this.cols - 1, Math.ceil(b[2] / CELL) - 1), Math.min(this.rows - 1, Math.ceil(b[3] / CELL) - 1)];
  }
  clone() { const g = new MarkGrid(this.width, this.height); g.owner.set(this.owner); return g; }
  /** Marks a rectangle; `index` is the place it belongs to (null: not a place). */
  rect(b: Box, index: number | null = null) {
    const [c0, r0, c1, r1] = this.span(b), v = index === null ? -1 : index + 1;
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.owner[r * this.cols + c] = v;
  }
  circle(x: number, y: number, radius: number, index: number | null = null) {
    const [c0, r0, c1, r1] = this.span([x - radius, y - radius, x + radius, y + radius]), v = index === null ? -1 : index + 1;
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      // the cell's nearest point to the centre, so a cell the circle only grazes still counts
      const nx = Math.max(c * CELL, Math.min(x, (c + 1) * CELL)), ny = Math.max(r * CELL, Math.min(y, (r + 1) * CELL));
      if ((nx - x) ** 2 + (ny - y) ** 2 <= radius * radius) this.owner[r * this.cols + c] = v;
    }
  }
  /** Whether a box is inside the screen and touches nothing. */
  clear(b: Box, margin = 2) {
    if (b[0] < margin || b[1] < margin || b[2] > this.width - margin || b[3] > this.height - margin) return false;
    const [c0, r0, c1, r1] = this.span(b);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (this.owner[r * this.cols + c] !== 0) return false;
    return true;
  }
  /** Whether a segment crosses nothing but places (a leader line may run over dots, never over a name or another line). */
  lineClear(x0: number, y0: number, x1: number, y1: number) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / CELL) + 1;
    for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n;
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      if (this.owner[Math.floor(y / CELL) * this.cols + Math.floor(x / CELL)] < 0) return false; }
    return true;
  }
  /** The place drawn at a point, or null. */
  at(x: number, y: number): number | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    const v = this.owner[Math.floor(y / CELL) * this.cols + Math.floor(x / CELL)];
    return v > 0 ? v - 1 : null;
  }
}

/** A place's own mark on screen: a circle (a dot or a pie) or the box around its tiles. */
export type Mark = { kind: 'circle'; x: number; y: number; r: number } | { kind: 'area'; x: number; y: number; box: Box };
const GAP = 3;
/** Spots beside a mark for a name `w`×`h`, best first: the reading side (right in English, left in Hebrew), the other
 *  side, then above and below. A town's tiles: beside its whole block, level with its point. */
export function spotsBeside(m: Mark, w: number, h: number, rtl: boolean): Box[] {
  const [l, t, r, b] = m.kind === 'circle' ? [m.x - m.r, m.y - m.r, m.x + m.r, m.y + m.r] : m.box;
  const right: Box = [r + GAP, m.y - h / 2, r + GAP + w, m.y + h / 2], left: Box = [l - GAP - w, m.y - h / 2, l - GAP, m.y + h / 2];
  const above: Box = [m.x - w / 2, t - GAP - h, m.x + w / 2, t - GAP], below: Box = [m.x - w / 2, b + GAP, m.x + w / 2, b + GAP + h];
  return rtl ? [left, right, above, below] : [right, left, above, below];
}
/** Where a name went: its box, and for a name set further out, the leader line from the mark's edge to the name. */
export interface Placed { box: Box; leader: [number, number, number, number] | null }
// set-out names: how far from the mark's centre the near edge of the name may go, and in which directions (unit
// vectors, reading side first)
const OUT = [20, 32, 46, 62];
const dirs = (rtl: boolean): [number, number][] => { const s = rtl ? -1 : 1, d = Math.SQRT1_2;
  return [[s, 0], [-s, 0], [s * d, -d], [s * d, d], [-s * d, -d], [-s * d, d], [0, -1], [0, 1]]; };
/** A box `w`×`h` whose nearest point to (x, y) is `dist` away along (dx, dy). */
const boxOut = (x: number, y: number, dx: number, dy: number, dist: number, w: number, h: number): Box => {
  const cx = x + dx * dist + (dx > 0.01 ? w / 2 : dx < -0.01 ? -w / 2 : 0), cy = y + dy * dist + (dy > 0.01 ? h / 2 : dy < -0.01 ? -h / 2 : 0);
  return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
};
/** The point of a box nearest to (x, y), where a leader line ends. */
const nearest = (b: Box, x: number, y: number) => [Math.max(b[0], Math.min(x, b[2])), Math.max(b[1], Math.min(y, b[3]))];
/** The first clear spot beside the mark; failing that, a clear spot a little further out, joined to the mark by a thin
 *  leader line (so far out, where the dots crowd, the big places still have names, set in the sea or the desert).
 *  The spot (and the line) are taken in the grid so later names keep off them; null when nothing is clear. */
export function placeName(grid: MarkGrid, m: Mark, w: number, h: number, rtl: boolean, setOut = true): Placed | null {
  for (const box of spotsBeside(m, w, h, rtl)) if (grid.clear(box)) { grid.rect([box[0] - 1, box[1], box[2] + 1, box[3]]); return { box, leader: null }; }
  if (!setOut || m.kind !== 'circle') return null;
  for (const dist of OUT) for (const [dx, dy] of dirs(rtl)) {
    const box = boxOut(m.x, m.y, dx, dy, m.r + dist, w, h);
    if (!grid.clear(box)) continue;
    const [ex, ey] = nearest(box, m.x, m.y), len = Math.hypot(ex - m.x, ey - m.y) || 1;
    const sx = m.x + (ex - m.x) / len * (m.r + 1), sy = m.y + (ey - m.y) / len * (m.r + 1);
    if (!grid.lineClear(sx, sy, ex, ey)) continue;
    grid.rect([box[0] - 1, box[1], box[2] + 1, box[3]]);
    // the line is taken too, so no later name sits on it
    for (let t = 0; t <= 1; t += 2 / len) grid.rect([sx + (ex - sx) * t - 1, sy + (ey - sy) * t - 1, sx + (ex - sx) * t + 1, sy + (ey - sy) * t + 1]);
    return { box, leader: [sx, sy, ex, ey] };
  }
  return null;
}
