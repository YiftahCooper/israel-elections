import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchResult } from '../../engine/analysis.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario, type SimList } from '../../model/scenario.ts';
import { runTasks } from '../analysisPool.ts';
import type { ListGoal } from '../analysisTasks.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, signed } from '../format.ts';
import { dispatch, setState, toast, useStore, useVoteSource } from '../store.ts';
import { deltaAction, maxGain, toVoteSource, type SourceChoice } from '../voteEdit.ts';
import { Info, NumberInput } from './ui.tsx';

/** The single setting that decides how every vote edit on a list is balanced. */
export function SourcePicker({ s, l }: { s: Scenario; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const src = useVoteSource();
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn);
  // a transfer partner that no longer exists (or is this list) falls back to proportional
  useEffect(() => {
    if (src.kind === 'transfer' && (src.listId === l.id || !s.lists.some((x) => x.id === src.listId))) setState({ voteSource: { kind: 'proportional' } });
  }, [src, l.id, s.lists]);
  return (
    <div>
      <label className="field">
        <span className="row" style={{ gap: 6 }}>{L('When this list’s votes change, balance the difference with…', 'כשהקולות של רשימה זו משתנים, ההפרש מאוזן על ידי…')}
          <Info title={L('Different counterfactuals', 'תרחישים שונים')}>{L('Taking votes from all other lists keeps turnout and the valid total fixed. New voters (or voters staying home) change the valid total, and so the threshold in votes. A transfer moves votes from or to one list — if that list is below the threshold, those votes stop being wasted. These give different seat results.', 'לקיחה מכל שאר הרשימות שומרת על ההצבעה ועל סך הכשרים. מצביעים חדשים (או נמנעים) משנים את סך הכשרים ולכן את אחוז החסימה בקולות. מעבר מזיז קולות מול רשימה אחת — אם היא מתחת לחסימה, הקולות מפסיקים להתבזבז. התוצאות שונות.')}</Info>
        </span>
        <select aria-label={L('When this list’s votes change, balance the difference with…', 'כשהקולות של רשימה זו משתנים, ההפרש מאוזן על ידי…')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(e) => {
          const v = e.target.value;
          setState({ voteSource: v === 'new' ? { kind: 'new' } : v === 'proportional' ? { kind: 'proportional' } : { kind: 'transfer', listId: v.slice(2) } });
        }}>
          <option value="proportional">{L('All other lists, in proportion (turnout unchanged)', 'כל שאר הרשימות, באופן יחסי (ההצבעה ללא שינוי)')}</option>
          <option value="new">{L('New voters / voters staying home (turnout changes)', 'מצביעים חדשים / נמנעים (ההצבעה משתנה)')}</option>
          <optgroup label={L('One specific list (transfer)', 'רשימה אחת מסוימת (מעבר)')}>
            {[...others].sort((a, b) => b.votes - a.votes).map((x) => <option key={x.id} value={`t:${x.id}`}>{listLabel(x, lang)} ({fmtInt(x.votes)})</option>)}
          </optgroup>
        </select>
      </label>
    </div>
  );
}

type GoalKind = ListGoal;

export function VoteTools({ s, r, l }: { s: Scenario; r: AllocationResult; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const src = useVoteSource();
  const [custom, setCustom] = useState(5000);
  const [answer, setAnswer] = useState<{ kind: GoalKind; res: SearchResult; src: SourceChoice; listId: string } | null>(null);
  const lr = r.lists.find((x) => x.id === l.id)!;
  // a computed answer is only valid for the scenario it was computed on
  useEffect(() => setAnswer(null), [s, l.id, src]);
  // searches run in a background worker; a change of scenario, list or source abandons them
  const job = useRef<(() => void) | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { job.current?.(); job.current = null; setBusy(false); }, [s, l.id, src]);

  const apply = (delta: number) => {
    if (delta > 0 && delta > maxGain(s, l, src)) return toast('error', L(`The chosen source has only ${fmtInt(maxGain(s, l, src))} votes to give.`, `במקור שנבחר יש רק ${fmtInt(maxGain(s, l, src))} קולות.`));
    if (delta < 0 && -delta > l.votes) return toast('error', L(`${listLabel(l, lang)} has only ${fmtInt(l.votes)} votes.`, `ל${listLabel(l, lang)} יש רק ${fmtInt(l.votes)} קולות.`));
    const a = deltaAction(s, l, delta, src);
    if (a) dispatch(a);
  };

  const run = (kind: GoalKind) => {
    job.current?.();
    setBusy(true);
    const listId = l.id;
    const task = { kind: 'listSearch', input: toEngineInput(s), src: toVoteSource(src), goal: kind, id: listId, seats: lr.seats } as const;
    job.current = runTasks([task], (_, res) => { job.current = null; setBusy(false); setAnswer({ kind, res, src, listId }); });
  };

  const changes = useMemo(() => {
    if (!answer?.res.after) return [];
    const b = answer.res.before, a = answer.res.after;
    return a.lists.map((x) => ({ id: x.id, d: x.seats - (b.lists.find((y) => y.id === x.id)?.seats ?? 0) })).filter((x) => x.d !== 0);
  }, [answer]);

  const nameOf = (id: string) => { const x = s.lists.find((y) => y.id === id); return x ? listLabel(x, lang) : id; };
  const srcText = (c: SourceChoice, gain: boolean) => c.kind === 'new'
    ? (gain ? L('from additional voters (valid total rises)', 'ממצביעים נוספים (סך הכשרים עולה)') : L('to voters staying home (valid total falls)', 'למצביעים שנמנעים (סך הכשרים יורד)'))
    : c.kind === 'transfer' ? (gain ? L(`transferred from ${nameOf(c.listId)}`, `במעבר מ${nameOf(c.listId)}`) : L(`transferred to ${nameOf(c.listId)}`, `במעבר ל${nameOf(c.listId)}`))
    : (gain ? L('taken proportionally from all other lists', 'שנלקחים באופן יחסי מכל שאר הרשימות') : L('given proportionally to all other lists', 'שעוברים באופן יחסי לכל שאר הרשימות'));

  const shown = answer && answer.listId === l.id ? answer : null;
  const advanced = useStore((st) => st.level === 'expert');

  return (
    <div>
      <div className="row" role="group" aria-label={L('Quick changes', 'שינויים מהירים')}>
        {[-10000, -1000, -100, -1].map((d) => <button key={d} dir="ltr" className="btn small" onClick={() => apply(d)} disabled={l.votes + d < 0}>−{fmtInt(-d)}</button>)}
        {[1, 100, 1000, 10000].map((d) => <button key={d} dir="ltr" className="btn small" onClick={() => apply(d)}>+{fmtInt(d)}</button>)}
      </div>
      {advanced && <div className="row" style={{ marginTop: 6 }}>
        <NumberInput value={custom} onCommit={setCustom} label={L('Custom amount', 'כמות מותאמת')} width={100} />
        <button className="btn small" onClick={() => apply(-custom)} disabled={l.votes < custom || custom === 0} aria-label={L('Subtract custom amount', 'הפחתת הכמות')}>−</button>
        <button className="btn small" onClick={() => apply(custom)} disabled={custom === 0} aria-label={L('Add custom amount', 'הוספת הכמות')}>+</button>
        <span className="muted small">{L('or by', 'או ב-')}</span>
        {[-10, -5, 5, 10].map((p) => <button key={p} dir="ltr" className="btn small" onClick={() => apply(Math.round((l.votes * p) / 100))} disabled={l.votes === 0}>{p > 0 ? '+' : '−'}{Math.abs(p)}%</button>)}
      </div>}

      <div className="section-title">{advanced ? L('Exact electoral boundaries', 'גבולות מדויקים') : L('How close is the next seat?', 'כמה רחוק המנדט הבא?')}</div>
      <div className="row">
        {!lr.qualified && !l.withdrawn && <button className="btn small" onClick={() => run('qualify')}>{L('Minimum to pass threshold', 'מינימום למעבר החסימה')}</button>}
        {lr.qualified && <button className="btn small" onClick={() => run('gain')}>{L(`Votes for seat ${lr.seats + 1}`, `קולות למנדט ה-${lr.seats + 1}`)}</button>}
        {lr.qualified && <button className="btn small" onClick={() => run('lose')}>{lr.seats > 0 ? L('Safety margin (votes before losing a seat)', 'מרווח ביטחון (קולות עד אובדן מנדט)') : L('Margin above threshold', 'מרווח מעל החסימה')}</button>}
      </div>
      {busy && <p className="small muted" role="status">{L('Calculating exactly…', 'מחשב במדויק…')}</p>}
      {shown && (
        <div className="callout small" style={{ marginTop: 8 }} aria-live="polite">
          {shown.res.reason === 'already' && L('Already true — no change needed.', 'כבר מתקיים — אין צורך בשינוי.')}
          {shown.res.reason === 'infeasible' && L('Not possible with this source (no votes available).', 'לא אפשרי ממקור זה (אין קולות זמינים).')}
          {shown.res.reason === 'inconclusive' && L('Inconclusive: sampled counts did not achieve the goal; an untested interval may still do so.', 'לא חד־משמעי: הספירות שנדגמו לא השיגו את היעד; ייתכן שטווח שלא נבדק כן ישיג אותו.')}
          {shown.res.reason === 'limit' && L(`Not reachable: even ${fmtInt(shown.res.limit)} votes from this source are not enough.`, `לא ניתן להשגה: אפילו ${fmtInt(shown.res.limit)} קולות ממקור זה אינם מספיקים.`)}
          {shown.res.found && shown.res.votes !== null && (
            <>
              {shown.kind === 'lose'
                ? <div><b>{fmtInt(shown.res.votes - 1n)}</b> {L('votes can be lost', 'קולות אפשר לאבד')} ({srcText(shown.src, false)}) {L('with no change; losing', 'ללא שינוי; באובדן')} <b>{fmtInt(shown.res.votes)}</b> {(() => {
                  const after = shown.res.after!.lists.find((x) => x.id === l.id)!;
                  if (!after.qualified) return lr.seats > 0 ? L(`drops below the threshold and loses all ${lr.seats} seats.`, `יורדת מתחת לאחוז החסימה ומאבדת את כל ${lr.seats} המנדטים.`) : L('drops below the threshold.', 'יורדת מתחת לאחוז החסימה.');
                  const lost = lr.seats - after.seats;
                  return lost > 1 ? L(`costs ${lost} seats.`, `יאבד ${lost} מנדטים.`) : L('costs a seat.', 'יאבד מנדט.');
                })()}</div>
                : <div><b>{fmtInt(shown.res.votes)}</b> {L('more votes', 'קולות נוספים')}, {srcText(shown.src, true)}. {L(`At ${fmtInt(shown.res.votes - 1n)} the result does not change.`, `ב-${fmtInt(shown.res.votes - 1n)} התוצאה אינה משתנה.`)}</div>}
              {changes.length > 0 && <div style={{ marginTop: 4 }}>{L('Resulting seat changes: ', 'שינויי מנדטים: ')}{changes.map((c) => `${nameOf(c.id)} ${signed(c.d)}`).join(' · ')}</div>}
              {shown.res.nonMonotonic && <div style={{ marginTop: 4 }}>{L('Note: the outcome is not monotonic here (another list crosses the threshold along the way); this is the smallest count found.', 'שימו לב: התוצאה אינה מונוטונית כאן (רשימה אחרת חוצה את החסימה בדרך); זה המספר הקטן ביותר שנמצא.')}</div>}
              {shown.kind === 'gain' && <div className="muted" style={{ marginTop: 4 }}>{L('This depends on where the votes come from (the setting above): it is not the general quota, and other sources give other answers.', 'התשובה תלויה במקור הקולות (ההגדרה למעלה): אין זה המודד הכללי, ומקורות אחרים נותנים תשובות אחרות.')}</div>}
              <div className="row" style={{ marginTop: 6 }}>
                <button className="btn small primary" onClick={() => { const delta = shown.kind === 'lose' ? -Number(shown.res.votes) : Number(shown.res.votes); const a = deltaAction(s, l, delta, shown.src); if (a) dispatch(a); }}>
                  {shown.kind === 'lose' ? L('Apply the loss', 'החילו את האובדן') : L('Apply', 'החילו')}
                </button>
                <span className="muted">{fmtPct(l.votes + (shown.kind === 'lose' ? -Number(shown.res.votes) : Number(shown.res.votes)), Number(shown.res.after!.totalValid), 3)} {L('of valid votes after', 'מהכשרים לאחר השינוי')}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
