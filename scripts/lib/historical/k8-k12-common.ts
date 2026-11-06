// Retained national evidence and release gates for K8–K12.
// Only releasedDataset may promote a fully checked fixture to public data.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { ISRAEL_1973, ISRAEL_1977 } from '../../../src/engine/rules.ts';
import { agreementRecords, listRecord, officialSeatsOf } from '../build/records.ts';
import { candidateId, notSeatedNoteHe, notSeatedRanks, rosterFlags } from '../build/roster.ts';
import { indexEntry, manifest, OUT, RAW, rawJson, verifySources } from '../build/sources.ts';
import { allocateDataset, checkAgreementPairs, checker, checkNationalTable, type Check } from '../build/validate.ts';

export type HistoricalId = 'k8' | 'k9' | 'k10' | 'k11' | 'k12';
export interface ReviewedRoster {
  letters: string;
  complete: boolean;
  publishedCount: number;
  pages: number[];
  candidates: { rank: number; nameHe: string; page: number }[];
  electedCrossCheck?: { sourceId: string; pages: number[]; ranks: number[]; namesHe?: string[]; notSeated?: { rank: number; note: string }[]; spellingVariants?: { rank: number; candidateNameHe: string; electedNameHe: string; note: string }[]; note?: string };
}
export interface Review {
  id: HistoricalId;
  reviewedOn: string;
  resultsSourceId: string;
  resultsIssue: number;
  resultsPages: number[];
  gazetteTotals: { valid: number; invalid: number; registered: null; votesCast: null };
  supplementalTotals: { registered: number; votesCast: number; sourceId: string };
  lists: { id?: string; letters: string; nameHe: string; gazetteVotes: number; officialSeats: number }[];
  agreements: { sourceId: string; issue?: number; page: number | null; complete: boolean; pairs: [string, string][] };
  candidateChecks: { completeWinningRostersVerified: boolean; lists: { letters: string; publishedCount: number; first: { rank: number; nameHe: string }; pages: number[]; scope: string }[] };
  sourceIds: string[];
  releaseBlockers: string[];
  allocationCheck: { exact: boolean; differences: { letters: string; computed: number; official: number }[]; note: string };
}
export interface Audit { review: Review; rosters: ReviewedRoster[]; releaseReady: boolean }
export interface VerifyOptions { log?: boolean; available?: boolean }

/** An election-specific exception to the shared gate, kept in that election's module (k9). */
export interface EvidenceExtension {
  /** Error-message prefix (default "k8–k12 evidence"). */
  label?: string;
  /** An elected cross-check that may cite a source other than the results gazette. */
  acceptsElectedSource?: (roster: ReviewedRoster, check: NonNullable<ReviewedRoster['electedCrossCheck']>) => boolean;
  /** Further checks on the reviewed evidence, run after the shared roster checks. */
  verify?: (review: Review, rosters: ReviewedRoster[], check: Check) => void;
}

const dates = { k8: '1973-12-31', k9: '1977-05-17', k10: '1981-06-30', k11: '1984-07-23', k12: '1988-11-01' };
/** k8–k12 place roster flags right after candidates. */
const LIST_KEYS = ['id', 'letters', 'nameHe', 'shortHe', 'shortEn', 'sponsorsHe', 'partiesHe', 'votes', 'withdrawn', 'color', 'bloc', 'candidates',
  'candidatesTruncated', 'candidatesUnavailable', 'candidatesSource', 'candidatesSecondary', 'notesHe'];

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
      const roster = rosters.find(c => c.letters === l.letters);
      // registered candidates ranked above the last elected member whom the results notice omits
      const notSeated = notSeatedRanks(roster?.electedCrossCheck?.ranks ?? [], (roster?.candidates ?? []).map(c => c.rank));
      // A reviewed id preserves saved-scenario keys after ballot-letter corrections (k10).
      return { ...listRecord(n, i, { letters: l.id?.slice(String(n).length + 1) ?? l.letters, nameHe: l.nameHe, votes: l.gazetteVotes,
        candidates: (roster?.candidates ?? []).map(c => ({ id: candidateId(l.id ?? `${n}-${l.letters}`, c.rank), rank: c.rank, nameHe: c.nameHe, ...(notSeated.has(c.rank) ? { notSeated: true as const } : {}) })),
        ...rosterFlags(!roster ? 'unavailable' : roster.complete ? 'complete' : 'truncated', 'when-set'),
        candidatesSource: `${r.id}-candidates-gazette`,
        notesHe: roster ? roster.candidates.filter(c => notSeated.has(c.rank)).map(notSeatedNoteHe) : ['RESEARCH ONLY: official roster exists but has not been transcribed.'] }, LIST_KEYS), letters: l.letters };
    }),
    agreements: agreementRecords(n, r.agreements.pairs, r.agreements.sourceId),
    blocs: [], officialSeats: officialSeatsOf(n, r.lists.map(l => ({ letters: l.id?.slice(String(n).length + 1) ?? l.letters, seats: l.officialSeats }))),
    officialSeatsSourceId: r.resultsSourceId, sourceIds: [...r.sourceIds, `${r.id}-national-reviewed`], hasLocalities: false,
    buildInfo: { builtAt: r.reviewedOn, rawSha256: {} },
  };
}

export function verifyHistoricalProgress(id: HistoricalId, opts: VerifyOptions = {}, ext: EvidenceExtension = {}): Audit {
  const check: Check = checker(ext.label ?? 'k8–k12 evidence');
  const r: Review = rawJson(`${id}/national.reviewed.json`);
  check(r.id === id, `${id}: wrong review id`);
  verifySources([...r.sourceIds, `${id}-national-reviewed`], check);
  const t = r.supplementalTotals;
  checkNationalTable(check, id, r.lists.map(l => ({ letters: l.letters, nameHe: l.nameHe, votes: l.gazetteVotes, seats: l.officialSeats })),
    { valid: r.gazetteTotals.valid, invalid: r.gazetteTotals.invalid, votesCast: t.votesCast, registered: t.registered });
  checkAgreementPairs(check, id, r.agreements.pairs, r.lists.map(l => l.letters));
  check(!r.agreements.complete || r.agreements.page !== null, `${id}: complete notice needs a page citation`);

  const rosterFile = join(RAW, id, 'candidates.reviewed.json');
  const rosters: ReviewedRoster[] = existsSync(rosterFile) ? rawJson(`${id}/candidates.reviewed.json`).lists : [];
  check(!rosters.length || r.sourceIds.includes(`${id}-candidates-reviewed`), `${id}: reviewed roster must be hashed in sourceIds`);
  check(new Set(rosters.map(c => c.letters)).size === rosters.length, `${id}: duplicate roster`);
  for (const c of rosters) {
    check(r.lists.some(l => l.letters === c.letters), `${id}: unknown roster letters`);
    check(c.publishedCount > 0 && c.candidates.length <= c.publishedCount && c.complete === (c.candidates.length === c.publishedCount), `${id}: incorrect roster coverage`);
    check(c.candidates.every((v, i) => v.rank === i + 1 && v.nameHe.trim() && c.pages.includes(v.page)), `${id}: rank/name/page missing`);
    const e = c.electedCrossCheck;
    if (e) {
      const seats = r.lists.find(l => l.letters === c.letters)!.officialSeats;
      const cited = (e.sourceId === r.resultsSourceId && e.pages.length > 0) || !!ext.acceptsElectedSource?.(c, e);
      // elected registered ranks, strictly increasing; a gap is a registered candidate the notice
      // did not seat, and must carry a reason (e.g. k12 Likud #25)
      check(cited && e.ranks.length === seats && e.ranks.every((rank, i) => Number.isInteger(rank) && rank >= 1 && (i === 0 || rank > e.ranks[i - 1])) && e.ranks[e.ranks.length - 1] <= c.candidates.length, `${id}: invalid elected-rank cross-check`);
      const gaps = c.candidates.filter(v => v.rank < e.ranks[e.ranks.length - 1] && !e.ranks.includes(v.rank)).map(v => v.rank);
      check(JSON.stringify(gaps) === JSON.stringify((e.notSeated ?? []).map(x => x.rank)) && (e.notSeated ?? []).every(x => x.note), `${id}: unexplained elected-rank gap ${c.letters} ${gaps.join(',')}`);
      check(e.namesHe?.length === seats, `${id}: missing elected-name transcription`);
      for (const [i, name] of e.namesHe.entries()) {
        const rank = e.ranks[i];
        const candidate = c.candidates[rank - 1]?.nameHe;
        check(candidate && (candidate === name || e.spellingVariants?.some(v => v.rank === rank && v.candidateNameHe === candidate && v.electedNameHe === name && v.note)), `${id}: unchecked elected-name difference ${c.letters} #${rank}`);
      }
    }
  }
  ext.verify?.(r, rosters, check);
  const coverage = r.lists.filter(l => l.officialSeats > 0).every(l => {
    const c = rosters.find(c => c.letters === l.letters);
    return c && c.candidates.length >= l.officialSeats && c.electedCrossCheck?.namesHe?.length === l.officialSeats;
  });
  const releaseReady = coverage && r.agreements.complete && r.allocationCheck.exact && r.releaseBlockers.length === 0;
  check(r.candidateChecks.completeWinningRostersVerified === coverage, `${id}: incorrect winning-roster coverage claim`);
  const audit: Audit = { review: r, rosters, releaseReady };
  const allocation = allocateDataset(researchDataset(audit));
  check(allocation.seatsAllocated === 120 && allocation.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  // Recorded as evidence: an inexact reproduction is a release blocker, never adjusted to match.
  const differences = r.lists.flatMap(l => {
    const computed = allocation.lists.find(x => x.id === (l.id ?? `${id.slice(1)}-${l.letters}`))!.seats;
    return computed === l.officialSeats ? [] : [{ letters: l.letters, computed, official: l.officialSeats }];
  });
  check(JSON.stringify(differences) === JSON.stringify(r.allocationCheck.differences), `${id}: allocation diagnostic changed`);
  check(r.allocationCheck.exact === (differences.length === 0), `${id}: incorrect exact-reproduction claim`);
  const entry = indexEntry(id);
  check(entry && (!(opts.available ?? entry.available) || releaseReady), `${id}: release blocked: ${r.releaseBlockers.join(' ')}`);
  if (!releaseReady) check(!existsSync(join(OUT, `${id}.json`)) && !existsSync(join(OUT, `${id}-localities.json`)), `${id}: blocked research fixture must not be published`);
  if (opts.log !== false) console.log(`${id}: ${r.allocationCheck.exact ? 'all gazetted seats reproduced' : 'allocation NOT reproduced'}; ${releaseReady ? 'RELEASE READY' : 'UNAVAILABLE — ' + r.releaseBlockers.join(' ')}`);
  return audit;
}

/** National-only release from the retained, hashed review; no scratch dependency. */
export function releasedDataset(audit: Audit): ElectionDataset {
  const check: Check = checker('k8–k12 evidence');
  check(audit.releaseReady, `${audit.review.id}: release blocked`);
  const ds = researchDataset(audit);
  const entry = indexEntry(ds.id)!;
  ds.nameHe = entry.nameHe; ds.nameEn = entry.nameEn;
  ds.status = { ...entry.status, asOf: audit.review.reviewedOn } as ElectionDataset['status'];
  // research markers are dropped; not-seated explanations are kept
  ds.lists.forEach(l => { l.notesHe = l.notesHe.filter(n => !n.startsWith('RESEARCH ONLY')); });
  // rawSha256 follows manifest order (not sourceIds order) in these datasets
  ds.buildInfo = { builtAt: new Date().toISOString(), rawSha256: Object.fromEntries(manifest().filter(s => ds.sourceIds.includes(s.id)).map(s => [s.id, s.sha256!])) };
  return ds;
}
export function buildHistorical(id: HistoricalId, options: VerifyOptions = {}) {
  const audit = verifyHistoricalProgress(id, options);
  return audit.releaseReady ? [() => ({ ds: releasedDataset(audit), loc: null })] : [];
}
