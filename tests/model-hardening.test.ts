import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ActionError, applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validateScenario, validVotes, type Action } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';

const ds = loadDataset('k26');
const base = scenarioFromDataset(ds);
const ctx = { base };
const run = (s: typeof base, ...as: Action[]) => as.reduce((x, a) => applyAction(x, a, undefined, ctx), s);

describe('reset/restore resolve against the dataset, so replay follows corrected data', () => {
  it('resetList on a corrected dataset uses the corrected value', () => {
    const edited = run(base, { type: 'setVotes', listId: '26-מחל', votes: 1 });
    const corrected = { ...ds, lists: ds.lists.map((l) => (l.id === '26-מחל' ? { ...l, votes: l.votes + 1234 } : l)) };
    const cbase = scenarioFromDataset(corrected);
    const replayed = [...edited.log.map((e) => e.action), { type: 'resetList', listId: '26-מחל' } as Action]
      .reduce((x, a) => applyAction(x, a, undefined, { base: cbase }), cbase);
    expect(replayed.lists.find((l) => l.id === '26-מחל')!.votes).toBe(1167589 + 1234);
  });
  it('resetVotes and resetCandidates restore only that part', () => {
    const l = base.lists.find((x) => x.id === '26-מחל')!;
    let s = run(base, { type: 'setVotes', listId: l.id, votes: 5 }, { type: 'candidates', listId: l.id, candidates: l.candidates.slice(1), note: 'x' }, { type: 'setListMeta', listId: l.id, patch: { color: '#000000' } });
    s = run(s, { type: 'resetVotes', listId: l.id }, { type: 'resetCandidates', listId: l.id });
    const r = s.lists.find((x) => x.id === l.id)!;
    expect([r.votes, r.candidates.length, r.color]).toEqual([l.votes, l.candidates.length, '#000000']);
  });
  it('restore without payload uses the base scenario', () => {
    const s = run(base, { type: 'removeAgreement', id: base.agreements[0].id }, { type: 'setTotals', registered: 9, invalid: 9 }, { type: 'restore', what: 'agreements' }, { type: 'restore', what: 'totals' });
    expect(s.agreements).toEqual(base.agreements);
    expect([s.registered, s.invalid]).toEqual([base.registered, base.invalid]);
  });
});

describe('malformed actions are rejected, never applied', () => {
  const bad: [string, Action][] = [
    ['merge a list with itself', { type: 'merge', ids: ['26-מחל', '26-מחל'], newId: 'x', nameHe: 'x', letters: 'x', color: '#000', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'abstain' }],
    ['merge onto an existing id', { type: 'merge', ids: ['26-ג', '26-שס'], newId: '26-מחל', nameHe: 'x', letters: 'x', color: '#000', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'abstain' }],
    ['redistribute with a repeated source', { type: 'redistribute', from: ['26-נף', '26-נף'], to: [{ listId: '26-מחל', share: 1 }], votes: 600 }],
    ['redistribute to nobody', { type: 'redistribute', from: ['26-מחל'], to: [], votes: 10 }],
    ['withdraw an unknown list', { type: 'setWithdrawn', listId: 'nope', withdrawn: true }],
    ['edit candidates of an unknown list', { type: 'candidates', listId: 'nope', candidates: [], note: '' }],
  ];
  for (const [name, a] of bad) it(name, () => expect(() => run(base, a)).toThrow(ActionError));
});

describe('withdrawing a list', () => {
  it('turns its votes into invalid ballots, and reinstating returns them', () => {
    const w = run(base, { type: 'setWithdrawn', listId: '26-ב', withdrawn: true });
    expect(w.lists.find((l) => l.id === '26-ב')!.votes).toBe(0);
    expect(w.invalid).toBe(base.invalid + 326_788);
    expect(validVotes(w)).toBe(validVotes(base) - 326_788);
    const r = allocate(toEngineInput(w));
    expect(r.seatsAllocated).toBe(120);
    const back = run(w, { type: 'setWithdrawn', listId: '26-ב', withdrawn: false });
    expect(back.lists.find((l) => l.id === '26-ב')!.votes).toBe(326_788);
    expect(back.invalid).toBe(base.invalid);
  });
});

describe('import validation', () => {
  it('accepts an exported scenario and rejects broken ones', () => {
    expect(validateScenario(JSON.parse(JSON.stringify(base)))).toEqual([]);
    const broken = JSON.parse(JSON.stringify(base));
    broken.rules.thresholdPct = 'abc';
    delete broken.lists[0].candidates;
    broken.lists[1].votes = -4;
    const problems = validateScenario(broken);
    expect(problems.join(' ')).toMatch(/threshold/);
    expect(problems.join(' ')).toMatch(/candidates/);
    expect(problems.join(' ')).toMatch(/vote count/);
  });
});
