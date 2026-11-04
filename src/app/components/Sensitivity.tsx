import { GraphicChanges } from './GraphicChanges.tsx';
import { useEffect, useRef, useState } from 'react';
import { sweepThreshold, type SweepResult, type ThresholdSegment } from '../../engine/analysis.ts';
import { percentToRational } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { runTasks } from '../analysisPool.ts';
import type { AnalysisTask, TransferOutcome } from '../analysisTasks.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtRat, signed } from '../format.ts';
import { dispatch, toast } from '../store.ts';
import { Info, NumberInput } from './ui.tsx';
import { useChartWidth } from './Charts.tsx';

export function Sensitivity({ s, r }: { s: Scenario; r: AllocationResult }) {
  return (
    <>
      {/* above the two columns: inside the grid it would take a column and push the tools out of place */}
      <GraphicChanges s={s} r={r} />
      <div className="grid2 stack-sm" style={{ alignItems: 'start', gap: 18 }}>
        <VoteSweep s={s} r={r} />
        <div><ThresholdSweep s={s} r={r} /><hr /><BlocFlip s={s} r={r} /></div>
      </div>
    </>
  );
}

function VoteSweep({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const main = [...s.lists].sort((a, b) => b.votes - a.votes);
  const [id, setId] = useState(main[0]?.id ?? '');
  const l = s.lists.find((x) => x.id === id);
  const thr0 = Number(r.thresholdVotes);
  const range = (x: { votes: number } | undefined) => x ? [Math.max(0, Math.round(Math.min(x.votes * 0.7, thr0 * 0.9))), Math.round(Math.max(x.votes * 1.3, thr0 * 1.1))] : [0, 0];
  const [from, setFrom] = useState(() => range(l)[0]); const [to, setTo] = useState(() => range(l)[1]);
  // a result keeps the range it was computed for, so editing the fields does not redraw it against a new axis
  const [sweep, setSweep] = useState<(SweepResult & { from: number; to: number; id: string }) | null>(null);
  const [box, W] = useChartWidth(520);
  useEffect(() => setSweep(null), [s]); // results describe the scenario they were computed on
  // the sweep runs in a background worker; a change to its inputs abandons it
  const job = useRef<(() => void) | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { job.current?.(); job.current = null; setBusy(false); }, [s, id, from, to]);
  const segs = sweep?.segments ?? null;
  const cancel = () => { job.current?.(); job.current = null; setBusy(false); };
  const pick = (nid: string) => {
    setId(nid); setSweep(null);
    const [a, b] = range(s.lists.find((y) => y.id === nid));
    setFrom(a); setTo(b);
  };
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  const run = () => {
    if (!l || to <= from) return toast('error', L('Choose a range with “to” above “from”.', 'בחרו טווח שבו "עד" גדול מ"מ".'));
    job.current?.();
    setBusy(true);
    const task = { kind: 'sweep', input: toEngineInput(s), target: l.id, from: BigInt(from), to: BigInt(to) } as const;
    const range = { from, to, id: l.id };
    job.current = runTasks([task], (_, result) => { job.current = null; setBusy(false); setSweep({ ...result, ...range }); });
  };
  const sid = sweep?.id ?? id, sl = s.lists.find((x) => x.id === sid);
  const maxSeats = segs ? Math.max(1, ...segs.map((x) => x.seats[sid] ?? 0)) : 1;
  const x0 = 30, plotW = W - 50;
  const at = (v: number | bigint) => sweep ? x0 + (Number(BigInt(v) - BigInt(sweep.from)) / (sweep.to - sweep.from + 1)) * plotW : 0;
  return (
    <div>
      <h3>{L('Vote sweep', 'סריקת קולות')}</h3>
      <p className="small ink2">{L('Exact vote boundaries', 'גבולות בקולות שלמים')} <Info title={L('Vote sweep assumptions', 'הנחות סריקת הקולות')}>{L('All other lists keep their votes; the valid total changes with the swept list. Boundaries are exact whole vote counts.', 'שאר הרשימות שומרות על קולותיהן; סך הכשרים משתנה עם הרשימה הנסרקת. הגבולות הם מספרי קולות מדויקים.')}</Info></p>
      <div className="row">
        <select value={id} onChange={(e) => pick(e.target.value)} aria-label={L('List', 'רשימה')} style={{ flex: '1 1 160px', maxWidth: 260 }}>{main.slice(0, 30).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        <span className="row" dir="ltr" style={{ flexWrap: 'nowrap', gap: 6 }}>
          <span className="small">{L('from', 'מ-')}</span><NumberInput value={from} onCommit={setFrom} label={L('From', 'מ')} width={100} />
          <span className="small">{L('to', 'עד')}</span><NumberInput value={to} onCommit={setTo} label={L('To', 'עד')} width={100} />
        </span>
        {busy ? <button className="btn small" onClick={cancel}>{L('Cancel', 'ביטול')}</button> : <button className="btn primary small" onClick={run}>{L('Run', 'הרצה')}</button>}
      </div>
      {busy && <p className="small muted" role="status">{L('Calculating exactly…', 'מחשב במדויק…')}</p>}
      {segs && sweep && (
        <>
          <div ref={box}>
          <svg className="chart" viewBox={`0 0 ${W} 150`} width="100%" role="img" aria-label={L('Seats against votes', 'מנדטים מול קולות')} style={{ marginTop: 8 }}>
            {segs.map((sg, k) => {
              const a = at(sg.from), b = at(sg.to + 1n);
              const y = 120 - ((sg.seats[sid] ?? 0) / maxSeats) * 100;
              return <g key={k}><rect x={a} y={y} width={Math.max(1, b - a - 1)} height={120 - y} fill={sl?.color} opacity={0.85} rx={2}><title>{`${fmtInt(sg.from)}–${fmtInt(sg.to)}: ${sg.seats[sid] ?? 0}`}</title></rect></g>;
            })}
            {/* where the list stands now */}
            {sl && sl.votes >= sweep.from && sl.votes <= sweep.to && <g><line x1={at(sl.votes)} x2={at(sl.votes)} y1={10} y2={124} stroke="var(--ink)" strokeDasharray="3 3" /><text x={at(sl.votes)} y={9} textAnchor="middle" fill="var(--ink)">{L('now', 'עכשיו')}</text></g>}
            <line x1={x0} x2={x0 + plotW} y1={120} y2={120} stroke="var(--axis)" />
            <text x={x0} y={135}>{fmtInt(sweep.from)}</text><text x={x0 + plotW} y={135} textAnchor="end">{fmtInt(sweep.to)}</text>
            <text x={x0 + plotW / 2} y={147} textAnchor="middle">{L('votes', 'קולות')}</text>
            <text x={4} y={24}>{maxSeats}</text><text x={4} y={120}>0</text>
          </svg>
          </div>
          <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 300 }}>
            <table className="tbl">
              <thead><tr><th className="n">{L('Votes from', 'קולות מ')}</th><th className="n">{L('to', 'עד')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th>{L('Other lists vs the first row', 'רשימות אחרות לעומת השורה הראשונה')}</th></tr></thead>
              <tbody>{segs.map((sg, k) => (
                <tr key={k}>
                  <td className="n">{fmtInt(sg.from)}</td><td className="n">{fmtInt(sg.to)}</td><td className="n"><b>{sg.seats[sid] ?? 0}</b>{!sg.qualified.includes(sid) ? <span className="muted"> ✕</span> : ''}</td>
                  <td className="small">{Object.keys({ ...segs[0].seats, ...sg.seats }).filter((x) => x !== sid && (sg.seats[x] ?? 0) !== (segs[0].seats[x] ?? 0)).map((x) => `${name(x)} ${signed((sg.seats[x] ?? 0) - (segs[0].seats[x] ?? 0))}`).join(' · ')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="small muted">{sweep!.exact ? L('Every vote count in the range was calculated: the boundaries are exact.', 'כל מספר קולות בטווח חושב: הגבולות מדויקים.') : L(`The range is wide, so every ${fmtInt(sweep!.step)}th vote count was calculated and each change was then located to the exact vote. A change that reverses within ${fmtInt(sweep!.step)} votes could be missed — narrow the range to 50,000 votes or less for a complete result.`, `הטווח רחב, ולכן חושב כל ${fmtInt(sweep!.step)} קולות וכל שינוי אותר עד הקול המדויק. שינוי שמתהפך בתוך ${fmtInt(sweep!.step)} קולות עלול להיעלם — צמצמו את הטווח ל-50,000 קולות או פחות לתוצאה מלאה.`)}</p>
        </>
      )}
    </div>
  );
}

function ThresholdSweep({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [lo, setLo] = useState('1'); const [hi, setHi] = useState('5');
  const [segs, setSegs] = useState<ThresholdSegment[] | null>(null);
  useEffect(() => setSegs(null), [s]);
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  const run = () => {
    const a = Number(lo.trim().replace('%', '')), b = Number(hi.trim().replace('%', ''));
    if (!lo.trim() || !hi.trim() || !Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b > 100 || a >= b)
      return toast('error', L('Enter a range of percentages from 0 to 100 with “to” above “from”, e.g. 1 and 5.', 'הזינו טווח אחוזים בין 0 ל-100 שבו "עד" גדול מ"מ", למשל 1 ו-5.'));
    try { setSegs(sweepThreshold(toEngineInput(s), percentToRational(lo.trim().replace('%', '')), percentToRational(hi.trim().replace('%', '')))); }
    catch { toast('error', L('Enter thresholds as percentages, e.g. 1 and 5.', 'הזינו אחוזים, למשל 1 ו-5.')); }
  };
  const current = Object.fromEntries(r.lists.filter((x) => x.seats).map((x) => [x.id, x.seats]));
  return (
    <div>
      <h3>{L('Threshold sensitivity', 'רגישות לאחוז החסימה')}</h3>
      <p className="small ink2">{L('Experimental threshold', 'אחוז חסימה ניסיוני')} <Info title={L('Threshold sweep assumptions', 'הנחות סריקת אחוז החסימה')}>{L('Seat results for every threshold in the range, with the exact percentages at which the result changes (other rules unchanged; an experimental question).', 'התוצאה לכל אחוז חסימה בטווח, עם האחוזים המדויקים שבהם היא משתנה (שאר הכללים ללא שינוי; שאלה ניסיונית).')}</Info></p>
      <div className="row" dir="ltr">
        <input type="text" value={lo} onChange={(e) => setLo(e.target.value)} style={{ width: 60 }} aria-label={L('From %', 'מ-%')} />% –
        <input type="text" value={hi} onChange={(e) => setHi(e.target.value)} style={{ width: 60 }} aria-label={L('To %', 'עד %')} />%
        <button className="btn primary small" onClick={run}>{L('Run', 'הרצה')}</button>
      </div>
      {segs && (
        <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 300, marginTop: 8 }}>
          <table className="tbl">
            <thead><tr><th className="n">{L('Threshold above', 'אחוז חסימה מעל')}</th><th className="n">{L('up to', 'עד')}</th><th className="n">{L('Lists in', 'רשימות')}</th><th>{L('Difference from the current result', 'הבדל מהתוצאה הנוכחית')}</th></tr></thead>
            <tbody>{segs.map((sg, k) => (
              <tr key={k}>
                <td className="n">{fmtRat({ num: sg.fromPct.num * 100n, den: sg.fromPct.den }, 4)}%</td><td className="n">{fmtRat({ num: sg.toPct.num * 100n, den: sg.toPct.den }, 4)}%</td>
                <td className="n">{sg.qualified.length}</td>
                <td className="small">{Object.keys({ ...current, ...sg.seats }).filter((x) => (sg.seats[x] ?? 0) !== (current[x] ?? 0)).map((x) => `${name(x)} ${signed((sg.seats[x] ?? 0) - (current[x] ?? 0))}`).join(' · ') || L('same as current', 'כמו הנוכחית')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BlocFlip({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [bloc, setBloc] = useState(s.blocs[0]?.id ?? '');
  const [res, setRes] = useState<{ from: string; to: string; votes: bigint; d: string } | null | 'none'>(null);
  /** some pairs' searches could not rule out an untested interval, so "none" and "smallest" are not proven */
  const [unsure, setUnsure] = useState(false);
  useEffect(() => setRes(null), [s]);
  // every pair is searched in background workers; a change of scenario or bloc abandons the search
  const job = useRef<(() => void) | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  useEffect(() => () => { job.current?.(); job.current = null; setProgress(null); }, [s, bloc]);
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const members = s.lists.filter((l) => l.bloc === bloc).map((l) => l.id);
  const seats = members.reduce((t, id) => t + (r.lists.find((x) => x.id === id)?.seats ?? 0), 0);
  const has = seats >= majority;
  const run = () => {
    const input = toEngineInput(s);
    const cands = s.lists.filter((l) => !l.withdrawn && BigInt(l.votes) * 200n >= r.totalValid);
    const tasks: Extract<AnalysisTask, { kind: 'groupTransfer' }>[] = [];
    for (const to of cands) for (const from of cands) {
      if (from.id === to.id) continue;
      const fromIn = members.includes(from.id), toIn = members.includes(to.id);
      if (has ? !(fromIn && !toIn) : !(!fromIn && toIn)) continue;
      tasks.push({ kind: 'groupTransfer', input, from: from.id, to: to.id, ids: members, n: majority, below: has });
    }
    // the answer is chosen in the order above, as before, however the workers finish
    const finish = (outcomes: TransferOutcome[]) => {
      let best: { from: string; to: string; votes: bigint } | null = null;
      let inconclusive = false;
      for (let k = 0; k < outcomes.length; k++) {
        const m = outcomes[k];
        if (m.found && m.votes !== null && (!best || m.votes < best.votes)) best = { from: tasks[k].from, to: tasks[k].to, votes: m.votes };
        if (m.reason === 'inconclusive' || (m.found && !m.exact)) inconclusive = true;
      }
      setUnsure(inconclusive);
      if (!best) return setRes('none');
      setRes({ ...best, d: '' });
    };
    job.current?.();
    if (!tasks.length) { job.current = null; setProgress(null); return finish([]); }
    const outcomes: TransferOutcome[] = new Array(tasks.length);
    let done = 0;
    setRes(null); setProgress({ done: 0, total: tasks.length });
    job.current = runTasks(tasks, (k, m) => {
      outcomes[k] = m; done++;
      if (done < tasks.length) return setProgress({ done, total: tasks.length });
      job.current = null; setProgress(null);
      finish(outcomes);
    });
  };
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  if (!s.blocs.length) return null;
  return (
    <div>
      <h3>{L('Flip a bloc majority', 'שינוי הרוב בגוש')}</h3>
      <div className="row">
        <select value={bloc} onChange={(e) => { setBloc(e.target.value); setRes(null); }} aria-label={L('Bloc', 'גוש')}>{s.blocs.map((b) => <option key={b.id} value={b.id}>{lang === 'he' ? b.nameHe : b.nameEn}</option>)}</select>
        <span className="small"><bdi dir="ltr">{seats} / {majority}</bdi> {has ? L('(has a majority)', '(יש רוב)') : L('(no majority)', '(אין רוב)')}</span>
        <button className="btn primary small" onClick={run} disabled={!!progress}>{L('Search', 'חיפוש')}</button>
      </div>
      <p className="small muted">{L('Lists with ≥ 0.5%', 'רשימות עם לפחות 0.5%')} <Info title={L('Transfer search scope', 'היקף חיפוש המעברים')}>{L('Searches every transfer between a list inside and a list outside the bloc (lists with ≥ 0.5% of votes), using the bloc assignment shown.', 'בודק כל מעבר בין רשימה בגוש לרשימה מחוצה לו (רשימות עם ≥ 0.5%), לפי השיוך לגושים המוצג.')}</Info></p>
      {progress && <p className="small muted row" role="status">{L(`Searching exactly… ${progress.done} of ${progress.total} transfers`, `מחפש במדויק… ${progress.done} מתוך ${progress.total} מעברים`)}
        <button className="btn small" onClick={() => { job.current?.(); job.current = null; setProgress(null); }}>{L('Cancel', 'ביטול')}</button></p>}
      {res === 'none' && <p className="small">{unsure
        ? L('No transfer found among the vote counts tested; some searches could not test every count, so one may still exist.', 'לא נמצא מעבר בין מספרי הקולות שנבדקו; חלק מהחיפושים לא בדקו כל מספר, ולכן ייתכן שקיים.')
        : L('No single transfer between two lists achieves it.', 'אין מעבר יחיד בין שתי רשימות שמשיג זאת.')}</p>}
      {res && res !== 'none' && unsure && <p className="small muted">{L('Smallest found: some searches could not test every count, so a smaller transfer may exist.', 'הקטן ביותר שנמצא: חלק מהחיפושים לא בדקו כל מספר, ולכן ייתכן מעבר קטן יותר.')}</p>}
      {res && res !== 'none' && (
        <div className="callout small">
          <b>{fmtInt(res.votes)}</b> {L('votes moving from', 'קולות שעוברים מ')} <b>{name(res.from)}</b> {L('to', 'ל')} <b>{name(res.to)}</b> {has ? L('end the majority.', 'מבטלים את הרוב.') : L('give the bloc a majority.', 'נותנים לגוש רוב.')}
          <div><button className="btn small" style={{ marginTop: 6 }} onClick={() => dispatch({ type: 'transfer', from: res.from, to: res.to, votes: Number(res.votes) })}>{L('Apply', 'החלה')}</button></div>
        </div>
      )}
    </div>
  );
}
