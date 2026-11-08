// Running a joint list's parties as separate lists (Merge & split, and a joint list's page share this plan).
// Only a party given votes runs on its own. A party with no vote share (by default: no elected member, or no recorded
// candidate at all, such as Atid Ehad and Eretz Yisrael Shelanu on Religious Zionism in 2022) gets no list of its
// own, so a split never creates an empty 0-vote list; its candidates, like those without a recorded party, stay with
// the lead party's part (or, when the lead runs no list, with the part given the most votes).
import type { SimList } from './scenario.ts';

export interface PartySplitPart { index: number; votes: number; candidateIds: string[] }
export interface PartySplitPlan {
  /** the parties that run on their own, in the joint list's order */
  parts: PartySplitPart[];
  /** parties that get no list of their own (no vote share) */
  absorbed: number[];
  /** the party whose part takes the candidates of absorbed and unrecorded parties; -1 when nothing runs */
  home: number;
}

export function planPartySplit(l: Pick<SimList, 'parties' | 'candidates'>, votes: readonly number[]): PartySplitPlan {
  const parties = l.parties ?? [];
  const index = new Map(parties.map((p, i) => [p.id, i]));
  const running = parties.map((_, i) => i).filter((i) => (votes[i] ?? 0) > 0);
  const lead = index.get(l.candidates.find((c) => c.partyId && index.has(c.partyId))?.partyId ?? '') ?? 0;
  const home = running.includes(lead) ? lead : running.reduce((best, i) => (best < 0 || votes[i] > votes[best] ? i : best), -1);
  const ids = new Map(running.map((i) => [i, [] as string[]]));
  for (const c of l.candidates) {
    const own = c.partyId !== undefined && c.partyId !== null && index.has(c.partyId) ? index.get(c.partyId)! : lead;
    (ids.get(own) ?? ids.get(home))?.push(c.id);
  }
  return {
    parts: running.map((i) => ({ index: i, votes: votes[i], candidateIds: ids.get(i)! })),
    absorbed: parties.map((_, i) => i).filter((i) => !running.includes(i)),
    home,
  };
}

/** Does this party have a recorded candidate of its own on the list? */
export const hasOwnCandidates = (l: Pick<SimList, 'candidates'>, partyId: string) => l.candidates.some((c) => c.partyId === partyId);
