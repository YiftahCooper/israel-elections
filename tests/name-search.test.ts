// Finding a list or party by name (22 Nov 2026): one matcher for every search box, ignoring case, apostrophes and
// hyphens, with a party's other spellings from the registry (data/meta/parties.json searchNames), never shown.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { baselineOf, listLabel } from '../src/app/derive.ts';
import { foldName, listSearchNames, matchesName, partySearchNames } from '../src/app/nameSearch.ts';
import { compileSearchNames } from '../scripts/party-search-names.ts';

const k26 = baselineOf(JSON.parse(readFileSync('public/data/k26.json', 'utf8')) as ElectionDataset);
const beyachad = k26.lists.find((l) => l.id === '26-רק')!;
const SPELLINGS = ['Together', "B'Yachad", 'B’Yachad', 'BeYachad', "Be'Yahad", 'Beyahad', 'Beyachad', 'ביחד'];

describe('the matcher', () => {
  it('ignores case, apostrophes, geresh and gershayim, hyphens and dashes', () => {
    expect(foldName("B'Yachad")).toBe('byachad');
    expect(foldName('B’YACHAD')).toBe('byachad');
    expect(foldName('be-yahad')).toBe('beyahad');
    expect(foldName('מפא״י')).toBe(foldName('מפא"י'));
    expect(foldName('מפא״י')).toBe('מפאי');
    expect(matchesName('be-yachad', ['Beyachad'])).toBe(true);
    expect(matchesName('likud', ['Beyachad'])).toBe(false);
  });
  it('an empty query matches everything', () => expect(matchesName('  ', ['x'])).toBe(true));
});

describe('Bennett’s 2026 list is found by every spelling, and still shown as Beyachad', () => {
  it('the registry holds the spellings on the party, for finding only', () => {
    expect(beyachad.parties?.map((p) => p.id)).toContain('together-bennett');
    expect(partySearchNames('together-bennett')).toEqual(SPELLINGS);
    expect(compileSearchNames()).toEqual({ 'together-bennett': SPELLINGS });
  });
  for (const typed of [...SPELLINGS, 'together', 'BYACHAD', 'be yachad'.replace(' ', '-'), 'beyahad', 'ביחד']) {
    it(`"${typed}" finds it`, () => expect(matchesName(typed, listSearchNames(beyachad))).toBe(true));
  }
  it('the name shown stays Beyachad in English and ביחד in Hebrew', () => {
    expect(listLabel(beyachad, 'en')).toBe('Beyachad');
    expect(listLabel(beyachad, 'he')).toBe('ביחד');
  });
  it('other lists are not found by these spellings unless their own name holds them', () => {
    const found = k26.lists.filter((l) => matchesName('Together', listSearchNames(l))).map((l) => l.id);
    expect(found).toEqual(['26-רק']);
    const likud = k26.lists.find((l) => l.shortEn === 'Likud')!;
    expect(matchesName("B'Yachad", listSearchNames(likud))).toBe(false);
  });
  it('only this party has other spellings so far', () => expect(Object.keys(compileSearchNames())).toEqual(['together-bennett']));
});
