import {assignColour,MARK_BACKGROUNDS,isHexColour} from '../data/colourGuard.ts';
import type { Action, Scenario } from '../model/scenario.ts';
import { SCENARIO_PALETTE } from '../model/scenarioColors.ts';
export { SCENARIO_PALETTE };
export function scenarioColor(s: Pick<Scenario, 'identityColor'>): string {
  return isHexColour(s.identityColor) ? s.identityColor! : SCENARIO_PALETTE[0];
}

export function savedColor(log: Action[]): string {
  const a = log.findLast(a => a.type === 'setIdentityColor');
  return scenarioColor({ identityColor: a?.type === 'setIdentityColor' ? a.color : undefined });
}

interface SavedIdentity { id: string; electionId: string; savedAt: string; log: Action[] }
export function nextScenarioColor(saved: SavedIdentity[], _electionId: string): string {
  // The saved-scenario list co-displays elections. Reserve colours across the whole list.
  return assignColour(SCENARIO_PALETTE,saved.filter(x=>x.log.some(a=>a.type==='setIdentityColor')).map(x=>savedColor(x.log)),{minDeltaE:20,backgrounds:MARK_BACKGROUNDS});
}
/** The colour a scenario shows. An unsaved one without its own colour already shows the colour saving
 *  will give it, so its identity does not change on save. */
export function liveScenarioColor(s: Pick<Scenario, 'identityColor' | 'id' | 'electionId'>, saved: SavedIdentity[]): string {
  return isHexColour(s.identityColor) ? s.identityColor! : nextScenarioColor(saved.filter(x => x.id !== s.id), s.electionId);
}
