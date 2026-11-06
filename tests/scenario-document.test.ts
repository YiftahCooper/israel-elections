import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { nextCopyName, scenarioDirty } from '../src/app/scenarioDocument.ts';
const base = scenarioFromDataset(JSON.parse(readFileSync('public/data/k25.json', 'utf8')));
it('numbers copies using the first free Windows-style suffix in either language', () => {
  for (const name of ['Trial', 'תרחיש']) {
    expect(nextCopyName(name, [name, `${name} (1)`, `${name} (3)`])).toBe(`${name} (2)`);
    expect(nextCopyName(`${name} (1)`, [name, `${name} (1)`])).toBe(`${name} (2)`);
  }
});
it('detects metadata and action edits but ignores replay timestamps', () => {
  const saved = applyAction(base, { type: 'rename', name: 'Trial' });
  expect(scenarioDirty(saved, { ...saved, log: saved.log.map(e => ({ ...e, at: 'later' })) })).toBe(false);
  expect(scenarioDirty({ ...saved, name: 'Other' }, saved)).toBe(true);
  expect(scenarioDirty({ ...saved, description: 'More' }, saved)).toBe(true);
  expect(scenarioDirty(applyAction(saved, { type: 'setDescription', description: 'More' }), saved)).toBe(true);
});

it('detects changed document values and becomes clean when a value is restored', () => {
  const edited = { ...base, registered: base.registered + 1 };
  expect(scenarioDirty(edited, base)).toBe(true);
  const changed = applyAction(base, { type: 'rename', name: 'Other' });
  const restored = applyAction(changed, { type: 'rename', name: base.name });
  expect(scenarioDirty(restored, base)).toBe(false);
});

it('refuses silent name collisions and saves numbered copies under independent identities', async () => {
  const { vi } = await import('vitest');
  const { setState, getState, saveCurrent, duplicateCurrent, replay, scenarioKey, dispatch } = await import('../src/app/store.ts');
  vi.stubGlobal('localStorage', { setItem() {} });
  const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
  setState({ scenario: { ...base, name: 'Trial', id: 'first' }, saved: [], datasets: { k25: ds }, reference: null, past: [], future: [] });
  expect(saveCurrent()).toBe(true);
  expect(scenarioKey()).toBe('first');
  dispatch({ type: 'setDescription', description: 'More' });
  expect(scenarioKey()).toMatch(/^draft:/);
  expect(saveCurrent()).toBe(true);
  expect(scenarioKey()).toBe('first');
  setState({ scenario: { ...base, name: 'Trial', id: 'second' } });
  expect(saveCurrent()).toBe(false);
  expect(getState().saved).toHaveLength(1);
  duplicateCurrent();
  const copy = getState().saved[0];
  expect(copy.name).toBe('Trial (1)');
  expect(copy.id).not.toBe('first');
  expect(replay(ds, copy.name, copy.log).scenario.name).toBe('Trial (1)');
  vi.unstubAllGlobals();
});

it('compares fact-aware changes with the replayed saved checkpoint, even when the loaded reference differs', async () => {
  const { scenarioKey, replay } = await import('../src/app/store.ts');
  const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
  const group = { type: 'applyBlocScheme', schemeId: base.blocSchemes!.at(-1)!.id } as const;
  const officialView = applyAction(base, group);
  expect(scenarioKey({ scenario: officialView, reference: null })).toBe('official');
  const saved = applyAction(applyAction(base, { type: 'setVotes', listId: base.lists[0].id, votes: base.lists[0].votes + 100 }), { type: 'rename', name: 'Trial' });
  const entry = { id: saved.id, name: saved.name, electionId: saved.electionId, log: saved.log.map(e => e.action), savedAt: '2026-11-06', baseBuiltAt: saved.baseBuiltAt };
  const checkpoint = replay(ds, entry.name, entry.log).scenario;
  const view = { ...applyAction(checkpoint, group), id: entry.id };
  const state = { saved: [entry], datasets: { k25: ds }, reference: base };
  expect(scenarioKey({ ...state, scenario: view })).toBe(entry.id);
  expect(scenarioDirty(view, checkpoint)).toBe(false);
  const edited = applyAction(view, { type: 'setVotes', listId: base.lists[0].id, votes: base.lists[0].votes + 200 });
  expect(scenarioKey({ ...state, scenario: edited })).toMatch(/^draft:/);
  expect(scenarioDirty(edited, checkpoint)).toBe(true);
});
