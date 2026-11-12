import { copyOriginOf } from '../model/editScopes.ts';
import { markerChangeText } from './changeValue.tsx';
import type { Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { baselineOf, editPathLabel, markerReference, referenceChanges } from './derive.ts';
import { getState } from './store.ts';
import { activeReferenceOf } from './useActiveReference.ts';
/** Export annotations are text; scenario inputs and replay logs retain their ordinary schema. */
export function exportAnnotations(s: Scenario, lang: Lang) {
  const st = getState(), ds = st.datasets[s.electionId];
  const base = activeReferenceOf(st) ?? (ds ? baselineOf(ds) : s);
  return {
    editMarkers: referenceChanges(s, base).map(p => `${editPathLabel(s, p, lang, base)} · ${markerChangeText(markerReference(s,base,p), s, p, lang, copyOriginOf(s, p)?.provenance)}`),
  };
}
