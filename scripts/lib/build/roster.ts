// Candidate-roster rules shared by every election: contiguous ranks, roster coverage flags
// (candidatesUnavailable / candidatesTruncated) and registered candidates the official results
// notice did not seat (notSeated). Parsing each era's gazette layout stays in its own module.
import type { Check } from './validate.ts';

export const candidateId = (listId: string, rank: number) => `${listId}#${rank}`;

/** Ranks must be exactly 1..n after sorting; `nonEmpty` also rejects an empty roster. */
export function checkContiguousRanks(check: Check, label: string, candidates: readonly { rank: number }[], { nonEmpty = true } = {}) {
  check((!nonEmpty || candidates.length > 0) && candidates.every((c, i) => c.rank === i + 1), `${label}: ranks not contiguous (${candidates.map(c => c.rank).join(',')})`);
}
/** Sorts a parsed roster by rank in place, then requires contiguous ranks. */
export function sortAndCheckRanks<T extends { rank: number }>(check: Check, label: string, candidates: T[], opts?: { nonEmpty?: boolean }): T[] {
  candidates.sort((a, b) => a.rank - b.rank);
  checkContiguousRanks(check, label, candidates, opts);
  return candidates;
}

export type Coverage = 'complete' | 'truncated' | 'unavailable';
/** Roster flags as serialized on a list record. Two conventions exist and both are kept for
 *  byte-identical output; the app treats an absent flag as false:
 *    'explicit'  (k1–k7, k13–k15): a transcribed roster always carries candidatesTruncated (true/false);
 *    'when-set'  (k8–k12, k16–k17): a flag appears only when true. */
export function rosterFlags(coverage: Coverage, style: 'explicit' | 'when-set'): { candidatesUnavailable?: true; candidatesTruncated?: boolean } {
  if (coverage === 'unavailable') return { candidatesUnavailable: true };
  if (style === 'explicit') return { candidatesTruncated: coverage === 'truncated' };
  return coverage === 'truncated' ? { candidatesTruncated: true } : {};
}

/** Registered candidates ranked above the last elected member whom the official results notice does
 *  not list as elected (e.g. 1949 withdrawals, the 1961 Liberals): the seat passed to the next. */
export function notSeatedRanks(electedRanks: readonly number[], candidateRanks: readonly number[]): Set<number> {
  const last = Math.max(0, ...electedRanks);
  return new Set(candidateRanks.filter(rank => rank < last && !electedRanks.includes(rank)));
}
export const notSeatedNoteHe = (c: { nameHe: string; rank: number }) =>
  `${c.nameHe} (מקום ${c.rank}) אינו מופיע בין הנבחרים בהודעת התוצאות הרשמית; המנדט עבר למועמד הבא.`;
