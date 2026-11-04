import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { useL } from '../i18n.ts';
import { methodOf } from '../derive.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { useLevel, useDigits } from '../store.ts';
import { DecimalInput, Delta, Info, Tile } from './ui.tsx';
import { dispatch } from '../store.ts';

export function KeyStats({ s, r, ds, baseR }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; baseR: AllocationResult }) {
  const L = useL();
  const digits = useDigits();
  const cast = votesCast(s);
  const thrPct = s.rules.thresholdPct;
  const { simple, expert } = useLevel();
  const noThreshold = Number(thrPct) === 0;
  // the remainder method of this election (or experiment), named and explained correctly for its era
  const method = methodOf(s.rules);
  // votes for lists that won no seat: below the threshold, or (1949) without a whole quota
  const seatless = s.lists.reduce((t, l) => t + (!l.withdrawn && (r.lists.find((x) => x.id === l.id)?.seats ?? 0) === 0 ? l.votes : 0), 0);
  const turnoutTile = (
      <Tile k={L('Turnout', 'שיעור ההצבעה')} term="turnout" v={<span className="row" style={{ gap: 4 }}><DecimalInput value={s.registered ? (cast / s.registered) * 100 : 0} digits={2} width={86} label={L('Turnout %', 'שיעור הצבעה %')} onCommit={(p) => dispatch({ type: 'setTurnout', pct: p })} />%</span>} d={<>{L('historical', 'בפועל')} {fmtPct(ds.totals.votesCast, ds.totals.registered, digits)}{Math.abs(cast - ds.totals.votesCast) > 0 && s.registered === ds.totals.registered && <> · <button className="btn small ghost" style={{ padding: 0, minHeight: 0 }} onClick={() => dispatch({ type: 'setTurnout', pct: (ds.totals.votesCast / ds.totals.registered) * 100 })}>{L('restore', 'שחזור')}</button></>}</>}>
        <div>{L('Votes cast ÷ registered voters. Edit it to scale every list (and the invalid ballots) in proportion.', 'מצביעים ÷ בעלי זכות בחירה. עריכה משנה את כל הרשימות (והפסולים) באופן יחסי.')}</div>
      </Tile>);
  if (simple) return (
    <p className="small ink2 simple-stats">
      {noThreshold
        ? L('No percentage threshold applies', 'אין אחוז חסימה')
        : <>{L(`A list needs at least ${fmtInt(r.thresholdVotes)} votes (${thrPct}%) to win seats`, `רשימה צריכה לפחות ${fmtInt(r.thresholdVotes)} קולות (${thrPct}%) כדי להיכנס לכנסת`)} <Info term="threshold" /></>}
      {/* methods without a quota stage (Sainte-Laguë) have no general quota: say nothing rather than "0 votes" */}
      {r.quota.num > 0n ? <>{L(`; each seat takes about ${fmtRat(r.quota, 0)} votes`, `; כל מנדט שווה כ-${fmtRat(r.quota, 0)} קולות`)} <Info term="quota" />.</> : '.'}
    </p>
  );
  if (!expert) return (
    <div className="tiles">
      {turnoutTile}
      {noThreshold
        ? <Tile k={L('Threshold', 'אחוז החסימה')} term="threshold" v={L('None', 'אין')} d={L('no percentage threshold in this election', 'לא היה אחוז חסימה בבחירות אלה')} />
        : <Tile k={L('Votes needed to pass the threshold', 'קולות למעבר אחוז החסימה')} term="threshold" v={fmtInt(r.thresholdVotes)} d={`${thrPct}% ${L('of valid votes', 'מהקולות הכשרים')}`} />}
      <Tile k={L('Wasted votes', 'קולות שהלכו לאיבוד')} term="unrepresented" v={fmtPct(seatless, r.totalValid, 1)} d={`${fmtInt(seatless)} ${L('votes for lists that won no seat', 'קולות לרשימות שלא זכו במושב')}`} />
      <Tile k={L('Votes per seat', 'קולות למנדט')} term="quota" v={fmtRat(r.quota, 0)} d={L('the general quota', 'המודד הכללי')} />
    </div>
  );
  return (
    <div className="tiles">
      <Tile k={L('Valid votes', 'קולות כשרים')} term="valid" v={fmtInt(r.totalValid)} d={<Delta v={Number(r.totalValid - baseR.totalValid)} />} />
      <Tile k={L('Threshold', 'אחוז החסימה')} term="threshold" v={fmtInt(r.thresholdVotes)} d={`${thrPct}% · ${L('exact', 'מדויק')} ${fmtRat(r.thresholdExact, 3)}`}>
        <div className="formula">⌈{thrPct}% × {fmtInt(r.totalValid)}⌉ = {fmtInt(r.thresholdVotes)}</div>
      </Tile>
      <Tile k={L('Qualifying votes', 'קולות משתתפים')} term="qualifying" v={fmtInt(r.qualifyingVotes)} d={fmtPct(r.qualifyingVotes, r.totalValid, digits) + L(' of valid', ' מהכשרים')} />
      <Tile k={L('Unrepresented', 'לא השתתפו בחלוקה')} term="unrepresented" v={fmtInt(r.unrepresentedVotes)} d={fmtPct(r.unrepresentedVotes, r.totalValid, digits) + L(' of valid', ' מהכשרים')} />
      <Tile k={L('General quota', 'המודד הכללי')} term="quota" v={fmtRat(r.quota, r.quota.den === 1n ? 0 : 2)} d={L('votes per whole seat', 'קולות למנדט שלם')}>
        <div className="formula">⌊{fmtInt(r.qualifyingVotes)} ÷ {s.rules.seats}⌋ = {r.quota.den === 1n ? fmtInt(r.quota.num) : fmtFrac(r.quota)}</div>
        <div className="small" style={{ marginTop: 6 }}>{L('Not a price per extra seat: the cost of a further seat depends on every list’s remainder.', 'אין זה "מחיר" למנדט נוסף: המחיר תלוי בעודפים של כל הרשימות.')}</div>
      </Tile>
      <Tile k={L('Seats: quota / remainder', 'מנדטים: מודד / עודפים')} term={method.term} v={`${r.initialSeatsTotal} + ${r.remainderSeatsTotal}`} d={L(`${r.remainderSeatsTotal} seats allocated by ${method.en}`, `${r.remainderSeatsTotal} מנדטים חולקו ב${method.he}`)} />
      {turnoutTile}
      <Tile k={L('Invalid ballots', 'קולות פסולים')} term="invalid-votes" v={fmtInt(s.invalid)} d={fmtPct(s.invalid, cast, digits) + L(' of cast', ' מהמצביעים')} />
    </div>
  );
}
