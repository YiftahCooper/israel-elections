// Experimental allocation methods: D'Hondt, modified Sainte-Laguë and Droop largest remainder.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { RULESETS } from '../src/engine/rules.ts';
import type { RuleSet } from '../src/engine/types.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';

const base: RuleSet = { ...RULESETS['il-2014-bader-ofer-3.25'], threshold: { num: 0n, den: 1n }, majorityCap: false };
const run = (method: RuleSet['remainderMethod'], votes: number[], seats: number) =>
  allocate({ rules: { ...base, seats, remainderMethod: method }, lists: votes.map((v, i) => ({ id: `L${i}`, votes: BigInt(v) })), agreements: [] }).lists.map((l) => l.seats);

describe('experimental allocation methods', () => {
  it('D’Hondt gives the textbook result', () => {
    // classic example: 100k/80k/30k/20k for 8 seats → 4, 3, 1, 0
    expect(run('dhondt', [100000, 80000, 30000, 20000], 8)).toEqual([4, 3, 1, 0]);
  });
  it('D’Hondt matches Bader–Ofer when there are no agreements or half cap (2022)', () => {
    const s = scenarioFromDataset(loadDataset('k25'));
    s.agreements = [];
    const seats = (m: RuleSet['remainderMethod']) => allocate(toEngineInput({ ...s, mode: 'experimental', rules: { ...s.rules, remainderMethod: m, majorityCap: false } })).lists.map((l) => l.seats);
    expect(seats('dhondt')).toEqual(seats('bader-ofer'));
  });
  it('modified Sainte-Laguë uses 1.4 as the first divisor', () => {
    // first seat: 1300 ÷ 1.4 beats 1000 ÷ 1.4
    expect(run('modified-sainte-lague', [1300, 1000], 1)).toEqual([1, 0]);
    // second seat: 1300 ÷ 3 = 433 loses to 1000 ÷ 1.4 = 714
    expect(run('modified-sainte-lague', [1300, 1000], 2)).toEqual([1, 1]);
    // the 1.4 first divisor delays a small list's first seat: for the second seat, 4000 ÷ 1.4 = 2857 loses to
    // 10000 ÷ 3 = 3333, while plain Sainte-Laguë compares 4000 with 3333 and gives it the seat
    expect(run('modified-sainte-lague', [10000, 4000], 2)).toEqual([2, 0]);
    expect(run('sainte-lague', [10000, 4000], 2)).toEqual([1, 1]);
  });
  it('Droop largest remainder uses ⌊votes ÷ (seats + 1)⌋ + 1 as its quota', () => {
    const r = allocate({ rules: { ...base, seats: 5, remainderMethod: 'droop' }, lists: [{ id: 'A', votes: 4700n }, { id: 'B', votes: 2300n }, { id: 'C', votes: 3000n }], agreements: [] });
    expect(r.quota).toEqual({ num: 1667n, den: 1n }); // ⌊10000 ÷ 6⌋ + 1
    expect(r.lists.map((l) => l.initialSeats)).toEqual([2, 1, 1]);
    // remainders: A 4700 − 3334 = 1366, B 2300 − 1667 = 633, C 3000 − 1667 = 1333, so the fifth seat goes to A
    expect(r.lists.map((l) => l.seats)).toEqual([3, 1, 1]);
  });
  it('scenarios using them pass import validation', () => {
    const s = scenarioFromDataset(loadDataset('k25'));
    for (const m of ['dhondt', 'modified-sainte-lague', 'droop'] as const)
      expect(validateScenario(JSON.parse(JSON.stringify({ ...s, mode: 'experimental', rules: { ...s.rules, remainderMethod: m } })))).toEqual([]);
  });
});
