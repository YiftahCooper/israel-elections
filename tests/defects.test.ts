import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { goals, minimalChange, perturb, type Goal, type VoteSource } from '../src/engine/analysis.ts';
import { ISRAEL_2014 } from '../src/engine/rules.ts';
import { ActionError, applyAction } from '../src/model/actions.ts';
import { historicalRules, electionRuleSetId, scenarioFromDataset, validateScenario, validVotes, type Action } from '../src/model/scenario.ts';
import { replay } from '../src/app/store.ts';
import { clampTarget, deltaAction } from '../src/app/voteEdit.ts';
import { loadDataset } from './helpers.ts';

const ds = loadDataset('k26');
const base = scenarioFromDataset(ds);
const tiny = (votes: number[]) => ({ ...base, invalid: 0, agreements: [], lists: votes.map((votes, i) => ({ ...base.lists[i], id: `L${i}`, votes, candidates: [] })) });
const split = (votes: number[]): Action => ({ type: 'split', id: 'L0', parts: votes.map((votes, i) => ({ newId: `part${i}`, nameHe: 'part', letters: 'p', color: '#000000', votes, candidateIds: [] })) });

it('separates agreement and standalone list namespaces, including remainder ties', () => {
  for (const votes of [[60000, 40000, 100000], [1, 1, 5], [2, 2, 3]]) {
    const lists = votes.map((v, i) => ({ id: ['a', 'b', 'c'][i], votes: BigInt(v) }));
    const collision = allocate({ rules: ISRAEL_2014, lists, agreements: [{ id: 'c', members: ['a', 'b'] }] });
    const separate = allocate({ rules: ISRAEL_2014, lists, agreements: [{ id: 'pair', members: ['a', 'b'] }] });
    expect(collision.lists.map(l => l.seats)).toEqual(separate.lists.map(l => l.seats));
    expect(collision.seatsAllocated).toBe(120);
  }
});

it('rejects splits which discard votes', () => {
  expect(() => applyAction(tiny([100]), split([30, 30]))).toThrow(ActionError);
  expect(validVotes(applyAction(tiny([100]), split([30, 70])))).toBe(100);
});
it('reports a failed split replay when corrected source votes differ', () => {
  const l = base.lists[0];
  const action = { ...split([30, l.votes - 30]), id: l.id } as Action;
  const changed = { ...ds, lists: ds.lists.map(x => x.id === l.id ? { ...x, votes: x.votes + 40 } : x) };
  const result = replay(changed, 'split', [action]);
  expect(result.failed).toBe(1);
  expect(validVotes(result.scenario)).toBe(validVotes(base) + 40);
});

describe('safe integer vote transitions', () => {
  const max = Number.MAX_SAFE_INTEGER;
  const cases: [string, number[], Action, number?][] = [
    ['transfer overflow', [max, 2], { type: 'transfer', from: 'L1', to: 'L0', votes: 2 }],
    ['added votes overflow', [max], { type: 'addVoters', allocations: [{ listId: 'L0', votes: 2 }], invalid: 0 }],
    ['repeated added votes overflow', [max - 1], { type: 'addVoters', allocations: [{ listId: 'L0', votes: 1 }, { listId: 'L0', votes: 1 }], invalid: 0 }],
    ['invalid ballots overflow', [0], { type: 'addVoters', allocations: [], invalid: 2 }, max],
    ['safe counts but unsafe total', [max - 1, 0], { type: 'setVotes', listId: 'L1', votes: 2 }],
    ['safe valid total but unsafe cast total', [max - 1], { type: 'setTotals', invalid: 2 }],
    ['merge overflow', [max, 2], { type: 'merge', ids: ['L0', 'L1'], newId: 'm', nameHe: 'm', letters: 'm', color: '#000', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'invalid' }],
    ['scale overflow', [max], { type: 'scaleAll', factorPct: 101 }],
    ['redistribute overflow', [max, 2], { type: 'redistribute', from: ['L1'], to: [{ listId: 'L0', share: 1 }], votes: 2 }],
  ];
  for (const [name, votes, action, invalid = 0] of cases) it(name, () => {
    const s = { ...tiny(votes), invalid };
    const original = structuredClone(s);
    expect(() => applyAction(s, action)).toThrow(ActionError);
    expect(s).toEqual(original);
  });
  it('handles maximum-safe turnout and scaling without a rounding overflow', () => {
    const s = { ...tiny([max]), registered: max };
    expect(validVotes(applyAction(s, { type: 'setTurnout', pct: 100 }))).toBe(max);
    expect(validVotes(applyAction(s, { type: 'scaleAll', factorPct: 100 }))).toBe(max);
  });
});

it('finds the non-monotone group goal missed by exponential probes', () => {
  const input = { rules: ISRAEL_2014, lists: [1700, 5300, 4000, 6200, 11300, 12300].map((v, i) => ({ id: `L${i}`, votes: BigInt(v) })), agreements: [{ id: 'P4', members: ['L4', 'L5'] }] };
  const result = minimalChange(input, 'L4', { kind: 'transfer', listId: 'L1' }, goals.groupSeatsAtLeast(['L2', 'L4'], 61));
  expect(result.votes).toBe(4990n);
  expect(result.exact).toBe(true);
});
it('marks unexhausted non-monotone searches inconclusive', () => {
  const input = { rules: ISRAEL_2014, lists: [{ id: 'a', votes: 100000n }, { id: 'b', votes: 100000n }], agreements: [] };
  const result = minimalChange(input, 'a', { kind: 'transfer', listId: 'b' }, goals.groupSeatsAtLeast(['a'], 121), 'gain', 10);
  expect(result.found).toBe(false);
  expect(result.exact).toBe(false);
  expect(result.reason).toBe('inconclusive');
});
it('matches brute-force minima for all supported goals on seeded small elections', () => {
  let seed = 0x45abcd;
  const random = (n: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let trial = 0; trial < 30; trial++) {
    const input = { rules: { ...ISRAEL_2014, seats: 7 }, lists: Array.from({ length: 3 + random(3) }, (_, i) => ({ id: `L${i}`, votes: BigInt(1 + random(18)) })), agreements: trial % 2 ? [{ id: 'P', members: ['L0', 'L1'] }] : [] };
    const before = allocate(input);
    const tests: Goal[] = [goals.seatGain('L0'), goals.seatLoss('L0'), goals.qualify('L0'), goals.disqualify('L0'), goals.seatsAtLeast('L0', 4), goals.groupSeatsAtLeast(['L0', 'L2'], 4), goals.groupSeatsBelow(['L0', 'L2'], 4)];
    for (const source of [{ kind: 'new' }, { kind: 'transfer', listId: 'L1' }, { kind: 'proportional', listIds: [] }] as VoteSource[]) for (const dir of ['gain', 'lose'] as const) {
      const results = tests.map(g => minimalChange(input, 'L0', source, g, dir));
      const minima = tests.map(g => g(before, before) ? 0n : null as bigint | null);
      for (let k = 1n; k <= results[0].limit; k++) {
        const p = perturb(input, 'L0', source, k, dir);
        if (!p) continue;
        const after = allocate(p);
        tests.forEach((g, i) => { if (minima[i] === null && g(after, before)) minima[i] = k; });
      }
      results.forEach((r, i) => {
        expect(r.votes, `trial ${trial}, ${source.kind}, ${dir}, goal ${i}`).toBe(minima[i] === 0n ? null : minima[i]);
        expect(r.exact).toBe(true);
      });
    }
  }
}, 20_000);

describe('import boundary validation', () => {
  const malformed: [string, (s: any) => void][] = [
    ['agreement/list id collision', s => { s.agreements[0].id = s.lists[0].id; }],
    ['null bloc', s => { s.blocs = [null]; }],
    ['bloc fields', s => { s.blocs[0].nameEn = 1; }],
    ['duplicate blocs', s => { s.blocs.push(s.blocs[0]); }],
    ['unknown bloc reference', s => { s.lists[0].bloc = 'missing'; }],
    ['null list', s => { s.lists[0] = null; }],
    ['bad origins', s => { s.lists[0].originIds = [null]; }],
    ['bad optional list fields', s => { s.lists[0].shortEn = 3; }],
    ['bad sponsors', s => { s.lists[0].sponsorsHe = null; }],
    ['bad held votes', s => { s.lists[0].heldVotes = -1; }],
    ['duplicate candidate ids', s => { s.lists[0].candidates.push(s.lists[0].candidates[0]); }],
    ['bad candidate party', s => { s.lists[0].candidates[0].partyHe = {}; }],
    ['null agreement', s => { s.agreements = [null]; }],
    ['agreement fields', s => { s.agreements[0].enabled = 'yes'; }],
    ['unknown member', s => { s.agreements[0].members[0] = 'absent'; }],
    ['duplicate agreement ids', s => { s.agreements.push({ ...s.agreements[0], enabled: false }); }],
    ['duplicate members', s => { s.agreements[0].members[1] = s.agreements[0].members[0]; }],
    ['repeated active membership', s => { s.agreements.push({ id: 'new-pair', enabled: true, members: [...s.agreements[0].members] }); }],
    ['null log entry', s => { s.log = [null]; }],
    ['unknown log action', s => { s.log = [{ at: '2026-01-01', action: { type: 'bogus' } }]; }],
    ['malformed nested log action', s => { s.log = [{ at: '2026-01-01', action: { type: 'split', id: 'old', parts: [null] } }]; }],
    ['array lottery winners', s => { s.lotteryWinners = []; }],
    ['non-string lottery winner', s => { s.lotteryWinners = { key: null }; }],
    ['unsafe aggregate votes', s => { s.lists[0].votes = Number.MAX_SAFE_INTEGER; }],
  ];
  for (const [name, mutate] of malformed) it(`rejects ${name} without throwing`, () => {
    const s = structuredClone(base); mutate(s);
    expect(validateScenario(s).length).toBeGreaterThan(0);
  });
  it('accepts exported scenarios and structurally valid logs referencing removed lists', () => {
    const s = applyAction(base, { type: 'removeList', listId: base.lists[0].id });
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });
  it('rejects experimental rules labelled historical in every era', () => {
    for (const electionId of ['k16', 'k17', 'k26'] as const) {
      const s = { ...base, electionId, rules: historicalRules(electionRuleSetId(electionId)) };
      expect(validateScenario(s)).toEqual([]);
      for (const [key, value] of Object.entries({ seats: 1, thresholdPct: '0', majorityCap: false, quotaRounding: 'exact', remainderMethod: 'sainte-lague', maxAgreementSize: 3, agreementRequiresAllQualify: false })) {
        expect(validateScenario({ ...s, rules: { ...s.rules, [key]: value } }).join(' ')).toMatch(/historical/);
      }
      expect(validateScenario({ ...s, mode: 'experimental', rules: { ...s.rules, seats: 1 } })).toEqual([]);
    }
  });
});

it('resetting metadata preserves votes balanced from an insufficient donor', () => {
  const id = '26-מחל';
  const edited = applyAction(applyAction(base, { type: 'setVotes', listId: id, votes: 0 }), { type: 'setListMeta', listId: id, patch: { color: '#000000' } });
  const l = edited.lists.find(l => l.id === id)!;
  const src = { kind: 'transfer', listId: '26-נף' } as const;
  const delta = deltaAction(edited, l, clampTarget(edited, l, 1167589, src) - l.votes, src)!;
  const balanced = applyAction(edited, delta);
  const reset = applyAction(balanced, { type: 'resetList', listId: id, keepVotes: true } as Action, undefined, { base });
  expect(validVotes(reset)).toBe(validVotes(edited));
  expect(reset.lists.find(l => l.id === id)).toEqual({ ...base.lists.find(l => l.id === id), votes: 524 });
});

it('rejects malformed action patches with object-prototype field names', () => {
  const s = structuredClone(base);
  s.log = JSON.parse('[{"at":"2026-01-01","action":{"type":"setRules","patch":{"__proto__":{}}}}]');
  expect(validateScenario(s).length).toBeGreaterThan(0);
});

it('round-trips disabled experimental agreements after returning to historical mode', () => {
  let s = applyAction(base, { type: 'setMode', mode: 'experimental' });
  s = applyAction(s, { type: 'setRules', patch: { maxAgreementSize: 3 } });
  s = applyAction(s, { type: 'setAgreement', agreement: { id: 'three-way', enabled: true, members: base.lists.slice(0, 3).map(l => l.id) } });
  s = applyAction(s, { type: 'setMode', mode: 'historical' });
  expect(s.agreements.find(a => a.id === 'three-way')!.enabled).toBe(false);
  expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
});
