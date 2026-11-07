// Deterministic inventory of declared evidence gaps. Never resolves evidence by inference.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type GapKind = 'unknown' | 'missing-field' | 'conflict' | 'single-source' | 'low-confidence' | 'release-hold' | 'inferred' | 'pending';
export interface Gap {
  key: string; election: string; letters: string; name: string; item: string; kind: GapKind;
  uncertainty: string; sources: string[]; nextSource: string; status: string;
  file: string; locations: string[]; occurrences: number;
}
type Obj = Record<string, any>;
const ROOT = resolve(import.meta.dirname, '..');
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const kinds: GapKind[] = ['unknown', 'missing-field', 'conflict', 'single-source', 'low-confidence', 'release-hold', 'inferred', 'pending'];
const read = (root: string, file: string) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const filesUnder = (root: string, directory: string): string[] => !existsSync(join(root, directory)) ? [] : readdirSync(join(root, directory), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(e => e.isDirectory() ? filesUnder(root, `${directory}/${e.name}`) : [`${directory}/${e.name}`]);
const nullMetadata = new Set(['lastModified', 'archivedAt', 'archiveUrl', 'shortEn', 'bloc', 'partiesHe', 'defaultBlocScheme']);
const nextSource = (file: string, path: string) => /recommendation/i.test(path) ? 'President’s House / State Archives faction consultation minutes; contemporary independent reporting' : /colour|color/i.test(path) ? 'Dated party campaign material or official party style guide' : /candidate|roster|rank/i.test(path + file) ? 'CEC approved candidate gazette and official elected-member notice' : /logo/i.test(file) ? 'Dated original campaign artefact and rights/catalogue record' : /famil|lineage|parties/.test(file) ? 'Party registry / Knesset faction history; independent academic party history' : 'CEC / Knesset primary record for the field; independent dated corroboration';
const compact = (v: any) => typeof v === 'string' ? v : JSON.stringify(v);

/** Pure scanner also used by fixture tests. locations are bounded examples, occurrences is exact. */
export function scanDocument(file: string, doc: any, listLookup: Record<string, Obj> = {}): Gap[] {
  const rows = new Map<string, Gap>();
  const sourceMap = !Array.isArray(doc?.sources) && doc?.sources && typeof doc.sources === 'object' ? doc.sources : {};
  const resolveSource = (s: any): string => {
    if (typeof s === 'string') { const ref = sourceMap[s]; return ref ? ref.evidenceFamily ?? ref.evidenceFamilyId ?? ref.url ?? ref.sourceUrl ?? s : s; }
    return s?.evidenceFamily ?? s?.evidenceFamilyId ?? s?.url ?? s?.sourceUrl ?? (s?.source ? resolveSource(s.source) : s?.sourceId ?? s?.id ?? 'unresolved-source');
  };
  const refs = (o: Obj, inherited: string[]) => {
    const own = o.cites ?? (Array.isArray(o.sources) ? o.sources : undefined) ?? o.sourceIds ?? (o.sourceId ? [o.sourceId] : undefined) ?? (o.source ? [o.source] : undefined);
    return own ? [...new Set((Array.isArray(own) ? own : [own]).map(resolveSource))].sort() : inherited;
  };
  const add = (kind: GapKind, detail: string, path: string, ctx: Obj, sources: string[]) => {
    const item = [ctx.round, ctx.entity, path.replace(/\[\d+\]/g, '[*]')].filter(Boolean).join(' / ');
    const key = hash(JSON.stringify([file, ctx.election, ctx.letters, ctx.name, item, kind])).slice(0, 24);
    const old = rows.get(key);
    if (old) { old.occurrences++; if (old.locations.length < 3) old.locations.push(path); old.sources = [...new Set([...old.sources, ...sources])].sort(); return; }
    rows.set(key, { key, election: ctx.election, letters: ctx.letters ?? '', name: ctx.name ?? '', item, kind,
      uncertainty: detail.slice(0, 500), sources, nextSource: nextSource(file, path), status: kind === 'inferred' ? 'inferred-not-verified' : kind === 'release-hold' ? 'needs-current-status-review' : 'open', file, locations: [path], occurrences: 1 });
  };
  const visit = (v: any, path: string, ctx: Obj, inherited: string[]) => {
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${path}[${i}]`, ctx, inherited)); return; }
    if (!v || typeof v !== 'object') return;
    const rawElection = v.electionId ?? ctx.election;
    const election = typeof rawElection === 'number' ? `k${rawElection}` : String(rawElection);
    const linked = listLookup[`${election}:${v.listId ?? v.id ?? v.letters}`];
    const letters = v.letters ?? linked?.letters;
    ctx = { ...ctx, election: /^k\d+$/.test(v.id ?? '') ? v.id : election,
      ...(letters ? { letters, name: v.nameHe ?? linked?.nameHe ?? ctx.name } : {}),
      ...(/recommendationRounds\[\d+\]$/.test(path) ? { round: v.id ?? path } : {}),
      ...(v.id && !v.listId && !linked && !/^k\d+$/.test(v.id) && !/recommendationRounds\[\d+\]$/.test(path) ? { entity: v.id } : {}),
      ...(v.rank ? { entity: `rank ${v.rank}` } : {}),
      ...(v.type && v.date ? { entity: `${v.type} ${v.date}` } : {}) };
    const sources = refs(v, inherited);
    const addHere = (kind: GapKind, text: string, field = '') => add(kind, text, path + field, ctx, sources);
    if (v.candidatesUnavailable) addHere('unknown', 'Registered candidate roster unavailable', '.candidates');
    if (v.candidatesTruncated) addHere('missing-field', 'Only a candidate prefix is transcribed; later registered ranks missing', '.candidates');
    if (v.probable === true) addHere('inferred', 'Probable identity match, not official identity verification', '.probable');
    if (v.confidence === 'low') addHere('low-confidence', 'Evidence confidence is low', '.confidence');
    if (/inferred|unverified|report-only|probable/.test(v.verification ?? v.status ?? '')) addHere('inferred', `Evidence status: ${v.verification ?? v.status}`);
    if (typeof v.status === 'string' && /unknown|unresolved|missing|unavailable/.test(v.status)) addHere('unknown', `Status: ${v.status}`, '.status');
    if (typeof v.status === 'string' && /pending/.test(v.status)) addHere('pending', `Status: ${v.status}`, '.status');
    if (/classificationEvidence$/.test(path) && !['inferred', 'unverified'].includes(v.status)) addHere('inferred', 'Family placement is an editorial classification, even when party identity is documented');
    if (/conflicts?\[\d+\]$/i.test(path) && !/\.resolved[^.\[]*conflicts?\[/i.test(path) && !/^(resolved|closed|accepted)$/.test(v.status ?? '')) addHere('conflict', v.note ?? v.reason ?? v.description ?? compact(v));
    if (/pending\[\d+\]|reviewCandidates\[\d+\]/.test(path)) addHere('pending', v.reason ?? v.note ?? 'Pending evidence review');
    // Count underlying URLs/families, never citation-array length. Aliased copies collapse.
    if ((v.cites || Array.isArray(v.sources) || v.sourceId || v.sourceIds || v.source) && sources.length === 1 && !/(?:sources|cites)\[\d+\]$|\.source$/.test(path))
      addHere('single-source', 'One recorded source family/locator; independence not established');
    if (/recommendationRounds\[\d+\]\.entries\[\d+\]$/.test(path)) {
      for (const field of ['letters', 'seats', 'status', ...(v.status === 'recommended' ? ['nominee'] : [])])
        if (!(field in v)) addHere('missing-field', `Required recommendation field absent: ${field}`, `.${field}`);
    }
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
      if (k !== 'sources' || Array.isArray(x)) visit(x, `${path}.${k}`, ctx, sources);
    }
  };
  visit(doc, '$', { election: (typeof doc?.electionId === 'number' ? `k${doc.electionId}` : doc?.electionId) ?? file.match(/(?:^|\/)(k\d+)(?:[/.\-]|$)/)?.[1] ?? 'cross-election' }, []);
  return [...rows.values()];
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
        sources: doc.sourceIds ?? [], nextSource: nextSource(file, path), status: 'open', file, locations: [`${path}.${field}`], occurrences: 1 });
    }
  };
  check(doc, 'ElectionDataset', '$'); check(doc.status, 'DatasetStatus', '$.status'); check(doc.totals, 'Totals', '$.totals');
  for (const list of doc.lists ?? []) { check(list, 'ListRecord', `list ${list.letters}`, list); for (const c of list.candidates ?? []) check(c, 'Candidate', `list ${list.letters} rank ${c.rank}`, list); }
  for (const [key, type] of [['agreements', 'AgreementRecord'], ['blocs', 'BlocDef']] as const) for (const o of doc[key] ?? []) check(o, type, `${key}.${o.id}`);
  return rows;
}

export function generateFullRegister(root = ROOT) {
  const inputs = [...filesUnder(root, 'data/raw'), ...filesUnder(root, 'data/meta'), ...filesUnder(root, 'docs/decisions'), ...filesUnder(root, 'docs/research/data-audit'), 'src/data/schema.ts', 'public/data/elections.json', ...filesUnder(root, 'public/data').filter(f => /\/k\d+\.json$/.test(f))].sort();
  const listLookup: Record<string, Obj> = {};
  for (const f of inputs.filter(f => /^public\/data\/k\d+\.json$/.test(f))) { const d = read(root, f); for (const l of d.lists) { listLookup[`${d.id}:${l.id}`] = l; listLookup[`${d.id}:${l.letters}`] = l; } }
  const gaps: Gap[] = [];
  const index = read(root, 'public/data/elections.json');
  for (const file of inputs) {
    if (file.endsWith('.json')) {
      const doc = read(root, file);
      gaps.push(...scanDocument(file, doc, listLookup));
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
          gaps.push({ key: hash(`${file}:${i}:${election}`).slice(0, 24), election, letters: '', name: '', item: `Editorial evidence review, line ${i + 1}`, kind: hold ? 'release-hold' : /inferred/i.test(line) ? 'inferred' : 'pending', uncertainty: line.trim().slice(0, 500), sources: [file], nextSource: 'Review linked primary evidence and later superseding decisions', status: 'needs-current-status-review', file, locations: [`line ${i + 1}`], occurrences: 1 });
        }
      });
    }
  }
  gaps.sort((a, b) => (Number(a.election.slice(1)) || 999) - (Number(b.election.slice(1)) || 999) || a.file.localeCompare(b.file, 'en') || a.item.localeCompare(b.item, 'en') || a.kind.localeCompare(b.kind, 'en'));
  return { schemaVersion: 1, counts: Object.fromEntries(kinds.map(k => [k, gaps.filter(g => g.kind === k).length])), gaps };
}
type FullRegister = ReturnType<typeof generateFullRegister>;
export type SummaryItem = Pick<Gap, 'election' | 'letters' | 'name' | 'item' | 'kind' | 'uncertainty' | 'status' | 'file'>;
const isRecommendationUnknown = (g: { kind: GapKind; item: string }) => g.kind === 'unknown' && /recommendationRounds.*entries/.test(g.item);
const electionKey = (id: string) => /^k\d+$/.test(id) ? `k${Number(id.slice(1))}` : id;
const countKinds = (gaps: Gap[]) => Object.fromEntries(kinds.map(k => [k, gaps.filter(g => g.kind === k).length]));
const countStatuses = (gaps: Gap[]): Record<string, number> => Object.fromEntries([...new Set(gaps.map(g => g.status))].sort().map(status => [status, gaps.filter(g => g.status === status).length]));

/** Only these facts participate in committed output and staleness checks. No file hashes. */
export function summarizeRegister(full: FullRegister) {
  return {
    schemaVersion: 2,
    total: full.gaps.length,
    counts: full.counts,
    countsByStatus: countStatuses(full.gaps),
    elections: [...new Set(full.gaps.map(g => electionKey(g.election)))].map(election => {
      const gaps = full.gaps.filter(g => electionKey(g.election) === election);
      return { election, total: gaps.length, counts: countKinds(gaps) };
    }),
    items: full.gaps.filter(g => g.kind === 'conflict' || g.kind === 'low-confidence' || isRecommendationUnknown(g)).map(g => ({
      election: electionKey(g.election), letters: g.letters, name: g.name, item: g.item, kind: g.kind,
      uncertainty: g.uncertainty, status: g.status, file: g.file,
    } satisfies SummaryItem)),
  };
}
export function generateRegister(root = ROOT) { return summarizeRegister(generateFullRegister(root)); }
type Summary = ReturnType<typeof generateRegister>;

/** A bounded human queue derived from current records, so closures remove themselves. */
export function importantOpenGaps(register: Summary): string[] {
  const recommendations = register.items.filter(isRecommendationUnknown);
  const counts = new Map<string, number>();
  for (const g of recommendations) counts.set(g.election, (counts.get(g.election) ?? 0) + 1);
  const elections = [...counts.keys()].sort((a, b) => (a === 'k13' ? -1 : b === 'k13' ? 1 : Number(b.slice(1)) - Number(a.slice(1))));
  return [
    ...elections.slice(0, 4).map(e => `- ${e}: ${counts.get(e)} unknown party recommendations; recover named consultation records.`),
    ...(elections.length > 4 ? [`- Earlier elections: ${elections.slice(4).join(', ')} also have unknown recommendations.`] : []),
    `- ${register.counts.conflict} conflict flags need primary-record review, starting with elected identities.`,
    '- Missing or shortened candidate rosters affect what users can inspect; elected ranks come first.',
    '- Unverified logos and low-confidence colours still need dated originals; placeholders are preferable to guesses.',
    '- Family and lineage labels remain editorial; they must not imply verified organisational continuity.',
  ];
}
const escapeCell = (s: string) => s.replaceAll('|', '\\|').replaceAll('\n', ' ');

export function renderMarkdown(register: Summary): string {
  const lines = ['# Data gaps register', '',
    `${register.total} review flags; categories may overlap and are not counts of historical errors. Bulk rows are grouped by field; these counts use grouped records, not occurrences.`, '',
    '## Most important open gaps', '', ...importantOpenGaps(register), '',
    '## Counts', '',
    `By kind: ${kinds.map(k => `${k}: ${register.counts[k]}`).join('; ')}.`, '',
    `By status: ${Object.entries(register.countsByStatus).map(([status, n]) => `${status}: ${n}`).join('; ')}.`, '',
    '## Per election', '',
    '| Election | Unknown | Missing field | Conflict | Single source | Low confidence | Release hold | Inferred | Pending | Total |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...register.elections.map(e => `| ${e.election} | ${kinds.map(k => e.counts[k]).join(' | ')} | ${e.total} |`), '',
    '## Individually listed priorities', '',
    'Every conflict, low-confidence item and unknown recommendation is listed below. The record link contains its provenance and context; full field locations, source locators, next-source suggestions and bulk rows are available in the optional full export.', '',
    '| Election / kind | Ballot / party / item | Uncertainty | Status / record |', '| --- | --- | --- | --- |',
    ...register.items.map(g => `| ${g.election} / ${g.kind} | ${escapeCell([g.letters, g.name, g.item].filter(Boolean).join(' / '))} | ${escapeCell(g.uncertainty)} | ${g.status} / [record](../${g.file}) |`), '',
    '## Maintenance and scope', '',
    'Regenerate this summary: `npm run data:gaps`. Verify: `npm run data:gaps:check` (also checked by Vitest). Production builds and deployments do not enforce register freshness. Only summary-level counts and individually listed facts affect staleness; raw file bytes and bulk-only descriptions do not.', '',
    'Full export: `npm run data:gaps -- --full` writes `.backup-scratch/data-gaps/full.json` and `full.md` (gitignored). The full export is optional and is not required by tests. It is regenerated from retained inputs, not committed.', '',
    'Retained JSON under data/raw and data/meta is scanned for declared uncertainty; published national datasets are checked against required schema fields. Decision/audit prose needs current-status review. Binary sources are not interpreted; unrecorded contradictions need human review. Nulls can be inapplicable. Single-source flags do not prove independence. Family classification remains editorial.', '',
    'Research and blockers: [initial round](research/data-gaps-1992-followup.md), [closure batches](research/data-gaps-closure-batches.md). Machine-readable summary: [data-gaps.json](data-gaps.json).', ''];
  return lines.join('\n');
}
export function renderFullMarkdown(register: FullRegister): string {
  const lines = ['# Full data gaps register', '',
    'Generated with `npm run data:gaps -- --full`; disposable detail export. Counts and the selected human queue are committed in docs/data-gaps.md. Source paths below are relative to the repository root.', '',
    `${register.gaps.length} grouped records: ${Object.entries(register.counts).map(([k, n]) => `${n} ${k}`).join(', ')}.`, ''];
  let election = '';
  for (const g of register.gaps) {
    if (g.election !== election) { election = g.election; lines.push(`## ${election}`, '', '| Item | Kind / uncertainty | Current sources | Best next source | Status / record |', '| --- | --- | --- | --- | --- |'); }
    lines.push(`| ${escapeCell([g.letters, g.name, g.item].filter(Boolean).join(' / '))} | ${escapeCell(g.kind + ': ' + g.uncertainty)} | ${escapeCell(g.sources.join('; ') || 'None recorded at this scope')} | ${escapeCell(g.nextSource)} | ${g.status} / ${g.file} |`);
  }
  return lines.join('\n') + '\n';
}
/** Keep JSON readable without thousands of repeated property lines. */
export function serializeSummary(summary: Summary): string {
  const { items, ...totals } = summary;
  return JSON.stringify(totals, null, 2).slice(0, -2) + ',\n  "items": [\n' + items.map(item => '    ' + JSON.stringify(item)).join(',\n') + '\n  ]\n}\n';
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
