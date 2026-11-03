import { expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ISRAEL_1949, ISRAEL_1951, ISRAEL_2014, ruleDepartures } from '../src/engine/rules.ts';
import { rat } from '../src/engine/rational.ts';
import type { RuleSet } from '../src/engine/types.ts';
const run = (rules: RuleSet, votes: number[], agreements: [string,string][] = []) => allocate({ rules,
  lists: votes.map((v,i)=>({id:`L${i}`,votes:BigInt(v)})), agreements: agreements.map((members,i)=>({id:`P${i}`,members})) });
it('1949 has no percentage threshold, a floor quota over seats plus one, and excludes zero-initial lists from remainders and connections', () => {
  const r = run({...ISRAEL_1949,seats:5},[501,250,149], [['L1','L2']]);
  expect(r.thresholdVotes).toBe(0n); expect(r.quota).toEqual(rat(150));
  expect(r.lists.map(l=>l.seats)).toEqual([4,1,0]);
  expect(r.lists[2].qualified).toBe(true);
  expect(r.remainderSteps[0].quotients.find(q=>q.unitId==='L2')?.eligible).toBe(false);
  expect(r.agreements[0]).toMatchObject({active:false,reason:'member-no-initial-seat',failedMembers:['L2']});
});
it('1949 discards quotient fractions before comparing and recording a lottery', () => {
  const r = run({...ISRAEL_1949,seats:4},[101,100,1]);
  expect(r.quota).toEqual(rat(40)); // 2 + 2 initial seats, use an independent constructed stage below
  const tied = run({...ISRAEL_1949,seats:3,quotaSeatOffset:0},[101,100]);
  expect(tied.remainderSteps[0].tie?.tiedUnitIds).toEqual(['L0','L1']);
  expect(tied.remainderSteps[0].quotients.map(q=>q.value)).toEqual([rat(50),rat(50)]);
});
it('1951 uses floor Hare and one remainder seat per unit, with no half-seats cap', () => {
  expect(ISRAEL_1951.threshold).toEqual(rat(1,100)); expect(ISRAEL_1951.majorityCap).toBe(false);
  const r=run({...ISRAEL_1951,seats:5},[400,350,250]);
  expect(r.quota).toEqual(rat(200)); expect(r.lists.map(l=>l.seats)).toEqual([2,2,1]);
});
it('largest-remainder single pass does not recycle units when connected remainders exceed a quota', () => {
  // Exact Hare: four lists initially have zero seats; pairing leaves only two competing units.
  const r=run({...ISRAEL_1951,seats:3,quotaRounding:'exact'},[100,100,100,100],[['L0','L1'],['L2','L3']]);
  expect(r.seatsAllocated).toBe(2); expect(r.warnings.some(w=>w.code==='seats-unallocatable')).toBe(true);
});
it('new options have modern defaults and are included in departure detection', () => {
  expect(ruleDepartures({...ISRAEL_2014,quotaSeatOffset:0,remainderRequiresInitialSeat:false,
    agreementRequiresInitialSeat:false,quotientRounding:'exact',largestRemainderRepeat:true},ISRAEL_2014)).toEqual([]);
  expect(ruleDepartures(ISRAEL_1949,ISRAEL_2014)).toEqual(expect.arrayContaining(['quotaSeatOffset','remainderRequiresInitialSeat','agreementRequiresInitialSeat','quotientRounding']));
});
it('1951 equal remainders are explicitly unresolved rather than asserted to have a statutory lottery', () => {
  const r=run({...ISRAEL_1951,seats:3},[100,100]);
  expect(r.warnings).toEqual(expect.arrayContaining([expect.objectContaining({code:'lottery-required',data:expect.objectContaining({tiePolicy:'unspecified'})})]));
  expect(r.warnings[0].message).toContain('does not specify a tie procedure');
  expect(r.remainderSteps[0].tie?.forced).toBe(false);
});
it('1949 internal over-allocation is warned about, rather than silently treated as a statutory outcome', () => {
  const r=run({...ISRAEL_1949,seats:3},[20000,20000,10000],[['L0','L1']]);
  // The pair wins three seats nationally; its floor(votes / 4) quota gives four initial seats.
  expect(r.warnings.some(w=>w.code==='quota-over-allocation' && w.data?.stage==='internal:P0')).toBe(true);
});
it('1949 floor-quotient lotteries accept a recorded result despite unequal exact fractions', () => {
  const rules={...ISRAEL_1949,seats:3,quotaSeatOffset:0};
  const input={rules,lists:[{id:'L0',votes:101n},{id:'L1',votes:100n}],agreements:[],lotteryWinners:{'national:1:L0|L1':'L1'}};
  const r=allocate(input);
  expect(r.lists.map(l=>l.seats)).toEqual([1,2]);
  expect(r.remainderSteps[0].tie?.forced).toBe(true);
  expect(r.warnings).toEqual([]);
});
