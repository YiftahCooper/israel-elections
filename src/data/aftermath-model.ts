import type { ElectionDataset, ElectionId } from './schema.ts';
import type { GovernmentSupport } from './aftermath.ts';
export interface Cite { source: string; quote: string; locator?: string; note?: string }
export interface HistorySource { url: string; publisher?: string; publisherHe?: string; title?: string; kind: string; accessed: string; via?: string }
export interface DatedFact { date: string; endDate?: string; textEn: string; textHe: string; cites: Cite[]; notes?: string[]; type?: string; category?: string; person?: string; days?: number }
export interface RecommendationEntry { letters: string; seats: number; status: string; nominee?: string; split?: { nominee?: string; status?: string; seats: number }[]; cites?: Cite[]; noteEn?: string; noteHe?: string }
export interface RecommendationRound { id: string; date: string; endDate?: string; nominees: Record<string, { nameEn: string; nameHe: string }>; entries: RecommendationEntry[]; totals: Record<string, number>; cites: Cite[]; notes?: string[] }
export type GovernmentChange = DatedFact & Partial<GovernmentSupport> & { number?: number; coalitionSeatsNote?: string; roleGap?: string };
export interface Government extends GovernmentSupport { number: number; nameEn: string; nameHe: string; startDate: string; endDate?: string; primeMinisters: { nameEn: string; nameHe: string; from: string; to?: string }[]; coalitionSeatsNote?: string; roleGap?: string; cites: Cite[]; endDateCites?: Cite[]; changes?: GovernmentChange[]; notes?: string[] }
export interface Poll { date?: string; timing?: string; sourceId: string; questionEn?: string; questionHe?: string; populationEn?: string; populationHe?: string; fieldDates?: { from: string; to: string }; answers: { labelEn: string; labelHe?: string; pct: number }[]; cites?: Cite[] }
export interface Aftermath { schemaVersion: number; electionId: ElectionId; status: string; reviewedAt: string; sources: Record<string, HistorySource>; results: { electionDate: string }; recommendationRounds: RecommendationRound[]; formation: { events: DatedFact[]; conflicts?: unknown[] }; government?: Government; reaction?: { items: DatedFact[] }; term: { events: DatedFact[]; candidatesPending: { label: string; date?: string; why: string }[]; endedBy?: DatedFact & { nextElection?: ElectionId }; inclusionRule?: string }; issuePolling?: { status: string; items?: Poll[] } }
export function recommendationPieces(round: RecommendationRound) {
  return round.entries.flatMap(e => (e.split ?? [{ nominee: e.nominee, status: e.status, seats: e.seats }]).map(p => ({ ...p, letters: e.letters, group: p.nominee ?? p.status ?? 'unknown', cites: e.cites ?? round.cites })));
}
// The audit establishes chronology independence. This guard also stops a later single-source
// candidate or repeated citation to one source from leaking onto the history page.
export const visibleTermEvents = (events: DatedFact[]) => events.filter(e => new Set(e.cites?.map(c => c.source)).size >= 2);
export const completePolls = (data: Aftermath) => data.issuePolling?.status === 'filled' ? (data.issuePolling.items ?? []).filter(p => p.questionEn && p.questionHe && p.populationEn && p.populationHe && p.fieldDates && p.answers.every(a => a.labelHe)) : [];
export function validateAftermath(data: Aftermath, ds: ElectionDataset): string[] {
  const errors: string[] = [];
  const checkSeats = (e: { letters: string; seats: number }) => {
    const list = ds.lists.find(l => l.letters === e.letters);
    if (!list) errors.push(`Unknown letters: ${e.letters}`);
    else if (ds.officialSeats?.[list.id] !== e.seats) errors.push(`Seat mismatch: ${e.letters}`);
  };
  for (const round of data.recommendationRounds) {
    round.entries.forEach(checkSeats);
    const totals: Record<string, number> = {};
    for (const p of recommendationPieces(round)) totals[p.group] = (totals[p.group] ?? 0) + p.seats;
    for (const key of new Set([...Object.keys(totals), ...Object.keys(round.totals)])) if (totals[key] !== round.totals[key]) errors.push(`Total mismatch: ${round.id}/${key}`);
    if (Object.values(totals).reduce((a, b) => a + b, 0) !== 120) errors.push(`Not 120: ${round.id}`);
  }
  // R4 seat counts describe actual participation; an elected list is only the upper envelope.
  // Role totals and confidence bridges are validated separately by R4's shared build validator.
  if (data.government) for (const snapshot of [data.government, ...(data.government.changes ?? [])]) {
    for (const entry of snapshot.coalition ?? []) {
      if (!entry.letters) continue;
      const list = ds.lists.find(l => l.letters === entry.letters);
      if (!list) errors.push(`Unknown letters: ${entry.letters}`);
      else {
        const official = ds.officialSeats?.[list.id];
        if (entry.electionListSeats !== undefined && entry.electionListSeats !== official) errors.push(`Election seat mismatch: ${entry.letters}`);
        if (entry.seats !== null && (entry.seats < 0 || (official !== undefined && entry.seats > official))) errors.push(`Participation seat mismatch: ${entry.letters}`);
      }
    }
  }
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      if ('quote' in o && typeof o.source === 'string' && !data.sources[o.source]) errors.push(`Missing source: ${o.source}`);
      Object.values(o).forEach(walk);
    }
  };
  walk(data);
  for (const source of Object.values(data.sources)) if (new URL(source.url).hostname === 'en.wikipedia.org') errors.push('Forbidden source');
  return errors;
}
