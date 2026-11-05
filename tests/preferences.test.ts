import { beforeEach, expect, test, vi } from 'vitest';
import { answerPreference, askPreference, chooseSource, getState, setPreference, setState, withSource } from '../src/app/store.ts';
import { validAnswers } from '../src/app/preferences.ts';
beforeEach(() => setState({ preferences: {}, preferenceAsk: null, preferenceFor: null }));
test('storage accepts only supported answers', () => {
  expect(validAnswers({ comparison: 'invalid', voteSource: 'new', surprise: 'yes' })).toEqual({ voteSource: 'new' });
});
test('one pending question; selecting scope commits exactly once', () => {
  const run = vi.fn(), second = vi.fn();
  askPreference({ id: 'comparison', key: 'a', title: 'A', run });
  askPreference({ id: 'comparison', key: 'b', title: 'B', run: second });
  expect(run).not.toHaveBeenCalled();
  answerPreference('official', 'always');
  expect(run).toHaveBeenCalledExactlyOnceWith('official');
  expect(second).not.toHaveBeenCalled();
  answerPreference('reference', 'always');
  expect(run).toHaveBeenCalledTimes(1);
  askPreference({ id: 'comparison', key: 'c', title: 'C', run });
  expect(run).toHaveBeenLastCalledWith('official');
  expect(getState().preferenceAsk).toBeNull();
});
test('local answer holds for the current target, changing targets asks again', () => {
  const run = vi.fn();
  withSource('list:a', 'A', [], run); answerPreference('new', 'item');
  withSource('list:a', 'A', [], run);
  expect(run).toHaveBeenCalledTimes(2);
  expect(getState().preferences).toEqual({});
  withSource('list:b', 'B', [], run);
  expect(getState().preferenceAsk?.key).toBe('list:b');
});
test('Ask each time clears the previous target answer too', () => {
  const run = vi.fn();
  withSource('list:a', 'A', [], run); answerPreference('new', 'always');
  setPreference('voteSource');
  withSource('list:a', 'A', [], run);
  expect(getState().preferenceAsk).not.toBeNull();
});
test('unavailable remembered donor asks again instead of silently changing the model', () => {
  setPreference('voteSource', 't:absent');
  const run = vi.fn(); withSource('list:a', 'A', [], run);
  expect(run).not.toHaveBeenCalled(); expect(getState().preferenceAsk?.id).toBe('voteSource');
});

test('inline source choices update an existing global preference', () => {
  setPreference('voteSource', 'proportional');
  chooseSource('family', { kind: 'new' });
  expect(getState().preferences.voteSource).toBe('new');
  const run = vi.fn(); withSource('list:a', 'A', [], run);
  expect(run).toHaveBeenCalledWith({ kind: 'new' });
});

test.each(['voteSource', 'comparison'] as const)('just once never remembers %s for the next action', id => {
  const run = vi.fn();
  askPreference({ id, key: 'a', title: 'A', run });
  answerPreference(id === 'voteSource' ? 'new' : 'official', 'once');
  expect(run).toHaveBeenCalledTimes(1);
  expect(getState().preferences).toEqual({});
  askPreference({ id, key: 'a', title: 'A', run });
  expect(getState().preferenceAsk?.key).toBe('a');
  expect(run).toHaveBeenCalledTimes(1);
});

test('item scope survives visiting another item and returning', () => {
  const run = vi.fn();
  withSource('list:a', 'A', [], run); answerPreference('new', 'item');
  withSource('list:b', 'B', [], run); answerPreference('proportional', 'once');
  withSource('list:a', 'A', [], run);
  expect(getState().preferenceAsk).toBeNull();
  expect(run).toHaveBeenLastCalledWith({ kind: 'new' });
});
