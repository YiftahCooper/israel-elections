// Party history and "compared with last time" (docs/features/party-history.md). Facts, not edits: nothing here
// changes a result or marks a scenario. Graphics are always drawn left to right, in Hebrew too.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Certainty } from '../../data/evidence.ts';
import { comparablePredecessor, leadOf, officialFacts, partiesOf, scenarioFacts, type Comparison } from '../../history/compare.ts';
import { erasOf, eventsOf, identityOf, partySeries, type Identity, type SeriesPoint } from '../../history/identity.ts';
import { OPEN_CHECKS, type Relation } from '../../history/relations.ts';
import { HISTORY, electionIndex, electionPosition, historyList, listShort, partyNameAt, partyShort, yearLabel, type HList } from '../../history/runtime.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { hebrewPrefix as attach } from '../hebrewPrefix.ts';
import { useDigits, useLevel, useSetting } from '../store.ts';
import { Info, Slip } from './ui.tsx';
import { SeatDelta } from './SeatDelta.tsx';
import { percent, rationalPoints } from './Percentage.tsx';
import './party-history.css';

type Lang = 'he' | 'en';
/** A Hebrew prefix on a name: after ל, ב or כ the definite article ה is absorbed (לדמוקרטים, לעבודה); מ and ו keep it. */
const hebrewPrefix = (p: Parameters<typeof attach>[0], name: string | number) =>
  (p === 'ל' || p === 'ב' || p === 'כ') && /^ה[א-ת]/.test(String(name)) ? `${p}${String(name).slice(1)}` : attach(p, name);
const CERT: Record<Certainty, [string, string]> = {
  confirmed: ['Confirmed', 'מאושר'], probable: ['Probable', 'סביר'], provisional: ['Provisional', 'ראשוני'], disputed: ['Disputed', 'שנוי במחלוקת'], unknown: ['To verify', 'לבדיקה'],
};
const CERT_INFO: Record<Certainty, [string, string]> = {
  confirmed: ['An official record, or independent reports with scholarship.', 'רשומה רשמית, או דיווחים בלתי תלויים לצד מחקר.'],
  probable: ['Scholarship or two independent reports support it; the official record is not yet in hand.', 'נתמך במחקר או בשני דיווחים בלתי תלויים; הרשומה הרשמית טרם נבדקה.'],
  provisional: ['One report only. Shown, never used to compare.', 'דיווח אחד בלבד. מוצג, ואינו משמש להשוואה.'],
  disputed: ['Reliable sources disagree. Shown, never used to compare.', 'מקורות מהימנים חלוקים. מוצג, ואינו משמש להשוואה.'],
  unknown: ['Not yet established. Shown, never used to compare.', 'טרם בוסס. מוצג, ואינו משמש להשוואה.'],
};
export function CertChip({ c }: { c: Certainty }) {
  const L = useL();
  return <span className={`ph-cert ph-cert-${c}`} title={L(...CERT_INFO[c])}>{L(...CERT[c])}</span>;
}

/** Parties' names; with an election index, the names they ran under at that election. */
const names = (ids: string[], lang: Lang, i?: number) => {
  const n = ids.map((p) => i === undefined ? partyShort(p, lang) : partyNameAt(p, i, lang));
  if (n.length < 2) return n.join('');
  return lang === 'he' ? `${n.slice(0, -1).join(', ')} ${hebrewPrefix('ו', n[n.length - 1])}` : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
};
/** One event, in words. Split and faction-split point from the parent to the departing party. */
export function eventText(r: Relation, lang: Lang): string {
  const f = names(r.from, lang), t = names(r.to, lang), en = lang === 'en';
  /** Hebrew verb agreement: one party (feminine singular) or several (plural) */
  const v = (ids: string[], one: string, many: string) => ids.length > 1 ? many : one;
  switch (r.kind) {
    case 'renamed-to': return en ? `${f} renamed ${t}` : `${f} ${v(r.from, 'שינתה את שמה', 'שינו את שמן')} ${hebrewPrefix('ל', t)}`;
    case 'merged-into':
      if (r.stage === 'announced') return en ? `Union of ${f} into ${t} announced` : `הוכרז איחוד ${f} ${hebrewPrefix('ל', t)}`;
      if (r.stage === 'approved') return en ? `Union of ${f} into ${t} approved by a party body` : `איחוד ${f} ${hebrewPrefix('ל', t)} אושר במוסד מפלגתי`;
      return en ? `${f} merged into ${t}` : `${f} ${v(r.from, 'התאחדה', 'התאחדו')} ${hebrewPrefix('ל', t)}`;
    case 'absorbed-into': return en ? `${f} joined ${t}` : `${f} ${v(r.from, 'הצטרפה', 'הצטרפו')} ${hebrewPrefix('ל', t)}`;
    case 'split-from': return en ? `${t} split from ${f}` : `${t} ${v(r.to, 'התפצלה', 'התפצלו')} ${hebrewPrefix('מ', f)}`;
    case 'faction-split': return en ? `Knesset faction split: ${t} left ${f}` : `פילוג סיעה בכנסת: ${t} ${v(r.to, 'פרשה', 'נפרדו')} ${hebrewPrefix('מ', f)}`;
    case 'same-organisation': return en ? `${f} and ${t}: one organisation` : `${f} ${hebrewPrefix('ו', t)}: אותו ארגון`;
    default: return en ? `${f} → ${t}` : `${f} ← ${t}`;
  }
}
const KIND_WORD: Partial<Record<Relation['kind'], [string, string]>> = {
  'renamed-to': ['Renamed', 'שם חדש'], 'merged-into': ['Merged', 'איחוד'], 'absorbed-into': ['Joined', 'הצטרפות'], 'split-from': ['Split', 'פילוג'], 'faction-split': ['Faction split', 'פילוג סיעה'],
};
const kindWord = (r: Relation, L: (en: string, he: string) => string) => r.kind === 'merged-into' && (r.stage === 'announced' || r.stage === 'approved') ? L('Union agreed', 'הסכם איחוד') : L(...(KIND_WORD[r.kind] ?? ['Event', 'אירוע']));
const year = (d: string) => d.slice(0, 4);
const dateText = (r: Relation) => r.dateTo ? `${year(r.date)}–${year(r.dateTo).slice(2)}` : year(r.date);

function Evidence({ r }: { r: Relation }) {
  const L = useL(), lang = useLang();
  const { expert } = useLevel();
  return <Info title={L('Evidence', 'ראיות')} label={L(`Evidence: ${eventText(r, 'en')}`, `ראיות: ${eventText(r, 'he')}`)}>
    <span className="ph-why">
      <span>{eventText(r, lang)} · <CertChip c={r.certainty} /></span>
      {r.sources.length > 0 && <span className="ph-src">{r.sources.map((s) => <span key={s.id}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.publisher ?? s.url}</a> : (s.publisher ?? s.locator ?? s.id)}
        {expert && lang === 'en' && s.support ? <span className="tiny muted"> · {s.support}</span> : null}</span>)}</span>}
      {!r.sources.some((s) => s.url) && <span className="tiny muted">{L('Recorded in this project’s data files.', 'רשום בקובצי הנתונים של הפרויקט.')}</span>}
    </span>
  </Info>;
}

/** A relation's sources as links (the same evidence as its (i)), for places that are already inside a popover. */
export function EvidenceLinks({ r }: { r: Relation }) {
  const L = useL();
  if (!r.sources.length) return <span className="tiny muted">{L('Recorded in this project’s data files.', 'רשום בקובצי הנתונים של הפרויקט.')}</span>;
  return <span className="tiny ph-srcline">{L('Sources: ', 'מקורות: ')}{r.sources.map((s, k) => <span key={s.id}>{k ? '; ' : ''}{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.publisher ?? s.url}</a> : (s.publisher ?? s.locator ?? s.id)}</span>)}</span>;
}
/** "Labor (4 seats) and Meretz (0 seats)": the whole earlier lists a comparison counts, with their seats. */
export function countedText(c: Comparison, lang: Lang): string {
  const n = c.counted.map((M) => { const h = prevList(c, M.id); return `${h ? listShort(h, lang) : M.id} (${lang === 'he' ? M.seats === 1 ? 'מנדט אחד' : `${M.seats} מנדטים` : `${M.seats} seat${M.seats === 1 ? '' : 's'}`})`; });
  if (n.length < 2) return n.join('');
  return lang === 'he' ? `${n.slice(0, -1).join(', ')} ${hebrewPrefix('ו', n[n.length - 1])}` : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}
export { CERT_INFO, year as relationYear };

/** Measures an element's width for the SVG charts (they are drawn at real size, so text never scales). */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.floor(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// ---------- the chart (generic: a party's history now, a person's later) ----------
export interface Bar {
  i: number;
  /** nothing ran: before the first run or after the last nothing is drawn; between runs a dot marks the gap */
  absent: boolean;
  value: number;
  /** the subject's own part, drawn solid; the rest of the bar is hatched (a joint list's partners) */
  solid: number;
  /** dashed outline: the subject ran inside another party's list */
  inside: boolean;
  color: string;
  label: string;
  /** for a share: the exact part and whole, so the label discloses its exact value */
  part?: [number, number];
}
/** A dated event drawn on the chart: `word` is its kind ("Merged"), `text` the whole sentence, `n` its number in the list. */
export interface ChartEvent { key: string; date: string; certainty: Certainty; word: string; text: string; n: number }

const certRank: Record<Certainty, number> = { confirmed: 4, probable: 3, provisional: 2, disputed: 1, unknown: 0 };
/** "Merged", "Merged (probable)": the certainty word whenever it is not Confirmed, as in the comparison line. */
const flagWord = (e: ChartEvent, L: (en: string, he: string) => string) => e.certainty === 'confirmed' ? e.word : `${e.word} (${L(...CERT[e.certainty]).toLocaleLowerCase()})`;
/** Rough text width at the chart's 10.5px font (Hebrew and Latin alike). */
const textW = (s: string) => s.length * 5.9 + 4;

export function HistoryChart({ bars, eras, events, selected, onSelect, compact, width, height, label, unit, phone }: {
  bars: Bar[]; eras: { from: number; to: number; name: string }[]; events: ChartEvent[]; selected: number | null; onSelect: (i: number) => void;
  compact?: boolean; width: number; height: number; label: string; unit: 'seats' | 'share'; phone?: boolean;
}) {
  const lang = useLang(), L = useL(), digits = Math.min(1, useDigits());
  const ml = compact ? 4 : 30, mr = 8;
  const n = bars.length, slotW = (width - ml - mr) / n;
  const x = (i: number) => ml + i * slotW + slotW / 2;
  // events that would touch are drawn as one (Merged · Faction split)
  const groups = useMemo(() => {
    const g: { x: number; items: ChartEvent[] }[] = [];
    for (const e of [...events].sort((a, b) => a.date.localeCompare(b.date))) {
      const ex = Math.min(width - mr - 2, Math.max(ml + 2, ml + electionPosition(e.date) * slotW + slotW / 2));
      const last = g[g.length - 1];
      if (last && ex - last.x < (compact ? 4 : 7)) last.items.push(e); else g.push({ x: ex, items: [e] });
    }
    return g.map((gr) => {
      const words = [...new Set(gr.items.map((e) => flagWord(e, L)))];
      const worst = gr.items.reduce((w, e) => certRank[e.certainty] < certRank[w.certainty] ? e : w, gr.items[0]);
      return { ...gr, worst, words: words.join(' · '), nums: gr.items.map((e) => e.n).join(','), title: gr.items.map((e) => `${year(e.date)} · ${e.text} · ${L(...CERT[e.certainty])}`).join('\n') };
    });
  }, [events, width, compact, L]); // eslint-disable-line react-hooks/exhaustive-deps
  // flags: each on the first row where it touches nothing (A, B: words; C: numbers)
  // words when every flag fits in three rows; otherwise each event's number in the list below (phones, busy histories)
  const place = (nums: boolean) => {
    const ends: number[] = []; let fits = true;
    const out = groups.map((g) => {
      const text = nums ? g.nums : g.words;
      const w = nums ? Math.max(16, textW(text) + 4) : textW(text) + 6;
      const right = !nums && g.x + w > width - mr;
      const x0 = nums ? g.x - w / 2 : right ? g.x - w : g.x, x1 = x0 + w;
      let row = ends.findIndex((e) => x0 > e + 3);
      if (row < 0) { if (ends.length < 3) row = ends.length; else { fits = false; row = ends.indexOf(Math.min(...ends)); } }
      ends[row] = x1;
      return { ...g, text, w, x0, row };
    });
    return { out, fits };
  };
  const words = useMemo(() => place(false), [groups, width]); // eslint-disable-line react-hooks/exhaustive-deps
  const nums = !words.fits;
  const placed = useMemo(() => nums ? place(true).out : words.out, [nums, words, groups, width]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = compact || !groups.length ? 0 : Math.max(...placed.map((p) => p.row)) + 1;
  const rowH = nums ? 19 : 16;
  const mt = compact ? 14 : 18 + rows * rowH;
  const strip = compact ? 0 : 20, xl = 15;
  const H = height - mt - xl - strip - 4;
  const bw = Math.max(3, Math.min(26, slotW * 0.68));
  const top = (() => { const m = Math.max(1, ...bars.map((b) => b.value)); const step = unit === 'seats' ? (m > 40 ? 20 : m > 16 ? 10 : 5) : (m > 30 ? 10 : 5); return { max: Math.ceil(m / step) * step || step, step }; })();
  const y = (val: number) => mt + H - (val / top.max) * H;
  const present = bars.filter((b) => !b.absent);
  const first = present[0]?.i ?? 0, last = present[present.length - 1]?.i ?? n - 1;
  const best = present.reduce<Bar | undefined>((m, b) => !m || b.value > m.value ? b : m, undefined);
  const labelled = (b: Bar) => compact || phone ? b === best || b.i === last || b.i === selected : true;
  const every = compact ? 6 : phone ? 4 : 1;
  const pid = `ph${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const move = (d: number) => { const order = present.map((b) => b.i); const at = order.indexOf(selected ?? -1); const next = order[Math.min(order.length - 1, Math.max(0, (at < 0 ? 0 : at) + d))]; if (next !== undefined) onSelect(next); };
  const yearShown = (i: number) => i === selected || (i % every === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < every && every > 1) && !(selected !== null && (compact || phone) && Math.abs(i - selected) * slotW < 26 && i !== selected);
  const lineTop = (p: typeof placed[number]) => compact ? mt - 6 : 18 + p.row * rowH + (nums ? 7 : 6);
  return (
    <svg className={`ph-chart ${compact ? 'compact' : ''}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} direction="ltr" role={compact ? 'img' : 'group'} aria-label={label}
      onKeyDown={compact ? undefined : (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } else if (e.key === 'Home') { e.preventDefault(); onSelect(first); } else if (e.key === 'End') { e.preventDefault(); onSelect(last); } }}>
      <defs>{present.map((b) => <pattern key={b.i} id={`${pid}-${b.i}`} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="5" height="5" fill={b.color} opacity=".18" /><path d="M0 0V5" stroke={b.color} strokeWidth="2.2" /></pattern>)}</defs>
      {/* the selected election: a soft band behind its column and its year; its value and year in bold */}
      {selected !== null && bars[selected] && <rect className="ph-selband" x={x(selected) - slotW / 2 + 0.5} y={compact ? mt - 4 : mt - 6} width={slotW - 1} height={H + (compact ? 4 : 6) + xl + 1} rx={3} />}
      {!compact && Array.from({ length: top.max / top.step + 1 }, (_, k) => k * top.step).map((val) => <g key={val}>
        <line x1={ml} x2={width - mr} y1={y(val)} y2={y(val)} className="ph-grid" />
        <text x={ml - 4} y={y(val) + 3.5} className="ph-axis" textAnchor="end">{unit === 'share' ? `${val}%` : val}</text></g>)}
      {compact && <line x1={ml} x2={width - mr} y1={y(0)} y2={y(0)} className="ph-grid" />}
      {/* events behind the bars: a line at the event's place between two elections */}
      {placed.map((p) => { const weak = certRank[p.worst.certainty] < certRank.probable;
        return <g key={p.items[0].key} className={`ph-evmark ${weak ? 'weak' : ''}`}><line x1={p.x} x2={p.x} y1={lineTop(p)} y2={y(0)} className="ph-evline" />
          {compact && <circle cx={p.x} cy={lineTop(p)} r={2.4} className="ph-evcap" />}</g>; })}
      {bars.map((b) => {
        const h = Math.max(0, y(0) - y(b.value)), sh = Math.max(0, Math.min(h, y(0) - y(b.solid)));
        const sel = b.i === selected;
        return <g key={b.i} className={`ph-bar ${sel ? 'sel' : ''}`} onClick={() => onSelect(b.i)} tabIndex={compact || b.absent ? -1 : sel || selected === null && b.i === last ? 0 : -1}
          role={compact ? undefined : 'button'} aria-pressed={compact ? undefined : sel} aria-label={compact ? undefined : b.label} data-i={b.i}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(b.i); } }}>
          <title>{b.label}</title>
          <rect x={x(b.i) - slotW / 2} y={mt} width={slotW} height={H} fill="transparent" />
          {!b.absent && b.value > 0 && <g className="ph-barbody">
            {h - sh > 0.5 && <rect x={x(b.i) - bw / 2 + 0.6} y={y(b.value) + 0.6} width={bw - 1.2} height={Math.max(0, h - sh - 0.6)} fill={`url(#${pid}-${b.i})`} stroke={b.color} strokeWidth={1.2} strokeDasharray={b.inside ? '3 2' : undefined} />}
            {sh > 0 && <rect x={x(b.i) - bw / 2} y={y(0) - sh} width={bw} height={sh} fill={b.color} />}
          </g>}
          {!b.absent && b.value === 0 && <rect x={x(b.i) - bw / 2} y={y(0) - 2} width={bw} height={2} className="ph-zero" />}
          {b.absent && b.i > first && b.i < last && <text x={x(b.i)} y={y(0) - 2} className="ph-gap" textAnchor="middle">·</text>}
          {!b.absent && labelled(b) && <text x={x(b.i)} y={y(b.value) - 3} className={`ph-val ${sel ? 'sel' : ''}`} textAnchor="middle">{unit === 'seats' || !b.part ? b.value : percent(b.part[0], b.part[1], digits, undefined, { svg: true })}</text>}
          {sel && !compact && <rect className="ph-focusring" x={x(b.i) - slotW / 2 + 1} y={mt - 5} width={slotW - 2} height={H + 5} rx={3} />}
        </g>;
      })}
      {bars.map((b) => yearShown(b.i) &&
        <text key={b.i} x={x(b.i) < 14 ? x(b.i) - bw / 2 : x(b.i) > width - 14 ? x(b.i) + bw / 2 : x(b.i)} y={mt + H + xl - 3} className={`ph-axis ${b.i === selected ? 'sel' : ''}`} textAnchor={x(b.i) < 14 ? 'start' : x(b.i) > width - 14 ? 'end' : 'middle'}>{compact || phone ? yearLabel(b.i, lang).slice(-4) : yearLabel(b.i, lang, true)}</text>)}
      {!compact && eras.map((e, k) => { const w = (e.to - e.from + 1) * slotW - 2, fits = w > e.name.length * 6.4 + 8; return <g key={k}>
        <rect x={x(e.from) - slotW / 2 + 1} y={mt + H + xl + 1} width={w} height={strip - 5} rx={3} className="ph-era"><title>{e.name}</title></rect>
        {fits && <text x={(x(e.from) + x(e.to)) / 2} y={mt + H + xl + strip - 8} className="ph-era-t" textAnchor="middle">{e.name}</text>}</g>; })}
      {/* each event's flag names it (or gives its number in the list below when the words do not fit) */}
      {placed.map((p) => {
        const weak = certRank[p.worst.certainty] < certRank.probable;
        const y1 = lineTop(p);
        return <g key={p.items[0].key} className={`ph-ev ${weak ? 'weak' : ''}`} data-certainty={p.worst.certainty}>
          <title>{p.title}</title>
          {!compact && nums && <g className="ph-evnum"><rect x={p.x0} y={y1 - 8} width={p.w} height={15} rx={7.5} /><text x={p.x} y={y1 + 3.5} textAnchor="middle">{p.text}</text></g>}
          {!compact && !nums && (() => { const right = p.x0 < p.x - 1;
            return <g className="ph-flag"><rect x={p.x0} y={y1 - 12} width={p.w} height={13} rx={2} />
              <text x={right ? p.x - 4 : p.x + 4} y={y1 - 2.5} textAnchor={right ? 'end' : 'start'}>{p.text}</text></g>; })()}
        </g>;
      })}
    </svg>
  );
}

// ---------- model glue ----------
function useHistory(partyId: string, metric: 'seats' | 'share') {
  const L = useL(), lang = useLang(), digits = useDigits();
  return useMemo(() => {
    const identity = identityOf(partyId);
    const points = partySeries(identity);
    const events = eventsOf(identity);
    const firstRun = points.find((p) => p.list)?.i ?? 0;
    const bars: Bar[] = points.map((p) => {
      if (!p.list) return { i: p.i, absent: true, value: 0, solid: 0, inside: false, color: 'var(--muted)', label: `${yearLabel(p.i, lang)}: ${L('did not run', 'לא התמודדה')}` };
      const share = p.valid ? (p.votes / p.valid) * 100 : 0;
      const value = metric === 'seats' ? p.seats : share;
      // seats: the party's own elected members solid, partners' hatched (Q1, 8 Nov); vote share: whole list, hatched when joint
      const solid = metric === 'seats' ? (p.role === 'alone' ? p.seats : p.own ?? 0) : p.role === 'alone' ? share : 0;
      const ownColour = p.list.color;
      const own = metric === 'seats' && p.role !== 'alone' && p.own !== null ? L(` (own members ${p.own})`, ` (חברי המפלגה ${p.own})`) : '';
      return { i: p.i, absent: false, value, solid, inside: p.role === 'inside', color: ownColour,
        label: `${yearLabel(p.i, lang)} · ${listShort(p.list, lang)}: ${metric === 'seats' ? L(`${p.seats} seats`, `${p.seats} מנדטים`) : fmtPct(p.votes, p.valid, digits)}${own}`, part: [p.votes, p.valid] };
    });
    const chartEvents: ChartEvent[] = events.map((r, k) => ({ key: r.id, date: r.date, certainty: r.certainty, word: kindWord(r, L), text: eventText(r, lang), n: k + 1 })).filter((e) => e.date);
    return { identity, points, events, bars, chartEvents, eras: erasOf(points, lang), firstRun };
  }, [partyId, metric, L, lang, digits]);
}

/** The comparison of a list of the open scenario with the official result of the election before it (cached per
 *  scenario and allocation, so every row and the panel share one computation). */
const comparisons = new WeakMap<Scenario, WeakMap<AllocationResult, (listId: string) => Comparison | null>>();
export function comparisonFor(s: Scenario, r: AllocationResult): (listId: string) => Comparison | null {
  let byR = comparisons.get(s); if (!byR) comparisons.set(s, byR = new WeakMap());
  let f = byR.get(r);
  if (!f) {
    const i = electionIndex(s.electionId);
    if (i < 0) f = () => null;
    else {
      const now = scenarioFacts(s, r), earlier = i > 0 ? officialFacts(HISTORY[i - 1].id) : null;
      const cache = new Map<string, Comparison | null>();
      f = (listId) => { if (!cache.has(listId)) { try { cache.set(listId, comparablePredecessor(listId, now, earlier)); } catch { cache.set(listId, null); } } return cache.get(listId)!; };
    }
    byR.set(r, f);
  }
  return f;
}
export const useComparison = (s: Scenario, r: AllocationResult) => comparisonFor(s, r);

/** Results row: the visible line and its screen-reader words, from one comparison. */
export function RowComparison({ s, r, listId, currentName, sr }: { s: Scenario; r: AllocationResult; listId: string; currentName: string; sr?: boolean }) {
  const lang = useLang();
  const c = comparisonFor(s, r)(listId);
  return sr ? <>{comparisonRowText(c, lang)}</> : <ComparisonRowLine c={c} currentName={currentName} />;
}

const prevList = (c: Comparison, id: string): HList | undefined => c.earlier ? historyList(c.earlier.id, id) : undefined;
/** "Labor + Meretz", "Religious Zionism → 3 lists" */
export function comparedName(c: Comparison, lang: Lang): string {
  const n = c.counted.map((l) => { const h = prevList(c, l.id); return h ? listShort(h, lang) : l.id; }).join(' + ');
  return c.kind === 'group' ? (lang === 'he' ? `${n} ← ${c.group.length} רשימות` : `${n} → ${c.group.length} lists`) : n;
}
const prevYear = (c: Comparison, lang: Lang) => c.earlier ? yearLabel(electionIndex(c.earlier.id), lang) : '';

/** Results row: "2022: 5 ▲6 · Hadash–Ta'al + Balad" (Standard and up; the name only when it differs). */
export function ComparisonRowLine({ c, currentName }: { c: Comparison | null; currentName: string }) {
  const L = useL(), lang = useLang();
  if (!c || c.kind === 'first') return null;
  const py = prevYear(c, lang);
  if (c.kind === 'new') return <span className="ph-rowline">{L(`New · no ${py} list`, `חדשה · אין רשימה ${hebrewPrefix('מ', py)}`)}</span>;
  if (c.kind === 'verify') return <span className="ph-rowline">{py}: <span className="ph-cert ph-cert-unknown">{L('To verify', 'לבדיקה')}</span></span>;
  const name = comparedName(c, lang);
  const same = c.kind === 'same' && name === currentName;
  return <span className="ph-rowline">{py}: {c.before.seats} <SeatDelta value={c.after.seats - c.before.seats} />{!same && <span className="muted"> · <bdi>{name}</bdi>{c.kind === 'partial' ? L(' (partly)', ' (בחלקה)') : ''}</span>}</span>;
}

/** The row line for screen readers: ", 2022: 5 seats, 6 more, compared with Hadash–Ta'al and Balad". */
export function comparisonRowText(c: Comparison | null, lang: Lang): string {
  if (!c || c.kind === 'first') return '';
  const py = prevYear(c, lang), en = lang === 'en';
  if (c.kind === 'new') return en ? `, new: no ${py} list` : `, חדשה: אין רשימה ${hebrewPrefix('מ', py)}`;
  if (c.kind === 'verify') return en ? `, ${py}: to verify` : `, ${py}: לבדיקה`;
  const d = c.after.seats - c.before.seats;
  const change = d === 0 ? (en ? 'unchanged' : 'ללא שינוי') : en ? `${Math.abs(d)} ${d > 0 ? 'more' : 'fewer'}` : `${Math.abs(d)} ${d > 0 ? 'יותר' : 'פחות'}`;
  return en ? `, ${py}: ${c.before.seats} seats (${change}), compared with ${comparedName(c, 'en')}${c.kind === 'partial' ? ', partly' : ''}`
    : `, ${py}: ${c.before.seats} מנדטים (${change}), בהשוואה ${hebrewPrefix('ל', comparedName(c, 'he'))}${c.kind === 'partial' ? ', בחלקה' : ''}`;
}

/** Panel line: "Since 2022 Labor + Meretz 4 → 8 ▲4 · −0.4 pp  Probable (i)", and anything not counted. */
export function ComparisonLine({ c }: { c: Comparison | null }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  if (!c || c.kind === 'first') return null;
  const py = prevYear(c, lang);
  if (c.kind === 'new') return <div className="ph-cmpline" data-kind="new"><span className="muted">{L(`Since ${py}`, `לעומת ${py}`)}</span> <b>{L('New', 'חדשה')}</b> <span className="small muted">{L(`no ${py} list`, `אין רשימה ${hebrewPrefix('מ', py)}`)}</span>
    <Info title={L('Compared with last time', 'השוואה לבחירות הקודמות')}>{L('A list is compared only with whole earlier lists linked by recorded party facts (the same party, a rename, a merger, a joint list). None qualifies here. Founders who came from another party do not make a predecessor.', 'רשימה מושווית רק לרשימות קודמות שלמות הקשורות בעובדות מתועדות על המפלגות (אותה מפלגה, שינוי שם, איחוד, רשימה משותפת). כאן אין כזו. מייסדים שבאו ממפלגה אחרת אינם יוצרים רשימה קודמת.')}</Info></div>;
  if (c.kind === 'verify') return <div className="ph-cmpline" data-kind="verify"><span className="muted">{L(`Since ${py}`, `לעומת ${py}`)}</span> <CertChip c="unknown" />
    <Info title={L('To verify', 'לבדיקה')}><span className="ph-why"><span>{L('The link that decides this comparison is not yet established, so no figure is shown:', 'הקשר שמכריע את ההשוואה טרם בוסס, ולכן לא מוצג מספר:')}</span>{c.toVerify.map((r) => <span key={r.id}>{eventText(r, lang)} · <CertChip c={r.certainty} /></span>)}</span></Info></div>;
  const d = c.after.seats - c.before.seats;
  const share = c.before.valid && c.after.valid ? { num: 100n * (BigInt(c.after.votes) * BigInt(c.before.valid) - BigInt(c.before.votes) * BigInt(c.after.valid)), den: BigInt(c.before.valid) * BigInt(c.after.valid) } : null;
  return <div className="ph-cmpline" data-kind={c.kind}>
    <span className="muted">{L(`Since ${py}`, `לעומת ${py}`)}</span> <b><bdi>{comparedName(c, lang)}</bdi></b>
    <span dir="ltr" className="ph-num">{c.before.seats} → {c.after.seats} <SeatDelta value={d} /></span>
    {share && share.num !== 0n && <span className="ph-num">· <bdi dir="ltr">{rationalPoints(share, digits)}</bdi> {L('pp', 'נק׳ אחוז')}</span>}
    {c.certainty !== 'confirmed' && <CertChip c={c.certainty} />}
    <Info title={L('Compared with', 'מושווה ל')}><ComparisonWhy c={c} /></Info>
    {(c.notCounted.length > 0 || c.left.length > 0) && <div className="tiny muted ph-notcounted">
      {c.notCounted.map((n) => { const h = prevList(c, n.listId); return <span key={`${n.partyId}${n.listId}`}>{L(`${partyShort(n.partyId, 'en')} not counted: it ran inside ${h ? listShort(h, 'en') : 'another list'} in ${py}.`, `${partyShort(n.partyId, 'he')} לא נספרה: ${hebrewPrefix('ב', py)} רצה בתוך ${h ? listShort(h, 'he') : 'רשימה אחרת'}.`)} </span>; })}
      {c.left.map((n) => <span key={`l${n.partyId}`}>{L(`${partyShort(n.partyId, 'en')} has since left.`, `${partyShort(n.partyId, 'he')} עזבה מאז.`)} </span>)}
    </div>}
  </div>;
}

/** Compare between two elections: each list of the later side against the earlier side's whole lists. */
export function useCrossComparison(later: { sc: Scenario; r: AllocationResult } | null, earlier: { sc: Scenario; r: AllocationResult } | null) {
  return useMemo(() => {
    if (!later || !earlier || electionIndex(earlier.sc.electionId) >= electionIndex(later.sc.electionId)) return () => null;
    const now = scenarioFacts(later.sc, later.r), before = scenarioFacts(earlier.sc, earlier.r);
    const cache = new Map<string, Comparison | null>();
    return (listId: string): Comparison | null => {
      if (!cache.has(listId)) { try { cache.set(listId, comparablePredecessor(listId, now, before)); } catch { cache.set(listId, null); } }
      return cache.get(listId)!;
    };
  }, [later?.sc, later?.r, earlier?.sc, earlier?.r]); // eslint-disable-line react-hooks/exhaustive-deps
}

const RENAME: [string, string] = ['renamed', 'שינתה שם'], MERGED: [string, string] = ['merged', 'איחוד'];
/** "Labor, renamed + Meretz": each whole earlier list, with how its party continues when a relation says so. */
function countedWithHow(c: Comparison, lang: Lang) {
  return c.counted.map((M) => {
    const h = prevList(c, M.id), name = h ? listShort(h, lang) : M.id;
    const rs = c.relations.filter((r) => r.from.some((p) => M.parties.includes(p)));
    const how = rs.some((r) => r.kind === 'renamed-to') ? RENAME : rs.some((r) => r.kind === 'merged-into' || r.kind === 'absorbed-into') ? MERGED : null;
    return how ? `${name}, ${lang === 'en' ? how[0] : how[1]}` : name;
  }).join(' + ');
}

/** Compare: one line under the later list's name. Nothing when it is plainly the same list. */
export function CompareNote({ c, currentName }: { c: Comparison | null; currentName: string }) {
  const L = useL(), lang = useLang();
  if (!c || c.kind === 'first' || c.kind === 'new' || (c.kind === 'same' && !c.relations.length)) return null;
  const py = prevYear(c, lang);
  // the same list under the same name: only what was left out is worth a line
  const plain = c.kind !== 'group' && !c.relations.length && c.counted.length === 1 && countedWithHow(c, lang) === currentName;
  if (plain && !c.notCounted.length) return null;
  if (c.kind === 'verify') return <span className="tiny muted cmp-note ph-cmpnote">{py}: <CertChip c="unknown" /></span>;
  return <span className="tiny muted cmp-note ph-cmpnote">
    {c.kind === 'group' ? <>= <bdi>{comparedName(c, lang)}</bdi> ({py})</> : !plain && <>= <bdi>{countedWithHow(c, lang)}</bdi> {py}</>}
    {!plain && c.certainty !== 'confirmed' && <> <CertChip c={c.certainty} /></>}
    {c.notCounted.map((n, k) => { const h = prevList(c, n.listId); return <span key={n.partyId + n.listId} className="ph-cmpnote-nc">{plain && k === 0 ? '' : ' · '}{L(`not counted: ${partyShort(n.partyId, 'en')} ran inside ${h ? listShort(h, 'en') : 'another list'} in ${py}`, `לא נספרה: ${partyShort(n.partyId, 'he')} רצה בתוך ${h ? listShort(h, 'he') : 'רשימה אחרת'} ${hebrewPrefix('ב', py)}`)}</span>; })}
  </span>;
}

/** The evidence behind a comparison: the earlier lists, why, how sure. Used in the panel and in Compare. */
export function ComparisonWhy({ c }: { c: Comparison }) {
  const L = useL(), lang = useLang();
  const { expert } = useLevel();
  const py = prevYear(c, lang);
  return <span className="ph-why">
    <span>{c.kind === 'group'
      ? L(`The ${py} list was divided among several lists, so they are compared together. Votes are never split between parties.`, `הרשימה ${hebrewPrefix('מ', py)} התחלקה בין כמה רשימות, ולכן הן מושוות יחד. הקולות אינם מפוצלים בין מפלגות.`)
      : L(`Compared with whole ${py} lists whose parties all ran on this list. Votes are never split between parties.`, `מושווה לרשימות ${hebrewPrefix('מ', py)} במלואן, שכל מפלגותיהן רצו ברשימה זו. הקולות אינם מפוצלים בין מפלגות.`)}</span>
    <span className="ph-why-lists">{c.counted.map((l) => { const h = prevList(c, l.id); return <span key={l.id}><bdi>{h ? listShort(h, lang) : l.id}</bdi> {py}: {L(`${l.seats} seats`, `${l.seats} מנדטים`)} · <bdi dir="ltr">{fmtInt(l.votes)}</bdi> {L('votes', 'קולות')}</span>; })}</span>
    {c.relations.map((r) => <span key={r.id}>{eventText(r, lang)} ({year(r.date)}) · <CertChip c={r.certainty} />{expert && r.sources.length > 0 && <span className="tiny muted"> · {r.sources.map((s) => s.publisher ?? s.id).join('; ')}</span>}</span>)}
    {c.newParties.length > 0 && c.kind !== 'group' && <span className="muted">{L(`No earlier list: ${names(c.newParties, 'en')}.`, `ללא רשימה קודמת: ${names(c.newParties, 'he')}.`)}</span>}
  </span>;
}

// ---------- the panel section and the full sheet ----------
/** A modal sheet (the same behaviour as Compare's dialogs, without loading Compare). */
function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); return () => { if (d?.open) d.close(); }; }, []);
  return <dialog ref={ref} className="ph-sheet" aria-label={label} onCancel={(e) => { e.preventDefault(); onClose(); }}
    onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>{children}</dialog>;
}

function chipParties(electionId: string, l: Parameters<typeof partiesOf>[1]) {
  const ps = partiesOf(electionId, l), lead = leadOf(electionId, l);
  const front = ps.find((p) => p === `vehicle-${l.id}`);
  const first = front ?? lead ?? ps[0];
  return first ? [first, ...ps.filter((p) => p !== first && !(front && p === front))] : ps;
}

/** A party whose only list withdrew before the vote (2026 Tnuat Ahi) never ran: no "since" year, no "0 of 26". */
const NEVER = (L: ReturnType<typeof useL>) => L('did not run in any election', 'לא התמודדה באף מערכת בחירות');

export function PartyHistorySection({ s, r, listId }: { s: Scenario; r: AllocationResult; listId: string }) {
  const L = useL(), lang = useLang();
  const l = s.lists.find((x) => x.id === listId);
  const k = electionIndex(s.electionId);
  const chips = useMemo(() => l ? chipParties(s.electionId, l) : [], [s.electionId, l]);
  const [pid, setPid] = useState<string | null>(chips[0] ?? null);
  useEffect(() => { setPid(chips[0] ?? null); }, [listId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState(false);
  const compare = useComparison(s, r);
  const [ref, width] = useWidth<HTMLDivElement>(360);
  const active = pid && chips.includes(pid) ? pid : chips[0];
  const h = useHistory(active ?? '', 'seats');
  if (!l || !active || k < 0) return null;
  const c = compare(listId);
  const ran = h.points.filter((p) => p.list);
  return <section className="ph-sec" aria-label={L('History', 'היסטוריה')}>
    <h3>{L('History', 'היסטוריה')} <span className="tiny muted">· {!ran.length ? NEVER(L) : ran.length > 1 ? L(`since ${yearLabel(h.firstRun, 'en')}`, `מאז ${yearLabel(h.firstRun, 'he')}`) : L(`only ${yearLabel(h.firstRun, 'en')}`, `רק ${yearLabel(h.firstRun, 'he')}`)}</span></h3>
    {chips.length > 1 && <div className="ph-chips" role="group" aria-label={L('Whose history', 'ההיסטוריה של')}>
      {chips.map((p) => <button key={p} type="button" className={`btn small ${p === active ? 'primary' : ''}`} aria-pressed={p === active} onClick={() => setPid(p)}>{partyShort(p, lang)}</button>)}</div>}
    {h.eras.length > 1 && <div className="tiny muted ph-chain">{h.eras.map((e) => e.name).filter((n, i, a) => a.indexOf(n) === i).join(lang === 'he' ? ' ← ' : ' → ')}</div>}
    {ran.length > 1 && <div ref={ref} className="ph-compact">
      <button type="button" className="ph-chartbtn" onClick={() => setOpen(true)} aria-label={L(`Open full history: ${partyShort(active, 'en')}`, `פתיחת ההיסטוריה המלאה: ${partyShort(active, 'he')}`)}>
        <HistoryChart compact bars={h.bars} eras={h.eras} events={h.chartEvents} selected={k} onSelect={() => setOpen(true)} width={width} height={96} unit="seats"
          label={L(`${partyShort(active, 'en')}: seats at each election`, `${partyShort(active, 'he')}: מנדטים בכל בחירות`)} />
      </button>
      <Legend compact events={h.chartEvents} />
    </div>}
    <ComparisonLine c={c} />
    <button type="button" className="btn small ph-full" onClick={() => setOpen(true)}>{L('Full history', 'היסטוריה מלאה')} <span aria-hidden>{lang === 'he' ? '‹' : '›'}</span></button>
    {open && <HistorySheet parties={chips} initial={active} electionIdx={k} onClose={() => setOpen(false)} />}
  </section>;
}

/** What the chart's marks mean, in words: bars, partners' share, gaps, event lines (and why they sit between bars). */
function Legend({ compact, metric = 'seats', events = [] }: { compact?: boolean; metric?: 'seats' | 'share'; events?: ChartEvent[] }) {
  const L = useL();
  const weak = events.some((e) => certRank[e.certainty] < certRank.probable);
  return <div className={`ph-legend ${compact ? 'tiny' : 'small'}`}>
    {metric === 'seats' ? <>
      <span><i className="ph-sw solid" />{L('Own members', 'חברי המפלגה')}</span>
      <span><i className="ph-sw hatch" />{L('Partners’ members', 'חברי השותפות')}</span>
    </> : <>
      <span><i className="ph-sw solid" />{L('Ran alone', 'רצה לבדה')}</span>
      <span><i className="ph-sw hatch" />{L('Joint list (whole list)', 'רשימה משותפת (כולה)')}</span>
      <span><i className="ph-sw dash" />{L('Inside another’s list', 'בתוך רשימה אחרת')}</span>
    </>}
    <span><b className="ph-gapkey" aria-hidden>·</b> {L('Did not run', 'לא התמודדה')}{!compact && <Info title={L('Party history', 'היסטוריית מפלגה')}>{L('Each bar is the whole list the party ran in. Seats: solid is the party’s own elected members, hatched its partners’ (official candidate lists and Knesset records). Vote share: a joint list’s votes belong to the whole list and are never divided. The shaded column is the election you are looking at.', 'כל עמודה היא הרשימה כולה שבה רצה המפלגה. מנדטים: החלק המלא הוא חברי המפלגה שנבחרו, המקווקו – חברי השותפות (רשימות המועמדים ורשומות הכנסת). שיעור קולות: קולות רשימה משותפת שייכים לרשימה כולה ואינם מחולקים. העמודה המוצללת היא הבחירות שבהן אתם צופים.')}</Info>}</span>
    {events.length > 0 && <span className="ph-evkey"><i className="ph-sw evline" />{L('Merger, split or new name', 'איחוד, פילוג או שם חדש')}
      {!compact && <Info title={L('Where events are drawn', 'היכן מסומנים אירועים')}>{L('Bars are elections, evenly spaced. This is not a time scale: Knessets last different lengths. Each line sits between the two elections the event fell between, at the same point of that gap as in time. Example: Kadima split from Likud on 23 Nov 2005, 89% of the way from the 2003 election to the 2006 one. A date known only by its year is placed in mid-year.', 'העמודות הן מערכות בחירות, במרווחים שווים. זה אינו ציר זמן: משך כל כנסת שונה. כל קו נמצא בין שתי הבחירות שביניהן אירע האירוע, באותה נקודה בפער כמו בזמן. לדוגמה: קדימה התפצלה מהליכוד ב־23 בנובמבר 2005, 89% מהדרך בין בחירות 2003 לבחירות 2006. תאריך שידועה בו רק השנה מסומן באמצע השנה.')}</Info>}</span>}
    {weak && <span><i className="ph-sw evline weak" />{L('Dashed: not yet established', 'מקווקו: טרם בוסס')}</span>}
  </div>;
}

function PointCard({ p, identity }: { p: SeriesPoint; identity: Identity }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  void identity;
  if (!p.list) return <div className="ph-card"><b>{yearLabel(p.i, lang)}</b> · {L('Did not run', 'לא התמודדה')}</div>;
  const partners = names(p.partners, lang, p.i);
  const joint = p.role !== 'alone';
  return <div className="ph-card" aria-live="polite">
    <div><b>{yearLabel(p.i, lang)} · <bdi>{listShort(p.list, lang)}</bdi></b></div>
    <div>{L(`${p.seats} seats`, `${p.seats} מנדטים`)} · <bdi dir="ltr">{percent(p.votes, p.valid, digits)}</bdi> · <bdi dir="ltr">{fmtInt(p.votes)}</bdi> {L('votes', 'קולות')}</div>
    {joint && <div className="small">{p.role === 'led' ? L(`Led a joint list with ${partners}`, `הובילה רשימה משותפת עם ${partners}`) : L(`Ran inside a list led by ${partyNameAt(p.list.lead ?? p.partners[0], p.i, 'en')}`, `רצה ברשימה בראשות ${partyNameAt(p.list.lead ?? p.partners[0], p.i, 'he')}`)}</div>}
    {joint && <div className="small">{L('Elected: ', 'נבחרו: ')}{[...p.members, ...p.partners].map((q) => { const n = p.list!.elected[q]; return `${partyNameAt(q, p.i, lang)} ${n ?? L('unknown', 'לא ידוע')}`; }).join(' · ')}{p.list.unknownElected > 0 ? L(` · unknown ${p.list.unknownElected}`, ` · לא ידוע ${p.list.unknownElected}`) : ''}</div>}
    {joint && <div className="tiny muted">{L('Votes are for the whole list', 'הקולות ניתנו לרשימה כולה')}</div>}
    {p.era && partyNameAt(p.era, p.i, lang) !== listShort(p.list, lang) && <div className="tiny muted">{L(`As ${partyNameAt(p.era, p.i, 'en')}`, `בשם ${partyNameAt(p.era, p.i, 'he')}`)}</div>}
  </div>;
}

/** The full view: a wide sheet (full screen on phones). `parties`: the chips (a joint list's parties). */
export function HistorySheet({ parties, initial, electionIdx, onClose }: { parties: string[]; initial: string; electionIdx: number; onClose: () => void }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const { expert } = useLevel();
  const preferTables = useSetting('preferTables');
  const [pid, setPid] = useState(initial);
  const [metric, setMetric] = useState<'seats' | 'share'>('seats');
  const [sel, setSel] = useState<number | null>(electionIdx);
  const [ref, width] = useWidth<HTMLDivElement>(880);
  const phone = width < 560;
  const h = useHistory(pid, metric);
  const ran = h.points.filter((p) => p.list), won = ran.filter((p) => p.seats > 0);
  const best = ran.reduce<SeriesPoint | undefined>((m, p) => !m || p.seats > m.seats ? p : m, undefined);
  const cur = h.points[sel ?? electionIdx] ?? h.points[electionIdx];
  const head = h.points[electionIdx].list ?? ran[ran.length - 1]?.list;
  const since = ran.length < h.points.length - h.firstRun || h.firstRun > 0 ? L(` since ${yearLabel(h.firstRun, 'en')}`, ` מאז ${yearLabel(h.firstRun, 'he')}`) : '';
  const open = OPEN_CHECKS.filter((o) => o.partyIds.some((p) => h.identity.ids.includes(p)));
  const title = partyShort(pid, lang);
  return <Sheet label={L(`${partyShort(pid, 'en')} history`, `היסטוריה: ${partyShort(pid, 'he')}`)} onClose={onClose}>
    <div className="ph-head">
      {head && <Slip name={listShort(head, lang)} letters={head.letters} color={head.color} size="lg" />}
      <div className="ph-head-text">
        <h2>{lang === 'he' ? <>היסטוריה · {title}</> : <>{title} <span className="small muted">history</span></>}</h2>
        {h.eras.length > 1 && <div className="small ink2">{h.eras.map((e) => e.name).filter((n, i, a) => a.indexOf(n) === i).join(lang === 'he' ? ' ← ' : ' → ')}</div>}
        <div className="small muted">{!ran.length ? NEVER(L) : L(`Ran in ${ran.length} of ${h.points.length - h.firstRun} elections${since} · won seats in ${won.length}`, `התמודדה ב־${ran.length} מתוך ${h.points.length - h.firstRun} בחירות${since} · זכתה במנדטים ב־${won.length}`)}{best && best.seats > 0 ? L(` · most: ${best.seats} (${yearLabel(best.i, 'en')})`, ` · שיא: ${best.seats} (${yearLabel(best.i, 'he')})`) : ''}</div>
      </div>
      <button type="button" className="btn ghost" onClick={onClose} aria-label={L('Close', 'סגירה')}>×</button>
    </div>
    <div className="ph-toolbar">
      {parties.length > 1 && <div className="ph-chips" role="group" aria-label={L('Whose history', 'ההיסטוריה של')}>{parties.map((p) => <button key={p} type="button" className={`btn small ${p === pid ? 'primary' : ''}`} aria-pressed={p === pid} onClick={() => setPid(p)}>{partyShort(p, lang)}</button>)}</div>}
      <div className="seg-row" role="group" aria-label={L('Measure', 'מדד')}>
        {(['seats', 'share'] as const).map((m) => <button key={m} type="button" className={`btn small ${metric === m ? 'primary' : ''}`} aria-pressed={metric === m} onClick={() => setMetric(m)}>{m === 'seats' ? L('Seats', 'מנדטים') : L('Vote share', 'שיעור קולות')}</button>)}
      </div>
    </div>
    <div ref={ref} className="ph-chartwrap">
      <HistoryChart bars={h.bars} eras={h.eras} events={h.chartEvents} selected={sel} onSelect={setSel} width={width} height={phone ? 230 : 290} unit={metric} phone={phone}
        label={L(`${partyShort(pid, 'en')}: ${metric === 'seats' ? 'seats' : 'vote share'} at each election. Arrow keys move between elections.`, `${partyShort(pid, 'he')}: ${metric === 'seats' ? 'מנדטים' : 'שיעור קולות'} בכל בחירות. מקשי החצים עוברים בין בחירות.`)} />
    </div>
    <Legend metric={metric} events={h.chartEvents} />
    {cur && <PointCard p={cur} identity={h.identity} />}
    {(h.events.length > 0 || open.length > 0) && <>
      <h3>{L('Events', 'אירועים')}</h3>
      <ul className="ph-events">
        {h.events.map((r, k) => <li key={r.id}>
          <span className={`ph-evdot ${certRank[r.certainty] < certRank.probable ? 'weak' : ''}`} aria-hidden>{r.date ? k + 1 : ''}</span>
          <span className="ph-evyear"><bdi dir="ltr">{dateText(r)}</bdi></span>
          <span>{eventText(r, lang)}</span>
          <span className="ph-evmeta"><CertChip c={r.certainty} /><Evidence r={r} /></span>
        </li>)}
        {open.map((o) => <li key={o.id}>
          <span className="ph-evdot weak" aria-hidden /><span className="ph-evyear">—</span>
          <span>{L(`Registration record not yet checked: ${names(o.partyIds.filter((p) => !p.startsWith('vehicle-')), 'en')}`, `רישום המפלגות טרם נבדק: ${names(o.partyIds.filter((p) => !p.startsWith('vehicle-')), 'he')}`)}</span>
          <span className="ph-evmeta"><CertChip c="unknown" /></span>
        </li>)}
      </ul>
    </>}
    <details className="ph-exact" open={expert || preferTables}>
      <summary>{L(`Exact figures (${ran.length} elections)`, `נתונים מדויקים (${ran.length} בחירות)`)}</summary>
      <div className="tablewrap"><table className="ph-table">
        <thead><tr><th>{L('Election', 'בחירות')}</th><th>{L('List', 'רשימה')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th className="n">{L('Own elected', 'נבחרי המפלגה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Share', 'שיעור')}</th></tr></thead>
        <tbody>{ran.map((p) => <tr key={p.i} className={p.i === sel ? 'sel' : ''}>
          <td><button type="button" className="table-action" onClick={() => setSel(p.i)}>{yearLabel(p.i, lang)}</button></td>
          <td><bdi>{listShort(p.list!, lang)}</bdi>{p.role !== 'alone' && <span className="tiny muted"> · {p.role === 'led' ? L('joint, led', 'משותפת, בראשה') : L('joint, inside', 'משותפת, בתוכה')}</span>}</td>
          <td className="n">{p.seats}</td><td className="n">{p.role === 'alone' ? '—' : p.own ?? L('unknown', 'לא ידוע')}</td>
          <td className="n"><bdi dir="ltr">{fmtInt(p.votes)}</bdi></td><td className="n"><bdi dir="ltr">{percent(p.votes, p.valid, digits)}</bdi></td>
        </tr>)}</tbody>
      </table></div>
      <p className="tiny muted">{L('Votes and share are the whole list’s, also for a joint list.', 'הקולות והשיעור הם של הרשימה כולה, גם ברשימה משותפת.')}</p>
    </details>
  </Sheet>;
}

