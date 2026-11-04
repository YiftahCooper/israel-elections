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
  expect(localityWinner(base,['missing'],[25],'bloc')).toMatchObject({key:null,votes:25,color:'#78838c'});
  const [a,b] = base.lists;
  const result = localityWinner(base,[a.id,b.id],[10,10],'list');
  expect(result).toMatchObject({key:null,tied:true,color:'#78838c'});
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
      expect(data.rows.some(r=>!isEnvelopeRow(r)&&String(r.code)===code)).toBe(true);
      expect(p.lat).toBeGreaterThan(29); expect(p.lat).toBeLessThan(34);
      expect(p.lon).toBeGreaterThan(33); expect(p.lon).toBeLessThan(37);
      expect(p.year).toBeGreaterThanOrEqual(2003);
    }
  }
});
