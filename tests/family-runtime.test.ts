import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import draft from '../data/meta/families/haredi.json';
import preset from '../data/meta/families/haredi.json';
import { aggregate, distribute, emptyCatalogue, fork, groupingAction, membership, parseFamily, resolve, scaleAction, visibility } from '../src/families/model.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, validAction } from '../src/model/scenario.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
const f=parseFamily(JSON.stringify(preset));
const ds=(n:number)=>JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')) as ElectionDataset;
for(const row of draft.elections) test(`independent BigInt totals ${row.electionId}`,()=>{
  const d=ds(Number(row.electionId.slice(1))); const a=aggregate(f,d);
  const independent=d.lists.reduce((n,l)=>n+(row.members.some(m=>m.listId===l.id&&m.treatment==='include')?BigInt(l.votes):0n),0n);
  expect(a.votes).toBe(independent);expect(a.votes).toBe(BigInt(row.computed.includedUnmixed.votes));expect(a.mixed).toBe(BigInt(row.computed.mixedWholeLists.votes));expect(a.valid).toBe(BigInt(row.validVotes));
});
test('all mixed policies and no overlapping constituent double count',()=>{
  const d=ds(1);expect(aggregate(f,d).mixed).toBe(52982n);
  expect(aggregate({...f,defaultMixedPolicy:'include-whole-list'},d).votes).toBe(55817n);
  expect(aggregate({...f,defaultMixedPolicy:'exclude'},d).votes).toBe(2835n);
  const included={...f,defaultMixedPolicy:'include-whole-list' as const,included:['1-ב','1-יח']};expect(aggregate(included,d).votes).toBe(55817n);expect(aggregate(included,d).mixed).toBe(0n);
});
test('integer largest remainders preserve even large totals',()=>{expect(distribute(10n,[1n,1n,1n])).toEqual([4,3,3]);expect(distribute(9007199254740991n,[9007199254740990n,1n]).reduce((a,b)=>BigInt(b)+a,0n)).toBe(9007199254740991n);});
test('scaling is exact, atomic, replayable and preserves input',()=>{
  const s=scenarioFromDataset(ds(25)); const original=structuredClone(s);const a=scaleAction(f,s,'multiplier','10',{kind:'proportional'});
  expect(validAction(a)).toBe(true);const next=applyAction(s,a); expect(next.log).toHaveLength(1);expect(s).toEqual(original);
  expect(next.lists.reduce((a,l)=>a+BigInt(l.votes),0n)).toBe(BigInt(ds(25).totals.valid));
  expect(resolve(f,next).filter(l=>l.family==='selected').reduce((a,l)=>a+l.votes,0)).toBe(740474);
  expect(next.familyDefinition).toEqual(f);expect(applyAction(s,JSON.parse(JSON.stringify(a))).lists).toEqual(next.lists);
  expect(()=>applyAction(next,a)).toThrow('stale');
});
test('target share, fixed donor, impossible targets and new voters',()=>{
  const s=scenarioFromDataset(ds(25)); const a=scaleAction(f,s,'share','20',{kind:'proportional'});expect(a.operation==='scale'&&a.target).toBe(952948);
  expect(()=>scaleAction(f,s,'share','101',{kind:'proportional'})).toThrow();
  expect(()=>scaleAction(f,s,'multiplier','10000',{kind:'transfer',listId:s.lists.at(-1)!.id})).toThrow();
  const n=applyAction(s,scaleAction(f,s,'multiplier','10',{kind:'new'}));expect(n.registered-s.registered).toBe(67316);
});
test('merged mixed list remains mixed and withdrawn lists cannot donate',()=>{
  const s=scenarioFromDataset(ds(25));s.lists[0]={...s.lists[0],originIds:['25-ג','25-מחל']};expect(resolve(f,s)[0].family).toBe('mixed');
  const zero={...f,disabled:f.elections.find(e=>e.electionId==='k25')!.members.map(m=>m.listId)};expect(()=>scaleAction(zero,s,'share','20',{kind:'proportional'})).toThrow();
});
test('fork freezes policy and membership; hide and restore preserve definitions',()=>{
  const personal=fork(f);expect(personal.id).not.toBe(f.id);personal.elections[0].members=[];expect(f.elections[0].members.length).toBeGreaterThan(0);
  const c={...emptyCatalogue(),users:[personal]};const hidden=visibility(c,f.id,true);expect(hidden.hidden).toEqual([f.id]);expect(visibility(hidden,f.id,false).users).toEqual([personal]);expect(visibility(hidden,f.id,false).hidden).toEqual([]);
});
test('import rejects invalid structures, duplicates and unsafe sources',()=>{
  expect(parseFamily(JSON.stringify(f))).toEqual(f);
  for(const change of [{schemaVersion:2},{defaultMixedPolicy:'split-votes'},{elections:[f.elections[0],f.elections[0]]},{sources:{bad:{url:'javascript:alert(1)'}}},{sources:{bad:{url:'https://en.wikipedia.org/wiki/X'}}},{links:[{from:'x',to:'x',type:'lineage'}]}])expect(()=>parseFamily(JSON.stringify({...f,...change}))).toThrow();
  expect(()=>parseFamily('null')).toThrow();expect(()=>parseFamily('{')).toThrow();
});
test('grouping snapshots all lists and prior state stays immutable',()=>{
  const s=scenarioFromDataset(ds(12));const next=applyAction(s,groupingAction(f,s));expect(next.blocSchemeId).toBe(null);expect(next.customGroupingName).toBe('חרדים');expect(next.lists.filter(l=>l.bloc==='selected')).toHaveLength(4);expect(next.log).toHaveLength(1);expect(s.familyDefinition).toBeUndefined();
});
test('unknown, did not contest and observed zero are distinct',()=>{const d=ds(25);expect(aggregate({...f,elections:[]},d).status).toBe('unknown');expect(aggregate({...f,elections:[{electionId:'k25',members:[],reviewCandidates:[]}]},d).status).toBe('did-not-contest');const z=structuredClone(d);for(const l of z.lists)l.votes=0;expect(aggregate(f,z).votes).toBe(0n);expect(membership(f,'k25').selected.size).toBe(2);});

test('all nine built-ins load generically and retain draft status',async()=>{
 const {builtins}=await import('../src/families/catalogue.ts');expect(builtins).toHaveLength(9);expect(builtins.every(f=>f.status==='research-draft-not-production')).toBe(true);
});
test('registry aliases resolve; pending and leader moves never become suggestions',async()=>{
 const r=await import('../src/families/registry.ts');expect(r.canonicalParty('ram')).toBe('raam');expect(r.canonicalParty('israeli-labor-party')).toBe('labor');expect(r.suggestions.every(e=>e.relation!=='leader-moved-to')).toBe(true);
});
test('catalogue import checks real appearances and canonical party identities',async()=>{
 const {importPreset}=await import('../src/families/catalogue.ts');expect((await importPreset(JSON.stringify(f))).id).toBe('haredi');
 await expect(importPreset(JSON.stringify({...f,included:['25-invented']}))).rejects.toThrow();
});

test('compact generated runtime is below 200 KB and matches all nine independent totals',async()=>{
 const {compileFamilyRuntime}=await import('../scripts/family-runtime.ts');const packed=compileFamilyRuntime();expect(Buffer.byteLength(JSON.stringify(packed))).toBeLessThan(200000);
 const {builtins}=await import('../src/families/runtime.ts');for(const f of builtins)for(const e of f.elections){const d=ds(Number(e.electionId.slice(1))),full=JSON.parse(readFileSync(`data/meta/families/${f.id}.json`,'utf8'));const row=full.elections.find((r:{electionId:string})=>r.electionId===e.electionId);// a joint list the family leads (first place and ≥ ⅔ of its seats) moves whole from mixed to counted
 const ledVotes=e.members.filter(m=>m.scope==='led').reduce((n,m)=>n+BigInt(d.lists.find(l=>l.id===m.listId)!.votes),0n);
 expect(aggregate(f,d).votes).toBe(BigInt(row.computed.includedUnmixed.votes)+ledVotes);expect(aggregate(f,d).mixed).toBe(BigInt(row.computed.mixedWholeLists.votes)-ledVotes);}
});
test('family colours are stable, chromatic and distinct for the nine presets',async()=>{const {builtins,familyColor}=await import('../src/families/runtime.ts');expect(new Set(builtins.map(familyColor)).size).toBe(9);expect(familyColor(fork(f))).toBe(familyColor(f));});

test('short labels survive runtime and full-definition export, with legacy snapshot fallback',async()=>{
 const {builtins,shortFamilyName}=await import('../src/families/runtime.ts');const {familyLabel}=await import('../src/families/labels.ts');
 expect(builtins.map(f=>f.labelEn)).toEqual(['Haredi','Arab & Arab–Jewish','Centre','Likud lineage','Labour & left','Religious Zionist','Radical right','Religious','Russian-speaking']);
 for(const p of builtins){expect(shortFamilyName(p,'he')).toBe(p.labelHe);expect(parseFamily(readFileSync(`data/meta/families/${p.id}.json`,'utf8')).labelEn).toBe(p.labelEn);}
 expect(familyLabel({...f,labelEn:undefined},'en')).toBe('Haredi');expect(()=>parseFamily(JSON.stringify({...f,labelEn:123}))).toThrow();
});
test('family grouping only creates a mixed bloc when whole mixed appearances remain separate',async()=>{
 const {isFamilyGrouping}=await import('../src/families/labels.ts');
 for(const n of [1,11,20]){const s=scenarioFromDataset(ds(n)),grouped=applyAction(s,groupingAction(f,s,'en'));expect(grouped.blocs.map(b=>b.id)).toContain('mixed');expect(isFamilyGrouping(grouped)).toBe(true);}
 for(const n of [12,25]){const s=scenarioFromDataset(ds(n)),grouped=applyAction(s,groupingAction(f,s,'en'));expect(grouped.blocs.map(b=>b.id)).toEqual(['selected','other']);expect(grouped.customGroupingName).toBe('Haredi');}
 const s=scenarioFromDataset(ds(25));expect(isFamilyGrouping(applyAction(s,scaleAction(f,s,'multiplier','10',{kind:'proportional'})))).toBe(false);
 for(const policy of ['exclude','include-whole-list'] as const){const s=scenarioFromDataset(ds(1)),x={...f,defaultMixedPolicy:policy};expect(applyAction(s,groupingAction(x,s)).blocs.map(b=>b.id)).not.toContain('mixed');}
});

test('a joint list led by the family counts whole for it; a genuine partnership stays mixed',async()=>{
 const {builtins}=await import('../src/families/runtime.ts');const likud=builtins.find(x=>x.id==='herut-likud')!;
 const scope=(e:string,id:string)=>likud.elections.find(x=>x.electionId===e)!.members.find(m=>m.listId===id)!.scope;
 // 2026: Likud holds first place and 26 of 27 seats; New Hope (rank 9) is a partner, not a co-owner
 expect(scope('k26','26-מחל')).toBe('led');
 // 2013 Likud–Yisrael Beiteinu: 20 of 31 seats is below two thirds
 expect(scope('k19','19-מחל')).toBe('mixed');
 const m=membership(likud,'k26');expect(m.selected.has('26-מחל')).toBe(true);expect(m.mixed.has('26-מחל')).toBe(false);
});
