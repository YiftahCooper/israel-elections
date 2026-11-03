// Counterfactual analysis built on the deterministic engine: exact marginal-vote searches,
// sweeps with exact breakpoints, and allocation comparisons. Every answer is verified by running
// the full allocation at the reported vote count and at one vote less.
import { prepareAllocation } from './allocate.ts';
import { cmp, rat, type Rational } from './rational.ts';
import type { AllocationInput, AllocationResult, ListInput } from './types.ts';

/** Where the extra (or removed) votes come from / go to. These are different counterfactuals and
 *  generally give different answers. */
export type VoteSource =
  | { kind: 'new' } // additional voters: valid total grows
  | { kind: 'transfer'; listId: string } // from (or to) one other list: valid total fixed
  | { kind: 'proportional'; listIds: string[] }; // from (or to) a group, in proportion to their votes; [] = all other lists

export type Direction = 'gain' | 'lose';

export function perturb(input: AllocationInput, target: string, source: VoteSource, k: bigint, dir: Direction = 'gain'): AllocationInput | null {
  const votes = perturbation(input.lists, target, source, dir)(k);
  return votes && { ...input, lists: input.lists.map((l, i) => ({ ...l, votes: votes[i] })) };
}

/** The vote vector after moving k votes, or null when the move is impossible. The target, the
 *  other list and the proportional pool are resolved once, for searches over many k. */
function perturbation(lists: readonly ListInput[], target: string, source: VoteSource, dir: Direction): (k: bigint) => bigint[] | null {
  const votes = lists.map((l) => l.votes);
  const t = lists.findIndex((l) => l.id === target);
  const sign = dir === 'gain' ? 1n : -1n;
  const moveTarget = (k: bigint) => {
    if (t < 0 || (dir === 'lose' && votes[t] < k)) return null;
    const v = [...votes];
    v[t] += sign * k;
    return v;
  };
  if (source.kind === 'new') return moveTarget;
  if (source.kind === 'transfer') {
    const o = lists.findIndex((l) => l.id === source.listId);
    return (k) => {
      const v = moveTarget(k);
      if (!v || o < 0 || lists[o].id === target || (dir === 'gain' && v[o] < k)) return null;
      v[o] -= sign * k;
      return v;
    };
  }
  const pool = lists.flatMap((l, i) => (l.id !== target && (source.listIds.length === 0 || source.listIds.includes(l.id)) && !l.withdrawn ? [i] : []));
  const weights = pool.map((i) => votes[i]);
  const total = weights.reduce((a, b) => a + b, 0n);
  return (k) => {
    const v = moveTarget(k);
    if (!v || (dir === 'gain' && total < k) || total === 0n) return null;
    const share = splitProportional(k, weights);
    pool.forEach((i, j) => { v[i] -= sign * share[j]; });
    return v;
  };
}

/** exact largest-remainder split of k in proportion to weights */
export function splitProportional(k: bigint, weights: readonly bigint[]): bigint[] {
  const sum = weights.reduce((a, b) => a + b, 0n);
  if (sum === 0n) return weights.map(() => 0n);
  const base = weights.map((w) => (k * w) / sum);
  let left = k - base.reduce((a, b) => a + b, 0n);
  if (left <= 0n) return base;
  // the remaining votes go to the largest remainders, equal remainders in order
  const rem = weights.map((w, i) => k * w - base[i] * sum);
  const order = weights.map((_, i) => i).sort((a, b) => (rem[b] > rem[a] ? 1 : rem[b] < rem[a] ? -1 : a - b));
  for (const i of order) { if (left <= 0n) break; base[i] += 1n; left -= 1n; }
  return base;
}

export interface SearchResult {
  found: boolean;
  /** minimal whole number of votes */
  votes: bigint | null;
  before: AllocationResult;
  after: AllocationResult | null;
  /** largest examined count at which the goal is not yet met (votes − 1 when found) */
  lastFailing: bigint | null;
  /** the goal was met at some count, lost again at a larger one: answer is the smallest found */
  nonMonotonic: boolean;
  /** true when every smaller count was evaluated, so the answer is proven minimal */
  exact: boolean;
  reason?: 'already' | 'infeasible' | 'limit' | 'inconclusive';
  limit: bigint;
}

const seatsOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.seats ?? 0;
const qualifiedOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.qualified ?? false;

export type Goal = (after: AllocationResult, before: AllocationResult) => boolean;
type GoalFlags = { monotone?: boolean; seatsOnly?: boolean };
/** Built-in goals read only each list's seats and qualification, so searches may evaluate them on
 *  allocations computed without the audit trail. */
const seatsOnly = (g: Goal): Goal => Object.assign(g, { seatsOnly: true });
/** A goal marked monotone is proven to hold for every count above its first success, so the binary
 *  search answer is already minimal. Threshold goals qualify: a list's share of valid votes changes in
 *  one direction only as votes move towards (or away from) it, under every vote source. */
const monotone = (g: Goal): Goal => Object.assign(seatsOnly(g), { monotone: true });
export const goals = {
  seatGain: (id: string): Goal => seatsOnly((a, b) => seatsOf(a, id) > seatsOf(b, id)),
  seatLoss: (id: string): Goal => seatsOnly((a, b) => seatsOf(a, id) < seatsOf(b, id)),
  qualify: (id: string): Goal => monotone((a) => qualifiedOf(a, id)),
  disqualify: (id: string): Goal => monotone((a) => !qualifiedOf(a, id)),
  seatsAtLeast: (id: string, n: number): Goal => seatsOnly((a) => seatsOf(a, id) >= n),
  groupSeatsAtLeast: (ids: string[], n: number): Goal => seatsOnly((a) => ids.reduce((s, id) => s + seatsOf(a, id), 0) >= n),
  groupSeatsBelow: (ids: string[], n: number): Goal => seatsOnly((a) => ids.reduce((s, id) => s + seatsOf(a, id), 0) < n),
};

function limitFor(input: AllocationInput, target: string, source: VoteSource, dir: Direction): bigint {
  const total = input.lists.reduce((s, l) => s + l.votes, 0n);
  const t = input.lists.find((l) => l.id === target)?.votes ?? 0n;
  if (dir === 'lose') return t;
  if (source.kind === 'new') return total * 4n + 1000n;
  if (source.kind === 'transfer') return input.lists.find((l) => l.id === source.listId)?.votes ?? 0n;
  return input.lists.filter((l) => l.id !== target && (source.listIds.length === 0 || source.listIds.includes(l.id))).reduce((s, l) => s + l.votes, 0n);
}

// ------------------------------------------------- exact skipping for linear vote moves
//
// When every list's votes are linear in a count k (new voters: the target ± k; a transfer: the
// target ± k and the other list ∓ k; a sweep: the target's own count), each decision the engine
// records (PreparedAllocation.run `decisions`) is either the sign of a function linear in k or a
// whole number that is monotone in k, given the decisions before it. The counts sharing a full
// record therefore form one contiguous range, on which every seat and qualification is the same.
// So when two counts have equal records, every count between them has the same allocation and
// need not be evaluated. tests/analysis-regions.test.ts checks this vote by vote. Proportional
// moves are not linear (largest-remainder splitting is not monotone), so they are scanned in full.

const sameDecisions = (a: unknown[] | null, b: unknown[] | null) =>
  a !== null && b !== null && a.length === b.length && a.every((x, i) => x === b[i]);

/** The last index in [i, last] whose decisions equal `ref`, the decisions at i: every index up to
 *  it shares them. Found by doubling then bisection; `next` is the probe at the following index
 *  when that was evaluated. */
function extent<P>(i: bigint, last: bigint, probe: (j: bigint) => P, decisionsOf: (p: P) => unknown[] | null, ref: unknown[]): { end: bigint; next: P | null } {
  let good = i; let bad = last + 1n; let next: P | null = null;
  for (let d = 1n; good + d <= last; d *= 2n) {
    const q = probe(good + d);
    if (!sameDecisions(decisionsOf(q), ref)) { bad = good + d; next = q; break; }
    good += d;
  }
  while (bad - good > 1n) {
    const mid = (good + bad) / 2n; const q = probe(mid);
    if (sameDecisions(decisionsOf(q), ref)) good = mid; else { bad = mid; next = q; }
  }
  return { end: good, next };
}

interface Probe { ok: boolean; decisions: unknown[] | null }

/** The first index j in [0, count) with probe(j).ok, or −1. With `linear`, indices sharing the
 *  previous probe's decisions are skipped (they share its outcome). */
function firstOk(count: bigint, probe: (j: bigint) => Probe, linear: boolean): bigint {
  let p = count > 0n ? probe(0n) : null;
  for (let j = 0n; p;) {
    if (p.ok) return j;
    if (linear && p.decisions) {
      const { end, next } = extent(j, count - 1n, probe, (q) => q.decisions, p.decisions);
      j = end + 1n;
      p = j < count ? next ?? probe(j) : null;
    } else { j++; p = j < count ? probe(j) : null; }
  }
  return -1n;
}

/** Smallest k ≥ 1 such that goal(allocate(perturb(k))) holds, found by exponential + binary search
 *  and then checked for non-monotonic behaviour by sampling below the answer. */
/** Counts up to this many votes below a found answer are checked one by one, which proves
 *  minimality even where the outcome is not monotonic in the vote count. */
export const EXHAUSTIVE_LIMIT = 50_000;

export function minimalChange(input: AllocationInput, target: string, source: VoteSource, goal: Goal, dir: Direction = 'gain', exhaustiveLimit = EXHAUSTIVE_LIMIT): SearchResult {
  const prepared = prepareAllocation(input);
  const before = prepared.run(input.lists.map((l) => l.votes));
  const limit = limitFor(input, target, source, dir);
  const votesAt = perturbation(input.lists, target, source, dir);
  const test = (k: bigint): AllocationResult | null => { const v = votesAt(k); return v && prepared.run(v); };
  const { monotone: isMonotone = false, seatsOnly: untraced = false } = goal as Goal & GoalFlags;
  const ok = (k: bigint) => { const v = votesAt(k); return v !== null && goal(prepared.run(v, !untraced), before); };
  // scans: seats-only goals under linear moves may skip counts with equal decisions
  const linear = untraced && source.kind !== 'proportional';
  const probe = (k: bigint): Probe => {
    const v = votesAt(k);
    if (!v) return { ok: false, decisions: null };
    const decisions: unknown[] | undefined = linear ? [] : undefined;
    return { ok: goal(prepared.run(v, !untraced, decisions), before), decisions: decisions ?? null };
  };
  if (goal(before, before)) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, exact: true, reason: 'already', limit };
  if (limit < 1n) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, exact: true, reason: 'infeasible', limit };
  let hi = 1n;
  let hiOk = ok(hi);
  while (!hiOk && hi < limit) { hi = hi * 2n > limit ? limit : hi * 2n; hiOk = ok(hi); }
  if (!hiOk) {
    // Exponential probes can jump over an entire successful interval. An affordable range must
    // be checked in full before concluding that no feasible count achieves a non-monotone goal.
    if (!isMonotone && limit <= BigInt(exhaustiveLimit)) {
      const j = firstOk(limit, (j) => probe(1n + j), linear);
      if (j >= 0n) { const k = 1n + j; return { found: true, votes: k, before, after: test(k), lastFailing: k - 1n, nonMonotonic: true, exact: true, limit }; }
      return { found: false, votes: null, before, after: null, lastFailing: limit, nonMonotonic: false, exact: true, reason: 'limit', limit };
    }
    return { found: false, votes: null, before, after: null, lastFailing: hi, nonMonotonic: false, exact: isMonotone, reason: isMonotone ? 'limit' : 'inconclusive', limit };
  }
  let lo = hi / 2n; // ok(lo) is false (or lo = 0)
  while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (ok(mid)) hi = mid; else lo = mid; }
  // Binary search assumes the outcome is monotonic in the vote count, which threshold crossings,
  // agreements and quota rounding can break. Check every smaller count (or, above the limit, a dense
  // regular grid of them) and report the smallest success.
  const found = hi;
  let exact = true;
  const gridLimit = BigInt(Math.max(1, exhaustiveLimit));
  const step = isMonotone ? hi : hi - 1n <= gridLimit ? 1n : (hi - 1n + gridLimit - 1n) / gridLimit;
  if (!isMonotone && step > 1n) exact = false;
  // the counts step, 2·step, … below hi
  const j = firstOk((hi - 1n) / step, (j) => probe(step * (j + 1n)), linear);
  if (j >= 0n) {
    const k = step * (j + 1n);
    // with a grid, refine to the first success after the last checked failure
    const x = step > 1n ? firstOk(step - 1n, (i) => probe(k - step + 1n + i), linear) : -1n;
    hi = x >= 0n ? k - step + 1n + x : k; lo = hi - 1n;
  }
  const nonMonotonic = hi < found;
  return { found: true, votes: hi, before, after: test(hi), lastFailing: lo, nonMonotonic, exact, limit };
}

// ------------------------------------------------------------------- sweeps

export interface SweepSegment { from: bigint; to: bigint; seats: Record<string, number>; qualified: string[] }
export interface SweepResult { segments: SweepSegment[]; /** every integer evaluated */ exact: boolean; /** spacing of the evaluated counts */ step: bigint }

const signature = (r: AllocationResult) => r.lists.map((l) => `${l.seats}${l.qualified ? 'q' : ''}`).join(',');

/** Allocation for every vote count of `target` in [from, to], other lists fixed, as constant segments.
 *  Ranges up to `maxEvaluations` counts are evaluated vote by vote (exact). Wider ranges are evaluated
 *  on a regular grid of that many points, each change located to the exact vote by bisection; a change
 *  that reverts within one grid step could then be missed, and `exact` is false. */
export function sweepVotes(input: AllocationInput, target: string, from: bigint, to: bigint, maxEvaluations = EXHAUSTIVE_LIMIT): SweepResult {
  const prepared = prepareAllocation(input);
  const votes = input.lists.map((l) => l.votes);
  const at = (v: bigint, decisions?: unknown[]) => prepared.run(input.lists.map((l, i) => (l.id === target ? v : votes[i])), false, decisions);
  const mk = (a: bigint, b: bigint, r: AllocationResult): SweepSegment => ({ from: a, to: b, seats: Object.fromEntries(r.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats])), qualified: r.lists.filter((l) => l.qualified).map((l) => l.id) });
  if (to < from) return { segments: [], exact: true, step: 1n };
  const span = to - from;
  const step = span <= BigInt(maxEvaluations) ? 1n : (span + BigInt(maxEvaluations) - 1n) / BigInt(maxEvaluations);
  // evaluated counts: from + step, from + 2·step, …, ending exactly at `to`
  const last = span === 0n ? 1n : (span + step - 1n) / step;
  const point = (j: bigint) => (from + j * step > to ? to : from + j * step);
  const decisionsAt = (j: bigint) => { const d: unknown[] = []; at(point(j), d); return d; };
  const segs: SweepSegment[] = [];
  let curStart = from; let curRes = at(from); let curSig = signature(curRes);
  let prev = from;
  for (let j = 1n; j <= last; j++) {
    const v = point(j);
    const decisions: unknown[] = [];
    const r = at(v, decisions); const sig = signature(r);
    if (sig !== curSig) {
      let a = prev;
      // locate every change between the previous evaluated count and v
      while (true) {
        let lo = a; let hi = v;
        while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (signature(at(mid)) === curSig) lo = mid; else hi = mid; }
        segs.push(mk(curStart, lo, curRes));
        curStart = hi; curRes = at(hi); curSig = signature(curRes);
        if (curSig === sig) break;
        a = hi;
      }
    }
    // the following evaluated counts with v's decisions have v's allocation: no change there
    j = extent(j, last, decisionsAt, (d) => d, decisions).end;
    prev = point(j);
  }
  segs.push(mk(curStart, to, curRes));
  return { segments: segs, exact: step === 1n, step };
}

export interface ThresholdSegment { fromPct: Rational; toPct: Rational; seats: Record<string, number>; qualified: string[] }

/** Allocation for every threshold in [lo, hi] (fractions). Qualification only changes at
 *  threshold = votes_i / total, so the segments are exact. */
export function sweepThreshold(input: AllocationInput, lo: Rational, hi: Rational): ThresholdSegment[] {
  // the same denominator as the engine: withdrawn lists' ballots are not valid votes
  const active = input.lists.filter((l) => !l.withdrawn);
  const total = active.reduce((s, l) => s + l.votes, 0n);
  if (total === 0n) return [];
  const points = [...new Set(active.filter((l) => l.votes > 0n).map((l) => `${l.votes}`))]
    .map((v) => rat(BigInt(v), total)).filter((p) => cmp(p, lo) > 0 && cmp(p, hi) <= 0).sort(cmp);
  const bounds = [lo, ...points, hi];
  const segs: ThresholdSegment[] = [];
  const seg = (a: Rational, b: Rational, t: Rational): ThresholdSegment => {
    const r = prepareAllocation({ ...input, rules: { ...input.rules, threshold: t } }).run(input.lists.map((l) => l.votes), false);
    return { fromPct: a, toPct: b, seats: Object.fromEntries(r.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats])), qualified: r.lists.filter((l) => l.qualified).map((l) => l.id) };
  };
  // the qualified set is constant on (a, b]; the single point t = lo can differ when lo is a breakpoint
  if (active.some((l) => l.votes > 0n && cmp(rat(l.votes, total), lo) === 0)) segs.push(seg(lo, lo, lo));
  for (let i = 0; i + 1 < bounds.length; i++) {
    const a = bounds[i]; const b = bounds[i + 1];
    if (cmp(a, b) === 0) continue;
    // a list passes iff votes/total ≥ t; inside (a, b] the qualified set equals that at t = b
    segs.push(seg(a, b, b));
  }
  // merge adjacent identical segments
  const merged: ThresholdSegment[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && JSON.stringify(last.seats) === JSON.stringify(s.seats) && last.qualified.join() === s.qualified.join() && cmp(last.fromPct, last.toPct) !== 0) last.toPct = s.toPct; else merged.push({ ...s });
  }
  return merged;
}

// ------------------------------------------------------------- comparison

export interface ListOrigin { id: string; originIds: string[] }

export interface GroupDiff { key: string; aIds: string[]; bIds: string[]; seatsA: number; seatsB: number; votesA: bigint; votesB: bigint }

/** Compares two allocations whose list structures may differ (mergers, splits, new lists).
 *  Lists are grouped when they share any historical origin, so a merged list is compared with the
 *  sum of the lists it came from. */
export function compareAllocations(a: AllocationResult, aLists: ListOrigin[], b: AllocationResult, bLists: ListOrigin[]): GroupDiff[] {
  const parent = new Map<string, string>();
  const find = (x: string): string => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x)!)!); x = parent.get(x)!; } return x; };
  const union = (x: string, y: string) => { parent.set(find(x), find(y)); };
  const node = (side: 'a' | 'b', id: string) => `${side}:${id}`;
  for (const [side, ls] of [['a', aLists], ['b', bLists]] as const) for (const l of ls) {
    const n = node(side, l.id); if (!parent.has(n)) parent.set(n, n);
    for (const o of l.originIds) { const on = `o:${o}`; if (!parent.has(on)) parent.set(on, on); union(n, on); }
  }
  const groups = new Map<string, GroupDiff>();
  const add = (side: 'a' | 'b', id: string, res: AllocationResult) => {
    const root = find(node(side, id));
    const g = groups.get(root) ?? { key: root, aIds: [], bIds: [], seatsA: 0, seatsB: 0, votesA: 0n, votesB: 0n };
    const l = res.lists.find((x) => x.id === id);
    if (side === 'a') { g.aIds.push(id); g.seatsA += l?.seats ?? 0; g.votesA += l?.votes ?? 0n; }
    else { g.bIds.push(id); g.seatsB += l?.seats ?? 0; g.votesB += l?.votes ?? 0n; }
    groups.set(root, g);
  };
  for (const l of aLists) add('a', l.id, a);
  for (const l of bLists) add('b', l.id, b);
  return [...groups.values()];
}

export const listInputsEqual = (x: ListInput[], y: ListInput[]) => x.length === y.length && x.every((l, i) => l.id === y[i].id && l.votes === y[i].votes);
