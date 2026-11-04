// Analysis tasks that can run in a background worker or on the main thread with exactly the same
// code and result. Tasks and results are plain data (bigints included), so they cross postMessage.
import { goals, minimalChange, sweepVotes, type SearchResult, type SweepResult, type VoteSource } from '../engine/analysis.ts';
import type { AllocationInput } from '../engine/types.ts';

export interface SecurityItem { id: string; qualified: boolean; seats: number }
export interface SecurityFigure { value: number | null; exact: boolean; reason?: SearchResult['reason']; limit: number; nonMonotonic: boolean }
export interface SecurityRow { qualification: Partial<Record<SecurityPart, SecurityFigure>>; id: string; seats: number; gain: number | null; lose: number | null; qualify: number | null }
/** 'qualify' for a list below the threshold; 'gain' and 'lose' for a qualified list */
export type SecurityPart = 'qualify' | 'gain' | 'lose';

/** what a single-list search looks for: passing the threshold, one more seat, or the first loss */
export type ListGoal = SecurityPart | 'disqualify';

export type AnalysisTask =
  /** the smallest change of one list's votes that reaches the goal (the list-details boundary tools) */
  | { kind: 'listSearch'; input: AllocationInput; src: VoteSource; goal: ListGoal; id: string; seats: number }
  /** the smallest change of one list's votes that brings it to n seats (more: at least n; fewer: at most n) */
  | { kind: 'seatTarget'; input: AllocationInput; src: VoteSource; id: string; seats: number; n: number }
  /** one seat-security figure for one list */
  | { kind: 'security'; input: AllocationInput; src: VoteSource; part: SecurityPart; item: SecurityItem }
  /** the smallest transfer from one list to another that takes a group of lists across n seats */
  | { kind: 'groupTransfer'; input: AllocationInput; from: string; to: string; ids: string[]; n: number; below: boolean }
  /** every point in a vote range where the seats change */
  | { kind: 'sweep'; input: AllocationInput; target: string; from: bigint; to: bigint };

export interface TransferOutcome { found: boolean; votes: bigint | null; exact: boolean; reason?: SearchResult['reason'] }
export type TaskResult<T extends AnalysisTask> =
  T extends { kind: 'listSearch' | 'seatTarget' } ? SearchResult : T extends { kind: 'security' } ? SecurityFigure : T extends { kind: 'groupTransfer' } ? TransferOutcome : SweepResult;

export function runTask<T extends AnalysisTask>(task: T): TaskResult<T>;
export function runTask(task: AnalysisTask): SearchResult | SecurityFigure | TransferOutcome | SweepResult {
  switch (task.kind) {
    case 'listSearch': return listSearch(task.input, task.src, task.goal, task.id, task.seats);
    case 'seatTarget': return seatTarget(task.input, task.src, task.id, task.seats, task.n);
    case 'security': return securityPart(task.input, task.src, task.part, task.item);
    case 'groupTransfer': {
      const goal = task.below ? goals.groupSeatsBelow(task.ids, task.n) : goals.groupSeatsAtLeast(task.ids, task.n);
      const m = minimalChange(task.input, task.to, { kind: 'transfer', listId: task.from }, goal);
      return { found: m.found, votes: m.votes, exact: m.exact, reason: m.reason };
    }
    case 'sweep': return sweepVotes(task.input, task.target, task.from, task.to);
  }
}

export const partsOf = (item: SecurityItem): SecurityPart[] => (item.qualified ? ['gain', 'lose'] : ['qualify']);

/** One list's search; 'lose' looks for the first seat lost (or, with no seats, falling below the threshold). */
export function listSearch(input: AllocationInput, src: VoteSource, goal: ListGoal, id: string, seats: number): SearchResult {
  if (goal === 'disqualify') return minimalChange(input, id, src, goals.disqualify(id), 'lose');
  if (goal === 'qualify') return minimalChange(input, id, src, goals.qualify(id));
  if (goal === 'gain') return minimalChange(input, id, src, goals.seatGain(id));
  return minimalChange(input, id, src, seats > 0 ? goals.seatLoss(id) : goals.disqualify(id), 'lose');
}

/** The fewest votes moved (towards the list when n is above its seats, away from it when below) that
 *  bring it to n seats; when no count gives exactly n, the first count past it. */
export function seatTarget(input: AllocationInput, src: VoteSource, id: string, seats: number, n: number): SearchResult {
  return n > seats ? minimalChange(input, id, src, goals.seatsAtLeast(id, n)) : minimalChange(input, id, src, goals.seatsAtMost(id, n), 'lose');
}

/** The figure for one part: the minimum found (for 'lose', the votes that can go without loss), or null when none was found. */
export function securityPart(input: AllocationInput, src: VoteSource, part: SecurityPart, item: SecurityItem): SecurityFigure {
  const m = listSearch(input, src, part, item.id, item.seats);
  return { value: m.found ? Number(m.votes) - (part === 'lose' ? 1 : 0) : null, exact: m.exact, reason: m.reason, limit: Number(m.limit), nonMonotonic: m.nonMonotonic };
}

/** Assembles a list's row from its parts (all parts of `partsOf(item)` must be present). */
export function securityRow(item: SecurityItem, parts: Partial<Record<SecurityPart, SecurityFigure>>): SecurityRow {
  return item.qualified
    ? { qualification: parts, id: item.id, seats: item.seats, gain: parts.gain?.value ?? null, lose: parts.lose?.value ?? null, qualify: null }
    : { qualification: parts, id: item.id, seats: 0, gain: null, lose: null, qualify: parts.qualify?.value ?? null };
}
