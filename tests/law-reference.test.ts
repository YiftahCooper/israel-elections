import assert from 'node:assert/strict';
import { it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ISRAEL_1949, ISRAEL_1951, ISRAEL_1973, ISRAEL_2014 } from '../src/engine/rules.ts';
import type { AllocationInput } from '../src/engine/types.ts';

// Independent implementation supplied by the bug hunt: do not share allocation helpers.
function reference(x: AllocationInput): number[] {
  const { rules: r, lists: ls } = x;
  const total = ls.reduce((s, l) => s + (l.withdrawn ? 0n : l.votes), 0n);
  const live = ls.map((_, i) => i).filter(i => !ls[i].withdrawn && ls[i].votes > 0n && ls[i].votes * r.threshold.den >= total * r.threshold.num);
  const answer = ls.map(() => 0);
  if (!live.length) return answer;
  function initial(v: bigint[], n: number): { seats: number[]; qnum: bigint; qden: bigint } {
    if (!n) return { seats: v.map(() => 0), qnum: 0n, qden: 1n };
    const sum = v.reduce((a, b) => a + b, 0n);
    let qden = r.quotaRounding === 'floor' ? 1n : BigInt(n + (r.quotaSeatOffset ?? 0));
    let qnum = r.quotaRounding === 'floor' ? sum / BigInt(n + (r.quotaSeatOffset ?? 0)) : sum;
    if (!qnum) { qnum = sum; qden = BigInt(n); }
    let seats = v.map(w => Number(w * qden / qnum));
    if (seats.reduce((a,b)=>a+b,0) > n) {
      qnum = sum; qden = BigInt(n); seats = v.map(w=>Number(w*qden/qnum));
    }
    return { seats, qnum, qden };
  }
  function finish(v: bigint[], start: ReturnType<typeof initial>, n: number, ids: string[], stage: string): number[] {
    const seats = [...start.seats];
    const used = new Set<number>();
    const sum = v.reduce((a, b) => a + b, 0n);
    let step = 0;
    while (seats.reduce((a, b) => a + b, 0) < n) {
      step++;
      const capped = (i: number) => r.majorityCap && 2n*v[i] <= sum && 2*seats[i] >= n;
      if (r.remainderMethod === 'largest-remainder' && r.largestRemainderRepeat !== false && v.every((_,i)=>used.has(i) || capped(i))) used.clear();
      const eligible = v.map((_, i) => i).filter(i => v[i] > 0n && !capped(i)
        && (!r.remainderRequiresInitialSeat || start.seats[i] > 0)
        && (r.remainderMethod !== 'largest-remainder' || !used.has(i)));
      const score = (i: number): [bigint,bigint] => {
        if (r.remainderMethod === 'largest-remainder') return [v[i]*start.qden-start.qnum*BigInt(seats[i]),start.qden];
        const d=BigInt(seats[i]+1); return r.quotientRounding === 'floor' ? [v[i]/d,1n] : [v[i],d];
      };
      const compare=(i:number,j:number)=>{const [a,b]=score(i),[c,d]=score(j);return a*d-c*b;};
      if (!eligible.length) break;
      let best = eligible[0];
      for (const i of eligible) if (compare(i,best)>0n) best = i;
      const tied = eligible.filter(i => compare(i,best)===0n);
      const key = `${stage}:${step}:${tied.map(i => ids[i]).sort().join('|')}`;
      const forced = tied.find(i => ids[i] === x.lotteryWinners?.[key]);
      seats[forced ?? best]++; used.add(forced ?? best);
    }
    return seats;
  }
  const starting = initial(live.map(i => ls[i].votes), r.seats);
  const pairs = x.agreements.filter(a => a.members.length === 2 && a.members.every(id => live.some((i,k) => ls[i].id === id && (!r.agreementRequiresInitialSeat || starting.seats[k] > 0)))).map(a => ({ id: a.id, ix: a.members.map(id => ls.findIndex(l => l.id === id)) }));
  const groups: number[][] = []; const unitIds: string[] = []; const claimed = new Set<number>();
  for (const i of live) {
    if (claimed.has(i)) continue;
    const pair = pairs.find(p => p.ix.includes(i));
    const group = pair ? pair.ix : [i];
    groups.push(group); unitIds.push(pair?.id ?? ls[i].id); group.forEach(j => claimed.add(j));
  }
  const votes = groups.map(g => g.reduce((sum, i) => sum + ls[i].votes, 0n));
  const seats = groups.map(g => g.reduce((sum, i) => sum + starting.seats[live.indexOf(i)], 0));
  const final = finish(votes, { ...starting, seats }, r.seats, unitIds, 'national');
  groups.forEach((g, j) => {
    const memberVotes = g.map(i => ls[i].votes);
    const division = g.length === 1 ? [final[j]] : finish(memberVotes, initial(memberVotes, final[j]), final[j], g.map(i => ls[i].id), `internal:${unitIds[j]}`);
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

it('independently checks early rules and each optional semantic with seeded cases and lotteries', () => {
  let seed=0x19491951;
  const rnd=(n:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
  for(let trial=0;trial<3000;trial++) {
    const preset=trial%2 ? ISRAEL_1949 : ISRAEL_1951;
    const rules=trial%3 ? preset : {...ISRAEL_2014, seats:1+rnd(20),threshold:{num:0n,den:1n},
      quotaSeatOffset:rnd(2),remainderRequiresInitialSeat:!!rnd(2),agreementRequiresInitialSeat:!!rnd(2),
      quotientRounding:rnd(2) ? 'floor' as const : 'exact' as const,
      remainderMethod:rnd(2) ? 'bader-ofer' as const : 'largest-remainder' as const,
      largestRemainderRepeat:!!rnd(2),quotaRounding:rnd(2) ? 'floor' as const : 'exact' as const};
    const lists=Array.from({length:2+rnd(20)},(_,i)=>({id:`L${i}`,votes:BigInt(rnd(5)?rnd(1000000):rnd(20)),withdrawn:rnd(20)===0}));
    const agreements=[];
    for(let i=0;i+1<lists.length;i+=2) if(rnd(2)) agreements.push({id:`P${i}`,members:[`L${i}`,`L${i+1}`]});
    const input: AllocationInput={rules,lists,agreements};
    const result=allocate(input);
    assert.deepEqual(result.lists.map(l=>l.seats),reference(input),`early case ${trial}`);
    const lotteryWinners=Object.fromEntries([...result.remainderSteps,...result.internalDivisions.flatMap(d=>d.steps)]
      .filter(s=>s.tie).map(s=>[s.tie!.key,s.tie!.tiedUnitIds.at(-1)!]));
    const forced={...input,lotteryWinners};
    assert.deepEqual(allocate(forced).lists.map(l=>l.seats),reference(forced),`early forced case ${trial}`);
  }
},10000);
