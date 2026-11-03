import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { useStore } from '../store.ts';
import { Delta, Tile } from './ui.tsx';

export function KeyStats({ s, r, ds, baseR }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; baseR: AllocationResult }) {
  const L = useL();
  const digits = useStore((st) => st.digits);
  const cast = votesCast(s);
  const thrPct = s.rules.thresholdPct;
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
      <Tile k={L('Turnout', 'שיעור ההצבעה')} v={fmtPct(cast, s.registered, digits)} d={`${L('historical', 'בפועל')} ${fmtPct(ds.totals.votesCast, ds.totals.registered, digits)}`}>
        <div>{L('Votes cast (valid + invalid) ÷ registered voters.', 'מצביעים (כשרים + פסולים) ÷ בעלי זכות בחירה.')}</div>
        <div className="formula">{fmtInt(cast)} ÷ {fmtInt(s.registered)}</div>
      </Tile>
      <Tile k={L('Invalid ballots', 'קולות פסולים')} v={fmtInt(s.invalid)} d={fmtPct(s.invalid, cast, digits) + L(' of cast', ' מהמצביעים')} />
    </div>
  );
}

export function BlocBar({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const total = s.rules.seats;
  const majority = Math.floor(total / 2) + 1;
  const sums = s.blocs.map((b) => ({ b, n: s.lists.filter((l) => l.bloc === b.id).reduce((t, l) => t + (r.lists.find((x) => x.id === l.id)?.seats ?? 0), 0) }));
  const other = total - sums.reduce((t, x) => t + x.n, 0);
  if (!s.blocs.length) return null;
  return (
    <div>
      <div className="row small" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="ink2">{L('Seats by bloc (editable grouping, not an official classification)', 'מנדטים לפי גוש (חלוקה ניתנת לעריכה, לא סיווג רשמי)')}</span>
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
