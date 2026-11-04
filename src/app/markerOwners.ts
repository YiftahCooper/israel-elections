/** Deduplicate shared marker outlets (header/Start from/field) without hiding changes.
 * Named part headers and explicit part outlets win; item fields win over summary outlets.
 * Equal-priority outlets resolve in document order. */
type Outlet={id:string;node:HTMLElement;priority:number};
const outlets=new Map<string,Map<string,Outlet>>(),listeners=new Set<()=>void>();
const emit=()=>{for(const f of listeners)f();};
export const subscribeMarkers=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};};
export function markerOwner(key:string){
 const nodes=[...outlets.get(key)?.values()??[]].filter(x=>x.node.isConnected&&x.node.getClientRects().length>0);
 nodes.sort((a,b)=>a.priority-b.priority||(a.node.compareDocumentPosition(b.node)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1));
 return nodes[0]?.id??'';
}
let watching=false;
export function registerMarker(key:string,outlet:Outlet){
 if(!watching){document.addEventListener('toggle',emit,true);window.addEventListener('resize',emit);watching=true;}
 if(!outlets.has(key))outlets.set(key,new Map());outlets.get(key)!.set(outlet.id,outlet);emit();
 return()=>{outlets.get(key)?.delete(outlet.id);if(!outlets.get(key)?.size)outlets.delete(key);emit();};
}
