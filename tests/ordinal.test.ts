// English ordinals for Knesset numbers. The Side by side card once showed "$2nd Knesset" for the 12th Knesset:
// a chain of regex replacements with a wrong group number. One helper now serves every screen.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { ordinalEn } from '../src/app/electionLabel.ts';

describe('English ordinals', () => {
  it('names every Knesset number correctly', () => {
    const want: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 10: '10th', 11: '11th', 12: '12th', 13: '13th', 14: '14th', 20: '20th', 21: '21st', 22: '22nd', 23: '23rd', 24: '24th', 25: '25th', 26: '26th', 101: '101st', 111: '111th', 112: '112th', 113: '113th' };
    for (const [n, text] of Object.entries(want)) expect(ordinalEn(Number(n))).toBe(text);
  });
  it('is the only place the app builds one', () => {
    const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const p = `${dir}/${f}`; return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []; });
    const byHand = files('src').filter((p) => !p.endsWith('src/app/electionLabel.ts')).filter((p) => /\}th Knesset|'st', 'nd', 'rd'/.test(readFileSync(p, 'utf8')));
    expect(byHand).toEqual([]);
  });
});
