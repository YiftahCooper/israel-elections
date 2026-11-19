// Faults found by the 19 Nov review of the top bar, Overview, editing, Compare and History (lane FV1).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, blocPieces } from '../src/app/derive.ts';

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;

describe('bloc bar pieces', () => {
  it('a joint list\'s parties sit together in the bar, as on the seat chart (1977, 1996, April 2019)', () => {
    for (const id of ['k9', 'k14', 'k21']) {
      const s = scenarioFromDataset(load(id)), pieces = blocPieces(s, allocationOf(s));
      const keys = pieces.map((p) => `${p.listId}|${p.bloc}|${p.partyId}`);
      expect(new Set(keys).size, id).toBe(keys.length);
      expect(pieces.reduce((t, p) => t + p.n, 0)).toBe(120);
    }
  });
});
