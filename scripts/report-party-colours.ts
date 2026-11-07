import{readFileSync,writeFileSync}from'node:fs';
import{execFileSync}from'node:child_process';
import{stripTypeScriptTypes}from'node:module';
import{resolve}from'node:path';
import{fileURLToPath,pathToFileURL}from'node:url';
import{partyDisplayDecision}from'../src/app/partyDisplayColor.ts';
import{deltaE2000}from'../src/data/colour.ts';
export function partyDecisions(){
 const rows=[];
 for(let n=1;n<=26;n++){
  const ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
  for(const list of ds.lists)for(const p of list.parties??[]){
   const d=partyDisplayDecision(list,p.id);
   rows.push({election:ds.id,list:list.id,party:p.id,name:p.nameEn,...d,deltaE:Number(deltaE2000(d.base,d.color).toFixed(3))});
  }
 }
 return rows;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const oldSource=execFileSync('git',['show','f36a1f2:src/app/partyDisplayColor.ts'],{encoding:'utf8'}).replace("'../data/colour.ts'",JSON.stringify(pathToFileURL(resolve('src/data/colour.ts')).href));
 const old=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(oldSource)).toString('base64'));
 const rows=partyDecisions(),changed=[],oldDatasets=new Map<string,any>();
 for(const r of rows){if(!oldDatasets.has(r.election))oldDatasets.set(r.election,JSON.parse(execFileSync('git',['show',`f36a1f2:public/data/${r.election}.json`],{encoding:'utf8',maxBuffer:10_000_000})));const ds=oldDatasets.get(r.election),list=ds.lists.find((l:{id:string})=>l.id===r.list),before=old.partyDisplayColor(list,r.party);if(before!==r.color)changed.push({...r,before});}
 writeFileSync('docs/acceptance/party-colour-adjustments.json',JSON.stringify(rows.filter(r=>r.forced),null,2)+'\n');
 const csv=(value:unknown)=>'\"'+String(value??'').replaceAll('\"','\"\"')+'\"';
 writeFileSync('docs/acceptance/party-colour-before-after.csv',[['Election','List','Party','Name','Research / id base','Before','After','Delta E from base','Forced checks'],...changed.map(r=>[r.election,r.list,r.party,r.name,r.base,r.before,r.color,r.deltaE,r.reasons.join('; ')])].map(row=>row.map(csv).join(',')).join('\n')+'\n');
 console.log(JSON.stringify({parties:rows.length,forced:rows.filter(r=>r.forced).length,changed:changed.length,examples:changed.filter(r=>['k24','k25'].includes(r.election)&&['noam','otzma-yehudit','tkuma','taal'].includes(r.party))},null,2));
}
