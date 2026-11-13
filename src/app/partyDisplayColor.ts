import research from '../data/party-colour-research.json' with {type:'json'};
import{idColour}from'../data/colourGuard.ts';
import{partyColourKey,type PartyResearch,type PartyResearchIndex,type canonicalPartyPalette}from'../data/partyPalette.ts';
export{contrastRatio as colourContrast}from'../data/colourGuard.ts';
export const PARTY_DOT_DELTA_E=20;
interface PartyList {id?:string;originIds?:readonly string[];color:string;parties?:readonly{id:string;color?:string;customColor?:boolean}[]}
const index=research as PartyResearchIndex&{display:ReturnType<typeof canonicalPartyPalette>};
export const canonicalPartyId=(id:string)=>index.aliases?.[id]??id;
export const partyColourUnresolved=index.display.unresolved;
export interface PartyColourDecision {base:string;color:string;forced:boolean;reasons:string[];confidence:string;source?:string;custom:boolean;recordedVariation:boolean}
export function partyColourBase(list:PartyList,id:string):PartyResearch{
 const p=list.parties?.find(p=>p.id===id);
 if(p?.customColor&&p.color)return{color:p.color,confidence:'custom',source:'user'};
 const canonical=canonicalPartyId(id);
 const recorded=[list.id,...list.originIds??[]].filter((x):x is string=>!!x).map(lid=>index.byList[lid]?.[canonical]).find(Boolean)??index.canonical[canonical];
 return recorded??{color:p?.color??idColour(canonical),confidence:p?.color?'supplied':'derived',source:p?.color?'scenario':'party id'};
}
/** Ring edits cannot affect a fill. Global sibling decisions are compiled once from all elections;
 * the only historical variants are explicitly recorded source colours. Custom choices stay exact. */
export function partyDisplayDecision(list:PartyList,partyId:string):PartyColourDecision{
 const id=canonicalPartyId(partyId),base=partyColourBase(list,partyId),custom=base.confidence==='custom',display=index.display.colours[partyColourKey(id,base.color)];
 const color=custom?base.color:display?.color??base.color;
 const recordedVariation=!custom&&!!index.canonical[id]&&base.color!==index.canonical[id].color;
 const reasons:string[]=[];
 if(color!==base.color&&display?.against.length)reasons.push(`global sibling separation: ${display.against.join(', ')}`);
 if(color!==base.color&&display?.acrossLists?.length)reasons.push(`separation from other lists' seats in the same election: ${display.acrossLists.join(', ')}`);
 if(recordedVariation)reasons.push(`recorded research differs this election (${base.source}): ${index.canonical[id].color} → ${base.color}`);
 return{base:base.color,color,forced:color!==base.color,reasons,confidence:base.confidence,source:base.source,custom,recordedVariation};
}
export const partyDisplayColor=(list:PartyList,id:string)=>partyDisplayDecision(list,id).color;
