import{deltaE2000,fromOklch,hexToOklch}from'./colour.ts';
import{idColour,COLOUR_RULES}from'./colourGuard.ts';
export interface PartyResearch {color:string;confidence:string;source:string}
export interface PartyAppearance {election:string;list:string;parties:string[]}
export interface PartyResearchIndex {aliases?:Record<string,string>;canonical:Record<string,PartyResearch>;byList:Record<string,Record<string,PartyResearch>>;appearances:PartyAppearance[]}
export interface CanonicalPartyColour {party:string;base:string;color:string;confidence:string;source:string;adjusted:boolean;against:string[]}
export const partyColourKey=(party:string,base:string)=>`${party}|${base.toLowerCase()}`;
export const MAX_PARTY_LIGHTNESS_SHIFT=.02;
/** One graph node per party/research base, not per list/ring. Genuine recorded changes get
 * their own version; a version's display fill is shared by every one of its appearances. */
export function canonicalPartyPalette(index:PartyResearchIndex){
 const nodes=new Map<string,CanonicalPartyColour>(),edges=new Map<string,{a:string;b:string;lists:string[]}>(),counts=new Map<string,number>();
 const base=(party:string,list?:string)=>list&&index.byList[list]?.[party]||index.canonical[party]||{color:idColour(party),confidence:'derived',source:'party id'};
 const add=(party:string,list?:string)=>{const r=base(party,list),key=partyColourKey(party,r.color);if(!nodes.has(key))nodes.set(key,{party,base:r.color,color:r.color,confidence:r.confidence,source:r.source,adjusted:false,against:[]});return key;};
 for(const party of Object.keys(index.canonical))add(party);
 for(const appearance of index.appearances){
  const keys=appearance.parties.map(p=>{counts.set(p,(counts.get(p)??0)+1);return add(p,appearance.list);});
  keys.forEach((a,i)=>keys.slice(i+1).forEach(b=>{const pair=[a,b].sort(),key=pair.join(' '),edge=edges.get(key)??{a:pair[0],b:pair[1],lists:[]};if(!edge.lists.includes(appearance.list))edge.lists.push(appearance.list);edges.set(key,edge);}));
 }
 const rank=(n:CanonicalPartyColour)=>({high:3,medium:2,low:1}[n.confidence]??0);
 const order=[...nodes].sort(([ak,a],[bk,b])=>rank(b)-rank(a)||(counts.get(b.party)??0)-(counts.get(a.party)??0)||a.party.localeCompare(b.party)||Number(a.base!==base(a.party).color)-Number(b.base!==base(b.party).color)||ak.localeCompare(bk));
 const placed=new Set<string>();
 for(const[key,node]of order){
  const neighbours=[...edges.values()].flatMap(e=>e.a===key&&placed.has(e.b)?[nodes.get(e.b)!]:e.b===key&&placed.has(e.a)?[nodes.get(e.a)!]:[]);
  node.against=neighbours.filter(n=>deltaE2000(node.base,n.color)<COLOUR_RULES.small).map(n=>n.party);
  if(node.against.length){
   // Reserve later siblings' research bases too, avoiding a cascade of otherwise unnecessary edits.
   const allNeighbours=[...edges.values()].flatMap(e=>e.a===key?[nodes.get(e.b)!]:e.b===key?[nodes.get(e.a)!]:[]);
   node.color=nearestPartyVariant(node.base,allNeighbours.map(n=>n.color));
   if(node.color===node.base)node.color=nearestPartyVariant(node.base,neighbours.map(n=>n.color));
   node.adjusted=node.color!==node.base;
  }
  placed.add(key);
 }
 const unresolved=[...edges.values()].flatMap(e=>{const a=nodes.get(e.a)!,b=nodes.get(e.b)!,distance=deltaE2000(a.color,b.color);return distance<COLOUR_RULES.small?[{a:e.a,b:e.b,deltaE:distance,lists:e.lists}]:[];});
 return{colours:Object.fromEntries(nodes),unresolved};
}
/** Preserve lightness. Minimise ΔE from the source over hue/chroma candidates at the source L;
 * only if none clears every neighbour, permit up to .02 OKLCH lightness movement. No ring input. */
export function nearestPartyVariant(seed:string,neighbours:readonly string[]):string{
 if(neighbours.every(c=>deltaE2000(seed,c)>=COLOUR_RULES.small))return seed;
 const[L,C,h]=hexToOklch(seed);
 for(const offsets of [[0],[-.01,.01],[-MAX_PARTY_LIGHTNESS_SHIFT,MAX_PARTY_LIGHTNESS_SHIFT]]){
  let best:string|undefined,cost=Infinity;const seen=new Set<string>();
  for(const dl of offsets)for(let dh=-180;dh<=180;dh++)for(const chroma of [C,...Array.from({length:41},(_,i)=>i/100)]){
   const c=fromOklch(L+dl,chroma,h+dh*Math.PI/180);if(seen.has(c))continue;seen.add(c);
   const d=deltaE2000(seed,c);if(d>=cost||neighbours.some(other=>deltaE2000(c,other)<COLOUR_RULES.small))continue;
   best=c;cost=d;
  }
  if(best)return best;
 }
 // The caller reports the global edge explicitly. It never repairs it differently in another election.
 return seed;
}
