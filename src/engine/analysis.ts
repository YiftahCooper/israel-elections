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
  reason?: 'already' | 'infeasible' | 'limit';
  limit: bigint;
}

const seatsOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.seats ?? 0;
const qualifiedOf = (r: AllocationResult, id: string) => r.lists.find((l) => l.id === id)?.qualified ?? false;

export type Goal = (after: AllocationResult, before: AllocationResult) => boolean;
export const goals = {
  seatGain: (id: string): Goal => (a, b) => seatsOf(a, id) > seatsOf(b, id),
  seatLoss: (id: string): Goal => (a, b) => seatsOf(a, id) < seatsOf(b, id),
  qualify: (id: string): Goal => (a) => qualifiedOf(a, id),
  disqualify: (id: string): Goal => (a) => !qualifiedOf(a, id),
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
export function minimalChange(input: AllocationInput, target: string, source: VoteSource, goal: Goal, dir: Direction = 'gain'): SearchResult {
  const before = allocate(input);
  const limit = limitFor(input, target, source, dir);
  const test = (k: bigint): AllocationResult | null => { const p = perturb(input, target, source, k, dir); return p ? allocate(p) : null; };
  const ok = (k: bigint) => { const r = test(k); return r !== null && goal(r, before); };
  if (goal(before, before)) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, reason: 'already', limit };
  if (limit < 1n) return { found: false, votes: null, before, after: null, lastFailing: null, nonMonotonic: false, reason: 'infeasible', limit };
  let hi = 1n;
  while (hi < limit && !ok(hi)) hi = hi * 2n > limit ? limit : hi * 2n;
  if (!ok(hi)) return { found: false, votes: null, before, after: null, lastFailing: hi, nonMonotonic: false, reason: 'limit', limit };
  let lo = hi / 2n; // ok(lo) is false (or lo = 0)
  while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (ok(mid)) hi = mid; else lo = mid; }
  // Sample below the answer: if the goal already holds at a smaller count (possible when the change
  // also moves other lists across the threshold), report the smallest such count instead.
  let nonMonotonic = false;
  const samples = 64n;
  if (hi > samples) {
    let prev = 0n;
    for (let i = 1n; i < samples; i++) {
      const k = (hi * i) / samples;
      if (k <= prev) continue;
      if (ok(k)) {
        nonMonotonic = true;
        let l2 = prev; let h2 = k; // ok(prev) is false (smallest successful sample)
        while (h2 - l2 > 1n) { const mid = (l2 + h2) / 2n; if (ok(mid)) h2 = mid; else l2 = mid; }
        hi = h2; lo = l2;
        break;
      }
      prev = k;
    }
  }
  return { found: true, votes: hi, before, after: test(hi), lastFailing: lo, nonMonotonic, limit };
}

// ------------------------------------------------------------------- sweeps

export interface SweepSegment { from: bigint; to: bigint; seats: Record<string, number>; qualified: string[] }

const signature = (r: AllocationResult) => r.lists.map((l) => `${l.seats}${l.qualified ? 'q' : ''}`).join(',');

/** Allocation for every vote count of `target` in [from, to] (other lists fixed), as constant
 *  segments with exact integer boundaries. Sampling resolution `samples`; each change between two
 *  samples is located exactly by bisection. */
export function sweepVotes(input: AllocationInput, target: string, from: bigint, to: bigint, samples = 400): SweepSegment[] {
  const at = (v: bigint) => allocate({ ...input, lists: input.lists.map((l) => (l.id === target ? { ...l, votes: v } : l)) });
  const segs: SweepSegment[] = [];
  const mk = (a: bigint, b: bigint, r: AllocationResult): SweepSegment => ({ from: a, to: b, seats: Object.fromEntries(r.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats])), qualified: r.lists.filter((l) => l.qualified).map((l) => l.id) });
  if (to < from) return [];
  const span = to - from;
  const step = span / BigInt(samples) || 1n;
  let curStart = from; let curRes = at(from); let curSig = signature(curRes);
  for (let v = from + step; ; v += step) {
    const x = v > to ? to : v;
    const r = at(x);
    const sig = signature(r);
    if (sig !== curSig) {
      // locate boundaries between prev sample and x (there may be several)
      let a = x - step < curStart ? curStart : x - step;
      while (true) {
        let lo = a; let hi = x;
        while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (signature(at(mid)) === curSig) lo = mid; else hi = mid; }
        segs.push(mk(curStart, lo, curRes));
        curStart = hi; curRes = at(hi); curSig = signature(curRes);
        if (curSig === sig) break;
        a = hi;
      }
    }
    if (x === to) break;
  }
  segs.push(mk(curStart, to, curRes));
  return segs;
}

export interface ThresholdSegment { fromPct: Rational; toPct: Rational; seats: Record<string, number>; qualified: string[] }

/** Allocation for every threshold in [lo, hi] (fractions). Qualification only changes at
 *  threshold = votes_i / total, so the segments are exact. */
export function sweepThreshold(input: AllocationInput, lo: Rational, hi: Rational): ThresholdSegment[] {
  const total = input.lists.reduce((s, l) => s + l.votes, 0n);
  if (total === 0n) return [];
  const points = [...new Set(input.lists.filter((l) => l.votes > 0n).map((l) => `${l.votes}`))]
    .map((v) => rat(BigInt(v), total)).filter((p) => cmp(p, lo) > 0 && cmp(p, hi) <= 0).sort(cmp);
  const bounds = [lo, ...points, hi];
  const segs: ThresholdSegment[] = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const a = bounds[i]; const b = bounds[i + 1];
    if (cmp(a, b) === 0) continue;
    // a list passes iff votes/total ≥ t; inside (a, b] the qualified set equals that at t = b
    const r = allocate({ ...input, rules: { ...input.rules, threshold: b } });
    segs.push({ fromPct: a, toPct: b, seats: Object.fromEntries(r.lists.filter((l) => l.seats > 0).map((l) => [l.id, l.seats])), qualified: r.lists.filter((l) => l.qualified).map((l) => l.id) });
  }
  // merge adjacent identical segments
  const merged: ThresholdSegment[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && JSON.stringify(last.seats) === JSON.stringify(s.seats)) last.toPct = s.toPct; else merged.push({ ...s });
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
