import { seatOrder } from './Hemicycle.tsx';
import { Floating, useHoverBridge } from '../floating.tsx';
import { GraphicChanges } from './GraphicChanges.tsx';
import { useEffect, useId, useLayoutEffect, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, isolate } from '../format.ts';
import { setState, useDigits, useStore } from '../store.ts';
import { apportion } from '../../model/actions.ts';
import { Info, Seg } from './ui.tsx';
import { noSeatVotes, regionEdges } from '../chartGeometry.ts';

type Tip = { x: number; y: number; html: React.ReactNode } | null;

/** The width an SVG chart is drawn at: its box's width, kept between `min` and `max`, so a chart scales
 *  up on wide screens but its text never shrinks below its set size on a phone. */
export function useChartWidth(max: number, min = 300) {
  // a callback ref, so a chart that mounts later (after a run) is still measured
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [w, setW] = useState(max);
  const [, setFonts] = useState(0);
  // labels are measured in the page font; draw again once it has loaded
  useEffect(() => { let live = true; document.fonts?.ready.then(() => { if (live) setFonts((n) => n + 1); }); return () => { live = false; }; }, []);
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const fit = () => { if (el.clientWidth) setW(Math.round(Math.max(min, Math.min(max, el.clientWidth)))); };
    fit();
    const o = new ResizeObserver(fit); o.observe(el);
    return () => o.disconnect();
  }, [el, max, min]);
  return [setEl, w] as const;
}
let measureCtx: CanvasRenderingContext2D | null | undefined;
/** The drawn width of an 11.5px chart label in the page font (an estimate where no canvas exists). */
export function textWidth(t: string) {
  if (measureCtx === undefined) { try { measureCtx = document.createElement('canvas').getContext('2d'); } catch { measureCtx = null; } }
  if (!measureCtx) return t.length * 6.6;
  measureCtx.font = `11.5px ${getComputedStyle(document.body).fontFamily}`;
  return measureCtx.measureText(t).width;
}
/** A name cut to fit `px` of an 11.5px label, measured, so a name is cut only when it truly does not fit. */
export const clip = (t: string, px: number) => {
  if (textWidth(t) <= px) return t;
  let lo = 1, hi = t.length - 1;
  while (lo < hi) { const m = Math.ceil((lo + hi) / 2); if (textWidth(t.slice(0, m).trimEnd() + '…') <= px) lo = m; else hi = m - 1; }
  return t.slice(0, lo).trimEnd() + '…';
};
/** The label column for a set of names: as wide as the longest name needs, up to `cap`. */
const labelColumn = (names: string[], cap: number) => Math.min(cap, Math.ceil(Math.max(40, ...names.map(textWidth))) + 16);
/** Bar outlines mixed toward the ink, so pale and dark list colours both keep an edge against the page. */
const edge = (c: string) => `color-mix(in srgb, ${c} 65%, var(--ink))`;

export function Charts({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  // switching views keeps the height the last view took, so a shorter view never shrinks the page and
  // scrolls it away from the switch under the pointer; the table uses that room for more rows
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const [reserve, setReserve] = useState(0);
  const switchTo = (v: 'chart' | 'table') => { if (v !== view) { setReserve(Math.max(reserve, area?.offsetHeight ?? 0)); setView(v); } };
  return (
    <div>
      <GraphicChanges s={s} r={r} />
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg label={L('View', 'תצוגה')} value={view} onChange={switchTo} options={[{ v: 'chart', label: L('Charts', 'תרשימים') }, { v: 'table', label: L('Table', 'טבלה') }]} />
      </div>
      <div ref={setArea} style={{ minHeight: reserve || undefined }}>
      {view === 'chart' ? (
        <>
        <Waffles s={s} r={r} />
        <hr />
        <div className="grid2 stack-sm" style={{ alignItems: 'start' }}>
          <VotesVsSeats s={s} r={r} />
          <ThresholdDistance s={s} r={r} />
        </div>
        </>
      ) : <ShareTable s={s} r={r} height={reserve} />}
      </div>
    </div>
  );
}

function rowsFor(s: Scenario, r: AllocationResult) {
  return s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }))
    .filter(({ l, lr }) => !l.withdrawn && (lr.seats > 0 || BigInt(l.votes) * 100n >= r.totalValid))
    .sort((a, b) => b.l.votes - a.l.votes);
}

const NO_SEAT = '__noseat';

function VotesVsSeats({ s, r }: { s: Scenario; r: AllocationResult }) {
  const showComponents = useStore(st=>st.showComponentSeats);
  const componentSeats = seatOrder(s,r,'list',showComponents);
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const [tip, setTip] = useState<Tip>(null);
  const bridge = useHoverBridge(() => setTip(null));
  const [box, W] = useChartWidth(600);
  const rows = rowsFor(s, r);
  const total = Number(r.totalValid), seats = s.rules.seats;
  const noSeat = noSeatVotes(s, r);
  const all = [...rows.map(({ l, lr }) => ({ id: l.id, name: listLabel(l, lang), color: l.color, v: l.votes, seats: lr.seats })), { id: NO_SEAT, name: L('Votes with no seat', 'קולות ללא מנדט'), color: 'var(--muted)', v: noSeat, seats: 0 }];
  const max = Math.max(...all.map((x) => Math.max(x.v / total, x.seats / seats)), 0.05);
  // on a phone each name sits on its own line above its bars, so names are not cut and bars keep the width
  const stacked = W < 420, he = lang === 'he';
  const labelW = stacked ? 0 : labelColumn(all.map((x) => x.name), Math.round(W * 0.42));
  const room = stacked ? 104 : 120, barH = 9, gap = 2, top = stacked ? 15 : 0, rowH = top + barH * 2 + gap + 12;
  const x0 = stacked ? 1 : labelW;
  const H = all.length * rowH + 14;
  const xs = (v: number) => (v / max) * (W - x0 - room);
  return (
    <figure ref={box} style={{ margin: 0, position: 'relative' }}>
      <figcaption><h3>{L('Share of votes vs share of seats', 'שיעור הקולות לעומת שיעור המנדטים')}</h3></figcaption>
      <div className="legend small" style={{ marginBottom: 4 }}>
        {/* votes are drawn as an outlined pale bar and seats as a solid one, so both read in either theme */}
        <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'color-mix(in srgb, var(--ink-2) 28%, transparent)', boxShadow: 'inset 0 0 0 1px var(--ink-2)' }} />{L('Votes (% of valid)', 'קולות (% מהכשרים)')}</span>
        <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--ink-2)' }} />{L('Seats (% of Knesset)', 'מנדטים (% מהכנסת)')}</span>
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Vote share versus seat share by list', 'שיעור קולות מול שיעור מנדטים לפי רשימה')}>
        {all.map((row, i) => {
          const y = 10 + i * rowH, yb = y + top;
          const vw = xs(row.v / total), sw = xs(row.seats / seats);
          const list = row.id !== NO_SEAT;
          // beside the bars, names sit flush against the axis in Hebrew (their reading edge) and at the column
          // start in English; stacked above the bars (phone), they start where the bars start
          const lx = stacked ? (he ? W - 4 : x0) : he ? labelW - 8 : 4;
          return (
            <g key={row.id} onMouseMove={(e) => { bridge.cancel(); setTip({ x: e.clientX, y: e.clientY, html: <><b>{row.name}</b><div>{L('Votes', 'קולות')}: {fmtInt(row.v)} ({fmtPct(row.v, total, digits)})</div>{list && <div>{L('Seats', 'מנדטים')}: {row.seats} ({fmtPct(row.seats, seats, digits)})</div>}</> }); }}
              onMouseLeave={bridge.leave} onClick={() => list && setState({ selectedListId: row.id })} style={{ cursor: list ? 'pointer' : 'default' }}>
              <rect x={0} y={y - 2} width={W} height={rowH - 4} fill="transparent" />
              <text x={lx} y={stacked ? y + 9 : yb + barH + 3} textAnchor={he ? 'end' : 'start'} fill="var(--ink)" data-chart-label=""><title>{row.name}</title>{isolate(clip(row.name, stacked ? W - 8 : labelW - 12))}</text>
              <rect className="bar" x={x0} y={yb + 0.5} width={vw} height={barH - 1} rx={2} fill={row.color} fillOpacity={0.28} stroke={edge(row.color)} strokeWidth={1} />
              {list && <rect className="bar" x={x0} y={yb + barH + gap} width={sw} height={barH} rx={2} fill={row.color} />}
              {componentSeats.filter(st=>st.listId===row.id).map((st,k)=>st.innerColor && <rect key={k} data-component-seat={st.partyId} x={x0+sw*k/row.seats} y={yb+barH+gap+2} width={sw/row.seats} height={barH-4} fill={st.innerColor}><title>{(lang==='he' ? s.lists.find(l=>l.id===row.id)?.parties?.find(p=>p.id===st.partyId)?.nameHe : s.lists.find(l=>l.id===row.id)?.parties?.find(p=>p.id===st.partyId)?.nameEn) ?? ''} · {row.name}</title></rect>)}
              <text x={x0 + Math.max(vw, sw) + 4} y={yb + barH + 3} textAnchor="start" className="tabnum">
                {fmtPct(row.v, total, 1)}{list ? ` → ${fmtPct(row.seats, seats, 1)}` : ''}
              </text>
            </g>
          );
        })}
        <line x1={x0} x2={x0} y1={4} y2={H - 4} stroke="var(--axis)" />
      </svg>
      {tip && <Floating onPointerEnter={bridge.cancel} onPointerLeave={bridge.leave} className="chart-tooltip" anchor={() => ({left: tip.x, right: tip.x, top: tip.y, bottom: tip.y})}>{tip.html}</Floating>}
    </figure>
  );
}

function ThresholdDistance({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [tip, setTip] = useState<Tip>(null);
  const bridge = useHoverBridge(() => setTip(null));
  const [box, W] = useChartWidth(600);
  const thr = Number(r.thresholdVotes);
  if (thr === 0) return <p className="small muted">{L('No percentage threshold in this election.', 'בבחירות אלה אין אחוז חסימה.')}</p>;
  const rows = s.lists.filter((l) => !l.withdrawn && l.votes > 0).map((l) => ({ l, d: l.votes - thr, name: listLabel(l, lang) })).sort((a, b) => Math.abs(a.d) - Math.abs(b.d)).slice(0, 10).sort((a, b) => b.d - a.d);
  const max = Math.max(...rows.map((x) => Math.abs(x.d)), 1);
  // a label column, then a symmetric bar area with room for numbers on both sides; the vote axis reads left
  // to right in both languages (owner, 2026-11-04), so "right of the line passes" holds in Hebrew too.
  // On a phone each name sits on its own line above its bar.
  const stacked = W < 420, he = lang === 'he';
  const labelW = 0;
  const top = 20, rowH = 48, H = rows.length * rowH + 14, numW = stacked ? 66 : 78;
  const half = (W - labelW - 2 * numW) / 2, mid = labelW + numW + half;
  return (
    <figure ref={box} style={{ margin: 0, position: 'relative' }}>
      <figcaption><h3>{L('Distance from the threshold (closest lists)', 'מרחק מאחוז החסימה (הרשימות הקרובות)')}</h3></figcaption>
      <p className="small muted" style={{ margin: '0 0 4px' }}>{L(`Threshold: ${fmtInt(thr)} votes. Bars right of the line pass.`, `אחוז החסימה: ${fmtInt(thr)} קולות. מימין לקו — עוברת.`)}</p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Votes above or below the threshold', 'קולות מעל או מתחת לאחוז החסימה')}>
        {rows.map(({ l, d, name }, i) => {
          const w = (Math.abs(d) / max) * half;
          const y = 8 + i * rowH, yb = y + top;
          const x = d >= 0 ? mid : mid - w;
          const lx = stacked ? (he ? W - 4 : 4) : mid + (d >= 0 ? 4 : -4);
          return (
            <g key={l.id} onMouseMove={(e) => { bridge.cancel(); setTip({ x: e.clientX, y: e.clientY, html: <><b>{name}</b><div>{fmtInt(l.votes)} {L('votes', 'קולות')}</div><div>{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))} {L('vs threshold', 'מול החסימה')}</div></> }); }}
              onMouseLeave={bridge.leave} onClick={() => setState({ selectedListId: l.id })} style={{ cursor: 'pointer' }}>
              <rect x={0} y={y - 3} width={W} height={rowH - 2} fill="transparent" />
              <text x={lx} y={y + 9} textAnchor={stacked ? (he ? 'end' : 'start') : (d >= 0 ? 'start' : 'end')} fill="var(--ink)" data-chart-label=""><title>{name}</title>{isolate(name)}</text>
              <rect className="bar" x={x} y={yb + 2} width={Math.max(1, w)} height={12} rx={2} fill={l.color} stroke={edge(l.color)} strokeWidth={1} />
              <text x={d >= 0 ? mid + w + 4 : mid - w - 4} y={yb + 12} textAnchor={d >= 0 ? 'start' : 'end'} className="tabnum">{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))}</text>
            </g>
          );
        })}
        <line x1={mid} x2={mid} y1={2} y2={H - 4} stroke="var(--ink)" strokeWidth={1.5} />
      </svg>
      {tip && <Floating onPointerEnter={bridge.cancel} onPointerLeave={bridge.leave} className="chart-tooltip" anchor={() => ({left: tip.x, right: tip.x, top: tip.y, bottom: tip.y})}>{tip.html}</Floating>}
    </figure>
  );
}

function ShareTable({ s, r, height }: { s: Scenario; r: AllocationResult; height: number }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const total = r.totalValid;
  const noSeat = noSeatVotes(s, r);
  return (
    <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={height > 520 ? { maxHeight: height } : undefined}>
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('% valid', '% מהכשרים')}</th><th className="n">{L('% qualifying', '% מהמשתתפים')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th className="n">{L('% seats', '% מנדטים')}</th>
          <th className="n"><span className="row" style={{ gap: 4, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>{L('Seats − votes', 'מנדטים − קולות')}<Info title={L('Seats − votes', 'מנדטים − קולות')}>{L('Share of seats minus share of valid votes, in percentage points. Above zero: more seats than votes.', 'שיעור המנדטים פחות שיעור הקולות הכשרים, בנקודות אחוז. מעל אפס: יותר מנדטים מקולות.')}</Info></span></th></tr></thead>
        <tbody>
          {s.lists.filter((l) => !l.withdrawn).sort((a, b) => b.votes - a.votes).map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return (
            <tr key={l.id}>
              <td><button type="button" className="table-action row" style={{ gap: 6, flexWrap: 'nowrap' }} onClick={() => setState({ selectedListId: l.id })}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</button></td>
              <td className="n">{fmtInt(l.votes)}</td><td className="n">{fmtPct(l.votes, total, digits)}</td>
              <td className="n">{lr.qualified ? fmtPct(l.votes, r.qualifyingVotes, digits) : '—'}</td>
              <td className="n">{lr.seats}</td><td className="n">{fmtPct(lr.seats, s.rules.seats, digits)}</td>
              <td className="n"><bdi dir="ltr">{(() => { const v = (lr.seats / s.rules.seats - l.votes / Number(total)) * 100; return `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v).toFixed(digits)}`; })()}</bdi></td>
            </tr>
          ); })}
          <tr><td><b>{L('Votes with no seat', 'קולות ללא מנדט')}</b> <Info term="unrepresented" /></td><td className="n"><b>{fmtInt(noSeat)}</b></td><td className="n"><b>{fmtPct(noSeat, total, digits)}</b></td><td /><td className="n">0</td><td /><td /></tr>
        </tbody>
      </table>
    </div>
  );
}

/** Votes vs seats as two unit charts: 200 squares of 0.5% of valid votes, and one square per seat.
 *  Votes for lists that won no seat are drawn hatched grey, so wasted votes stay visible; a line runs
 *  between every two lists, so neighbours of similar colour stay apart. */
export function Waffles({ s, r }: { s: Scenario; r: AllocationResult }) {
  const showComponents = useStore(st=>st.showComponentSeats);
  const L = useL();
  const lang = useLang();
  const hatch = useId();
  const cells = 200;
  const seatCells = seatOrder(s,r,'list',showComponents).map(st=>({color:st.color,id:st.listId,innerColor:st.innerColor,partyId:st.partyId}));
  // vote squares follow the seat squares' list order, so each list sits in the same place in both waffles
  const order = [...new Set(seatCells.map((c) => c.id))];
  const lists = s.lists.filter((l) => !l.withdrawn).map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }));
  const seated = lists.filter((x) => x.lr.seats > 0).sort((a, b) => order.indexOf(a.l.id) - order.indexOf(b.l.id));
  const wasted = noSeatVotes(s, r);
  const weights = [...seated.map((x) => x.l.votes), wasted];
  const counts = apportion(cells, weights);
  const voteCells: { color: string; id: string | null }[] = [];
  seated.forEach((x, i) => { for (let k = 0; k < counts[i]; k++) voteCells.push({ color: x.l.color, id: x.l.id }); });
  for (let k = 0; k < counts[counts.length - 1]; k++) voteCells.push({ color: `url(#${hatch})`, id: null });
  const grid = (items: { color: string; id: string | null; innerColor?: string; partyId?: string }[], cols: number, title: string) => {
    const size = 14, gap = 3, pitch = size + gap;
    const rows = Math.ceil(items.length / cols);
    // squares fill left to right in Hebrew too (owner, 2026-11-04)
    return (
      <figure style={{ margin: 0, maxWidth: cols * pitch }} data-waffle="">
        <figcaption className="small ink2" dir={lang === 'he' ? 'rtl' : 'ltr'} style={{ marginBottom: 4 }}>{title}</figcaption>
        <svg viewBox={`0 0 ${cols * pitch} ${rows * pitch}`} width="100%" style={{ maxWidth: cols * pitch }} role="img" aria-label={title}>
          <defs><pattern id={hatch} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="var(--grid)" /><line x1="0" y1="0" x2="0" y2="4" stroke="var(--muted)" strokeWidth="1.6" /></pattern></defs>
          {items.map((c, i) => <g key={i}><rect x={(i % cols) * pitch} y={Math.floor(i / cols) * pitch} width={size} height={size} rx={3} fill={c.color} style={{ cursor: c.id ? 'pointer' : 'default' }} onClick={() => c.id && setState({ selectedListId: c.id })}><title>{c.partyId && (s.factionSplits ?? []).includes(c.id ?? '') ? ((lang==='he' ? s.lists.find(l=>l.id===c.id)?.parties?.find(p=>p.id===c.partyId)?.nameHe : s.lists.find(l=>l.id===c.id)?.parties?.find(p=>p.id===c.partyId)?.nameEn) ?? '') + ' · ' : ''}{c.id ? listLabel(s.lists.find((l) => l.id === c.id)!, lang) : L('Votes for lists that won no seat', 'קולות לרשימות שלא זכו במנדט')}</title></rect>{c.innerColor && <circle data-component-seat={c.partyId} pointerEvents="none" cx={(i%cols)*pitch+size/2} cy={Math.floor(i/cols)*pitch+size/2} r={size*.31} fill={c.innerColor} />}</g>)}
          <g className="waffle-edges" stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="square" pointerEvents="none">
            {regionEdges(items.map((c) => c.id), cols, pitch, gap).map((e, k) => <line key={k} {...e} />)}
          </g>
        </svg>
      </figure>
    );
  };
  return (
    <div>
      <h3>{L('From votes to seats', 'מקולות למנדטים')}</h3>
      {/* votes then seats is a before→after pair, so it reads left to right in Hebrew too (owner, 2026-11-04) */}
      <div className="grid2 stack-sm" dir="ltr" style={{ alignItems: 'start' }}>
        {grid(voteCells, 20, L('Votes: each square is 0.5% of valid votes', 'קולות: כל ריבוע = 0.5% מהקולות הכשרים'))}
        {grid(seatCells, 12, L('Seats: each square is one seat', 'מנדטים: כל ריבוע = מנדט אחד'))}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {[...seated].sort((a, b) => b.l.votes - a.l.votes).map(({ l, lr }) => <span key={l.id} className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <span className="muted tabnum">{lr.seats}</span></span>)}
        {wasted > 0 && <span className="row" style={{ gap: 5 }}><svg width="10" height="10" aria-hidden><rect width="10" height="10" rx="2" fill={`url(#${hatch})`} /></svg>{L(`No seat: ${fmtPct(wasted, r.totalValid, 1)} of votes`, `ללא מנדט: ${fmtPct(wasted, r.totalValid, 1)} מהקולות`)}<Info term="unrepresented" /></span>}
      </div>
    </div>
  );
}
