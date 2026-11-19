import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { askConfirm } from '../askDialog.ts';
import { useSyncExternalStore } from 'react';
import { stepName } from '../actionDescription.ts';
import { useL, useLang } from '../i18n.ts';
import { getSetting, redo, resetAll, undo, useStore } from '../store.ts';

/** Phones get their own one-row bar (owner, 9 Nov 2026): width alone decides, the same breakpoint as styles.css. */
const PHONE = '(max-width: 600px)';
const subscribePhone = (fn: () => void) => { const m = globalThis.matchMedia?.(PHONE); m?.addEventListener('change', fn); return () => m?.removeEventListener('change', fn); };
export const usePhone = () => useSyncExternalStore(subscribePhone, () => globalThis.matchMedia?.(PHONE).matches === true, () => false);

export function useStartOver() {
  const L = useL();
  const s = useStore(st => st.scenario);
  return { can: !!s?.log.length, run: async () => { if (!s?.log.length) return; if (getSetting('confirmStartOver') && !(await askConfirm({ title: L('Start over from the official result?', 'להתחיל מחדש מהתוצאה הרשמית?'), text: L('Undo can restore it.', 'אפשר לשחזר בביטול.'), yes: L('Start over', 'התחלה מחדש'), no: L('Cancel', 'ביטול') }))) return; resetAll(); } };
}

/** Undo and Redo, each named by the step it takes (Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z work anywhere). Always present, and
 *  greyed out when there is nothing to take back or do again, so they never appear under the pointer. */
export function UndoRedo({ className = 'tool' }: { className?: string }) {
  const L = useL(), lang = useLang();
  const s = useStore(st => st.scenario);
  const canUndo = useStore(st => st.past.length > 0), canRedo = useStore(st => st.future.length > 0);
  // the step itself, from the state before it to the state after it (Start over is "Start over", not its last entry)
  const before = useStore(st => st.past.at(-1)), after = useStore(st => st.future[0]);
  const undoStep = before && s ? stepName(before, s, lang) : null, redoStep = after && s ? stepName(s, after, lang) : null;
  const undoName = undoStep ? L('Undo: ', 'ביטול: ') + undoStep : L('Undo', 'ביטול');
  const redoName = redoStep ? L('Redo: ', 'ביצוע מחדש: ') + redoStep : L('Redo', 'ביצוע מחדש');
  return <>
    <button type="button" className={`${className} undo-btn`} onClick={undo} disabled={!canUndo} title={undoName + ' (Ctrl+Z)'} aria-label={undoName}><Undo2 className="icon rtl-mirror" aria-hidden /></button>
    <button type="button" className={`${className} redo-btn`} onClick={redo} disabled={!canRedo} title={redoName + ' (Ctrl+Y)'} aria-label={redoName}><Redo2 className="icon rtl-mirror" aria-hidden /></button>
  </>;
}

/** On the line of changes (owner, 19 Nov 2026): Undo, Redo and Start over act on what that line counts. */
export function SessionUndo() {
  const L = useL();
  const start = useStartOver();
  return <span className="session-undo" role="group" aria-label={L('Undo and start over', 'ביטול והתחלה מחדש')}>
    <UndoRedo className="btn small ghost icon-only" />
    <button type="button" className="btn small ghost session-start-over" onClick={start.run} disabled={!start.can} title={L('Start over', 'התחלה מחדש')} aria-label={L('Start over', 'התחלה מחדש')}>
      <RotateCcw className="icon sm" aria-hidden /><span className="label">{L('Start over', 'התחלה מחדש')}</span></button>
  </span>;
}
