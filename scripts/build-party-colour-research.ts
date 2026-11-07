// Compact appearance-only index of retained research, including low-confidence entries.
// Regenerate: node scripts/build-party-colour-research.ts. No dataset/source confidence is rewritten.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export function partyColourResearch(){
 const byList:Record<string,Record<string,{color:string;confidence:string;source:string}>>={};
 const records:Record<string,{color:string;confidence:string;source:string}[]>={};
 for(let n=1;n<=26;n++){
  const meta=JSON.parse(readFileSync(`data/meta/k${n}.json`,'utf8')),ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
  for(const c of meta.colours??[])if(c.party&&/^#[\da-f]{6}$/i.test(c.color)){
   const record={color:c.color.toLowerCase(),confidence:c.confidence??'unknown',source:`data/meta/k${n}.json`};
   (records[c.party]??=[]).push(record);
   for(const l of ds.lists)if(l.parties?.some((p:{id:string})=>p.id===c.party))(byList[l.id]??={})[c.party]=record;
  }
 }
 const canonical=Object.fromEntries(Object.entries(records).sort(([a],[b])=>a.localeCompare(b)).map(([id,rows])=>{
  const counts=new Map<string,number>();for(const r of rows)counts.set(r.color,(counts.get(r.color)??0)+1);
  const color=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];return[id,rows.find(r=>r.color===color)!];
 }));
 return{canonical,byList};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))writeFileSync('src/data/party-colour-research.json',JSON.stringify(partyColourResearch())+'\n');
