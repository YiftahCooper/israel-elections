/** Seats a family won at one election, and the partners elected with it on its joint lists.
 *
 * Seats are exact: every elected member belongs to a known party (the seated candidates that the list's gazetted
 * seats reach, by the party each represented). Nothing is estimated and no rule of ours decides which partners are
 * shown: every partner on every joint list the family ran on that year is listed.
 *
 * The mixed-list vote policy (Show hatched / Count all / …) does not apply here: it exists because votes cannot be
 * split between a joint list's parties, while seats can. A personal copy's edits do apply: a disabled list is left out
 * and an added list counts whole for the family. */
import type {Family} from './model.ts';
import {historyElections,jointParts} from './runtime.ts';

export interface SeatPart {
 /** `unrecorded`: an elected member of a joint list whose party no source records (United Arab List, 1999, rank 3). */
 kind:'partner'|'unrecorded';
 seats:number; listId:string; partyId:string|null; nameHe:string; nameEn:string|null; color:string|null;
}
export interface FamilySeatRow {
 electionId:string;
 /** `unknown`: no published seats or no definition for this election; `none`: the family named no list. */
 status:'observed'|'unknown'|'none';
 own:number;
 /** The family's own seats by list, largest first (whole lists count whole; joint lists count its own members). */
 ownLists:{listId:string;seats:number;joint:boolean}[];
 /** Every partner, smallest first (see orderPartners). */
 partners:SeatPart[];
}

/** Smallest first, so the smallest partners sit right above the family's own seats and the biggest is on top.
 * Ties: by list id (election number and ballot letters, as published), then by party id; a party whose name no
 * source records comes after named parties with the same seats. Language-independent, so Hebrew and English agree. */
export function orderPartners<T extends Pick<SeatPart,'seats'|'listId'|'partyId'>>(parts:readonly T[]):T[] {
 const cmp=(a:string,b:string)=>a<b?-1:a>b?1:0;
 return [...parts].sort((a,b)=>a.seats-b.seats||cmp(a.listId,b.listId)||(a.partyId===null?1:0)-(b.partyId===null?1:0)||cmp(a.partyId??'',b.partyId??''));
}

export function familySeatRow(f:Family,electionId:string):FamilySeatRow {
 const e=historyElections.find(d=>d.id===electionId),row=f.elections.find(x=>x.electionId===electionId);
 const empty={electionId,own:0,ownLists:[],partners:[]};
 if(!e?.seats||!row)return {...empty,status:'unknown'};
 const seats=e.seats,known=new Set(e.lists.map(l=>l.id));
 const members=row.members.filter(m=>!f.disabled?.includes(m.listId)&&m.treatment!=='exclude');
 if(members.some(m=>m.treatment==='unresolved'&&!f.included?.includes(m.listId)))return {...empty,status:'unknown'};
 const added=(f.included??[]).filter(id=>id.startsWith(electionId.slice(1)+'-')&&known.has(id)&&!members.some(m=>m.listId===id));
 if(!members.length&&!added.length)return {...empty,status:'none'};
 const ownLists:FamilySeatRow['ownLists']=[],partners:SeatPart[]=[];
 for(const m of members){
  const n=seats[m.listId]??0;
  if(m.scope!=='mixed'&&!m.treatment.includes('mixed')){ownLists.push({listId:m.listId,seats:n,joint:false});continue;}
  const parts=jointParts(f,electionId,m.listId);let mine=0,named=0;
  for(const p of parts){named+=p.seats;if(p.own)mine+=p.seats;else if(p.seats>0)partners.push({kind:'partner',seats:p.seats,listId:m.listId,partyId:p.canon,nameHe:p.nameHe,nameEn:p.nameEn,color:p.color});}
  // Members elected on the list whose party no source records: shown, never assigned to anyone.
  if(n>named)partners.push({kind:'unrecorded',seats:n-named,listId:m.listId,partyId:null,nameHe:'',nameEn:null,color:null});
  ownLists.push({listId:m.listId,seats:mine,joint:true});
 }
 for(const id of added)ownLists.push({listId:id,seats:seats[id]??0,joint:false});
 ownLists.sort((a,b)=>b.seats-a.seats);
 return {electionId,status:'observed',own:ownLists.reduce((t,l)=>t+l.seats,0),ownLists,partners:orderPartners(partners)};
}

/** The seat figures an election's breakdown shows: the family's own seats and partners exactly as the seats chart draws
 * them, and the change in own seats since the election before. Votes follow the mixed-list policy; seats never do, so a
 * joint list's whole total is never reported as the family's. `change` is null when either election has no seat count. */
export function familySeatSummary(f:Family,electionId:string){
 const at=historyElections.findIndex(d=>d.id===electionId),row=familySeatRow(f,electionId),prev=at>0?familySeatRow(f,historyElections[at-1].id):null;
 const known=row.status==='observed';
 return {known,own:row.own,partners:row.partners.reduce((t,p)=>t+p.seats,0),change:known&&prev?.status==='observed'?row.own-prev.own:null};
}

/** Round axis top and ticks for the family's own seats: the smallest 1, 2, 5 × 10ⁿ step that needs at most five
 * steps, so the top is as close to the family's best result as a round number allows (48 → 50, 12 → 15). */
export function seatAxis(maxOwn:number):{top:number;ticks:number[]} {
 const max=Math.max(1,maxOwn),step=[1,2,5,10,20,50,100].find(s=>Math.ceil(max/s)<=5)!;
 const top=Math.ceil(max/step)*step;
 return {top,ticks:Array.from({length:top/step+1},(_,i)=>i*step)};
}

export interface SeatGeometry {
 /** plot height in px, from the baseline to the top of the chart */
 plot:number;
 /** fixed headroom above the own-seats axis top, in px */
 headroom:number;
 /** the band under the top edge that fades out, in px (less than headroom, so own seats never fade) */
 fade:number;
 /** the axis top in seats (seatAxis().top) */
 axisTop:number;
 /** the smallest visible slice a partner gets inside the fade band, in px */
 minSlice:number;
}
export interface BarLayout {
 /** px per seat */
 scale:number;
 own:number;
 /** One per partner (same order), px from the baseline. `cut`: drawn shorter than its seats (only inside the fade band). */
 parts:{y0:number;y1:number;cut:boolean}[];
 /** the bar passes the top of the chart: its partners fade out at the top */
 clipped:boolean;
 /** where the fade band starts, px from the baseline */
 fadeFrom:number;
}
/** Stacks own seats and partners at the true seat scale. When the stack passes the top of the chart:
 * - below the fade band, every segment is exactly its seats (never taller);
 * - inside the band, a partner may be cut short, and every partner keeps at least a small slice in the band's
 *   lower half (still at least half opaque), so its colour always shows. The biggest partner, on top, is cut. */
export function stackBar(own:number,partners:readonly number[],g:SeatGeometry):BarLayout {
 const scale=(g.plot-g.headroom)/g.axisTop,P=g.plot,Z=P-g.fade,k=partners.length;
 const ownTop=own*scale,total=ownTop+partners.reduce((t,n)=>t+n*scale,0);
 if(total<=P+1e-9){let y=ownTop;return {scale,own:ownTop,parts:partners.map(n=>{const y0=y;y+=n*scale;return {y0,y1:y,cut:false};}),clipped:false,fadeFrom:Z};}
 // Each later partner keeps a slice below the band's midpoint (still at least half opaque). A partner may only be cut
 // at its limit, which lies inside the band; the slices of all partners always fit in the band's lower half.
 const ceiling=P-g.fade/2,slice=Math.min(g.minSlice,g.fade/2/Math.max(1,k));
 let y=ownTop;
 const parts=partners.map((n,i)=>{
  const later=k-1-i,limit=later?ceiling-later*slice:P,y0=y,full=y0+n*scale,y1=Math.min(full,limit);
  y=y1;return {y0,y1,cut:y1<full-1e-9};
 });
 return {scale,own:ownTop,parts,clipped:true,fadeFrom:Z};
}
