import { expect, it } from 'vitest';
import { hebrewPrefix } from '../src/app/hebrewPrefix.ts';
import { referenceLabel } from '../src/app/derive.ts';
import { describe } from '../src/app/actionDescription.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';

it.each(['מ','ל','ב','ו','ש','ה','כ'] as const)('attaches %s with a Hebrew maqaf only before non-Hebrew starts', prefix => {
  expect(hebrewPrefix(prefix, 'Unity')).toBe(`${prefix}־Unity`);
  expect(hebrewPrefix(prefix, '2026 Unity')).toBe(`${prefix}־2026 Unity`);
  expect(hebrewPrefix(prefix, 'Équipe')).toBe(`${prefix}־Équipe`);
  expect(hebrewPrefix(prefix, 'אחדות')).toBe(`${prefix}אחדות`);
  expect(hebrewPrefix(prefix, '\u200fאחדות')).toBe(`${prefix}\u200fאחדות`);
  expect(hebrewPrefix(prefix, '\u2066Unity\u2069')).toBe(`${prefix}־\u2066Unity\u2069`);
});
it('uses maqaf prefixes throughout shared reference copy', () => {
  expect(referenceLabel({name:'Unity'}, 'he')).toMatchObject({since:'מ־Unity', more:' יותר מאשר ב־Unity', fewer:' פחות מאשר ב־Unity'});
  expect(referenceLabel({name:'אחדות'}, 'he')).toMatchObject({since:'מאחדות', more:' יותר מאשר באחדות', fewer:' פחות מאשר באחדות'});
});
it('uses the same prefix rules for History transfer and redistribution descriptions', () => {
  const s = scenarioFromDataset(loadDataset('k25'));
  s.lists[0] = {...s.lists[0],shortHe:'Unity'};
  s.lists[1] = {...s.lists[1],shortHe:'אחדות'};
  expect(describe({type:'transfer',from:s.lists[0].id,to:s.lists[1].id,votes:3}, s, 'he')).toBe('העברת 3 קולות מ־Unity לאחדות');
  expect(describe({type:'redistribute',from:[s.lists[1].id],to:[{listId:s.lists[0].id,share:100}],votes:3}, s, 'he')).toContain('מאחדות ל־Unity');
});
