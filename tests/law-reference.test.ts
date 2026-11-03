import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ISRAEL_1973, ISRAEL_2014 } from '../src/engine/rules.ts';
import type { AllocationInput } from '../src/engine/types.ts';

// Independent implementation supplied by the bug hunt: do not share allocation helpers.
function reference(x: AllocationInput): number[] {
  const { rules: r, lists: ls } = x;
  const total = ls.reduce((s, l) => s + (l.withdrawn ? 0n : l.votes), 0n);
  const live = ls.map((_, i) => i).filter(i => !ls[i].withdrawn && ls[i].votes > 0n && ls[i].votes * r.threshold.den >= total * r.threshold.num);
  const answer = ls.map(() => 0);
  if (!live.length) return answer;
  function initial(v: bigint[], n: number, caps: number[] = v.map(() => Infinity)): number[] {
    if (!n) return v.map(() => 0);
    const sum = v.reduce((a, b) => a + b, 0n);
    const quota = sum / BigInt(n);
    let seats = quota ? v.map(w => Number(w / quota)) : v.map(w => Number(w * BigInt(n) / sum));
    if (seats.reduce((a, b) => a + b, 0) > n) seats = v.map(w => Number(w * BigInt(n) / sum));
    return seats.map((s, i) => Math.min(s, caps[i]));
  }
  function finish(v: bigint[], seats: number[], n: number, ids: string[], stage: string, caps: number[] = v.map(() => Infinity)): number[] {
    const sum = v.reduce((a, b) => a + b, 0n);
    let step = 0;
    while (seats.reduce((a, b) => a + b, 0) < n) {
      step++;
      const eligible = v.map((_, i) => i).filter(i => v[i] > 0n && seats[i] < caps[i] && !(r.majorityCap && 2n * v[i] <= sum && 2 * seats[i] >= n));
      if (!eligible.length) break;
      let best = eligible[0];
      for (const i of eligible) if (v[i] * BigInt(seats[best] + 1) > v[best] * BigInt(seats[i] + 1)) best = i;
      const tied = eligible.filter(i => v[i] * BigInt(seats[best] + 1) === v[best] * BigInt(seats[i] + 1));
      const key = `${stage}:${step}:${tied.map(i => ids[i]).sort().join('|')}`;
      const forced = tied.find(i => ids[i] === x.lotteryWinners?.[key]);
      seats[forced ?? best]++;
    }
    return seats;
  }
  const capacities = ls.map(l => r.seatsCappedAtCandidates ? l.candidateCount ?? Infinity : Infinity);
  const starting = initial(live.map(i => ls[i].votes), r.seats, live.map(i => capacities[i]));
  const pairs = x.agreements.filter(a => a.members.length === 2 && a.members.every(id => live.some(i => ls[i].id === id))).map(a => ({ id: a.id, ix: a.members.map(id => ls.findIndex(l => l.id === id)) }));
  const groups: number[][] = []; const unitIds: string[] = []; const claimed = new Set<number>();
  for (const i of live) {
    if (claimed.has(i)) continue;
    const pair = pairs.find(p => p.ix.includes(i));
    const group = pair ? pair.ix : [i];
    groups.push(group); unitIds.push(pair?.id ?? ls[i].id); group.forEach(j => claimed.add(j));
  }
  const votes = groups.map(g => g.reduce((sum, i) => sum + ls[i].votes, 0n));
  const seats = groups.map(g => g.reduce((sum, i) => sum + starting[live.indexOf(i)], 0));
  finish(votes, seats, r.seats, unitIds, 'national', groups.map(g => g.reduce((s, i) => s + capacities[i], 0)));
  groups.forEach((g, j) => {
    const memberVotes = g.map(i => ls[i].votes);
    const division = g.length === 1 ? [seats[j]] : finish(memberVotes, initial(memberVotes, seats[j], g.map(i => capacities[i])), seats[j], g.map(i => ls[i].id), `internal:${unitIds[j]}`, g.map(i => capacities[i]));
    g.forEach((i, k) => { answer[i] = division[k]; });
  });
  return answer;
}

it('matches sections 81/82 and separates agreement/list IDs', () => {
  let seed = 0x12345678;
  const random = (n: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return Math.floor(seed / 4294967296 * n); };
  const cases: AllocationInput[] = [];
  for (const votes of [[0, 0], [1000000], [100000, 100000], Array(32).fill(100000), Array(7).fill(100000), [39, 45, 70], [1, 1]]) {
    for (const paired of [false, true]) cases.push({ rules: ISRAEL_2014, lists: votes.map((v, i) => ({ id: `L${i}`, votes: BigInt(v) })), agreements: paired && votes.length > 1 ? [{ id: 'P', members: ['L0', 'L1'] }] : [] });
  }
  for (let trial = 0; trial < 10000; trial++) {
    const lists = Array.from({ length: 1 + random(35) }, (_, i) => ({ id: `L${i}`, votes: BigInt(random(2) ? random(1000000) : random(8)), withdrawn: random(12) === 0 }));
    const agreements: AllocationInput['agreements'] = [];
    for (let i = 0; i + 1 < lists.length; i += 2) if (random(2)) agreements.push({ id: `P${i}`, members: [lists[i].id, lists[i + 1].id] });
    cases.push({ rules: ISRAEL_2014, lists, agreements });
  }
  for (const [i, input] of cases.entries()) {
    const actual = allocate(input);
    assert.deepEqual(actual.lists.map(l => l.seats), reference(input), `case ${i}`);
    const decisions = [...actual.remainderSteps, ...actual.internalDivisions.flatMap(d => d.steps)].filter(s => s.tie);
    const lotteryWinners = Object.fromEntries(decisions.map(s => [s.tie!.key, s.tie!.tiedUnitIds.at(-1)!]));
    const forced = { ...input, lotteryWinners };
    assert.deepEqual(allocate(forced).lists.map(l => l.seats), reference(forced), `forced case ${i}`);
  }
  const collision: AllocationInput = { rules: ISRAEL_2014, lists: [{ id: 'a', votes: 60000n }, { id: 'b', votes: 40000n }, { id: 'c', votes: 100000n }], agreements: [{ id: 'c', members: ['a', 'b'] }] };
  assert.deepEqual(allocate(collision).lists.map(l => l.seats), reference(collision), 'agreement/list id namespaces');
}, 10_000);

it('also matches the original 1973 section 81(d) at the 1% threshold', () => {
  // The reference algorithm is unchanged: SH 692 p.108 uses the same quotients,
  // lottery and half-seats restriction. SH 556 p.116 supplies the floor quota.
  const cases = [
    [980_000, 10_000, 9_999, 1], // exact 1% boundary and immediately below it
    [500_000, 500_000], // half-seats restriction and equal quotients
    [621_183, 473_309, 130_349, 60_012, 53_353, 56_560, 35_023],
    [1, 1], [39, 45, 70], // same documented small-number quota fallback
  ];
  for (const votes of cases) for (const paired of [false, true]) {
    const input: AllocationInput = {
      rules: ISRAEL_1973,
      lists: votes.map((v, i) => ({ id: `L${i}`, votes: BigInt(v) })),
      agreements: paired ? [{ id: 'P', members: ['L0', 'L1'] }] : [],
    };
    assert.deepEqual(allocate(input).lists.map(l => l.seats), reference(input));
  }
});

// Independent capacity implementation: constrain whole quotas, sum pair capacities,
// continue highest quotients nationally and within pairs. Unknown counts are unbounded.
it('matches the optional candidate cap for initial seats, pairs and exhausted capacity', () => {
  for (let trial = 0; trial < 200; trial++) {
    const lists = Array.from({ length: 4 }, (_, i) => ({ id: `L${i}`, votes: BigInt(10_000 + ((trial + 3) * (i + 7) * 7919) % 100_000), candidateCount: (trial * (i + 1) + 3) % 140 }));
    const input: AllocationInput = { rules: { ...ISRAEL_1973, seatsCappedAtCandidates: true }, lists, agreements: trial % 2 ? [{ id: 'P', members: ['L0', 'L1'] }] : [] };
    assert.deepEqual(allocate(input).lists.map(l => l.seats), reference(input));
  }
});

it('the independent capped and uncapped implementations reproduce the K9 comparison tables', () => {
  const review = JSON.parse(readFileSync('data/raw/k9/national.reviewed.json', 'utf8'));
  const rosters = JSON.parse(readFileSync('data/raw/k9/candidates.reviewed.json', 'utf8')).lists;
  for (const capped of [false, true]) {
    const input: AllocationInput = {
      rules: { ...ISRAEL_1973, seatsCappedAtCandidates: capped },
      lists: review.lists.map((l: { letters: string; gazetteVotes: number }) => ({ id: l.letters, votes: BigInt(l.gazetteVotes), candidateCount: rosters.find((c: {letters: string}) => c.letters === l.letters)?.publishedCount })),
      agreements: review.agreements.pairs.map((members: string[], i: number) => ({ id: `pair${i}`, members })),
    };
    const expected = review.lists.map((l: {letters: string; officialSeats: number}) => capped ? l.officialSeats : l.letters === 'פש' ? 2 : l.letters === 'ש' ? 1 : l.officialSeats);
    assert.deepEqual(reference(input), expected);
    assert.deepEqual(allocate(input).lists.map(l => l.seats), expected);
  }
});
