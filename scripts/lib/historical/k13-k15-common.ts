/** CI-safe release builder. Reviewed transcriptions and hashed scans are durable;
 * no PDF parser, downloads or scratch files are needed to rebuild. */
import type { ElectionDataset, ElectionId } from '../../../src/data/schema.ts';
import { scenarioFromDataset, validateScenario } from '../../../src/model/scenario.ts';
import { agreementRecords, listRecord, officialSeatsOf, seatOrder } from '../build/records.ts';
import { candidateId, notSeatedNoteHe, notSeatedRanks, rosterFlags } from '../build/roster.ts';
import { indexEntry, rawJson, verifySources } from '../build/sources.ts';
import { allocateDataset, checkAgreementPairs, checker, checkNationalTable, type Check } from '../build/validate.ts';

const assert: Check = checker('k13–k15 preflight');
export interface Review {
  id: ElectionId; reviewedOn: string; resultsSourceId: string; resultsPages: number[];
  gazetteTotals: { valid: number; invalid: number };
  supplementalTotals: { sourceId: string; registered: number; votesCast: number };
  lists: { letters: string; nameHe: string; votes: number; officialSeats: number; withdrawn?: boolean; withdrawalSourceId?: string; notesHe?: string[] }[];
  agreements: { sourceId: string | null; complete: boolean; pages: number[]; pairs: [string, string][] };
  discrepancies: unknown[]; releaseBlockers: string[]; hasLocalities: false; localityNote: string;
}
export interface RosterReview {
  id: ElectionId; sourceId: string; reviewedOn: string; allWinningElectedPrefixesVerified: boolean; note: string;
  lists: { letters: string; sourceId?: string; complete: boolean; publishedCount: number; gazettePages: number[];
    candidates: { rank: number; nameHe: string; page: number }[];
    electedCrossCheck: { resultsPages: number[]; checkedThroughRank: number; note: string; differences?: { electedRank: number; candidateRank: number; candidateNameHe: string; electedNameHe: string; reason: string }[] } }[];
}
export interface ElectedReview {
  id: ElectionId; sourceId: string; section: number;
  lists: { letters: string; resultsPages: number[]; names: string[]; candidateRanks: number[] }[];
}
export interface Audit {
  review: Review; rosters: RosterReview; elected: ElectedReview; rawSha256: Record<string, string>; releaseReady: true;
  seatDifferences: { letters: string; official: number; computed: number }[];
}
export interface VerifyOptions { log?: boolean }

export function verifyHistoricalProgress(id: 'k13' | 'k14' | 'k15', options: VerifyOptions = {}): Audit {
  const review = rawJson<Review>(`${id}/national.reviewed.json`);
  const rosters = rawJson<RosterReview>(`${id}/candidates.reviewed.json`);
  const elected = rawJson<ElectedReview>(`${id}/elected.reviewed.json`);
  assert(review.id === id && rosters.id === id && elected.id === id && elected.sourceId === review.resultsSourceId && elected.section === 4, `${id}: wrong evidence identity`);
  const rawSha256 = verifySources([review.resultsSourceId, review.supplementalTotals.sourceId, rosters.sourceId,
    `${id}-national-reviewed`, `${id}-rosters-reviewed`, `${id}-elected-reviewed`,
    ...rosters.lists.flatMap(l => l.sourceId ? [l.sourceId] : []),
    ...review.lists.flatMap(l => l.withdrawalSourceId ? [l.withdrawalSourceId] : []),
    'k13-k15-bader-ofer-amendment', 'k13-k15-threshold-amendment', ...(review.agreements.sourceId ? [review.agreements.sourceId] : [])], assert, { checkBytes: true });
  checkNationalTable(assert, id, review.lists.map(l => ({ letters: l.letters, nameHe: l.nameHe, votes: l.votes, seats: l.officialSeats })),
    { valid: review.gazetteTotals.valid, invalid: review.gazetteTotals.invalid, votesCast: review.supplementalTotals.votesCast, registered: review.supplementalTotals.registered });
  checkAgreementPairs(assert, id, review.agreements.pairs, review.lists.map(l => l.letters));
  assert(review.agreements.sourceId !== null || review.agreements.pairs.length === 0, `${id}: unsourced agreement`);
  assert(new Set(rosters.lists.map(l => l.letters)).size === rosters.lists.length, `${id}: duplicate roster`);
  for (const list of rosters.lists) {
    assert(review.lists.some(l => l.letters === list.letters), `${id}: unknown roster ${list.letters}`);
    assert(list.candidates.length > 0 && list.candidates.length <= list.publishedCount, `${id}: invalid roster size`);
    assert(list.complete === (list.candidates.length === list.publishedCount), `${id}: falsely complete roster`);
    assert(list.candidates.every((c, i) => c.rank === i + 1 && c.nameHe.trim() && list.gazettePages.includes(c.page)), `${id}: missing name, rank or page`);
    const won = review.lists.find(l => l.letters === list.letters)!.officialSeats;
    const members = elected.lists.find(e => e.letters === list.letters);
    if (id === 'k15' && review.lists.find(l => l.letters === list.letters)?.withdrawn) {
      assert(won === 0 && !members && list.complete && list.electedCrossCheck.checkedThroughRank === 0, `${id}: invalid withdrawn roster`);
      continue;
    }
    assert(members && members.names.length === won && members.candidateRanks.length === won, `${id}: incomplete elected names ${list.letters}`);
    assert(members.resultsPages.length > 0 && members.resultsPages.every(p => review.resultsPages.includes(p)), `${id}: invalid results page`);
    assert(JSON.stringify(members.resultsPages) === JSON.stringify(list.electedCrossCheck.resultsPages), `${id}: cross-check pages differ`);
    assert(list.electedCrossCheck.checkedThroughRank === Math.max(...members.candidateRanks), `${id}: incomplete elected-prefix check`);
    const normalize = (name: string) => name.replace(/[\s\-־–—׳’']/g, '');
    const differences = list.electedCrossCheck.differences ?? [];
    const used = new Set<number>();
    members.names.forEach((name, i) => {
      const rank = members.candidateRanks[i];
      assert(Number.isSafeInteger(rank) && rank > (members.candidateRanks[i - 1] ?? 0), `${id}: elected ranks out of order`);
      const candidate = list.candidates[rank - 1];
      assert(candidate && name.trim(), `${id}: elected candidate missing at ${list.letters}/${rank}`);
      if (normalize(candidate.nameHe) !== normalize(name)) {
        const d = differences.findIndex(d => d.electedRank === i + 1 && d.candidateRank === rank && d.candidateNameHe === candidate.nameHe && d.electedNameHe === name && d.reason.trim());
        assert(d >= 0, `${id}: unresolved elected name ${list.letters}/${rank}: ${candidate.nameHe} / ${name}`);
        used.add(d);
      }
    });
    assert(used.size === differences.length, `${id}: stale/duplicate name resolution`);
  }
  const winners = review.lists.filter(l => l.officialSeats > 0);
  assert(new Set(elected.lists.map(l => l.letters)).size === elected.lists.length && elected.lists.length === winners.length, `${id}: duplicate/extra elected lists`);
  const allWinningElectedPrefixesVerified = winners.every(l => rosters.lists.some(r => r.letters === l.letters && r.candidates.length >= l.officialSeats));
  assert(rosters.allWinningElectedPrefixesVerified && allWinningElectedPrefixesVerified, `${id}: winning elected-prefix coverage incomplete`);
  assert(review.releaseBlockers.length === 0 && review.hasLocalities === false, `${id}: unresolved release blocker or locality claim`);
  const audit: Audit = { review, rosters, elected, rawSha256, releaseReady: true, seatDifferences: [] };
  const ds = historicalDataset(audit);
  const s = scenarioFromDataset(ds);
  assert(validateScenario(JSON.parse(JSON.stringify(s))).length === 0, `${id}: invalid historical scenario`);
  const result = allocateDataset(ds);
  assert(result.seatsAllocated === 120 && result.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  audit.seatDifferences = result.lists.filter(l => l.seats !== ds.officialSeats![l.id]).map(l => ({ letters: ds.lists.find(x => x.id === l.id)!.letters, official: ds.officialSeats![l.id], computed: l.seats }));
  // Missing agreements are NOT reverse-engineered to obtain a matching result.
  assert(audit.seatDifferences.length === 0, `${id}: sourced inputs do not reproduce every official seat`);
  const entry = indexEntry(id);
  assert(entry?.available, `${id}: missing election index`);
  if (options.log !== false) console.log(`${id}: READY — all elected names cross-checked; every official seat reproduced.`);
  return audit;
}

/** Original registered rank order; omissions in the elected notice are explicit in reviewed evidence. */
/** k13–k15 place roster flags after candidatesSecondary. */
const LIST_KEYS = ['id', 'letters', 'nameHe', 'shortHe', 'shortEn', 'sponsorsHe', 'partiesHe', 'votes', 'withdrawn', 'color', 'bloc', 'candidates',
  'candidatesSource', 'candidatesSecondary', 'candidatesTruncated', 'candidatesUnavailable', 'notesHe'];

export function historicalDataset({ review, rosters, rawSha256 }: Audit): ElectionDataset {
  const n = Number(review.id.slice(1));
  const elected = rawJson<ElectedReview>(`${review.id}/elected.reviewed.json`);
  return {
    schemaVersion: 1, id: review.id, knesset: n,
    electionDate: n === 13 ? '1992-06-23' : n === 14 ? '1996-05-29' : '1999-05-17',
    nameHe: `הבחירות לכנסת ה-${n}`, nameEn: `Election to the ${n === 13 ? "13th" : n === 14 ? "14th" : "15th"} Knesset`,
    status: releaseStatus(review.id),
    ruleSetId: 'il-1992-bader-ofer-1.5', hasLocalities: false,
    // Zero geographic counts mean no geography supplied in this dataset, not an official count.
    totals: { ...review.gazetteTotals, registered: review.supplementalTotals.registered, votesCast: review.supplementalTotals.votesCast, ballotBoxes: 0, localities: 0 },
    lists: seatOrder(review.lists.map((l, i) => {
      const id = `${n}-${l.letters}`;
      const roster = rosters.lists.find(r => r.letters === l.letters);
      // candidates ranked above the last elected member but absent from the notice's elected names
      const notSeated = notSeatedRanks(elected.lists.find(x => x.letters === l.letters)?.candidateRanks ?? [], (roster?.candidates ?? []).map(c => c.rank));
      const record = listRecord(n, i, { letters: l.letters, nameHe: l.nameHe, votes: l.votes, withdrawn: l.withdrawn === true,
        candidates: roster?.candidates.map(c => ({ id: candidateId(id, c.rank), rank: c.rank, nameHe: c.nameHe, ...(notSeated.has(c.rank) ? { notSeated: true } : {}) })) ?? [],
        candidatesSource: roster ? (roster.sourceId ?? rosters.sourceId) : '',
        ...rosterFlags(!roster ? 'unavailable' : roster.complete ? 'complete' : 'truncated', 'explicit'),
        notesHe: [...(l.notesHe ?? []), ...(roster?.candidates ?? []).filter(c => notSeated.has(c.rank)).map(c => n === 14 && l.letters === 'אמת' && c.rank === 18 ? 'נמיר אורה (מקום 18) התפטרה ב־21 במאי 1996 (י״פ 4411 עמ׳ 3398); אינה מופיעה בין הנבחרים והדירוג המקורי נשמר.' : notSeatedNoteHe(c))] }, LIST_KEYS);
      return record;
    })),
    agreements: agreementRecords(n, review.agreements.pairs, review.agreements.sourceId!),
    blocs: [], officialSeats: officialSeatsOf(n, review.lists.map(l => ({ letters: l.letters, seats: l.officialSeats }))),
    officialSeatsSourceId: review.resultsSourceId, sourceIds: Object.keys(rawSha256),
    buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
}

/** Shared by the public dataset and picker entry, preventing divergent coverage claims. */
export function releaseStatus(id: ElectionId): ElectionDataset['status'] {
  const entry = indexEntry(id);
  assert(entry?.status.stage === 'official-final', `${id}: index release status missing`);
  return { ...entry.status, stage: 'official-final', asOf: '2026-11-03' };
}

export function historicalBuildJobs(id: 'k13' | 'k14' | 'k15', options: VerifyOptions = {}) {
  const audit = verifyHistoricalProgress(id, options);
  return [() => ({ ds: historicalDataset(audit), loc: undefined })];
}
