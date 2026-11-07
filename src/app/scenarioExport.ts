import { markerLead } from './compare/copyText.ts';
import { copyOriginOf } from '../model/editScopes.ts';
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
    editMarkers: referenceChanges(s, base).map(p => `${editPathLabel(s, p, lang, base)} · ${markerLead(copyOriginOf(s, p)?.provenance, lang, s.electionId)}${changeText(markerReference(s,base,p), p, lang)}`),
  };
}
