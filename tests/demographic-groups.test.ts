import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { DemographicGroupDataset, GroupMeasure } from '../src/data/schema.ts';
import { demographicTurnout } from '../src/model/demographicTurnout.ts';
import { demographicGroups, groupAvailability } from '../src/model/demographicGroups.ts';
import { validateDemographicGroups } from '../src/model/validateDemographicGroups.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
const base=scenarioFromDataset(loadDataset('k25'));
const a=base.lists[0].id,b=base.lists[1].id;
const solid=<T>(value:T):Extract<GroupMeasure<T>,{grade:'solid'|'estimate'}>=>({value,grade:'solid',reason:'Synthetic exact test input, not population evidence',evidence:{sourceId:'fixture',method:'official',locator:'test'}});
const fixture=():DemographicGroupDataset=>({schemaVersion:1,id:'k25',national:{registered:base.registered,votesCast:10000,invalid:1000},dimensions:[{id:'religiosity',coverage:'partial',definitionEn:'Disjoint test groups'}],groups:[{id:'test',dimension:'religiosity',nameHe:'בדיקה',nameEn:'Test',definitionHe:'נתונים סינתטיים',definitionEn:'Synthetic only',electorate:solid({eligible:1000}),turnout:solid(50),split:solid({lists:{[a]:60,[b]:40},otherPct:0})}]});
it('exact target minus baseline, turnout and split together, logged replay and no mutation',()=>{
 const s=structuredClone(base),d=fixture();const r=demographicGroups(s,d,[{groupId:'test',turnoutChangePoints:10,split:{[a]:20,[b]:80}}]);
 // Base valid 450 => 270,180; target valid 540 =>108,432; invalid +10.
 expect(r.deltas[a]).toBe(-162);expect(r.deltas[b]).toBe(252);expect(r.invalidDelta).toBe(10);
 expect(r.clamped).toEqual([]);expect(r.evidence[0].grade).toBe('solid');
 const changed=applyAction(s,r.action);expect(changed.lists.find(l=>l.id===a)!.votes).toBe(r.votes[a]);expect(changed.invalid).toBe(r.invalid);expect(validateScenario(JSON.parse(JSON.stringify(changed)))).toEqual([]);expect(changed.log.at(-1)!.action).toEqual(r.action);expect(s).toEqual(base);
 expect(demographicGroups(base,d,[{groupId:'test',turnoutPct:50}]).deltas[a]).toBe(0);
});
it('split-only edits conserve cast ballots and preserve invalid votes',()=>{
 const r=demographicGroups(base,fixture(),[{groupId:'test',split:{[b]:100}}]);
 expect(r.deltas[a]).toBe(-270);expect(r.deltas[b]).toBe(270);expect(r.invalidDelta).toBe(0);
});
it('uses exact decimal input, half-up target rounding and Hamilton ties',()=>{
 const r=demographicGroups(base,fixture(),[{groupId:'test',turnoutChangePoints:0.05}]);
 expect(Object.values(r.deltas).reduce((a,b)=>a+b,0)+r.invalidDelta).toBe(1);
 expect(r.deltas[a]).toBe(1); // target valid 451 => 271/180; baseline 270/180
});
it('clamps negative list and invalid totals with explicit report',()=>{
 const s=structuredClone(base);s.lists.find(l=>l.id===a)!.votes=2;s.invalid=0;
 const r=demographicGroups(s,fixture(),[{groupId:'test',turnoutPct:0}]);
 expect(r.votes[a]).toBe(0);expect(r.invalid).toBe(0);expect(r.clamped).toEqual([{listId:a,requestedDelta:-270,appliedDelta:-2},{listId:'invalid',requestedDelta:-50,appliedDelta:0}]);expect(()=>applyAction(s,r.action)).not.toThrow();
});
it('maps merges and split origins using current proportions, including all-zero sharers',()=>{
 const s=structuredClone(base);s.lists[0].originIds.push(b);s.lists.splice(1,1);
 expect(demographicGroups(s,fixture(),[{groupId:'test',turnoutChangePoints:10}]).deltas[a]).toBe(90);
 const d=fixture();d.groups[0].split=solid({lists:{[a]:100},otherPct:0});
 const split=structuredClone(base);split.lists[1].originIds=[a];split.lists[0].votes=300;split.lists[1].votes=100;
 const r=demographicGroups(split,d,[{groupId:'test',turnoutChangePoints:10}]);expect(r.deltas[a]).toBe(67);expect(r.deltas[b]).toBe(23);
 split.lists[0].votes=0;split.lists[1].votes=0;
 const z=demographicGroups(split,d,[{groupId:'test',turnoutChangePoints:10}]);expect(z.deltas[a]).toBe(45);expect(z.deltas[b]).toBe(45);
});
it('blocks missing evidence even with opt-in, gates estimates, rejects residual guesses',()=>{
 const d=fixture();d.groups[0].turnout={grade:'insufficient',reason:'missing'};
 expect(groupAvailability(d.groups[0]).mode).toBe('unavailable');expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60}],{speculative:true})).toThrow(/Insufficient/);
 d.groups[0].turnout={...solid(50),grade:'estimate'};expect(groupAvailability(d.groups[0]).mode).toBe('speculative');
 expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60}])).toThrow(/opt-in/);expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60}],{speculative:true})).not.toThrow();
 d.groups[0].split=solid({lists:{[a]:90},otherPct:10});expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60}],{speculative:true})).toThrow(/unattributed/);
});
it('rejects duplicates, cross-dimension overlap, nonfinite, out-of-bounds and malformed edits',()=>{
 const d=fixture();d.dimensions.push({id:'origin',coverage:'partial',definitionEn:'overlaps'});d.groups.push({...d.groups[0],id:'overlap',dimension:'origin'});
 expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60},{groupId:'overlap',turnoutPct:60}])).toThrow(/Overlapping/);
 expect(()=>demographicGroups(base,d,[{groupId:'test',turnoutPct:60},{groupId:'test',turnoutPct:60}])).toThrow(/Duplicate/);
 for(const turnoutPct of [NaN,Infinity,-1,101])expect(()=>demographicGroups(base,fixture(),[{groupId:'test',turnoutPct}])).toThrow();
 expect(()=>demographicGroups(base,fixture(),[{groupId:'test',split:{[a]:80}}])).toThrow(/100/);
 expect(()=>demographicGroups(base,fixture(),[{groupId:'test',turnoutPct:60,turnoutChangePoints:10}])).toThrow(/one/);
 const wrong=fixture();wrong.id='k24';expect(()=>demographicGroups(base,wrong,[])).toThrow(/mismatch/);
 const bad=fixture();bad.groups[0].split=solid({lists:{absent:100},otherPct:0});expect(()=>demographicGroups(base,bad,[])).toThrow(/unknown list/);
});
it('all reviewed elections preserve grades, missing values, source IDs, list IDs and partition bounds',()=>{
 const sources=JSON.parse(readFileSync('data/raw/SOURCES.json','utf8')) as {id:string}[];
 for(let n=16;n<=26;n++){
  const d:DemographicGroupDataset=JSON.parse(readFileSync(`data/raw/demographics/groups-k${n}.reviewed.json`,'utf8'));
  validateDemographicGroups(d,loadDataset(`k${n}` as 'k25').lists.map(l=>l.id));expect(d.groups).toHaveLength(10);
  for(const g of d.groups){for(const m of [g.electorate,g.turnout,g.split]){if(m.grade==='insufficient')expect(m).not.toHaveProperty('value');if(m.evidence)expect(sources.some(s=>s.id===m.evidence!.sourceId)).toBe(true);}expect(groupAvailability(g).mode).toBe('unavailable');}
 }
 const d=fixture();d.groups.push({...d.groups[0],id:'second',electorate:solid({sharePct:100})});expect(()=>validateDemographicGroups(d,[a,b])).toThrow(/exceeds/);
});
it('worked 2022 Haredi COHORT +5 points uses electorate times own UTJ/Shas mix',()=>{
 // Real retained seven-authority cohort; intentionally not a national Haredi estimate.
 const loc=JSON.parse(readFileSync('public/data/k25-localities.json','utf8'));
 const group=loc.groups.find((g:{id:string})=>g.id==='haredi');
 const rows=loc.rows.filter((r:{code:number})=>group.codes.includes(r.code));
 const registered=group.coverage.registered;
 const cast=rows.reduce((t:number,r:{votesCast:number})=>t+r.votesCast,0);
 const valid=rows.reduce((t:number,r:{valid:number})=>t+r.valid,0);
 const utj=rows.reduce((t:number,r:{votes:number[]})=>t+r.votes[loc.listIds.indexOf('25-ג')],0);
 const shas=rows.reduce((t:number,r:{votes:number[]})=>t+r.votes[loc.listIds.indexOf('25-שס')],0);
 expect(registered).toBe(214269);expect(utj+shas).toBeLessThan(valid);
 // Separate existing place API supplies observed integer mix without inventing a national size.
 expect(Math.round(registered*0.05)).toBe(10713);expect(cast).toBeGreaterThan(valid);
 const r=demographicTurnout(base,loc,[{groupId:'haredi',turnoutChangePoints:5}]);
 expect(r.votesCast-(base.invalid+base.lists.reduce((t,l)=>t+l.votes,0))).toBe(10713);
 for(const [id,v]of [['25-ג',utj],['25-שס',shas]] as const){const delta=r.action.type==='addVoters'?r.action.allocations.find(a=>a.listId===id)!.votes:NaN;expect(Math.abs(delta-10713*v/cast)).toBeLessThan(1);}
 const people:DemographicGroupDataset=JSON.parse(readFileSync('data/raw/demographics/groups-k25.reviewed.json','utf8'));
 expect(()=>demographicGroups(base,people,[{groupId:'haredi',turnoutChangePoints:5}],{speculative:true})).toThrow(/Insufficient/);
});
it('supports electorate shares, sourced invalid rates and disjoint same-dimension batches',()=>{
 const d=fixture();d.groups[0].electorate=solid({sharePct:0.01});d.groups[0].invalidRate=solid(0);
 const electorate=Math.round(d.national.registered/10000);
 const r=demographicGroups(base,d,[{groupId:'test',turnoutPct:100}]);
 expect(Object.values(r.deltas).reduce((a,b)=>a+b,0)).toBe(electorate-Math.round(electorate/2));expect(r.invalidDelta).toBe(0);
 const one=fixture();one.groups[0].invalidRate=solid(0);const single=demographicGroups(base,one,[{groupId:'test',turnoutChangePoints:10}]);
 one.groups.push({...one.groups[0],id:'second'});
 const both=demographicGroups(base,one,[{groupId:'test',turnoutChangePoints:10},{groupId:'second',turnoutChangePoints:10}]);
 expect(both.deltas[a]).toBe(2*single.deltas[a]);expect(both.deltas[b]).toBe(2*single.deltas[b]);
});
it('built siblings exactly match reviewed inputs and normal actions still reject negative allocations',()=>{
 for(let n=16;n<=26;n++)expect(JSON.parse(readFileSync(`public/data/k${n}-groups.json`,'utf8'))).toEqual(JSON.parse(readFileSync(`data/raw/demographics/groups-k${n}.reviewed.json`,'utf8')));
 expect(()=>applyAction(base,{type:'addVoters',allocations:[{listId:a,votes:-1}],invalid:0})).toThrow();
});
