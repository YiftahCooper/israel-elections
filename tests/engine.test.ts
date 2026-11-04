import { ISRAEL_2014 } from '../src/engine/rules.ts';
import { describe, expect, it } from 'vitest';
import { allocate, passesThreshold, thresholdVotes } from '../src/engine/allocate.ts';
import { cmp, percentToRational, rat, toDecimal } from '../src/engine/rational.ts';
import { allocateDataset, dhondt, seatsOf, simple } from './helpers.ts';

describe('25th Knesset (2022) — reproduces the official CEC result exactly', () => {
  const { ds, res } = allocateDataset('k25');

  it('matches every list’s official seat count', () => {
    const official = ds.officialSeats!;
    for (const l of res.lists) expect([l.id, l.seats]).toEqual([l.id, official[l.id] ?? 0]);
    expect(res.seatsAllocated).toBe(120);
  });

  it('uses the official totals', () => {
    expect(res.totalValid).toBe(4_764_742n);
    expect(ds.totals).toMatchObject({ registered: 6_788_804, votesCast: 4_794_593, invalid: 29_851, valid: 4_764_742 });
  });

  it('threshold is 154,855 votes (3.25% of 4,764,742 = 154,854.115)', () => {
    expect(res.thresholdVotes).toBe(154_855n);
    expect(res.lists.filter((l) => l.qualified).map((l) => l.id).sort()).toEqual(['25-אמת', '25-ג', '25-ום', '25-ט', '25-כן', '25-ל', '25-מחל', '25-עם', '25-פה', '25-שס'].sort());
  });

  it('general quota is 36,227 and 7 seats remain after the first stage', () => {
    expect(res.quota).toEqual(rat(36_227n));
    expect(res.initialSeatsTotal).toBe(113);
    expect(res.remainderSeatsTotal).toBe(7);
  });

  it('Labor–Meretz agreement is ineffective because Meretz failed the threshold', () => {
    const a = res.agreements.find((x) => x.members.includes('25-מרצ'))!;
    expect(a.active).toBe(false);
    expect(a.reason).toBe('member-failed-threshold');
    expect(a.failedMembers).toEqual(['25-מרצ']);
  });

  it('records a complete, auditable remainder sequence', () => {
    expect(res.remainderSteps).toHaveLength(7);
    for (const st of res.remainderSteps) {
      const winner = st.quotients.find((q) => q.unitId === st.winnerUnitId)!;
      for (const q of st.quotients.filter((x) => x.eligible)) expect(cmp(winner.value, q.value)).toBeGreaterThanOrEqual(0);
    }
    expect(res.warnings).toEqual([]);
  });
});

describe('26th Knesset (2026) — final count', () => {
  const { res } = allocateDataset('k26');
  it('matches the seat totals reported from the CEC final count (secondary: press reports of 30.10.2026)', () => {
    expect(seatsOf(res)).toEqual({
      '26-מחל': 27, '26-דרך': 21, '26-רק': 12, '26-ודם': 11, '26-אמת': 8, '26-עם': 8,
      '26-ב': 7, '26-ג': 7, '26-ל': 7, '26-ט': 6, '26-שס': 6,
    });
  });
  it('withdrawn lists never take part', () => {
    for (const id of ['26-כן', '26-צבי']) expect(res.lists.find((l) => l.id === id)).toMatchObject({ withdrawn: true, qualified: false, seats: 0 });
  });
  it('threshold 184,971 votes; quota 44,873; 5 remainder seats', () => {
    expect(res.thresholdVotes).toBe(184_971n);
    expect(res.quota).toEqual(rat(44_873n));
    expect(res.remainderSeatsTotal).toBe(5);
  });
});

describe('section 81(a) threshold boundary', () => {
  it('3.25% is the exact fraction 13/400', () => expect(percentToRational('3.25')).toEqual(rat(13n, 400n)));
  it('a list with exactly 3.25% passes; one vote less fails', () => {
    // 400 total: 13 votes = 3.25%
    expect(passesThreshold(13n, 400n, rat(13n, 400n))).toBe(true);
    expect(passesThreshold(12n, 399n, rat(13n, 400n))).toBe(false);
    expect(thresholdVotes(rat(13n, 400n), 400n)).toBe(13n);
    expect(thresholdVotes(rat(13n, 400n), 401n)).toBe(14n);
  });
  it('threshold is measured against all valid votes, including failed lists', () => {
    const r = allocate(simple({ A: 500_000, B: 400_000, C: 32_500, D: 67_500 }));
    // total 1,000,000 → threshold 32,500: C qualifies exactly
    expect(r.thresholdVotes).toBe(32_500n);
    expect(r.lists.find((l) => l.id === 'C')!.qualified).toBe(true);
  });
});

describe('section 81(d) Bader–Ofer', () => {
  it('equals D’Hondt over qualifying lists when the quota is exact (no agreements)', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
    for (let t = 0; t < 200; t++) {
      const votes: Record<string, number> = {};
      const n = 3 + Math.floor(rnd() * 12);
      for (let i = 0; i < n; i++) votes[`L${i}`] = Math.floor(rnd() ** 2 * 1_000_000) + 1;
      const r = allocate(simple(votes, [], { quotaRounding: 'exact', majorityCap: false }));
      if (r.warnings.some((w) => w.code === 'lottery-required')) continue;
      expect(seatsOf(r)).toEqual(dhondt(votes, 120, 3.25));
    }
  });

  it('always allocates exactly the configured number of seats', () => {
    let seed = 11;
    const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
    for (let t = 0; t < 300; t++) {
      const seats = 1 + Math.floor(rnd() * 200);
      const votes: Record<string, number> = {};
      const n = 2 + Math.floor(rnd() * 10);
      for (let i = 0; i < n; i++) votes[`L${i}`] = Math.floor(rnd() * (rnd() < 0.2 ? 50 : 2_000_000));
      const agreements = n >= 4 ? [['L0', 'L1'], ['L2', 'L3']] : [];
      const r = allocate(simple(votes, agreements, { seats }));
      if (r.lists.some((l) => l.qualified)) expect(r.seatsAllocated).toBe(seats);
    }
  });

  it('flags exact ties as requiring the statutory lottery, and honours a supplied outcome', () => {
    const input = simple({ A: 300, B: 300, C: 400 }, [], { seats: 3, quotaRounding: 'floor' });
    // quota 333: A0 B0 C1; remainders: A 300/1, B 300/1, C 400/2=200 → A and B tie for seat 2... both get one.
    const r = allocate(input);
    expect(r.seatsAllocated).toBe(3);
    const tie = allocate(simple({ A: 300, B: 300 }, [], { seats: 1 }));
    expect(tie.warnings.map((w) => w.code)).toContain('lottery-required');
    const key = tie.remainderSteps[0].tie!.key;
    const forced = allocate(simple({ A: 300, B: 300 }, [], { seats: 1 }, { [key]: 'B' }));
    expect(seatsOf(forced)).toEqual({ B: 1 });
    expect(forced.warnings.map((w) => w.code)).not.toContain('lottery-required');
  });

  it('81(d)(4): a list with ≤ half the votes cannot pass half the seats through remainders', () => {
    // A has exactly 50% of the votes. Quota 100 → A5 B1 C1 D1; without the cap A would take the
    // second remainder seat (500/6 = 83.3 > 80) and a majority of 6 of 10.
    const votes = { A: 500, B: 180, C: 160, D: 160 };
    const capped = allocate(simple(votes, [], { seats: 10, threshold: rat(0n) }));
    const uncapped = allocate(simple(votes, [], { seats: 10, threshold: rat(0n), majorityCap: false }));
    expect(uncapped.lists.find((l) => l.id === 'A')!.seats).toBe(6);
    expect(capped.lists.find((l) => l.id === 'A')!.seats).toBe(5);
    expect(capped.units.find((u) => u.id === 'A')!.capped).toBe(true);
    expect(capped.seatsAllocated).toBe(10);
  });

  it('remaining seats are dynamic, not a fixed number', () => {
    const a = allocate(simple({ A: 1000, B: 1000, C: 1000 }, [], { seats: 120 }));
    expect(a.remainderSeatsTotal).toBe(0);
    const b = allocate(simple({ A: 1001, B: 999, C: 500, D: 333 }, [], { seats: 120 }));
    expect(b.remainderSeatsTotal).toBeGreaterThan(0);
  });
});

describe('section 82 surplus agreements', () => {
  it('pair competes as one list in the remainder stage with combined votes and seats', () => {
    const votes = { A: 41_000, B: 39_000, C: 50_000, D: 70_000 };
    const r = allocate(simple(votes, [['A', 'B']], { seats: 10, threshold: rat(0n) }));
    const unit = r.units.find((u) => u.isAgreement)!;
    expect(unit.votes).toBe(80_000n);
    expect(unit.initialSeats).toBe(r.lists.find((l) => l.id === 'A')!.initialSeats + r.lists.find((l) => l.id === 'B')!.initialSeats);
    const st = r.remainderSteps[0];
    const q = st.quotients.find((x) => x.unitId === unit.id)!;
    expect(cmp(q.value, rat(80_000n, BigInt(unit.initialSeats + 1)))).toBe(0);
  });

  it('pair seats are re-divided from scratch by section 81 within the pair', () => {
    const r = allocate(simple({ A: 41_000, B: 39_000, C: 50_000, D: 70_000 }, [['A', 'B']], { seats: 10, threshold: rat(0n) }));
    const div = r.internalDivisions[0];
    expect(div.final.A + div.final.B).toBe(div.seats);
    expect(div.quota).toEqual(rat(80_000n / BigInt(div.seats)));
  });

  it('has no effect when a partner fails the threshold; the other competes alone', () => {
    const r = allocate(simple({ A: 400_000, B: 20_000, C: 580_000 }, [['A', 'B']]));
    expect(r.agreements[0]).toMatchObject({ active: false, reason: 'member-failed-threshold' });
    expect(r.units.every((u) => !u.isAgreement)).toBe(true);
  });

  it('three-list agreements are rejected under historical rules and computed only experimentally', () => {
    const hist = allocate(simple({ A: 300_000, B: 300_000, C: 300_000, D: 100_000 }, [['A', 'B', 'C']]));
    expect(hist.agreements[0]).toMatchObject({ active: false, reason: 'too-many-members' });
    const exp = allocate(simple({ A: 300_000, B: 300_000, C: 300_000, D: 100_000 }, [['A', 'B', 'C']], { maxAgreementSize: 3, historical: false }));
    expect(exp.agreements[0].active).toBe(true);
    expect(exp.warnings.map((w) => w.code)).toContain('agreement-rule-departure');
  });

  it('a list may belong to only one agreement', () => {
    const r = allocate(simple({ A: 300_000, B: 300_000, C: 400_000 }, [['A', 'B'], ['B', 'C']]));
    expect(r.agreements[1]).toMatchObject({ active: false, reason: 'duplicate-membership' });
  });
});

describe('degenerate inputs', () => {
  it('very small totals: whole-number quota over-allocation is detected and corrected', () => {
    const r = allocate(simple({ A: 7, B: 6, C: 5 }, [], { seats: 15, threshold: rat(0n) }));
    expect(r.seatsAllocated).toBe(15);
    expect(r.warnings.map((w) => w.code).some((c) => c === 'quota-over-allocation' || c === 'zero-quota')).toBe(true);
  });
  it('no qualifying list → no seats and a warning', () => {
    const r = allocate(simple({ A: 0, B: 0 }));
    expect(r.seatsAllocated).toBe(0);
    expect(r.warnings.map((w) => w.code)).toContain('no-qualifying-lists');
  });
  it('very large totals stay exact', () => {
    const r = allocate(simple({ A: 9_000_000_000_001, B: 4_000_000_000_000, C: 3_000_000_000_000 }));
    expect(r.seatsAllocated).toBe(120);
  });
  it('decimal display rounds exactly', () => {
    expect(toDecimal(rat(1n, 3n), 6)).toBe('0.333333');
    expect(toDecimal(rat(2n, 3n), 2)).toBe('0.67');
  });
});

describe('lottery outcomes', () => {
  it('a recorded outcome applies only to the exact tie it was recorded for', () => {
    const first = allocate(simple({ A: 300, B: 300, C: 100 }, [], { seats: 1, threshold: rat(0n) }));
    const key = first.remainderSteps[0].tie!.key;
    // a different tie at the same step (B vs C) must not be decided by the A/B choice
    const other = allocate(simple({ A: 100, B: 300, C: 300 }, [], { seats: 1, threshold: rat(0n) }, { [key]: 'B' }));
    expect(other.remainderSteps[0].tie!.forced).toBe(false);
    expect(other.warnings.map((w) => w.code)).toContain('lottery-required');
  });
});

it('optionally caps initial and remainder seats at candidate capacity, retaining agreement units', () => {
  const input = {
    rules: { ...ISRAEL_2014, seats: 10, majorityCap: false, seatsCappedAtCandidates: true },
    lists: [{ id: 'a', votes: 60000n, candidateCount: 1 }, { id: 'b', votes: 25000n, candidateCount: 10 }, { id: 'c', votes: 15000n, candidateCount: 10 }],
    agreements: [{ id: 'bc', members: ['b', 'c'] }],
  };
  const r = allocate(input);
  expect(r.lists.map(l => l.seats)).toEqual([1, 6, 3]);
  expect(r.seatsAllocated).toBe(10);
  expect(r.warnings.map(w => w.code)).toEqual(['inferred-candidate-cap']);
  expect(allocate({ ...input, rules: { ...input.rules, seatsCappedAtCandidates: false } }).lists.map(l => l.seats)).toEqual([6, 3, 1]);
  expect(() => allocate({ ...input, lists: [{ id: 'a', votes: 1n, candidateCount: -1 }] })).toThrow(/candidateCount/);
});

it('caps agreement members internally and reports exhausted total capacity', () => {
  const input = {
    rules: { ...ISRAEL_2014, seats: 10, majorityCap: false, seatsCappedAtCandidates: true },
    lists: [{ id: 'a', votes: 60000n, candidateCount: 1 }, { id: 'b', votes: 25000n, candidateCount: 1 }, { id: 'c', votes: 15000n, candidateCount: 10 }],
    agreements: [{ id: 'ab', members: ['a', 'b'] }],
  };
  expect(allocate(input).lists.map(l => l.seats)).toEqual([1, 1, 8]);
  const exhausted = allocate({ ...input, lists: input.lists.map(l => ({ ...l, candidateCount: 1 })) });
  expect(exhausted.lists.map(l => l.seats)).toEqual([1, 1, 1]);
  expect(exhausted.seatsAllocated).toBe(3);
  expect(exhausted.warnings.map(w => w.code)).toEqual(['seats-unallocatable', 'inferred-candidate-cap']);
  const unknown = allocate({ ...input, lists: input.lists.map(l => ({ ...l, candidateCount: undefined })) });
  expect(unknown.lists.map(l => l.seats)).toEqual(allocate({ ...input, rules: { ...input.rules, seatsCappedAtCandidates: false } }).lists.map(l => l.seats));
});
