import { rat, reduce, type Rational } from '../engine/rational.ts';
import type { SimList } from './scenario.ts';

/** Map historical locality columns to their scenario descendants, without rounding ballots.
 * National votes determine each descendant's share; all-zero descendants share equally.
 * Missing origins remain under null so callers can display or reject unassigned votes.
 * Conversion to display numbers or whole-ballot allocation belongs at the caller boundary. */
export function historicalLocalVotes(lists: Pick<SimList, 'id' | 'originIds' | 'votes'>[], listIds: string[], votes: readonly (number | bigint)[]): Map<string | null, Rational> {
  const totals = new Map<string | null, Rational>(lists.map(l => [l.id, rat(0)]));
  const add = (id: string | null, v: Rational) => {
    const prev = totals.get(id) ?? rat(0);
    totals.set(id, reduce(rat(prev.num * v.den + v.num * prev.den, prev.den * v.den)));
  };
  listIds.forEach((origin, k) => {
    const amount = BigInt(votes[k] ?? 0);
    if (!amount) return;
    const sharers = lists.filter(l => l.originIds.includes(origin));
    if (!sharers.length) { add(null, rat(amount)); return; }
    const total = sharers.reduce((n, l) => n + BigInt(l.votes), 0n);
    const denominator = total || BigInt(sharers.length);
    for (const l of sharers) add(l.id, rat(amount * (total ? BigInt(l.votes) : 1n), denominator));
  });
  return totals;
}
