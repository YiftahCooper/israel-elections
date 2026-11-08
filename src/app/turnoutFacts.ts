// The Turnout tab's election facts (owner, 8 Nov: "total possible votes ... growth since last election as a percentage
// and a number"). Official national totals of every election come from the build (virtual:election-totals); the
// selected election's figures come from the open scenario, so a what-if turnout shows here at once.
import TOTALS from 'virtual:election-totals';
import type { ElectionTotalsRow } from '../../scripts/election-totals-runtime.ts';
import { RULESETS } from '../engine/rules.ts';
import { thresholdVotes } from '../engine/allocate.ts';

export type { ElectionTotalsRow };
export const ELECTION_TOTALS: readonly ElectionTotalsRow[] = TOTALS;

export const totalsOf = (id: string) => ELECTION_TOTALS.find((t) => t.id === id) ?? null;
/** The election before this one, or null for the first (1949). */
export function previousTotals(id: string): ElectionTotalsRow | null {
  const i = ELECTION_TOTALS.findIndex((t) => t.id === id);
  return i > 0 ? ELECTION_TOTALS[i - 1] : null;
}
export const turnoutPct = (cast: number, registered: number) => (registered > 0 ? (100 * cast) / registered : 0);

/** A change between two counts: the difference and, when the earlier count is positive, its relative size in %. */
export function countChange(now: number, before: number) {
  return { diff: now - before, rel: before > 0 ? (100 * (now - before)) / before : null };
}

/** The statutory threshold of an official election, as a percentage and in votes (⌈threshold × valid⌉); null when
 *  the law set no percentage threshold (1949). */
export function officialThreshold(row: ElectionTotalsRow): { pct: number; votes: number } | null {
  const t = RULESETS[row.ruleSetId]?.threshold;
  if (!t || t.num === 0n) return null;
  return { pct: Number(t.num * 10000n / t.den) / 100, votes: Number(thresholdVotes(t, BigInt(row.valid))) };
}

/** "2022", or "April 2019" when another election fell in the same year. */
export function electionWhen(row: ElectionTotalsRow, lang: 'he' | 'en'): string {
  const year = row.date.slice(0, 4);
  if (ELECTION_TOTALS.filter((t) => t.date.slice(0, 4) === year).length < 2) return year;
  const month = new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', { month: 'long', timeZone: 'UTC' }).format(new Date(`${row.date}T00:00:00Z`));
  return `${month} ${year}`;
}
