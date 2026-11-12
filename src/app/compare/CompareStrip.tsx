// The comparison strip under the tools (Design A): what the screen is compared with, a menu to change it, Swap, Side by side
// and Stop comparing. While comparing it stays on every screen, so it is always clear that a comparison is on.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowLeftRight, Columns2, X } from 'lucide-react';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf } from '../factionDefaults.ts';
import { resultChanges } from '../derive.ts';
import { electionLabel } from '../electionLabel.ts';
import { useL, useLang } from '../i18n.ts';
import { useStore } from '../store.ts';
import { ChoicePicker, type Choice } from '../components/ChoicePicker.tsx';
import { Info } from '../components/ui.tsx';
import { closeSideBySide, compareWith, openSideBySide, previousElection, startComparing, stopComparing, swapWithReference, useReference } from './mode.ts';

/** "⇆ Compare", in the change line under the tools: turns comparing on (the previous election first). */
export function CompareButton() {
  const L = useL();
  const on = useStore((st) => !!st.comparing);
  if (on) return null;
  return <button type="button" className="btn small ghost compare-on" onClick={startComparing}><ArrowLeftRight className="icon sm" aria-hidden />{L('Compare', 'השוואה')}</button>;
}

/** What can be compared with: any election's official result, saved scenarios of any election, this election's official
 *  result (once you have changed something), a frozen copy of your work, and the work Swap set aside. */
export function useReferenceChoices(s: Scenario): Choice[] {
  const L = useL(), lang = useLang();
  const elections = useStore((st) => st.elections), saved = useStore((st) => st.saved);
  const swapped = useStore((st) => st.compare.swapped), ds = useStore((st) => st.datasets[s.electionId]);
  const edited = !!ds && resultChanges(s, baselineOf(ds)).length > 0;
  return useMemo(() => {
    const label = (id: string) => { const e = elections.find((x) => x.id === id); return e ? electionLabel(e, elections, lang) : id; };
    const prev = previousElection(elections, s.electionId);
    const official = L('Official result', 'התוצאה הרשמית');
    return [
      ...(prev ? [{ value: 'prev', label: `${label(prev.id)} · ${official}`, detail: L('The previous election; follows the election you open', 'הבחירות הקודמות; מתעדכן לפי הבחירות שפותחים'), group: L('The previous election', 'הבחירות הקודמות') }] : []),
      ...(edited ? [{ value: 'official', label: `${label(s.electionId)} · ${official}`, detail: L('This election, without your changes', 'הבחירות האלה, בלי השינויים שלכם'), group: L('This election', 'הבחירות האלה') }] : []),
      { value: 'snapshot', label: L('Your work as it is now', 'העבודה שלכם כפי שהיא עכשיו'), detail: L('A frozen copy: keep editing and see what changed', 'עותק מוקפא: המשיכו לערוך וראו מה השתנה'), group: L('This election', 'הבחירות האלה') },
      ...(swapped ? [{ value: 'swapped', label: `${label(swapped.scenario.electionId)} · ${swapped.scenario.name || L('Your work', 'העבודה שלכם')}`, detail: L('Set aside by Swap, unsaved', 'הועבר הצידה בהחלפה, לא נשמר'), group: L('Set aside by Swap', 'הועבר הצידה בהחלפה') }] : []),
      ...saved.map((x) => ({ value: `saved:${x.id}`, label: x.name, detail: label(x.electionId), group: L('Saved scenarios', 'תרחישים שמורים') })),
      ...elections.filter((e) => e.available && e.id !== s.electionId && e.id !== prev?.id).map((e) => ({ value: `election:${e.id}`, label: `${label(e.id)} · ${official}`, group: L('Other elections', 'בחירות אחרות') })),
    ];
  }, [elections, saved, swapped, lang, s.electionId, edited]); // eslint-disable-line react-hooks/exhaustive-deps -- L follows lang
}

/** The strip itself; nothing while comparing is off. */
export function CompareStrip({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang();
  // Side by side at every level, as the Compare tab was (owner, 12 Nov 2026: it must be part of the app); Custom can hide it
  const sideShown = useStore((st) => st.customFeatures?.compare) !== 'hidden';
  const comparing = useStore((st) => st.comparing);
  const tool = useStore((st) => st.tool);
  const state = useReference(s);
  const choices = useReferenceChoices(s);
  const ref = useRef<HTMLDivElement>(null);
  // the strip sits in the sticky header stack: the board and side panels start under it
  useLayoutEffect(() => {
    const el = ref.current, root = document.documentElement.style;
    if (!el || typeof ResizeObserver === 'undefined') { root.removeProperty('--compare-h'); return; }
    const o = new ResizeObserver(() => root.setProperty('--compare-h', `${el.offsetHeight}px`));
    o.observe(el); return () => { o.disconnect(); root.removeProperty('--compare-h'); };
  }, [comparing]);
  if (!comparing) return null;
  const side = tool === 'compare';
  const picker = <ChoicePicker className="cmpm-picker" label={L('Compare with', 'השוואה עם')} value={comparing} options={choices} onChange={compareWith} />;
  const ready = state.status === 'ready' ? state.ref : null;
  const he = lang === 'he';
  return <div ref={ref} className="cmpm-strip" role="region" aria-label={L('Comparing', 'השוואה')} data-state={state.status}>
    <ArrowLeftRight className="icon sm cmpm-icon" aria-hidden />
    <span className="cmpm-what">
      {state.status === 'none'
        ? <span className="cmpm-none">{state.why === 'first' ? L('No earlier election to compare with.', 'אין בחירות קודמות להשוואה.') : state.why === 'gone' ? L('That result is no longer available.', 'התוצאה הזו כבר אינה זמינה.') : L('Nothing to compare: this is what you are looking at.', 'אין מה להשוות: זה מה שמוצג עכשיו.')}</span>
        : <span className="cmpm-label">{L('Compared with', 'בהשוואה ל־')}</span>}
      {picker}
      {state.status === 'loading' && <span className="small muted">{L('Loading…', 'טוען…')}</span>}
    </span>
    {ready && <button type="button" className="btn small cmpm-swap" onClick={() => swapWithReference(ready)} title={L(`Make ${ready.year} your work`, `${ready.year} תהפוך לעבודה שלכם`)}>
      <ArrowLeftRight className="icon sm" aria-hidden /><span>{L('Swap', 'החלפה')}</span></button>}
    {ready && <Info title={L('Swap', 'החלפה')} label={L('About Swap', 'הסבר: החלפה')}>{he
      ? `${ready.year} (${ready.name}) הופכת לעבודה שלכם, והעבודה הנוכחית הופכת לנקודת ההשוואה ונשמרת כטיוטה שלא נשמרה, עם היסטוריית הביטולים שלה. החלפה נוספת מחזירה. מה שמשווים אליו אינו נערך כאן; כדי לשנות אותו, מחליפים.`
      : `${ready.year} (${ready.name}) becomes your work, and your current work becomes the reference, kept as an unsaved draft with its own undo history. Swap again to go back. The reference is never edited here; to change it, swap.`}</Info>}
    {ready && sideShown && (side
      ? <button type="button" className="btn small cmpm-side" aria-pressed onClick={closeSideBySide}><Columns2 className="icon sm" aria-hidden /><span>{L('Close side by side', 'סגירת זו לצד זו')}</span></button>
      : <button type="button" className="btn small cmpm-side" onClick={openSideBySide}><Columns2 className="icon sm" aria-hidden /><span>{L('Side by side', 'זו לצד זו')}</span></button>)}
    <button type="button" className="btn small ghost cmpm-stop" onClick={stopComparing} aria-label={L('Stop comparing', 'סיום ההשוואה')}><span className="cmpm-stop-t">{L('Stop comparing', 'סיום ההשוואה')}</span><X className="icon sm" aria-hidden /></button>
  </div>;
}
