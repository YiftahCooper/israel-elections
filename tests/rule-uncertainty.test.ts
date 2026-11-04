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
