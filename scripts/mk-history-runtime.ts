/** Build-only compiler for each MK's own history (the MK history card, src/app/components/MkHistory.tsx).
 *  Only people who sat in the Knesset (or were elected to the 26th) get a history. Everything comes from files already
 *  in the repository:
 *  - terms and factions: the Knesset database (data/research/knesset-member-changes/kN.json);
 *  - names and gender: Knesset OData persons, the Knesset website's English names (data/raw/bios);
 *  - runs: the official candidate lists (public/data/kN.json), tied to a person by the Knesset member ID
 *    (data/meta/bios/kN.json, confidence "high") or, for a run that did not win a seat, by the name check below;
 *  - dated events naming the person: data/research/knesset-events/kN.json (with their sources).
 *  Runs that did not win a seat are shown only from elections whose official candidate lists we hold in full; an
 *  uncertain match is left out, never shown (owner decision M2, 9 Nov 2026). */
import { readFileSync, existsSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { RULESETS } from '../src/engine/rules.ts';
import { mixHex } from '../src/data/colour.ts';
import { compileHistoryRuntime } from './party-history-runtime.ts';
import { shownRows } from './lib/faction-rows.ts';
import { knessetMemberSure } from './lib/build/bios.ts';

/** How a run ended. elected: within the list's seats at the election. first: not within the seats but sat from the
 *  first sitting. later: entered during that Knesset. out: did not enter that Knesset. declined: within the seats but
 *  never sat in that Knesset (the candidate notes say why). */
export type RunOutcome = 'elected' | 'first' | 'later' | 'out' | 'declined';
/** id: the Knesset member ID ties the candidacy to the person (official membership or entry in the list's faction).
 *  name: the same listed name, character for character, as a candidacy tied by ID, and no one else could be meant. */
export type RunBasis = 'id' | 'name';
/** [election number, list id, rank, outcome, basis, for basis "name": the election number of the ID-tied run,
 *  for "declined" and "first": the official candidate notes that explain it ([English, Hebrew][]) ] */
export type PackedRun = readonly [number, string, number, RunOutcome, RunBasis, number | null, readonly (readonly [string, string])[]];
/** One faction in a term: [faction id, start, end or null, and where the Knesset's record has them: start time, end time].
 *  Only the records the app shows, cut to the term and in order (scripts/lib/faction-rows.ts). */
export type PackedFaction = readonly [number, string, string | null] | readonly [number, string, string | null, string | null, string | null];
/** [Knesset number, start, end or null (still serving), factions] */
export type PackedTerm = readonly [number, string, string | null, readonly PackedFaction[]];
/** [date, kind, Knesset number, English, Hebrew, evidence class, sources [publisher, url][]] */
export type PackedEvent = readonly [string, string, number, string, string, string, readonly (readonly [string, string])[]];
export interface MkPerson {
  he: string; en: string | null; female: boolean;
  /** the Knesset website's member id (the official member page), or null */
  site: number | null;
  /** the Hebrew Wikipedia article's title (a secondary source), or null */
  wiki: string | null;
  terms: PackedTerm[]; runs: PackedRun[]; events: PackedEvent[];
}
export interface MkRuntime {
  version: 1;
  /** per election number: date, opening of that Knesset (null before it opens), the day it ended (or the records'
   *  as-of date while it sits), threshold in percent */
  elections: Record<number, { date: string; opening: string | null; end: string | null; threshold: number }>;
  /** per list id: [short Hebrew, short English or null, colour, seats, valid-vote share in percent (2 decimals)] */
  lists: Record<string, readonly [string, string | null, string, number, number]>;
  /** faction id → [Hebrew, English or null, colour or null], and for a faction shown under its list's name whose recorded
   *  name differs: [.., the recorded Hebrew name, its English or null] */
  factions: Record<number, readonly [string, string | null, string | null] | readonly [string, string | null, string | null, string, string | null]>;
  /** elections whose runs that did not win a seat are shown: every list (full), or only these lists (partial) */
  failedRunCoverage: { full: number[]; partial: Record<number, string[]>; excluded: Record<number, string[]> };
  /** person id → history. A run's candidate id is `${list id}#${rank}`. */
  people: Record<number, MkPerson>;
}

/** Review output: matches left out and why (written by scripts/research/mk-history-review.ts, not shipped). */
export interface MkReview { leftOut: { candidateId: string; nameHe: string; reason: string; personIds: number[] }[]; anomalies: string[] }

type Bio = { knessetPersonId?: number | null; confidence?: string; knesset?: { siteId?: number } | null; hewiki?: { title?: string } | null; basis?: string };
type Tenure = { personId: number; nameHe: string; start: string; end: string | null; factions: { factionId: number; nameHe: string; start: string; end: string | null; startTime?: string; endTime?: string }[] };
type Changes = { tenures: Tenure[]; factionRegistry: { id: number; nameHe: string; start: string; end: string | null }[]; checks: { openingDateReported?: string | null } };
type KEvent = { id: string; date: string; kind: string; who: { personIds?: number[] }; summary: { en: string; he: string }; classification: string; certainty: string; evidenceClass?: string; sources: { url?: string; publisher?: string }[] };

const K = Array.from({ length: 26 }, (_, i) => i + 1);
/** a listed name, normalised only for spacing and quote marks (letters must be identical) */
export const normName = (s: string) => s.replace(/\s*\u00ad\s*/g, ' - ').replace(/[\u05f3']/g, '׳').replace(/[\u05f4"]/g, '״').replace(/[-־–]/g, '-').replace(/\s+/g, ' ').trim();
const words = (s: string) => normName(s).split(' ').length;
/** a faction's or list's Hebrew name, for comparing names across the two sources */
const FINAL: Record<string, string> = { 'ץ': 'צ', 'ם': 'מ', 'ן': 'נ', 'ך': 'כ', 'ף': 'פ' };
const nameKey = (s: string) => normName(s).replace(/^ה(?=[א-ת]{3})/, '').replace(/[״׳"'.]/g, '').replace(/[-–]/g, ' ').replace(/[ץםןךף]/g, (c) => FINAL[c]).replace(/\s+/g, ' ').trim();
/** a faction name, its first part ("בל״ד - ברית לאומית דמוקרטית" → בל״ד), its part in brackets, and the name without "led by …" ("עוצמה יהודית בראשות איתמר בן גביר" → עוצמה יהודית) */
const factionKeys = (s: string) => {
  const n = normName(s).replace(/­/g, '-');
  const parts = [n, n.split(/\s+-\s+/)[0], ...(n.match(/\(([^)]+)\)/)?.slice(1) ?? []), n.replace(/\s*\([^)]*\)\s*/g, ' '), n.replace(/\s+בראשות\s.*$/, '')];
  return [...new Set(parts.map(nameKey).filter((x) => x.length > 1))];
};
const pct = (part: number, whole: number) => Math.round((part / whole) * 10000) / 100;

/** The candidates a list's official seats went to: the first `seats` names, skipping those the notices did not seat. */
export function electedOf(l: ElectionDataset['lists'][number], seats: number): Set<string> {
  return new Set(l.candidates.filter((c) => !c.notSeated).slice(0, seats).map((c) => c.id));
}

export function compileMkHistory(root = process.cwd(), review?: MkReview): MkRuntime {
  const read = (path: string) => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
  const persons = new Map((read('data/raw/bios/knesset-odata-persons.json') as { PersonID: number; FirstName: string; LastName: string; GenderDesc: string }[]).map((p) => [p.PersonID, p]));
  const siteOf = new Map((read('data/raw/bios/knesset-odata-mk-site-codes.json') as { KnsID: number; SiteId: number }[]).map((s) => [s.KnsID, s.SiteId]));
  const enOfSite = new Map((read('data/raw/bios/knesset-site-mk-names-en.json') as { siteId: number; nameEn: string }[]).map((s) => [s.siteId, s.nameEn.replace(/\s+/g, ' ').trim()]));
  const historyParties = new Map(compileHistoryRuntime(root).elections.flatMap((e) => e.lists.map((l) => [l[0], l[8].map(([p]) => p)] as const)));

  const ds = new Map<number, ElectionDataset>(K.map((k) => [k, read(`public/data/k${k}.json`)]));
  const bios = new Map<number, Record<string, Bio>>(K.map((k) => [k, (read(`data/meta/bios/k${k}.json`) as { candidates: Record<string, Bio> }).candidates]));
  const changes = new Map<number, Changes>(K.map((k) => [k, read(`data/research/knesset-member-changes/k${k}.json`)]));

  const out: MkRuntime = { version: 1, elections: {}, lists: {}, factions: {}, failedRunCoverage: { full: [], partial: {}, excluded: {} }, people: {} };
  const anomalies = review?.anomalies ?? [];
  const leftOut = review?.leftOut ?? [];

  // ---- elections and lists ----
  for (const k of K) {
    const d = ds.get(k)!;
    const seats = d.officialSeats as Record<string, number>;
    const rules = RULESETS[d.ruleSetId];
    out.elections[k] = { date: d.electionDate, opening: changes.get(k)!.checks.openingDateReported ?? null, end: null, threshold: rules ? Math.round(Number(rules.threshold.num) / Number(rules.threshold.den) * 10000) / 100 : 0 };
    for (const l of d.lists) out.lists[l.id] = [l.shortHe, l.shortEn ?? null, l.color, seats[l.id] ?? 0, pct(l.votes, d.totals.valid)];
    // a run that did not win a seat can be shown only where the whole official list is held
    const complete = d.lists.filter((l) => !l.withdrawn && !l.candidatesUnavailable && !l.candidatesTruncated && !l.candidatesSecondary && l.candidates.length > 0);
    const secondary = d.lists.filter((l) => !l.withdrawn && l.candidatesSecondary).map((l) => l.id);
    const running = d.lists.filter((l) => !l.withdrawn);
    if (complete.length === running.length) out.failedRunCoverage.full.push(k);
    else if (secondary.length && complete.length + secondary.length === running.length) { out.failedRunCoverage.full.push(k); out.failedRunCoverage.excluded[k] = secondary; }
    else if (complete.length && k >= 16) out.failedRunCoverage.partial[k] = complete.map((l) => l.id);
  }
  for (const k of K) out.elections[k].end = out.elections[k + 1]?.opening ?? (out.elections[k].opening ? (changes.get(k) as Changes & { asOf?: string }).asOf ?? null : null);
  const covered = (k: number, listId: string) => out.failedRunCoverage.full.includes(k) ? !(out.failedRunCoverage.excluded[k] ?? []).includes(listId) : (out.failedRunCoverage.partial[k] ?? []).includes(listId);

  // ---- people: everyone with a term, plus those elected to a Knesset that has not opened yet ----
  const terms = new Map<number, PackedTerm[]>();
  for (const k of K) for (const t of changes.get(k)!.tenures) {
    const list = terms.get(t.personId) ?? [];
    list.push([k, t.start, t.end, shownRows(t.factions, t).map((f): PackedFaction => f.startTime || f.endTime ? [f.factionId, f.start, f.end, f.startTime ?? null, f.endTime ?? null] : [f.factionId, f.start, f.end])]);
    terms.set(t.personId, list);
  }

  // ---- runs tied by Knesset member ID ----
  type Run = { k: number; listId: string; rank: number; candidateId: string; nameHe: string; elected: boolean; notSeated: boolean; basis: RunBasis; via: number | null };
  const runs = new Map<number, Run[]>();
  const tiedNames = new Map<string, Set<number>>(); // listed name → people it is tied to by ID
  const byCandidate = new Map<string, number>();
  const all: { k: number; l: ElectionDataset['lists'][number]; c: ElectionDataset['lists'][number]['candidates'][number]; elected: boolean }[] = [];
  for (const k of K) {
    const d = ds.get(k)!;
    for (const l of d.lists) {
      const el = electedOf(l, (d.officialSeats as Record<string, number>)[l.id] ?? 0);
      for (const c of l.candidates) {
        all.push({ k, l, c, elected: el.has(c.id) });
        const b = bios.get(k)![c.id];
        // the Knesset identity is certain: a high entry, or one whose Knesset match is official (elected as that Knesset's
        // member, or entered it later in the list's faction) where only a Wikipedia or party link on the same record is
        // medium (scripts/lib/build/bios.ts; audit 12 Nov 2026, c-famous-late-04: Fogel, Bismuth and seven more of 2022)
        if (!b?.knessetPersonId || !knessetMemberSure(b)) continue;
        const p = b.knessetPersonId;
        if (!terms.has(p) && !(k === 26 && el.has(c.id))) { anomalies.push(`${c.id} ${c.nameHe}: tied to person ${p} by ID but no term and not elected in k26`); continue; }
        const r: Run = { k, listId: l.id, rank: c.rank, candidateId: c.id, nameHe: c.nameHe, elected: el.has(c.id), notSeated: !!c.notSeated, basis: 'id', via: null };
        (runs.get(p) ?? runs.set(p, []).get(p)!).push(r);
        byCandidate.set(c.id, p);
        const key = normName(c.nameHe);
        (tiedNames.get(key) ?? tiedNames.set(key, new Set()).get(key)!).add(p);
      }
    }
  }
  // the Knesset's own form of each member's name, "family given", so a namesake MK is never missed
  const dbNames = new Map<string, Set<number>>();
  for (const [p] of terms) {
    const x = persons.get(p); if (!x) continue;
    const key = normName(`${x.LastName} ${x.FirstName}`);
    (dbNames.get(key) ?? dbNames.set(key, new Set()).get(key)!).add(p);
  }
  // how often each listed name occurs in each election (two candidates with one name: neither can be matched)
  const perElection = new Map<string, number>();
  for (const a of all) { const key = `${a.k}|${normName(a.c.nameHe)}`; perElection.set(key, (perElection.get(key) ?? 0) + 1); }

  // ---- runs that did not win a seat, tied by the name check ----
  for (const a of all) {
    // a candidate within the list's seats who did not take the seat is in the part of every list we hold, whatever the
    // election (Deri and Benny Begin, 1999; Arens, 1992)
    if (byCandidate.has(a.c.id) || a.elected || (!covered(a.k, a.l.id) && !a.c.notSeated)) continue;
    const key = normName(a.c.nameHe);
    const people = tiedNames.get(key);
    if (!people) continue;
    const ids = [...people];
    const b = bios.get(a.k)![a.c.id];
    const drop = (reason: string) => leftOut.push({ candidateId: a.c.id, nameHe: a.c.nameHe, reason, personIds: ids });
    if (ids.length > 1) { drop('the listed name is tied by ID to more than one person'); continue; }
    const p = ids[0];
    const namesakes = [...(dbNames.get(key) ?? [])].filter((x) => x !== p);
    if (namesakes.length) { drop(`another MK has this name in the Knesset's records (${namesakes.join(', ')})`); continue; }
    if ((perElection.get(`${a.k}|${key}`) ?? 0) > 1) { drop('two candidates with this name in the same election'); continue; }
    if (b?.knessetPersonId && b.knessetPersonId !== p) { drop(`the biography links tie it to person ${b.knessetPersonId}`); continue; }
    const own = runs.get(p)!.filter((r) => r.basis === 'id');
    if (own.some((r) => r.k === a.k)) { drop('the person already has an ID-tied candidacy in this election'); continue; }
    const parties = new Set(historyParties.get(a.l.id) ?? []);
    const sameParty = own.some((r) => (historyParties.get(r.listId) ?? []).some((x) => parties.has(x)));
    const bioAgrees = b?.knessetPersonId === p;
    if (!sameParty && words(key) < 3 && !bioAgrees) { drop('a two-word name on a list of another party, with no other evidence'); continue; }
    // the ID-tied run nearest in time is the one the reader can check it against
    const same = own.filter((r) => normName(r.nameHe) === key);
    const via = same.reduce((m, r) => Math.abs(r.k - a.k) < Math.abs(m.k - a.k) ? r : m, same[0]);
    runs.get(p)!.push({ k: a.k, listId: a.l.id, rank: a.c.rank, candidateId: a.c.id, nameHe: a.c.nameHe, elected: false, notSeated: !!a.c.notSeated, basis: 'name', via: via.k });
    byCandidate.set(a.c.id, p);
  }

  // ---- factions: named as the list whose elected members formed them, else by name ----
  const listsByName = new Map<string, { k: number; id: string }[]>();
  for (const k of K) for (const l of ds.get(k)!.lists) for (const n of [l.shortHe, l.nameHe]) {
    const key = nameKey(n); (listsByName.get(key) ?? listsByName.set(key, []).get(key)!).push({ k, id: l.id });
  }
  // English display names for factions not formed by a list (data/meta/knesset-faction-names-en.json)
  const curated = read('data/meta/knesset-faction-names-en.json') as { names: Record<string, string>; sameName?: Record<string, string> };
  const curatedEn = new Map(Object.entries(curated.names).map(([he, en]) => [normName(he), en]));
  // one English name for a Hebrew faction name, in every Knesset, whatever rule named it (cx-factions-07)
  const sameNameEn = new Map(Object.entries(curated.sameName ?? {}).map(([he, en]) => [normName(he), en]));
  const listsByEn = new Map<string, { k: number; id: string }[]>();
  for (const k of K) for (const l of ds.get(k)!.lists) if (l.shortEn) (listsByEn.get(l.shortEn) ?? listsByEn.set(l.shortEn, []).get(l.shortEn)!).push({ k, id: l.id });
  const memberByName = new Map<string, string>();
  for (const [p] of terms) {
    const x = persons.get(p), site = siteOf.get(p), en = site != null ? enOfSite.get(site) : undefined;
    if (x && en) memberByName.set(nameKey(`${x.FirstName} ${x.LastName}`), en);
  }
  for (const k of K) {
    const ch = changes.get(k)!;
    const opening = ch.checks.openingDateReported;
    const votes = new Map<number, Map<string, number>>();
    for (const t of ch.tenures) {
      const f = t.factions[0]; if (!f) continue;
      const r = (runs.get(t.personId) ?? []).find((x) => x.k === k && x.basis === 'id');
      if (!r) continue;
      const m = votes.get(f.factionId) ?? votes.set(f.factionId, new Map()).get(f.factionId)!;
      m.set(r.listId, (m.get(r.listId) ?? 0) + 1);
    }
    const members = new Map<number, Map<string, number>>();
    for (const t of ch.tenures) for (const f of t.factions) {
      const r = (runs.get(t.personId) ?? []).find((x) => x.k === k);
      if (!r) continue;
      const m = members.get(f.factionId) ?? members.set(f.factionId, new Map()).get(f.factionId)!;
      m.set(r.listId, (m.get(r.listId) ?? 0) + 1);
    }
    // the list an opening faction's members were elected on, when most of them were
    const formedBy = (f: { id: number; start: string }) => {
      const m = votes.get(f.id); if (!m || f.start !== opening) return undefined;
      const total = [...m.values()].reduce((a, b) => a + b, 0), best = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
      return best && best[1] * 2 > total ? { list: best[0], total } : undefined;
    };
    // One list can seat two factions from the first day (2022: Religious Zionism and Otzma Yehudit, registered apart at the
    // opening). The list's name then goes to the faction that carries it, else the larger; the other is named by its own name.
    const namesake = new Map<string, { id: number; named: boolean; total: number }>();
    for (const f of ch.factionRegistry) {
      const c = formedBy(f); if (!c) continue;
      const named = factionKeys(f.nameHe).some((x) => (listsByName.get(x) ?? []).some((h) => h.id === c.list));
      const cur = namesake.get(c.list);
      if (!cur || (Number(named) - Number(cur.named) || c.total - cur.total) > 0) namesake.set(c.list, { id: f.id, named, total: c.total });
    }
    for (const f of ch.factionRegistry) {
      const formed = formedBy(f);
      const list = formed && namesake.get(formed.list)?.id === f.id ? formed.list : undefined;
      const he = normName(f.nameHe);
      // the list's own faction (formed by its elected members at the opening): the list's short name and colour
      // (its recorded name is kept, to tell it from another faction of the same shown name: Labor led by Ehud Barak → Labor)
      if (list) {
        const L = out.lists[list], en = sameNameEn.get(he) ?? L[1];
        out.factions[f.id] = nameKey(L[0]) === nameKey(he) ? [L[0], en, L[2]] : [L[0], en, L[2], he, sameNameEn.get(he) ?? curatedEn.get(he) ?? null];
        continue;
      }
      // any other faction: the name the Knesset recorded for it, with an English form of that same name (audit 12 Nov
      // 2026, fx-names). Never a later party's name, nor a list's that only shares a word with it: a faction formed
      // during a term is not that list (1955 Agudat Yisrael–Poalei Agudat Yisrael, 2000 National Union–Yisrael Beiteinu,
      // 2005 Tzalash, 1978 Development and Peace).
      // English: the reviewed map; else a list with this very short name, of this or an earlier election or of the next
      // one (a faction formed during a term that then ran under its own name: New Right 2018, Kadima 2005); else, for a
      // one-member faction ("חה״כ <name>"), its member.
      const near = (hs: { k: number; id: string }[]) => hs.filter((h) => h.k <= k + 1).sort((a, b) => Number(a.k > k) - Number(b.k > k) || b.k - a.k)[0];
      const named = (field: 'shortHe' | 'nameHe') => near((listsByName.get(nameKey(he)) ?? []).filter((h) => nameKey(ds.get(h.k)!.lists.find((l) => l.id === h.id)![field]) === nameKey(he)));
      const short = named('shortHe');
      const member = /^חה״כ /.test(he) ? memberByName.get(nameKey(he.slice(5))) : undefined;
      const en = sameNameEn.get(he) ?? curatedEn.get(he) ?? (short ? out.lists[short.id][1] : null) ?? (member ? `MK ${member}` : null) ?? null;
      // the colour of that list, else of the latest list up to this election (or the next) with this very full name or
      // that same English name (Otzma Yehudit led by Itamar Ben Gvir, Hadash, Ta'al, Mapam ...)
      const twin = short ?? named('nameHe') ?? (en ? near(listsByEn.get(en) ?? []) : undefined);
      // else a lighter shade of the list most of its members were elected on, so the change still shows on the bar
      const home = [...(members.get(f.id)?.entries() ?? [])].sort((a, b) => b[1] - a[1])[0]?.[0];
      out.factions[f.id] = [he, en, twin ? out.lists[twin.id][2] : home ? mixHex(out.lists[home][2], '#ffffff', 0.45) : null];
    }
  }

  // ---- dated events that name the person (each with its sources) ----
  const events = new Map<number, PackedEvent[]>();
  for (const k of K) {
    const path = `data/research/knesset-events/k${k}.json`;
    if (!existsSync(`${root}/${path}`)) continue;
    for (const e of (read(path) as { events: KEvent[] }).events) {
      const who = e.who.personIds ?? [];
      // person-specific acts only; faction moves and seat replacements come from the membership records; votes are point-in-time
      if (!who.length || who.length > 3 || e.kind === 'faction-membership-change' || e.kind === 'member-replacement' || /vote|sworn|term-|rotation/.test(e.kind)) continue;
      if (e.classification === 'does not count' || !['confirmed', 'probable', 'provisional'].includes(e.certainty)) continue;
      const src = e.sources.filter((s) => s.url && /^https:\/\//.test(s.url)).map((s) => [s.publisher ?? new URL(s.url!).hostname, s.url!] as const);
      for (const p of who) if (terms.has(p)) (events.get(p) ?? events.set(p, []).get(p)!).push([e.date, e.kind, k, e.summary.en, e.summary.he, e.evidenceClass ?? '', src]);
    }
  }

  // ---- assemble ----
  for (const [p, rs] of runs) if (!terms.has(p) && !rs.some((r) => r.k === 26 && r.elected)) runs.delete(p);
  const ids = [...new Set([...terms.keys(), ...runs.keys()])].sort((a, b) => a - b);
  for (const p of ids) {
    const x = persons.get(p);
    if (!x) { anomalies.push(`person ${p}: not in the Knesset persons file`); continue; }
    const ts = (terms.get(p) ?? []).sort((a, b) => a[1].localeCompare(b[1]));
    const rs = (runs.get(p) ?? []).sort((a, b) => a.k - b.k || a.rank - b.rank);
    const packed: PackedRun[] = rs.map((r) => {
      const e = out.elections[r.k];
      const inK = ts.filter((t) => t[0] === r.k);
      const inSeats = r.rank <= out.lists[r.listId][3];
      let o: RunOutcome;
      if (inSeats && r.notSeated) o = 'declined';
      // elected but never sat in that Knesset (the candidate notes give the official record, e.g. withdrew before the first sitting)
      else if (inSeats && r.elected && !inK.length && r.k !== 26) o = 'declined';
      else if (inSeats && r.elected) o = 'elected';
      else if (r.elected || inK.some((t) => t[1] === e.opening)) o = 'first';
      else if (inK.length) o = 'later';
      else o = 'out';
      // the official notes on the candidates whose places explain it (their own, or those above who did not sit)
      const l = ds.get(r.k)!.lists.find((x) => x.id === r.listId)!;
      const notes = o === 'declined' ? l.candidates.find((c) => c.id === r.candidateId)?.notes ?? []
        : o === 'first' ? l.candidates.filter((c) => c.rank <= out.lists[r.listId][3]).flatMap((c) => c.notes ?? []).filter((n) => /first sitting/.test(n.en)) : [];
      return [r.k, r.listId, r.rank, o, r.basis, r.via, notes.map((n) => [n.en, n.he] as const)];
    });
    const site = siteOf.get(p) ?? null;
    const bioRec = rs.map((r) => bios.get(r.k)![r.candidateId]).find((b) => b?.hewiki?.title);
    const enCand = rs.map((r) => ds.get(r.k)!.lists.find((l) => l.id === r.listId)?.candidates.find((c) => c.id === r.candidateId)?.nameEn).filter(Boolean).pop() ?? null;
    out.people[p] = {
      he: normName(`${x.FirstName} ${x.LastName}`), en: (site != null ? enOfSite.get(site) : undefined) ?? enCand, female: x.GenderDesc === 'נקבה',
      site, wiki: bioRec?.hewiki?.title ?? null,
      terms: ts, runs: packed, events: (events.get(p) ?? []).sort((a, b) => a[0].localeCompare(b[0])),
    };
  }
  return out;
}
