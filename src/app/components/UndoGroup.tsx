import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { describe } from '../actionDescription.ts';
import { useL, useLang } from '../i18n.ts';
import { getSetting, redo, resetAll, undo, useStore } from '../store.ts';

/** Phones get their own one-row bar (owner, 9 Nov 2026): width alone decides, the same breakpoint as styles.css. */
const PHONE = '(max-width: 600px)';
const subscribePhone = (fn: () => void) => { const m = globalThis.matchMedia?.(PHONE); m?.addEventListener('change', fn); return () => m?.removeEventListener('change', fn); };
export const usePhone = () => useSyncExternalStore(subscribePhone, () => globalThis.matchMedia?.(PHONE).matches === true, () => false);

export function useStartOver() {
  const L = useL();
  const s = useStore(st => st.scenario);
  return { can: !!s?.log.length, run: () => { if (!s?.log.length || !getSetting('confirmStartOver') || confirm(L('Start over from the official result? (Undo can restore it.)', 'להתחיל מחדש מהתוצאה הרשמית? (ניתן לבטל)'))) resetAll(); } };
}

/** Undo and Redo, each named by the step it takes (Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z work anywhere). Always present, and
 *  greyed out when there is nothing to take back or do again, so they never appear under the pointer. */
export function UndoRedo({ className = 'tool' }: { className?: string }) {
  const L = useL(), lang = useLang();
  const s = useStore(st => st.scenario);
  const canUndo = useStore(st => st.past.length > 0), canRedo = useStore(st => st.future.length > 0);
  const future = useStore(st => st.future);
  const last = s?.log.at(-1), next = future.at(-1)?.log.at(-1);
  const undoName = last && s ? L('Undo: ', 'ביטול: ') + describe(last.action, s, lang) : L('Undo', 'ביטול');
  const redoName = next && s ? L('Redo: ', 'ביצוע מחדש: ') + describe(next.action, future.at(-1)!, lang) : L('Redo', 'ביצוע מחדש');
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
