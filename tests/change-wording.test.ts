import { expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { changeCount, changesLabel } from '../src/app/derive.ts';
import { formatDate } from '../src/app/dateFormat.ts';
const base = scenarioFromDataset(loadDataset('k25'));
it('counts actions, not balanced vote fields, colours or bloc choices', () => {
  let s = applyAction(base, { type: 'setVotes', listId: base.lists[0].id, votes: 1100000 });
  s = applyAction(s, { type: 'setListMeta', listId: base.lists[0].id, patch: { color: '#123456' } });
  s = applyAction(s, { type: 'setPartyBloc', partyId: base.lists.flatMap(l => l.parties ?? [])[0].id, bloc: base.blocs[0].id });
  expect(changeCount(s, null)).toBe(1);
  const saved = { ...s, name: 'Unity' };
  s = applyAction(saved, { type: 'setVotes', listId: base.lists[0].id, votes: 1100100 });
  expect(changeCount(s, saved)).toBe(1);
  expect(changeCount(saved, saved)).toBe(0);
  expect(changeCount(base, saved)).toBe(1);
  expect(changesLabel(2, saved, 'en')).toBe('2 changes from Unity');
  expect(changesLabel(2, saved, 'he')).toBe('2 שינויים מ־Unity');
});
it('uses the same concise vocabulary with singular, plural and zero', () => {
  expect(changesLabel(0, null, 'en')).toBe('No changes');
  expect(changesLabel(0, base, 'he')).toBe('אין שינויים');
  expect(changesLabel(1, null, 'en')).toBe('1 change from the official result');
  expect(changesLabel(3, null, 'en')).toBe('3 changes from the official result');
  expect(changesLabel(3, null, 'he')).toBe('3 שינויים מהתוצאה הרשמית');
});
it('formats date-only and timestamp values in the app language without timezone drift', () => {
  expect(formatDate('1968', 'he')).toBe('1968');
  for (const lang of ['en', 'he'] as const) {
    const expected = new Date('2026-11-07T12:00:00Z').toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB', { timeZone: 'UTC', dateStyle: 'medium' });
    expect(formatDate('2026-11-07', lang)).toBe(expected);
    expect(formatDate('2026-11-07T23:30:00Z', lang)).toBe(expected);
  }
});

it('short copy omits the reference without truncating either language', () => {
  expect(changesLabel(3, {name:'Unity'}, 'en', true)).toBe('3 changes');
  expect(changesLabel(3, {name:'Unity'}, 'he', true)).toBe('3 שינויים');
  expect(changesLabel(0, null, 'en', true)).toBe('No changes');
});
