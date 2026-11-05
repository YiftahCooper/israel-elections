// Perceptual colour distance for party colours: sRGB hex → CIE Lab (D65) → CIEDE2000.
// Shared by the dataset build (scripts/lib/build/meta.ts), scripts/check-colours.ts and the colour tests, so
// they always agree. Pure; no DOM.

export function hexToLab(hex: string): [number, number, number] {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const [x, y, z] = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]
    .map((r, i) => (r[0] * c[0] + r[1] * c[1] + r[2] * c[2]) / [0.95047, 1, 1.08883][i]);
  const f = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** CIEDE2000 colour difference (Sharma, Wu & Dalal 2005). About 2 is a just-noticeable difference on large
 *  patches; small marks such as chamber seats need far more to be told apart at a glance. */
export function deltaE2000(a: string, b: string): number {
  const [L1, a1, b1] = hexToLab(a), [L2, a2, b2] = hexToLab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hue = (x: number, y: number) => { if (x === 0 && y === 0) return 0; const h = Math.atan2(y, x) / rad; return h < 0 ? h + 360 : h; };
  const hp1 = hue(ap1, b1), hp2 = hue(ap2, b2);
  const dL = L2 - L1, dC = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2 !== 0) { dh = hp2 - hp1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh * rad) / 2);
  const Lm = (L1 + L2) / 2, Cpm = (Cp1 + Cp2) / 2;
  let hm = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) { if (Math.abs(hp1 - hp2) > 180) hm += hp1 + hp2 < 360 ? 360 : -360; hm /= 2; }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + 0.045 * Cpm, SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

// ---- OKLab, for lightness-only adjustments that keep a colour's hue
const lin = (v: number) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92);
const gam = (v: number) => (v > 0.0031308 ? 1.055 * v ** (1 / 2.4) - 0.055 : 12.92 * v);
export function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToRgb(L: number, C: number, h: number): [number, number, number] {
  const A = C * Math.cos(h), B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
/** sRGB hex for OKLCH (L, C, h in radians), chroma reduced only as far as sRGB requires. */
export function fromOklch(L: number, C0: number, h: number): string {
  let C = C0, rgb = oklchToRgb(L, C, h);
  for (let i = 0; i < 60 && rgb.some((v) => v < -1e-4 || v > 1 + 1e-4); i++) { C *= 0.93; rgb = oklchToRgb(L, C, h); }
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join('');
}

/** Seat fills must read on both themes' surfaces and keep their colour: CIE L* inside this range. */
export const SEAT_LIGHTNESS: [number, number] = [25, 80];
/** Minimum CIEDE2000 difference between any two lists that share a chamber, and between two lists drawn next to each
 *  other (chamber, bloc strip, legend or list column). Decision 0087, revised 2026-11-04. */
export const MIN_LIST_DELTA_E = 15;
export const MIN_NEIGHBOUR_DELTA_E = 20;

/** Makes the colours distinguishable (an item's `alternatives`, such as the app's cross-election colour, are used as
 *  they are only when no allowed move of its own colour works): every pair at least `min` apart (CIEDE2000), pairs in `neighbours` (ids joined by
 *  a space, either order) at least `minNeighbour`. Items come in order of importance (most votes first): an item keeps
 *  its colour when it clears every item before it; otherwise it takes the nearest colour to its own that does,
 *  preferring a lightness change and allowing at most a 24° hue move, so a colour stays in its family (decision 0087: the less-associated party gives
 *  way). If nothing clears them, the candidate with the largest margin is used. */
export function separateColours(items: { id: string; color: string; alternatives?: string[] }[], neighbours: Set<string> = new Set(), min = MIN_LIST_DELTA_E, minNeighbour = MIN_NEIGHBOUR_DELTA_E) {
  const placed: { id: string; color: string }[] = [], out = new Map<string, string>(), adjusted = new Set<string>();
  const need = (a: string, b: string) => (neighbours.has(`${a} ${b}`) || neighbours.has(`${b} ${a}`) ? minNeighbour : min);
  // the smallest margin by which `c` clears every placed colour (negative: it fails one)
  const margin = (id: string, c: string) => placed.reduce((m, p) => Math.min(m, deltaE2000(c, p.color) - need(id, p.id)), Infinity);
  const readable = (c: string) => { const L = hexToLab(c)[0]; return L >= SEAT_LIGHTNESS[0] && L <= SEAT_LIGHTNESS[1]; };
  const rad = Math.PI / 180;
  for (const { id, color, alternatives = [] } of items) {
    const own = color.toLowerCase();
    let best = own;
    if (margin(id, own) < 0 || !readable(own)) {
      const [L0, C0, h0] = hexToOklch(own);
      let bestCost = Infinity, fallback = own, fallbackM = -Infinity;
      for (const dh of [0, 6, -6, 12, -12, 18, -18, 24, -24]) for (const cf of [1, 0.6, 0.8, 1.2, 1.4]) for (let dl = -0.3; dl <= 0.3001; dl += 0.01) {
        const c = fromOklch(L0 + dl, Math.max(C0, 0.02) * cf, h0 + dh * rad);
        if (!readable(c)) continue;
        const m = margin(id, c);
        if (m >= 0) { const cost = deltaE2000(own, c) + Math.abs(dh) * 0.4; if (cost < bestCost) { bestCost = cost; best = c; } }
        else if (m > fallbackM) { fallbackM = m; fallback = c; }
      }
      // only when no small move of its own colour works: an alternative as it is, else the best available margin
      if (bestCost === Infinity) best = alternatives.map((c) => c.toLowerCase()).find((c) => margin(id, c) >= 0 && readable(c)) ?? fallback;
    }
    if (best !== own) adjusted.add(id);
    placed.push({ id, color: best }); out.set(id, best);
  }
  return { colors: out, adjusted };
}

/** sRGB mix of `a` over `b` at weight `t` (CSS color-mix in srgb). */
export function mixHex(a: string, b: string, t: number): string {
  return '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * t + parseInt(b.slice(i, i + 2), 16) * (1 - t)).toString(16).padStart(2, '0')).join('');
}
/** How bloc regions are drawn (src/app/styles.css `--wedge-mix` over `--surface`, No bloc from `--muted`), per theme. */
export const BLOC_TINTS = [
  { surface: '#ffffff', muted: '#5d656e', mix: 0.26 },
  { surface: '#171b20', muted: '#9aa2ab', mix: 0.24 },
] as const;
/** Minimum CIEDE2000 difference between two bloc regions' tints, and between a bloc's tint and No bloc's. */
export const MIN_BLOC_TINT_DELTA_E = 8;
export const blocTints = (color: string) => BLOC_TINTS.map((t) => mixHex(color.toLowerCase(), t.surface, t.mix));
export const noBlocTints = () => BLOC_TINTS.map((t) => mixHex(t.muted, t.surface, t.mix));

/** Bloc colours whose pale regions can be told apart from each other and from the neutral No bloc region, in both
 *  themes. Blocs are taken in their declared order; a bloc keeps its colour when its tints clear every earlier bloc and
 *  No bloc, otherwise it takes the nearest colour (smallest CIEDE2000 change) whose tints do, trying hue and chroma. */
export function separateBlocColours(colors: string[], min = MIN_BLOC_TINT_DELTA_E): string[] {
  const placed: string[][] = [noBlocTints()], out: string[] = [];
  const margin = (c: string) => {
    const t = blocTints(c), h = hexToOklch(c)[2];
    const solid = out.reduce((m, p) => {
      const dh = Math.abs(h - hexToOklch(p)[2]);
      return Math.min(m, deltaE2000(c, p) - 20, (Math.min(dh, Math.PI * 2 - dh) * 180 / Math.PI - (colors.length <= 3 ? 90 : colors.length <= 5 ? 50 : 25)) / 5);
    }, Infinity);
    return placed.reduce((m, p) => Math.min(m, ...t.map((x, i) => deltaE2000(x, p[i]) - min)), solid);
  };
  const rad = Math.PI / 180;
  for (const color of colors) {
    const own = color.toLowerCase();
    let best = own;
    if (margin(own) < 0) {
      const [L0, C0, hue] = hexToOklch(own);
      // a grey has no hue of its own: residual groupings (Opposition, No recommendation) become a warm sand, clearly
      // apart from the cool grey reserved for No bloc
      const h0 = C0 < 0.03 ? 75 * rad : hue;
      let bestCost = Infinity, fallback = own, fallbackM = -Infinity;
      for (let dh = -180; dh < 180; dh += 10) for (const C of [C0, 0.1, 0.13, 0.16]) for (let dl = -0.15; dl <= 0.1501; dl += 0.05) {
        const c = fromOklch(L0 + dl, Math.max(C, 0.06), h0 + dh * rad);
        const L = hexToLab(c)[0]; if (L < 30 || L > 70) continue;
        const m = margin(c);
        if (m >= 0) { const cost = deltaE2000(own, c) + Math.abs(dh) * 0.05; if (cost < bestCost) { bestCost = cost; best = c; } }
        else if (m > fallbackM) { fallbackM = m; fallback = c; }
      }
      if (bestCost === Infinity) best = fallback;
    }
    placed.push(blocTints(best)); out.push(best);
  }
  return out;
}
