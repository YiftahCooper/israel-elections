import{contrastRatio,partySeparator}from'../src/data/colourGuard.ts';
import { expect, test } from 'vitest';
import { deltaE2000 } from '../src/data/colour.ts';
import { partyDisplayColor } from '../src/app/partyDisplayColor.ts';
import { seatOrder } from '../src/app/components/Hemicycle.tsx';
import { blocPieces, seatHolders } from '../src/app/derive.ts';
import { graphicScenario } from './graphics-cases.ts';

for (let n = 1; n <= 26; n++) test(`k${n}: every constituent has a deterministic, distinct display colour and dot`, () => {
  const { s, r } = graphicScenario(n, []);
  const original = JSON.stringify(s);
  const lists = s.lists.filter(l => (l.parties?.length ?? 0) > 1);
  for (const l of lists) {
    const colours = l.parties!.map(p => partyDisplayColor(l, p.id));
    l.parties!.forEach((p, i) => {
      const separator=partySeparator(colours[i],l.color);
      expect(contrastRatio(separator.inner,colours[i])).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(separator.outer??separator.inner,l.color)).toBeGreaterThanOrEqual(3);
      for (const sibling of colours.slice(i + 1)) expect(deltaE2000(colours[i], sibling), `${l.shortEn}: siblings`).toBeGreaterThanOrEqual(20);
      expect(partyDisplayColor({ ...l, parties: [...l.parties!].reverse() }, p.id)).toBe(colours[i]);
    });
  }
  expect(JSON.stringify(s)).toBe(original);
  s.factionSplits = lists.map(l => l.id);
  const seats = seatOrder(s, r, 'list');
  const holders = seatHolders(s, r), pieces = blocPieces(s, r);
  for (const st of seats) {
    const l = s.lists.find(l => l.id === st.listId)!;
    if (!st.partyId || (l.parties?.length ?? 0) < 2) continue;
    expect(st.innerColor).toBe(partyDisplayColor(l, st.partyId));
    expect(st.color).toBe(l.color);
    expect(holders.find(h => h.listId === l.id && h.partyId === st.partyId)?.color).toBe(st.innerColor);
    expect(pieces.find(p => p.listId === l.id && p.partyId === st.partyId)?.color).toBe(st.innerColor);
  }
});

test('ring edits preserve global fills without changing researched inputs',()=>{
 const {s}=graphicScenario(25,[]),l=s.lists.find(l=>l.parties?.some(p=>p.id==='otzma-yehudit'))!;
 const original=JSON.stringify(l),colors=l.parties!.map(p=>partyDisplayColor(l,p.id));
 expect(JSON.stringify(l)).toBe(original);
 for(const color of ['#ffffff','#000000','#ff0000'])expect(l.parties!.map(p=>partyDisplayColor({...l,color},p.id))).toEqual(colors);
});
