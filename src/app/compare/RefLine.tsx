// The Lists panel while comparing: each list's line ("2022: 32 ▼ −5 · Likud"), its screen-reader words, the legend for
// the two bars and the folded group of reference lists with no list now.
import { useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { SeatDelta } from '../components/SeatDelta.tsx';
import type { RefLine as Line, RefRows } from './listRows.ts';

const now = (line: Line, r: AllocationResult) => line.together.reduce((t, id) => t + (r.lists.find((l) => l.id === id)?.seats ?? 0), 0);

export function RefLine({ line, label, r }: { line: Line; label: string; r: AllocationResult }) {
  const L = useL();
  if (line.kind === 'new') return <span className="cmpm-line" data-kind="new"><bdi>{label}</bdi>: {L('no list of its own (new)', 'ללא רשימה משלה (חדשה)')}</span>;
  if (line.kind === 'check') return <span className="cmpm-line" data-kind="check"><bdi>{label}</bdi>: <span className="ph-cert ph-cert-unknown">{L('To verify', 'לבדיקה')}</span> · <bdi>{line.names}</bdi></span>;
  return <>
    <span className="cmpm-line" data-kind={line.tag}><bdi>{label}</bdi>: <b>{line.seats}</b> <SeatDelta value={now(line, r) - line.seats} />
      {(line.names || line.how) && <span className="muted"> · {line.names && <bdi>{line.names}</bdi>}{line.names && line.how ? ' ' : ''}{line.how}</span>}</span>
    {line.notCounted.length > 0 && <span className="cmpm-line tiny muted">{line.notCounted.join(' ')}</span>}
  </>;
}

/** ", 2022: 32 seats, 5 fewer, compared with Likud" */
export function refLineText(line: Line, label: string, r: AllocationResult, lang: 'he' | 'en'): string {
  const en = lang === 'en';
  if (line.kind === 'new') return en ? `, ${label}: no list of its own` : `, ${label}: ללא רשימה משלה`;
  if (line.kind === 'check') return en ? `, ${label}: to verify, ${line.names}` : `, ${label}: לבדיקה, ${line.names}`;
  const d = now(line, r) - line.seats;
  const change = d === 0 ? (en ? 'unchanged' : 'ללא שינוי') : en ? `${Math.abs(d)} ${d > 0 ? 'more' : 'fewer'}` : `${Math.abs(d)} ${d > 0 ? 'יותר' : 'פחות'}`;
  return en ? `, ${label}: ${line.seats} seats (${change})${line.names ? `, compared with ${line.names}` : ''}${line.how ? ` ${line.how}` : ''}`
    : `, ${label}: ${line.seats} מנדטים (${change})${line.names ? `, בהשוואה ${hebrewPrefix('ל', line.names)}` : ''}${line.how ? ` ${line.how}` : ''}`;
}

/** "▬ 2026 ▨ 2022" above the lists, when the reference bars are drawn. */
export function RefLegend({ work, label }: { work: string; label: string }) {
  const L = useL();
  return <p className="cmpm-legend tiny" aria-label={L(`Bars: ${work} solid, ${label} striped`, `עמודות: ${work} מלאה, ${label} מפוספסת`)}>
    <span aria-hidden className="cmpm-key-now" /> <bdi>{work}</bdi> <span aria-hidden className="cmpm-key-ref" /> <bdi>{label}</bdi>
  </p>;
}

/** The reference's lists that have no list in your work, folded at the bottom ("In 2022 only"). */
export function RefOnly({ rows, label }: { rows: RefRows; label: string }) {
  const L = useL(), lang = useLang();
  const [open, setOpen] = useState(false);
  const n = rows.only.length + rows.onlySmall;
  if (!n) return null;
  return <details className="cmpm-only" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
    <summary>{L(`In ${label} only`, `רק ${hebrewPrefix('ב', label)}`)} <span className="muted">· {n}</span></summary>
    <ul>
      {rows.only.map((x) => <li key={x.id}><bdi className="cmpm-only-name">{x.name}</bdi>
        <span className="muted" dir="ltr">{fmtInt(x.votes)}</span><b>{x.seats}</b></li>)}
    </ul>
    {rows.onlySmall > 0 && <p className="tiny muted">{lang === 'he' ? `ועוד ${rows.onlySmall} רשימות קטנות (פחות מ-0.5% ובלי מנדט).` : `And ${rows.onlySmall} smaller lists (under 0.5%, no seat).`}</p>}
  </details>;
}
