import{readFileSync}from'node:fs';
import{expect,test}from'vitest';
import{partyDisplayColor}from'../src/app/partyDisplayColor.ts';
import{deltaE2000}from'../src/data/colour.ts';
import{COLOUR_RULES}from'../src/data/colourGuard.ts';
import type{ElectionDataset}from'../src/data/schema.ts';
// Decision 0087 §6 in the default chamber (joint lists split by party): every two seats of different lists are told
// apart by colour, whether a seat is drawn in its list's colour or in its party's (finding c-families-map-logos-09).
type List=ElectionDataset['lists'][number];
function chamberColours(ds:ElectionDataset){
 return ds.lists.flatMap((l:List)=>{
  const elected=l.candidates.filter(c=>!c.notSeated).slice(0,ds.officialSeats?.[l.id]??0),joint=(l.parties?.length??0)>1;
  return[...new Set(elected.map(c=>joint&&c.partyId&&l.parties!.some(p=>p.id===c.partyId)?partyDisplayColor(l,c.partyId):l.color))].map(color=>({list:l.id,color}));
 });
}
for(let n=1;n<=26;n++)test(`k${n}: seats of different lists differ by at least ${COLOUR_RULES.identity}`,()=>{
 const ds=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8')) as ElectionDataset,seats=chamberColours(ds),close:string[]=[];
 seats.forEach((a,i)=>seats.slice(i+1).forEach(b=>{if(a.list!==b.list&&deltaE2000(a.color,b.color)<COLOUR_RULES.identity)close.push(`${a.list} ${a.color} ~ ${b.list} ${b.color}: ${deltaE2000(a.color,b.color).toFixed(1)}`);}));
 expect(close).toEqual([]);
});
