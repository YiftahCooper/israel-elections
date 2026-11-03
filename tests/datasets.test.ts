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
      expect(r.warnings.filter((w) => w.code === 'lottery-required')).toEqual([]);
    });
  }
});
