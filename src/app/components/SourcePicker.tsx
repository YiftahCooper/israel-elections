import { groupingName } from '../groupingName.ts';
import { electionLabel } from '../electionLabel.ts';
import { useEffect, useRef, useState } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import type { ElectionId } from '../../data/schema.ts';
import { baselineOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { answerPreference, chooseSource, getState, loadDataset, setState, useOn, useStore, useVoteSource } from '../store.ts';
import { PREFERENCES, defaultAnswer, sourceValue, type PreferenceId } from '../preferences.ts';
import { ScopeChoice, type Scope } from './ScopeChoice.tsx';
import { Info } from './ui.tsx';
import { ChoicePicker } from './ChoicePicker.tsx';
import { listChoice } from './ListMark.tsx';

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
      <div className="field">
        <span className="row" style={{ gap: 6 }}><span>{L('Votes come from', 'מקור הקולות')}</span>
          <Info title={L('Where the votes come from', 'מאיפה באים הקולות')}>{L('Other lists: taken from all of them, by size, so turnout stays the same. People who stayed home: they vote now, so turnout changes. New citizens: new voters, so eligible voters grow too. One list: only that list gives or takes the votes.', 'שאר הרשימות: נלקחים מכולן, לפי גודלן, ולכן שיעור ההצבעה לא משתנה. מי שלא הצביעו: הם מצביעים הפעם, ולכן שיעור ההצבעה משתנה. אזרחים חדשים: בוחרים חדשים, ולכן גדל גם מספר בעלי זכות הבחירה. רשימה אחת: רק היא נותנת או מקבלת את הקולות.')}</Info>
        </span>
        <ChoicePicker label={L('Votes come from', 'מקור הקולות')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(v) =>
          chooseSource(`list:${l.id}`, v === 'new' ? { kind: 'new' } : v === 'citizens' ? { kind: 'citizens' } : v === 'proportional' ? { kind: 'proportional' } : { kind: 'transfer', listId: v.slice(2) })}
          options={[{ value: 'proportional', label: L('Other lists', 'שאר הרשימות') }, { value: 'new', label: L('People who stayed home', 'מי שלא הצביעו') }, { value: 'citizens', label: L('New citizens', 'אזרחים חדשים') },
            ...[...others].sort((a, b) => b.votes - a.votes).map((x) => listChoice(x, lang, { value: `t:${x.id}`, detail: fmtInt(x.votes), group: L('One list', 'רשימה אחת') }))]} />
      </div>
    </div>
  );
}

/** Every action-time preference shares focus, scope, cancellation and persistence. */
export function SourceDialog() {
  const L = useL();
  const lang = useLang();
  const ask = useStore(st => st.preferenceAsk);
  const s = useStore(st => st.scenario);
  // asked at every level (owner, 9 Nov 2026); Simple offers the two main answers, the higher levels also one list
  const simple = !useOn('oneListSource');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState<Scope>('once');
  const [dontAsk, setDontAsk] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current; if (!d) return;
    // a default set without "Don't ask again" is where the question starts (a list it names, if not offered now, is not)
    const preset = ask ? defaultAnswer(getState().preferences[ask.id]) ?? '' : '';
    const offered = !preset.startsWith('t:') || (getState().scenario?.lists.some(l => l.id === preset.slice(2) && !l.withdrawn && !ask?.exclude?.includes(l.id)) && !simple);
    if (ask && !d.open) { setValue(offered && !(simple && preset === 'citizens') ? preset : ''); setScope('once'); setDontAsk(false); d.showModal(); d.focus({ preventScroll: true }); }
    if (!ask && d.open) d.close();
  }, [ask]);
  const cancel = () => { ask?.cancel?.(); setState({ preferenceAsk: null }); };
  const others = (s?.lists ?? []).filter(x => !ask?.exclude?.includes(x.id) && !x.withdrawn).sort((a, b) => b.votes - a.votes);
  const id = ask?.id ?? 'voteSource';
  const label = L(PREFERENCES[id].label[0], PREFERENCES[id].label[1]);
  return <dialog ref={dialog} tabIndex={-1} className="source-ask" aria-label={label}
    onCancel={e => { e.preventDefault(); cancel(); }} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}
    onClick={e => { if (e.target === e.currentTarget) cancel(); }}>
    {/* the answers' consequences are listed in full below, so the vote-source question needs no (i) repeating them */}
    <p className="small" style={{ margin: 0 }}><b>{ask?.title}</b>{id !== 'voteSource' && <>{' '}
      <Info title={label}>{L('Opened scenario: only your newer changes are marked. Official result: every difference is marked.', 'התרחיש שנפתח: מסומנים רק השינויים החדשים. התוצאה הרשמית: מסומן כל הבדל.')}</Info></>}</p>
    <form onSubmit={e => { e.preventDefault(); if (value) answerPreference(value, scope, dontAsk); }}>
      <label className="field">{label}
        <ChoicePicker label={label} placeholder={L('Choose…', 'בחירה…')} value={value} onChange={setValue}
          options={[...PREFERENCES[id].options.filter(o => !(simple && o.value === 'citizens')).map(o => ({ value: o.value, label: L(o.label[0], o.label[1]) })),
            ...(id === 'voteSource' && !simple ? others.map(x => listChoice(x, lang, { value: sourceValue({ kind: 'transfer', listId: x.id }), group: L('One list', 'רשימה אחת') })) : [])]} />
      </label>
      {/* what each answer does, always in view (the chosen one in bold), so the dialog never changes height */}
      {id === 'voteSource' && <ul className="tiny source-consequences">
        <li data-chosen={value === 'proportional' || undefined}><b>{L('Other lists', 'שאר הרשימות')}:</b> {L('taken from all of them, by size. Turnout stays the same.', 'נלקחים מכולן, לפי גודלן. שיעור ההצבעה לא משתנה.')}</li>
        <li data-chosen={value === 'new' || undefined}><b>{L('People who stayed home', 'מי שלא הצביעו')}:</b> {L('they vote now (or more stay home). Eligible voters stay the same, so turnout changes; other lists keep their votes.', 'הם מצביעים הפעם (או שיותר נשארים בבית). מספר בעלי זכות הבחירה לא משתנה, ולכן שיעור ההצבעה משתנה; לשאר הרשימות אותם קולות.')}</li>
        {!simple && <li data-chosen={value === 'citizens' || undefined}><b>{L('New citizens', 'אזרחים חדשים')}:</b> {L('new voters, who all vote for this list. Eligible voters rise by the same number.', 'בוחרים חדשים, שכולם מצביעים לרשימה הזו. מספר בעלי זכות הבחירה גדל באותו מספר.')}</li>}
        {!simple && <li data-chosen={value.startsWith('t:') || undefined}><b>{L('One list', 'רשימה אחת')}:</b> {L('only that list gives or takes the votes.', 'רק היא נותנת או מקבלת את הקולות.')}</li>}
      </ul>}
      <ScopeChoice name="preference-scope" scope={scope} onScope={setScope} dontAsk={dontAsk} onDontAsk={setDontAsk}
        item={id === 'comparison' ? L('For this scenario', 'לתרחיש זה') : ask?.key.startsWith('bloc:') ? L('For this bloc', 'לגוש זה') : L('For this list', 'לרשימה זו')}
        dontAskInfo={id === 'comparison'
          ? L('Opening a saved scenario then marks changes this way without asking. To be asked again, choose “Ask next time” in the note that appears, or use Settings.', 'פתיחת תרחיש שמור תסמן אז שינויים כך בלי לשאול. כדי שתישאלו שוב, בחרו "לשאול בפעם הבאה" בהודעה שתופיע, או בהגדרות.')
          : L('Every vote edit then takes votes this way without asking; Undo takes one back. To be asked again, choose “Ask next time” in the note that appears, or use Settings.', 'כל עריכת קולות תיקח אז את הקולות כך בלי לשאול; ביטול מחזיר אותה. כדי שתישאלו שוב, בחרו "לשאול בפעם הבאה" בהודעה שתופיע, או בהגדרות.')} />
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
    for (const election of new Set(Object.keys(perItem ?? {}).filter(k => k.startsWith(`${id}:`)).map(k => k.split(':')[1]).filter(Boolean))) {
      if (!datasets[election as ElectionId] && !requested.current.has(election)) {
        requested.current.add(election);
        void loadDataset(election as ElectionId).catch(() => {});
      }
    }
  }, [perItem, datasets, id]);
  // a list is looked up wherever it can live: the open scenario, another election's session, a Compare side (a list
  // copied in as new exists only there), then the election's official lists
  const sessions = useStore(st => st.sessions), drafts = useStore(st => st.compare.drafts);
  const listsOf = (election: string) => {
    const scenarios = [s, sessions[election as ElectionId]?.scenario, ...Object.values(drafts).map(d => d.scenario)].filter(x => x?.electionId === election);
    const base = datasets[election as ElectionId] ? baselineOf(datasets[election as ElectionId]!).lists : [];
    return [...scenarios.flatMap(x => x!.lists), ...base];
  };
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
    if (id === 'comparison') return true;
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
    <Info title={L('Remembered answers', 'תשובות שמורות')}>{L('An answer chosen with “For this list”, “For this bloc” or “For this scenario”. It wins over the default above, only for that item and election, and is used without asking.', 'תשובה שנבחרה עם "לרשימה זו", "לגוש זה" או "לתרחיש זה". היא קודמת לברירת המחדל, רק לפריט ולבחירות האלה, ומשמשת בלי לשאול.')}</Info>
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
