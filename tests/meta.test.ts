// The party/bloc/colour research (data/meta) as merged into the published datasets (decision 0087).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];
const datasets = index.filter((e) => e.available).map((e) => JSON.parse(readFileSync(`public/data/${e.id}.json`, 'utf8')) as ElectionDataset);

describe('merged party and bloc research', () => {
  it('gives every election at least one sourced bloc scheme, and a default that exists', () => {
    for (const ds of datasets) {
      expect(ds.blocSchemes?.length, ds.id).toBeGreaterThan(0);
      expect(ds.blocSchemes!.some((s) => s.id === ds.defaultBlocScheme), ds.id).toBe(true);
    }
  });
  it('only refers to lists, parties and candidates that exist', () => {
    for (const ds of datasets) {
      const lists = new Set(ds.lists.map((l) => l.id));
      const parties = new Set(ds.lists.flatMap((l) => l.parties?.map((p) => p.id) ?? []));
      const cands = new Set(ds.lists.flatMap((l) => l.candidates.map((c) => c.id)));
      for (const s of ds.blocSchemes!) for (const b of s.blocs) {
        for (const l of b.lists) expect(lists.has(l), `${ds.id} ${s.id} ${l}`).toBe(true);
        for (const p of b.parties) expect(parties.has(p), `${ds.id} ${s.id} ${p}`).toBe(true);
        for (const c of b.candidates) expect(cands.has(c), `${ds.id} ${s.id} ${c}`).toBe(true);
      }
      for (const l of ds.lists) for (const c of l.candidates)
        if (c.partyId) expect(l.parties?.some((p) => p.id === c.partyId), `${ds.id} ${c.id}`).toBe(true);
    }
  });
  it('assigns no list to two blocs of the same scheme', () => {
    for (const ds of datasets) for (const s of ds.blocSchemes!) {
      const seen = s.blocs.flatMap((b) => b.lists);
      expect(new Set(seen).size, `${ds.id} ${s.id}`).toBe(seen.length);
    }
  });
  it('keeps the party of joint-list members where the research names it (2022: Gantz and Sa’ar)', () => {
    const k25 = datasets.find((d) => d.id === 'k25')!;
    const unity = k25.lists.find((l) => l.parties?.some((p) => p.id === 'new-hope'))!;
    expect(unity.parties!.map((p) => p.id)).toEqual(expect.arrayContaining(['new-hope']));
    expect(unity.candidates.filter((c) => c.partyId === 'new-hope').length).toBeGreaterThan(0);
  });
});
