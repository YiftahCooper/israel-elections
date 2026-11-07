// Enforces docs/source-policy.md on the research overlays: every recorded certainty must be derivable from the
// cited sources (src/data/evidence.ts), and every asserted claim must rest on at least one reliable source.
import { CERTAINTIES, EVIDENCE_TIERS, certaintyAllowed, certaintyCeiling, certaintyRank, independenceKey, isEnglishWikipedia, isHebrewWikipedia, type Certainty, type EvidenceSource } from '../../../src/data/evidence.ts';

type Obj = Record<string, any>;
const ASSERTED_RECOMMENDATION = new Set(['recommended', 'none', 'other', 'split']);
const UNKNOWN_RECOMMENDATION = new Set(['unknown', 'unconfirmed']);

export function citedSources(cites: unknown, sources: Record<string, EvidenceSource>) {
  return (Array.isArray(cites) ? cites : []).flatMap((c: Obj) => {
    const id = typeof c === 'string' ? c : c?.source;
    return typeof id === 'string' && sources[id] ? [{ id, source: sources[id] }] : [];
  });
}

/** The certainty a claim carries: its explicit value, else what its cites support; unknown statuses stay unknown. */
export function claimCertainty(claim: Obj, sources: Record<string, EvidenceSource>, inheritedCites?: unknown): Certainty {
  if (typeof claim.certainty === 'string') return claim.certainty as Certainty;
  if (typeof claim.status === 'string' && UNKNOWN_RECOMMENDATION.has(claim.status)) return 'unknown';
  return certaintyCeiling(citedSources(claim.cites ?? inheritedCites, sources));
}

export function validateEvidenceDocument(doc: Obj, label: string) {
  const sources: Record<string, EvidenceSource> = doc.sources && !Array.isArray(doc.sources) ? doc.sources : {};
  const fail = (msg: string) => { throw new Error(`${label}: ${msg}`); };
  for (const [id, s] of Object.entries(sources)) {
    if (isEnglishWikipedia(s.url)) fail(`source ${id}: English Wikipedia is never a source`);
    if (s.tier !== undefined) {
      if (!EVIDENCE_TIERS.includes(s.tier)) fail(`source ${id}: invalid tier ${s.tier}`);
      if (isHebrewWikipedia(s.url) && s.tier !== 'pointer') fail(`source ${id}: Hebrew Wikipedia is only a pointer`);
      if (s.tier === 'primary' && s.kind !== 'official' && !s.via) fail(`source ${id}: an explicit primary tier needs an official kind or a 'via' note naming the original record`);
    }
  }
  const visit = (v: unknown, path: string, inherited?: unknown) => {
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${path}[${i}]`, inherited)); return; }
    if (!v || typeof v !== 'object') return;
    const o = v as Obj;
    if (Array.isArray(o.cites)) for (const c of o.cites) {
      const id = typeof c === 'string' ? c : c?.source;
      if (typeof id === 'string' && !Object.hasOwn(sources, id)) fail(`${path}: unknown citation source ${id}`);
    }
    const cited = citedSources(o.cites ?? inherited, sources);
    const ceiling = certaintyCeiling(cited);
    if ('certainty' in o) {
      const recorded = o.certainty as Certainty;
      if (!CERTAINTIES.includes(recorded)) fail(`${path}: invalid certainty ${String(recorded)}`);
      if (!certaintyAllowed(recorded, ceiling)) fail(`${path}: certainty ${recorded} exceeds what its sources support (${ceiling})`);
      if (recorded === 'disputed' && new Set(cited.map(c => independenceKey(c.id, c.source))).size < 2) fail(`${path}: disputed needs the conflicting sources cited`);
      if (recorded !== 'unknown' && certaintyRank(recorded) < certaintyRank(ceiling) && !String(o.note ?? o.noteEn ?? '').trim()) fail(`${path}: certainty below its sources needs a note`);
    }
    if (/recommendationRounds\[\d+\]\.entries\[\d+\]$/.test(path) && ASSERTED_RECOMMENDATION.has(o.status) && ceiling === 'unknown' && o.certainty !== 'unknown')
      fail(`${path}: a ${o.status} recommendation needs at least one reliable source (pointers do not count)`);
    for (const [k, x] of Object.entries(o)) if (k !== 'sources' && k !== 'cites') visit(x, `${path}.${k}`, /recommendationRounds\[\d+\]$/.test(path) ? o.cites : undefined);
  };
  visit(doc, '$');
}
