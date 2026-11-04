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
export interface Winner { key: string | null; color: string; votes: number; tied: boolean }
/** Constituents have no separate local ballots: apportion list votes by current elected-seat bloc fractions.
 * Lists without seats use their list bloc. This is a labelled estimate, not observed constituent votes. */
export function localityWinner(s: Scenario, listIds: string[], votes: number[], mode: 'bloc' | 'list'): Winner {
  const totals = new Map<string | null, number>();
  const allocation = allocationOf(s);
  for (let i = 0; i < listIds.length; i++) {
    const amount = votes[i] ?? 0;
    const sharers = s.lists.filter(l => l.originIds.includes(listIds[i]));
    const totalWeight = sharers.reduce((n, l) => n + l.votes, 0);
    if (!sharers.length) totals.set(null, (totals.get(null) ?? 0) + amount);
    for (const l of sharers) {
      const v = amount * (sharers.length === 1 ? 1 : totalWeight ? l.votes / totalWeight : 1 / sharers.length);
      if (mode === 'list') totals.set(l.id, (totals.get(l.id) ?? 0) + v);
      else {
        const seats = allocation.lists.find(x => x.id === l.id)?.seats ?? 0;
        const blocs = seats ? seatBlocsOf(s, l, seats) : [l.bloc];
        for (const b of blocs) {
          const key = s.blocs.some(x => x.id === b) ? b : null;
          totals.set(key, (totals.get(key) ?? 0) + v / blocs.length);
        }
      }
    }
  }
  const sorted = [...totals].sort((a,b) => b[1] - a[1]);
  const [key, count] = sorted[0] ?? [null, 0];
  const tied = sorted.length > 1 && Math.abs(count - sorted[1][1]) < 1e-8;
  return { key: count > 0 && !tied ? key : null, votes: count, tied, color: tied || count <= 0 ? '#78838c' : (mode === 'bloc' ? s.blocs.find(b => b.id === key)?.color : s.lists.find(l => l.id === key)?.color) ?? '#78838c' };
}
export function nearestLocality<T extends Coordinate>(items: T[], point: Coordinate): {item: T; km: number} | null {
  const rad = Math.PI / 180;
  const distance = (p: Coordinate) => {
    const a = Math.sin((p.lat-point.lat)*rad/2)**2 + Math.cos(point.lat*rad)*Math.cos(p.lat*rad)*Math.sin((p.lon-point.lon)*rad/2)**2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,a)));
  };
  return items.map(item => ({item,km:distance(item)})).sort((a,b)=>a.km-b.km)[0] ?? null;
}
