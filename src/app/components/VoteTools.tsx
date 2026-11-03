import { useMemo, useState } from 'react';
import { goals, minimalChange, type SearchResult, type VoteSource } from '../../engine/analysis.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Action, type Scenario, type SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { dispatch, toast } from '../store.ts';
import { Info, NumberInput } from './ui.tsx';

export type SourceChoice = { kind: 'new' } | { kind: 'transfer'; listId: string } | { kind: 'proportional' };

export const toVoteSource = (c: SourceChoice): VoteSource => (c.kind === 'proportional' ? { kind: 'proportional', listIds: [] } : c);

/** The action that changes `l` by `delta` votes taking/returning them per `src`. Mirrors
 *  analysis.perturb exactly, so applying a computed answer reproduces it. */
export function deltaAction(s: Scenario, l: SimList, delta: number, src: SourceChoice): Action | null {
  if (delta === 0) return null;
  if (src.kind === 'new') return { type: 'setVotes', listId: l.id, votes: Math.max(0, l.votes + delta) };
  if (src.kind === 'transfer') return delta > 0 ? { type: 'transfer', from: src.listId, to: l.id, votes: delta } : { type: 'transfer', from: l.id, to: src.listId, votes: -delta };
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn);
  return delta > 0
    ? { type: 'redistribute', from: others.map((x) => x.id), to: [{ listId: l.id, share: 1 }], votes: delta }
    : { type: 'redistribute', from: [l.id], to: others.map((x) => ({ listId: x.id, share: x.votes })), votes: -delta };
}

type GoalKind = 'qualify' | 'gain' | 'keep' | 'lose';

export function VoteTools({ s, r, l }: { s: Scenario; r: AllocationResult; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const [src, setSrc] = useState<SourceChoice>({ kind: 'new' });
  const [custom, setCustom] = useState(5000);
  const [pctIn, setPctIn] = useState('');
  const [answer, setAnswer] = useState<{ kind: GoalKind; res: SearchResult; src: SourceChoice } | null>(null);
  const lr = r.lists.find((x) => x.id === l.id)!;
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn);
  const srcList = src.kind === 'transfer' ? s.lists.find((x) => x.id === src.listId) : null;

  const apply = (delta: number) => {
    if (src.kind === 'transfer' && !srcList) return toast('error', L('Choose the list votes come from.', 'בחרו את הרשימה שממנה עוברים הקולות.'));
    const a = deltaAction(s, l, delta, src);
    if (a) dispatch(a);
  };

  const setPercent = () => {
    const p = Number(pctIn);
    if (!(p >= 0 && p < 100)) return toast('error', L('Enter a percentage between 0 and 100.', 'הזינו אחוז בין 0 ל-100.'));
    const V = Number(r.totalValid), v = l.votes;
    // new voters: v' / (V − v + v') = p  ⇒  v' = p(V − v)/(1 − p); fixed total: v' = pV
    const target = src.kind === 'new' ? Math.round(((p / 100) * (V - v)) / (1 - p / 100)) : Math.round((p / 100) * V);
    apply(target - v);
  };

  const run = (kind: GoalKind) => {
    if (src.kind === 'transfer' && !srcList) return toast('error', L('Choose the list votes come from.', 'בחרו את הרשימה שממנה עוברים הקולות.'));
    const input = toEngineInput(s);
    const vs = toVoteSource(src);
    let res: SearchResult;
    if (kind === 'qualify') res = minimalChange(input, l.id, vs, goals.qualify(l.id));
    else if (kind === 'gain') res = minimalChange(input, l.id, vs, goals.seatGain(l.id));
    else res = minimalChange(input, l.id, vs, lr.qualified && lr.seats > 0 ? goals.seatLoss(l.id) : goals.disqualify(l.id), 'lose');
    setAnswer({ kind, res, src });
  };

  const changes = useMemo(() => {
    if (!answer?.res.after) return [];
    const b = answer.res.before, a = answer.res.after;
    return a.lists.map((x) => ({ id: x.id, d: x.seats - (b.lists.find((y) => y.id === x.id)?.seats ?? 0) })).filter((x) => x.d !== 0);
  }, [answer]);

  const nameOf = (id: string) => { const x = s.lists.find((y) => y.id === id); return x ? listLabel(x, lang) : id; };
  const srcText = (c: SourceChoice, gain: boolean) => c.kind === 'new'
    ? (gain ? L('additional voters (valid total rises)', 'מצביעים נוספים (סך הכשרים עולה)') : L('voters abstaining (valid total falls)', 'מצביעים שנמנעים (סך הכשרים יורד)'))
    : c.kind === 'transfer' ? (gain ? L(`transferred from ${nameOf(c.listId)}`, `מעבר מ${nameOf(c.listId)}`) : L(`transferred to ${nameOf(c.listId)}`, `מעבר ל${nameOf(c.listId)}`))
    : (gain ? L('taken proportionally from all other lists', 'נלקחים באופן יחסי מכל שאר הרשימות') : L('given proportionally to all other lists', 'עוברים באופן יחסי לכל שאר הרשימות'));

  return (
    <div>
      <div className="section-title row">{L('Where do changed votes come from?', 'מאין מגיעים הקולות שמשתנים?')}
        <Info title={L('Different counterfactuals', 'תרחישים שונים')}>{L('Adding new voters raises the valid total (and so the threshold); a transfer keeps the total fixed; votes moved from a list below the threshold stop being wasted. These give different seat results and are never treated as interchangeable.', 'הוספת מצביעים מגדילה את סך הכשרים (ואת אחוז החסימה בקולות); מעבר בין רשימות שומר על הסך; מעבר מרשימה שלא עברה את החסימה הופך קולות "מבוזבזים" למשתתפים. התוצאות שונות ואינן חלופיות.')}</Info>
      </div>
      <div className="row">
        <select aria-label={L('Vote source', 'מקור הקולות')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(e) => {
          const v = e.target.value;
          setSrc(v === 'new' ? { kind: 'new' } : v === 'proportional' ? { kind: 'proportional' } : { kind: 'transfer', listId: v.slice(2) });
          setAnswer(null);
        }} style={{ flex: 1 }}>
          <option value="new">{L('New / abstaining voters (total changes)', 'מצביעים חדשים / נמנעים (הסך משתנה)')}</option>
          <option value="proportional">{L('All other lists, proportionally (total fixed)', 'כל שאר הרשימות, יחסית (הסך קבוע)')}</option>
          <optgroup label={L('Transfer with one list (total fixed)', 'מעבר מול רשימה אחת (הסך קבוע)')}>
            {[...others].sort((a, b) => b.votes - a.votes).map((x) => <option key={x.id} value={`t:${x.id}`}>{listLabel(x, lang)} ({fmtInt(x.votes)}){r.lists.find((y) => y.id === x.id)?.qualified ? '' : L(' · below threshold', ' · מתחת לחסימה')}</option>)}
          </optgroup>
        </select>
      </div>

      <div className="row" style={{ marginTop: 8 }} role="group" aria-label={L('Quick changes', 'שינויים מהירים')}>
        {[-10000, -1000, -100, -1].map((d) => <button key={d} className="btn small" onClick={() => apply(d)} disabled={l.votes + d < 0}>−{fmtInt(-d)}</button>)}
        {[1, 100, 1000, 10000].map((d) => <button key={d} className="btn small" onClick={() => apply(d)}>+{fmtInt(d)}</button>)}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <NumberInput value={custom} onCommit={setCustom} label={L('Custom amount', 'כמות מותאמת')} width={100} />
        <button className="btn small" onClick={() => apply(-custom)} disabled={l.votes < custom}>−</button>
        <button className="btn small" onClick={() => apply(custom)}>+</button>
        <span className="muted small">{L('or by', 'או ב-')}</span>
        {[-10, -5, 5, 10].map((p) => <button key={p} className="btn small" onClick={() => apply(Math.round((l.votes * p) / 100))}>{p > 0 ? '+' : '−'}{Math.abs(p)}%</button>)}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <input type="text" inputMode="decimal" placeholder="%" value={pctIn} onChange={(e) => setPctIn(e.target.value)} style={{ width: 80 }} aria-label={L('Target share of valid votes', 'שיעור יעד מהקולות הכשרים')} />
        <button className="btn small" onClick={setPercent}>{L('Set share of valid votes', 'קבעו שיעור מהקולות הכשרים')}</button>
      </div>

      <div className="section-title">{L('Exact electoral boundaries', 'גבולות מדויקים')}</div>
      <div className="row">
        {!lr.qualified && !l.withdrawn && <button className="btn small" onClick={() => run('qualify')}>{L('Minimum to pass threshold', 'מינימום למעבר החסימה')}</button>}
        {lr.qualified && <button className="btn small" onClick={() => run('gain')}>{L(`Votes for seat ${lr.seats + 1}`, `קולות למנדט ה-${lr.seats + 1}`)}</button>}
        {lr.qualified && <button className="btn small" onClick={() => run('lose')}>{lr.seats > 0 ? L('Safety margin (votes before losing a seat)', 'מרווח ביטחון (קולות עד אובדן מנדט)') : L('Margin above threshold', 'מרווח מעל החסימה')}</button>}
      </div>
      {answer && (
        <div className="callout small" style={{ marginTop: 8 }} aria-live="polite">
          {answer.res.reason === 'already' && L('Already true — no change needed.', 'כבר מתקיים — אין צורך בשינוי.')}
          {answer.res.reason === 'infeasible' && L('Not possible with this source (no votes available).', 'לא אפשרי ממקור זה (אין קולות זמינים).')}
          {answer.res.reason === 'limit' && L(`Not reachable: even ${fmtInt(answer.res.limit)} votes from this source are not enough.`, `לא ניתן להשגה: אפילו ${fmtInt(answer.res.limit)} קולות ממקור זה אינם מספיקים.`)}
          {answer.res.found && answer.res.votes !== null && (
            <>
              {answer.kind === 'lose'
                ? <div><b>{fmtInt(answer.res.votes - 1n)}</b> {L('votes can be lost', 'קולות אפשר לאבד')} ({srcText(answer.src, false)}) {L('with no change; losing', 'ללא שינוי; באובדן')} <b>{fmtInt(answer.res.votes)}</b> {lr.seats > 0 ? L('costs a seat.', 'יאבד מנדט.') : L('drops below the threshold.', 'יורד מתחת לחסימה.')}</div>
                : <div><b>{fmtInt(answer.res.votes)}</b> {L('more votes', 'קולות נוספים')}, {srcText(answer.src, true)}. {L(`At ${fmtInt(answer.res.votes - 1n)} the result does not change.`, `ב-${fmtInt(answer.res.votes - 1n)} התוצאה אינה משתנה.`)}</div>}
              {changes.length > 0 && <div style={{ marginTop: 4 }}>{L('Resulting seat changes: ', 'שינויי מנדטים: ')}{changes.map((c) => `${nameOf(c.id)} ${c.d > 0 ? '+' : '−'}${Math.abs(c.d)}`).join(' · ')}</div>}
              {answer.res.nonMonotonic && <div style={{ marginTop: 4 }}>{L('Note: the outcome is not monotonic here (another list crosses the threshold along the way); this is the smallest count found.', 'שימו לב: התוצאה אינה מונוטונית כאן (רשימה אחרת חוצה את החסימה בדרך); זה המספר הקטן ביותר שנמצא.')}</div>}
              {answer.kind === 'gain' && <div className="muted" style={{ marginTop: 4 }}>{L('This is specific to the chosen source: it is not the general quota, and other sources give other answers.', 'התשובה תלויה במקור שנבחר: אין זה המודד הכללי, ומקורות אחרים נותנים תשובות אחרות.')}</div>}
              <div className="row" style={{ marginTop: 6 }}>
                <button className="btn small primary" onClick={() => { const delta = answer.kind === 'lose' ? -Number(answer.res.votes) : Number(answer.res.votes); const a = deltaAction(s, l, delta, answer.src); if (a && dispatch(a)) setAnswer(null); }}>
                  {answer.kind === 'lose' ? L('Apply the loss', 'החילו את האובדן') : L('Apply', 'החילו')}
                </button>
                <span className="muted">{fmtPct(l.votes + (answer.kind === 'lose' ? -Number(answer.res.votes) : Number(answer.res.votes)), Number(answer.res.after!.totalValid), 3)} {L('of valid votes after', 'מהכשרים לאחר השינוי')}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
