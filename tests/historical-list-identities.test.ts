import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';

it('all national list, candidate, seat and agreement keys follow corrected ballot letters', () => {
  for (const file of readdirSync('public/data').filter(f => /^k\d+\.json$/.test(f))) {
    const ds: ElectionDataset = JSON.parse(readFileSync(`public/data/${file}`, 'utf8'));
    const ids = new Set(ds.lists.map(l => l.id));
    expect(ids.size).toBe(ds.lists.length);
    for (const l of ds.lists) {
      expect(l.id).toBe(`${ds.knesset}-${l.letters}`);
      for (const c of l.candidates) expect(c.id).toBe(`${l.id}#${c.rank}`);
    }
    for (const id of Object.keys(ds.officialSeats ?? {})) expect(ids.has(id), id).toBe(true);
    for (const a of ds.agreements) for (const id of a.members) expect(ids.has(id), id).toBe(true);
  }
});
