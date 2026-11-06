import { inputDiffs } from '../model/editScopes.ts';
import type { Scenario } from '../model/scenario.ts';

/** Compare effective facts and author metadata, ignoring view choices, replay times and ids. */
export function scenarioDirty(s: Scenario, reference: Scenario): boolean {
  // Compare values rather than saveLog history: restoring an authored value is clean again.
  return appearanceSignature(s, s.blocSchemeId===reference.blocSchemeId)!==appearanceSignature(reference, s.blocSchemeId===reference.blocSchemeId) || inputDiffs(s, reference).length > 0 || s.electionId !== reference.electionId ||
    s.name !== reference.name || (s.description ?? '') !== (reference.description ?? '') ||
    s.identityColor !== reference.identityColor;
}

export function nextCopyName(name: string, names: readonly string[]): string {
  const base = name.replace(/ \(\d+\)$/, '');
  let n = 1;
  while (names.includes(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}

export const appearanceSignature=(s:Scenario, sameGrouping=true)=>JSON.stringify({lists:s.lists.map(l=>[l.id,l.color,l.parties?.map(p=>[p.id,p.color])]),blocs:sameGrouping?s.blocs.map(b=>[b.id,b.color,b.nameHe,b.nameEn]):[],name:sameGrouping?s.customGroupingName:undefined});
