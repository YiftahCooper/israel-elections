import { expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { referenceChanges } from '../src/app/derive.ts';
import { getState, setState, dispatch, undo, resetAll, scenarioKey, replay } from '../src/app/store.ts';
import { scenarioDirty } from '../src/app/scenarioDocument.ts';
import { SCENARIO_FIELDS, LIST_FIELDS, STORE_FIELDS, factLog } from '../src/model/actionClassification.ts';

it('classifies every scenario and list field; new fields require a decision',()=>{
 const text=readFileSync(new URL('../src/model/scenario.ts',import.meta.url),'utf8');
 for(const [name,fields] of [['Scenario',SCENARIO_FIELDS],['SimList',LIST_FIELDS]] as const){
  const body=text.split(`export interface ${name} {`)[1].split('\n}')[0].replace(/\/\*[^]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
  const keys=[...body.matchAll(/^  (\w+)\??:/gm)].map(m=>m[1]);
  expect(Object.keys(fields).sort()).toEqual(keys.sort());
 }
 const store=readFileSync(new URL('../src/app/store.ts',import.meta.url),'utf8').split('export interface State {')[1].split('\n}')[0].replace(/\/\*[^]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 expect(Object.keys(STORE_FIELDS).sort()).toEqual([...store.matchAll(/^  (\w+)\??:/gm)].map(m=>m[1]).sort());
});
for(const id of ['k26','k25','k1'] as const)it(`${id}: appearance is saved without factual edits, resets are independent`,()=>{
 const ds=id==='k1'?JSON.parse(readFileSync(new URL('../public/data/k1.json',import.meta.url),'utf8')):loadDataset(id),base=scenarioFromDataset(ds),ctx={base};
 let s=applyAction(base,{type:'setBlocs',blocs:base.blocs.map(b=>({...b,color:'#abcdef',nameEn:'Display name'}))},undefined,ctx);
 s=applyAction(s,{type:'setListMeta',listId:s.lists[0].id,patch:{color:'#123456'}},undefined,ctx);
 const joint=s.lists.find(l=>l.parties?.length);
 if(joint)s=applyAction(s,{type:'setPartyColor',listId:joint.id,partyId:joint.parties![0].id,color:'#654321'},undefined,ctx);
 expect(referenceChanges(s,base)).toEqual([]);expect(factLog(s)).toEqual([]);
 expect(scenarioKey({scenario:s,reference:null})).toBe('official');
 expect(scenarioDirty(s,base)).toBe(true);expect(toEngineInput(s)).toEqual(toEngineInput(base));
 expect(validateScenario(s)).toEqual([]);
 const loaded=replay(ds,'My colours',s.log.map(e=>e.action)).scenario;
 expect(loaded.lists.map(l=>l.color)).toEqual(s.lists.map(l=>l.color));
 expect(loaded.blocs).toEqual(s.blocs);
 expect(scenarioKey({scenario:loaded,reference:loaded,saved:[{id:loaded.id,electionId:id,name:'My colours',savedAt:'',baseBuiltAt:loaded.baseBuiltAt,log:loaded.log.map(e=>e.action)}]})).toBe('official');
 const edited=applyAction(s,{type:'setVotes',listId:s.lists[0].id,votes:s.lists[0].votes+1},undefined,ctx);
 expect(referenceChanges(edited,base).length).toBeGreaterThan(0);
 const restoredVotes=applyAction(edited,{type:'resetVotes',listId:s.lists[0].id},undefined,ctx);
 expect(scenarioKey({scenario:restoredVotes,reference:null,datasets:{[id]:ds}})).toBe('official');
 const reset=applyAction(edited,{type:'resetColors'},undefined,ctx);
 expect(reset.lists[0].votes).toBe(edited.lists[0].votes);expect(reset.lists[0].color).toBe(base.lists[0].color);
 const resetEdits=applyAction(edited,{type:'resetList',listId:s.lists[0].id},undefined,ctx);
 expect(resetEdits.lists[0].color).toBe('#123456');
});

it('Start over restores factual inputs while retaining list, party and bloc palettes',()=>{
 const before=getState(), ds=loadDataset('k26'),base=scenarioFromDataset(ds);
 const values=new Map<string,string>();
 vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)});
 try {
  setState({datasets:{k26:ds},electionId:'k26',scenario:base,reference:null,past:[],future:[]});
  const l=base.lists[0];
  dispatch({type:'setListMeta',listId:l.id,patch:{color:'#123456'}});
  undo();
  expect(JSON.parse(values.get('israel-elections:appearance:k26')!)).toEqual([]);
  dispatch({type:'setListMeta',listId:l.id,patch:{color:'#123456'}});
  dispatch({type:'setBlocs',blocs:base.blocs.map(b=>({...b,color:'#abcdef'}))});
  const joint=base.lists.find(x=>x.parties?.length);
  if(joint)dispatch({type:'setPartyColor',listId:joint.id,partyId:joint.parties![0].id,color:'#654321'});
  dispatch({type:'setVotes',listId:l.id,votes:l.votes+100});
  resetAll();
  const s=getState().scenario!;
  expect(toEngineInput(s)).toEqual(toEngineInput(base));
  expect(s.lists[0].color).toBe('#123456');
  expect(s.blocs.every(b=>b.color==='#abcdef')).toBe(true);
  if(joint)expect(s.lists.find(x=>x.id===joint.id)!.parties![0].color).toBe('#654321');
  expect(scenarioKey()).toBe('official');
  expect(JSON.parse(values.get('israel-elections:appearance:k26')!).some((a:{type:string})=>a.type==='setVotes')).toBe(false);
  dispatch({type:'resetColors'});
  expect(getState().scenario!.lists[0].color).toBe(l.color);
 }finally{setState(before);vi.unstubAllGlobals();}
});
