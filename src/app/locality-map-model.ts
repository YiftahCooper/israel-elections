export const MAP_UNASSIGNED_COLOUR='#000000';
import { historicalLocalVotes } from '../model/historicalLocalVotes.ts';
import { toNumber } from '../engine/rational.ts';
import type { Scenario } from '../model/scenario.ts';
import type { Coordinate } from '../data/locality-coordinates.ts';
import { allocationOf, seatBlocsOf } from './derive.ts';

export function normalizeLocalityName(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}
export function matchesLocality(query: string, names: { nameHe: string; nameEn?: string; aliases?: string[]; code?: number | null }): boolean {
  const q = normalizeLocalityName(query);
  return [names.nameHe, names.nameEn ?? '', ...(names.aliases ?? []), String(names.code ?? '')].some(n => normalizeLocalityName(n).includes(q));
}
/** Constituents have no separate local ballots: apportion list votes by current elected-seat bloc fractions.
 * Lists without seats use their list bloc. This is a labelled estimate, not observed constituent votes. */
/** Each group's (bloc's or list's) share of a locality's valid votes, largest first; null = unassigned. */
export function localityTotals(s: Scenario, listIds: string[], votes: number[], mode: 'bloc' | 'list'): { key: string | null; votes: number }[] {
  const totals = new Map<string | null, number>();
  const allocation = allocationOf(s);
  const mapped = historicalLocalVotes(s.lists, listIds, votes);
  if (mapped.has(null)) totals.set(null, toNumber(mapped.get(null)!));
  for (const l of s.lists) {
    const v = toNumber(mapped.get(l.id)!);
    if (!l.originIds.some(o => listIds.includes(o))) continue;
    if (mode === 'list') totals.set(l.id, v);
    else {
      const seats = allocation.lists.find(x => x.id === l.id)?.seats ?? 0;
      const blocs = seats ? seatBlocsOf(s, l, seats) : [l.bloc];
      for (const b of blocs) {
        const key = s.blocs.some(x => x.id === b) ? b : null;
        totals.set(key, (totals.get(key) ?? 0) + v / blocs.length);
      }
    }
  }
  return [...totals].map(([key, v]) => ({ key, votes: v })).sort((a, b) => b.votes - a.votes);
}
export interface Winner { key: string | null; color: string; votes: number; tied: boolean; runnerUp: string | null; margin: number }
export function localityWinner(s: Scenario, listIds: string[], votes: number[], mode: 'bloc' | 'list'): Winner {
  const sorted = localityTotals(s, listIds, votes, mode);
  const { key, votes: count } = sorted[0] ?? { key: null, votes: 0 };
  const tied = sorted.length > 1 && Math.abs(count - sorted[1].votes) < 1e-8;
  return { key: count > 0 && !tied ? key : null, votes: count, tied, runnerUp: sorted[1]?.key ?? null, margin: count - (sorted[1]?.votes ?? 0),
    color: tied || count <= 0 ? MAP_UNASSIGNED_COLOUR : (mode === 'bloc' ? s.blocs.find(b => b.id === key)?.color : s.lists.find(l => l.id === key)?.color) ?? MAP_UNASSIGNED_COLOUR };
}
export function nearestLocality<T extends Coordinate>(items: T[], point: Coordinate): {item: T; km: number} | null {
  const rad = Math.PI / 180;
  const distance = (p: Coordinate) => {
    const a = Math.sin((p.lat-point.lat)*rad/2)**2 + Math.cos(point.lat*rad)*Math.cos(p.lat*rad)*Math.sin((p.lon-point.lon)*rad/2)**2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,a)));
  };
  return items.map(item => ({item,km:distance(item)})).sort((a,b)=>a.km-b.km)[0] ?? null;
}
