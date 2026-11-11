import { applyAction } from '../src/model/actions.ts';
import { allocationOf } from '../src/app/derive.ts';
import { expect, test } from 'vitest';
import { graphicScenario } from './graphics-cases.ts';
import { partyDisplayColor } from '../src/app/partyDisplayColor.ts';
import { seatOrder } from '../src/app/components/Hemicycle.tsx';
test('counting component parties preserves list rings, grouped component seats and candidate rank', () => {
 const {s,r}=graphicScenario(26,[]);
 const l=s.lists.find(l=>l.shortEn==='The Democrats')!;
 s.factionSplits=[l.id];
 const seats=seatOrder(s,r,'list').filter(st=>st.listId===l.id);
 const meretz=l.parties!.find(p=>p.nameEn==='Meretz')!;
 expect(seats.filter(st=>st.innerColor===partyDisplayColor(l,meretz.id))).toHaveLength(1);
 expect(seats.every(st=>st.color===l.color)).toBe(true);
 expect(seats.every(st=>st.innerColor)).toBe(true);
 expect(seats.find(st=>st.innerColor===partyDisplayColor(l,meretz.id))?.idx).toBe(5);
 // list colour only: no party anywhere
 expect(seatOrder(s,r,'list','list').every(st=>!st.innerColor && !st.partyColor && (st.listId!==l.id || st.color===l.color))).toBe(true);
 // party colour only: the seat itself takes the party's colour, with no list ring
 const party=seatOrder(s,r,'list','party').filter(st=>st.listId===l.id);
 expect(party.every(st=>!st.innerColor && st.color===st.partyColor && st.color===partyDisplayColor(l,st.partyId!))).toBe(true);
 // in bloc colours the seat keeps its bloc colour
 expect(seatOrder(s,r,'bloc','party').filter(st=>st.listId===l.id).every(st=>st.color!==st.partyColor)).toBe(true);
 s.factionSplits=[];
 expect(seatOrder(s,r,'list').every(st=>!st.innerColor)).toBe(true);
});

test('fully separate lists have plain seats even after component counting was on', () => {
 const {s}=graphicScenario(26,[]), l=s.lists.find(l=>l.shortEn==='The Democrats')!;
 s.factionSplits=[l.id];
 const split=applyAction(s,{type:'split',id:l.id,parts:l.parties!.map((p,i)=>({newId:`component-${i}`,nameHe:p.nameHe,letters:l.letters,color:p.color ?? l.color,votes:i===0?l.votes:0,candidateIds:l.candidates.filter(c=>c.partyId===p.id).map(c=>c.id)}))});
 expect(seatOrder(split,allocationOf(split),'list').every(st=>!st.innerColor)).toBe(true);
});
