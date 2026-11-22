import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Owner decision fac-english (19 Nov 2026), review fault A6: Bennett's ביחד is "Beyachad" in English everywhere, and
// the 1969 רשימה ממלכתית has one English name, "State List" (IDI, Arian 1972, Mahler 1981 and JTA at the time; R1's
// name research), so it never looks renamed between 1969 and 1973. Retained source wording (data/raw, quotes, logo
// credits copied from their source, collector observations) keeps what the source printed. A party's `searchNames` in
// the registry (22 Nov 2026) are other spellings people type to find it, never shown, so they are not names on screen.
const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx|json)$/.test(f)) files.push(p); } };
['src', 'data/meta', 'data/research/knesset-events', 'public/data', 'scripts/lib'].forEach(walk);
const SOURCE_WORDING = /"(support|quote|description|observed|title)": "[^"]*$/;

describe('one English name for each of these lists, on every screen', () => {
  test('no "Together (Bennett)", "Beyahad" or "National List" outside retained source wording', () => {
    const hits: string[] = [];
    // the logo catalogue copies each file's upstream title, URL, artist and description verbatim
    for (const f of files.filter((x) => !x.endsWith('logos/sources.json'))) { let inSearchNames = false; readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (/"searchNames": \[$/.test(line)) { inSearchNames = true; return; }
      if (inSearchNames) { if (/^\s*\],?$/.test(line)) inSearchNames = false; return; }
      for (const m of line.matchAll(/Together \(Bennett\)|Beyahad|National List/g)) {
        const before = line.slice(0, m.index);
        if (!SOURCE_WORDING.test(before)) hits.push(`${f}:${i + 1} ${m[0]}`);
      }
    }); }
    expect(hits).toEqual([]);
  });
  test('the 1969 list and the 2026 list carry the chosen names', () => {
    const k7 = JSON.parse(readFileSync('public/data/k7.json', 'utf8')), k26 = JSON.parse(readFileSync('public/data/k26.json', 'utf8'));
    expect(k7.lists.find((l: { letters: string }) => l.letters === 'עמ').shortEn).toBe('State List');
    expect(k26.lists.find((l: { letters: string }) => l.letters === 'רק').shortEn).toBe('Beyachad');
    expect(JSON.parse(readFileSync('data/meta/knesset-faction-names-en.json', 'utf8')).names['ביחד']).toBe('Beyachad');
  });
});
