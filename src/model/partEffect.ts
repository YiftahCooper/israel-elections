import { applyAction } from './actions.ts';
import { partSnapshot, type Part } from './parts.ts';
import type { Action, Scenario } from './scenario.ts';

export type StartAction = Extract<Action, { type: 'startPart' }>;

/** The part's current inputs, limited to one list for list-scoped parts. */
export function partKey(s: Scenario, part: Part, listId?: string): string {
  const snap = partSnapshot(s, part);
  const scoped = listId && snap.lists ? { ...snap, lists: snap.lists.filter(l => l.id === listId) } : snap;
  // Missing held ballots mean zero. Restoring withdrawn zero-vote lists may materialise that
  // default, and object property insertion order is never an input change.
  if (scoped.lists) scoped.lists = scoped.lists.map(l => ({ ...l, heldVotes: l.heldVotes ?? 0 }));
  return JSON.stringify(scoped, (_key, value) => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]])) : value);
}

/** What a starting point would do here: 'same' (nothing changes), 'change', or the reason it cannot apply. */
export function startEffect(s: Scenario, action: StartAction, base: Scenario | undefined): 'same' | 'change' | { error: string } {
  try {
    const next = applyAction(s, action, undefined, base ? { base } : {});
    return partKey(next, action.part, action.listId) === partKey(s, action.part, action.listId) ? 'same' : 'change';
  } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
}
