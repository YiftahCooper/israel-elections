import { referenceLabel } from '../derive.ts';
import { StartFrom } from './StartFrom.tsx';
import { EditMarker } from './EditMarker.tsx';
import { PartEdits } from './PartEdits.tsx';
// A list opened in place, inside its own row of the lists table: its votes (number, share, a live slider),
// how far the next seat and the loss of one are (computed on opening), its surplus-vote agreement, its parties,
// its standing, identity and candidates. Controls appear only where they apply to this list.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { SearchResult } from '../../engine/analysis.ts';
import { allocate } from '../../engine/allocate.ts';
import { rat } from '../../engine/rational.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, votesCast, type Scenario, type SimList } from '../../model/scenario.ts';
import { runTasks } from '../analysisPool.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtFrac, fmtInt, fmtPct, fmtRat, signed } from '../format.ts';
import { dispatch, dispatchMany, getState, previewAction, setState, toast, useLevel, useVoteSource, useDigits, useStore } from '../store.ts';
import { clampTarget, deltaAction, toVoteSource, votesForShare, voteSourceLabel } from '../voteEdit.ts';
import { Candidates } from './Candidates.tsx';
import { JointParties } from './JointParties.tsx';
import { DecimalInput, Info, NumberInput, TextField } from './ui.tsx';
import { SourcePicker } from './SourcePicker.tsx';

const niceCeil = (n: number) => { const p = 10 ** Math.max(0, Math.floor(Math.log10(Math.max(1, n))) - 1); return Math.ceil(n / p) * p; };

/** A vote slider that previews the whole board live while dragged and commits one undoable edit on release. */
function LiveSlider({ l, hist, thr, onCommit }: { l: SimList; hist: number; thr: number; onCommit: (v: number) => void }) {
  const L = useL();
  const src = useVoteSource();
  const [drag, setDrag] = useState<number | null>(null);
  const [scale] = useState(() => niceCeil(Math.max(hist * 2, thr * 2, 20_000)));
  const max = Math.max(scale, l.votes);
  const committed = getState().scenario?.lists.find((x) => x.id === l.id) ?? l;
  const value = drag ?? committed.votes;
  const preview = (v: number) => {
    setDrag(v);
    const s = getState().scenario; if (!s) return;
    const t = clampTarget(s, committed, v, src);
    previewAction(deltaAction(s, committed, t - committed.votes, src));
  };
  const commit = () => { if (drag === null) return; const v = drag; setDrag(null); previewAction(null); if (v !== committed.votes) onCommit(v); };
  const step = Math.max(1, Math.round(max / 2000));
  return (
    <div>
      <input type="range" min={0} max={max} step={step} value={value} aria-label={L('Votes slider', 'מחוון קולות')} aria-valuetext={value.toLocaleString('en-US')}
        onChange={(e) => preview(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} onBlur={commit} onTouchEnd={commit} />
      <div className="row tiny muted" style={{ justifyContent: 'space-between' }}>
        <span>0</span>
        <span>{drag !== null ? <b className="ink2">{drag.toLocaleString('en-US')}</b> : L('drag to see the seats move', 'גררו כדי לראות את המנדטים זזים')}</span>
        <span>{max.toLocaleString('en-US')}</span>
      </div>
    </div>
  );
}

/** Votes to the next seat and before losing one (or to pass the threshold), computed exactly in the background. */
function useMargins(s: Scenario, l: SimList, seats: number, qualified: boolean) {
  const src = useVoteSource();
  const [res, setRes] = useState<{ gain?: SearchResult; lose?: SearchResult; qualify?: SearchResult; disqualify?: SearchResult } | null>(null);
  const job = useRef<(() => void) | null>(null);
  useEffect(() => {
    setRes(null);
    if (l.withdrawn) return;
    const input = toEngineInput(s);
    const goals = qualified ? (['gain', 'lose', 'disqualify'] as const) : (['qualify'] as const);
    const tasks = goals.map((goal) => ({ kind: 'listSearch', input, src: toVoteSource(src), goal, id: l.id, seats } as const));
    const out: Record<string, SearchResult> = {};
    job.current = runTasks(tasks, (i, v) => { out[goals[i]] = v; if (Object.keys(out).length === goals.length) setRes({ ...out }); });
    return () => { job.current?.(); job.current = null; };
  }, [s, l.id, seats, qualified, src]);
  return res;
}

export function ListDetail({ s, r, ds, base, baseR, l }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const reference = useStore(st => st.reference);
  const baseLabel = referenceLabel(base === reference ? reference : null, lang);
  const digits = useDigits();
  const { simple, standard, expert } = useLevel();
  const src = useVoteSource();
  const lr = r.lists.find((x) => x.id === l.id)!;
  const previous = useRef({ id: l.id, qualified: lr.qualified });
  const [crossing, setCrossing] = useState<boolean | null>(null);
  useEffect(() => {
    if (previous.current.id !== l.id) setCrossing(null);
    else if (previous.current.qualified !== lr.qualified) setCrossing(lr.qualified);
    previous.current = { id: l.id, qualified: lr.qualified };
  }, [l.id, lr.qualified]);
  const margins = useMargins(s, l, lr.seats, lr.qualified);

  const boundarySearch = lr.qualified ? margins?.disqualify : margins?.qualify;
  const boundary = boundarySearch?.found && boundarySearch.votes !== null && boundarySearch.exact
    ? l.votes + (lr.qualified ? 1 - Number(boundarySearch.votes) : Number(boundarySearch.votes)) : null;
  const sourceName = voteSourceLabel(src, s, lang);
  const qualifier = (m?: SearchResult) => m?.exact ? L('exact', 'מדויק') : L('sampled: upper bound, not a proven minimum', 'דגימה: חסם עליון, לא מינימום מוכח');

  const agr = s.agreements.find((a) => a.members.includes(l.id));
  const agrStatus = agr ? r.agreements.find((a) => a.id === agr.id) : undefined;
  const agreementEffect = useMemo(() => {
    if (!agr?.enabled) return null;
    const without = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === agr.id ? { ...x, enabled: false } : x)) }));
    return without.lists.map((x) => ({ id: x.id, d: (r.lists.find((y) => y.id === x.id)?.seats ?? 0) - x.seats })).filter((x) => x.d !== 0);
  }, [s, r, agr]);

  const baseList = base.lists.find((b) => b.id === l.id) ?? null;
  const listChanged = !!baseList && JSON.stringify(baseList) !== JSON.stringify(l);
  const histVotes = baseList ? baseList.votes : l.originIds.reduce((t, o) => t + (base.lists.find((x) => x.id === o)?.votes ?? 0), 0);
  const histSeats = baseList ? baseR.lists.find((x) => x.id === l.id)!.seats : -1;
  const histShares = Object.fromEntries(base.lists.map((b) => [b.id, b.votes]));
  const pctValid = r.totalValid > 0n ? (l.votes / Number(r.totalValid)) * 100 : 0;
  const thr = Number(r.thresholdVotes);
  const nameOf = (id: string) => { const x = s.lists.find((y) => y.id === id); return x ? listLabel(x, lang) : id; };

  /** every edit of this list's votes goes through the shared source setting */
  const editTo = (target: number) => {
    const cur = getState().scenario; const cl = cur?.lists.find((x) => x.id === l.id); if (!cur || !cl) return;
    const t = clampTarget(cur, cl, target, src);
    if (t !== Math.round(target)) toast('info', L(`Limited to ${fmtInt(t)}: the chosen source cannot supply more votes.`, `הוגבל ל-${fmtInt(t)}: במקור שנבחר אין יותר קולות.`));
    const a = deltaAction(cur, cl, t - cl.votes, src, histShares);
    if (a) dispatch(a);
  };
  const applyDelta = (d: number) => { const a = deltaAction(s, l, d, src); if (a) dispatch(a); };

  const unit = lr.unitId ? r.units.find((u) => u.id === lr.unitId) : undefined;
  const nextQ = unit ? rat(unit.votes, BigInt(unit.seats + 1)) : null;
  const wonQs = r.remainderSteps.map((st) => st.quotients.find((q) => q.unitId === st.winnerUnitId)!.value);
  const lastWin = wonQs.length ? wonQs.reduce((m, q) => (q.num * m.den < m.num * q.den ? q : m)) : null;
  const inOther = new Set(s.agreements.filter((a) => a.enabled && !a.members.includes(l.id)).flatMap((a) => a.members));
  const partners = s.lists.filter((x) => x.id !== l.id && !x.withdrawn && !inOther.has(x.id)).sort((a, b) => b.votes - a.votes);
  const partnerId = agr?.members.find((m) => m !== l.id) ?? '';
  const setPartner = (id: string) => {
    if (!id) { if (agr) dispatch({ type: 'removeAgreement', id: agr.id }); return; }
    dispatch({ type: 'setAgreement', agreement: { id: agr?.id ?? `sim-agr-${Date.now().toString(36)}`, members: [l.id, id], enabled: agr?.enabled ?? true } });
  };
  const notes = ds.lists.find((x) => x.id === l.id)?.notesHe ?? [];
  const reason = (res?: SearchResult) => res && !res.found ? (res.reason === 'already' ? L('already true', 'כבר מתקיים') : res.reason === 'limit' ? L('not reachable from this source', 'לא ניתן מהמקור הזה') : L('not found', 'לא נמצא')) : null;

  return (
    <div className="ld" role="region" aria-label={L('List details', 'פרטי רשימה')}>
      <section>
        <h3>{L('Votes', 'קולות')} <EditMarker s={s} path={['lists', l.id, 'votes']} /></h3>
        {!lr.qualified && Number(s.rules.thresholdPct) > 0 && <p className="small ink2">{L('Below the threshold', 'מתחת לאחוז החסימה')}</p>}
        {l.withdrawn && <p className="small callout" style={{ marginTop: 0 }}>{L(`This list has withdrawn: its ${fmtInt(l.heldVotes ?? 0)} ballots count as invalid.`, `הרשימה פרשה: ${fmtInt(l.heldVotes ?? 0)} הפתקים שלה נחשבים פסולים.`)}</p>}
        <fieldset disabled={l.withdrawn} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'grid', gap: 8 }}>
          <div className="vote-edit">
            <NumberInput value={l.votes} label={L('Votes', 'קולות')} width={120} onCommit={(v) => editTo(v)} />
            <span className="small ink2">{L('votes', 'קולות')} ·</span>
            <DecimalInput value={pctValid} digits={Math.max(2, digits)} width={74} label={L('Share of valid votes (%)', 'שיעור מהקולות הכשרים (%)')} onCommit={(p) => {
              const t = votesForShare(s, l, p, src);
              if (t === null) return toast('error', L('Enter a percentage from 0 to below 100.', 'הזינו אחוז מ-0 ועד פחות מ-100.'));
              editTo(t);
            }} />
            <span className="small ink2">%</span>
            {baseList && l.votes !== baseList.votes && <button className="btn small ghost" onClick={() => editTo(baseList.votes)}>{L(`Back to ${fmtInt(baseList.votes)}`, `חזרה ל-${fmtInt(baseList.votes)}`)}</button>}
          </div>
          <LiveSlider key={l.id} l={l} hist={histVotes} thr={thr} onCommit={editTo} />
          <p className="small ink2" style={{ margin: 0 }}>{L('Votes come from: ', 'מקור הקולות: ')}{sourceName}</p>
          {standard ? <SourcePicker s={s} l={l} /> : <p className="small ink2" style={{ margin: 0 }}>{L('The other lists’ votes shrink or grow in proportion, so turnout stays the same.', 'הקולות של שאר הרשימות קטנים או גדלים באופן יחסי, כך שההצבעה נשארת זהה.')}</p>}
        </fieldset>
      </section>

      {!l.withdrawn && (
        <section>
          <h3>{lr.qualified ? L('How close are the seats?', 'כמה קרובים המנדטים?') : L('How far is the threshold?', 'כמה רחוק אחוז החסימה?')}</h3>
          {!margins ? <p className="small muted" role="status" style={{ margin: 0 }}>{L('Searching…', 'מחפש…')}</p> : (
            <div className="facts">
              {lr.qualified ? <>
                <div>{L(`Seat ${lr.seats + 1} in`, `מנדט ${lr.seats + 1} בעוד`)}<b>{margins.gain?.found && margins.gain.votes !== null ? `+${fmtInt(margins.gain.votes)}` : reason(margins.gain)}</b>
                  {margins.gain?.found && margins.gain.votes !== null && <button className="btn small ghost" style={{ paddingInline: 0 }} onClick={() => applyDelta(Number(margins.gain!.votes))}>{L('Apply', 'החלה')}</button>}</div>
                <div>{lr.seats > 0 ? L('A seat is lost at', 'מנדט אובד בירידה של') : L('Falls below the threshold at', 'יורדת מתחת לחסימה בירידה של')}<b>{margins.lose?.found && margins.lose.votes !== null ? `−${fmtInt(margins.lose.votes)}` : reason(margins.lose)}</b>
                  {margins.lose?.found && margins.lose.votes !== null && <button className="btn small ghost" style={{ paddingInline: 0 }} onClick={() => applyDelta(-Number(margins.lose!.votes))}>{L('Apply', 'החלה')}</button>}</div>
              </> : <div>{L('Passes the threshold with', 'עוברת את החסימה בתוספת')}<b>{margins.qualify?.found && margins.qualify.votes !== null ? `+${fmtInt(margins.qualify.votes)}` : reason(margins.qualify)}</b>
                {margins.qualify?.found && margins.qualify.votes !== null && <button className="btn small ghost" style={{ paddingInline: 0 }} onClick={() => applyDelta(Number(margins.qualify!.votes))}>{L('Apply', 'החלה')}</button>}</div>}
              {Number(s.rules.thresholdPct) > 0 && <div>{L('Distance to the threshold', 'מרחק מאחוז החסימה')}<b><bdi dir="ltr">{l.votes >= thr ? '+' : '−'}{fmtInt(Math.abs(l.votes - thr))}</bdi></b></div>}
            </div>
          )}
          {margins && <p className="tiny muted">{L('Source: ', 'מקור: ')}{sourceName} · {lr.qualified ? <>{L('Gain', 'תוספת')}: {qualifier(margins.gain)} · {L('Loss', 'אובדן')}: {qualifier(margins.lose)}</> : qualifier(margins.qualify)}</p>}
          {Number(s.rules.thresholdPct) > 0 && boundary !== null && <div className="row threshold-checkpoints">
            {[-1, 0, 1].map((offset) => <button key={offset} className="btn small" onClick={() => editTo(boundary + offset)}>{offset < 0 ? L('Just below', 'מעט מתחת') : offset === 0 ? L('At threshold', 'באחוז החסימה') : L('Just above', 'מעט מעל')}</button>)}
          </div>}
          {crossing !== null && Number(s.rules.thresholdPct) > 0 && <p className="small crossing">{crossing ? L('Passed the threshold, so qualifying votes and every allocation were recalculated.', 'עברה את אחוז החסימה, ולכן הקולות המשתתפים וכל החלוקה חושבו מחדש.') : L('Fell below the threshold, so qualifying votes and every allocation were recalculated.', 'ירדה מתחת לאחוז החסימה, ולכן הקולות המשתתפים וכל החלוקה חושבו מחדש.')} <button className="table-action" onClick={() => setState({ tool: 'walk', selectedListId: null })}>{L('Walkthrough: threshold', 'שלבי החלוקה: אחוז החסימה')}</button></p>}
        </section>
      )}

      {standard && (
        <section>
          <StartFrom s={s} part="agreements" />
          <h3><EditMarker s={s} path={['agreements']} />{L('Surplus-vote agreement', 'הסכם עודפים')} <Info term="surplus" /></h3>
          <div className="row">
            <select aria-label={L('Agreement partner', 'שותפה להסכם')} value={partnerId} onChange={(e) => setPartner(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="">{L('No agreement', 'אין הסכם')}</option>
              {partners.map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
            </select>
            {agr && <label className="switch small"><input type="checkbox" checked={agr.enabled} onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...agr, enabled: e.target.checked } })} />{agr.enabled ? L('In force', 'בתוקף') : L('Off', 'כבוי')}</label>}
          </div>
          {agr && <p className="small" style={{ margin: '6px 0 0' }}>
            {!agr.enabled ? L('Switched off: both lists compete alone for the remaining seats.', 'כבוי: שתי הרשימות מתחרות לבד על המנדטים הנותרים.')
              : !agrStatus?.active ? (agrStatus?.reason === 'member-withdrawn' ? L('No effect: a partner withdrew.', 'ללא השפעה: שותפה פרשה.') : agrStatus?.reason === 'duplicate-membership' ? L('No effect: a list is in two agreements.', 'ללא השפעה: רשימה בשני הסכמים.') : agrStatus?.reason === 'too-many-members' ? L('Not allowed under these rules.', 'לא מותר לפי הכללים.') : agrStatus?.reason === 'member-no-initial-seat' ? L('No effect: a partner won no whole-quota seat.', 'ללא השפעה: שותפה לא זכתה במנדט במודד שלם.') : L('No effect: a partner failed the threshold.', 'ללא השפעה: שותפה לא עברה את החסימה.'))
              : agreementEffect && agreementEffect.length ? <>{L('Effect: ', 'השפעה: ')}{agreementEffect.map((e) => `${nameOf(e.id)} ${signed(e.d)}`).join(' · ')}</> : L('Effect: none — the same seats are won without it.', 'השפעה: אין — אותם מנדטים גם בלעדיו.')}
          </p>}
        </section>
      )}

      {simple && agr && (
        <section>
          <h3><EditMarker s={s} path={['agreements']} />{L('Surplus-vote agreement', 'הסכם עודפים')} <Info term="surplus" /></h3>
          <p className="small" style={{ margin: 0 }}>{L('With ', 'עם ')}<b>{nameOf(partnerId)}</b>{' · '}
            {agrStatus?.active ? L('in force', 'בתוקף') : !agr.enabled ? L('switched off', 'כבוי') : L('no effect', 'ללא השפעה')}
            {agreementEffect && agreementEffect.length > 0 && <>{' · '}{L('effect: ', 'השפעה: ')}{agreementEffect.map((e) => `${nameOf(e.id)} ${signed(e.d)}`).join(' · ')}</>}</p>
          <p className="tiny muted" style={{ margin: '4px 0 0' }}>{L('Change it in Standard.', 'שינוי במצב רגיל.')}</p>
        </section>
      )}

      <PartEdits s={s} prefix={['lists', l.id]} /><JointParties s={s} r={r} l={l} />

      {standard && (
        <section>
          <h3>{L('Standing', 'מעמד')}</h3>
          <div className="row">
            {s.blocs.length > 0 && <label className="row small" style={{ gap: 6 }}>{L('Bloc', 'גוש')}
              <select value={l.bloc ?? ''} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { bloc: e.target.value || null } })}>
                <option value="">{L('None', 'ללא')}</option>
                {s.blocs.map((b) => <option key={b.id} value={b.id}>{lang === 'he' ? b.nameHe : b.nameEn}</option>)}
              </select></label>}
            <label className="switch small"><input type="checkbox" checked={l.withdrawn} onChange={(e) => dispatch({ type: 'setWithdrawn', listId: l.id, withdrawn: e.target.checked })} />{L('Withdrawn from the race', 'פרשה מההתמודדות')}</label>
            {!baseList && <button className="btn small danger" onClick={() => { dispatch({ type: 'removeList', listId: l.id }); setState({ selectedListId: null }); }}>{L('Delete this list', 'מחיקת הרשימה')}</button>}
            {baseList && listChanged && <button className="btn small" onClick={() => {
              const a = deltaAction(s, l, clampTarget(s, l, baseList.votes, src) - l.votes, src, histShares);
              dispatchMany([...(a ? [a] : []), { type: 'resetList', listId: l.id, keepVotes: true }]);
            }}>{L('Restore this list as it was', 'שחזור הרשימה כפי שהייתה')}</button>}
          </div>
          {l.sponsorsHe && <p className="tiny muted" lang="he" style={{ margin: '6px 0 0' }}>{L('Submitted by: ', 'הוגשה מטעם: ')}{l.sponsorsHe.replace(/; /g, ' · ')}</p>}
        </section>
      )}

      {expert && (
        <section>
          <h3>{L('Allocation detail', 'פירוט החלוקה')}</h3>
          <div className="kv small">
            {lr.qualified && <><span>{L('Share of qualifying votes', 'מהקולות המשתתפים')}</span><span>{fmtPct(l.votes, r.qualifyingVotes, digits)}</span></>}
            <span>{L('Share of ballots cast', 'מכלל המצביעים')}</span><span>{fmtPct(l.votes, votesCast(s), digits)}</span>
            <span>{L('Share of registered voters', 'מבעלי זכות הבחירה')}</span><span>{fmtPct(l.votes, s.registered, digits)}</span>
            {lr.qualified && <>
              <span>{L('Whole-quota seats', 'מנדטים במודד')}</span><span><bdi dir="ltr"><span className="muted">⌊{fmtInt(l.votes)} ÷ {fmtRat(r.quota, 0)}⌋ =</span> {lr.initialSeats}</bdi></span>
              <span>{L('Remainder-stage seats', 'מנדטים מעודפים')}</span><span>{lr.seats - lr.initialSeats}</span>
              <span>{L('Votes per seat won', 'קולות למנדט')}</span><span>{lr.seats ? fmtInt(Math.round(l.votes / lr.seats)) : '—'}</span>
              {nextQ && <><span>{unit?.isAgreement ? L('Pair’s next-seat quotient', 'מודד הצמד למנדט הבא') : L('Next-seat quotient', 'מודד רשימה למנדט הבא')} <Info term="listquota" /></span><span title={fmtFrac(nextQ)}>{fmtRat(nextQ, 1)}</span></>}
              {lastWin && <><span>{L('Lowest winning quotient', 'המודד הזוכה הנמוך ביותר')}</span><span>{fmtRat(lastWin, 1)}</span></>}
            </>}
            <span>{baseLabel.seats}</span><span>{histSeats < 0 ? L('Compared together on Overview', 'השוואה משותפת בתמונת המצב') : histSeats}</span>
          </div>
        </section>
      )}

      {expert && (
        <section>
          <h3>{L('Name and colour (display only)', 'שם וצבע (תצוגה בלבד)')}</h3>
          <div className="grid2">
            <label className="field">{L('Short name (Hebrew)', 'שם מקוצר')}<TextField value={l.shortHe} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortHe: v } })} /></label>
            <label className="field">{L('Short name (English)', 'שם באנגלית')}<TextField value={l.shortEn ?? ''} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { shortEn: v || null } })} /></label>
            <label className="field">{L('Ballot letters', 'אותיות הרשימה')}<EditMarker s={s} path={['lists', l.id, 'letters']} /><TextField value={l.letters} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { letters: v } })} /></label>
            <label className="field">{L('Colour', 'צבע')}<EditMarker s={s} path={['lists', l.id, 'color']} /><input type="color" value={l.color} onChange={(e) => dispatch({ type: 'setListMeta', listId: l.id, patch: { color: e.target.value } })} /></label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>{L('Full name', 'שם מלא')}<EditMarker s={s} path={['lists', l.id, 'nameHe']} /><TextField value={l.nameHe} onCommit={(v) => dispatch({ type: 'setListMeta', listId: l.id, patch: { nameHe: v } })} /></label>
          </div>
        </section>
      )}

      {standard && notes.length > 0 && (
        <section>
          <h3>{L('Official notes (Central Elections Committee)', 'הערות רשמיות (ועדת הבחירות)')}</h3>
          {notes.map((n, i) => <p key={i} className="small" lang="he" dir="rtl" style={{ margin: '0 0 4px' }}>{n}</p>)}
        </section>
      )}

      <section className="wide">
        <h3>{simple ? L(`Who gets in (${lr.seats})`, `מי נכנס לכנסת (${lr.seats})`) : L('Candidates', 'מועמדים')}<EditMarker s={s} path={['lists', l.id, 'candidates']} /></h3>
        {ds.lists.find((x) => x.id === l.id)?.candidatesSecondary && <p className="small" style={{ color: 'var(--warn-ink)' }}>{L('Candidate list from a secondary source (the official page could not be retrieved).', 'רשימת המועמדים ממקור משני (העמוד הרשמי לא נטען).')}</p>}
        <Candidates l={l} seats={lr.seats} baseSeats={baseList ? histSeats : -1} baseCandidates={baseList?.candidates} />
      </section>
    </div>
  );
}
