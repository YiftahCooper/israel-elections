// Every election offered in the picker must load into a scenario that passes import validation
// (as a saved or exported scenario would) and allocates every seat.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];

describe('available datasets', () => {
  for (const { id } of index.filter((e) => e.available)) {
    it(`${id}: its historical scenario validates and fills every seat`, () => {
      const ds = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
      const s = scenarioFromDataset(ds);
      expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
      const r = allocate(toEngineInput(s));
      expect(s.rules.seats).toBe(120);
      expect(r.seatsAllocated).toBe(120);
      if(id==='k1') {
        // 1949 s.30(c)(3): the integer 3375 tie changes only the order of
        // seats 118/119. Do not invent a historical lottery result to erase it.
        const ties=r.remainderSteps.filter(step=>step.tie);
        expect(ties).toHaveLength(1);expect(ties[0].seatNumber).toBe(118);
        expect(r.warnings.map(w=>w.code)).toEqual(['lottery-required']);
        for(const winner of ties[0].tie!.tiedUnitIds) {
          const choice=allocate({...toEngineInput(s),lotteryWinners:{[ties[0].tie!.key]:winner}});
          expect(choice.warnings).toEqual([]);expect(choice.seatsAllocated).toBe(120);
          expect(Object.fromEntries(choice.lists.map(l=>[l.id,l.seats]))).toEqual(ds.officialSeats);
        }
        return;
      }
      expect(r.warnings.filter((w) => w.code === 'lottery-required')).toEqual([]);
    });
  }
});
