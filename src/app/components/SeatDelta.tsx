import type { ReactNode } from 'react';
import type { Rational } from '../../engine/rational.ts';
import { arrowOf, fmtInt, PP, seatDeltaText } from '../format.ts';
import { useL } from '../i18n.ts';
import { points, rationalPoints } from './Percentage.tsx';
import './seat-delta.css';

// A change the reader can place at a glance is one compact mark: a green ▲ and the number for up, a red ▼ and the
// number for down ("▲4", "▼1", "▼0.42 pts"). The arrow carries the direction, so no plus or minus sign is added and
// the colour is never the only cue. Marks read left to right in Hebrew too (graphics never mirror; owner, 26 Nov 2026).

/** The coloured frame of every change mark; `title`: the sentence behind it, for a mark that needs one. */
export function ChangeMark({ sign, title, className = '', children }: { sign: number; title?: string; className?: string; children: ReactNode }) {
  return <bdi dir="ltr" className={`seat-delta ${className}`.trim()} data-sign={Math.sign(sign)} title={title}>{arrowOf(sign)}{children}</bdi>;
}

/** A change in seats: "▲4", "▼1", "±0". */
export function SeatDelta({ value, title }: { value: number; title?: string }) {
  return <bdi dir="ltr" className="seat-delta" data-sign={Math.sign(value)} title={title}>{seatDeltaText(value)}</bdi>;
}

/** A change in a count (votes, voters, ballot boxes): "▲543,177", "▼1,200". */
export function CountDelta({ value, title }: { value: number; title?: string }) {
  return <ChangeMark sign={value} title={title}>{value === 0 ? '±0' : fmtInt(Math.abs(value))}</ChangeMark>;
}

/** A change in percentage points, held as a float or exactly: "▼0.42 pts" (Hebrew "▼0.42 נק׳ אחוז"). The unit stays
 *  inside the coloured mark; the exact value is one tap away, as for every rounded figure. */
export function PointsDelta({ value, digits, title, className = '' }: { value: number | Rational; digits: number; title?: string; className?: string }) {
  const L = useL();
  const sign = typeof value === 'number' ? Math.sign(value) : Number(value.num > 0n) - Number(value.num < 0n);
  return <span className={`seat-delta ${className}`.trim()} data-sign={sign} title={title}>
    <bdi dir="ltr">{arrowOf(sign)}{typeof value === 'number' ? points(value, digits, true) : rationalPoints(value, digits, true)}</bdi> {L(...PP)}
  </span>;
}

/** Several lists' seat changes as marks, "Likud ▲1 · Ra'am ▼1", gainers first; `title`: the same as a sentence. */
export function SeatMoves({ moves, name, title }: { moves: { id: string; d: number }[]; name: (id: string) => string; title?: string }) {
  const sorted = [...moves].sort((a, b) => b.d - a.d);
  return <span className="seat-moves" title={title}>{sorted.map((m, i) => <span key={m.id}>{i > 0 && ' · '}<bdi>{name(m.id)}</bdi> <SeatDelta value={m.d} /></span>)}</span>;
}
