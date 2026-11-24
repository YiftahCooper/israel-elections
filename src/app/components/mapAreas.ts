// The Localities map's "Vote mix" view and the double-envelope island, drawn on one canvas over the map.
//
// Vote mix: far away each place is a circle whose area follows its valid votes, cut into slices by list; close up
// (zoom above SWITCH) each place with an outline (CBS 2022 statistical areas, joined per locality code) is filled with
// small tiles, grouped into one block per list: the place's tiles are cut in two along their longer side, by votes,
// again and again, so each list gets one compact block and its share of the tiles is its share of the votes. Places
// too small for tiles, or with no outline, keep their circle (no outline: a dashed ring). Each town's border is a
// strong dark line, so its own blocks read as its own.
//
// The island: double-envelope votes belong to no place, so they are drawn as a dashed rectangle in the sea west of Tel
// Aviv, its area on the same votes-to-area scale as the circles. In the Winner view it is filled with the winner's
// colour, like a dot; in the Vote mix view, with tiles like a town.
import * as Leaflet from 'leaflet';
import { apportion, circleR, groupCells, MIN_TILES, tileSize, type Cell } from '../voteMix.ts';

export type MapView = 'winner' | 'mix';
// M2 MOCK-UP ONLY (never merged): ?m2-labels=off, ?m2-circles=small|grow
export const m2 = (k: string) => { try { return new URLSearchParams(location.search).get('m2-' + k); } catch { return null; } };
const M2_FIXED = 9.25;
export const SWITCH = 10.5; // circles at zoom <= SWITCH, tiles above
export interface Part { key: string; color: string; votes: number; label: string }
export interface AreaPlace { index: number; name: string; lat: number | null; lon: number | null; valid: number; parts: Part[]; geom: number[][][][] | null }
/** `keepClear`: a place whose name must stay readable (Tel Aviv): the island keeps west of its dot and, in Hebrew, of
 *  the name that reads westward from it. */
export interface Island { lat: number; lon: number; valid: number; parts: Part[]; winner: string; title: string; sub: string;
  keepClear: { lat: number; lon: number; width: number; rtl: boolean } | null }

type Proj = { rings: Float64Array[]; bbox: [number, number, number, number] };
const inside = (rings: ArrayLike<number>[], x: number, y: number) => {
  let c = false;
  for (const r of rings) for (let i = 0, j = r.length - 2; i < r.length; j = i, i += 2) {
    const yi = r[i + 1], yj = r[j + 1];
    if ((yi > y) !== (yj > y) && x < (r[j] - r[i]) * (y - yi) / (yj - yi) + r[i]) c = !c;
  }
  return c;
};
export class AreasLayer extends Leaflet.Layer {
  occCircles: number[][] = []; occPolys: { rings: Float64Array[]; bbox: number[] }[] = []; occO = { x: 0, y: 0 };
  places: AreaPlace[] = []; view: MapView = 'winner'; dark = false; selected: number | null = null; island: Island | null = null;
  canvas: HTMLCanvasElement | null = null; cache = new Map<string, unknown>(); token = 0; islandBox: number[] | null = null;
  /** Whether a point on the map (container pixels) is on the island. */
  onIsland(pt: { x: number; y: number }) { const b = this.islandBox; return !!b && pt.x >= b[0] && pt.x <= b[2] && pt.y >= b[1] && pt.y <= b[3]; }
  set(places: AreaPlace[], view: MapView, dark: boolean, selected: number | null, island: Island | null) {
    if (places !== this.places) this.cache.clear();
    this.places = places; this.view = view; this.dark = dark; this.selected = selected; this.island = island; this.redraw();
  }
  onAdd(map: Leaflet.Map) {
    const pane = map.getPane('vote-mix') ?? map.createPane('vote-mix'); pane.style.zIndex = '340'; pane.style.pointerEvents = 'none';
    this.canvas = document.createElement('canvas'); this.canvas.className = 'vote-mix-canvas'; pane.appendChild(this.canvas);
    map.on('moveend zoomend resize viewreset', this.redraw, this); this.redraw(); (window as unknown as { __m2Map: unknown }).__m2Map = map; return this;
  }
  onRemove(map: Leaflet.Map) { map.off('moveend zoomend resize viewreset', this.redraw, this); this.canvas?.remove(); this.canvas = null; return this; }
  proj(p: AreaPlace, z: number): Proj | null {
    if (!p.geom || !this._map) return null;
    const key = `p${p.index}@${z}`; const hit = this.cache.get(key) as Proj | undefined; if (hit) return hit;
    const rings: Float64Array[] = []; const bb: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const poly of p.geom) for (const ring of poly) {
      const a = new Float64Array(ring.length * 2);
      ring.forEach(([lon, lat], i) => { const q = this._map!.project([lat, lon], z); a[i * 2] = q.x; a[i * 2 + 1] = q.y;
        if (q.x < bb[0]) bb[0] = q.x; if (q.y < bb[1]) bb[1] = q.y; if (q.x > bb[2]) bb[2] = q.x; if (q.y > bb[3]) bb[3] = q.y; });
      rings.push(a);
    }
    const out = { rings, bbox: bb }; this.cache.set(key, out); return out;
  }
  /** Tiles whose centre is inside the outline (a grid anchored to the world, so panning never reshuffles them). */
  tiles(key: string, rings: ArrayLike<number>[] | null, bbox: [number, number, number, number], parts: Part[], T: number) {
    const hit = this.cache.get(key) as Cell[] | undefined; if (hit) return hit;
    const cells: Cell[] = [];
    for (let j = Math.floor(bbox[1] / T); j * T < bbox[3]; j++) for (let i = Math.floor(bbox[0] / T); i * T < bbox[2]; i++)
      if (!rings || inside(rings, i * T + T / 2, j * T + T / 2)) cells.push({ i, j, g: -1 });
    groupCells(cells, apportion(parts, cells.length));
    this.cache.set(key, cells); return cells;
  }
  /** M2: does a box (container pixels) cover a circle or a tiled town? */
  hits(b: number[]) {
    for (const [x, y, r] of this.occCircles) { const cx = Math.max(b[0], Math.min(x, b[2])), cy = Math.max(b[1], Math.min(y, b[3])); if ((cx - x) ** 2 + (cy - y) ** 2 < (r + 1.5) ** 2) return true; }
    const o = this.occO;
    for (const q of this.occPolys) {
      if (b[2] + o.x < q.bbox[0] || b[0] + o.x > q.bbox[2] || b[3] + o.y < q.bbox[1] || b[1] + o.y > q.bbox[3]) continue;
      for (let fx = 0; fx <= 1; fx += 0.25) for (const fy of [0, 0.5, 1]) if (inside(q.rings, b[0] + (b[2] - b[0]) * fx + o.x, b[1] + (b[3] - b[1]) * fy + o.y)) return true;
    }
    return false;
  }
  redraw() {
    const map = this._map, cv = this.canvas; if (!map || !cv) return;
    const size = map.getSize(), dpr = window.devicePixelRatio || 1;
    cv.width = size.x * dpr; cv.height = size.y * dpr; cv.style.width = `${size.x}px`; cv.style.height = `${size.y}px`;
    Leaflet.DomUtil.setPosition(cv, map.containerPointToLayerPoint([0, 0]));
    const ctx = cv.getContext('2d')!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size.x, size.y);
    const mix = this.view === 'mix'; this.occCircles = []; this.occPolys = []; this.occO = { x: map.getPixelBounds().min!.x, y: map.getPixelBounds().min!.y };
    const m2c = m2('circles'); const R = (zz: number, v: number) => circleR(m2c === 'small' ? Math.min(zz, M2_FIXED) : zz, v);
    const z = map.getZoom(), o = map.getPixelBounds().min!, close = mix && z > SWITCH && !m2c;
    const ink = this.dark ? 'rgba(236,240,244,.92)' : 'rgba(22,26,32,.88)', pale = this.dark ? 'rgba(220,225,230,.38)' : 'rgba(40,46,54,.34)';
    const ringCol = this.dark ? '#15191e' : '#ffffff', textCol = this.dark ? '#f2f4f7' : '#111418', halo = this.dark ? 'rgba(17,20,24,.92)' : 'rgba(255,255,255,.94)';
    const vis = (b: [number, number, number, number]) => b[2] >= o.x - 50 && b[0] <= o.x + size.x + 50 && b[3] >= o.y - 50 && b[1] <= o.y + size.y + 50;
    const path = (pr: Proj) => { const P = new Path2D(); for (const r of pr.rings) { P.moveTo(r[0] - o.x, r[1] - o.y); for (let i = 2; i < r.length; i += 2) P.lineTo(r[i] - o.x, r[i + 1] - o.y); P.closePath(); } return P; };
    const sumOf = (ps: Part[]) => ps.reduce((a, q) => a + q.votes, 0) || 1;
    const pct = (v: number, s: number) => `${Math.round(v / s * 100)}%`;
    const cands: { full: string; short: string; pts: { x: number; y: number }[]; room: number; area: number }[] = [];
    const LABEL_SHARE = 0.08, LABEL_AREA = 1800;
    const pie = (p: { lat: number | null; lon: number | null; parts: Part[] }, r: number, dashed = false) => {
      if (p.lat === null || p.lon === null) return;
      const c = map.latLngToContainerPoint([p.lat, p.lon]); if (c.x < -r || c.y < -r || c.x > size.x + r || c.y > size.y + r) return;
      this.occCircles.push([c.x, c.y, r]); const sum = sumOf(p.parts); let a0 = -Math.PI / 2; ctx.globalAlpha = 0.95;
      for (const q of p.parts) { const a1 = a0 + q.votes / sum * Math.PI * 2; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.arc(c.x, c.y, r, a0, a1); ctx.closePath(); ctx.fillStyle = q.color; ctx.fill(); a0 = a1; }
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.lineWidth = r > 6 ? 1.2 : 0.9; ctx.strokeStyle = ringCol; ctx.stroke();
      if (r > 6) { ctx.beginPath(); ctx.arc(c.x, c.y, r + 0.9, 0, Math.PI * 2); ctx.lineWidth = 0.8; ctx.strokeStyle = pale; ctx.stroke(); }
      if (dashed) { ctx.beginPath(); ctx.arc(c.x, c.y, r + 2.2, 0, Math.PI * 2); ctx.setLineDash([2, 2]); ctx.lineWidth = 1.2; ctx.strokeStyle = ink; ctx.stroke(); ctx.setLineDash([]); }
    };
    // a town's border: a light halo under a strong dark line, so its blocks are clearly its own
    const border = (P: Path2D) => { ctx.globalAlpha = 1; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = ringCol; ctx.stroke(P); ctx.lineWidth = 2; ctx.strokeStyle = ink; ctx.stroke(P); };
    const faint = (P: Path2D) => { ctx.globalAlpha = 1; ctx.lineWidth = 0.8; ctx.strokeStyle = pale; ctx.stroke(P); };
    /** Fills grouped tiles, draws a seam between lists and offers each block big enough for its text a label. */
    const drawTiles = (cells: Cell[], parts: Part[], T: number, clip: Path2D | null, alpha: number) => {
      const sum = sumOf(parts), at = new Map<string, number>(); cells.forEach(c => at.set(`${c.i},${c.j}`, c.g));
      ctx.save(); if (clip) ctx.clip(clip); ctx.globalAlpha = alpha;
      for (const c of cells) { ctx.fillStyle = parts[c.g]?.color ?? '#999'; ctx.fillRect(c.i * T - o.x + 0.5, c.j * T - o.y + 0.5, T - 1, T - 1); }
      // seams between lists, so the blocks separate without relying on colour
      ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 1.1; ctx.beginPath();
      for (const c of cells) {
        const x = c.i * T - o.x, y = c.j * T - o.y;
        const r = at.get(`${c.i + 1},${c.j}`), d = at.get(`${c.i},${c.j + 1}`);
        if (r !== undefined && r !== c.g) { ctx.moveTo(x + T, y); ctx.lineTo(x + T, y + T); }
        if (d !== undefined && d !== c.g) { ctx.moveTo(x, y + T); ctx.lineTo(x + T, y + T); }
      }
      ctx.stroke(); ctx.restore();
      const counts = parts.map(() => 0), sx = parts.map(() => 0), sy = parts.map(() => 0);
      cells.forEach(c => { counts[c.g]++; sx[c.g] += c.i; sy[c.g] += c.j; });
      parts.forEach((q, g) => {
        const area = counts[g] * T * T; if (!counts[g] || q.votes / sum < LABEL_SHARE || area < LABEL_AREA) return;
        const mx = sx[g] / counts[g], my = sy[g] / counts[g];
        const own = cells.filter(c => c.g === g).map(c => ({ c, e: (c.i - mx) ** 2 + (c.j - my) ** 2 })).sort((a, b) => a.e - b.e).slice(0, 80);
        cands.push({ full: `${q.label} ${pct(q.votes, sum)}`, short: pct(q.votes, sum), room: Math.sqrt(area) * 1.6, area, pts: own.filter((_, k) => k % 4 === 0).map(({ c }) => ({ x: c.i * T + T / 2 - o.x, y: c.j * T + T / 2 - o.y })) });
      });
    };
    if (mix) {
      if (!close) {
        for (const p of this.places) { const pr = this.proj(p, z); if (pr && vis(pr.bbox)) { if (m2c === 'small' && z > SWITCH) border(path(pr)); else faint(path(pr)); } }
        [...this.places].sort((a, b) => b.valid - a.valid).forEach(p => { pie(p, R(z, p.valid), !p.geom); });
      } else {
        const T = tileSize(z), small: { p: AreaPlace; dashed: boolean }[] = [];
        for (const p of this.places) {
          const pr = this.proj(p, z); if (!pr) { small.push({ p, dashed: true }); continue; } if (!vis(pr.bbox)) continue;
          const P = path(pr), cells = this.tiles(`t${p.index}@${z}`, pr.rings, pr.bbox, p.parts, T);
          if (cells.length < MIN_TILES) { small.push({ p, dashed: false }); faint(P); continue; }
          drawTiles(cells, p.parts, T, P, this.dark ? 0.8 : 0.72); this.occPolys.push({ rings: pr.rings, bbox: pr.bbox });
          border(P);
        }
        small.sort((a, b) => b.p.valid - a.p.valid).forEach(({ p, dashed }) => pie(p, circleR(z, p.valid), dashed));
      }
    }
    // the double-envelope island
    const isl = this.island; const islandBoxes: number[][] = []; this.islandBox = null; delete cv.dataset.island;
    if (isl) {
      const c = map.latLngToContainerPoint([isl.lat, isl.lon]), r = circleR(Math.max(z, 7), isl.valid), area = Math.PI * r * r;
      // anchored by its east edge, so it grows out to sea, and kept clear of Tel Aviv's dot and name
      let east = c.x;
      if (isl.keepClear) { const k = map.latLngToContainerPoint([isl.keepClear.lat, isl.keepClear.lon]); east = Math.min(east, k.x - 12 - (isl.keepClear.rtl ? isl.keepClear.width + 6 : 0)); }
      const w = Math.round(Math.sqrt(area * 2)), h = Math.round(area / w), x0 = east - w, y0 = c.y - h / 2;
      this.islandBox = [x0 - 4, y0 - 4, x0 + w + 4, y0 + h + 4];
      cv.dataset.island = this.islandBox.map(Math.round).join(','); // where the island is, for tests
      if (x0 < size.x + 40 && x0 + w > -40 && y0 < size.y + 60 && y0 + h > -40) {
        ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = this.dark ? 'rgba(30,34,40,.92)' : 'rgba(255,255,255,.92)'; ctx.fillRect(x0 - 4, y0 - 4, w + 8, h + 8); ctx.restore();
        if (mix) {
          const T = close ? tileSize(z) : 3, bx: [number, number, number, number] = [x0 + o.x, y0 + o.y, x0 + o.x + w, y0 + o.y + h];
          drawTiles(this.tiles(`island@${z}@${T}@${w}x${h}`, null, bx, isl.parts, T), isl.parts, T, null, 0.95);
        } else { ctx.fillStyle = isl.winner; ctx.fillRect(x0, y0, w, h); }
        ctx.globalAlpha = 1; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.6; ctx.strokeStyle = ink; ctx.strokeRect(x0 - 4, y0 - 4, w + 8, h + 8); ctx.setLineDash([]);
        islandBoxes.push([x0 - 6, y0 - 6, x0 + w + 6, y0 + h + 6]);
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        // the label hangs to the west (out to sea) from the island's east edge, so it never runs onto the coast's names
        for (const [t, dy, f] of (close ? [[isl.title, 8, '700 12px'], [isl.sub, 24, '600 11px']] : [[isl.title, -h - 40, '700 12px'], [isl.sub, -h - 24, '600 11px']]) as [string, number, string][]) {
          ctx.font = `${f} "IBM Plex Sans Hebrew", "Segoe UI", system-ui, sans-serif`; const tw = ctx.measureText(t).width, tx = tw <= w + 8 ? x0 + w / 2 + tw / 2 : Math.max(tw + 4, x0 + w + 4); islandBoxes.push([tx - tw - 2, y0 + h + dy - 2, tx + 2, y0 + h + dy + 15]);
          ctx.lineWidth = 3.5; ctx.strokeStyle = halo; ctx.lineJoin = 'round'; ctx.strokeText(t, tx, y0 + h + dy); ctx.fillStyle = textCol; ctx.fillText(t, tx, y0 + h + dy);
        }
      }
    }
    if (mix && this.selected !== null) {
      const p = this.places.find(x => x.index === this.selected); const pr = p && this.proj(p, z);
      if (p && pr && close) { const P = path(pr); ctx.globalAlpha = 1; ctx.lineWidth = 6; ctx.strokeStyle = ringCol; ctx.stroke(P); ctx.lineWidth = 3; ctx.strokeStyle = this.dark ? '#ffffff' : '#111418'; ctx.stroke(P); }
    }
    ctx.globalAlpha = 1;
    const token = ++this.token;
    // labels last, once the app's own place names are laid out: never over a place name, the island or each other
    setTimeout(() => {
      if (token !== this.token || !this._map) return;
      const host = this._map.getContainer().getBoundingClientRect(), taken: number[][] = [[0, 0, 52, 82]];
      this._map.getContainer().querySelectorAll('.locality-map-label').forEach(el => { const r = el.getBoundingClientRect(), b = [r.left - host.left, r.top - host.top, r.right - host.left, r.bottom - host.top]; (el as HTMLElement).style.visibility = islandBoxes.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]) ? 'hidden' : ''; });
      taken.push(...islandBoxes);
      this._map.getContainer().querySelectorAll('.locality-map-label, .leaflet-control-attribution').forEach(el => { if ((el as HTMLElement).style.visibility === 'hidden') return; const r = el.getBoundingClientRect(); taken.push([r.left - host.left - 2, r.top - host.top - 1, r.right - host.left + 2, r.bottom - host.top + 1]); });
      ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.globalAlpha = 1;
      ctx.font = '700 11.5px "IBM Plex Sans Hebrew", "Segoe UI", system-ui, sans-serif';
      for (const c of (m2('labels') === 'off' ? [] : cands).sort((a, b) => b.area - a.area)) {
        let done = false;
        for (const text of [c.full, c.short]) {
          const w = ctx.measureText(text).width + 6, h = 15; if (w > c.room) continue;
          for (const p of c.pts) {
            const box = [p.x - w / 2, p.y - h / 2, p.x + w / 2, p.y + h / 2];
            if (box[0] < 2 || box[1] < 2 || box[2] > size.x - 2 || box[3] > size.y - 2) continue;
            if (taken.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
            taken.push(box); ctx.lineWidth = 3.5; ctx.strokeStyle = halo; ctx.strokeText(text, p.x, p.y); ctx.fillStyle = textCol; ctx.fillText(text, p.x, p.y); done = true; break;
          }
          if (done) break;
        }
      }
      ctx.restore();
    }, 120);
  }
}
