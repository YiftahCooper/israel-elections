// The Turnout tab's facts block and its 26-election chart (owner, 8 Nov). Simple: eligible voters and turnout with
// their change since the previous election. Standard adds votes cast, valid and invalid votes, the threshold in votes
// and the chart. Expert adds ballot boxes and double-envelope votes, where the source reports them.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import { votesCast } from '../../model/scenario.ts';
import type { ElectionId } from '../../data/schema.ts';
import { allocationOf, referenceLabel } from '../derive.ts';
import { fmtInt, fmtPct, trimDecimal } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { openElection, useDigits, useLevel, useSetting, useStore } from '../store.ts';
import { useHoverIntent } from '../hoverIntent.ts';
import { countChange, ELECTION_TOTALS, electionWhen, officialThreshold, previousTotals, totalsOf, turnoutPct, type ElectionTotalsRow } from '../turnoutFacts.ts';
import { EditMarker } from './EditMarker.tsx';
import { percent, percentNum, points } from './Percentage.tsx';
import { Info } from './ui.tsx';
import { useReference } from '../compare/mode.ts';
import { refLabel } from '../compare/useRefRows.ts';
import { CopyOtherButton } from '../compare/CopyOtherButton.tsx';
import type { OtherCopy } from '../compare/copyOther.ts';

const arrow = (n: number) => (n > 0 ? '▲ ' : n < 0 ? '▼ ' : '');
const signOf = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '±');

/** "▲ +543,177 · +8%": the arrow and sign read without colour; colour (green up, red down) is an extra cue. */
function CountDelta({ now, before, digits }: { now: number; before: number; digits: number }) {
  const { diff, rel } = countChange(now, before);
  return <bdi dir="ltr" className="seat-delta tn-delta" data-sign={Math.sign(diff)}>
    {arrow(diff)}{signOf(diff)}{fmtInt(Math.abs(diff))}{rel !== null && diff !== 0 && <> · {signOf(diff)}{percent(Math.abs(diff), before, digits)}</>}
  </bdi>;
}
function PointDelta({ value, digits }: { value: number; digits: number }) {
  const L = useL();
  return <span className="seat-delta tn-delta" data-sign={Math.sign(value)}><bdi dir="ltr">{arrow(value)}{points(value, digits)}</bdi> {L('pp', 'נק׳')}</span>;
}

function Fact({ id, k, info, v, d, since, copy }: { id: string; k: string; info?: ReactNode; v: ReactNode; d?: ReactNode; since?: ReactNode; copy?: ReactNode }) {
  return <div className="tn-fact" data-fact={id}>
    <dt>{k}{info}</dt>
    <dd className="tn-v">{v}</dd>
    {d && <dd className="tn-d">{d}</dd>}
    {since && <dd className="tn-since">{since}</dd>}
    {copy && <dd className="tn-copy">{copy}</dd>}
  </div>;
}

export function TurnoutFacts({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const { standard, expert } = useLevel();
  const official = totalsOf(s.electionId);
  // while comparing, "since" is the compared result (its own totals, edits included); otherwise the previous election
  const cmp = useReference(s);
  const ref = cmp.status === 'ready' ? cmp.ref : null;
  const prev: Pick<ElectionTotalsRow, 'registered' | 'votesCast' | 'ballotBoxes'> | null = ref
    ? { registered: ref.sc.registered, votesCast: votesCast(ref.sc), ballotBoxes: totalsOf(ref.sc.electionId)?.ballotBoxes ?? null }
    : previousTotals(s.electionId);
  const r = allocationOf(s);
  const cast = votesCast(s);
  const valid = Number(r.totalValid);
  const pct = turnoutPct(cast, s.registered);
  const officialName = referenceLabel(null, lang).name;
  if (!official) return null;
  const castEdited = cast !== official.votesCast || s.registered !== official.registered;
  const prevRow = previousTotals(s.electionId);
  const since = ref ? refLabel(ref, s) : prevRow ? electionWhen(prevRow, lang) : '';
  const sinceWords = (x: ReactNode) => prev && <>{x} <span className="tn-when">{ref?.same ? L(`against ${since}`, `לעומת ${since}`) : L(`since ${since}`, `לעומת ${since}`)}</span></>;
  const copy = (what: OtherCopy, en: string, he: string) => ref && <CopyOtherButton refr={ref} what={what} what_en={en} what_he={he} />;
  const noThreshold = Number(s.rules.thresholdPct) === 0;

  return <section className="tn-facts" aria-labelledby="tn-facts-h">
    <h3 id="tn-facts-h">{L('Voters and turnout', 'בעלי זכות בחירה והצבעה')}</h3>
    {!prev && !ref && <p className="small ink2 tn-first">{L('The first election: there is no earlier one to compare with.', 'הבחירות הראשונות: אין בחירות קודמות להשוואה.')}</p>}
    <dl className="tn-grid">
      <Fact id="registered" k={L('Eligible voters', 'בעלי זכות בחירה')} info={<Info term="registered-voters" />}
        v={<><bdi dir="ltr">{fmtInt(s.registered)}</bdi><EditMarker s={s} path={['registered']} /></>}
        since={prev && sinceWords(<CountDelta now={s.registered} before={prev.registered} digits={digits} />)}
        copy={copy('registered', 'eligible voters', 'מספר בעלי זכות הבחירה')} />
      <Fact id="turnout" k={L('Turnout', 'שיעור ההצבעה')} info={<Info term="turnout" />}
        v={percent(cast, s.registered, digits)}
        d={!standard || castEdited ? <>{!standard && <><bdi dir="ltr">{fmtInt(cast)}</bdi> {L('votes cast', 'מצביעים')}</>}{castEdited && <>{!standard && ' · '}{officialName} {percent(official.votesCast, official.registered, digits)}</>}</> : undefined}
        since={prev && sinceWords(<PointDelta value={pct - turnoutPct(prev.votesCast, prev.registered)} digits={digits} />)}
        copy={copy('turnout', 'turnout', 'שיעור ההצבעה')} />
      {standard && <Fact id="cast" k={L('Votes cast', 'מצביעים')}
        info={<Info title={L('Votes cast', 'מצביעים')}>{L('Every ballot in the box, valid and invalid.', 'כל הפתקים בקלפי, כשרים ופסולים.')}</Info>}
        v={<bdi dir="ltr">{fmtInt(cast)}</bdi>}
        d={castEdited ? <>{officialName} <bdi dir="ltr">{fmtInt(official.votesCast)}</bdi></> : undefined}
        since={prev && sinceWords(<CountDelta now={cast} before={prev.votesCast} digits={digits} />)} />}
      {standard && <Fact id="valid" k={L('Valid votes', 'קולות כשרים')} info={<Info term="valid" />}
        v={<bdi dir="ltr">{fmtInt(valid)}</bdi>} />}
      {standard && <Fact id="invalid" k={L('Invalid ballots', 'קולות פסולים')} info={<Info term="invalid-votes" />}
        v={<><bdi dir="ltr">{fmtInt(s.invalid)}</bdi><EditMarker s={s} path={['invalid']} /></>} d={<>{percent(s.invalid, cast, digits)} {L('of votes cast', 'מהמצביעים')}</>}
        copy={expert && copy('invalid', 'invalid ballots', 'מספר הקולות הפסולים')} />}
      {standard && (noThreshold
        ? <Fact id="threshold" k={L('Threshold', 'אחוז החסימה')} info={<Info term="threshold" />} v={L('None', 'אין')} d={L('No percentage threshold', 'ללא אחוז חסימה')} />
        : <Fact id="threshold" k={L('Threshold', 'אחוז החסימה')} info={<Info term="threshold" />}
          v={<><bdi dir="ltr">{fmtInt(r.thresholdVotes)}</bdi> {L('votes', 'קולות')}</>} d={<>{trimDecimal(s.rules.thresholdPct)}% {L('of valid votes', 'מהקולות הכשרים')}</>} />)}
      {expert && <Fact id="boxes" k={L('Ballot boxes', 'קלפיות')} info={<Info term="polling-station" />}
        v={official.ballotBoxes === null ? '—' : <bdi dir="ltr">{fmtInt(official.ballotBoxes)}</bdi>}
        d={official.ballotBoxes === null ? L('Not in the source for this election', 'לא מופיע במקור לבחירות אלה') : undefined}
        since={official.ballotBoxes !== null && prev?.ballotBoxes ? sinceWords(<CountDelta now={official.ballotBoxes} before={prev.ballotBoxes} digits={digits} />) : undefined} />}
      {expert && <Fact id="envelopes" k={L('Double envelopes', 'מעטפות כפולות')} info={<Info term="envelopes" />}
        v={official.envelopeVotes === null ? '—' : <bdi dir="ltr">{fmtInt(official.envelopeVotes)}</bdi>}
        d={official.envelopeVotes === null ? L('Not in the source for this election', 'לא מופיע במקור לבחירות אלה') : <>{percent(official.envelopeVotes, official.votesCast, digits)} {L('of votes cast', 'מהמצביעים')}</>} />}
    </dl>
    {standard && <TurnoutHistory current={s.electionId} />}
  </section>;
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Eligible voters and turnout at every election: two small charts on one shared row of elections (never two scales
 *  on one axis), drawn left to right in Hebrew too. A column opens that election; the readout above names the
 *  hovered or current election, in a reserved line so nothing moves. */
function TurnoutHistory({ current }: { current: ElectionId }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const preferTables = useSetting('preferTables');
  const index = useStore((st) => st.elections);
  const [ref, width] = useWidth<HTMLDivElement>(720);
  const [hover, setHover] = useState<number | null>(null);
  // shared hover timing (hoverIntent.ts): a resting mouse names a column; keys and touch at once
  const intent = useHoverIntent(() => setHover(null), hover !== null);
  const rows = ELECTION_TOTALS;
  const cur = rows.findIndex((t) => t.id === current);
  const shown = rows[hover ?? cur] ?? rows[rows.length - 1];
  const pcts = useMemo(() => rows.map((t) => turnoutPct(t.votesCast, t.registered)), [rows]);
  const n = rows.length, ml = 34, mr = 6, slot = (width - ml - mr) / n, bw = Math.min(16, slot * 0.62);
  const x = (i: number) => ml + (i + 0.5) * slot;
  const H = 84, top = 8, axisH = 18;
  const maxReg = Math.max(...rows.map((t) => t.registered));
  const regStep = 2_000_000, regMax = Math.ceil(maxReg / regStep) * regStep;
  const yReg = (v: number) => top + H - (v / regMax) * H;
  const pLo = Math.floor(Math.min(...pcts) / 10) * 10, pHi = Math.ceil(Math.max(...pcts) / 10) * 10;
  const yPct = (v: number) => top + H - ((v - pLo) / (pHi - pLo)) * H;
  const every = Math.max(1, Math.ceil(30 / slot));
  const tick = (i: number) => i === n - 1 || (i % every === 0 && n - 1 - i >= every);
  const go = (i: number) => { if (rows[i].id !== current) void openElection(rows[i].id as ElectionId); };
  const name = (t: ElectionTotalsRow) => { const e = index.find((x) => x.id === t.id); return e ? `${electionWhen(t, lang)} · ${lang === 'he' ? `הכנסת ה־${e.knesset}` : `Knesset ${e.knesset}`}` : electionWhen(t, lang); };
  const label = (i: number) => `${name(rows[i])}: ${L('eligible voters', 'בעלי זכות בחירה')} ${fmtInt(rows[i].registered)}, ${L('turnout', 'הצבעה')} ${fmtPct(rows[i].votesCast, rows[i].registered, digits)}`;
  const columns = (chart: 'reg' | 'pct') => rows.map((t, i) => <rect key={t.id} className="tn-hit" x={ml + i * slot} y={0} width={slot} height={top + H + axisH}
    onPointerEnter={(e) => { if (e.pointerType === 'touch') setHover(i); else intent.enter(() => setHover(i)); }} onPointerLeave={(e) => { if (e.pointerType !== 'touch') intent.leave(); if (!intent.isShown) setHover((h) => (h === i ? null : h)); }} onClick={() => go(i)} data-chart={chart} />);
  // the open election's year is always shown, in bold; regular ticks too close to it give way
  const years = rows.map((t, i) => (i === cur || tick(i) && !(cur >= 0 && Math.abs(i - cur) * slot < 24)) && <text key={t.id} x={x(i)} y={top + H + 13} className={`tn-axis ${i === cur ? 'cur' : ''}`} textAnchor="middle">{`’${t.date.slice(2, 4)}`}</text>);
  const band = (i: number) => <rect x={ml + i * slot + 0.5} y={top - 4} width={Math.max(1, slot - 1)} height={H + axisH + 4} rx={3} className={i === cur ? 'tn-cur' : 'tn-hov'} />;

  return <div className="tn-history">
    <h4>{L('All elections', 'כל הבחירות')} <Info title={L('All elections', 'כל הבחירות')}>{L('Official national totals of each election. Choose an election to open it. Columns are elections, evenly spaced: this is not a time scale, since Knessets last different lengths. The shaded column is the open election.', 'הסיכומים הארציים הרשמיים של כל בחירות. בחירה בבחירות פותחת אותן. העמודות הן מערכות בחירות, במרווחים שווים: זה אינו ציר זמן, כי משך כל כנסת שונה. העמודה המוצללת היא הבחירות הפתוחות.')}</Info></h4>
    <p className="tn-readout small" aria-live="polite">
      <b>{name(shown)}</b> · {L('Eligible', 'בעלי זכות')} <bdi dir="ltr">{fmtInt(shown.registered)}</bdi> · {L('Turnout', 'הצבעה')} {percentNum(pcts[rows.indexOf(shown)], digits)}
    </p>
    <div ref={ref} className="tn-charts">
      <div className="tn-panel">
        <div className="tn-cap small ink2">{L('Eligible voters (millions)', 'בעלי זכות בחירה (מיליונים)')}</div>
        <svg width={width} height={top + H + axisH} viewBox={`0 0 ${width} ${top + H + axisH}`} direction="ltr" className="tn-chart" role="group" aria-label={L('Eligible voters and turnout, 1949–2026', 'בעלי זכות בחירה ושיעור הצבעה, 1949–2026')}
          onKeyDown={(e) => {
            const k = e.key, at = hover ?? cur;
            const next = k === 'ArrowRight' ? Math.min(n - 1, at + 1) : k === 'ArrowLeft' ? Math.max(0, at - 1) : k === 'Home' ? 0 : k === 'End' ? n - 1 : null;
            if (next === null) return; e.preventDefault(); setHover(next);
            (e.currentTarget.querySelector(`[data-i="${next}"]`) as SVGGElement | null)?.focus();
          }}>
          {Array.from({ length: regMax / regStep + 1 }, (_, k) => k * regStep).map((v) => <g key={v}>
            <line x1={ml} x2={width - mr} y1={yReg(v)} y2={yReg(v)} className="tn-gl" />
            <text x={ml - 5} y={yReg(v) + 3.5} className="tn-axis" textAnchor="end">{v / 1_000_000}</text></g>)}
          {hover !== null && hover !== cur && band(hover)}{cur >= 0 && band(cur)}
          {rows.map((t, i) => <g key={t.id} data-i={i} role="button" aria-label={label(i)} aria-current={i === cur ? 'true' : undefined} tabIndex={i === (hover ?? cur) ? 0 : -1}
            className="tn-col" onFocus={() => setHover(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } }}>
            <rect x={x(i) - bw / 2} y={yReg(t.registered)} width={bw} height={top + H - yReg(t.registered)} rx={Math.min(2, bw / 4)} className={`tn-bar ${i === cur ? 'cur' : ''}`} />
          </g>)}
          {years}{columns('reg')}
        </svg>
      </div>
      <div className="tn-panel" aria-hidden>
        <div className="tn-cap small ink2">{L('Turnout (%)', 'שיעור ההצבעה (%)')}</div>
        <svg width={width} height={top + H + axisH} viewBox={`0 0 ${width} ${top + H + axisH}`} direction="ltr" className="tn-chart">
          {Array.from({ length: (pHi - pLo) / 10 + 1 }, (_, k) => pLo + k * 10).map((v) => <g key={v}>
            <line x1={ml} x2={width - mr} y1={yPct(v)} y2={yPct(v)} className="tn-gl" />
            <text x={ml - 5} y={yPct(v) + 3.5} className="tn-axis" textAnchor="end">{v}</text></g>)}
          {hover !== null && hover !== cur && band(hover)}{cur >= 0 && band(cur)}
          <polyline points={pcts.map((p, i) => `${x(i)},${yPct(p)}`).join(' ')} className="tn-line" />
          {pcts.map((p, i) => <circle key={i} cx={x(i)} cy={yPct(p)} r={i === cur ? 4.5 : 3} className={`tn-dot ${i === cur ? 'cur' : ''}`} />)}
          {years}{columns('pct')}
        </svg>
      </div>
    </div>
    <details className="tn-table" open={preferTables}>
      <summary className="small">{L('Table', 'טבלה')}</summary>
      <div className="tn-table-wrap"><table className="tbl small">
        <thead><tr><th>{L('Election', 'בחירות')}</th><th className="n">{L('Eligible voters', 'בעלי זכות בחירה')}</th><th className="n">{L('Votes cast', 'מצביעים')}</th><th className="n">{L('Turnout', 'הצבעה')}</th><th className="n">{L('Valid', 'כשרים')}</th><th className="n">{L('Invalid', 'פסולים')}</th><th className="n">{L('Threshold (votes)', 'אחוז החסימה (קולות)')}</th></tr></thead>
        <tbody>{rows.map((t, i) => { const thr = officialThreshold(t); return <tr key={t.id} aria-current={i === cur ? 'true' : undefined}>
          <td>{name(t)}</td><td className="n">{fmtInt(t.registered)}</td><td className="n">{fmtInt(t.votesCast)}</td><td className="n">{percent(t.votesCast, t.registered, digits)}</td>
          <td className="n">{fmtInt(t.valid)}</td><td className="n">{fmtInt(t.invalid)}</td><td className="n">{thr ? fmtInt(thr.votes) : L('None', 'אין')}</td></tr>; })}</tbody>
      </table></div>
    </details>
  </div>;
}
