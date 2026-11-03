import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { useLevel, useStore } from '../store.ts';
import { DecimalInput, Delta, Tile } from './ui.tsx';
import { dispatch } from '../store.ts';

export function KeyStats({ s, r, ds, baseR }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; baseR: AllocationResult }) {
  const L = useL();
  const digits = useStore((st) => st.digits);
  const cast = votesCast(s);
  const thrPct = s.rules.thresholdPct;
  const { simple, expert } = useLevel();
  const turnoutTile = (
      <Tile k={L('Turnout', 'שיעור ההצבעה')} v={<span className="row" style={{ gap: 4 }}><DecimalInput value={s.registered ? (cast / s.registered) * 100 : 0} digits={2} width={86} label={L('Turnout %', 'שיעור הצבעה %')} onCommit={(p) => dispatch({ type: 'setTurnout', pct: p })} />%</span>} d={<>{L('historical', 'בפועל')} {fmtPct(ds.totals.votesCast, ds.totals.registered, digits)}{Math.abs(cast - ds.totals.votesCast) > 0 && s.registered === ds.totals.registered && <> · <button className="btn small ghost" style={{ padding: 0, minHeight: 0 }} onClick={() => dispatch({ type: 'setTurnout', pct: (ds.totals.votesCast / ds.totals.registered) * 100 })}>{L('restore', 'שחזור')}</button></>}</>}>
        <div>{L('Votes cast ÷ registered voters. Edit it to scale every list (and the invalid ballots) in proportion.', 'מצביעים ÷ בעלי זכות בחירה. עריכה משנה את כל הרשימות (והפסולים) באופן יחסי.')}</div>
      </Tile>);
  if (simple) return (
    <p className="small ink2 simple-stats">
      {L(`A list needs at least ${fmtInt(r.thresholdVotes)} votes (${thrPct}%) to win seats; each seat takes about ${fmtRat(r.quota, 0)} votes.`,
        `רשימה צריכה לפחות ${fmtInt(r.thresholdVotes)} קולות (${thrPct}%) כדי להיכנס לכנסת; כל מנדט שווה כ-${fmtRat(r.quota, 0)} קולות.`)}
    </p>
  );
  if (!expert) return (
    <div className="tiles">
      {turnoutTile}
      <Tile k={L('Votes needed to pass the threshold', 'קולות למעבר אחוז החסימה')} term="threshold" v={fmtInt(r.thresholdVotes)} d={`${thrPct}% ${L('of valid votes', 'מהקולות הכשרים')}`} />
      <Tile k={L('Wasted votes', 'קולות שהלכו לאיבוד')} term="unrepresented" v={fmtPct(r.unrepresentedVotes, r.totalValid, 1)} d={`${fmtInt(r.unrepresentedVotes)} ${L('votes for lists that did not get in', 'קולות לרשימות שלא נכנסו')}`} />
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
      <Tile k={L('Seats: quota / remainder', 'מנדטים: מודד / עודפים')} term="baderofer" v={`${r.initialSeatsTotal} + ${r.remainderSeatsTotal}`} d={L(`${r.remainderSeatsTotal} seats allocated by Bader–Ofer`, `${r.remainderSeatsTotal} מנדטים חולקו בבדר–עופר`)} />
      {turnoutTile}
      <Tile k={L('Invalid ballots', 'קולות פסולים')} v={fmtInt(s.invalid)} d={fmtPct(s.invalid, cast, digits) + L(' of cast', ' מהמצביעים')} />
    </div>
  );
}

export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const { expert } = useLevel();
  const lang = useLang();
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  const sums = s.blocs.map((b) => ({ b, n: s.lists.filter((l) => l.bloc === b.id).reduce((t, l) => t + (r.lists.find((x) => x.id === l.id)?.seats ?? 0), 0) }));
  const other = r.seatsAllocated - sums.reduce((t, x) => t + x.n, 0);
  if (!s.blocs.length) return null;
  if (r.seatsAllocated === 0) return <p className="small muted" style={{ margin: 0 }}>{L('No seats are allocated in this scenario.', 'בתרחיש זה לא חולקו מושבים.')}</p>;
  return (
    <div>
      <div className="row small" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="ink2">{expert ? L('Seats by bloc (editable grouping, not an official classification)', 'מנדטים לפי גוש (חלוקה ניתנת לעריכה, לא סיווג רשמי)') : L('Seats by bloc (an informal grouping, not an official classification)', 'מנדטים לפי גוש (חלוקה לא רשמית)')}</span>
        <span className="muted">{L(`majority ${majority}`, `רוב ${majority}`)}</span>
      </div>
      <div className="majority-bar" role="img" aria-label={sums.map((x) => `${lang === 'he' ? x.b.nameHe : x.b.nameEn} ${x.n}`).join(', ')}>
        {sums.map((x) => <div key={x.b.id} style={{ flexBasis: `${(x.n / total) * 100}%`, background: x.b.color }} title={`${lang === 'he' ? x.b.nameHe : x.b.nameEn}: ${x.n}`} />)}
        {other > 0 && <div style={{ flexBasis: `${(other / total) * 100}%`, background: 'var(--axis)' }} title={`${L('Unassigned', 'ללא גוש')}: ${other}`} />}
        <span className="majority-line" style={{ insetInlineStart: `calc(${(majority / total) * 100}% - 1px)` }} aria-hidden />
      </div>
      <div className="legend" style={{ marginTop: 6 }}>
        {sums.map((x) => <span key={x.b.id} className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: x.b.color }} />{lang === 'he' ? x.b.nameHe : x.b.nameEn} <b className="tabnum">{x.n}</b>{x.n >= majority && <span className="chip ok">{L('majority', 'רוב')}</span>}</span>)}
        {other > 0 && <span className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: 'var(--axis)' }} />{L('Unassigned', 'ללא גוש')} <b className="tabnum">{other}</b></span>}
      </div>
    </div>
  );
}
