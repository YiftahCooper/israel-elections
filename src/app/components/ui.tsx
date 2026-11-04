import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY, useL, useLang, type GlossaryTerm } from '../i18n.ts';
import type { LogoRef } from '../../data/schema.ts';

/** Accessible info popover: opens on hover, focus or click; Escape closes. */
export function Info({ title, children, term }: { title?: string; children?: ReactNode; term?: string }) {
  // 'hover' and 'focus' are transient; 'pinned' (a click or tap) stays open until Escape, an outside
  // press or a second click. A click used to toggle a popover that hover or focus had just opened,
  // so it closed at once, and touch users could never open it.
  const [open, setOpen] = useState<false | 'hover' | 'focus' | 'pinned'>(false);
  const id = useId();
  const lang = useLang();
  const ref = useRef<HTMLSpanElement>(null);
  const g = term ? GLOSSARY.find((x) => x.id === term) : undefined;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDoc = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDoc);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDoc); };
  }, [open]);
  const heading = title ?? (g ? (lang === 'he' ? g.nameHe : `${g.nameEn} (${g.nameHe})`) : '');
  return (
    <span className="info" ref={ref}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen((o) => o || 'hover'); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen((o) => (o === 'hover' ? false : o)); }}>
      <button type="button" aria-label={heading || 'info'} aria-expanded={!!open} aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => (o === 'pinned' ? false : 'pinned'))}
        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setOpen((o) => o || 'focus'); }}
        onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen((o) => (o === 'hover' ? o : false)); }}>i</button>
      {open && (
        <span className="pop" role="tooltip" id={id} ref={(el) => {
          if (!el) return;
          el.style.transform = '';
          const r = el.getBoundingClientRect(); const vw = document.documentElement.clientWidth;
          const dx = r.right > vw - 8 ? vw - 8 - r.right : r.left < 8 ? 8 - r.left : 0;
          if (dx) el.style.transform = `translateX(${dx}px)`;
        }}>
          {heading && <b>{heading}</b>}
          {g && <span>{lang === 'he' ? g.defHe : g.defEn}</span>}
          {g && <GlossaryLink g={g} lang={lang} />}
          {children}
        </span>
      )}
    </span>
  );
}

export function Slip({ letters, color, size, logo }: { letters: string; color: string; size?: 'sm' | 'lg'; logo?: LogoRef }) {
  const lang = useLang();
  const label = `${lang === 'he' ? 'אותיות הפתק' : 'ballot letters'} ${letters}`;
  // the logo the list used at this election, when a freely licensed copy is held; the ballot letters stay
  // as its accessible name and a small caption, and the credit travels with the image
  if (logo) return (
    <span className={`slip logo ${size ?? ''} ${logo.background === 'dark' ? 'on-dark' : ''}`} style={{ ['--c' as string]: color }} aria-label={label}
      title={`${logo.attribution} · ${logo.licence}`}>
      <img src={logo.file} alt="" loading="lazy" decoding="async" />
      <span className="slip-letters" lang="he" dir="rtl" aria-hidden>{letters}</span>
    </span>
  );
  return <span className={`slip ${size ?? ''}`} style={{ ['--c' as string]: color }} aria-label={label} lang="he" dir="rtl">{letters || '—'}</span>;
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <span className="seg" role="group" aria-label={label}>
      {options.map((o) => <button key={o.v} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </span>
  );
}

export function Delta({ v, suffix = '' }: { v: number; suffix?: string }) {
  if (v === 0) return <span className="muted" dir="ltr" style={{ unicodeBidi: 'isolate' }}>±0{suffix}</span>;
  return <span className={v > 0 ? 'up' : 'down'} dir="ltr" style={{ unicodeBidi: 'isolate' }}>{v > 0 ? '▲ +' : '▼ −'}{Math.abs(v).toLocaleString('en-US')}{suffix}</span>;
}

export function Tile({ k, v, d, term, children }: { k: string; v: ReactNode; d?: ReactNode; term?: string; children?: ReactNode }) {
  return (
    <div className="tile">
      <div className="k">{k}{(term || children) && <Info term={term} title={term ? undefined : k}>{children}</Info>}</div>
      <div className="v">{v}</div>
      {d && <div className="d">{d}</div>}
    </div>
  );
}

export function NumberInput({ value, onCommit, label, width }: { value: number; onCommit: (n: number) => void; label: string; width?: number }) {
  const [text, setText] = useState(value.toLocaleString('en-US'));
  const L = useL();
  const [commits, setCommits] = useState(0);
  // Resync after the parent has processed the commit, even when it rejects the edit and
  // leaves value unchanged. Resetting to the old prop inside commit can race a later blur.
  useEffect(() => setText(value.toLocaleString('en-US')), [value, commits]);
  const commit = () => {
    const t = text.replace(/[,\s_]/g, '');
    const n = Number(t);
    if (t !== '' && /^\d+$/.test(t) && Number.isSafeInteger(n) && n !== value) onCommit(n);
    setCommits((c) => c + 1);
  };
  return (
    <input type="text" inputMode="numeric" className="num-in" aria-label={label} title={L('Whole number ≥ 0; press Enter to apply', 'מספר שלם ≥ 0; Enter להחלה')}
      style={width ? { width } : undefined} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setText(value.toLocaleString('en-US')); }} />
  );
}

/** Decimal field (e.g. a percentage) that commits on Enter or blur; shows the live value otherwise. */
export function DecimalInput({ value, onCommit, label, digits = 2, width = 84 }: { value: number; onCommit: (n: number) => void; label: string; digits?: number; width?: number }) {
  const shown = Number.isFinite(value) ? value.toFixed(digits) : '';
  const [text, setText] = useState(shown);
  const [editing, setEditing] = useState(false);
  const [commits, setCommits] = useState(0);
  useEffect(() => { if (!editing) setText(shown); }, [shown, editing, commits]);
  const commit = () => {
    setEditing(false);
    const n = Number(text.replace(/[%\s,]/g, ''));
    if (text.trim() !== '' && Number.isFinite(n) && text !== shown) onCommit(n);
    setCommits((c) => c + 1);
  };
  return (
    <input type="text" inputMode="decimal" className="num-in" aria-label={label} style={{ width }} value={text}
      onFocus={(e) => { setEditing(true); e.target.select(); }} onChange={(e) => setText(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setText(shown); setEditing(false); } }} />
  );
}

const niceCeil = (n: number) => { const p = 10 ** Math.max(0, Math.floor(Math.log10(Math.max(1, n))) - 1); return Math.ceil(n / p) * p; };

/** Vote slider with a fixed scale (twice the historical votes or the threshold, whichever is larger),
 *  so the thumb tracks the pointer. Dragging previews the value; the change is applied once, on release. */
export function VoteSlider({ l, hist, thr, onCommit }: { s?: unknown; l: { id: string; votes: number }; hist: number; thr: number; onCommit: (v: number) => void }) {
  const L = useL();
  const [drag, setDrag] = useState<number | null>(null);
  const [scale] = useState(() => niceCeil(Math.max(hist * 2, thr * 2, 20_000)));
  const max = Math.max(scale, l.votes);
  const value = drag ?? l.votes;
  const commit = () => { if (drag !== null) { const v = drag; setDrag(null); if (v !== l.votes) onCommit(v); } };
  const step = Math.max(1, Math.round(max / 2000));
  return (
    <div style={{ marginTop: 6 }}>
      <input type="range" min={0} max={max} step={step} value={value} aria-label={L('Votes slider', 'מחוון קולות')}
        aria-valuetext={`${value.toLocaleString('en-US')}`}
        onChange={(e) => setDrag(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} onTouchEnd={commit} />
      <div className="row tiny muted" style={{ justifyContent: 'space-between' }}>
        <span>0</span>
        {drag !== null ? <b className="ink2">→ {drag.toLocaleString('en-US')}</b> : <span>{L('drag, then release to apply', 'גררו ושחררו כדי להחיל')}</span>}
        <span>{max.toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

/** Text field that applies on Enter or blur (one undo step per edit, not per keystroke). */
export function TextField({ value, onCommit, label, placeholder }: { value: string; onCommit: (v: string) => void; label?: string; placeholder?: string }) {
  const [text, setText] = useState(value);
  const [commits, setCommits] = useState(0);
  useEffect(() => setText(value), [value, commits]);
  // after committing, show the value actually in force (a rejected edit reverts)
  const commit = () => { if (text !== value) onCommit(text); setCommits((c) => c + 1); };
  return <input type="text" aria-label={label} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit}
    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setText(value); }} />;
}

/** "Learn more" link for a glossary term, in the interface language, with its publisher. Terms that
 *  describe the app's own tools or an inferred procedure say so, since the link is only background. */
export function GlossaryLink({ g, lang }: { g: GlossaryTerm; lang: 'he' | 'en' }) {
  const link = lang === 'he' ? g.linkHe : g.linkEn;
  const note = g.provenance === 'app' ? (lang === 'he' ? 'מתאר כלי של היישום; הקישור לרקע בלבד.' : 'Describes a tool in this app; the link is background only.')
    : g.provenance === 'inferred' ? (lang === 'he' ? 'הנוסח המחייב לא אותר; ההליך מוסק מהתוצאה הרשמית.' : 'The governing text was not located; the procedure is inferred from the official result.') : null;
  return (
    <span className="glossary-link">
      {note && <i className="muted">{note} </i>}
      <a href={link.url} target="_blank" rel="noreferrer">{lang === 'he' ? 'למידע נוסף' : 'Learn more'}: {link.title}</a>
      <span className="muted"> · {link.publisher}</span>
    </span>
  );
}
