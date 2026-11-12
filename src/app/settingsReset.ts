import { getState, resetSettings, restoreSettings, setPreference } from './store.ts';
import { isExternal, type RowId, type SettingId, type SettingRow, type SettingValues } from './settings.ts';
import { PREFERENCES, type PreferenceId } from './preferences.ts';

/** The point-of-use questions behind Settings rows; their default answers live in the PREFERENCES store. Typed as a
 *  full record of PREFERENCES, so a new question cannot be added without its row (and so without its reset). */
export const CHOICE_ROW: Record<PreferenceId, RowId> = { jointSeats: 'jointByParty', voteSource: 'voteSource', comparison: 'markChanges', copyMode: 'copyMode' };
export const CHOICE: Partial<Record<RowId, PreferenceId>> = Object.fromEntries((Object.keys(CHOICE_ROW) as PreferenceId[]).map(q => [CHOICE_ROW[q], q]));
const PREFERENCE_IDS = Object.keys(PREFERENCES) as PreferenceId[];

/** Everything a reset can change: the settings and the questions' default answers. Answers remembered for one list,
 *  bloc or scenario (preferenceFor) are never reset, so they are not part of it. */
export type Snapshot = { settings: Partial<SettingValues>; preferences: Partial<Record<PreferenceId, string>> };
export const snapshot = (): Snapshot => ({ settings: getState().settings, preferences: { ...getState().preferences } });
/** Undo of a reset: every setting and every question's default answer back to what the snapshot held. */
export function restore(snap: Snapshot) {
  restoreSettings(snap.settings);
  for (const id of PREFERENCE_IDS) if (getState().preferences[id] !== snap.preferences[id]) setPreference(id, snap.preferences[id]);
}
/** Returns rows to their defaults: settings by registry, questions back to their default answer. */
export function resetRows(rows: readonly SettingRow[]) {
  resetSettings(rows.filter(r => !isExternal(r.id)).map(r => r.id as SettingId));
  for (const r of rows) { const q = CHOICE[r.id]; if (q && getState().preferences[q] !== undefined) setPreference(q, undefined); }
}
