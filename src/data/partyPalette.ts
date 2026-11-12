import{deltaE2000,fromOklch,hexToLab,hexToOklch,SEAT_LIGHTNESS}from'./colour.ts';
import{idColour,COLOUR_RULES}from'./colourGuard.ts';
export interface PartyResearch {color:string;confidence:string;source:string}
/** `seated`: seats won on this list by each party (in the default chamber they are drawn in the party's colour). */
export interface PartyAppearance {election:string;list:string;parties:string[];seated?:Record<string,number>}
export interface PartyResearchIndex {aliases?:Record<string,string>;canonical:Record<string,PartyResearch>;byList:Record<string,Record<string,PartyResearch>>;appearances:PartyAppearance[]}
/** `against`: siblings it was moved away from; `acrossLists`: parties of other lists in the same election. */
export interface CanonicalPartyColour {party:string;base:string;color:string;confidence:string;source:string;adjusted:boolean;against:string[];acrossLists?:string[]}
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
   // the smallest step decision 0087 §6 allows (smallPartyMove) before any other hue at the same lightness
   node.color=smallPartyMove(node.base,[],allNeighbours.map(n=>n.color))??nearestPartyVariant(node.base,allNeighbours.map(n=>n.color));
   if(node.color===node.base)node.color=smallPartyMove(node.base,[],neighbours.map(n=>n.color))??nearestPartyVariant(node.base,neighbours.map(n=>n.color));
   node.adjusted=node.color!==node.base;
  }
  placed.add(key);
 }
 // Across lists (decision 0087 §6, finding c-families-map-logos-09): in one election's chamber every two seats of
 // different lists differ by the identity step. A party's fill serves every election it ran in, a list's colour only
 // one, so a list drawn in its own colour moves away from other lists' parties (scripts/lib/build/meta.ts). Of two
 // parties on different lists, the one that won more seats (in any election) keeps its colour; the other takes the
 // smallest move that clears them and keeps its siblings apart (smallPartyMove), else the nearest colour that does.
 const seatedIn=index.appearances.flatMap(a=>Object.entries(a.seated??{}).map(([p,seats])=>({a,p,seats,key:partyColourKey(p,base(p,a.list).color)})));
 const most=new Map<string,number>();for(const s of seatedIn)most.set(s.key,Math.max(most.get(s.key)??0,s.seats));
 const across=new Map<string,{a:string;b:string;lists:string[]}>(),settled=new Set<string>();
 for(const key of [...most].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([k])=>k)){
  const node=nodes.get(key)!,others=new Map<string,string>();
  for(const m of seatedIn)if(m.key===key)for(const o of seatedIn)if(o.a.election===m.a.election&&o.a.list!==m.a.list&&settled.has(o.key)){
   const pair=[key,o.key].sort(),id=pair.join(' '),edge=across.get(id)??{a:pair[0],b:pair[1],lists:[]};
   for(const l of [m.a.list,o.a.list])if(!edge.lists.includes(l))edge.lists.push(l);across.set(id,edge);others.set(o.key,o.p);
  }
  const walls=[...others.keys()].map(k=>nodes.get(k)!.color),siblings=[...edges.values()].flatMap(e=>e.a===key?[nodes.get(e.b)!.color]:e.b===key?[nodes.get(e.a)!.color]:[]);
  const clash=[...others].filter(([k])=>deltaE2000(node.color,nodes.get(k)!.color)<COLOUR_RULES.identity).map(([,p])=>p);
  if(clash.length){
   node.color=smallPartyMove(node.color,walls,siblings)??nearestPartyVariant(node.color,[...walls.map(color=>({color,min:COLOUR_RULES.identity as number})),...siblings]);
   node.adjusted=node.color!==node.base;node.acrossLists=clash;
  }
  settled.add(key);
 }
 const unresolved=[...edges.values()].flatMap(e=>{const a=nodes.get(e.a)!,b=nodes.get(e.b)!,distance=deltaE2000(a.color,b.color);return distance<COLOUR_RULES.small?[{a:e.a,b:e.b,deltaE:distance,lists:e.lists}]:[];})
  .concat([...across.values()].flatMap(e=>{const distance=deltaE2000(nodes.get(e.a)!.color,nodes.get(e.b)!.color);return distance<COLOUR_RULES.identity?[{a:e.a,b:e.b,deltaE:distance,lists:e.lists}]:[];}));
 return{colours:Object.fromEntries(nodes),unresolved};
}
/** The smallest move decision 0087 §6 allows (lightness, chroma, hue at most 24°) that clears `others` by the identity
 * step and `siblings` by the small step: lightness within MAX_PARTY_LIGHTNESS_SHIFT where that works, else any readable
 * seat lightness (CIE L* 25–80); undefined when none does. */
export function smallPartyMove(seed:string,others:readonly string[],siblings:readonly string[]):string|undefined{
 const[L,C,h]=hexToOklch(seed);
 for(const reach of [MAX_PARTY_LIGHTNESS_SHIFT,.3]){
  let best:string|undefined,cost=Infinity;
  for(const dh of [0,6,-6,12,-12,18,-18,24,-24])for(const cf of [1,.6,.8,1.2,1.4])for(let dl=-reach;dl<=reach+1e-9;dl+=reach/30){
   const c=fromOklch(L+dl,Math.max(C,.02)*cf,h+dh*Math.PI/180),lab=hexToLab(c)[0];
   if(reach>MAX_PARTY_LIGHTNESS_SHIFT&&(lab<SEAT_LIGHTNESS[0]||lab>SEAT_LIGHTNESS[1]))continue;
   if(others.some(o=>deltaE2000(c,o)<COLOUR_RULES.identity)||siblings.some(o=>deltaE2000(c,o)<COLOUR_RULES.small))continue;
   const d=deltaE2000(seed,c)+Math.abs(dh)*.4;if(d<cost){cost=d;best=c;}
  }
  if(best)return best;
 }
 return undefined;
}
/** Preserve lightness. Minimise ΔE from the source over hue/chroma candidates at the source L;
 * only if none clears every neighbour, permit up to .02 OKLCH lightness movement. No ring input. */
export function nearestPartyVariant(seed:string,others:readonly(string|{color:string;min:number})[]):string{
 const neighbours=others.map(o=>typeof o==='string'?{color:o,min:COLOUR_RULES.small as number}:o);
 if(neighbours.every(o=>deltaE2000(seed,o.color)>=o.min))return seed;
 const[L,C,h]=hexToOklch(seed);
 for(const offsets of [[0],[-.01,.01],[-MAX_PARTY_LIGHTNESS_SHIFT,MAX_PARTY_LIGHTNESS_SHIFT]]){
  let best:string|undefined,cost=Infinity;const seen=new Set<string>();
  for(const dl of offsets)for(let dh=-180;dh<=180;dh++)for(const chroma of [C,...Array.from({length:41},(_,i)=>i/100)]){
   const c=fromOklch(L+dl,chroma,h+dh*Math.PI/180);if(seen.has(c))continue;seen.add(c);
   const d=deltaE2000(seed,c);if(d>=cost||neighbours.some(o=>deltaE2000(c,o.color)<o.min))continue;
   best=c;cost=d;
  }
  if(best)return best;
 }
 // The caller reports the global edge explicitly. It never repairs it differently in another election.
 return seed;
}
