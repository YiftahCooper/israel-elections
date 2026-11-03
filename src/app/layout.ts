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
  seats.sort((p, q) => q.a - p.a || Math.hypot(p.x, p.y) - Math.hypot(q.x, q.y));
  const rowGap = rows > 1 ? (1 - inner) / (rows - 1) : 0.3;
  return { seats, r: Math.min(rowGap * 0.42, (Math.PI * inner) / Math.max(1, counts[0]) * 0.45) };
}

/** Places one label per list outside the arc, pushing overlapping labels outwards. */
export function placeLabels(items: { id: string; n: number; a: number; text: string }[], cx: number, cy: number, R: number) {
  const placed: { id: string; n: number; text: string; x: number; y: number; anchor: 'start' | 'end' | 'middle'; box: [number, number, number, number] }[] = [];
  const sorted = [...items].sort((p, q) => Math.abs(Math.cos(p.a)) - Math.abs(Math.cos(q.a)));
  for (const it of sorted) {
    const w = it.text.length * 8.6 + 6, h = 20;
    let placedOne = null as (typeof placed)[number] | null;
    for (let k = 0; k < 8 && !placedOne; k++) {
      const rr = R + 26 + k * 22;
      const x = cx + Math.cos(it.a) * rr, y = cy - Math.sin(it.a) * rr;
      const anchor: 'start' | 'end' | 'middle' = Math.cos(it.a) > 0.25 ? 'start' : Math.cos(it.a) < -0.25 ? 'end' : 'middle';
      const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
      const box: [number, number, number, number] = [x0, y - h / 2, x0 + w, y + h / 2];
      if (!placed.some((p) => box[0] < p.box[2] && box[2] > p.box[0] && box[1] < p.box[3] && box[3] > p.box[1])) placedOne = { ...it, x, y, anchor, box };
    }
    if (placedOne) placed.push(placedOne);
  }
  return placed;
}

