// Election-specific party logos: verified local files under a free licence or the owner's
// fair-use identification policy (decision 0089). Rights, source and credit travel with the image.
// Nothing is fetched at runtime and no logo is reused for another election.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset, LogoRef, LogoRights } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
interface Entry { letters?: string; party?: string; file: string | null; rights: LogoRights; bytes: number; sha256: string; inUseEvidence: string; inUseDate?: string; sourceUrl: string; licence: string; attribution: string; hosted: boolean; status?: string; displayBackground?: string }

export function applyLogos(ds: ElectionDataset): ElectionDataset {
  const file = join(ROOT, 'data', 'meta', 'logos', `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const entries = (JSON.parse(readFileSync(file, 'utf8')) as { logos: Entry[] }).logos
    .filter((e) => e.hosted && e.status === 'verified' && e.file);
  const ref = (e: Entry): LogoRef => {
    if (!['free-licence', 'fair-use-identification'].includes(e.rights) || !e.inUseEvidence || !e.sourceUrl || !e.attribution || !e.licence) throw new Error(`Invalid logo provenance: ${ds.id}`);
    if (e.rights === 'fair-use-identification' && (!e.inUseDate || !/^\d{4}-\d{2}-\d{2}$/.test(e.inUseDate) || e.inUseDate > ds.electionDate)) throw new Error(`Invalid campaign-use date: ${ds.id}`);
    if (!/^logos\/[^/]+\.(svg|png)$/.test(e.file!)) throw new Error(`Invalid logo path: ${e.file}`);
    if (!existsSync(join(ROOT, 'public', e.file!))) throw new Error(`data/meta/logos/${ds.id}.json: missing public/${e.file}`);
    const content = readFileSync(join(ROOT, 'public', e.file!));
    if (content.length !== e.bytes || createHash('sha256').update(content).digest('hex') !== e.sha256) throw new Error(`Logo integrity mismatch: ${e.file}`);
    return { rights: e.rights, file: e.file!, licence: e.licence, attribution: e.attribution, sourceUrl: e.sourceUrl, ...(e.displayBackground ? { background: e.displayBackground } : {}) };
  };
  const lists = ds.lists.map((l) => {
    const own = entries.find((e) => e.letters === l.letters);
    const parties = l.parties?.map((p) => { const e = entries.find((x) => x.party === p.id); return e ? { ...p, logo: ref(e) } : p; });
    return { ...l, ...(own ? { logo: ref(own) } : {}), ...(parties ? { parties } : {}) };
  });
  for (const e of entries) if (e.letters && !ds.lists.some((l) => l.letters === e.letters)) throw new Error(`data/meta/logos/${ds.id}.json: no list ${e.letters}`);
  for (const e of entries) if (e.party && !ds.lists.some((l) => l.parties?.some((p) => p.id === e.party))) throw new Error(`data/meta/logos/${ds.id}.json: no party ${e.party}`);
  return { ...ds, lists };
}
