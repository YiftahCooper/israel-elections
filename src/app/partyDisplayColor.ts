import research from '../data/party-colour-research.json' with {type:'json'};
import {assignColour,colourPasses,contrastRatio,idColour,COLOUR_RULES} from '../data/colourGuard.ts';
import {deltaE2000} from '../data/colour.ts';
export {contrastRatio as colourContrast} from '../data/colourGuard.ts';
export const PARTY_DOT_CONTRAST=COLOUR_RULES.mark,PARTY_DOT_DELTA_E=COLOUR_RULES.small;
interface PartyList {id?:string;originIds?:readonly string[];color:string;parties?:readonly{id:string;color?:string;customColor?:boolean}[]}
interface Research {color:string;confidence:string;source:string}
const index=research as {canonical:Record<string,Research>;byList:Record<string,Record<string,Research>>};
export interface PartyColourDecision {base:string;color:string;forced:boolean;reasons:string[];confidence:string;source?:string;custom:boolean}
export function partyColourBase(list:PartyList,id:string):Research{
 const p=list.parties?.find(p=>p.id===id);
 if(p?.customColor&&p.color)return{color:p.color,confidence:'custom',source:'user'};
 const recorded=[list.id,...list.originIds??[]].filter((id):id is string=>!!id).map(id=>index.byList[id]?.[p?.id??'']).find(Boolean)??index.canonical[id];
 return recorded??{color:p?.color??idColour(id),confidence:p?.color?'supplied':'derived',source:p?.color?'scenario':'party id'};
}
const cache=new WeakMap<object,{signature:string;decisions:Map<string,PartyColourDecision>}>();
const priority=(list:PartyList,id:string)=>({custom:4,high:3,medium:2,low:1}[partyColourBase(list,id).confidence]??0);
export function partyDisplayDecision(list:PartyList,partyId:string):PartyColourDecision{
 const parties=[...list.parties??[]].sort((a,b)=>priority(list,b.id)-priority(list,a.id)||(a.id<b.id?-1:a.id>b.id?1:0));
 const signature=JSON.stringify([list.id,list.originIds,list.color,parties.map(p=>[p.id,p.color,p.customColor])]);
 let entry=cache.get(list);
 if(!entry||entry.signature!==signature){
  const decisions=new Map<string,PartyColourDecision>(),used:string[]=[];
  for(const p of parties){
   const base=partyColourBase(list,p.id),rules={minDeltaE:20,backgrounds:[list.color],minContrast:3,hueFirst:true};
   const color=p.customColor?base.color:assignColour([base.color],used,{...rules,variantOf:base.color});
   const reasons:string[]=[];
   if(contrastRatio(base.color,list.color)<3)reasons.push('ring contrast');
   if(deltaE2000(base.color,list.color)<20)reasons.push('ring separation');
   if(!colourPasses(base.color,used,{minDeltaE:20}))reasons.push('sibling separation');
   // Retain V1b's perceptual ring separation as well as its luminance contrast.
   let final=color;
   if(!p.customColor&&deltaE2000(color,list.color)<20)final=assignColour([base.color],used,{...rules,variantOf:base.color,allow:c=>deltaE2000(c,list.color)>=20});
   decisions.set(p.id,{base:base.color,color:final,forced:final!==base.color,reasons,confidence:base.confidence,source:base.source,custom:!!p.customColor});used.push(final);
  }
  entry={signature,decisions};cache.set(list,entry);
 }
 return entry.decisions.get(partyId)??partyDisplayDecision({...list,parties:[...list.parties??[],{id:partyId}]},partyId);
}
export const partyDisplayColor=(list:PartyList,id:string)=>partyDisplayDecision(list,id).color;
