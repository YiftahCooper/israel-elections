/** Read-only validation of research metadata; never changes election inputs. */
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ElectionDataset } from '../src/data/schema.ts';
import { certaintyAllowed, certaintyCeiling, CERTAINTIES, type Certainty } from '../src/data/evidence.ts';
import { evidenceOf } from '../src/history/evidence-of.ts';

type Sources = Record<string, { url?: string; locator?: string; support?: string }>;
interface Registry {
  sources: Sources;
  parties: { id: string; aliases: { id: string }[]; sources: string[] }[];
  partyAppearances: { electionId: string; listId: string; partyId: string; role: string; sources: string[] }[];
}
interface Metric { votes: number; percent: { numerator: number; denominator: number }; displayPct: number }
interface Member {
  listId: string; nameHe: string; votes: number; partyIds: string[]; datasetPartyIds: string[];
  proposedPartyIds: string[]; scope: string; treatment: string; constituentVotes: null;
  identityEvidence: { locator: string }; classificationEvidence: { sourceIds: string[]; status: string; claim: string };
}
interface Review { listId: string; partyIds?: string[]; sourceIds: string[]; treatment: string }
interface Row {
  electionId: string; electionDate: string; datasetPath: string; datasetSha256: string; validVotes: number;
  members: Member[]; reviewCandidates: Review[];
  computed: { coreOnly: Metric | null; includedUnmixed: Metric; mixedWholeLists: Metric; wholeListInclusionAlternative: Metric };
}
export interface Family { id: string; sources: Sources; elections: Row[] }
interface Edge {
  id: string; from: string[]; to: string[]; relation: string; date: string; datePrecision: string;
  sources: string[]; electionId?: string; listId?: string; evidence: { status: string; interpretation: string };
  /** merger progress (party-history design §6); only a registered merger carries identity */
  stage?: string; certainty?: string; continues?: string;
}
export interface FamilyBundle {
  registry: Registry; lineage: { sources: Sources; edges: Edge[] }; families: Family[];
  datasets: Record<string, ElectionDataset>; hashes: Record<string, string>;
}
function check(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
const hash = (raw: string) => createHash('sha256').update(raw).digest('hex');
export function readFamilyBundle(root = process.cwd()): FamilyBundle {
  const read = (file: string) => readFileSync(resolve(root, file), 'utf8');
  const datasets: Record<string, ElectionDataset> = {}, hashes: Record<string, string> = {};
  for (let n = 1; n <= 26; n++) {
    const id = `k${n}`, raw = read(`public/data/${id}.json`);
    datasets[id] = JSON.parse(raw); hashes[id] = hash(raw);
  }
  return { registry: JSON.parse(read('data/meta/parties.json')),
    lineage: JSON.parse(read('data/meta/party-lineage.json')),
    families: readdirSync(resolve(root, 'data/meta/families')).filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(read(`data/meta/families/${f}`)) as Family), datasets, hashes };
}
export function validateFamilies(bundle: FamilyBundle): void {
  const { registry, lineage, families, datasets, hashes } = bundle;
  const parties = new Set(registry.parties.map(p => p.id)), aliases = new Map<string, string>();
  check(parties.size === registry.parties.length, 'duplicate party id');
  for (const p of registry.parties) for (const a of p.aliases) {
    check(!parties.has(a.id) && !aliases.has(a.id), `ambiguous alias ${a.id}`); aliases.set(a.id, p.id);
  }
  const canonical = (id: string) => aliases.get(id) ?? id;
  const party = (id: string) => check(parties.has(canonical(id)), `unknown party ${id}`);
  const refs = (ids: string[], sources: Sources) => {
    check(ids.length > 0, 'missing sources');
    for (const id of ids) check(sources[id] && (sources[id].url || sources[id].locator) && sources[id].support, `unknown or incomplete source ${id}`);
  };
  for (const p of registry.parties) refs(p.sources, registry.sources);
  const appearances = new Map<string, Set<string>>();
  const appearanceKeys = new Set<string>();
  for (const a of registry.partyAppearances) {
    party(a.partyId); refs(a.sources, registry.sources);
    check(datasets[a.electionId]?.lists.some(l => l.id === a.listId), `unknown appearance list ${a.listId}`);
    const key = `${a.electionId}/${a.listId}`, unique = `${key}/${a.partyId}`;
    check(!appearanceKeys.has(unique), `duplicate appearance ${unique}`); appearanceKeys.add(unique);
    if (a.role !== 'alliance') {
      if (!appearances.has(key)) appearances.set(key, new Set());
      appearances.get(key)!.add(canonical(a.partyId));
    }
  }
  for (const d of Object.values(datasets)) for (const l of d.lists) {
    check(appearances.has(`${d.id}/${l.id}`), `missing appearance ${l.id}`);
    for (const p of l.parties ?? []) party(p.id);
  }
  const familyIds = new Set<string>();
  for (const f of families) {
    check(!familyIds.has(f.id), `duplicate family ${f.id}`); familyIds.add(f.id);
    check(f.elections.length === 26 && new Set(f.elections.map(r => r.electionId)).size === 26, `${f.id}: election coverage`);
    for (const r of f.elections) {
      const d = datasets[r.electionId]; check(d, `unknown election ${r.electionId}`);
      check(r.datasetPath === `public/data/${d.id}.json` && r.datasetSha256 === hashes[d.id], `${f.id}: dataset hash/path`);
      check(r.electionDate === d.electionDate && r.validVotes === d.totals.valid, `${f.id}: election metadata`);
      const valid = BigInt(d.totals.valid);
      check(d.lists.reduce((s, l) => s + BigInt(l.votes), 0n) === valid, `${d.id}: vote reconciliation`);
      const seen = new Set<string>(); let core = 0n, included = 0n, mixed = 0n;
      for (const m of r.members) {
        check(!seen.has(m.listId), `${f.id}: duplicate list ${m.listId}`); seen.add(m.listId);
        const index = d.lists.findIndex(l => l.id === m.listId), l = d.lists[index];
        check(l, `unknown list ${m.listId}`);
        check(l.votes === m.votes && l.nameHe === m.nameHe, `${m.listId}: cached identity/votes`);
        check(m.identityEvidence.locator === `public/data/${d.id}.json#/lists/${index}`, `${m.listId}: JSON pointer`);
        check(JSON.stringify(m.datasetPartyIds) === JSON.stringify((l.parties ?? []).map(p => p.id)), `${m.listId}: dataset parties`);
        check(m.partyIds.length > 0 && new Set(m.partyIds).size === m.partyIds.length, `${m.listId}: empty/duplicate parties`);
        const actual = appearances.get(`${d.id}/${m.listId}`)!;
        for (const id of [...m.partyIds, ...m.proposedPartyIds]) { party(id); check(actual.has(canonical(id)), `${m.listId}: party not on ballot ${id}`); }
        const selected = new Set(m.partyIds.map(canonical));
        if ([...actual].some(id => !selected.has(id))) check(m.treatment === 'separate-segment', `${m.listId}: cross-family list must be mixed`);
        check(m.constituentVotes === null, `${m.listId}: invented constituent votes`);
        refs(m.classificationEvidence.sourceIds, f.sources);
        check(m.classificationEvidence.status && m.classificationEvidence.claim, `${m.listId}: evidence missing`);
        check(['include', 'separate-segment', 'exclude', 'unresolved'].includes(m.treatment), `${m.listId}: treatment`);
        // Re-read official list votes, never sum the cached member figures.
        if (m.treatment === 'include') { included += BigInt(l.votes); if (m.scope === 'core') core += BigInt(l.votes); }
        if (m.treatment === 'separate-segment') mixed += BigInt(l.votes);
      }
      for (const review of r.reviewCandidates) {
        check(d.lists.some(l => l.id === review.listId) && !seen.has(review.listId), `unknown or counted review ${review.listId}`);
        refs(review.sourceIds, f.sources); for (const id of review.partyIds ?? []) party(id);
      }
      const verify = (metric: Metric | null, value: bigint, key: string) => {
        if (metric === null) { check(key === 'coreOnly' && r.members.some(m => m.scope === 'mixed' && m.treatment === 'separate-segment'), 'unjustified null'); return; }
        check(BigInt(metric.votes) === value && BigInt(metric.percent.numerator) === value * 100n && BigInt(metric.percent.denominator) === valid, `${f.id}/${d.id}/${key}: total mismatch`);
        check(Math.abs(metric.displayPct - Number(value * 100n) / Number(valid)) <= 0.000000501, `${f.id}/${d.id}/${key}: display`);
      };
      verify(r.computed.coreOnly, core, 'coreOnly'); verify(r.computed.includedUnmixed, included, 'includedUnmixed');
      verify(r.computed.mixedWholeLists, mixed, 'mixedWholeLists'); verify(r.computed.wholeListInclusionAlternative, included + mixed, 'wholeListInclusionAlternative');
    }
  }
  const edgeIds = new Set<string>();
  const successors = new Map<string, { to: string; date: string }[]>();
  for (const e of lineage.edges) {
    check(!edgeIds.has(e.id), `duplicate edge ${e.id}`); edgeIds.add(e.id);
    check(['split-from', 'merged-into', 'absorbed-into', 'renamed-to', 'faction-split', 'same-organisation', 'not-same-organisation', 'electoral-partner', 'leader-moved-to'].includes(e.relation), `unknown relation ${e.relation}`);
    check(e.stage === undefined || e.relation === 'merged-into' && ['announced', 'approved', 'registered'].includes(e.stage), `${e.id}: stage`);
    if (e.continues !== undefined) { check(e.relation === 'merged-into' && e.from.includes(e.continues), `${e.id}: continues`); }
    // a recorded certainty may never exceed what its cited sources support (src/data/evidence.ts)
    if (e.certainty !== undefined) check((CERTAINTIES as readonly string[]).includes(e.certainty) && certaintyAllowed(e.certainty as Certainty, certaintyCeiling(e.sources.map((id) => ({ id, source: evidenceOf(lineage.sources[id] as Parameters<typeof evidenceOf>[0]) })))), `${e.id}: certainty above its sources`);
    check(e.from.length && e.to.length && e.evidence.status && e.evidence.interpretation, 'empty edge evidence');
    for (const p of [...e.from, ...e.to]) party(p); refs(e.sources, lineage.sources);
    check(e.datePrecision === 'year' ? /^\d{4}$/.test(e.date) : e.datePrecision === 'day' && /^\d{4}-\d{2}-\d{2}$/.test(e.date), `edge date ${e.id}`);
    if (e.relation === 'electoral-partner') check(datasets[e.electionId ?? '']?.lists.some(l => l.id === e.listId) && datasets[e.electionId!].electionDate === e.date, 'partnership election');
    if (['split-from', 'merged-into', 'absorbed-into', 'renamed-to'].includes(e.relation) && (!e.stage || e.stage === 'registered')) for (const from of e.from) for (const to of e.to) {
      const id = canonical(from); if (!successors.has(id)) successors.set(id, []); successors.get(id)!.push({ to: canonical(to), date: e.date });
    }
  }
  // A chronological directed return to an ancestor would assert impossible continuity.
  const walk = (node: string, path: Set<string>, date: string) => {
    check(!path.has(node), `succession cycle ${node}`);
    for (const e of successors.get(node) ?? []) if (e.date >= date) walk(e.to, new Set([...path, node]), e.date);
  };
  for (const id of successors.keys()) walk(id, new Set(), '');
  check(!JSON.stringify({ registry, lineage, families }).includes('en.wikipedia.org'), 'forbidden English Wikipedia reference');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const bundle = readFamilyBundle();
  validateFamilies(bundle);
  console.log(`Validated ${bundle.families.length} presets across k1–k26, registry and lineage.`);
}
