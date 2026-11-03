// Retained national evidence and release gates for K8–K12.
// Only releasedDataset may promote a fully checked fixture to public data.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { ISRAEL_1973, ISRAEL_1977 } from '../../../src/engine/rules.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';
import { META, neutralColor } from '../list-meta.ts';

const ROOT = join(import.meta.dirname, '../../..');
const RAW = join(ROOT, 'data/raw');
export type HistoricalId = 'k8' | 'k9' | 'k10' | 'k11' | 'k12';
export interface ReviewedRoster {
  letters: string;
  complete: boolean;
  publishedCount: number;
  pages: number[];
  candidates: { rank: number; nameHe: string; page: number }[];
  electedCrossCheck?: { sourceId: string; pages: number[]; ranks: number[]; namesHe?: string[]; spellingVariants?: { rank: number; candidateNameHe: string; electedNameHe: string; note: string }[]; note?: string };
}
export interface Review {
  id: HistoricalId;
  reviewedOn: string;
  resultsSourceId: string;
  resultsIssue: number;
  resultsPages: number[];
  gazetteTotals: { valid: number; invalid: number; registered: null; votesCast: null };
  supplementalTotals: { registered: number; votesCast: number; sourceId: string };
  lists: { letters: string; nameHe: string; gazetteVotes: number; officialSeats: number }[];
  agreements: { sourceId: string; issue?: number; page: number | null; complete: boolean; pairs: [string, string][] };
  candidateChecks: { completeWinningRostersVerified: boolean; lists: { letters: string; publishedCount: number; first: { rank: number; nameHe: string }; pages: number[]; scope: string }[] };
  sourceIds: string[];
  releaseBlockers: string[];
  allocationCheck: { exact: boolean; differences: { letters: string; computed: number; official: number }[]; note: string };
}
export interface Audit { review: Review; rosters: ReviewedRoster[]; releaseReady: boolean }
export interface VerifyOptions { log?: boolean; available?: boolean }
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex');
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`k8–k12 evidence: ${message}`);
}
const whole = (n: number) => Number.isSafeInteger(n) && n >= 0;
const dates = { k8: '1973-12-31', k9: '1977-05-17', k10: '1981-06-30', k11: '1984-07-23', k12: '1988-11-01' };

/** A scenario fixture, explicitly not a released dataset. Roster omissions are marked
 * as untranscribed in notes, not falsely declared unavailable from the archives. */
export function researchDataset({ review: r, rosters }: Audit): ElectionDataset {
  const n = Number(r.id.slice(1));
  return {
    schemaVersion: 1, id: r.id, knesset: n, electionDate: dates[r.id],
    nameHe: `בדיקת מחקר בלבד — הכנסת ה-${n}`, nameEn: 'RESEARCH ONLY — not a release dataset',
    status: { stage: 'official-final', asOf: r.reviewedOn, noteHe: 'בדיקת מחקר בלבד. רשימות מועמדים מלאות טרם אומתו.', noteEn: `Research fixture only. ${r.releaseBlockers.join(' ')}` },
    ruleSetId: r.id === 'k9' ? ISRAEL_1977.id : ISRAEL_1973.id,
    totals: { registered: r.supplementalTotals.registered, votesCast: r.supplementalTotals.votesCast, valid: r.gazetteTotals.valid, invalid: r.gazetteTotals.invalid, ballotBoxes: 0, localities: 0 },
    lists: r.lists.map((l, i) => {
      const id = `${n}-${l.letters}`; const meta = META[id];
      const roster = rosters.find(c => c.letters === l.letters);
      return { id, letters: l.letters, nameHe: l.nameHe, shortHe: meta?.he ?? l.nameHe, shortEn: meta?.en ?? null,
        sponsorsHe: '', partiesHe: null, votes: l.gazetteVotes, withdrawn: false, color: meta?.color ?? neutralColor(i), bloc: null,
        candidates: (roster?.candidates ?? []).map(c => ({ id: `${id}#${c.rank}`, rank: c.rank, nameHe: c.nameHe })),
        ...(roster && !roster.complete ? { candidatesTruncated: true } : {}),
        ...(!roster ? { candidatesUnavailable: true } : {}),
        candidatesSource: `${r.id}-candidates-gazette`, candidatesSecondary: false,
        notesHe: roster ? [] : ['RESEARCH ONLY: official roster exists but has not been transcribed.'] };
    }),
    agreements: r.agreements.pairs.map(([a, b], i) => ({ id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`], sourceId: r.agreements.sourceId })),
    blocs: [], officialSeats: Object.fromEntries(r.lists.map(l => [`${n}-${l.letters}`, l.officialSeats])),
    officialSeatsSourceId: r.resultsSourceId, sourceIds: [...r.sourceIds, `${r.id}-national-reviewed`], hasLocalities: false,
    buildInfo: { builtAt: r.reviewedOn, rawSha256: {} },
  };
}

export function verifyHistoricalProgress(id: HistoricalId, opts: VerifyOptions = {}): Audit {
  const r: Review = readJson(join(RAW, id, 'national.reviewed.json'));
  const manifest = readJson(join(RAW, 'SOURCES.json')) as { id: string; file: string; sha256: string }[];
  assert(r.id === id, `${id}: wrong review id`);
  for (const sourceId of [...r.sourceIds, `${id}-national-reviewed`]) {
    const s = manifest.find(s => s.id === sourceId);
    assert(s?.file && s.sha256, `${id}: missing source ${sourceId}`);
    assert(hash(readFileSync(join(RAW, s.file))) === s.sha256, `${sourceId}: source hash changed`);
  }
  assert(new Set(r.lists.map(l => l.letters)).size === r.lists.length, `${id}: duplicate ballot letters`);
  assert(r.lists.every(l => l.letters && l.nameHe && whole(l.gazetteVotes) && whole(l.officialSeats)), `${id}: invalid national row`);
  assert(r.lists.reduce((s, l) => s + l.gazetteVotes, 0) === r.gazetteTotals.valid, `${id}: list votes do not sum to valid`);
  assert(r.lists.reduce((s, l) => s + l.officialSeats, 0) === 120, `${id}: gazetted seats do not sum to 120`);
  const t = r.supplementalTotals;
  assert(whole(t.registered) && whole(t.votesCast) && t.registered >= t.votesCast, `${id}: invalid CBS totals`);
  assert(r.gazetteTotals.valid + r.gazetteTotals.invalid === t.votesCast, `${id}: cast ≠ valid + invalid`);
  const members = r.agreements.pairs.flat();
  assert(r.agreements.pairs.every(p => p.length === 2) && new Set(members).size === members.length && members.every(m => r.lists.some(l => l.letters === m)), `${id}: invalid agreement membership`);
  assert(!r.agreements.complete || r.agreements.page !== null, `${id}: complete notice needs a page citation`);

  const rosterFile = join(RAW, id, 'candidates.reviewed.json');
  const rosters: ReviewedRoster[] = existsSync(rosterFile) ? readJson(rosterFile).lists : [];
  assert(!rosters.length || r.sourceIds.includes(`${id}-candidates-reviewed`), `${id}: reviewed roster must be hashed in sourceIds`);
  assert(new Set(rosters.map(c => c.letters)).size === rosters.length, `${id}: duplicate roster`);
  for (const c of rosters) {
    assert(r.lists.some(l => l.letters === c.letters), `${id}: unknown roster letters`);
    assert(c.publishedCount > 0 && c.candidates.length <= c.publishedCount && c.complete === (c.candidates.length === c.publishedCount), `${id}: incorrect roster coverage`);
    assert(c.candidates.every((v, i) => v.rank === i + 1 && v.nameHe.trim() && c.pages.includes(v.page)), `${id}: rank/name/page missing`);
    const e = c.electedCrossCheck;
    if (e) {
      const seats = r.lists.find(l => l.letters === c.letters)!.officialSeats;
      assert(e.sourceId === r.resultsSourceId && e.pages.length && e.ranks.length === seats && e.ranks.every((rank, i) => rank === i + 1), `${id}: invalid elected-rank cross-check`);
      assert(e.namesHe?.length === seats, `${id}: missing elected-name transcription`);
      for (const [i, name] of e.namesHe.entries()) {
        const candidate = c.candidates[i]?.nameHe;
        assert(candidate && (candidate === name || e.spellingVariants?.some(v => v.rank === i + 1 && v.candidateNameHe === candidate && v.electedNameHe === name && v.note)), `${id}: unchecked elected-name difference ${c.letters} #${i + 1}`);
      }
    }
  }
  const coverage = r.lists.filter(l => l.officialSeats > 0).every(l => {
    const c = rosters.find(c => c.letters === l.letters);
    return c && c.candidates.length >= l.officialSeats && c.electedCrossCheck?.namesHe?.length === l.officialSeats;
  });
  const releaseReady = coverage && r.agreements.complete && r.allocationCheck.exact && r.releaseBlockers.length === 0;
  assert(r.candidateChecks.completeWinningRostersVerified === coverage, `${id}: incorrect winning-roster coverage claim`);
  const audit: Audit = { review: r, rosters, releaseReady };
  const allocation = allocate(toEngineInput(scenarioFromDataset(researchDataset(audit))));
  assert(allocation.seatsAllocated === 120 && allocation.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  const differences = r.lists.flatMap(l => {
    const computed = allocation.lists.find(x => x.id === `${id.slice(1)}-${l.letters}`)!.seats;
    return computed === l.officialSeats ? [] : [{ letters: l.letters, computed, official: l.officialSeats }];
  });
  assert(JSON.stringify(differences) === JSON.stringify(r.allocationCheck.differences), `${id}: allocation diagnostic changed`);
  assert(r.allocationCheck.exact === (differences.length === 0), `${id}: incorrect exact-reproduction claim`);
  const entry = (readJson(join(ROOT, 'public/data/elections.json')) as { id: string; available: boolean }[]).find(e => e.id === id);
  assert(entry && (!(opts.available ?? entry.available) || releaseReady), `${id}: release blocked: ${r.releaseBlockers.join(' ')}`);
  if (!releaseReady) assert(!existsSync(join(ROOT, 'public/data', `${id}.json`)) && !existsSync(join(ROOT, 'public/data', `${id}-localities.json`)), `${id}: blocked research fixture must not be published`);
  if (opts.log !== false) console.log(`${id}: ${r.allocationCheck.exact ? 'all gazetted seats reproduced' : 'allocation NOT reproduced'}; ${releaseReady ? 'RELEASE READY' : 'UNAVAILABLE — ' + r.releaseBlockers.join(' ')}`);
  return audit;
}

/** National-only release from the retained, hashed review; no scratch dependency. */
export function releasedDataset(audit: Audit): ElectionDataset {
  assert(audit.releaseReady, `${audit.review.id}: release blocked`);
  const ds = researchDataset(audit);
  const entry = readJson(join(ROOT, 'public/data/elections.json')).find((e: {id: string}) => e.id === ds.id);
  ds.nameHe = entry.nameHe; ds.nameEn = entry.nameEn;
  ds.status = { ...entry.status, asOf: audit.review.reviewedOn };
  ds.lists.forEach(l => { l.notesHe = []; });
  const manifest = readJson(join(RAW, 'SOURCES.json')) as {id: string; sha256: string}[];
  ds.buildInfo = { builtAt: new Date().toISOString(), rawSha256: Object.fromEntries(manifest.filter(s => ds.sourceIds.includes(s.id)).map(s => [s.id, s.sha256])) };
  return ds;
}
export function buildHistorical(id: HistoricalId, options: VerifyOptions = {}) {
  const audit = verifyHistoricalProgress(id, options);
  return audit.releaseReady ? [() => ({ ds: releasedDataset(audit), loc: null })] : [];
}
