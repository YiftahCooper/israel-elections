// While comparing (compare/mode.ts), what each list of your work stood at in the reference: the Lists panel's striped
// bar and its line ("2022: 32 ▼ −5 · Likud"). Lists are paired by the same rule as Side by side and the Copy votes box
// (match.ts: sourced party records across elections, origins within one), so a line never promises a copy that the
// box would not make. Its own chunk: the pairing needs the party registry, which the start-up bundle does not load.
import type { Lang } from '../i18n.ts';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf, listLabel } from '../derive.ts';
import { partyLabel } from '../../families/registry.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { groupIds, matchRows, mirrorRows, partiesOf, type MatchOverride, type MatchRow, type MatchTag } from './match.ts';

export interface RefLine {
  /** pair: one or more reference lists counted against this list (or its group); new: nothing in the reference;
   *  check: a link that is recorded but not established, so no figure */
  kind: 'pair' | 'new' | 'check';
  tag: MatchTag;
  /** the reference lists' seats together (pair only) */
  seats: number;
  /** your lists counted with this one against those seats (a split: every successor; otherwise just this list) */
  together: string[];
  /** the reference lists' names, "Labor + Meretz"; empty when it is plainly the same name */
  names: string;
  /** what happened between them, already in the reader's language: "(joined)", "(split into 3)" */
  how: string;
  /** a bar is drawn only when the seats belong to this one list */
  bar: boolean;
  /** parties now on this list that ran inside another reference list, which the figure does not count */
  notCounted: string[];
}
export interface RefOnly { id: string; name: string; seats: number; votes: number }
export interface RefRows { byList: Map<string, RefLine>; only: RefOnly[]; onlySmall: number; maxSeats: number }

/** Your work on the right, the reference on the left. User pairings are kept in the earlier → later order (sides.ts). */
export function pairedRows(work: Scenario, ref: Scenario, overrides: MatchOverride[], refEarlier: boolean): MatchRow[] {
  if (work.electionId === ref.electionId) return matchRows(ref, work);
  return refEarlier ? matchRows(ref, work, overrides) : mirrorRows(matchRows(work, ref, overrides));
}

const HOW: Partial<Record<MatchTag, [string, string]>> = {
  renamed: ['renamed', 'שינתה שם'], joined: ['joined', 'הצטרפה'], merged: ['merged', 'התאחדו'],
  'ran-jointly': ['ran separately', 'רצו בנפרד'], yours: ['paired by you', 'הותאמה על ידיכם'], split: ['split', 'התפצלה'],
};

export function refRows(work: Scenario, ref: Scenario, overrides: MatchOverride[], refEarlier: boolean, label: string, lang: Lang): RefRows {
  const rows = pairedRows(work, ref, overrides, refEarlier);
  const rr = allocationOf(ref);
  const seatsOf = (ids: string[]) => ids.reduce((t, id) => t + (rr.lists.find((l) => l.id === id)?.seats ?? 0), 0);
  const nameOf = (id: string) => { const l = ref.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const en = lang === 'en';
  const same = work.electionId === ref.electionId;
  const byList = new Map<string, RefLine>();
  const only: RefOnly[] = [];
  const seen = new Set<string>();
  // a party now on this list that ran inside a reference list outside its row: named, never counted
  const notCountedOf = (row: MatchRow) => row.notes.filter((n) => n.side === 'right' && n.kind === 'with').flatMap((n) => n.partyIds).map((p) => {
    const home = ref.lists.find((l) => partiesOf(ref.electionId, l).includes(p));
    const party = partyLabel(p, lang);
    return home ? (en ? `${party} not counted: it ran inside ${nameOf(home.id)} in ${label}.` : `${party} לא נספרה: ${hebrewPrefix('ב', label)} רצה בתוך ${nameOf(home.id)}.`)
      : (en ? `${party} not counted: it ran on another list in ${label}.` : `${party} לא נספרה: ${hebrewPrefix('ב', label)} רצה ברשימה אחרת.`);
  });
  for (const row of rows) {
    if (!row.right.length) { for (const id of row.left) only.push({ id, name: nameOf(id), seats: seatsOf([id]), votes: ref.lists.find((l) => l.id === id)?.votes ?? 0 }); continue; }
    if (row.tag === 'new') { for (const id of row.right) byList.set(id, { kind: 'new', tag: 'new', seats: 0, together: [id], names: '', how: '', bar: false, notCounted: [] }); continue; }
    if (row.tag === 'check') {
      for (const id of row.right) byList.set(id, { kind: 'check', tag: 'check', seats: 0, together: [id], names: row.left.map(nameOf).join(' + '), how: '', bar: false, notCounted: [] });
      continue;
    }
    // a split counts the whole group: the reference list against all of its successors
    const g = row.group ? rows.filter((x) => x.group === row.group) : [row];
    if (row.group && seen.has(row.group)) continue;
    if (row.group) seen.add(row.group);
    const left = groupIds(g, 'left'), right = groupIds(g, 'right');
    const names = left.map(nameOf).join(' + ');
    const parts = right.length;
    const how = parts > 1 ? (en ? `split into ${parts}` : `התפצלה ל-${parts}`) : HOW[row.tag]?.[en ? 0 : 1] ?? '';
    const notCounted = g.flatMap(notCountedOf);
    for (const id of right) {
      const plain = same && row.tag === 'same' && left.length === 1 && right.length === 1 && names === nameOf(id) && nameOf(id) === listLabel(work.lists.find((l) => l.id === id)!, lang);
      byList.set(id, { kind: 'pair', tag: row.tag, seats: seatsOf(left), together: right, names: plain ? '' : names, how: how ? `(${how})` : '', bar: parts === 1, notCounted });
    }
  }
  // the reference's lists with no list now: those that won a seat or 0.5% of the votes, the rest counted
  const valid = ref.lists.reduce((t, l) => t + l.votes, 0);
  only.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
  const shown = only.filter((x) => x.seats > 0 || x.votes >= valid * 0.005);
  const maxSeats = Math.max(0, ...[...byList.values()].filter((x) => x.bar).map((x) => x.seats));
  return { byList, only: shown, onlySmall: only.length - shown.length, maxSeats };
}
