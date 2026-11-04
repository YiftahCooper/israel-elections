import {expect,test} from 'vitest';
import {seatOrder} from '../src/app/components/Hemicycle.tsx';
import {arcLayout} from '../src/app/layout.ts';
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
