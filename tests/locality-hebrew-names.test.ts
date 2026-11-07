import { expect, it } from 'vitest';
import { resolveLocalityHebrew, localityHebrewName } from '../src/data/locality-names.ts';
const records = [
  { code: 964, year: 2022, nameHe: 'קודייראת א-צאנע (שבט)', nameEn: '' },
  { code: 1346, year: 2022, nameHe: 'תרבין א-צאנע (יישוב)', nameEn: '' },
];
it('repairs export punctuation from CBS, retaining original CEC input', () => {
  for (const nameHe of ['קודייראת אצאנעשבט', 'קודייראת א-צאנע(שבט)']) {
    const row = { code: 964, nameHe };
    expect(resolveLocalityHebrew(row, 2022, records)).toMatchObject({ name: records[0].nameHe, source: 'cbs', year: 2022 });
    expect(row.nameHe).toBe(nameHe);
  }
  // The CEC export also differs in letters: this is a letter difference, so keep CEC for review.
  expect(resolveLocalityHebrew({ code: 1346, nameHe: 'תראבין אצאנעישוב' }, 2022, records)).toMatchObject({ name: 'תראבין אצאנעישוב', source: 'cec', conflict: records[1].nameHe });
});
it('uses nearest CBS year, earlier on ties; never substitutes a different name or guesses a missing code', () => {
  const history = [...records, { ...records[0], year: 2024, nameHe: 'שם אחר' }];
  expect(resolveLocalityHebrew({ code: 964, nameHe: 'קודייראת אצאנעשבט' }, 2023, history).year).toBe(2022);
  expect(resolveLocalityHebrew({ code: 964, nameHe: 'קודייראת אצאנעשבט' }, 2026, history)).toMatchObject({ source: 'cec', conflict: 'שם אחר' });
  for (const code of [null, 999]) expect(resolveLocalityHebrew({ code, nameHe: ' שם   מקורי(שבט) ' }, 2022, records)).toMatchObject({ name: 'שם מקורי (שבט)', source: 'cec', reason:'no-cbs' });
  expect(localityHebrewName({ names: [], project: [] }, { nameHe: 'שם(שבט)' }, 0)).toBe('שם (שבט)');
});

it('published Hebrew sidecars cover every row and preserve every unresolved CEC name', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const { tidyCecHebrew } = await import('../src/data/locality-names.ts');
  const { isEnvelopeRow } = await import('../src/data/schema.ts');
  for (const file of readdirSync('public/data').filter(f => /^k\d+-localities.json$/.test(f))) {
    const data = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as import('../src/data/schema.ts').LocalityDataset;
    const names = JSON.parse(readFileSync(`public/data/${file.replace('-localities', '-locality-names')}`, 'utf8')) as import('../src/data/locality-names.ts').LocalityNames;
    expect(names.hebrew).toHaveLength(data.rows.length);
    for (const [i, row] of data.rows.entries()) {
      const name = names.hebrew![i];
      if (isEnvelopeRow(row)) { expect(name.name).toBe(row.nameHe); continue; }
      if (name.source === 'cbs') {
        expect(name.year).toBeGreaterThanOrEqual(2003);
        expect(['formatting', 'truncation', 'spelling']).toContain(name.reason);
        expect(name.conflict).toBeUndefined();
      } else expect(name.name).toBe(tidyCecHebrew(row.nameHe));
      expect(localityHebrewName(names, row, i)).toBe(name.name);
    }
  }
});

const resolvePair = (cec: string, cbs: string, code = 964) => resolveLocalityHebrew({code, nameHe: cec}, 2022, [{code, year:2022, nameHe:cbs, nameEn:''}]);
it.each([
  ['אשדות יעקב  )מאוח', 'אשדות יעקב (מאוחד)'],
  ['קודייראת א-צאנע)ש', 'קודייראת א-צאנע (שבט)'],
  ['תראבין א-צאנע )שב', 'תראבין א-צאנע (שבט)'],
  ['סואעד )כמאנה( )שב', 'סואעד (כמאנה) (שבט)'],
])('recovers mirrored fixed-width export %s', (cec, cbs) => {
  expect(resolvePair(cec, cbs)).toMatchObject({name:cbs, source:'cbs', reason:'truncation', parenthesesRepaired:true});
});
it.each([
 ['קרית ענבים','קריית ענבים'], ['אילניה','אילנייה'], ['מעין צבי','מעיין צבי'],
 ['חרות','חירות'], ['בית חרות','בית חירות'], ['נוה צוף','נווה צוף'],
 ['מסעודין אל-עזאזמה','מסעודין אל-עזאזמה (שבט)'],
])('uses official CBS spelling for %s', (cec,cbs) => {
 expect(resolvePair(cec,cbs)).toMatchObject({name:cbs,source:'cbs',reason:'spelling'});
});
it.each([
 [195,'קדימה','צורן-קדימה'], [516,"מג'ד אל-כרום",'שגור'], [609,'ספסופה','כפר חושן'],
 [494,'דאלית אל-כרמל','דאלית אל-כרמל-עספיא'], [1200,'מודיעין','מודיעין-מכבים-רעות'],
 [3652,'בית אריה','בית אריה-עופרים'],
])('retains historical code %s names even when a merger extends the prefix', (code,cec,cbs) => {
 expect(resolvePair(cec,cbs,code)).toMatchObject({name:cec,source:'cec',reason:'rename-merger',conflict:cbs});
});
it('repairs mirrored brackets without substituting a shorter CBS name, marking visible truncation', () => {
 expect(resolvePair('סואעד )חמרייה()שב','סואעד (חמרייה)',942)).toMatchObject({name:'סואעד (חמרייה) (שב',source:'cec',reason:'other',truncated:true});
 expect(resolvePair('שושנת העמקים )רסק','שושנת העמקים',224)).toMatchObject({source:'cec',truncated:true});
 expect(resolvePair('דבירה','דביר',849)).toMatchObject({name:'דבירה',source:'cec',reason:'other'});
 expect(resolvePair('צוקי ים','צוקים')).toMatchObject({source:'cec',reason:'other'});
 expect(resolvePair('שם )מלא(','שם (מלא)')).toMatchObject({source:'cbs',parenthesesRepaired:true});
 expect(resolvePair('','שם מלא')).toMatchObject({source:'cec'});
});
