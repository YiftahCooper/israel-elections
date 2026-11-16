// Round 7 (16 Nov 2026): the user's own choices for a level stay across level changes, a choice equal to the level's
// own is no choice at all, a detail without a folded form counts as off when collapsed, and one colour resets alone.
import { expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { PRESETS, SHOW_OR_HIDE, ownChoices, shownAs } from '../src/app/features.ts';
import { getState, setFeature, setLevel, setState } from '../src/app/store.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';

it('a level change keeps own choices; a choice equal to the level is dropped', () => {
  setState({ level: 'simple', customFeatures: null });
  setFeature('sens', 'show');
  setFeature('agreementMarks', 'show');
  expect(getState().customFeatures).toEqual({ sens: 'show', agreementMarks: 'show' });
  setLevel('expert');
  expect(getState().customFeatures).toEqual({ sens: 'show', agreementMarks: 'show' });
  // at Expert both are the level's own, so neither is listed as a choice of the user's
  expect(ownChoices(getState().customFeatures, 'expert')).toEqual([]);
  expect(ownChoices(getState().customFeatures, 'simple').sort()).toEqual(['agreementMarks', 'sens']);
  // setting a part back to its level's own value removes it
  setLevel('simple');
  setFeature('sens', PRESETS.simple.sens);
  setFeature('agreementMarks', PRESETS.simple.agreementMarks);
  expect(getState().customFeatures).toBeNull();
});

it('a detail with no folded form is off when collapsed (Side by side keeps its old meaning)', () => {
  for (const id of SHOW_OR_HIDE) expect(shownAs(id, 'collapsed')).toBe(id === 'compare' ? 'collapsed' : 'hidden');
  expect(shownAs('charts', 'collapsed')).toBe('collapsed');
  expect(ownChoices({ agreementMarks: 'collapsed' }, 'simple')).toEqual([]);
});

it('one colour resets alone: a list, a party in a joint list, a bloc', () => {
  const ds = loadDataset('k25'), base = scenarioFromDataset(ds), ctx = { base };
  const [a, b] = base.lists;
  let s = applyAction(base, { type: 'setListMeta', listId: a.id, patch: { color: '#123456' } }, undefined, ctx);
  s = applyAction(s, { type: 'setListMeta', listId: b.id, patch: { color: '#654321' } }, undefined, ctx);
  s = applyAction(s, { type: 'setBlocAppearance', blocs: s.blocs.map((x, i) => i === 0 ? { ...x, color: '#abcdef' } : x) }, undefined, ctx);
  const joint = s.lists.find(l => l.parties?.length)!;
  const party = joint.parties![0];
  s = applyAction(s, { type: 'setPartyColor', listId: joint.id, partyId: party.id, color: '#0f0f0f' }, undefined, ctx);
  const one = applyAction(s, { type: 'resetColors', only: { list: a.id } }, undefined, ctx);
  expect(one.lists.find(l => l.id === a.id)!.color).toBe(a.color);
  expect(one.lists.find(l => l.id === b.id)!.color).toBe('#654321');
  expect(one.blocs[0].color).toBe('#abcdef');
  const p = applyAction(s, { type: 'resetColors', only: { list: joint.id, party: party.id } }, undefined, ctx);
  expect(p.lists.find(l => l.id === joint.id)!.parties!.find(x => x.id === party.id)!.customColor).toBeFalsy();
  expect(p.lists.find(l => l.id === b.id)!.color).toBe('#654321');
  const bl = applyAction(s, { type: 'resetColors', only: { bloc: s.blocs[0].id } }, undefined, ctx);
  expect(bl.blocs[0].color).toBe(base.blocs[0].color);
  expect(bl.lists.find(l => l.id === b.id)!.color).toBe('#654321');
});
