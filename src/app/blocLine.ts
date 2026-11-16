// The line between blocs on the seat chart: pure geometry (no DOM), unit-tested in tests/bloc-line.test.ts.
//
// Half circle. Each boundary keeps every seat of the earlier blocs on its left (larger angle) and every later seat on its
// right, and runs in the middle between the two sides' seats wherever it can. It is worked out in log-polar coordinates
// (ln r, angle), a conformal map of the fan, where a straight run is a radial line or a gentle spiral:
//  1. a least-squares fit through the corridor the seats leave free, pulled to the middle of the gap at every row and
//     kept from bending or leaning more than it must (seats are placed, bloc by bloc, where that fit is best);
//  2. where it runs along the rows (between a small bloc at an end and its neighbour) it is moved to the middle of the
//     gap between the rows;
//  3. small wiggles are ironed out and its corners rounded, wherever that keeps every seat on its side and clear.
// Every step is checked: a step that would put a seat on the wrong side or too close is not taken.
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

/** Rounds a polyline's corners (Chaikin's corner cutting, a few times over), cutting at most `cut` from each corner, so
 *  a straight run stays straight and only the corner itself becomes a curve. A corner whose cut would come too close to
 *  something (`clear` says no) is cut less, or left as it is. */
export function roundCorners(pts: Pt[], cut: number, times = 3, clear: (a: Pt, b: Pt) => boolean = () => true): Pt[] {
  let p = pts;
  for (let k = 0; k < times; k++) {
    const out: Pt[] = [p[0]];
    for (let i = 1; i + 1 < p.length; i++) {
      const [ax, ay] = p[i - 1], [bx, by] = p[i], [cx, cy] = p[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by);
      let done = false;
      // the new points lie on the old segments, so only the new short segment between them needs checking
      for (let f = 1; f >= 0.25 && !done && l1 && l2; f /= 2) {
        const d1 = Math.min(cut * f, l1 / 4), d2 = Math.min(cut * f, l2 / 4);
        const u: Pt = [bx + ((ax - bx) * d1) / l1, by + ((ay - by) * d1) / l1], v: Pt = [bx + ((cx - bx) * d2) / l2, by + ((cy - by) * d2) / l2];
        if (clear(u, v)) { out.push(u, v); done = true; }
      }
      if (!done) out.push([bx, by]);
    }
    out.push(p[p.length - 1]);
    p = out;
    cut /= 2;
  }
  return p;
}

/** Irons out small wiggles: each point moves part of the way towards the middle of its neighbours, where that keeps
 *  the line clear (`clear` checks a segment) and inside (`keep` says whether a point may sit there). Ends stay put. */
export function smoothLine(pts: Pt[], rounds: number, clear: (a: Pt, b: Pt) => boolean, keep: (p: Pt) => boolean = () => true): Pt[] {
  const p = pts.map((q): Pt => [q[0], q[1]]);
  for (let r = 0; r < rounds; r++) {
    for (let i = 1; i + 1 < p.length; i++) {
      const m: Pt = [(p[i - 1][0] + p[i + 1][0]) / 2, (p[i - 1][1] + p[i + 1][1]) / 2];
      for (const f of [0.5, 0.25]) {
        const q: Pt = [p[i][0] + (m[0] - p[i][0]) * f, p[i][1] + (m[1] - p[i][1]) * f];
        if (keep(q) && clear(p[i - 1], q) && clear(q, p[i + 1])) { p[i] = q; break; }
      }
    }
  }
  return p;
}
/** A polyline with points about `step` apart (each segment cut into equal pieces). */
function resample(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let t = 1; t <= n; t++) out.push([x0 + ((x1 - x0) * t) / n, y0 + ((y1 - y0) * t) / n]);
  }
  return out;
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
  });
  // where both sides' seats face each other at this radius, the middle between them (before the previous line's cap)
  const mid = g.qs.map((q, k) => (g.radii.includes(q) && lo[k] > g.floorLo[k] + 1e-12 && hi[k] < g.floorHi[k] - 1e-12 && lo[k] <= hi[k] ? (lo[k] + hi[k]) / 2 : null));
  const gap = g.qs.map((_, k) => hi[k] - lo[k]);
  if (prev) g.qs.forEach((_, k) => { hi[k] = Math.min(hi[k], prev[k]); });
  return { lo, hi, mid, gap };
}
const open = ({ lo, hi }: { lo: number[]; hi: number[] }) =>
  lo.every((v, k) => v <= hi[k] && (k === 0 || Math.max(v, lo[k - 1]) <= Math.min(hi[k], hi[k - 1])));

/** A symmetric banded matrix (half-bandwidth `w`) for small least-squares problems: `a[i][d]` is entry (i, i + d). */
class Banded {
  a: Float64Array[]; b: Float64Array;
  constructor(public n: number, public w: number) { this.a = Array.from({ length: n }, () => new Float64Array(w + 1)); this.b = new Float64Array(n); }
  /** adds weight · (Σ c_j θ_{i_j} − t)² to the energy */
  add(idx: number[], c: number[], weight: number, t = 0) {
    for (let p = 0; p < idx.length; p++) {
      this.b[idx[p]] += weight * c[p] * t;
      for (let q = 0; q < idx.length; q++) {
        const i = idx[p], j = idx[q];
        if (j >= i) this.a[i][j - i] += weight * c[p] * c[q];
      }
    }
  }
  clone() { const m = new Banded(this.n, this.w); this.a.forEach((r, i) => m.a[i].set(r)); m.b.set(this.b); return m; }
  /** Cholesky solve (the matrix is positive definite: every problem adds a small pull towards a reference). */
  solve(): Float64Array {
    const { n, w } = this, L = this.a.map((r) => Float64Array.from(r)), y = Float64Array.from(this.b);
    for (let i = 0; i < n; i++) {
      for (let d = 0; d <= w && i + d < n; d++) {
        let v = L[i][d];
        for (let k = Math.max(0, i + d - w); k < i; k++) v -= L[k][i - k] * L[k][i + d - k] * L[k][0];
        if (d === 0) L[i][0] = v; else L[i][d] = v / L[i][0];
      }
    }
    // L stored as unit lower (in the off-diagonals, transposed) with the diagonal D in L[i][0]
    for (let i = 0; i < n; i++) for (let k = Math.max(0, i - w); k < i; k++) y[i] -= L[k][i - k] * y[k];
    for (let i = 0; i < n; i++) y[i] /= L[i][0];
    for (let i = n - 1; i >= 0; i--) for (let d = 1; d <= w && i + d < n; d++) y[i] -= L[i][d] * y[i + d];
    return y;
  }
}

/** How the line between two blocs is drawn (owner, 16 Nov 2026): in the middle between the two blocs' seats wherever it
 *  can be, bending (with a curve) where it has to. The line is a function θ(u) of u = ln(radius), solved as a smooth
 *  least-squares fit on `NODES` evenly spaced nodes: pulled towards the middle of the gap at every radius where seats
 *  of both sides face each other, held straight and nearly radial everywhere, and never closer to a seat than the
 *  corridor allows. */
const W_ROW = 1, NODES = 96, W_MID = 0.1, W_BEND = 2e-4, W_LEAN = 4e-3;
export function centreLine(xs: number[], lo: number[], hi: number[], mid: (number | null)[], gap: number[]): { angles: number[]; energy: number } {
  const n = NODES, x0 = xs[0], x1 = xs[xs.length - 1], h = (x1 - x0) / (n - 1);
  const node = (x: number): [number, number] => { const f = Math.min(n - 1.000001, Math.max(0, (x - x0) / h)), j = Math.floor(f); return [j, f - j]; };
  const m = new Banded(n, 2);
  // a weak pull towards the corridor's overall middle keeps the problem well posed where nothing else holds the line
  const free = (Math.max(...lo) + Math.min(...hi)) / 2;
  for (let j = 0; j < n; j++) m.add([j], [1], 1e-6, Number.isFinite(free) ? free : Math.PI / 2);
  for (let j = 1; j + 1 < n; j++) m.add([j - 1, j, j + 1], [1, -2, 1], W_BEND / h ** 3);
  for (let j = 0; j + 1 < n; j++) m.add([j, j + 1], [-1, 1], W_LEAN / h);
  xs.forEach((x, k) => {
    if (mid[k] === null) return;
    const [j, t] = node(x), dx = W_ROW;
    // being off-centre is measured against the gap's width, so narrow gaps (where the seats are widest) count most
    m.add([j, j + 1], [1 - t, t], (W_MID * dx) / Math.max(1e-4, gap[k]) ** 2, mid[k]!);
  });
  const at = (th: Float64Array) => xs.map((x) => { const [j, t] = node(x); return th[j] * (1 - t) + th[j + 1] * t; });
  // keep inside the corridor: samples that stray are held at their bound, until none strays
  const held = new Map<number, number>();
  let th = m.solve(), angles = at(th);
  const P = 1e4 / h;
  for (let round = 0; round < 40; round++) {
    let more = false;
    angles.forEach((v, k) => {
      const bound = v < lo[k] - 1e-6 ? lo[k] : v > hi[k] + 1e-6 ? hi[k] : null;
      if (bound === null) return;
      if (held.get(k) === bound) return;
      held.set(k, bound); more = true;
    });
    if (!more) break;
    const c = m.clone();
    for (const [k, bound] of held) { const [j, t] = node(xs[k]); c.add([j, j + 1], [1 - t, t], P, bound); }
    th = c.solve(); angles = at(th);
  }
  angles = angles.map((v, k) => Math.max(lo[k], Math.min(hi[k], v)));
  // the energy the fit leaves, for comparing ways of seating the blocs: off-centre, bent and leaning, as fitted
  let energy = 0;
  for (let j = 1; j + 1 < n; j++) energy += (W_BEND / h ** 3) * (th[j - 1] - 2 * th[j] + th[j + 1]) ** 2;
  for (let j = 0; j + 1 < n; j++) energy += (W_LEAN / h) * (th[j + 1] - th[j]) ** 2;
  xs.forEach((_, k) => { if (mid[k] !== null) energy += (W_MID * W_ROW) / Math.max(1e-4, gap[k]) ** 2 * (angles[k] - mid[k]!) ** 2; });
  return { angles, energy };
}

/** Route one boundary. With `c`, at that clearance only (null when the corridor is closed); without, at the widest
 *  clearance that leaves the corridor open (binary search; the narrowest always fits). Returns the path in
 *  (ln radius, angle), the line's angle at every sample radius (its leftmost where it jogs) and the clearance. */
function routeLine(g: Arc, left: boolean[], prev: number[] | null, fixed?: number): { path: Pt[]; angles: number[]; c: number; energy: number; lo: number[]; hi: number[] } | null {
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
  const { angles, energy } = centreLine(g.xs, cor.lo, cor.hi, cor.mid, cor.gap);
  const path: Pt[] = g.xs.map((x, k) => [x, angles[k]]);
  return { path, angles, c, energy, lo: cor.lo, hi: cor.hi };
}

/** The chamber's outline in unit coordinates (y down, baseline y = 0): a point's radius and angle, with the floor below
 *  the baseline mapped as in `arcGeometry` (angles past π or 0). */
const polar = ([x, y]: Pt): [number, number] => (y > 0 ? [Math.abs(x), x < 0 ? Math.PI + y / Math.abs(x) : -y / Math.abs(x)] : [Math.hypot(x, y), Math.atan2(-y, x)]);
/** Keeps a point inside the chamber: the half ring and, below the baseline, its two floors. */
function inChamber([x, y]: Pt, g: Arc): Pt {
  if (y > 0) {
    const ax = Math.min(g.outer, Math.max(g.inner, Math.abs(x))) * (x < 0 ? -1 : 1);
    return [ax, Math.min(y, g.depth)];
  }
  const q = Math.hypot(x, y) || 1e-9, k = Math.min(g.outer, Math.max(g.inner, q)) / q;
  return [x * k, y * k];
}
/** The nearest point of the chamber's inner (`rim` = inner) or outer edge, the floor's bottom included. */
function onRim([x, y]: Pt, g: Arc, rim: number): Pt {
  const side = x < 0 ? -1 : 1, options: Pt[] = [];
  if (y <= 0) { const q = Math.hypot(x, y) || 1e-9; options.push([(x * rim) / q, (y * rim) / q]); } else options.push([side * rim, Math.min(y, g.depth)]);
  options.push([side * Math.min(g.outer, Math.max(g.inner, Math.abs(x))), g.depth]);
  if (y > 0) options.push([side * rim, 0]);
  return options.reduce((a, b) => (Math.hypot(a[0] - x, a[1] - y) <= Math.hypot(b[0] - x, b[1] - y) ? a : b));
}
const RELAX_POINTS = 72, RELAX_ROUNDS = 120, RELAX_SMOOTH = 0.5, RELAX_PASSES = 8, RELAX_CENTRE = 0.06;
/** Moves a valid line towards the middle between the two sides' seats in every direction, including where it runs along
 *  the rows (between a small bloc at an end and its neighbour): each point is pulled to where it is as far from the
 *  nearest seat on one side as from the nearest on the other, while the line is kept smooth (its corners round off) and
 *  at least `c` from every seat. Unit coordinates; `left[i]`: seat i is on the line's first side. */
export function relaxLine(g: Arc, left: boolean[], c: number, init: Pt[]): Pt[] {
  const resample = (pts: Pt[]): Pt[] => {
    const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = d[d.length - 1] || 1, out: Pt[] = [];
    for (let k = 0, i = 0; k < RELAX_POINTS; k++) {
      const t = (total * k) / (RELAX_POINTS - 1);
      while (i + 1 < pts.length - 1 && d[i + 1] < t) i++;
      const f = d[i + 1] > d[i] ? (t - d[i]) / (d[i + 1] - d[i]) : 0;
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
    }
    return out;
  };
  const S = g.seats, rr = g.rad + c * 1.1 + 0.0004; // a hair more than asked, so the straight bits between points keep it too
  const nearest = (p: Pt, side: boolean): [number, Pt] => {
    let best = Infinity, dir: Pt = [0, 0];
    S.forEach((st, i) => {
      if (left[i] !== side) return;
      const dx = p[0] - st.x, dy = p[1] - st.y, d = Math.hypot(dx, dy);
      if (d - g.rad < best) { best = d - g.rad; dir = d > 1e-9 ? [dx / d, dy / d] : [0, -1]; }
    });
    return [best, dir];
  };
  const clear = (p: Pt): Pt => {
    let q = p;
    for (let round = 0; round < 3; round++) for (const st of S) {
      const dx = q[0] - st.x, dy = q[1] - st.y;
      if (Math.abs(dx) >= rr || Math.abs(dy) >= rr) continue;
      const d = Math.hypot(dx, dy);
      if (d < rr) q = d > 1e-9 ? [st.x + (dx / d) * rr, st.y + (dy / d) * rr] : [st.x, st.y - rr];
    }
    return q;
  };
  let P = resample(init);
  const fix = (q: Pt, i: number, n: number): Pt => { q = clear(inChamber(q, g)); return i === 0 ? onRim(q, g, g.inner) : i + 1 === n ? onRim(q, g, g.outer) : q; };
  // The first fit already runs midway between the seats of each row wherever the line crosses the rows; only the
  // stretches that run along the rows (between a small end bloc and its neighbour) need to move, to midway between the
  // two rows. So each point moves by how much its stretch runs along the rows rather than across them (0 to 1, judged
  // on the first fit), and only along the radius (sideways in the floor).
  const radial = ([x, y]: Pt): Pt => { if (y > 0) return [x < 0 ? -1 : 1, 0]; const d = Math.hypot(x, y) || 1; return [x / d, y / d]; };
  const sideways = P.map((p, i) => {
    const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 2)], t: Pt = [b[0] - a[0], b[1] - a[1]], u = radial(p);
    const c = Math.abs(t[0] * u[0] + t[1] * u[1]) / (Math.hypot(t[0], t[1]) || 1); // |cos| of the angle to the radius
    return Math.max(0, Math.min(1, (0.75 - c) / 0.5));
  });
  const weight = sideways.map((_, i) => Math.max(...sideways.slice(Math.max(0, i - 3), i + 4)));
  if (!weight.some((w) => w > 0)) return P;
  const along = (p: Pt, d: Pt, w: number): Pt => { const u = radial(p), k = (d[0] * u[0] + d[1] * u[1]) * w; return [p[0] + k * u[0], p[1] + k * u[1]]; };
  for (let round = 0; round < RELAX_ROUNDS; round++) {
    // towards the middle between the nearest seats of the two sides
    P = P.map((p, i): Pt => {
      if (!weight[i]) return p;
      const [dA, gA] = nearest(p, true), [dB, gB] = nearest(p, false);
      const v: Pt = [gA[0] - gB[0], gA[1] - gB[1]], len = Math.hypot(v[0], v[1]);
      if (!(len > 1e-6 && Number.isFinite(dA) && Number.isFinite(dB))) return p;
      const step = Math.max(-0.01, Math.min(0.01, (RELAX_CENTRE * (dB - dA)) / len));
      return fix(along(p, [(step * v[0]) / len, (step * v[1]) / len], weight[i]), i, P.length);
    });
    // then smooth: each point towards the middle of its neighbours, several times, so ripples and corners even out
    for (let pass = 0; pass < RELAX_PASSES; pass++) P = P.map((p, i): Pt => (i === 0 || i + 1 === P.length || !weight[i] ? p
      : fix(along(p, [RELAX_SMOOTH * ((P[i - 1][0] + P[i + 1][0]) / 2 - p[0]), RELAX_SMOOTH * ((P[i - 1][1] + P[i + 1][1]) / 2 - p[1])], weight[i]), i, P.length)));
  }
  return P.map((p, i) => (i === 0 ? onRim(p, g, g.inner) : i + 1 === P.length ? onRim(p, g, g.outer) : clear(inChamber(p, g))));
}
/** True when every seat of the first side lies inside the region left of the line, every other seat outside it, and no
 *  seat comes closer to the line than `c` (less a hair). Unit coordinates. */
/** A point's distance from a segment. */
function segDistance(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l)) : 0;
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}
function keepsSides(g: Arc, left: boolean[], c: number, pts: Pt[]): boolean {
  const toward = (a: number, b: number, q: number): Pt[] => Array.from({ length: 41 }, (_, t) => {
    const v = a + ((b - a) * t) / 40;
    return v > Math.PI ? [-q, Math.min((v - Math.PI) * q, g.depth)] : v < 0 ? [q, Math.min(-v * q, g.depth)] : [q * Math.cos(v), -q * Math.sin(v)];
  });
  const end = polar(pts[pts.length - 1]), start = polar(pts[0]);
  const poly: Pt[] = [...pts, ...toward(end[1], Math.PI + g.depth / g.outer, g.outer), ...toward(Math.PI + g.depth / g.inner, start[1], g.inner)];
  const inside = (x: number, y: number) => {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };
  return g.seats.every((st, i) => {
    if (inside(st.x, st.y) !== left[i]) return false;
    for (let k = 0; k + 1 < pts.length; k++) if (segDistance(st.x, st.y, pts[k], pts[k + 1]) < g.rad + c - 0.0005) return false;
    return true;
  });
}
/** A line's angle at each sample radius (the smallest where it crosses a radius more than once), for the next line. */
function anglesOf(g: Arc, pts: Pt[], fallback: number[]): number[] {
  const pq = pts.map(polar);
  return g.qs.map((q, k) => {
    let best = Infinity;
    for (let i = 0; i + 1 < pq.length; i++) {
      const [q0, a0] = pq[i], [q1, a1] = pq[i + 1];
      if ((q - q0) * (q - q1) > 0 || q0 === q1) { if (Math.abs(q0 - q) < 1e-9) best = Math.min(best, a0); continue; }
      best = Math.min(best, a0 + ((a1 - a0) * (q - q0)) / (q1 - q0));
    }
    return Number.isFinite(best) ? best : fallback[k];
  });
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
    const left = band.map((b) => b <= j);
    const routed: NonNullable<ReturnType<typeof routeLine>> = routeLine(g, left, prev)!;
    const { c } = routed;
    // Where one side has no seat left at all, the line only runs between the other side's seats and the chamber's
    // edge, under a row's last seat (a bloc of a few seats at an end). That stretch is cut off: the line drops straight
    // to the floor's bottom edge and ends (or starts) there.
    const K = g.qs.length, a = routed.angles;
    const rowBoth = g.radii.map((_, r) => g.seats.some((_, i) => g.row[i] === r && left[i]) && g.seats.some((_, i) => g.row[i] === r && !left[i]));
    const r0 = rowBoth.indexOf(true), r1 = rowBoth.lastIndexOf(true);
    // only where the line really runs under those rows' last seats, in the floor
    const inFloor = (r: number) => { const k = g.qs.indexOf(g.radii[r]); return a[k] < 0 || a[k] > Math.PI; };
    let from = 0, to = K - 1;
    if (r0 > 0 && g.radii.slice(0, r0).every((_, r) => inFloor(r))) { const edge = g.radii[r0] - g.rad - c; from = Math.max(0, g.qs.findIndex((q) => q >= edge) - 1); }
    if (r1 >= 0 && r1 < g.radii.length - 1 && g.radii.slice(r1 + 1).every((_, r) => inFloor(r1 + 1 + r))) { const edge = g.radii[r1] + g.rad + c; to = Math.min(K - 1, g.qs.findIndex((q) => q > edge)); }
    const floorAt = (k: number) => (a[k] < Math.PI / 2 ? g.floorLo[k] : g.floorHi[k]);
    // in unit coordinates; long straight runs in log-polar are spiral arcs on screen, so sample them densely
    const atUnit = (an: number, q: number): Pt => { const [x, y] = at(an, q); return [(x - cx) / scale, (y - cy) / scale]; };
    const toUnit = (from: number, to: number): Pt[] => {
      const path: Pt[] = g.xs.slice(from, to + 1).map((x, i) => [x, a[from + i]]);
      if (from > 0) path[0] = [g.xs[from], floorAt(from)];
      if (to < K - 1) path[path.length - 1] = [g.xs[to], floorAt(to)];
      const unit: Pt[] = [atUnit(path[0][1], Math.exp(path[0][0]))];
      for (let m = 1; m < path.length; m++) {
        const [x0, y0] = path[m - 1], [x1, y1] = path[m];
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.01));
        for (let t = 1; t <= steps; t++) unit.push(atUnit(y0 + ((y1 - y0) * t) / steps, Math.exp(x0 + ((x1 - x0) * t) / steps)));
      }
      return unit;
    };
    const clearOf = (u: Pt, v: Pt) => g.seats.every((st) => segDistance(st.x, st.y, u, v) >= g.rad + c + 0.0002);
    const inside = (q: Pt) => { const [x, y] = inChamber(q, g); return Math.abs(x - q[0]) < 1e-9 && Math.abs(y - q[1]) < 1e-9; };
    const finish = (base: Pt[]): { line: Pt[]; angles: number[] } | null => {
      // towards the middle where it runs along the rows; kept only if it stays clear of the previous line
      const relaxed = relaxLine(g, left, c, base);
      const angles = anglesOf(g, relaxed, routed.angles);
      const ok = (!prev || angles.every((v, k) => v <= prev![k] + 1e-9)) && keepsSides(g, left, c, relaxed);
      const chosen = ok ? relaxed : base;
      // last, small wiggles are ironed out and its corners rounded off (cutting up to about a seat and a half),
      // wherever that keeps every seat on its side and clear of it
      const smooth = smoothLine(resample(chosen, g.rad / 2), 12, clearOf, inside);
      const round = roundCorners(simplify(smooth, 0.0004), g.rad * 1.6, 4, clearOf);
      const line = [round, smooth, chosen].find((p) => keepsSides(g, left, c, p));
      return line ? { line, angles: ok ? angles : routed.angles } : null;
    };
    // the cut is kept only where the line, drop and all, stays clear of the seats (the drop moved a little further out
    // if it must)
    let done: { line: Pt[]; angles: number[] } | null = null;
    if (from > 0 || to < K - 1) for (const shift of [0, 3, 6, 12]) if ((done = finish(toUnit(from > 0 ? Math.max(1, from - shift) : 0, to < K - 1 ? Math.min(K - 2, to + shift) : K - 1)))) break;
    done ??= finish(toUnit(0, K - 1));
    const final = done?.line ?? toUnit(0, K - 1);
    prev = done?.angles ?? routed.angles;
    lines.push({ after: ids[j], points: simplify(final.map(([x, y]): Pt => [cx + x * scale, cy + y * scale]), 0.08), clearance: c * scale });
  }

  // regions: the previous boundary up (or the left floor), along the outer rim, this boundary down, along the inner rim
  const rim = (a: number, b: number, q: number): Pt[] => {
    const out: Pt[] = [];
    const steps = Math.max(1, Math.ceil(Math.abs(b - a) / 0.01));
    // up to and including the far end, so a line that ends on the floor's bottom edge meets the chamber's corner
    for (let t = 1; t <= steps; t++) out.push(at(a + ((b - a) * t) / steps, q));
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
/** True when the true entries are one unbroken run (or there are none). */
const oneRun = (xs: boolean[]) => { const a = xs.indexOf(true), b = xs.lastIndexOf(true); return a < 0 || xs.slice(a, b + 1).every(Boolean); };
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
      // the rows that hold this bloc, and the rows that hold the blocs after it, must each be one run: a bloc that
      // skips a row in the middle makes the line dive between rows and come back
      if (!oneRun(cut.map((c, r) => c > prevCut[r])) || !oneRun(cut.map((c, r) => c < rows[r].length))) continue;
      add(cut, Math.abs(si) * 1000 + Math.abs(ti));
    }
    // quick score: the string pulled through each row's gap only
    const quick: { cut: number[]; order: number; score: number }[] = [...candidates.values()].flatMap(({ cut, order }): { cut: number[]; order: number; score: number }[] => {
      const lo = cut.map((k, r) => (k < rows[r].length ? seats[rows[r][k]].a + half[r] : -g.depth / g.radii[r]));
      const hi: number[] = cut.map((k, r): number => Math.min(k > 0 ? seats[rows[r][k - 1]].a - half[r] : Math.PI + g.depth / g.radii[r], prevRow ? prevRow[r] : Infinity));
      if (lo.some((v, r) => v > hi[r])) return [];
      const mids = cut.map((k, r) => (k > 0 && k < rows[r].length ? (lo[r] + hi[r]) / 2 : null));
      return [{ cut, order, score: R > 1 ? centreLine(us, lo, hi, mids, lo.map((v, r) => hi[r] - v)).energy : 0 }];
    }).sort((a, b) => a.score - b.score || a.order - b.order);
    // full score for the best few, and always for today's wedge cut: how much the routed line bends
    const shortlist: typeof quick = [...quick.slice(0, 6), ...quick.filter((c) => c.order === -1)].filter((c, i, all) => all.indexOf(c) === i);
    let best: { cut: number[]; angles: number[]; score: number; order: number } | null = null;
    for (const { cut, order } of shortlist) {
      const left = identity.map((i) => rank[i] < cut[g.row[i]]);
      const line: { path: Pt[]; angles: number[]; c: number; energy: number } | null = routeLine(g, left, prev, C_TRY) ?? routeLine(g, left, prev, C_MIN);
      if (!line) continue;
      // bending, plus a charge for every change of direction: one clean step beats a wiggle
      const score: number = line.energy * (line.c < C_TRY ? 1.5 : 1);
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
