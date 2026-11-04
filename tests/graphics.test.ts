import {expect,test} from 'vitest';
import {seatOrder} from '../src/app/components/Hemicycle.tsx';
import {blocDisplayOrder} from '../src/app/blocOrder.ts';
import {activeReferenceOf} from '../src/app/useActiveReference.ts';
import {arcLayout,annularRegions} from '../src/app/layout.ts';
import {changedSeatKeys} from '../src/app/graphics.ts';
import {allocationOf} from '../src/app/derive.ts';
import {graphicsCases,graphicScenario} from './graphics-cases.ts';
for(const c of [...Array.from({length:26},(_,i)=>({name:`k${i+1}`,n:i+1,actions:[]})),...graphicsCases]) {
  test(`${c.name}: fixed capacity and origin-aware changes`,()=>{
    const {s,r,base}=graphicScenario(c.n,c.actions);
    expect(r.seatsAllocated).toBe(120);
    expect(r.lists.reduce((n,l)=>n+l.seats,0)).toBe(120);
    expect(arcLayout(120).seats).toHaveLength(120);
    for (const mode of ['list','bloc','party'] as const) {
      const seats=seatOrder(s,r,mode);
      expect(seats).toHaveLength(120);
      if(mode==='list') seats.forEach(seat=>expect(seat.color).toBe(s.lists.find(l=>l.id===seat.listId)!.color));
    }
    const ordered=seatOrder(s,r,'list');
    const order=blocDisplayOrder(s), bands=ordered.map(st=>order.indexOf(st.bloc));
    expect(bands).toEqual([...bands].sort((a,b)=>a-b));
    const arc=arcLayout(120), regions=annularRegions(arc.seats,bands,arc.r);
    expect(regions.every(region=>!/[a-z]/.test(region.fill))).toBe(true); // no disk subpaths
    ordered.forEach((_,i)=>{
      const p=arc.seats[i], radius=Math.hypot(p.x,p.y);
      const region=regions.find(region=>region.band===bands[i])!;
      expect(region.rows.some(row=>row && radius>=row.inner && radius<=row.outer && p.a>=row.from && p.a<=row.to)).toBe(true);
    });
    const changes=changedSeatKeys(s,r,base,allocationOf(base));
    expect(changes.gained.size).toBe(changes.lost.size);
    if(c.name==='owner') {
      expect(r.lists.find(l=>l.id===s.lists.find(l=>l.shortEn==='Meretz')!.id)!.seats).toBe(4);
      expect(r.lists.find(l=>l.id===s.lists.find(l=>l.shortEn==='Balad')!.id)!.seats).toBe(5);
    }
    if(c.name==='one-seat') expect(r.lists.some(l=>l.seats===1)).toBe(true);
    if(c.name==='dominant') expect(r.lists.some(l=>l.seats>60)).toBe(true);
  });
}


test('one active reference policy and middle unassigned order preserve declared blocs',()=>{
  const {base}=graphicScenario(25,[]);
  expect(activeReferenceOf({markOfficial:true,reference:base})).toBeNull();
  expect(activeReferenceOf({markOfficial:false,reference:base})).toBe(base);
  for (let n=0;n<=5;n++) {
    const blocs=Array.from({length:n},(_,i)=>({id:String(i),nameHe:'',nameEn:'',color:'#888888'}));
    const order=blocDisplayOrder({blocs});
    expect(order.indexOf(null)).toBe(Math.floor(n/2));
    expect(order.filter(x=>x!==null)).toEqual(blocs.map(b=>b.id));
  }
});
