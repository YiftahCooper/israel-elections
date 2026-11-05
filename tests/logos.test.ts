// Verified local election logos keep their rights basis, credit and source.
import { existsSync, readFileSync } from 'node:fs';
import { applyLogos } from '../scripts/lib/build/logos.ts';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset, LogoRef } from '../src/data/schema.ts';

const index = JSON.parse(readFileSync('public/data/elections.json', 'utf8')) as { id: string; available: boolean }[];
const logos: { id: string; who: string; logo: LogoRef }[] = [];
for (const e of index.filter((x) => x.available)) {
  const ds = JSON.parse(readFileSync(`public/data/${e.id}.json`, 'utf8')) as ElectionDataset;
  for (const l of ds.lists) {
    if (l.logo) logos.push({ id: e.id, who: l.letters, logo: l.logo });
    for (const p of l.parties ?? []) if (p.logo) logos.push({ id: e.id, who: p.id, logo: p.logo });
  }
}

describe('party logos', () => {
  it('are attached across elections', () => expect(logos.length).toBeGreaterThanOrEqual(40));
  it('point to a hosted file with a licence, a credit and a source page', () => {
    for (const { id, who, logo } of logos) {
      expect(existsSync(`public/${logo.file}`), `${id} ${who}`).toBe(true);
      expect(logo.licence.trim(), `${id} ${who}`).not.toBe('');
      expect(logo.attribution.trim(), `${id} ${who}`).not.toBe('');
      expect(logo.sourceUrl, `${id} ${who}`).toMatch(/^https:\/\//);
      expect(['free-licence', 'fair-use-identification']).toContain(logo.rights);
      expect(logo.sourceUrl).not.toMatch(/en\.wikipedia/);
    }
  });
  it('contain no script or external reference when they are SVG', () => {
    for (const { logo } of logos.filter((x) => x.logo.file.endsWith('.svg'))) {
      const svg = readFileSync(`public/${logo.file}`, 'utf8');
      expect(svg).not.toMatch(/<script|<foreignObject|\son[a-z]+=|href="(?!#)/i);
    }
  });
});

function dataset(n: number): ElectionDataset {
  return JSON.parse(readFileSync(new URL(`../public/data/k${n}.json`, import.meta.url), 'utf8'));
}

describe('election-specific logo overlays', () => {
  it('never borrows a whole-list or constituent logo from another election', () => {
    for (let n = 1; n <= 26; n++) {
      const ds = dataset(n);
      for (const l of ds.lists) {
        delete l.logo;
        for (const p of l.parties ?? []) delete p.logo;
      }
      const entries = JSON.parse(readFileSync(`data/meta/logos/k${n}.json`, 'utf8')).logos
        .filter((e: { hosted: boolean; status: string; file: string | null }) => e.hosted && e.status === 'verified' && e.file);
      const result = applyLogos(ds);
      for (const l of result.lists) {
        expect(l.logo?.file, `${ds.id}/${l.letters}`).toBe(entries.find((e: { letters?: string }) => e.letters === l.letters)?.file);
        for (const p of l.parties ?? []) {
          expect(p.logo?.file, `${ds.id}/${p.id}`).toBe(entries.find((e: { party?: string }) => e.party === p.id)?.file);
        }
      }
    }
  });
  it('attaches a fair-use whole-list emblem with its rights notice', () => {
    const ds = applyLogos(dataset(26));
    const logo = ds.lists.find((l) => l.letters === 'רק')!.logo!;
    expect(logo.rights).toBe('fair-use-identification');
    expect(logo.sourceUrl).toBe('https://be-yahad.org.il/');
    expect(logo.licence).toContain('Copyright retained');
  });
  it('keeps constituent emblems separate from joint-list emblems', () => {
    const ds = dataset(25);
    for (const list of ds.lists) {
      delete list.logo;
      for (const party of list.parties ?? []) delete party.logo;
    }
    const result = applyLogos(ds);
    const joint = result.lists.find((l) => l.letters === 'ט')!;
    expect(joint.logo).toBeUndefined();
    expect(joint.parties!.find((p) => p.id === 'tkuma')!.logo!.file).toBe('logos/religious-zionism-2022.png');
    expect(result.lists.find((l) => l.letters === 'כן')!.logo!.rights).toBe('free-licence');
  });
  it('rejects an unknown list and an unknown constituent', () => {
    const ds = dataset(26);
    ds.lists = ds.lists.filter((l) => l.letters !== 'רק');
    expect(() => applyLogos(ds)).toThrow('no list רק');
    const noParties = dataset(25);
    for (const list of noParties.lists) list.parties = [];
    expect(() => applyLogos(noParties)).toThrow('no party tkuma');
  });
});
