import { deltaE2000, fromOklch, hexToLab, hexToOklch, MIN_NEIGHBOUR_DELTA_E, SEAT_LIGHTNESS } from '../data/colour.ts';

const readable = (c: string) => { const L = hexToLab(c)[0]; return L >= SEAT_LIGHTNESS[0] && L <= SEAT_LIGHTNESS[1]; };

/** A colour for a list the user creates (a split part without a colour of its own, a new list): its seed when that
 *  can already be told apart from every colour in `taken`, else the nearest variant that can (lightness first, then
 *  hue), so a part of a blue list stays bluish. Decision 0087's rule: at least MIN_NEIGHBOUR_DELTA_E (CIEDE2000)
 *  from every other colour, seat lightness kept. If nothing clears them all, the variant with the largest margin. */
export function distinctColour(seed: string, taken: string[], min = MIN_NEIGHBOUR_DELTA_E): string {
  const margin = (c: string) => taken.reduce((m, t) => Math.min(m, deltaE2000(c, t)), Infinity) - min;
  const own = seed.toLowerCase();
  if (readable(own) && margin(own) >= 0) return own;
  const [L0, C0, h0] = hexToOklch(own);
  const rad = Math.PI / 180;
  let best = own, bestCost = Infinity, fallback = own, fallbackM = -Infinity;
  for (const dh of [0, 20, -20, 40, -40, 60, -60, 90, -90, 120, -120, 150, -150, 180])
    for (const dl of [0, -0.08, 0.08, -0.16, 0.16, -0.24, 0.24]) {
      const c = fromOklch(L0 + dl, Math.max(C0, 0.12), h0 + dh * rad);
      if (!readable(c)) continue;
      const m = margin(c);
      if (m >= 0) { const cost = Math.abs(dh) * 0.5 + Math.abs(dl) * 100; if (cost < bestCost) { bestCost = cost; best = c; } }
      else if (m > fallbackM) { fallbackM = m; fallback = c; }
    }
  return bestCost < Infinity ? best : fallback;
}

/** Colours for several new lists at once: each `null` seed is replaced by a variant of `fallback` that every list in
 *  `taken` and every part before it can be told apart from; a sourced colour (a string) is kept as it is. */
export function partColours(seeds: (string | null | undefined)[], fallback: string, taken: string[]): string[] {
  const used = [...taken];
  return seeds.map((c, i) => {
    const out = c ?? (i === 0 ? fallback : distinctColour(fallback, used));
    used.push(out);
    return out;
  });
}
