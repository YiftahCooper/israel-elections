/** Reproduce with node scripts/joint-facts.ts. Uses retained official snapshots; no network or fuzzy identity guesses. */
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import type {ListRecord,ElectionDataset} from '../src/data/schema.ts';
export const ODATA='https://knesset.gov.il/Odata/ParliamentInfo.svc/';
type Position={PersonID:number;FactionID?:number|null;FactionName?:string|null;StartDate:string;FinishDate?:string|null};
type Snapshot={positions:Position[];persons:{PersonID:number;FirstName:string;LastName:string}[];factionMemberships?:Position[]};
export function openingFaction(rows:Position[],person:number,date:string) {
 const matches=rows.filter(r=>r.PersonID===person&&r.StartDate.slice(0,10)<=date&&(!r.FinishDate||r.FinishDate.slice(0,10)>=date)&&r.FactionID&&r.FactionName);
 const unique=new Map(matches.map(r=>[r.FactionID,{id:r.FactionID!,nameHe:r.FactionName!}]));
 return unique.size===1?[...unique.values()][0]:null;
}
const exact=(s:string)=>s.normalize('NFKC').replace(/[\s־\-'"׳״.,()]/g,'');
export function deriveJointList(l:ListRecord,seats:number,snapshot:Snapshot,sources:string[]) {
 const openingDate=snapshot.positions.map(r=>r.StartDate.slice(0,10)).sort()[0]??null;
 const elected=l.candidates.filter(c=>!c.notSeated).sort((a,b)=>a.rank-b.rank).slice(0,seats);
 const head=l.candidates.filter(c=>c.rank===1); const headPartyId=head.length===1&&l.parties?.some(p=>p.id===head[0].partyId)?head[0].partyId!:null;
 const parties=(l.parties??[]).map(p=>{
  const members=elected.filter(c=>c.partyId===p.id),factions=new Map<number,{id:number;nameHe:string;seats:number}>();let unknownFaction=0;
  for(const c of members){
   // Website biography IDs are a different namespace from OData PersonID; never join them.
   const names=snapshot.persons.filter(p=>exact(`${p.LastName} ${p.FirstName}`)===exact(c.nameHe));
   const person=names.length===1?names[0].PersonID:null;
   // A faction entry is not proof of being sworn in: require an opening-day MK position too.
   const isOpening=person!==null&&openingDate&&snapshot.positions.some(r=>r.PersonID===person&&r.StartDate.slice(0,10)<=openingDate&&(!r.FinishDate||r.FinishDate.slice(0,10)>=openingDate));
   const faction=isOpening?openingFaction(snapshot.factionMemberships??[],person!,openingDate!):null;
   if(faction){const row=factions.get(faction.id)??{...faction,seats:0};row.seats++;factions.set(row.id,row);}else unknownFaction++;
  }
  return {id:p.id,nameHe:p.nameHe,nameEn:p.nameEn,elected:members.length,factions:[...factions.values()],unknownFaction};
 });
 return {listId:l.id,submissionHe:l.partiesHe?.length?l.partiesHe:l.sponsorsHe?[l.sponsorsHe]:[],headPartyId,seats,unknownElected:seats-parties.reduce((n,p)=>n+p.elected,0),openingDate,parties,sources};
}
export function compileJointFacts(root=process.cwd()) {
 const read=(p:string)=>JSON.parse(readFileSync(`${root}/${p}`,'utf8'));
 return Array.from({length:26},(_,i)=>{
  const id=`k${i+1}`,ds=read(`public/data/${id}.json`) as ElectionDataset;let meta:{lists?:{letters:string;seats?:number;sources?:{kind:string;url:string}[];parties?:{sources?:{kind:string;url:string}[]}[]}[]}={};try{meta=read(`data/meta/${id}.json`);}catch{/* no metadata */}
  const raw=read(`data/raw/${id}/knesset-odata-members.json`) as Snapshot;
  if(!raw.factionMemberships)try{raw.factionMemberships=read(`data/raw/${id}/knesset-odata-factions.json`).factionMemberships;}catch{/* explicit unknown */}
  return ds.lists.filter((l:ListRecord)=>(l.parties?.length??0)>1).map((l:ListRecord)=>{
   const m=meta.lists?.find(m=>m.letters===l.letters);
   const sources=[...new Set([...(m?.sources??[]),...(m?.parties??[]).flatMap(p=>p.sources??[])].filter(s=>s.kind==='official').map(s=>s.url))];
   sources.push(`${ODATA}KNS_PersonToPosition?$filter=KnessetNum eq ${i+1} and PositionID eq 54&$format=json`);
   return {...deriveJointList(l,ds.officialSeats?.[l.id]??m?.seats??0,raw,sources),pending:ds.status.stage!=='official-final',secondaryAffiliations:!!m?.parties?.some(p=>!p.sources?.some(s=>s.kind==='official')),secondarySources:[...new Set((m?.parties??[]).flatMap(p=>p.sources??[]).filter(s=>s.kind==='secondary'&&!/\/\/en\.wikipedia\.org/.test(s.url)).map(s=>s.url))]};
  });
 }).flat();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)writeFileSync('data/meta/joint-facts.json',JSON.stringify(compileJointFacts())+'\n');

/** Optional missing-faction refresh: sequential official OData pages, >=1s apart; never retries a 429.
 * Retains an independent raw cache, leaving the audited identity snapshot intact.
 */
export async function fetchMissingFactions(root=process.cwd()) {
 for(let n=1;n<=26;n++) {
  const path=`${root}/data/raw/k${n}/knesset-odata-members.json`;
  const snapshot=JSON.parse(readFileSync(path,'utf8')) as Snapshot;
  if(snapshot.factionMemberships||existsSync(`${root}/data/raw/k${n}/knesset-odata-factions.json`))continue;
  let url=`${ODATA}KNS_PersonToPosition?$filter=KnessetNum eq ${n} and PositionID eq 54&$format=json`;
  const rows:Position[]=[];
  while(url){
   await new Promise(r=>setTimeout(r,1100));
   const response=await fetch(url,{headers:{'User-Agent':'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)'}});
   if(!response.ok)throw new Error(`OData ${response.status}; stopped without retry`);
   const page=await response.json();rows.push(...page.value);
   const next=page['odata.nextLink']??page['@odata.nextLink'];url=next?new URL(next,ODATA).href:'';
   if(url){if(new URL(url).origin!==new URL(ODATA).origin)throw new Error('Unexpected OData origin');const parsed=new URL(url);parsed.searchParams.set('$format','json');url=parsed.href;}
  }
  writeFileSync(`${root}/data/raw/k${n}/knesset-odata-factions.json`,JSON.stringify({source:ODATA,retrievedAt:new Date().toISOString(),query:`KNS_PersonToPosition?$filter=KnessetNum eq ${n} and PositionID eq 54`,factionMemberships:rows},null,1)+'\n');
 }
}
if(process.argv.includes('--fetch-missing')){await fetchMissingFactions();writeFileSync('data/meta/joint-facts.json',JSON.stringify(compileJointFacts())+'\n');}
