import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { englishLabel, hebrewInEnglish } from '../src/data/names.ts';
import { partyLabel } from '../src/families/registry.ts';
import { RELATION_KINDS, RELATION_WORD } from '../src/history/relations.ts';
import { romanize } from './letter-by-letter.ts';

// Review fault F4 (19 Nov): a name with no English form was spelled letter by letter ("htzybvr hhrdy br'shvt …") on
// English screens. Such a name now shows in Hebrew, isolated so it reads right to left; no code path spells it out.
describe('no machine transliteration', () => {
  test('a name with no English form shows in Hebrew, right to left, never spelled out', () => {
    const he = 'הציבור החרדי בראשות מוטי ליטנר';
    expect(englishLabel(null, he)).toBe(`⁧${he}⁩`);
    expect(englishLabel(undefined, he)).not.toContain(romanize(he));
    expect(englishLabel('Shas', 'ש״ס')).toBe('Shas');
    expect(hebrewInEnglish('Likud')).toBe('Likud');
  });
  test('the registry names a party with no English form in Hebrew', () => {
    expect(partyLabel('hatzibur-haharedi', 'en')).toBe('\u2067הציבור החרדי בראשות מוטי ליטנר\u2069');
  });
  test('no source file builds a Hebrew-to-Latin letter table', () => {
    const files: string[] = [];
    const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx)$/.test(f)) files.push(p); } };
    walk('src');
    for (const f of files) expect(/['"]ב['"]\s*:\s*['"]b['"]/.test(readFileSync(f, 'utf8')), f).toBe(false);
  });
  test('every relation kind has words in both languages, so no data code is shown', () => {
    for (const k of RELATION_KINDS) { expect(RELATION_WORD[k][0], k).toMatch(/^[A-Z][a-z ]+$/); expect(RELATION_WORD[k][1], k).toMatch(/[א-ת]/); }
  });
});
