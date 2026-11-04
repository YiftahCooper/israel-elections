// Pure geometry for the chamber diagram (no DOM), unit-tested.

export interface SeatPos { x: number; y: number; a: number }

/** Parliament arc: rows proportional to radius, seats ordered by angle so each list is a wedge. */
export function arcLayout(n: number): { seats: SeatPos[]; r: number } {
  if (n <= 0) return { seats: [], r: 0 };
  const rows = Math.max(1, Math.min(12, Math.round(Math.sqrt(n / 1.9))));
  const inner = 0.38;
  const radii = Array.from({ length: rows }, (_, i) => inner + ((1 - inner) * i) / Math.max(1, rows - 1));
  const tot = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((n * r) / tot));
  let left = n - counts.reduce((a, b) => a + b, 0);
  for (let i = rows - 1; left > 0; i = (i - 1 + rows) % rows) { counts[i]++; left--; }
  const seats: SeatPos[] = [];
  radii.forEach((r, i) => {
    const c = counts[i];
    for (let k = 0; k < c; k++) {
      const a = c === 1 ? Math.PI / 2 : Math.PI - (Math.PI * k) / (c - 1);
      seats.push({ x: r * Math.cos(a), y: -r * Math.sin(a), a });
    }
  });
  // Seats sharing an angle (each row's two ends, and the crown of odd rows) differ only by rounding noise in `a`;
  // ordering them by that noise interleaved neighbouring lists along the baseline. Equal angles are ordered left to
  // right on screen instead, so the last list's seats at the right end are the outermost and the first list's at the
  // left end are too.
  seats.sort((p, q) => (Math.abs(q.a - p.a) > 1e-9 ? q.a - p.a : p.x - q.x || Math.hypot(p.x, p.y) - Math.hypot(q.x, q.y)));
  const rowGap = rows > 1 ? (1 - inner) / (rows - 1) : 0.3;
  // seat radius: limited by row spacing, by spacing within the innermost row, and by an absolute cap
  return { seats, r: Math.min(rowGap * 0.42, (Math.PI * inner) / Math.max(1, counts[0]) * 0.45, 0.07) };
}

/** Where neighbouring bloc regions meet, row by row. `seats` are in seat order and `band[i]` is seat i's region index
 *  (non-decreasing). Boundary j separates regions ≤ j from regions > j: on each row it falls midway between the two
 *  sides' nearest seats, or at the row's end when one side has no seat there. Following the rows (rather than one
 *  straight radial cut) keeps every seat inside its own region even where rows interleave. `descending`: seat order
 *  runs from angle π to 0 (left to right on screen). Rows are returned inner to outer, as unit radii. */
export function bandCuts(seats: SeatPos[], band: number[], nBands: number, descending: boolean): { radii: number[]; cuts: number[][] } {
  const radius = (p: SeatPos) => Math.hypot(p.x, p.y);
  const radii: number[] = [];
  for (const p of seats) if (!radii.some((r) => Math.abs(r - radius(p)) < 1e-6)) radii.push(radius(p));
  radii.sort((a, b) => a - b);
  const row = seats.map((p) => radii.findIndex((r) => Math.abs(r - radius(p)) < 1e-6));
  const start = descending ? Math.PI : 0, end = descending ? 0 : Math.PI;
  const nearer = (x: number, y: number, towardsEnd: boolean) => ((descending === towardsEnd) ? Math.min(x, y) : Math.max(x, y));
  const cuts: number[][] = [];
  for (let j = 0; j < nBands - 1; j++) {
    cuts.push(radii.map((_, ri) => {
      let a: number | null = null, b: number | null = null;
      seats.forEach((p, i) => {
        if (row[i] !== ri) return;
        if (band[i] <= j) a = a === null ? p.a : nearer(a, p.a, true);
        else b = b === null ? p.a : nearer(b, p.a, false);
      });
      if (a !== null && b !== null) return (a + b) / 2;
      return a === null ? start : end;
    }));
  }
  return { radii, cuts };
}

/** Two side rails keep every list visible, with measured widths and evenly separated
 * baselines. SVG anchors use physical LTR coordinates independently of the page direction. */
export function placeLabels(items: { id: string; n: number; a: number; text: string; width?: number }[], cx: number, cy: number, R: number, scale = 1, bounds?: [number, number, number, number]) {
  const [left, top, right, bottom] = bounds ?? [cx - R - 400, 0, cx + R + 400, cy + 90];
  const placed: { id: string; n: number; text: string; x: number; y: number; anchor: 'start' | 'end' | 'middle'; box: [number, number, number, number] }[] = [];
  for (const side of [-1, 1]) {
    const rail = items.filter(it => (Math.cos(it.a) < 0 ? -1 : 1) === side).sort((a,b) => Math.sin(b.a) - Math.sin(a.a));
    const h = 30 * scale;
    rail.forEach((it, i) => {
      const w = Math.min(it.width ?? it.text.length * 24 * scale, (right - left) / 2 - R * 0.7 - 24);
      const y = top + 40 + i * Math.min(50, (bottom - top - 80) / Math.max(1, rail.length - 1));
      // Labels towards the crown can use more horizontal space without touching seats.
      const x = side < 0 ? left + 12 : right - 12;
      const anchor = side < 0 ? 'start' : 'end';
      const x0 = side < 0 ? x : x - w;
      placed.push({ ...it, x, y, anchor, box: [x0, y-h/2, x0+w, y+h/2] });
    });
  }
  return placed;
}

/** Shortest (taut) path through a corridor lo[k] ≤ t ≤ hi[k] sampled at equal steps: straight wherever it can be,
 *  bending only at a corridor corner. It starts with the constant value that fits longest, so a cut that can be one
 *  radial line is one. */
export function tautPath(lo: number[], hi: number[]): number[] {
  const n = lo.length, out = new Array<number>(n);
  let maxLo = -Infinity, minHi = Infinity;
  for (let k = 0; k < n && Math.max(maxLo, lo[k]) <= Math.min(minHi, hi[k]); k++) { maxLo = Math.max(maxLo, lo[k]); minHi = Math.min(minHi, hi[k]); }
  let x0 = 0, v0 = (maxLo + minHi) / 2;
  out[0] = v0;
  while (x0 < n - 1) {
    let smin = -Infinity, smax = Infinity, kmin = x0, kmax = x0, bend = -1, bendV = 0;
    for (let k = x0 + 1; k < n; k++) {
      const sl = (lo[k] - v0) / (k - x0), sh = (hi[k] - v0) / (k - x0);
      if (sl > smax + 1e-12) { bend = kmax; bendV = hi[kmax]; break; }
      if (sh < smin - 1e-12) { bend = kmin; bendV = lo[kmin]; break; }
      if (sl > smin) { smin = sl; kmin = k; }
      if (sh < smax) { smax = sh; kmax = k; }
    }
    if (bend < 0) { const sl = Math.min(Math.max(0, smin), smax); for (let i = x0 + 1; i < n; i++) out[i] = v0 + sl * (i - x0); break; }
    const sl = (bendV - v0) / (bend - x0);
    for (let i = x0 + 1; i <= bend; i++) out[i] = v0 + sl * (i - x0);
    x0 = bend; v0 = bendV;
  }
  return out;
}

/** Bloc regions behind the arc, fill only. `bands[i]` is seat i's region index (non-decreasing in seat order, which runs
 *  from angle π to 0). Each boundary between neighbouring regions is the taut path through the free space between the
 *  two sides' seats (with a small margin), so edges are smooth lines rather than one step per row, every seat lies
 *  wholly inside its own region and no region reaches another's seat. End seats sit on the baseline; below it the
 *  regions continue straight down to one shared floor, so the chamber's bottom edge is a single straight line.
 *  `polygon` is the outline in SVG coordinates (for tests); `fill` the path. */
export function annularRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx = 500, cy = 470, scale = 400) {
  const ids = [...new Set(bands)];
  if (!seats.length) return [] as { band: number; fill: string; polygon: [number, number][] }[];
  const radii = [...new Set(seats.map(p => Number(Math.hypot(p.x, p.y).toFixed(8))))].sort((a, b) => a - b);
  const inner = radii[0] - seatRadius - 0.015, outer = radii.at(-1)! + seatRadius + 0.015;
  const floor = (seatRadius + 0.015) * scale;
  const phi = floor / (inner * scale) + 0.02;
  const N = 24 * radii.length, rho = Array.from({ length: N + 1 }, (_, k) => inner + ((outer - inner) * k) / N);
  // at radius ρ, a circle of radius c centred at distance d covers angles a ± w (law of cosines)
  const halfWidth = (q: number, d: number, c: number) => {
    if (Math.abs(q - d) >= c) return null;
    return Math.acos(Math.max(-1, Math.min(1, (q * q + d * d - c * c) / (2 * q * d))));
  };
  const seatRows = seats.map(p => ({ a: p.a, d: Math.hypot(p.x, p.y) }));
  const margin = Math.min(0.012, seatRadius * 0.35);
  const corridor = (j: number, prev: number[] | null) => {
    const lo: number[] = [], hi: number[] = [];
    rho.forEach((q, k) => {
      const bound = (c: number) => {
        let l = -phi, h = Math.PI + phi;
        seatRows.forEach((p, i) => {
          const w = halfWidth(q, p.d, c); if (w === null) return;
          if (bands[i] <= ids[j]) h = Math.min(h, p.a - w); else l = Math.max(l, p.a + w);
        });
        return [l, h];
      };
      let [l, h] = bound(seatRadius + margin);
      if (l > h) [l, h] = bound(seatRadius);
      if (prev) h = Math.min(h, prev[k]);
      if (l > h) l = h = (l + h) / 2;
      lo.push(l); hi.push(h);
    });
    return { lo, hi };
  };
  const cuts: number[][] = [];
  for (let j = 0; j < ids.length - 1; j++) { const { lo, hi } = corridor(j, cuts[j - 1] ?? null); cuts.push(tautPath(lo, hi)); }
  // polar inside [0, π]; beyond either end the region runs straight down beneath the baseline, to the floor
  const at = (a: number, q: number): [number, number] => {
    if (a > Math.PI) return [cx - q * scale, cy + Math.min((a - Math.PI) * q * scale, floor)];
    if (a < 0) return [cx + q * scale, cy + Math.min(-a * q * scale, floor)];
    return [cx + Math.cos(a) * q * scale, cy - Math.sin(a) * q * scale];
  };
  const f = (v: number) => Number(v.toFixed(2));
  return ids.map((band, j) => {
    const left = j === 0 ? rho.map(() => Math.PI + phi) : cuts[j - 1];
    const right = j === ids.length - 1 ? rho.map(() => -phi) : cuts[j];
    const polygon: [number, number][] = [];
    let d = '';
    const move = (p: [number, number]) => { polygon.push(p); d += `${d ? ' L' : 'M'} ${f(p[0])} ${f(p[1])}`; };
    // along a row edge (constant ρ) from angle a to b: straight below the baseline, an arc above it
    const edge = (a: number, b: number, q: number) => {
      const stops = [a, ...[Math.PI, 0].filter(t => (a - t) * (b - t) < 0), b];
      for (let i = 1; i < stops.length; i++) {
        const s0 = stops[i - 1], s1 = stops[i];
        const mid = (s0 + s1) / 2;
        if (mid > Math.PI || mid < 0) { move(at(s1, q)); continue; }
        const steps = Math.max(1, Math.ceil(Math.abs(s1 - s0) / 0.02));
        for (let t = 1; t <= steps; t++) polygon.push(at(s0 + ((s1 - s0) * t) / steps, q));
        const p = at(s1, q);
        d += ` A ${f(q * scale)} ${f(q * scale)} 0 0 ${s1 < s0 ? 1 : 0} ${f(p[0])} ${f(p[1])}`;
      }
    };
    rho.forEach((q, k) => move(at(left[k], q)));
    edge(left[N], right[N], outer);
    for (let k = N; k >= 0; k--) move(at(right[k], rho[k]));
    edge(right[0], left[0], inner);
    return { band, fill: d + ' Z', polygon };
  });
}
