// Find an MK over the seat chart: what a typed name matches.
import { expect, test } from 'vitest';
import { findMks, foldName, foundSeat, type MkEntry } from '../src/app/components/FindMk.tsx';

const entries: MkEntry[] = [
  { seat: 3, names: ['דני דנון', 'Danny Danon'], label: 'Danny Danon · Likud #15' },
  { seat: 7, names: ['אלי כהן', 'Eli Cohen'], label: 'Eli Cohen · Likud #3' },
  { seat: 9, names: ['מאיר כהן', 'Meir Cohen'], label: 'Meir Cohen · Yesh Atid #3' },
  { seat: 11, names: ['אוריה ג׳ונסון', "Oriya Jo'hnson"], label: 'x' },
];

test('a surname, in Hebrew or English, in any case, finds the member', () => {
  expect(findMks(entries, 'danon').map((e) => e.seat)).toEqual([3]);
  expect(findMks(entries, 'דנון').map((e) => e.seat)).toEqual([3]);
  expect(findMks(entries, '  DAN ').map((e) => e.seat)).toEqual([3]);
});
test('every word typed must start one of the name\'s words', () => {
  expect(findMks(entries, 'cohen').map((e) => e.seat)).toEqual([7, 9]);
  expect(findMks(entries, 'meir coh').map((e) => e.seat)).toEqual([9]);
  expect(findMks(entries, 'ohen')).toEqual([]);
  expect(findMks(entries, '')).toEqual([]);
});
test('quotes, geresh and niqqud do not get in the way', () => {
  expect(foldName('ג׳ונסון')).toBe('ג ונסון');
  expect(findMks(entries, 'ג׳ונ').map((e) => e.seat)).toEqual([11]);
  expect(findMks(entries, 'דָּנִי').map((e) => e.seat)).toEqual([3]);
});
test('one match is found at once; among several, only the one chosen', () => {
  expect(foundSeat(entries, 'danon', null)).toBe(3);
  expect(foundSeat(entries, 'cohen', null)).toBe(null);
  expect(foundSeat(entries, 'cohen', 9)).toBe(9);
  expect(foundSeat(entries, 'cohen', 3)).toBe(null);
});
