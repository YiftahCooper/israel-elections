import family from '../data/meta/families/haredi.json';
import {groupingAction,scaleAction,parseFamily} from '../src/families/model.ts';
import {expect,it} from 'vitest';
import {loadDataset} from './helpers.ts';
import {scenarioFromDataset,toEngineInput} from '../src/model/scenario.ts';
import {partSnapshot} from '../src/model/parts.ts';
import {applyAction} from '../src/model/actions.ts';
import {referenceChanges,resultChanges,nonSeatChanges,groupingOnly,historyChangesLabels} from '../src/app/derive.ts';
import {factLog,isFactAction,SCENARIO_FIELDS,LIST_FIELDS} from '../src/model/actionClassification.ts';
import {scenarioKey,replay} from '../src/app/store.ts';
import {scenarioDirty} from '../src/app/scenarioDocument.ts';
const ds=loadDataset('k26'),base=scenarioFromDataset(ds);
// Owner, 7 November 2026: grouping and coalition edits are scenario changes (counted, in History, marked,
// tinted); they leave votes and seats unchanged, which the summaries say. Only colours are exempt.
const renamed=base.blocs.map((b,i)=>i===0?{...b,nameHe:'גוש אחר',nameEn:'Another bloc'}:b);
for(const action of [
 {type:'setListMeta',listId:base.lists[0].id,patch:{bloc:null}},
 {type:'setPartyBloc',partyId:base.lists.flatMap(l=>l.parties??[])[0].id,bloc:null},
 {type:'startPart',part:'blocs',source:'saved',snapshot:{...partSnapshot(base,'blocs'),blocSchemeId:null,candidateBlocs:{[base.lists[0].candidates[0].id]:base.blocs[1].id}}},
 {type:'setBlocs',blocs:[...base.blocs,{id:'custom',nameHe:'חדש',nameEn:'New',color:'#123456'}]},
 {type:'setBlocs',blocs:renamed},
 {type:'setBlocs',blocs:base.blocs.slice(1)},
 {type:'startPart',part:'blocs',source:'blank',name:'My grouping'},
 {type:'setCoalition',coalition:{in:[base.lists[0].id],support:[],abstain:[],out:[]}},
 {type:'setCoalition',coalition:{in:[],support:[base.lists[0].id],abstain:[base.lists[1].id],out:[base.lists[2].id]}},
] as const)it(`${action.type}: a counted change that leaves votes and seats unchanged`,()=>{
 const s=applyAction(base,action as Parameters<typeof applyAction>[1]);
 expect(toEngineInput(s)).toEqual(toEngineInput(base));
 expect(factLog(s)).toHaveLength(1);
 expect(resultChanges(s,base).length).toBeGreaterThan(0);
 expect(groupingOnly(s,base)).toBe(true);
 expect(nonSeatChanges(s,base,'en')).toEqual(action.type==='setCoalition'?['coalition changed']:[]);
 expect(historyChangesLabels(s,null,'en',base)).toEqual({active:'1 change from the official result',official:null,note:'Votes and seats unchanged'});
 expect(historyChangesLabels(s,null,'he',base).note).toBe('הקולות והמנדטים לא השתנו');
 expect(scenarioDirty(s,base)).toBe(true);
 expect(scenarioKey({scenario:s,reference:null})).toMatch(/^draft:/);
 const loaded=replay(ds,'Saved grouping',s.log.map(e=>e.action)).scenario;
 expect(factLog(loaded)).toHaveLength(1);expect(referenceChanges(loaded,s)).toEqual([]);
 const votes=applyAction(s,{type:'setVotes',listId:s.lists[0].id,votes:s.lists[0].votes+1});
 expect(groupingOnly(votes,base)).toBe(false);
 expect(historyChangesLabels(votes,null,'en',base).note).toBeNull();
});
it('recolouring a bloc is appearance only: not counted, not marked, still the official result',()=>{
 const s=applyAction(base,{type:'setBlocs',blocs:base.blocs.map((b,i)=>i===0?{...b,color:'#123456'}:b)});
 expect(s.log.at(-1)!.action.type).toBe('setBlocAppearance');
 expect(isFactAction(s.log.at(-1)!.action)).toBe(false);
 expect(factLog(s)).toEqual([]);expect(referenceChanges(s,base)).toEqual([]);
 expect(scenarioKey({scenario:s,reference:null})).toBe('official');
 // a rename of the same bloc is not normalised to appearance
 const r=applyAction(base,{type:'setBlocs',blocs:renamed});
 expect(r.log.at(-1)!.action.type).toBe('setBlocs');
 expect(referenceChanges(r,base).length).toBeGreaterThan(0);
});
it('classifies grouping state and family grouping definitions as B (counted, result untouched)',()=>{
 for(const field of ['blocs','partyBlocs','candidateBlocs','customGroupingName','familyDefinition','coalition'] as const)expect(SCENARIO_FIELDS[field]).toBe('B');
 expect(LIST_FIELDS.bloc).toBe('B');expect(LIST_FIELDS.color).toBe('C');
});

it('a family grouping is a counted grouping change; scaling that family’s votes changes the result',()=>{
 const b=scenarioFromDataset(loadDataset('k25')),f=parseFamily(JSON.stringify(family));
 const grouped=applyAction(b,groupingAction(f,b,'en'));
 expect(toEngineInput(grouped)).toEqual(toEngineInput(b));
 expect(factLog(grouped)).toHaveLength(1);
 expect(referenceChanges(grouped,b)).toEqual([['parts','blocs']]);
 expect(groupingOnly(grouped,b)).toBe(true);
 expect(scenarioKey({scenario:grouped,reference:null})).toMatch(/^draft:/);
 const scaled=applyAction(grouped,scaleAction(f,grouped,'multiplier','10',{kind:'proportional'}));
 expect(factLog(scaled)).toHaveLength(2);expect(groupingOnly(scaled,b)).toBe(false);
});
