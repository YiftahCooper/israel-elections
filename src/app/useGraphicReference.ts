import { useActiveReference } from './useActiveReference.ts';
import { allocationOf, baselineOf } from './derive.ts';
import type { Scenario } from '../model/scenario.ts';
import { useStore } from './store.ts';

export function useGraphicReference(s: Scenario, override?: Scenario) {
  const { reference: saved } = useActiveReference();
  const ds = useStore(st => st.datasets[s.electionId]);
  const base = override ?? saved ?? (ds ? baselineOf(ds) : s);
  return { base, labelReference: override?.name === 'historical' ? null : override ?? saved, result: allocationOf(base) };
}
