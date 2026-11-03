import { useMemo } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import { allocate } from '../../engine/allocate.ts';
import { rat } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, votesCast, type Scenario, type SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat } from '../format.ts';
import { dispatch, setState, toast, useStore, useVoteSource } from '../store.ts';
import { clampTarget, deltaAction, votesForShare } from '../voteEdit.ts';
import { Candidates } from './Candidates.tsx';
import { DecimalInput, Delta, Info, NumberInput, Slip, VoteSlider } from './ui.tsx';
import { SourcePicker, VoteTools } from './VoteTools.tsx';

export function ListPanel({ s, r, ds, base, baseR }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const id = useStore((st) => st.selectedListId);
  const digits = useStore((st) => st.digits);
  const advanced = useStore((st) => st.level === 'advanced');
  const src = useVoteSource();
  const l = s.lists.find((x) => x.id === id);
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;

  const agreementEffect = useMemo(() => {
    if (!l) return null;
    const a = s.agreements.find((x) => x.members.includes(l.id) && x.enabled);
    if (!a) return null;
    const without = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === a.id ? { ...x, enabled: false } : x)) }));
    return without.lists.map((x) => ({ id: x.id, d: (r.lists.find((y) => y.id === x.id)?.seats ?? 0) - x.seats })).filter((x) => x.d !== 0);
  }, [s, r, l]);

  if (!l || !lr) {
    return (
      <section className="panel">
        <header><h2>{L('List details', 'פרטי רשימה')}</h2></header>
        <div className="body">
          <p className="ink2">{L('Select a list card, a seat in the chamber, or a row in any table to inspect and edit it.', 'בחרו כרטיס רשימה, מושב בתרשים או שורה בטבלה כדי לראות ולערוך.')}</p>
          <p className="small muted">{L('Every number in this application is computed from exact vote counts by the statutory method. Hover the (i) marks for definitions.', 'כל מספר כאן מחושב מספירת הקולות המדויקת לפי השיטה שבחוק. רחפו מעל סימני (i) להגדרות.')}</p>
        </div>
      </section>
    );
  }

  const baseList = base.lists.find((b) => b.id === l.id) ?? null;
  const listChanged = !!baseList && JSON.stringify(baseList) !== JSON.stringify(l);
  const pctValid = r.totalValid > 0n ? (l.votes / Number(r.totalValid)) * 100 : 0;
  /** every edit of this list's votes goes through the shared source setting */
  const editTo = (target: number) => {
    const t = clampTarget(s, l, target, src);
    if (t !== Math.round(target)) toast('info', L(`Limited to ${fmtInt(t)}: the chosen source cannot supply more votes.`, `הוגבל ל-${fmtInt(t)}: במקור שנבחר אין יותר קולות.`));
    const a = deltaAction(s, l, t - l.votes, src);
    if (a) dispatch(a);
  };
  const histSeats = baseList ? baseR.lists.find((x) => x.id === l.id)!.seats : l.originIds.reduce((t, o) => t + (baseR.lists.find((x) => x.id === o)?.seats ?? 0), 0);
  const histVotes = baseList ? baseList.votes : l.originIds.reduce((t, o) => t + (base.lists.find((x) => x.id === o)?.votes ?? 0), 0);
  const unit = lr.unitId ? r.units.find((u) => u.id === lr.unitId) : undefined;
  const nextQ = unit ? rat(unit.votes, BigInt(unit.seats + 1)) : null;
  const wonQs = r.remainderSteps.map((st) => st.quotients.find((q) => q.unitId === st.winnerUnitId)!.value);
  const lastWin = wonQs.length ? wonQs.reduce((m, q) => (q.num * m.den < m.num * q.den ? q : m)) : null;
  const agr = s.agreements.find((a) => a.members.includes(l.id));
  const agrStatus = agr ? r.agreements.find((a) => a.id === agr.id) : undefined;
  const inOther = new Set(s.agreements.filter((a) => a.enabled && !a.members.includes(l.id)).flatMap((a) => a.members));
  const partnerCandidates = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && !inOther.has(x.id));

  return (
    <section className="panel" aria-label={L('List details', 'פרטי רשימה')}>
      <header>
        <Slip letters={l.letters} color={l.color} size="lg" />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 17 }}>{listLabel(l, lang)}</h2>
          <div className="small ink2" lang="he">{l.nameHe}</div>
          {l.sponsorsHe && <div className="tiny muted" lang="he">{L('Submitted by: ', 'הוגשה מטעם: ')}{l.sponsorsHe.replace(/; /g, ' · ')}</div>}
        </div>
        <span className="spacer" />
        <button className="btn small ghost" aria-label={L('Close', 'סגירה')} onClick={() => setState({ selectedListId: null })}>✕</button>
      </header>
      <div className="body">
        <div className="row" style={{ gap: 14, alignItems: 'baseline' }}>
          <span style={{ fontSize: 34, fontWeight: 700 }} className="tabnum">{lr.seats}</span>
          <span className="ink2">{L('seats', 'מנדטים')}</span>
          <Delta v={lr.seats - histSeats} />
          <span className="muted small">{L(`historical ${histSeats}`, `בפועל ${histSeats}`)}</span>
          {l.withdrawn ? <span className="chip no">{L('Withdrew', 'פרשה')}</span> : lr.qualified ? <span className="chip ok">{L('Passed threshold', 'עברה את החסימה')}</span> : <span className="chip no">{L('Below threshold', 'לא עברה')}</span>}
        </div>

        <div className="section-title">{L('Votes', 'קולות')}</div>
        {advanced ? <SourcePicker s={s} l={l} /> : <p className="small ink2" style={{ margin: '0 0 4px' }}>{L('Changes are balanced by the other parties in proportion, so turnout stays the same. (Advanced mode lets you choose other ways.)', 'השינויים מאוזנים על ידי שאר המפלגות באופן יחסי, כך שההצבעה נשארת זהה. (במצב מתקדם אפשר לבחור דרכים אחרות.)')}</p>}
        <div className="row" style={{ marginTop: 8 }}>
          <NumberInput value={l.votes} label={L('Votes', 'קולות')} width={130} onCommit={(v) => editTo(v)} />
          <span className="small ink2">{L('votes', 'קולות')}</span>
          <DecimalInput value={pctValid} digits={Math.max(2, digits)} label={L('Share of valid votes (%)', 'שיעור מהקולות הכשרים (%)')} onCommit={(p) => {
            const t = votesForShare(s, l, p, src);
            if (t === null) return toast('error', L('Enter a percentage from 0 to below 100.', 'הזינו אחוז מ-0 ועד פחות מ-100.'));
            editTo(t);
          }} />
          <span className="small ink2">{L('% of valid votes', '% מהכשרים')}</span>
          <Delta v={l.votes - histVotes} />
        </div>
        <VoteSlider key={l.id} s={s} l={l} hist={histVotes} thr={Number(r.thresholdVotes)} onCommit={editTo} />
        <div className="row" style={{ marginTop: 4 }}>
          {baseList && l.votes !== baseList.votes && <button className="btn small" onClick={() => dispatch({ type: 'setVotes', listId: l.id, votes: baseList.votes })}>{L(`Reset votes to ${fmtInt(baseList.votes)}`, `איפוס הקולות ל-${fmtInt(baseList.votes)}`)}</button>}
          {baseList && listChanged && <button className="btn small" onClick={() => dispatch({ type: 'resetList', listId: l.id, base: baseList })}>{L('Reset everything about this list', 'איפוס כל פרטי הרשימה')}</button>}
        </div>

        <div className="kv small" style={{ marginTop: 6 }}>
          {lr.qualified && <><span>{L('Share of qualifying votes', 'מהקולות המשתתפים')} <Info term="qualifying" /></span><span>{fmtPct(l.votes, r.qualifyingVotes, digits)}</span></>}
          {advanced && <><span>{L('Share of all ballots cast', 'מכלל המצביעים')}</span><span>{fmtPct(l.votes, votesCast(s), digits)}</span>
          <span>{L('Share of registered voters', 'מבעלי זכות הבחירה')}</span><span>{fmtPct(l.votes, s.registered, digits)}</span></>}
          <span>{L('Distance to threshold', 'מרחק מאחוז החסימה')} <Info term="threshold" /></span><span className={l.votes >= Number(r.thresholdVotes) ? 'up' : 'down'}>{l.votes >= Number(r.thresholdVotes) ? '+' : '−'}{fmtInt(Math.abs(l.votes - Number(r.thresholdVotes)))}</span>
          {lr.qualified && advanced && <>
            <span>{L('Whole-quota seats', 'מנדטים במודד')}</span><span>{lr.initialSeats} <span className="muted" dir="ltr">= ⌊{fmtInt(l.votes)} ÷ {fmtRat(r.quota, 0)}⌋</span></span>
            <span>{L('Remainder-stage seats', 'מנדטים מעודפים')}</span><span>{lr.seats - lr.initialSeats}</span>
            <span>{L('Votes per seat won', 'קולות למנדט')}</span><span>{lr.seats ? fmtInt(Math.round(l.votes / lr.seats)) : '—'}</span>
            {nextQ && <><span>{unit?.isAgreement ? L('Pair’s next-seat quotient', 'מודד הצמד למנדט הבא') : L('Next-seat quotient', 'מודד רשימה למנדט הבא')} <Info term="listquota" /></span><span title={fmtFrac(nextQ)}>{fmtRat(nextQ, 1)}</span></>}
            {lastWin && <><span>{L('Lowest winning quotient', 'המודד הזוכה הנמוך ביותר')}</span><span>{fmtRat(lastWin, 1)}</span></>}
          </>}
        </div>

        <div style={{ marginTop: 10 }}><VoteTools s={s} r={r} l={l} /></div>

        <hr />
        <div className="section-title row">{L('Surplus-vote agreement', 'הסכם עודפים')} <Info term="surplus" /></div>
        {agr ? (
          <div>
            <div className="row">
              <span>⇄ <b>{listLabel(s.lists.find((x) => x.id === agr.members.find((m) => m !== l.id))!, lang)}</b></span>
              {agrStatus?.active ? <span className="chip ok">{L('Active', 'בתוקף')}</span> : <span className="chip no">{agr.enabled ? L('No effect: a partner failed the threshold', 'ללא השפעה: שותפה לא עברה את החסימה') : L('Switched off', 'כבוי')}</span>}
              <span className="spacer" />
              <button className="btn small" onClick={() => dispatch({ type: 'setAgreement', agreement: { ...agr, enabled: !agr.enabled } })}>{agr.enabled ? L('Switch off', 'כיבוי') : L('Switch on', 'הפעלה')}</button>
              <button className="btn small danger" onClick={() => dispatch({ type: 'removeAgreement', id: agr.id })}>{L('Remove', 'הסרה')}</button>
            </div>
            {agreementEffect && (
              <p className="small" style={{ marginBottom: 0 }}>{agreementEffect.length === 0 ? L('Effect: none — the same seats are won without it.', 'השפעה: אין — אותם מנדטים גם בלעדיו.') : <>{L('Effect versus no agreement: ', 'השפעה לעומת ללא הסכם: ')}{agreementEffect.map((e) => `${listLabel(s.lists.find((x) => x.id === e.id)!, lang)} ${e.d > 0 ? '+' : '−'}${Math.abs(e.d)}`).join(' · ')}</>}</p>
            )}
          </div>
        ) : (
          <div className="row">
            <select aria-label={L('Choose partner', 'בחירת שותפה')} defaultValue="" onChange={(e) => { if (e.target.value) dispatch({ type: 'setAgreement', agreement: { id: `sim-agr-${Date.now().toString(36)}`, members: [l.id, e.target.value], enabled: true } }); }}>
              <option value="">{L('Sign an agreement with…', 'חתימת הסכם עם…')}</option>
              {partnerCandidates.sort((a, b) => b.votes - a.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
            </select>
          </div>
        )}

        {advanced && (
          <>
            <hr />
            <div className="section-title">{L('Identity (display only — does not change results)', 'זהות (תצוגה בלבד — אינה משנה תוצאות)')}</div>
            <div className="grid2">
              <label className="field">{L('Short name (Hebrew)', 'שם מקוצר')}<input type="text" value={l.shortHe} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortHe: e.target.value } })} /></label>
              <label className="field">{L('Short name (English)', 'שם באנגלית')}<input type="text" value={l.shortEn ?? ''} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortEn: e.target.value || null } })} /></label>
              <label className="field">{L('Ballot letters', 'אותיות הרשימה')}<input type="text" value={l.letters} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { letters: e.target.value } })} /></label>
              <label className="field">{L('Colour', 'צבע')}<input type="color" value={l.color} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { color: e.target.value } })} /></label>
              <label className="field">{L('Bloc', 'גוש')}
                <select value={l.bloc ?? ''} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { bloc: e.target.value || null } })}>
                  <option value="">{L('None', 'ללא')}</option>
                  {s.blocs.map((b) => <option key={b.id} value={b.id}>{lang === 'he' ? b.nameHe : b.nameEn}</option>)}
                </select>
              </label>
              <label className="field">{L('Full name', 'שם מלא')}<input type="text" value={l.nameHe} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { nameHe: e.target.value } })} /></label>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn small" onClick={() => dispatch({ type: 'setWithdrawn', listId: l.id, withdrawn: !l.withdrawn })}>{l.withdrawn ? L('Reinstate list', 'החזרת הרשימה') : L('Withdraw list', 'פרישת הרשימה')}</button>
              {!baseList && <button className="btn small danger" onClick={() => { dispatch({ type: 'removeList', listId: l.id }); setState({ selectedListId: null }); }}>{L('Delete list', 'מחיקת הרשימה')}</button>}
            </div>
          </>
        )}

        {ds.lists.find((x) => x.id === l.id)?.notesHe.length ? (
          <details style={{ marginTop: 10 }}>
            <summary className="small">{L('Official notes (CEC)', 'הערות רשמיות (ועדת הבחירות)')}</summary>
            {ds.lists.find((x) => x.id === l.id)!.notesHe.map((n, i) => <p key={i} className="small" lang="he" dir="rtl">{n}</p>)}
          </details>
        ) : null}
        {ds.lists.find((x) => x.id === l.id)?.candidatesSecondary && <p className="small warn" style={{ color: 'var(--warn-ink)' }}>{L('Candidate list from a secondary source (the official page could not be retrieved).', 'רשימת המועמדים ממקור משני (העמוד הרשמי לא נטען).')}</p>}

        <hr />
        <div className="section-title">{L('Candidates', 'מועמדים')}</div>
        <Candidates l={l as SimList} seats={lr.seats} baseSeats={baseList ? histSeats : -1} baseCandidates={baseList?.candidates} />
      </div>
    </section>
  );
}
