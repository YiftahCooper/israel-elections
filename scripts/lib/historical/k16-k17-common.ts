// Evidence preflight for the two scanned elections. No application dataset is emitted
// until the documented national, candidate and locality-schema gates can be met.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';
import { META, neutralColor } from '../list-meta.ts';

const ROOT = join(import.meta.dirname, '../../..');
const RAW = join(ROOT, 'data/raw');
export type HistoricalId = 'k16' | 'k17';
export interface Review {
  id: HistoricalId;
  reviewedOn: string;
  resultsSourceId: string;
  gazetteTotals: { registered: null; votesCast: null; valid: number; invalid: number };
  supplementalTotals: { registered: number; votesCast: number; sourceId: string };
  lists: { letters: string; nameHe: string; gazetteVotes: number; officialSeats: number }[];
  pollingColumnsNotInGazette: Record<string, { votes: number; note: string }>;
  columnAliases: Record<string, string>;
  agreements: { sourceId: string; issue: number; page: number; complete: boolean; pairs: [string, string][] };
  candidateChecks: { sourceId: string; completeRostersVerified: boolean; lists: { letters: string; publishedCount: number; first: { rank: number; nameHe: string } }[] };
  discrepancies: { field: string; gazette: number; polling: number; status: string; note: string }[];
  releaseBlockers: string[];
}
interface DerivedRow {
  code: number | null;
  nameHe: string;
  committee: null;
  registered: number | null;
  votesCast: number;
  invalid: number;
  valid: number;
  votes: number[];
}
export interface Reconciliation {
  id: HistoricalId;
  pollingSourceSha256: string;
  rawRecords: number;
  pollingRows: number;
  ignoredEofRows: number;
  envelopeRows: number;
  rawEnvelopeRegistered: number | null;
  localityRowsIncludingEnvelopes: number;
  derivedRowsSha256: string;
  listLetters: string[];
  nationalVotes: Record<string, number>;
  totals: { registered: number | null; votesCast: number; invalid: number; valid: number };
  missingLocalityFields: string[];
}
export interface Audit { review: Review; reconciliation: Reconciliation; releaseReady: false }
export interface VerifyOptions { log?: boolean; available?: boolean }
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
function assert(ok: unknown, msg: string): asserts ok {
  if (!ok) throw new Error(`k16/k17 evidence: ${msg}`);
}
function num(x: unknown, label: string): number {
  assert(typeof x === 'number' || (typeof x === 'string' && /^\d+(?:\.0+)?$/.test(x)), `${label}: missing/non-numeric value`);
  const n = Number(x);
  assert(Number.isSafeInteger(n) && n >= 0, `${label}: not a nonnegative integer`);
  return n;
}
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
export function pollingVotes(review: Review): Record<string, number> {
  return Object.fromEntries(review.lists.map(l => [l.letters,
    review.discrepancies.find(d => d.field === `votes:${l.letters}`)?.polling ?? l.gazetteVotes]));
}

/** Produces research rows with explicit nulls, NOT LocalityDataset rows. The hash is of
 * JSON.stringify(rows); columns follow review.lists, groups sort by numeric code (k16)
 * or exact trimmed Unicode name (k17). No external code/name crosswalk is invented. */
export function derivePolling(review: Review, bytes: Buffer): { reconciliation: Reconciliation; rows: DerivedRow[] } {
  const data = JSON.parse(bytes.toString('utf8')) as { fields: { id: string }[]; records: Record<string, unknown>[] };
  const letters = review.lists.map(l => l.letters);
  const aliases = review.columnAliases;
  const columns = [...letters.map(l => aliases[l] ?? l), ...Object.keys(review.pollingColumnsNotInGazette)];
  const metadata = review.id === 'k16'
    ? ['_id', 'סמל ישוב', 'סמל קלפי', 'בוחרים', 'מצביעים', 'פסולים', 'כשרים', 'שם ישוב']
    : ['_id', 'מספר קלפי', 'שם ישוב', 'כתובת', 'מצביעים', 'כשרים'];
  const expectedFields = [...metadata, ...columns].sort();
  assert(JSON.stringify(data.fields.map(f => f.id).sort()) === JSON.stringify(expectedFields), `${review.id}: unexpected polling columns`);
  const groups = new Map<string, DerivedRow>();
  let eof = 0; let envelopes = 0; let envelopeRegistered = 0;
  const extras = Object.fromEntries(Object.keys(review.pollingColumnsNotInGazette).map(k => [k, 0]));
  for (const r of data.records) {
    // k16 XLS EOF sentinel is an explicit non-record, not an empty polling station.
    if (review.id === 'k16' && r['סמל ישוב'] === '\x1a' && r['שם ישוב'] === '') {
      assert(metadata.filter(k => !['_id', 'סמל ישוב', 'שם ישוב'].includes(k)).every(k => r[k] === null)
        && columns.every(k => r[k] === null || r[k] === ''), 'k16: nonempty EOF row');
      eof++; continue;
    }
    const name = String(r['שם ישוב'] ?? '').trim();
    assert(name.length > 0, `${review.id}: empty locality name`);
    const code = review.id === 'k16' ? num(r['סמל ישוב'], 'locality code') : null;
    const envelope = name === 'מעטפות כפולות';
    if (review.id === 'k16') assert((code === 0) === envelope, 'k16: unexpected envelope code/name');
    num(r[review.id === 'k16' ? 'סמל קלפי' : 'מספר קלפי'], 'polling station');
    const cast = num(r['מצביעים'], 'cast'); const valid = num(r['כשרים'], 'valid');
    const invalid = review.id === 'k16' ? num(r['פסולים'], 'invalid') : cast - valid;
    assert(invalid >= 0 && valid + invalid === cast, `${review.id}/${name}: cast ≠ valid + invalid`);
    const votes = letters.map(l => num(r[aliases[l] ?? l], `${review.id}/${name}/${l}`));
    let extra = 0;
    for (const k of Object.keys(extras)) { const v = num(r[k], `${review.id}/${k}`); extras[k] += v; extra += v; }
    assert(votes.reduce((a, b) => a + b, 0) + extra === valid, `${review.id}/${name}: list votes ≠ valid`);
    const registered = review.id === 'k16' ? num(r['בוחרים'], 'registered') : null;
    if (envelope) { envelopes++; envelopeRegistered += registered ?? 0; }
    const key = code === null ? name : String(code);
    const row = groups.get(key) ?? { code, nameHe: name, committee: null, registered: registered === null || envelope ? null : 0, votesCast: 0, invalid: 0, valid: 0, votes: letters.map(() => 0) };
    assert(row.nameHe === name, `${review.id}: multiple names for code ${code}`);
    row.votesCast += cast; row.invalid += invalid; row.valid += valid;
    if (row.registered !== null) row.registered += registered!;
    votes.forEach((v, i) => row.votes[i] += v);
    groups.set(key, row);
  }
  for (const [k, v] of Object.entries(extras)) assert(v === review.pollingColumnsNotInGazette[k].votes, `${review.id}: unexpected extra-column votes ${k}`);
  const rows = [...groups.values()].sort((a, b) => a.code !== null && b.code !== null ? a.code - b.code : a.nameHe < b.nameHe ? -1 : a.nameHe > b.nameHe ? 1 : 0);
  const totals = {
    registered: review.id === 'k16' ? rows.reduce((s, r) => s + (r.registered ?? 0), 0) : null,
    votesCast: rows.reduce((s, r) => s + r.votesCast, 0), invalid: rows.reduce((s, r) => s + r.invalid, 0), valid: rows.reduce((s, r) => s + r.valid, 0),
  };
  return { rows, reconciliation: {
    id: review.id, pollingSourceSha256: hash(bytes), rawRecords: data.records.length, pollingRows: data.records.length - eof,
    ignoredEofRows: eof, envelopeRows: envelopes, rawEnvelopeRegistered: review.id === 'k16' ? envelopeRegistered : null,
    localityRowsIncludingEnvelopes: rows.length, derivedRowsSha256: hash(JSON.stringify(rows)), listLetters: letters,
    nationalVotes: Object.fromEntries(letters.map((l, i) => [l, rows.reduce((s, r) => s + r.votes[i], 0)])),
    totals, missingLocalityFields: review.id === 'k16' ? ['committee'] : ['code', 'committee', 'registered'],
  } };
}

export function verifyPolling(review: Review, expected: Reconciliation, opts: { log?: boolean; file?: string } = {}): 'verified' | 'skipped' {
  const file = opts.file ?? join(ROOT, `.backup-scratch/raw/${review.id}/ballots.datagov.json`);
  if (!existsSync(file)) {
    if (opts.log !== false) console.log(`${review.id}: polling-station reconciliation SKIPPED (scratch absent); committed evidence checks still run`);
    return 'skipped';
  }
  const { reconciliation } = derivePolling(review, readFileSync(file));
  assert(JSON.stringify(reconciliation) === JSON.stringify(expected), `${review.id}: polling reconciliation or derived-locality digest changed`);
  if (opts.log !== false) console.log(`${review.id}: verified ${expected.pollingRows} polling rows and ${expected.localityRowsIncludingEnvelopes} derived locality groups; documented gazette discrepancies retained`);
  return 'verified';
}

export function verifyHistoricalProgress(id: HistoricalId, opts: VerifyOptions = {}): Audit {
  const review: Review = readJson(join(RAW, id, 'national.reviewed.json'));
  const reconciliation: Reconciliation = readJson(join(RAW, id, 'reconciliation.reviewed.json'));
  const manifest = readJson(join(RAW, 'SOURCES.json')) as { id: string; file: string; sha256: string }[];
  const ids = [review.resultsSourceId, review.agreements.sourceId, review.candidateChecks.sourceId, review.supplementalTotals.sourceId, `${id}-national-reviewed`, `${id}-reconciliation-reviewed`];
  for (const sourceId of ids) {
    const source = manifest.find(s => s.id === sourceId);
    assert(source?.file && source.sha256, `${id}: missing manifest record ${sourceId}`);
    assert(hash(readFileSync(join(RAW, source.file))) === source.sha256, `${sourceId}: source hash changed`);
  }
  assert(review.id === id && reconciliation.id === id, `${id}: mismatched evidence ids`);
  assert(manifest.find(s => s.id === `${id}-ballots-datagov`)?.sha256 === reconciliation.pollingSourceSha256, `${id}: polling source hash differs from reviewed reconciliation`);
  const votes = pollingVotes(review);
  assert(new Set(review.lists.map(l => l.letters)).size === review.lists.length, `${id}: duplicate letters`);
  assert(review.lists.every(l => Number.isSafeInteger(l.officialSeats) && l.officialSeats >= 0), `${id}: invalid gazette seats`);
  assert(review.lists.reduce((s, l) => s + l.officialSeats, 0) === 120, `${id}: gazette seats ≠ 120`);
  assert(JSON.stringify(votes) === JSON.stringify(reconciliation.nationalVotes), `${id}: reviewed per-list polling sums differ`);
  assert(Object.values(votes).reduce((a, b) => a + b, 0) === review.gazetteTotals.valid, `${id}: reconciled list votes ≠ gazette valid total`);
  const difference = review.discrepancies.filter(d => d.field.startsWith('votes:')).reduce((s, d) => s + d.gazette - d.polling, 0);
  assert(review.lists.reduce((s, l) => s + l.gazetteVotes, 0) === review.gazetteTotals.valid + difference, `${id}: unexplained printed-vote discrepancy`);
  for (const d of review.discrepancies) {
    const gazette = d.field === 'invalid' ? review.gazetteTotals.invalid : review.lists.find(l => `votes:${l.letters}` === d.field)?.gazetteVotes;
    assert(gazette === d.gazette && d.gazette !== d.polling && d.note.length > 0, `${id}: invalid discrepancy record ${d.field}`);
  }
  const invalid = review.discrepancies.find(d => d.field === 'invalid')?.polling ?? review.gazetteTotals.invalid;
  assert(reconciliation.totals.valid === review.gazetteTotals.valid && reconciliation.totals.invalid === invalid, `${id}: unexplained national totals`);
  assert(reconciliation.totals.votesCast === review.supplementalTotals.votesCast && reconciliation.totals.votesCast === invalid + reconciliation.totals.valid, `${id}: turnout does not reconcile`);
  if (reconciliation.totals.registered !== null) assert(reconciliation.totals.registered === review.supplementalTotals.registered, `${id}: electorate does not reconcile`);
  assert(/^[0-9a-f]{64}$/.test(reconciliation.derivedRowsSha256), `${id}: missing locality digest`);
  const members = review.agreements.pairs.flat();
  assert(new Set(members).size === members.length && members.every(m => m in votes), `${id}: invalid agreement members`);
  assert(review.agreements.complete, `${id}: incomplete agreement notice`);
  verifyPolling(review, reconciliation, opts);
  const audit: Audit = { review, reconciliation, releaseReady: false };
  const res = allocate(toEngineInput(scenarioFromDataset(researchDataset(audit))));
  assert(res.seatsAllocated === 120 && res.warnings.length === 0, `${id}: allocation incomplete or ambiguous`);
  for (const list of res.lists) assert(list.seats === review.lists.find(l => `${id.slice(1)}-${l.letters}` === list.id)?.officialSeats, `${id}: official seats differ for ${list.id}`);
  const index = readJson(join(ROOT, 'public/data/elections.json')) as { id: string; available: boolean }[];
  const entry = index.find(e => e.id === id);
  assert(entry, `${id}: missing election index entry`);
  assert(!(opts.available ?? entry.available), `${id}: release blocked: ${review.releaseBlockers.join(' ')}`);
  assert(review.releaseBlockers.length > 0 && !review.candidateChecks.completeRostersVerified, `${id}: evidence preflight needs a completed release builder`);
  if (opts.log !== false) console.log(`${id}: UNAVAILABLE — ${review.releaseBlockers.join(' ')}`);
  return audit;
}

/** Diagnostic fixture only: deliberately has no candidate rosters and uses polling counts
 * where the gazette disagrees. Never write this to public/data or claim it is release-ready.
 * Keeping it an ElectionDataset exercises exactly the application's scenario conversion. */
export function researchDataset({ review, reconciliation }: Audit): ElectionDataset {
  const n = Number(review.id.slice(1)); const votes = pollingVotes(review);
  return {
    schemaVersion: 1, id: review.id, knesset: n, electionDate: n === 16 ? '2003-01-28' : '2006-03-28',
    nameHe: `בדיקת מחקר בלבד — הכנסת ה-${n}`, nameEn: 'RESEARCH ONLY — not a release dataset',
    status: { stage: 'official-final', asOf: review.reviewedOn, noteHe: 'נתוני בדיקה בלבד; הרשימות המלאות לא אומתו.', noteEn: 'Research fixture only; complete candidate rosters unverified.' },
    ruleSetId: n === 16 ? 'il-1992-bader-ofer-1.5' : 'il-2004-bader-ofer-2',
    totals: { registered: review.supplementalTotals.registered, votesCast: reconciliation.totals.votesCast, invalid: reconciliation.totals.invalid, valid: review.gazetteTotals.valid, ballotBoxes: reconciliation.pollingRows, localities: reconciliation.localityRowsIncludingEnvelopes - 1 },
    lists: review.lists.map((l, i) => {
      const id = `${n}-${l.letters}`; const meta = META[id];
      return { id, letters: l.letters, nameHe: l.nameHe, shortHe: meta?.he ?? l.nameHe, shortEn: meta?.en ?? null,
        sponsorsHe: '', partiesHe: null, votes: votes[l.letters], withdrawn: false, color: meta?.color ?? neutralColor(i), bloc: null,
        candidates: [], candidatesSource: '', candidatesSecondary: false, notesHe: ['RESEARCH ONLY: candidate roster not transcribed or verified.'] };
    }),
    agreements: review.agreements.pairs.map(([a, b], i) => ({ id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`], sourceId: review.agreements.sourceId })),
    blocs: [], officialSeats: Object.fromEntries(review.lists.map(l => [`${n}-${l.letters}`, l.officialSeats])),
    officialSeatsSourceId: review.resultsSourceId, sourceIds: [review.resultsSourceId, review.agreements.sourceId],
    buildInfo: { builtAt: review.reviewedOn, rawSha256: {} },
  };
}
