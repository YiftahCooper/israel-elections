import { ChoicePicker } from './ChoicePicker.tsx';
import { useEffect, useRef, useState } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import type { ElectionId } from '../../data/schema.ts';
import { baselineOf, listLabel } from '../derive.ts';
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
        <span className="row" style={{ gap: 6 }}>{L('Take votes from / return votes to', 'לקיחת קולות מ־ / החזרתם אל')}
          <Info title={L('Different counterfactuals', 'תרחישים שונים')}>{L('Taking votes from all other lists keeps turnout and the valid total fixed. New voters (or voters staying home) change the valid total, and so the threshold in votes. A transfer moves votes from or to one list — if that list is below the threshold, those votes stop being wasted. These give different seat results.', 'לקיחה מכל שאר הרשימות שומרת על ההצבעה ועל סך הכשרים. מצביעים חדשים (או נמנעים) משנים את סך הכשרים ולכן את אחוז החסימה בקולות. מעבר מזיז קולות מול רשימה אחת — אם היא מתחת לחסימה, הקולות מפסיקים להתבזבז. התוצאות שונות.')}</Info>
        </span>
        <select aria-label={L('Take votes from / return votes to', 'לקיחת קולות מ־ / החזרתם אל')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(e) => {
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
  const [scope, setScope] = useState<'once' | 'item' | 'always'>('once');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (ask && !d.open) { setValue(''); setScope('once'); d.showModal(); d.focus({ preventScroll: true }); }
    if (!ask && d.open) d.close();
  }, [ask]);
  const cancel = () => { ask?.cancel?.(); setState({ preferenceAsk: null }); };
  const others = (s?.lists ?? []).filter(x => !ask?.exclude?.includes(x.id) && !x.withdrawn).sort((a, b) => b.votes - a.votes);
  const id = ask?.id ?? 'voteSource';
  const label = L(PREFERENCES[id].label[0], PREFERENCES[id].label[1]);
  return <dialog ref={dialog} tabIndex={-1} className="source-ask" aria-label={id === 'voteSource' ? L('Votes from', 'הקולות מגיעים מ') : label}
    onCancel={e => { e.preventDefault(); cancel(); }} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}
    onClick={e => { if (e.target === e.currentTarget) cancel(); }}>
    <p className="small" style={{ margin: 0 }}><b>{ask?.title}</b>{' '}
      <Info title={label}>{id === 'voteSource'
        ? L('Other lists: taken from all, in proportion; turnout unchanged. New voters: turnout changes. One list: only that list gives or takes. A remembered donor is asked again if unavailable or part of the edited group.', 'שאר הרשימות: מכולן, באופן יחסי; ההצבעה ללא שינוי. מצביעים חדשים: ההצבעה משתנה. רשימה אחת: רק היא נותנת או מקבלת. נשאל שוב אם הרשימה שנזכרה אינה זמינה או נכללת בקבוצה הנערכת.')
        : L('Loaded scenario: highlight only your subsequent edits. Official result: highlight all changes from the election result.', 'התרחיש הטעון: סימון השינויים הבאים שלכם בלבד. התוצאה הרשמית: סימון כל השינויים מתוצאות הבחירות.')}</Info></p>
    <form onSubmit={e => { e.preventDefault(); if (value) answerPreference(value, scope); }}>
      <label className="field">{label}
        <select aria-label={label} value={value} onChange={e => setValue(e.target.value)}>
          <option value="" disabled>{L('Choose…', 'בחירה…')}</option>
          {PREFERENCES[id].options.map(o => <option key={o.value} value={o.value}>{L(o.label[0], o.label[1])}</option>)}
          {id === 'voteSource' && <optgroup label={L('One list', 'רשימה אחת')}>
            {others.map(x => <option key={x.id} value={sourceValue({ kind: 'transfer', listId: x.id })}>{listLabel(x, lang)}</option>)}
          </optgroup>}
        </select>
      </label>
      <fieldset className="preference-scope">
        <legend>{L('Use this choice', 'שימוש בבחירה')}</legend>
        {([
          ['once', L('Just this once', 'רק הפעם')],
          ['item', id === 'comparison' ? L('For this scenario', 'לתרחיש זה') : ask?.key.startsWith('bloc:') ? L('For this bloc', 'לגוש זה') : L('For this list', 'לרשימה זו')],
          ['always', L('Always', 'תמיד')],
        ] as const).map(([v, text]) => <label key={v}><input type="radio" name="preference-scope" value={v} checked={scope === v} onChange={() => setScope(v)} />{text}</label>)}
      </fieldset>
      <p className="tiny muted">{L('Change Always in Rules & settings → Editing.', 'ניתן לשנות ״תמיד״ בכללים והגדרות ← עריכה.')}</p>
      <div className="row">
        <button type="submit" className="btn small primary" disabled={!value}>{L('Apply', 'החלה')}</button>
        <button type="button" className="btn small ghost" onClick={cancel}>{L('Cancel', 'ביטול')}</button>
      </div>
    </form>
  </dialog>;
}

/** Registry-driven Settings: every question shows its Always answer and each item's remembered answer,
 *  and each can go back to asking ("Just this once" stores nothing, so it is the Ask each time state). */
export function PreferenceSettings() {
  const L = useL();
  const lang = useLang();
  const answers = useStore(st => st.preferences);
  const perItem = useStore(st => st.preferenceFor);
  const s = useStore(st => st.scenario);
  const datasets = useStore(st => st.datasets);
  const saved = useStore(st => st.saved);
  const elections = useStore(st => st.elections);
  const listsOf = (election: string) => s?.electionId === election ? s.lists : datasets[election as ElectionId] ? baselineOf(datasets[election as ElectionId]!).lists : [];
  const listName = (election: string, id: string) => { const l = listsOf(election).find(x => x.id === id); return l ? listLabel(l, lang) : id; };
  const answerLabel = (id: PreferenceId, v: string, election: string) => {
    const o = PREFERENCES[id].options.find(x => x.value === v);
    return o ? L(o.label[0], o.label[1]) : v.startsWith('t:') ? listName(election, v.slice(2)) : v;
  };
  // keys are "<question>:<election or empty>:<item>" (store.ts preferenceKey)
  const itemLabel = (election: string, key: string) => {
    const [kind, ...rest] = key.split(':'), id = rest.join(':');
    const name = kind === 'list' ? listName(election, id)
      : kind === 'bloc' ? ((b) => b ? (lang === 'he' ? b.nameHe : b.nameEn) : id)(s?.electionId === election ? s.blocs.find(b => b.id === id) : undefined)
      : saved.find(x => x.id === key)?.name ?? key;
    const e = election && election !== s?.electionId ? elections.find(x => x.id === election) : undefined;
    return e ? `${name} (${e.date.slice(0, 4)})` : name;
  };
  const forget = (key: string) => setState({ preferenceFor: Object.fromEntries(Object.entries(perItem ?? {}).filter(([k]) => k !== key)) });
  return <>{(Object.keys(PREFERENCES) as PreferenceId[]).map(id => {
    const pref = PREFERENCES[id], value = answers[id] ?? 'ask';
    const items = Object.entries(perItem ?? {}).filter(([k]) => k.startsWith(`${id}:`));
    return <div className="pref-setting" key={id}>
      <label className="field" style={{ maxWidth: 260 }}>{L(pref.label[0], pref.label[1])}
        <ChoicePicker label={L(pref.label[0], pref.label[1])} value={value} onChange={v => setPreference(id, v === 'ask' ? undefined : v)} options={[
          { value: 'ask', label: L('Ask each time', 'לשאול בכל פעם') },
          ...pref.options.map(o => ({ value: o.value, label: L(o.label[0], o.label[1]) })),
          ...(value.startsWith('t:') ? [{ value, label: s?.lists.find(l => l.id === value.slice(2)) ? listLabel(s.lists.find(l => l.id === value.slice(2))!, lang) : L('One list (when available)', 'רשימה אחת (כשזמינה)') }] : []),
        ]} />
      </label>
      {items.length > 0 && <><p className="tiny muted pref-items-title">{id === 'comparison' ? L('For one scenario', 'לתרחיש אחד') : L('For one list or bloc', 'לרשימה או לגוש אחד')}</p>
      <ul className="pref-items small" aria-label={L(pref.label[0], pref.label[1]) + ' · ' + (id === 'comparison' ? L('For one scenario', 'לתרחיש אחד') : L('For one list or bloc', 'לרשימה או לגוש אחד'))}>
        {items.map(([k, v]) => { const [, election, ...rest] = k.split(':'); const name = itemLabel(election, rest.join(':'));
          return <li key={k}><span><bdi>{name}</bdi>: <b><bdi>{answerLabel(id, v, election)}</bdi></b></span>
            <button type="button" className="btn small ghost" aria-label={L(`Ask again for ${name}`, `לשאול שוב עבור ${name}`)} onClick={() => forget(k)}>{L('Ask again', 'לשאול שוב')}</button></li>; })}
      </ul></>}
    </div>;
  })}</>;
}
