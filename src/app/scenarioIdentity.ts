import type { Action, Scenario } from '../model/scenario.ts';
import { SCENARIO_PALETTE, SCENARIO_COLOURS } from '../model/scenarioColors.ts';
export { SCENARIO_PALETTE };
export function scenarioColor(s: Pick<Scenario, 'identityColor'>): string {
  return SCENARIO_COLOURS.includes(s.identityColor as typeof SCENARIO_COLOURS[number]) ? s.identityColor! : SCENARIO_PALETTE[0];
}

export function savedColor(log: Action[]): string {
  const a = log.findLast(a => a.type === 'setIdentityColor');
  return scenarioColor({ identityColor: a?.type === 'setIdentityColor' ? a.color : undefined });
}

interface SavedIdentity { id: string; electionId: string; savedAt: string; log: Action[] }
export function nextScenarioColor(saved: SavedIdentity[], electionId: string): typeof SCENARIO_PALETTE[number] {
  const counts = SCENARIO_PALETTE.map(c => saved.filter(x => x.electionId === electionId && savedColor(x.log) === c).length);
  return SCENARIO_PALETTE[counts.indexOf(Math.min(...counts))];
}
/** The colour a scenario shows. An unsaved one without its own colour already shows the colour saving
 *  will give it, so its identity does not change on save. */
export function liveScenarioColor(s: Pick<Scenario, 'identityColor' | 'id' | 'electionId'>, saved: SavedIdentity[]): string {
  return SCENARIO_COLOURS.includes(s.identityColor as typeof SCENARIO_COLOURS[number]) ? s.identityColor! : nextScenarioColor(saved.filter(x => x.id !== s.id), s.electionId);
}
/** Explicit colours win; missing identities are assigned oldest first, independent of storage order. */
export function migrateSavedColors<T extends SavedIdentity>(saved: T[]): T[] {
  const assigned = saved.filter(x => x.log.some(a => a.type === 'setIdentityColor'));
  const replacements = new Map<string, T>();
  for (const x of [...saved].filter(x => !assigned.includes(x)).sort((a, b) => a.savedAt.localeCompare(b.savedAt) || a.id.localeCompare(b.id))) {
    const next = { ...x, log: [...x.log, { type: 'setIdentityColor' as const, color: nextScenarioColor(assigned, x.electionId) }] };
    assigned.push(next); replacements.set(x.id, next);
  }
  return saved.map(x => replacements.get(x.id) ?? x);
}
