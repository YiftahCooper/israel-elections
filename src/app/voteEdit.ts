import {englishLabel} from '../data/names.ts';
// One rule for every vote edit on a list: where the difference comes from or goes to.
// Shared by the number field, slider, percentage fields, quick buttons and boundary tools so that
// the same counterfactual is always applied (and matches analysis.perturb exactly).
import type { VoteSource } from '../engine/analysis.ts';
import { votesCast, type Action, type Scenario, type SimList } from '../model/scenario.ts';

export type SourceChoice = { kind: 'new' } | { kind: 'transfer'; listId: string } | { kind: 'proportional' };

/** Registered voters who did not vote: the most that "new voters" can add before turnout would pass 100%. */
export const stayingHome = (s: Scenario): number => Math.max(0, s.registered - votesCast(s));

/** The engine's form of a source. New voters need the scenario: they are capped at the voters staying home. */
export function toVoteSource(c: Exclude<SourceChoice, { kind: 'new' }>): VoteSource;
export function toVoteSource(c: SourceChoice, s: Scenario): VoteSource;
export function toVoteSource(c: SourceChoice, s?: Scenario): VoteSource {
  if (c.kind === 'proportional') return { kind: 'proportional', listIds: [] };
  return c.kind === 'new' ? { kind: 'new', max: BigInt(stayingHome(s!)) } : c;
}

/** The action that changes `l` by `delta` votes, taking/returning them per `src`. */
export function deltaAction(s: Scenario, l: SimList, delta: number, src: SourceChoice, fallbackShares?: Record<string, number>): Action | null {
  if (!Number.isFinite(delta) || delta === 0) return null;
  delta = Math.round(delta);
  if (src.kind === 'new') return { type: 'setVotes', listId: l.id, votes: Math.max(0, l.votes + delta) };
  if (src.kind === 'transfer') {
    const other = s.lists.find((x) => x.id === src.listId);
    if (!other || other.id === l.id) return null;
    return delta > 0 ? { type: 'transfer', from: other.id, to: l.id, votes: delta } : { type: 'transfer', from: l.id, to: other.id, votes: -delta };
  }
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && x.votes > 0);
  if (delta > 0) {
    if (!others.length) return { type: 'setVotes', listId: l.id, votes: l.votes + delta };
    return { type: 'redistribute', from: others.map((x) => x.id), to: [{ listId: l.id, share: 1 }], votes: delta };
  }
  // giving votes back: in proportion to the other lists' votes, or — if they all have none — to the
  // supplied fallback shares (e.g. their historical votes), so the national total stays fixed
  let to = others.map((x) => ({ listId: x.id, share: x.votes }));
  if (!to.length && fallbackShares) to = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && (fallbackShares[x.id] ?? 0) > 0).map((x) => ({ listId: x.id, share: fallbackShares[x.id] }));
  if (!to.length) return { type: 'setVotes', listId: l.id, votes: Math.max(0, l.votes + delta) };
  return { type: 'redistribute', from: [l.id], to, votes: -delta };
}

/** Largest change the source can supply (for gains); losses are limited by the list's own votes.
 *  New voters come from those staying home, so turnout never passes 100%. */
export function maxGain(s: Scenario, l: SimList, src: SourceChoice): number {
  if (src.kind === 'new') return stayingHome(s);
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
  // rounded up, so the list reaches at least the requested share (e.g. 3.25% means passing the threshold)
  if (src.kind === 'new') return Math.ceil((p * (V - l.votes)) / (1 - p) - 1e-9);
  return Math.ceil(p * V - 1e-9);
}

/** Clamps a requested target to what the source can supply, so an edit never fails silently. */
export function clampTarget(s: Scenario, l: SimList, target: number, src: SourceChoice): number {
  const t = Math.max(0, Math.round(target));
  if (t > l.votes) return Math.min(t, l.votes + maxGain(s, l, src));
  return t;
}

export function voteSourceLabel(src: SourceChoice, s: Scenario, lang: 'he' | 'en'): string {
  if (src.kind === 'new') return lang === 'he' ? 'מצביעים חדשים / נמנעים' : 'new voters / voters staying home';
  if (src.kind === 'proportional') return lang === 'he' ? 'שאר הרשימות באופן יחסי' : 'other lists proportionally';
  const l = s.lists.find(l => l.id === src.listId);
  return l ? (lang === 'he' ? l.shortHe : englishLabel(l.shortEn,l.shortHe)) : lang === 'he' ? 'רשימה אחרת' : 'another list';
}
