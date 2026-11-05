import { applyAction } from './actions.ts';
import { partSnapshot, type Part } from './parts.ts';
import type { Action, Scenario } from './scenario.ts';

export type StartAction = Extract<Action, { type: 'startPart' }>;

/** The part's current inputs, limited to one list for list-scoped parts. */
export function partKey(s: Scenario, part: Part, listId?: string): string {
  const snap = partSnapshot(s, part);
  return JSON.stringify(listId && snap.lists ? { ...snap, lists: snap.lists.filter(l => l.id === listId) } : snap);
}

/** What a starting point would do here: 'same' (nothing changes), 'change', or the reason it cannot apply. */
export function startEffect(s: Scenario, action: StartAction, base: Scenario | undefined): 'same' | 'change' | { error: string } {
  try {
    const next = applyAction(s, action, undefined, base ? { base } : {});
    return partKey(next, action.part, action.listId) === partKey(s, action.part, action.listId) ? 'same' : 'change';
  } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
}
