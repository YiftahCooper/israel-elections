import type { DemographicGroupDataset, GroupMeasure } from '../data/schema.ts';
/** Shared build/runtime integrity gate. All published non-residual IDs must be election lists. */
export function validateDemographicGroups(data:DemographicGroupDataset,listIds:readonly string[]):void {
 const need=(ok:unknown,message:string)=>{if(!ok)throw new Error('Demographic group data: '+message);};
 const count=(n:number)=>Number.isSafeInteger(n)&&n>=0;
 const percent=(n:number)=>Number.isFinite(n)&&n>=0&&n<=100;
 need(count(data.national.registered)&&count(data.national.votesCast)&&count(data.national.invalid)&&data.national.votesCast<=data.national.registered&&data.national.invalid<=data.national.votesCast,'national totals');
 need(data.schemaVersion===1,'schema version');
 const dimensions=new Set(data.dimensions.map(d=>d.id));need(dimensions.size===data.dimensions.length,'duplicate dimension');
 need(data.dimensions.every(d=>d.coverage==='partial'||d.coverage==='partition'),'dimension coverage');
 const ids=new Set<string>();
 function measure<T>(m:GroupMeasure<T>){
  need(['solid','estimate','insufficient'].includes(m.grade)&&!!m.reason,'grade/reason');
  if(m.grade==='insufficient')need(!('value'in m),'insufficient must omit value');
  else need(m.value!==undefined&&!!m.evidence?.sourceId&&!!m.evidence.locator&&['official','survey','exit-poll','ecological'].includes(m.evidence.method),'missing evidence/value');
 }
 for(const g of data.groups){
  need(!ids.has(g.id),'duplicate group');ids.add(g.id);need(dimensions.has(g.dimension),'unknown dimension');
  need(g.nameHe&&g.nameEn&&g.definitionHe&&g.definitionEn,'bilingual definition');
  measure(g.electorate);measure(g.turnout);measure(g.split);if(g.invalidRate)measure(g.invalidRate);
  const size=g.electorate.value;if(size)need('eligible'in size?count(size.eligible)&&size.eligible<=data.national.registered:percent(size.sharePct),'electorate');
  if(g.turnout.value!==undefined)need(percent(g.turnout.value),'turnout');
  if(g.invalidRate?.value!==undefined)need(percent(g.invalidRate.value),'invalid rate');
  if(g.split.value){const {lists,otherPct}=g.split.value;need(percent(otherPct),'other split');for(const [id,v]of Object.entries(lists))need(listIds.includes(id)&&percent(v),'unknown list or invalid share');need(Math.abs(Object.values(lists).reduce((a,b)=>a+b,otherPct)-100)<=0.1,'split sum');}
 }
 for(const d of data.dimensions){
  const gs=data.groups.filter(g=>g.dimension===d.id),sizes=gs.flatMap(g=>g.electorate.value?[g.electorate.value]:[]);
  const total=sizes.reduce((t,v)=>t+('eligible'in v?v.eligible/data.national.registered*100:v.sharePct),0);
  need(total<=100+1e-9,'dimension exceeds electorate');
  if(d.coverage==='partition')need(sizes.length===gs.length&&Math.abs(total-100)<1e-9,'incomplete partition');
 }
}
