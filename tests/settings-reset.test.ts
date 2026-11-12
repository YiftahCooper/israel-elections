// Reset all settings and its Undo (audit 12 Nov 2026, ax-screens-a-01/02): every question's default answer is reset and
// comes back on Undo, for every question in PREFERENCES; answers remembered for one item are kept.
import { beforeEach, expect, test } from 'vitest';
import { getState, setState } from '../src/app/store.ts';
import { PREFERENCES, type PreferenceId } from '../src/app/preferences.ts';
import { SETTINGS } from '../src/app/settings.ts';
import { CHOICE_ROW, resetRows, restore, snapshot } from '../src/app/settingsReset.ts';

const IDS = Object.keys(PREFERENCES) as PreferenceId[];
/** a value other than the default for every question (jointSeats' default is On) */
const changed = Object.fromEntries(IDS.map(id => [id, id === 'jointSeats' ? 'off' : PREFERENCES[id].options.at(-1)!.value])) as Record<PreferenceId, string>;
const ALL = SETTINGS.filter(r => r.id !== 'lang' && r.id !== 'level');

beforeEach(() => setState({ preferences: { ...changed }, preferenceFor: { 'voteSource:k25:list:a': 'new', 'copyMode::list:b': 'count' }, settings: { decimals: 3, chamberLayout: 'blocks' } }));

test('every question has its own Settings row, so a reset reaches it', () => {
  for (const id of IDS) expect(SETTINGS.some(r => r.id === CHOICE_ROW[id]), id).toBe(true);
});
for (const id of IDS) test(`Reset all clears the "${id}" default and Undo brings it back`, () => {
  const before = snapshot();
  resetRows(ALL);
  expect(getState().preferences[id]).toBeUndefined();
  restore(before);
  expect(getState().preferences[id]).toBe(changed[id]);
});
test('Undo restores everything the reset changed, settings included', () => {
  const before = snapshot();
  resetRows(ALL);
  expect(getState().settings).toEqual({});
  restore(before);
  expect(getState().preferences).toEqual(changed);
  expect(getState().settings).toEqual({ decimals: 3, chamberLayout: 'blocks' });
});
test('answers remembered for one list, bloc or scenario stay, as the (i) says', () => {
  const kept = getState().preferenceFor;
  resetRows(ALL);
  expect(getState().preferenceFor).toEqual(kept);
});
