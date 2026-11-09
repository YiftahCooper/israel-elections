// Reproducible app display-palette repair. Changes colour fields only, never research, votes or membership.
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{applyMeta}from'./lib/build/meta.ts';
import{nearestDistinctColour,separateBlocColours}from'../src/data/colourGuard.ts';
import{blocTints,noBlocTints,deltaE2000}from'../src/data/colour.ts';
import{BLOC_PALETTE}from'../src/model/blocColors.ts';
import{SCENARIO_PALETTE}from'../src/model/scenarioColors.ts';
import{FAMILY_COLOURS}from'../src/families/colors.ts';
const report:{context:string;id:string;old:string;new:string;reason:string}[]=[];
const write=process.argv.includes('--write');
for(const[context,seeds,path]of[['scenarios',[...SCENARIO_PALETTE],'src/model/scenarioColors.ts'],['families',Object.values(FAMILY_COLOURS),'src/families/colors.ts'],['bloc editor',[...BLOC_PALETTE],'src/model/blocColors.ts']]as const){
 const used:string[]=[];let text=readFileSync(path,'utf8');
 seeds.forEach((seed,i)=>{const c=nearestDistinctColour(seed,used,{minDeltaE:20,backgrounds:['#ffffff','#171b20','#f4f6f8','#1c2127'],minContrast:3,...(context==='bloc editor'?{allow:(c:string)=>blocTints(c).every((t,i)=>deltaE2000(t,noBlocTints()[i])>=8&&used.every(u=>deltaE2000(t,blocTints(u)[i])>=5))}:{})});used.push(c);if(c!==seed){report.push({context,id:context==='families'?Object.keys(FAMILY_COLOURS)[i]:String(i),old:seed,new:c,reason:'small-mark separation / light and dark mark contrast'});text=text.replaceAll(seed,c);}});
 if(write)writeFileSync(path,text);
}
for(let n=1;n<=26;n++){
 const path=`public/data/k${n}.json`,before=readFileSync(path,'utf8'),ds=JSON.parse(before),updated=applyMeta(ds);
 for(const l of ds.lists){const c=updated.lists.find(x=>x.id===l.id)!.color;if(c!==l.color){report.push({context:`k${n} list`,id:l.id,old:l.color,new:c,reason:'co-seated / neighbouring / locality-map leader separation'});l.color=c;}}
 for(const s of ds.blocSchemes??[])for(const b of s.blocs){const c=updated.blocSchemes!.find(x=>x.id===s.id)!.blocs.find(x=>x.id===b.id)!.color;if(c!==b.color){report.push({context:`k${n} bloc ${s.id}`,id:b.id,old:b.color,new:c,reason:'actual 14%/22% region tints including No bloc'});b.color=c;}}
 if(write&&JSON.stringify(ds)!==JSON.stringify(JSON.parse(before)))writeFileSync(path,JSON.stringify(ds)+'\n');
}
// Generated family groupings have two shapes: whole/other, or whole/mixed/other.
// The persisted preset-change evidence supplies the original family seed for a before/after comparison.
let previousFamilies:typeof report=[];try{previousFamilies=JSON.parse(readFileSync('docs/colour-reports/colour-preset-changes.json','utf8'));}catch{}
for(const[id,color]of Object.entries(FAMILY_COLOURS))for(const mixed of [false,true]){
 const oldFamily=previousFamilies.find(r=>r.context==='families'&&r.id===id)?.old??color;
 const ids=['selected',...(mixed?['mixed']:[]),'other'],seeds=[color,...(mixed?['#b8a78a']:[]),'#7d8791'],old=[oldFamily,...(mixed?['#b8a78a']:[]),'#7d8791'];
 const colors=separateBlocColours(seeds);
 colors.forEach((color,i)=>{if(color!==old[i])report.push({context:`family grouping ${id} ${mixed?'mixed':'whole'}`,id:ids[i],old:old[i],new:color,reason:'Generated bloc identity / actual region tint separation, including No bloc'});});
}
const recorded=new Map(previousFamilies.map(r=>[r.context+'|'+r.id,r.new]));
console.log(JSON.stringify(report.filter(r=>recorded.get(r.context+'|'+r.id)!==r.new),null,2));
if(write){mkdirSync('docs/colour-reports',{recursive:true});const path='docs/colour-reports/colour-preset-changes.json';let previous:typeof report=[];try{previous=JSON.parse(readFileSync(path,'utf8'));}catch{}const merged=new Map<string,typeof report[number]>();for(const r of [...previous,...report]){const k=r.context+'|'+r.id;merged.set(k,{...r,old:merged.get(k)?.old??r.old});}writeFileSync(path,JSON.stringify([...merged.values()].filter(r=>r.old!==r.new),null,2)+'\n');}
