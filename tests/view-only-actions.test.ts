import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { referenceChanges, resultChanges } from '../src/app/derive.ts';
import { ACTION_CLASSIFICATION, isFactAction } from '../src/model/actionClassification.ts';
import { scenarioKey } from '../src/app/store.ts';
const base = scenarioFromDataset(loadDataset('k25'));
describe('view-only choices', () => {
  it('sourced grouping selection remains official without losing the selection or log', () => {
    for (const scheme of base.blocSchemes!) {
      const s = applyAction(base, { type: 'applyBlocScheme', schemeId: scheme.id });
      expect(referenceChanges(s, base)).toEqual([]);
      expect(scenarioKey({ scenario: s, reference: null })).toBe('official');
      expect(s.blocSchemeId).toBe(scheme.id);
      expect(s.log).toHaveLength(1);
    }
  });
  it('faction counting and coalition inspection do not change facts or allocation', () => {
    const joint = base.lists.find(l => (l.parties?.length ?? 0) > 1)!;
    const s = applyAction(applyAction(base, { type: 'setFactionSplit', listId: joint.id, split: true }), { type: 'setCoalition', coalition: { in: [joint.id], out: [] } });
    expect(toEngineInput(s)).toEqual(toEngineInput(base));
    expect(resultChanges(s, base)).toEqual([]);
    expect(referenceChanges(s, base)).toEqual([['coalition','in']]);
    expect(scenarioKey({ scenario: s, reference: null })).toBe('official');
  });
  it('membership and custom schemes stay marked analysis after selecting another sourced scheme', () => {
    const s = applyAction(base, { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id });
    const edited = applyAction(s, { type: 'setListMeta', listId: s.lists[0].id, patch: { bloc: null } });
    expect(referenceChanges(edited, base).length).toBeGreaterThan(0);
    expect(scenarioKey({ scenario: edited, reference: null })).toBe('official');
    expect(resultChanges(edited,base)).toEqual([]);
    expect(referenceChanges(applyAction(s, { type: 'setBlocs', blocs: s.blocs, name: 'Mine' }), base).length).toBeGreaterThan(0);
  });
  it('legacy saved logs with view choices and assigned identity remain official, clean and intact', () => {
    const s = applyAction(applyAction(base, { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id }), { type: 'setIdentityColor', color: '#486b78' });
    expect(scenarioKey({ scenario: s, reference: s })).toBe('official');
    expect(s.log).toHaveLength(2);
    expect(referenceChanges(s, base)).toEqual([]);
  });
});

it('classifies every declared action type explicitly (including payload-dependent startPart)', () => {
  const source = readFileSync(new URL('../src/model/scenario.ts', import.meta.url), 'utf8').split('export type Action =')[1].split('/** What reset/restore')[0];
  const types = [...new Set([...source.matchAll(/type: '([^']+)'/g)].map(m => m[1]))].sort();
  expect(Object.keys(ACTION_CLASSIFICATION).sort()).toEqual(types);
  expect(isFactAction({ type: 'startPart', part: 'blocs', source: 'preset', presetId: 'pm-recommendations' })).toBe(false);
  expect(isFactAction({ type: 'startPart', part: 'blocs', source: 'blank', name: 'Mine' })).toBe(false);
  expect(isFactAction({ type: 'startPart', part: 'coalitions', source: 'blank' })).toBe(false);
});

it('changing the view of a saved factual scenario stays clean; dropping custom membership does not', () => {
  const saved = applyAction(base, { type: 'setVotes', listId: base.lists[0].id, votes: base.lists[0].votes + 100 });
  const view = applyAction(saved, { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id });
  expect(scenarioKey({ scenario: view, reference: saved })).toBe(saved.id);
  expect(referenceChanges(view, saved)).toEqual([]);
  const custom = applyAction(view, { type: 'setListMeta', listId: view.lists[0].id, patch: { bloc: null } });
  const restored = applyAction(custom, { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id });
  expect(scenarioKey({ scenario: restored, reference: custom })).toMatch(/^draft:/);
});

it('legacy grouping restoration after a sourced view selection stays official', () => {
  const viewed = applyAction(base, { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id });
  const restored = applyAction(viewed, { type: 'restore', what: 'blocs' }, undefined, { base });
  expect(referenceChanges(restored, base)).toEqual([]);
  expect(scenarioKey({ scenario: restored, reference: null })).toBe('official');
  expect(restored.log).toHaveLength(2);
});

it('author metadata stays saveable without factual markers or factual edit counts', () => {
  const named = applyAction(base, { type: 'rename', name: 'Official view' });
  expect(scenarioKey({ scenario: named, reference: null })).toMatch(/^draft:/);
  expect(scenarioKey({ scenario: named, reference: named })).toBe(named.id);
  expect(referenceChanges(named, base)).toEqual([]);
});
