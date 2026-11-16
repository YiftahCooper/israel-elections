import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { allocate, prepareAllocation } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { ISRAEL_1951, ISRAEL_1949 } from '../src/engine/rules.ts';
import { simple } from './helpers.ts';

const official = () => toEngineInput(scenarioFromDataset(JSON.parse(readFileSync('public/data/k9.json','utf8'))));
it('the official 1977 allocation has no inference warning, including reordered inputs', () => {
  const input = official();
  expect(allocate(input).warnings).toEqual([]);
  input.lists.reverse(); input.agreements.reverse();
  expect(allocate(input).warnings).toEqual([]);
});
it('changed votes warn even when the capped table still has the official seats; prepared votes are checked', () => {
  const input = official();
  const votes = input.lists.map(l => l.votes + 1n);
  expect(prepareAllocation(input).run(votes).warnings).toContainEqual(expect.objectContaining({code:'inferred-candidate-cap',data:expect.objectContaining({cappedIds:['9-פש']})}));
});
it('a different capped list and multiple spare seats warn', () => {
  const input = simple({a:9000,b:4000},[],{seats:12,seatsCappedAtCandidates:true});
  input.lists[0].candidateCount=2;
  const r=allocate(input);
  expect(r.lists[0].seats).toBe(2);
  expect(r.warnings).toContainEqual(expect.objectContaining({code:'inferred-candidate-cap'}));
});
it('an inactive candidate cap does not warn', () => {
  const input = simple({a:9000,b:4000},[],{seats:12,seatsCappedAtCandidates:true});
  input.lists.forEach(l => l.candidateCount=120);
  expect(allocate(input).warnings.some(w=>w.code==='inferred-candidate-cap')).toBe(false);
});
it('all uncapped eras warn on known candidate shortages, including blank rosters', () => {
  for (const rules of [undefined, ISRAEL_1951, ISRAEL_1949]) for (const candidates of [0,1]) {
    const input=simple({a:9000,b:4000},[],{...rules,seats:12});
    input.lists[0].candidateCount=candidates;
    const r=allocate(input);
    expect(r.warnings).toContainEqual(expect.objectContaining({code:'unfilled-seats',data:{list:'a',seats:r.lists[0].seats,candidates}}));
  }
});
it('partial or unavailable rosters are unknown, never an empty capacity', () => {
  const input = simple({a:9000,b:4000},[],{seats:12});
  expect(allocate(input).warnings.some(w=>w.code==='unfilled-seats')).toBe(false);
  input.lists.forEach(l=>l.candidateCount=12);
  expect(allocate(input).warnings.some(w=>w.code==='unfilled-seats')).toBe(false);
});
it('unresolved early tie procedure warns only when final seats depend on it, even with a supplied choice', () => {
  const input=simple({a:100,b:100},[],{...ISRAEL_1951,seats:3});
  const warning=allocate(input).warnings.find(w=>w.code==='lottery-required')!;
  expect(warning.data?.tiePolicy).toBe('unspecified');
  input.lotteryWinners={[String(warning.data?.key)]:'b'};
  expect(allocate(input).warnings.some(w=>w.code==='lottery-required')).toBe(true);
  expect(allocate(simple({a:100,b:100},[],{...ISRAEL_1951,seats:4})).warnings).toEqual([]);
});
it('unresolved quota fallbacks warn only when reached', () => {
  expect(allocate(simple({a:1,b:1},[],{seats:120})).warnings.some(w=>w.code==='zero-quota')).toBe(true);
  expect(allocate(simple({a:100,b:100},[],{seats:3})).warnings.some(w=>w.code==='quota-over-allocation')).toBe(false);
  expect(allocate(simple({a:1,b:1},[],{seats:1})).warnings.some(w=>w.code==='quota-over-allocation')).toBe(false);
  expect(allocate(simple({a:1,b:1,c:1},[],{seats:2})).warnings.some(w=>w.code==='quota-over-allocation')).toBe(true);
});

// 1977 capacity rule (decision 0095, research handoff data/research/round7/1977-capacity.md): an agreement that cannot
// fill a further seat from its members' rosters takes no further seat; the seat goes to the next quotient.
it('1977: Flatto-Sharon in an agreement with Poalei Agudat Yisrael still fills 120 seats; the returned seat is named', () => {
  const input = official();
  const withPair = { ...input, agreements: [...input.agreements, { id: 'x', members: ['9-פש', '9-ד'] }] };
  for (const trace of [true, false]) {
    const r = prepareAllocation(withPair).run(withPair.lists.map(l => l.votes), trace);
    expect(r.seatsAllocated).toBe(120);
    expect([r.lists.find(l => l.id === '9-פש')!.seats, r.lists.find(l => l.id === '9-ד')!.seats]).toEqual([1, 2]);
  }
  expect(allocate(withPair).warnings).toContainEqual(expect.objectContaining({ code: 'agreement-unfillable', data: { ids: ['9-פש', '9-ד'], seats: 4 } }));
  // the official result is unchanged and carries no warning (checked above); Hadash or Sheli as partner still fills 120
  for (const partner of ['9-ו', '9-ש']) {
    const r = allocate({ ...input, agreements: [...input.agreements.filter(a => !a.members.includes(partner)), { id: 'x', members: ['9-פש', partner] }] });
    expect(r.seatsAllocated, partner).toBe(120);
  }
});
