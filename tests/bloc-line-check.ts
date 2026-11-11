// Shared checks for the bloc line (tests only): every seat's whole outline lies inside its own region and outside every
// other region, and no line comes closer to a seat than the clearance the router reports.
import type { SeatPos } from '../src/app/layout.ts';
import { arcBlocRegions, trayBlocRegions, trayCell, TRAY, type Pt } from '../src/app/blocLine.ts';

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
  const { regions, lines } = trayBlocRegions(bands), errors: string[] = [];
  const ids = [...new Set(bands)];
  bands.forEach((b, i) => {
    const [x, y] = trayCell(i), c = TRAY.cell, own = ids.indexOf(b);
    const pts: Pt[] = [[x + 4, y], [x + c - 4, y], [x + c, y + 4], [x + c, y + c - 4], [x + c - 4, y + c], [x + 4, y + c], [x, y + c - 4], [x, y + 4], [x + c / 2, y + c / 2]];
    for (const pt of pts) for (const region of regions) {
      if (inside(pt, region.polygon) !== (region.band === b)) { errors.push(`cell ${i} wrong side of region ${region.band}`); return; }
    }
    lines.forEach((line, j) => { if (Math.abs(j - own) <= 1 && Math.min(...pts.map((p) => lineDistance(p, line.points))) < 1) errors.push(`cell ${i} touches line ${j}`); });
  });
  return errors;
}
