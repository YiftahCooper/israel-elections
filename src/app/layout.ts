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

/** Shared annular row sectors. Prefer a radial cut when the whole seat discs allow it;
 * otherwise step only in the empty space halfway between rows. Never trace seat circles.
 * Angle sorting follows the standard parliament-chart approach (d3-parliament); retaining
 * fixed seat positions also handles one-seat blocs and ties at the baseline honestly.
 * Adjacent regions reuse exactly the same cuts, including the extensions below the baseline. */
export function annularRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx = 500, cy = 470, scale = 400) {
  const ids = [...new Set(bands)];
  if (!seats.length) return [] as { band: number; fill: string; polygon: [number, number][]; leftAngles: number[]; rightAngles: number[] }[];
  const { radii, cuts } = bandCuts(seats, bands.map(b => ids.indexOf(b)), ids.length, true);
  const inner = radii[0] - seatRadius - 0.015, outer = radii.at(-1)! + seatRadius + 0.015;
  const floor = (seatRadius + 0.015) * scale;
  const phi = floor / (inner * scale) + 0.02;
  const edges = [inner, ...radii.slice(1).map((r, i) => (r + radii[i]) / 2), outer];
  cuts.forEach((cut, j) => {
    let lo = -phi, hi = Math.PI + phi;
    seats.forEach((p, i) => {
      const width = Math.asin((seatRadius + 0.003) / Math.hypot(p.x, p.y));
      if (ids.indexOf(bands[i]) <= j) hi = Math.min(hi, p.a - width);
      else lo = Math.max(lo, p.a + width);
    });
    if (j > 0) hi = Math.min(hi, ...cuts[j-1]);
    if (lo <= hi) cut.fill((lo + hi) / 2);
    else {
      // Merge the longest consecutive run of rows that admits one radial cut. A
      // step is necessary only when the next row's seat envelopes truly conflict.
      const intervals = radii.map((radius, ri) => {
        let low = -phi, high = Math.PI + phi;
        seats.forEach((p, i) => {
          if (Math.abs(Math.hypot(p.x, p.y) - radius) > 1e-6) return;
          const width = Math.asin((seatRadius + 0.003) / radius);
          if (ids.indexOf(bands[i]) <= j) high = Math.min(high, p.a - width);
          else low = Math.max(low, p.a + width);
        });
        if (j > 0) high = Math.min(high, cuts[j-1][ri]);
        return [low, high];
      });
      let start = 0;
      while (start < radii.length) {
        let end = start + 1, low = intervals[start][0], high = intervals[start][1];
        while (end < radii.length && Math.max(low, intervals[end][0]) <= Math.min(high, intervals[end][1])) {
          low = Math.max(low, intervals[end][0]); high = Math.min(high, intervals[end][1]); end++;
        }
        cut.fill((low + high) / 2, start, end);
        start = end;
      }
    }
  });
  const at = (a: number, q: number): [number, number] => {
    if (a > Math.PI) return [cx - q * scale, cy + Math.min((a - Math.PI) * q * scale, floor)];
    if (a < 0) return [cx + q * scale, cy + Math.min(-a * q * scale, floor)];
    return [cx + Math.cos(a) * q * scale, cy - Math.sin(a) * q * scale];
  };
  const f = (v: number) => Number(v.toFixed(6));
  return ids.map((band, j) => {
    const left = j === 0 ? radii.map(() => Math.PI + phi) : cuts[j - 1];
    const right = j === ids.length - 1 ? radii.map(() => -phi) : cuts[j];
    const polygon: [number, number][] = [];
    let d = '';
    const move = (a: number, q: number) => { const p = at(a, q); polygon.push(p); d += `${d ? ' L' : 'M'} ${f(p[0])} ${f(p[1])}`; };
    const edge = (a: number, b: number, q: number) => {
      if (a === b) return;
      const stops = [a, ...[Math.PI, 0].filter(t => (a - t) * (b - t) < 0).sort((x,y) => a > b ? y-x : x-y), b];
      for (let i = 1; i < stops.length; i++) {
        const s0 = stops[i - 1], s1 = stops[i], mid = (s0 + s1) / 2;
        if (mid > Math.PI || mid < 0) { move(s1, q); continue; }
        const steps = Math.max(1, Math.ceil(Math.abs(s1 - s0) / 0.01));
        for (let t = 1; t <= steps; t++) polygon.push(at(s0 + ((s1 - s0) * t) / steps, q));
        const p = at(s1, q);
        d += ` A ${f(q * scale)} ${f(q * scale)} 0 0 ${s1 < s0 ? 1 : 0} ${f(p[0])} ${f(p[1])}`;
      }
    };
    move(left[0], inner);
    radii.forEach((_, i) => { move(left[i], edges[i+1]); if (i+1 < radii.length) edge(left[i], left[i+1], edges[i+1]); });
    edge(left.at(-1)!, right.at(-1)!, outer);
    for (let i = radii.length-1; i >= 0; i--) { move(right[i], edges[i]); if (i > 0) edge(right[i], right[i-1], edges[i]); }
    edge(right[0], left[0], inner);
    return { band, fill: d + ' Z', polygon, leftAngles: left, rightAngles: right };
  });
}
