// The Overview's seat chart while comparing (owner, 12 Nov 2026, C6a): a switch in its corner shows your result or the
// reference, one chamber at full size in the same place. The reference chamber is to look at: its seats open no list.
import { memo } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { useStore } from '../store.ts';
import { Hemicycle as HemicycleView } from '../components/Hemicycle.tsx';
import { Seg } from '../components/ui.tsx';
import { showChamber, useReference, yearOf } from './mode.ts';
import { refLabel } from './useRefRows.ts';

const Hemicycle = memo(HemicycleView);

export function ComparedChamber({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL(), lang = useLang();
  const state = useReference(s);
  const chamber = useStore((st) => st.compare.chamber);
  const elections = useStore((st) => st.elections);
  // one shape whether or not comparing, so turning it on never redraws your chamber from scratch
  const ref = state.status === 'ready' ? state.ref : null;
  const label = ref ? refLabel(ref, s) : '';
  const work = ref?.same ? L('Your work', 'העבודה שלכם') : yearOf(elections, s.electionId, lang);
  const showRef = !!ref && chamber === 'ref';
  return <div className="cmpm-chamber" data-showing={ref ? chamber : undefined}>
    {ref && <div className="cmpm-chamber-switch">
      <Seg label={L('The seat chart shows', 'תרשים המליאה מציג')} value={chamber} onChange={showChamber}
        options={[{ v: 'work', label: work }, { v: 'ref', label }]} />
    </div>}
    {showRef && <p className="small muted cmpm-chamber-note">{label === ref.name ? L(`Showing ${label}. Your work is unchanged.`, `מוצג: ${label}. העבודה שלכם לא השתנתה.`) : L(`Showing ${label}: ${ref.name}. Your work is unchanged.`, `מוצג: ${label}, ${ref.name}. העבודה שלכם לא השתנתה.`)}</p>}
    {showRef
      ? <div key="ref" onClickCapture={(e) => e.stopPropagation()}><Hemicycle s={ref.sc} r={allocationOf(ref.sc)} paired title={`${label} · ${ref.name}`} /></div>
      : <div key="work"><Hemicycle s={s} r={r} /></div>}
  </div>;
}
