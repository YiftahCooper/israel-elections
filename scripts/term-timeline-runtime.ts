/** Build-only compiler for the Knesset-term timeline and the seat cards (src/app/components/TermTimeline.tsx).
 *  Everything comes from files already in the repository:
 *  - who sat when, and in which faction: the Knesset database (data/research/knesset-member-changes/kN.json);
 *  - which list each member was elected on: data/meta/bios/kN.json (confidence "high"), else the replacement record's
 *    candidate hint, else the list most of their faction was elected on;
 *  - dated events and who supported the government: data/research/knesset-events/kN.json.
 *
 *  Seats. A seat is one of the 120 places a list won. Its first holder is the member who sat from the first sitting;
 *  when a member leaves, the next member to enter for the same list takes that place. The Knesset records who left
 *  and who entered, not which seat; where a replacement record names the pair, that pairing is used ("record"),
 *  otherwise the pairing is ours, within the list ("list"), the faction ("faction") or, failing both, any open seat
 *  ("any"). The seat card says so.
 *
 *  Sides. From the swearing-in of the first government formed during the term, every seat is on the coalition side
 *  or not. The state after each date is computed from every event, whatever the reader's level, so a hidden step never
 *  leaves the chart wrong; levels only choose which dates are steps.
 *
 *  Importance and markers. The research lane adds `importance` and `marker` to the event files. Until those fields
 *  land, FALLBACK_IMPORTANCE and fallbackMarker() below derive them from the event kind. Both are temporary and marked
 *  in the output (`importanceFrom`, `markerFrom`), so the app and the tests can tell data from fallback. */
import { readFileSync, existsSync } from 'node:fs';

export type Importance = 'simple' | 'standard' | 'expert';
export type Marker = 'D2' | 'D3' | 'D4' | 'replacement';
/** Seat-change kinds the Expert setting can choose between. */
export type SeatChangeKind = 'norwegian' | 'left' | 'unknown';
/** How a holder came to the seat: o from the first sitting, e entered during the term, r returned during the term. */
export type HolderEntry = 'o' | 'e' | 'r';
/** Who decided the pairing of a newcomer with the seat they took (see the header). */
export type Pairing = 'record' | 'list' | 'faction' | 'any';
/** [person id, start, end or null (to the end of the term), how they came, how the seat was paired (null for the
 *  first holder), reason entered (null: not recorded), reason left (null: not recorded or still sitting),
 *  factions [faction id, from][] (only when more than one)] */
export type PackedHolder = readonly [number, string, string | null, HolderEntry, Pairing | null, string | null, string | null, readonly (readonly [number, string])[]];
export interface SeatRuntime { list: string | null; holders: PackedHolder[] }

/** A seat mark drawn at one step. D2: rebel (persistent, from the rebels list); D3: voted against (x) or abstained (a)
 *  and stayed; D4: changed side, towards the coalition (c) or away from it (o); replacement: the seat changed hands. */
export type MarkKind = 'D3x' | 'D3a' | 'D4c' | 'D4o' | 'rep';
export interface TimelineItem {
  /** event id, or `seat:<seat>:<date>` for a seat change */
  id: string;
  type: 'event' | 'seat';
  kind: string;
  importance: Importance;
  /** data: graded by the research lane; fallback: the temporary mapping below; rule: FORMATION_IMPORTANCE (events from the
   *  After the election data, which the research lane does not grade) */
  importanceFrom: 'data' | 'fallback' | 'rule';
  marker: Marker | null;
  markerFrom: 'data' | 'fallback';
  /** short text; null for seat changes (the app writes them from the names) */
  en: string | null; he: string | null;
  certainty: string | null; evidenceClass: string | null;
  sources: readonly (readonly [string, string])[];
  /** the marks this item draws at its own step */
  marks: readonly (readonly [number, MarkKind])[];
  /** seats this item moved between the sides (they glow) */
  moved: number[];
  /** seat changes only */
  seat?: number; in?: number | null; out?: number | null; change?: SeatChangeKind; reason?: string | null;
  /** the research holds this event out of the steps; it still shapes the chamber */
  held?: true;
  /** faction-membership changes: the factions [from, to] and how many members moved (the app names them) */
  factions?: readonly [number, number]; count?: number;
}
export interface TimelineStep {
  date: string;
  /** seats on the coalition side after this date; null before the first government of the term */
  coalition: number[] | null;
  /** rebels after this date: [seat, person, the item that made them one] */
  rebels: (readonly [number, number, string])[];
  items: TimelineItem[];
}
export interface TermRuntime {
  k: number; opening: string; end: string;
  seats: SeatRuntime[];
  /** person id → the seat they held from the first sitting */
  openingSeat: Record<number, number>;
  /** present only for terms whose events establish a government's support, or in which no government was formed */
  timeline: { steps: TimelineStep[]; firstGovernment: string | null; noGovernment?: true } | null;
}
export interface TermTimelineRuntime { version: 1; terms: Record<number, TermRuntime>; anomalies: string[] }

type Tenure = { id: number; personId: number; start: string; end: string | null; factions: { factionId: number; start: string; end: string | null }[] };
type Replacement = { kind: string; date: string; enteringPersonId: number | null; enteringTenureId?: number; leavingPersonId: number | null; leavingTenureId: number | null; reason?: string; returningMember?: boolean; candidatePositionHints?: { listId: string }[]; importance?: Importance };
type Changes = { asOf?: string; tenures: Tenure[]; replacements: Replacement[]; checks: { openingDateReported?: string | null } };
type Vote = { for?: number | null; against?: number | null; crossVotes?: { personId: number; vote: string }[] | null };
type KEvent = {
  id: string; date: string; kind: string; who: { personIds?: number[]; factionIds?: number[] }; summary: { en: string; he: string };
  classification?: string; certainty?: string; evidenceClass?: string; seatsAfter?: { coalition: number | null; opposition: number | null } | null;
  sources?: { url?: string; publisher?: string }[]; vote?: Vote;
  importance?: Importance; marker?: Marker | null; markerDirection?: string; direction?: string;
  /** false: held out of the steps (duplicate evidence, routine failed motions, unresolved leads) */
  timelineEligible?: boolean;
  /** the people a mixed event's marker applies to */
  markerPersonIds?: number[];
  replacement?: { reason?: string; memberChangesRefs?: { path: string; pointer: string }[] };
  /** events sharing a group are one step (they must share a date) */
  timelineGroup?: string;
  /** set on events taken from the After the election data (graded by FORMATION_IMPORTANCE) */
  byRule?: true;
};
type Events = { events: KEvent[]; membershipEventRefs?: { date: string; ref: { pointer: string }; importance?: Importance; reason?: string }[] };

// ---------------------------------------------------------------------------------------------------------------
// TEMPORARY FALLBACK (until the research lane's `importance` and `marker` fields land in data/research/knesset-events).
// Simple: the government and the term themselves. Standard: votes, single members leaving or returning, splits.
// Expert: everything else, including events the research classifies as "does not count" (protest boycotts) and
// membership records. A personal exit that takes the coalition below a majority is Simple.
export const FALLBACK_IMPORTANCE: Record<string, Importance> = {
  'term-start': 'simple', 'term-end': 'simple', 'government-sworn-in': 'simple', 'party-coalition-exit': 'simple',
  'party-ministers-approved': 'simple', 'prime-minister-rotation': 'simple',
  'coalition-exit-statement': 'standard', 'coalition-return-statement': 'standard', 'confidence-vote': 'standard',
  'no-confidence-vote': 'standard', 'budget-vote': 'standard', 'dissolution-vote': 'standard', 'faction-split': 'standard',
  'faction-merger': 'standard', 'declared-left-faction': 'standard', 'emergency-government-agreement': 'standard',
  'coalition-return-agreement': 'standard', 'coalition-agreements-completed': 'standard', 'party-announces-cabinet-exit': 'standard',
};
// ---------------------------------------------------------------------------------------------------------------

// Events from the After the election data (data/meta/aftermath/kN.json), used for terms in which no government was formed.
// The research lane does not grade them, so this rule does: the dissolution ends the term (Simple, as the research grades a
// dissolution); a mandate given, returned or expired is Standard; extensions and the Knesset's 21 days are Expert.
export const FORMATION_IMPORTANCE: Record<string, Importance> = {
  'knesset-dissolved': 'simple', 'mandate-given': 'standard', 'mandate-returned': 'standard', 'mandate-expired': 'standard',
  'extension': 'expert', 'mandate-extended': 'expert', 'knesset-21-days': 'expert', 'consultations': 'expert',
};
type AftermathFact = { date: string; type: string; textEn: string; textHe: string; cites?: { source: string }[] };
type Aftermath = { formation?: { outcome?: string; events?: AftermathFact[] }; term?: { endedBy?: AftermathFact }; sources?: Record<string, { url?: string; publisher?: string }> };

/** The formation steps and the dissolution from the After the election data, as timeline events (each with its sources). */
function aftermathEvents(k: number, a: Aftermath): KEvent[] {
  const facts = [...a.formation?.events ?? []];
  const end = a.term?.endedBy;
  if (end && !facts.some((f) => f.type === end.type && f.date === end.date)) facts.push(end);
  return facts.filter((f) => FORMATION_IMPORTANCE[f.type]).map((f, i) => ({
    id: `k${k}-aftermath-${i}`, date: f.date, kind: `formation-${f.type}`, who: {}, summary: { en: f.textEn, he: f.textHe },
    importance: FORMATION_IMPORTANCE[f.type], marker: null, byRule: true,
    sources: [...new Set((f.cites ?? []).map((c) => c.source))].map((s) => a.sources?.[s]).filter((s): s is { url?: string; publisher?: string } => !!s),
  }));
}

/** "21th Knesset" → "21st Knesset" (the research's generated English for the term boundaries). */
export const fixOrdinals = (s: string) => s.replace(/\b(\d+)th\b/g, (_, n: string) => {
  const t = Number(n) % 100, u = Number(n) % 10;
  return n + (t >= 11 && t <= 13 ? 'th' : u === 1 ? 'st' : u === 2 ? 'nd' : u === 3 ? 'rd' : 'th');
});

const JOIN = new Set(['party-ministers-approved', 'coalition-return-statement']);
const EXIT = new Set(['party-coalition-exit', 'coalition-exit-statement']);

/** The Expert setting's kinds, from a recorded reason (free text or a code from the research lane). */
export function seatChangeKind(reason: string | null | undefined): SeatChangeKind {
  if (!reason || reason === 'unknown') return 'unknown';
  return /norweg|נורבג/i.test(reason) ? 'norwegian' : 'left';
}

export function compileTermTimeline(root = process.cwd()): TermTimelineRuntime {
  const read = <T>(path: string): T => JSON.parse(readFileSync(`${root}/${path}`, 'utf8')) as T;
  const out: TermTimelineRuntime = { version: 1, terms: {}, anomalies: [] };
  const K = Array.from({ length: 26 }, (_, i) => i + 1).filter((k) => existsSync(`${root}/data/research/knesset-member-changes/k${k}.json`));
  const changes = new Map(K.map((k) => [k, read<Changes>(`data/research/knesset-member-changes/k${k}.json`)]));
  for (const k of K) {
    const ch = changes.get(k)!;
    const opening = ch.checks.openingDateReported;
    if (!opening || !existsSync(`${root}/public/data/k${k}.json`)) continue;
    const next = changes.get(k + 1)?.checks.openingDateReported;
    const end = next ?? ch.asOf ?? opening;
    // the research lane's replacement events carry the reason the membership records leave "unknown"
    const evPath = `data/research/knesset-events/k${k}.json`;
    if (existsSync(`${root}/${evPath}`)) for (const e of read<Events>(evPath).events) {
      const r = e.marker === 'replacement' ? e.replacement : undefined;
      if (!r?.reason) continue;
      for (const m of r.memberChangesRefs ?? []) {
        const i = /^\/replacements\/(\d+)$/.exec(m.pointer)?.[1];
        const rec = m.path.endsWith(`/k${k}.json`) && i != null ? ch.replacements[Number(i)] : undefined;
        if (rec && (!rec.reason || rec.reason === 'unknown')) rec.reason = r.reason;
      }
    }
    const term = compileTerm(root, k, opening, end, ch, out.anomalies, read);
    if (term) out.terms[k] = term;
  }
  return out;
}

function compileTerm(root: string, k: number, opening: string, end: string, ch: Changes, anomalies: string[], read: <T>(p: string) => T): TermRuntime | null {
  const ds = read<{ lists: { id: string }[]; officialSeats: Record<string, number> }>(`public/data/k${k}.json`);
  const bios = existsSync(`${root}/data/meta/bios/k${k}.json`) ? read<{ candidates: Record<string, { knessetPersonId?: number | null; confidence?: string }> }>(`data/meta/bios/k${k}.json`).candidates : {};
  const listOrder = new Map(ds.lists.map((l, i) => [l.id, i]));
  // person → [list, rank] they were elected or listed on
  const run = new Map<number, [string, number]>();
  for (const [cid, b] of Object.entries(bios)) if (b.knessetPersonId && b.confidence === 'high') {
    const [list, rank] = cid.split('#');
    if (!run.has(b.knessetPersonId)) run.set(b.knessetPersonId, [list, Number(rank)]);
  }
  for (const r of ch.replacements) if (r.enteringPersonId && !run.has(r.enteringPersonId) && r.candidatePositionHints?.[0]) run.set(r.enteringPersonId, [r.candidatePositionHints[0].listId, 999]);
  const tenures = ch.tenures.filter((t) => t.start < end && (t.end === null || t.end > t.start)).sort((a, b) => a.start.localeCompare(b.start) || a.id - b.id);
  // a faction's list: the list most of its members from the first sitting were elected on
  const factionList = new Map<number, string>();
  {
    const votes = new Map<number, Map<string, number>>();
    for (const t of tenures) for (const f of t.factions) { const l = run.get(t.personId)?.[0]; if (!l) continue; const m = votes.get(f.factionId) ?? votes.set(f.factionId, new Map()).get(f.factionId)!; m.set(l, (m.get(l) ?? 0) + 1); }
    for (const [f, m] of votes) factionList.set(f, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }
  const factionAt = (t: Tenure, d: string) => (t.factions.find((f) => f.start <= d && (f.end === null || d < f.end)) ?? t.factions.at(-1))?.factionId ?? null;
  const listOf = (t: Tenure) => run.get(t.personId)?.[0] ?? (t.factions[0] ? factionList.get(t.factions[0].factionId) : undefined) ?? null;

  // ---- seats: the first sitting's members, by list order and rank ----
  const first = tenures.filter((t) => t.start === opening);
  if (first.length !== 120) anomalies.push(`k${k}: ${first.length} members at the first sitting`);
  first.sort((a, b) => (listOrder.get(listOf(a) ?? '') ?? 999) - (listOrder.get(listOf(b) ?? '') ?? 999) || (run.get(a.personId)?.[1] ?? 999) - (run.get(b.personId)?.[1] ?? 999) || a.personId - b.personId);
  type Live = { seat: number; tenure: Tenure };
  const seats: SeatRuntime[] = [];
  const holderTenure: Tenure[][] = [];
  const openingSeat: Record<number, number> = {};
  const factionsOf = (t: Tenure) => t.factions.length > 1 ? t.factions.map((f) => [f.factionId, f.start] as const) : [];
  const recordFor = new Map(ch.replacements.filter((r) => r.enteringTenureId).map((r) => [r.enteringTenureId!, r]));
  const departureOf = new Map(ch.replacements.filter((r) => r.leavingTenureId).map((r) => [r.leavingTenureId!, r]));
  const sat = new Set<number>();
  first.forEach((t, i) => {
    seats.push({ list: listOf(t), holders: [[t.personId, t.start, t.end, 'o', null, null, null, factionsOf(t)]] });
    holderTenure.push([t]); openingSeat[t.personId] = i; sat.add(t.personId);
  });
  const live: Live[] = first.map((t, i) => ({ seat: i, tenure: t }));
  const vacant: { seat: number; date: string; tenure: Tenure }[] = [];
  const dates = [...new Set(tenures.flatMap((t) => [t.start, ...(t.end && t.end < end ? [t.end] : [])]))].filter((d) => d > opening).sort();
  const pairing = new Map<number, Pairing>(); // tenure id → pairing
  for (const d of dates) {
    for (let i = live.length - 1; i >= 0; i--) if (live[i].tenure.end === d) { vacant.push({ seat: live[i].seat, date: d, tenure: live[i].tenure }); live.splice(i, 1); }
    for (const t of tenures.filter((x) => x.start === d)) {
      const rec = recordFor.get(t.id);
      const list = listOf(t), faction = t.factions[0]?.factionId;
      let pick = -1, how: Pairing = 'any';
      if (rec?.leavingTenureId) { pick = vacant.findIndex((v) => v.tenure.id === rec.leavingTenureId); how = 'record'; }
      if (pick < 0 && list) { pick = vacant.findIndex((v) => seats[v.seat].list === list); how = 'list'; }
      if (pick < 0 && faction != null) { pick = vacant.findIndex((v) => factionAt(v.tenure, v.date) === faction || v.tenure.factions.some((f) => f.factionId === faction)); how = 'faction'; }
      if (pick < 0 && vacant.length) { pick = 0; how = 'any'; }
      if (pick < 0) { anomalies.push(`k${k}: ${t.personId} entered on ${d} with no open seat`); continue; }
      const v = vacant.splice(pick, 1)[0];
      pairing.set(t.id, how);
      const left = departureOf.get(v.tenure.id);
      const holders = seats[v.seat].holders as PackedHolder[];
      const prev = holders[holders.length - 1];
      holders[holders.length - 1] = [prev[0], prev[1], prev[2], prev[3], prev[4], prev[5], left && left.reason && left.reason !== 'unknown' ? left.reason : prev[6], prev[7]];
      holders.push([t.personId, t.start, t.end, sat.has(t.personId) || rec?.returningMember ? 'r' : 'e', how, rec?.reason && rec.reason !== 'unknown' ? rec.reason : null, null, factionsOf(t)]);
      holderTenure[v.seat].push(t); sat.add(t.personId);
      live.push({ seat: v.seat, tenure: t });
    }
  }
  // a member who left with no one entering after them: their reason, if recorded
  for (const v of vacant) {
    const left = departureOf.get(v.tenure.id); const holders = seats[v.seat].holders as PackedHolder[]; const last = holders[holders.length - 1];
    if (left?.reason && left.reason !== 'unknown' && last[0] === v.tenure.personId) holders[holders.length - 1] = [last[0], last[1], last[2], last[3], last[4], last[5], left.reason, last[7]];
  }

  const eventsPath = `data/research/knesset-events/k${k}.json`;
  const ev = existsSync(`${root}/${eventsPath}`) ? read<Events>(eventsPath) : null;
  const sworn = ev?.events.find((e) => e.kind === 'government-sworn-in');
  // a term in which no government was formed has no sides to derive: its timeline shows the chamber, the formation attempts
  // and the dissolution (After the election data). Other terms need a recorded swearing-in and coalition (see REPORT).
  const aftermathPath = `data/meta/aftermath/k${k}.json`;
  const aftermath = !sworn && existsSync(`${root}/${aftermathPath}`) ? read<Aftermath>(aftermathPath) : null;
  const noGovernment = aftermath?.formation?.outcome === 'no-government';
  const timeline = ev && (sworn || noGovernment)
    ? compileSteps(k, opening, end, seats, holderTenure, noGovernment ? { ...ev, events: [...ev.events, ...aftermathEvents(k, aftermath!)] } : ev, ch.replacements, factionAt, anomalies)
    : null;
  return { k, opening, end, seats, openingSeat, timeline: timeline && noGovernment ? { ...timeline, noGovernment: true } : timeline };
}

function compileSteps(k: number, opening: string, end: string, seats: SeatRuntime[], holderTenure: Tenure[][], ev: Events, replacements: Replacement[],
  factionAt: (t: Tenure, d: string) => number | null, anomalies: string[]): { steps: TimelineStep[]; firstGovernment: string | null } {
  // on the day the term ends, the chart shows the Knesset as it was on its last day
  const last = new Date(Date.parse(`${end}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  const holderAt = (seat: number, day: string) => { const d = day >= end ? last : day; return holderTenure[seat].find((t) => t.start <= d && (t.end === null || d < t.end)) ?? null; };
  const seatOfPerson = (p: number, d: string) => seats.findIndex((_, i) => holderAt(i, d)?.personId === p);
  const events = ev.events.filter((e) => e.date >= opening && e.date <= end);
  // events sharing a timelineGroup are one step: they must share a date
  const groupDates = new Map<string, Set<string>>();
  for (const e of events) if (e.timelineGroup) (groupDates.get(e.timelineGroup) ?? groupDates.set(e.timelineGroup, new Set()).get(e.timelineGroup)!).add(e.date);
  for (const [g, ds] of groupDates) if (ds.size > 1) anomalies.push(`k${k}: timeline group ${g} spans ${[...ds].sort().join(', ')}`);
  // ---- seat changes: one per seat and date ----
  type SeatChange = { seat: number; date: string; in: number | null; out: number | null; reason: string | null };
  const changes: SeatChange[] = [];
  seats.forEach((s, i) => s.holders.forEach((h, j) => {
    if (j === 0) return;
    const prev = s.holders[j - 1];
    changes.push({ seat: i, date: h[1], in: h[0], out: prev[2] === h[1] ? prev[0] : null, reason: h[5] ?? (prev[2] === h[1] ? prev[6] : null) });
    if (prev[2] && prev[2] < h[1]) changes.push({ seat: i, date: prev[2], in: null, out: prev[0], reason: prev[6] });
  }));
  for (const [i, s] of seats.entries()) { const last = s.holders.at(-1)!; if (last[2] && last[2] < end) changes.push({ seat: i, date: last[2], in: null, out: last[0], reason: last[6] }); }
  // research-graded seat changes: membership records with an importance, and events marked "replacement"
  const refImportance = new Map<string, Importance>(); // `${date}|${in}|${out}` → importance
  for (const r of ev.membershipEventRefs ?? []) {
    const rec = /^\/replacements\/(\d+)$/.exec(r.ref.pointer) ? replacements[Number(r.ref.pointer.split('/')[2])] : undefined;
    const imp = r.importance ?? rec?.importance;
    if (rec && imp) refImportance.set(`${rec.date}|${rec.enteringPersonId ?? ''}|${rec.leavingPersonId ?? ''}`, imp);
  }
  const replacementEvents = events.filter((e) => e.marker === 'replacement');

  const dates = [...new Set([...events.map((e) => e.date), ...changes.map((c) => c.date)])].sort();
  const side = new Map<number, 'c' | 'o'>(); // person → side (only once sides exist)
  const rebels = new Map<number, string>(); // person → the item that made them a rebel
  let sides = false;
  const steps: TimelineStep[] = [];
  const firstGovernment = events.find((e) => e.kind === 'government-sworn-in')?.date ?? null;
  for (const d of dates) {
    const items: TimelineItem[] = [];
    const current = () => seats.map((_, i) => holderAt(i, d)).map((t, i) => ({ seat: i, t })).filter((x): x is { seat: number; t: Tenure } => !!x.t);
    // seat changes first: a newcomer sits with their faction (or where the seat was)
    for (const c of changes.filter((x) => x.date === d)) {
      const t = c.in != null ? holderAt(c.seat, d) : null;
      if (sides && t) {
        const f = factionAt(t, d);
        const mates = current().filter((x) => x.t.personId !== t.personId && !rebels.has(x.t.personId) && factionAt(x.t, d) === f && side.has(x.t.personId));
        const c2 = mates.filter((x) => side.get(x.t.personId) === 'c').length;
        const wasRebel = c.out != null && rebels.has(c.out);
        const prevSide = c.out != null ? side.get(c.out) : undefined;
        side.set(t.personId, mates.length ? (c2 * 2 >= mates.length ? 'c' : 'o') : prevSide ? (wasRebel ? (prevSide === 'c' ? 'o' : 'c') : prevSide) : 'o');
      }
      if (c.out != null) rebels.delete(c.out);
      const ref = refImportance.get(`${d}|${c.in ?? ''}|${c.out ?? ''}`) ?? refImportance.get(`${d}|${c.in ?? ''}|`);
      const graded = replacementEvents.find((e) => e.date === d && (e.who.personIds ?? []).some((p) => p === c.in || p === c.out));
      const importance = graded?.importance ?? ref ?? 'expert';
      items.push({ id: `seat:${c.seat}:${d}`, type: 'seat', kind: c.in != null && c.out != null ? 'replacement' : c.in != null ? 'entry' : 'departure',
        importance, importanceFrom: graded?.importance || ref ? 'data' : 'fallback', marker: 'replacement', markerFrom: graded ? 'data' : 'fallback',
        // the app writes each seat's own line (the research's summary covers the whole group, with no one-to-one pairing)
        en: null, he: null, certainty: graded?.certainty ?? null, evidenceClass: graded?.evidenceClass ?? null,
        sources: srcs(graded), marks: [[c.seat, 'rep']], moved: [], seat: c.seat, in: c.in, out: c.out, change: seatChangeKind(graded?.replacement?.reason ?? c.reason), reason: graded?.replacement?.reason ?? c.reason });
    }
    for (const e of events.filter((x) => x.date === d && x.marker !== 'replacement')) {
      const marks: [number, MarkKind][] = []; const moved: number[] = [];
      const fromData = e.marker !== undefined;
      let marker: Marker | null = fromData ? e.marker ?? null : null;
      const persons = e.markerPersonIds ?? e.who.personIds ?? [], factions = e.who.factionIds ?? [];
      const move = (p: number, to: 'c' | 'o') => { if (side.get(p) === to) return false; side.set(p, to); const s = seatOfPerson(p, d); if (s >= 0) moved.push(s); return true; };
      const partyLevel = factions.length > 0 && !(e.kind === 'coalition-exit-statement');
      if (e.kind === 'government-sworn-in') {
        sides = true; rebels.clear();
        for (const x of current()) side.set(x.t.personId, factions.includes(factionAt(x.t, d) ?? -1) ? 'c' : 'o');
        for (const cv of e.vote?.crossVotes ?? []) {
          const s = seatOfPerson(cv.personId, d);
          if (cv.vote === 'against' && side.get(cv.personId) === 'c') { side.set(cv.personId, 'o'); rebels.set(cv.personId, e.id); if (s >= 0) moved.push(s); }
          else if (cv.vote === 'abstain' && s >= 0) marks.push([s, 'D3a']);
        }
        if (!fromData) marker = rebels.size ? 'D2' : marks.length ? 'D3' : null;
      } else if (sides && (JOIN.has(e.kind) || EXIT.has(e.kind) || (fromData && (marker === 'D2' || marker === 'D4')))) {
        // the recorded direction wins; a party joining or leaving moves that way; a D2 (rebel) always leaves the government's side
        const dirText = e.markerDirection ?? e.direction ?? '';
        const dir: 'c' | 'o' | undefined = dirText ? (/coalition/i.test(dirText) && !/opposition/i.test(dirText) ? 'c' : 'o')
          : JOIN.has(e.kind) ? 'c' : EXIT.has(e.kind) || marker === 'D2' ? 'o' : undefined;
        if (partyLevel && !(marker === 'D2')) {
          for (const x of current()) if (factions.includes(factionAt(x.t, d) ?? -1) && !rebels.has(x.t.personId)) {
            const target = dir ?? (side.get(x.t.personId) === 'c' ? 'o' : 'c');
            // a graded D4 draws its arrows even when an announcement the day before already moved the party (the research counts
            // New Hope in the coalition from Sa'ar's 29 Sep 2024 announcement; the D4 is the 30 Sep approval)
            if (move(x.t.personId, target) || (fromData && marker === 'D4' && side.get(x.t.personId) === target)) marks.push([x.seat, target === 'c' ? 'D4c' : 'D4o']);
          }
          if (!fromData) marker = marks.length ? 'D4' : null;
        } else {
          for (const p of persons) {
            const target = dir ?? (side.get(p) === 'c' ? 'o' : 'c');
            const moved1 = move(p, target);
            if (moved1) { if (target === 'o') rebels.set(p, e.id); else rebels.delete(p); }
            if (marker === 'D4' && (moved1 || (fromData && side.get(p) === target))) { const s = seatOfPerson(p, d); if (s >= 0) marks.push([s, target === 'c' ? 'D4c' : 'D4o']); }
          }
          if (!fromData) marker = e.kind === 'coalition-exit-statement' ? 'D2' : null;
          if (marker !== 'D2') for (const p of persons) if (rebels.get(p) === e.id) rebels.delete(p);
        }
      }
      // members who voted against, or abstained, and stayed (D3); a vote for dissolution is a vote against the government
      if (e.kind !== 'government-sworn-in' && sides) {
        const cross = e.vote?.crossVotes ?? [];
        const against = (v: string) => v === 'against' || (e.kind === 'dissolution-vote' && v === 'for');
        for (const cv of cross) if (side.get(cv.personId) === 'c' && (against(cv.vote) || cv.vote === 'abstain')) {
          const s = seatOfPerson(cv.personId, d); if (s >= 0) marks.push([s, against(cv.vote) ? 'D3x' : 'D3a']);
        }
        if (marker === 'D3' && !cross.length) for (const p of persons) { const s = seatOfPerson(p, d); if (s >= 0 && side.get(p) === 'c') marks.push([s, 'D3x']); }
        if (!fromData && marks.some((m) => m[1] === 'D3x' || m[1] === 'D3a') && !marker) marker = 'D3';
      }
      // TEMPORARY FALLBACK importance (see FALLBACK_IMPORTANCE)
      let importance: Importance = e.importance ?? (e.classification === 'does not count' || e.classification === 'hard case' ? 'expert' : FALLBACK_IMPORTANCE[e.kind] ?? 'expert');
      if (!e.importance && e.kind === 'dissolution-vote' && (e.vote?.for ?? 0) > (e.vote?.against ?? 0)) importance = 'simple';
      // a whole party joining or leaving is Simple; a second record of a move already made is Standard
      if (!e.importance && (JOIN.has(e.kind) || EXIT.has(e.kind)) && partyLevel) importance = moved.length ? 'simple' : 'standard';
      const fm = e.kind === 'faction-membership-change' && factions.length === 2 ? { factions: [factions[0], factions[1]] as const, count: e.who.personIds?.length ?? 0 } : {};
      items.push({ id: e.id, type: 'event', kind: e.kind, importance, importanceFrom: e.byRule ? 'rule' : e.importance ? 'data' : 'fallback', marker, markerFrom: fromData ? 'data' : 'fallback',
        en: fixOrdinals(e.summary.en), he: e.summary.he, certainty: e.certainty ?? null, evidenceClass: e.evidenceClass ?? null, sources: srcs(e), marks, moved, ...(e.timelineEligible === false ? { held: true as const } : {}), ...fm });
      (items[items.length - 1] as TimelineItem & { _e?: KEvent })._e = e;
    }
    const coalition = sides ? current().filter((x) => side.get(x.t.personId) === 'c').map((x) => x.seat) : null;
    // a personal exit that takes the coalition below a majority changes who can govern: Simple (fallback only)
    const prevCoal = steps.at(-1)?.coalition?.length ?? 0;
    for (const it of items) {
      const e = (it as TimelineItem & { _e?: KEvent })._e; delete (it as TimelineItem & { _e?: KEvent })._e;
      if (!e) continue;
      if (it.importanceFrom === 'fallback' && it.importance === 'standard' && e.kind === 'coalition-exit-statement' && prevCoal >= 61 && (coalition?.length ?? 0) < 61) it.importance = 'simple';
      const want = e.seatsAfter?.coalition;
      if (want != null && coalition && want !== coalition.length) anomalies.push(`k${k} ${e.id}: research says coalition ${want}, computed ${coalition.length}`);
    }
    const reb = [...rebels.entries()].map(([p, item]) => [seatOfPerson(p, d), p, item] as const).filter((x) => x[0] >= 0);
    steps.push({ date: d, coalition, rebels: reb, items });
  }
  return { steps, firstGovernment };
}

function srcs(e: KEvent | undefined): (readonly [string, string])[] {
  return (e?.sources ?? []).filter((s) => s.url && /^https:\/\//.test(s.url)).map((s) => [s.publisher ?? new URL(s.url!).hostname, s.url!] as const);
}
