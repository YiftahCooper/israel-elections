// "Find an MK" over the seat chart: type part of a name (Hebrew or English) and the chart rings that member's seat and
// names it; the other seats fade. Several matches are listed as buttons to choose from.
import { useId } from 'react';
import { useL } from '../i18n.ts';

/** One seat as the search sees it: the names it answers to and the label shown when it is found. */
export interface MkEntry { seat: number; names: string[]; label: string }

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

/** The seat the search points at: the only match, or the one chosen among several (`pick`). */
export function foundSeat(entries: MkEntry[], query: string, pick: number | null): number | null {
  const m = findMks(entries, query);
  return m.length === 1 ? m[0].seat : m.some((e) => e.seat === pick) ? pick : null;
}

/** The search box and, for several matches, the buttons to choose one (`pick`). */
export function FindMk({ entries, query, onQuery, pick, onPick }: { entries: MkEntry[]; query: string; onQuery: (q: string) => void; pick: number | null; onPick: (seat: number | null) => void }) {
  const L = useL(), id = useId();
  const matches = findMks(entries, query), found = foundSeat(entries, query, pick);
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
      {query.trim() && !matches.length && <span className="muted">{L('No MK by that name in this Knesset', 'אין ח״כ בשם הזה בכנסת הזאת')}</span>}
      {found !== null && <span className="sr-only">{entries.find((e) => e.seat === found)?.label}</span>}
    </span>
    {matches.length > 1 && <span className="find-mk-choices">
      {shown.map((m) => <button key={m.seat} type="button" className={`btn small ${m.seat === found ? '' : 'ghost'}`} aria-pressed={m.seat === found} onClick={() => onFound(m.seat === found ? null : m.seat)}>{m.label}</button>)}
      {matches.length > shown.length && <span className="muted small">{L(`and ${matches.length - shown.length} more: type more of the name`, `ועוד ${matches.length - shown.length}: הקלידו עוד מהשם`)}</span>}
    </span>}
  </div>;
}
