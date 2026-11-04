import { GraphicChanges } from './GraphicChanges.tsx';
import { useEffect, useMemo, useState } from 'react';
import type { AllocationResult, RemainderStep } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel, methodOf } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { dispatch, setState, useStore, useDigits } from '../store.ts';
import { Info } from './ui.tsx';

type Step = { kind: 'threshold' } | { kind: 'quota' } | { kind: 'initial' } | { kind: 'remainder'; st: RemainderStep } | { kind: 'internal'; unitId: string } | { kind: 'final' };

export function Walkthrough({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const advanced = useStore((st) => st.level === 'expert');
  // divisor methods (Sainte-Laguë, D'Hondt…) have no quota stage: every seat is awarded one at a time
  const divisor = ['sainte-lague', 'dhondt', 'modified-sainte-lague'].includes(s.rules.remainderMethod);
  const steps: Step[] = useMemo(() => [
    { kind: 'threshold' }, ...(divisor ? [] : [{ kind: 'quota' as const }, { kind: 'initial' as const }]),
    ...r.remainderSteps.map((st) => ({ kind: 'remainder' as const, st })),
    ...r.internalDivisions.map((d) => ({ kind: 'internal' as const, unitId: d.unitId })),
    { kind: 'final' },
  ], [r, divisor]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (i >= steps.length) setI(steps.length - 1); }, [steps.length, i]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI((x) => { if (x >= steps.length - 1) { setPlaying(false); return x; } return x + 1; }), 1400);
    return () => clearInterval(t);
  }, [playing, steps.length]);

  const name = (id: string) => {
    const l = s.lists.find((x) => x.id === id);
    if (l) return listLabel(l, lang);
    const u = r.units.find((x) => x.id === id);
    return u ? u.memberIds.map((m) => listLabel(s.lists.find((x) => x.id === m)!, lang)).join(' + ') : L('Allocation unit', 'יחידת חלוקה');
  };
  const step = steps[Math.min(i, steps.length - 1)];
  const label = (st: Step) => st.kind === 'remainder' ? `${L('Seat', 'מנדט')} ${r.initialSeatsTotal + st.st.step}` : st.kind === 'internal' ? `${L('Split', 'חלוקה')}: ${r.units.find((u) => u.id === st.unitId)?.memberIds.map((m) => listLabel(s.lists.find((x) => x.id === m)!, lang)).join('+') ?? ''}`
    : st.kind === 'final' ? L('Result', 'תוצאה') : st.kind === 'threshold' ? L('Threshold', 'חסימה') : st.kind === 'quota' ? L('Quota', 'מודד') : L('Whole quotas', 'מודד שלם');
  const n = (kind: Step['kind']) => steps.findIndex((x) => x.kind === kind) + 1;
  // the quota as the engine computed it: seats + 1 in 1949, Droop, unrounded, or the exact fallback when rounding fails
  const fallback = r.warnings.some((w) => (w.code === 'zero-quota' || w.code === 'quota-over-allocation') && !(w.data as { stage?: string } | undefined)?.stage);
  const quotaSeats = s.rules.seats + (fallback ? 0 : s.rules.quotaSeatOffset ?? 0);
  const quotaFormula = s.rules.remainderMethod === 'droop' && !fallback
    ? `⌊ ${fmtInt(r.qualifyingVotes)} ÷ ${s.rules.seats + 1} ⌋ + 1`
    : s.rules.quotaRounding === 'floor' && !fallback ? `⌊ ${fmtInt(r.qualifyingVotes)} ÷ ${quotaSeats} ⌋` : `${fmtInt(r.qualifyingVotes)} ÷ ${quotaSeats}`;
  const exactQuotient = (q: RemainderStep['quotients'][number]) => {
    if (!q.eligible) return '';
    switch (s.rules.remainderMethod) {
      case 'bader-ofer': case 'dhondt': return `${fmtInt(q.votes)}/${q.seats + 1}`;
      case 'sainte-lague': return `${fmtInt(q.votes)}/${2 * q.seats + 1}`;
      case 'modified-sainte-lague': return q.seats === 0 ? `${fmtInt(q.votes)}/1.4` : `${fmtInt(q.votes)}/${2 * q.seats + 1}`;
      default: return `${fmtInt(q.votes)} − ${fmtRat(r.quota, 0)}×${q.seats}`;
    }
  };

  return (
    <div>
      <GraphicChanges s={s} r={r} />
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn small" onClick={() => setI(0)}>{L('Start', 'להתחלה')}</button>
        <button className="btn small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>{L('Previous', 'הקודם')}</button>
        <button className="btn small primary" onClick={() => { if (i >= steps.length - 1) setI(0); setPlaying((p) => !p); }}>{playing ? L('Pause', 'השהיה') : L('Play', 'הפעלה')}</button>
        <button className="btn small" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>{L('Next', 'הבא')}</button>
        <span className="muted small">{L(`Step ${i + 1} of ${steps.length}`, `צעד ${i + 1} מתוך ${steps.length}`)}</span>
      </div>
      <div className="steps" role="tablist" aria-label={L('Allocation steps', 'שלבי החלוקה')} style={{ marginBottom: 12 }}>
        {steps.map((st, k) => <button key={k} role="tab" aria-selected={k === i} className={`btn small ${k === i ? 'primary' : ''}`} onClick={() => { setPlaying(false); setI(k); }}>{label(st)}</button>)}
      </div>

      {step.kind === 'threshold' && (
        <div>
          <h3>{n('threshold')}. {L('Which lists pass the threshold?', 'אילו רשימות עוברות את אחוז החסימה?')} <Info term="threshold" /></h3>
          {Number(s.rules.thresholdPct) > 0
            ? <p><span className="formula">{s.rules.thresholdPct}% × {fmtInt(r.totalValid)} = {fmtRat(r.thresholdExact, 3)} → {fmtInt(r.thresholdVotes)}</span></p>
            : <p>{L('No percentage threshold applies: every list takes part.', 'אין אחוז חסימה: כל הרשימות משתתפות.')}</p>}
          <p className="small ink2">{L('All valid votes count', 'כל הקולות הכשרים נספרים')} <Info title={L('Threshold denominator', 'בסיס אחוז החסימה')}>{L('Votes for every list count in the total, including lists that fail.', 'הקולות לכל הרשימות נכללים בסך, גם של רשימות שלא עברו.')}</Info></p>
          <ListTable s={s} r={r} rows={[...r.lists].filter((l) => l.votes > 0n).sort((a, b) => Number(b.votes - a.votes)).slice(0, 18)} cols={(l) => [fmtInt(l.votes), fmtPct(l.votes, r.totalValid, digits), l.qualified ? L('passes', 'עוברת') : L('fails', 'לא עוברת')]} heads={[L('Votes', 'קולות'), L('Share', 'שיעור'), L('Result', 'תוצאה')]} />
          <p className="small">{L(`Unrepresented votes: ${fmtInt(r.unrepresentedVotes)} (${fmtPct(r.unrepresentedVotes, r.totalValid, digits)})`, `קולות שלא השתתפו בחלוקה: ${fmtInt(r.unrepresentedVotes)} (${fmtPct(r.unrepresentedVotes, r.totalValid, digits)})`)}</p>
        </div>
      )}
      {step.kind === 'quota' && (
        <div>
          <h3>{n('quota')}. {L('General quota', 'המודד הכללי')} <Info term="quota" /></h3>
          <p><span className="formula">{quotaFormula} = {r.quota.den === 1n ? fmtInt(r.quota.num) : fmtFrac(r.quota)}</span></p>
          {quotaSeats !== s.rules.seats && s.rules.remainderMethod !== 'droop' && <p className="small ink2">{L(`Divided by the seats plus one (${quotaSeats}), as the 1949 rules required.`, `מחולק במספר המושבים ועוד אחד (${quotaSeats}), כפי שקבעו כללי 1949.`)}</p>}
          <p className="small ink2">{L('Qualifying votes only', 'קולות משתתפים בלבד')} <Info title={L('Quota denominator', 'בסיס המודד')}>{L('Only qualifying votes are divided, so a party’s share of qualifying votes is larger than its share of all valid votes.', 'רק הקולות המשתתפים מחולקים, ולכן שיעור הרשימה מהם גדול משיעורה מכלל הכשרים.')}</Info></p>
        </div>
      )}
      {step.kind === 'initial' && (
        <div>
          <h3>{n('initial')}. {L('Seats by whole quota', 'מנדטים לפי מודד שלם')} <Info term="whole-quota-seats" /></h3>
          {r.quota.num === 0n
            ? <p className="small ink2">{L('This method has no whole-quota stage: every seat is allocated one at a time in the next steps.', 'בשיטה זו אין שלב של מודד שלם: כל המושבים מחולקים אחד־אחד בצעדים הבאים.')}</p>
            : <ListTable s={s} r={r} rows={r.lists.filter((l) => l.qualified).sort((a, b) => Number(b.votes - a.votes))} cols={(l) => [fmtInt(l.votes), `${fmtRat({ num: l.votes * r.quota.den, den: r.quota.num }, 3)}`, String(l.initialSeats)]} heads={[L('Votes', 'קולות'), L('Votes ÷ quota', 'קולות ÷ מודד'), L('Seats', 'מנדטים')]} />}
          <p>{L(`${r.initialSeatsTotal} seats allocated; ${r.remainderSeatsTotal} remain.`, `חולקו ${r.initialSeatsTotal} מנדטים; נותרו ${r.remainderSeatsTotal}.`)} <span className="muted small">{L('The number remaining depends on the fractions, so it differs between elections.', 'מספר הנותרים תלוי בשברים ולכן משתנה בין בחירות.')}</span></p>
        </div>
      )}
      {step.kind === 'remainder' && (
        <div>
          <h3>{L(`Seat ${r.initialSeatsTotal + step.st.step}: ${methodOf(s.rules).stepEn}`, `מנדט ${r.initialSeatsTotal + step.st.step}: ${methodOf(s.rules).stepHe}`)} <Info term={methodOf(s.rules).term} /></h3>
          <p>{L('Awarded to', 'הוענק ל')} <b>{name(step.st.winnerUnitId)}</b>{r.units.find((u) => u.id === step.st.winnerUnitId)?.isAgreement ? L(' (a surplus-agreement pair; which partner gets it is decided in the pair split step)', ' (צמד בהסכם עודפים; איזו מהשותפות תקבל אותו נקבע בשלב החלוקה בצמד)') : ''}.</p>
          {step.st.tie && (
            <div className="callout small">
              {L('Exact tie between ', 'שוויון מדויק בין ')}{step.st.tie.tiedUnitIds.map(name).join(', ')}. {L('The law requires a lottery by the CEC.', 'החוק מחייב הגרלה של ועדת הבחירות.')} <Info term="tie-lottery" />
              {!step.st.tie.forced && <div><b>{L('Not yet decided — showing the first list.', 'טרם הוכרע — מוצגת הרשימה הראשונה.')}</b></div>}
              <div className="row" style={{ marginTop: 4 }}>
                {L('Lottery winner:', 'זוכה בהגרלה:')} {step.st.tie.tiedUnitIds.map((u) => <button key={u} className={`btn small ${step.st.tie!.forced && step.st.tie!.chosen === u ? 'primary' : ''}`} onClick={() => dispatch({ type: 'setLottery', key: step.st.tie!.key, winner: u })}>{name(u)}</button>)}
              </div>
            </div>
          )}
          <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 360 }}>
            <table className="tbl">
              <thead><tr><th>{L('List / pair', 'רשימה / צמד')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Seats so far', 'מנדטים עד כה')}</th><th className="n">{L('Quotient', 'מודד')}</th>{advanced && <th className="n">{L('Exact', 'מדויק')}</th>}</tr></thead>
              <tbody>
                {step.st.quotients.filter((q) => q.votes > 0n).map((q) => (
                  <tr key={q.unitId} className={q.unitId === step.st.winnerUnitId ? 'win' : ''}>
                    <td>{name(q.unitId)}{q.capped ? <span className="chip" title={L('Section 81(d)(4)', 'סעיף 81(ד)(4)')}> {L('capped at half', 'מוגבל למחצית')}</span> : ''}</td>
                    <td className="n">{fmtInt(q.votes)}</td><td className="n">{q.seats}</td>
                    <td className="n">{q.eligible ? fmtRat(q.value, 3) : '—'}</td>{advanced && <td className="n mono" dir="ltr">{exactQuotient(q)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {step.kind === 'internal' && (() => {
        const d = r.internalDivisions.find((x) => x.unitId === step.unitId)!;
        return (
          <div>
            <h3>{L('Dividing the pair’s seats', 'חלוקת המנדטים בתוך הצמד')} — {name(d.unitId)} <Info term="surplus" /></h3>
            <p><span className="formula">{L('pair quota', 'מודד הצמד')} = ⌊ {fmtInt(d.totalVotes)} ÷ {d.seats} ⌋ = {fmtRat(d.quota, 0)}</span></p>
            <p className="small ink2">{L('Recalculated within the pair', 'חישוב מחדש בתוך הצמד')} <Info title={L('Dividing pair seats', 'חלוקת מנדטי הצמד')}>{L('Section 82(b): the pair’s seats are divided again from scratch by the method of section 81, as if the two lists were the whole Knesset.', 'סעיף 82(ב): מנדטי הצמד מחולקים מחדש מתחילה בשיטת סעיף 81, כאילו שתי הרשימות הן כל הכנסת.')}</Info></p>
            <table className="tbl" style={{ maxWidth: 560 }}>
              <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('By pair quota', 'לפי מודד הצמד')}</th><th className="n">{L('Final', 'סופי')}</th></tr></thead>
              <tbody>{Object.keys(d.final).map((m) => <tr key={m}><td>{name(m)}</td><td className="n">{fmtInt(s.lists.find((x) => x.id === m)!.votes)}</td><td className="n">{d.initial[m]}</td><td className="n"><b>{d.final[m]}</b></td></tr>)}</tbody>
            </table>
            {d.steps.map((st) => (
              <div key={st.step} className="small" style={{ marginBottom: 6 }}>
                {L('Remaining pair seat', 'מנדט נותר בצמד')} {st.step}: <bdi dir="ltr">{st.quotients.map((q) => `${name(q.unitId)} ${fmtInt(q.votes)}/${q.seats + 1} = ${fmtRat(q.value, 1)}`).join(' · ')}</bdi> → <b>{name(st.winnerUnitId)}</b>
                {st.tie && (
                  <div className="callout" style={{ marginTop: 4 }}>
                    {L('Exact tie inside the pair: the law requires a CEC lottery.', 'שוויון מדויק בתוך הצמד: החוק מחייב הגרלה של ועדת הבחירות.')}{' '}
                    {!st.tie.forced && <b>{L('Not yet decided — showing the first list.', 'טרם הוכרע — מוצגת הרשימה הראשונה.')}</b>}
                    <div className="row" style={{ marginTop: 4 }}>{L('Lottery winner:', 'זוכה בהגרלה:')} {st.tie.tiedUnitIds.map((u) => <button key={u} className={`btn small ${st.tie!.forced && st.tie!.chosen === u ? 'primary' : ''}`} onClick={() => dispatch({ type: 'setLottery', key: st.tie!.key, winner: u })}>{name(u)}</button>)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}
      {step.kind === 'final' && (
        <div>
          <h3>{L('Final composition', 'ההרכב הסופי')}</h3>
          <ListTable s={s} r={r} rows={r.lists.filter((l) => l.seats > 0).sort((a, b) => b.seats - a.seats)} cols={(l) => [String(l.initialSeats), String(l.seats - l.initialSeats), String(l.seats)]} heads={[L('By quota', 'במודד'), L('Remainder', 'עודפים'), L('Total', 'סה"כ')]} />
        </div>
      )}
    </div>
  );
}

function ListTable({ s, r, rows, cols, heads }: { s: Scenario; r: AllocationResult; rows: AllocationResult['lists']; cols: (l: AllocationResult['lists'][number]) => string[]; heads: string[] }) {
  const lang = useLang();
  const L = useL();
  void r;
  return (
    <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 380 }}>
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th>{heads.map((h) => <th key={h} className="n">{h}</th>)}</tr></thead>
        <tbody>{rows.map((l) => { const sl = s.lists.find((x) => x.id === l.id)!; return (
          <tr key={l.id} >
            <td><span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><span className="swatch" style={{ background: sl.color }} /><button className="table-action" onClick={() => setState({ selectedListId: l.id })}>{listLabel(sl, lang)}</button> <span className="muted">{sl.letters}</span></span></td>
            {cols(l).map((c, k) => <td key={k} className="n">{c}</td>)}
          </tr>
        ); })}</tbody>
      </table>
    </div>
  );
}
