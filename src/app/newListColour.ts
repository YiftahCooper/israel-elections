import {partyColourBase} from './partyDisplayColor.ts';
import {assignColour} from '../data/colourGuard.ts';
import { MIN_NEIGHBOUR_DELTA_E, SEAT_LIGHTNESS } from '../data/colour.ts';

/** A colour for a list the user creates (a split part without a colour of its own, a new list): its seed when that
 *  can already be told apart from every colour in `taken`, else the nearest variant that can (lightness first, then
 *  hue), so a part of a blue list stays bluish. Decision 0087's rule: at least MIN_NEIGHBOUR_DELTA_E (CIEDE2000)
 *  from every other colour, seat lightness kept. If nothing clears them all, the variant with the largest margin. */
export function distinctColour(seed: string, taken: string[], min = MIN_NEIGHBOUR_DELTA_E): string {
  return assignColour([seed],taken,{minDeltaE:min,lightness:SEAT_LIGHTNESS,variantOf:seed,hueFirst:true});
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

/** Display colours of a joint list's component parties, by party id: each party's own colour; a party without one
 *  starts from retained research or the stable party-id base, then gets a distinct variant where needed. The same colours are used when the list is split. */
export function componentColours(parties: { id: string; color?: string | null }[], leadId: string | undefined, listColour: string, taken: string[]): Record<string, string> {
  const order = [...parties].sort((a, b) => Number(b.id === leadId) - Number(a.id === leadId));
  const baseList={color:listColour,parties:parties.map(p=>({...p,color:p.color??undefined}))};
  const used=[...taken,listColour];
  const colours = order.map(p=>{const color=p.color??distinctColour(partyColourBase(baseList,p.id).color,used);used.push(color);return color;});
  return Object.fromEntries(order.map((p, i) => [p.id, colours[i]]));
}
