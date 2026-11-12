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
 it('keeps Meretz identity without borrowing its 2013 logo after splitting the Democrats',()=>{
  const s=baselineOf(datasets[25]);const l=s.lists.find(l=>l.parties?.some(p=>p.id==='meretz'))!;
  const p=l.parties!.find(p=>p.id==='meretz')!;
  expect(p.logo).toBeUndefined();
  const split=applyAction(s,{type:'split',id:l.id,parts:l.parties!.map((p,i)=>({newId:`part-${i}`,nameHe:p.nameHe,letters:l.letters,color:p.color??l.color,votes:i===0?l.votes:0,candidateIds:l.candidates.filter(c=>c.partyId===p.id).map(c=>c.id)}))});
  const meretz=split.lists.find(x=>x.nameHe===p.nameHe)!;
  expect(meretz.shortEn).toBe(p.nameEn);expect(meretz.logo).toEqual(p.logo);
 });
});
// audit 12 Nov 2026, c-famous-late-12: one list was spelled two ways across elections (Ra’am–Ta’al beside Ra'am–Ta'al);
// English list and party names take one apostrophe, the straight one, as people's names do (scripts/lib/build/finalize.ts)
describe('one apostrophe in English names',()=>{
 it('no list, party or candidate English name uses a typographic apostrophe or a backtick',()=>{
  const odd=datasets.flatMap(d=>d.lists.flatMap(l=>[l.shortEn,l.englishName?.label,...(l.parties??[]).map(p=>p.nameEn),...l.candidates.map(c=>c.nameEn)].filter((n):n is string=>!!n&&/[’‘`]/.test(n)).map(n=>`${d.id} ${l.id}: ${n}`)));
  expect(odd).toEqual([]);
  const registry=JSON.parse(readFileSync('data/meta/parties.json','utf8')) as {parties:{id:string;nameEn?:string;names?:{nameEn?:string}[]}[]};
  expect(registry.parties.flatMap(p=>[p.nameEn,...(p.names??[]).map(n=>n.nameEn)].filter((n):n is string=>!!n&&/[’‘`]/.test(n)).map(n=>`${p.id}: ${n}`))).toEqual([]);
 });
});
// audit 12 Nov 2026 (fx-names2): one party was spelled two ways, Hatnuah (2013 list) and Hatnua (2015, inside the Zionist
// Union). Within one party id, two English names that are spellings of one name (they agree once case, punctuation, the
// letter h, a leading "The" and doubled letters are set aside) must be the same text: in its own lists, as a partner on a
// joint list, and in the party registry.
describe('one English spelling of a party name',()=>{
 it('no party id carries two spellings of one name',()=>{
  // listed by the first names lane as genuinely different spellings, left for the owner (fx-names/REPORT.md); nothing else
  const ownerQuestion=new Set(['jewish-home: Jewish Home | The Jewish Home',"daam: Da'am | Daam"]);
  const names=new Map<string,Map<string,Set<string>>>();
  const add=(id:string,en:string|null|undefined,where:string)=>{
   if(!en)return;
   const skeleton=en.toLowerCase().replace(/^the\s+/,'').replace(/[^a-z]/g,'').replace(/h/g,'').replace(/(.)\1+/g,'$1');
   const byId=names.get(id)??names.set(id,new Map()).get(id)!;
   (byId.get(skeleton)??byId.set(skeleton,new Set()).get(skeleton)!).add(`${en}\t${where}`);
  };
  for(const d of datasets)for(const l of d.lists){
   if(l.parties?.length===1)add(l.parties[0].id,l.shortEn,`${d.id} ${l.id}`);
   for(const p of l.parties??[])add(p.id,p.nameEn,`${d.id} ${l.id}`);
  }
  const registry=JSON.parse(readFileSync('data/meta/parties.json','utf8')) as {parties:{id:string;nameEn?:string;names?:{date:string;nameEn?:string}[]}[]};
  for(const p of registry.parties){add(p.id,p.nameEn,'registry');for(const n of p.names??[])add(p.id,n.nameEn,`registry ${n.date}`);}
  const two:string[]=[];
  for(const [id,bySkeleton] of names)for(const forms of bySkeleton.values()){
   const spellings=[...new Set([...forms].map((f)=>f.split('\t')[0]))].sort();
   if(spellings.length>1&&!ownerQuestion.has(`${id}: ${spellings.join(' | ')}`))two.push(`${id}: ${[...forms].join('; ')}`);
  }
  expect(two).toEqual([]);
  expect(names.get('hatnua')!.size).toBe(1);
 });
});
