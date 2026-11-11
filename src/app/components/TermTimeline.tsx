import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import { englishLabel } from '../../data/names.ts';
import { useMkRuntime, openMkHistory, type MkRuntime } from '../../history/mk.ts';
import { chamberOrder, holderAt, stepGlow, stepMarks, useTermRuntime, visibleSteps, type MarkKind, type PackedHolder, type StepView, type TermRuntime, type TimelineItem } from '../../history/termTimeline.ts';
import { arcLayout, annularRegions } from '../layout.ts';
import { listLabel } from '../derive.ts';
import { formatDate } from '../dateFormat.ts';
import { useL, useLang, type Lang } from '../i18n.ts';
import { useSetting, useStore } from '../store.ts';
import { Floating } from '../floating.tsx';
import { useHoverIntent } from '../hoverIntent.ts';
import { Info, Slip } from './ui.tsx';
import './TermTimeline.css';

type List = ElectionDataset['lists'][number];
const COAL = '#2f6db5', REST = '#a8782f';
/** Charts never mirror in Hebrew (owner rule): React's SVG types lack the global `dir` attribute, which SVG 2 has. */
const LTR_SVG = { dir: 'ltr' } as object;

const personName = (mk: MkRuntime | null, p: number | null | undefined, lang: Lang) => {
  if (p == null) return '';
  const x = mk?.people[p];
  return x ? (lang === 'he' ? x.he : englishLabel(x.en, x.he)) : '…';
};
const female = (mk: MkRuntime | null, p: number | null | undefined) => p != null && !!mk?.people[p]?.female;

/** A recorded reason in plain words (the research lane's codes or text); null when it has no plain wording yet. */
function reasonWords(reason: string | null | undefined, fem: boolean, L: (en: string, he: string) => string): string | null {
  if (!reason) return null;
  if (/norweg|נורבג/i.test(reason)) return L('Norwegian law', 'החוק הנורבגי');
  if (/resign|התפטר/i.test(reason)) return L('Resigned', fem ? 'התפטרה' : 'התפטר');
  if (/death|died|deceased|נפטר/i.test(reason)) return L('Died', fem ? 'נפטרה' : 'נפטר');
  return null;
}

/** A mark on a seat, drawn at the seat's top-right corner whatever the language (graphics are never mirrored). Each is
 *  a shape, so it reads without colour: ! rebel, × voted against, – abstained, arrow changed side, bent arrow
 *  replaced. */
export function SeatBadge({ kind, x, y, r }: { kind: MarkKind | 'D2'; x: number; y: number; r: number }) {
  const s = r; // badge radius
  const glyph = (() => {
    switch (kind) {
      case 'D2': return <><rect x={-s * 0.13} y={-s * 0.62} width={s * 0.26} height={s * 0.72} rx={s * 0.1} className="tl-glyph" /><circle cy={s * 0.42} r={s * 0.15} className="tl-glyph" /></>;
      case 'D3x': return <path d={`M${-s * 0.38} ${-s * 0.38}L${s * 0.38} ${s * 0.38}M${s * 0.38} ${-s * 0.38}L${-s * 0.38} ${s * 0.38}`} className="tl-stroke" strokeWidth={s * 0.24} />;
      case 'D3a': return <rect x={-s * 0.5} y={-s * 0.13} width={s} height={s * 0.26} rx={s * 0.08} className="tl-glyph" />;
      case 'D4c': case 'D4o': {
        const d = kind === 'D4c' ? -1 : 1; // towards the coalition (left) or away from it (right)
        return <path d={`M${-d * s * 0.5} 0H${d * s * 0.4}M${d * s * 0.05} ${-s * 0.38}L${d * s * 0.45} 0L${d * s * 0.05} ${s * 0.38}`} className="tl-stroke" strokeWidth={s * 0.2} />;
      }
      case 'rep': return <path d={`M${-s * 0.42} ${s * 0.5}V${-s * 0.02}Q${-s * 0.42} ${-s * 0.32} ${-s * 0.12} ${-s * 0.32}H${s * 0.42}M${s * 0.14} ${-s * 0.58}L${s * 0.44} ${-s * 0.32}L${s * 0.14} ${-s * 0.06}`} className="tl-stroke" strokeWidth={s * 0.18} />;
    }
  })();
  const shape = kind === 'D3a' ? <rect x={-s} y={-s} width={2 * s} height={2 * s} rx={s * 0.35} /> : <circle r={s} />;
  return <g className={`tl-badge tl-badge-${kind}`} transform={`translate(${x} ${y})`} aria-hidden="true">{shape}{glyph}</g>;
}
/** The same mark at text size, for the lines and the key. */
function MarkIcon({ kind }: { kind: MarkKind | 'D2' }) {
  return <svg className="tl-mark-icon" viewBox="-12 -12 24 24" aria-hidden="true"><SeatBadge kind={kind} x={0} y={0} r={10} /></svg>;
}
const itemMark = (it: TimelineItem): MarkKind | 'D2' | null =>
  it.marker === 'D2' ? 'D2' : it.marker === 'replacement' ? 'rep' : it.marks.find((m) => m[1] !== 'rep')?.[1] ?? (it.marker === 'D3' ? 'D3x' : null);

const pos = (term: TermRuntime, date: string) => Math.max(0, Math.min(100, (Date.parse(date) - Date.parse(term.opening)) / Math.max(1, Date.parse(term.end) - Date.parse(term.opening)) * 100));

/** The Knesset on a date, stepping through the term's events (owner decisions 8 and 11 Nov 2026). Only terms whose
 *  research establishes who supported the government have one. The data never depends on the scenario. */
export function TermTimeline({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang();
  const rt = useTermRuntime(); const mk = useMkRuntime();
  const level = useStore((st) => st.level);
  const seatChanges = useSetting('timelineSeatChanges');
  const norwegian = useSetting('seatStepsNorwegian'), left = useSetting('seatStepsLeft'), unknown = useSetting('seatStepsUnrecorded');
  const term = rt?.terms[Number(ds.id.slice(1))];
  const steps = useMemo(() => term?.timeline ? visibleSteps(term, { level, seatChanges, kinds: { norwegian, left, unknown } }) : [], [term, level, seatChanges, norwegian, left, unknown]);
  const [date, setDate] = useState<string | null>(null);
  // a level change keeps the reader's place: the last visible step on or before the date they were on
  const index = useMemo(() => {
    if (!steps.length) return -1;
    if (!date) return 0;
    let i = 0; steps.forEach((s, j) => { if (s.step.date <= date) i = j; });
    return i;
  }, [steps, date]);
  if (!term?.timeline || index < 0) return null;
  const view = steps[index];
  const go = (i: number) => setDate(steps[Math.max(0, Math.min(steps.length - 1, i))].step.date);
  return <section className="tl" data-term={term.k} aria-labelledby="tl-title">
    <h3 id="tl-title"><span className="after-help-anchor">{L('The Knesset on ', 'הכנסת ב־')}<bdi>{formatDate(view.step.date, lang)}</bdi> <Info title={L('The Knesset on a date', 'הכנסת בתאריך')}>
      {L('Step through the term: the chart shows every seat as it stood after that date. Coalition seats are on the left. Graphics run left to right in Hebrew too. A newcomer counts with their faction. The (i) beside each event gives its sources and how sure it is.',
        'צעד אחר צעד לאורך הכהונה: התרשים מציג כל מושב כפי שהיה אחרי התאריך. מושבי הקואליציה משמאל. גם בעברית התרשימים משמאל לימין. מי שנכנס לכנסת נספר עם סיעתו. ה־(i) ליד כל אירוע מציג את מקורותיו ואת מידת הוודאות.')}</Info></span></h3>
    <TimelineBar term={term} steps={steps} index={index} go={go} />
    <StepLines term={term} view={view} index={index} total={steps.length} ds={ds} mk={mk} />
    <Chamber key={term.k} term={term} view={view} ds={ds} mk={mk} />
  </section>;
}

function TimelineBar({ term, steps, index, go }: { term: TermRuntime; steps: StepView[]; index: number; go: (i: number) => void }) {
  const L = useL(); const lang = useLang();
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const nearest = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const at = (clientX - r.left) / r.width * 100;
    let best = 0, gap = Infinity;
    steps.forEach((s, i) => { const g = Math.abs(pos(term, s.step.date) - at); if (g < gap) { gap = g; best = i; } });
    return best;
  };
  const prev = steps[index - 1], next = steps[index + 1], cur = steps[index];
  const tall = (s: StepView) => s.items.some((it) => it.moved.length || ['government-sworn-in', 'term-start', 'term-end'].includes(it.kind));
  const gov = steps.find((s) => s.items.some((it) => it.kind === 'government-sworn-in'));
  const label = (s: StepView) => `${formatDate(s.step.date, lang)} · ${s.items.length} ${L(s.items.length === 1 ? 'event' : 'events', s.items.length === 1 ? 'אירוע' : 'אירועים')}`;
  // graphics run left to right in Hebrew too: earlier is always on the left, so ◀ means "earlier" in both languages
  return <div className="tl-bar" dir="ltr">
    <button type="button" className="btn tl-step" disabled={!prev} onClick={() => go(index - 1)} aria-label={prev ? L(`Previous step: ${formatDate(prev.step.date, lang)}`, `הצעד הקודם: ${formatDate(prev.step.date, lang)}`) : L('Previous step', 'הצעד הקודם')}>
      <span aria-hidden="true">◀</span>{prev && <span className="tl-step-date"><bdi>{formatDate(prev.step.date, lang)}</bdi></span>}</button>
    <div className="tl-track" ref={track} role="slider" tabIndex={0} aria-label={L('Date in the term', 'תאריך בכהונה')}
      aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1} aria-valuetext={label(cur)}
      onKeyDown={(e) => {
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowDown') go(index - 1); else if (k === 'ArrowRight' || k === 'ArrowUp') go(index + 1);
        else if (k === 'Home') go(0); else if (k === 'End') go(steps.length - 1); else return;
        e.preventDefault();
      }}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); go(nearest(e.clientX)); }}
      onPointerMove={(e) => { if (dragging.current) go(nearest(e.clientX)); }}
      onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      <span className="tl-line" />
      {steps.map((s, i) => <i key={s.step.date} className={`tl-tick ${tall(s) ? 'tall' : ''}`} style={{ left: `${pos(term, s.step.date)}%` }} data-date={s.step.date} data-current={i === index ? '' : undefined} />)}
      <b className="tl-knob" style={{ left: `${pos(term, cur.step.date)}%` }} />
      <span className="tl-end-label start">{L('Start', 'תחילה')}</span>
      {gov && pos(term, gov.step.date) > 14 && pos(term, gov.step.date) < 86 && <span className="tl-end-label" style={{ left: `${pos(term, gov.step.date)}%` }}>{L('Sworn in', 'השבעה')}</span>}
      <span className="tl-end-label end">{L('End', 'סוף')}</span>
    </div>
    <button type="button" className="btn tl-step" disabled={!next} onClick={() => go(index + 1)} aria-label={next ? L(`Next step: ${formatDate(next.step.date, lang)}`, `הצעד הבא: ${formatDate(next.step.date, lang)}`) : L('Next step', 'הצעד הבא')}>
      <span aria-hidden="true">▶</span>{next && <span className="tl-step-date"><bdi>{formatDate(next.step.date, lang)}</bdi></span>}</button>
  </div>;
}

function itemText(it: TimelineItem, term: TermRuntime, ds: ElectionDataset, mk: MkRuntime | null, lang: Lang, L: (en: string, he: string) => string): string {
  if (it.type === 'event' || it.en) return (lang === 'he' ? it.he : it.en) ?? '';
  const list = ds.lists.find((l) => l.id === term.seats[it.seat!].list);
  const where = list ? ` · ${listLabel(list, lang)}` : '';
  const why = reasonWords(it.reason, female(mk, it.out ?? it.in), L);
  const inN = personName(mk, it.in, lang), outN = personName(mk, it.out, lang), fIn = female(mk, it.in), fOut = female(mk, it.out);
  const text = it.in != null && it.out != null ? L(`${inN} replaces ${outN}`, `${inN} ${fIn ? 'נכנסת' : 'נכנס'} במקום ${outN}`)
    : it.in != null ? L(`${inN} enters the Knesset`, `${inN} ${fIn ? 'נכנסת' : 'נכנס'} לכנסת`)
    : L(`${outN} leaves the Knesset`, `${outN} ${fOut ? 'עוזבת' : 'עוזב'} את הכנסת`);
  return `${text}${where}${why ? ` · ${why}` : ''}`;
}

function Sources({ it }: { it: TimelineItem }) {
  const L = useL();
  const sure = it.certainty === 'confirmed' ? L('Confirmed from official records', 'מאומת ברשומות רשמיות') : it.certainty === 'probable' ? L('Probable: still to be checked against official records', 'סביר: טרם נבדק מול רשומות רשמיות')
    : it.certainty === 'disputed' ? L('Sources disagree', 'המקורות חלוקים') : it.certainty ? L('Provisional: from press reports, still to be checked', 'זמני: מדיווחים בעיתונות, טרם נבדק') : null;
  return <Info title={L('Sources & how sure', 'מקורות ומידת ודאות')}>
    {it.type === 'seat' && !it.sources.length ? <p>{L('From the Knesset’s membership records: who left and who entered on this date. Which seat a newcomer took is our pairing within the list.', 'מרשומות החברות של הכנסת: מי עזב ומי נכנס בתאריך זה. איזה מושב תפס מי שנכנס: השיוך שלנו, בתוך הרשימה.')}</p> : null}
    {sure && <p>{sure}</p>}
    {it.sources.map(([publisher, url], i) => <div key={i}><a href={url} target="_blank" rel="noreferrer"><bdi>{publisher}</bdi></a></div>)}
  </Info>;
}

function StepLines({ term, view, index, total, ds, mk }: { term: TermRuntime; view: StepView; index: number; total: number; ds: ElectionDataset; mk: MkRuntime | null }) {
  const L = useL(); const lang = useLang();
  return <div className="tl-lines" aria-live="polite">
    <div className="tl-lines-head"><span className="tl-count">{L('Step ', 'צעד ')}<bdi dir="ltr">{index + 1}</bdi>{L(' of ', ' מתוך ')}<bdi dir="ltr">{total}</bdi></span> <b><bdi>{formatDate(view.step.date, lang)}</bdi></b></div>
    <ul>{view.items.map((it) => { const mark = itemMark(it); return <li key={it.id} data-item={it.id} data-kind={it.kind}>
      {mark ? <MarkIcon kind={mark} /> : <span className="tl-mark-icon" />}
      <span className="after-help-anchor"><bdi>{itemText(it, term, ds, mk, lang, L)}</bdi> <Sources it={it} /></span>
    </li>; })}</ul>
  </div>;
}

function Chamber({ term, view, ds, mk }: { term: TermRuntime; view: StepView; ds: ElectionDataset; mk: MkRuntime | null }) {
  const L = useL(); const lang = useLang();
  const hoverPopups = useSetting('hoverPopups');
  const listOf = (id: string | null): List | undefined => ds.lists.find((l) => l.id === id);
  const rank = (id: string | null) => ds.lists.findIndex((l) => l.id === id);
  const { order, left } = useMemo(() => chamberOrder(term, view.step, rank), [term, view.step]); // eslint-disable-line react-hooks/exhaustive-deps
  const { seats: P, r: rad } = useMemo(() => arcLayout(term.seats.length), [term.seats.length]);
  const marks = stepMarks(view), glow = stepGlow(view);
  const sides = !!view.step.coalition;
  const cx = 500, cy = 470, R = 400, H = Math.max(490, 470 + (rad + 0.015) * 400 + 2);
  const regions = useMemo(() => annularRegions(P, P.map((_, i) => (sides && i >= left ? 1 : 0)), rad, cx, cy, R), [P, sides, left, rad]);
  const [open, setOpen] = useState<{ seat: number; anchor: Element } | null>(null);
  const [focusPos, setFocusPos] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const hover = useHoverIntent(() => setOpen(null), !!open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); setOpen(null); } };
    const onDoc = (e: PointerEvent) => { const t = e.target as Element; if (!t.closest?.('.tl-card') && !t.closest?.('[data-tl-seat]')) setOpen(null); };
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDoc);
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDoc); };
  }, [open]);
  const focusAt = (n: number) => { const m = (n + order.length) % order.length; setFocusPos(m); svg.current?.querySelector<SVGElement>(`[data-pos="${m}"]`)?.focus(); };
  const filled = order.filter((s) => holderAt(term, s, view.step.date)).length;
  const coal = view.step.coalition?.length ?? 0;
  const seatName = (s: number) => {
    const h = holderAt(term, s, view.step.date); const l = listOf(term.seats[s].list);
    const m = marks.get(s);
    const mark = m === 'D2' ? L('rebel', 'מורד') : m === 'D3x' ? L('voted against, stayed', 'הצבעה נגד, בלי לעזוב') : m === 'D3a' ? L('abstained, stayed', 'הימנעות, בלי לעזוב') : m === 'D4c' ? L('moved to the coalition', 'מעבר לקואליציה') : m === 'D4o' ? L('left the coalition', 'יציאה מהקואליציה') : m === 'rep' ? L('seat changed hands', 'חילופי מושב') : '';
    return [h ? personName(mk, h[0], lang) : L('Vacant', 'פנוי'), l ? listLabel(l, lang) : '', mark].filter(Boolean).join(' · ');
  };
  const rebels = view.step.rebels;
  const itemById = useMemo(() => new Map(term.timeline!.steps.flatMap((s) => s.items.map((it) => [it.id, { it, date: s.date }] as const))), [term]);
  const keyKinds = [...new Set([...marks.values()])].filter((k) => k !== 'D2');
  return <div className="chamber tl-chamber">
    <svg ref={svg} {...LTR_SVG} viewBox={`40 30 920 ${H - 30}`} role="group" aria-label={sides ? L(`Seat chart: coalition ${coal}, not in the coalition ${120 - coal}`, `תרשים המושבים: קואליציה ${coal}, לא בקואליציה ${120 - coal}`) : L('Seat chart', 'תרשים המושבים')}>
      {regions.map((w) => <path key={w.band} className="wedge solid" data-side={sides ? (w.band === 0 ? 'coalition' : 'rest') : 'none'} d={w.fill} style={{ ['--bc' as string]: sides ? (w.band === 0 ? COAL : REST) : 'var(--axis)' }} />)}
      {order.map((s, i) => {
        const p = P[i]; if (!p) return null;
        const x = cx + p.x * R, y = cy + p.y * R, r = rad * R;
        const h = holderAt(term, s, view.step.date); const l = listOf(term.seats[s].list);
        const m = marks.get(s);
        return <g key={s} data-tl-seat={s} data-person={h?.[0]} data-mark={m} data-side={sides ? (i < left ? 'coalition' : 'rest') : undefined}>
          {glow.has(s) && <circle key={view.step.date} className="tl-glow" cx={x} cy={y} r={r * 1.42} strokeWidth={r * 0.34} />}
          <circle className={`seat ${h ? '' : 'tl-vacant'}`} cx={x} cy={y} r={r} fill={h ? l?.color ?? 'var(--axis)' : 'none'} stroke="var(--ink-2)" strokeWidth={1}
            tabIndex={i === focusPos ? 0 : -1} role="button" aria-label={seatName(s)} data-pos={i} aria-expanded={open?.seat === s}
            onClick={(e) => { hover.keep(); setFocusPos(i); setOpen(open?.seat === s ? null : { seat: s, anchor: e.currentTarget }); }}
            onMouseEnter={(e) => { if (!hoverPopups) return; const a = e.currentTarget; hover.enter(() => setOpen({ seat: s, anchor: a })); }} onMouseLeave={hover.leave}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); focusAt(i + 1); }
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); focusAt(i - 1); }
              else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(open?.seat === s ? null : { seat: s, anchor: e.currentTarget }); }
            }}><title>{seatName(s)}</title></circle>
          {open?.seat === s && <circle className="tl-selected" cx={x} cy={y} r={r * 1.3} />}
          {m && <SeatBadge kind={m} x={x + r * 0.78} y={y - r * 0.78} r={r * 0.52} />}
        </g>;
      })}
      <text x={cx} y={cy - 40} textAnchor="middle" fontSize={44} fontWeight={700} fill="var(--ink)">{filled}</text>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={16} fill="var(--ink-2)">{L('seats · majority 61', 'מנדטים · רוב 61')}</text>
    </svg>
    <div className="tl-sides">{sides ? <>
      <span><i className="swatch bloc-swatch" style={{ ['--bc' as string]: COAL } as CSSProperties} />{L('Coalition', 'קואליציה')} <b><bdi dir="ltr">{coal}</bdi></b></span>
      <span><i className="swatch bloc-swatch" style={{ ['--bc' as string]: REST } as CSSProperties} />{L('Not in the coalition', 'לא בקואליציה')} <b><bdi dir="ltr">{filled - coal}</bdi></b></span>
    </> : <span className="muted">{L('Before the government is sworn in', 'לפני השבעת הממשלה')}</span>}</div>
    {(rebels.length > 0 || keyKinds.length > 0) && <div className="tl-key">
      {rebels.length > 0 && <div className="tl-rebels"><div className="row"><MarkIcon kind="D2" /><b>{L('Rebel', 'מורד')} <bdi dir="ltr">{rebels.length}</bdi></b> <Info title={L('Rebel', 'מורד')}>{L('An MK who left the side their party is on. The seat moves to that side and keeps the party colour.', 'חבר כנסת שעזב את הצד שבו נמצאת מפלגתו. המושב עובר לצד הזה ושומר על צבע המפלגה.')}</Info></div>
        <ul>{rebels.map(([seat, p, item]) => { const src = itemById.get(item); const l = listOf(term.seats[seat].list); const f = female(mk, p);
          const what = src?.it.kind === 'government-sworn-in' ? L('voted against the government', f ? 'הצביעה נגד הממשלה' : 'הצביע נגד הממשלה') : src?.it.kind === 'coalition-exit-statement' ? L('announced leaving the coalition', f ? 'הודיעה על פרישה מהקואליציה' : 'הודיע על פרישה מהקואליציה') : (lang === 'he' ? src?.it.he : src?.it.en) ?? '';
          return <li key={p}><button type="button" className="link-btn" onClick={() => mk?.people[p] && openMkHistory(p)}><b><bdi>{personName(mk, p, lang)}</bdi></b></button>{l && <> · <bdi>{listLabel(l, lang)}</bdi></>} — <bdi>{what}</bdi> {src && <span className="muted"><bdi>{formatDate(src.date, lang)}</bdi></span>}</li>; })}</ul></div>}
      {keyKinds.length > 0 && <div className="tl-marks">{keyKinds.map((k) => <span key={k} className="row"><MarkIcon kind={k} />{k === 'D3x' ? L('Voted against, stayed', 'הצבעה נגד, בלי לעזוב') : k === 'D3a' ? L('Abstained, stayed', 'הימנעות, בלי לעזוב') : k === 'D4c' ? L('Moved to the coalition', 'מעבר לקואליציה') : k === 'D4o' ? L('Left the coalition', 'יציאה מהקואליציה') : L('Seat changed hands', 'חילופי מושב')}</span>)}</div>}
    </div>}
    {open && <Floating role="dialog" label={L('Who sat here', 'מי ישב כאן')} className="tip tl-card" anchor={() => open.anchor.getBoundingClientRect()} onPointerEnter={hover.keep} onPointerLeave={hover.leave} preferAbove>
      <SeatCard term={term} seat={open.seat} date={view.step.date} list={listOf(term.seats[open.seat].list)} mk={mk} onClose={() => setOpen(null)} />
    </Floating>}
  </div>;
}

/** Everyone who held one seat during the term, with dates and why it changed (owner decision F1, 11 Nov 2026). */
export function SeatCard({ term, seat, date, list, mk, onClose }: { term: TermRuntime; seat: number; date?: string; list?: List; mk: MkRuntime | null; onClose?: () => void }) {
  const L = useL(); const lang = useLang();
  const holders = term.seats[seat].holders;
  const now = date ? holderAt(term, seat, date) : null;
  return <div className="tl-seat-card">
    <div className="row tl-card-head">{list && <Slip {...list} name={listLabel(list, lang)} size="sm" />}<b>{list ? listLabel(list, lang) : ''}</b>
      {onClose && <button type="button" className="btn small ghost icon-only tl-card-close" aria-label={L('Close', 'סגירה')} onClick={onClose}>×</button>}</div>
    <SeatHolderList term={term} holders={holders} now={now} mk={mk} />
  </div>;
}

function SeatHolderList({ term, holders, now, mk }: { term: TermRuntime; holders: readonly PackedHolder[]; now: PackedHolder | null; mk: MkRuntime | null }) {
  const L = useL(); const lang = useLang();
  const ours = holders.some((h) => h[4] && h[4] !== 'record');
  const factionName = (f: number) => { const x = mk?.factions[f]; return x ? (lang === 'he' ? x[0] : englishLabel(x[1], x[0])) : ''; };
  const line = (h: PackedHolder): ReactNode => {
    const fem = female(mk, h[0]);
    const came = h[3] === 'o' ? L('From the first sitting', 'מהישיבה הראשונה') : h[3] === 'r' ? L('Returned', fem ? 'חזרה לכנסת' : 'חזר לכנסת') : L('Entered', fem ? 'נכנסה לכנסת' : 'נכנס לכנסת');
    const why = reasonWords(h[5], fem, L);
    const ended = h[2] !== null && h[2] < term.end;
    const out = ended ? `${L('Left the Knesset', fem ? 'עזבה את הכנסת' : 'עזב את הכנסת')} · ${reasonWords(h[6], fem, L) ?? L('reason not yet recorded', 'הסיבה טרם תועדה')}` : L('Until the end of the term', 'עד סוף הכהונה');
    return <>{came}{why ? ` (${why})` : ''} · {out}</>;
  };
  return <>
    <div className="tl-holders-head row"><span>{L('Who sat here', 'מי ישב כאן')}</span>{ours && <Info title={L('Who sat here', 'מי ישב כאן')}>{L('The Knesset records who left and who entered, not which seat. A newcomer is shown in the seat of the member they replaced, within the same list.', 'הכנסת רושמת מי עזב ומי נכנס, לא באיזה מושב. מי שנכנס מוצג במושבו של מי שהחליף, באותה רשימה.')}</Info>}</div>
    <ol className="tl-holders">{holders.map((h, i) => <li key={i} aria-current={now === h ? 'true' : undefined}>
      <div>{mk?.people[h[0]] ? <button type="button" className="link-btn" onClick={() => openMkHistory(h[0])}><b><bdi>{personName(mk, h[0], lang)}</bdi></b></button> : <b><bdi>{personName(mk, h[0], lang)}</bdi></b>}
        {' '}<span className="muted small"><bdi dir={lang === 'he' ? 'rtl' : 'ltr'}><bdi>{formatDate(h[1], lang)}</bdi> – <bdi>{formatDate(h[2] && h[2] < term.end ? h[2] : term.end, lang)}</bdi></bdi></span></div>
      <div className="small">{line(h)}</div>
      {h[7].slice(1).map(([f, from]) => <div key={from} className="small muted">{L('Faction', 'סיעה')}: <bdi>{factionName(f)}</bdi> · <bdi>{formatDate(from, lang)}</bdi></div>)}
    </li>)}</ol>
  </>;
}

/** The election chart's seat card: who else held this seat during the term (only when someone did). */
export function SeatHoldersNote({ electionId, personId }: { electionId: string; personId: number | null }) {
  const rt = useTermRuntime(); const mk = useMkRuntime();
  const term = rt?.terms[Number(electionId.slice(1))];
  const seat = personId != null ? term?.openingSeat[personId] : undefined;
  if (!term || seat === undefined || term.seats[seat].holders.length < 2) return null;
  return <div className="tl-seat-note"><SeatHolderList term={term} holders={term.seats[seat].holders} now={null} mk={mk} /></div>;
}
