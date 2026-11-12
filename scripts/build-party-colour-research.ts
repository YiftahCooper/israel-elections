import{canonicalPartyPalette,type PartyAppearance}from'../src/data/partyPalette.ts';
// Compact appearance-only index of retained research, including low-confidence entries.
// Regenerate: node scripts/build-party-colour-research.ts. No dataset/source confidence is rewritten.
// It reads which parties won seats on which list (not list colours); the dataset build reads this index back
// (scripts/lib/build/meta.ts), so run this before data:build.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export function partyColourResearch(){
 const registry=JSON.parse(readFileSync('data/meta/parties.json','utf8'));
 const aliases:Record<string,string>=Object.fromEntries(registry.parties.flatMap((p:{id:string;aliases?:{id:string}[]})=>(p.aliases??[]).map(a=>[a.id,p.id])));
 const idOf=(id:string)=>aliases[id]??id;
 const appearances:PartyAppearance[]=[];
 const byList:Record<string,Record<string,{color:string;confidence:string;source:string}>>={};
 const records:Record<string,{color:string;confidence:string;source:string}[]>={};
 for(let n=1;n<=26;n++){
  const meta=JSON.parse(readFileSync(`data/meta/k${n}.json`,'utf8')),ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
  type Cand={partyId?:string;notSeated?:boolean};type List={id:string;parties?:{id:string}[];candidates:Cand[]};
  for(const l of ds.lists as List[]){
   // the default chamber: the elected candidates in seat order, each drawn in its party's colour on a joint list
   const elected=l.candidates.filter(c=>!c.notSeated).slice(0,ds.officialSeats?.[l.id]??0),joint=(l.parties?.length??0)>1;
   const own=(c:Cand)=>joint&&!!c.partyId&&l.parties!.some(p=>p.id===c.partyId);
   const seated:Record<string,number>={};for(const c of elected.filter(own))seated[idOf(c.partyId!)]=(seated[idOf(c.partyId!)]??0)+1;
   if(l.parties?.length)appearances.push({election:ds.id,list:l.id,parties:[...new Set<string>(l.parties.map((p:{id:string})=>idOf(p.id)))],...(elected.some(own)?{seated}:{})});
  }
  for(const c of meta.colours??[])if(c.party&&/^#[\da-f]{6}$/i.test(c.color)){
   const record={color:c.color.toLowerCase(),confidence:c.confidence??'unknown',source:`data/meta/k${n}.json`};
   (records[idOf(c.party)]??=[]).push(record);
   for(const l of ds.lists)if(l.parties?.some((p:{id:string})=>idOf(p.id)===idOf(c.party)))(byList[l.id]??={})[idOf(c.party)]=record;
  }
 }
 const canonical=Object.fromEntries(Object.entries(records).sort(([a],[b])=>a.localeCompare(b)).map(([id,rows])=>{
  const counts=new Map<string,number>();for(const r of rows)counts.set(r.color,(counts.get(r.color)??0)+1);
  const color=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];return[id,rows.find(r=>r.color===color)!];
 }));
 const input={aliases,canonical,byList,appearances};
 return{...input,display:canonicalPartyPalette(input)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))writeFileSync('src/data/party-colour-research.json',JSON.stringify(partyColourResearch())+'\n');
