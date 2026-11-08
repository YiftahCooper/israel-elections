// Party history and "compared with last time" (docs/design/party-history.md §5). Facts, not edits: nothing here
// changes a result or marks a scenario. Graphics are always drawn left to right, in Hebrew too.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Certainty } from '../../data/evidence.ts';
import { comparablePredecessor, leadOf, officialFacts, partiesOf, scenarioFacts, type Comparison } from '../../history/compare.ts';
import { erasOf, eventsOf, identityOf, partySeries, type Identity, type SeriesPoint } from '../../history/identity.ts';
import { OPEN_CHECKS, type Relation } from '../../history/relations.ts';
import { HISTORY, electionIndex, historyList, listShort, partyShort, yearLabel, type HList } from '../../history/runtime.ts';
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

const names = (ids: string[], lang: Lang) => {
  const n = ids.map((p) => partyShort(p, lang));
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
const GLYPH: Partial<Record<Relation['kind'], string>> = { 'renamed-to': 'R', 'merged-into': '+', 'absorbed-into': '+', 'split-from': '−', 'faction-split': '−' };
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
export interface ChartEvent { key: string; date: string; certainty: Certainty; glyph: string; word: string }

/** x of a date: between the two elections around it, proportionally. */
const dateX = (d: string, x: (i: number) => number) => {
  const t = Date.parse(d.length === 4 ? `${d}-07-01` : d);
  const k = HISTORY.findIndex((e) => Date.parse(e.date) > t);
  if (k <= 0) return x(k === 0 ? 0 : HISTORY.length - 1);
  const a = Date.parse(HISTORY[k - 1].date), b = Date.parse(HISTORY[k].date);
  return x(k - 1) + ((t - a) / (b - a)) * (x(k) - x(k - 1));
};

export function HistoryChart({ bars, eras, events, selected, onSelect, compact, width, height, label, unit, phone }: {
  bars: Bar[]; eras: { from: number; to: number; name: string }[]; events: ChartEvent[]; selected: number | null; onSelect: (i: number) => void;
  compact?: boolean; width: number; height: number; label: string; unit: 'seats' | 'share'; phone?: boolean;
}) {
  const lang = useLang(), digits = Math.min(1, useDigits());
  const ml = compact ? 4 : 30, mr = 8, mt = compact ? 14 : 18;
  const strip = compact ? 0 : 20, lane = compact ? 12 : events.length ? (phone ? 26 : 46) : 4, xl = 15;
  const W = width - ml - mr, H = height - mt - xl - strip - lane;
  const n = bars.length, slot = W / n, bw = Math.max(3, Math.min(26, slot * 0.68));
  const top = (() => { const m = Math.max(1, ...bars.map((b) => b.value)); const step = unit === 'seats' ? (m > 40 ? 20 : m > 16 ? 10 : 5) : (m > 30 ? 10 : 5); return { max: Math.ceil(m / step) * step || step, step }; })();
  const y = (v: number) => mt + H - (v / top.max) * H;
  const x = (i: number) => ml + i * slot + slot / 2;
  const present = bars.filter((b) => !b.absent);
  const first = present[0]?.i ?? 0, last = present[present.length - 1]?.i ?? n - 1;
  const best = present.reduce<Bar | undefined>((m, b) => !m || b.value > m.value ? b : m, undefined);
  const labelled = (b: Bar) => compact || phone ? b === best || b.i === last || b.i === selected : true;
  const every = compact ? 6 : phone ? 4 : 1;
  const grouped = useMemo(() => { const g: ChartEvent[][] = []; for (const e of events) { const h = g.find((x) => year(x[0].date) === year(e.date)); if (h) h.push(e); else g.push([e]); } return g; }, [events]);
  const wordOf = (g: ChartEvent[]) => g.length > 1 ? [...new Set(g.map((x) => x.word))].join(' · ') : g[0].word;
  // a word that would touch its neighbour's drops to a second line
  const rows = useMemo(() => {
    const out: number[] = [], lastEnd = [-1e9, -1e9];
    for (const g of grouped) {
      const cx = dateX(g[0].date, (i) => ml + i * (W / n) + W / n / 2), half = wordOf(g).length * 3.1 + 4;
      const r = cx - half > lastEnd[0] ? 0 : cx - half > lastEnd[1] ? 1 : 0;
      out.push(r); lastEnd[r] = cx + half;
    }
    return out;
  }, [grouped, W, n, ml]); // eslint-disable-line react-hooks/exhaustive-deps
  const worst = (g: ChartEvent[]) => g.find((e) => e.certainty !== 'confirmed' && e.certainty !== 'probable') ?? g.find((e) => e.certainty === 'probable') ?? g[0];
  const pid = `ph${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const move = (d: number) => { const order = present.map((b) => b.i); const at = order.indexOf(selected ?? -1); const next = order[Math.min(order.length - 1, Math.max(0, (at < 0 ? 0 : at) + d))]; if (next !== undefined) onSelect(next); };
  return (
    <svg className={`ph-chart ${compact ? 'compact' : ''}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} direction="ltr" role={compact ? 'img' : 'group'} aria-label={label}
      onKeyDown={compact ? undefined : (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } else if (e.key === 'Home') { e.preventDefault(); onSelect(first); } else if (e.key === 'End') { e.preventDefault(); onSelect(last); } }}>
      <defs>{present.map((b) => <pattern key={b.i} id={`${pid}-${b.i}`} patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)"><rect width="5" height="5" fill={b.color} opacity=".18" /><path d="M0 0V5" stroke={b.color} strokeWidth="2.2" /></pattern>)}</defs>
      {!compact && Array.from({ length: top.max / top.step + 1 }, (_, k) => k * top.step).map((v) => <g key={v}>
        <line x1={ml} x2={width - mr} y1={y(v)} y2={y(v)} className="ph-grid" />
        <text x={ml - 4} y={y(v) + 3.5} className="ph-axis" textAnchor="end">{unit === 'share' ? `${v}%` : v}</text></g>)}
      {compact && <line x1={ml} x2={width - mr} y1={y(0)} y2={y(0)} className="ph-grid" />}
      {bars.map((b) => {
        const h = Math.max(0, y(0) - y(b.value)), sh = Math.max(0, Math.min(h, y(0) - y(b.solid)));
        const sel = b.i === selected;
        return <g key={b.i} className={`ph-bar ${sel ? 'sel' : ''}`} onClick={() => onSelect(b.i)} tabIndex={compact || b.absent ? -1 : sel || selected === null && b.i === last ? 0 : -1}
          role={compact ? undefined : 'button'} aria-pressed={compact ? undefined : sel} aria-label={compact ? undefined : b.label} data-i={b.i}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(b.i); } }}>
          <title>{b.label}</title>
          <rect x={x(b.i) - slot / 2} y={mt} width={slot} height={H} fill="transparent" />
          {!b.absent && b.value > 0 && <>
            {h - sh > 0.5 && <rect x={x(b.i) - bw / 2 + 0.6} y={y(b.value) + 0.6} width={bw - 1.2} height={Math.max(0, h - sh - 0.6)} fill={`url(#${pid}-${b.i})`} stroke={b.color} strokeWidth={1.2} strokeDasharray={b.inside ? '3 2' : undefined} />}
            {sh > 0 && <rect x={x(b.i) - bw / 2} y={y(0) - sh} width={bw} height={sh} fill={b.color} />}
          </>}
          {!b.absent && b.value === 0 && <rect x={x(b.i) - bw / 2} y={y(0) - 2} width={bw} height={2} className="ph-zero" />}
          {b.absent && b.i > first && b.i < last && <text x={x(b.i)} y={y(0) - 2} className="ph-gap" textAnchor="middle">·</text>}
          {!b.absent && labelled(b) && <text x={x(b.i)} y={y(b.value) - 3} className="ph-val" textAnchor="middle">{unit === 'seats' || !b.part ? b.value : percent(b.part[0], b.part[1], digits, undefined, { svg: true })}</text>}
          {sel && <rect x={x(b.i) - slot / 2 + 0.5} y={mt - 3} width={slot - 1} height={H + 3} className="ph-selbox" />}
        </g>;
      })}
      {bars.map((b) => (b.i % every === 0 || b.i === n - 1) && !(b.i !== n - 1 && n - 1 - b.i < every && every > 1) &&
        <text key={b.i} x={x(b.i)} y={mt + H + xl - 3} className="ph-axis" textAnchor="middle">{compact || phone ? yearLabel(b.i, lang).slice(-4) : yearLabel(b.i, lang, true)}</text>)}
      {!compact && eras.map((e, k) => { const w = (e.to - e.from + 1) * slot - 2, fits = w > e.name.length * 6.4 + 8; return <g key={k}>
        <rect x={x(e.from) - slot / 2 + 1} y={mt + H + xl + 1} width={w} height={strip - 5} rx={3} className="ph-era"><title>{e.name}</title></rect>
        {fits && <text x={(x(e.from) + x(e.to)) / 2} y={mt + H + xl + strip - 8} className="ph-era-t" textAnchor="middle">{e.name}</text>}</g>; })}
      {grouped.map((g, gi) => { const e = worst(g), cx = Math.min(width - mr - 6, Math.max(ml + 6, dateX(g[0].date, x))), cy = mt + H + xl + strip + (compact ? 5 : 9);
        const row = rows[gi];
        return <g key={e.key} className={`ph-ev ph-ev-${e.certainty}`}>
          <line x1={cx} x2={cx} y1={mt} y2={mt + H} className="ph-evline" />
          <circle cx={cx} cy={cy} r={compact ? 4 : 7} />
          {!compact && <text x={cx} y={cy + 3.5} textAnchor="middle" className="ph-evg">{g.length > 1 ? g.length : e.certainty === 'confirmed' || e.certainty === 'probable' ? e.glyph : '?'}</text>}
          {!compact && !phone && <text x={cx} y={cy + 19 + row * 12} textAnchor={cx > width - 50 ? 'end' : cx < 50 ? 'start' : 'middle'} className="ph-evw">{wordOf(g)}</text>}
          <title>{g.map((x) => `${year(x.date)} · ${x.word}`).join('\n')}</title>
        </g>; })}
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
    const chartEvents: ChartEvent[] = events.filter((r) => r.date).map((r) => ({ key: r.id, date: r.date, certainty: r.certainty, glyph: GLYPH[r.kind] ?? '•', word: kindWord(r, L) }));
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
  return <span className="ph-rowline">{py}: {c.before.seats} <SeatDelta value={c.after.seats - c.before.seats} />{!same && <span className="muted"> · <bdi>{name}</bdi>{c.kind === 'partial' ? ' *' : ''}</span>}</span>;
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
      {c.notCounted.map((n) => { const h = prevList(c, n.listId); return <span key={`${n.partyId}${n.listId}`}>{L(`${partyShort(n.partyId, 'en')} not counted: it ran inside ${h ? listShort(h, 'en') : '?'} in ${py}.`, `${partyShort(n.partyId, 'he')} לא נספרה: ${hebrewPrefix('ב', py)} רצה בתוך ${h ? listShort(h, 'he') : '?'}.`)} </span>; })}
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
    {c.notCounted.map((n, k) => { const h = prevList(c, n.listId); return <span key={n.partyId + n.listId} className="ph-cmpnote-nc">{plain && k === 0 ? '' : ' · '}{L(`not counted: ${partyShort(n.partyId, 'en')} ran inside ${h ? listShort(h, 'en') : '?'} in ${py}`, `לא נספרה: ${partyShort(n.partyId, 'he')} רצה בתוך ${h ? listShort(h, 'he') : '?'} ${hebrewPrefix('ב', py)}`)}</span>; })}
  </span>;
}

/** Compare's Matching panel: "Compared with the whole 2022 lists: Labor (4) + Meretz (0)", each relation with its chip and evidence. */
export function ComparisonReason({ c }: { c: Comparison | null }) {
  const L = useL(), lang = useLang();
  if (!c || c.kind === 'first' || c.kind === 'new') return null;
  const py = prevYear(c, lang);
  if (c.kind === 'verify') return <div className="small ph-reason"><span>{L('Not compared yet: a deciding link is to verify.', 'טרם הושווה: קשר מכריע ממתין לבדיקה.')}</span>
    {c.toVerify.map((r) => <span key={r.id} className="ph-reason-rel">{eventText(r, lang)} ({year(r.date)}) <CertChip c={r.certainty} /> <Evidence r={r} /></span>)}</div>;
  const lists = c.counted.map((M) => { const h = prevList(c, M.id); return `${h ? listShort(h, lang) : M.id} (${M.seats})`; }).join(' + ');
  return <div className="small ph-reason">
    <span>{L(`Compared with the whole ${py} lists: `, `מושווה לרשימות ${hebrewPrefix('מ', py)} במלואן: `)}<bdi>{lists}</bdi>{c.kind === 'group' ? L(` (together with ${c.group.length} lists now)`, ` (יחד עם ${c.group.length} רשימות כיום)`) : ''}</span>
    {c.relations.map((r) => <span key={r.id} className="ph-reason-rel">{eventText(r, lang)} ({year(r.date)}) <CertChip c={r.certainty} /> <Evidence r={r} /></span>)}
    {c.notCounted.map((n) => { const h = prevList(c, n.listId); return <span key={n.partyId + n.listId} className="tiny muted">{L(`Not counted: ${partyShort(n.partyId, 'en')} ran inside ${h ? listShort(h, 'en') : '?'} in ${py}; its votes cannot be divided.`, `לא נספרה: ${partyShort(n.partyId, 'he')} רצה בתוך ${h ? listShort(h, 'he') : '?'} ${hebrewPrefix('ב', py)}; אי אפשר לחלק את קולותיה.`)}</span>; })}
  </div>;
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
    <h3>{L('History', 'היסטוריה')} <span className="tiny muted">· {ran.length > 1 ? L(`since ${yearLabel(h.firstRun, 'en')}`, `מאז ${yearLabel(h.firstRun, 'he')}`) : L(`only ${yearLabel(h.firstRun, 'en')}`, `רק ${yearLabel(h.firstRun, 'he')}`)}</span></h3>
    {chips.length > 1 && <div className="ph-chips" role="group" aria-label={L('Whose history', 'ההיסטוריה של')}>
      {chips.map((p) => <button key={p} type="button" className={`btn small ${p === active ? 'primary' : ''}`} aria-pressed={p === active} onClick={() => setPid(p)}>{partyShort(p, lang)}</button>)}</div>}
    {h.eras.length > 1 && <div className="tiny muted ph-chain">{h.eras.map((e) => e.name).filter((n, i, a) => a.indexOf(n) === i).join(lang === 'he' ? ' ← ' : ' → ')}</div>}
    {ran.length > 1 && <div ref={ref} className="ph-compact">
      <button type="button" className="ph-chartbtn" onClick={() => setOpen(true)} aria-label={L(`Open full history: ${partyShort(active, 'en')}`, `פתיחת ההיסטוריה המלאה: ${partyShort(active, 'he')}`)}>
        <HistoryChart compact bars={h.bars} eras={h.eras} events={h.chartEvents} selected={k} onSelect={() => setOpen(true)} width={width} height={96} unit="seats"
          label={L(`${partyShort(active, 'en')}: seats at each election`, `${partyShort(active, 'he')}: מנדטים בכל בחירות`)} />
      </button>
      <Legend compact />
    </div>}
    <ComparisonLine c={c} />
    <button type="button" className="btn small ph-full" onClick={() => setOpen(true)}>{L('Full history', 'היסטוריה מלאה')} <span aria-hidden>{lang === 'he' ? '‹' : '›'}</span></button>
    {open && <HistorySheet parties={chips} initial={active} electionIdx={k} onClose={() => setOpen(false)} />}
  </section>;
}

function Legend({ compact, metric = 'seats' }: { compact?: boolean; metric?: 'seats' | 'share' }) {
  const L = useL();
  return <div className={`ph-legend ${compact ? 'tiny' : 'small'}`}>
    {metric === 'seats' ? <>
      <span><i className="ph-sw solid" />{L('Own members', 'חברי המפלגה')}</span>
      <span><i className="ph-sw hatch" />{L('Partners’ members', 'חברי השותפות')}</span>
    </> : <>
      <span><i className="ph-sw solid" />{L('Ran alone', 'רצה לבדה')}</span>
      <span><i className="ph-sw hatch" />{L('Joint list (whole list)', 'רשימה משותפת (כולה)')}</span>
      <span><i className="ph-sw dash" />{L('Inside another’s list', 'בתוך רשימה אחרת')}</span>
    </>}
    <span><b className="ph-gapkey" aria-hidden>·</b> {L('Did not run', 'לא התמודדה')}</span>
    {!compact && <Info title={L('Party history', 'היסטוריית מפלגה')}>{L('Each bar is the whole list the party ran in. Seats: solid is the party’s own elected members, hatched its partners’ (official candidate lists and Knesset records). Vote share: a joint list’s votes belong to the whole list and are never divided. Markers below are dated events; a dashed ring is probable, “?” is to verify.', 'כל עמודה היא הרשימה כולה שבה רצה המפלגה. מנדטים: החלק המלא הוא חברי המפלגה שנבחרו, המקווקו – חברי השותפות (רשימות המועמדים ורשומות הכנסת). שיעור קולות: קולות רשימה משותפת שייכים לרשימה כולה ואינם מחולקים. הסימונים מתחת הם אירועים מתוארכים; טבעת מקווקוות – סביר, ״?״ – לבדיקה.')}</Info>}
  </div>;
}

function PointCard({ p, identity }: { p: SeriesPoint; identity: Identity }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  void identity;
  if (!p.list) return <div className="ph-card"><b>{yearLabel(p.i, lang)}</b> · {L('Did not run', 'לא התמודדה')}</div>;
  const partners = names(p.partners, lang);
  const joint = p.role !== 'alone';
  return <div className="ph-card" aria-live="polite">
    <div><b>{yearLabel(p.i, lang)} · <bdi>{listShort(p.list, lang)}</bdi></b></div>
    <div>{L(`${p.seats} seats`, `${p.seats} מנדטים`)} · <bdi dir="ltr">{percent(p.votes, p.valid, digits)}</bdi> · <bdi dir="ltr">{fmtInt(p.votes)}</bdi> {L('votes', 'קולות')}</div>
    {joint && <div className="small">{p.role === 'led' ? L(`Led a joint list with ${partners}`, `הובילה רשימה משותפת עם ${partners}`) : L(`Ran inside a list led by ${partyShort(p.list.lead ?? p.partners[0], 'en')}`, `רצה ברשימה בראשות ${partyShort(p.list.lead ?? p.partners[0], 'he')}`)}</div>}
    {joint && <div className="small">{L('Elected: ', 'נבחרו: ')}{[...p.members, ...p.partners].map((q) => { const n = p.list!.elected[q]; return `${partyShort(q, lang)} ${n ?? '?'}`; }).join(' · ')}{p.list.unknownElected > 0 ? L(` · unknown ${p.list.unknownElected}`, ` · לא ידוע ${p.list.unknownElected}`) : ''}</div>}
    {joint && <div className="tiny muted">{L('Votes are for the whole list', 'הקולות ניתנו לרשימה כולה')}</div>}
    {p.era && partyShort(p.era, lang) !== listShort(p.list, lang) && <div className="tiny muted">{L(`As ${partyShort(p.era, 'en')}`, `בשם ${partyShort(p.era, 'he')}`)}</div>}
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
        <div className="small muted">{L(`Ran in ${ran.length} of ${h.points.length - h.firstRun} elections${since} · won seats in ${won.length}`, `התמודדה ב־${ran.length} מתוך ${h.points.length - h.firstRun} בחירות${since} · זכתה במנדטים ב־${won.length}`)}{best && best.seats > 0 ? L(` · most: ${best.seats} (${yearLabel(best.i, 'en')})`, ` · שיא: ${best.seats} (${yearLabel(best.i, 'he')})`) : ''}</div>
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
    <Legend metric={metric} />
    {cur && <PointCard p={cur} identity={h.identity} />}
    {(h.events.length > 0 || open.length > 0) && <>
      <h3>{L('Events', 'אירועים')}</h3>
      <ul className="ph-events">
        {h.events.map((r) => <li key={r.id}>
          <span className={`ph-evdot ph-ev-${r.certainty}`} aria-hidden>{r.certainty === 'confirmed' || r.certainty === 'probable' ? GLYPH[r.kind] ?? '•' : '?'}</span>
          <span className="ph-evyear"><bdi dir="ltr">{dateText(r)}</bdi></span>
          <span>{eventText(r, lang)}</span>
          <span className="ph-evmeta"><CertChip c={r.certainty} /><Evidence r={r} /></span>
        </li>)}
        {open.map((o) => <li key={o.id}>
          <span className="ph-evdot ph-ev-unknown" aria-hidden>?</span><span className="ph-evyear">—</span>
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
          <td className="n">{p.seats}</td><td className="n">{p.role === 'alone' ? '—' : p.own ?? '?'}</td>
          <td className="n"><bdi dir="ltr">{fmtInt(p.votes)}</bdi></td><td className="n"><bdi dir="ltr">{percent(p.votes, p.valid, digits)}</bdi></td>
        </tr>)}</tbody>
      </table></div>
      <p className="tiny muted">{L('Votes and share are the whole list’s, also for a joint list.', 'הקולות והשיעור הם של הרשימה כולה, גם ברשימה משותפת.')}</p>
    </details>
  </Sheet>;
}

