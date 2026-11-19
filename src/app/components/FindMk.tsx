// "Find an MK" over the seat chart: type part of a name (Hebrew or English) and the chart rings that member's seat and
// names it; the other seats fade. Several matches are listed as buttons to choose from. Someone who entered the Knesset
// after its first sitting has no seat on the chart, which shows the seats as filled at the first sitting: the search
// still finds them (from the Knesset's membership records, via the MK history), says from when they sat, and opens their
// history (review V3 F2, 19 Nov 2026: "No MK by that name" for Orna Starkmann, Haim Ramon and every other replacement).
import { useEffect, useId, useState } from 'react';
import { useL, useLang } from '../i18n.ts';
import { formatDate } from '../dateFormat.ts';
import { loadMkRuntime, openMkHistory, personOfCandidate, type MkRuntime } from '../../history/mk.ts';

/** One member as the search sees it: the names they answer to and the label shown when found. `seat` is their place on
 *  the chart; a member who entered later has none (`seat` below 0) and carries their person and first day instead. */
export interface MkEntry { seat: number; names: string[]; label: string; later?: { personId: number; from: string } }

/** Everyone who sat in Knesset `knesset` but entered after its first sitting, and is not one of the chart's members
 *  (`seatedCandidateIds`): from the Knesset's membership records, as the MK history holds them. Seats are numbered -1,
 *  -2, … so they never ring a seat. */
export function laterMembers(rt: MkRuntime, knesset: number, seatedCandidateIds: string[], lang: 'en' | 'he'): MkEntry[] {
  const opening = rt.elections[knesset]?.opening;
  if (!opening) return [];
  const seated = new Set(seatedCandidateIds.map((id) => personOfCandidate(rt, id)).filter((p) => p !== null));
  const out: { personId: number; from: string; he: string; en: string | null }[] = [];
  for (const [id, p] of Object.entries(rt.people)) {
    const personId = Number(id);
    const first = p.terms.filter((t) => t[0] === knesset).map((t) => t[1]).sort()[0];
    if (!first || first <= opening || seated.has(personId)) continue;
    out.push({ personId, from: first, he: p.he, en: p.en });
  }
  out.sort((a, b) => a.from.localeCompare(b.from) || a.he.localeCompare(b.he));
  return out.map((m, i) => {
    const name = lang === 'en' && m.en ? m.en : m.he;
    return { seat: -1 - i, names: [m.he, ...(m.en ? [m.en] : [])], later: { personId: m.personId, from: m.from },
      label: lang === 'en' ? `${name} · from ${formatDate(m.from, 'en')}` : `${name} · מ־${formatDate(m.from, 'he')}` };
  });
}

/** Lower case, without niqqud, accents, quotes, geresh or hyphens, spaces collapsed. */
export const foldName = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/["'`׳״’‘\-–־.]/g, ' ').replace(/\s+/g, ' ').trim();

/** The seats whose member matches every word typed (each word the start of one of the name's words), in seat order. */
export function findMks(entries: MkEntry[], query: string): MkEntry[] {
  const words = foldName(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  return entries.filter((e) => e.names.some((n) => {
    const parts = foldName(n).split(' ');
    return words.every((w) => parts.some((p) => p.startsWith(w)));
  }));
}

/** The entry the search points at: the only match, or the one chosen among several (`pick`). */
export function foundEntry(entries: MkEntry[], query: string, pick: number | null): number | null {
  const m = findMks(entries, query);
  return m.length === 1 ? m[0].seat : m.some((e) => e.seat === pick) ? pick : null;
}
/** The seat the search rings: the found entry when it has a place on the chart. */
export function foundSeat(entries: MkEntry[], query: string, pick: number | null): number | null {
  const f = foundEntry(entries, query, pick);
  return f !== null && f >= 0 ? f : null;
}

/** The search box and, for several matches, the buttons to choose one (`pick`). `knesset` and `seatedCandidateIds` let
 *  it also find those who entered that Knesset after its first sitting (loaded once something is typed). */
export function FindMk({ entries: seatEntries, query, onQuery, pick, onPick, knesset, seatedCandidateIds }: { entries: MkEntry[]; query: string; onQuery: (q: string) => void; pick: number | null; onPick: (seat: number | null) => void; knesset?: number; seatedCandidateIds?: string[] }) {
  const L = useL(), lang = useLang(), id = useId();
  // the membership records come with the MK history, requested only once a name is typed
  const [rt, setRt] = useState<MkRuntime | null>(null);
  const typed = query.trim() !== '';
  useEffect(() => { if (typed && !rt && knesset) void loadMkRuntime().then(setRt); }, [typed, rt, knesset]);
  const entries = rt && knesset && seatedCandidateIds ? [...seatEntries, ...laterMembers(rt, knesset, seatedCandidateIds, lang)] : seatEntries;
  const matches = findMks(entries, query), found = foundEntry(entries, query, pick);
  const later = found !== null ? entries.find((e) => e.seat === found)?.later : undefined;
  const laterName = later ? entries.find((e) => e.seat === found)!.label.split(' · ')[0] : '';
  // until the records are in, a miss is not yet a miss
  const waiting = !!knesset && !!seatedCandidateIds && !rt;
  const shown = matches.slice(0, 8);
  const onFound = onPick;
  const set = (q: string) => { onQuery(q); onPick(null); };
  return <div className="find-mk">
    <label htmlFor={id}>{L('Find an MK', 'חיפוש ח״כ')}</label>
    <input id={id} type="search" value={query} placeholder={L('Name', 'שם')} autoComplete="off"
      onChange={(e) => set(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && matches.length) { e.preventDefault(); onFound(matches[0].seat); } if (e.key === 'Escape' && query) { e.preventDefault(); e.stopPropagation(); set(''); } }} />
    {/* the found seat's name is written beside the seat itself, so here it is only said aloud */}
    <span className="find-mk-result small" role="status" aria-live="polite">
      {query.trim() && !matches.length && !waiting && <span className="muted">{L('No MK by that name in this Knesset', 'אין ח״כ בשם הזה בכנסת הזאת')}</span>}
      {found !== null && found >= 0 && <span className="sr-only">{entries.find((e) => e.seat === found)?.label}</span>}
      {later && <span className="find-mk-later">
        {L(`${laterName}: in the Knesset from ${formatDate(later.from, 'en')}, after the first sitting. The chart shows the seats as filled at the first sitting.`,
          `${laterName}: בכנסת מ־${formatDate(later.from, 'he')}, אחרי הישיבה הראשונה. התרשים מראה את המושבים כפי שאוישו בישיבה הראשונה.`)}
        {' '}<button type="button" className="btn small ghost" onClick={() => openMkHistory(later.personId)}>{L('MK history', 'המסלול בכנסת')}</button>
      </span>}
    </span>
    {matches.length > 1 && <span className="find-mk-choices">
      {shown.map((m) => <button key={m.seat} type="button" className={`btn small ${m.seat === found ? '' : 'ghost'}`} aria-pressed={m.seat === found} onClick={() => onFound(m.seat === found ? null : m.seat)}>{m.label}</button>)}
      {matches.length > shown.length && <span className="muted small">{L(`and ${matches.length - shown.length} more: type more of the name`, `ועוד ${matches.length - shown.length}: הקלידו עוד מהשם`)}</span>}
    </span>}
  </div>;
}
