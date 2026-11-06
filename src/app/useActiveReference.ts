import {resultDiffs} from '../model/editScopes.ts';
import { factLog } from '../model/actionClassification.ts';
import { baselineOf, referenceLabel } from './derive.ts';
import { useLang } from './i18n.ts';
import { useStore, type State } from './store.ts';

export const activeReferenceOf = (st: Pick<State,'markOfficial'|'reference'> & Partial<Pick<State,'datasets'>>) => {
 const ds=st.reference&&st.datasets?.[st.reference.electionId];
 const hasResult=st.reference&&(ds?resultDiffs(st.reference,baselineOf(ds)).length>0:factLog(st.reference).length>0);
 return st.markOfficial||!hasResult?null:st.reference;
};

/** One reference policy for summaries, comparisons, edits and graphics. Null means official. */
export function useActiveReference() {
  const loadedReference = useStore(st => st.reference);
  const reference = useStore(activeReferenceOf);
  const markOfficial=useStore(st=>st.markOfficial);
  const markerReference=markOfficial?null:loadedReference;
  const lang = useLang();
  return { reference, markerReference, loadedReference, label: referenceLabel(reference, lang) };
}
