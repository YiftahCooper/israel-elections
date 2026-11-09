import {englishLabel} from '../data/names.ts';
import packed from 'virtual:family-runtime';
import type { Family } from './model.ts';
export const historyElections = packed.elections.map(d=>({id:d.id,electionDate:d.date,totals:{valid:d.valid},pending:d.pending,lists:d.lists.map(([id,votes])=>({id,votes})),seats:d.seats as Record<string,number>|null}));
export type HistoryElection = typeof historyElections[number];
export const builtins: Family[] = packed.families.map(f=>({
 schemaVersion:1,id:f.id,revision:f.revision,status:f.status,nameHe:f.nameHe,nameEn:f.nameEn,labelEn:f.labelEn,labelHe:f.labelHe,definition:f.definition,definitionHe:f.definitionHe,defaultMixedPolicy:f.policy,sources:{},
 elections:f.elections.map(e=>({electionId:e.id,members:e.members.map(([listId,scope,outcome,headsList,composition])=>({listId,headsList,partyIds:[],...(composition?{composition}:{}),scope:scope===3?'led':scope===2?'mixed':scope===1?'extension':'core',treatment:['include','separate-segment','exclude','unresolved'][outcome],classificationEvidence:{status:'inferred',sourceIds:[],claim:''}})),reviewCandidates:e.reviews.map(listId=>({listId,reason:'',sourceIds:[]}))}))
}));
/** A list's short name at a historical election, without loading the election dataset. */
export function historyListName(electionId:string,listId:string,lang:'he'|'en'){const n=packed.elections.find(d=>d.id===electionId)?.names[listId];return n?(lang==='en'?englishLabel(n[1],n[0]):n[0]):(lang==='he'?'רשימה לא ידועה':'Unknown list');}
type Part=readonly [string,string,string,string|null,number,number,string|null];
const partsOf=(x:Family|undefined,electionId:string,listId:string)=>x?.elections.find(e=>e.electionId===electionId)?.members.find(m=>m.listId===listId)?.composition as readonly Part[]|undefined;
/** Constituent parties of a mixed list with the family's own flagged; a personal copy flags by its own member party ids. */
export function mixedComposition(f:Family,electionId:string,listId:string,lang:'he'|'en'){
 const own=partsOf(f,electionId,listId),parts=own??builtins.map(b=>partsOf(b,electionId,listId)).find(Boolean)??[];
 const ids=f.elections.find(e=>e.electionId===electionId)?.members.find(m=>m.listId===listId)?.partyIds??[];
 return parts.map(([id,canon,he,en,flag])=>({name:lang==='en'?englishLabel(en,he):he,own:own?flag===1:ids.includes(id)||ids.includes(canon)}));
}
/** A joint list's parties with their elected members and whether each is the family's own (same flags as mixedComposition). */
export function jointParts(f:Family,electionId:string,listId:string){
 const own=partsOf(f,electionId,listId),parts=own??builtins.map(b=>partsOf(b,electionId,listId)).find(Boolean)??[];
 const ids=f.elections.find(e=>e.electionId===electionId)?.members.find(m=>m.listId===listId)?.partyIds??[];
 return parts.map(([id,canon,nameHe,nameEn,flag,seats,color])=>({id,canon,nameHe,nameEn,seats,color,own:own?flag===1:ids.includes(id)||ids.includes(canon)}));
}
export {familyColor} from './colors.ts';
export {familyLabel as shortFamilyName} from './labels.ts';
