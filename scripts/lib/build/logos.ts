// Election-specific party logos (data/meta/logos/kNN.json): only verified, locally hosted, freely
// licensed files are attached, with their licence and attribution (which must travel with the image).
// Nothing is fetched at runtime and no logo is reused for another election.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset, LogoRef } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
interface Entry { letters?: string; party?: string; file: string | null; sourceUrl: string; licence: string; attribution: string; hosted: boolean; status?: string; displayBackground?: string }

export function applyLogos(ds: ElectionDataset): ElectionDataset {
  const file = join(ROOT, 'data', 'meta', 'logos', `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const entries = (JSON.parse(readFileSync(file, 'utf8')) as { logos: Entry[] }).logos
    .filter((e) => e.hosted && e.status === 'verified' && e.file);
  const ref = (e: Entry): LogoRef => {
    if (!existsSync(join(ROOT, 'public', e.file!))) throw new Error(`data/meta/logos/${ds.id}.json: missing public/${e.file}`);
    return { file: e.file!, licence: e.licence, attribution: e.attribution, sourceUrl: e.sourceUrl, ...(e.displayBackground ? { background: e.displayBackground } : {}) };
  };
  const lists = ds.lists.map((l) => {
    const own = entries.find((e) => e.letters === l.letters);
    const parties = l.parties?.map((p) => { const e = entries.find((x) => x.party === p.id); return e ? { ...p, logo: ref(e) } : p; });
    return { ...l, ...(own ? { logo: ref(own) } : {}), ...(parties ? { parties } : {}) };
  });
  for (const e of entries) if (e.letters && !ds.lists.some((l) => l.letters === e.letters)) throw new Error(`data/meta/logos/${ds.id}.json: no list ${e.letters}`);
  return { ...ds, lists };
}
