import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useL } from '../i18n.ts';

export interface Choice { value: string; label: string; detail?: string; group?: string; preview?: ReactNode; disabled?: boolean }
/** Native dialog supplies modal focus containment and Escape; buttons retain native activation. */
export function ChoicePicker({ label, value, options, onChange, className = '', placeholder, children, confirmLabel }: {
  label: string; value: string; options: Choice[]; onChange: (value: string) => void; className?: string; placeholder?: string; children?: ReactNode; confirmLabel?: string;
}) {
  const L = useL(), dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(value);
  const candidate = options.find(o => o.value === pending);
  const at = options.findIndex(o => o.value === pending);
  const nearby = options.slice(Math.max(0, at - 2), at + 3);
  const matches = useMemo(() => options.filter(o => `${o.label} ${o.detail ?? ''} ${o.group ?? ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [options, query]);
  const close = () => { dialog.current?.close(); trigger.current?.focus(); };
  return <span className={`choice-picker ${className}`}>
    <button ref={trigger} type="button" className="btn choice-trigger" aria-label={label} data-value={value} aria-haspopup="dialog" aria-controls={dialogId} onClick={() => { setQuery(''); setPending(value); dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); }}>{options.find(o => o.value === value)?.preview}<span className="choice-current">{options.find(o => o.value === value)?.label ?? placeholder ?? label}</span><span aria-hidden>▾</span></button>
    <dialog id={dialogId} ref={dialog} className="choice-dialog" aria-label={label} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }} onCancel={e => { e.preventDefault(); e.stopPropagation(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="choice-head"><b>{label}</b><button className="btn" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      <input autoFocus type="search" value={query} aria-label={L('Search choices', 'חיפוש אפשרויות')} placeholder={L('Search…', 'חיפוש…')} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('.choice-option:not(:disabled)')?.focus(); } }} />
      {confirmLabel && <div className="election-browse">
        <div className="row"><button className="btn" aria-label={L('Previous election', 'הבחירות הקודמות')} disabled={at >= options.length - 1} onClick={() => setPending(options[at + 1].value)}>{L('Previous', 'קודמות')}</button><b className="choice-current">{candidate?.label}</b><button className="btn" aria-label={L('Next election', 'הבחירות הבאות')} disabled={at <= 0} onClick={() => setPending(options[at - 1].value)}>{L('Next', 'הבאות')}</button></div>
        <div className="quick-actions">{nearby.map(o => <button key={o.value} className="btn small" aria-pressed={o.value === pending} onClick={() => setPending(o.value)}>{o.label}</button>)}</div>
        <button className="btn small" onClick={() => setQuery('')}>{L('All elections', 'כל הבחירות')}</button>
        <div className="election-preview" aria-live="polite"><b>{candidate?.label}</b><small>{candidate?.detail} · {candidate?.group}</small><button className="btn primary" disabled={!candidate || candidate.disabled} onClick={() => { onChange(pending); close(); }}>{confirmLabel}</button></div>
      </div>}
      {children}
      <div className="choice-options" onKeyDown={e => {
        const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]; const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const k = e.key; if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(k)) return;
        e.preventDefault(); buttons[k === 'Home' ? 0 : k === 'End' ? buttons.length - 1 : (i + (k === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }}>
        {matches.map((o, i) => <div key={o.value}>{o.group && o.group !== matches[i - 1]?.group && <h3 className="choice-era">{o.group}</h3>}<button type="button" className="choice-option" aria-label={o.label} aria-description={o.detail} data-choice-value={o.value} disabled={o.disabled} aria-pressed={o.value === (confirmLabel ? pending : value)} onClick={() => { if (confirmLabel) { setPending(o.value); dialog.current?.querySelector<HTMLButtonElement>('.election-preview button')?.focus(); } else { onChange(o.value); close(); } }}>
          <span className="choice-copy"><b>{o.label}</b>{o.detail && <small>{o.detail}</small>}</span>{o.preview}<span aria-hidden>{o.value === (confirmLabel ? pending : value) ? '✓' : ''}</span>
        </button></div>)}
        {!matches.length && <p>{L('No matches', 'אין תוצאות')}</p>}
      </div>
    </dialog>
  </span>;
}
