import { getState, resetSettings, restoreSettings, setPreference, setState } from './store.ts';
import { ownChoices, type FeatureId } from './features.ts';
import { isExternal, type RowId, type SettingId, type SettingRow, type SettingValues } from './settings.ts';
import { PREFERENCES, type PreferenceId } from './preferences.ts';

/** The point-of-use questions behind Settings rows; their default answers live in the PREFERENCES store. Typed as a
 *  full record of PREFERENCES, so a new question cannot be added without its row (and so without its reset). */
export const CHOICE_ROW: Record<PreferenceId, RowId> = { jointSeats: 'jointByParty', voteSource: 'voteSource', comparison: 'markChanges', copyMode: 'copyMode' };
export const CHOICE: Partial<Record<RowId, PreferenceId>> = Object.fromEntries((Object.keys(CHOICE_ROW) as PreferenceId[]).map(q => [CHOICE_ROW[q], q]));
const PREFERENCE_IDS = Object.keys(PREFERENCES) as PreferenceId[];

/** Everything a reset can change: the settings and the questions' default answers. Answers remembered for one list,
 *  bloc or scenario (preferenceFor) are never reset, so they are not part of it. */
export type Snapshot = { settings: Partial<SettingValues>; preferences: Partial<Record<PreferenceId, string>>; features: ReturnType<typeof getState>['customFeatures']; custom: boolean };
export const snapshot = (): Snapshot => ({ settings: getState().settings, preferences: { ...getState().preferences }, features: getState().customFeatures, custom: getState().custom });
/** Undo of a reset: every setting and every question's default answer back to what the snapshot held. */
export function restore(snap: Snapshot) {
  restoreSettings(snap.settings);
  setState({ customFeatures: snap.features, custom: snap.custom });
  for (const id of PREFERENCE_IDS) if (getState().preferences[id] !== snap.preferences[id]) setPreference(id, snap.preferences[id]);
}
/** Takes back the user's own choices for these tools and sections (all of them when none are named): each follows its
 *  complexity again; with none left, Custom is the named complexity it started from. */
export function resetFeatures(ids?: readonly FeatureId[]) {
  const was = getState().customFeatures;
  if (!was) return;
  const next = ids ? Object.fromEntries(Object.entries(was).filter(([k]) => !ids.includes(k as FeatureId))) : {};
  setState({ customFeatures: Object.keys(next).length ? next : null, custom: getState().custom && ownChoices(next, getState().level).length > 0 });
}
/** Returns rows to their defaults: settings by registry, questions back to their default answer. */
export function resetRows(rows: readonly SettingRow[]) {
  resetSettings(rows.filter(r => !isExternal(r.id)).map(r => r.id as SettingId));
  for (const r of rows) { const q = CHOICE[r.id]; if (q && getState().preferences[q] !== undefined) setPreference(q, undefined); }
}
