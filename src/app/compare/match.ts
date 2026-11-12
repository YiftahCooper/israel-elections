// Pairs the lists of two sides of a comparison (design: israel-elections-private docs/design/compare-workbench.md §5).
// Across elections, lists are paired only from sourced party records (data/meta/parties.json appearances and the
// documented lineage edges), never by name, ballot letters or vote rank. Within one election, lists are paired by
// their origin (originIds), as the scenario's merges, splits and added lists record it.
import { continuations, decides, RELATIONS, usable, type Relation } from '../../history/relations.ts';
import { HISTORY } from '../../history/runtime.ts';
import { leadOf, partiesOf } from '../../history/compare.ts';
import type { Scenario, SimCandidate, SimList } from '../../model/scenario.ts';
export { leadOf, partiesOf };

export type MatchTag = 'same' | 'renamed' | 'joined' | 'ran-jointly' | 'merged' | 'split' | 'new' | 'ended' | 'check' | 'yours';
/** Why two lists were paired (the matching panel's (i) shows the source). */
export type MatchReason =
  | { kind: 'leading-party'; partyId: string }
  | { kind: 'constituent'; partyIds: string[] }
  | { kind: 'lineage'; edgeId: string; relation: string }
  | { kind: 'pending'; edgeId: string }
  | { kind: 'origin' }
  | { kind: 'user' }
  | { kind: 'none' };
export interface MatchNote {
  side: 'left' | 'right';
  /** with: the right list also holds parties that ran elsewhere; moved: a left party now runs on another list */
  kind: 'with' | 'moved';
  partyIds: string[];
  /** for moved: the right list it moved to */
  listId?: string;
}
export interface MatchRow {
  key: string;
  left: string[];
  right: string[];
  tag: MatchTag;
  /** rows that came from one left list (a split): they share this id; the left numbers sit on the main row only */
  group?: string;
  /** a split successor: its source list is shown on the group's main row ("in Religious Zionism"); inRight once mirrored */
  inLeft?: string;
  inRight?: string;
  /** left lists whose relation to the right list is announced but unconfirmed (lineage pending) */
  check?: string[];
  reason: MatchReason;
  notes: MatchNote[];
}
/** A user decision about a pairing; analysis only (kept with the comparison, never in either scenario). */
export interface MatchOverride { left: string; right: string | null; status: 'accepted' | 'rejected' | 'user' }

const dateOf = (electionId: string) => HISTORY.find((e) => e.id === electionId)?.date ?? '';
/** An organisational merger or absorption (the only links that make a row "Merged" rather than "Ran jointly"). */
const merger = (via: Relation[]) => via.some((r) => r.kind === 'merged-into' || r.kind === 'absorbed-into');
/** One organisation stored under two records ("same party, stored twice"): the same party, not a rename. */
const sameOrganisation = (via: Relation[]) => via.every((r) => r.kind === 'same-organisation');

const rowKey = (left: string[], right: string[]) => `${left.join('+')}>${right.join('+')}`;

/** Same-election pairing: lists that share an origin form one row (merges and splits), as decision 0017 records. */
function sameElection(a: Scenario, b: Scenario): MatchRow[] {
  const parent = new Map<string, string>();
  const find = (x: string): string => { while (parent.get(x) !== x) x = parent.get(x)!; return x; };
  const add = (x: string) => { if (!parent.has(x)) parent.set(x, x); };
  const join = (x: string, y: string) => { add(x); add(y); parent.set(find(x), find(y)); };
  for (const l of [...a.lists, ...b.lists]) { add(`o:${l.originIds[0]}`); for (const o of l.originIds) join(`o:${l.originIds[0]}`, `o:${o}`); }
  const groups = new Map<string, { left: string[]; right: string[] }>();
  const put = (side: 'left' | 'right', l: SimList) => { const k = find(`o:${l.originIds[0]}`); const g = groups.get(k) ?? { left: [], right: [] }; g[side].push(l.id); groups.set(k, g); };
  a.lists.forEach((l) => put('left', l)); b.lists.forEach((l) => put('right', l));
  return [...groups.values()].map(({ left, right }) => ({
    key: rowKey(left, right), left, right, notes: [], reason: left.length && right.length ? { kind: 'origin' } : { kind: 'none' },
    tag: !left.length ? 'new' : !right.length ? 'ended' : left.length > 1 ? 'merged' : right.length > 1 ? 'split' : 'same',
  }));
}

/** Pairs the lists of `a` (left) and `b` (right). Every list appears in exactly one row; each left list leads at most one.
 *  Across elections a party is followed only along recorded relations (src/history/relations.ts), the same ones the
 *  "compared with last time" rule uses: renames, registered mergers and absorptions, same organisation. */
export function matchRows(a: Scenario, b: Scenario, overrides: MatchOverride[] = []): MatchRow[] {
  if (a.electionId === b.electionId) return sameElection(a, b);
  const all = (s: Scenario) => s.lists.map((l) => ({ l, ps: partiesOf(s.electionId, l), lead: leadOf(s.electionId, l) }));
  const Aall = all(a), Ball = all(b);
  // a list that withdrew before the vote is no list: never paired or noted by the rules (only by the user's own
  // mapping), so its row is Ended or New, as if its parties had no list in that election (audit 12 Nov 2026)
  const A = Aall.filter((x) => !x.l.withdrawn), B = Ball.filter((x) => !x.l.withdrawn);
  const from = dateOf(a.electionId), to = dateOf(b.electionId);
  const present = new Set(B.flatMap((x) => x.ps));
  const contCache = new Map<string, Map<string, Relation[]>>();
  /** what an earlier party became by the later election (itself included), with the relations it took */
  const cont = (q: string) => { if (!contCache.has(q)) contCache.set(q, new Map(continuations(q, from, to, RELATIONS, false, present).map((c) => [c.partyId, c.via]))); return contCache.get(q)!; };
  const into = (q: string | null, ps: string[]) => q ? ps.find((p) => cont(q).has(p)) : undefined;
  type Row = MatchRow & { leftSet: Set<string> };
  const rows: Row[] = [];
  const rowOfRight = new Map<string, Row>();
  const used = new Set<string>(); // left lists already placed
  const rejected = (l: string, r: string) => overrides.some((o) => o.status === 'rejected' && o.left === l && (o.right === r || o.right === null));
  const accepted = (l: string, r: string) => overrides.some((o) => o.status === 'accepted' && o.left === l && o.right === r);
  const open = (r: (typeof B)[number], left: string[], tag: MatchTag, reason: MatchReason) => {
    const row: Row = { key: '', left, right: [r.l.id], tag, reason, notes: [], leftSet: new Set(left) };
    rows.push(row); rowOfRight.set(r.l.id, row); left.forEach((x) => used.add(x));
    return row;
  };
  const splitEdge = (lead: string | null, r: (typeof B)[number]) => lead ? RELATIONS.find((e) => e.kind === 'split-from' && usable(e) && e.from.includes(lead) && e.to.some((p) => r.ps.includes(p))) : undefined;

  // 0. the user's own mappings come first
  for (const o of overrides.filter((o) => o.status === 'user' && o.right)) {
    const r = Ball.find((x) => x.l.id === o.right), l = Aall.find((x) => x.l.id === o.left);
    if (!r || !l || used.has(l.l.id)) continue;
    const row = rowOfRight.get(r.l.id);
    if (row) { row.left.push(l.l.id); row.leftSet.add(l.l.id); used.add(l.l.id); row.tag = 'yours'; }
    else open(r, [l.l.id], 'yours', { kind: 'user' });
  }
  // 1. the same leading party (or one alliance led by another of its parties), also through a recorded rename or merger.
  //    A front that is an organisation in its own right (its record on the list: the Hadash front 1977–88, Sheli 1977)
  //    leads its own list too, as the "compared with last time" rule counts it
  const front = (x: (typeof A)[number], to: string) => x.ps.find((q) => x.l.originIds.some((o) => q === `vehicle-${o}`) && cont(q).has(to));
  for (const r of B) {
    if (rowOfRight.has(r.l.id)) continue;
    const l = A.find((x) => !used.has(x.l.id) && !rejected(x.l.id, r.l.id) && x.lead && r.lead && (cont(x.lead).has(r.lead) || !!front(x, r.lead) || !!into(x.lead, r.ps) && x.ps.some((q) => cont(q).has(r.lead!))));
    if (!l) continue;
    const via = cont(l.lead!).get(r.lead!) ?? (front(l, r.lead!) ? cont(front(l, r.lead!)!).get(r.lead!) : undefined) ?? cont(l.lead!).get(into(l.lead, r.ps)!) ?? [];
    if (!via.length) open(r, [l.l.id], 'same', { kind: 'leading-party', partyId: l.lead! });
    else open(r, [l.l.id], merger(via) ? 'merged' : sameOrganisation(via) ? 'same' : 'renamed', { kind: 'lineage', edgeId: via[0].id, relation: via[0].kind });
  }
  // 2. a left list whose leading party now runs inside a right list led by another party: joined, or ran jointly with
  //    others (Merged only along a recorded merger). When the right list's own leader ran inside a third list, the
  //    right list is that list's split successor and the joiners are kept for it (step 4).
  const deferred = new Map<string, string[]>();
  for (const r of B) {
    const joiners = A.filter((x) => !used.has(x.l.id) && !rejected(x.l.id, r.l.id) && !!into(x.lead, r.ps));
    if (!joiners.length) continue;
    const row = rowOfRight.get(r.l.id);
    const ids = joiners.map((x) => x.l.id);
    const viaOf = (x: (typeof A)[number]) => cont(x.lead!).get(into(x.lead, r.ps)!) ?? [];
    const leaderHome = !row && r.lead ? A.find((x) => x.ps.some((q) => cont(q).has(r.lead!))) : undefined;
    if (leaderHome && !joiners.includes(leaderHome) && !(leaderHome.lead && cont(leaderHome.lead).has(r.lead!))) {
      deferred.set(r.l.id, ids); ids.forEach((x) => used.add(x)); continue;
    }
    if (row) {
      row.left.push(...ids); ids.forEach((x) => { row.leftSet.add(x); used.add(x); });
      if (row.tag !== 'yours') row.tag = joiners.every((x) => merger(viaOf(x))) ? 'merged' : 'ran-jointly';
    } else {
      const via = viaOf(joiners[0]);
      open(r, ids, ids.length > 1 ? (joiners.every((x) => merger(viaOf(x))) ? 'merged' : 'ran-jointly') : merger(via) ? 'merged' : 'joined',
        via.length ? { kind: 'lineage', edgeId: via[0].id, relation: via[0].kind } : { kind: 'constituent', partyIds: [joiners[0].lead!] });
    }
  }
  // 3. links that are recorded but not established (pending, below probable, or a merger not yet registered): shown
  //    as Check until the user accepts or rejects them; never asserted
  for (const r of B) for (const x of A) {
    if (used.has(x.l.id) || !x.lead || rejected(x.l.id, r.l.id)) continue;
    const link = continuations(x.lead, from, to, RELATIONS, true, present).find((c) => r.ps.includes(c.partyId) && c.via.some((e) => !decides(e)));
    if (!link) continue;
    const ok = accepted(x.l.id, r.l.id);
    const row = rowOfRight.get(r.l.id) ?? open(r, [], ok ? 'merged' : 'check', { kind: 'pending', edgeId: link.via.find((e) => !decides(e))!.id });
    row.left.push(x.l.id); row.leftSet.add(x.l.id); used.add(x.l.id);
    if (ok) { if (row.tag === 'check' && !row.check?.length) row.tag = row.left.length > 1 ? 'ran-jointly' : 'yours'; }
    else { row.check = [...row.check ?? [], x.l.id]; row.tag = 'check'; }
  }
  // 4. a right list led by a party that ran inside a left list: a split from it (grouped with that list's row)
  for (const r of B) {
    if (rowOfRight.has(r.l.id)) continue;
    let best: (typeof A)[number] | undefined, bestShared = 0, edge: Relation | undefined;
    for (const x of A) {
      if (rejected(x.l.id, r.l.id)) continue;
      const shared = r.ps.filter((p) => x.ps.some((q) => cont(q).has(p))).length + (r.lead && x.ps.some((q) => cont(q).has(r.lead!)) ? 10 : 0);
      const e = splitEdge(x.lead, r);
      if (shared + (e ? 20 : 0) > bestShared) { best = x; bestShared = shared + (e ? 20 : 0); edge = e; }
    }
    const extra = deferred.get(r.l.id) ?? [];
    if (!best) { if (extra.length) open(r, extra, extra.length > 1 ? 'ran-jointly' : 'joined', { kind: 'constituent', partyIds: [] }); continue; }
    const g = `split:${best.l.id}`;
    const reason: MatchReason = edge ? { kind: 'lineage', edgeId: edge.id, relation: 'split-from' } : { kind: 'constituent', partyIds: r.ps.filter((p) => best!.ps.some((q) => cont(q).has(p))) };
    const main = rows.find((x) => x.left.length === 1 && x.left[0] === best!.l.id) ?? rows.find((x) => x.left.includes(best!.l.id));
    if (main) {
      // the source list may itself be part of a merged row (the Liberals of 1961 in Gahal, 1965): the split still groups with it
      main.group ??= g; if (main.left.length === 1) main.tag = 'split';
      const row = open(r, extra, 'split', reason);
      row.group = main.group; row.inLeft = best.l.id;
    } else if (!used.has(best.l.id)) {
      const row = open(r, [best.l.id, ...extra], 'split', reason);
      row.group = g;
    } else {
      open(r, extra, extra.length ? 'joined' : 'new', { kind: 'none' });
    }
  }
  // 5. everything else is New or Ended: never matched by name, letters or rank
  for (const r of Ball) if (!rowOfRight.has(r.l.id)) open(r, [], 'new', { kind: 'none' });
  for (const x of Aall) if (!used.has(x.l.id)) { rows.push({ key: '', left: [x.l.id], right: [], tag: 'ended', reason: { kind: 'none' }, notes: [], leftSet: new Set([x.l.id]) }); used.add(x.l.id); }

  // partner annotations: parties that moved between rows are noted on both rows, never chained into one group
  const rowsOfLeft = new Map<string, Row>(); for (const row of rows) for (const id of row.left) rowsOfLeft.set(id, row);
  const groupLeft = (row: Row) => row.group ? new Set(rows.filter((x) => x.group === row.group).flatMap((x) => [...x.left, ...(x.inLeft ? [x.inLeft] : [])])) : row.leftSet;
  const groupRight = (row: Row) => new Set(row.group ? rows.filter((x) => x.group === row.group).flatMap((x) => x.right) : row.right);
  for (const row of rows) {
    const lefts = groupLeft(row), rights = groupRight(row);
    for (const id of row.right) {
      const r = Ball.find((x) => x.l.id === id)!;
      if (r.l.withdrawn) continue;
      const from = r.ps.filter((p) => A.some((x) => !lefts.has(x.l.id) && x.ps.some((q) => cont(q).has(p))));
      if (from.length && row.tag !== 'new') row.notes.push({ side: 'right', kind: 'with', partyIds: from });
    }
    for (const id of row.left) {
      const l = Aall.find((x) => x.l.id === id)!;
      if (l.l.withdrawn) continue;
      for (const r of B) {
        if (rights.has(r.l.id)) continue;
        const moved = l.ps.filter((p) => p !== l.lead && !!into(p, r.ps));
        if (moved.length) row.notes.push({ side: 'left', kind: 'moved', partyIds: moved, listId: r.l.id });
      }
    }
    // a partner of the left list moved to another list: the row keeps its word with the "moved on" note. Split is kept
    // for the leading party's list spread over several lists (docs/features/party-history.md §1.4)
  }
  return rows.map(({ leftSet: _, ...row }) => ({ ...row, key: rowKey(row.left.length ? row.left : row.inLeft ? [`in:${row.inLeft}`] : [], row.right) }));
}

/** Rows are matched from the earlier side to the later one; when the later one is drawn on the left they are mirrored.
 *  Tags keep their historical meaning (a merger stays Merged whichever side it is drawn on). */
export function mirrorRows(rows: MatchRow[]): MatchRow[] {
  return rows.map(({ inLeft, inRight, ...r }) => ({ ...r, left: r.right, right: r.left, ...(inRight ? { inLeft: inRight } : {}), ...(inLeft ? { inRight: inLeft } : {}),
    notes: r.notes.map((n) => ({ ...n, side: n.side === 'left' ? 'right' as const : 'left' as const })) }));
}
/** A split successor's source list on this side ("in Religious Zionism"), if any. */
export const inOf = (row: MatchRow, side: 'left' | 'right') => side === 'left' ? row.inLeft : row.inRight;
/** All lists of a row's group on one side, the source counted once. */
export const groupIds = (g: MatchRow[], side: 'left' | 'right') => [...new Set(g.flatMap((x) => [...x[side], ...(inOf(x, side) ? [inOf(x, side)!] : [])]))];

/** What one copy of a row moves: the source lists and the destination lists (null: this row cannot be copied alone). */
export function copyUnit(row: MatchRow, rows: MatchRow[], direction: 'toRight' | 'toLeft'): { src: string[]; dst: string[] } | null {
  if (row.tag === 'check' || row.tag === 'new' || row.tag === 'ended') return null;
  if (row.group) {
    const g = rows.filter((x) => x.group === row.group);
    const left = groupIds(g, 'left'), right = groupIds(g, 'right');
    return direction === 'toRight' ? { src: left, dst: right } : { src: right, dst: left };
  }
  if (!row.left.length || !row.right.length) return null;
  return direction === 'toRight' ? { src: row.left, dst: row.right } : { src: row.right, dst: row.left };
}

/** A person's Knesset member record, when it is confirmed (a `probable` link is not proof of identity, unless the build
 *  marks the member record itself as official: `memberConfirmed`). Never a name. */
export const memberKey = (c: Pick<SimCandidate, 'bio'>) => c.bio?.knesset && (!c.bio.probable || c.bio.memberConfirmed) ? c.bio.knesset : undefined;
/** One person: across elections by confirmed Knesset member record, otherwise by candidate id (same election). */
export const personKey = (c: Pick<SimCandidate, 'bio' | 'id'>) => { const k = memberKey(c); return k ? `k:${k}` : `id:${c.id}`; };

/** Candidates two lists share, by confirmed Knesset member record (never by name): ranks "Map to…" suggestions. */
export function sharedCandidates(x: Pick<SimList, 'candidates'>, y: Pick<SimList, 'candidates'>): number {
  const ids = (l: Pick<SimList, 'candidates'>) => new Set(l.candidates.map(memberKey).filter((u): u is string => !!u));
  const a = ids(x), b = ids(y);
  let n = 0; for (const u of a) if (b.has(u)) n++;
  return n;
}
