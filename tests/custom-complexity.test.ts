// 19 Nov 2026: Simple, Standard and Expert never change; any choice of a tool or detail makes Custom, the user's own
// fourth complexity, which starts from the one in use and keeps every earlier choice. Opening someone else's scenario
// keeps the viewer's own colours wherever the viewer set one; its other colours are the author's.
import { afterEach, expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { ownChoices } from '../src/app/features.ts';
import { activeFeatures, clearOwnChoices, featureVisibility, getState, setCustom, setFeature, setLevel, setState, viewerColourSteps } from '../src/app/store.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';

afterEach(() => { setState({ level: 'simple', custom: false, customFeatures: null }); });

it('adding a tool on Simple makes Custom; Simple itself stays as it was', () => {
  setState({ level: 'simple', custom: false, customFeatures: null });
  expect(featureVisibility('sens')).toBe('collapsed');
  setFeature('sens', 'show');
  expect(getState().custom).toBe(true);
  expect(getState().level).toBe('simple'); // Custom starts from Simple
  expect(featureVisibility('sens')).toBe('show');
  // choosing Simple again shows Simple as it comes; the choice waits in Custom
  setLevel('simple');
  expect(getState().custom).toBe(false);
  expect(featureVisibility('sens')).toBe('collapsed');
  expect(getState().customFeatures).toEqual({ sens: 'show' });
  setCustom();
  expect(featureVisibility('sens')).toBe('show');
});

it('a choice made on another named complexity rebuilds Custom from it, keeping the earlier choices', () => {
  setState({ level: 'simple', custom: false, customFeatures: null });
  setFeature('sens', 'show');
  setLevel('standard');
  setFeature('charts', 'hidden');
  expect(getState()).toMatchObject({ level: 'standard', custom: true, customFeatures: { sens: 'show', charts: 'hidden' } });
  expect(ownChoices(getState().customFeatures, 'standard').sort()).toEqual(['charts', 'sens']);
});

it('a choice that changes nothing on a named complexity leaves it named; clearing every choice leaves Custom', () => {
  setState({ level: 'expert', custom: false, customFeatures: { sens: 'collapsed' } });
  setFeature('rules', 'show'); // Expert shows Rules anyway
  expect(getState().custom).toBe(false);
  setFeature('rules', 'hidden');
  expect(getState().custom).toBe(true);
  clearOwnChoices();
  expect(getState()).toMatchObject({ custom: false, customFeatures: null });
  expect(activeFeatures(getState())).toBeNull();
});

it("the viewer's own colours replace a shared scenario's only where the viewer set one", () => {
  const ds = loadDataset('k25'), base = scenarioFromDataset(ds), ctx = { base };
  const [a, b] = base.lists;
  const store = new Map<string, string>();
  const ls = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), key: () => null, length: 0, clear: () => store.clear() };
  const had = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });
  try {
    // the viewer recoloured list a on the official result
    store.set(`israel-elections:appearance:${ds.id}`, JSON.stringify([{ type: 'setListMeta', listId: a.id, patch: { color: '#123456' } }]));
    // the author recoloured both lists
    let shared = applyAction(base, { type: 'setListMeta', listId: a.id, patch: { color: '#aa0000' } }, undefined, ctx);
    shared = applyAction(shared, { type: 'setListMeta', listId: b.id, patch: { color: '#00aa00' } }, undefined, ctx);
    const steps = viewerColourSteps(ds, shared);
    expect(steps).toEqual([{ type: 'setListMeta', listId: a.id, patch: { color: '#123456' } }]);
    let seen = shared;
    for (const x of steps) seen = applyAction(seen, x, undefined, ctx);
    expect(seen.lists.find(l => l.id === a.id)!.color).toBe('#123456');
    expect(seen.lists.find(l => l.id === b.id)!.color).toBe('#00aa00');
    // a viewer who went back to the official colours keeps nothing over the author's
    store.set(`israel-elections:appearance:${ds.id}`, JSON.stringify([{ type: 'setListMeta', listId: a.id, patch: { color: '#123456' } }, { type: 'resetColors' }]));
    expect(viewerColourSteps(ds, shared)).toEqual([]);
  } finally { if (had) Object.defineProperty(globalThis, 'localStorage', had); else delete (globalThis as { localStorage?: unknown }).localStorage; }
});
