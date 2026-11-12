// Recorded organisational relations between parties (docs/features/party-history.md §1), read from
// data/meta/party-lineage.json. Each relation carries the certainty its cited sources allow under the source policy
// (src/data/evidence.ts); a pending item is "To verify" (unknown) and is shown, never used to compare or to join a
// party's history. Ideology, founders, names and ballot letters never make a relation (§1.3).
import lineage from '../../data/meta/party-lineage.json';
import { canonicalParty } from './runtime.ts';
import { certaintyAllowed, certaintyCeiling, certaintyRank, type Certainty } from '../data/evidence.ts';
import { evidenceOf, type RawSource } from './evidence-of.ts';
export { evidenceOf };

export type RelationKind =
  | 'renamed-to' | 'merged-into' | 'absorbed-into' | 'split-from' | 'faction-split'
  | 'same-organisation' | 'not-same-organisation' | 'electoral-partner' | 'leader-moved-to';
/** A merger's progress: announced, approved by the parties' bodies, registered with the Registrar of Parties. */
export type MergerStage = 'announced' | 'approved' | 'registered';
export const RELATION_KINDS: readonly RelationKind[] = ['renamed-to', 'merged-into', 'absorbed-into', 'split-from', 'faction-split', 'same-organisation', 'not-same-organisation', 'electoral-partner', 'leader-moved-to'];

export interface RelationSource { id: string; publisher?: string; url?: string; locator?: string; support?: string }
export interface Relation {
  id: string;
  kind: RelationKind;
  from: string[];
  to: string[];
  /** ISO day or year; for an interval, the start ("1988–92" when only the interval is known) */
  date: string;
  dateTo?: string;
  stage?: MergerStage;
  /** for a merger: the predecessor whose history continues as the successor's (recorded, or the leading party of the
   *  last joint list the merging parties ran on together) */
  continues?: string;
  certainty: Certainty;
  /** a pending item: shown as "To verify" and never used */
  pending: boolean;
  sources: RelationSource[];
  /** the record's own interpretation, kept for the evidence (i) */
  note?: string;
}

type RawEdge = {
  id: string; from?: string[]; to?: string[]; relation?: string; date?: string; dateTo?: string; stage?: string; continues?: string;
  certainty?: string; sources?: string[]; evidence?: { status?: string; interpretation?: string };
};

const CERTAINTIES: readonly Certainty[] = ['confirmed', 'probable', 'provisional', 'disputed', 'unknown'];
const STAGES: readonly MergerStage[] = ['announced', 'approved', 'registered'];

/** Parses one lineage file into relations. A pending item without relation fields is a party-only check (OPEN_CHECKS)
 *  or a note; any other item that cannot be read is handed to `unreadable` (the build's validator,
 *  scripts/validate-families.ts, refuses such files, so this is a second line of defence). */
export function readRelations(file: { sources: Record<string, RawSource>; edges: RawEdge[]; pending: RawEdge[] }, unreadable: (e: RawEdge) => void = () => {}): Relation[] {
  const out: Relation[] = [];
  const add = (e: RawEdge, pendingItem: boolean) => {
    const kind = (e.relation ?? (pendingItem ? 'merged-into' : '')) as RelationKind;
    const names = (x: unknown) => Array.isArray(x) && x.length > 0 && x.every((p) => typeof p === 'string');
    if (!names(e.from) || !names(e.to) || !RELATION_KINDS.includes(kind)) {
      if (!pendingItem || e.from !== undefined || e.to !== undefined || e.relation !== undefined) unreadable(e);
      return;
    }
    const cited = (e.sources ?? []).map((id) => ({ id, source: evidenceOf(file.sources[id]) }));
    const ceiling = certaintyCeiling(cited);
    const recorded = CERTAINTIES.includes(e.certainty as Certainty) ? e.certainty as Certainty : undefined;
    const pending = pendingItem || e.evidence?.status === 'unresolved';
    const certainty: Certainty = pending ? 'unknown' : recorded && certaintyAllowed(recorded, ceiling) ? recorded : ceiling;
    out.push({
      id: e.id, kind, from: e.from!.map(canonicalParty), to: e.to!.map(canonicalParty), date: e.date ?? '',
      ...(e.dateTo ? { dateTo: e.dateTo } : {}), ...(STAGES.includes(e.stage as MergerStage) ? { stage: e.stage as MergerStage } : {}),
      ...(e.continues ? { continues: canonicalParty(e.continues) } : {}),
      certainty, pending,
      sources: (e.sources ?? []).map((id) => ({ id, ...(file.sources[id] ? { publisher: file.sources[id].publisher, url: file.sources[id].url, locator: file.sources[id].locator, support: file.sources[id].support } : {}) })),
      ...(e.evidence?.interpretation ? { note: e.evidence.interpretation } : {}),
    });
  };
  for (const e of file.edges) add(e, false);
  for (const e of file.pending) add(e, true);
  return out;
}

const UNREADABLE: RawEdge[] = [];
export const RELATIONS: Relation[] = readRelations(lineage as unknown as Parameters<typeof readRelations>[0], (e) => UNREADABLE.push(e));
// An item that cannot be read never silently changes a history: in development it stops the app; otherwise it is
// reported, and the parties it names are shown as "To verify" (OPEN_CHECKS) rather than as if nothing were recorded.
if (UNREADABLE.length) {
  const msg = `data/meta/party-lineage.json: ${UNREADABLE.length} item(s) cannot be read (${UNREADABLE.map((e) => e.id).join(', ')}); run scripts/validate-families.ts`;
  if (import.meta.env?.DEV) throw new Error(msg);
  console.error(msg);
}
/** Pending checks about parties without a relation of their own (a Registrar entry not yet read), and the parties of any
 *  item that cannot be read: "To verify". */
export const OPEN_CHECKS: { id: string; partyIds: string[] }[] = [
  ...(lineage.pending as { id: string; partyIds?: string[]; from?: string[] }[]).filter((p) => p.partyIds?.length && !p.from).map((p) => ({ id: p.id, partyIds: p.partyIds!.map(canonicalParty) })),
  ...UNREADABLE.map((e) => ({ id: e.id, partyIds: [e.from, e.to].flatMap((x) => (Array.isArray(x) ? x : [])).filter((p): p is string => typeof p === 'string').map(canonicalParty) })).filter((o) => o.partyIds.length),
];

/** Parties named by an identity relation (renamed, merged, absorbed, same organisation). An alliance record among
 *  them is an organisation in its own right, not only an electoral vehicle. */
export const identityIds = (rels: Relation[]) => new Set(rels.filter((r) => ['renamed-to', 'merged-into', 'absorbed-into', 'same-organisation'].includes(r.kind)).flatMap((r) => [...r.from, ...r.to]));
export const IDENTITY_IDS = identityIds(RELATIONS);

/** Q2 (owner, 8 Nov): confirmed and probable relations are used automatically, with their chip; anything weaker is
 *  shown as "To verify" and never used. */
export const usable = (r: Pick<Relation, 'certainty' | 'pending'>) => !r.pending && certaintyRank(r.certainty) >= certaintyRank('probable');
export const weakest = (cs: Certainty[]): Certainty => cs.reduce<Certainty>((w, c) => certaintyRank(c) < certaintyRank(w) ? c : w, 'confirmed');

/** A relation dated within the interval (from, to]. A date known only to the year (or month) may fall anywhere in
 *  it, so it counts for every interval it overlaps. */
export const between = (date: string, from: string, to: string) => {
  if (!date) return false;
  const start = date.length === 4 ? `${date}-01-01` : date.length === 7 ? `${date}-01` : date;
  const end = date.length === 4 ? `${date}-12-31` : date.length === 7 ? `${date}-31` : date;
  return start <= to && end > from;
};

/** Does this relation carry a party's identity forward (the successor is the same organisation for comparison)? */
const identityStep = (r: Relation) =>
  r.kind === 'renamed-to' || r.kind === 'absorbed-into' || r.kind === 'same-organisation' ||
  r.kind === 'merged-into' && (!r.stage || r.stage === 'registered');
/** Used to decide a comparison: an identity step that is usable. An announced or approved merger is not (yet). */
export const decides = (r: Relation) => identityStep(r) && usable(r);

export interface Continuation { partyId: string; via: Relation[] }
/**
 * What a party at an earlier election (date `from`) became by a later one (`to`): itself, and the parties it was
 * renamed to, merged or absorbed into, or recorded as the same organisation as. Usable relations only, unless
 * `includeUnverified` (then the result says which relations need verifying).
 */
export function continuations(partyId: string, from: string, to: string, rels: Relation[] = RELATIONS, includeUnverified = false, present?: ReadonlySet<string>): Continuation[] {
  const seen = new Map<string, Relation[]>([[partyId, []]]);
  const queue = [partyId];
  while (queue.length) {
    const p = queue.shift()!;
    const via = seen.get(p)!;
    for (const r of rels) {
      if (includeUnverified ? !identityStep(r) && r.kind !== 'merged-into' : !decides(r)) continue;
      const nexts = r.kind === 'same-organisation'
        ? (r.from.includes(p) ? r.to : r.to.includes(p) ? r.from : [])
        // a party still on the ballot at the later election has not yet merged or been renamed (a date known only to
        // the year may fall after that election: Yisrael BaAliyah ran in January 2003 and joined Likud in March)
        : r.from.includes(p) && between(r.date, from, to) && !present?.has(p) ? r.to : [];
      for (const q of nexts) if (!seen.has(q)) { seen.set(q, [...via, r]); queue.push(q); }
    }
  }
  return [...seen].map(([id, v]) => ({ partyId: id, via: v }));
}

/** "Not the same party" facts: two ids that must never be joined, whatever else is recorded. */
export const distinct = (a: string, b: string, rels: Relation[] = RELATIONS) =>
  rels.some((r) => r.kind === 'not-same-organisation' && (r.from.includes(a) && r.to.includes(b) || r.from.includes(b) && r.to.includes(a)));

/** Relations that touch a party (events in its history), oldest first; electoral partnerships are list facts, not events. */
export const relationsOf = (ids: string[], rels: Relation[] = RELATIONS) =>
  rels.filter((r) => r.kind !== 'electoral-partner' && r.kind !== 'not-same-organisation' && r.kind !== 'leader-moved-to' && [...r.from, ...r.to].some((p) => ids.includes(p)))
    .sort((a, b) => a.date.localeCompare(b.date));
