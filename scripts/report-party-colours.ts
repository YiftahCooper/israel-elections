import{readFileSync,writeFileSync}from'node:fs';
import{execFileSync}from'node:child_process';
import{stripTypeScriptTypes}from'node:module';
import{resolve}from'node:path';
import{fileURLToPath,pathToFileURL}from'node:url';
import{partyDisplayDecision,partyColourUnresolved,canonicalPartyId}from'../src/app/partyDisplayColor.ts';
import{deltaE2000}from'../src/data/colour.ts';
export function partyDecisions(){
 const rows=[];
 for(let n=1;n<=26;n++){
  const ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
  for(const list of ds.lists)for(const p of list.parties??[]){
   const d=partyDisplayDecision(list,p.id);
   rows.push({election:ds.id,list:list.id,letters:list.letters,party:p.id,canonicalParty:canonicalPartyId(p.id),name:p.nameEn,...d,deltaE:Number(deltaE2000(d.base,d.color).toFixed(3))});
  }
 }
 return rows;
}
export function partyStability(){
 const rows=partyDecisions(),parties=[...new Set(rows.map(r=>r.canonicalParty))].sort().map(party=>{
  const appearances=rows.filter(r=>r.canonicalParty===party),elections=[...new Set(appearances.map(r=>r.election))],bases=[...new Set(appearances.map(r=>r.base))],colours=[...new Set(appearances.map(r=>r.color))];
  return{party,name:appearances[0].name,elections:elections.length,appearances:appearances.length,distinctColours:colours.length,colours,bases,exactBase:appearances.filter(r=>r.color===r.base).length,recordedReasons:[...new Set(appearances.flatMap(r=>r.recordedVariation?r.reasons.filter(s=>s.startsWith('recorded')):[]))]};
 });
 return{appearances:rows.length,exactBase:rows.filter(r=>r.color===r.base).length,adjusted:rows.filter(r=>r.forced).length,multipleElectionParties:parties.filter(p=>p.elections>=2),unresolved:partyColourUnresolved};
}
const csv=(value:unknown)=>'"'+String(value??'').replaceAll('"','""')+'"';
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const revision='92aab28',git=(path:string)=>execFileSync('git',['show',`${revision}:${path}`],{encoding:'utf8',maxBuffer:10_000_000});
 const researchURL='data:application/json;base64,'+Buffer.from(git('src/data/party-colour-research.json')).toString('base64');
 const source=git('src/app/partyDisplayColor.ts').replace("'../data/party-colour-research.json'",JSON.stringify(researchURL)).replaceAll("'../data/colourGuard.ts'",JSON.stringify(pathToFileURL(resolve('src/data/colourGuard.ts')).href)).replace("'../data/colour.ts'",JSON.stringify(pathToFileURL(resolve('src/data/colour.ts')).href));
 const old=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
 const rows=partyDecisions(),beforeAfter=[],oldDatasets=new Map<string,any>();
 for(const r of rows){
  if(!oldDatasets.has(r.election))oldDatasets.set(r.election,JSON.parse(git(`public/data/${r.election}.json`)));
  const list=oldDatasets.get(r.election).lists.find((l:{id:string;letters:string})=>l.id===r.list||l.letters===r.letters),before=list?old.partyDisplayColor(list,r.party):'';
  beforeAfter.push({...r,before});
 }
 writeFileSync('docs/acceptance/party-colour-adjustments.json',JSON.stringify(rows.filter(r=>r.forced),null,2)+'\n');
 writeFileSync('docs/acceptance/party-colour-before-after.csv',[['Election','List','Party','Name','Research / id base',`${revision} fill`,'Canonical fill','Delta E from base','Reason'],...beforeAfter.map(r=>[r.election,r.list,r.party,r.name,r.base,r.before,r.color,r.deltaE,r.reasons.join('; ')])].map(row=>row.map(csv).join(',')).join('\n')+'\n');
 const summary=partyStability();
 writeFileSync('docs/acceptance/party-colour-stability.csv',[['Party','Name','Elections','Appearances','Distinct display colours (target 1)','Display colours','Recorded bases','Exact base appearances','Recorded variation reasons'],...summary.multipleElectionParties.map(p=>[p.party,p.name,p.elections,p.appearances,p.distinctColours,p.colours.join('; '),p.bases.join('; '),p.exactBase,p.recordedReasons.join('; ')])].map(row=>row.map(csv).join(',')).join('\n')+'\n');
 console.log(JSON.stringify(summary,null,2));
}
