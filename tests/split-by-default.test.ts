import { beforeEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { dispatch, getState, setState, setPreference, replay, shareLink, readSharedFromHash, saveCurrent, undo } from '../src/app/store.ts';
import { baselineOf } from '../src/app/factionDefaults.ts';
import { inputDiffs } from '../src/model/editScopes.ts';
import { allocationOf, seatHolders } from '../src/app/derive.ts';
const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8')) as ElectionDataset;
const joint = ds.lists.find(l => l.shortEn === 'Religious Zionism')!;
beforeEach(() => {
  setState({ scenario: null, reference: null, past: [], future: [], sessions: {}, scenarioDrafts: {}, saved: [], datasets: { k25: ds }, electionId: 'k25' });
  setPreference('jointSeats', 'off');
});
test('personal baseline is unedited, counts parties, preserves all 120 seats and allocation', () => {
  const off = baselineOf(ds);
  setPreference('jointSeats', 'on');
  const on = baselineOf(ds);
  expect(on.factionSplits).toContain(joint.id);
  expect(on.log).toEqual([]);
  expect(allocationOf(on)).toEqual(allocationOf(off));
  expect(seatHolders(on, allocationOf(on)).reduce((n, f) => n + f.seats, 0)).toBe(120);
  setState({ scenario: on });
  expect(inputDiffs(on, baselineOf(ds))).toEqual([]);
  dispatch({ type: 'setFactionSplit', listId: joint.id, split: false });
  expect(inputDiffs(getState().scenario!, on)).toEqual([]);
  dispatch({ type: 'setFactionSplit', listId: joint.id, split: true });
  expect(inputDiffs(getState().scenario!, on)).toEqual([]);
  undo(); expect(getState().scenario!.factionSplits).not.toContain(joint.id);
  undo(); expect(getState().scenario!.factionSplits).toContain(joint.id);
});
test('preference rebases references, sessions and undo while retaining explicit choices and votes', () => {
  setState({ scenario: baselineOf(ds) });
  dispatch({ type: 'setFactionSplit', listId: joint.id, split: false });
  dispatch({ type: 'setVotes', listId: joint.id, votes: joint.votes + 10 });
  const before = getState().scenario!;
  setState({ reference: before, sessions: { k25: { scenario: before, reference: before, past: [], future: [] } } });
  setPreference('jointSeats', 'on');
  expect(getState().scenario!.factionSplits).not.toContain(joint.id);
  expect(getState().scenario!.lists.find(l => l.id === joint.id)!.votes).toBe(joint.votes + 10);
  expect(getState().scenario!.log).toEqual(before.log);
  expect(getState().reference!.factionSplits).toEqual(getState().scenario!.factionSplits);
  expect(getState().sessions.k25!.scenario.factionSplits).toEqual(getState().scenario!.factionSplits);
  undo(); expect(getState().scenario!.factionSplits).not.toContain(joint.id);
  undo(); expect(getState().scenario!.factionSplits).toContain(joint.id);
});
test.each([false, true])('links and saves preserve explicit baseline %s across opposite viewer preference', async on => {
  vi.stubGlobal('localStorage', { setItem: vi.fn() });
  vi.stubGlobal('location', { origin: 'https://example.test', pathname: '/', hash: '' });
  setPreference('jointSeats', on ? 'on' : 'off');
  setState({ scenario: { ...baselineOf(ds), id: 'test' } });
  dispatch({ type: 'setFactionSplit', listId: joint.id, split: !on });
  const original = getState().scenario!;
  const url = await shareLink();
  saveCurrent('Saved');
  const saved = getState().saved[0];
  setPreference('jointSeats', on ? 'off' : 'on');
  location.hash = new URL(url).hash;
  const shared = (await readSharedFromHash())!;
  for (const x of [shared, saved]) {
    const restored = replay(ds, x.name, x.log, x.factionSplitBaseline ?? false).scenario;
    expect(new Set(restored.factionSplits)).toEqual(new Set(original.factionSplits));
    expect(restored.log.filter(e => e.action.type === 'setFactionSplit')).toHaveLength(1);
  }
  vi.unstubAllGlobals();
});

test('unrecorded party IDs leave elected seats with the list', () => {
  setPreference('jointSeats', 'on');
  const base = baselineOf(ds);
  const s = { ...base, lists: base.lists.map(l => l.id === joint.id ? { ...l, candidates: l.candidates.map(c => ({ ...c, partyId: undefined })) } : l) };
  const holders = seatHolders(s, allocationOf(s)).filter(h => h.listId === joint.id && h.seats > 0);
  expect(holders).toHaveLength(1);
  expect(holders[0].partyId).toBeNull();
  expect(holders[0].seats).toBe(allocationOf(s).lists.find(l => l.id === joint.id)!.seats);
});

test('rebasing a structure reset remains reproducible from the saved log', () => {
  setState({ scenario: baselineOf(ds) });
  dispatch({ type: 'setFactionSplit', listId: joint.id, split: true });
  dispatch({ type: 'startPart', part: 'structure', source: 'official', name: 'Official lists' });
  setPreference('jointSeats', 'on');
  const s = getState().scenario!;
  const restored = replay(ds, s.name, s.log.map(e => e.action), s.factionSplitBaseline).scenario;
  expect(restored.factionSplits).toEqual(s.factionSplits);
  expect(s.factionSplits).toContain(joint.id);
});
