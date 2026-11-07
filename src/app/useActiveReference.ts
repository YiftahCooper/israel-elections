import { factLog } from '../model/actionClassification.ts';
import { referenceLabel } from './derive.ts';
import { useLang } from './i18n.ts';
import { useStore, type State } from './store.ts';

/** A loaded scenario is the reference when it holds changes (result, grouping or coalition); appearance alone is not. */
export const activeReferenceOf = (st: Pick<State,'markOfficial'|'reference'>) => st.markOfficial || st.reference && !factLog(st.reference).length ? null : st.reference;

/** One reference policy for summaries, comparisons, edits, markers and graphics. Null means official. */
export function useActiveReference() {
  const loadedReference = useStore(st => st.reference);
  const reference = useStore(activeReferenceOf);
  const lang = useLang();
  return { reference, markerReference: reference, loadedReference, label: referenceLabel(reference, lang) };
}
