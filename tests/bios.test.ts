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

  it('link a party page live, or through an exact Wayback capture of the page the party published', () => {
    type Party = { url: string; original: string; archivedAt: string | null; kind: string };
    let archived = 0;
    for (const e of index.filter((x) => x.available)) {
      const meta = JSON.parse(readFileSync(`data/meta/bios/${e.id}.json`, 'utf8')).candidates as Record<string, { party: Party | null }>;
      for (const [id, { party }] of Object.entries(meta)) {
        if (!party) continue;
        if (party.kind !== 'archive') { expect(party.url, id).toBe(party.original); expect(party.archivedAt, id).toBeNull(); continue; }
        const m = party.url.match(/^https:\/\/web\.archive\.org\/web\/(\d{14})\/(.+)$/);
        expect(m?.[2], id).toBe(party.original);
        expect(party.archivedAt, id).toBe(`${m![1].slice(0, 4)}-${m![1].slice(4, 6)}-${m![1].slice(6, 8)}`);
        archived++;
      }
    }
    expect(archived).toBeGreaterThan(0);
    // Yisrael Beytenu 2026, ranks 8–20: the live pages redirect to the party homepage (8 Nov 2026), so each is
    // linked through its capture of 26 October 2026, which shows that candidate at that rank.
    const k26 = JSON.parse(readFileSync('data/meta/bios/k26.json', 'utf8')).candidates as Record<string, { party: Party | null }>;
    for (let n = 8; n <= 20; n++) {
      const p = k26[`26-ל#${n}`].party!;
      expect(p.kind, `26-ל#${n}`).toBe('archive');
      expect(p.url).toBe(`https://web.archive.org/web/${p.url.split('/')[4]}/${p.original}`);
      expect(p.archivedAt).toBe('2026-10-26');
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
      const meta = JSON.parse(readFileSync(`data/meta/bios/${e.id}.json`, 'utf8')).candidates as Record<string, { knesset?: { siteId?: number } | null; basis?: string; displayNameEn?: string; displayNameEnNote?: string }>;
      for (const l of load(e.id).lists) for (const c of l.candidates) {
        const m = meta[c.id];
        if (m?.basis?.startsWith('not elected; ')) expect(c.nameEn, c.id).toBeUndefined();
        if (!c.nameEn) continue;
        n++;
        const sourceName = bySite.get(m!.knesset!.siteId!);
        // display form: backticks become apostrophes and repeated whitespace collapses; spelling is never changed.
        const normalized = sourceName?.replaceAll('`', "'").replace(/\s+/g, ' ').trim();
        const reviewed: Record<string, [string, string]> = {'12-ג#1': ['Moshe Zeev Feldman', 'Moseh  Zeev Feldman'], '12-מחל#41': ['Yehoshua Sagi', 'Yeushua Sagi']};
        if (m?.displayNameEn) {
          expect(m.displayNameEn, c.id).toBe(reviewed[c.id]?.[0]);
          expect(bySite.get(m.knesset!.siteId!), c.id).toBe(reviewed[c.id]?.[1]);
          expect(m.displayNameEnNote).toContain('YP 3588/3591');
        }
        expect(c.nameEn, c.id).toBe(m?.displayNameEn ?? normalized);
        expect(c.nameEn, c.id).not.toMatch(/[֐-׿]/);
      }
    }
    expect(n).toBeGreaterThan(3000);
    const s = scenarioFromDataset(load('k25'));
    expect(s.lists.flatMap((l) => l.candidates).find((c) => c.id === '25-מחל#1')?.nameEn).toBe('Benjamin Netanyahu');
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });
});
