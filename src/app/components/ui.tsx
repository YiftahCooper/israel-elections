import { Floating, useHoverBridge } from '../floating.tsx';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY, useL, useLang, type GlossaryTerm } from '../i18n.ts';
import type { LogoRef } from '../../data/schema.ts';
import { parseIntInput } from '../format.ts';

/** Accessible info popover: opens on hover, focus or click; Escape closes. */
export function Info({ title, children, term }: { title?: string; children?: ReactNode; term?: string }) {
  // 'hover' and 'focus' are transient; 'pinned' (a click or tap) stays open until Escape, an outside
  // press or a second click. A click used to toggle a popover that hover or focus had just opened,
  // so it closed at once, and touch users could never open it.
  const [open, setOpen] = useState<false | 'hover' | 'focus' | 'pinned'>(false);
  const bridge = useHoverBridge(() => setOpen(o => o === 'hover' ? false : o));
  const id = useId();
  const lang = useLang();
  const ref = useRef<HTMLSpanElement>(null);
  const g = term ? GLOSSARY.find((x) => x.id === term) : undefined;
  useEffect(() => {
    if (!open) return;
    // Escape closes this popover only, not the panel or dialog around it
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); setOpen(false); } };
    const onDoc = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDoc);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDoc); };
  }, [open]);
  const heading = title ?? (g ? (lang === 'he' ? g.nameHe : `${g.nameEn} (${g.nameHe})`) : '');
  return (
    <span className="info" ref={ref}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') { bridge.cancel(); setOpen((o) => o || 'hover'); } }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') bridge.leave(); }}>
      <button type="button" aria-label={heading || 'info'} aria-expanded={!!open} aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => (o === 'pinned' ? false : 'pinned'))}
        onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setOpen((o) => o || 'focus'); }}
        onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen((o) => (o === 'hover' ? o : false)); }}>i</button>
      {open && (
        <Floating onPointerEnter={bridge.cancel} onPointerLeave={bridge.leave} className="pop" id={id} anchor={() => ref.current?.querySelector('button')?.getBoundingClientRect()}>
          {heading && <b>{heading}</b>}
          {g && <span>{lang === 'he' ? g.defHe : g.defEn}</span>}
          {g && <GlossaryLink g={g} lang={lang} />}
          {children}
        </Floating>
      )}
    </span>
  );
}

export function Slip({ letters, color, size, logo, name }: { name?: string; letters: string; color: string; size?: 'sm' | 'lg'; logo?: LogoRef }) {
  const lang = useLang();
  const label = name ?? `${lang === 'he' ? 'אותיות הפתק' : 'ballot letters'} ${letters}`;
  const year = logo?.year ? ` · ${logo.year}` : '';
  if (!logo && name) return <span className={`slip monogram ${size ?? ''}`} style={{ ['--c' as string]: color }} aria-label={name} title={lang === 'he' ? 'סמל לא זמין — ראשי תיבות ואותיות הפתק' : 'Logo unavailable — name monogram'}><span>{name.trim().split(/\s+/).length === 1 ? name.slice(0, 3).toUpperCase() : name.split(/\s+/).map(w => w[0]).slice(0,3).join('').toUpperCase()}</span>{lang === 'he' && <small lang="he" dir="rtl">{letters}</small>}</span>;
  // the logo the list used at this election, when a verified local copy is held; the ballot letters stay
  // as its accessible name and a small caption, and the credit travels with the image
  if (logo) return (
    <span className={`slip logo ${size ?? ''} ${logo.background === 'dark' ? 'on-dark' : ''}`} style={{ ['--c' as string]: color }} aria-label={label}
      title={`${label}${year} · ${logo.licence}`}>
      <img src={logo.file} alt="" loading="lazy" decoding="async" />
      <span className={`slip-letters ${logo.year ? 'logo-year' : ''}`} lang={logo.year ? undefined : "he"} dir={logo.year ? "ltr" : "rtl"} aria-hidden>{logo.year ?? (name ? '' : letters)}</span>
    </span>
  );
  return <span className={`slip ${size ?? ''} ${letters.length > 4 ? 'long' : ''}`} style={{ ['--c' as string]: color }} aria-label={label} lang="he" dir="rtl">{letters || '—'}</span>;
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <span className="seg" role="group" aria-label={label}>
      {options.map((o) => <button key={o.v} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </span>
  );
}

export function NumberInput({ disabled = false, value, onCommit, label, width }: { disabled?: boolean; value: number; onCommit: (n: number) => void; label: string; width?: number }) {
  const [text, setText] = useState(value.toLocaleString('en-US'));
  const L = useL();
  const [commits, setCommits] = useState(0);
  // a rejected entry (a negative, a fraction of a vote, words) is said, not silently swallowed
  const [invalid, setInvalid] = useState(false);
  // Resync after the parent has processed the commit, even when it rejects the edit and
  // leaves value unchanged. Resetting to the old prop inside commit can race a later blur.
  useEffect(() => setText(value.toLocaleString('en-US')), [value, commits]);
  const commit = () => {
    const n = parseIntInput(text);
    // re-committing the unchanged value (a blur after Enter) keeps the notice; only a new entry decides it
    if (text !== value.toLocaleString('en-US')) setInvalid(text.trim() !== '' && n === null);
    if (n !== null && n !== value) onCommit(n);
    setCommits((c) => c + 1);
  };
  return (
    <input disabled={disabled} type="text" inputMode="numeric" className="num-in" aria-label={label} aria-invalid={invalid || undefined}
      title={invalid ? L('Not applied: enter a whole number ≥ 0 (e.g. 125000 or 125k)', 'לא הוחל: יש להזין מספר שלם ≥ 0 (למשל 125000 או 125k)') : L('Whole number ≥ 0; press Enter to apply', 'מספר שלם ≥ 0; Enter להחלה')}
      style={width ? { width } : undefined} value={text} onChange={(e) => { setInvalid(false); setText(e.target.value); }} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape' && text !== value.toLocaleString('en-US')) { e.preventDefault(); e.stopPropagation(); setText(value.toLocaleString('en-US')); } }} />
  );
}

/** Decimal field (e.g. a percentage) that commits on Enter or blur; shows the live value otherwise. */
export function DecimalInput({ disabled = false, value, onCommit, label, digits = 2, width = 84 }: { disabled?: boolean; value: number; onCommit: (n: number) => void; label: string; digits?: number; width?: number }) {
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
    <input disabled={disabled} type="text" inputMode="decimal" className="num-in" aria-label={label} style={{ width }} value={text}
      onFocus={(e) => { setEditing(true); e.target.select(); }} onChange={(e) => setText(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape' && text !== shown) { e.preventDefault(); e.stopPropagation(); setText(shown); setEditing(false); } }} />
  );
}

/** Text field that applies on Enter or blur (one undo step per edit, not per keystroke). */
export function TextField({ disabled = false, value, onCommit, label, placeholder }: { disabled?: boolean; value: string; onCommit: (v: string) => void; label?: string; placeholder?: string }) {
  const [text, setText] = useState(value);
  const [commits, setCommits] = useState(0);
  useEffect(() => setText(value), [value, commits]);
  // after committing, show the value actually in force (a rejected edit reverts)
  const commit = () => { if (text !== value) onCommit(text); setCommits((c) => c + 1); };
  return <input disabled={disabled} type="text" aria-label={label} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit}
    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape' && text !== value) { e.preventDefault(); e.stopPropagation(); setText(value); } }} />;
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

/** Both labels reserve their width so expanding content cannot move its trigger. */
export function DisclosureToggle({ open, onToggle, more, fewer }: { open: boolean; onToggle: () => void; more: string; fewer: string }) {
  return <button type="button" className="btn small list-disclosure" aria-expanded={open} onClick={onToggle}><span>{open ? fewer : more}</span><span className="reserve" aria-hidden data-label={open ? more : fewer} /></button>;
}
