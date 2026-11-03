// A tie whose outcome cannot change any list's seats is reported as information, not as a required lottery.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { allocate } from '../src/engine/allocate.ts';
import { tieAffectsSeats } from '../src/app/derive.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';

describe('tie outcomes', () => {
  it('1949: the integer tie only orders seats, so it does not affect seats', () => {
    const s = scenarioFromDataset(JSON.parse(readFileSync('public/data/k1.json', 'utf8')));
    const w = allocate(toEngineInput(s)).warnings.find((x) => x.code === 'lottery-required')!;
    expect(w).toBeDefined();
    expect(tieAffectsSeats(s, w)).toBe(false);
  });
  it('a tie for the last seat does affect seats', () => {
    const base = scenarioFromDataset(loadDataset('k25'));
    const [a, b] = base.lists;
    // two equal lists alone in the race for 3 seats: whoever wins the tie gets 2
    let s = applyAction(base, { type: 'setMode', mode: 'experimental' });
    s = applyAction(s, { type: 'setRules', patch: { seats: 3 } });
    s = { ...s, lists: s.lists.map((l) => (l.id === a.id || l.id === b.id ? { ...l, votes: 500000 } : { ...l, votes: 0 })), agreements: [] };
    const w = allocate(toEngineInput(s)).warnings.find((x) => x.code === 'lottery-required')!;
    expect(w).toBeDefined();
    expect(tieAffectsSeats(s, w)).toBe(true);
  });
});
