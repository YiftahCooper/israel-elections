import type { Scenario } from '../model/scenario.ts';
import { referenceLabel } from './derive.ts';
import { useLang } from './i18n.ts';
import { useStore } from './store.ts';

export const activeReferenceOf = (st: {markOfficial:boolean;reference:Scenario|null}) => st.markOfficial ? null : st.reference;

/** One reference policy for summaries, comparisons, edits and graphics. Null means official. */
export function useActiveReference() {
  const loadedReference = useStore(st => st.reference);
  const reference = useStore(activeReferenceOf);
  const lang = useLang();
  return { reference, loadedReference, label: referenceLabel(reference, lang) };
}
