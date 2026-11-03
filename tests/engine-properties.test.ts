// Seeded property tests for the allocation engine on random elections under every rule semantic:
// agreement with the independent reference, seat accounting, and the monotonicity the law and the
// divisor methods guarantee.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { RULESETS } from '../src/engine/rules.ts';
import type { AllocationInput, AllocationResult, ListInput, RuleSet } from '../src/engine/types.ts';
import { forcedLotteries, randomInput, rng, type Modules } from './differential.cases.ts';
import { reference } from './law-reference.ts';

const presets = Object.values(RULESETS);
/** PROPERTY_SCALE=10 runs ten times as many cases */
const SCALE = Number(process.env.PROPERTY_SCALE ?? 1);
const modules = { RULESETS } as Modules;
type Rng = ReturnType<typeof rng>;

/** A random election within the reference's scope: disjoint two-list agreements, no Sainte-Laguë. */
function referenceCase(r: Rng): AllocationInput {
  let rules: RuleSet = r.pick(presets);
  if (r.chance(0.5)) {
    rules = { ...rules, id: 'experimental', historical: false, seats: r.pick([120, 120, 5, 13, 61, 1 + r.int(150)]),
      threshold: r.pick([{ num: 0n, den: 1n }, { num: 1n, den: 100n }, { num: 13n, den: 400n }, { num: BigInt(r.int(80)), den: 1000n }]),
      quotaRounding: r.pick(['floor', 'exact']), remainderMethod: r.pick(['bader-ofer', 'largest-remainder']), majorityCap: r.chance(0.5),
      maxAgreementSize: 2, agreementRequiresAllQualify: true, quotaSeatOffset: r.int(2), remainderRequiresInitialSeat: r.chance(0.3),
      agreementRequiresInitialSeat: r.chance(0.3), quotientRounding: r.pick(['exact', 'floor']), largestRemainderRepeat: r.chance(0.5),
      tiePolicy: r.pick(['lottery', 'unspecified']), seatsCappedAtCandidates: r.chance(0.3) };
    // Out of the reference's scope: with repeated largest-remainder rounds and candidate caps the
    // reference never starts a new round while a full unit waits, leaving seats unfilled; the
    // engine counts a full unit as done for the round. The law defines neither combination.
    if (rules.remainderMethod === 'largest-remainder' && rules.largestRemainderRepeat !== false) rules.seatsCappedAtCandidates = false;
  }
  const pool = Array.from({ length: 3 }, () => BigInt(1 + r.int(300_000)));
  const lists: ListInput[] = Array.from({ length: 1 + r.int(30) }, (_, i) => ({
    id: `L${i}`, votes: r.chance(0.3) ? r.pick(pool) : BigInt(r.chance(0.2) ? r.int(40) : r.int(1_200_000)),
    ...(r.chance(0.07) ? { withdrawn: true } : {}), ...(r.chance(0.4) ? { candidateCount: r.int(r.chance(0.3) ? 5 : 80) } : {}),
  }));
  const agreements = [];
  for (let i = 0; i + 1 < lists.length; i += 2) if (r.chance(0.5)) agreements.push({ id: r.chance(0.1) ? `L${i + 1}` : `P${i}`, members: [`L${i}`, `L${i + 1}`] });
  return { rules, lists, agreements };
}

const seats = (res: AllocationResult) => res.lists.map((l) => l.seats);

describe('the engine equals the independent reference', () => {
  it('on random elections under every preset and optional semantic, including recorded lotteries', () => {
    const r = rng(0x9e7e5);
    for (let c = 0; c < 4000 * SCALE; c++) {
      const input = referenceCase(r);
      const res = allocate(input);
      expect(seats(res), `case ${c}`).toEqual(reference(input));
      // the reference keys a pair's internal lottery by the raw agreement id, the engine by the
      // escaped unit id when that collides with a list id (tests/defects.test.ts covers collisions)
      if (input.agreements.some((a) => input.lists.some((l) => l.id === a.id))) continue;
      for (const which of ['last', 'middle'] as const) {
        const forced = forcedLotteries(res, input, which);
        if (forced) expect(seats(allocate(forced)), `case ${c} ${which}`).toEqual(reference(forced));
      }
    }
  }, 30_000);

  it('Sainte-Laguë equals an independent highest-averages count (divisors 1, 3, 5, …)', () => {
    const r = rng(0x5a1e);
    for (let c = 0; c < 1500 * SCALE; c++) {
      const S = r.pick([1, 7, 120, 1 + r.int(200)]);
      const threshold = r.pick([{ num: 0n, den: 1n }, { num: 13n, den: 400n }, { num: BigInt(r.int(100)), den: 1000n }]);
      const lists = Array.from({ length: 1 + r.int(25) }, (_, i) => ({ id: `L${i}`, votes: BigInt(r.chance(0.2) ? r.int(50) : r.int(900_000)) }));
      const res = allocate({ rules: { ...RULESETS['il-2014-bader-ofer-3.25'], seats: S, threshold, remainderMethod: 'sainte-lague', majorityCap: false }, lists, agreements: [] });
      const total = lists.reduce((s, l) => s + l.votes, 0n);
      const live = lists.map((l) => l.votes > 0n && l.votes * threshold.den >= threshold.num * total);
      const expected = lists.map(() => 0);
      for (let k = 0; k < S && live.some(Boolean); k++) {
        let best = -1;
        for (let i = 0; i < lists.length; i++) if (live[i] && (best < 0 || lists[i].votes * BigInt(2 * expected[best] + 1) > lists[best].votes * BigInt(2 * expected[i] + 1))) best = i;
        expected[best]++;
      }
      expect(seats(res), `case ${c}`).toEqual(expected);
    }
  });
});

describe('seat accounting', () => {
  it('holds on random elections with every input oddity', () => {
    const r = rng(0xacc0);
    for (let c = 0; c < 4000 * SCALE; c++) {
      const input = randomInput(r, modules);
      const res = allocate(input);
      const { rules } = input;
      const msg = `case ${c}`;
      const codes = new Set(res.warnings.map((w) => w.code));
      expect(res.seatsAllocated, msg).toBe(res.lists.reduce((s, l) => s + l.seats, 0));
      // a pair can win seats nationally that its members cannot fill (caps, half-seats rule)
      const unitSeats = res.units.reduce((s, u) => s + u.seats, 0);
      if (res.seatsAllocated !== unitSeats) expect(res.warnings.some((w) => w.code === 'seats-unallocatable' && String(w.data?.stage).startsWith('internal:')), msg).toBe(true);
      expect(res.seatsAllocated, msg).toBeLessThanOrEqual(unitSeats);
      expect(res.seatsAllocated, msg).toBeLessThanOrEqual(rules.seats);
      // fewer seats than the chamber only with an explanation
      if (res.seatsAllocated < rules.seats) expect(codes.has('seats-unallocatable') || codes.has('no-qualifying-lists'), msg).toBe(true);
      // the Bader–Ofer presets always fill the chamber once any list qualifies
      if (['il-1973-bader-ofer-1', 'il-1992-bader-ofer-1.5', 'il-2004-bader-ofer-2', 'il-2014-bader-ofer-3.25'].includes(rules.id) && res.lists.some((l) => l.qualified)) expect(res.seatsAllocated, msg).toBe(120);
      for (const l of res.lists) {
        const listInput = input.lists.find((x: ListInput) => x.id === l.id)!;
        expect(l.seats, msg).toBeGreaterThanOrEqual(0);
        // 81(a) and the reported threshold agree exactly
        expect(l.qualified, msg).toBe(!l.withdrawn && l.votes > 0n && l.votes >= res.thresholdVotes);
        if (!l.qualified) expect([l.seats, l.initialSeats], msg).toEqual([0, 0]);
        // remainder seats only add; a pair member may lose whole-quota seats only with a warning (82(b))
        if (!l.agreementActive) expect(l.seats, msg).toBeGreaterThanOrEqual(l.initialSeats);
        else if (l.seats < l.initialSeats) expect(res.warnings.some((w) => w.code === 'internal-loss' && w.data?.list === l.id), msg).toBe(true);
        if (rules.seatsCappedAtCandidates && listInput.candidateCount !== undefined) expect(l.seats, msg).toBeLessThanOrEqual(listInput.candidateCount);
      }
      // 81(d)(4): a unit with no more than half the votes stops at half the seats
      if (rules.majorityCap) for (const u of res.units) if (2n * u.votes <= res.qualifyingVotes && u.remainderSeats > 0) expect(2 * (u.seats - 1), msg).toBeLessThan(rules.seats);
    }
  }, 30_000);
});

describe('monotonicity guaranteed by the rules', () => {
  it('a qualifying list still qualifies with more votes, from new voters or from another list', () => {
    const r = rng(0x9a11);
    for (let c = 0; c < 1500 * SCALE; c++) {
      const input = randomInput(r, modules);
      const res = allocate(input);
      const x = res.lists.findIndex((l) => l.qualified);
      if (x < 0) continue;
      const d = BigInt(1 + r.int(200_000));
      const y = r.int(input.lists.length);
      const more = (from: number | null) => allocate({ ...input, lists: input.lists.map((l: ListInput, i: number) => ({ ...l, votes: i === x ? l.votes + d : i === from ? (l.votes > d ? l.votes - d : 0n) : l.votes })) });
      expect(more(null).lists[x].qualified, `case ${c} new`).toBe(true);
      if (y !== x) expect(more(y).lists[x].qualified, `case ${c} transfer`).toBe(true);
    }
  });

  it('divisor methods: moving votes from one list to another never costs the receiver a seat', () => {
    // Bader–Ofer with an exact quota is D'Hondt; with Sainte-Laguë both are divisor methods, which
    // are vote monotone. Without agreements, caps or the half-seats rule, and with no tie and no
    // change in which lists qualify, the receiver gains or keeps seats and the giver loses or keeps.
    const r = rng(0xd1715);
    let compared = 0;
    for (let c = 0; c < 3000 * SCALE; c++) {
      const rules: RuleSet = { ...RULESETS['il-2014-bader-ofer-3.25'], seats: r.pick([7, 61, 120, 1 + r.int(150)]), quotaRounding: 'exact',
        majorityCap: false, remainderMethod: r.pick(['bader-ofer', 'sainte-lague']), threshold: r.pick([{ num: 0n, den: 1n }, { num: 13n, den: 400n }]) };
      const lists = Array.from({ length: 2 + r.int(12) }, (_, i) => ({ id: `L${i}`, votes: BigInt(1 + r.int(500_000)) }));
      const x = r.int(lists.length); const y = (x + 1 + r.int(lists.length - 1)) % lists.length;
      const d = BigInt(1 + r.int(Number(lists[y].votes)));
      const a = allocate({ rules, lists, agreements: [] });
      const b = allocate({ rules, lists: lists.map((l, i) => ({ ...l, votes: i === x ? l.votes + d : i === y ? l.votes - d : l.votes })), agreements: [] });
      if (a.warnings.length || b.warnings.length || a.lists.some((l, i) => l.qualified !== b.lists[i].qualified)) continue;
      expect(b.lists[x].seats, `case ${c} receiver`).toBeGreaterThanOrEqual(a.lists[x].seats);
      expect(b.lists[y].seats, `case ${c} giver`).toBeLessThanOrEqual(a.lists[y].seats);
      compared++;
    }
    expect(compared).toBeGreaterThan(1000 * SCALE);
  });
});
