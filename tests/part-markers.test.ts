import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {loadDataset} from './helpers.ts';
import {scenarioFromDataset,type Action,type Scenario} from '../src/model/scenario.ts';
import {applyAction} from '../src/model/actions.ts';
import {PARTS,partSnapshot,type Part} from '../src/model/parts.ts';
import {referenceChanges,resultChanges,markerPath,markerReference} from '../src/app/derive.ts';
import {groupingAction,parseFamily} from '../src/families/model.ts';
import {familyColor} from '../src/families/colors.ts';
import family from '../data/meta/families/haredi.json';
const base={...scenarioFromDataset(loadDataset('k25')),mode:'experimental' as const},id=base.lists[0].id;
const change:Record<Part,Action>={
 votes:{type:'setVotes',listId:id,votes:base.lists[0].votes+100},
 identity:{type:'setListMeta',listId:id,patch:{nameHe:'Test'}},
 structure:{type:'setWithdrawn',listId:id,withdrawn:true},
 candidates:{type:'candidates',listId:id,candidates:[...base.lists[0].candidates].reverse(),note:'test'},
 agreements:{type:'removeAgreement',id:base.agreements[0].id},
 blocs:{type:'setListMeta',listId:id,patch:{bloc:null}},
 coalitions:{type:'setCoalition',coalition:{in:[id],out:[]}},
 rules:{type:'setRules',patch:{thresholdPct:'2'}},
 totals:{type:'setTotals',invalid:base.invalid+10},
};
const editAgain=(s:Scenario,p:Part):Action=>p==='votes'?{type:'setVotes',listId:id,votes:s.lists[0].votes+1}:p==='identity'?{type:'setListMeta',listId:id,patch:{nameHe:'Individual'}}:p==='structure'?{type:'setWithdrawn',listId:base.lists[1].id,withdrawn:true}:p==='candidates'?{type:'candidates',listId:id,candidates:[...s.lists[0].candidates].reverse(),note:'individual'}:p==='agreements'?{type:'setAgreement',agreement:{...s.agreements[0],enabled:false}}:p==='blocs'?{type:'setListMeta',listId:base.lists[1].id,patch:{bloc:null}}:p==='coalitions'?{type:'setCoalition',coalition:{in:[id,base.lists[1].id],out:[]}}:p==='rules'?{type:'setRules',patch:{thresholdPct:'1'}}:{type:'setTotals',invalid:s.invalid+1};
for(const part of Object.keys(PARTS) as Part[])it(`${part}: whole replacement gives one part marker, then one item edit gives one item marker`,()=>{
 const source=applyAction(base,change[part]);
 const whole=applyAction(base,{type:'startPart',part,source:'saved',snapshot:partSnapshot(source,part),name:'Source'});
 expect(referenceChanges(whole,base)).toEqual([['parts',part]]);
 const edited=applyAction(whole,editAgain(whole,part)),markers=referenceChanges(edited,base);
 expect(markers.filter(p=>p[0]==='parts')).toEqual([['parts',part]]);
 expect(markers.filter(p=>p[0]!=='parts')).toHaveLength(part==='structure'?3:1);
 expect(referenceChanges(edited,edited)).toEqual([]);
 expect(referenceChanges(edited,whole)).toHaveLength(part==='structure'?3:1);
});
it('family grouping is one marker; donor/list/bloc fields are not individually marked',()=>{
 const b=scenarioFromDataset(JSON.parse(readFileSync(new URL('../public/data/k12.json',import.meta.url),'utf8'))),f=parseFamily(JSON.stringify(family)),s=applyAction(b,groupingAction(f,b,'en'));
 expect(referenceChanges(s,b)).toEqual([['parts','blocs']]);
 expect(resultChanges(s,b)).toEqual([]);
 for(const l of s.lists)expect(markerPath(s,b,['lists',l.id,'bloc'])).toBe(null);
 for(const bloc of s.blocs)expect(markerPath(s,b,['blocs',bloc.id,'nameEn'])).toBe(null);
 expect(s.blocs.find(b=>b.id==='selected')!.color).toBe(familyColor(f));
 const next=applyAction(s,{type:'setListMeta',listId:s.lists[0].id,patch:{bloc:'selected'}});
 expect(referenceChanges(next,b)).toEqual([['parts','blocs'],['lists',s.lists[0].id,'bloc']]);
 expect(markerReference(next,b,['lists',s.lists[0].id,'bloc']).lists[0].bloc).toBe('other');
});
it('replay reconstructs provenance; undo/reset and independent parts retain honest markers',()=>{
 const x=applyAction(base,{type:'startPart',part:'blocs',source:'blank',name:'Blank'});
 const replayed=JSON.parse(JSON.stringify(x.log)).reduce((s:Scenario,e:{action:Action})=>applyAction(s,e.action),base);
 expect(referenceChanges(replayed,base)).toEqual([['parts','blocs']]);
 const reset=applyAction(replayed,{type:'startPart',part:'blocs',source:'official'},undefined,{base});expect(referenceChanges(reset,base)).toEqual([]);
 const vote=applyAction(x,{type:'setVotes',listId:id,votes:base.lists[0].votes+1});expect(referenceChanges(vote,base)).toHaveLength(2);
 const rules=applyAction(base,{type:'startPart',part:'rules',source:'preset',presetId:'il-1992-bader-ofer-1.5'});expect(referenceChanges(rules,base)).toEqual([['parts','rules']]);
});
it('detaching a sourced grouping for one list move or one bloc rename gives just one item marker',()=>{
 const scheme=base.blocSchemes!.find(g=>g.id!==base.blocSchemeId)!;
 const s=applyAction(base,{type:'applyBlocScheme',schemeId:scheme.id});
 const list=s.lists.find(l=>l.bloc!==null)!;
 const moved=applyAction(s,{type:'setListMeta',listId:list.id,patch:{bloc:null}});
 expect(referenceChanges(moved,base).filter(p=>p[0]!=='parts')).toEqual([['lists',list.id,'bloc']]);
 const bloc=s.blocs[0],renamed=applyAction(s,{type:'setBlocs',blocs:s.blocs.map(b=>b.id===bloc.id?{...b,nameEn:'Renamed'}:b)});
 expect(referenceChanges(renamed,base)).toEqual([]);
});
it('a list-scoped replacement retains unrelated edits and has one scoped marker',()=>{
 const other=base.lists[1].id;
 const prior=applyAction(base,{type:'setListMeta',listId:other,patch:{nameHe:'Unrelated'}});
 const source=applyAction(base,change.identity);
 const s=applyAction(prior,{type:'startPart',part:'identity',listId:id,source:'saved',snapshot:partSnapshot(source,'identity')});
 expect(referenceChanges(s,base)).toEqual([['lists',other,'nameHe'],['parts','identity',id]]);
});
it('a turnout replacement absorbs its proportional vote side effects until a list is edited',()=>{
 const source=applyAction(base,{type:'setVotes',listId:id,votes:base.lists[0].votes+1000});
 const s=applyAction(base,{type:'startPart',part:'totals',source:'saved',snapshot:partSnapshot(source,'totals')});
 expect(referenceChanges(s,base)).toEqual([['parts','totals']]);
 const next=applyAction(s,{type:'setVotes',listId:id,votes:s.lists[0].votes+1});
 expect(referenceChanges(next,base)).toEqual([['parts','totals'],['lists',id,'votes']]);
});
it('mixed family blocs have a distinct muted colour and everyone else stays neutral',()=>{
 const b=scenarioFromDataset(JSON.parse(readFileSync(new URL('../public/data/k1.json',import.meta.url),'utf8'))),f=parseFamily(JSON.stringify(family));
 const s=applyAction(b,groupingAction(f,b,'en'));
 expect(s.blocs).toHaveLength(3);expect(new Set(s.blocs.map(b=>b.color)).size).toBe(3);
 expect(s.blocs.find(b=>b.id==='other')!.color).toBe('#7d8791');
});
