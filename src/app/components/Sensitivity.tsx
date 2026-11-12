import { percent } from './Percentage.tsx';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { cachedAnalysis } from '../analysisCache.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { PartyName } from './PartyName.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { GraphicChanges } from './GraphicChanges.tsx';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { allocate } from '../../engine/allocate.ts';
import { sweepThreshold, type SweepResult } from '../../engine/analysis.ts';
import { cmp, percentToRational, toNumber, type Rational } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { runTasks } from '../analysisPool.ts';
import type { AnalysisTask, TransferOutcome } from '../analysisTasks.ts';
import { blocPieces, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { dispatch, useDigits } from '../store.ts';
import { Info, NumberInput } from './ui.tsx';
import { useChartWidth } from './Charts.tsx';

// Each tool answers its question as soon as the page opens, with defaults, and again whenever its inputs or the
// scenario change; the searches run in background workers and can be cancelled. The tools are keyed by election,
// so a list or bloc chosen in one election is never carried into another.
export function Sensitivity({ s, r }: { s: Scenario; r: AllocationResult }) {
  return (
    <>
      {/* above the two columns: inside the grid it would take a column and push the tools out of place */}
      <GraphicChanges s={s} r={r} />
      <div key={s.electionId} className="grid2 stack-sm sens" style={{ alignItems: 'start', gap: 18 }}>
        <VoteSweep s={s} r={r} />
        <div><BlocFlip s={s} r={r} /><hr /><ThresholdSweep s={s} r={r} /></div>
      </div>
    </>
  );
}

const seatsOf = (r: AllocationResult) => Object.fromEntries(r.lists.filter((x) => x.seats).map((x) => [x.id, x.seats]));
/** other lists whose seats differ from `now`, as "Name +1 · Name −2" */
function SeatChanges({ seats, now, skip = null, s }: { seats: Record<string, number>; now: Record<string, number>; skip?: string | null; s: Scenario }) {
  return Object.keys({ ...now, ...seats }).filter(id => id !== skip && (seats[id] ?? 0) !== (now[id] ?? 0)).map(id => <span key={id} style={{ display: 'inline-block', marginInlineEnd: 8 }}><PartyName s={s} id={id} /> <SeatDelta value={(seats[id] ?? 0) - (now[id] ?? 0)} /></span>);
}
/** scrolls a table's container (never the page) so the row sits just under the sticky header */
function revealRow(row: HTMLElement | null) {
  const box = row?.closest('.tablewrap') as HTMLElement | null;
  if (!row || !box) return;
  requestAnimationFrame(() => {
    const head = box.querySelector('thead')?.getBoundingClientRect().height ?? 0;
    const top = row.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientTop;
    if (top < head || top + row.offsetHeight > box.clientHeight) {
      const desired = Math.max(0, box.scrollTop + top - head);
      // Let the final row reach the header too; clamping to the table end cuts an earlier row in half.
      const extra = Math.max(0, desired - (box.scrollHeight - box.clientHeight));
      if (extra) box.style.paddingBottom = `${(parseFloat(box.style.paddingBottom) || 0) + extra}px`;
      box.scrollTop = desired;
    }
  });
}

type Sweep = SweepResult & { from: number; to: number; id: string; s: Scenario; now: Record<string, number> };

function VoteSweep({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const main = useMemo(() => s.lists.filter((x) => !x.withdrawn).sort((a, b) => b.votes - a.votes), [s]);
  const [picked, setPicked] = useState(main[0]?.id ?? '');
  // a merge or split can remove the chosen list; fall back to the largest rather than a list that no longer exists
  const l = main.find((x) => x.id === picked) ?? main[0];
  const id = l?.id ?? '';
  const thr0 = Number(r.thresholdVotes);
  const defaults = (v: number) => [Math.max(0, Math.round(Math.min(v * 0.7, thr0 * 0.9))), Math.round(Math.max(v * 1.3, thr0 * 1.1))];
  // the range follows the list's votes until the user sets it
  const [custom, setCustom] = useState<{ id: string; from: number; to: number } | null>(null);
  const [from, to] = custom && custom.id === id ? [custom.from, custom.to] : defaults(l?.votes ?? 0);
  const setRange = (a: number, b: number) => setCustom({ id, from: a, to: b });
  const valid = !!l && to > from;

  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [state, setState] = useState<'busy' | 'idle' | 'cancelled'>('idle');
  const [again, setAgain] = useState(0);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!valid) { setState('idle'); return; }
    setState('busy');
    const task = { kind: 'sweep', input: toEngineInput(s), target: id, from: BigInt(from), to: BigInt(to) } as const;
    const now = seatsOf(r);
    stop.current = runTasks([task], (_, result) => { stop.current = null; setState('idle'); setSweep({ ...result, from, to, id, s, now }); });
    return () => { stop.current?.(); stop.current = null; };
  }, [s, r, id, from, to, valid, again]);
  const cancel = () => { stop.current?.(); stop.current = null; setState('cancelled'); };
  const current = !!sweep && sweep.s === s && sweep.id === id && sweep.from === from && sweep.to === to;
  // while a new result is computed the previous one stays, dimmed, so the page does not jump
  const shown = sweep && (current || state === 'busy') ? sweep : null;

  const [box, W] = useChartWidth(720);
  const [sel, setSel] = useState<number | null>(null);
  const table = useRef<HTMLTableSectionElement>(null);
  const chart = useRef<SVGSVGElement>(null);
  const sid = shown?.id ?? id, sl = shown?.s.lists.find((x) => x.id === sid);
  const segs = shown?.segments ?? [];
  const nowAt = sl ? segs.findIndex((g) => BigInt(sl.votes) >= g.from && BigInt(sl.votes) <= g.to) : -1;
  const active = sel !== null && sel < segs.length ? sel : nowAt;
  useEffect(() => setSel(null), [shown]);
  useEffect(() => {
    const row = table.current?.children[active] as HTMLElement | undefined;
    if (!row) return;
    const update = () => revealRow(row);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(table.current!);
    return () => observer.disconnect();
  }, [shown, active]);

  const maxSeats = Math.max(1, ...segs.map((x) => x.seats[sid] ?? 0));
  const ticks = niceTicks(maxSeats);
  const x0 = 30, plotW = W - 50;
  const at = (v: number | bigint) => shown ? x0 + (Number(BigInt(v) - BigInt(shown.from)) / (shown.to - shown.from + 1)) * plotW : 0;
  const y = (n: number) => 150 - (n / ticks[ticks.length - 1]) * 130;
  // the keyboard chooses a segment as the pointer does: one tab stop on the bars and one on the rows, the arrow keys
  // move between segments (left and right on the bars, which never mirror; up and down in the table)
  const segKey = (e: React.KeyboardEvent, k: number, inTable: boolean) => {
    const back = inTable ? 'ArrowUp' : 'ArrowLeft', next = inTable ? 'ArrowDown' : 'ArrowRight';
    const to = e.key === back ? k - 1 : e.key === next ? k + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? segs.length - 1 : e.key === 'Enter' || e.key === ' ' ? k : null;
    if (to === null) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(segs.length - 1, to));
    setSel(j);
    (inTable ? table.current?.children[j] as HTMLElement | undefined : chart.current?.querySelector<SVGElement>(`[data-seg="${j}"]`))?.focus();
  };
  return (
    <div>
      <h3>{L('Votes → seats', 'קולות ← מנדטים')} <Info title={L('Votes → seats', 'קולות ← מנדטים')}>{L('The seats one list wins at every vote count in the range. All other lists keep their votes, so the valid total changes with this list. Boundaries are exact whole vote counts.', 'המנדטים שרשימה אחת מקבלת בכל מספר קולות בטווח. שאר הרשימות שומרות על קולותיהן, ולכן סך הקולות הכשרים משתנה עם הרשימה. הגבולות הם מספרי קולות מדויקים.')}</Info></h3>
      <div className="row">
        <ChoicePicker label={L('List', 'רשימה')} value={id} onChange={setPicked} options={main.slice(0, 30).map(x => ({ value: x.id, label: listLabel(x, lang), preview: <span className="swatch" style={{ background: x.color }} /> }))} />
        {/* one label in the page's direction, then the range low to high, left to right as on the chart's axis */}
        <span className="row" role="group" aria-label={L('Vote range', 'טווח קולות')} style={{ gap: 6 }}>
          <span className="small">{L('Vote range', 'טווח קולות')}</span>
          <span className="row" dir="ltr" style={{ flexWrap: 'nowrap', gap: 6 }}>
            <NumberInput value={from} onCommit={(n) => setRange(n, to)} label={L('From', 'מ')} width={100} /><span aria-hidden="true">–</span>
            <NumberInput value={to} onCommit={(n) => setRange(from, n)} label={L('To', 'עד')} width={100} />
          </span>
        </span>
        {custom?.id === id && <button className="btn" onClick={() => setCustom(null)} title={L('Back to the default range', 'חזרה לטווח ברירת המחדל')}>{L('Reset', 'איפוס')}</button>}
      </div>
      {/* one status line of fixed height: computing, cancelled or an invalid range never moves the chart */}
      <p className="small muted row sens-status" role="status">
        {!valid ? <span role="alert">{L('The second number must be above the first.', 'המספר השני חייב להיות גדול מהראשון.')}</span>
          : state === 'busy' ? <>{L('Calculating exactly…', 'מחשב במדויק…')} <button className="btn small" onClick={cancel}>{L('Cancel', 'ביטול')}</button></>
          : state === 'cancelled' && !current ? <>{L('Cancelled.', 'בוטל.')} <button className="btn small" onClick={() => setAgain((n) => n + 1)}>{L('Run', 'הרצה')}</button></>
          : shown && !shown.exact ? <>{L(`Checked every ${fmtInt(shown.step)} votes`, `נבדק כל ${fmtInt(shown.step)} קולות`)} <Info title={L('Sampled range', 'טווח מדוגם')}>{L(`The range is wide, so the result was calculated every ${fmtInt(shown.step)} votes and each change was then located to the exact vote. A change that reverses within ${fmtInt(shown.step)} votes could be missed; narrow the range to 50,000 votes or less for a complete result.`, `הטווח רחב, ולכן חושב כל ${fmtInt(shown.step)} קולות וכל שינוי אותר עד הקול המדויק. שינוי שמתהפך בתוך ${fmtInt(shown.step)} קולות עלול להיעלם; צמצמו את הטווח ל-50,000 קולות או פחות לתוצאה מלאה.`)}</Info></>
          : null}
      </p>
      <div ref={box}>
      {!shown && <><svg className="chart" viewBox={`0 0 ${W} 180`} width="100%" aria-hidden /><div style={{ height: 300 }} /></>}
      {shown && (
        <div aria-busy={!current} style={{ opacity: current ? 1 : 0.45, transition: 'opacity .2s' }}>
          <div>
          <svg ref={chart} className="chart" viewBox={`0 0 ${W} 180`} width="100%" role="group" aria-label={L('Seats against votes', 'מנדטים מול קולות')}>
            {ticks.map((t) => <g key={t}><line className="gridl" x1={x0} x2={x0 + plotW} y1={y(t)} y2={y(t)} /><text x={x0 - 6} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
            {segs.map((sg, k) => {
              const a = at(sg.from), b = at(sg.to + 1n), n = sg.seats[sid] ?? 0;
              return <rect key={k} x={a} y={y(n)} width={Math.max(1, b - a - 1)} height={150 - y(n)} fill={sl?.color} opacity={k === active ? 1 : 0.75} stroke={k === active ? 'var(--ink)' : 'none'} strokeWidth={1.5} rx={2}
                data-seg={k} role="button" tabIndex={k === active ? 0 : -1} aria-pressed={k === active}
                aria-label={L(`Votes ${fmtInt(sg.from)}–${fmtInt(sg.to)}: ${n} seats`, `קולות ${fmtInt(sg.from)}–${fmtInt(sg.to)}: ${n} מנדטים`)}
                style={{ cursor: 'pointer' }} onClick={() => setSel(k)} onKeyDown={(e) => segKey(e, k, false)}><title>{`${fmtInt(sg.from)}–${fmtInt(sg.to)}: ${n}`}</title></rect>;
            })}
            {/* where the list stands now */}
            {sl && nowAt >= 0 && <g><line x1={at(sl.votes)} x2={at(sl.votes)} y1={12} y2={154} stroke="var(--ink)" strokeDasharray="3 3" /><text x={at(sl.votes)} y={10} textAnchor="middle" fill="var(--ink)">{L('now', 'עכשיו')}</text></g>}
            <line x1={x0} x2={x0 + plotW} y1={150} y2={150} stroke="var(--axis)" />
            <text x={x0} y={165}>{fmtInt(shown.from)}</text><text x={x0 + plotW} y={165} textAnchor="end">{fmtInt(shown.to)}</text>
            <text x={x0 + plotW / 2} y={177} textAnchor="middle">{L('votes', 'קולות')}</text>
          </svg>
          </div>
          <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 300 }}>
            <table className="tbl sweep-tbl">
              <thead><tr><th className="n">{L('Votes from', 'קולות מ')}</th><th className="n">{L('to', 'עד')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th>{L('Other lists vs now', 'רשימות אחרות לעומת עכשיו')}</th></tr></thead>
              <tbody ref={table}>{segs.map((sg, k) => (
                <tr key={k} className={k === active ? 'sel' : undefined} aria-current={k === nowAt || undefined} onClick={() => setSel(k)}
                  tabIndex={k === active ? 0 : -1} onKeyDown={(e) => segKey(e, k, true)}>
                  <td className="n">{fmtInt(sg.from)}</td><td className="n">{fmtInt(sg.to)}</td>
                  <td className="n"><b>{sg.seats[sid] ?? 0}</b>{!sg.qualified.includes(sid) ? <span className="muted" title={L('Below the threshold', 'מתחת לאחוז החסימה')}> ✕</span> : ''}{k === nowAt && <span className="muted"> · {L('now', 'עכשיו')}</span>}</td>
                  <td className="small"><SeatChanges seats={sg.seats} now={shown.now} skip={sid} s={shown.s} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/** About four equal, round steps, including the first round tick above the data. */
function niceTicks(max: number) {
  const step = [1, 2, 5, 10, 20, 25, 50].find((x) => max / x <= 4) ?? Math.ceil(max / 200) * 50;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

/** a percentage field committed on Enter or leaving it, so a half-typed value is never judged */
function PctInput({ value, onCommit, label }: { value: string; onCommit: (v: string) => void; label: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return <input type="text" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onCommit(text)}
    onKeyDown={(e) => { if (e.key === 'Enter') onCommit(text); }} style={{ width: 60 }} aria-label={label} />;
}

/** a threshold as a capped percentage; chart labels pass svg */
const pctText = (r: Rational, digits: number, svg = false) => percent(r.num, r.den, digits, undefined, { svg });

function ThresholdSweep({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const digits = useDigits();
  const [lo, setLo] = useState('1'); const [hi, setHi] = useState('5');
  const out = useMemo(() => {
    const clean = (x: string) => x.trim().replace('%', '');
    const a = Number(clean(lo)), b = Number(clean(hi));
    if (!clean(lo) || !clean(hi) || !Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b > 100 || a >= b) return null;
    try {
      const loR = percentToRational(clean(lo)), hiR = percentToRational(clean(hi));
      return { segs: cachedAnalysis({ kind: 'threshold', input: toEngineInput(s), loR, hiR }, () => sweepThreshold(toEngineInput(s), loR, hiR)), loR, hiR };
    } catch { return null; }
  }, [s, lo, hi]);
  const now = seatsOf(r);
  const cur = r.rules.threshold;

  const curRow = out ? out.segs.findIndex((g) => (cmp(g.fromPct, g.toPct) === 0 ? cmp(cur, g.fromPct) === 0 : cmp(cur, g.fromPct) > 0 && cmp(cur, g.toPct) <= 0)) : -1;
  const table = useRef<HTMLTableSectionElement>(null);
  useEffect(() => {
    const row = table.current?.children[curRow] as HTMLElement | undefined;
    if (!row) return;
    const update = () => revealRow(row);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(table.current!);
    return () => observer.disconnect();
  }, [out, curRow]);
  return (
    <div>
      <h3>{L('Threshold → seats', 'אחוז חסימה ← מנדטים')} <Info title={L('Threshold → seats', 'אחוז חסימה ← מנדטים')}>{L('The result at every threshold in the range, with the exact percentages where it changes. Experimental: the other rules stay as they are.', 'התוצאה בכל אחוז חסימה בטווח, עם האחוזים המדויקים שבהם היא משתנה. ניסיוני: שאר הכללים נשארים כפי שהם.')}</Info></h3>
      <div className="row">
        <span className="row" role="group" aria-label={L('Threshold range', 'טווח אחוזים')} style={{ gap: 6 }}>
          <span className="small">{L('Threshold range', 'טווח אחוזים')}</span>
          <span className="row" dir="ltr" style={{ flexWrap: 'nowrap', gap: 6 }}>
            <PctInput value={lo} onCommit={setLo} label={L('From %', 'מ-%')} />%<span aria-hidden="true">–</span>
            <PctInput value={hi} onCommit={setHi} label={L('To %', 'עד %')} />%
          </span>
        </span>
      </div>
      {!out && <p className="small" role="alert">{L('Enter percentages from 0 to 100 with “to” above “from”, e.g. 1 and 5.', 'הזינו אחוזים בין 0 ל-100 שבהם "עד" גדול מ"מ", למשל 1 ו-5.')}</p>}
      {out && <ThresholdLadder s={s} r={r} lo={out.loR} hi={out.hiR} />}
      {out && (
        <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 300, marginTop: 8 }}>
          <table className="tbl">
            <thead><tr><th className="n">{L('Threshold above', 'אחוז חסימה מעל')}</th><th className="n">{L('up to', 'עד')}</th><th className="n">{L('Lists in', 'רשימות')}</th><th>{L('Seats vs now', 'מנדטים לעומת עכשיו')}</th></tr></thead>
            <tbody ref={table}>{out.segs.map((sg, k) => (
              <tr key={k} className={k === curRow ? 'sel' : undefined} aria-current={k === curRow || undefined}>
                <td className="n">{pctText(sg.fromPct, digits)}</td><td className="n">{pctText(sg.toPct, digits)}</td>
                <td className="n">{sg.qualified.length}</td>
                <td className="small">{Object.keys({ ...now, ...sg.seats }).some(id => (sg.seats[id] ?? 0) !== (now[id] ?? 0)) ? <SeatChanges seats={sg.seats} now={now} s={s} /> : (k === curRow ? L('now', 'עכשיו') : L('same as now', 'כמו עכשיו'))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Each list whose share lies in the range, as a bar from the range start to its share: the highest threshold it
 *  passes. Lists sorted by share, so the bars form the staircase of lists dropping out as the threshold rises. */
function ThresholdLadder({ s, r, lo, hi }: { s: Scenario; r: AllocationResult; lo: Rational; hi: Rational }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const [box, W] = useChartWidth(720);
  const total = s.lists.filter((l) => !l.withdrawn).reduce((t, l) => t + BigInt(l.votes), 0n);
  const rows = total === 0n ? [] : s.lists.filter((l) => !l.withdrawn && l.votes > 0)
    .map((l) => ({ l, share: { num: BigInt(l.votes), den: total } }))
    .filter((x) => cmp(x.share, lo) > 0 && cmp(x.share, hi) <= 0).sort((a, b) => b.l.votes - a.l.votes);
  const a = toNumber(lo) * 100, b = toNumber(hi) * 100;
  const labelW = 16, right = 72, rowH = 40, top = 44;
  const plotW = W - labelW - right;
  const x = (p: number) => labelW + ((p - a) / (b - a)) * plotW;
  const cur = toNumber(r.rules.threshold) * 100;
  const H = top + rows.length * rowH + 24;
  const ticks = b - a <= 10 && Number.isInteger(a) && Number.isInteger(b) ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a, b];
  if (!rows.length) return <p className="small muted">{L('The same lists pass at every threshold in this range.', 'אותן רשימות עוברות בכל אחוז חסימה בטווח.')}</p>;
  return (
    <div ref={box} style={{ marginTop: 8 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={L('Highest threshold each list passes', 'אחוז החסימה הגבוה ביותר שכל רשימה עוברת')}>
        {ticks.map((t) => <g key={t}><line className="gridl" x1={x(t)} x2={x(t)} y1={top - 4} y2={H - 20} /><text x={x(t)} y={H - 6} textAnchor="middle">{Number.isInteger(t) ? `${t}%` : pctText(t === a ? lo : hi, digits, true)}</text></g>)}
        {cur >= a && cur <= b && <g><line x1={x(cur)} x2={x(cur)} y1={top - 12} y2={H - 20} stroke="var(--ink)" strokeDasharray="3 3" /><text x={x(cur)} y={12} textAnchor="middle" fill="var(--ink)">{L('now', 'עכשיו')}</text></g>}
        {rows.map(({ l, share }, i) => {
          const yy = top + i * rowH, p = toNumber(share) * 100, label = listLabel(l, lang);
          return <g key={l.id}>
            <text x={lang === 'he' ? W - 4 : 4} y={yy - 2} textAnchor={lang === 'he' ? 'end' : 'start'}><title>{label}</title>{label}</text>
            <rect x={x(a)} y={yy + 3} width={Math.max(1, x(p) - x(a))} height={12} fill={l.color} rx={2} stroke="var(--rule-2)" strokeWidth={0.5} />
            <text className="halo" x={W - 2} y={yy + 12} textAnchor="end">{pctText(share, digits, true)}</text>
          </g>;
        })}
      </svg>
    </div>
  );
}

function BlocFlip({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [picked, setPicked] = useState(s.blocs[0]?.id ?? '');
  const bloc = s.blocs.find((b) => b.id === picked) ?? s.blocs[0];
  const bid = bloc?.id ?? '';
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const members = useMemo(() => s.lists.filter((l) => l.bloc === bid).map((l) => l.id), [s, bid]);
  // the chamber's count: a party or member placed in another bloc counts there
  const seatsIn = (sc: Scenario, rr: AllocationResult) => blocPieces(sc, rr).filter((p) => p.bloc === bid).reduce((t, p) => t + p.n, 0);
  const seats = seatsIn(s, r);
  // the search counts whole lists' seats; a party or member counted in another bloc shifts the chamber's count by
  // `offset`, so the target is moved by it and every result is checked against the chamber's count after the transfer
  const listSeats = members.reduce((t, id) => t + (r.lists.find((x) => x.id === id)?.seats ?? 0), 0);
  const offset = seats - listSeats;
  const has = seats >= majority;

  type Found = { from: string; to: string; votes: bigint; unsure: boolean } | { none: true; unsure: boolean };
  const [res, setRes] = useState<{ s: Scenario; bid: string; found: Found } | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number; settling?: boolean } | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [again, setAgain] = useState(0);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!bid) return;
    const input = toEngineInput(s);
    const cands = s.lists.filter((l) => !l.withdrawn && BigInt(l.votes) * 200n >= r.totalValid);
    const tasks: Extract<AnalysisTask, { kind: 'groupTransfer' }>[] = [];
    for (const to of cands) for (const from of cands) {
      if (from.id === to.id) continue;
      const fromIn = members.includes(from.id), toIn = members.includes(to.id);
      if (has ? !(fromIn && !toIn) : !(!fromIn && toIn)) continue;
      tasks.push({ kind: 'groupTransfer', input, from: from.id, to: to.id, ids: members, n: majority - offset, below: has });
    }
    // the answer is chosen in the order above, however the workers finish
    type Task = (typeof tasks)[number];
    const open = (m: TransferOutcome) => m.reason === 'inconclusive' || (m.found && !m.exact);
    const bestOf = (xs: { t: Task; m: TransferOutcome }[]) => xs.reduce<{ from: string; to: string; votes: bigint } | null>((b, { t, m }) =>
      m.found && m.votes !== null && (!b || m.votes < b.votes) ? { from: t.from, to: t.to, votes: m.votes } : b, null);
    const show = (best: { from: string; to: string; votes: bigint } | null, unsure: boolean) => {
      setProgress(null);
      setRes({ s, bid, found: best ? { ...best, unsure } : { none: true, unsure } });
    };
    const finish = (outcomes: TransferOutcome[]) => {
      const first = tasks.map((t, k) => ({ t, m: outcomes[k] }));
      const best = bestOf(first), left = first.filter((x) => open(x.m));
      if (!best || !left.length) return show(best, left.length > 0);
      // a pair that could not test every count is searched again below the best answer, every count, so the answer is
      // exact unless that search too stays open (c-analysis-code-01: "At most" was shown for proven minimums). Meanwhile
      // the answer found is shown as "at most".
      show(best, true);
      const more = left.map((x) => ({ ...x.t, max: best.votes - 1n })), second: TransferOutcome[] = new Array(more.length);
      let done = 0;
      setProgress({ done: 0, total: more.length, settling: true });
      stop.current = runTasks(more, (i, m) => {
        second[i] = m; done++;
        if (done < more.length) return setProgress({ done, total: more.length, settling: true });
        stop.current = null;
        show(bestOf([...first, ...more.map((t, j) => ({ t, m: second[j] }))]), second.some(open));
      });
    };
    setCancelled(false);
    if (!tasks.length) { finish([]); return; }
    const outcomes: TransferOutcome[] = new Array(tasks.length);
    let done = 0;
    setProgress({ done: 0, total: tasks.length });
    stop.current = runTasks(tasks, (k, m) => {
      outcomes[k] = m; done++;
      if (done < tasks.length) return setProgress({ done, total: tasks.length });
      stop.current = null;
      finish(outcomes);
    });
    return () => { stop.current?.(); stop.current = null; };
  }, [s, r, bid, members, has, majority, offset, again]);
  const cancel = () => { stop.current?.(); stop.current = null; setProgress(null); setCancelled(true); };
  const current = !!res && res.s === s && res.bid === bid;
  const found = current && !('none' in res.found) ? res.found : null;
  // the chamber's count after the transfer, so the claim is checked against what the board will show
  const after = useMemo(() => {
    if (!found) return null;
    const v = Number(found.votes);
    const s2 = { ...s, lists: s.lists.map((l) => (l.id === found.from ? { ...l, votes: l.votes - v } : l.id === found.to ? { ...l, votes: l.votes + v } : l)) };
    return seatsIn(s2, allocate(toEngineInput(s2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found, s, bid]);

  const one = found?.votes === 1n;
  if (!bloc) return null;
  const meter = (n: number) => <div className="bp-meter sens-meter" aria-hidden style={{ '--bc': bloc.color } as CSSProperties}><i style={{ width: `${Math.min(100, (n / s.rules.seats) * 100)}%` }} /><span style={{ insetInlineStart: `${((majority - 0.5) / s.rules.seats) * 100}%` }} /></div>;
  return (
    <div>
      <h3>{L('Votes to flip a majority', 'קולות להיפוך הרוב')} <Info title={L('Votes to flip a majority', 'קולות להיפוך הרוב')}>{L(`The fewest votes moving from one list to another that give the bloc a majority (${majority} of ${s.rules.seats}), or end it. Every pair of a list inside and a list outside the bloc is searched, among lists with at least 0.5% of the votes, by the bloc assignment shown; each list's seats count for the list's own bloc.`, `מספר הקולות הקטן ביותר שעוברים מרשימה אחת לאחרת ונותנים לגוש רוב (${majority} מתוך ${s.rules.seats}), או מבטלים אותו. נבדק כל זוג של רשימה בגוש ורשימה מחוצה לו, מבין הרשימות עם 0.5% מהקולות לפחות, לפי השיוך לגושים המוצג; המנדטים של כל רשימה נספרים לגוש של הרשימה.`)}</Info></h3>
      <div className="row">
        <ChoicePicker label={L('Bloc', 'גוש')} value={bid} onChange={setPicked} options={s.blocs.map(b => ({ value: b.id, label: groupingName(b, lang), title: b.appDefined ? appGroupingExplanation(lang) : undefined, preview: <span className="swatch" style={{ background: b.color }} /> }))} />
        {meter(seats)}
        <span className="small"><bdi dir="ltr">{seats} / {majority}</bdi> {seats >= majority ? L('(has a majority)', '(יש רוב)') : L('(no majority)', '(אין רוב)')}</span>
      </div>
      <div className="sens-result">
        {progress && <p className="small muted row" role="status">{progress.settling
          ? L(`Checking for a smaller transfer… ${progress.done} of ${progress.total}`, `בודק אם יש מעבר קטן יותר… ${progress.done} מתוך ${progress.total}`)
          : L(`Searching exactly… ${progress.done} of ${progress.total} transfers`, `מחפש במדויק… ${progress.done} מתוך ${progress.total} מעברים`)}
          <button className="btn small" onClick={cancel}>{L('Cancel', 'ביטול')}</button></p>}
        {!progress && cancelled && !current && <p className="small muted row">{L('Cancelled.', 'בוטל.')} <button className="btn small" onClick={() => setAgain((n) => n + 1)}>{L('Search', 'חיפוש')}</button></p>}
        {current && 'none' in res.found && <p className="small">{res.found.unsure
          ? <>{L('No transfer found among the vote counts tested.', 'לא נמצא מעבר בין מספרי הקולות שנבדקו.')} <Info title={L('Not every count tested', 'לא כל מספר נבדק')}>{L('Some searches could not test every count, so one may still exist.', 'חלק מהחיפושים לא בדקו כל מספר, ולכן ייתכן שקיים.')}</Info></>
          : L('No single transfer between two lists achieves it.', 'אין מעבר יחיד בין שתי רשימות שמשיג זאת.')}</p>}
        {found && (
          <div className="callout small">
            {found.unsure && <>{L('At most', 'לכל היותר')} </>}<b>{fmtInt(found.votes)}</b>{found.unsure && <> <Info title={L('Smallest found', 'הקטן ביותר שנמצא')}>{L('Some searches could not test every count, so a smaller transfer may exist.', 'חלק מהחיפושים לא בדקו כל מספר, ולכן ייתכן מעבר קטן יותר.')}</Info></>} {one ? L('vote moving from ', 'קול שעובר מ') : L('votes moving from ', 'קולות שעוברים מ')}<PartyName s={s} id={found.from} /> {L('to ', 'ל')}<PartyName s={s} id={found.to} /> {after === null || (has ? after < majority : after >= majority)
              ? (has ? (one ? L('ends the majority.', 'מבטל את הרוב.') : L('end the majority.', 'מבטלים את הרוב.')) : (one ? L('gives the bloc a majority.', 'נותן לגוש רוב.') : L('give the bloc a majority.', 'נותנים לגוש רוב.')))
              : <>{one ? L('does not flip it in the chamber', 'אינו הופך אותו במליאה') : L('do not flip it in the chamber', 'אינם הופכים אותו במליאה')} <Info title={L('Members counted apart', 'חברים שנספרים בנפרד')}>{L('Some parties or members of these lists count for another bloc, and the search moves whole lists.', 'חלק מהמפלגות או החברים ברשימות אלה נספרים בגוש אחר, והחיפוש מזיז רשימות שלמות.')}</Info></>}
            {after !== null && <div className="row" style={{ marginTop: 6 }}>{meter(after)}<bdi dir="ltr">{seats} → {after} / {majority}</bdi></div>}
            <div><button className="btn small" style={{ marginTop: 6 }} onClick={() => dispatch({ type: 'transfer', from: found.from, to: found.to, votes: Number(found.votes) })}>{L('Apply', 'החלה')}</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
