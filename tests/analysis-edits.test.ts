import family from '../data/meta/families/haredi.json';
import {groupingAction,scaleAction,parseFamily} from '../src/families/model.ts';
import {expect,it} from 'vitest';
import {loadDataset} from './helpers.ts';
import {scenarioFromDataset,toEngineInput} from '../src/model/scenario.ts';
import {partSnapshot} from '../src/model/parts.ts';
import {applyAction} from '../src/model/actions.ts';
import {referenceChanges,resultChanges,nonSeatChanges} from '../src/app/derive.ts';
import {factLog,SCENARIO_FIELDS,LIST_FIELDS} from '../src/model/actionClassification.ts';
import {scenarioKey,replay} from '../src/app/store.ts';
import {scenarioDirty} from '../src/app/scenarioDocument.ts';
const ds=loadDataset('k26'),base=scenarioFromDataset(ds);
for(const action of [
 {type:'setListMeta',listId:base.lists[0].id,patch:{bloc:null}},
 {type:'setPartyBloc',partyId:base.lists.flatMap(l=>l.parties??[])[0].id,bloc:null},
 {type:'startPart',part:'blocs',source:'saved',snapshot:{...partSnapshot(base,'blocs'),candidateBlocs:{[base.lists[0].candidates[0].id]:base.blocs[1].id}}},
 {type:'setBlocs',blocs:[...base.blocs,{id:'custom',nameHe:'חדש',nameEn:'New',color:'#123456'}]},
 {type:'startPart',part:'blocs',source:'blank',name:'My analysis'},
 {type:'setCoalition',coalition:{in:[base.lists[0].id],out:[]}},
 {type:'setBlocAppearance',blocs:base.blocs,name:'Named analysis'},
] as const)it(`${action.type}: marked analysis is saved without result identity`,()=>{
 const s=applyAction(base,action as Parameters<typeof applyAction>[1]);
 expect(toEngineInput(s)).toEqual(toEngineInput(base));
 expect(referenceChanges(s,base).length).toBeGreaterThan(0);
 expect(resultChanges(s,base)).toEqual([]);expect(nonSeatChanges(s,base,'en')).toEqual([]);
 expect(factLog(s)).toEqual([]);expect(scenarioDirty(s,base)).toBe(true);
 expect(scenarioKey({scenario:s,reference:null})).toBe('official');
 const loaded=replay(ds,'Saved analysis',s.log.map(e=>e.action)).scenario;
 expect(resultChanges(loaded,base)).toEqual([]);expect(referenceChanges(loaded,s)).toEqual([]);
 expect(scenarioKey({scenario:loaded,reference:loaded})).toBe('official');
 const votes=applyAction(s,{type:'setVotes',listId:s.lists[0].id,votes:s.lists[0].votes+1});
 expect(resultChanges(votes,base).length).toBeGreaterThan(0);
 expect(scenarioKey({scenario:votes,reference:null})).toMatch(/^draft:/);
});
it('classifies grouping state and family grouping definitions as B',()=>{
 for(const field of ['blocs','partyBlocs','candidateBlocs','customGroupingName','familyDefinition'] as const)expect(SCENARIO_FIELDS[field]).toBe('B');
 expect(LIST_FIELDS.bloc).toBe('B');
});

it('a frozen family grouping is B; scaling that family’s votes is A',()=>{
 const b=scenarioFromDataset(loadDataset('k25')),f=parseFamily(JSON.stringify(family));
 const grouped=applyAction(b,groupingAction(f,b,'en'));
 expect(toEngineInput(grouped)).toEqual(toEngineInput(b));
 expect(factLog(grouped)).toEqual([]);expect(resultChanges(grouped,b)).toEqual([]);
 expect(referenceChanges(grouped,b)).toEqual([['parts','blocs']]);
 expect(scenarioKey({scenario:grouped,reference:null})).toBe('official');
 const scaled=applyAction(grouped,scaleAction(f,grouped,'multiplier','10',{kind:'proportional'}));
 expect(factLog(scaled)).toHaveLength(1);expect(resultChanges(scaled,b).length).toBeGreaterThan(0);
 expect(scenarioKey({scenario:scaled,reference:null})).toMatch(/^draft:/);
});
