import { describe, expect, it } from 'vitest';
import { isMixed, langRuns, nameProps, otherLang } from '../src/app/components/LangLabel.tsx';

describe('spoken labels that mix Hebrew and English', () => {
  it('marks a Hebrew name on an English page, keeping separators with the page', () => {
    expect(langRuns('Likud · seat 5 · גואילי טלי', 'en')).toEqual([{ text: 'Likud · seat 5 · ' }, { text: 'גואילי טלי', lang: 'he' }]);
  });
  it('keeps punctuation between two Hebrew words inside the Hebrew run', () => {
    expect(langRuns('About דוד בן־גוריון (מפא״י)', 'en')).toEqual([{ text: 'About ' }, { text: 'דוד בן־גוריון (מפא״י)', lang: 'he' }]);
  });
  it('marks an English run on a Hebrew page', () => {
    expect(langRuns('על Yesh Atid', 'he')).toEqual([{ text: 'על ' }, { text: 'Yesh Atid', lang: 'en' }]);
  });
  it('gives a plain aria-label when the label is all in the page language', () => {
    expect(isMixed('Likud · seat 5 · Tali Gottlieb', 'en')).toBe(false);
    expect(nameProps('Likud · seat 5', 'en', 'x')).toEqual({ 'aria-label': 'Likud · seat 5' });
    expect(nameProps('Likud · seat 5 · גואילי טלי', 'en', 'x')).toEqual({ 'aria-labelledby': 'x' });
  });
  it('marks a text wholly in the other language, and nothing else', () => {
    expect(otherLang('The Jerusalem Post', 'he')).toBe('en');
    expect(otherLang("JNS (reporting President's Residence statements)", 'he')).toBe('en');
    expect(otherLang('בית הנשיא', 'he')).toBeUndefined();
    expect(otherLang('על Yesh Atid', 'he')).toBeUndefined();
    expect(otherLang('הכנסת', 'en')).toBe('he');
    expect(otherLang('2026', 'he')).toBeUndefined();
  });
});
