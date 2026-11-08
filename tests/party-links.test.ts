import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyPartyLinks, validatePartyLink, type PartyLinksOverlay } from '../scripts/lib/build/party-links.ts';
import type { ElectionDataset, PartyLink } from '../src/data/schema.ts';
import { ELECTION_IDS } from '../src/data/schema.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;
const link: PartyLink = { kind: 'partisan', url: 'https://example.org/', publisher: 'Party', sourceType: 'party-site', confidence: 'high' };
const overlay = (ds: ElectionDataset): PartyLinksOverlay => ({ electionId: ds.id, lists: { [ds.lists[0].id]: [link] }, parties: {} });
describe('election-specific party links', () => {
  it('accounts for every list and constituent in all 26 overlays, including gaps', () => {
    for (const id of ELECTION_IDS) {
      const ds = load(id);
      const meta = JSON.parse(readFileSync(`data/meta/party-links/${id}.json`, 'utf8'));
      expect(Object.keys(meta.lists).sort()).toEqual(ds.lists.map((l) => l.id).sort());
      expect(Object.keys(meta.parties).sort()).toEqual([...new Set(ds.lists.flatMap((l) => l.parties?.map((p) => p.id) ?? []))].sort());
      for (const [table, entities] of [[meta.lists, ds.lists], [meta.parties, ds.lists.flatMap((l) => l.parties ?? [])]] as const) {
        for (const e of entities) {
          expect(e.links ?? []).toEqual(table[e.id]);
          for (const kind of ['partisan', 'neutral']) if (!table[e.id].some((l: PartyLink) => l.kind === kind)) expect(meta.gaps[e.id][kind]).toBeTruthy();
          (e.links ?? []).forEach(validatePartyLink);
        }
      }
    }
    expect(load('k26').lists.some((l) => l.links?.some((x) => x.kind === 'partisan'))).toBe(true);
  });
  it('does not confuse historical lists with later parties sharing their name', () => {
    const yashar = load('k21').lists.find((l) => l.shortHe === 'ישר')!;
    expect(yashar.links?.some((e) => e.titleHe === 'ישר!')).toBe(false);
    for (const id of ['k6', 'k7']) {
      const maki = load(id).lists.find((l) => l.shortHe.replaceAll('״', '"') === 'מק"י')!;
      expect(maki.links?.some((e) => e.sourceType === 'hewiki' && e.titleHe === 'המפלגה הקומוניסטית הישראלית')).toBe(false);
    }
  });
  it('links the Degel HaTorah leaflet (ballot letters עץ) to its 1988 list, not the 1992 joint list', () => {
    const url = 'https://www.idi.org.il/media/6559/degel-hatora-13.doc';
    const at = ELECTION_IDS.flatMap((id) => load(id).lists.flatMap((l) => [l, ...(l.parties ?? [])])
      .filter((x) => x.links?.some((e) => e.url === url)).map((x) => x.id));
    expect(at).toEqual(['12-עץ']);
    expect(load('k12').lists.find((l) => l.id === '12-עץ')!.links![0]).toMatchObject({ kind: 'partisan', sourceType: 'platform', titleHe: 'דגל התורה — מצע 1988' });
  });
  it('rejects unknown list and party ids and wrong election', () => {
    const ds = load('k25');
    expect(() => applyPartyLinks(ds, { ...overlay(ds), lists: { unknown: [link] } })).toThrow(/unknown id/);
    expect(() => applyPartyLinks(ds, { ...overlay(ds), parties: { unknown: [link] } })).toThrow(/unknown id/);
    expect(() => applyPartyLinks(ds, { ...overlay(ds), electionId: 'k1' })).toThrow(/election mismatch/);
  });
  it.each(['http://example.org', 'javascript:alert(1)', 'https://en.wikipedia.org/wiki/X', 'https://en.m.wikipedia.org/wiki/X', 'https://web.archive.org/web/20200101/https://en.wikipedia.org/wiki/X'])('rejects forbidden URL %s', (url) => {
    expect(() => applyPartyLinks(load('k25'), { ...overlay(load('k25')), parties: {}, lists: { [load('k25').lists[0].id]: [{ ...link, url }] } })).toThrow();
  });
  it('rejects invalid provenance metadata', () => {
    for (const change of [{ kind: 'other' }, { sourceType: 'other' }, { confidence: 'low' }, { publisher: '' }, { archivedAt: 'yesterday' }, { sourceType: 'hewiki' }]) expect(() => validatePartyLink({ ...link, ...change })).toThrow();
  });
  it('copies both levels into independently editable scenarios and validates all elections', () => {
    for (const id of ELECTION_IDS) {
      const ds = load(id); const s = scenarioFromDataset(ds);
      expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
      for (const [i, l] of ds.lists.entries()) {
        expect(s.lists[i].links).toEqual(l.links);
        expect(s.lists[i].parties).toEqual(l.parties);
        if (l.links) expect(s.lists[i].links).not.toBe(l.links);
      }
    }
  });
  it('validates imported list and constituent URLs and metadata', () => {
    const ds = load('k25');
    for (const atParty of [false, true]) for (const change of [{ url: 'javascript:alert(1)' }, { url: 'https://en.wikipedia.org/wiki/X' }, { sourceType: 'other' }, { kind: 'other' }, { confidence: 'low' }]) {
      const s = scenarioFromDataset(ds);
      const l = s.lists.find((x) => x.parties?.length)!;
      (atParty ? l.parties![0] : l).links = [{ ...link, ...change } as PartyLink];
      expect(validateScenario(s).length).toBeGreaterThan(0);
    }
  });
});
