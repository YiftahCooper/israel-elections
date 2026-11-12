import './percentage.css';
import type { Rational } from '../../engine/rational.ts';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { exactDecimal, fmtPct, fmtPp, nonZeroFixed, pctExactNote } from '../format.ts';
import { useLang } from '../i18n.ts';
import { Floating } from '../floating.tsx';
import { useHoverIntent } from '../hoverIntent.ts';
import { useSetting } from '../store.ts';

// The one way a rounded percentage reaches the screen (tests/percentage-boundary.test.ts enforces it). A rounded
// value discloses its exact value on hover (when Settings → Popups on hover is on), keyboard focus or tap, at every
// decimal cap; a value already shown in full discloses nothing. The disclosure floats in the top layer, so the value
// itself never changes size. Inside a button or link the value is not a second tab stop: focusing that control
// shows the disclosure of its first rounded value instead.

type Props = { svg?: boolean; pad?: number };

/** A share of part in whole (fmtPct: at most `digits` decimals, threshold-safe). `pad` keeps decimal points aligned
 *  in a table column by reserving invisible zeros up to that many decimals. `svg` renders a tspan for chart text. */
export function Percentage({ part, whole, digits = 2, threshold, ...rest }: { part: number | bigint; whole: number | bigint; digits?: number; threshold?: string } & Props) {
  const lang = useLang();
  return <ExactValue text={fmtPct(part, whole, digits, threshold)} note={pctExactNote(part, whole, digits, threshold, lang)} {...rest} />;
}

const INTERACTIVE = 'button, a[href], [role="button"], summary, label';
const PAD = /^(\d[\d,]*)(?:\.(\d+))?%$/;

export function ExactValue({ text, note, svg = false, pad }: { text: string; note?: string } & Props) {
  const hover = useSetting('hoverPopups');
  // 'hover' is transient; 'held' (focus or tap) was asked for, so Escape closes it and goes no further
  const [open, setOpen] = useState<false | 'hover' | 'held'>(false);
  const [nested, setNested] = useState(false);
  const intent = useHoverIntent(() => setOpen(o => o === 'hover' ? false : o), !!open);
  const ref = useRef<HTMLSpanElement | SVGTSpanElement | null>(null), id = useId();
  // inside a control: show on that control's keyboard focus, for its first rounded value only
  useEffect(() => {
    const host = note ? ref.current?.parentElement?.closest(INTERACTIVE) : null;
    setNested(!!host);
    if (!host) return;
    const first = () => host.querySelector('[data-rounded]') === ref.current;
    const show = () => { if (first() && host.matches(':focus-visible')) setOpen('held'); }, hide = () => setOpen(false);
    host.addEventListener('focus', show); host.addEventListener('blur', hide);
    return () => { host.removeEventListener('focus', show); host.removeEventListener('blur', hide); };
  }, [note]);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.type === 'keydown') { if ((e as KeyboardEvent).key !== 'Escape') return; if (open === 'held') e.stopImmediatePropagation(); }
      if (e.type === 'pointerdown' && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close, true); document.addEventListener('keydown', close, true);
    return () => { document.removeEventListener('pointerdown', close, true); document.removeEventListener('keydown', close, true); };
  }, [open]);
  const m = pad !== undefined && !svg ? PAD.exec(text) : null;
  const missing = m ? pad! - (m[2]?.length ?? 0) : 0;
  // the reserve follows the % sign, so the digits line up and the sign stays beside its number
  const body = m && missing > 0 ? <>{text}<span className="pct-pad" aria-hidden>{m[2] === undefined ? '.' : ''}{'0'.repeat(missing)}</span></> : text;
  if (!note) return svg ? <tspan className="percentage">{text}</tspan> : <span className="percentage">{body}</span>;
  const props = {
    ref: (el: HTMLSpanElement | SVGTSpanElement | null) => { ref.current = el; },
    className: 'percentage', 'data-rounded': '', 'aria-describedby': open ? id : undefined,
    tabIndex: nested ? undefined : 0,
    onPointerEnter: (e: React.PointerEvent) => { if (hover && e.pointerType === 'mouse') intent.enter(() => setOpen(o => o || 'hover')); },
    onPointerLeave: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') intent.leave(); },
    onFocus: () => { if (!nested) setOpen('held'); }, onBlur: () => { if (!nested) setOpen(false); },
    // a tap shows the value (and does not also activate a row it sits in); a mouse click passes through
    onClick: (e: React.MouseEvent) => { const p = (e.nativeEvent as PointerEvent).pointerType; if (p === 'touch' || p === 'pen') { e.stopPropagation(); e.preventDefault(); setOpen('held'); } },
    onKeyDown: (e: React.KeyboardEvent) => { if (!nested && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen('held'); } },
  };
  return <>
    {svg ? <tspan {...props}>{text}</tspan> : <span {...props}>{body}</span>}
    {open && createPortal(<Floating id={id} className="percentage-pop" anchor={() => ref.current?.getBoundingClientRect()}><ExactNote note={note} /></Floating>, document.body)}
  </>;
}

/** "33.333333…%: the exact share" or "+0.25 pp: …" → the figure isolated left to right, then the words in the
 *  page's direction (a figure never contains a space or a colon). */
function ExactNote({ note }: { note: string }) {
  const i = note.search(/[ :]/);
  return <span data-exact><bdi dir="ltr">{note.slice(0, i)}</bdi>{note.slice(i)}</span>;
}

export const percent = (part: number | bigint, whole: number | bigint, digits = 2, threshold?: string, opts: Props = {}) =>
  <Percentage part={part} whole={whole} digits={digits} threshold={threshold} {...opts} />;
/** A percentage that is already a number (an entered share, a computed float). */
export const percentNum = (value: number, digits = 2, opts: Props = {}) => Number.isFinite(value) ? percent(value, 100, digits, undefined, opts) : '—%';

const ppNote = (exact: string, lang: 'he' | 'en') => lang === 'he' ? `${exact} נק׳ אחוז: השינוי המדויק` : `${exact} pp: the exact change`;
/** A change in percentage points held as a float: signed, at most `digits` decimals, never a non-zero change as 0. */
export function PointValue({ value, digits = 2, unsigned = false }: { value: number; digits?: number; unsigned?: boolean }) {
  const lang = useLang();
  const shown = nonZeroFixed(Math.abs(value), digits);
  const sign = unsigned ? '' : value > 0 ? '+' : value < 0 ? '−' : '';
  // floats carry binary noise: the exact value is read to nine decimals and shown to six
  const exact = exactDecimal(BigInt(Math.round(Math.abs(value) * 1e9)), 1_000_000_000n);
  return <ExactValue text={sign + shown} note={exact === shown ? undefined : ppNote(sign + exact, lang)} />;
}
/** `unsigned` for a size that is never negative, such as a lead ("ahead by 25.6 pp"). */
export const points = (value: number, digits = 2, unsigned = false) => <PointValue value={value} digits={digits} unsigned={unsigned} />;

/** A change in percentage points held exactly (fmtPp). */
export function RationalPoints({ value, digits }: { value: Rational; digits: number }) {
  const lang = useLang();
  const text = fmtPp(value, digits);
  const sign = value.num > 0n ? '+' : value.num < 0n ? '−' : '';
  const exact = sign + exactDecimal(value.num < 0n ? -value.num : value.num, value.den);
  return <ExactValue text={text} note={exact === text ? undefined : ppNote(exact, lang)} />;
}
export const rationalPoints = (value: Rational, digits = 2) => <RationalPoints value={value} digits={digits} />;
