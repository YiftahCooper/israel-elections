import packed from 'virtual:family-runtime';
import type { Family } from './model.ts';
export const historyElections = packed.elections.map(d=>({id:d.id,electionDate:d.date,totals:{valid:d.valid},pending:d.pending,lists:d.lists.map(([id,votes])=>({id,votes}))}));
export type HistoryElection = typeof historyElections[number];
export const builtins: Family[] = packed.families.map(f=>({
 schemaVersion:1,id:f.id,revision:f.revision,status:f.status,nameHe:f.nameHe,nameEn:f.nameEn,definition:f.definition,definitionHe:f.definitionHe,defaultMixedPolicy:f.policy,sources:{},
 elections:f.elections.map(e=>({electionId:e.id,members:e.members.map(([listId,scope,outcome])=>({listId,partyIds:[],scope:scope===2?'mixed':scope===1?'extension':'core',treatment:['include','separate-segment','exclude','unresolved'][outcome],classificationEvidence:{status:'inferred',sourceIds:[],claim:''}})),reviewCandidates:e.reviews.map(listId=>({listId,reason:'',sourceIds:[]}))}))
}));
/** Stable family identity colours; all chromatic, separate from neutral change marks. */
const colours:Record<string,string>={haredi:'#167f94','arab-arab-jewish':'#9760b4',centre:'#b36b19','herut-likud':'#377cc0','labour-zionist-left':'#bd527b','national-religious':'#5b8a38','radical-right':'#b65039','religious-parties':'#6264c5','russian-speaking-immigrant':'#17876f'};
export function familyColor(f:Family) {if(colours[f.id])return colours[f.id];let h=0;for(const c of f.id)h=(h*31+c.charCodeAt(0))>>>0;return `hsl(${h%360} 64% 47%)`;}
export const shortFamilyName=(f:Family,lang:'he'|'en')=>(lang==='he'?f.nameHe:f.nameEn).split(/ — | – /)[0];
