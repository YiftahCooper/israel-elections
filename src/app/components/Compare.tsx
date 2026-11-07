import { AnalysisEdits } from './AnalysisEdits.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { allocationOf as allocationOfCached, baselineOf, referenceLabel, resultChanges } from '../derive.ts';
import { scenarioColor } from '../scenarioIdentity.ts';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { dispatch, getState, loadDataset, redo, replay, resetAll, setState, toast, undo, useStore } from '../store.ts';
import { electionLabel } from '../electionLabel.ts';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { ResultPreview } from './ResultPreview.tsx';
import { dispatchSide, redoSide, sideKey, startOverSide, undoSide } from '../compare/sides.ts';
import type { SideModel } from '../compare/model.ts';
import type { Action } from '../../model/scenario.ts';

const ELECTION = 'election:';
// its own chunk: list matching needs the party registry, which the start-up prefetch of this panel should not load
const Workbench = lazy(() => import('../compare/Workbench.tsx').then((m) => ({ default: m.Workbench })));

/** Compare: two live sides. The right side is the scenario open on the board; the other side is any election's official
 *  result, this election's official result, the loaded reference or a saved scenario, and becomes a draft once edited. */
export function Compare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const L = useL(), lang = useLang();
  const compareWith = useStore((st) => st.compareWith);
  const elections = useStore((st) => st.elections);
  const saved = useStore((st) => st.saved);
  const drafts = useStore((st) => st.compare.drafts);
  const past = useStore((st) => st.past), future = useStore((st) => st.future);
  const { markerReference: reference } = useActiveReference();
  const { previous, choices } = useCompareChoices(s, ds);
  // which comparator: an explicit choice, or the automatic one (the previous election while nothing is edited)
  const mainStart = reference ?? base;
  // unchanged from the active reference (the official result unless another reference is chosen in Your settings)
  const unchanged = resultChanges(s, mainStart).length === 0;
  const explicitElection = compareWith.startsWith(ELECTION) && compareWith.slice(ELECTION.length) !== s.electionId && elections.some((e) => e.id === compareWith.slice(ELECTION.length) && e.available);
  const value = explicitElection ? compareWith
    : compareWith === 'auto' ? (unchanged && previous ? ELECTION + previous.id : 'historical')
    : compareWith === 'official' || saved.some((x) => x.id === compareWith && x.electionId === s.electionId && x.id !== s.id) ? compareWith : 'historical';
  const otherId = (value.startsWith(ELECTION) ? value.slice(ELECTION.length) : s.electionId) as ElectionId;
  const ods = useStore((st) => st.datasets[otherId]);
  useEffect(() => { if (!ods) loadDataset(otherId).catch(() => { toast('error', L('Could not load this election.', 'לא ניתן לטעון את הבחירות האלה.')); setState({ compareWith: 'historical' }); }); }, [ods, otherId]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = sideKey(s.electionId, value);
  const draft = drafts[key];
  const otherStart = useMemo(() => {
    if (!ods) return null;
    if (value.startsWith(ELECTION)) return baselineOf(ods);
    if (value === 'official') return base;
    if (value === 'historical') return reference ?? base;
    const sv = saved.find((x) => x.id === value);
    return sv ? { ...replay(ds, sv.name, sv.log, sv.factionSplitBaseline ?? false).scenario, id: sv.id } : base;
  }, [ods, value, base, reference, saved, ds]);
  const yearOf = (id: string) => elections.find((e) => e.id === id)?.date.slice(0, 4) ?? id;
  const pin = () => { if (getState().compareWith !== value) setState({ compareWith: value }); };

  if (!ods || !otherStart) return <div className="cmp"><p className="small muted">{L('Loading…', 'טוען…')}</p></div>;
  // nothing differs and nothing was edited on the other side: the quickest ways to something worth comparing
  if (otherId === s.electionId && !draft && resultChanges(s, otherStart).length === 0 && JSON.stringify(s.lists.map((l) => l.votes)) === JSON.stringify(otherStart.lists.map((l) => l.votes)))
    return <EmptyCompare s={s} ds={ds} base={base} compareWith={value} choices={choices} previous={previous} nameA={referenceLabel(otherStart === base ? null : otherStart, lang).name} nameB={resultChanges(s, base).length === 0 ? L('Official result', 'התוצאה הרשמית') : s.name || L('Your scenario', 'התרחיש שלכם')} />;

  const mainEdited = resultChanges(s, base).length > 0;
  const main: SideModel = {
    role: 'main', key: 'main', sc: s, r, start: mainStart, ds, year: yearOf(s.electionId),
    name: mainEdited ? s.name || L('Your scenario', 'התרחיש שלכם') : L('Official result', 'התוצאה הרשמית'),
    official: !mainEdited, edited: resultChanges(s, mainStart).length > 0, frame: mainEdited ? scenarioColor(s) : 'var(--rule)',
    canUndo: past.length > 0, canRedo: future.length > 0, undo, redo, startOver: resetAll,
    apply: (a: Action) => { pin(); return dispatch(a); },
  };
  const osc = draft?.scenario ?? otherStart;
  const otherOfficialBase = baselineOf(ods);
  const otherEdited = resultChanges(osc, otherOfficialBase).length > 0;
  const startName = value.startsWith(ELECTION) || value === 'official' ? L('Official result', 'התוצאה הרשמית') : value === 'historical' ? referenceLabel(reference, lang).name : saved.find((x) => x.id === value)?.name ?? '';
  const other: SideModel = {
    role: 'other', key, sc: osc, r: allocationOfCached(osc), start: otherStart, ds: ods, year: yearOf(otherId),
    name: draft && draft.scenario !== otherStart ? L(`${startName} · draft`, `${startName} · טיוטה`) : startName,
    official: !otherEdited, edited: !!draft && resultChanges(osc, otherStart).length > 0, frame: otherEdited ? scenarioColor(osc) : 'var(--rule)',
    canUndo: !!draft?.past.length, canRedo: !!draft?.future.length,
    undo: () => undoSide(key), redo: () => redoSide(key), startOver: () => startOverSide(key),
    apply: (a: Action) => { pin(); return dispatchSide(key, otherStart, otherOfficialBase, a); },
  };
  return <div className="cmp">
    <AnalysisEdits s={s} outlet="compare-grouping" />
    <Suspense fallback={<p className="small muted">{L('Loading…', 'טוען…')}</p>}>
      <Workbench main={main} other={other} picker={<ChoicePicker label={L('Compare with', 'השוואה עם')} value={value} options={choices} onChange={(v) => setState({ compareWith: v })} />} />
    </Suspense>
  </div>;
}

/** What the current result can be compared with: this election's official result, the loaded reference and saved
 *  scenarios, or another election's official result. */
function useCompareChoices(s: Scenario, ds: ElectionDataset) {
  const L = useL(), lang = useLang();
  const { markerReference: reference } = useActiveReference();
  const saved = useStore((st) => st.saved);
  const elections = useStore((st) => st.elections);
  const here = L('This election', 'הבחירות האלה'), others = L('Other elections', 'בחירות אחרות');
  const savedHere = saved.filter((x) => x.electionId === s.electionId && x.id !== s.id);
  const choices: Choice[] = useMemo(() => [
    ...(reference ? [{ value: 'official', label: L('Official result', 'התוצאה הרשמית'), group: here }] : []),
    { value: 'historical', label: referenceLabel(reference, lang).name, group: here },
    ...savedHere.map((x) => ({ value: x.id, label: x.name, group: here, preview: <span className="swatch" style={{ background: (() => { const sc = replay(ds, x.name, x.log, x.factionSplitBaseline ?? false).scenario; return resultChanges(sc, baselineOf(ds)).length ? scenarioColor(sc) : 'var(--muted)'; })() }} /> })),
    ...elections.filter((e) => e.available && e.id !== s.electionId).map((e) => ({ value: ELECTION + e.id, label: electionLabel(e, elections, lang), detail: L('Official result', 'התוצאה הרשמית'), group: others })),
  ], [reference, saved, ds, elections, lang, s.electionId, s.id]); // eslint-disable-line react-hooks/exhaustive-deps -- L and the filtered lists follow lang, saved and s
  const at = elections.findIndex((e) => e.id === s.electionId);
  const previous = elections.slice(at + 1).find((e) => e.available);
  return { choices, previous, electionName: (id: string) => { const e = elections.find((x) => x.id === id); return e ? electionLabel(e, elections, lang) : id; } };
}

/** Nothing differs: instead of two identical pictures, the quickest ways to something worth comparing,
 *  each with a strip of its seats. */
function EmptyCompare({ s, ds, base, compareWith, nameA, nameB, choices, previous }: { s: Scenario; ds: ElectionDataset; base: Scenario; compareWith: string; nameA: string; nameB: string; choices: Choice[]; previous?: { id: string } }) {
  const L = useL();
  const { markerReference: reference } = useActiveReference();
  const saved = useStore((st) => st.saved);
  const elections = useStore((st) => st.elections);
  const lang = useLang();
  const prevDs = useStore((st) => previous ? st.datasets[previous.id as ElectionId] : undefined);
  useEffect(() => { if (previous && !prevDs) loadDataset(previous.id as ElectionId).catch(() => {}); }, [previous, prevDs]);
  const scenarioOf = (value: string) => {
    if (value === 'official') return base;
    if (value === 'historical') return reference ?? base;
    const sv = saved.find((x) => x.id === value);
    return sv ? replay(ds, sv.name, sv.log, sv.factionSplitBaseline ?? false).scenario : null;
  };
  const card = (key: string, title: string, sc: Scenario | null, onClick: () => void) => <button key={key} type="button" className="btn cmp-pick" onClick={onClick}>
    <b>{title}</b>{sc ? <ResultPreview s={sc} blocs={false} /> : <span className="result-preview" aria-hidden />}
  </button>;
  const prevEntry = previous && elections.find((e) => e.id === previous.id);
  return (
    <div className="cmp">
      <AnalysisEdits s={s} outlet="compare-grouping" />
      <div className="row cmp-head"><span>{L('Compare', 'השוואה בין')} <b>{nameB}</b> {L('with', 'לבין')}</span>
        <ChoicePicker label={L('Compare with', 'השוואה עם')} value={compareWith} options={choices} onChange={(v) => setState({ compareWith: v })} /></div>
      <section className="cmp-empty" aria-labelledby="cmp-empty-title">
        <h3 id="cmp-empty-title">{L('Compare ', 'השוואת ')}<bdi>{nameB}</bdi>{L(' with…', ' עם…')}</h3>
        <div className="cmp-picks">
          {choices.filter((c) => c.value !== compareWith && !c.value.startsWith(ELECTION)).map((c) => card(c.value, c.label, scenarioOf(c.value), () => setState({ compareWith: c.value })))}
          {prevEntry && card(prevEntry.id, electionLabel(prevEntry, elections, lang), prevDs ? baselineOf(prevDs) : null, () => setState({ compareWith: ELECTION + prevEntry.id }))}
          <ChoicePicker className="cmp-other" label={L('Another election', 'בחירות אחרות')} placeholder={L('Another election…', 'בחירות אחרות…')} value="" options={choices.filter((c) => c.value.startsWith(ELECTION))} onChange={(v) => setState({ compareWith: v })} />
          <button type="button" className="btn" onClick={() => setState({ tool: 'whatif' })}>{L('A What-if question…', 'שאלת "מה אם"…')}</button>
        </div>
        <p className="small muted">{nameA !== nameB && <>{L(`Same as ${nameA}. `, `זהה ל${nameA}. `)}</>}{L('Edits you make show here.', 'עריכות שתבצעו יוצגו כאן.')}</p>
      </section>
    </div>
  );
}

