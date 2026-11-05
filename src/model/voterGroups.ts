import { isEnvelopeRow, type ElectionId, type LocalityDataset, type LocalityRow } from '../data/schema.ts';
import { apportion } from './actions.ts';
import type { Action, Scenario } from './scenario.ts';

/** A reusable, shareable definition of a hypothetical voter group and a turnout change.
 * Self-describing (kind + schemaVersion) so a file, browser storage or a future shared
 * gallery can hold it. It never carries vote counts of its own except what the user typed:
 * sourced and vote-share groups are measured from official locality results when applied. */
export const VOTER_GROUP_KIND = 'israel-elections/voter-group';
export type VoterGroupMembers =
  /** a published geographic classification shipped with the locality data (CBS etc.), resolved per election */
  | { type: 'sourced'; groupId: string }
  /** localities where the given historical lists together received at least minPct% of valid votes */
  | { type: 'voteShare'; electionId: ElectionId; listIds: string[]; minPct: number }
  /** numbers the user supplied */
  | { type: 'manual'; electorate: number; turnoutPct: number; invalidPct: number };
/** shares are keyed by the scenario list ids of the election they were written for */
export type VoterGroupVote = { type: 'observed' } | { type: 'shares'; electionId: ElectionId; shares: Record<string, number> };
export interface VoterGroupPreset {
  kind: typeof VOTER_GROUP_KIND; schemaVersion: 1;
  id: string; name: string; description?: string; createdAt: string;
  members: VoterGroupMembers;
  /** percentage points added to the group's current turnout; negative lowers it */
  turnoutChange: number;
  vote: VoterGroupVote;
}

/** Measured or supplied facts about a group, with its own vote mix mapped onto the scenario's lists. */
export interface GroupFacts { electorate: number; cast: number; invalid: number; localities?: number; mix?: number[] }
export type GroupProblem = 'needs-localities' | 'no-registered' | 'unknown-group' | 'other-election' | 'empty';

/** Maps historical-list vote columns onto the scenario's (possibly merged or split) lists. */
export function mapToScenario(s: Scenario, listIds: string[], votes: number[]): number[] {
  return s.lists.map((l) => l.originIds.reduce((t, o) => {
    const k = listIds.indexOf(o); if (k < 0) return t;
    const sharers = s.lists.filter((x) => x.originIds.includes(o));
    const tot = sharers.reduce((u, x) => u + x.votes, 0);
    return t + (sharers.length === 1 || tot === 0 ? votes[k] : (votes[k] * l.votes) / tot);
  }, 0));
}

function measure(s: Scenario, data: LocalityDataset, rows: LocalityRow[]): GroupFacts | GroupProblem {
  if (!rows.length) return 'empty';
  if (rows.some((r) => r.registered === null)) return 'no-registered';
  const sum = data.listIds.map((_, k) => rows.reduce((t, r) => t + r.votes[k], 0));
  return { electorate: rows.reduce((t, r) => t + r.registered!, 0), cast: rows.reduce((t, r) => t + r.votesCast, 0), invalid: rows.reduce((t, r) => t + r.invalid, 0), localities: rows.length, mix: mapToScenario(s, data.listIds, sum) };
}

/** Localities (never double-envelope rows) where the given historical lists together got ≥ minPct% of valid votes. */
export function voteShareRows(data: LocalityDataset, listIds: string[], minPct: number): LocalityRow[] {
  const cols = listIds.map((id) => data.listIds.indexOf(id)).filter((k) => k >= 0);
  if (!cols.length || !Number.isFinite(minPct)) return [];
  return data.rows.filter((r) => !isEnvelopeRow(r) && r.valid > 0 && cols.reduce((t, k) => t + r.votes[k], 0) * 100 >= minPct * r.valid);
}

export function resolveGroup(s: Scenario, data: LocalityDataset | null, m: VoterGroupMembers): GroupFacts | GroupProblem {
  if (m.type === 'manual') {
    const cast = Math.round((m.electorate * m.turnoutPct) / 100);
    return { electorate: m.electorate, cast, invalid: Math.round((cast * m.invalidPct) / 100) };
  }
  if (!data) return 'needs-localities';
  if (m.type === 'sourced') {
    const g = data.groups?.find((x) => x.id === m.groupId);
    if (!g) return 'unknown-group';
    const codes = new Set(g.codes);
    return measure(s, data, data.rows.filter((r) => r.code !== null && codes.has(r.code) && !isEnvelopeRow(r)));
  }
  if (m.electionId !== s.electionId) return 'other-election';
  return measure(s, data, voteShareRows(data, m.listIds, m.minPct));
}

export interface GroupChange { delta: number; invalid: number; allocations: { listId: string; votes: number }[]; error?: 'range' | 'no-split' | 'too-few' }
/** Signed change in ballots when the group's turnout moves by `points`; split by `weights` (one per list). */
export function groupChange(s: Scenario, f: GroupFacts, points: number, weights: number[]): GroupChange {
  const target = Math.round(f.cast + (f.electorate * points) / 100);
  const none = { delta: 0, invalid: 0, allocations: [] };
  if (!Number.isFinite(target) || target < 0 || target > f.electorate) return { ...none, error: 'range' };
  const delta = target - f.cast, size = Math.abs(delta), sign = Math.sign(delta);
  if (!size) return none;
  const w = weights.map((x, i) => (s.lists[i]?.withdrawn ? 0 : Math.max(0, Number.isFinite(x) ? x : 0)));
  if (!w.some((x) => x > 0)) return { ...none, delta, error: 'no-split' };
  const invalid = f.cast ? Math.round((size * f.invalid) / f.cast) : 0;
  const votes = apportion(size - invalid, w);
  const allocations = s.lists.map((l, i) => ({ listId: l.id, votes: sign * votes[i] })).filter((a) => a.votes !== 0);
  const short = sign < 0 && (allocations.some((a) => s.lists.find((l) => l.id === a.listId)!.votes + a.votes < 0) || s.invalid < invalid);
  return { delta, invalid: sign * invalid, allocations, ...(short ? { error: 'too-few' as const } : {}) };
}

/** The replayable action; a decrease uses the signed (demographic) form of addVoters. */
export function groupAction(c: GroupChange, label: string): Action {
  return c.delta < 0
    ? { type: 'addVoters', demographic: true, allocations: c.allocations, invalid: c.invalid, label }
    : { type: 'addVoters', allocations: c.allocations, invalid: c.invalid, label };
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const num = (x: unknown) => typeof x === 'number' && Number.isFinite(x);
/** Problems with an untrusted preset (empty when valid). */
export function validateVoterGroup(x: unknown): string[] {
  if (!isObj(x)) return ['not an object'];
  const p: string[] = [];
  if (x.kind !== VOTER_GROUP_KIND) p.push('not a voter group file');
  if (x.schemaVersion !== 1) p.push('unsupported version');
  if (typeof x.id !== 'string' || !x.id) p.push('id');
  if (typeof x.name !== 'string' || !x.name.trim() || x.name.length > 120) p.push('name');
  if (x.description !== undefined && (typeof x.description !== 'string' || x.description.length > 2000)) p.push('description');
  if (typeof x.createdAt !== 'string') p.push('createdAt');
  if (!num(x.turnoutChange) || Math.abs(x.turnoutChange as number) > 100) p.push('turnoutChange');
  const m = x.members;
  if (!isObj(m)) p.push('members');
  else if (m.type === 'sourced') { if (typeof m.groupId !== 'string' || !m.groupId) p.push('members.groupId'); }
  else if (m.type === 'voteShare') {
    if (typeof m.electionId !== 'string' || !/^k\d+$/.test(m.electionId)) p.push('members.electionId');
    if (!Array.isArray(m.listIds) || !m.listIds.length || !m.listIds.every((id) => typeof id === 'string')) p.push('members.listIds');
    if (!num(m.minPct) || (m.minPct as number) < 0 || (m.minPct as number) > 100) p.push('members.minPct');
  } else if (m.type === 'manual') {
    if (!Number.isSafeInteger(m.electorate) || (m.electorate as number) <= 0) p.push('members.electorate');
    if (!num(m.turnoutPct) || (m.turnoutPct as number) < 0 || (m.turnoutPct as number) > 100) p.push('members.turnoutPct');
    if (!num(m.invalidPct) || (m.invalidPct as number) < 0 || (m.invalidPct as number) >= 100) p.push('members.invalidPct');
  } else p.push('members.type');
  const v = x.vote;
  if (!isObj(v) || (v.type !== 'observed' && v.type !== 'shares')) p.push('vote');
  else if (v.type === 'shares' && (typeof v.electionId !== 'string' || !/^k\d+$/.test(v.electionId) || !isObj(v.shares) || !Object.values(v.shares).every((n) => num(n) && (n as number) >= 0))) p.push('vote.shares');
  if (isObj(m) && m.type === 'manual' && isObj(v) && v.type === 'observed') p.push('vote: typed numbers have no observed mix');
  return p;
}

/** Accepts one preset, an array, or { groups: [...] }; throws with the problems otherwise. */
export function parseVoterGroups(text: string): VoterGroupPreset[] {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('The file is not valid JSON.'); }
  const items = Array.isArray(parsed) ? parsed : isObj(parsed) && Array.isArray(parsed.groups) ? parsed.groups : [parsed];
  if (!items.length) throw new Error('The file has no voter groups.');
  items.forEach((x, i) => { const p = validateVoterGroup(x); if (p.length) throw new Error(`Voter group ${i + 1} is invalid: ${p.slice(0, 4).join(', ')}.`); });
  return items as VoterGroupPreset[];
}
