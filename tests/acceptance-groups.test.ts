import { expect, it } from 'vitest';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, blocPieces, coalitionPieces, officialSeatsFor } from '../src/app/derive.ts';
import { seatMoves } from '../src/app/components/ChangeSummary.tsx';
import { loadDataset } from './helpers.ts';
it('E2 coalition pieces conserve every seat, including candidate-level overrides', () => {
  const base=scenarioFromDataset(loadDataset('k25'));
  const l=base.lists.find(l=>l.parties?.some(p=>p.id==='new-hope'))!;
  const target=base.blocs.find(b=>b.id!==l.bloc)!.id;
  let s=applyAction(base,{type:'setPartyBloc',partyId:'new-hope',bloc:target});
  const c=l.candidates.find(c=>c.partyId==='new-hope')!;
  s={...s,candidateBlocs:{[c.id]:l.bloc}};
  const r=allocationOf(s), units=coalitionPieces(s,r);
  expect(units.reduce((n,p)=>n+p.n,0)).toBe(120);
  for(const b of s.blocs) expect(units.filter(p=>p.bloc===b.id).reduce((n,p)=>n+p.n,0)).toBe(blocPieces(s,r).filter(p=>p.bloc===b.id).reduce((n,p)=>n+p.n,0));
});
it('E3 split baseline and summary use one origin-connected group', () => {
  const base=scenarioFromDataset(loadDataset('k25')), l=base.lists.find(l=>l.id==='25-ג')!;
  const s=applyAction(base,{type:'split',id:l.id,parts:[{newId:'a',nameHe:'a',letters:'a',color:'#000000',votes:l.votes,candidateIds:l.candidates.map(c=>c.id)},{newId:'b',nameHe:'b',letters:'b',color:'#000000',votes:0,candidateIds:[]}]});
  const r=allocationOf(s), br=allocationOf(base);
  expect(officialSeatsFor('a',s,r,base,br)).toBeNull();
  expect(officialSeatsFor('b',s,r,base,br)).toBeNull();
  expect(seatMoves(s,r,base,br).filter(m=>m.label('en').includes('a + b'))).toHaveLength(0); // no net change for this group
  expect(seatMoves(s,r,base,br).reduce((n,m)=>n+m.d,0)).toBe(0);
});
