// Deterministic implementation of Knesset seat allocation, Knesset Elections Law
// [Consolidated Version] 5729-1969, sections 81–82 (see docs/ELECTORAL-LAW.md).
//
//  81(a)  a list takes part only if votes ≥ threshold × all valid votes
//  81(b)  quota ("המודד") = whole number of (qualifying votes ÷ seats)
//  81(c)  each list gets ⌊votes ÷ quota⌋ seats
//  81(d)  remaining seats, one at a time, to the highest votes ÷ (seats + 1);
//         equal quotients are decided by a CEC lottery; (4) a list with ≤ half of the qualifying
//         votes that already holds half of all seats stops taking part
//  82(a)  two lists in an agreement count as one list for 81(d) only, if both passed 81(a)
//  82(b)  the pair's seats are divided between them by the full method of section 81
//
// No floating point is used for any decision.
import { cmp, floorDiv, rat, type Rational } from './rational.ts';
import type {
  AgreementStatus, AllocationInput, AllocationResult, EngineWarning, InternalDivision, ListResult,
  Quotient, RemainderStep, RuleSet, TieRecord, UnitResult,
} from './types.ts';

interface WorkUnit { id: string; votes: bigint; seats: number; initial: number; capped: boolean; capacity?: number }

const ratMulInt = (r: Rational, k: bigint): Rational => rat(r.num * k, r.den);

/** smallest integer v with v ≥ t × total */
export const thresholdVotes = (threshold: Rational, total: bigint): bigint => {
  const n = threshold.num * total;
  return n % threshold.den === 0n ? n / threshold.den : n / threshold.den + 1n;
};

export const passesThreshold = (votes: bigint, total: bigint, threshold: Rational): boolean =>
  votes * threshold.den >= threshold.num * total;

function computeQuota(votes: bigint, seats: number, rounding: RuleSet['quotaRounding']): Rational {
  if (seats <= 0) return rat(0n);
  if (rounding === 'floor') return rat(floorDiv(votes, BigInt(seats)));
  return rat(votes, BigInt(seats));
}

function initialSeats(votes: bigint, quota: Rational): number {
  if (quota.num === 0n) return 0;
  return Number(floorDiv(votes * quota.den, quota.num));
}

interface StageOptions {
  stage: string;
  method: RuleSet['remainderMethod'];
  seatsTotal: number; // size of the universe (120 nationally, the pair's seats internally)
  universeVotes: bigint; // all votes taking part in this universe
  quota: Rational;
  majorityCap: boolean;
  lotteryWinners: Record<string, string>;
  warnings: EngineWarning[];
  ties: TieRecord[];
}

function quotientFor(u: WorkUnit, o: StageOptions, roundGiven: Set<string>): Rational | null {
  switch (o.method) {
    case 'bader-ofer':
      return rat(u.votes, BigInt(u.seats + 1));
    case 'sainte-lague':
      return rat(u.votes, BigInt(2 * u.seats + 1));
    case 'largest-remainder': {
      if (roundGiven.has(u.id)) return null;
      // remainder = votes − quota × seats (may be compared exactly as a rational)
      const used = ratMulInt(o.quota, BigInt(u.seats));
      return rat(u.votes * used.den - used.num, used.den);
    }
  }
}

/** Awards `remaining` seats among `units` one at a time, recording every decision. */
function runRemainderStage(units: WorkUnit[], remaining: number, o: StageOptions): RemainderStep[] {
  const steps: RemainderStep[] = [];
  const roundGiven = new Set<string>();
  let awarded = units.reduce((s, u) => s + u.seats, 0);
  for (let step = 1; step <= remaining; step++) {
    if (o.method === 'largest-remainder' && units.every((u) => roundGiven.has(u.id) || u.capped)) roundGiven.clear();
    const quotients: Quotient[] = [];
    for (const u of units) {
      if (u.capacity !== undefined && u.seats >= u.capacity) u.capped = true;
      if (o.majorityCap && !u.capped && 2n * u.votes <= o.universeVotes && 2 * u.seats >= o.seatsTotal) u.capped = true;
      const value = quotientFor(u, o, roundGiven);
      quotients.push({ unitId: u.id, votes: u.votes, seats: u.seats, value: value ?? rat(-1n), eligible: !u.capped && value !== null && u.votes > 0n, capped: u.capped });
    }
    const eligible = quotients.filter((q) => q.eligible);
    if (eligible.length === 0) {
      o.warnings.push({ code: 'seats-unallocatable', message: `No list can receive seat ${awarded + 1} in stage ${o.stage}.`, data: { stage: o.stage, remaining: remaining - step + 1 } });
      break;
    }
    let best = eligible[0];
    for (const q of eligible) if (cmp(q.value, best.value) > 0) best = q;
    const tied = eligible.filter((q) => cmp(q.value, best.value) === 0);
    let winnerId = best.unitId;
    let tie: TieRecord | undefined;
    if (tied.length > 1) {
      const ids = tied.map((t) => t.unitId);
      // keyed by the exact tied set, so a recorded outcome can never decide a different tie
      const key = `${o.stage}:${step}:${[...ids].sort().join('|')}`;
      const forced = o.lotteryWinners[key];
      winnerId = forced && ids.includes(forced) ? forced : ids[0];
      tie = { key, tiedUnitIds: ids, chosen: winnerId, forced: Boolean(forced && ids.includes(forced)) };
      o.ties.push(tie);
      if (!tie.forced) o.warnings.push({ code: 'lottery-required', message: `Seat ${awarded + 1} (${o.stage}) is an exact tie between ${ids.join(', ')}; the law requires a CEC lottery. Showing ${winnerId} as the winner — choose the lottery outcome to change it.`, data: { key, ids } });
    }
    const winner = units.find((u) => u.id === winnerId)!;
    winner.seats += 1;
    awarded += 1;
    if (o.method === 'largest-remainder') roundGiven.add(winnerId);
    quotients.sort((a, b) => (a.eligible !== b.eligible ? (a.eligible ? -1 : 1) : cmp(b.value, a.value)));
    steps.push({ step, seatNumber: awarded, winnerUnitId: winnerId, quotients, tie });
  }
  return steps;
}

/** Allocates `seats` among members from scratch using the same method (section 82(b)). */
function divideWithinUnit(unitId: string, members: { id: string; votes: bigint; candidateCount?: number }[], seats: number, rules: RuleSet, base: Omit<StageOptions, 'stage' | 'seatsTotal' | 'universeVotes' | 'quota'>): InternalDivision {
  const totalVotes = members.reduce((s, m) => s + m.votes, 0n);
  let quota = rules.remainderMethod === 'sainte-lague' ? rat(0n) : computeQuota(totalVotes, seats, rules.quotaRounding);
  if (rules.remainderMethod !== 'sainte-lague' && quota.num === 0n && seats > 0) quota = rat(totalVotes, BigInt(seats));
  const work: WorkUnit[] = members.map((m) => {
    const capacity = rules.seatsCappedAtCandidates ? m.candidateCount : undefined;
    const init = Math.min(capacity ?? Infinity, rules.remainderMethod === 'sainte-lague' ? 0 : initialSeats(m.votes, quota));
    return { id: m.id, votes: m.votes, seats: init, initial: init, capped: false, capacity };
  });
  let given = work.reduce((s, w) => s + w.seats, 0);
  if (given > seats) {
    quota = rat(totalVotes, BigInt(seats));
    for (const w of work) { w.seats = Math.min(w.capacity ?? Infinity, initialSeats(w.votes, quota)); w.initial = w.seats; }
    given = work.reduce((s, w) => s + w.seats, 0);
  }
  const steps = runRemainderStage(work, seats - given, { ...base, stage: `internal:${unitId}`, seatsTotal: seats, universeVotes: totalVotes, quota });
  return {
    unitId, seats, totalVotes, quota,
    initial: Object.fromEntries(work.map((w) => [w.id, w.initial])),
    steps,
    final: Object.fromEntries(work.map((w) => [w.id, w.seats])),
  };
}

export function allocate(input: AllocationInput): AllocationResult {
  const { rules } = input;
  if (rules.seatsCappedAtCandidates && input.lists.some(l => l.candidateCount !== undefined && (!Number.isSafeInteger(l.candidateCount) || l.candidateCount < 0))) throw new Error('candidateCount must be a nonnegative safe integer');
  const capacity = (id: string) => rules.seatsCappedAtCandidates ? input.lists.find(l => l.id === id)!.candidateCount : undefined;
  const warnings: EngineWarning[] = [];
  const ties: TieRecord[] = [];
  const lotteryWinners = input.lotteryWinners ?? {};
  // ballots for a list that does not contest are not valid votes for the threshold base
  const totalValid = input.lists.reduce((s, l) => s + (l.withdrawn ? 0n : l.votes), 0n);
  const thrVotes = thresholdVotes(rules.threshold, totalValid);

  const qualified = new Set(
    input.lists.filter((l) => !l.withdrawn && l.votes > 0n && passesThreshold(l.votes, totalValid, rules.threshold)).map((l) => l.id),
  );
  const qualifyingVotes = input.lists.filter((l) => qualified.has(l.id)).reduce((s, l) => s + l.votes, 0n);

  // --- general quota and initial seats (81(b), 81(c))
  let quota = rules.remainderMethod === 'sainte-lague' ? rat(0n) : computeQuota(qualifyingVotes, rules.seats, rules.quotaRounding);
  if (qualified.size === 0) warnings.push({ code: 'no-qualifying-lists', message: 'No list passed the threshold; no seats can be allocated.' });
  if (rules.remainderMethod !== 'sainte-lague' && qualified.size > 0 && quota.num === 0n) {
    warnings.push({ code: 'zero-quota', message: 'Qualifying votes are fewer than seats, so the whole-number quota is 0. The exact (unrounded) quota is used instead.' });
    quota = rat(qualifyingVotes, BigInt(rules.seats));
  }
  const initial = new Map<string, number>();
  const computeInitial = () => {
    initial.clear();
    for (const l of input.lists) initial.set(l.id, qualified.has(l.id) && rules.remainderMethod !== 'sainte-lague' ? Math.min(capacity(l.id) ?? Infinity, initialSeats(l.votes, quota)) : 0);
  };
  computeInitial();
  let initialTotal = [...initial.values()].reduce((a, b) => a + b, 0);
  if (initialTotal > rules.seats) {
    warnings.push({ code: 'quota-over-allocation', message: `Rounding the quota down gives ${initialTotal} initial seats, more than ${rules.seats}. The statute does not cover this (it only arises with very small vote totals); the exact quota is used instead.`, data: { initialTotal } });
    quota = rat(qualifyingVotes, BigInt(rules.seats));
    computeInitial();
    initialTotal = [...initial.values()].reduce((a, b) => a + b, 0);
  }

  // --- agreements (82(a))
  const listIds = new Set(input.lists.map((l) => l.id));
  const withdrawn = new Set(input.lists.filter((l) => l.withdrawn).map((l) => l.id));
  const seenMember = new Set<string>();
  const agreements: AgreementStatus[] = [];
  const unitOf = new Map<string, string>();
  const unitMembers = new Map<string, string[]>();
  // Keep list and agreement units in separate namespaces. Preserve ordinary public IDs (including
  // recorded lottery keys), but escape an agreement ID when it collides with any list/unit ID.
  const reservedIds = new Set([...listIds, ...input.agreements.map((a) => a.id)]);
  const agreementUnitId = (id: string) => {
    if (!listIds.has(id)) return id;
    let key = JSON.stringify(['agreement', id]);
    while (reservedIds.has(key)) key = JSON.stringify(['agreement', key]);
    reservedIds.add(key);
    return key;
  };
  for (const a of input.agreements) {
    const members = [...new Set(a.members)];
    const status: AgreementStatus = { id: a.id, members, active: false, failedMembers: [] };
    if (members.some((m) => !listIds.has(m))) status.reason = 'unknown-list';
    else if (members.length < 2 || members.length > rules.maxAgreementSize) status.reason = 'too-many-members';
    else if (members.some((m) => seenMember.has(m))) status.reason = 'duplicate-membership';
    else if (members.some((m) => withdrawn.has(m))) { status.reason = 'member-withdrawn'; status.failedMembers = members.filter((m) => withdrawn.has(m)); }
    else {
      status.failedMembers = members.filter((m) => !qualified.has(m));
      if (status.failedMembers.length > 0 && rules.agreementRequiresAllQualify) status.reason = 'member-failed-threshold';
      else status.active = members.filter((m) => qualified.has(m)).length >= 2;
      if (!status.active && !status.reason) status.reason = 'member-failed-threshold';
    }
    members.forEach((m) => seenMember.add(m));
    if (status.active) {
      const inUnit = members.filter((m) => qualified.has(m));
      const unitId = agreementUnitId(a.id);
      for (const m of inUnit) unitOf.set(m, unitId);
      unitMembers.set(unitId, inUnit);
    }
    agreements.push(status);
  }

  // --- units for the remainder stage
  const work: WorkUnit[] = [];
  for (const l of input.lists) {
    if (!qualified.has(l.id)) continue;
    const u = unitOf.get(l.id);
    if (u) {
      let w = work.find((x) => x.id === u);
      if (!w) { w = { id: u, votes: 0n, seats: 0, initial: 0, capped: false }; work.push(w); }
      w.votes += l.votes; w.seats += initial.get(l.id)!; w.initial = w.seats;
    } else {
      const s = initial.get(l.id)!;
      work.push({ id: l.id, votes: l.votes, seats: s, initial: s, capped: false });
    }
  }

  if (rules.seatsCappedAtCandidates) for (const w of work) {
    const counts = (unitMembers.get(w.id) ?? [w.id]).map(capacity);
    w.capacity = counts.every(c => c !== undefined) ? counts.reduce<number>((sum, c) => sum + c!, 0) : undefined;
  }

  const base = { method: rules.remainderMethod, majorityCap: rules.majorityCap, lotteryWinners, warnings, ties };
  const remaining = Math.max(0, rules.seats - initialTotal);
  const remainderSteps = qualified.size > 0
    ? runRemainderStage(work, remaining, { ...base, stage: 'national', seatsTotal: rules.seats, universeVotes: qualifyingVotes, quota })
    : [];

  // --- internal division (82(b))
  const finalSeats = new Map<string, number>();
  const internalDivisions: InternalDivision[] = [];
  for (const w of work) {
    const members = unitMembers.get(w.id);
    if (!members) { finalSeats.set(w.id, w.seats); continue; }
    const div = divideWithinUnit(w.id, members.map((m) => ({ id: m, votes: input.lists.find((l) => l.id === m)!.votes, candidateCount: capacity(m) })), w.seats, rules, base);
    internalDivisions.push(div);
    for (const m of members) {
      finalSeats.set(m, div.final[m]);
      if (div.final[m] < initial.get(m)!) warnings.push({ code: 'internal-loss', message: `${m} ends with fewer seats (${div.final[m]}) than its own whole-quota allocation (${initial.get(m)}) because section 82(b) re-divides the pair's seats from scratch.`, data: { list: m } });
    }
  }

  const units: UnitResult[] = work.map((w) => ({
    id: w.id, memberIds: unitMembers.get(w.id) ?? [w.id], votes: w.votes, initialSeats: w.initial,
    remainderSeats: w.seats - w.initial, seats: w.seats, isAgreement: unitMembers.has(w.id), capped: w.capped,
  }));

  const lists: ListResult[] = input.lists.map((l) => {
    const agreement = input.agreements.find((a) => a.members.includes(l.id));
    return {
      id: l.id, votes: l.votes, qualified: qualified.has(l.id), withdrawn: Boolean(l.withdrawn),
      initialSeats: initial.get(l.id) ?? 0, seats: finalSeats.get(l.id) ?? 0,
      unitId: qualified.has(l.id) ? (unitOf.get(l.id) ?? l.id) : null,
      agreementId: agreement?.id ?? null, agreementActive: unitOf.has(l.id),
    };
  });

  const seatsAllocated = lists.reduce((s, l) => s + l.seats, 0);
  if (rules.maxAgreementSize > 2 && input.agreements.some((a) => a.members.length > 2)) {
    warnings.push({ code: 'agreement-rule-departure', message: 'An agreement with more than two lists is not permitted by section 67(a); it is computed here as an experimental rule.' });
  }

  return {
    rules, totalValid, thresholdVotes: thrVotes, thresholdExact: rat(rules.threshold.num * totalValid, rules.threshold.den),
    qualifyingVotes, unrepresentedVotes: totalValid - qualifyingVotes, quota,
    initialSeatsTotal: initialTotal, remainderSeatsTotal: seatsAllocated - initialTotal,
    lists, units, agreements, remainderSteps, internalDivisions, warnings, seatsAllocated,
  };
}
