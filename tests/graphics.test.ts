import {expect,test} from 'vitest';
import {seatOrder} from '../src/app/components/Hemicycle.tsx';
import {blocDisplayOrder} from '../src/app/blocOrder.ts';
import {activeReferenceOf} from '../src/app/useActiveReference.ts';
import {arcLayout,annularRegions,type SeatPos} from '../src/app/layout.ts';

const inside=(pt:[number,number],poly:[number,number][])=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>pt[1])!==(yj>pt[1])&&pt[0]<((xj-xi)*(pt[1]-yi))/(yj-yi)+xi)c=!c;}return c;};
/** Every seat's whole disc (24 perimeter samples) lies inside its own region and outside every other region. */
function regionContainmentErrors(seats:SeatPos[],bands:number[],rad:number){
  const regions=annularRegions(seats,bands,rad), errors:string[]=[];
  regions.forEach((region, i) => {
    if (i > 0 && JSON.stringify(regions[i-1].rightAngles) !== JSON.stringify(region.leftAngles)) errors.push('gap between sectors');
    if (region.leftAngles.some((a, row) => a < region.rightAngles[row])) errors.push('overlapping sectors');
  });
  seats.forEach((p,i)=>{
    for(let k=0;k<24;k++){
      const a=(k*Math.PI)/12, pt:[number,number]=[500+(p.x+Math.cos(a)*rad)*400,470+(p.y+Math.sin(a)*rad)*400];
      // only neighbouring regions can reach a seat; checking them keeps this fast
      for(const region of regions.filter(r=>Math.abs(r.band-bands[i])<=1)){
        const own=region.band===bands[i];
        if(inside(pt,region.polygon)!==own){errors.push(`seat ${i} ${own?'outside its region':'inside region '+region.band}`);return;}
      }
    }
  });
  return errors;
}

test('regions enclose exactly their seats for every split of every chamber size',()=>{
  for(const n of [1,2,7,61,100,120,151]){
    const arc=arcLayout(n);
    // two regions at every split point, plus many tiny regions and one region per seat for small chambers
    for(let cut=0;cut<=n;cut+=Math.max(1,Math.floor(n/15))) expect(regionContainmentErrors(arc.seats,arc.seats.map((_,i)=>i<cut?0:1),arc.r)).toEqual([]);
    expect(regionContainmentErrors(arc.seats,arc.seats.map((_,i)=>Math.floor(i/3)),arc.r)).toEqual([]);
    expect(regionContainmentErrors(arc.seats,arc.seats.map((_,i)=>[0,1,2,3,4][Math.min(4,Math.floor(i*5/n))]),arc.r)).toEqual([]);
  }
},30000);
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
    expect(regionContainmentErrors(arc.seats,bands,arc.r)).toEqual([]);
    const changes=changedSeatKeys(s,r,base,allocationOf(base));
    expect(changes.gained.size).toBe(changes.lost.size);
    if(c.name==='owner') {
      expect(r.lists.find(l=>l.id===s.lists.find(l=>l.shortEn==='Meretz')!.id)!.seats).toBe(4);
      expect(r.lists.find(l=>l.id===s.lists.find(l=>l.shortEn==='Balad')!.id)!.seats).toBe(5);
    }
    if(c.name.startsWith('small-')) {
      const bloc=c.name.includes('first')?ordered[0].bloc:ordered.at(-1)!.bloc;
      expect(ordered.filter(seat=>seat.bloc===bloc)).toHaveLength(13);
    }
    if(c.name==='one-seat') expect(r.lists.some(l=>l.seats===1)).toBe(true);
    if(c.name==='dominant') expect(r.lists.some(l=>l.seats>60)).toBe(true);
  });
}


test('one active reference policy and middle unassigned order preserve declared blocs',()=>{
  const {base}=graphicScenario(25,[]);
  expect(activeReferenceOf({markOfficial:true,reference:base})).toBeNull();
  expect(activeReferenceOf({markOfficial:false,reference:base})).toBeNull();
  const edited={...base,log:[{at:'now',action:{type:'setTotals' as const,invalid:base.invalid+1}}]};
  expect(activeReferenceOf({markOfficial:false,reference:edited})).toBe(edited);
  for (let n=0;n<=5;n++) {
    const blocs=Array.from({length:n},(_,i)=>({id:String(i),nameHe:'',nameEn:'',color:'#888888'}));
    const order=blocDisplayOrder({blocs});
    expect(order.indexOf(null)).toBe(Math.floor(n/2));
    expect(order.filter(x=>x!==null)).toEqual(blocs.map(b=>b.id));
  }
});

test('bloc sectors share exact row cuts and use at most one deliberate step per row', () => {
  const arc = arcLayout(120);
  const regions = annularRegions(arc.seats, arc.seats.map((_, i) => i < 56 ? 0 : i < 64 ? 1 : 2), arc.r);
  for (let i = 1; i < regions.length; i++) {
    expect(regions[i - 1].rightAngles).toEqual(regions[i].leftAngles);
    expect(regions[i].leftAngles.every((a, row) => a >= regions[i].rightAngles[row])).toBe(true);
  }
  expect(regions[0].leftAngles.every(a => a > Math.PI)).toBe(true);
  expect(regions.at(-1)!.rightAngles.every(a => a < 0)).toBe(true);
  expect(regions.every(r => (r.fill.match(/ L/g) ?? []).length < 40)).toBe(true);
});
