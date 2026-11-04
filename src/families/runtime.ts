import packed from 'virtual:family-runtime';
import type { Family } from './model.ts';
export const historyElections = packed.elections.map(d=>({id:d.id,electionDate:d.date,totals:{valid:d.valid},pending:d.pending,lists:d.lists.map(([id,votes])=>({id,votes}))}));
export type HistoryElection = typeof historyElections[number];
export const builtins: Family[] = packed.families.map(f=>({
 schemaVersion:1,id:f.id,revision:f.revision,status:f.status,nameHe:f.nameHe,nameEn:f.nameEn,labelEn:f.labelEn,labelHe:f.labelHe,definition:f.definition,definitionHe:f.definitionHe,defaultMixedPolicy:f.policy,sources:{},
 elections:f.elections.map(e=>({electionId:e.id,members:e.members.map(([listId,scope,outcome,headsList])=>({listId,headsList,partyIds:[],scope:scope===3?'led':scope===2?'mixed':scope===1?'extension':'core',treatment:['include','separate-segment','exclude','unresolved'][outcome],classificationEvidence:{status:'inferred',sourceIds:[],claim:''}})),reviewCandidates:e.reviews.map(listId=>({listId,reason:'',sourceIds:[]}))}))
}));
export {familyColor} from './colors.ts';
export {familyLabel as shortFamilyName} from './labels.ts';
