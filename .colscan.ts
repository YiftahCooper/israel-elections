import {readFileSync} from 'node:fs';
import {partyDisplayColor,partyColourBase} from './src/app/partyDisplayColor.ts';
import {deltaE2000,hexToLab} from './src/data/colour.ts';
const out:string[]=[];
for(let n=1;n<=26;n++){
 const ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')),meta=JSON.parse(readFileSync(`data/meta/k${n}.json`,'utf8'));
 const res=new Map<string,any>((meta.colours??[]).filter((c:any)=>c.letters).map((c:any)=>[c.letters,c]));
 for(const l of ds.lists){const seats=ds.officialSeats?.[l.id]??0;if(!seats)continue;
  const r=res.get(l.letters);const lead=l.candidates.find((c:any)=>c.rank===1)?.partyId;
  const leadCol=l.parties?.length&&lead?partyDisplayColor(l,lead):null;const leadBase=l.parties?.length&&lead?partyColourBase(l,lead):null;
  const d=(a:string|null|undefined,b:string|null|undefined)=>a&&b?deltaE2000(a,b).toFixed(0):'-';
  out.push([ds.id,l.letters,l.shortEn??l.shortHe,seats,'list',l.color,'res',r?`${r.color.toLowerCase()}/${r.confidence}`:'-','dRes',d(l.color,r?.color),'lead',lead??'-',leadCol??'-',leadBase?.confidence??'-','dLead',d(l.color,leadCol)].join(' '));
 }
}
console.log(out.join('\n'));
