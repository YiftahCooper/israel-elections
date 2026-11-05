// Election-specific party logos: verified local files under a free licence or the owner's
// fair-use identification policy (decision 0089). Rights, source and credit travel with the image.
// Nothing is fetched at runtime. Only this election’s evidenced catalogue is applied.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset, LogoRef, LogoRights } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
export interface CampaignDate { inUseDate?: string; dateBasis?: string; dateEvidence?: { yearSource?: string; yearEvidence?: string; campaignIdentity?: string; campaignEvidence?: string } }
interface Entry extends CampaignDate { letters?: string; party?: string; evidenceId: string; file: string | null; rights: LogoRights; bytes: number; sha256: string; inUseEvidence: string; inUseDate?: string; sourceUrl: string; licence: string; attribution: string; hosted: boolean; status?: string; displayBackground?: string }

// Year precision never implies a printing day or a pre-election archive capture.
export function validCampaignDate(e: CampaignDate, electionDate: string, elections: {date: string}[]): boolean {
  const value = e.inUseDate ?? '';
  if (e.dateBasis === 'year-single-election') {
    const p = e.dateEvidence;
    return /^\d{4}$/.test(value) && value === electionDate.slice(0, 4)
      && elections.filter(x => x.date.slice(0, 4) === value).length === 1
      && !!p && ['printed-year', 'exact-catalogue-year'].includes(p.yearSource ?? '')
      && !!p.yearEvidence?.trim()
      && ['exact-list-name', 'ballot-letter', 'explicit-election'].includes(p.campaignIdentity ?? '')
      && !!p.campaignEvidence?.trim();
  }
  return e.dateBasis === undefined && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value && value <= electionDate;
}

export function applyLogos(ds: ElectionDataset): ElectionDataset {
  const file = join(ROOT, 'data', 'meta', 'logos', `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const elections = JSON.parse(readFileSync(join(ROOT, 'public/data/elections.json'), 'utf8')) as {id: string; date: string}[];
  const sources = JSON.parse(readFileSync(join(ROOT, 'data/meta/logos/sources.json'), 'utf8')) as { sources: (CampaignDate & {id: string; sourceType: string})[] };
  const entries = (JSON.parse(readFileSync(file, 'utf8')) as { logos: Entry[] }).logos
    .filter((e) => e.hosted && e.status === 'verified' && e.file);
  const ref = (e: Entry): LogoRef => {
    if (!['free-licence', 'fair-use-identification'].includes(e.rights) || !e.inUseEvidence || !e.sourceUrl || !e.attribution || !e.licence) throw new Error(`Invalid logo provenance: ${ds.id}`);
    if (e.rights === 'fair-use-identification' && !validCampaignDate(e, ds.electionDate, elections)) throw new Error(`Invalid campaign-use date: ${ds.id}`);
    if (e.dateBasis === 'year-single-election') {
      const source = sources.sources.find(s => s.id === e.evidenceId);
      if (source?.sourceType !== 'official party campaign publication' || source.dateBasis !== e.dateBasis || (['yearSource', 'yearEvidence', 'campaignIdentity', 'campaignEvidence'] as const).some(key => source.dateEvidence?.[key] !== e.dateEvidence?.[key])) throw new Error(`Invalid year evidence source: ${ds.id}`);
    }
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
