// Seats in chamber order (moved from components/Hemicycle.tsx unchanged, so the build can import it: vite.config.ts works
// out the official chambers' bloc lines in advance, src/app/blocLinePrecomputed.ts).
import { partyDisplayColor } from './partyDisplayColor.ts';
import { blocDisplayOrder } from './blocOrder.ts';
import { seatBlocsOf, seatedOrder } from './derive.ts';
import type { AllocationResult } from '../engine/types.ts';
import type { Scenario } from '../model/scenario.ts';
import type { JointLook } from './components/PartyDot.tsx';

export interface SeatInfo { listId: string; idx: number; color: string; innerColor?: string; partyColor?: string; partyId?: string; remainder: boolean; bloc: string | null; holder: string }

/** Seats in chamber order. With a bloc grouping, seats are grouped by bloc (decision 0087): each seat counts
 *  for its member's party bloc when it differs from the list's. Within a bloc, lists keep their order. `look`: how a
 *  seat of a joint list counted by party shows its party (`innerColor` for both colours, `color` for the party's only). */
export function seatOrder(s: Scenario, r: AllocationResult, colorBy: 'list' | 'bloc' | 'party', look: JointLook = 'both'): SeatInfo[] {
  const out: (SeatInfo & { k: number })[] = [];
  const split = new Set(s.factionSplits ?? []);
  let k = 0;
  for (const l of s.lists) {
    const lr = r.lists.find((x) => x.id === l.id);
    if (!lr || !lr.seats) continue;
    const seated = seatedOrder(l);
    const blocs = seatBlocsOf(s, l, lr.seats);
    const parties = [...new Set(seated.map((c) => c.partyHe ?? ''))];
    for (let i = 0; i < lr.seats; i++) {
      const c = seated[i];
      // a constituent party's own colour (decision 0087) where the research gives one
      let color = l.color;
      if (colorBy === 'bloc') color = s.blocs.find((b) => b.id === blocs[i])?.color ?? '#8e8e93';
      if (colorBy === 'party') color = (c?.partyId && l.parties?.some(p => p.id === c.partyId) && partyDisplayColor(l, c.partyId)) || (parties.length > 1 ? shade(l.color, parties.indexOf(c?.partyHe ?? '')) : l.color);
      const holder = split.has(l.id) && c?.partyId && l.parties?.some((p) => p.id === c.partyId) ? `${l.id}:${c.partyId}` : l.id;
      const party = l.parties?.find(p => p.id === c?.partyId);
      const partyColor = split.has(l.id) && (l.parties?.length ?? 0) > 1 && party ? partyDisplayColor(l, party.id) : undefined;
      const innerColor = look === 'both' ? partyColor : undefined;
      if (innerColor) color = l.color;
      else if (look === 'party' && partyColor && colorBy === 'list') color = partyColor;
      out.push({ innerColor, partyColor: look === 'list' ? undefined : partyColor, partyId: party?.id, listId: l.id, idx: i, color, remainder: i >= lr.initialSeats, bloc: blocs[i], holder, k: k++ });
    }
  }
  // Keep component seats together within each list/bloc, preserving original candidate indices.
  const componentRank = (st: SeatInfo) => split.has(st.listId) ? s.lists.find(l => l.id === st.listId)?.parties?.findIndex(p => p.id === st.partyId) ?? -1 : 0;
  const within = (a: SeatInfo & { k: number }, b: SeatInfo & { k: number }) => a.listId === b.listId ? componentRank(a) - componentRank(b) || a.k - b.k : a.k - b.k;
  if (!s.blocs.length) return out.sort(within);
  const order = blocDisplayOrder(s);
  const rank = (b: string | null) => order.indexOf(b);
  return out.sort((a, b) => rank(a.bloc) - rank(b.bloc) || within(a, b));
}

/** The group whose places a seat shares: its list (one party of it, when a joint list is counted by party) in its bloc. */
export const seatGroup = (st: SeatInfo) => `${st.holder}|${st.bloc ?? ''}`;

function shade(hex: string, i: number): string {
  if (i <= 0) return hex;
  const n = parseInt(hex.slice(1), 16);
  const f = [0, 0.38, -0.3, 0.6, -0.5][i % 5];
  const ch = (v: number) => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
