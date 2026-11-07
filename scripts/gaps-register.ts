// Deterministic inventory of declared evidence gaps. Never resolves evidence by inference.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
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
    if (/conflicts?\[\d+\]$/i.test(path) && !/^(resolved|closed|accepted)$/.test(v.status ?? '')) addHere('conflict', v.note ?? v.reason ?? v.description ?? compact(v));
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

export function generateRegister(root = ROOT) {
  const inputs = [...filesUnder(root, 'data/raw'), ...filesUnder(root, 'data/meta'), ...filesUnder(root, 'docs/decisions'), ...filesUnder(root, 'docs/research/data-audit'), 'src/data/schema.ts', 'public/data/elections.json', ...filesUnder(root, 'public/data').filter(f => /\/k\d+\.json$/.test(f))].sort();
  const inventory = inputs.map(file => ({ file, sha256: hash(readFileSync(join(root, file))) }));
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
  return { schemaVersion: 1, inputDigest: hash(JSON.stringify(inventory)), inventory, counts: Object.fromEntries(kinds.map(k => [k, gaps.filter(g => g.kind === k).length])), gaps };
}
export function renderMarkdown(register: ReturnType<typeof generateRegister>): string {
  const esc = (s: string) => s.replaceAll('|', '\\|').replaceAll('\n', ' ');
  const lines = ['# Data gaps register', '', `There are ${register.gaps.length} flagged records: ${Object.entries(register.counts).map(([k, n]) => `${n} ${k}`).join(', ')}. Counts overlap by evidence issue; they are not a count of historical errors. Repeated raw-record fields are grouped, with exact occurrence counts in JSON.`, '',
    'This round establishes the generated register and stale-output gate, and closes one single-source mandate event by adding independent contemporary reporting. The 1992 research found a new archival lead but does not yet justify replacing all ten unknown recommendations. See [research and next ten](research/data-gaps-1992-followup.md).', '',
    'Regenerate with `npm run data:gaps`; check with `npm run data:gaps:check`. Both Vite build and Vitest reject stale committed output. This checks local evidence declarations on each run; it does not continuously browse or verify remote pages.', '',
    'Scope: every retained file under data/raw and data/meta is fingerprinted; JSON is recursively scanned, source manifests included. Published national datasets are checked against required fields extracted from src/data/schema.ts. PDFs, images, HTML and CSV are inventoried, not semantically interpreted. Optional nullable display/HTTP metadata is excluded; other nulls are review flags, including inapplicable values. Single-source means one recorded URL/family, not proof of independence; unknown shared provenance still needs human review. Decision/audit prose flags need current-status review; holds for elections now marked available are suppressed. Unrecorded contradictions and absent fields in formats without a declared schema require human review. Family classification remains editorial even with documented identity.', '',
    `Input digest: \`${register.inputDigest}\`. Full file hashes, occurrence counts, locations and stable ballot identities are in [JSON](data-gaps.json).`, ''];
  let election = '';
  for (const g of register.gaps) {
    if (g.election !== election) { election = g.election; lines.push(`## ${election}`, '', '| Item (letters / name where known) | Kind / uncertainty | Current sources | Best next source | Status |', '| --- | --- | --- | --- | --- |'); }
    lines.push(`| ${esc([g.letters, g.name, g.item].filter(Boolean).join(' / '))} ([record](../${g.file})) | ${esc(g.kind + ': ' + g.uncertainty)} | ${esc(g.sources.join('; ') || 'None recorded at this scope')} | ${esc(g.nextSource)} | ${g.status} |`);
  }
  return lines.join('\n') + '\n';
}
export function checkRegister(root = ROOT) {
  const register = generateRegister(root);
  for (const [file, expected] of [['docs/data-gaps.json', JSON.stringify(register, null, 2) + '\n'], ['docs/data-gaps.md', renderMarkdown(register)]])
    if (!existsSync(join(root, file)) || readFileSync(join(root, file), 'utf8') !== expected) throw new Error(`${file} is stale. Run npm run data:gaps and commit both outputs.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) checkRegister();
  else { const register = generateRegister(); writeFileSync(join(ROOT, 'docs/data-gaps.json'), JSON.stringify(register, null, 2) + '\n'); writeFileSync(join(ROOT, 'docs/data-gaps.md'), renderMarkdown(register)); console.log(register.counts); }
}
