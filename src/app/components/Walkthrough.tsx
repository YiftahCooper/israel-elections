import { useEffect, useMemo, useState } from 'react';
import type { AllocationResult, RemainderStep } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { dispatch, setState, useStore } from '../store.ts';
import { Info } from './ui.tsx';

type Step = { kind: 'threshold' } | { kind: 'quota' } | { kind: 'initial' } | { kind: 'remainder'; st: RemainderStep } | { kind: 'internal'; unitId: string } | { kind: 'final' };

export function Walkthrough({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const digits = useStore((st) => st.digits);
  const steps: Step[] = useMemo(() => [
    { kind: 'threshold' }, { kind: 'quota' }, { kind: 'initial' },
    ...r.remainderSteps.map((st) => ({ kind: 'remainder' as const, st })),
    ...r.internalDivisions.map((d) => ({ kind: 'internal' as const, unitId: d.unitId })),
    { kind: 'final' },
  ], [r]);
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
    return u ? u.memberIds.map((m) => listLabel(s.lists.find((x) => x.id === m)!, lang)).join(' + ') : id;
  };
  const step = steps[Math.min(i, steps.length - 1)];
  const label = (st: Step, k: number) => st.kind === 'remainder' ? `${L('Seat', 'מנדט')} ${r.initialSeatsTotal + st.st.step}` : st.kind === 'internal' ? L('Pair split', 'חלוקה בצמד') : String(k + 1);

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn small" onClick={() => setI(0)} aria-label={L('First step', 'צעד ראשון')}>⏮</button>
        <button className="btn small" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>{L('Previous', 'הקודם')}</button>
        <button className="btn small primary" onClick={() => { if (i >= steps.length - 1) setI(0); setPlaying((p) => !p); }}>{playing ? L('Pause', 'השהיה') : L('Play', 'הפעלה')}</button>
        <button className="btn small" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>{L('Next', 'הבא')}</button>
        <span className="muted small">{L(`Step ${i + 1} of ${steps.length}`, `צעד ${i + 1} מתוך ${steps.length}`)}</span>
      </div>
      <div className="steps" role="tablist" aria-label={L('Allocation steps', 'שלבי החלוקה')} style={{ marginBottom: 12 }}>
        {steps.map((st, k) => <button key={k} role="tab" aria-selected={k === i} className={`btn small ${k === i ? 'primary' : ''}`} onClick={() => { setPlaying(false); setI(k); }}>{label(st, k)}</button>)}
      </div>

      {step.kind === 'threshold' && (
        <div>
          <h4>1. {L('Which lists pass the threshold?', 'אילו רשימות עוברות את אחוז החסימה?')} <Info term="threshold" /></h4>
          <p><span className="formula">{s.rules.thresholdPct}% × {fmtInt(r.totalValid)} = {fmtRat(r.thresholdExact, 3)} → {fmtInt(r.thresholdVotes)}</span></p>
          <p className="small ink2">{L('Votes for every list count in the total, including lists that fail.', 'הקולות לכל הרשימות נכללים בסך, גם של רשימות שלא עברו.')}</p>
          <ListTable s={s} r={r} rows={[...r.lists].filter((l) => l.votes > 0n).sort((a, b) => Number(b.votes - a.votes)).slice(0, 18)} cols={(l) => [fmtInt(l.votes), fmtPct(l.votes, r.totalValid, digits), l.qualified ? L('passes', 'עוברת') : L('fails', 'לא עוברת')]} heads={[L('Votes', 'קולות'), L('Share', 'שיעור'), L('Result', 'תוצאה')]} />
          <p className="small">{L(`Unrepresented votes: ${fmtInt(r.unrepresentedVotes)} (${fmtPct(r.unrepresentedVotes, r.totalValid, digits)})`, `קולות שלא השתתפו בחלוקה: ${fmtInt(r.unrepresentedVotes)} (${fmtPct(r.unrepresentedVotes, r.totalValid, digits)})`)}</p>
        </div>
      )}
      {step.kind === 'quota' && (
        <div>
          <h4>2. {L('General quota', 'המודד הכללי')} <Info term="quota" /></h4>
          <p><span className="formula">⌊ {fmtInt(r.qualifyingVotes)} ÷ {s.rules.seats} ⌋ = {r.quota.den === 1n ? fmtInt(r.quota.num) : fmtFrac(r.quota)}</span></p>
          <p className="small ink2">{L('Only qualifying votes are divided, so a party’s share of qualifying votes is larger than its share of all valid votes.', 'רק הקולות המשתתפים מחולקים, ולכן שיעור הרשימה מהם גדול משיעורה מכלל הכשרים.')}</p>
        </div>
      )}
      {step.kind === 'initial' && (
        <div>
          <h4>3. {L('Seats by whole quota', 'מנדטים לפי מודד שלם')}</h4>
          <ListTable s={s} r={r} rows={r.lists.filter((l) => l.qualified).sort((a, b) => Number(b.votes - a.votes))} cols={(l) => [fmtInt(l.votes), `${fmtRat({ num: l.votes * r.quota.den, den: r.quota.num }, 3)}`, String(l.initialSeats)]} heads={[L('Votes', 'קולות'), L('Votes ÷ quota', 'קולות ÷ מודד'), L('Seats', 'מנדטים')]} />
          <p>{L(`${r.initialSeatsTotal} seats allocated; ${r.remainderSeatsTotal} remain.`, `חולקו ${r.initialSeatsTotal} מנדטים; נותרו ${r.remainderSeatsTotal}.`)} <span className="muted small">{L('The number remaining depends on the fractions, so it differs between elections.', 'מספר הנותרים תלוי בשברים ולכן משתנה בין בחירות.')}</span></p>
        </div>
      )}
      {step.kind === 'remainder' && (
        <div>
          <h4>{L(`Seat ${r.initialSeatsTotal + step.st.step}: highest votes ÷ (seats + 1)`, `מנדט ${r.initialSeatsTotal + step.st.step}: הגבוה ביותר בקולות ÷ (מנדטים + 1)`)} <Info term="baderofer" /></h4>
          <p>{L('Awarded to', 'הוענק ל')} <b>{name(step.st.winnerUnitId)}</b>{r.units.find((u) => u.id === step.st.winnerUnitId)?.isAgreement ? L(' (a surplus-agreement pair; which partner gets it is decided in the pair split step)', ' (צמד בהסכם עודפים; איזו מהשותפות תקבל אותו נקבע בשלב החלוקה בצמד)') : ''}.</p>
          {step.st.tie && (
            <div className="callout small">
              {L('Exact tie between ', 'שוויון מדויק בין ')}{step.st.tie.tiedUnitIds.map(name).join(', ')}. {L('The law requires a lottery by the CEC.', 'החוק מחייב הגרלה של ועדת הבחירות.')}
              <div className="row" style={{ marginTop: 4 }}>
                {L('Lottery winner:', 'זוכה בהגרלה:')} {step.st.tie.tiedUnitIds.map((u) => <button key={u} className={`btn small ${step.st.tie!.chosen === u ? 'primary' : ''}`} onClick={() => dispatch({ type: 'setLottery', key: step.st.tie!.key, winner: u })}>{name(u)}</button>)}
              </div>
            </div>
          )}
          <div className="tablewrap" style={{ maxHeight: 360 }}>
            <table className="tbl">
              <thead><tr><th>{L('List / pair', 'רשימה / צמד')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('Seats so far', 'מנדטים עד כה')}</th><th className="n">{L('Quotient', 'מודד')}</th><th className="n">{L('Exact', 'מדויק')}</th></tr></thead>
              <tbody>
                {step.st.quotients.filter((q) => q.votes > 0n).map((q) => (
                  <tr key={q.unitId} className={q.unitId === step.st.winnerUnitId ? 'win' : ''}>
                    <td>{name(q.unitId)}{q.capped ? <span className="chip" title={L('Section 81(d)(4)', 'סעיף 81(ד)(4)')}> {L('capped at half', 'מוגבל למחצית')}</span> : ''}</td>
                    <td className="n">{fmtInt(q.votes)}</td><td className="n">{q.seats}</td>
                    <td className="n">{q.eligible ? fmtRat(q.value, 3) : '—'}</td><td className="n mono">{q.eligible ? `${fmtInt(q.votes)}/${q.seats + 1}` : ''}</td>
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
            <h4>{L('Dividing the pair’s seats', 'חלוקת המנדטים בתוך הצמד')} — {name(d.unitId)} <Info term="surplus" /></h4>
            <p><span className="formula">{L('pair quota', 'מודד הצמד')} = ⌊ {fmtInt(d.totalVotes)} ÷ {d.seats} ⌋ = {fmtRat(d.quota, 0)}</span></p>
            <p className="small ink2">{L('Section 82(b): the pair’s seats are divided again from scratch by the method of section 81, as if the two lists were the whole Knesset.', 'סעיף 82(ב): מנדטי הצמד מחולקים מחדש מתחילה בשיטת סעיף 81, כאילו שתי הרשימות הן כל הכנסת.')}</p>
            <table className="tbl" style={{ maxWidth: 560 }}>
              <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Votes', 'קולות')}</th><th className="n">{L('By pair quota', 'לפי מודד הצמד')}</th><th className="n">{L('Final', 'סופי')}</th></tr></thead>
              <tbody>{Object.keys(d.final).map((m) => <tr key={m}><td>{name(m)}</td><td className="n">{fmtInt(s.lists.find((x) => x.id === m)!.votes)}</td><td className="n">{d.initial[m]}</td><td className="n"><b>{d.final[m]}</b></td></tr>)}</tbody>
            </table>
            {d.steps.map((st) => <p key={st.step} className="small">{L('Remaining pair seat', 'מנדט נותר בצמד')} {st.step}: {st.quotients.map((q) => `${name(q.unitId)} ${fmtInt(q.votes)}/${q.seats + 1} = ${fmtRat(q.value, 1)}`).join(' · ')} → <b>{name(st.winnerUnitId)}</b>{st.tie ? L(' (tie: lottery)', ' (שוויון: הגרלה)') : ''}</p>)}
          </div>
        );
      })()}
      {step.kind === 'final' && (
        <div>
          <h4>{L('Final composition', 'ההרכב הסופי')}</h4>
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
    <div className="tablewrap" style={{ maxHeight: 380 }}>
      <table className="tbl">
        <thead><tr><th>{L('List', 'רשימה')}</th>{heads.map((h) => <th key={h} className="n">{h}</th>)}</tr></thead>
        <tbody>{rows.map((l) => { const sl = s.lists.find((x) => x.id === l.id)!; return (
          <tr key={l.id} onClick={() => setState({ selectedListId: l.id })} style={{ cursor: 'pointer' }}>
            <td><span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: sl.color }} />{listLabel(sl, lang)} <span className="muted">{sl.letters}</span></span></td>
            {cols(l).map((c, k) => <td key={k} className="n">{c}</td>)}
          </tr>
        ); })}</tbody>
      </table>
    </div>
  );
}
