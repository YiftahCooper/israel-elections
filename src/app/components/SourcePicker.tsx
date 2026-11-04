import { useEffect, useRef, useState } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { answerSource, setState, useStore, useVoteSource } from '../store.ts';
import { Info } from './ui.tsx';

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

/** The one question every vote edit asks while "Ask each time" is set (Rules → Display): where the
 *  votes come from. The answer also becomes the source shown above, so every control agrees. */
export function SourceDialog() {
  const L = useL();
  const lang = useLang();
  const ask = useStore((st) => st.sourceAsk);
  const s = useStore((st) => st.scenario);
  const [remember, setRemember] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (ask && !d.open) { setRemember(false); d.showModal(); d.focus(); /* not a choice: the Enter that typed the edit must not also pick one */ }
    if (!ask && d.open) d.close();
  }, [ask]);
  const cancel = () => setState({ sourceAsk: null });
  const others = (s?.lists ?? []).filter((x) => !ask?.exclude.includes(x.id) && !x.withdrawn && x.votes > 0).sort((a, b) => b.votes - a.votes);
  return (
    <dialog ref={dialog} tabIndex={-1} className="source-ask" aria-label={L('Votes from', 'הקולות מגיעים מ')} onCancel={(e) => { e.preventDefault(); cancel(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }}
      onClick={(e) => { if (e.target === e.currentTarget) cancel(); }}>
      <p className="small" style={{ margin: 0 }}><b>{ask?.title}</b> · {L('votes from', 'הקולות מ')}
        <Info title={L('Votes from', 'מקור הקולות')}>{L('Other lists: taken from all, in proportion; turnout unchanged. New voters: turnout changes. One list: only that list gives or takes.', 'שאר הרשימות: מכולן, באופן יחסי; ההצבעה ללא שינוי. מצביעים חדשים: ההצבעה משתנה. רשימה אחת: רק היא נותנת או מקבלת.')}</Info></p>
      <div className="row">
        <button className="btn small" onClick={() => answerSource({ kind: 'proportional' }, remember)}>{L('Other lists', 'שאר הרשימות')}</button>
        <button className="btn small" onClick={() => answerSource({ kind: 'new' }, remember)}>{L('New voters', 'מצביעים חדשים')}</button>
        <select className="small" aria-label={L('One list', 'רשימה אחת')} value="" onChange={(e) => e.target.value && answerSource({ kind: 'transfer', listId: e.target.value }, remember)}>
          <option value="">{L('One list…', 'רשימה אחת…')}</option>
          {others.map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
        </select>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <label className="row small" title={L('Change later in Rules → Display', 'לשינוי: כללים ← תצוגה')}><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />{L('Remember', 'לזכור')}</label>
        <button className="btn small ghost" onClick={cancel}>{L('Cancel', 'ביטול')}</button>
      </div>
    </dialog>
  );
}
