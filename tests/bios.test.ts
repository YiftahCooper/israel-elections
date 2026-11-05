// Candidate biography links (data/meta/bios): official Knesset pages, the party's own pages and Hebrew
// Wikipedia as a labelled secondary source. English Wikipedia is never linked (docs/DATA.md, source policy).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyBios } from '../scripts/lib/build/bios.ts';
import type { CandidateBio, ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];
const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
const all: { id: string; bio: CandidateBio }[] = [];
for (const e of index.filter((x) => x.available)) for (const l of load(e.id).lists) for (const c of l.candidates) if (c.bio) all.push({ id: c.id, bio: c.bio });

describe('candidate biography links', () => {
  it('are attached across the elections, every link https and none to English Wikipedia', () => {
    expect(all.length).toBeGreaterThan(1000);
    for (const { id, bio } of all) {
      const urls = [bio.knesset, bio.hewiki?.url, bio.party?.url].filter(Boolean) as string[];
      expect(urls.length, id).toBeGreaterThan(0);
      for (const u of urls) { expect(u, id).toMatch(/^https:\/\//); expect(u, id).not.toMatch(/en\.(m\.)?wikipedia\.org/); }
      if (bio.knesset) expect(bio.knesset, id).toMatch(/^https:\/\/main\.knesset\.gov\.il\//);
      if (bio.hewiki) expect(bio.hewiki.url, id).toMatch(/^https:\/\/he\.wikipedia\.org\/wiki\//);
    }
  });

  it('reach the scenario, which still validates', () => {
    const s = scenarioFromDataset(load('k25'));
    const leader = s.lists.flatMap((l) => l.candidates).find((c) => c.id === '25-מחל#1');
    expect(leader?.bio?.knesset).toMatch(/mk-personal-details\//);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });

  it('cannot carry a script link in an imported scenario', () => {
    const s = JSON.parse(JSON.stringify(scenarioFromDataset(load('k25'))));
    s.lists[0].candidates[0].bio = { knesset: 'javascript:alert(1)' };
    expect(validateScenario(s).length).toBeGreaterThan(0);
  });

  it('refuse a roster id that does not exist', () => {
    const ds = load('k25');
    const pruned = { ...ds, lists: ds.lists.map((l) => ({ ...l, candidates: l.candidates.filter((c) => c.id !== '25-מחל#1') })) };
    expect(() => applyBios(pruned)).toThrow(/not in the roster/);
  });
});

describe('official English names of Knesset members', () => {
  const names = JSON.parse(readFileSync('data/raw/bios/knesset-site-mk-names-en.json', 'utf8')) as { siteId: number; nameEn: string | null }[];
  it('come from the retained Knesset file, for certain identities only, never in Hebrew', () => {
    const bySite = new Map(names.map((x) => [x.siteId, x.nameEn]));
    let n = 0;
    for (const e of index.filter((x) => x.available)) {
      const meta = JSON.parse(readFileSync(`data/meta/bios/${e.id}.json`, 'utf8')).candidates as Record<string, { knesset?: { siteId?: number } | null; basis?: string }>;
      for (const l of load(e.id).lists) for (const c of l.candidates) {
        const m = meta[c.id];
        if (m?.basis?.startsWith('not elected; ')) expect(c.nameEn, c.id).toBeUndefined();
        if (!c.nameEn) continue;
        n++;
        expect(c.nameEn, c.id).toBe(bySite.get(m!.knesset!.siteId!));
        expect(c.nameEn, c.id).not.toMatch(/[֐-׿]/);
      }
    }
    expect(n).toBeGreaterThan(3000);
    const s = scenarioFromDataset(load('k25'));
    expect(s.lists.flatMap((l) => l.candidates).find((c) => c.id === '25-מחל#1')?.nameEn).toBe('Benjamin Netanyahu');
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });
});
