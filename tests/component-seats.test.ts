import { applyAction } from '../src/model/actions.ts';
import { allocationOf } from '../src/app/derive.ts';
import { expect, test } from 'vitest';
import { graphicScenario } from './graphics-cases.ts';
import { seatOrder } from '../src/app/components/Hemicycle.tsx';
test('counting component parties preserves list rings, grouped component seats and candidate rank', () => {
 const {s,r}=graphicScenario(26,[]);
 const l=s.lists.find(l=>l.shortEn==='The Democrats')!;
 s.factionSplits=[l.id];
 const seats=seatOrder(s,r,'list').filter(st=>st.listId===l.id);
 const meretz=l.parties!.find(p=>p.nameEn==='Meretz')!;
 expect(seats.filter(st=>st.innerColor===meretz.color)).toHaveLength(1);
 expect(seats.every(st=>st.color===l.color)).toBe(true);
 expect(seats.find(st=>st.innerColor===meretz.color)?.idx).toBe(5);
 expect(seatOrder(s,r,'list',false).every(st=>!st.innerColor)).toBe(true);
 s.factionSplits=[];
 expect(seatOrder(s,r,'list').every(st=>!st.innerColor)).toBe(true);
});

test('fully separate lists have plain seats even after component counting was on', () => {
 const {s}=graphicScenario(26,[]), l=s.lists.find(l=>l.shortEn==='The Democrats')!;
 s.factionSplits=[l.id];
 const split=applyAction(s,{type:'split',id:l.id,parts:l.parties!.map((p,i)=>({newId:`component-${i}`,nameHe:p.nameHe,letters:l.letters,color:p.color ?? l.color,votes:i===0?l.votes:0,candidateIds:l.candidates.filter(c=>c.partyId===p.id).map(c=>c.id)}))});
 expect(seatOrder(split,allocationOf(split),'list').every(st=>!st.innerColor)).toBe(true);
});
