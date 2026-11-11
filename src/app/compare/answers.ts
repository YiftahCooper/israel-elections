// The copy question's remembered answers: the existing vote-source question plus the copy mode, with the usual scopes
// (Just this once / For this list / Always). Item answers are per destination list, like every vote edit's.
import { getState, setPreference, setState } from '../store.ts';
import { sourceChoice, sourceValue } from '../preferences.ts';
import type { SourceChoice } from '../voteEdit.ts';
import type { Scenario } from '../../model/scenario.ts';
import { isDefaultCopyMode, type CopyMode } from './copy.ts';

const itemKey = (id: 'voteSource' | 'copyMode', dest: Scenario, listId: string) => `${id}:${dest.electionId}:list:${listId}`;

/** What is already decided for a copy into `listId` (null: nothing remembered, so ask). */
export function remembered(dest: Scenario, listId: string | null, cross: boolean): { mode: CopyMode | null; source: SourceChoice | null } {
  const st = getState();
  const item = (id: 'voteSource' | 'copyMode') => (listId ? st.preferenceFor?.[itemKey(id, dest, listId)] : undefined) ?? st.preferences[id];
  const m = cross ? item('copyMode') : 'count';
  const v = item('voteSource');
  // a remembered donor is asked again when it is absent, withdrawn or the destination itself
  const ok = v && (!v.startsWith('t:') || dest.lists.some((l) => l.id === v.slice(2) && !l.withdrawn && l.id !== listId));
  return { mode: isDefaultCopyMode(m) ? m : null, source: ok ? sourceChoice(v!) : null };
}

export function remember(dest: Scenario, listId: string | null, cross: boolean, mode: CopyMode, source: SourceChoice, scope: 'once' | 'item' | 'always') {
  if (scope === 'once') { setState({ voteSource: source }); return; }
  if (scope === 'always') {
    setPreference('voteSource', sourceValue(source));
    if (cross && isDefaultCopyMode(mode)) setPreference('copyMode', mode);
    return;
  }
  if (!listId) return;
  const st = getState();
  setState({ voteSource: source, preferenceFor: { ...st.preferenceFor, [itemKey('voteSource', dest, listId)]: sourceValue(source), ...(cross && isDefaultCopyMode(mode) ? { [itemKey('copyMode', dest, listId)]: mode } : {}) } });
}
