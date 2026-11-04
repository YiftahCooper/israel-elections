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

export interface AnnularBandRow { inner: number; outer: number; from: number; to: number }
/** Fill-only annular row sectors. Regions meet without outlined steps or cut-out seams; seats never move. */
export function annularRegions(seats: SeatPos[], bands: number[], seatRadius: number, cx = 500, cy = 470, scale = 400) {
  const radii = [...new Set(seats.map(p => Number(Math.hypot(p.x,p.y).toFixed(8))))].sort((a,b)=>a-b);
  const rowOf = (p:SeatPos) => radii.findIndex(r=>Math.abs(r-Math.hypot(p.x,p.y))<1e-6);
  const rowSeats = radii.map((_,i)=>seats.filter(p=>rowOf(p)===i));
  const edges = [radii[0]-seatRadius-0.015, ...radii.slice(1).map((r,i)=>(r+radii[i])/2), radii.at(-1)!+seatRadius+0.015];
  const point = (a:number,r:number) => `${cx+Math.cos(a)*r*scale} ${cy-Math.sin(a)*r*scale}`;
  const arc = (a:number,b:number,r:number) => `A ${r*scale} ${r*scale} 0 ${Math.abs(b-a)>Math.PI?1:0} ${b<a?1:0} ${point(b,r)}`;
  return [...new Set(bands)].map(band=>{
    const rows: (AnnularBandRow|undefined)[] = radii.map((_,i)=>{
      const angles=seats.filter((p,k)=>rowOf(p)===i&&bands[k]===band).map(p=>p.a);
      if(!angles.length)return undefined;
      const pitch=rowSeats[i].length>1 ? Math.PI/(rowSeats[i].length-1) : Math.PI;
      const first=Math.min(...angles), last=Math.max(...angles);
      return {inner:edges[i],outer:edges[i+1],from:first-pitch/2,to:last+pitch/2};
    });
    // Seats at either end sit on the baseline, so half of each end seat lies below it. Rather than letting each row's
    // band overhang by its own pitch (a stepped skirt), every row ends at the baseline and gains a rectangular cap down
    // to one shared floor, so the chamber's bottom edge is a single straight line.
    const floor=(seatRadius+0.015)*scale;
    const cap=(inner:number,outer:number,side:1|-1)=>{
      const x0=cx+side*inner*scale, x1=cx+side*outer*scale;
      return ` M ${x0} ${cy} L ${x1} ${cy} L ${x1} ${cy+floor} L ${x0} ${cy+floor} Z`;
    };
    let fill='';
    rows.forEach(row=>{
      if(!row)return;
      const {inner,outer}=row;
      const from=Math.max(0,row.from), to=Math.min(Math.PI,row.to);
      if(to>from) fill+=` M ${point(from,inner)} ${arc(from,to,inner)} L ${point(to,outer)} ${arc(to,from,outer)} Z`;
      if(row.from<0) fill+=cap(inner,outer,1);
      if(row.to>Math.PI) fill+=cap(inner,outer,-1);

    });
    return {band,rows,fill};
  });
}
