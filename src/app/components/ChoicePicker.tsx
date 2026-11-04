import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useL } from '../i18n.ts';

export interface Choice { value: string; label: string; detail?: string; group?: string; preview?: ReactNode; disabled?: boolean }
/** Native dialog supplies modal focus containment and Escape; buttons retain native activation. */
export function ChoicePicker({ label, value, options, onChange, className = '', placeholder, children }: {
  label: string; value: string; options: Choice[]; onChange: (value: string) => void; className?: string; placeholder?: string; children?: ReactNode;
}) {
  const L = useL(), dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const matches = useMemo(() => options.filter(o => `${o.label} ${o.detail ?? ''} ${o.group ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [options, query]);
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  return <span className={`choice-picker ${className}`}>
    <button ref={trigger} type="button" className="btn choice-trigger" aria-label={label} data-value={value} aria-haspopup="dialog" aria-controls={dialogId} onClick={() => { setQuery(''); dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); }}>{options.find(o => o.value === value)?.preview}<span className="choice-current">{options.find(o => o.value === value)?.label ?? placeholder ?? label}</span><span aria-hidden>▾</span></button>
    <dialog id={dialogId} ref={dialog} className="choice-dialog" aria-label={label} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }} onCancel={e => { e.preventDefault(); e.stopPropagation(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="choice-head"><b>{label}</b><button className="btn" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      <input autoFocus type="search" value={query} aria-label={L('Search choices', 'חיפוש אפשרויות')} placeholder={L('Search…', 'חיפוש…')} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('.choice-option:not(:disabled)')?.focus(); } }} />
      {children}
      <div className="choice-options" onKeyDown={e => {
        const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]; const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const k = e.key; if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(k)) return;
        e.preventDefault(); buttons[k === 'Home' ? 0 : k === 'End' ? buttons.length - 1 : (i + (k === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }}>
        {matches.map((o, i) => <div key={o.value}>{o.group && o.group !== matches[i - 1]?.group && <h3 className="choice-era">{o.group}</h3>}<button type="button" className="choice-option" aria-label={o.label} aria-description={o.detail} data-choice-value={o.value} disabled={o.disabled} aria-pressed={o.value === value} onClick={() => { onChange(o.value); close(); }}>
          <span className="choice-copy"><b>{o.label}</b>{o.detail && <small>{o.detail}</small>}</span>{o.preview}<span aria-hidden>{o.value === value ? '✓' : ''}</span>
        </button></div>)}
        {!matches.length && <p>{L('No matches', 'אין תוצאות')}</p>}
      </div>
    </dialog>
  </span>;
}
