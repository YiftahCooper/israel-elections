import { AnalysisEdits } from './AnalysisEdits.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { allocationOf as allocationOfCached, resultChanges } from '../derive.ts';
import { scenarioColor } from '../scenarioIdentity.ts';
import { lazy, Suspense, useEffect } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { dispatch, redo, resetAll, undo, useStore } from '../store.ts';
import { dispatchSide, redoSide, startOverSide, undoSide } from '../compare/sides.ts';
import { startComparing, swapWithReference, useReference, yearOf } from '../compare/mode.ts';
import type { SideModel } from '../compare/model.ts';
import type { Action } from '../../model/scenario.ts';

// its own chunk: list matching needs the party registry, which the start-up prefetch of this panel should not load
const Workbench = lazy(() => import('../compare/Workbench.tsx').then((m) => ({ default: m.Workbench })));

/** Side by side (owner, 12 Nov 2026: kept, opened from the comparison strip): your work and the reference as two whole
 *  results. Your work is the open scenario (an edit here is an Overview edit, with the top bar's Undo); the reference can
 *  be edited here only, as its own draft with its own Undo, and Swap exchanges the two. */
export function Compare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const L = useL(), lang = useLang();
  const elections = useStore((st) => st.elections);
  const comparing = useStore((st) => st.comparing);
  const drafts = useStore((st) => st.compare.drafts);
  const past = useStore((st) => st.past), future = useStore((st) => st.future);
  const { markerReference: reference } = useActiveReference();
  const state = useReference(s);
  // opened without comparing (a saved comparison, an old link): comparing starts, as from the strip
  useEffect(() => { if (!comparing) startComparing(); }, [comparing]);
  if (state.status !== 'ready') return <div className="cmp">
    <p className="small muted">{state.status === 'loading' || state.status === 'off' ? L('Loading…', 'טוען…') : L('Nothing to compare here. Choose what to compare with in the strip above.', 'אין כאן מה להשוות. בחרו עם מה להשוות ברצועה שלמעלה.')}</p>
  </div>;
  const ref = state.ref;
  const mainStart = reference ?? base;
  const mainEdited = resultChanges(s, base).length > 0;
  const main: SideModel = {
    role: 'main', key: 'main', sc: s, r, start: mainStart, ds, year: yearOf(elections, s.electionId, lang),
    name: mainEdited ? s.name || L('Your work', 'העבודה שלכם') : L('Official result', 'התוצאה הרשמית'),
    official: !mainEdited, edited: resultChanges(s, mainStart).length > 0, frame: mainEdited ? scenarioColor(s) : 'var(--rule)',
    canUndo: past.length > 0, canRedo: future.length > 0, undo, redo, startOver: resetAll, apply: (a: Action) => dispatch(a),
  };
  const draft = drafts[ref.id];
  const otherEdited = !ref.official;
  const other: SideModel = {
    role: 'other', key: ref.id, sc: ref.sc, r: allocationOfCached(ref.sc), start: ref.start, ds: ref.ds, year: ref.year, name: ref.name,
    official: ref.official, edited: !!draft && resultChanges(ref.sc, ref.initial).length > 0, frame: otherEdited ? scenarioColor(ref.sc) : 'var(--rule)',
    canUndo: !!draft?.past.length, canRedo: !!draft?.future.length,
    undo: () => undoSide(ref.id), redo: () => redoSide(ref.id), startOver: () => startOverSide(ref.id),
    apply: (a: Action) => dispatchSide(ref.id, ref.initial, ref.start, a),
  };
  return <div className="cmp">
    {/* chosen and closed from the strip above (its picker and "Close side by side"): no second picker or Close here */}
    <div className="cmpm-side-head"><h2>{L('Side by side', 'זו לצד זו')}</h2></div>
    <AnalysisEdits s={s} outlet="compare-grouping" />
    <Suspense fallback={<p className="small muted">{L('Loading…', 'טוען…')}</p>}>
      <Workbench main={main} other={other} onSwap={() => swapWithReference(ref)}
        picker={null} />
    </Suspense>
  </div>;
}
