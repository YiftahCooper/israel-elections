import { expect, test } from 'vitest';
import { deltaE2000 } from '../src/data/colour.ts';
import { partyDisplayColor, colourContrast } from '../src/app/partyDisplayColor.ts';
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
      expect(colourContrast(colours[i], l.color), `${l.shortEn}: ${p.nameEn} / ring`).toBeGreaterThanOrEqual(3);
      expect(deltaE2000(colours[i], l.color)).toBeGreaterThanOrEqual(20);
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

test('appearance changes recompute colours without changing researched inputs', () => {
 const {s}=graphicScenario(25,[]), l=s.lists.find(l=>l.shortEn==='Religious Zionism')!;
 const p=l.parties![0], before=JSON.stringify(l);
 partyDisplayColor(l,p.id);
 expect(JSON.stringify(l)).toBe(before);
 const custom={...l,color:'#ffffff',parties:l.parties!.map(p=>({...p,color:'#ffffff'}))};
 const colours=custom.parties.map(p=>partyDisplayColor(custom,p.id));
 expect(colours.every(c=>colourContrast(c,custom.color)>=3)).toBe(true);
 colours.forEach((a,i)=>colours.slice(i+1).forEach(b=>expect(deltaE2000(a,b)).toBeGreaterThanOrEqual(20)));
});
