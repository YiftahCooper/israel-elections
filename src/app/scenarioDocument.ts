import { inputDiffs } from '../model/editScopes.ts';
import type { Scenario } from '../model/scenario.ts';

/** Compare effective facts and author metadata, ignoring view choices, replay times and ids. */
export function scenarioDirty(s: Scenario, reference: Scenario): boolean {
  // Compare values rather than saveLog history: restoring an authored value is clean again.
  return inputDiffs(s, reference).length > 0 || s.electionId !== reference.electionId ||
    s.name !== reference.name || (s.description ?? '') !== (reference.description ?? '') ||
    s.identityColor !== reference.identityColor;
}

export function nextCopyName(name: string, names: readonly string[]): string {
  const base = name.replace(/ \(\d+\)$/, '');
  let n = 1;
  while (names.includes(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}
