// Deterministic inventory of declared evidence gaps. Never resolves evidence by inference.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CERTAINTIES, certaintyCeiling, certaintyRank, classificationCertainty, type Certainty, type EvidenceSource } from '../src/data/evidence.ts';
import { claimCertainty } from './lib/build/evidence.ts';
import { bioIdentityCertainty } from './lib/build/bios.ts';

export type GapKind = 'unknown' | 'missing-field' | 'conflict' | 'single-source' | 'low-confidence' | 'release-hold' | 'inferred' | 'pending' | 'unconfirmed';
export type Importance = 'high' | 'medium' | 'low';
export const IMPORTANCES: Importance[] = ['high', 'medium', 'low'];
export interface Gap {
  key: string; election: string; letters: string; name: string; item: string; kind: GapKind;
  uncertainty: string; sources: string[]; nextSource: string; status: string;
  file: string; locations: string[]; occurrences: number;
  /** Code rules below (importanceOf), never hand tags. */
  importance: Importance;
  /** docs/source-policy.md, derived from the record's own sources (src/data/evidence.ts). */
  certainty: Certainty;
}
type Obj = Record<string, any>;
const ROOT = resolve(import.meta.dirname, '..');
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const kinds: GapKind[] = ['unknown', 'missing-field', 'conflict', 'single-source', 'low-confidence', 'release-hold', 'inferred', 'pending', 'unconfirmed'];
const read = (root: string, file: string) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const filesUnder = (root: string, directory: string): string[] => !existsSync(join(root, directory)) ? [] : readdirSync(join(root, directory), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(e => e.isDirectory() ? filesUnder(root, `${directory}/${e.name}`) : [`${directory}/${e.name}`]);
const nullMetadata = new Set(['lastModified', 'archivedAt', 'archiveUrl', 'shortEn', 'bloc', 'partiesHe', 'defaultBlocScheme']);
const nextSource = (file: string, path: string) => /recommendation/i.test(path) ? 'President’s House / State Archives faction consultation minutes; contemporary independent reporting' : /colour|color/i.test(path) ? 'Dated party campaign material or official party style guide' : /candidate|roster|rank/i.test(path + file) ? 'CEC approved candidate gazette and official elected-member notice' : /logo/i.test(file) ? 'Dated original campaign artefact and rights/catalogue record' : /famil|lineage|parties/.test(file) ? 'Party registry / Knesset faction history; independent academic party history' : 'CEC / Knesset primary record for the field; independent dated corroboration';
const compact = (v: any) => typeof v === 'string' ? v : JSON.stringify(v);

/**
 * Importance is a rule over where the gap lives, so it is maintained automatically (docs/source-policy.md):
 * - high: could change seats, votes, a government's composition, recommendation totals or a Simple-level headline;
 * - low: display metadata, candidate trivia, raw-dump fields and provenance housekeeping;
 * - medium: everything else shown in Standard/Expert views or the After-the-election tab.
 */
const HIGH_RULES: [RegExp, RegExp][] = [
  [/^data\/meta\/aftermath\//, /recommendationRounds|\$\.government|\$\.formation\.(conflicts|outcome)|(mandate-given|confidence-vote|government-formed|consultations|returned-mandate|knesset-mandate) \d{4}/],
  [/^data\/raw\/k\d+\/(national\.reviewed|agreements\.proposed)\.json$/, /\$\.(agreements|lists|gazetteTotals|supplementalTotals|nationalTotals|discrepancies|corrections|allocationCheck|releaseBlockers)/],
  [/^public\/data\/k\d+\.json$/, /\$\.agreements|\$\.totals|\$\.lists\[\*\]\.(votes|seats|letters)|\$\.(threshold|seats)/],
  [/^data\/meta\/joint-facts\.json$/, /./],
  [/^data\/meta\/k\d+\.json$/, /blocSchemes/],
  [/^data\/meta\/election-context\.json$/, /pmContests/],
];
const LOW_FILES = /^(data\/meta\/(bios|logos|party-links)\/|data\/raw\/(SOURCES\.json|research\/|polls\/[^/]+\/coverage|bios\/|logos\/|party-links\/)|data\/raw\/[^/]*catalog|data\/raw\/k\d+\/[^/]*(odata|positions)[^/]*\.json$|docs\/|src\/)/;
const LOW_ITEMS = /colou?rs?|logo|englishName|nameEn|\.names\b|shortEn|displayName|\.bio\b|\.probable$/;
const PROSE = /\.(notes?|reason|limitation|gap|noteEn|noteHe)(\[\*\])?$/;
export function importanceOf(g: Pick<Gap, 'file' | 'item' | 'kind'>): Importance {
  if (g.kind === 'release-hold') return 'high';
  // Commentary restating a structured gap ranks below the gap itself.
  if (g.kind === 'pending' && PROSE.test(g.item)) return LOW_FILES.test(g.file) ? 'low' : 'medium';
  if (HIGH_RULES.some(([file, item]) => file.test(g.file) && item.test(g.item))) return 'high';
  if (LOW_FILES.test(g.file) || LOW_ITEMS.test(g.item)) return 'low';
  if (/^public\/data\/k\d+\.json$/.test(g.file) && g.kind === 'inferred') return 'low';
  return 'medium';
}
const weaker = (a: Certainty, b: Certainty) => certaintyRank(a) <= certaintyRank(b) ? a : b;

/** Pure scanner also used by fixture tests. locations are bounded examples, occurrences is exact. */
export function scanDocument(file: string, doc: any, listLookup: Record<string, Obj> = {}, sourceLookup: Record<string, EvidenceSource> = {}): Gap[] {
  // A JSON Schema describes the shape of records; its `electionId: { const: 'k25' }` or `sourceIds: { type: 'array' }` are not claims.
  if (typeof doc?.$schema === 'string' && /json-schema\.org/.test(doc.$schema)) return [];
  const rows = new Map<string, Gap>();
  const sourceMap = !Array.isArray(doc?.sources) && doc?.sources && typeof doc.sources === 'object' ? doc.sources : {};
  const resolveSource = (s: any): string => {
    if (typeof s === 'string') { const ref = sourceMap[s]; return ref ? ref.evidenceFamily ?? ref.evidenceFamilyId ?? ref.url ?? ref.sourceUrl ?? s : s; }
    return s?.evidenceFamily ?? s?.evidenceFamilyId ?? s?.url ?? s?.sourceUrl ?? (s?.source ? resolveSource(s.source) : s?.sourceId ?? s?.id ?? 'unresolved-source');
  };
  const sourceObject = (s: any): { id: string; source: EvidenceSource } | null => {
    if (typeof s === 'string') { const o = sourceMap[s] ?? sourceLookup[s]; return o && typeof o === 'object' ? { id: s, source: o } : /^https?:/.test(s) ? { id: s, source: { url: s } } : null; }
    if (s && typeof s === 'object') return s.source ? sourceObject(s.source) : s.url || s.sourceUrl ? { id: s.id ?? s.url ?? s.sourceUrl, source: { ...s, url: s.url ?? s.sourceUrl } } : s.sourceId ? sourceObject(s.sourceId) : null;
    return null;
  };
  const ownRefs = (o: Obj) => o.cites ?? (Array.isArray(o.sources) ? o.sources : undefined) ?? o.sourceIds ?? (o.sourceId ? [o.sourceId] : undefined) ?? (o.source ? [o.source] : undefined);
  const refs = (o: Obj, inherited: string[]) => {
    const own = o.cites ?? (Array.isArray(o.sources) ? o.sources : undefined) ?? o.sourceIds ?? (o.sourceId ? [o.sourceId] : undefined) ?? (o.source ? [o.source] : undefined);
    return own ? [...new Set((Array.isArray(own) ? own : [own]).map(resolveSource))].sort() : inherited;
  };
  const add = (kind: GapKind, detail: string, path: string, ctx: Obj, sources: string[], certainty: Certainty) => {
    const item = [ctx.round, ctx.entity, path.replace(/\[\d+\]/g, '[*]')].filter(Boolean).join(' / ');
    const key = hash(JSON.stringify([file, ctx.election, ctx.letters, ctx.name, item, kind])).slice(0, 24);
    const old = rows.get(key);
    if (old) { old.occurrences++; if (old.locations.length < 3) old.locations.push(path); old.sources = [...new Set([...old.sources, ...sources])].sort(); old.certainty = weaker(old.certainty, certainty); return; }
    const row: Gap = { key, election: ctx.election, letters: ctx.letters ?? '', name: ctx.name ?? '', item, kind,
      uncertainty: detail.slice(0, 500), sources, nextSource: nextSource(file, path), status: kind === 'inferred' ? 'inferred-not-verified' : kind === 'release-hold' ? 'needs-current-status-review' : 'open', file, locations: [path], occurrences: 1, importance: 'medium', certainty };
    row.importance = importanceOf(row);
    rows.set(key, row);
  };
  const visit = (v: any, path: string, ctx: Obj, inherited: string[], inheritedRefs?: unknown) => {
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${path}[${i}]`, ctx, inherited, inheritedRefs)); return; }
    if (!v || typeof v !== 'object') return;
    // Only a plain id names an election or entity; anything else would print as "[object Object]".
    const rawElection = typeof v.electionId === 'string' || typeof v.electionId === 'number' ? v.electionId : ctx.election;
    const election = typeof rawElection === 'number' ? `k${rawElection}` : String(rawElection);
    const linked = listLookup[`${election}:${v.listId ?? v.id ?? v.letters}`];
    const letters = v.letters ?? linked?.letters;
    ctx = { ...ctx, election: /^k\d+$/.test(v.id ?? '') ? v.id : election,
      ...(letters ? { letters, name: v.nameHe ?? linked?.nameHe ?? ctx.name } : {}),
      ...(/recommendationRounds\[\d+\]$/.test(path) ? { round: v.id ?? path } : {}),
      ...((typeof v.id === 'string' || typeof v.id === 'number') && v.id && !v.listId && !linked && !/^k\d+$/.test(v.id) && !/recommendationRounds\[\d+\]$/.test(path) ? { entity: v.id } : {}),
      ...(v.rank ? { entity: `rank ${v.rank}` } : {}),
      ...(v.type && v.date ? { entity: `${v.type} ${v.date}` } : {}) };
    const sources = refs(v, inherited);
    const cited = ((own => Array.isArray(own) ? own : own ? [own] : [])(ownRefs(v) ?? inheritedRefs) as unknown[]).map(sourceObject).filter((x): x is { id: string; source: EvidenceSource } => !!x);
    /** The claim's certainty under the policy: explicit if recorded and valid, else derived from what it cites. */
    const certaintyFor = (kind: GapKind): Certainty => {
      if (kind === 'conflict') return 'disputed';
      if (kind === 'unknown' || kind === 'missing-field' || kind === 'release-hold') return 'unknown';
      if (typeof v.certainty === 'string' && (CERTAINTIES as readonly string[]).includes(v.certainty)) return v.certainty;
      if (kind === 'pending') return 'unknown';
      if (kind === 'low-confidence' || v.probable === true) return 'provisional';
      if (/classificationEvidence$/.test(path)) return classificationCertainty(v.status ?? 'inferred', cited);
      if (kind === 'inferred') return weaker('provisional', certaintyCeiling(cited));
      return certaintyCeiling(cited);
    };
    let flagged = 0;
    const addHere = (kind: GapKind, text: string, field = '') => { flagged++; add(kind, text, path + field, ctx, sources, certaintyFor(kind)); };
    if (v.certainty === 'disputed') addHere('conflict', v.note ?? v.noteEn ?? 'Recorded as disputed');
    if (v.candidatesUnavailable) addHere('unknown', 'Registered candidate roster unavailable', '.candidates');
    if (v.candidatesTruncated) addHere('missing-field', 'Only a candidate prefix is transcribed; later registered ranks missing', '.candidates');
    if (v.probable === true) addHere('inferred', v.memberConfirmed === true ? 'Probable Hebrew Wikipedia or party link; the Knesset member identity is official' : 'Probable identity match, not official identity verification', '.probable');
    if (v.confidence === 'low') addHere('low-confidence', 'Evidence confidence is low', '.confidence');
    if (/inferred|unverified|report-only|probable/.test(v.verification ?? v.status ?? '')) addHere('inferred', `Evidence status: ${v.verification ?? v.status}`);
    if (typeof v.status === 'string' && /unknown|unresolved|missing|unavailable|unconfirmed/.test(v.status)) addHere('unknown', `Status: ${v.status}`, '.status');
    if (typeof v.status === 'string' && /pending/.test(v.status)) addHere('pending', `Status: ${v.status}`, '.status');
    if (/classificationEvidence$/.test(path) && !['inferred', 'unverified'].includes(v.status)) addHere('inferred', 'Family placement is an editorial classification, even when party identity is documented');
    if (/conflicts?\[\d+\]$/i.test(path) && !/\.resolved[^.\[]*conflicts?\[/i.test(path) && !/^(resolved|closed|accepted)$/.test(v.status ?? '')) addHere('conflict', v.note ?? v.reason ?? v.description ?? (typeof v.about === 'string' ? `${v.about} — ${compact(v.values ?? v)}` : compact(v)));
    if (/pending\[\d+\]|reviewCandidates\[\d+\]/.test(path)) addHere('pending', v.reason ?? v.note ?? 'Pending evidence review');
    // Count underlying URLs/families, never citation-array length. Aliased copies collapse.
    if ((v.cites || Array.isArray(v.sources) || v.sourceId || v.sourceIds || v.source) && sources.length === 1 && !/(?:sources|cites)\[\d+\]$|\.source$/.test(path))
      addHere('single-source', 'One recorded source family/locator; independence not established');
    if (/recommendationRounds\[\d+\]\.entries\[\d+\]$/.test(path)) {
      for (const field of ['letters', 'seats', 'status', ...(v.status === 'recommended' ? ['nominee'] : [])])
        if (!(field in v)) addHere('missing-field', `Required recommendation field absent: ${field}`, `.${field}`);
    }
    // Every claim below confirmed is open work, even when no other flag fired (src/data/evidence.ts).
    const claim = (Array.isArray(v.cites) || typeof v.certainty === 'string') && !/(?:sources|cites)\[\d+\]$/.test(path);
    if (claim && !flagged) { const c = certaintyFor('unconfirmed'); if (c === 'probable' || c === 'provisional') addHere('unconfirmed', `Certainty ${c} under the source policy`); }
    if (/\/SOURCES\.json$/.test(file) && /^\$\[\d+\]$/.test(path))
      for (const field of ['id', 'file', 'url', 'sha256']) if (!v[field]) addHere('missing-field', `Source manifest field absent: ${field}`, `.${field}`);
    for (const [k, x] of Object.entries(v)) {
      if (x === null && !nullMetadata.has(k)) addHere('unknown', `Explicit null: ${k} (may be unavailable or inapplicable; review context)`, `.${k}`);
      if (typeof x === 'string') {
        if (/^(unknown|unresolved|unavailable|missing|not-verified)$/i.test(x) && k !== 'status') addHere('unknown', `${k}: ${x}`, `.${k}`);
        if (/^(gap|gaps|missing|unresolved|unassignedRanks)$/i.test(k) && x) addHere('unknown', x, `.${k}`);
        if (/^(notes?|reason|limitation|gap)$/i.test(k) && /\b(unknown|unresolved|not (?:recovered|verified|transcribed)|unavailable|single.source|pending)\b/i.test(x) && !/\bno (?:unknown|unresolved)\b/i.test(x)) addHere('pending', x, `.${k}`);
      }
      if (k === 'unassignedRanks' && Array.isArray(x) && x.length) addHere('unknown', `Unassigned ranks: ${x.join(', ')}`, `.${k}`);
      if (k === 'notes' && Array.isArray(x)) x.forEach((note, i) => { if (typeof note === 'string' && /\b(unknown|unresolved|unavailable|not recovered|not verified|pending)\b/i.test(note)) addHere('pending', note, `.notes[${i}]`); });
      // Source dictionaries are provenance, not independent factual items.
      if (k !== 'sources' || Array.isArray(x)) visit(x, `${path}.${k}`, ctx, sources, /recommendationRounds\[\d+\]$/.test(path) && k === 'entries' ? v.cites : undefined);
    }
  };
  visit(doc, '$', { election: (typeof doc?.electionId === 'number' ? `k${doc.electionId}` : typeof doc?.electionId === 'string' ? doc.electionId : undefined) ?? file.match(/(?:^|\/)(k\d+)(?:[/.\-]|$)/)?.[1] ?? 'cross-election' }, []);
  return [...rows.values()];
}

/**
 * Membership records the Knesset's own rows leave unsettled: each `tenures[].gaps` entry in
 * data/research/knesset-member-changes/kN.json (a period no faction row covers, or a membership row that ends no later than
 * it starts). Only these entries are read from those files; their confirmed rows are not gaps (audit 12 Nov 2026,
 * cx-factions-05 and cx-events-06).
 */
export function memberChangeGaps(file: string, doc: any): Gap[] {
  const rows: Gap[] = [];
  (doc?.tenures ?? []).forEach((t: Obj, i: number) => (t.gaps ?? []).forEach((g: Obj, j: number) => {
    const item = `tenure ${t.id} / $.tenures[*].gaps[*].${g.about}`;
    const row: Gap = { key: hash(JSON.stringify([file, t.id, j, g.about])).slice(0, 24), election: `k${doc.knesset}`, letters: '', name: t.nameHe ?? '', item, kind: 'unknown',
      uncertainty: String(g.note ?? '').slice(0, 500), sources: ['knesset-parliament-info'], nextSource: 'Knesset House Committee notice or plenum record for those dates; the member’s official Knesset page',
      status: 'open', file, locations: [`$.tenures[${i}].gaps[${j}]`], occurrences: 1, importance: 'medium', certainty: 'unknown' };
    row.importance = importanceOf(row);
    rows.push(row);
  }));
  return rows;
}

/** Required fields come directly from the on-disk TypeScript schema, including nested records. */
function schemaGaps(root: string, file: string, doc: any): Gap[] {
  const schema = readFileSync(join(root, 'src/data/schema.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const required = new Map<string, string[]>();
  for (const match of schema.matchAll(/export interface (\w+)[^{]*\{/g)) {
    let depth = 1, end = match.index! + match[0].length;
    const start = end;
    while (depth && end < schema.length) { if (schema[end] === '{') depth++; if (schema[end] === '}') depth--; end++; }
    const body = schema.slice(start, end - 1);
    const fields: string[] = []; let nested = 0, offset = 0;
    for (let i = 0; i <= body.length; i++) {
      if ('{[('.includes(body[i] ?? '~')) nested++;
      if ('}])'.includes(body[i] ?? '~')) nested--;
      if ((body[i] === ';' && nested === 0) || i === body.length) {
        const property = body.slice(offset, i).trim().match(/^(\w+)(\?)?\s*:/);
        if (property && !property[2]) fields.push(property[1]);
        offset = i + 1;
      }
    }
    required.set(match[1], fields);
  }
  const rows: Gap[] = [];
  const check = (o: any, type: string, path: string, list?: Obj) => {
    if (!o || typeof o !== 'object') return;
    for (const field of required.get(type) ?? []) if (!(field in o)) {
      const letters = list?.letters ?? ''; const name = list?.nameHe ?? '';
      rows.push({ key: hash(`${doc.id}:${letters}:${name}:${path}:${field}`).slice(0, 24), election: doc.id, letters, name,
        item: `${path}.${field}`, kind: 'missing-field', uncertainty: `Required ${type}.${field} is absent (src/data/schema.ts)`,
        sources: doc.sourceIds ?? [], nextSource: nextSource(file, path), status: 'open', file, locations: [`${path}.${field}`], occurrences: 1, importance: 'medium', certainty: 'unknown' });
      rows[rows.length - 1].importance = importanceOf(rows[rows.length - 1]);
    }
  };
  check(doc, 'ElectionDataset', '$'); check(doc.status, 'DatasetStatus', '$.status'); check(doc.totals, 'Totals', '$.totals');
  for (const list of doc.lists ?? []) { check(list, 'ListRecord', `list ${list.letters}`, list); for (const c of list.candidates ?? []) check(c, 'Candidate', `list ${list.letters} rank ${c.rank}`, list); }
  for (const [key, type] of [['agreements', 'AgreementRecord'], ['blocs', 'BlocDef']] as const) for (const o of doc[key] ?? []) check(o, type, `${key}.${o.id}`);
  return rows;
}

/** Certainty of every recorded claim in the claim-carrying families, not only of flagged gaps. */
export function certaintyCensus(root = ROOT) {
  const census: Record<string, Record<Certainty, number>> = {};
  const count = (family: string, c: Certainty) => { const row = census[family] ??= Object.fromEntries(CERTAINTIES.map(k => [k, 0])) as Record<Certainty, number>; row[c]++; };
  for (const file of filesUnder(root, 'data/meta/aftermath').filter(f => f.endsWith('.json'))) {
    const d = read(root, file); const sources = d.sources ?? {};
    for (const r of d.recommendationRounds ?? []) for (const e of r.entries ?? []) count('Recommendations', claimCertainty(e, sources, r.cites));
    const governments = d.government ? [d.government, ...(d.government.changes ?? []).filter((c: Obj) => c.coalition)] : [];
    for (const g of governments) for (const r of [...g.coalition, ...(g.individuals ?? [])]) count('Government roles', r.certainty);
    for (const e of d.formation?.events ?? []) count('Formation events', claimCertainty(e, sources));
    for (const e of d.term?.events ?? []) count('Term events', claimCertainty(e, sources));
  }
  for (const file of filesUnder(root, 'data/meta/families').filter(f => f.endsWith('.json'))) {
    const d = read(root, file); const sources = d.sources ?? {};
    for (const e of d.elections ?? []) for (const m of e.members ?? []) if (m.classificationEvidence)
      count('Family classifications', classificationCertainty(m.classificationEvidence.status, (m.classificationEvidence.sourceIds ?? []).filter((id: string) => sources[id]).map((id: string) => ({ id, source: sources[id] }))));
  }
  for (const file of filesUnder(root, 'data/meta/bios').filter(f => /\/k\d+\.json$/.test(f)))
    for (const e of Object.values<Obj>(read(root, file).candidates ?? {})) count('Candidate identity links', bioIdentityCertainty(e as Parameters<typeof bioIdentityCertainty>[0]));
  return census;
}

export function generateFullRegister(root = ROOT) {
  const inputs = [...filesUnder(root, 'data/raw'), ...filesUnder(root, 'data/meta'), ...filesUnder(root, 'docs/decisions'), ...filesUnder(root, 'docs/research/data-audit'), 'src/data/schema.ts', 'public/data/elections.json', ...filesUnder(root, 'public/data').filter(f => /\/k\d+\.json$/.test(f))].sort();
  const listLookup: Record<string, Obj> = {};
  for (const f of inputs.filter(f => /^public\/data\/k\d+\.json$/.test(f))) { const d = read(root, f); for (const l of d.lists) { listLookup[`${d.id}:${l.id}`] = l; listLookup[`${d.id}:${l.letters}`] = l; } }
  const gaps: Gap[] = [];
  const index = read(root, 'public/data/elections.json');
  // Published datasets cite the retained-source manifest by id; its `official` flag sets the tier.
  const manifest = existsSync(join(root, 'data/raw/SOURCES.json')) ? read(root, 'data/raw/SOURCES.json') : [];
  const sourceLookup: Record<string, EvidenceSource> = Object.fromEntries((Array.isArray(manifest) ? manifest : []).filter((s: Obj) => s?.id).map((s: Obj) => [s.id, s]));
  for (const file of inputs) {
    if (file.endsWith('.json')) {
      const doc = read(root, file);
      gaps.push(...scanDocument(file, doc, listLookup, sourceLookup));
      if (/^public\/data\/k\d+\.json$/.test(file)) gaps.push(...schemaGaps(root, file, doc));
    } else if (file.endsWith('.md')) {
      readFileSync(join(root, file), 'utf8').split('\n').forEach((line, i) => {
        if (!/\b(unresolved|release (?:hold|held)|hold release|single.source|not verified|inferred|pending)\b/i.test(line)) return;
        if (/\b(no unresolved|resolved|superseded|lifted|not inferred)\b/i.test(line)) return;
        const electionIds = [...new Set((file + ' ' + line).match(/\bk\d+\b/gi) ?? ['cross-election'])];
        const hold = /release (?:hold|held)|hold release/i.test(line);
        for (const id of electionIds) {
          const election = id.toLowerCase();
          // Old decision holds are not current if the maintained release index says available.
          if (hold && index.some((e: Obj) => e.id === election && e.available)) continue;
          const kind: GapKind = hold ? 'release-hold' : /inferred/i.test(line) ? 'inferred' : 'pending';
          const row: Gap = { key: hash(`${file}:${i}:${election}`).slice(0, 24), election, letters: '', name: '', item: `Editorial evidence review, line ${i + 1}`, kind, uncertainty: line.trim().slice(0, 500), sources: [file], nextSource: 'Review linked primary evidence and later superseding decisions', status: 'needs-current-status-review', file, locations: [`line ${i + 1}`], occurrences: 1, importance: 'medium', certainty: kind === 'inferred' ? 'provisional' : 'unknown' };
          row.importance = importanceOf(row);
          gaps.push(row);
        }
      });
    }
  }
  for (const file of filesUnder(root, 'data/research/knesset-member-changes').filter(f => /\/k\d+\.json$/.test(f))) gaps.push(...memberChangeGaps(file, read(root, file)));
  gaps.sort((a, b) => (Number(a.election.slice(1)) || 999) - (Number(b.election.slice(1)) || 999) || a.file.localeCompare(b.file, 'en') || a.item.localeCompare(b.item, 'en') || a.kind.localeCompare(b.kind, 'en'));
  return { schemaVersion: 1, counts: Object.fromEntries(kinds.map(k => [k, gaps.filter(g => g.kind === k).length])), census: certaintyCensus(root), gaps };
}
type FullRegister = ReturnType<typeof generateFullRegister>;
const electionKey = (id: string) => /^k\d+$/.test(id) ? `k${Number(id.slice(1))}` : id;
const electionOrder = (a: string, b: string) => (Number(a.slice(1)) || 999) - (Number(b.slice(1)) || 999) || a.localeCompare(b, 'en');
const tally = <T extends string>(values: readonly T[], gaps: Gap[], pick: (g: Gap) => string) => Object.fromEntries(values.map(v => [v, gaps.filter(g => pick(g) === v).length])) as Record<T, number>;
const nonzero = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).filter(([, n]) => n));
/** A conflict's subject, so a grouped line still says what is disputed. */
const conflictAbout = (g: Gap) => { try { return String(JSON.parse(g.uncertainty).about ?? '').slice(0, 120); } catch { return g.uncertainty.replace(/^Disputed:\s*/i, '').split(' — ')[0].slice(0, 120); } };
const countStatuses = (gaps: Gap[]): Record<string, number> => Object.fromEntries([...new Set(gaps.map(g => g.status))].sort().map(status => [status, gaps.filter(g => g.status === status).length]));
/** Open means not yet confirmed under the source policy. A confirmed single-source record is not a gap to work. */
export const isOpen = (g: Pick<Gap, 'certainty'>) => g.certainty !== 'confirmed';
const fieldOf = (item: string) => (item.split(' / ').pop() ?? item).replace(/\[\*\]/g, '').replace(/^\$\.?/, '') || 'record';
/** Human area for grouping: the record family and field, independent of election and row. */
export function areaOf(g: Pick<Gap, 'file' | 'item'>, depth = 3) {
  const file = g.file.replace(/k\d+/g, 'kN').replace(/^data\/meta\/aftermath\/kN\.json$/, 'aftermath').replace(/^data\/meta\/families\/.*$/, 'families').replace(/^docs\/.*$/, 'docs (prose)');
  if (/^Editorial evidence review/.test(g.item)) return file;
  const area = `${file} ${fieldOf(g.item).split('.').slice(0, depth).join('.')}`;
  return AREA_LABELS[area] ?? area;
}
const AREA_LABELS: Record<string, string> = {
  'aftermath recommendationRounds.entries': 'Recommendations', 'aftermath recommendationRounds': 'Recommendation rounds',
  'aftermath government.coalition': 'Government roles', 'aftermath government.changes': 'Later governments',
  'aftermath government.individuals': 'Individual MKs', 'aftermath government.coalitionSeats': 'Coalition seat total',
  'aftermath government.supportSeats': 'Outside-support seat total', 'aftermath government.reconciliation': 'Investiture reconciliation',
  'aftermath government.confidenceVoteCites': 'Investiture vote', 'aftermath government': 'Government',
  'aftermath formation.events': 'Formation events', 'aftermath formation.conflicts': 'Formation conflicts',
  'aftermath formation': 'Formation', 'aftermath term': 'Term events', 'aftermath reaction': 'Reactions',
  'aftermath recommendationRounds.notes': 'Recommendation notes', 'aftermath issuePolling': 'Issue polling',
  'families elections': 'Family classifications', 'public/data/kN.json lists': 'Published lists',
  'public/data/kN.json agreements': 'Surplus agreements', 'data/meta/kN.json blocSchemes': 'Bloc schemes',
  'data/meta/parties.json partyAppearances': 'Party appearances', 'data/meta/kN.json lists': 'List metadata',
  'data/research/knesset-member-changes/kN.json tenures': 'Membership records', 'data/research/knesset-member-changes/kN.json tenures.gaps': 'Membership records',
};
const labelOf = (g: Gap) => g.letters || g.item.split(' / ').slice(0, -1).join(' / ') || '';

/** Only these facts participate in committed output and staleness checks. No file hashes. */
export function summarizeRegister(full: FullRegister) {
  const elections = [...new Set(full.gaps.map(g => electionKey(g.election)))].sort(electionOrder);
  const group = (gaps: Gap[], key: (g: Gap) => string) => { const m = new Map<string, Gap[]>(); for (const g of gaps) m.set(key(g), [...(m.get(key(g)) ?? []), g]); return m; };
  const highOpen = full.gaps.filter(g => g.importance === 'high' && isOpen(g));
  const high = [...group(highOpen, g => JSON.stringify([electionKey(g.election), areaOf(g, 2), g.file])).values()].map(gs => {
    const conflicts = [...new Set(gs.filter(g => g.kind === 'conflict').map(conflictAbout))];
    return { election: electionKey(gs[0].election), area: areaOf(gs[0], 2), count: gs.length, certainty: nonzero(tally(CERTAINTIES, gs, g => g.certainty)),
      kinds: nonzero(tally(kinds, gs, g => g.kind)), labels: [...new Set(gs.map(labelOf).filter(Boolean))], ...(conflicts.length ? { disputed: conflicts } : {}), file: gs[0].file };
  }).sort((a, b) => electionOrder(a.election, b.election) || b.count - a.count || a.area.localeCompare(b.area, 'en'));
  const mediumOpen = full.gaps.filter(g => g.importance === 'medium' && isOpen(g));
  const medium = [...group(mediumOpen, g => JSON.stringify([electionKey(g.election), areaOf(g, 1)])).values()].map(gs => ({
    election: electionKey(gs[0].election), area: areaOf(gs[0], 1), count: gs.length, certainty: nonzero(tally(CERTAINTIES, gs, g => g.certainty)),
  })).sort((a, b) => electionOrder(a.election, b.election) || b.count - a.count || a.area.localeCompare(b.area, 'en'));
  const lowGaps = full.gaps.filter(g => g.importance === 'low');
  const low = [...group(lowGaps, g => areaOf(g, 1)).entries()].map(([area, gs]) => ({ area, count: gs.length, open: gs.filter(isOpen).length }))
    .sort((a, b) => b.count - a.count || a.area.localeCompare(b.area, 'en'));
  return {
    schemaVersion: 3,
    total: full.gaps.length,
    counts: full.counts,
    countsByStatus: countStatuses(full.gaps),
    countsByImportance: Object.fromEntries(IMPORTANCES.map(i => [i, { total: full.gaps.filter(g => g.importance === i).length, ...tally(CERTAINTIES, full.gaps.filter(g => g.importance === i), g => g.certainty) }])),
    claimCertainty: full.census,
    elections: elections.map(election => {
      const gaps = full.gaps.filter(g => electionKey(g.election) === election);
      return { election, total: gaps.length, highOpen: gaps.filter(g => g.importance === 'high' && isOpen(g)).length, mediumOpen: gaps.filter(g => g.importance === 'medium' && isOpen(g)).length, low: gaps.filter(g => g.importance === 'low').length, counts: tally(kinds, gaps, g => g.kind) };
    }),
    high, medium, low,
  };
}
export function generateRegister(root = ROOT) { return summarizeRegister(generateFullRegister(root)); }
type Summary = ReturnType<typeof generateRegister>;

const escapeCell = (s: string) => s.replaceAll('|', '\\|').replaceAll('\n', ' ');
const certaintyList = (c: Record<string, number>) => CERTAINTIES.filter(k => c[k]).map(k => `${k} ${c[k]}`).join(', ');
const listLabels = (labels: string[], max = 14) => labels.length > max ? `${labels.slice(0, max).join(', ')} +${labels.length - max}` : labels.join(', ');

export function renderMarkdown(register: Summary): string {
  const byElection = <T extends { election: string }>(rows: T[]) => [...new Set(rows.map(r => r.election))].map(e => [e, rows.filter(r => r.election === e)] as const);
  const imp = register.countsByImportance as unknown as Record<Importance, Record<string, number>>;
  const lines = ['# Data gaps register', '',
    `${register.total} review flags, ranked by **importance** (what the gap could change) and **certainty** (what the recorded sources support under the [source policy](source-policy.md)). Open means not yet confirmed. Categories may overlap; bulk rows are grouped by field.`, '',
    `- High importance: ${imp.high.total} (${certaintyList(imp.high)}).`,
    `- Medium importance: ${imp.medium.total} (${certaintyList(imp.medium)}).`,
    `- Low importance: ${imp.low.total} (${certaintyList(imp.low)}).`, '',
    '## High importance: open, by election', '',
    'Could change seats, votes, a government’s composition, recommendation totals or a Simple-level headline. One line per record area with counts by certainty; labels are ballot letters, people or events.', ''];
  for (const [election, rows] of byElection(register.high)) {
    lines.push(`### ${election}`, '');
    for (const r of rows) lines.push(`- [${escapeCell(r.area)}](../${r.file}) ×${r.count}: ${certaintyList(r.certainty)}${r.labels.length ? `. ${escapeCell(listLabels(r.labels))}` : ''}${r.disputed ? `. Disputed: ${escapeCell(r.disputed.join('; '))}` : ''}`);
    lines.push('');
  }
  lines.push('## Medium importance: open, by election', '',
    'Shown in Standard/Expert views or the After-the-election tab. Grouped by record area; counts by certainty.', '');
  for (const [election, rows] of byElection(register.medium))
    lines.push(`- **${election}**: ${rows.map(r => `${escapeCell(r.area)} ${r.count} (${certaintyList(r.certainty)})`).join('; ')}.`);
  lines.push('', '## Low importance: counts only', '',
    'Display metadata, candidate trivia, raw-dump fields and provenance housekeeping.', '',
    register.low.map(r => `${escapeCell(r.area)} ${r.count}${r.open !== r.count ? ` (${r.open} open)` : ''}`).join('; ') + '.', '',
    '## Certainty of recorded claims', '',
    'Every claim in these families, not only gaps. Derived from each claim’s own sources; explicit values never exceed that ceiling (validated by `npm run data:build`).', '',
    `| Claims | ${CERTAINTIES.join(' | ')} | Total |`, `| --- | ${CERTAINTIES.map(() => '---:').join(' | ')} | ---: |`,
    ...Object.entries(register.claimCertainty).map(([family, c]) => `| ${family} | ${CERTAINTIES.map(k => (c as Record<string, number>)[k]).join(' | ')} | ${Object.values(c as Record<string, number>).reduce((a, b) => a + b, 0)} |`), '',
    '## Counts', '',
    `By kind: ${kinds.map(k => `${k}: ${register.counts[k]}`).join('; ')}.`, '',
    `By status: ${Object.entries(register.countsByStatus).map(([status, n]) => `${status}: ${n}`).join('; ')}.`, '',
    '| Election | High open | Medium open | Low | Total |', '| --- | ---: | ---: | ---: | ---: |',
    ...register.elections.map(e => `| ${e.election} | ${e.highOpen} | ${e.mediumOpen} | ${e.low} | ${e.total} |`), '',
    '## Maintenance and scope', '',
    'Regenerate this summary: `npm run data:gaps`. Verify: `npm run data:gaps:check` (also checked by Vitest). Production builds and deployments do not enforce register freshness. Only summary-level counts and grouped facts affect staleness; raw file bytes and bulk-only descriptions do not.', '',
    'Importance and certainty are code rules (`importanceOf` in scripts/gaps-register.ts; src/data/evidence.ts), not hand tags. Full export: `npm run data:gaps -- --full` writes `.backup-scratch/data-gaps/full.json` and `full.md` (gitignored), with every row, its sources and the best next source.', '',
    'Retained JSON under data/raw and data/meta is scanned for declared uncertainty; published national datasets are checked against required schema fields. Decision/audit prose needs current-status review. Binary sources are not interpreted; unrecorded contradictions need human review. Nulls can be inapplicable. Family classification is editorial and never confirmed.', '',
    'Research and blockers: [initial round](research/data-gaps-1992-followup.md), [closure batches](research/data-gaps-closure-batches.md), [7 November policy pass](research/evidence-policy-pass-1107.md). Machine-readable summary: [data-gaps.json](data-gaps.json).', '');
  return lines.join('\n');
}
export function renderFullMarkdown(register: FullRegister): string {
  const lines = ['# Full data gaps register', '',
    'Generated with `npm run data:gaps -- --full`; disposable detail export. Counts and the selected human queue are committed in docs/data-gaps.md. Source paths below are relative to the repository root.', '',
    `${register.gaps.length} grouped records: ${Object.entries(register.counts).map(([k, n]) => `${n} ${k}`).join(', ')}.`, ''];
  let election = '';
  for (const g of register.gaps) {
    if (g.election !== election) { election = g.election; lines.push(`## ${election}`, '', '| Item | Importance / certainty / kind: uncertainty | Current sources | Best next source | Status / record |', '| --- | --- | --- | --- | --- |'); }
    lines.push(`| ${escapeCell([g.letters, g.name, g.item].filter(Boolean).join(' / '))} | ${escapeCell(`${g.importance} / ${g.certainty} / ${g.kind}: ${g.uncertainty}`)} | ${escapeCell(g.sources.join('; ') || 'None recorded at this scope')} | ${escapeCell(g.nextSource)} | ${g.status} / ${g.file} |`);
  }
  return lines.join('\n') + '\n';
}
/** Keep JSON readable without thousands of repeated property lines. */
export function serializeSummary(summary: Summary): string {
  const { high, medium, low, ...totals } = summary;
  const rows = (name: string, items: unknown[]) => `  "${name}": [\n` + items.map(item => '    ' + JSON.stringify(item)).join(',\n') + '\n  ]';
  return JSON.stringify(totals, null, 2).slice(0, -2) + ',\n' + [rows('high', high), rows('medium', medium), rows('low', low)].join(',\n') + '\n}\n';
}
export function writeRegister(root = ROOT, full = false) {
  const register = generateFullRegister(root);
  const summary = summarizeRegister(register);
  writeFileSync(join(root, 'docs/data-gaps.json'), serializeSummary(summary));
  writeFileSync(join(root, 'docs/data-gaps.md'), renderMarkdown(summary));
  if (full) {
    const directory = join(root, '.backup-scratch/data-gaps');
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'full.json'), JSON.stringify(register, null, 2) + '\n');
    writeFileSync(join(directory, 'full.md'), renderFullMarkdown(register));
  }
  return summary;
}
export function checkRegister(root = ROOT) {
  const register = generateRegister(root);
  for (const [file, expected] of [['docs/data-gaps.json', serializeSummary(register)], ['docs/data-gaps.md', renderMarkdown(register)]])
    if (!existsSync(join(root, file)) || readFileSync(join(root, file), 'utf8') !== expected) throw new Error(`${file} is stale. Run npm run data:gaps and commit both outputs.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkRegister();
  else console.log(writeRegister(ROOT, process.argv.includes('--full')).counts);
}
