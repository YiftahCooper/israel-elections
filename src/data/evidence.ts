/**
 * Evidence policy as code (docs/source-policy.md). A source's tier and a claim's certainty ceiling are
 * derived here and nowhere else, so the validator, the gaps register and any future UI agree.
 * Official hosts are primary only for an institution's own records; narrative pages on them are institutional
 * scholarship. Undated press defaults to contemporary; a later account needs a retrospective marker or `tier`.
 */
export const EVIDENCE_TIERS = ['primary', 'contemporary', 'scholarship', 'retrospective', 'pointer'] as const;
export type EvidenceTier = typeof EVIDENCE_TIERS[number];
/** Ordered strongest first. `disputed` is recorded explicitly, never derived from a source count. */
export const CERTAINTIES = ['confirmed', 'probable', 'provisional', 'disputed', 'unknown'] as const;
export type Certainty = typeof CERTAINTIES[number];

export interface EvidenceSource {
  url?: string; kind?: string; publisher?: string; via?: string;
  /** Explicit tier where the kind/host rule would mislead (for example a contemporary report filed as `secondary`). */
  tier?: EvidenceTier;
  /** Sources sharing a family are one piece of evidence (copies, mirrors, one wire story). */
  evidenceFamily?: string;
  /** data/raw/SOURCES.json marks official publications with a boolean. */
  official?: boolean;
}

/** The publishing host; a Wayback copy is judged by the page it archived. */
const host = (url = ''): string => {
  try {
    const u = new URL(url);
    const archived = u.hostname === 'web.archive.org' ? u.pathname.match(/^\/web\/[^/]+\/(https?:\/\/.+)$/)?.[1] : undefined;
    return archived ? host(archived) : u.hostname.toLowerCase();
  } catch { return ''; }
};
const under = (h: string, domain: string) => h === domain || h.endsWith(`.${domain}`);
/** Bodies whose own records are primary for their own acts. Everything else official is an institutional account. */
const PRIMARY_DOMAINS = ['gov.il', 'idf.il', 'un.org'];
/** Narrative or research pages on official hosts: institutional scholarship, not the record of the act. */
const OFFICIAL_ACCOUNT = /\/About\/(History|Lexicon|Pages)\/|facts-about-israel|timeline-of-events|theTimeAxis|\/Exhibitions\/|\/site\/chapter\/|\/globaldocs\/MMM\//i;
/** Research institutions named by the policy, whatever kind a file gave them. */
const SCHOLARSHIP_DOMAINS = ['idi.org.il', 'data.ipu.org', 'socsci4.tau.ac.il', 'cambridge.org', 'jstor.org', 'tandfonline.com'];

export const isEnglishWikipedia = (url = '') => /(^|\.)en\.(m\.)?wikipedia\.org$/.test(host(url));
export const isHebrewWikipedia = (url = '') => /(^|\.)he\.(m\.)?wikipedia\.org$/.test(host(url));

export function sourceTier(s: EvidenceSource): EvidenceTier {
  const h = host(s.url);
  if (isHebrewWikipedia(s.url)) return 'pointer';
  if (s.tier) return s.tier;
  if (/wikipedia\.org$|wikidata\.org$/.test(h)) return 'pointer';
  const officialHost = PRIMARY_DOMAINS.some(d => under(h, d));
  if (s.kind === 'repository-dataset') return 'primary';
  // The retained-source manifest flags a copy of an official publication (Gazette mirrors included) deliberately.
  if (s.official === true) return OFFICIAL_ACCOUNT.test(s.url ?? '') ? 'scholarship' : 'primary';
  if (s.kind === 'official') return officialHost && !OFFICIAL_ACCOUNT.test(s.url ?? '') ? 'primary' : 'scholarship';
  if (SCHOLARSHIP_DOMAINS.some(d => under(h, d))) return 'scholarship';
  if (s.kind === 'academic') return 'scholarship';
  if (under(h, 'archives.gov.il')) return OFFICIAL_ACCOUNT.test(s.url ?? '') ? 'scholarship' : 'primary';
  // Mirrors of an institution's narrative history are that institution's account.
  if (/\bhistory of the\b|highlights-of-the/i.test(`${s.publisher ?? ''} ${s.url ?? ''}`)) return 'scholarship';
  if (RETROSPECTIVE.test(`${s.publisher ?? ''} ${s.url ?? ''}`)) return 'retrospective';
  // News and archival press: a dated report about the event. Later accounts need a marker above or an explicit tier.
  return 'contemporary';
}
/** Timelines, explainers and anniversary pieces written after the fact. */
const RETROSPECTIVE = /timeline|fast[- ]facts|year[- ]review|defining moments|retrospective|historical database|history of confrontation|crisisgroup\.org/i;

const WIRES: [RegExp, string][] = [
  [/\bReuters\b/i, 'wire:reuters'], [/\bAssociated Press\b|\(AP\)|\bAP\b/, 'wire:ap'], [/\bUPI\b|United Press/i, 'wire:upi'],
  [/\bJTA\b|Jewish Telegraphic/i, 'wire:jta'], [/\bAFP\b|Agence France/i, 'wire:afp'],
];
const OUTLET_ALIASES: Record<string, string> = { 'ynetnews.com': 'ynet.co.il', 'haaretz.com': 'haaretz.co.il', 'inn.co.il': 'israelnationalnews.com', 'news.walla.co.il': 'walla.co.il' };

/** Independence: copies of one wire story, one outlet's several reports, or declared mirrors count once. */
export function independenceKey(id: string, s: EvidenceSource): string {
  if (s.evidenceFamily) return `family:${s.evidenceFamily}`;
  const tier = sourceTier(s);
  if (tier === 'primary') return `doc:${id}`;
  const wire = WIRES.find(([re]) => re.test(s.publisher ?? ''));
  if (wire) return wire[1];
  const h = host(s.url).replace(/^(www|m|pdfs|he|en)\./, '');
  if (!h) return `doc:${id}`;
  return `outlet:${OUTLET_ALIASES[h] ?? h}`;
}

export const certaintyRank = (c: Certainty) => ({ confirmed: 4, probable: 3, provisional: 2, disputed: 1, unknown: 0 })[c];

/**
 * The strongest certainty the cited sources can support (docs/source-policy.md, "Thresholds"):
 * - confirmed: a primary record; or an independent contemporary report and scholarship; or three independent contemporary reports;
 * - probable: scholarship; or two independent reliable reports, at least one contemporary;
 * - provisional: one reliable source, or retrospectives only;
 * - unknown: nothing, or pointers (Hebrew Wikipedia) only.
 */
export function certaintyCeiling(cited: { id: string; source: EvidenceSource }[]): Certainty {
  const best = new Map<string, EvidenceTier>();
  for (const { id, source } of cited) {
    const key = independenceKey(id, source), tier = sourceTier(source), old = best.get(key);
    if (!old || EVIDENCE_TIERS.indexOf(tier) < EVIDENCE_TIERS.indexOf(old)) best.set(key, tier);
  }
  const tiers = [...best.values()];
  const n = (t: EvidenceTier) => tiers.filter(x => x === t).length;
  const reliable = tiers.filter(t => t !== 'pointer').length;
  if (n('primary')) return 'confirmed';
  if ((n('contemporary') && n('scholarship')) || n('contemporary') >= 3) return 'confirmed';
  if (n('scholarship') || (reliable >= 2 && n('contemporary'))) return 'probable';
  if (reliable) return 'provisional';
  return 'unknown';
}

/** A recorded certainty is valid when it does not exceed the ceiling; disputed and unknown are always expressible. */
export function certaintyAllowed(recorded: Certainty, ceiling: Certainty) {
  return recorded === 'unknown' || recorded === 'disputed' || certaintyRank(recorded) <= certaintyRank(ceiling);
}

/** Family placement is editorial: never confirmed; probable only when scholarship places it. */
export function classificationCertainty(status: string, cited: { id: string; source: EvidenceSource }[]): Certainty {
  if (status === 'unverified') return 'unknown';
  const scholarship = cited.some(c => sourceTier(c.source) === 'scholarship');
  return status !== 'inferred' && scholarship ? 'probable' : 'provisional';
}
