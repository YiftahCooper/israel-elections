import { useFloating } from '../floating.tsx';
import { useDisclosure } from './Feature.tsx';
import { EditMarker } from './EditMarker.tsx';
// Each figure opens the same independent popover without resizing the board.
import { useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { listLabel, methodOf, referenceLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat, pctExactNote } from '../format.ts';
import { dispatch, setState, useDigits } from '../store.ts';
import { DecimalInput, Info } from './ui.tsx';

function Fig({ k, term, v, d, children }: { k: string; term?: string; v: ReactNode; d?: ReactNode; children?: ReactNode }) {
  const L = useL();
  const popoverId = useId();
  const pop = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useFloating(pop, () => trigger.current?.getBoundingClientRect(), isOpen, false);
  if (!children) return <div className="fig static"><span className="k"><span>{k}</span></span><span className="v"><bdi dir="ltr">{v}</bdi></span>{d && <span className="d">{d}</span>}</div>;
  return (
    <div className={`fig ${isOpen ? 'open' : ''}`}>
      <button ref={trigger} type="button" aria-expanded={isOpen} aria-controls={popoverId} popoverTarget={popoverId}>
        <span className="k"><span>{k}</span>{isOpen ? <ChevronUp className="icon sm" aria-hidden /> : <ChevronDown className="icon sm" aria-hidden />}</span>
        <span className="v"><bdi dir="ltr">{v}</bdi></span>
        {d && <span className="d">{d}</span>}
      </button>
      <div id={popoverId} ref={pop} className="more" popover="auto" onToggle={e => { setOpen(e.newState === 'open'); }}><div className="more-head"><b>{k}</b><button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={() => pop.current?.hidePopover()}><X className="icon sm" aria-hidden /></button></div>{children}{term && <div className="row small ink2" style={{ marginTop: 8, gap: 4 }}>{L('Definition and source', 'הגדרה ומקור')} <Info term={term} /></div>}</div>
    </div>
  );
}

export function Figures({ s, r, ds }: { s: Scenario; r: AllocationResult; ds: ElectionDataset }) {
  const L = useL();
  const { shown: expert, control: expertControl } = useDisclosure('expertFigures');
  const { shown: standard, control: standardControl } = useDisclosure('voteFigures');
  const lang = useLang();
  const digits = useDigits();

  const cast = votesCast(s);
  const thrPct = s.rules.thresholdPct;
  const thr = Number(r.thresholdVotes);
  const noThreshold = Number(thrPct) === 0;
  const method = methodOf(s.rules);
  const row = (l: Scenario['lists'][number]) => ({ l, lr: r.lists.find((x) => x.id === l.id)! });
  // votes for lists that won no seat: below the threshold, or (1949) without a whole quota
  const seatless = s.lists.map(row).filter(({ l, lr }) => !l.withdrawn && lr.seats === 0 && l.votes > 0).sort((a, b) => b.l.votes - a.l.votes);
  const seatlessVotes = seatless.reduce((t, x) => t + x.l.votes, 0);
  const near = s.lists.map(row).filter(({ l }) => !l.withdrawn && l.votes >= thr * 0.5 && l.votes <= thr * 1.6).sort((a, b) => b.l.votes - a.l.votes);
  const select = (id: string) => setState({ selectedListId: id });
  const signed = (n: number) => <bdi dir="ltr">{n >= 0 ? '+' : '−'}{fmtInt(Math.abs(n))}</bdi>;

  return (
    <div className="figures" data-valid-votes={fmtInt(r.totalValid)}>
      {noThreshold
        ? <Fig k={L('Threshold', 'אחוז החסימה')} v={L('None', 'אין')}><p className="small">{L('No percentage threshold in this election.', 'בבחירות אלה לא נקבע אחוז חסימה.')}</p></Fig>
        : <Fig k={L('Threshold', 'אחוז החסימה')} term="threshold" v={fmtInt(r.thresholdVotes)} d={`${thrPct}% ${L('of valid votes', 'מהכשרים')}`}>
            {expert && <div className="formula" style={{ marginBottom: 8 }}>⌈{thrPct}% × {fmtInt(r.totalValid)}⌉ = {fmtInt(r.thresholdVotes)}</div>}
            {near.length ? <table className="tbl"><thead><tr><th>{L('Lists near the threshold', 'רשימות סביב החסימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Distance', 'מרחק')}</th></tr></thead>
              <tbody>{near.map(({ l }) => <tr key={l.id} ><td><button className="table-action" onClick={() => select(l.id)}>{listLabel(l, lang)}</button></td><td className="n">{fmtInt(l.votes)}</td><td className="n">{signed(l.votes - thr)}</td></tr>)}</tbody></table>
              : <p className="small muted" style={{ margin: 0 }}>{L('No lists nearby', 'אין רשימות קרובות')}</p>}
          </Fig>}

      {r.quota.num > 0n && (
        <Fig k={L('Votes per seat', 'קולות למנדט')} term="quota" v={fmtRat(r.quota, 0)} d={L('the general quota', 'המודד הכללי')}>
          <div className="formula">⌊{fmtInt(r.qualifyingVotes)} ÷ {s.rules.seats}⌋ = {r.quota.den === 1n ? fmtInt(r.quota.num) : fmtFrac(r.quota)}</div>
          <p className="small" style={{ marginBottom: 0 }}><Info title={L('Quota calculation', 'חישוב המודד')}>{L('The votes of the lists that passed the threshold, divided by the seats. It is not a price per extra seat: a further seat depends on every list’s remainder.', 'הקולות של הרשימות שעברו את החסימה, חלקי מספר המנדטים. אין זה "מחיר" למנדט נוסף: מנדט נוסף תלוי בעודפים של כל הרשימות.')}</Info></p>
        </Fig>
      )}

      <Fig k={L('Votes with no seat', 'קולות ללא מנדט')} term="unrepresented" v={fmtPct(seatlessVotes, r.totalValid, digits)} d={`${fmtInt(seatlessVotes)} ${L('votes', 'קולות')}`}>
        {seatless.length ? <div className="tablewrap" style={{ maxHeight: 300 }}><table className="tbl"><thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('% of valid', '% מהכשרים')}</th></tr></thead>
          <tbody>{seatless.map(({ l }) => <tr key={l.id} ><td><button className="table-action" onClick={() => select(l.id)}>{listLabel(l, lang)}</button></td><td className="n">{fmtInt(l.votes)}</td><td className="n" title={pctExactNote(l.votes, r.totalValid, digits, s.rules.thresholdPct, lang)}>{fmtPct(l.votes, r.totalValid, digits, s.rules.thresholdPct)}</td></tr>)}
            <tr><td><b>{L('Total', 'סה״כ')}</b></td><td className="n"><b>{fmtInt(seatlessVotes)}</b></td><td className="n"><b>{fmtPct(seatlessVotes, r.totalValid, digits)}</b></td></tr></tbody></table></div>
          : <p className="small muted" style={{ margin: 0 }}>{L('Every list that ran won a seat.', 'כל הרשימות זכו במנדט.')}</p>}
      </Fig>

      <Fig k={L('Turnout', 'שיעור ההצבעה')} term="turnout" v={fmtPct(cast, s.registered, digits)} d={fmtPct(cast, s.registered, digits) === fmtPct(ds.totals.votesCast, ds.totals.registered, digits) ? `${fmtInt(cast)} ${L('ballots cast', 'מצביעים')}` : `${referenceLabel(null, lang).name} ${fmtPct(ds.totals.votesCast, ds.totals.registered, digits)}`}>
        <div className="row">
          <label className="row small">{L('Set turnout to', 'קביעת שיעור ההצבעה ל-')}
            <DecimalInput value={s.registered ? (cast / s.registered) * 100 : 0} digits={2} width={86} label={L('Turnout %', 'שיעור הצבעה %')} onCommit={(p) => dispatch({ type: 'setTurnout', pct: p })} />% <Info title={L('Proportional turnout', 'הצבעה יחסית')}>{L('Every list, and the invalid ballots, grows or shrinks in proportion.', 'כל הרשימות, והקולות הפסולים, גדלים או קטנים באופן יחסי.')}</Info></label>
          {Math.abs(cast - ds.totals.votesCast) > 0 && s.registered === ds.totals.registered && <button className="btn small" onClick={() => dispatch({ type: 'setTurnout', pct: (ds.totals.votesCast / ds.totals.registered) * 100 })}>{L('Restore turnout', 'שחזור ההצבעה')}</button>}
        </div>
        <div className="kv small"><span>{L('Registered voters', 'בעלי זכות בחירה')}</span><span>{fmtInt(s.registered)}</span><span>{L('Ballots cast', 'מצביעים')}</span><span>{fmtInt(cast)}</span><span>{L('Invalid ballots', 'קולות פסולים')}</span><span>{fmtInt(s.invalid)}</span></div>
      </Fig>

      {standard && <Fig k={L('Invalid ballots', 'קולות פסולים')} term="invalid-votes" v={<>{fmtInt(s.invalid)}<EditMarker s={s} path={['invalid']} /></>} d={`${fmtPct(s.invalid, cast, digits)} ${L('of ballots cast', 'מהמצביעים')}`}>
        {/* the valid votes are the complement of this card, so they are its breakdown rather than a card beside it */}
        <p className="small" style={{ margin: 0 }}><Info title={L('Invalid ballots', 'קולות פסולים')}>{L('Ballots the polling committees disqualified. They count towards turnout but not towards the threshold or the seats.', 'פתקים שוועדות הקלפי פסלו. הם נספרים בשיעור ההצבעה אך לא באחוז החסימה ובמנדטים.')}</Info>{s.invalid !== ds.totals.invalid && ` ${referenceLabel(null, lang).name}: ${fmtInt(ds.totals.invalid)}.`}</p>
        <div className="kv small"><span>{L('Ballots cast', 'מצביעים')}</span><span>{fmtInt(cast)}</span><span>{L('Invalid ballots', 'קולות פסולים')}</span><span>{fmtInt(s.invalid)}</span><span><b>{L('Valid votes', 'קולות כשרים')}</b></span><span><b>{fmtInt(r.totalValid)}</b></span></div>
      </Fig>}
      {expert && <Fig k={L('Qualifying votes', 'קולות משתתפים')} term="qualifying" v={fmtInt(r.qualifyingVotes)} d={`${fmtPct(Number(r.qualifyingVotes), Number(r.totalValid), digits)} ${L('of valid', 'מהכשרים')}`}>
        <p className="small" style={{ margin: 0 }}>{L(`${r.lists.filter(x => x.qualified).length} qualifying lists`, `${r.lists.filter(x => x.qualified).length} רשימות משתתפות`)} <Info title={L('Qualifying votes', 'קולות משתתפים')}>{L(`The votes of the ${r.lists.filter((x) => x.qualified).length} lists that passed the threshold; only these share the seats. ${fmtInt(r.unrepresentedVotes)} valid votes went to lists that did not.`, `הקולות של ${r.lists.filter((x) => x.qualified).length} הרשימות שעברו את החסימה; רק הן מתחלקות במנדטים. ${fmtInt(r.unrepresentedVotes)} קולות כשרים ניתנו לרשימות שלא עברו.`)}</Info></p>
      </Fig>}
      {expert && (
        <Fig k={L('Seats: quota + remainder', 'מנדטים: מודד + עודפים')} term={method.term} v={`${r.initialSeatsTotal} + ${r.remainderSeatsTotal}`} d={L(`${r.remainderSeatsTotal} by ${method.en}`, `${r.remainderSeatsTotal} ב${method.he}`)}>
          <p className="small" style={{ margin: '0 0 6px' }}>{L(`${r.initialSeatsTotal} seats went by whole quotas; the remaining ${r.remainderSeatsTotal} by ${method.en}.`, `${r.initialSeatsTotal} מנדטים חולקו במודדים שלמים; ${r.remainderSeatsTotal} הנותרים ב${method.he}.`)}</p>
          <button className="btn small" onClick={() => setState({ tool: 'walk' })}>{L('Allocation steps', 'שלבי החלוקה')}</button>
        </Fig>
      )}
      {(standardControl || expertControl) && <div className="figures-more">{standardControl}{expertControl}</div>}
    </div>
  );
}
