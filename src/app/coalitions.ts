import type { GovernmentIndividual, GovernmentParticipant, GovernmentSupport } from '../data/aftermath.ts';
import type { CoalitionChoices, CoalitionRole, SimList } from '../model/scenario.ts';
/** Minimal winning coalitions: sets of lists with at least `majority` seats in which every member is
 *  needed (removing the smallest member drops below the majority). Every set must contain `required`.
 *
 *  Depth-first over the lists in their given order. A set that reaches the majority is never extended,
 *  because any superset of a winning set has a superfluous member; a branch stops when even all the
 *  remaining lists could not reach the majority. Results are ordered as the former exhaustive
 *  enumeration ordered them: by size, then seats, then by the bitmask of positions (first list = bit 0). */
export function minimalWinning<T extends { id: string; n: number }>(items: readonly T[], majority: number, required: readonly string[] = [], limit = 100_000) {
  const N = items.length;
  const suffix = new Array<number>(N + 1).fill(0);
  for (let i = N - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + items[i].n;
  const need = new Set(required);
  const out: { ids: string[]; n: number; key: bigint }[] = [];
  const chosen: number[] = [];
  let truncated = false;
  const visit = (i: number, sum: number, min: number, missing: number) => {
    if (out.length >= limit) { truncated = true; return; }
    if (sum >= majority) {
      if (missing === 0 && sum - min < majority) {
        let key = 0n; for (const k of chosen) key |= 1n << BigInt(k);
        out.push({ ids: chosen.map((k) => items[k].id), n: sum, key });
      }
      return;
    }
    if (i >= N || sum + suffix[i] < majority) return;
    // with: required lists must be taken, so their "without" branch is skipped
    chosen.push(i);
    visit(i + 1, sum + items[i].n, Math.min(min, items[i].n), missing - (need.has(items[i].id) ? 1 : 0));
    chosen.pop();
    if (!need.has(items[i].id)) visit(i + 1, sum, min, missing);
  };
  const missing = required.filter((id) => items.some((x) => x.id === id)).length;
  if (missing === required.length) visit(0, 0, Infinity, missing);
  out.sort((a, b) => a.ids.length - b.ids.length || a.n - b.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { coalitions: out.map(({ ids, n }) => ({ ids, n })), truncated };
}

/** The confidence vote that forms a government, from the seats of each coalition role. Members and outside
 *  supporters vote for; lists abstaining by arrangement abstain; every other seat is assumed to vote against
 *  (absences are not modelled). Basic Law: The Government §13(d) requires the Knesset's expression of
 *  confidence, and with no special majority there, Basic Law: The Knesset §25 applies: a majority of those
 *  voting, abstainers not counted, so investiture needs more for than against, not 61. `majority` (61 of
 *  120) is a majority of all members, which a constructive no-confidence vote needs (The Government §28(b)):
 *  a government with that many votes cannot be replaced while they hold. */
export function governmentVote({ members, support, abstain, total }: { members: number; support: number; abstain: number; total: number }) {
  const votesFor = members + support;
  const against = total - votesFor - abstain;
  const majority = Math.floor(total / 2) + 1;
  return {
    members, support, abstain, votesFor, against, majority,
    /** fewest votes for that are more than the votes against */
    forNeeded: Math.floor((total - abstain) / 2) + 1,
    passes: votesFor > against,
    stable: votesFor >= majority,
  };
}
export type GovernmentVote = ReturnType<typeof governmentVote>;

/** The researched government (data/meta/aftermath, docs/source-policy.md) as Coalitions roles: members In, outside
 *  support Support, arranged abstention Abstain. A confidence vote alone, an "other" relationship or an unknown one
 *  is not an arrangement and stays Any. Rows keep their recorded certainty; nothing is upgraded. `choices` is null
 *  when a recorded partner has no seated unit in this scenario (an edit removed it, or the research names a
 *  post-election faction without ballot letters). */
export function recordedRoles(rows: readonly GovernmentParticipant[], lists: readonly SimList[], units: readonly { id: string; listId: string }[]) {
  const recorded = rows.map((r) => {
    const role: CoalitionRole | null = r.certainty === 'unknown' ? null : r.role === 'member-with-ministries' || r.role === 'member-without-ministries' ? 'in'
      : r.role === 'outside-support' ? 'support' : r.role === 'abstained-by-arrangement' ? 'abstain' : null;
    const list = r.letters ? lists.find((l) => l.letters === r.letters && l.originIds.length === 1 && l.originIds[0] === l.id) : undefined;
    return { r, role, list, units: list ? units.filter((x) => x.listId === list.id).map((x) => x.id) : [] };
  });
  const pick = (k: CoalitionRole) => recorded.filter((x) => x.role === k).flatMap((x) => x.units);
  const choices: CoalitionChoices | null = recorded.length && recorded.every((x) => !x.role || x.units.length)
    ? { in: pick('in'), support: pick('support'), abstain: pick('abstain'), out: [] } : null;
  return { recorded, choices };
}

/** The line under the partners: how members compare with the recorded first government. One definition with the
 *  Recorded first government button: the members (In) that `recordedRoles` loads from the research record, never
 *  the separate sourced grouping. Outside support is reported only when the members match. */
export function firstGovernmentComparison(members: readonly string[], support: readonly string[], recorded: CoalitionChoices | null) {
  const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id) => b.includes(id));
  if (!recorded?.in.length) return 'unavailable' as const;
  if (!same(members, recorded.in)) return 'different' as const;
  return recorded.support.length && same(support, recorded.support) ? 'matches-with-support' as const : 'matches' as const;
}

/** Why the loaded roles' arithmetic differs from the recorded confidence vote, from the research itself
 *  (data/meta/aftermath): individual MKs who voted apart from their list (individuals[]; modelled only in a
 *  later stage, israel-elections-private docs/design/individual-mks.md), roles left Any, partial participation counted whole, MKs who
 *  voted neither way, and the research's own reconciliation status. null when there is no recorded vote or
 *  the totals agree. */
export type VoteGapReason =
  | { kind: 'individual'; ind: GovernmentIndividual }
  | { kind: 'unknown' | 'vote-only'; row: GovernmentParticipant }
  | { kind: 'partial'; row: GovernmentParticipant; whole: number }
  | { kind: 'not-voting'; n: number };
export function recordedVoteGap(gov: Pick<GovernmentSupport, 'confidenceVote' | 'individuals' | 'reconciliation'>, vote: GovernmentVote,
  recorded: ReturnType<typeof recordedRoles>['recorded'], seatsOf: (units: string[]) => number, total: number) {
  const cv = gov.confidenceVote;
  if (!cv || (vote.votesFor === cv.for && vote.against === cv.against)) return null;
  const reasons: VoteGapReason[] = [
    ...(gov.individuals ?? []).map((ind) => ({ kind: 'individual' as const, ind })),
    ...recorded.filter((x) => x.role === null).map((x) => ({ kind: x.r.role === 'confidence-vote-only' && x.r.certainty !== 'unknown' ? 'vote-only' as const : 'unknown' as const, row: x.r })),
    ...recorded.filter((x) => x.role !== null && x.r.seats !== null && x.units.length && x.r.seats < seatsOf(x.units)).map((x) => ({ kind: 'partial' as const, row: x.r, whole: seatsOf(x.units) })),
  ];
  const notVoting = total - cv.for - cv.against - vote.abstain;
  if (notVoting > 0) reasons.push({ kind: 'not-voting', n: notVoting });
  return { recorded: { for: cv.for, against: cv.against }, status: gov.reconciliation.status, reasons };
}
export type RecordedVoteGap = NonNullable<ReturnType<typeof recordedVoteGap>>;
