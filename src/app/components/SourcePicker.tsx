import { useEffect, useRef, useState } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { answerPreference, chooseSource, setPreference, setState, useStore, useVoteSource } from '../store.ts';
import { PREFERENCES, sourceValue, type PreferenceId } from '../preferences.ts';
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
        <span className="row" style={{ gap: 6 }}>{L('Balance votes with', 'איזון הקולות מול')}
          <Info title={L('Different counterfactuals', 'תרחישים שונים')}>{L('Taking votes from all other lists keeps turnout and the valid total fixed. New voters (or voters staying home) change the valid total, and so the threshold in votes. A transfer moves votes from or to one list — if that list is below the threshold, those votes stop being wasted. These give different seat results.', 'לקיחה מכל שאר הרשימות שומרת על ההצבעה ועל סך הכשרים. מצביעים חדשים (או נמנעים) משנים את סך הכשרים ולכן את אחוז החסימה בקולות. מעבר מזיז קולות מול רשימה אחת — אם היא מתחת לחסימה, הקולות מפסיקים להתבזבז. התוצאות שונות.')}</Info>
        </span>
        <select aria-label={L('Balance votes with', 'איזון הקולות מול')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(e) => {
          const v = e.target.value;
          chooseSource(`list:${l.id}`, v === 'new' ? { kind: 'new' } : v === 'proportional' ? { kind: 'proportional' } : { kind: 'transfer', listId: v.slice(2) });
        }}>
          <option value="proportional">{L('Other lists', 'שאר הרשימות')}</option>
          <option value="new">{L('New voters / staying home', 'מצביעים חדשים / נמנעים')}</option>
          <optgroup label={L('One specific list (transfer)', 'רשימה אחת מסוימת (מעבר)')}>
            {[...others].sort((a, b) => b.votes - a.votes).map((x) => <option key={x.id} value={`t:${x.id}`}>{listLabel(x, lang)} ({fmtInt(x.votes)})</option>)}
          </optgroup>
        </select>
      </label>
    </div>
  );
}

/** Every action-time preference shares focus, scope, cancellation and persistence. */
export function SourceDialog() {
  const L = useL();
  const lang = useLang();
  const ask = useStore(st => st.preferenceAsk);
  const s = useStore(st => st.scenario);
  const [value, setValue] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (ask && !d.open) { setValue(''); d.showModal(); d.focus(); }
    if (!ask && d.open) d.close();
  }, [ask]);
  const cancel = () => { ask?.cancel?.(); setState({ preferenceAsk: null }); };
  const others = (s?.lists ?? []).filter(x => !ask?.exclude?.includes(x.id) && !x.withdrawn).sort((a, b) => b.votes - a.votes);
  const id = ask?.id ?? 'voteSource';
  const label = L(PREFERENCES[id].label[0], PREFERENCES[id].label[1]);
  return <dialog ref={dialog} tabIndex={-1} className="source-ask" aria-label={id === 'voteSource' ? L('Votes from', 'הקולות מגיעים מ') : label}
    onCancel={e => { e.preventDefault(); cancel(); }} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}
    onClick={e => { if (e.target === e.currentTarget) cancel(); }}>
    <p className="small" style={{ margin: 0 }}><b>{ask?.title}</b> · {label}
      <Info title={label}>{id === 'voteSource'
        ? L('Other lists: taken from all, in proportion; turnout unchanged. New voters: turnout changes. One list: only that list gives or takes. A remembered donor is asked again if unavailable or part of the edited group.', 'שאר הרשימות: מכולן, באופן יחסי; ההצבעה ללא שינוי. מצביעים חדשים: ההצבעה משתנה. רשימה אחת: רק היא נותנת או מקבלת. נשאל שוב אם הרשימה שנזכרה אינה זמינה או נכללת בקבוצה הנערכת.')
        : L('Loaded scenario: highlight only your subsequent edits. Official result: highlight all changes from the election result.', 'התרחיש הטעון: סימון השינויים הבאים שלכם בלבד. התוצאה הרשמית: סימון כל השינויים מתוצאות הבחירות.')}</Info></p>
    <div className="row" role="group" aria-label={label}>
      {PREFERENCES[id].options.map(o => <button key={o.value} className="btn small" aria-pressed={value === o.value} onClick={() => setValue(o.value)}>{L(o.label[0], o.label[1])}</button>)}
      {id === 'voteSource' && <select className="small" aria-label={L('One list', 'רשימה אחת')} value={value.startsWith('t:') ? value : ''} onChange={e => setValue(e.target.value)}>
        <option value="">{L('One list…', 'רשימה אחת…')}</option>
        {others.map(x => <option key={x.id} value={sourceValue({ kind: 'transfer', listId: x.id })}>{listLabel(x, lang)}</option>)}
      </select>}
    </div>
    <div className="row">
      <button className="btn small primary" disabled={!value} onClick={() => answerPreference(value, false)}>{id === 'voteSource' ? ask?.key.startsWith('bloc:') ? L('For this bloc', 'לגוש זה') : L('For this list', 'לרשימה זו') : L('This time', 'הפעם')}</button>
      <button className="btn small" disabled={!value} onClick={() => answerPreference(value, true)}>{L('Always', 'תמיד')}</button>
      <button className="btn small ghost" onClick={cancel}>{L('Cancel', 'ביטול')}</button>
    </div>
  </dialog>;
}

/** Registry-driven Settings: every question can be returned to Ask each time. */
export function PreferenceSettings() {
  const L = useL();
  const lang = useLang();
  const answers = useStore(st => st.preferences);
  const s = useStore(st => st.scenario);
  return <>{(Object.keys(PREFERENCES) as PreferenceId[]).map(id => {
    const pref = PREFERENCES[id], value = answers[id] ?? 'ask';
    return <label className="field" style={{ maxWidth: 260 }} key={id}>{L(pref.label[0], pref.label[1])}
      <select value={value} onChange={e => setPreference(id, e.target.value === 'ask' ? undefined : e.target.value)}>
        <option value="ask">{L('Ask each time', 'לשאול בכל פעם')}</option>
        {pref.options.map(o => <option key={o.value} value={o.value}>{L(o.label[0], o.label[1])}</option>)}
        {value.startsWith('t:') && <option value={value}>{s?.lists.find(l => l.id === value.slice(2)) ? listLabel(s.lists.find(l => l.id === value.slice(2))!, lang) : L('One list (when available)', 'רשימה אחת (כשזמינה)')}</option>}
      </select>
    </label>;
  })}</>;
}
