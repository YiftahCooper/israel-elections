// Counterfactual analysis built on the deterministic engine: exact marginal-vote searches,
// sweeps with exact breakpoints, and allocation comparisons. Every answer is verified by running
// the full allocation at the reported vote count and at one vote less.
import { allocate } from './allocate.ts';
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
  const lists = input.lists.map((l) => ({ ...l }));
  const t = lists.find((l) => l.id === target);
  if (!t) return null;
  const sign = dir === 'gain' ? 1n : -1n;
  if (dir === 'lose' && t.votes < k) return null;
  t.votes += sign * k;
  if (source.kind === 'new') return { ...input, lists };
  if (source.kind === 'transfer') {
    const o = lists.find((l) => l.id === source.listId);
    if (!o || o.id === target) return null;
    if (dir === 'gain' && o.votes < k) return null;
    o.votes -= sign * k;
    return { ...input, lists };
  }
  const pool = lists.filter((l) => l.id !== target && (source.listIds.length === 0 || source.listIds.includes(l.id)) && !l.withdrawn);
  const total = pool.reduce((s, l) => s + l.votes, 0n);
  if (dir === 'gain' && total < k) return null;
  if (total === 0n) return null;
  const share = splitProportional(k, pool.map((l) => l.votes));
  pool.forEach((l, i) => { l.votes -= sign * share[i]; });
  return { ...input, lists };
}

/** exact largest-remainder split of k in proportion to weights */
export function splitProportional(k: bigint, weights: bigint[]): bigint[] {
  const sum = weights.reduce((a, b) => a + b, 0n);
  if (sum === 0n) return weights.map(() => 0n);
  const base = weights.map((w) => (k * w) / sum);
  let left = k - base.reduce((a, b) => a + b, 0n);
  const order = weights.map((w, i) => ({ i, r: k * w - base[i] * sum })).sort((a, b) => (b.r > a.r ? 1 : b.r < a.r ? -1 : a.i - b.i));
  for (const { i } of order) { if (left <= 0n) break; base[i] += 1n; left -= 1n; }
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
  reason?: 'already' | 'infeasible' | 'limit';
  limit: bigint;
}

const seatsOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.seats ?? 0;
const qualifiedOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.qualified ?? false;

export type Goal = (after: AllocationResult, before: AllocationResult) => boolean;
/** A goal marked monotone is proven to hold for every count above its first success, so the binary
 *  search answer is already minimal. Threshold goals qualify: a list's share of valid votes changes in
 *  one direction only as votes move towards (or away from) it, under every vote source. */
const monotone = (g: Goal): Goal => Object.assign(g, { monotone: true });
export const goals = {
  seatGain: (id: string): Goal => (a, b) => seatsOf(a, id) > seatsOf(b, id),
  seatLoss: (id: string): Goal => (a, b) => seatsOf(a, id) < seatsOf(b, id),
  qualify: (id: string): Goal => monotone((a) => qualifiedOf(a, id)),
  disqualify: (id: string): Goal => monotone((a) => !qualifiedOf(a, id)),
  seatsAtLeast: (id: string, n: number): Goal => (a) => seatsOf(a, id) >= n,
  groupSeatsAtLeast: (ids: string[], n: number): Goal => (a) => ids.reduce((s, id) => s + seatsOf(a, id), 0) >= n,
  groupSeatsBelow: (ids: string[], n: number): Goal => (a) => ids.reduce((s, id) => s + seatsOf(a, id), 0) < n,
};

function limitFor(input: AllocationInput, target: string, source: VoteSource, dir: Direction): bigint {
  const total = input.lists.reduce((s, l) => s + l.votes, 0n);
  const t = input.lists.find((l) => l.id === target)?.votes ?? 0n;
  if (dir === 'lose') return t;
  if (source.kind === 'new') return total * 4n + 1000n;
  if (source.kind === 'transfer') return input.lists.find((l) => l.id === source.listId)?.votes ?? 0n;
  return input.lists.filter((l) => l.id !== target && (source.listIds.length === 0 || source.listIds.includes(l.id))).reduce((s, l) => s + l.votes, 0n);
}

/** Smallest k ≥ 1 such that goal(allocate(perturb(k))) holds, found by exponential + binary search
 *  and then checked for non-monotonic behaviour by sampling below the answer. */
/** Counts up to this many votes below a found answer are checked one by one (about 17µs each), which
 *  proves minimality even where the outcome is not monotonic in the vote count. */
export const EXHAUSTIVE_LIMIT = 50_000;

export function minimalChange(input: AllocationInput, target: string, source: VoteSource, goal: Goal, dir: Direction = 'gain', exhaustiveLimit = EXHAUSTIVE_LIMIT): SearchResult {
  const before = allocate(input);
  const limit = limitFor(input, target, source, dir);
  const test = (k: bigint): AllocationResult | null => { const p = perturb(input, target, source, k, dir); return p ? allocate(p) : null; };
  const ok = (k: bigint) => { const r = test(k); return r !== null && goal(r, before); };
  if (goal(before, before)) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, exact: true, reason: 'already', limit };
  if (limit < 1n) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, exact: true, reason: 'infeasible', limit };
  let hi = 1n;
  while (hi < limit && !ok(hi)) hi = hi * 2n > limit ? limit : hi * 2n;
  if (!ok(hi)) return { found: false, votes: null, before, after: null, lastFailing: hi, nonMonotonic: false, exact: false, reason: 'limit', limit };
  let lo = hi / 2n; // ok(lo) is false (or lo = 0)
  while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (ok(mid)) hi = mid; else lo = mid; }
  // Binary search assumes the outcome is monotonic in the vote count, which threshold crossings,
  // agreements and quota rounding can break. Check every smaller count (or, above the limit, a dense
  // regular grid of them) and report the smallest success.
  const found = hi;
  let exact = true;
  const isMonotone = (goal as Goal & { monotone?: boolean }).monotone === true;
  const gridLimit = BigInt(Math.max(1, exhaustiveLimit));
  const step = isMonotone ? hi : hi - 1n <= gridLimit ? 1n : (hi - 1n + gridLimit - 1n) / gridLimit;
  if (!isMonotone && step > 1n) exact = false;
  for (let k = step; k < hi; k += step) {
    if (ok(k)) {
      // with a grid, refine to the first success after the last checked failure
      let b = k;
      if (step > 1n) for (let x = k - step + 1n; x < k; x++) if (ok(x)) { b = x; break; }
      hi = b; lo = b - 1n;
      break;
    }
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
  const at = (v: bigint) => allocate({ ...input, lists: input.lists.map((l) => (l.id === target ? { ...l, votes: v } : l)) });
  const mk = (a: bigint, b: bigint, r: AllocationResult): SweepSegment => ({ from: a, to: b, seats: Object.fromEntries(r.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats])), qualified: r.lists.filter((l) => l.qualified).map((l) => l.id) });
  if (to < from) return { segments: [], exact: true, step: 1n };
  const span = to - from;
  const step = span <= BigInt(maxEvaluations) ? 1n : (span + BigInt(maxEvaluations) - 1n) / BigInt(maxEvaluations);
  const segs: SweepSegment[] = [];
  let curStart = from; let curRes = at(from); let curSig = signature(curRes);
  let prev = from;
  for (let x = from + step; ; x += step) {
    const v = x > to ? to : x;
    const r = at(v); const sig = signature(r);
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
    prev = v;
    if (v === to) break;
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
    const r = allocate({ ...input, rules: { ...input.rules, threshold: t } });
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
