// The Turnout tab's facts block and its 26-election chart (owner, 8 Nov). Simple: eligible voters and turnout with
// their change since the previous election. Standard adds votes cast, valid and invalid votes, the threshold in votes
// and the chart. Expert adds ballot boxes and double-envelope votes, where the source reports them.
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import { votesCast } from '../../model/scenario.ts';
import type { ElectionId } from '../../data/schema.ts';
import { allocationOf, referenceLabel } from '../derive.ts';
import { fmtInt, fmtPct, trimDecimal } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { openElection, useDigits, useOn, useSetting, useStore } from '../store.ts';
import { useHoverIntent } from '../hoverIntent.ts';
import { electionLabel } from '../electionLabel.ts';
import { countChange, ELECTION_TOTALS, electionWhen, officialThreshold, previousTotals, totalsOf, turnoutPct, type ElectionTotalsRow } from '../turnoutFacts.ts';
import { EditMarker } from './EditMarker.tsx';
import { percent, percentNum } from './Percentage.tsx';
import { ChangeMark, PointsDelta } from './SeatDelta.tsx';
import { Info } from './ui.tsx';
import { TURNOUT_FIELD_DIGITS } from './TurnoutSteps.tsx';
import { TileEditPopup, TileEditedMark, tileEditable, type TileField } from './TileEdit.tsx';
import { useReference } from '../compare/mode.ts';
import { refLabel } from '../compare/useRefRows.ts';
import { CopyOtherButton } from '../compare/CopyOtherButton.tsx';
import type { OtherCopy } from '../compare/copyOther.ts';

/** "▲543,177 · 8%": the arrow carries the direction (no sign beside it) and colour (green up, red down) is an extra
 *  cue (owner, 26 Nov 2026). */
function CountDelta({ now, before, digits }: { now: number; before: number; digits: number }) {
  const { diff, rel } = countChange(now, before);
  return <ChangeMark sign={diff} className="tn-delta">{diff === 0 ? '±0' : fmtInt(Math.abs(diff))}{rel !== null && diff !== 0 && <> · {percent(Math.abs(diff), before, digits)}</>}</ChangeMark>;
}
/** "▲7.35 pts" */
const PointDelta = ({ value, digits }: { value: number; digits: number }) => <PointsDelta value={value} digits={digits} className="tn-delta" />;

/** edit: the number this tile changes, in a window under the tile (TileEdit.tsx); its pencil sits in the corner */
function Fact({ id, k, info, v, d, since, copy, edit }: { id: string; k: string; info?: ReactNode; v: ReactNode; d?: ReactNode; since?: ReactNode; copy?: ReactNode; edit?: { s: Scenario; field: TileField } }) {
  const tile = useRef<HTMLDivElement>(null);
  const editable = !!edit && tileEditable(edit.s, edit.field);
  return <div ref={tile} className={`tn-fact${editable ? ' tile-editable' : ''}`} data-fact={id}>
    <dt>{k}{info}{editable && <TileEditPopup s={edit!.s} field={edit!.field} tile={tile} />}</dt>
    <dd className="tn-v">{v}</dd>
    {d && <dd className="tn-d">{d}</dd>}
    {since && <dd className="tn-since">{since}</dd>}
    {copy && <dd className="tn-copy">{copy}</dd>}
  </div>;
}

export function TurnoutFacts({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const standard = useOn('turnoutFacts'), expert = useOn('turnoutCounts');
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
        copy={copy('registered', 'eligible voters', 'מספר בעלי זכות הבחירה')} edit={{ s, field: 'registered' }} />
      <Fact id="turnout" k={L('Turnout', 'שיעור ההצבעה')} info={<Info term="turnout" />}
        // as precise as the turnout field under it (two decimals), so one number never shows at two precisions
        v={<><span data-fixed-digits>{percent(cast, s.registered, TURNOUT_FIELD_DIGITS)}</span><TileEditedMark s={s} field="turnout" /></>}
        d={!standard || castEdited ? <>{!standard && <><bdi dir="ltr">{fmtInt(cast)}</bdi> {L('votes cast', 'מצביעים')}</>}{castEdited && <>{!standard && ' · '}{officialName} <span data-fixed-digits>{percent(official.votesCast, official.registered, TURNOUT_FIELD_DIGITS)}</span></>}</> : undefined}
        since={prev && sinceWords(<PointDelta value={pct - turnoutPct(prev.votesCast, prev.registered)} digits={digits} />)}
        copy={copy('turnout', 'turnout', 'שיעור ההצבעה')} edit={{ s, field: 'turnout' }} />
      {standard && <Fact id="cast" k={L('Votes cast', 'מצביעים')}
        info={<Info title={L('Votes cast', 'מצביעים')}>{L('Every ballot in the box, valid and invalid.', 'כל הפתקים בקלפי, כשרים ופסולים.')}</Info>}
        v={<bdi dir="ltr">{fmtInt(cast)}</bdi>}
        d={castEdited ? <>{officialName} <bdi dir="ltr">{fmtInt(official.votesCast)}</bdi></> : undefined}
        since={prev && sinceWords(<CountDelta now={cast} before={prev.votesCast} digits={digits} />)} />}
      {standard && <Fact id="valid" k={L('Valid votes', 'קולות כשרים')} info={<Info term="valid" />}
        v={<bdi dir="ltr">{fmtInt(valid)}</bdi>} />}
      {standard && <Fact id="invalid" k={L('Invalid ballots', 'קולות פסולים')} info={<Info term="invalid-votes" />}
        v={<><bdi dir="ltr">{fmtInt(s.invalid)}</bdi><EditMarker s={s} path={['invalid']} /></>} d={<>{percent(s.invalid, cast, digits)} {L('of votes cast', 'מהמצביעים')}</>}
        copy={expert && copy('invalid', 'invalid ballots', 'מספר הקולות הפסולים')} edit={{ s, field: 'invalid' }} />}
      {standard && (noThreshold
        ? <Fact id="threshold" k={L('Threshold', 'אחוז החסימה')} info={<Info term="threshold" />} v={<>{L('None', 'אין')}<EditMarker s={s} path={['rules', 'thresholdPct']} outlet="turnout-tile" /></>} d={L('No percentage threshold', 'ללא אחוז חסימה')} edit={{ s, field: 'threshold' }} />
        : <Fact id="threshold" k={L('Threshold', 'אחוז החסימה')} info={<Info term="threshold" />}
          v={<><bdi dir="ltr">{fmtInt(r.thresholdVotes)}</bdi> {L('votes', 'קולות')}<EditMarker s={s} path={['rules', 'thresholdPct']} outlet="turnout-tile" /></>} d={<>{trimDecimal(s.rules.thresholdPct)}% {L('of valid votes', 'מהקולות הכשרים')}</>} edit={{ s, field: 'threshold' }} />)}
      {expert && <Fact id="boxes" k={L('Polling-station results', 'תוצאות קלפי')} info={<Info term="polling-station"><span>{L('Results reported one by one, including central counts of double envelopes, so a little more than the number of polling stations.', 'תוצאות שדווחו אחת־אחת, כולל ספירה מרכזית של מעטפות כפולות, ולכן מעט יותר ממספר הקלפיות.')}</span></Info>}
        v={official.ballotBoxes === null ? '—' : <bdi dir="ltr">{fmtInt(official.ballotBoxes)}</bdi>}
        d={official.ballotBoxes === null ? L('Not in the source for this election', 'לא מופיע במקור לבחירות אלה') : undefined}
        since={official.ballotBoxes !== null && prev?.ballotBoxes ? sinceWords(<CountDelta now={official.ballotBoxes} before={prev.ballotBoxes} digits={digits} />) : undefined} />}
      {expert && <Fact id="envelopes" k={L('Double envelopes', 'מעטפות כפולות')} info={<Info term="envelopes" />}
        v={official.envelopeVotes === null ? '—' : <bdi dir="ltr">{fmtInt(official.envelopeVotes)}</bdi>}
        d={official.envelopeVotes === null ? L('Not in the source for this election', 'לא מופיע במקור לבחירות אלה') : <>{percent(official.envelopeVotes, official.votesCast, digits)} {L('of votes cast, incl. invalid', 'מהמצביעים, כולל פסולים')}</>} />}
    </dl>
    {standard && <TurnoutHistory current={s.electionId} compared={ref && ref.sc.electionId !== s.electionId ? ref.sc.electionId : null} />}
  </section>;
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  // measured before the first paint: drawn first at the fallback width, a phone showed one frame of a 720 px chart and
  // the page scrolled sideways (found by Bombadil, 19 Nov 2026)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const now = el.getBoundingClientRect().width; if (now > 0) setW(Math.max(240, Math.floor(now)));
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Eligible voters and turnout at every election: two small charts on one shared row of elections (never two scales
 *  on one axis), drawn left to right in Hebrew too. A column opens that election; the readout above names the
 *  hovered or current election, in a reserved line so nothing moves. */
// compared: the election Compare has on the other side, shaded grey in both charts (owner, 16 Nov 2026)
function TurnoutHistory({ current, compared }: { current: ElectionId; compared: ElectionId | null }) {
  const L = useL(), lang = useLang();
  const preferTables = useSetting('preferTables');
  const showLine = useSetting('turnoutHistoryLine');
  const index = useStore((st) => st.elections);
  const [ref, width] = useWidth<HTMLDivElement>(720);
  const [hover, setHover] = useState<number | null>(null);
  // shared hover timing (hoverIntent.ts): a resting mouse names a column; keys and touch at once
  const intent = useHoverIntent(() => setHover(null), hover !== null);
  const rows = ELECTION_TOTALS;
  const cur = rows.findIndex((t) => t.id === current);
  const cmp = compared ? rows.findIndex((t) => t.id === compared) : -1;
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
  const name = (t: ElectionTotalsRow) => { const e = index.find((x) => x.id === t.id); return e ? electionLabel(e, index, lang) : electionWhen(t, lang); };
  const label = (i: number) => `${name(rows[i])}: ${L('eligible voters', 'בעלי זכות בחירה')} ${fmtInt(rows[i].registered)}, ${L('turnout', 'הצבעה')} ${fmtPct(rows[i].votesCast, rows[i].registered, TURNOUT_FIELD_DIGITS)}`;
  const columns = (chart: 'reg' | 'pct') => rows.map((t, i) => <rect key={t.id} className="tn-hit" x={ml + i * slot} y={0} width={slot} height={top + H + axisH}
    onPointerEnter={(e) => { if (e.pointerType === 'touch') setHover(i); else intent.enter(() => setHover(i)); }} onPointerLeave={(e) => { if (e.pointerType !== 'touch') intent.leave(); if (!intent.isShown) setHover((h) => (h === i ? null : h)); }} onClick={() => go(i)} data-chart={chart} />);
  // the open election's year is always shown, in bold; regular ticks too close to it give way. The compared election's
  // year is bold too, unless it would touch the open one's (on a phone): the key above names it
  const years = rows.map((t, i) => (i === cur || i === cmp && !(cur >= 0 && Math.abs(i - cur) * slot < 24) || tick(i) && !(cur >= 0 && Math.abs(i - cur) * slot < 24) && !(cmp >= 0 && Math.abs(i - cmp) * slot < 24)) && <text key={t.id} x={x(i)} y={top + H + 13} className={`tn-axis ${i === cur || i === cmp ? 'cur' : ''}`} textAnchor="middle">{`’${t.date.slice(2, 4)}`}</text>);
  const band = (i: number) => <rect x={ml + i * slot + 0.5} y={top - 4} width={Math.max(1, slot - 1)} height={H + axisH + 4} rx={3} className={i === cur ? 'tn-cur' : i === cmp ? 'tn-cmp' : 'tn-hov'} />;

  // turnout is written with the turnout field's two decimals everywhere on this tab, like the figure above (owner, 19 Nov 2026)
  return <div className="tn-history">
    <h4>{L('All elections', 'כל הבחירות')} <Info title={L('All elections', 'כל הבחירות')}>{L('Each column is one election, evenly spaced whatever the time between them. Choose one to open it.', 'כל עמודה היא מערכת בחירות אחת, במרווחים שווים בלי קשר לזמן שעבר ביניהן. בחירה בעמודה פותחת אותה.')}</Info></h4>
    <p className="tn-readout small" aria-live="polite">
      <b>{name(shown)}</b> · {L('Eligible', 'בעלי זכות')} <bdi dir="ltr">{fmtInt(shown.registered)}</bdi> · {L('Turnout', 'הצבעה')} {percentNum(pcts[rows.indexOf(shown)], TURNOUT_FIELD_DIGITS)}
    </p>
    {cmp >= 0 && cur >= 0 && <p className="tn-key small ink2">
      <span><i className="tn-sw cur" aria-hidden />{L(`${name(rows[cur])} · open`, `${name(rows[cur])} · פתוחות`)}</span>
      <span><i className="tn-sw cmp" aria-hidden />{L(`${name(rows[cmp])} · compared`, `${name(rows[cmp])} · בהשוואה`)}</span>
    </p>}
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
          {hover !== null && hover !== cur && hover !== cmp && band(hover)}{cmp >= 0 && band(cmp)}{cur >= 0 && band(cur)}
          {rows.map((t, i) => <g key={t.id} data-i={i} role="button" aria-label={label(i)} aria-current={i === cur ? 'true' : undefined} tabIndex={i === (hover ?? cur) ? 0 : -1}
            className="tn-col" onFocus={() => setHover(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } }}>
            <rect x={x(i) - bw / 2} y={yReg(t.registered)} width={bw} height={top + H - yReg(t.registered)} rx={Math.min(2, bw / 4)} className={`tn-bar ${i === cur ? 'cur' : ''}`} />
          </g>)}
          {years}{columns('reg')}
        </svg>
      </div>
      {showLine && <div className="tn-panel" aria-hidden>
        <div className="tn-cap small ink2">{L('Turnout (%)', 'שיעור ההצבעה (%)')}</div>
        <svg width={width} height={top + H + axisH} viewBox={`0 0 ${width} ${top + H + axisH}`} direction="ltr" className="tn-chart">
          {Array.from({ length: (pHi - pLo) / 10 + 1 }, (_, k) => pLo + k * 10).map((v) => <g key={v}>
            <line x1={ml} x2={width - mr} y1={yPct(v)} y2={yPct(v)} className="tn-gl" />
            <text x={ml - 5} y={yPct(v) + 3.5} className="tn-axis" textAnchor="end">{v}</text></g>)}
          {hover !== null && hover !== cur && hover !== cmp && band(hover)}{cmp >= 0 && band(cmp)}{cur >= 0 && band(cur)}
          <polyline points={pcts.map((p, i) => `${x(i)},${yPct(p)}`).join(' ')} className="tn-line" />
          {pcts.map((p, i) => <circle key={i} cx={x(i)} cy={yPct(p)} r={i === cur ? 4.5 : 3} className={`tn-dot ${i === cur ? 'cur' : ''}`} />)}
          {years}{columns('pct')}
        </svg>
      </div>}
    </div>
    <details className="tn-table" open={preferTables}>
      <summary className="small">{L('Table', 'טבלה')}</summary>
      <div className="tn-table-wrap"><table className="tbl small">
        <thead><tr><th>{L('Election', 'בחירות')}</th><th className="n">{L('Eligible voters', 'בעלי זכות בחירה')}</th><th className="n">{L('Votes cast', 'מצביעים')}</th><th className="n">{L('Turnout', 'הצבעה')}</th><th className="n">{L('Valid', 'כשרים')}</th><th className="n">{L('Invalid', 'פסולים')}</th><th className="n">{L('Threshold (votes)', 'אחוז החסימה (קולות)')}</th></tr></thead>
        <tbody>{rows.map((t, i) => { const thr = officialThreshold(t); return <tr key={t.id} aria-current={i === cur ? 'true' : undefined}>
          <td>{name(t)}</td><td className="n">{fmtInt(t.registered)}</td><td className="n">{fmtInt(t.votesCast)}</td><td className="n">{percent(t.votesCast, t.registered, TURNOUT_FIELD_DIGITS)}</td>
          <td className="n">{fmtInt(t.valid)}</td><td className="n">{fmtInt(t.invalid)}</td><td className="n">{thr ? fmtInt(thr.votes) : L('None', 'אין')}</td></tr>; })}</tbody>
      </table></div>
    </details>
  </div>;
}
