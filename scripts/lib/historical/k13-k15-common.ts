/** CI-safe release builder. Reviewed transcriptions and hashed scans are durable;
 * no PDF parser, downloads or scratch files are needed to rebuild. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset, ElectionId } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../../../src/model/scenario.ts';
import { META, neutralColor } from '../list-meta.ts';

const ROOT = join(import.meta.dirname, '../../..');
const json = <T>(file: string): T => JSON.parse(readFileSync(join(ROOT, file), 'utf8'));
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`k13–k15 preflight: ${message}`);
}
interface Source { id: string; file: string; sha256: string; bytes: number }
export interface Review {
  id: ElectionId; reviewedOn: string; resultsSourceId: string; resultsPages: number[];
  gazetteTotals: { valid: number; invalid: number };
  supplementalTotals: { sourceId: string; registered: number; votesCast: number };
  lists: { letters: string; nameHe: string; votes: number; officialSeats: number }[];
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
  const review = json<Review>(`data/raw/${id}/national.reviewed.json`);
  const rosters = json<RosterReview>(`data/raw/${id}/candidates.reviewed.json`);
  const elected = json<ElectedReview>(`data/raw/${id}/elected.reviewed.json`);
  assert(review.id === id && rosters.id === id && elected.id === id && elected.sourceId === review.resultsSourceId && elected.section === 4, `${id}: wrong evidence identity`);
  const sources = json<Source[]>('data/raw/SOURCES.json');
  const sourceIds = [review.resultsSourceId, review.supplementalTotals.sourceId, rosters.sourceId,
    `${id}-national-reviewed`, `${id}-rosters-reviewed`, `${id}-elected-reviewed`,
    ...rosters.lists.flatMap(l => l.sourceId ? [l.sourceId] : []),
    'k13-k15-bader-ofer-amendment', 'k13-k15-threshold-amendment', ...(review.agreements.sourceId ? [review.agreements.sourceId] : [])];
  const rawSha256: Record<string, string> = {};
  for (const sourceId of new Set(sourceIds)) {
    const source = sources.find(s => s.id === sourceId);
    assert(source, `${id}: missing provenance ${sourceId}`);
    const bytes = readFileSync(join(ROOT, 'data/raw', source.file));
    assert(bytes.length === source.bytes && createHash('sha256').update(bytes).digest('hex') === source.sha256, `${id}: source changed: ${sourceId}`);
    rawSha256[sourceId] = source.sha256;
  }
  assert(review.lists.length > 0 && new Set(review.lists.map(l => l.letters)).size === review.lists.length, `${id}: duplicate/empty lists`);
  for (const l of review.lists) assert(l.nameHe && l.letters && Number.isSafeInteger(l.votes) && l.votes >= 0 && Number.isSafeInteger(l.officialSeats) && l.officialSeats >= 0, `${id}: invalid national row`);
  assert(review.lists.reduce((s, l) => s + l.votes, 0) === review.gazetteTotals.valid, `${id}: list votes do not sum to gazetted valid`);
  assert(review.gazetteTotals.valid + review.gazetteTotals.invalid === review.supplementalTotals.votesCast, `${id}: valid + invalid differs from CBS cast`);
  assert(review.supplementalTotals.registered >= review.supplementalTotals.votesCast, `${id}: turnout exceeds electorate`);
  assert(review.lists.reduce((s, l) => s + l.officialSeats, 0) === 120, `${id}: gazetted seats do not sum to 120`);
  const members = review.agreements.pairs.flat();
  assert(new Set(members).size === members.length && members.every(m => review.lists.some(l => l.letters === m)), `${id}: invalid/duplicate agreement member`);
  assert(review.agreements.pairs.every(p => p.length === 2) && (review.agreements.sourceId !== null || members.length === 0), `${id}: unsourced agreement`);
  assert(new Set(rosters.lists.map(l => l.letters)).size === rosters.lists.length, `${id}: duplicate roster`);
  for (const list of rosters.lists) {
    assert(review.lists.some(l => l.letters === list.letters), `${id}: unknown roster ${list.letters}`);
    assert(list.candidates.length > 0 && list.candidates.length <= list.publishedCount, `${id}: invalid roster size`);
    assert(list.complete === (list.candidates.length === list.publishedCount), `${id}: falsely complete roster`);
    assert(list.candidates.every((c, i) => c.rank === i + 1 && c.nameHe.trim() && list.gazettePages.includes(c.page)), `${id}: missing name, rank or page`);
    const won = review.lists.find(l => l.letters === list.letters)!.officialSeats;
    const members = elected.lists.find(e => e.letters === list.letters);
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
  const result = allocate(toEngineInput(s));
  assert(result.seatsAllocated === 120 && result.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  audit.seatDifferences = result.lists.filter(l => l.seats !== ds.officialSeats![l.id]).map(l => ({ letters: l.id.slice(3), official: ds.officialSeats![l.id], computed: l.seats }));
  // Missing agreements are NOT reverse-engineered to obtain a matching result.
  assert(audit.seatDifferences.length === 0, `${id}: sourced inputs do not reproduce every official seat`);
  const entry = json<{ id: string; available: boolean }[]>('public/data/elections.json').find(e => e.id === id);
  assert(entry?.available, `${id}: missing election index`);
  if (options.log !== false) console.log(`${id}: READY — all elected names cross-checked; every official seat reproduced.`);
  return audit;
}

/** Original registered rank order; omissions in the elected notice are explicit in reviewed evidence. */
export function historicalDataset({ review, rosters, rawSha256 }: Audit): ElectionDataset {
  const n = Number(review.id.slice(1));
  return {
    schemaVersion: 1, id: review.id, knesset: n,
    electionDate: n === 13 ? '1992-06-23' : n === 14 ? '1996-05-29' : '1999-05-17',
    nameHe: `הבחירות לכנסת ה-${n}`, nameEn: `Election to the ${n === 13 ? "13th" : n === 14 ? "14th" : "15th"} Knesset`,
    status: releaseStatus(review.id),
    ruleSetId: 'il-1992-bader-ofer-1.5', hasLocalities: false,
    // Zero geographic counts mean no geography supplied in this dataset, not an official count.
    totals: { ...review.gazetteTotals, registered: review.supplementalTotals.registered, votesCast: review.supplementalTotals.votesCast, ballotBoxes: 0, localities: 0 },
    lists: review.lists.map((l, i) => {
      const id = `${n}-${l.letters}`; const meta = META[id];
      const roster = rosters.lists.find(r => r.letters === l.letters);
      return { id, letters: l.letters, nameHe: l.nameHe, shortHe: meta?.he ?? l.nameHe, shortEn: meta?.en ?? null,
        sponsorsHe: '', partiesHe: null, votes: l.votes, withdrawn: false, color: meta?.color ?? neutralColor(i), bloc: null,
        candidates: roster?.candidates.map(c => ({ id: `${id}#${c.rank}`, rank: c.rank, nameHe: c.nameHe })) ?? [],
        candidatesSource: roster ? (roster.sourceId ?? rosters.sourceId) : '', candidatesSecondary: false,
        ...(roster ? { candidatesTruncated: !roster.complete } : { candidatesUnavailable: true }),
        notesHe: [] };
    }).sort((a, b) => (META[a.id]?.order ?? 999) - (META[b.id]?.order ?? 999) || b.votes - a.votes),
    agreements: review.agreements.pairs.map(([a, b], i) => ({ id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`], sourceId: review.agreements.sourceId! })),
    blocs: [], officialSeats: Object.fromEntries(review.lists.map(l => [`${n}-${l.letters}`, l.officialSeats])),
    officialSeatsSourceId: review.resultsSourceId, sourceIds: Object.keys(rawSha256),
    buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
}

/** Shared by the public dataset and picker entry, preventing divergent coverage claims. */
export function releaseStatus(id: ElectionId): ElectionDataset['status'] {
  const entries = json<{ id: ElectionId; status: { stage: string; noteHe: string; noteEn: string } }[]>('public/data/elections.json');
  const entry = entries.find(e => e.id === id);
  assert(entry?.status.stage === 'official-final', `${id}: index release status missing`);
  return { ...entry.status, stage: 'official-final', asOf: '2026-11-03' };
}

export function historicalBuildJobs(id: 'k13' | 'k14' | 'k15', options: VerifyOptions = {}) {
  const audit = verifyHistoricalProgress(id, options);
  return [() => ({ ds: historicalDataset(audit), loc: undefined })];
}
