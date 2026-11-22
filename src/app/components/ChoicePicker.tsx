import { ChevronsUpDown } from 'lucide-react';
import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useL } from '../i18n.ts';
import { useSetting } from '../store.ts';
import { matchesName } from '../nameSearch.ts';

/** A choice button's name: its label, then the choice it shows (the label alone when that is all it shows). */
export const choiceName = (label: string, shown: string) => shown && shown !== label ? `${label}: ${shown}` : label;

/** mark: the logo or colour dot of the list or party the option names (ListMark.tsx), shown before its name.
 *  searchNames: other names the search box finds it by, never shown (a list's or party's other spellings). */
export interface Choice { value: string; label: string; mark?: ReactNode; detail?: ReactNode; title?: string; group?: string; preview?: ReactNode; disabled?: boolean; searchNames?: readonly string[] }
/** Native dialog supplies modal focus containment and Escape; buttons retain native activation.
 *  Choosing the option already in force only closes the picker: it is never an edit. */
export function ChoicePicker({ label, value, options, onChange, className = '', placeholder, children, description }: {
  label: string; value: string; options: Choice[]; onChange: (value: string) => void; className?: string; placeholder?: string; children?: ReactNode; description?: string;
}) {
  // Settings → Option previews: off, choices show names only (lighter on slow phones)
  const previews = useSetting('optionPreviews');
  if (!previews) options = options.map(o => o.preview ? { ...o, preview: undefined } : o);
  const L = useL(), dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  // the options are drawn only while the dialog is open: a closed dialog shows nothing, and every picker on the page
  // drawing all its options (some with a result strip each) on every edit made the page slower to open and to edit
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => options.filter(o => matchesName(query, [`${o.label} ${typeof o.detail === 'string' || typeof o.detail === 'number' ? o.detail : ''} ${o.group ?? ''}`, ...(o.searchNames ?? [])])), [options, query]);
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  // a short list needs no search box: it opens on the current (or first) option instead
  const searchable = options.length > 7;
  const focusStart = () => (searchable ? dialog.current?.querySelector<HTMLElement>('input[type="search"]')
    : dialog.current?.querySelector<HTMLElement>('.choice-option[aria-pressed="true"]:not(:disabled)') ?? dialog.current?.querySelector<HTMLElement>('.choice-option:not(:disabled)'))?.focus();
  const current = options.find(o => o.value === value), shown = current?.label ?? placeholder ?? label;
  return <span className={`choice-picker ${className}`}>
    {/* named by its label and the choice it shows ("Election: 2026 · 26th Knesset"), so a screen reader says what is
        chosen and a speech user can say the words on it (review V4 A2) */}
    <button ref={trigger} type="button" className="btn choice-trigger" aria-label={choiceName(label, shown)} aria-description={current?.title ?? description} title={current?.title} data-value={value} aria-haspopup="dialog" aria-controls={dialogId} onClick={() => { flushSync(() => { setQuery(''); setOpen(true); }); dialog.current?.showModal(); focusStart(); }}>{current?.preview}{current?.mark}<span className="choice-current">{shown}</span><ChevronsUpDown className="icon sm picker-affordance" aria-hidden /></button>
    <dialog id={dialogId} ref={dialog} className="choice-dialog" aria-label={label} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }} onCancel={e => { e.preventDefault(); e.stopPropagation(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }} onClose={() => setOpen(false)}>
      <div className="choice-head"><b>{label}</b><button className="btn" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      {searchable && <input autoFocus type="search" value={query} aria-label={L('Search choices', 'חיפוש אפשרויות')} placeholder={L('Search…', 'חיפוש…')} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('.choice-option:not(:disabled)')?.focus(); } }} />}
      {children}
      <div className="choice-options" onKeyDown={e => {
        const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]; const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const k = e.key; if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(k)) return;
        e.preventDefault(); buttons[k === 'Home' ? 0 : k === 'End' ? buttons.length - 1 : (i + (k === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }}>
        {open && matches.map((o, i) => <div key={o.value}>{o.group && o.group !== matches[i - 1]?.group && <h3 className="choice-era">{o.group}</h3>}<button type="button" className="choice-option" aria-label={o.label} aria-description={o.title ?? (typeof o.detail === 'string' ? o.detail : undefined)} title={o.title} data-choice-value={o.value} disabled={o.disabled} aria-pressed={o.value === value} onClick={() => { if (o.value !== value) onChange(o.value); close(); }}>
          {o.mark}<span className="choice-copy"><b>{o.label}</b>{o.detail && <small>{o.detail}</small>}</span>{o.preview}<span aria-hidden>{o.value === value ? '✓' : ''}</span>
        </button></div>)}
        {open && !matches.length && <p>{L('No matches', 'אין תוצאות')}</p>}
      </div>
    </dialog>
  </span>;
}
