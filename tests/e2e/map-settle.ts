// Shared by the Localities map specs: wait until the map has come to rest, then read its layout in one go.
//
// Why (FX2, 19 Nov 2026): when the map opens it fits the country and, at the same zoom, Leaflet slides there over a
// quarter of a second. During a slide the names and the canvas move together, but the canvas's `data-island` stays in
// the pixels of its last redraw until the slide ends. A test that read the island, the map's box and a name in three
// separate steps could straddle the slide and see the island 28 px away from where it is drawn (CI run 44441667338).
import type { Page } from './fixtures';

/** Resolves once fonts are ready and the map pane, the island and every name have kept still for several frames. */
export const settleMap = (page: Page) => page.evaluate(async () => {
  await document.fonts.ready;
  const state = () => {
    const pane = document.querySelector<HTMLElement>('.leaflet-map-pane')?.style.transform ?? '';
    const island = document.querySelector<HTMLElement>('.vote-mix-canvas')?.dataset.island ?? '';
    const names = [...document.querySelectorAll('.locality-map-label')].map(el => { const r = el.getBoundingClientRect(); return `${el.textContent}@${r.left},${r.top}`; }).join(';');
    return `${pane}|${island}|${names}`;
  };
  const frame = () => new Promise(r => requestAnimationFrame(r));
  let last = state(), still = 0;
  for (let i = 0; i < 600 && still < 6; i++) { await frame(); const now = state(); still = now === last ? still + 1 : 0; last = now; }
  if (still < 6) throw new Error('the map did not come to rest');
});

export interface Label { name: string; box: number[]; text: number[] }
/** The map's layout in page pixels, read in one step: the map's box, the island's (from the canvas it is drawn on, so a
 *  slide cannot separate them), each shown name's box and the box of its text as drawn, and the names with a strongly
 *  coloured pixel (a dot, a circle, tiles or the island) under them. */
export const mapLayout = (page: Page) => page.evaluate(() => {
  const rect = (r: DOMRect) => [r.left, r.top, r.right, r.bottom];
  const cv = document.querySelector<HTMLCanvasElement>('.vote-mix-canvas')!, c = cv.getBoundingClientRect();
  const [x0, y0, x1, y1] = cv.dataset.island!.split(',').map(Number);
  const island = [c.left + x0, c.top + y0, c.left + x1, c.top + y1];
  const map = rect(document.querySelector('.locality-map-canvas')!.getBoundingClientRect());
  const labels = [...document.querySelectorAll<HTMLElement>('.locality-map-label')].map(el => {
    const range = document.createRange(); range.selectNodeContents(el);
    return { name: el.textContent ?? '', box: rect(el.getBoundingClientRect()), text: rect(range.getBoundingClientRect()) };
  });
  // the Vote mix canvas (circles, tiles, the island) and Leaflet's own (the Winner dots)
  const canvases = [cv, ...document.querySelectorAll<HTMLCanvasElement>('.leaflet-overlay-pane canvas')];
  const inked = labels.filter(l => {
    const b = [Math.min(l.box[0], l.text[0]), l.box[1], Math.max(l.box[2], l.text[2]), l.box[3]];
    return canvases.some(canvas => {
      const r = canvas.getBoundingClientRect(), k = canvas.width / r.width;
      const x = Math.max(0, Math.round((b[0] - r.left) * k)), y = Math.max(0, Math.round((b[1] - r.top) * k));
      const w = Math.min(canvas.width - x, Math.round((b[2] - b[0]) * k)), h = Math.min(canvas.height - y, Math.round((b[3] - b[1]) * k));
      if (w <= 0 || h <= 0) return false;
      const px = canvas.getContext('2d')!.getImageData(x, y, w, h).data;
      for (let i = 3; i < px.length; i += 4) if (px[i] > 150) return true;
      return false;
    });
  }).map(l => l.name);
  return { island, map, labels, inked };
});
