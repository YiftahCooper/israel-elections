// Checked national evidence preflight. These elections remain unavailable until every
// winning roster and the unresolved allocation inputs/rules pass the release gates.
// No diagnostic fixture returned here may be written to public/data.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { ISRAEL_1973 } from '../../../src/engine/rules.ts';
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
  electedCrossCheck?: { sourceId: string; pages: number[]; ranks: number[]; note?: string };
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
export interface Audit { review: Review; rosters: ReviewedRoster[]; releaseReady: false }
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
    ruleSetId: ISRAEL_1973.id,
    totals: { ...r.supplementalTotals, valid: r.gazetteTotals.valid, invalid: r.gazetteTotals.invalid, ballotBoxes: 0, localities: 0 },
    lists: r.lists.map((l, i) => {
      const id = `${n}-${l.letters}`; const meta = META[id];
      const roster = rosters.find(c => c.letters === l.letters);
      return { id, letters: l.letters, nameHe: l.nameHe, shortHe: meta?.he ?? l.nameHe, shortEn: meta?.en ?? null,
        sponsorsHe: '', partiesHe: null, votes: l.gazetteVotes, withdrawn: false, color: meta?.color ?? neutralColor(i), bloc: null,
        candidates: (roster?.candidates ?? []).map(c => ({ id: `${id}#${c.rank}`, rank: c.rank, nameHe: c.nameHe })),
        candidatesSource: `${r.id}-candidates-gazette`, candidatesSecondary: false,
        notesHe: roster ? [] : ['RESEARCH ONLY: official roster exists but has not been transcribed.'] };
    }),
    agreements: r.agreements.pairs.map(([a, b], i) => ({ id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`], sourceId: r.agreements.sourceId })),
    blocs: [], officialSeats: Object.fromEntries(r.lists.map(l => [`${n}-${l.letters}`, l.officialSeats])),
    officialSeatsSourceId: r.resultsSourceId, sourceIds: r.sourceIds, hasLocalities: false,
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
  assert(new Set(rosters.map(c => c.letters)).size === rosters.length, `${id}: duplicate roster`);
  for (const c of rosters) {
    assert(r.lists.some(l => l.letters === c.letters), `${id}: unknown roster letters`);
    assert(c.complete && c.candidates.length === c.publishedCount && c.publishedCount > 0, `${id}: incomplete reviewed roster`);
    assert(c.candidates.every((v, i) => v.rank === i + 1 && v.nameHe.trim() && c.pages.includes(v.page)), `${id}: rank/name/page missing`);
    const e = c.electedCrossCheck;
    assert(e && e.ranks.length === r.lists.find(l => l.letters === c.letters)!.officialSeats && e.ranks.every((rank, i) => rank === i + 1), `${id}: missing elected-rank cross-check`);
  }
  const audit: Audit = { review: r, rosters, releaseReady: false };
  const allocation = allocate(toEngineInput(scenarioFromDataset(researchDataset(audit))));
  assert(allocation.seatsAllocated === 120 && allocation.warnings.length === 0, `${id}: incomplete/ambiguous allocation`);
  const differences = r.lists.flatMap(l => {
    const computed = allocation.lists.find(x => x.id === `${id.slice(1)}-${l.letters}`)!.seats;
    return computed === l.officialSeats ? [] : [{ letters: l.letters, computed, official: l.officialSeats }];
  });
  assert(JSON.stringify(differences) === JSON.stringify(r.allocationCheck.differences), `${id}: allocation diagnostic changed`);
  assert(r.allocationCheck.exact === (differences.length === 0), `${id}: incorrect exact-reproduction claim`);
  const entry = (readJson(join(ROOT, 'public/data/elections.json')) as { id: string; available: boolean }[]).find(e => e.id === id);
  assert(entry && !(opts.available ?? entry.available), `${id}: release blocked: ${r.releaseBlockers.join(' ')}`);
  assert(!r.candidateChecks.completeWinningRostersVerified && r.releaseBlockers.length, `${id}: preflight is not a release builder`);
  assert(!existsSync(join(ROOT, 'public/data', `${id}.json`)) && !existsSync(join(ROOT, 'public/data', `${id}-localities.json`)), `${id}: blocked research fixture must not be published`);
  if (opts.log !== false) console.log(`${id}: ${r.allocationCheck.exact ? 'all gazetted seats reproduced' : 'allocation NOT reproduced'}; UNAVAILABLE — ${r.releaseBlockers.join(' ')}`);
  return audit;
}
