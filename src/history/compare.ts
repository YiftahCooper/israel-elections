// "Comparable predecessor" (docs/design/party-history.md §3.4): the one rule every comparison of a list with an
// earlier election uses (the results rows, the list panel, Compare's notes and reasons).
// - Counted: an earlier list counts WHOLE when all its parties are on this list (following renames and mergers).
// - Not counted: an earlier list that also held parties now elsewhere is named and left out; its votes cannot be divided.
// - Group: when the leading party's earlier list is now spread over several lists led by its parties, the comparison is
//   the group (no per-successor figure).
// - New: no earlier list qualifies. To verify: the link that would decide it is not yet established.
// A joint list's votes are never divided among its parties.
import type { Scenario, SimList } from '../model/scenario.ts';
import type { AllocationResult } from '../engine/types.ts';
import type { Certainty } from '../data/evidence.ts';
import { continuations, decides, RELATIONS, weakest, type Relation } from './relations.ts';
import { HISTORY, canonicalParty, electionIndex } from './runtime.ts';

export interface ListFacts { id: string; parties: string[]; lead: string | null; seats: number; votes: number }
export interface ElectionFacts { id: string; date: string; valid: number; lists: ListFacts[] }
export type ComparisonKind = 'same' | 'combined' | 'partial' | 'group' | 'new' | 'verify' | 'first';
export interface Comparison {
  kind: ComparisonKind;
  earlier: { id: string; date: string } | null;
  /** whole earlier lists compared with */
  counted: ListFacts[];
  /** parties of this list (or group) whose earlier list also held parties now elsewhere */
  notCounted: { partyId: string; listId: string }[];
  /** partial from the other side: parties of the counted list that are now on another list */
  left: { partyId: string; listId: string }[];
  /** parties of this list with no earlier list */
  newParties: string[];
  /** current lists compared together (a split of the leading party's earlier list) */
  group: ListFacts[];
  /** recorded relations the comparison used (renames, mergers…) */
  relations: Relation[];
  /** links that would decide it but are not established ("To verify"); never used */
  toVerify: Relation[];
  certainty: Certainty;
  before: { seats: number; votes: number; valid: number };
  after: { seats: number; votes: number; valid: number };
}

/** Registered parties of a list (alliance vehicles excluded); a scenario-made list takes its origin lists' parties. */
export function partiesOf(electionId: string, l: Pick<SimList, 'id' | 'originIds' | 'parties' | 'candidates'>): string[] {
  // the compiled runtime holds each list's registered parties, canonical, with an alliance record only when it is an
  // organisation in its own right (named by an identity relation: the Hadash front, 1977–88)
  const lists = HISTORY[electionIndex(electionId)]?.lists ?? [];
  const of = (id: string) => lists.find((x) => x.id === id)?.parties ?? [];
  let ids = of(l.id);
  if (!ids.length) ids = l.originIds.flatMap(of);
  // a split part keeps only the parties its candidates still represent
  if (l.parties?.length && ids.length > 1) { const kept = new Set(l.parties.map((p) => canonicalParty(p.id))); const narrowed = ids.filter((p) => kept.has(p)); if (narrowed.length) ids = narrowed; }
  return [...new Set(ids)];
}
/** The leading party: the singleton, or candidate #1's party, or the first constituent. */
export function leadOf(electionId: string, l: Pick<SimList, 'id' | 'originIds' | 'parties' | 'candidates'>): string | null {
  const ps = partiesOf(electionId, l);
  if (ps.length <= 1) return ps[0] ?? null;
  const first = l.candidates.find((c) => !c.notSeated)?.partyId;
  return first && ps.includes(canonicalParty(first)) ? canonicalParty(first) : ps[0];
}

/** One election as comparison facts: the official runtime, or a scenario with its allocation. */
export function officialFacts(electionId: string): ElectionFacts | null {
  const e = HISTORY[electionIndex(electionId)];
  return e ? { id: e.id, date: e.date, valid: e.valid, lists: e.lists.map(({ id, parties, lead, seats, votes }) => ({ id, parties, lead, seats, votes })) } : null;
}
export function scenarioFacts(s: Scenario, r: AllocationResult): ElectionFacts {
  const date = HISTORY[electionIndex(s.electionId)]?.date ?? '';
  return {
    id: s.electionId, date, valid: s.lists.reduce((n, l) => n + l.votes, 0),
    lists: s.lists.map((l) => ({ id: l.id, parties: partiesOf(s.electionId, l), lead: leadOf(s.electionId, l), seats: r.lists.find((x) => x.id === l.id)?.seats ?? 0, votes: l.votes })),
  };
}

const sum = (ls: ListFacts[], valid: number) => ({ seats: ls.reduce((n, l) => n + l.seats, 0), votes: ls.reduce((n, l) => n + l.votes, 0), valid });

/** Compares one list of `now` with the whole lists of an earlier election. */
export function comparablePredecessor(listId: string, now: ElectionFacts, earlier: ElectionFacts | null, rels: Relation[] = RELATIONS): Comparison {
  const L = now.lists.find((l) => l.id === listId);
  const empty = { counted: [], notCounted: [], left: [], newParties: [], group: [], relations: [], toVerify: [], certainty: 'confirmed' as Certainty, before: { seats: 0, votes: 0, valid: earlier?.valid ?? 0 } };
  if (!L) throw new Error(`unknown list ${listId}`);
  const after = sum([L], now.valid);
  if (!earlier) return { kind: 'first', earlier: null, ...empty, after };

  // what each earlier party became (usable relations), and which current list now holds it
  const present = new Set(now.lists.flatMap((l) => l.parties));
  const cont = new Map<string, Map<string, Relation[]>>();
  const contOf = (q: string) => {
    if (!cont.has(q)) cont.set(q, new Map(continuations(q, earlier.date, now.date, rels, false, present).map((c) => [c.partyId, c.via])));
    return cont.get(q)!;
  };
  const holder = new Map<string, ListFacts>(); for (const l of now.lists) for (const p of l.parties) if (!holder.has(p)) holder.set(p, l);
  const homesOf = (q: string) => [...contOf(q).keys()].map((p) => holder.get(p)).filter((l): l is ListFacts => !!l);
  const intoSet = (q: string, set: Set<string>) => [...contOf(q).keys()].some((p) => set.has(p));
  /** an earlier list is whole within these current lists when none of its parties now runs anywhere else */
  const wholeIn = (M: ListFacts, ids: Set<string>) => M.parties.every((q) => homesOf(q).every((h) => ids.has(h.id)));
  const usedRels = (Ms: ListFacts[], ps: Set<string>) => {
    const out = new Map<string, Relation>();
    for (const M of Ms) for (const q of M.parties) for (const [p, via] of contOf(q)) if (ps.has(p)) for (const r of via) out.set(r.id, r);
    return [...out.values()];
  };
  const lParties = new Set(L.parties);
  const touched = earlier.lists.filter((M) => M.parties.some((q) => intoSet(q, lParties)));
  const leadHome = L.lead ? touched.find((M) => M.parties.some((q) => contOf(q).has(L.lead!))) : undefined;
  const newParties = L.parties.filter((p) => !touched.some((M) => M.parties.some((q) => contOf(q).has(p))));

  // links that would decide it, not yet established (pending or below probable)
  const verifyFor = (ps: string[], exclude: ListFacts[]) => {
    const out = new Map<string, Relation>();
    for (const M of earlier.lists) if (!exclude.includes(M)) for (const q of M.parties)
      for (const c of continuations(q, earlier.date, now.date, rels, true, present)) if (ps.includes(c.partyId) && c.via.some((r) => !decides(r))) for (const r of c.via) if (!decides(r)) out.set(r.id, r);
    return [...out.values()];
  };

  // the leading party's earlier list is spread over several lists: compare the group
  if (leadHome && !wholeIn(leadHome, new Set([L.id]))) {
    const group = now.lists.filter((l) => l.lead && leadHome.parties.some((q) => contOf(q).has(l.lead!)));
    if (group.length > 1) {
      const ids = new Set(group.map((l) => l.id)), gParties = new Set(group.flatMap((l) => l.parties));
      const counted = earlier.lists.filter((M) => M.parties.some((q) => intoSet(q, gParties)) && wholeIn(M, ids));
      if (!counted.includes(leadHome)) counted.unshift(leadHome);
      const notCounted = earlier.lists.filter((M) => !counted.includes(M)).flatMap((M) => M.parties.flatMap((q) => [...contOf(q).keys()].filter((p) => gParties.has(p)).map((p) => ({ partyId: p, listId: M.id }))));
      const left = leadHome.parties.flatMap((q) => homesOf(q).filter((h) => !ids.has(h.id)).map((h) => ({ partyId: q, listId: h.id })));
      const relations = usedRels(counted, gParties);
      return { kind: 'group', earlier: { id: earlier.id, date: earlier.date }, counted, notCounted, left, newParties, group, relations, toVerify: [],
        certainty: weakest(relations.map((r) => r.certainty)), before: sum(counted, earlier.valid), after: sum(group, now.valid) };
    }
  }

  const counted = touched.filter((M) => wholeIn(M, new Set([L.id])));
  const partial = leadHome && !counted.includes(leadHome) ? leadHome : undefined;
  if (partial) counted.unshift(partial);
  const notCounted = touched.filter((M) => !counted.includes(M)).flatMap((M) => M.parties.flatMap((q) => [...contOf(q).keys()].filter((p) => lParties.has(p)).map((p) => ({ partyId: p, listId: M.id }))));
  const left = partial ? partial.parties.flatMap((q) => homesOf(q).filter((h) => h.id !== L.id).map((h) => ({ partyId: q, listId: h.id }))) : [];
  // a party of this list whose only earlier link is unverified decides nothing: the comparison waits for it
  const toVerify = verifyFor(newParties, counted);
  const relations = usedRels(counted, lParties);
  const base = { earlier: { id: earlier.id, date: earlier.date }, counted, notCounted, left, newParties, group: [], relations, toVerify, certainty: weakest(relations.map((r) => r.certainty)), before: sum(counted, earlier.valid), after };
  if (toVerify.length && (!counted.length || newParties.includes(L.lead ?? ''))) return { ...base, kind: 'verify', certainty: 'unknown' };
  if (!counted.length) return { ...base, kind: 'new' };
  return { ...base, kind: notCounted.length || left.length ? 'partial' : counted.length > 1 ? 'combined' : 'same' };
}

/** The official comparison of a list with the election before it. */
export function comparableFor(electionId: string, listId: string, rels: Relation[] = RELATIONS): Comparison | null {
  const i = electionIndex(electionId); if (i < 0) return null;
  const now = officialFacts(electionId)!;
  return comparablePredecessor(listId, now, i > 0 ? officialFacts(HISTORY[i - 1].id) : null, rels);
}
