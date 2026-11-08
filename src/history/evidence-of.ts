// How a lineage source counts as evidence (docs/source-policy.md); shared by the reader and the data validator.
import type { EvidenceSource } from '../data/evidence.ts';

export type RawSource = { url?: string; publisher?: string; kind?: string; locator?: string; support?: string; tier?: string; evidenceFamily?: string };

/** Internal research compilations (no URL) are pointers, never evidence; a repository dataset is the primary record. */
export function evidenceOf(s: RawSource | undefined): EvidenceSource {
  if (!s) return { tier: 'pointer' };
  if (s.kind === 'repository-dataset') return { kind: s.kind };
  if (!s.url) return { tier: 'pointer' };
  return { url: s.url, kind: s.kind === 'secondary' ? undefined : s.kind, publisher: s.publisher, ...(s.tier ? { tier: s.tier as EvidenceSource['tier'] } : {}), ...(s.evidenceFamily ? { evidenceFamily: s.evidenceFamily } : {}) };
}
