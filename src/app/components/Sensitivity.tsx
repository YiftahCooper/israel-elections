import { useState } from 'react';
import { goals, minimalChange, sweepThreshold, sweepVotes, type SweepSegment, type ThresholdSegment } from '../../engine/analysis.ts';
import { percentToRational } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtRat } from '../format.ts';
import { dispatch, toast } from '../store.ts';
import { NumberInput } from './ui.tsx';

export function Sensitivity({ s, r }: { s: Scenario; r: AllocationResult }) {
  return (
    <div className="grid2" style={{ alignItems: 'start', gap: 18 }}>
      <VoteSweep s={s} r={r} />
      <div><ThresholdSweep s={s} r={r} /><hr /><BlocFlip s={s} r={r} /></div>
    </div>
  );
}

function VoteSweep({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const main = [...s.lists].sort((a, b) => b.votes - a.votes);
  const [id, setId] = useState(main[0]?.id ?? '');
  const l = s.lists.find((x) => x.id === id);
  const [from, setFrom] = useState(0); const [to, setTo] = useState(0);
  const [segs, setSegs] = useState<SweepSegment[] | null>(null);
  const pick = (nid: string) => {
    setId(nid); setSegs(null);
    const x = s.lists.find((y) => y.id === nid)!;
    const thr = Number(r.thresholdVotes);
    setFrom(Math.max(0, Math.round(Math.min(x.votes * 0.7, thr * 0.9)))); setTo(Math.round(Math.max(x.votes * 1.3, thr * 1.1)));
  };
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  const run = () => {
    if (!l || to <= from) return toast('error', L('Choose a range with “to” above “from”.', 'בחרו טווח שבו "עד" גדול מ"מ".'));
    setSegs(sweepVotes(toEngineInput(s), l.id, BigInt(from), BigInt(to), 400));
  };
  const maxSeats = segs ? Math.max(1, ...segs.map((x) => x.seats[id] ?? 0)) : 1;
  return (
    <div>
      <h4>{L('Vote sweep: every point where seats change', 'סריקת קולות: כל נקודה שבה המנדטים משתנים')}</h4>
      <p className="small ink2">{L('All other lists keep their votes; the valid total changes with the swept list. Boundaries are exact whole vote counts.', 'שאר הרשימות שומרות על קולותיהן; סך הכשרים משתנה עם הרשימה הנסרקת. הגבולות הם מספרי קולות מדויקים.')}</p>
      <div className="row">
        <select value={id} onChange={(e) => pick(e.target.value)} aria-label={L('List', 'רשימה')}>{main.slice(0, 30).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        <span className="small">{L('from', 'מ-')}</span><NumberInput value={from} onCommit={setFrom} label={L('From', 'מ')} width={100} />
        <span className="small">{L('to', 'עד')}</span><NumberInput value={to} onCommit={setTo} label={L('To', 'עד')} width={100} />
        <button className="btn primary small" onClick={run}>{L('Run', 'הרצה')}</button>
      </div>
      {segs && (
        <>
          <svg className="chart" viewBox="0 0 520 140" width="100%" role="img" aria-label={L('Seats against votes', 'מנדטים מול קולות')} style={{ marginTop: 8 }}>
            {segs.map((sg, k) => {
              const x0 = 30 + (Number(sg.from - BigInt(from)) / (to - from)) * 470;
              const x1 = 30 + (Number(sg.to - BigInt(from) + 1n) / (to - from + 1)) * 470;
              const y = 120 - ((sg.seats[id] ?? 0) / maxSeats) * 100;
              return <g key={k}><rect x={x0} y={y} width={Math.max(1, x1 - x0 - 1)} height={120 - y} fill={l?.color} opacity={0.85} rx={2}><title>{`${fmtInt(sg.from)}–${fmtInt(sg.to)}: ${sg.seats[id] ?? 0}`}</title></rect></g>;
            })}
            <line x1={30} x2={500} y1={120} y2={120} stroke="var(--axis)" />
            <text x={30} y={135}>{fmtInt(from)}</text><text x={500} y={135} textAnchor="end">{fmtInt(to)}</text>
            <text x={4} y={24}>{maxSeats}</text><text x={4} y={120}>0</text>
          </svg>
          <div className="tablewrap" style={{ maxHeight: 300 }}>
            <table className="tbl">
              <thead><tr><th className="n">{L('Votes from', 'קולות מ')}</th><th className="n">{L('to', 'עד')}</th><th className="n">{L('Seats', 'מנדטים')}</th><th>{L('Other lists vs the first row', 'רשימות אחרות לעומת השורה הראשונה')}</th></tr></thead>
              <tbody>{segs.map((sg, k) => (
                <tr key={k}>
                  <td className="n">{fmtInt(sg.from)}</td><td className="n">{fmtInt(sg.to)}</td><td className="n"><b>{sg.seats[id] ?? 0}</b>{!sg.qualified.includes(id) ? <span className="muted"> ✕</span> : ''}</td>
                  <td className="small">{Object.keys({ ...segs[0].seats, ...sg.seats }).filter((x) => x !== id && (sg.seats[x] ?? 0) !== (segs[0].seats[x] ?? 0)).map((x) => `${name(x)} ${(sg.seats[x] ?? 0) - (segs[0].seats[x] ?? 0) > 0 ? '+' : '−'}${Math.abs((sg.seats[x] ?? 0) - (segs[0].seats[x] ?? 0))}`).join(' · ')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="small muted">{L('Located by sampling 400 points and bisecting each change to the exact vote; a change that reverts between two adjacent samples could be missed.', 'נמצא בדגימת 400 נקודות וחיפוש בינארי לכל שינוי עד הקול המדויק; שינוי שמתהפך בין שתי דגימות סמוכות עלול להיעלם.')}</p>
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
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  const run = () => {
    try { setSegs(sweepThreshold(toEngineInput(s), percentToRational(lo.trim()), percentToRational(hi.trim()))); }
    catch { toast('error', L('Enter thresholds as percentages, e.g. 1 and 5.', 'הזינו אחוזים, למשל 1 ו-5.')); }
  };
  const current = Object.fromEntries(r.lists.filter((x) => x.seats).map((x) => [x.id, x.seats]));
  return (
    <div>
      <h4>{L('Threshold sensitivity', 'רגישות לאחוז החסימה')}</h4>
      <p className="small ink2">{L('Seat results for every threshold in the range, with the exact percentages at which the result changes (other rules unchanged; an experimental question).', 'התוצאה לכל אחוז חסימה בטווח, עם האחוזים המדויקים שבהם היא משתנה (שאר הכללים ללא שינוי; שאלה ניסיונית).')}</p>
      <div className="row">
        <input type="text" value={lo} onChange={(e) => setLo(e.target.value)} style={{ width: 60 }} aria-label={L('From %', 'מ-%')} />% –
        <input type="text" value={hi} onChange={(e) => setHi(e.target.value)} style={{ width: 60 }} aria-label={L('To %', 'עד %')} />%
        <button className="btn primary small" onClick={run}>{L('Run', 'הרצה')}</button>
      </div>
      {segs && (
        <div className="tablewrap" style={{ maxHeight: 300, marginTop: 8 }}>
          <table className="tbl">
            <thead><tr><th className="n">{L('Threshold above', 'אחוז חסימה מעל')}</th><th className="n">{L('up to', 'עד')}</th><th className="n">{L('Lists in', 'רשימות')}</th><th>{L('Difference from the current result', 'הבדל מהתוצאה הנוכחית')}</th></tr></thead>
            <tbody>{segs.map((sg, k) => (
              <tr key={k}>
                <td className="n">{fmtRat({ num: sg.fromPct.num * 100n, den: sg.fromPct.den }, 4)}%</td><td className="n">{fmtRat({ num: sg.toPct.num * 100n, den: sg.toPct.den }, 4)}%</td>
                <td className="n">{sg.qualified.length}</td>
                <td className="small">{Object.keys({ ...current, ...sg.seats }).filter((x) => (sg.seats[x] ?? 0) !== (current[x] ?? 0)).map((x) => `${name(x)} ${(sg.seats[x] ?? 0) - (current[x] ?? 0) > 0 ? '+' : '−'}${Math.abs((sg.seats[x] ?? 0) - (current[x] ?? 0))}`).join(' · ') || L('same as current', 'כמו הנוכחית')}</td>
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
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const members = s.lists.filter((l) => l.bloc === bloc).map((l) => l.id);
  const seats = members.reduce((t, id) => t + (r.lists.find((x) => x.id === id)?.seats ?? 0), 0);
  const has = seats >= majority;
  const run = () => {
    const input = toEngineInput(s);
    const cands = s.lists.filter((l) => !l.withdrawn && BigInt(l.votes) * 200n >= r.totalValid);
    const goal = has ? goals.groupSeatsBelow(members, majority) : goals.groupSeatsAtLeast(members, majority);
    let best: { from: string; to: string; votes: bigint } | null = null;
    for (const to of cands) for (const from of cands) {
      if (from.id === to.id) continue;
      const fromIn = members.includes(from.id), toIn = members.includes(to.id);
      if (has ? !(fromIn && !toIn) : !(!fromIn && toIn)) continue;
      const m = minimalChange(input, to.id, { kind: 'transfer', listId: from.id }, goal);
      if (m.found && m.votes !== null && (!best || m.votes < best.votes)) best = { from: from.id, to: to.id, votes: m.votes };
    }
    if (!best) return setRes('none');
    setRes({ ...best, d: '' });
  };
  const name = (lid: string) => listLabel(s.lists.find((x) => x.id === lid)!, lang);
  if (!s.blocs.length) return null;
  return (
    <div>
      <h4>{L('Smallest transfer that changes a bloc’s majority', 'המעבר הקטן ביותר שמשנה רוב של גוש')}</h4>
      <div className="row">
        <select value={bloc} onChange={(e) => { setBloc(e.target.value); setRes(null); }} aria-label={L('Bloc', 'גוש')}>{s.blocs.map((b) => <option key={b.id} value={b.id}>{lang === 'he' ? b.nameHe : b.nameEn}</option>)}</select>
        <span className="small">{seats} / {majority} {has ? L('(has a majority)', '(יש רוב)') : L('(no majority)', '(אין רוב)')}</span>
        <button className="btn primary small" onClick={run}>{L('Search', 'חיפוש')}</button>
      </div>
      <p className="small muted">{L('Searches every transfer between a list inside and a list outside the bloc (lists with ≥ 0.5% of votes), using the bloc assignment shown.', 'בודק כל מעבר בין רשימה בגוש לרשימה מחוצה לו (רשימות עם ≥ 0.5%), לפי השיוך לגושים המוצג.')}</p>
      {res === 'none' && <p className="small">{L('No single transfer between two lists achieves it.', 'אין מעבר יחיד בין שתי רשימות שמשיג זאת.')}</p>}
      {res && res !== 'none' && (
        <div className="callout small">
          <b>{fmtInt(res.votes)}</b> {L('votes moving from', 'קולות שעוברים מ')} <b>{name(res.from)}</b> {L('to', 'ל')} <b>{name(res.to)}</b> {has ? L('end the majority.', 'מבטלים את הרוב.') : L('give the bloc a majority.', 'נותנים לגוש רוב.')}
          <div><button className="btn small" style={{ marginTop: 6 }} onClick={() => dispatch({ type: 'transfer', from: res.from, to: res.to, votes: Number(res.votes) })}>{L('Apply', 'החלה')}</button></div>
        </div>
      )}
    </div>
  );
}
