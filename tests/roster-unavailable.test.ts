// A list whose official roster could not be obtained keeps that fact through merges and splits,
// so the interface never presents an empty roster as "no candidates registered".
import { describe, expect, it } from 'vitest';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioIssues } from '../src/app/derive.ts';
import { loadDataset } from './helpers.ts';

describe('unavailable rosters', () => {
  const ds = loadDataset('k25');
  const [a, b] = ds.lists;
  const flagged = { ...ds, lists: ds.lists.map((l) => (l.id === a.id ? { ...l, candidates: [], candidatesUnavailable: true } : l)) };
  const s = scenarioFromDataset(flagged);
  it('is carried into the scenario only for the flagged list', () => {
    expect(s.lists.find((l) => l.id === a.id)!.rosterUnavailable).toBe(true);
    expect('rosterUnavailable' in s.lists.find((l) => l.id === b.id)!).toBe(false);
  });
  it('marks a merged list whose parts include an unavailable roster', () => {
    const m = applyAction(s, { type: 'merge', ids: [a.id, b.id], newId: 'm', nameHe: 'm', letters: 'm', color: '#000000', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'abstain' });
    expect(m.lists.find((l) => l.id === 'm')!.rosterUnavailable).toBe(true);
  });
  it('marks both parts of a split unavailable roster', () => {
    const v = s.lists.find((l) => l.id === a.id)!.votes;
    const sp = applyAction(s, { type: 'split', id: a.id, parts: [
      { newId: 'p1', nameHe: 'p1', letters: 'p1', color: '#000000', votes: Math.floor(v / 2), candidateIds: [] },
      { newId: 'p2', nameHe: 'p2', letters: 'p2', color: '#111111', votes: v - Math.floor(v / 2), candidateIds: [] }] });
    expect(sp.lists.filter((l) => l.id === 'p1' || l.id === 'p2').map((l) => l.rosterUnavailable)).toEqual([true, true]);
  });
  it('carries a truncated roster through scenario and merge', () => {
    const tr = scenarioFromDataset({ ...ds, lists: ds.lists.map((l) => (l.id === b.id ? { ...l, candidates: l.candidates.slice(0, 5), candidatesTruncated: true } : l)) });
    expect(tr.lists.find((l) => l.id === b.id)!.rosterTruncated).toBe(true);
    const m = applyAction(tr, { type: 'merge', ids: [a.id, b.id], newId: 'm', nameHe: 'm', letters: 'm', color: '#000000', retentionPct: 100, candidateOrder: 'concat', nonRetained: 'abstain' });
    expect(m.lists.find((l) => l.id === 'm')!.rosterTruncated).toBe(true);
  });
  it('does not report the seats of a list with an unavailable roster as vacant', () => {
    const issues = scenarioIssues(s, allocate(toEngineInput(s)));
    expect(issues.filter((x) => x.en.includes('vacant'))).toEqual([]);
    const empty = { ...s, lists: s.lists.map((l) => (l.id === a.id ? { ...l, rosterUnavailable: undefined } : l)) };
    expect(scenarioIssues(empty, allocate(toEngineInput(empty))).some((x) => x.en.includes('vacant'))).toBe(true);
  });
});
