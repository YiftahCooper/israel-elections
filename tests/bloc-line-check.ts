// Shared checks for the bloc line (tests only): every seat's whole outline lies inside its own region and outside every
// other region, and no line comes closer to a seat than the clearance the router reports.
import type { SeatPos } from '../src/app/layout.ts';
import { arcBlocRegions, trayBlocRegions, trayCell, trayShape, TRAY, type Pt } from '../src/app/blocLine.ts';

export const inside = (pt: Pt, poly: Pt[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const segDist = (p: Pt, a: Pt, b: Pt) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
export const lineDistance = (p: Pt, line: Pt[]) => Math.min(...line.slice(1).map((b, i) => segDist(p, line[i], b)));

/** Half circle: problems found, as text (empty when every seat is where it belongs). */
export function regionErrors(seats: SeatPos[], bands: number[], rad: number, cx = 500, cy = 470, scale = 400): string[] {
  const { regions, lines } = arcBlocRegions(seats, bands, rad, cx, cy, scale), errors: string[] = [];
  const ids = [...new Set(bands)];
  seats.forEach((p, i) => {
    const own = ids.indexOf(bands[i]);
    for (let k = 0; k < 24; k++) {
      const a = (k * Math.PI) / 12, pt: Pt = [cx + (p.x + Math.cos(a) * rad) * scale, cy + (p.y + Math.sin(a) * rad) * scale];
      for (const region of regions.filter((_, j) => Math.abs(j - own) <= 1)) {
        const mine = region.band === bands[i];
        if (inside(pt, region.polygon) !== mine) { errors.push(`seat ${i} ${mine ? 'outside its region' : 'inside region ' + region.band}`); return; }
      }
    }
    const centre: Pt = [cx + p.x * scale, cy + p.y * scale];
    lines.forEach((line, j) => {
      if (Math.abs(j - own) > 1) return;
      const gap = lineDistance(centre, line.points) - rad * scale;
      if (gap < line.clearance - 0.25) errors.push(`seat ${i} ${gap.toFixed(2)} from line ${j} (clearance ${line.clearance.toFixed(2)})`);
    });
  });
  return errors;
}

/** Blocks: every seat's square (corners and edge midpoints) inside its own region only. */
export function trayRegionErrors(bands: number[]): string[] {
  const { regions, lines } = trayBlocRegions(bands), errors: string[] = [], { cols } = trayShape(bands.length);
  const ids = [...new Set(bands)];
  bands.forEach((b, i) => {
    const [x, y] = trayCell(i, cols), c = TRAY.cell, own = ids.indexOf(b);
    const pts: Pt[] = [[x + 4, y], [x + c - 4, y], [x + c, y + 4], [x + c, y + c - 4], [x + c - 4, y + c], [x + 4, y + c], [x, y + c - 4], [x, y + 4], [x + c / 2, y + c / 2]];
    for (const pt of pts) for (const region of regions) {
      if (inside(pt, region.polygon) !== (region.band === b)) { errors.push(`cell ${i} wrong side of region ${region.band}`); return; }
    }
    lines.forEach((line, j) => { if (Math.abs(j - own) <= 1 && Math.min(...pts.map((p) => lineDistance(p, line.points))) < 1) errors.push(`cell ${i} touches line ${j}`); });
  });
  return errors;
}

/** How far off the middle each line crosses each row, where that row has seats of both sides next to each other: 0 is
 *  exactly midway between the two seats' edges, 1 is touching one of them. One number per line and row. */
export function centring(seats: SeatPos[], bands: number[], rad: number, lines: { points: Pt[] }[], cx = 500, cy = 470, scale = 400): number[] {
  const ids = [...new Set(bands)], out: number[] = [];
  const radii = [...new Set(seats.map((p) => Math.hypot(p.x, p.y).toFixed(6)))].map(Number);
  lines.forEach((line, j) => {
    for (const q of radii) {
      const row = seats.map((p, i) => ({ p, i })).filter(({ p }) => Math.abs(Math.hypot(p.x, p.y) - q) < 1e-5).sort((a, b) => b.p.a - a.p.a);
      const k = row.findIndex(({ i }) => ids.indexOf(bands[i]) > j);
      if (k <= 0) continue;
      const a0 = row[k - 1].p.a - Math.asin(rad / q), a1 = row[k].p.a + Math.asin(rad / q); // the two seats' facing edges
      // where the line crosses this radius between those two seats
      let cross: number | null = null;
      const pts = line.points.map(([x, y]) => [(x - cx) / scale, (y - cy) / scale]);
      for (let m = 0; m + 1 < pts.length; m++) {
        const r0 = Math.hypot(pts[m][0], pts[m][1]), r1 = Math.hypot(pts[m + 1][0], pts[m + 1][1]);
        if ((r0 - q) * (r1 - q) > 0 || r0 === r1) continue;
        const t = (q - r0) / (r1 - r0), x = pts[m][0] + t * (pts[m + 1][0] - pts[m][0]), y = pts[m][1] + t * (pts[m + 1][1] - pts[m][1]);
        const a = Math.atan2(-y, x);
        if (a <= a0 + 1e-9 && a >= a1 - 1e-9) { cross = a; break; }
      }
      if (cross === null) { out.push(1); continue; }
      out.push(Math.abs(cross - (a0 + a1) / 2) / ((a0 - a1) / 2));
    }
  });
  return out;
}

/** The sharpest corner of a line: the most it turns within any `span` units of its length (radians). */
export function sharpest(points: Pt[], span = 6, step = 1): number {
  const even: Pt[] = [points[0]];
  for (let m = 1; m < points.length; m++) {
    const [x0, y0] = points[m - 1], [x1, y1] = points[m], d = Math.hypot(x1 - x0, y1 - y0);
    for (let t = step; t <= d; t += step) even.push([x0 + ((x1 - x0) * t) / d, y0 + ((y1 - y0) * t) / d]);
  }
  const heading = even.slice(1).map((p, i) => Math.atan2(p[1] - even[i][1], p[0] - even[i][0]));
  const w = Math.max(1, Math.round(span / step));
  let worst = 0;
  for (let i = 0; i + w < heading.length; i++) {
    let d = heading[i + w] - heading[i];
    while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    worst = Math.max(worst, Math.abs(d));
  }
  return worst;
}
