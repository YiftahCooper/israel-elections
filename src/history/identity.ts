// A party's history across elections (docs/features/party-history.md): which recorded ids are one organisation,
// and the whole list it ran in at each election. Only usable identity relations join ids (renames, the same
// organisation, and a merger's continuing predecessor); a party absorbed by another ends, a split-off starts anew, and
// "not the same party" facts are never crossed. The series is generic enough to describe a person later (MK history):
// one point per election with a whole-list total, the subject's own share of it, and a role.
import { RELATIONS, distinct, usable, type Relation } from './relations.ts';
import { HISTORY, partyNameAt, type HList } from './runtime.ts';

export interface Identity {
  /** the id the history was opened for */
  key: string;
  /** every recorded id of this organisation */
  ids: string[];
  /** identity relations that joined them */
  links: Relation[];
}

/** For a merger, the predecessor whose history continues: recorded, or the leading party of the last joint list the
 *  merging parties ran on together before the merger (a recorded fact: who was first on that list). */
export function continuingParty(r: Relation): string | null {
  if (r.kind !== 'merged-into') return null;
  if (r.continues) return r.continues;
  const before = r.date.length === 4 ? `${r.date}-01-01` : r.date;
  for (let i = HISTORY.length - 1; i >= 0; i--) {
    if (HISTORY[i].date >= before) continue;
    const l = HISTORY[i].lists.find((x) => x.parties.filter((p) => r.from.includes(p)).length >= 2);
    if (l) return l.lead && r.from.includes(l.lead) ? l.lead : null;
  }
  return null;
}

const joins = (r: Relation): [string, string][] => {
  if (!usable(r)) return [];
  if (r.kind === 'renamed-to' || r.kind === 'same-organisation') return r.from.flatMap((a) => r.to.map((b) => [a, b] as [string, string]));
  if (r.kind === 'merged-into' && (!r.stage || r.stage === 'registered')) { const c = continuingParty(r); return c ? r.to.map((b) => [c, b] as [string, string]) : []; }
  return [];
};

export function identityOf(partyId: string, rels: Relation[] = RELATIONS): Identity {
  const ids = new Set([partyId]); const links: Relation[] = [];
  let grew = true;
  while (grew) {
    grew = false;
    for (const r of rels) for (const [a, b] of joins(r)) {
      const inA = ids.has(a), inB = ids.has(b);
      if (inA === inB) continue;
      const next = inA ? b : a;
      if ([...ids].some((x) => distinct(x, next, rels))) continue;
      ids.add(next); if (!links.includes(r)) links.push(r); grew = true;
    }
  }
  return { key: partyId, ids: [...ids], links };
}

export type Role = 'alone' | 'led' | 'inside';
export interface SeriesPoint {
  /** election index (0 = 1949) */
  i: number;
  list: HList | null;
  /** the identity's ids on this list */
  members: string[];
  role: Role | null;
  /** the whole list's seats and votes; votes are never divided */
  seats: number; votes: number; valid: number;
  /** the subject's own elected members (official per-person records); null when not known */
  own: number | null;
  /** the other parties on the list */
  partners: string[];
  /** the name the subject ran under (its id on this list) */
  era: string | null;
}

/** The list's own record when it is an organisation (the Hadash front of 1977–88). */
const isListRecord = (p: string, l: HList) => p === `vehicle-${l.id}`;

export function partySeries(identity: Identity): SeriesPoint[] {
  const ids = new Set(identity.ids);
  return HISTORY.map((e, i) => {
    const lists = e.lists.filter((l) => l.parties.some((p) => ids.has(p)));
    const l = lists.find((x) => x.lead && ids.has(x.lead)) ?? lists.find((x) => x.parties.some((p) => ids.has(p) && isListRecord(p, x))) ?? [...lists].sort((a, b) => b.seats - a.seats)[0];
    if (!l) return { i, list: null, members: [], role: null, seats: 0, votes: 0, valid: e.valid, own: null, partners: [], era: null };
    const members = l.parties.filter((p) => ids.has(p));
    const front = members.some((p) => isListRecord(p, l));
    const partners = front ? [] : l.parties.filter((p) => !ids.has(p) && !isListRecord(p, l));
    const role: Role = !partners.length ? 'alone' : l.lead && ids.has(l.lead) ? 'led' : 'inside';
    const known = members.map((p) => l.elected[p]);
    const own = role === 'alone' ? l.seats : known.some((n) => n === null || n === undefined) ? null : known.reduce<number>((n, x) => n + (x ?? 0), 0);
    const era = members.find((p) => !isListRecord(p, l) || members.length === 1) ?? members[0];
    return { i, list: l, members, role, seats: l.seats, votes: l.votes, valid: e.valid, own, partners, era };
  });
}

/** Consecutive runs of the same name: the name strip under the chart (Mapai | Labor | The Democrats). Each election
 *  shows the name the party ran under then, never a later one (New Right in April 2019, not Yamina). */
export function erasOf(points: SeriesPoint[], lang: 'he' | 'en'): { from: number; to: number; name: string }[] {
  const out: { from: number; to: number; name: string }[] = [];
  for (const p of points) {
    if (!p.era) continue;
    const name = partyNameAt(p.era, p.i, lang);
    const last = out[out.length - 1];
    if (last && last.name === name) last.to = p.i; else out.push({ from: p.i, to: p.i, name });
  }
  return out;
}

/** Events in a history: dated relations touching the organisation (identity bookkeeping excluded), oldest first. */
export function eventsOf(identity: Identity, rels: Relation[] = RELATIONS): Relation[] {
  const ids = new Set(identity.ids);
  return rels.filter((r) => !['electoral-partner', 'not-same-organisation', 'leader-moved-to', 'same-organisation'].includes(r.kind) && [...r.from, ...r.to].some((p) => ids.has(p)))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
