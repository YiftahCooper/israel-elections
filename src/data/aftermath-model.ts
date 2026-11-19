import type { ElectionDataset, ElectionId } from './schema.ts';
import type { GovernmentSupport } from './aftermath.ts';
/** `noteHe` is the Hebrew wording of `note`, for the few notes written for readers in both languages. `citesRecord`
 *  names the official record a scholarly passage itself cites (docs/source-policy.md); the build's certainty check reads it.
 *  `ocr` keeps a newspaper passage as the archive's computer-read text of the scan gave it, never shown, so a scan check
 *  can find it and compare. Until checked, such a cite shows `quote` (an exact part of `ocr`) only where the text reads
 *  cleanly; otherwise `quote` is empty and readers get the paper, date and page. `scanChecked` (never shown) marks a newspaper cite read from the printed page image: its `quote` is the printed
 *  wording and `ocr` stays as the archive read it (docs/source-policy.md). */
export interface Cite { source: string; quote: string; locator?: string; note?: string; noteHe?: string; citesRecord?: string; ocr?: string; scanChecked?: boolean }
export interface HistorySource { url: string; publisher?: string; publisherHe?: string; title?: string; kind: string; accessed: string; via?: string; evidenceFamily?: string }
/** `orderDate`/`orderSeq` place an event among others of the same date, or a month- or year-only event among the days
 *  in it, from what the record's own sources say (`orderBasis`); they are never shown and never change `date`. */
export interface DatedFact { id?: string; date: string; endDate?: string; textEn: string; textHe: string; cites: Cite[]; notes?: string[]; type?: string; category?: string; person?: string; days?: number; orderDate?: string; orderSeq?: number; orderBasis?: string }
/** A recommendation entry's `status`: recommended (with `nominee`), none, other (named a party or a description, not a
 *  person, or did not take part), disputed (sources disagree; the entry carries `certainty: 'disputed'` and both sides),
 *  split, or unknown. `noteEn`/`noteHe` say any condition the list attached; they show in the row's (i). */
export interface RecommendationEntry { letters: string; seats: number; status: string; nominee?: string; split?: { nominee?: string; status?: string; seats: number; /** the faction of the list that took this part (Balad of the Joint List) */ partEn?: string; partHe?: string }[]; cites?: Cite[]; noteEn?: string; noteHe?: string; certainty?: string }
/** A newspaper page or article read while looking for the round's recommendations, found or not (never shown; the gaps
 *  register lists them so nobody reads them again). `searchNote` says what could not be read. */
export interface PageRead { paper: string; date: string; page?: number; url: string }
export interface RecommendationRound { id: string; date: string; endDate?: string; nominees: Record<string, { nameEn: string; nameHe: string }>; entries: RecommendationEntry[]; totals: Record<string, number>; cites: Cite[]; notes?: string[]; pagesRead?: PageRead[]; searchNote?: string }
/** `role` marks a prime minister who held the office in an acting or interim capacity; `titleEn`/`titleHe` are the
 *  office's title as the cited source gives it (the name never carries it). */
export interface PrimeMinister { nameEn: string; nameHe: string; from: string; to?: string; letters?: string; role?: 'acting' | 'interim'; titleEn?: string; titleHe?: string; cites?: Cite[]; notes?: string[] }
export type GovernmentChange = DatedFact & Partial<GovernmentSupport> & { number?: number; coalitionSeatsNote?: string; roleGap?: string };
export interface Government extends GovernmentSupport { number: number; nameEn: string; nameHe: string; startDate: string; endDate?: string; primeMinisters: PrimeMinister[]; coalitionSeatsNote?: string; roleGap?: string; cites: Cite[]; endDateCites?: Cite[]; changes?: GovernmentChange[]; notes?: string[] }
export interface Poll { date?: string; timing?: string; sourceId: string; questionEn?: string; questionHe?: string; populationEn?: string; populationHe?: string; fieldDates?: { from: string; to: string }; answers: { labelEn: string; labelHe?: string; pct: number }[]; cites?: Cite[] }
/** Sources that disagree on a formation fact: what each says, and how the record settles it. */
export interface Conflict { about: string; values: { value: string; source: string }[]; resolution: string; status?: string; cites?: Cite[] }
export interface Aftermath { schemaVersion: number; electionId: ElectionId; status: string; reviewedAt: string; sources: Record<string, HistorySource>; results: { electionDate: string }; recommendationRounds: RecommendationRound[]; formation: { events: DatedFact[]; conflicts?: Conflict[]; people?: Record<string, { nameEn: string; nameHe: string }> }; government?: Government; reaction?: { items: DatedFact[] }; term: { events: DatedFact[]; candidatesPending: { label: string; date?: string; why: string }[]; endedBy?: DatedFact & { nextElection?: ElectionId }; inclusionRule?: string }; issuePolling?: { status: string; items?: Poll[] } }
export function recommendationPieces(round: RecommendationRound) {
  return round.entries.flatMap(e => (e.split ?? [{ nominee: e.nominee, status: e.status, seats: e.seats }]).map(p => ({ ...p, letters: e.letters, group: p.nominee ?? p.status ?? 'unknown', cites: e.cites ?? round.cites, noteEn: e.noteEn, noteHe: e.noteHe })));
}
// The audit establishes chronology independence. This guard also stops a later single-source
// candidate or repeated citation to one source from leaking onto the history page.
export const visibleTermEvents = (events: DatedFact[]) => events.filter(e => new Set(e.cites?.map(c => c.source)).size >= 2);
/** Events in the order they happened (c-famous-early-05): by date, a month- or year-only date before the days in it,
 *  unless `orderDate` places it; same position: `orderSeq`, then the record's order. */
export function chronological<T extends DatedFact>(events: readonly T[]): T[] {
  const key = (e: T) => e.orderDate ?? e.date;
  const byKey = (a: T, b: T) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;
  return events.map((e, i) => [e, i] as const).sort(([a, i], [b, j]) => byKey(a, b) || (a.orderSeq ?? 0) - (b.orderSeq ?? 0) || i - j).map(([e]) => e);
}
/** The fact that ended the term, shown among the term's events (termWithEnd); null when it is unsourced or the formation or term list already
 *  shows it: the same day, and the same kind of event or a dissolution (c-design-principles-15: one place per fact). */
export function termEndFact(data: Aftermath) {
  const end = data.term.endedBy;
  if (!end?.cites?.length) return null;
  const same = (e: DatedFact) => e.date.length === 10 && e.date === end.date && (e.type === end.type || /dissol/.test(e.type ?? e.id ?? ''));
  return [...data.formation.events, ...visibleTermEvents(data.term.events)].some(same) ? null : end;
}
/** The term's events with the fact that ended it, in date order: one timeline, the end fact in its place by date. */
export const termWithEnd = <T extends DatedFact>(events: readonly T[], end: T | null | undefined): T[] => chronological(end ? [...events, end] : events);
/** A source's name: the publisher's own Hebrew name in Hebrew when recorded, else its name as recorded; the web
 *  address only when the record names no publisher or title (c-rtl-phone-06). */
export const sourceLabel = (s: HistorySource, lang: 'he' | 'en') => (lang === 'he' ? s.publisherHe : undefined) ?? s.publisher ?? s.title ?? new URL(s.url).hostname;
/** The Sources page's list: one row per address, official sources first (as the page's own list), then in the record's order. */
export function pageSources(data: Aftermath) {
  const rank = (s: HistorySource) => s.kind === 'official' ? 0 : 1;
  const seen = new Set<string>();
  return Object.values(data.sources).map((s, i) => [s, i] as const)
    .sort(([a, i], [b, j]) => rank(a) - rank(b) || i - j)
    .map(([s]) => s).filter(s => !seen.has(s.url) && !!seen.add(s.url));
}
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
    // c-aftermath-11: a faction with no ballot letters needs a list carrying its name or its own English name
    for (const entry of snapshot.coalition ?? []) if (!entry.letters && !entry.factionNameEn && !ds.lists.some(l => l.nameHe === entry.factionNameHe || l.shortHe === entry.factionNameHe)) errors.push(`No English name: ${entry.factionNameHe}`);
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
  // ordering fields only refine the stated date, and say why
  const dated: DatedFact[] = [...data.formation.events, ...data.term.events, ...data.reaction?.items ?? [], ...data.government?.changes ?? []];
  for (const e of dated) {
    if ((e.orderDate !== undefined || e.orderSeq !== undefined) && !e.orderBasis) errors.push(`Order without basis: ${e.date}`);
    if (e.orderDate !== undefined && !(/^\d{4}-\d{2}-\d{2}$/.test(e.orderDate) && e.orderDate.startsWith(e.date))) errors.push(`Order date outside the event's date: ${e.date}`);
  }
  for (const source of Object.values(data.sources)) if (new URL(source.url).hostname === 'en.wikipedia.org') errors.push('Forbidden source');
  return errors;
}

/** A quote that is a list of database fields (record ids, field names) rather than a sentence: its plain note says what
 *  the record holds, and the fields stay in the data for checking (reader-text pass, 17 Nov 2026). */
export const isFieldRecord = (quote: string) => /^[{"]*(?:PersonToPositionID|PersonID|PositionID|KnessetDateID|KNS_PersonToPosition|StartDate|Faction \d)/.test(quote);
