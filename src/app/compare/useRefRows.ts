// The Lists panel's view of the reference while comparing; the pairing itself (listRows.ts) is loaded on first use.
import { useEffect, useMemo, useState } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import { useLang } from '../i18n.ts';
import { useStore } from '../store.ts';
import { useReference, type Reference } from './mode.ts';
import type { RefRows } from './listRows.ts';

type Module = typeof import('./listRows.ts');
let loaded: Module | null = null;
const load = () => import('./listRows.ts').then((m) => (loaded = m));

/** "2022" between elections; the reference's own name within one election ("Official result"). */
export const refLabel = (ref: Reference, work: Scenario) => ref.sc.electionId === work.electionId ? ref.name : ref.year;

export function useRefRows(work: Scenario): { ref: Reference; label: string; rows: RefRows } | null {
  const state = useReference(work);
  const lang = useLang();
  const datasets = useStore((st) => st.datasets);
  const overridesAll = useStore((st) => st.compare.overrides);
  const [m, setM] = useState(loaded);
  const ready = state.status === 'ready';
  useEffect(() => { if (ready && !m) void load().then(setM); }, [ready, m]);
  const ref = ready ? state.ref : null;
  const label = ref ? refLabel(ref, work) : '';
  // the reference object is rebuilt on every render; its scenario and data are stable, so the pairing is keyed on them
  const rows = useMemo(() => {
    if (!ref || !m) return null;
    const workDate = datasets[work.electionId]?.electionDate ?? '';
    const pair = [work.electionId, ref.sc.electionId].sort().join('|');
    try { return m.refRows(work, ref.sc, overridesAll[pair] ?? [], ref.ds.electionDate < workDate, label, lang); } catch { return null; }
  }, [ref?.sc, ref?.ds, m, work, datasets, overridesAll, label, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref && rows ? { ref, label, rows } : null;
}
