import { useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { setState, useStore } from '../store.ts';
import { Seg } from './ui.tsx';

type Tip = { x: number; y: number; html: React.ReactNode } | null;

export function Charts({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <Seg label={L('View', 'תצוגה')} value={view} onChange={setView} options={[{ v: 'chart', label: L('Charts', 'תרשימים') }, { v: 'table', label: L('Table', 'טבלה') }]} />
      </div>
      {view === 'chart' ? (
        <div className="grid2" style={{ alignItems: 'start' }}>
          <VotesVsSeats s={s} r={r} />
          <ThresholdDistance s={s} r={r} />
        </div>
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
  const digits = useStore((st) => st.digits);
  const [tip, setTip] = useState<Tip>(null);
  const rows = rowsFor(s, r);
  const total = Number(r.totalValid), seats = s.rules.seats;
  const max = Math.max(...rows.map(({ l, lr }) => Math.max(l.votes / total, lr.seats / seats)), Number(r.unrepresentedVotes) / total, 0.05);
  const W = 520, labelW = 140, barH = 9, gap = 2, rowH = barH * 2 + gap + 12;
  const H = (rows.length + 1) * rowH + 30;
  const rtl = lang === 'he';
  const xs = (v: number) => (v / max) * (W - labelW - 70);
  const all = [...rows.map(({ l, lr }) => ({ id: l.id, name: listLabel(l, lang), color: l.color, v: l.votes, seats: lr.seats })), { id: '__unrep', name: L('Unrepresented votes', 'קולות שלא השתתפו'), color: 'var(--axis)', v: Number(r.unrepresentedVotes), seats: 0 }];
  return (
    <figure style={{ margin: 0, position: 'relative' }}>
      <figcaption><h4>{L('Share of votes vs share of seats', 'שיעור הקולות לעומת שיעור המנדטים')}</h4></figcaption>
      <div className="legend small" style={{ marginBottom: 4 }}>
        <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--ink-2)', opacity: 0.35 }} />{L('Votes (% of valid)', 'קולות (% מהכשרים)')}</span>
        <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--ink-2)' }} />{L('Seats (% of Knesset)', 'מנדטים (% מהכנסת)')}</span>
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Vote share versus seat share by list', 'שיעור קולות מול שיעור מנדטים לפי רשימה')}>
        {all.map((row, i) => {
          const y = 10 + i * rowH;
          const vw = xs(row.v / total), sw = xs(row.seats / seats);
          return (
            <g key={row.id} onMouseMove={(e) => setTip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, html: <><b>{row.name}</b><div>{L('Votes', 'קולות')}: {fmtInt(row.v)} ({fmtPct(row.v, total, digits)})</div>{row.id !== '__unrep' && <div>{L('Seats', 'מנדטים')}: {row.seats} ({fmtPct(row.seats, seats, digits)})</div>}</> })}
              onMouseLeave={() => setTip(null)} onClick={() => row.id !== '__unrep' && setState({ selectedListId: row.id })} style={{ cursor: 'pointer' }}>
              <rect x={0} y={y - 2} width={W} height={rowH - 4} fill="transparent" />
              <text x={rtl ? W - 4 : 4} y={y + barH + 3} textAnchor={rtl ? 'end' : 'start'} fill="var(--ink)">{row.name.length > 20 ? row.name.slice(0, 19) + '…' : row.name}</text>
              <rect className="bar" x={rtl ? W - labelW - vw : labelW} y={y} width={vw} height={barH} rx={2} fill={row.color} opacity={0.38} />
              <rect className="bar" x={rtl ? W - labelW - sw : labelW} y={y + barH + gap} width={sw} height={barH} rx={2} fill={row.color} />
              <text x={rtl ? W - labelW - Math.max(vw, sw) - 4 : labelW + Math.max(vw, sw) + 4} y={y + barH + 3} textAnchor={rtl ? 'end' : 'start'} className="tabnum">
                {fmtPct(row.v, total, 1)}{row.id !== '__unrep' ? ` / ${fmtPct(row.seats, seats, 1)}` : ''}
              </text>
            </g>
          );
        })}
        <line x1={rtl ? W - labelW : labelW} x2={rtl ? W - labelW : labelW} y1={4} y2={H - 20} stroke="var(--axis)" />
      </svg>
      {tip && <div className="tip chamber" style={{ position: 'absolute', left: tip.x + 12, top: tip.y + 30, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 9px', fontSize: 12.5, pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,.15)' }}>{tip.html}</div>}
    </figure>
  );
}

function ThresholdDistance({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [tip, setTip] = useState<Tip>(null);
  const thr = Number(r.thresholdVotes);
  const rows = s.lists.filter((l) => !l.withdrawn && l.votes > 0).map((l) => ({ l, d: l.votes - thr })).sort((a, b) => Math.abs(a.d) - Math.abs(b.d)).slice(0, 10).sort((a, b) => b.d - a.d);
  const max = Math.max(...rows.map((x) => Math.abs(x.d)), 1);
  const W = 520, rowH = 24, H = rows.length * rowH + 30, mid = W / 2 + 40, half = W / 2 - 60;
  return (
    <figure style={{ margin: 0, position: 'relative' }}>
      <figcaption><h4>{L('Distance from the threshold (closest lists)', 'מרחק מאחוז החסימה (הרשימות הקרובות)')}</h4></figcaption>
      <p className="small muted" style={{ margin: '0 0 4px' }}>{L(`Threshold: ${fmtInt(thr)} votes. Bars right of the line pass.`, `אחוז החסימה: ${fmtInt(thr)} קולות. מימין לקו — עוברת.`)}</p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Votes above or below the threshold', 'קולות מעל או מתחת לאחוז החסימה')}>
        {rows.map(({ l, d }, i) => {
          const w = (Math.abs(d) / max) * half;
          const y = 8 + i * rowH;
          const x = d >= 0 ? mid : mid - w;
          return (
            <g key={l.id} onMouseMove={(e) => setTip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, html: <><b>{listLabel(l, lang)}</b><div>{fmtInt(l.votes)} {L('votes', 'קולות')}</div><div>{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))} {L('vs threshold', 'מול החסימה')}</div></> })}
              onMouseLeave={() => setTip(null)} onClick={() => setState({ selectedListId: l.id })} style={{ cursor: 'pointer' }}>
              <rect x={0} y={y - 3} width={W} height={rowH - 2} fill="transparent" />
              <text x={8} y={y + 11} fill="var(--ink)">{listLabel(l, lang).slice(0, 18)}</text>
              <rect className="bar" x={x} y={y + 2} width={Math.max(1, w)} height={12} rx={2} fill={l.color} />
              <text x={d >= 0 ? mid + w + 4 : mid - w - 4} y={y + 12} textAnchor={d >= 0 ? 'start' : 'end'} className="tabnum">{d >= 0 ? '+' : '−'}{fmtInt(Math.abs(d))}</text>
            </g>
          );
        })}
        <line x1={mid} x2={mid} y1={2} y2={H - 18} stroke="var(--ink)" strokeWidth={1.5} />
      </svg>
      {tip && <div style={{ position: 'absolute', left: tip.x + 12, top: tip.y + 40, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 9px', fontSize: 12.5, pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,.15)' }}>{tip.html}</div>}
    </figure>
  );
}

function ShareTable({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useStore((st) => st.digits);
  const total = r.totalValid;
  return (
    <div className="tablewrap">
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('% valid', '% מהכשרים')}</th><th className="n">{L('% qualifying', '% מהמשתתפים')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th className="n">{L('% seats', '% מנדטים')}</th><th className="n">{L('Seats − votes (pp)', 'מנדטים − קולות (נ"א)')}</th></tr></thead>
        <tbody>
          {[...s.lists].sort((a, b) => b.votes - a.votes).map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return (
            <tr key={l.id}>
              <td><span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</span></td>
              <td className="n">{fmtInt(l.votes)}</td><td className="n">{fmtPct(l.votes, total, digits)}</td>
              <td className="n">{lr.qualified ? fmtPct(l.votes, r.qualifyingVotes, digits) : '—'}</td>
              <td className="n">{lr.seats}</td><td className="n">{fmtPct(lr.seats, s.rules.seats, digits)}</td>
              <td className="n">{((lr.seats / s.rules.seats - l.votes / Number(total)) * 100).toFixed(digits)}</td>
            </tr>
          ); })}
          <tr><td>{L('Unrepresented votes', 'קולות שלא השתתפו')}</td><td className="n">{fmtInt(r.unrepresentedVotes)}</td><td className="n">{fmtPct(r.unrepresentedVotes, total, digits)}</td><td /><td className="n">0</td><td /><td /></tr>
        </tbody>
      </table>
    </div>
  );
}
