// Pairs the lists of two sides of a comparison (design: docs/design/compare-workbench.md §5).
// Across elections, lists are paired only from sourced party records (data/meta/parties.json appearances and the
// documented lineage edges), never by name, ballot letters or vote rank. Within one election, lists are paired by
// their origin (originIds), as the scenario's merges, splits and added lists record it.
import lineage from '../../../data/meta/party-lineage.json';
import { appearances, canonicalParty } from '../../families/registry.ts';
import type { Scenario, SimList } from '../../model/scenario.ts';

export type MatchTag = 'same' | 'renamed' | 'joined' | 'merged' | 'split' | 'new' | 'ended' | 'check' | 'yours';
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
  /** a split successor: its left list is shown on the group's main row ("in Religious Zionism") */
  inLeft?: string;
  /** left lists whose relation to the right list is announced but unconfirmed (lineage pending) */
  check?: string[];
  reason: MatchReason;
  notes: MatchNote[];
}
/** A user decision about a pairing; analysis only (kept with the comparison, never in either scenario). */
export interface MatchOverride { left: string; right: string | null; status: 'accepted' | 'rejected' | 'user' }

type Edge = { id: string; from: string[]; to: string[]; relation: string };
const documented: Edge[] = (lineage.edges as { id: string; from?: string[]; to?: string[]; relation?: string; evidence?: { status?: string } }[])
  .filter((e) => e.from && e.to && ['merged-into', 'split-from', 'renamed-to'].includes(e.relation ?? '') && e.evidence?.status !== 'unresolved')
  .map((e) => ({ id: e.id, from: e.from!.map(canonicalParty), to: e.to!.map(canonicalParty), relation: e.relation! }));
const pending: Edge[] = (lineage.pending as { id: string; from?: string[]; to?: string[]; relation?: string }[])
  .filter((e) => e.from && e.to).map((e) => ({ id: e.id, from: e.from!.map(canonicalParty), to: e.to!.map(canonicalParty), relation: e.relation ?? 'merged-into' }));

/** Registered parties of a list (alliance vehicles excluded); a scenario-made list takes its origin lists' parties. */
export function partiesOf(electionId: string, l: Pick<SimList, 'id' | 'originIds' | 'parties' | 'candidates'>): string[] {
  const of = (id: string) => appearances.filter((a) => a.electionId === electionId && a.listId === id && a.role !== 'alliance').map((a) => a.partyId);
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

/** Pairs the lists of `a` (left) and `b` (right). Every list appears in exactly one row; each left list leads at most one. */
export function matchRows(a: Scenario, b: Scenario, overrides: MatchOverride[] = []): MatchRow[] {
  if (a.electionId === b.electionId) return sameElection(a, b);
  const A = a.lists.map((l) => ({ l, ps: partiesOf(a.electionId, l), lead: leadOf(a.electionId, l) }));
  const B = b.lists.map((l) => ({ l, ps: partiesOf(b.electionId, l), lead: leadOf(b.electionId, l) }));
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
  const renamed = (from: string | null, to: string | null) => from && to ? documented.find((e) => e.relation === 'renamed-to' && e.from.includes(from) && e.to.includes(to)) : undefined;
  const lineageTo = (from: string | null, r: (typeof B)[number], relation: string) => from ? documented.find((e) => e.relation === relation && e.from.includes(from) && e.to.some((p) => r.ps.includes(p))) : undefined;

  // 0. the user's own mappings come first
  for (const o of overrides.filter((o) => o.status === 'user' && o.right)) {
    const r = B.find((x) => x.l.id === o.right), l = A.find((x) => x.l.id === o.left);
    if (!r || !l || used.has(l.l.id)) continue;
    const row = rowOfRight.get(r.l.id);
    if (row) { row.left.push(l.l.id); row.leftSet.add(l.l.id); used.add(l.l.id); row.tag = 'yours'; }
    else open(r, [l.l.id], 'yours', { kind: 'user' });
  }
  // 1. the same leading party (or one alliance led by another of its parties), or a documented rename
  for (const r of B) {
    if (rowOfRight.has(r.l.id)) continue;
    const l = A.find((x) => !used.has(x.l.id) && !rejected(x.l.id, r.l.id) && x.lead && (x.lead === r.lead || r.ps.includes(x.lead) && !!r.lead && x.ps.includes(r.lead)));
    if (l) { open(r, [l.l.id], 'same', { kind: 'leading-party', partyId: l.lead! }); continue; }
    const n = A.find((x) => !used.has(x.l.id) && !rejected(x.l.id, r.l.id) && renamed(x.lead, r.lead));
    if (n) open(r, [n.l.id], 'renamed', { kind: 'lineage', edgeId: renamed(n.lead, r.lead)!.id, relation: 'renamed-to' });
  }
  // 2. a left list whose leading party now runs inside a right list led by another party: joined, or merged with others
  for (const r of B) {
    const joiners = A.filter((x) => !used.has(x.l.id) && !rejected(x.l.id, r.l.id) && x.lead && (r.ps.includes(x.lead) || lineageTo(x.lead, r, 'merged-into')));
    if (!joiners.length) continue;
    const row = rowOfRight.get(r.l.id);
    const ids = joiners.map((x) => x.l.id);
    if (row) { row.left.push(...ids); ids.forEach((x) => { row.leftSet.add(x); used.add(x); }); if (row.tag !== 'yours') row.tag = 'merged'; }
    else {
      const edge = lineageTo(joiners[0].lead, r, 'merged-into');
      open(r, ids, ids.length > 1 ? 'merged' : 'joined', edge ? { kind: 'lineage', edgeId: edge.id, relation: edge.relation } : { kind: 'constituent', partyIds: [joiners[0].lead!] });
    }
  }
  // 3. announced but unconfirmed relations (lineage pending): shown as Check until the user accepts or rejects them
  for (const e of pending) for (const r of B) {
    if (!e.to.some((p) => r.ps.includes(p))) continue;
    for (const x of A) {
      if (used.has(x.l.id) || !x.lead || !e.from.includes(x.lead) || rejected(x.l.id, r.l.id)) continue;
      const ok = accepted(x.l.id, r.l.id);
      const row = rowOfRight.get(r.l.id) ?? open(r, [], ok ? 'merged' : 'check', { kind: 'pending', edgeId: e.id });
      row.left.push(x.l.id); row.leftSet.add(x.l.id); used.add(x.l.id);
      if (ok) row.tag = row.left.length > 1 ? 'merged' : 'yours';
      else { row.check = [...row.check ?? [], x.l.id]; row.tag = 'check'; }
    }
  }
  // 4. a right list led by a party that ran inside a left list: a split from it (grouped with that list's row)
  for (const r of B) {
    if (rowOfRight.has(r.l.id)) continue;
    let best: (typeof A)[number] | undefined, bestShared = 0, edge: Edge | undefined;
    for (const x of A) {
      if (rejected(x.l.id, r.l.id)) continue;
      const shared = r.ps.filter((p) => x.ps.includes(p)).length + (r.lead && x.ps.includes(r.lead) ? 10 : 0);
      const e = x.lead ? lineageTo(x.lead, r, 'split-from') : undefined;
      if (shared + (e ? 20 : 0) > bestShared) { best = x; bestShared = shared + (e ? 20 : 0); edge = e; }
    }
    if (!best) continue;
    const g = `split:${best.l.id}`;
    const main = rows.find((x) => x.left.length === 1 && x.left[0] === best!.l.id);
    if (main) {
      main.group = g; main.tag = 'split';
      const row = open(r, [], 'split', edge ? { kind: 'lineage', edgeId: edge.id, relation: 'split-from' } : { kind: 'constituent', partyIds: r.ps.filter((p) => best!.ps.includes(p)) });
      row.group = g; row.inLeft = best.l.id;
    } else if (!used.has(best.l.id)) {
      const row = open(r, [best.l.id], 'split', edge ? { kind: 'lineage', edgeId: edge.id, relation: 'split-from' } : { kind: 'constituent', partyIds: r.ps.filter((p) => best!.ps.includes(p)) });
      row.group = g;
    } else {
      // its left list is already part of a merged row: a split from one of several, so only noted
      open(r, [], 'new', { kind: 'none' });
    }
  }
  // 5. everything else is New or Ended: never matched by name, letters or rank
  for (const r of B) if (!rowOfRight.has(r.l.id)) open(r, [], 'new', { kind: 'none' });
  for (const x of A) if (!used.has(x.l.id)) { rows.push({ key: '', left: [x.l.id], right: [], tag: 'ended', reason: { kind: 'none' }, notes: [], leftSet: new Set([x.l.id]) }); used.add(x.l.id); }

  // partner annotations: parties that moved between rows are noted on both rows, never chained into one group
  const rowsOfLeft = new Map<string, Row>(); for (const row of rows) for (const id of row.left) rowsOfLeft.set(id, row);
  const groupLeft = (row: Row) => row.group ? new Set(rows.filter((x) => x.group === row.group).flatMap((x) => [...x.left, ...(x.inLeft ? [x.inLeft] : [])])) : row.leftSet;
  const groupRight = (row: Row) => new Set(row.group ? rows.filter((x) => x.group === row.group).flatMap((x) => x.right) : row.right);
  for (const row of rows) {
    const lefts = groupLeft(row), rights = groupRight(row);
    for (const id of row.right) {
      const r = B.find((x) => x.l.id === id)!;
      const from = r.ps.filter((p) => A.some((x) => !lefts.has(x.l.id) && x.ps.includes(p)));
      if (from.length && row.tag !== 'new') row.notes.push({ side: 'right', kind: 'with', partyIds: from });
    }
    for (const id of row.left) {
      const l = A.find((x) => x.l.id === id)!;
      for (const r of B) {
        if (rights.has(r.l.id)) continue;
        const moved = l.ps.filter((p) => p !== l.lead && r.ps.includes(p));
        if (moved.length) row.notes.push({ side: 'left', kind: 'moved', partyIds: moved, listId: r.l.id });
      }
    }
    // a party of the left list moved to an unrelated list: the left list was split, though the rows stay apart
    if (row.tag === 'same' && row.notes.some((n) => n.kind === 'moved')) row.tag = 'split';
  }
  return rows.map(({ leftSet: _, ...row }) => ({ ...row, key: rowKey(row.left.length ? row.left : row.inLeft ? [`in:${row.inLeft}`] : [], row.right) }));
}

/** What one copy of a row moves: the source lists and the destination lists (null: this row cannot be copied alone). */
export function copyUnit(row: MatchRow, rows: MatchRow[], direction: 'toRight' | 'toLeft'): { src: string[]; dst: string[] } | null {
  if (row.tag === 'check' || row.tag === 'new' || row.tag === 'ended') return null;
  if (row.group) {
    const g = rows.filter((x) => x.group === row.group);
    const left = [...new Set(g.flatMap((x) => [...x.left, ...(x.inLeft ? [x.inLeft] : [])]))], right = g.flatMap((x) => x.right);
    return direction === 'toRight' ? { src: left, dst: right } : { src: right, dst: left };
  }
  if (!row.left.length || !row.right.length) return null;
  return direction === 'toRight' ? { src: row.left, dst: row.right } : { src: row.right, dst: row.left };
}

/** Candidates two lists share, by Knesset member id (never by name alone): ranks "Map to…" suggestions. */
export function sharedCandidates(x: Pick<SimList, 'candidates'>, y: Pick<SimList, 'candidates'>): number {
  const ids = (l: Pick<SimList, 'candidates'>) => new Set(l.candidates.map((c) => c.bio?.knesset).filter((u): u is string => !!u));
  const a = ids(x), b = ids(y);
  let n = 0; for (const u of a) if (b.has(u)) n++;
  return n;
}
