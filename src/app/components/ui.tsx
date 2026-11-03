import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY, useL, useLang } from '../i18n.ts';

/** Accessible info popover: opens on hover, focus or click; Escape closes. */
export function Info({ title, children, term }: { title?: string; children?: ReactNode; term?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const lang = useLang();
  const ref = useRef<HTMLSpanElement>(null);
  const g = term ? GLOSSARY.find((x) => x.id === term) : undefined;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('mousedown', onDoc);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDoc); };
  }, [open]);
  const heading = title ?? (g ? (lang === 'he' ? g.he : `${g.en} (${g.he})`) : '');
  return (
    <span className="info" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={heading || 'info'} aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen((o) => !o)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>i</button>
      {open && (
        <span className="pop" role="tooltip" id={id}>
          {heading && <b>{heading}</b>}
          {g && <span>{lang === 'he' ? g.defHe : g.defEn}</span>}
          {children}
        </span>
      )}
    </span>
  );
}

export function Slip({ letters, color, size }: { letters: string; color: string; size?: 'sm' | 'lg' }) {
  return <span className={`slip ${size ?? ''}`} style={{ ['--c' as string]: color }} aria-label={`ballot letters ${letters}`} lang="he" dir="rtl">{letters || '—'}</span>;
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <span className="seg" role="group" aria-label={label}>
      {options.map((o) => <button key={o.v} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </span>
  );
}

export function Delta({ v, suffix = '' }: { v: number; suffix?: string }) {
  if (v === 0) return <span className="muted">±0{suffix}</span>;
  return <span className={v > 0 ? 'up' : 'down'}>{v > 0 ? '▲ +' : '▼ −'}{Math.abs(v).toLocaleString('en-US')}{suffix}</span>;
}

export function Tile({ k, v, d, term, children }: { k: string; v: ReactNode; d?: ReactNode; term?: string; children?: ReactNode }) {
  return (
    <div className="tile">
      <div className="k">{k}{(term || children) && <Info term={term}>{children}</Info>}</div>
      <div className="v">{v}</div>
      {d && <div className="d">{d}</div>}
    </div>
  );
}

export function NumberInput({ value, onCommit, label, width }: { value: number; onCommit: (n: number) => void; label: string; width?: number }) {
  const [text, setText] = useState(value.toLocaleString('en-US'));
  const L = useL();
  useEffect(() => setText(value.toLocaleString('en-US')), [value]);
  const commit = () => {
    const n = Number(text.replace(/[,\s_]/g, ''));
    if (Number.isSafeInteger(n) && n >= 0) { if (n !== value) onCommit(n); setText(n.toLocaleString('en-US')); }
    else setText(value.toLocaleString('en-US'));
  };
  return (
    <input type="text" inputMode="numeric" className="num-in" aria-label={label} title={L('Whole number ≥ 0; press Enter to apply', 'מספר שלם ≥ 0; Enter להחלה')}
      style={width ? { width } : undefined} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setText(value.toLocaleString('en-US')); }} />
  );
}
