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
//
// Structure (list ids, agreements, capacities, rules) is resolved once by `prepareAllocation`;
// each evaluation then works on a vector of vote counts by list index. Counterfactual searches
// reuse one preparation for every vote count they test.
import { isOfficialCandidateCapCase } from './candidateCapReference.ts';
import { floorDiv, rat, type Rational } from './rational.ts';
import type {
  AgreementStatus, AllocationInput, AllocationResult, EngineWarning, InternalDivision, ListResult,
  Quotient, RemainderStep, RuleSet, TieRecord, UnitResult,
} from './types.ts';

/** smallest integer v with v ≥ t × total */
export const thresholdVotes = (threshold: Rational, total: bigint): bigint => {
  const n = threshold.num * total;
  return n % threshold.den === 0n ? n / threshold.den : n / threshold.den + 1n;
};

export const passesThreshold = (votes: bigint, total: bigint, threshold: Rational): boolean =>
  votes * threshold.den >= threshold.num * total;

/** Divisor methods allocate every seat one at a time, with no whole-quota stage. */
export const isHighestAverage = (m: RuleSet['remainderMethod']) => m === 'sainte-lague' || m === 'dhondt' || m === 'modified-sainte-lague';

/** The whole-quota divisor: Droop is ⌊votes ÷ (seats + 1)⌋ + 1; the others use computeQuota. */
function quotaOf(rules: RuleSet, votes: bigint, seats: number): Rational {
  if (rules.remainderMethod === 'droop') return seats <= 0 ? rat(0n) : rat(floorDiv(votes, BigInt(seats + 1)) + 1n);
  return computeQuota(votes, seats + (rules.quotaSeatOffset ?? 0), rules.quotaRounding);
}

function computeQuota(votes: bigint, seats: number, rounding: RuleSet['quotaRounding']): Rational {
  if (seats <= 0) return rat(0n);
  if (rounding === 'floor') return rat(floorDiv(votes, BigInt(seats)));
  return rat(votes, BigInt(seats));
}

function initialSeats(votes: bigint, quota: Rational): number {
  if (quota.num === 0n) return 0;
  return Number(floorDiv(votes * quota.den, quota.num));
}

// ------------------------------------------------------------- remainder stage (81(d))

interface WorkUnit { id: string; votes: bigint; seats: number; initial: number; capped: boolean; capacity?: number }
/** A national competitor: one qualifying list, or an active agreement's qualifying members. */
interface Unit extends WorkUnit { members: number[]; isAgreement: boolean; placed: boolean }
const newUnit = (id: string, members: number[], isAgreement: boolean): Unit =>
  ({ id, votes: 0n, seats: 0, initial: 0, capped: false, members, isAgreement, placed: false });

interface StageOptions {
  stage: string;
  method: RuleSet['remainderMethod'];
  seatsTotal: number; // size of the universe (120 nationally, the pair's seats internally)
  universeVotes: bigint; // all votes taking part in this universe
  quota: Rational;
  majorityCap: boolean;
  remainderRequiresInitialSeat?: boolean;
  quotientRounding?: RuleSet['quotientRounding'];
  largestRemainderRepeat?: boolean;
  tiePolicy?: RuleSet['tiePolicy'];
  lotteryWinners: Record<string, string>;
  /** null when only the seat outcome is wanted: no steps or warnings are recorded */
  warnings: EngineWarning[] | null;
  /** receives each vote-dependent decision when not null (see `PreparedAllocation.run`) */
  decisions: unknown[] | null;
}

const NOT_COMPETING: Rational = rat(-1n);

/** The unit's 81(d) quotient as an exact fraction. For largest remainders it is the unused
 *  remainder, votes − quota × seats. */
function quotient(u: WorkUnit, o: StageOptions): Rational {
  switch (o.method) {
    case 'bader-ofer':
      return o.quotientRounding === 'floor' ? rat(u.votes / BigInt(u.seats + 1)) : rat(u.votes, BigInt(u.seats + 1));
    case 'sainte-lague':
      return rat(u.votes, BigInt(2 * u.seats + 1));
    case 'dhondt':
      return rat(u.votes, BigInt(u.seats + 1));
    case 'modified-sainte-lague': // first divisor 1.4, then 3, 5, 7…
      return u.seats === 0 ? rat(u.votes * 5n, 7n) : rat(u.votes, BigInt(2 * u.seats + 1));
    case 'largest-remainder':
    case 'droop':
      return rat(u.votes * o.quota.den - o.quota.num * BigInt(u.seats), o.quota.den);
  }
}

const cmpDesc = (a: Rational, b: Rational): number => {
  const l = b.num * a.den; const r = a.num * b.den;
  return l < r ? -1 : l > r ? 1 : 0;
};

/** Awards `remaining` seats among `units` one at a time, recording every decision when traced.
 *  Unit ids are unique within a stage. */
function runRemainderStage(units: WorkUnit[], remaining: number, o: StageOptions): RemainderStep[] {
  const steps: RemainderStep[] = [];
  const n = units.length;
  const lr = o.method === 'largest-remainder' || o.method === 'droop';
  const trace = o.warnings !== null;
  // a unit's quotient changes only when it wins a seat, so it is recomputed only then
  const value = units.map((u) => quotient(u, o));
  // 81(d)(4): votes are fixed within the stage, so "no more than half the votes" is too
  const halfOrLess = units.map((u) => 2n * u.votes <= o.universeVotes);
  if (o.majorityCap) o.decisions?.push(...halfOrLess);
  const givenThisRound = units.map(() => false); // largest remainders: one seat per unit per round
  const eligible = units.map(() => false);
  const tied: number[] = [];
  let awarded = units.reduce((s, u) => s + u.seats, 0);
  for (let step = 1; step <= remaining; step++) {
    if (lr && o.largestRemainderRepeat !== false && units.every((u, i) => givenThisRound[i] || u.capped)) givenThisRound.fill(false);
    let best = -1;
    tied.length = 0;
    for (let i = 0; i < n; i++) {
      const u = units[i];
      if (u.capacity !== undefined && u.seats >= u.capacity) u.capped = true;
      if (o.majorityCap && !u.capped && halfOrLess[i] && 2 * u.seats >= o.seatsTotal) u.capped = true;
      eligible[i] = !u.capped && !givenThisRound[i] && u.votes > 0n && (!o.remainderRequiresInitialSeat || u.initial > 0);
      if (!eligible[i]) continue;
      if (best < 0) { best = i; tied.push(i); continue; }
      // exact comparison by cross multiplication (denominators are positive)
      const c = value[i].num * value[best].den - value[best].num * value[i].den;
      if (c > 0n) { best = i; tied.length = 0; tied.push(i); } else if (c === 0n) tied.push(i);
    }
    o.decisions?.push(tied.length, ...tied);
    if (best < 0) {
      o.warnings?.push({ code: 'seats-unallocatable', message: `No list can receive seat ${awarded + 1} in stage ${o.stage}.`, data: { stage: o.stage, remaining: remaining - step + 1 } });
      break;
    }
    let winner = best; // the first of the tied units unless a lottery outcome is recorded
    let tie: TieRecord | undefined;
    if (tied.length > 1) {
      const ids = tied.map((i) => units[i].id);
      // keyed by the exact tied set, so a recorded outcome can never decide a different tie
      const key = `${o.stage}:${step}:${[...ids].sort().join('|')}`;
      const forced = o.lotteryWinners[key];
      const forcedAt = forced ? ids.indexOf(forced) : -1;
      if (forcedAt >= 0) winner = tied[forcedAt];
      if (trace) {
        tie = { key, tiedUnitIds: ids, chosen: units[winner].id, forced: forcedAt >= 0 };
        if (o.tiePolicy === 'unspecified') o.warnings!.push({ code: 'lottery-required', message: `Equal remainders in ${o.stage}; the inspected historical statute does not specify a tie procedure. ${tie.forced ? 'A supplied outcome is shown.' : 'The first unit is provisional.'}`, data: { key, ids, tiePolicy: 'unspecified' } });
        else if (!tie.forced) o.warnings!.push({ code: 'lottery-required', message: `Seat ${awarded + 1} (${o.stage}) is an exact tie between ${ids.join(', ')}; the law requires a CEC lottery. Showing ${tie.chosen} as the winner — choose the lottery outcome to change it.`, data: { key, ids } });
      }
    }
    let quotients: Quotient[] = [];
    if (trace) {
      quotients = units.map((u, i) => ({ unitId: u.id, votes: u.votes, seats: u.seats, value: lr && givenThisRound[i] ? NOT_COMPETING : value[i], eligible: eligible[i], capped: u.capped }));
      quotients.sort((a, b) => (a.eligible !== b.eligible ? (a.eligible ? -1 : 1) : cmpDesc(a.value, b.value)));
    }
    const w = units[winner];
    w.seats += 1;
    value[winner] = quotient(w, o);
    awarded += 1;
    if (lr) givenThisRound[winner] = true;
    if (trace) steps.push({ step, seatNumber: awarded, winnerUnitId: w.id, quotients, tie });
  }
  return steps;
}

type BaseOptions = Omit<StageOptions, 'stage' | 'seatsTotal' | 'universeVotes' | 'quota'>;

/** Allocates `seats` among members from scratch using the same method (section 82(b)). Each
 *  member's `seats` holds its result; the record is returned only when tracing. */
function divideWithinUnit(unitId: string, members: WorkUnit[], seats: number, rules: RuleSet, base: BaseOptions): InternalDivision | null {
  const totalVotes = members.reduce((s, m) => s + m.votes, 0n);
  const highestAverage = isHighestAverage(rules.remainderMethod);
  let quota = highestAverage ? rat(0n) : quotaOf(rules, totalVotes, seats);
  if (!highestAverage && (rules.quotaRounding === 'floor' || rules.remainderMethod === 'droop')) base.decisions?.push(quota.num);
  if (!highestAverage && quota.num === 0n && seats > 0) {
    base.warnings?.push({ code: 'zero-quota', message: 'The pair quota is zero; exact quota is a simulation fallback.', data: { stage: `internal:${unitId}` } });
    quota = rat(totalVotes, BigInt(seats));
  }
  const assign = () => {
    let given = 0;
    for (const w of members) { w.seats = w.initial = Math.min(w.capacity ?? Infinity, highestAverage ? 0 : initialSeats(w.votes, quota)); given += w.seats; }
    base.decisions?.push(...members.map((w) => w.initial));
    return given;
  };
  let given = assign();
  if (given > seats) {
    base.warnings?.push({ code: 'quota-over-allocation', message: `The historical pair quota gives ${given} seats for ${seats} places. The inspected statute does not resolve this; exact Hare is a simulation fallback.`, data: { stage: `internal:${unitId}`, initialTotal: given } });
    quota = rat(totalVotes, BigInt(seats));
    given = assign();
  }
  const steps = runRemainderStage(members, seats - given, { ...base, stage: `internal:${unitId}`, seatsTotal: seats, universeVotes: totalVotes, quota });
  if (!base.warnings) return null;
  return {
    unitId, seats, totalVotes, quota,
    initial: Object.fromEntries(members.map((w) => [w.id, w.initial])),
    steps,
    final: Object.fromEntries(members.map((w) => [w.id, w.seats])),
  };
}

// ------------------------------------------------------------------- preparation

type StructuralReason = 'unknown-list' | 'too-many-members' | 'duplicate-membership' | 'member-withdrawn';

interface PreparedAgreement {
  id: string;
  members: string[]; // without repeats, in the order given
  index: number[]; // list index of each member (when known)
  /** a reason that does not depend on votes, decided once */
  structural?: StructuralReason;
  failedWithdrawn: string[];
}

/** An allocation whose structure is fixed; `run` evaluates it for one vector of vote counts. */
export interface PreparedAllocation {
  input: AllocationInput;
  /** `votes[i]` replaces `input.lists[i].votes`; `trace` false omits steps, divisions and warnings.
   *  `decisions`, when given, receives every vote-dependent decision in order: each list's
   *  qualification, floor quotas, whole-quota seats, the half-votes test and each remainder
   *  step's tied set (winner first). Everything else, seats included, follows from these. */
  run(votes: readonly bigint[], trace?: boolean, decisions?: unknown[]): AllocationResult;
}

export function prepareAllocation(input: AllocationInput): PreparedAllocation {
  const { rules, lists } = input;
  const indexOf = new Map(lists.map((l, i) => [l.id, i]));
  if (indexOf.size !== lists.length) throw new Error('list ids must be unique');
  if (new Set(input.agreements.map((a) => a.id)).size !== input.agreements.length) throw new Error('agreement ids must be unique');
  if (rules.seatsCappedAtCandidates && lists.some(l => l.candidateCount !== undefined && (!Number.isSafeInteger(l.candidateCount) || l.candidateCount < 0))) throw new Error('candidateCount must be a nonnegative safe integer');
  const capacity = lists.map((l) => (rules.seatsCappedAtCandidates ? l.candidateCount : undefined));
  const withdrawn = lists.map((l) => Boolean(l.withdrawn));

  // 67(a)/82(a): everything except qualification and initial seats is known before any count
  const seenMember = new Set<string>();
  const agreements: PreparedAgreement[] = input.agreements.map((a) => {
    const members = [...new Set(a.members)];
    const p: PreparedAgreement = { id: a.id, members, index: members.map((m) => indexOf.get(m) ?? -1), failedWithdrawn: [] };
    if (p.index.includes(-1)) p.structural = 'unknown-list';
    else if (members.length < 2 || members.length > rules.maxAgreementSize) p.structural = 'too-many-members';
    else if (members.some((m) => seenMember.has(m))) p.structural = 'duplicate-membership';
    else if (p.index.some((i) => withdrawn[i])) { p.structural = 'member-withdrawn'; p.failedWithdrawn = members.filter((_, k) => withdrawn[p.index[k]]); }
    members.forEach((m) => seenMember.add(m));
    return p;
  });
  // each list's first agreement in input order, active or not
  const agreementOf: (string | null)[] = lists.map(() => null);
  for (const a of input.agreements) for (const m of a.members) { const i = indexOf.get(m); if (i !== undefined && agreementOf[i] === null) agreementOf[i] = a.id; }
  const departure = rules.maxAgreementSize > 2 && input.agreements.some((a) => a.members.length > 2);
  const lotteryWinners = input.lotteryWinners ?? {};
  const highestAverage = isHighestAverage(rules.remainderMethod);
  const n = lists.length;

  function run(votes: readonly bigint[], trace = true, decisions: unknown[] | null = null): AllocationResult {
    const allWarnings: EngineWarning[] = [];
    const warnings = trace ? allWarnings : null;
    // ballots for a list that does not contest are not valid votes for the threshold base
    let totalValid = 0n;
    for (let i = 0; i < n; i++) if (!withdrawn[i]) totalValid += votes[i];
    const qualified: boolean[] = new Array(n);
    let qualifyingVotes = 0n;
    let qualifiedCount = 0;
    const needed = rules.threshold.num * totalValid; // 81(a): votes × den ≥ num × total
    for (let i = 0; i < n; i++) {
      if (withdrawn[i]) { qualified[i] = false; continue; }
      const positive = votes[i] > 0n; const passes = votes[i] * rules.threshold.den >= needed;
      decisions?.push(positive, passes);
      qualified[i] = positive && passes;
      if (qualified[i]) { qualifyingVotes += votes[i]; qualifiedCount++; }
    }

    // --- general quota and initial seats (81(b), 81(c))
    let quota = highestAverage ? rat(0n) : quotaOf(rules, qualifyingVotes, rules.seats);
    if (!highestAverage && (rules.quotaRounding === 'floor' || rules.remainderMethod === 'droop')) decisions?.push(quota.num);
    if (qualifiedCount === 0) warnings?.push({ code: 'no-qualifying-lists', message: 'No list passed the threshold; no seats can be allocated.' });
    if (!highestAverage && qualifiedCount > 0 && quota.num === 0n) {
      warnings?.push({ code: 'zero-quota', message: 'Qualifying votes are fewer than seats, so the whole-number quota is 0. The exact (unrounded) quota is used instead.' });
      quota = rat(qualifyingVotes, BigInt(rules.seats));
    }
    const initial: number[] = new Array(n);
    const computeInitial = () => {
      let total = 0;
      for (let i = 0; i < n; i++) total += initial[i] = qualified[i] && !highestAverage ? Math.min(capacity[i] ?? Infinity, initialSeats(votes[i], quota)) : 0;
      decisions?.push(...initial);
      return total;
    };
    let initialTotal = computeInitial();
    if (initialTotal > rules.seats) {
      warnings?.push({ code: 'quota-over-allocation', message: rules.quotaSeatOffset ? `The historical seats-plus-one quota gives ${initialTotal} initial seats for ${rules.seats} places. The inspected statute does not resolve this; exact Hare is a simulation fallback.` : `Rounding the quota down gives ${initialTotal} initial seats, more than ${rules.seats}. The statute does not cover this (it only arises with very small vote totals); the exact quota is used instead.`, data: { initialTotal } });
      quota = rat(qualifyingVotes, BigInt(rules.seats));
      initialTotal = computeInitial();
    }

    // --- agreements (82(a)) and the units competing for remainder seats
    const statuses: AgreementStatus[] = [];
    const unitOf: (Unit | undefined)[] = new Array(n); // qualifying list → its unit
    // Keep list and agreement units in separate namespaces. Preserve ordinary public IDs (including
    // recorded lottery keys), but escape an agreement ID when it collides with any list/unit ID.
    let reservedIds: Set<string> | null = null;
    const agreementUnitId = (id: string) => {
      if (!indexOf.has(id)) return id;
      reservedIds ??= new Set([...indexOf.keys(), ...input.agreements.map((a) => a.id)]);
      let key = JSON.stringify(['agreement', id]);
      while (reservedIds.has(key)) key = JSON.stringify(['agreement', key]);
      reservedIds.add(key);
      return key;
    };
    for (const a of agreements) {
      const status: AgreementStatus = { id: a.id, members: [...a.members], active: false, failedMembers: [] };
      if (a.structural) {
        status.reason = a.structural;
        if (a.structural === 'member-withdrawn') status.failedMembers = [...a.failedWithdrawn];
      } else {
        status.failedMembers = a.members.filter((_, j) => !qualified[a.index[j]]);
        if (status.failedMembers.length > 0 && rules.agreementRequiresAllQualify) status.reason = 'member-failed-threshold';
        else status.active = a.members.length - status.failedMembers.length >= 2;
        if (!status.active && !status.reason) status.reason = 'member-failed-threshold';
        if (status.active && rules.agreementRequiresInitialSeat) {
          const noSeat = a.members.filter((_, j) => initial[a.index[j]] === 0);
          if (noSeat.length) { status.active = false; status.reason = 'member-no-initial-seat'; status.failedMembers = noSeat; }
        }
      }
      if (status.active) {
        const unit = newUnit(agreementUnitId(a.id), a.index.filter((i) => qualified[i]), true);
        for (const i of unit.members) unitOf[i] = unit;
      }
      statuses.push(status);
    }
    // in order of each unit's first qualifying list
    const units: Unit[] = [];
    for (let i = 0; i < n; i++) {
      if (!qualified[i]) continue;
      const u = unitOf[i] ??= newUnit(lists[i].id, [i], false);
      if (!u.placed) { u.placed = true; units.push(u); }
      u.votes += votes[i]; u.seats += initial[i]; u.initial = u.seats;
    }

    if (rules.seatsCappedAtCandidates) for (const u of units) {
      const counts = u.members.map((i) => capacity[i]);
      u.capacity = counts.every(c => c !== undefined) ? counts.reduce<number>((sum, c) => sum + c!, 0) : undefined;
    }

    const base: BaseOptions = { method: rules.remainderMethod, majorityCap: rules.majorityCap,
      remainderRequiresInitialSeat: rules.remainderRequiresInitialSeat, quotientRounding: rules.quotientRounding,
      largestRemainderRepeat: rules.largestRemainderRepeat, tiePolicy: rules.tiePolicy, lotteryWinners, warnings, decisions };
    const remaining = Math.max(0, rules.seats - initialTotal);
    const remainderSteps = qualifiedCount > 0
      ? runRemainderStage(units, remaining, { ...base, stage: 'national', seatsTotal: rules.seats, universeVotes: qualifyingVotes, quota })
      : [];

    // --- internal division (82(b))
    const finalSeats: number[] = new Array(n).fill(0);
    const internalDivisions: InternalDivision[] = [];
    for (const u of units) {
      if (!u.isAgreement) { finalSeats[u.members[0]] = u.seats; continue; }
      const parts = u.members.map((i) => ({ id: lists[i].id, votes: votes[i], seats: 0, initial: 0, capped: false, capacity: capacity[i] }));
      const div = divideWithinUnit(u.id, parts, u.seats, rules, base);
      if (div) internalDivisions.push(div);
      u.members.forEach((i, j) => {
        const { id, seats } = parts[j];
        finalSeats[i] = seats;
        if (seats < initial[i]) warnings?.push({ code: 'internal-loss', message: `${id} ends with fewer seats (${seats}) than its own whole-quota allocation (${initial[i]}) because section 82(b) re-divides the pair's seats from scratch.`, data: { list: id } });
      });
    }

    const unitResults: UnitResult[] = units.map((u) => ({
      id: u.id, memberIds: u.isAgreement ? u.members.map((i) => lists[i].id) : [u.id], votes: u.votes, initialSeats: u.initial,
      remainderSeats: u.seats - u.initial, seats: u.seats, isAgreement: u.isAgreement, capped: u.capped,
    }));

    let seatsAllocated = 0;
    const listResults: ListResult[] = lists.map((l, i) => {
      seatsAllocated += finalSeats[i];
      const u = unitOf[i];
      return {
        id: l.id, votes: votes[i], qualified: qualified[i], withdrawn: withdrawn[i],
        initialSeats: initial[i], seats: finalSeats[i],
        unitId: u?.id ?? null,
        agreementId: agreementOf[i], agreementActive: u?.isAgreement ?? false,
      };
    });

    // Earlier equal-remainder authority is unresolved. Warn only if choosing another
    // tied unit changes the final seats, including when a scenario outcome was supplied.
    if (trace) for (let i = allWarnings.length - 1; i >= 0; i--) {
      const w = allWarnings[i];
      if (w.code !== 'lottery-required' || w.data?.tiePolicy !== 'unspecified') continue;
      const { key, ids } = w.data as { key: string; ids: string[] };
      const affects = ids.some(id => {
        const other = prepareAllocation({ ...input, lotteryWinners: { ...lotteryWinners, [key]: id } }).run(votes, false);
        return other.lists.some((l, j) => l.seats !== listResults[j].seats);
      });
      if (!affects) allWarnings.splice(i, 1);
    }

    if (trace && rules.seatsCappedAtCandidates && !isOfficialCandidateCapCase(input, votes)) {
      // Compare final allocations: reaching capacity alone does not establish an effect.
      const uncapped = prepareAllocation({ ...input, rules: { ...rules, seatsCappedAtCandidates: false } }).run(votes, false);
      const changed = listResults.filter((l, i) => l.seats !== uncapped.lists[i].seats);
      if (changed.length) warnings!.push({
        code: 'inferred-candidate-cap',
        message: 'Candidate capacity changed the allocation. This method matches the official 1977 table, but its legal rule was not located; this outcome is an inference.',
        data: { ids: changed.map(l => l.id), cappedIds: changed.filter(l => lists[indexOf.get(l.id)!].candidateCount !== undefined && l.seats < uncapped.lists[indexOf.get(l.id)!].seats).map(l => l.id) },
      });
    }
    if (!rules.seatsCappedAtCandidates) for (const l of listResults) {
      const candidates = lists[indexOf.get(l.id)!].candidateCount;
      if (candidates !== undefined && l.seats > candidates) warnings?.push({
        code: 'unfilled-seats', message: `${l.id} has ${l.seats} seats and ${candidates} candidates; this era's procedure for unfilled seats is not modelled.`,
        data: { list: l.id, seats: l.seats, candidates },
      });
    }

    if (departure) warnings?.push({ code: 'agreement-rule-departure', message: 'An agreement with more than two lists is not permitted by section 67(a); it is computed here as an experimental rule.' });

    return {
      rules, totalValid, thresholdVotes: thresholdVotes(rules.threshold, totalValid), thresholdExact: rat(rules.threshold.num * totalValid, rules.threshold.den),
      qualifyingVotes, unrepresentedVotes: totalValid - qualifyingVotes, quota,
      initialSeatsTotal: initialTotal, remainderSeatsTotal: seatsAllocated - initialTotal,
      lists: listResults, units: unitResults, agreements: statuses, remainderSteps, internalDivisions, warnings: allWarnings, seatsAllocated,
    };
  }
  return { input, run };
}

export function allocate(input: AllocationInput): AllocationResult {
  return prepareAllocation(input).run(input.lists.map((l) => l.votes));
}
