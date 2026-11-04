// Party logos (data/meta/logos): only verified, locally hosted, freely licensed files are shown, each
// with the credit its licence requires.
import { existsSync, readFileSync } from 'node:fs';
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
      expect(logo.sourceUrl, `${id} ${who}`).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
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
