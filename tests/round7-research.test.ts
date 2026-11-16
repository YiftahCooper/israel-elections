import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {identityOf,partySeries} from '../src/history/identity.ts';
import {comparableFor} from '../src/history/compare.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
describe('Round 7 source-backed list identities',()=>{
 it('Gil 2009 keeps its 2006 history and seven official seats',()=>{
  const c=comparableFor('k18','18-זך');
  expect(c?.counted.map(l=>l.id)).toEqual(['17-זך']);
  expect(c?.certainty).toBe('probable');
 });
 it('Greens and Ale Yarok survive changes of ballot letter or leader',()=>{
  expect(identityOf('vehicle-18-רק').ids).toContain('vehicle-15-רק');
  expect(identityOf('vehicle-20-קנ').ids).toContain('vehicle-15-קנ');
  expect(identityOf('vehicle-20-קנ').ids).not.toContain('vehicle-18-יק');
 });
 it('Panthers starts in 1973 without swallowing the rival or either joint list',()=>{
  const p=identityOf('black-panthers');
  expect(p.ids).toContain('vehicle-8-ז');
  for(const id of ['vehicle-8-פ','vehicle-9-ו','vehicle-9-ש'])expect(p.ids).not.toContain(id);
  expect(partySeries(p).some(x=>x.list?.id==='8-ז')).toBe(true);
 });
 it('register review distinguishes legal submitting names and missing dates',()=>{
  const d=read('data/research/round7/register-checks.json').checks;
  expect(d).toHaveLength(6);
  expect(d.find((x:any)=>x.partyId==='uvizchutan').matches[0]['מספר מפלגה']).toBe('59-900082-5');
  expect(d.find((x:any)=>x.partyId==='hakel-2026').matches[0]['מספר מפלגה']).toBe('59-900153-4');
  expect(d.find((x:any)=>x.partyId==='hatzibur-haharedi').certainty).toBe('unknown');
 });
 it('uses final-notice Horowitz spelling in generated and source metadata',()=>{
  expect(read('public/data/k22.json').lists.find((l:any)=>l.id==='22-מרצ').nameHe).toContain('הורוביץ');
  expect(read('data/meta/k22-corrections.json').textReplacements['הורביץ, שפיר וברק']).toBe('הורוביץ, שפיר וברק');
 });
});
