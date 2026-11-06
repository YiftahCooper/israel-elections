import { changeText } from './changeValue.tsx';
import type { Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { baselineOf, editPathLabel, markerReference, referenceChanges } from './derive.ts';
import { getState } from './store.ts';
/** Export annotations are text; scenario inputs and replay logs retain their ordinary schema. */
export function exportAnnotations(s: Scenario, lang: Lang) {
  const st = getState(), ds = st.datasets[s.electionId];
  const base = (st.markOfficial?null:st.reference) ?? (ds ? baselineOf(ds) : s);
  return {
    editMarkers: referenceChanges(s, base).map(p => `${editPathLabel(s, p, lang, base)} · ${lang === 'he' ? 'נערך: קודם' : 'Edited: was'} ${changeText(markerReference(s,base,p), p, lang)}`),
  };
}
