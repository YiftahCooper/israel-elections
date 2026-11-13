import { expect, test } from 'vitest';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { editPathLabel, referenceChanges } from '../src/app/derive.ts';
import { candidateChangeText, markerChangeText, changeText } from '../src/app/changeValue.tsx';
import { romanize } from '../src/data/names.ts';
import { dataset } from './graphics-cases.ts';

// Audit c-screens-overview-08: the "Edited" note of a candidate edit says what changed, in a few names, in the
// candidate's own name (English when official, else Hebrew), never the whole former list and never letter by letter.
const base = scenarioFromDataset(dataset(26));
const shas = base.lists.find(l => l.shortEn === 'Shas')!;
const edit = (candidates: typeof shas.candidates) => applyAction(base, { type: 'candidates', listId: shas.id, candidates, note: 'test' }, undefined, { base });
const c = shas.candidates;
const roman = (t: string) => c.some(x => !x.nameEn && t.includes(romanize(x.nameHe)) && /[a-z]/.test(romanize(x.nameHe)));

test('moving the first candidate down one place names the two who swapped, with their places', () => {
  const s = edit([c[1], c[0], ...c.slice(2)]);
  const paths = referenceChanges(s, base).filter(p => p[0] === 'lists' && p[1] === shas.id);
  expect(paths).toEqual([['lists', shas.id, 'candidates']]);
  for (const lang of ['en', 'he'] as const) {
    const text = markerChangeText(base, s, paths[0], lang);
    expect(text.length).toBeLessThan(160);
    expect(text).toContain(lang === 'en' ? 'Edited: moved' : 'נערך: הזזה');
    expect(text).toContain('1 → 2'); expect(text).toContain('2 → 1');
    expect(roman(text)).toBe(false);
  }
});

test('a long move names only the one who moved; adds, removals and renames name only those', () => {
  const moved = candidateChangeText(c, [...c.slice(1, 10), c[0], ...c.slice(10)], 'en');
  expect(moved).toMatch(/^moved: [^,;]+ ⁦1 → 10⁩$/);
  const added = { id: 'new-1', nameHe: 'ישראל ישראלי' };
  expect(candidateChangeText(c, [added, ...c], 'en')).toBe(`added: ישראל ישראלי ⁦(1)⁩`);
  expect(candidateChangeText(c, c.slice(1), 'he')).toMatch(/^הסרה: .+ ⁦\(1\)⁩$/);
  const renamed = candidateChangeText(c, [{ ...c[5], nameHe: 'שם חדש', nameEn: undefined }, ...c.slice(0, 5), ...c.slice(6)], 'en');
  expect(renamed).toContain('renamed:'); expect(renamed).toContain('→ שם חדש'); expect(renamed).toContain('moved:');
  // many at once: the first three, then a count
  expect(candidateChangeText(c, c.slice(5), 'en')).toMatch(/^removed: [^;]+ and 2 more$/);
});

test('no edit note names a person letter by letter', () => {
  // a renamed candidate whose official notice has no English name: the former name is the Hebrew one
  const x = c.find(y => !y.nameEn)!;
  const s = applyAction(base, { type: 'candidates', listId: shas.id, candidates: c.map(y => y.id === x.id ? { ...y, nameHe: 'שם אחר' } : y), note: 'rename' }, undefined, { base });
  const paths = referenceChanges(s, base);
  expect(paths.length).toBeGreaterThan(0);
  for (const p of paths) {
    const text = editPathLabel(s, p, 'en', base) + markerChangeText(base, s, p, 'en');
    expect(roman(text) || text.includes(romanize('שם אחר')), p.join('/')).toBe(false);
    expect(text).toContain('שם אחר');
  }
  expect(changeText(base, ['lists', shas.id, 'candidates'], 'en')).not.toContain(romanize(x.nameHe));
});
