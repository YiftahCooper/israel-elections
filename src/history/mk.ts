// Each MK's own history (scripts/mk-history-runtime.ts compiles it; src/app/components/MkHistory.tsx draws it).
// The runtime is its own chunk, requested the first time a name or a seat could open a history.
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { MkPerson, MkRuntime, PackedRun, RunBasis, RunOutcome } from '../../scripts/mk-history-runtime.ts';

export type { MkRuntime, RunOutcome, RunBasis };
let runtime: MkRuntime | null = null;
let loading: Promise<MkRuntime> | null = null;
export function loadMkRuntime(): Promise<MkRuntime> {
  loading ??= import('virtual:mk-history').then((m) => (runtime = m.default as MkRuntime));
  return loading;
}
/** The runtime once loaded (requests it on first use). */
export function useMkRuntime(): MkRuntime | null {
  const [rt, setRt] = useState(runtime);
  useEffect(() => { if (!rt) void loadMkRuntime().then(setRt); }, [rt]);
  return rt;
}

const indexes = new WeakMap<MkRuntime, Map<string, number>>();
/** The person a candidacy belongs to, when a history card shows it (`${list id}#${rank}` ids). */
export function personOfCandidate(rt: MkRuntime, candidateId: string): number | null {
  let m = indexes.get(rt);
  if (!m) {
    m = new Map();
    for (const [id, p] of Object.entries(rt.people)) for (const r of p.runs) m.set(`${r[1]}#${r[2]}`, Number(id));
    indexes.set(rt, m);
  }
  return m.get(candidateId) ?? null;
}

// ---------- which card is open (one at a time, over everything) ----------
let open: number | null = null;
const listeners = new Set<() => void>();
const emit = () => { for (const f of listeners) f(); };
export function openMkHistory(personId: number) { open = personId; emit(); }
export function closeMkHistory() { open = null; emit(); }
export const useOpenMkHistory = () => useSyncExternalStore((f) => { listeners.add(f); return () => listeners.delete(f); }, () => open, () => null);

// ---------- the card's facts, derived (pure; tested in tests/mk-history.test.ts) ----------
export interface MkSegment {
  faction: number; he: string; en: string | null; color: string | null; start: string; end: string;
  /** times of day, where the Knesset's record gives them ("10:01"; several factions on one day) */
  startTime?: string; endTime?: string;
}
export interface MkEvent {
  date: string;
  /** the time of day, where the record gives one */
  time?: string;
  kind: 'entered' | 'left' | 'faction' | 'recorded';
  /** for faction: the new and the previous faction */
  faction?: { now: Pick<MkSegment, 'he' | 'en'>; was: Pick<MkSegment, 'he' | 'en'> };
  /** for recorded: the text, how it is known and its sources */
  text?: { en: string; he: string }; evidence?: string; sources?: readonly (readonly [string, string])[];
}
export interface MkRun {
  listId: string; rank: number; outcome: RunOutcome; basis: RunBasis; via: number | null; notes: readonly (readonly [string, string])[];
  he: string; en: string | null; color: string; seats: number; share: number; threshold: number;
}
/** One Knesset in the person's path: the election they ran in for it (if any) and their time in it. */
export interface MkRow {
  k: number; electionDate: string; opening: string | null; end: string | null;
  run: MkRun | null;
  /** time in this Knesset: one entry per continuous period */
  terms: { start: string; end: string; ongoing: boolean; segments: MkSegment[] }[];
  events: MkEvent[];
}
export interface MkView {
  id: number; he: string; en: string | null; female: boolean; site: number | null; wiki: string | null;
  rows: MkRow[];
  daysServed: number;
  /** the longest Knesset in days, so every Knesset's bar is drawn on one scale */
  longest: number;
  /** elections where they were on an official list we can read */
  runs: number;
  /** the first election from which runs that did not win a seat are shown on every list, and the earlier elections
   *  where they are shown only for some lists */
  coverage: { from: string; partial: string[] };
}

const day = (s: string) => Date.parse(`${s}T00:00:00Z`);
export const daysBetween = (a: string, b: string) => Math.round((day(b) - day(a)) / 86400000);

export function mkView(rt: MkRuntime, id: number): MkView | null {
  const p: MkPerson | undefined = rt.people[id];
  if (!p) return null;
  const ks = [...new Set([...p.terms.map((t) => t[0]), ...p.runs.map((r) => r[0])])].sort((a, b) => a - b);
  const fac = (f: number) => { const x = rt.factions[f]; return { he: x?.[0] ?? '', en: x?.[1] ?? null, color: x?.[2] ?? null }; };
  let daysServed = 0;
  const rows: MkRow[] = ks.map((k) => {
    const e = rt.elections[k];
    const r: PackedRun | undefined = p.runs.find((x) => x[0] === k);
    const L = r ? rt.lists[r[1]] : undefined;
    const run: MkRun | null = r && L ? { listId: r[1], rank: r[2], outcome: r[3], basis: r[4], via: r[5], notes: r[6] ?? [], he: L[0], en: L[1], color: L[2], seats: L[3], share: L[4], threshold: e.threshold } : null;
    // continuous periods: a term that ends the day the next begins is one period (a new record, not a gap)
    const terms: MkRow['terms'] = [];
    for (const t of p.terms.filter((x) => x[0] === k).sort((a, b) => a[1].localeCompare(b[1]))) {
      const end = t[2] ?? e.end ?? t[1];
      // the compiled records are the shown ones: no zero-length record, cut to the term, same-day ones in time order
      const segments = t[3].map(([f, s, fe, st, et]): MkSegment => ({ faction: f, ...fac(f), start: s, end: fe ?? end, ...(st ? { startTime: st } : {}), ...(et ? { endTime: et } : {}) }));
      const last = terms[terms.length - 1];
      if (last && last.end === t[1]) { last.end = end; last.ongoing = t[2] === null; last.segments.push(...segments); }
      else terms.push({ start: t[1], end, ongoing: t[2] === null, segments });
    }
    for (const t of terms) {
      // touching segments of one faction are one
      t.segments = t.segments.reduce<MkSegment[]>((out, s) => { const q = out[out.length - 1]; if (q && q.faction === s.faction && q.end === s.start && !q.endTime && !s.startTime) { q.end = s.end; if (s.endTime) q.endTime = s.endTime; } else out.push({ ...s }); return out; }, []);
      daysServed += daysBetween(t.start, t.end);
    }
    const events: MkEvent[] = [];
    terms.forEach((t, i) => {
      if (t.start !== e.opening) events.push({ date: t.start, kind: 'entered' });
      t.segments.forEach((s, j) => { if (j > 0) events.push({ date: s.start, ...(s.startTime ? { time: s.startTime } : {}), kind: 'faction', faction: { now: s, was: t.segments[j - 1] } }); });
      if (!t.ongoing && t.end !== e.end) events.push({ date: t.end, kind: 'left' });
      void i;
    });
    for (const ev of p.events.filter((x) => x[2] === k)) events.push({ date: ev[0], kind: 'recorded', text: { en: ev[3], he: ev[4] }, evidence: ev[5], sources: ev[6] });
    // by date only: the sort keeps the path's order within a day (the faction that continues comes last)
    events.sort((a, b) => a.date.localeCompare(b.date));
    return { k, electionDate: e.date, opening: e.opening, end: e.end, run, terms, events };
  });
  const full = rt.failedRunCoverage.full.slice().sort((a, b) => a - b);
  const from = rt.elections[full[0]]?.date.slice(0, 4) ?? '';
  const partial = Object.keys(rt.failedRunCoverage.partial).map(Number).sort((a, b) => a - b).map((k) => rt.elections[k].date.slice(0, 4));
  const longest = Math.max(1, ...Object.values(rt.elections).map((x) => x.opening && x.end ? daysBetween(x.opening, x.end) : 0));
  return { id, he: p.he, en: p.en, female: p.female, site: p.site, wiki: p.wiki, rows, daysServed, longest, runs: p.runs.length, coverage: { from, partial } };
}

/** "3 years 5 months" (whole months; under a month, days). */
export function servedText(days: number, lang: 'he' | 'en'): string {
  const months = Math.floor(days / 30.4375), y = Math.floor(months / 12), m = months % 12;
  if (months < 1) return lang === 'he' ? (days === 1 ? 'יום אחד' : `${days} ימים`) : `${days} day${days === 1 ? '' : 's'}`;
  if (lang === 'he') {
    const yy = y === 0 ? '' : y === 1 ? 'שנה' : y === 2 ? 'שנתיים' : `${y} שנים`;
    const mm = m === 0 ? '' : m === 1 ? 'חודש' : m === 2 ? 'חודשיים' : `${m} חודשים`;
    return yy && mm ? `${yy} ו${mm.startsWith('ח') ? '' : '־'}${mm}` : yy || mm;
  }
  const yy = y ? `${y} year${y === 1 ? '' : 's'}` : '', mm = m ? `${m} month${m === 1 ? '' : 's'}` : '';
  return [yy, mm].filter(Boolean).join(' ');
}
/** "Knesset 24" style ordinal names */
export const knessetName = (k: number, lang: 'he' | 'en') => lang === 'he' ? `הכנסת ה־${k}` : `${k}${k % 10 === 1 && k !== 11 ? 'st' : k % 10 === 2 && k !== 12 ? 'nd' : k % 10 === 3 && k !== 13 ? 'rd' : 'th'} Knesset`;
export const wikiUrl = (title: string) => `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
export const knessetUrl = (site: number) => `https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/${site}`;
