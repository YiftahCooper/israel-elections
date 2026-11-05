import { Floating, useHoverBridge } from '../floating.tsx';
import { GraphicChanges } from './GraphicChanges.tsx';
import { useId, useLayoutEffect, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, isolate } from '../format.ts';
import { setState, useDigits } from '../store.ts';
import { apportion } from '../../model/actions.ts';
import { Seg } from './ui.tsx';

type Tip = { x: number; y: number; html: React.ReactNode } | null;

/** The width an SVG chart is drawn at: its box's width, kept between `min` and `max`, so a chart scales
 *  up on wide screens but its text never shrinks below its set size on a phone. */
export function useChartWidth(max: number, min = 300) {
  // a callback ref, so a chart that mounts later (after a run) is still measured
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [w, setW] = useState(max);
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const fit = () => { if (el.clientWidth) setW(Math.round(Math.max(min, Math.min(max, el.clientWidth)))); };
    fit();
    const o = new ResizeObserver(fit); o.observe(el);
    return () => o.disconnect();
  }, [el, max, min]);
  return [setEl, w] as const;
}
/** A name cut to fit `px` of an 11.5px label. */
export const clip = (t: string, px: number) => { const n = Math.max(6, Math.floor(px / 6.6)); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

export function Charts({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <div>
      <GraphicChanges s={s} r={r} />
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg label={L('View', 'תצוגה')} value={view} onChange={setView} options={[{ v: 'chart', label: L('Charts', 'תרשימים') }, { v: 'table', label: L('Table', 'טבלה') }]} />
      </div>
      {view === 'chart' ? (
        <>
        <Waffles s={s} r={r} />
        <hr />
        <div className="grid2 stack-sm" style={{ alignItems: 'start' }}>
          <VotesVsSeats s={s} r={r} />
          <ThresholdDistance s={s} r={r} />
        </div>
        </>
      ) : <ShareTable s={s} r={r} />}
    </div>
  );
}

function rowsFor(s: Scenario, r: AllocationResult) {
  return s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }))
    .filter(({ l, lr }) => lr.seats > 0 || BigInt(l.votes) * 100n >= r.totalValid)
    .sort((a, b) => b.l.votes - a.l.votes);
}

function VotesVsSeats({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const [tip, setTip] = useState<Tip>(null);
  const bridge = useHoverBridge(() => setTip(null));
  const [box, W] = useChartWidth(600);
  const rows = rowsFor(s, r);
  const total = Number(r.totalValid), seats = s.rules.seats;
  const max = Math.max(...rows.map(({ l, lr }) => Math.max(l.votes / total, lr.seats / seats)), Number(r.unrepresentedVotes) / total, 0.05);
  const labelW = Math.min(150, Math.round(W * 0.3)), room = W < 480 ? 92 : 120, barH = 9, gap = 2, rowH = barH * 2 + gap + 12;
  const H = (rows.length + 1) * rowH + 30;
  const rtl = false; // graphics read left to right in Hebrew too: bars, axes and fill order are never mirrored (owner, 2026-11-04)
  const xs = (v: number) => (v / max) * (W - labelW - room);
  const all = [...rows.map(({ l, lr }) => ({ id: l.id, name: listLabel(l, lang), color: l.color, v: l.votes, seats: lr.seats })), { id: '__unrep', name: L('Unrepresented votes', 'קולות שלא השתתפו'), color: 'var(--muted)', v: Number(r.unrepresentedVotes), seats: 0 }];
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
          const y = 10 + i * rowH;
          const vw = xs(row.v / total), sw = xs(row.seats / seats);
          return (
            <g key={row.id} onMouseMove={(e) => { bridge.cancel(); setTip({ x: e.clientX, y: e.clientY, html: <><b>{row.name}</b><div>{L('Votes', 'קולות')}: {fmtInt(row.v)} ({fmtPct(row.v, total, digits)})</div>{row.id !== '__unrep' && <div>{L('Seats', 'מנדטים')}: {row.seats} ({fmtPct(row.seats, seats, digits)})</div>}</> }); }}
              onMouseLeave={bridge.leave} onClick={() => row.id !== '__unrep' && setState({ selectedListId: row.id })} style={{ cursor: row.id !== '__unrep' ? 'pointer' : 'default' }}>
              <rect x={0} y={y - 2} width={W} height={rowH - 4} fill="transparent" />
              <text x={rtl ? W - 4 : 4} y={y + barH + 3} textAnchor={rtl ? 'end' : 'start'} fill="var(--ink)"><title>{row.name}</title>{isolate(clip(row.name, labelW - 8))}</text>
              <rect className="bar" x={rtl ? W - labelW - vw : labelW} y={y + 0.5} width={vw} height={barH - 1} rx={2} fill={row.color} fillOpacity={0.28} stroke={row.color} strokeWidth={1} />
              {row.id !== '__unrep' && <rect className="bar" x={rtl ? W - labelW - sw : labelW} y={y + barH + gap} width={sw} height={barH} rx={2} fill={row.color} />}
              <text x={rtl ? W - labelW - Math.max(vw, sw) - 4 : labelW + Math.max(vw, sw) + 4} y={y + barH + 3} textAnchor={rtl ? 'end' : 'start'} className="tabnum">
                {fmtPct(row.v, total, 1)}{row.id !== '__unrep' ? ` / ${fmtPct(row.seats, seats, 1)}` : ''}
              </text>
            </g>
          );
        })}
        <line x1={rtl ? W - labelW : labelW} x2={rtl ? W - labelW : labelW} y1={4} y2={H - 20} stroke="var(--axis)" />
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
  const rows = s.lists.filter((l) => !l.withdrawn && l.votes > 0).map((l) => ({ l, d: l.votes - thr })).sort((a, b) => Math.abs(a.d) - Math.abs(b.d)).slice(0, 10).sort((a, b) => b.d - a.d);
  const max = Math.max(...rows.map((x) => Math.abs(x.d)), 1);
  // a label column on the reading side (right in Hebrew), then a symmetric bar area with room for numbers
  // on both sides; the vote axis itself is not mirrored, so "right of the line passes" holds in both languages
  const rtl = false; // graphics read left to right in Hebrew too: bars, axes and fill order are never mirrored (owner, 2026-11-04)
  const rowH = 24, H = rows.length * rowH + 30, labelW = Math.min(160, Math.round(W * 0.3)), numW = W < 480 ? 62 : 78;
  const half = (W - labelW - 2 * numW) / 2, mid = (rtl ? 0 : labelW) + numW + half;
  return (
    <figure ref={box} style={{ margin: 0, position: 'relative' }}>
      <figcaption><h3>{L('Distance from the threshold (closest lists)', 'מרחק מאחוז החסימה (הרשימות הקרובות)')}</h3></figcaption>
      <p className="small muted" style={{ margin: '0 0 4px' }}>{L(`Threshold: ${fmtInt(thr)} votes. Bars right of the line pass.`, `אחוז החסימה: ${fmtInt(thr)} קולות. מימין לקו — עוברת.`)}</p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Votes above or below the threshold', 'קולות מעל או מתחת לאחוז החסימה')}>
        {rows.map(({ l, d }, i) => {
          const w = (Math.abs(d) / max) * half;
          const y = 8 + i * rowH;
          const x = d >= 0 ? mid : mid - w;
          return (
            <g key={l.id} onMouseMove={(e) => { bridge.cancel(); setTip({ x: e.clientX, y: e.clientY, html: <><b>{listLabel(l, lang)}</b><div>{fmtInt(l.votes)} {L('votes', 'קולות')}</div><div>{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))} {L('vs threshold', 'מול החסימה')}</div></> }); }}
              onMouseLeave={bridge.leave} onClick={() => setState({ selectedListId: l.id })} style={{ cursor: 'pointer' }}>
              <rect x={0} y={y - 3} width={W} height={rowH - 2} fill="transparent" />
              <text x={rtl ? W - 8 : 8} y={y + 11} textAnchor={rtl ? 'end' : 'start'} fill="var(--ink)"><title>{listLabel(l, lang)}</title>{isolate(clip(listLabel(l, lang), labelW - 12))}</text>
              <rect className="bar" x={x} y={y + 2} width={Math.max(1, w)} height={12} rx={2} fill={l.color} />
              <text x={d >= 0 ? mid + w + 4 : mid - w - 4} y={y + 12} textAnchor={d >= 0 ? 'start' : 'end'} className="tabnum">{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))}</text>
            </g>
          );
        })}
        <line x1={mid} x2={mid} y1={2} y2={H - 18} stroke="var(--ink)" strokeWidth={1.5} />
      </svg>
      {tip && <Floating onPointerEnter={bridge.cancel} onPointerLeave={bridge.leave} className="chart-tooltip" anchor={() => ({left: tip.x, right: tip.x, top: tip.y, bottom: tip.y})}>{tip.html}</Floating>}
    </figure>
  );
}

function ShareTable({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const total = r.totalValid;
  return (
    <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')}>
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('% valid', '% מהכשרים')}</th><th className="n">{L('% qualifying', '% מהמשתתפים')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th className="n">{L('% seats', '% מנדטים')}</th><th className="n">{L('Seats − votes (pp)', 'מנדטים − קולות (נ"א)')}</th></tr></thead>
        <tbody>
          {[...s.lists].sort((a, b) => b.votes - a.votes).map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return (
            <tr key={l.id}>
              <td><span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</span></td>
              <td className="n">{fmtInt(l.votes)}</td><td className="n">{fmtPct(l.votes, total, digits)}</td>
              <td className="n">{lr.qualified ? fmtPct(l.votes, r.qualifyingVotes, digits) : '—'}</td>
              <td className="n">{lr.seats}</td><td className="n">{fmtPct(lr.seats, s.rules.seats, digits)}</td>
              <td className="n"><bdi dir="ltr">{(() => { const v = (lr.seats / s.rules.seats - l.votes / Number(total)) * 100; return `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v).toFixed(digits)}`; })()}</bdi></td>
            </tr>
          ); })}
          <tr><td>{L('Unrepresented votes', 'קולות שלא השתתפו')}</td><td className="n">{fmtInt(r.unrepresentedVotes)}</td><td className="n">{fmtPct(r.unrepresentedVotes, total, digits)}</td><td /><td className="n">0</td><td /><td /></tr>
        </tbody>
      </table>
    </div>
  );
}

/** Votes vs seats as two unit charts: 200 squares of 0.5% of valid votes, and one square per seat.
 *  Votes for lists below the threshold are drawn hatched grey, so wasted votes stay visible. */
export function Waffles({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const hatch = useId();
  const cells = 200;
  const lists = s.lists.map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }));
  const qualified = lists.filter((x) => x.lr.qualified);
  const wasted = lists.filter((x) => !x.lr.qualified).reduce((t, x) => t + x.l.votes, 0);
  const weights = [...qualified.map((x) => x.l.votes), wasted];
  const counts = apportion(cells, weights);
  const voteCells: { color: string; id: string | null }[] = [];
  qualified.forEach((x, i) => { for (let k = 0; k < counts[i]; k++) voteCells.push({ color: x.l.color, id: x.l.id }); });
  for (let k = 0; k < counts[counts.length - 1]; k++) voteCells.push({ color: `url(#${hatch})`, id: null });
  const seatCells: { color: string; id: string }[] = [];
  qualified.forEach((x) => { for (let k = 0; k < x.lr.seats; k++) seatCells.push({ color: x.l.color, id: x.l.id }); });
  // squares fill in reading order: from the top right in Hebrew
  const rtl = false; // graphics read left to right in Hebrew too: bars, axes and fill order are never mirrored (owner, 2026-11-04)
  const grid = (items: { color: string; id: string | null }[], cols: number, title: string) => {
    const size = 14, gap = 3;
    const rows = Math.ceil(items.length / cols);
    return (
      <figure style={{ margin: 0 }}>
        <figcaption className="small ink2" style={{ marginBottom: 4 }}>{title}</figcaption>
        <svg viewBox={`0 0 ${cols * (size + gap)} ${rows * (size + gap)}`} width="100%" style={{ maxWidth: cols * (size + gap) }} role="img" aria-label={title}>
          <defs><pattern id={hatch} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="var(--grid)" /><line x1="0" y1="0" x2="0" y2="4" stroke="var(--muted)" strokeWidth="1.6" /></pattern></defs>
          {items.map((c, i) => <rect key={i} x={(rtl ? cols - 1 - (i % cols) : i % cols) * (size + gap)} y={Math.floor(i / cols) * (size + gap)} width={size} height={size} rx={3} fill={c.color} style={{ cursor: c.id ? 'pointer' : 'default' }} onClick={() => c.id && setState({ selectedListId: c.id })}><title>{c.id ? listLabel(s.lists.find((l) => l.id === c.id)!, lang) : L('Votes for lists below the threshold', 'קולות לרשימות מתחת לחסימה')}</title></rect>)}
        </svg>
      </figure>
    );
  };
  return (
    <div>
      <div className="grid2 stack-sm" style={{ alignItems: 'start' }}>
        {grid(voteCells, 20, L('Votes: each square is 0.5% of valid votes', 'קולות: כל ריבוע = 0.5% מהקולות הכשרים'))}
        {grid(seatCells, 12, L('Seats: each square is one seat', 'מנדטים: כל ריבוע = מנדט אחד'))}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {qualified.sort((a, b) => b.l.votes - a.l.votes).map(({ l, lr }) => <span key={l.id} className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <span className="muted tabnum">{lr.seats}</span></span>)}
        <span className="row" style={{ gap: 5 }}><svg width="10" height="10" aria-hidden><rect width="10" height="10" rx="2" fill={`url(#${hatch})`} /></svg>{L(`Below threshold: ${fmtPct(wasted, r.totalValid, 1)} of votes, 0 seats`, `מתחת לחסימה: ${fmtPct(wasted, r.totalValid, 1)} מהקולות, 0 מנדטים`)}</span>
      </div>
    </div>
  );
}
