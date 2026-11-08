// The compact party-history runtime (scripts/party-history-runtime.ts): whole-list figures per election, without
// loading each election's dataset. Votes belong to whole lists; elected members per party are the joint-list facts.
import packed from 'virtual:party-history';
import { englishLabel } from '../data/names.ts';

export interface HList {
  id: string; votes: number; seats: number; color: string; shortHe: string; shortEn: string | null; letters: string;
  lead: string | null;
  /** registered parties and one-election vehicles on the list (alliance vehicles excluded) */
  parties: string[];
  /** elected members per party (official per-person records); null when not known for that party */
  elected: Record<string, number | null>;
  unknownElected: number;
}
export interface HElection { id: string; date: string; valid: number; pending: boolean; lists: HList[] }

export const HISTORY: HElection[] = packed.elections.map((e) => ({
  id: e.id, date: e.date, valid: e.valid, pending: e.pending,
  lists: e.lists.map(([id, votes, seats, color, shortHe, shortEn, letters, lead, ps, unknownElected]) => ({
    id, votes, seats, color, shortHe, shortEn, letters, lead, parties: ps.map(([p]) => p),
    elected: Object.fromEntries(ps.map(([p, n]) => [p, n < 0 ? null : n])), unknownElected,
  })),
}));
export const electionIndex = (id: string) => HISTORY.findIndex((e) => e.id === id);
export const historyList = (electionId: string, listId: string) => HISTORY[electionIndex(electionId)]?.lists.find((l) => l.id === listId);
export const isRegisteredParty = (id: string) => packed.parties[id]?.[2] === 1;

/** A party's short name (the list's short name where it ran alone, else its constituent name). */
/** A party's current id (a retired id maps to its successor record), from the compiled runtime: no registry needed. */
export const canonicalParty = (id: string) => packed.aliases[id] ?? id;

export function partyShort(id: string, lang: 'he' | 'en'): string {
  const p = packed.parties[id];
  if (!p) {
    // a joint list's own record (vehicle-<list id>) is named as that list
    const l = id.startsWith('vehicle-') ? HISTORY.flatMap((e) => e.lists).find((x) => `vehicle-${x.id}` === id) : undefined;
    return l ? listShort(l, lang) : lang === 'he' ? 'מפלגה לא ידועה' : 'Unknown party';
  }
  return lang === 'he' ? p[0] : englishLabel(p[1], p[0]);
}
export const listShort = (l: Pick<HList, 'shortHe' | 'shortEn'>, lang: 'he' | 'en') => lang === 'he' ? l.shortHe : englishLabel(l.shortEn, l.shortHe);

const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_HE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];
/** "2022"; "Apr 2019" when two elections share the year. `short`: "’22", "’19a". */
export function yearLabel(i: number, lang: 'he' | 'en', short = false): string {
  const e = HISTORY[i]; if (!e) return '';
  const y = e.date.slice(0, 4);
  const twins = HISTORY.filter((x) => x.date.slice(0, 4) === y);
  if (short) return `’${y.slice(2)}${twins.length > 1 ? 'ab'[twins.indexOf(e)] : ''}`;
  if (twins.length < 2) return y;
  const m = Number(e.date.slice(5, 7)) - 1;
  return `${(lang === 'he' ? MONTH_HE : MONTH_EN)[m]} ${y}`;
}
