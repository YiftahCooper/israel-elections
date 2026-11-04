import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { demographicTurnout } from '../src/model/demographicTurnout.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { isEnvelopeRow, type LocalityDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { loadDataset, seatsOf } from './helpers.ts';
const base = scenarioFromDataset(loadDataset('k25'));
const fixture = (): LocalityDataset => ({ schemaVersion: 1, id: 'k25', listIds: base.lists.slice(0,2).map(l=>l.id), rows: [
  {code:1,nameHe:'test',committee:null,registered:1000,votesCast:500,valid:450,invalid:50,votes:[300,150]},
], groups: [{id:'test',nameHe:'בדיקה',nameEn:'Test',sourceIds:[],definitionHe:'',definitionEn:'',classificationYear:2022,codes:[1],coverage:{localities:1,registered:1000,valid:450,nationalValidShare:0}}] });
it('adds exactly 100 ballots: 60/30 valid and 10 invalid; replayable action',()=>{
 const r=demographicTurnout(base,fixture(),[{groupId:'test',turnoutChangePoints:10}]);
 expect(r.votes[base.lists[0].id]-base.lists[0].votes).toBe(60);
 expect(r.votes[base.lists[1].id]-base.lists[1].votes).toBe(30);
 expect(r.invalid-base.invalid).toBe(10);
 expect(r.votesCast-(base.invalid+base.lists.reduce((t,l)=>t+l.votes,0))).toBe(100);
 const s=applyAction(base,r.action);expect(s.invalid).toBe(r.invalid);expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);expect(s.log.at(-1)?.action).toEqual(r.action);
});
it('removes ballots and allows endpoints, rejects out of range and overlap',()=>{
 expect(demographicTurnout(base,fixture(),[{groupId:'test',turnoutPercent:0}]).invalid).toBe(base.invalid-50);
 expect(()=>demographicTurnout(base,fixture(),[{groupId:'test',turnoutChangePoints:51}])).toThrow();
 expect(()=>demographicTurnout(base,fixture(),[{groupId:'test',turnoutChangePoints:-51}])).toThrow();
 expect(()=>demographicTurnout(base,fixture(),[{groupId:'test',turnoutPercent:50},{groupId:'test',turnoutPercent:60}])).toThrow(/overlap/i);
});
it('conserves votes through merges and splits, even zero-weight splits',()=>{
 const d=fixture();
 const s=structuredClone(base);s.lists[0].originIds.push(s.lists[1].id);s.lists.splice(1,1);
 expect(demographicTurnout(s,d,[{groupId:'test',turnoutChangePoints:10}]).votes[s.lists[0].id]-s.lists[0].votes).toBe(90);
 const split=structuredClone(base);split.lists[1].originIds=[split.lists[0].id];split.lists[0].votes=0;split.lists[1].votes=0;
 d.listIds=d.listIds.slice(0,1);d.rows[0].votes=[450];
 const r=demographicTurnout(split,d,[{groupId:'test',turnoutChangePoints:10}]);expect(r.votes[split.lists[0].id]+r.votes[split.lists[1].id]).toBe(90);
});
it('retained classifications cover real non-envelope rows and reconcile coverage',()=>{
 for(let n=16;n<=26;n++){
 const d:LocalityDataset=JSON.parse(readFileSync(`public/data/k${n}-localities.json`,'utf8'));
 if(n===17){expect(d.groups).toEqual([]);continue;}
 expect(d.groups!.length).toBeGreaterThanOrEqual(4);
 for(const g of d.groups!){expect(g.codes.length).toBeGreaterThan(0);const rows=d.rows.filter(r=>r.code!==null&&g.codes.includes(r.code));expect(rows.length).toBe(g.codes.length);expect(rows.some(isEnvelopeRow)).toBe(false);expect(g.coverage.valid).toBe(rows.reduce((t,r)=>t+r.valid,0));expect(g.coverage.registered).toBe(rows.reduce((t,r)=>t+r.registered!,0));}
 }
});
it('Arab localities +10 points changes k25 seats using their own mix',()=>{
 const d:LocalityDataset=JSON.parse(readFileSync('public/data/k25-localities.json','utf8'));
 const r=demographicTurnout(base,d,[{groupId:'arab',turnoutChangePoints:10}]);
 const after=seatsOf(allocate(toEngineInput(applyAction(base,r.action))));
 expect(r.votesCast-(base.invalid+base.lists.reduce((t,l)=>t+l.votes,0))).toBe(93840);
 expect(r.invalid-base.invalid).toBe(922);
 expect(after['25-ד']).toBe(4);expect(after['25-עם']).toBe(6);expect(after['25-מחל']).toBe(30);
 expect(after).not.toEqual(seatsOf(allocate(toEngineInput(base))));
});
it('rejects cross-election, missing electorate, invalid percentages, envelopes and missing origins',()=>{
 const adjustment=[{groupId:'test',turnoutChangePoints:10}];
 const d=fixture();d.id='k24';expect(()=>demographicTurnout(base,d,adjustment)).toThrow(/mismatch/);
 d.id='k25';d.rows[0].registered=null;expect(()=>demographicTurnout(base,d,adjustment)).toThrow(/unavailable/);
 d.rows[0].registered=1000;d.rows[0].envelopes=true;expect(()=>demographicTurnout(base,d,adjustment)).toThrow(/envelope/);
 d.rows[0].envelopes=false;d.listIds[0]='absent';expect(()=>demographicTurnout(base,d,adjustment)).toThrow(/destination/);
 for(const value of [NaN,Infinity,-1,101])expect(()=>demographicTurnout(base,fixture(),[{groupId:'test',turnoutPercent:value}])).toThrow();
 expect(()=>demographicTurnout(base,fixture(),[{groupId:'unknown',turnoutPercent:50}])).toThrow(/Unknown/);
});
it('uses exact decimal points, 100% bounds, deterministic Hamilton ties and nonzero split weights',()=>{
 const d=fixture();
 expect(demographicTurnout(base,d,[{groupId:'test',turnoutPercent:100}]).votesCast-(base.invalid+base.lists.reduce((t,l)=>t+l.votes,0))).toBe(500);
 const r=demographicTurnout(base,d,[{groupId:'test',turnoutChangePoints:0.1}]);
 expect(r.votes[base.lists[0].id]-base.lists[0].votes).toBe(1);
 const s=structuredClone(base);s.lists[0].votes=300;s.lists[1].votes=100;s.lists[1].originIds=[s.lists[0].id];d.listIds=d.listIds.slice(0,1);d.rows[0].votes=[450];
 const result=demographicTurnout(s,d,[{groupId:'test',turnoutChangePoints:10}]);
 expect(result.votes[s.lists[0].id]-300).toBe(68);expect(result.votes[s.lists[1].id]-100).toBe(22);
});
it('rejects distinct overlapping groups and invalid removal results; preserves scenario input',()=>{
 const d=fixture();d.groups!.push({...d.groups![0],id:'overlap'});
 expect(()=>demographicTurnout(base,d,[{groupId:'test',turnoutPercent:60},{groupId:'overlap',turnoutPercent:60}])).toThrow(/Overlapping/);
 const s=structuredClone(base);s.lists[0].votes=0;
 expect(()=>demographicTurnout(s,fixture(),[{groupId:'test',turnoutPercent:0}])).toThrow(/negative/);
 const before=JSON.stringify(base);demographicTurnout(base,fixture(),[{groupId:'test',turnoutChangePoints:10}]);expect(JSON.stringify(base)).toBe(before);
});
it('rebuilds k18/k19 against original locality evidence after attaching demographic metadata',async()=>{
 const { buildK18 }=await import('../scripts/lib/historical/k18.ts');
 const { buildK19 }=await import('../scripts/lib/historical/k19.ts');
 for(const build of [buildK18,buildK19]){const result=await build();expect(result.loc?.rows.length).toBeGreaterThan(1000);}
});
it('signed demographic actions validate, log and replay removals without enabling ordinary negative additions',()=>{
 const result=demographicTurnout(base,fixture(),[{groupId:'test',turnoutPercent:0}]);
 const applied=applyAction(base,result.action,'2026-11-04T00:00:00Z');
 expect(validateScenario(JSON.parse(JSON.stringify(applied)))).toEqual([]);
 expect(applied.lists[0].votes).toBe(base.lists[0].votes-300);
 expect(applied.invalid).toBe(base.invalid-50);
 expect(()=>applyAction(base,{type:'addVoters',allocations:[{listId:base.lists[0].id,votes:-1}],invalid:0})).toThrow();
 expect(()=>applyAction(base,{type:'addVoters',demographic:true,allocations:[{listId:base.lists[0].id,votes:-base.lists[0].votes-1}],invalid:0,label:'bad'})).toThrow();
});
it('does not include mixed Jewish–Arab localities in ethnic/religious groups',()=>{
 const d:LocalityDataset=JSON.parse(readFileSync('public/data/k25-localities.json','utf8'));
 const mixed=[3000,4000,5000,7000,8500,7600,1063,1056,1259];
 for(const id of ['arab','druze','haredi'])expect(d.groups!.find(g=>g.id===id)!.codes.some(code=>mixed.includes(code))).toBe(false);
 expect(d.groups!.find(g=>g.id==='development-towns')!.codes).toContain(1063);
});
it('does not treat the merged 2009 Carmel City result as the 2022 homogeneous Daliyat locality',()=>{
 const d:LocalityDataset=JSON.parse(readFileSync('public/data/k18-localities.json','utf8'));
 expect(d.rows.find(r=>r.code===494)!.nameHe).toBe('עיר כרמל');
 expect(d.groups!.find(g=>g.id==='druze')!.codes).not.toContain(494);
});
