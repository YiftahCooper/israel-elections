import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ISRAEL_1949, ISRAEL_1951, ISRAEL_1973, ISRAEL_2014 } from '../src/engine/rules.ts';
import type { AllocationInput } from '../src/engine/types.ts';
import { reference } from './law-reference.ts';

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

it('checks the 1949 official appendix pair quotas and the outcome-insensitive integer tie',()=>{
  // CEC calculation appendix PDF pp.6–13: all five connections, two active.
  // This table is fixed primary evidence, not inferred from a desired allocation.
  const votes:Record<string,number>={א:155274,ב:52982,ג:2892,ח:49782,ט:842,יא:3214,יג:2514,יד:7387,טו:5363,יח:2835,יט:239,ל:4399,מ:64018,נ:5173,ס:15287,פ:17786,פד:2796,צ:22661,ק:15148,ש:1280,ת:2812};
  const x:AllocationInput={rules:ISRAEL_1949,lists:Object.entries(votes).map(([id,v])=>({id,votes:BigInt(v)})),
    agreements:[['ב','ל'],['ט','יג'],['יא','יד'],['מ','ת'],['ס','צ']].map((members,i)=>({id:`P${i}`,members}))};
  const a=allocate(x);
  assert.deepEqual(a.lists.map(l=>l.seats),reference(x));
  assert.deepEqual(a.internalDivisions.map(d=>[d.seats,d.quota.num]),[[17,3187n],[11,3162n]]);
  const tie=a.remainderSteps.find(s=>s.tie)!;
  assert.equal(tie.seatNumber,118);
  assert.deepEqual(tie.quotients.filter(q=>tie.tie!.tiedUnitIds.includes(q.unitId)).map(q=>q.value),[{num:3375n,den:1n},{num:3375n,den:1n}]);
  for(const winner of tie.tie!.tiedUnitIds){
    const forced={...x,lotteryWinners:{[tie.tie!.key]:winner}};
    assert.deepEqual(allocate(forced).lists.map(l=>l.seats),a.lists.map(l=>l.seats));
    assert.deepEqual(allocate(forced).lists.map(l=>l.seats),reference(forced));
  }
});

it('independently reproduces K2–K7 with the reviewed primary connections, including corrected K6',()=>{
  // Expected seats are transcribed from results notices, never generated by allocate.
  // K6: YP 1225 p.189 names את–רא. No new RuleSet semantic is needed.
  for (const n of [2,3,4,5,6,7]) {
    const review=JSON.parse(readFileSync(`data/raw/k${n}/national.reviewed.json`,'utf8'));
    const input:AllocationInput={
      rules:ISRAEL_1951,
      lists:review.lists.map((l:{letters:string;votes:number})=>({id:l.letters,votes:BigInt(l.votes)})),
      agreements:review.agreements.pairs.map((members:string[],i:number)=>({id:`P${i}`,members})),
    };
    const expected=review.lists.map((l:{officialSeats:number})=>l.officialSeats);
    assert.deepEqual(reference(input),expected,`K${n} independent reference`);
    assert.deepEqual(allocate(input).lists.map(l=>l.seats),expected,`K${n} engine`);
    if(n===6) {
      const wrong={...input,agreements:[{id:'P0',members:['את','יא']},input.agreements[1]]};
      const former=review.lists.map((l:{letters:string;officialSeats:number})=>l.letters==='את'?44:l.letters==='ש'?2:l.officialSeats);
      assert.deepEqual(reference(wrong),former,'former transcription, not historical evidence');
    }
  }
});
