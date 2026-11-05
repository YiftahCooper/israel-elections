import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {ELECTION_IDS, type ElectionDataset} from '../src/data/schema.ts';
import {applyMeta} from '../scripts/lib/build/meta.ts';
import {listLabel,baselineOf} from '../src/app/derive.ts';
import {applyAction} from '../src/model/actions.ts';
const datasets = ELECTION_IDS.map(id => JSON.parse(readFileSync(`public/data/${id}.json`,'utf8')) as ElectionDataset);
describe('complete English list identity',()=>{
 it.each(datasets.map(d=>[d.id,d] as const))('%s: all lists and component parties have Latin labels',(_id,d)=>{
  const rebuilt=applyMeta(d);
  for(const l of rebuilt.lists){
   expect(l.shortEn,l.id).toBeTruthy();
   expect(listLabel(l,'en'),l.id).not.toMatch(/[\u0590-\u05ff]/);
   if(l.englishName){expect(l.englishName.kind).toBe('transliteration');expect(l.englishName.sourceId).toBeTruthy();expect(l.englishName.note).toContain('Unofficial');}
   for(const p of l.parties??[])expect(p.nameEn,p.id).not.toMatch(/[\u0590-\u05ff]/);
  }
 });
 it('does not leak Hebrew from legacy saves without English labels',()=>{
  expect(listLabel({shortHe:'מרצ',shortEn:null},'en')).toBe('mrtz');
  expect(listLabel({shortHe:'מרצ',shortEn:null},'he')).toBe('מרצ');
 });
 it('keeps Meretz identity and its dated logo after splitting the Democrats',()=>{
  const s=baselineOf(datasets[25]);const l=s.lists.find(l=>l.parties?.some(p=>p.id==='meretz'))!;
  const p=l.parties!.find(p=>p.id==='meretz')!;
  expect(p.logo?.year).toBe(2013);
  const split=applyAction(s,{type:'split',id:l.id,parts:l.parties!.map((p,i)=>({newId:`part-${i}`,nameHe:p.nameHe,letters:l.letters,color:p.color??l.color,votes:i===0?l.votes:0,candidateIds:l.candidates.filter(c=>c.partyId===p.id).map(c=>c.id)}))});
  const meretz=split.lists.find(x=>x.nameHe===p.nameHe)!;
  expect(meretz.shortEn).toBe(p.nameEn);expect(meretz.logo).toEqual(p.logo);
 });
});
