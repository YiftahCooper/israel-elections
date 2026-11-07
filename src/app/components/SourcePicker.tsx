import { groupingName } from '../groupingName.ts';
import { electionLabel } from '../electionLabel.ts';
import { useEffect, useRef, useState } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import type { ElectionId } from '../../data/schema.ts';
import { baselineOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { answerPreference, chooseSource, loadDataset, setState, useStore, useVoteSource } from '../store.ts';
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
  return <dialog ref={dialog} tabIndex={-1} className="source-ask" aria-label={label}
    onCancel={e => { e.preventDefault(); cancel(); }} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}
    onClick={e => { if (e.target === e.currentTarget) cancel(); }}>
    <p className="small" style={{ margin: 0 }}><b>{ask?.title}</b>{' '}
      <Info title={label}>{id === 'voteSource'
        ? L('Other lists: taken from all, in proportion; turnout unchanged. New voters: turnout changes. One list: only that list gives or takes. A remembered donor is asked again if unavailable or part of the edited group.', 'שאר הרשימות: מכולן, באופן יחסי; ההצבעה ללא שינוי. מצביעים חדשים: ההצבעה משתנה. רשימה אחת: רק היא נותנת או מקבלת. נשאל שוב אם הרשימה שנזכרה אינה זמינה או נכללת בקבוצה הנערכת.')
        : L('Opened scenario: only your newer changes are marked. Official result: every difference is marked.', 'התרחיש שנפתח: מסומנים רק השינויים החדשים. התוצאה הרשמית: מסומן כל הבדל.')}</Info></p>
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
      <p className="tiny muted"><button type="button" className="link-btn" onClick={() => { cancel(); setState({ settingsOpen: true, settingsFocus: id === 'comparison' ? 'markChanges' : 'voteSource' }); }}>{L('Change in Settings', 'שינוי בהגדרות')}</button></p>
      <div className="row">
        <button type="submit" className="btn small primary" disabled={!value}>{L('Apply', 'החלה')}</button>
        <button type="button" className="btn small ghost" onClick={cancel}>{L('Cancel', 'ביטול')}</button>
      </div>
    </form>
  </dialog>;
}

/** The answers remembered for one list, bloc or scenario under a question, shown under that question in Settings.
 *  Collapsed by default; each can be asked again, or all forgotten at once. */
export function RememberedAnswers({ id }: { id: PreferenceId }) {
  const L = useL();
  const lang = useLang();
  const perItem = useStore(st => st.preferenceFor);
  const s = useStore(st => st.scenario);
  const datasets = useStore(st => st.datasets);
  const saved = useStore(st => st.saved);
  const elections = useStore(st => st.elections);
  const [open, setOpen] = useState(false);
  const requested = useRef(new Set<string>());
  useEffect(() => {
    for (const election of new Set(Object.keys(perItem ?? {}).filter(k => k.startsWith('voteSource:')).map(k => k.split(':')[1]))) {
      if (!datasets[election as ElectionId] && !requested.current.has(election)) {
        requested.current.add(election);
        void loadDataset(election as ElectionId).catch(() => {});
      }
    }
  }, [perItem, datasets]);
  const listsOf = (election: string) => s?.electionId === election ? s.lists : datasets[election as ElectionId] ? baselineOf(datasets[election as ElectionId]!).lists : [];
  const blocsOf = (election: string) => s?.electionId === election ? s.blocs : datasets[election as ElectionId] ? baselineOf(datasets[election as ElectionId]!).blocs : [];
  const listName = (election: string, lid: string) => { const l = listsOf(election).find(x => x.id === lid); return l ? listLabel(l, lang) : (lang === 'he' ? 'רשימה לא ידועה' : 'Unknown list'); };
  const answerLabel = (v: string, election: string) => {
    const o = PREFERENCES[id].options.find(x => x.value === v);
    return o ? L(o.label[0], o.label[1]) : v.startsWith('t:') ? listName(election, v.slice(2)) : v;
  };
  // keys are "<question>:<election or empty>:<item>" (store.ts preferenceKey)
  const itemLabel = (election: string, key: string) => {
    const [kind, ...rest] = key.split(':'), item = rest.join(':');
    const name = kind === 'list' ? listName(election, item)
      : kind === 'bloc' && item === 'null' ? L('No bloc', 'ללא גוש') : kind === 'bloc' ? ((b) => b ? groupingName(b, lang) : item)(blocsOf(election).find(b => b.id === item))
      : saved.find(x => x.id === key)?.name ?? key;
    const e = election ? elections.find(x => x.id === election) : undefined;
    return e ? `${name} (${electionLabel(e, elections, lang)})` : name;
  };
  const items = Object.entries(perItem ?? {}).filter(([k, v]) => {
    if (!k.startsWith(`${id}:`)) return false;
    const [, election, kind, ...rest] = k.split(':');
    if (id !== 'voteSource') return true;
    if (v.startsWith('t:') && !listsOf(election).some(l => l.id === v.slice(2) && !l.withdrawn)) return false;
    const entity = rest.join(':');
    if (kind === 'list') return listsOf(election).some(l => l.id === entity);
    return kind === 'bloc' && (entity === 'null' || blocsOf(election).some(b => b.id === entity));
  });
  if (!items.length) return null;
  const keep = (e: { currentTarget: Element }) => (e.currentTarget.closest('dialog') as HTMLElement | null)?.focus({ preventScroll: true });
  const forget = (keys: string[]) => setState({ preferenceFor: Object.fromEntries(Object.entries(perItem ?? {}).filter(([k]) => !keys.includes(k))) });
  const title = id === 'comparison' ? L('For one scenario', 'לתרחיש אחד') : L('For one list or bloc', 'לרשימה או לגוש אחד');
  return <div className="pref-remembered">
    <button type="button" className="btn small ghost pref-disclosure" aria-expanded={open} onClick={() => setOpen(o => !o)}>
      {L(`Remembered for ${items.length}`, `נשמר ל־${items.length}`)} <span aria-hidden>{open ? '▾' : '▸'}</span></button>
    <Info title={L('Remembered answers', 'תשובות שמורות')}>{L('An answer chosen with “For this list”, “For this bloc” or “For this scenario”. It wins over the default above, only for that item and election.', 'תשובה שנבחרה עם ״לרשימה זו״, ״לגוש זה״ או ״לתרחיש זה״. היא קודמת לברירת המחדל, רק לפריט ולבחירות האלה.')}</Info>
    {open && <>
      <ul className="pref-items small" aria-label={L(PREFERENCES[id].label[0], PREFERENCES[id].label[1]) + ' · ' + title}>
        {items.map(([k, v]) => { const [, election, ...rest] = k.split(':'); const name = itemLabel(election, rest.join(':'));
          return <li key={k}><span><bdi>{name}</bdi>{id === 'comparison' && <span className="muted"> {L('(this visit)', '(ביקור זה)')}</span>}: <b><bdi>{answerLabel(v, election)}</bdi></b></span>
            <button type="button" className="btn small ghost" aria-label={L(`Ask again for ${name}`, `לשאול שוב עבור ${name}`)} onClick={e => { keep(e); forget([k]); }}>{L('Ask again', 'לשאול שוב')}</button></li>; })}
      </ul>
      {/* all of this question's answers, including any for a list no longer in its election */}
      <button type="button" className="btn small" onClick={e => { keep(e); forget(Object.keys(perItem ?? {}).filter(k => k.startsWith(`${id}:`))); }}>{L('Forget all', 'מחיקת הכול')}</button>
    </>}
  </div>;
}
