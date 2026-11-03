// One rule for every vote edit on a list: where the difference comes from or goes to.
// Shared by the number field, slider, percentage fields, quick buttons and boundary tools so that
// the same counterfactual is always applied (and matches analysis.perturb exactly).
import type { VoteSource } from '../engine/analysis.ts';
import type { Action, Scenario, SimList } from '../model/scenario.ts';

export type SourceChoice = { kind: 'new' } | { kind: 'transfer'; listId: string } | { kind: 'proportional' };

export const toVoteSource = (c: SourceChoice): VoteSource => (c.kind === 'proportional' ? { kind: 'proportional', listIds: [] } : c);

/** The action that changes `l` by `delta` votes, taking/returning them per `src`. */
export function deltaAction(s: Scenario, l: SimList, delta: number, src: SourceChoice): Action | null {
  if (!Number.isFinite(delta) || delta === 0) return null;
  delta = Math.round(delta);
  if (src.kind === 'new') return { type: 'setVotes', listId: l.id, votes: Math.max(0, l.votes + delta) };
  if (src.kind === 'transfer') {
    const other = s.lists.find((x) => x.id === src.listId);
    if (!other || other.id === l.id) return null;
    return delta > 0 ? { type: 'transfer', from: other.id, to: l.id, votes: delta } : { type: 'transfer', from: l.id, to: other.id, votes: -delta };
  }
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && x.votes > 0);
  if (!others.length) return { type: 'setVotes', listId: l.id, votes: Math.max(0, l.votes + delta) };
  return delta > 0
    ? { type: 'redistribute', from: others.map((x) => x.id), to: [{ listId: l.id, share: 1 }], votes: delta }
    : { type: 'redistribute', from: [l.id], to: others.map((x) => ({ listId: x.id, share: x.votes })), votes: -delta };
}

/** Largest change the source can supply (for gains); losses are limited by the list's own votes. */
export function maxGain(s: Scenario, l: SimList, src: SourceChoice): number {
  if (src.kind === 'new') return Number.MAX_SAFE_INTEGER;
  if (src.kind === 'transfer') return s.lists.find((x) => x.id === src.listId)?.votes ?? 0;
  return s.lists.filter((x) => x.id !== l.id && !x.withdrawn).reduce((t, x) => t + x.votes, 0);
}

/** Votes the list needs to hold `pct` % of all valid votes under the given source.
 *  new voters:   v' / (V − v + v') = p  ⇒  v' = p(V − v) / (1 − p)
 *  fixed total:  v' = p · V */
export function votesForShare(s: Scenario, l: SimList, pct: number, src: SourceChoice): number | null {
  if (!(pct >= 0 && pct < 100)) return null;
  const V = s.lists.reduce((t, x) => t + x.votes, 0);
  const p = pct / 100;
  if (src.kind === 'new') return Math.round((p * (V - l.votes)) / (1 - p));
  return Math.round(p * V);
}

/** Clamps a requested target to what the source can supply, so an edit never fails silently. */
export function clampTarget(s: Scenario, l: SimList, target: number, src: SourceChoice): number {
  const t = Math.max(0, Math.round(target));
  if (t > l.votes) return Math.min(t, l.votes + maxGain(s, l, src));
  return t;
}
