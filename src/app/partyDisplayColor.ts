import { deltaE2000, fromOklch, hexToOklch } from '../data/colour.ts';

interface PartyList { color: string; parties?: readonly { id: string; color?: string }[] }
const hex = /^#[\da-f]{6}$/i;
const luminance = (color: string) => [1, 3, 5].map(i => {
  const v = parseInt(color.slice(i, i + 2), 16) / 255;
  return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
}).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
export function colourContrast(a: string, b: string): number {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export const PARTY_DOT_CONTRAST = 3;
export const PARTY_DOT_DELTA_E = 20;
const hash = (id: string) => [...id].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 0);
// A fixed sRGB search space makes display choices reproducible without browser/theme dependencies.
const channels = [0, 32, 64, 96, 128, 160, 192, 224, 255];
const palette = channels.flatMap(r => channels.flatMap(g => channels.map(b => '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join(''))));
const cache = new WeakMap<object, { signature: string; colors: Map<string, string> }>();

/** Appearance only: never writes to parties, datasets, confidence metadata or scenario logs.
 * All outlets resolve the whole list together, including non-elected siblings. Supplied colours
 * keep priority when legible; missing/colliding colours are separated from the ring and siblings.
 * Opaque fills have the same contrast against their list ring in both themes. */
export function partyDisplayColor(list: PartyList, partyId: string): string {
  const parties = [...(list.parties ?? [])].sort((a, b) => Number(!!b.color) - Number(!!a.color) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const signature = JSON.stringify([list.color, parties.map(p => [p.id, p.color])]);
  let entry = cache.get(list);
  if (!entry || entry.signature !== signature) {
    const colors = new Map<string, string>();
    const candidates = palette.filter(c => hexToOklch(c)[1] >= .035 && colourContrast(c, list.color) >= PARTY_DOT_CONTRAST && deltaE2000(c, list.color) >= PARTY_DOT_DELTA_E);
    for (const p of parties) {
      const preferred = p.color && hex.test(p.color) ? p.color.toLowerCase() : fromOklch(.65, .18, (hash(p.id) % 360) * Math.PI / 180);
      const margin = (c: string) => Math.min(colourContrast(c, list.color) / PARTY_DOT_CONTRAST, deltaE2000(c, list.color) / PARTY_DOT_DELTA_E, ...[...colors.values()].map(other => deltaE2000(c, other) / PARTY_DOT_DELTA_E));
      let best = preferred;
      if (margin(preferred) < 1) {
        let cost = Infinity, fallback = preferred, fallbackMargin = -Infinity;
        for (const c of candidates) {
          const m = margin(c);
          if (m >= 1) { const d = deltaE2000(c, preferred); if (d < cost) { best = c; cost = d; } }
          if (m > fallbackMargin) { fallback = c; fallbackMargin = m; }
        }
        // Extremely large user-created alliances can exhaust a colour-only palette; names remain the key.
        if (cost === Infinity) best = fallback;
      }
      colors.set(p.id, best);
    }
    entry = { signature, colors }; cache.set(list, entry);
  }
  return entry.colors.get(partyId) ?? list.color;
}
