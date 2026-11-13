import { expect, it } from 'vitest';
import { itmToWgs84, decodeCBSGrid } from '../src/data/locality-coordinates.ts';
import { matchesLocality, localityWinner, nearestLocality } from '../src/app/locality-map-model.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
it('decodes CBS 10 and 12 digit metre grid references', () => {
  expect(decodeCBSGrid(2105263481)).toEqual([210520, 634810]);
  expect(decodeCBSGrid(210524634814)).toEqual([210524, 634814]);
  expect(decodeCBSGrid(21046348)).toEqual([210400,634800]);
  expect(decodeCBSGrid(null)).toBeNull();
});
it('converts ITM projection origin and rejects invalid grid references', () => {
  const p = itmToWgs84(219529.584, 626907.39);
  // Independent PROJ 9 / pyproj 3.7.2 results, using EPSG:9676 parameters.
  expect(p.lat).toBeCloseTo(31.734763036508706, 7);
  expect(p.lon).toBeCloseTo(35.20521378192299, 7);
  const abuGhosh = itmToWgs84(210524,634814);
  expect(abuGhosh.lat).toBeCloseTo(31.806033273343523, 7);
  expect(abuGhosh.lon).toBeCloseTo(35.1101111556434, 7);
  const telAviv = itmToWgs84(180000,665000);
  expect(telAviv.lat).toBeCloseTo(32.07760192158446, 7);
  expect(telAviv.lon).toBeCloseTo(34.786537704025285, 7);
  expect(() => itmToWgs84(0, 0)).toThrow();
});
it('matches partial Hebrew with niqqud/punctuation and English aliases', () => {
  const names = { nameHe: 'תל־אביב–יפו', nameEn: 'Tel Aviv-Yafo', aliases: ['TEL AVIV YAFO'] };
  expect(matchesLocality('תֵּל אביב', names)).toBe(true);
  expect(matchesLocality('aviv ya', names)).toBe(true);
  expect(matchesLocality('haifa', names)).toBe(false);
});
it('recolours historical votes using changed list, party and candidate blocs', () => {
  let s = scenarioFromDataset(loadDataset('k25'));
  const l = s.lists.find(x => x.parties?.length)!;
  const row = { votes: [100] };
  s.blocs = [{id:'a',nameEn:'A',nameHe:'א',color:'#ff0000'}, {id:'b',nameEn:'B',nameHe:'ב',color:'#0000ff'}];
  s = { ...s, lists: s.lists.map(x => x.id === l.id ? { ...x, bloc:'a' } : x) };
  expect(localityWinner(s, [l.id], row.votes, 'bloc').color).toBe('#ff0000');
  s = { ...s, lists: s.lists.map(x => x.id === l.id ? { ...x, bloc:'b' } : x) };
  expect(localityWinner(s, [l.id], row.votes, 'bloc').color).toBe('#0000ff');
  s.partyBlocs = Object.fromEntries(l.parties!.map(p => [p.id,'a']));
  s = { ...s, candidateBlocs: Object.fromEntries(l.candidates.map(c => [c.id,'a'])) };
  expect(localityWinner(s, [l.id], row.votes, 'bloc').color).toBe('#ff0000');
  expect(localityWinner(s, [l.id], [0], 'bloc').key).toBeNull();
});
it('finds nearest locality by great-circle distance', () => {
  const a = { lat:32,lon:35 }, b = { lat:30,lon:35 };
  expect(nearestLocality([a,b], {lat:32.01,lon:35})?.item).toBe(a);
});

it('honours party-only overrides and candidate overrides before party assignments', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  const list = base.lists.find(l=>l.parties?.some(p=>p.id==='new-hope'))!;
  const s = { ...base, partyBlocs: Object.fromEntries(list.parties!.map(p=>[p.id,'coalition'])) };
  expect(localityWinner(s,[list.id],[100],'bloc').key).toBe('coalition');
  const changed = { ...s, candidateBlocs:Object.fromEntries(list.candidates.map(c=>[c.id,'opposition'])) };
  expect(localityWinner(changed,[list.id],[100],'bloc').key).toBe('opposition');
  expect(localityWinner(changed,[list.id],[100],'list').key).toBe(list.id);
});

it('uses neutral grey for exact ties and keeps missing origins unassigned', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  expect(localityWinner(base,['missing'],[25],'bloc')).toMatchObject({key:null,votes:25,color:'#000000'});
  const [a,b] = base.lists;
  const result = localityWinner(base,[a.id,b.id],[10,10],'list');
  expect(result).toMatchObject({key:null,tied:true,color:'#000000'});
});

it('published coordinates place only rows with retained, plausible source positions', async () => {
  const {readFileSync,readdirSync} = await import('node:fs');
  const {isEnvelopeRow} = await import('../src/data/schema.ts');
  type Dataset = import('../src/data/schema.ts').LocalityDataset;
  type Locations = import('../src/data/locality-coordinates.ts').LocalityLocations;
  for (const file of readdirSync('public/data').filter(f=>/^k\d+-locations.json$/.test(f))) {
    const locations: Locations = JSON.parse(readFileSync(`public/data/${file}`,'utf8'));
    const data: Dataset = JSON.parse(readFileSync(`public/data/${file.replace('-locations','-localities')}`,'utf8'));
    for (const [code,p] of Object.entries(locations)) {
      expect(data.rows.some((r,i)=>!isEnvelopeRow(r)&&(r.code === null ? `row:${i}` : String(r.code))===code)).toBe(true);
      expect(p.lat).toBeGreaterThan(29); expect(p.lat).toBeLessThan(34);
      expect(p.lon).toBeGreaterThan(33); expect(p.lon).toBeLessThan(37);
      expect(p.year).toBeGreaterThanOrEqual(2003);
    }
  }
}, 30_000);

it('keys Hebrew names spelling-insensitively without merging separate words', async () => {
  const { hebrewNameKey, tidyCbsEnglish } = await import('../src/data/locality-names.ts');
  expect(hebrewNameKey('הרצליה')).toBe(hebrewNameKey('הרצלייה'));
  expect(hebrewNameKey('בנימינה-גבעת עדה*')).toBe(hebrewNameKey('בנימינה גבעת עדה'));
  expect(hebrewNameKey('צוקי ים')).not.toBe(hebrewNameKey('צוקים'));
  expect(tidyCbsEnglish('KINNERET(QEVUZA)')).toBe('Kinneret (Qevuza)');
  expect(tidyCbsEnglish('BAQA -JATT  ')).toBe('Baqa-Jatt');
  expect(tidyCbsEnglish("GIV'AT ADA")).toBe("Giv'at Ada");
  expect(tidyCbsEnglish("Qiryat Ye'arim")).toBe("Qiryat Ye'arim");
});

it('resolves English locality names from CBS by code, then by unique Hebrew name or truncated prefix', async () => {
  const { resolveLocalityEnglish } = await import('../src/data/locality-names.ts');
  const records = [
    { code: 6000, year: 2006, nameHe: "באקה-ג'ת*", nameEn: 'BAQA -JATT' },
    { code: 6000, year: 2024, nameHe: 'באקה אל-גרביה', nameEn: 'Baqa Al-Gharbiyye' },
    { code: 1200, year: 2009, nameHe: 'מודיעין-מכבים-רעות*', nameEn: "MODI'IN-MAKKABBIM-RE'UT" },
    { code: 1200, year: 2024, nameHe: 'מודיעין-מכבים-רעות', nameEn: "Modi'in-Makkabbim-Re'ut" },
    { code: 1328, year: 2006, nameHe: 'סנסנה', nameEn: 'SANSANA' },
    { code: 3777, year: 2024, nameHe: 'סנסנה', nameEn: 'Sansana' },
    { code: 1, year: 2024, nameHe: 'כפר', nameEn: 'Kefar A' },
    { code: 2, year: 2024, nameHe: 'כפר', nameEn: 'Kefar B' },
  ];
  // a code keeps the name of its era, not the locality's later name
  expect(resolveLocalityEnglish({ code: 6000, nameHe: "באקה-ג'ת" }, 2009, records)).toBe('Baqa-Jatt');
  expect(resolveLocalityEnglish({ code: 6000, nameHe: 'באקה אל-גרביה' }, 2022, records)).toBe('Baqa Al-Gharbiyye');
  // mixed-case CBS spelling preferred over the older all-capitals file
  expect(resolveLocalityEnglish({ code: null, nameHe: 'מודיעין-מכבים-רעו' }, 2006, records)).toBe("Modi'in-Makkabbim-Re'ut");
  expect(resolveLocalityEnglish({ code: null, nameHe: 'סנסנה' }, 2006, records)).toBe('Sansana');
  // two codes, two English names: no guess
  expect(resolveLocalityEnglish({ code: null, nameHe: 'כפר' }, 2006, records)).toBeNull();
});

it('every published locality row has a Latin English name; project transliterations are few and listed', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const { isEnvelopeRow } = await import('../src/data/schema.ts');
  const files = readdirSync('public/data').filter(f => /^k\d+-localities.json$/.test(f));
  expect(files.length).toBeGreaterThan(10);
  for (const file of files) {
    const data = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as import('../src/data/schema.ts').LocalityDataset;
    const names = JSON.parse(readFileSync(`public/data/${file.replace('-localities', '-locality-names')}`, 'utf8')) as import('../src/data/locality-names.ts').LocalityNames;
    expect(names.names).toHaveLength(data.rows.length);
    data.rows.forEach((row, i) => {
      const name = names.names[i];
      if (isEnvelopeRow(row)) { expect(name).toBe(''); return; }
      expect(name, `${file} ${row.nameHe}`).toMatch(/^[A-Za-z]/);
      expect(name).not.toMatch(/[֐-׿؀-ۿ]/);
      expect(name).not.toBe(name.toUpperCase());
    });
    expect(names.project.length).toBeLessThanOrEqual(7);
  }
});

it('explains a locality result: ranked group totals and the lead over the runner-up', async () => {
  const { localityTotals } = await import('../src/app/locality-map-model.ts');
  const s = scenarioFromDataset(loadDataset('k25'));
  const [a, b] = s.lists;
  const totals = localityTotals(s, [a.id, b.id], [70, 30], 'list');
  expect(totals.map(t => t.key)).toEqual([a.id, b.id]);
  expect(localityWinner(s, [a.id, b.id], [70, 30], 'list')).toMatchObject({ key: a.id, runnerUp: b.id, margin: 40 });
});

it('places uncoded names only when exactly one CBS code matches, even if English names agree', async () => {
  const { resolveLocalityCode } = await import('../src/data/locality-names.ts');
  const records = [
    { code: 1, year: 2006, nameHe: 'סנסנה', nameEn: 'Sansana' },
    { code: 2, year: 2024, nameHe: 'סנסנה', nameEn: 'Sansana' },
    { code: 3, year: 2006, nameHe: 'מודיעין-מכבים-רעות*', nameEn: 'Modiin' },
    { code: 3, year: 2024, nameHe: 'מודיעין מכבים רעות', nameEn: 'Modiin' },
  ];
  expect(resolveLocalityCode('סנסנה', records)).toBeNull();
  expect(resolveLocalityCode('מודיעין-מכבים-רעו', records)).toBe(3);
  expect(resolveLocalityCode('מוֹדִיעִין מכבים רעות', records)).toBe(3);
  expect(resolveLocalityCode('מודיעין', records)).toBeNull(); // too short for a prefix
  expect(resolveLocalityCode('לא קיים', records)).toBeNull();
  expect(resolveLocalityCode('מודיעין-מכבים-רעו', [...records, {code:4,year:2024,nameHe:'מודיעין מכבים רעות אחר',nameEn:'Other'}])).toBeNull();
});

it('publishes 2006 name placements while preserving official null codes and unmapped ambiguity', async () => {
  const {readFileSync} = await import('node:fs');
  const data = JSON.parse(readFileSync('public/data/k17-localities.json','utf8')) as import('../src/data/schema.ts').LocalityDataset;
  const locations = JSON.parse(readFileSync('public/data/k17-locations.json','utf8'));
  expect(Object.keys(locations)).toHaveLength(1144);
  const coverage = JSON.parse(readFileSync('public/data/locality-map-coverage.json','utf8'));
  expect(coverage.k17).toEqual({placed:1144,localities:1149,envelopes:1});
  expect(data.rows.every(r => r.code === null)).toBe(true);
  for (const nameHe of ['דלתון', 'נווה אילן', 'סנסנה', 'חברון', 'שושנת העמקים (רסק', 'מעטפות כפולות']) {
    const index = data.rows.findIndex(r => r.nameHe === nameHe);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(locations[`row:${index}`]).toBeUndefined();
  }
});

it('finds a locality by its usual English spelling, not only the CBS romanisation (audit 12 Nov)', async () => {
  const { readFileSync } = await import('node:fs');
  const { findLocalities } = await import('../src/app/locality-map-model.ts');
  const places = Object.values(JSON.parse(readFileSync('public/data/k26-locations.json', 'utf8')) as Record<string, { code: number; nameHe: string; nameEn?: string; aliases?: string[] }>);
  const find = (q: string) => findLocalities(q, places, p => p).map(p => p.code);
  // the six from the audit, then ten more
  for (const [q, code] of [['Beersheba', 9000], ['Petah Tikva', 7900], ['Bnei Brak', 6100], ['Herzliya', 6400], ['Eilat', 2600], ['Katzrin', 4100],
    ['Rishon LeZion', 8300], ['Kiryat Shmona', 2800], ['Nahariya', 9100], ['Kfar Saba', 6900], ['Raanana', 8700], ['Maale Adumim', 3616],
    ['Ashkelon', 7100], ['Karmiel', 1139], ['Beit Shemesh', 2610], ['Zichron Yaakov', 9300]] as const) expect(find(q), q).toContain(code);
  // a spelling that already matches directly keeps only its direct matches (no looser extras)
  expect(find('Haifa')).toEqual([4000]);
  expect(find('Akko')).toEqual([7600]);
});
