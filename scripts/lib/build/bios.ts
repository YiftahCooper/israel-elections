// Candidate biography links (data/meta/bios/kNN.json): the official Knesset member page, Hebrew
// Wikipedia (a labelled secondary source) and the party's own page, archived from the campaign where
// possible. Identities were matched by official ids or explicit rules (docs/research/candidate-bios.md);
// the build only attaches them and fails on an id that is not in the roster.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CandidateBio, ElectionDataset } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
interface Entry {
  displayNameEn?: string; // Reviewed display transliteration; original official extract stays intact.
  knesset?: { url: string; siteId?: number } | null; hewiki?: { title: string; url: string } | null;
  party?: { url: string; publisher?: string; archivedAt?: string | null; kind?: string } | null; confidence: 'high' | 'medium'; basis?: string;
}
/** Whether the Knesset identity itself is certain. An entry's confidence covers all its links (a probable Hebrew Wikipedia
 *  or party match makes it medium), so the identity is read from its basis (scripts/research/build-bios.py): matched as an
 *  elected member or as one who entered the Knesset in the list's faction (official OData), or a high reviewed decision.
 *  A name-only match of a candidate who was never elected ("not elected; identical name…") stays probable. */
const knessetIdentitySure = (e: Entry) => /^(elected; Knesset \d+ member|not elected at the election; entered Knesset )/.test(e.basis ?? '')
  || (e.confidence === 'high' && /^elected; reviewed decision/.test(e.basis ?? ''));

/** Identity certainty under docs/source-policy.md: an official Knesset identity is confirmed; a reviewed high match is
 *  probable; a rule-based name match (`probable: true` in the published bio) is provisional. */
export const bioIdentityCertainty = (e: Entry): 'confirmed' | 'probable' | 'provisional' => knessetIdentitySure(e) ? 'confirmed' : e.confidence === 'high' ? 'probable' : 'provisional';

export function applyBios(ds: ElectionDataset): ElectionDataset {
  const file = join(ROOT, 'data', 'meta', 'bios', `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const bios = (JSON.parse(readFileSync(file, 'utf8')) as { candidates: Record<string, Entry> }).candidates;
  // official English names from the Knesset website, keyed by member site id; only certain Knesset identities take one
  const namesFile = join(ROOT, 'data', 'raw', 'bios', 'knesset-site-mk-names-en.json');
  const namesEn = new Map(existsSync(namesFile) ? (JSON.parse(readFileSync(namesFile, 'utf8')) as { siteId: number; nameEn: string | null }[]).filter((x) => x.nameEn).map((x) => [x.siteId, x.nameEn!]) : []);
  const nameEnOf = (e: Entry) => {
    if (!knessetIdentitySure(e) || !e.knesset?.siteId) return undefined;
    // k12 audit: a reviewed displayNameEn overrides a misspelt site value; the raw site value stays as evidence.
    if (e.displayNameEn) return e.displayNameEn;
    const name = namesEn.get(e.knesset.siteId);
    return name;
  };
  const ids = new Set(ds.lists.flatMap((l) => l.candidates.map((c) => c.id)));
  const unknown = Object.keys(bios).filter((id) => !ids.has(id));
  if (unknown.length) throw new Error(`data/meta/bios/${ds.id}.json: not in the roster: ${unknown.slice(0, 5).join(', ')}`);
  const bioOf = (e: Entry): CandidateBio | null => {
    const b: CandidateBio = {
      ...(e.knesset?.url ? { knesset: e.knesset.url } : {}),
      ...(e.hewiki?.url ? { hewiki: { title: e.hewiki.title, url: e.hewiki.url } } : {}),
      ...(e.party?.url ? { party: { url: e.party.url, ...(e.party.publisher ? { publisher: e.party.publisher } : {}), ...(e.party.archivedAt ? { archivedAt: e.party.archivedAt } : {}) } } : {}),
      ...(e.confidence === 'medium' ? { probable: true } : {}),
    };
    if (/en\.wikipedia/.test(JSON.stringify(b))) throw new Error(`data/meta/bios/${ds.id}.json: English Wikipedia is never linked`);
    return b.knesset || b.hewiki || b.party ? b : null;
  };
  // Display form of official site names: backticks become apostrophes and repeated whitespace collapses (audits k7, k9, k13, k18).
  // The raw site value stays in data/raw/bios as evidence; spelling is never changed here.
  return { ...ds, lists: ds.lists.map((l) => ({ ...l, candidates: l.candidates.map((c) => { const e = bios[c.id]; const b = e ? bioOf(e) : null; const en = e ? nameEnOf(e) : undefined; const displayEn = en?.replaceAll('`', "'").replace(/\s+/g, ' ').trim(); return b || displayEn ? { ...c, ...(displayEn ? { nameEn: displayEn } : {}), ...(b ? { bio: b } : {}) } : c; }) })) };
}
