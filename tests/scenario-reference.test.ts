import { describe, expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { differsFromReference, referenceChanges, blocPieces, allocationOf } from '../src/app/derive.ts';
import { PARTS, partSnapshot } from '../src/model/parts.ts';
const base = scenarioFromDataset(loadDataset('k25'));
describe('scenario references', () => {
  it('ignores identity/log metadata and matches by stable list ID', () => {
    expect(referenceChanges({ ...base, name: 'Test', log: [{ at: 'now', action: { type: 'rename', name: 'Test' } }], lists: [...base.lists].reverse() }, base)).toEqual([]);
  });
  it('marks each edited input and becomes clean against the saved snapshot', () => {
    const id = base.lists[0].id;
    let s = applyAction(base, { type: 'setListMeta', listId: id, patch: { color: '#abcdef', nameHe: 'Test' } });
    s = applyAction(s, { type: 'setVotes', listId: id, votes: base.lists[0].votes + 100 });
    expect(referenceChanges(s, base)).toHaveLength(2);
    expect(differsFromReference(s, base, ['lists', id, 'color'])).toBe(true);
    expect(referenceChanges(s, s)).toEqual([]);
    const next = applyAction(s, { type: 'setVotes', listId: id, votes: s.lists[0].votes + 1 });
    expect(referenceChanges(next, s)).toEqual([['lists', id, 'votes']]);
    expect(referenceChanges(next, base)).toHaveLength(2);
  });
  it('detects removals, candidates, totals, rules and agreements', () => {
    for (const key of ['registered', 'invalid'] as const) expect(differsFromReference({ ...base, [key]: base[key] + 1 }, base, [key])).toBe(true);
    const s = { ...base, agreements: [], lists: base.lists.slice(1), rules: { ...base.rules, seats: 121 } };
    expect(referenceChanges(s, base).some(p => p[0] === 'agreements')).toBe(true);
    expect(referenceChanges(s, base).some(p => p[0] === 'rules')).toBe(true);
    expect(referenceChanges(s, base).some(p => p[1] === base.lists[0].id)).toBe(true);
  });
});
describe('shared part actions', () => {
  it('registers all nine parts and meaningful blank choices', () => {
    expect(Object.keys(PARTS)).toHaveLength(9);
    expect(Object.values(PARTS).every(p => p.en && p.he && typeof p.blank === 'boolean')).toBe(true);
    expect(PARTS.votes.blank).toBe(false);
  });
  it('starts a named empty grouping with every list/party/member unassigned in one action', () => {
    const s = applyAction(base, { type: 'startPart', part: 'blocs', source: 'blank', name: 'Unity' });
    expect(s.customGroupingName).toBe('Unity'); expect(s.blocs).toHaveLength(2);
    expect(s.lists.every(l => l.bloc === null)).toBe(true);
    expect(blocPieces(s, allocationOf(s)).every(p => p.bloc === null)).toBe(true);
    expect(s.log).toHaveLength(1); expect(validateScenario(s)).toEqual([]);
  });
  it('replays old unnamed grouping logs and new named logs', () => {
    const old = applyAction(base, { type: 'setBlocs', blocs: base.blocs });
    expect(old.customGroupingName).toBeUndefined();
    const named = applyAction(old, { type: 'setBlocs', blocs: old.blocs, name: 'Unity' });
    expect(applyAction(named, { type: 'setBlocs', blocs: [] }).customGroupingName).toBe('Unity');
    expect(validateScenario(named)).toEqual([]);
  });
  for (const part of Object.keys(PARTS) as (keyof typeof PARTS)[]) it(`reuses and resets ${part} through one action`, () => {
    const s = applyAction(base, { type: 'startPart', part, source: 'saved', snapshot: partSnapshot(base, part), name: 'Saved' });
    const reset = applyAction(s, { type: 'startPart', part, source: 'official' }, undefined, { base });
    expect(partSnapshot(reset, part)).toEqual(partSnapshot(base, part));
    expect(validateScenario(reset)).toEqual([]);
  });
  it('rejects meaningless blanks and unknown presets', () => {
    expect(() => applyAction(base, { type: 'startPart', part: 'votes', source: 'blank' })).toThrow();
    expect(() => applyAction(base, { type: 'startPart', part: 'rules', source: 'preset', presetId: 'fake' })).toThrow();
  });
});

it('candidate ordering is a meaningful input; empty coalition equals the official default', () => {
  const l = base.lists.find(l => l.candidates.length > 1)!;
  const s = { ...base, lists: base.lists.map(x => x.id === l.id ? { ...l, candidates: [...l.candidates].reverse() } : x) };
  expect(referenceChanges(s, base)).toEqual([['lists', l.id, 'candidates']]);
  expect(referenceChanges({ ...base, coalition: { in: [], out: [] } }, base)).toEqual([]);
});

it('blank candidates affects the selected list only and is one replayable action', () => {
  const id = base.lists[0].id;
  const s = applyAction(base, { type: 'startPart', part: 'candidates', source: 'blank', listId: id });
  expect(s.lists[0].candidates).toEqual([]);
  expect(s.lists[1]).toEqual(base.lists[1]);
  expect(s.log).toHaveLength(1);
  expect(validateScenario(s)).toEqual([]);
});

it('copying a part preserves independent edits and reconciles withdrawals', () => {
  const id = base.lists[0].id;
  const named = applyAction(base, { type: 'setListMeta', listId: id, patch: { nameHe: 'Custom name' } });
  const changed = applyAction(named, { type: 'setVotes', listId: id, votes: base.lists[0].votes + 100 });
  const votes = applyAction(changed, { type: 'startPart', part: 'votes', source: 'official' }, undefined, { base });
  expect(votes.lists[0].nameHe).toBe('Custom name');
  expect(votes.lists[0].votes).toBe(base.lists[0].votes);
  const withdrawn = applyAction(changed, { type: 'setWithdrawn', listId: id, withdrawn: true });
  const structure = applyAction(withdrawn, { type: 'startPart', part: 'structure', source: 'official' }, undefined, { base });
  expect(structure.lists[0].votes).toBe(changed.lists[0].votes);
  expect(structure.lists[0].nameHe).toBe('Custom name');
  expect(structure.invalid).toBe(base.invalid);
  expect(validateScenario(structure)).toEqual([]);
});

it('totals restore the source turnout without replacing current vote preferences', () => {
  const s = applyAction(base, { type: 'setVotes', listId: base.lists[0].id, votes: base.lists[0].votes * 2 });
  const reset = applyAction(s, { type: 'startPart', part: 'totals', source: 'official' }, undefined, { base });
  expect(partSnapshot(reset,'totals')).toEqual(partSnapshot(base,'totals'));
  expect(reset.lists[0].votes).toBeGreaterThan(base.lists[0].votes);
  expect(reset.lists[0].candidates).toEqual(s.lists[0].candidates);
});
