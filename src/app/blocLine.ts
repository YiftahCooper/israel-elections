// The line between blocs on the seat chart: pure geometry (no DOM), unit-tested in tests/bloc-line.test.ts.
//
// Half circle. Seats keep their places; each boundary is routed through the empty space between the two sides' seats
// as a pulled string: the shortest path that keeps every seat of the earlier blocs on its left (larger angle) and every
// later seat on its right, with the widest clearance the seats allow. A pulled string is straight wherever it can be and
// bends only where a seat forces it to, so it never zigzags for no reason, and its bends follow the seats' round edges
// (smooth, never right-angled). Length is measured in log-polar coordinates (ln r, angle), a conformal map of the fan,
// so a straight run is a radial line or a gentle spiral that crosses every row at the same angle.
//
// Blocks. Seats fill the 20 × 6 tray column by column, so each bloc is a band read left to right like the half circle,
// and its edge is one vertical line with at most one step; the step's two corners are rounded within the row gap.
import type { SeatPos } from './layout.ts';

export type Pt = [number, number];
export interface BlocRegion { band: number; fill: string; polygon: Pt[] }
/** One boundary in screen coordinates, inner rim to outer rim (half circle) or top to bottom (Blocks). */
export interface BlocLine { after: number; points: Pt[]; clearance: number }

const f = (v: number) => Number(v.toFixed(3));
const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${f(p[0])} ${f(p[1])}`).join(' ') + ' Z';

/** Shortest path through ordered portals (simple stupid funnel algorithm). x increases along the portals; each portal
 *  spans [lo, hi] in y. Returns the path's vertices from `start` to `end`. */
export function pullString(xs: number[], lo: number[], hi: number[], start: number, end: number): Pt[] {
  const n = xs.length;
  const left = (i: number): Pt => [xs[i], i === 0 ? start : i === n - 1 ? end : hi[i]];
  const right = (i: number): Pt => [xs[i], i === 0 ? start : i === n - 1 ? end : lo[i]];
  // > 0 when c lies to the left of a→b (y up)
  const cross = (a: Pt, b: Pt, c: Pt) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const same = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1];
  const path: Pt[] = [[xs[0], start]];
  let apex = path[0], l = apex, r = apex, ai = 0, li = 0, ri = 0;
  for (let i = 1; i < n; i++) {
    const nl = left(i), nr = right(i);
    if (cross(apex, r, nr) >= 0) {
      if (same(apex, r) || cross(apex, l, nr) < 0) { r = nr; ri = i; }
      else { path.push(l); apex = l; ai = li; r = l; ri = li; i = ai; continue; }
    }
    if (cross(apex, l, nl) <= 0) {
      if (same(apex, l) || cross(apex, r, nl) > 0) { l = nl; li = i; }
      else { path.push(r); apex = r; ai = ri; l = r; li = ri; i = ai; continue; }
    }
  }
  const last: Pt = [xs[n - 1], end];
  if (!same(path[path.length - 1], last)) path.push(last);
  return path;
}

/** Drop points that deviate less than `tol` from the line through their neighbours (Ramer–Douglas–Peucker). */
export function simplify(pts: Pt[], tol: number): Pt[] {
  if (pts.length < 3) return pts;
  const keep = new Array(pts.length).fill(false); keep[0] = keep[pts.length - 1] = true;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = pts[a], [bx, by] = pts[b], len = Math.hypot(bx - ax, by - ay) || 1;
    let worst = -1, d = tol;
    for (let i = a + 1; i < b; i++) {
      const e = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (e > d) { d = e; worst = i; }
    }
    if (worst >= 0) { keep[worst] = true; stack.push([a, worst], [worst, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Direction changes along a polyline: the number of times its turning switches between left and right, ignoring
 *  turns smaller than `minTurn` radians (sampling noise along a curve). A straight line has 0; one smooth step has 1. */
export function directionChanges(pts: Pt[], minTurn = 0.02): number {
  let sign = 0, changes = 0, acc = 0;
  for (let i = 1; i + 1 < pts.length; i++) {
    const a = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    const b = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
    let t = b - a; while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI;
    if (Math.sign(t) !== Math.sign(acc)) acc = 0;
    acc += t;
    if (Math.abs(acc) < minTurn) continue;
    const s = Math.sign(acc);
    if (sign && s !== sign) changes++;
    sign = s; acc = 0;
  }
  return changes;
}

/** Recent answers, so re-drawing the same chart (every edit redraws it) costs nothing. */
const slotCache = new Map<string, number[]>(), regionCache = new Map<string, { regions: BlocRegion[]; lines: BlocLine[] }>();
function remember<T>(cache: Map<string, T>, key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit !== undefined) { cache.delete(key); cache.set(key, hit); return hit; }
  const value = make();
  cache.set(key, value);
  if (cache.size > 64) cache.delete(cache.keys().next().value!);
  return value;
}

const C_MIN = 0.003, C_MAX = 0.012, C_TRY = 0.006, STEP = 0.0015;

/** The half circle's rows and the sample radii every boundary is routed on. */
interface Arc {
  seats: SeatPos[]; rad: number; q: number[]; radii: number[]; row: number[]; depth: number; inner: number; outer: number;
  qs: number[]; xs: number[]; near: number[][]; floorLo: number[]; floorHi: number[];
}
function arcGeometry(seats: SeatPos[], rad: number): Arc {
  const q = seats.map((p) => Math.hypot(p.x, p.y));
  const radii: number[] = [];
  for (const r of q) if (!radii.some((x) => Math.abs(x - r) < 1e-6)) radii.push(r);
  radii.sort((a, b) => a - b);
  const row = q.map((r) => radii.findIndex((x) => Math.abs(x - r) < 1e-6));
  const depth = rad + 0.015; // the floor's depth below the baseline, in unit radii
  const inner = radii[0] - depth, outer = radii[radii.length - 1] + depth;
  // sample radii: an even grid plus every row's own radius (where its seats are widest)
  const qs = [...new Set([...Array.from({ length: Math.ceil((outer - inner) / STEP) + 1 }, (_, i) => Math.min(outer, inner + i * STEP)), ...radii])].sort((a, b) => a - b);
  const near = qs.map((r) => q.flatMap((x, i) => (Math.abs(x - r) < rad + C_MAX + 2 * STEP ? [i] : [])));
  return { seats, rad, q, radii, row, depth, inner, outer, qs, xs: qs.map(Math.log), near,
    floorLo: qs.map((r) => -depth / r), floorHi: qs.map((r) => Math.PI + depth / r) };
}

/** The open corridor for one boundary at clearance c: per sample radius, the angles the line may take. `left[i]`: seat
 *  i must be on the line's left (larger angle). `prev`: the previous boundary, which this one may not cross. */
function corridor(g: Arc, left: boolean[], c: number, prev: number[] | null) {
  // one extra sample step: between two sample radii the line can come no closer than that
  const rr = g.rad + c + STEP, lo = g.floorLo.slice(), hi = g.floorHi.slice();
  g.qs.forEach((q, k) => {
    for (const i of g.near[k]) {
      const qi = g.q[i];
      if (Math.abs(q - qi) >= rr) continue;
      const w = Math.acos(Math.max(-1, Math.min(1, (q * q + qi * qi - rr * rr) / (2 * q * qi))));
      if (left[i]) hi[k] = Math.min(hi[k], g.seats[i].a - w); else lo[k] = Math.max(lo[k], g.seats[i].a + w);
    }
    if (prev) hi[k] = Math.min(hi[k], prev[k]);
  });
  return { lo, hi };
}
const open = ({ lo, hi }: { lo: number[]; hi: number[] }) =>
  lo.every((v, k) => v <= hi[k] && (k === 0 || Math.max(v, lo[k - 1]) <= Math.min(hi[k], hi[k - 1])));

/** The pulled string through a corridor with free ends: a radial line midway when one fits. Otherwise the string is
 *  pulled with its ends square to the rims; with `refine`, each end then slides along its rim to wherever the whole line
 *  bends least, so a line ends without a final hook or kink wherever the seats allow. */
function pullFree(xs: number[], lo: number[], hi: number[], refine = false): Pt[] {
  const top = Math.min(...hi), bottom = Math.max(...lo);
  if (bottom <= top) { const a = (bottom + top) / 2; return [[xs[0], a], [xs[xs.length - 1], a]]; }
  const n = xs.length, clamp = (v: number, k: number) => Math.max(lo[k], Math.min(hi[k], v));
  // start from the corridor's middle at the first and last rows the line must thread
  let s = (Math.max(...lo.slice(0, Math.ceil(n / 4))) + Math.min(...hi.slice(0, Math.ceil(n / 4)))) / 2;
  let e = (Math.max(...lo.slice(-Math.ceil(n / 4))) + Math.min(...hi.slice(-Math.ceil(n / 4)))) / 2;
  s = clamp(s, 0); e = clamp(e, n - 1);
  let path = pullString(xs, lo, hi, s, e);
  for (let round = 0; round < 6; round++) {
    const s2 = clamp(path[1][1], 0), e2 = clamp(path[path.length - 2][1], n - 1);
    if (Math.abs(s2 - s) < 1e-9 && Math.abs(e2 - e) < 1e-9) break;
    s = s2; e = e2; path = pullString(xs, lo, hi, s, e);
  }
  if (!refine) return path;
  let best = turning(path);
  for (let round = 0; round < 2; round++) for (const end of [0, 1]) {
    const k = end ? n - 1 : 0, now = end ? e : s;
    for (const d of [-0.08, -0.04, -0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02, 0.04, 0.08]) {
      const v = clamp(now + d, k);
      if (v === now) continue;
      const p = end ? pullString(xs, lo, hi, s, v) : pullString(xs, lo, hi, v, e), t = turning(p);
      if (t < best - 1e-6) { best = t; path = p; if (end) e = v; else s = v; }
    }
  }
  return path;
}

/** Total bending of a path, in radians (the sum of its turns). */
export function turning(path: Pt[]): number {
  let t = 0;
  for (let i = 1; i + 1 < path.length; i++) {
    let d = Math.atan2(path[i + 1][1] - path[i][1], path[i + 1][0] - path[i][0]) - Math.atan2(path[i][1] - path[i - 1][1], path[i][0] - path[i - 1][0]);
    while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    t += Math.abs(d);
  }
  return t;
}

/** Route one boundary. With `c`, at that clearance only (null when the corridor is closed); without, at the widest
 *  clearance that leaves the corridor open (binary search; the narrowest always fits). Returns the path in
 *  (ln radius, angle), the line's angle at every sample radius (its leftmost where it jogs) and the clearance. */
function routeLine(g: Arc, left: boolean[], prev: number[] | null, fixed?: number, refine = false): { path: Pt[]; angles: number[]; c: number } | null {
  let c = fixed ?? C_MIN, cor = corridor(g, left, c, prev);
  if (fixed !== undefined) { if (!open(cor)) return null; }
  else {
    const widest = corridor(g, left, C_MAX, prev);
    if (open(widest)) { c = C_MAX; cor = widest; }
    else for (let lo = C_MIN, hi = C_MAX, k = 0; k < 8; k++) {
      const mid = (lo + hi) / 2, m = corridor(g, left, mid, prev);
      if (open(m)) { lo = mid; c = mid; cor = m; } else hi = mid;
    }
  }
  const path = pullFree(g.xs, cor.lo, cor.hi, refine);
  const angles = g.xs.map((x) => {
    let best = Infinity;
    for (let m = 0; m + 1 < path.length; m++) {
      const [x0, y0] = path[m], [x1, y1] = path[m + 1];
      if (x < x0 - 1e-12 || x > x1 + 1e-12) continue;
      best = Math.min(best, x1 === x0 ? Math.min(y0, y1) : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0));
    }
    return best;
  });
  return { path, angles, c };
}

/** Bloc regions of the half circle. `seats[i]` is seat i's place and `bands[i]` its region (regions in seat order, left
 *  to right on screen); `seatRadius` in unit radii. Coordinates: centre (cx, cy), unit radius `scale`. Below the
 *  baseline the chamber extends by a floor as deep as a seat plus a margin; angles past π or 0 map onto it. */
export function arcBlocRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx = 500, cy = 470, scale = 400): { regions: BlocRegion[]; lines: BlocLine[] } {
  const key = [seatRadius, cx, cy, scale, bands.join(','), seats.map((p) => `${p.x.toFixed(6)} ${p.y.toFixed(6)}`).join(',')].join('|');
  return remember(regionCache, key, () => routeRegions(seats, bands, seatRadius, cx, cy, scale));
}
function routeRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx: number, cy: number, scale: number): { regions: BlocRegion[]; lines: BlocLine[] } {
  const ids = [...new Set(bands)];
  if (!seats.length) return { regions: [], lines: [] };
  const band = bands.map((b) => ids.indexOf(b));
  const g = arcGeometry(seats, seatRadius), { depth, inner, outer } = g;
  const lines: BlocLine[] = [];
  const at = (a: number, q: number): Pt => {
    if (a > Math.PI) return [cx - q * scale, cy + Math.min((a - Math.PI) * q, depth) * scale];
    if (a < 0) return [cx + q * scale, cy + Math.min(-a * q, depth) * scale];
    return [cx + Math.cos(a) * q * scale, cy - Math.sin(a) * q * scale];
  };
  let prev: number[] | null = null;
  for (let j = 0; j < ids.length - 1; j++) {
    const routed: { path: Pt[]; angles: number[]; c: number } = routeLine(g, band.map((b) => b <= j), prev, undefined, true)!;
    const { path, c } = routed;
    prev = routed.angles;
    // to screen coordinates; long straight runs in log-polar are spiral arcs on screen, so sample them densely
    const screen: Pt[] = [];
    for (let m = 0; m < path.length; m++) {
      if (m === 0) { screen.push(at(path[0][1], Math.exp(path[0][0]))); continue; }
      const [x0, y0] = path[m - 1], [x1, y1] = path[m];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.01));
      for (let t = 1; t <= steps; t++) screen.push(at(y0 + ((y1 - y0) * t) / steps, Math.exp(x0 + ((x1 - x0) * t) / steps)));
    }
    lines.push({ after: ids[j], points: simplify(screen, 0.08), clearance: c * scale });
  }

  // regions: the previous boundary up (or the left floor), along the outer rim, this boundary down, along the inner rim
  const rim = (a: number, b: number, q: number): Pt[] => {
    const out: Pt[] = [];
    const steps = Math.max(1, Math.ceil(Math.abs(b - a) / 0.01));
    for (let t = 1; t < steps; t++) out.push(at(a + ((b - a) * t) / steps, q));
    return out;
  };
  const leftEdge: Pt[] = [at(Math.PI + depth / inner, inner), at(Math.PI + depth / outer, outer)];
  const rightEdge: Pt[] = [at(-depth / inner, inner), at(-depth / outer, outer)];
  const angleOf = (p: Pt, q: number) => {
    const [x, y] = p;
    if (y > cy + 1e-9) return x < cx ? Math.PI + (y - cy) / (q * scale) : -(y - cy) / (q * scale);
    return Math.atan2(cy - y, x - cx);
  };
  const regions = ids.map((id, j) => {
    const l = j === 0 ? leftEdge : lines[j - 1].points, r = j === ids.length - 1 ? rightEdge : lines[j].points;
    const polygon: Pt[] = [...l, ...rim(angleOf(l[l.length - 1], outer), angleOf(r[r.length - 1], outer), outer), ...[...r].reverse(), ...rim(angleOf(r[0], inner), angleOf(l[0], inner), inner)];
    return { band: id, fill: pathOf(polygon), polygon };
  });
  return { regions, lines };
}

/** Blocks: the tray's cell for seat i, filled column by column (`rows` rows, top to bottom, then the next column). */
export const TRAY = { cols: 20, rows: 6, pitch: 48, cell: 36, x0: 24, y0: 16, end: 28 } as const;
export function trayCell(i: number, rows: number = TRAY.rows): Pt {
  const col = Math.floor(i / rows), row = i % rows;
  return [TRAY.x0 + col * TRAY.pitch, TRAY.y0 + row * TRAY.pitch];
}
/** The tray for n seats: 20 × 6 up to 120 seats, the same drawing for every Knesset. A larger chamber (Rules allows
 *  up to 1000) adds rows and columns in about the same proportion, and the drawing grows to hold every seat. */
export function trayShape(n: number): { rows: number; cols: number; width: number; height: number } {
  const rows = Math.max(TRAY.rows, Math.ceil(Math.sqrt((n * TRAY.rows) / TRAY.cols)));
  const cols = Math.max(TRAY.cols, Math.ceil(n / rows));
  const size = (k: number, start: number) => start + (k - 1) * TRAY.pitch + TRAY.cell + TRAY.end;
  return { rows, cols, width: size(cols, TRAY.x0), height: size(rows, TRAY.y0) };
}

/** Bloc regions of the Blocks tray. Each boundary runs down the gap between two columns, steps once across a column
 *  where a bloc ends part-way down it, and continues down the next gap. The step's corners are rounded with the
 *  largest radius the row gap allows, keeping `C_MIN`-scaled clearance from the seats. */
export function trayBlocRegions(bands: number[], rows: number = trayShape(bands.length).rows): { regions: BlocRegion[]; lines: BlocLine[] } {
  const ids = [...new Set(bands)], n = bands.length;
  if (!n) return { regions: [], lines: [] };
  const { pitch, cell, x0, y0 } = TRAY;
  const cols = Math.ceil(n / rows), gap = pitch - cell, half = gap / 2;
  const top = y0 - half, bottom = y0 + (rows - 1) * pitch + cell + half;
  const gapX = (col: number) => x0 + col * pitch - half; // the gap left of column `col`
  const left = gapX(0), right = gapX(cols);
  const radius = half - 1.5; // stays 1.5 units off the seats
  const lines: BlocLine[] = [];
  for (let j = 0; j < ids.length - 1; j++) {
    const count = bands.filter((b) => ids.indexOf(b) <= j).length;
    const col = Math.floor(count / rows), k = count % rows;
    if (!k) { lines.push({ after: ids[j], points: [[gapX(col), top], [gapX(col), bottom]], clearance: half }); continue; }
    // down the gap right of column `col` for its first k seats, across under them, down the gap on its left
    const xa = gapX(col + 1), xb = gapX(col), ys = y0 + (k - 1) * pitch + cell + half;
    const arc = (cxp: number, cyp: number, from: number, to: number): Pt[] => Array.from({ length: 7 }, (_, t) => {
      const a = from + ((to - from) * t) / 6; return [cxp + radius * Math.cos(a), cyp + radius * Math.sin(a)];
    });
    lines.push({ after: ids[j], clearance: half - radius, points: [[xa, top],
      ...arc(xa - radius, ys - radius, 0, Math.PI / 2),
      ...arc(xb + radius, ys + radius, -Math.PI / 2, -Math.PI),
      [xb, bottom]] });
  }
  const regions = ids.map((id, j) => {
    const l: Pt[] = j === 0 ? [[left, top], [left, bottom]] : lines[j - 1].points;
    const r: Pt[] = j === ids.length - 1 ? [[right, top], [right, bottom]] : lines[j].points;
    // a bloc that ends part-way down the last column leaves the tray's empty cells outside every region
    const polygon: Pt[] = [...l, ...[...r].reverse()];
    return { band: id, fill: pathOf(polygon), polygon };
  });
  return { regions, lines };
}

/** Where each seat sits on the half circle when it is split into blocs. Today's order (by angle) makes every bloc a
 *  wedge, but a wedge's edge runs through seats in some rows, so the line between blocs has to weave around them.
 *  Instead, each boundary tries the lines that pass between seats in as many rows as possible (radial ones and ones
 *  that lean, in many positions); where such a line meets a seat, that seat goes to whichever side bends the line least,
 *  and every bloc keeps exactly its own number of seats. The candidates are scored by how much the routed line actually
 *  bends, and the straightest wins (today's wedge cut is always among them, so it is never worse than that). Within a
 *  bloc, seats are then filled by angle as before, so each list's seats stay together. `seats` are the chamber's places
 *  in its own order (arcLayout), `bands[i]` is seat i's bloc (non-decreasing in seat order). Returns, for seat i, the
 *  index of its place in `seats`. One bloc (or none): today's order. */
export function arcSeatSlots(seats: SeatPos[], bands: number[], seatRadius: number): number[] {
  // only the chamber and how many seats each bloc has matter, so edits inside a bloc reuse the answer
  const runs = bands.reduce<number[]>((acc, b, i) => { if (i && b === bands[i - 1]) acc[acc.length - 1]++; else acc.push(1); return acc; }, []);
  const key = [seats.length, seatRadius, runs.join(','), new Set(bands).size === runs.length].join('|');
  return remember(slotCache, key, () => placeSeats(seats, bands, seatRadius));
}
function placeSeats(seats: SeatPos[], bands: number[], seatRadius: number): number[] {
  const n = seats.length, ids = [...new Set(bands)], identity = seats.map((_, i) => i);
  if (ids.length < 2 || n !== bands.length) return identity;
  const g = arcGeometry(seats, seatRadius), R = g.radii.length;
  // per row, its places in chamber order (by angle, left to right on screen), and each place's position in its row
  const rows = g.radii.map((_, r) => identity.filter((i) => g.row[i] === r));
  const rank = identity.map((i) => rows[g.row[i]].indexOf(i));
  const us = g.radii.map(Math.log), mid = (us[0] + us[R - 1]) / 2;
  const rowSample = g.radii.map((q) => g.qs.indexOf(q));
  const half = g.radii.map((q) => Math.asin(Math.min(1, (seatRadius + C_TRY) / q)));
  const total = (j: number) => bands.filter((b) => ids.indexOf(b) <= j).length;
  const cuts: number[][] = []; // cuts[j][r]: how many of row r's places (from the left) belong to blocs ≤ j
  let prev: number[] | null = null;
  for (let j = 0; j < ids.length - 1; j++) {
    const need = total(j), prevCut = cuts[j - 1] ?? g.radii.map(() => 0);
    const before: number[] | null = prev;
    const prevRow: number[] | null = before ? rowSample.map((k) => before[k]) : null;
    const ideal = (seats[need - 1].a + seats[need].a) / 2; // today's wedge cut (`seats` is in chamber order)
    const candidates = new Map<string, { cut: number[]; order: number }>();
    const add = (cut: number[], order: number) => { const key = cut.join(','); if (!candidates.has(key)) candidates.set(key, { cut, order }); };
    add(rows.map((row) => row.filter((i) => i < need).length), -1);
    for (let si = -8; si <= 8; si++) for (let ti = -100; ti <= 100; ti++) {
      const s = si * 0.1, angle = us.map((u) => ideal + ti * 0.003 + s * (u - mid));
      let base = 0; const blocked: { r: number; diff: number }[] = [];
      const cut = rows.map((row, r) => {
        let k = 0, hit = -1;
        for (const i of row) { if (seats[i].a > angle[r]) k++; if (Math.abs(seats[i].a - angle[r]) < half[r]) hit = i; }
        if (hit >= 0) {
          if (seats[hit].a > angle[r]) k--;
          // how far the line must move to pass the seat on its right (seat kept left) minus on its left
          blocked.push({ r, diff: (angle[r] - (seats[hit].a - half[r])) - (seats[hit].a + half[r] - angle[r]) });
        }
        base += k; return k;
      });
      const leftCount = need - base;
      if (leftCount < 0 || leftCount > blocked.length) continue;
      blocked.sort((x, y) => x.diff - y.diff || x.r - y.r).slice(0, leftCount).forEach((b) => { cut[b.r]++; });
      if (cut.some((c, r) => c < prevCut[r])) continue;
      add(cut, Math.abs(si) * 1000 + Math.abs(ti));
    }
    // quick score: the string pulled through each row's gap only
    const quick: { cut: number[]; order: number; score: number }[] = [...candidates.values()].flatMap(({ cut, order }): { cut: number[]; order: number; score: number }[] => {
      const lo = cut.map((k, r) => (k < rows[r].length ? seats[rows[r][k]].a + half[r] : -g.depth / g.radii[r]));
      const hi: number[] = cut.map((k, r): number => Math.min(k > 0 ? seats[rows[r][k - 1]].a - half[r] : Math.PI + g.depth / g.radii[r], prevRow ? prevRow[r] : Infinity));
      if (lo.some((v, r) => v > hi[r])) return [];
      return [{ cut, order, score: R > 1 ? turning(pullFree(us, lo, hi)) : 0 }];
    }).sort((a, b) => a.score - b.score || a.order - b.order);
    // full score for the best few, and always for today's wedge cut: how much the routed line bends
    const shortlist: typeof quick = [...quick.slice(0, 6), ...quick.filter((c) => c.order === -1)].filter((c, i, all) => all.indexOf(c) === i);
    let best: { cut: number[]; angles: number[]; score: number; order: number } | null = null;
    for (const { cut, order } of shortlist) {
      const left = identity.map((i) => rank[i] < cut[g.row[i]]);
      const line: { path: Pt[]; angles: number[]; c: number } | null = routeLine(g, left, prev, C_TRY) ?? routeLine(g, left, prev, C_MIN);
      if (!line) continue;
      // bending, plus a charge for every change of direction: one clean step beats a wiggle
      const score: number = turning(line.path) + 0.2 * directionChanges(line.path, 0.03) + (line.c < C_TRY ? 0.3 : 0);
      if (!best || score < best.score - 1e-9 || (Math.abs(score - best.score) <= 1e-9 && order < best.order)) best = { cut, angles: line.angles, score, order };
    }
    if (!best) return identity;
    cuts.push(best.cut); prev = best.angles;
  }
  // each bloc's places, ordered by angle like the chamber, then filled by its seats in seat order
  if (cuts.some((cut, j) => cut.reduce((a, b) => a + b, 0) !== total(j) || cut.some((c, r) => c < (cuts[j - 1]?.[r] ?? 0)))) return identity;
  const slot = new Array<number>(n);
  ids.forEach((id, j) => {
    const places = rows.flatMap((row, r) => row.slice(j ? cuts[j - 1][r] : 0, j < cuts.length ? cuts[j][r] : row.length)).sort((a, b) => a - b);
    bands.flatMap((b, i) => (b === id ? [i] : [])).forEach((i, k) => { slot[i] = places[k]; });
  });
  return slot;
}
