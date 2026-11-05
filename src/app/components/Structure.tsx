import { Slip } from './ui.tsx';
import { EditMarker } from './EditMarker.tsx';
import { useDisclosure } from './Feature.tsx';
import { StartFrom } from './StartFrom.tsx';
import { startEffect } from '../../model/partEffect.ts'; // its Official agreements button covers restoring when every list still exists
import { PartEdits } from './PartEdits.tsx';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { allocate } from '../../engine/allocate.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { applyAction } from '../../model/actions.ts';
import { toEngineInput, type Action, type Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { dispatch, dispatchMany, setState } from '../store.ts';
import { Info, NumberInput, Seg } from './ui.tsx';

const newId = () => `sim-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function Structure({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const [task, setTask] = useState<'merge' | 'split' | 'add' | 'agreements'>('merge');
  return (
    <div className="structure">{task !== 'agreements' && <StartFrom s={s} part="structure" />}
      <Seg label={L('Task', 'משימה')} value={task} onChange={setTask} options={[
        { v: 'merge', label: L('Merge lists', 'איחוד רשימות') }, { v: 'split', label: L('Split a list', 'פיצול רשימה') },
        { v: 'add', label: L('Add a list', 'הוספת רשימה') }, { v: 'agreements', label: L('Surplus agreements', 'הסכמי עודפים') }]} />
      <div style={{ marginTop: 14 }}>
        {task === 'merge' && <Merge s={s} r={r} />}
        {task === 'split' && <Split s={s} r={r} />}
        {task === 'add' && <AddList s={s} />}
        {task === 'agreements' && <Agreements s={s} r={r} base={base} />}
      </div>
    </div>
  );
}

/** What an action would do to the seats, drawn before it is applied (exact: the same engine on a copy). */
function Preview({ s, r, actions, focus }: { s: Scenario; r: AllocationResult; actions: Action[] | null; focus?: string[] }) {
  const L = useL();
  const lang = useLang();
  const res = useMemo(() => {
    if (!actions?.length) return null;
    try {
      const next = actions.reduce((x, a) => applyAction(x, a), s);
      const nr = allocate(toEngineInput(next));
      const rows = next.lists.map((l) => {
        const now = nr.lists.find((x) => x.id === l.id)?.seats ?? 0;
        const was = s.lists.some((x) => x.id === l.id) ? r.lists.find((x) => x.id === l.id)?.seats ?? 0 : l.originIds.reduce((t, o) => t + (r.lists.find((x) => x.id === o)?.seats ?? 0), 0);
        return { id: l.id, label: listLabel(l, lang), color: l.color, was, now, isNew: !s.lists.some((x) => x.id === l.id) };
      }).filter((x) => x.was !== x.now || x.isNew);
      return { rows: rows.sort((a, b) => Number(b.isNew) - Number(a.isNew) || (b.now - b.was) - (a.now - a.was)) };
    } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
  }, [s, r, actions, lang]);
  void focus;
  if (!res) return null;
  if ('error' in res) return <p className="small bad">{res.error}</p>;
  const max = Math.max(1, ...res.rows.map((x) => Math.max(Math.abs(x.now - x.was), x.isNew ? x.now : 0)));
  return (
    <div className="st-preview" aria-live="polite">
      <h4>{L('What would change', 'מה ישתנה')}</h4>
      {res.rows.length === 0 ? <p className="small muted" style={{ margin: 0 }}>{L('No seat would move.', 'אף מנדט לא יזוז.')}</p> : (
        <ul className="cmp-diff">
          {res.rows.map((x) => { const d = x.now - x.was; return (
            <li key={x.id}>
              <span className="cmp-label"><span className="swatch" style={{ background: x.color }} /> {x.isNew ? <b>{x.label}</b> : x.label} <bdi className="muted" dir="ltr">{x.was} → {x.now}</bdi></span>
              <span className="cmp-neg">{d < 0 && <i style={{ width: `${(-d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
              <span className="cmp-axis" aria-hidden />
              <span className="cmp-pos">{d > 0 && <i style={{ width: `${(d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
              <b className="cmp-d" dir="ltr">{d === 0 ? '0' : d > 0 ? `+${d}` : `−${-d}`}</b>
            </li>
          ); })}
        </ul>
      )}
    </div>
  );
}

/** Pick lists as chips (largest first; the rest one click away). */
function ListPicker({ s, picked, onToggle, single }: { s: Scenario; picked: string[]; onToggle: (id: string) => void; single?: boolean }) {
  const L = useL();
  const lang = useLang();
  const [all, setAll] = useState(false);
  const sorted = [...s.lists].filter((l) => !l.withdrawn).sort((a, b) => b.votes - a.votes);
  const shown = all ? sorted : sorted.filter((l, i) => i < 14 || picked.includes(l.id));
  return (
    <div className="row" style={{ gap: 6 }} role="group" aria-label={single ? L('List', 'רשימה') : L('Lists', 'רשימות')}>
      {shown.map((l) => (
        <button key={l.id} type="button" className={`chip coal ${picked.includes(l.id) ? 'in' : ''}`} aria-pressed={picked.includes(l.id)} style={{ ['--c' as string]: l.color }} onClick={() => onToggle(l.id)}>
          <span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}
        </button>
      ))}
      {sorted.length > shown.length && <button type="button" className="btn small ghost" onClick={() => setAll(true)}>{L(`All ${sorted.length} lists`, `כל ${sorted.length} הרשימות`)}</button>}
    </div>
  );
}

function Agreements({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const name = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : L('Removed list', 'רשימה שהוסרה'); };
  const effects = useMemo(() => Object.fromEntries(s.agreements.map((ag) => {
    const alt = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === ag.id ? { ...x, enabled: !x.enabled } : x)) }));
    const d = r.lists.map((x) => ({ id: x.id, d: x.seats - (alt.lists.find((y) => y.id === x.id)?.seats ?? 0) })).filter((x) => x.d !== 0);
    return [ag.id, d];
  })), [s, r]);
  const used = new Set(s.agreements.filter((x) => x.enabled).flatMap((x) => x.members));
  const exp = s.mode === 'experimental';
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3>{L('Surplus-vote agreements', 'הסכמי עודפים')} <Info term="surplus" /></h3>
        <span className="row">{JSON.stringify(s.agreements) !== JSON.stringify(base.agreements) && startEffect(s, { type: 'startPart', part: 'agreements', source: 'official' }, base) !== 'change' && <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'agreements' })}>{L('Restore historical agreements', 'שחזור ההסכמים ההיסטוריים')}</button>}<StartFrom s={s} part="agreements" /></span>
      </div>
      <PartEdits s={s} prefix={['agreements']} />
      {s.agreements.length === 0 && <p className="muted small">{L('None.', 'אין.')}</p>}
      <ul className="cands">
        {s.agreements.map((ag) => {
          const st = r.agreements.find((x) => x.id === ag.id);
          const eff = effects[ag.id] ?? [];
          return (
            <li key={ag.id} className="cand" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <span>
                {ag.members.length === 2 ? <>
                  <EditMarker s={s} path={['agreements', ag.id]} /><b>{name(ag.members[0])}</b>{' ⇄ '}
                  <select value={ag.members[1]} aria-label={L(`Partner of ${name(ag.members[0])}`, `השותפה של ${name(ag.members[0])}`)} style={{ maxWidth: 200 }}
                    onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...ag, members: [ag.members[0], e.target.value] } })}>
                    {s.lists.filter((x) => x.id === ag.members[1] || (x.id !== ag.members[0] && !x.withdrawn && (exp || !s.agreements.some((o) => o.id !== ag.id && o.enabled && o.members.includes(x.id)))))
                      .sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
                  </select>
                </> : <b>{ag.members.map(name).join(' ⇄ ')}</b>}{' '}
                {!ag.enabled || st?.active ? null : <span className="chip no">{st?.reason === 'member-failed-threshold' ? L(`no effect: ${st.failedMembers.map(name).join(', ')} below threshold`, `ללא השפעה: ${st.failedMembers.map(name).join(', ')} מתחת לחסימה`)
                  : st?.reason === 'member-no-initial-seat' ? L(`no effect: ${st.failedMembers.map(name).join(', ')} won no whole-quota seat`, `ללא השפעה: ${st.failedMembers.map(name).join(', ')} לא זכתה במנדט במודד שלם`)
                  : st?.reason === 'member-withdrawn' ? L('no effect: a partner withdrew', 'ללא השפעה: שותפה פרשה')
                  : st?.reason === 'duplicate-membership' ? L('no effect: a list is already in another agreement', 'ללא השפעה: רשימה כבר בהסכם אחר')
                  : st?.reason === 'too-many-members' ? L('not allowed under these rules', 'לא מותר לפי הכללים')
                  : st?.reason === 'unknown-list' ? L('refers to a list that no longer exists', 'מתייחס לרשימה שאינה קיימת') : ''}</span>}
                {ag.members.length > 2 && <span className="chip exp">{L('not legal in Israel', 'לא חוקי בישראל')}</span>}
                <div className="small muted">{eff.length === 0 ? L(ag.enabled ? 'Switching it off changes no seats.' : 'Switching it on changes no seats.', ag.enabled ? 'כיבויו אינו משנה מנדטים.' : 'הפעלתו אינה משנה מנדטים.') : `${ag.enabled ? L('Effect of the agreement: ', 'השפעת ההסכם: ') : L('Switching it on would give: ', 'הפעלתו הייתה נותנת: ')}${eff.map((e) => `${name(e.id)} ${signed(ag.enabled ? e.d : -e.d)}`).join(' · ')}`}</div>
              </span>
              <span className="tools">
                <label className="switch small"><input type="checkbox" checked={ag.enabled} onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...ag, enabled: e.target.checked } })}
                  aria-label={L(`Agreement between ${ag.members.map(name).join(' and ')} in force`, `ההסכם בין ${ag.members.map(name).join(' ל')} בתוקף`)} />{ag.enabled ? L('In force', 'בתוקף') : L('Off', 'כבוי')}</label>
                <button className="btn small ghost danger icon-only" onClick={() => dispatch({ type: 'removeAgreement', id: ag.id })} aria-label={L(`Remove the agreement between ${ag.members.map(name).join(' and ')}`, `הסרת ההסכם בין ${ag.members.map(name).join(' ל')}`)}><X className="icon sm" aria-hidden /></button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="row" style={{ marginTop: 8 }}>
        <select value={a} onChange={(e) => setA(e.target.value)} aria-label={L('First list', 'רשימה ראשונה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => exp || !used.has(x.id)).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        ⇄
        <select value={b} onChange={(e) => setB(e.target.value)} aria-label={L('Second list', 'רשימה שנייה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => x.id !== a && (exp || !used.has(x.id))).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        <button className="btn small primary" disabled={!a || !b} onClick={() => { if (dispatch({ type: 'setAgreement', agreement: { id: `sim-agr-${newId()}`, members: [a, b], enabled: true } })) { setA(''); setB(''); } }}>{L('Add agreement', 'הוספת הסכם')}</button>
      </div>
      {exp && <p className="small muted">{L('Experimental rules: agreements of up to ', 'כללים ניסיוניים: הסכמים של עד ')}{s.rules.maxAgreementSize}{L(' lists (set in the Rules tab). Add a third list by editing an agreement below.', ' רשימות (בלשונית הכללים).')}</p>}
      {exp && s.rules.maxAgreementSize > 2 && s.agreements.map((ag) => (
        <div key={ag.id} className="row small" style={{ marginTop: 4 }}>
          {ag.members.map(name).join(' ⇄ ')}
          <select defaultValue="" onChange={(e) => { if (e.target.value) dispatch({ type: 'setAgreement', agreement: { ...ag, members: [...ag.members, e.target.value] } }); }} aria-label={L('Add member', 'הוספת חברה')}>
            <option value="">{L('+ add member', '+ הוספה')}</option>
            {s.lists.filter((x) => !ag.members.includes(x.id)).sort((x, y) => y.votes - x.votes).slice(0, 25).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function Merge({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const { shown: standard, control } = useDisclosure('splitIdentity');
  const [ids, setIds] = useState<string[]>([]);
  const [nameHe, setName] = useState('');
  const [letters, setLetters] = useState('');
  // the merged list keeps the first list's colour unless one is chosen (an app default would clash with real parties)
  const [chosenColor, setColor] = useState<string | null>(null);
  const [retention, setRetention] = useState(100);
  const [order, setOrder] = useState<'interleave' | 'concat'>('interleave');
  const [pendingId] = useState(() => newId());
  const sel = s.lists.filter((l) => ids.includes(l.id));
  const total = sel.reduce((t, l) => t + l.votes, 0);
  const kept = Number((BigInt(total) * BigInt(Math.round(retention * 100))) / 10000n);
  const defaultHe = sel.map((l) => l.shortHe).join('–'), defaultEn = sel.map((l) => listLabel(l, 'en')).join('–');
  // the merged list looks like its largest member (a merged Likud stays Likud-blue with Likud's letters)
  const biggest = sel.reduce<typeof sel[number] | undefined>((b, l) => (!b || l.votes > b.votes ? l : b), undefined);
  const color = chosenColor ?? biggest?.color ?? '#7a6fd0';
  const actions: Action[] | null = ids.length >= 2 ? [{ type: 'merge', ids, newId: pendingId, nameHe: nameHe || defaultHe, letters: letters || biggest?.letters || '', color: biggest?.color ?? color, retentionPct: retention, candidateOrder: order, nonRetained: 'abstain' },
    { type: 'setListMeta', listId: pendingId, patch: { shortEn: nameHe || defaultEn, ...(standard && chosenColor ? { color: chosenColor } : {}) } }] : null;
  const go = () => {
    if (!actions) return;
    if (dispatchMany(actions)) { setIds([]); setName(''); setLetters(''); setColor(null); setState({ selectedListId: pendingId, tool: 'board' }); }
  };
  return (
    <div className="st-task">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Choose lists to merge', 'בחירת רשימות לאיחוד')} <Info title={L('Merge assumptions', 'הנחות האיחוד')}>{L('Choose two or more lists to run together. The merged list faces the threshold and the seat count as one list; its members’ surplus agreements are dropped.', 'בחרו שתי רשימות או יותר שירוצו יחד. הרשימה המאוחדת מתמודדת עם אחוז החסימה ועם חלוקת המנדטים כרשימה אחת; הסכמי העודפים של חברותיה מבוטלים.')}</Info></p>
      <ListPicker s={s} picked={ids} onToggle={(id) => setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])} />
      {ids.length >= 2 && (
        <div className="st-options">
          <label className="field">{L(`Voters who stay with the merged list: ${retention}%`, `מצביעים שנשארים עם הרשימה המאוחדת: ${retention}%`)}
            <input type="range" min={50} max={100} value={retention} onChange={(e) => setRetention(Number(e.target.value))} />
            <span className="tiny muted">{L(`${fmtInt(kept)} of ${fmtInt(total)} votes; the other ${fmtInt(total - kept)} stay home.`, `${fmtInt(kept)} מתוך ${fmtInt(total)} קולות; ${fmtInt(total - kept)} האחרים נמנעים.`)}</span></label>
          {control}
          {standard && <>
            <label className="field">{L('Name', 'שם')}<input type="text" value={nameHe} placeholder={lang === 'he' ? defaultHe : defaultEn} onChange={(e) => setName(e.target.value)} /></label>
            <label className="field">{L('Ballot letters', 'אותיות')}<input type="text" value={letters} placeholder={sel[0]?.letters} onChange={(e) => setLetters(e.target.value)} /></label>
            <label className="field">{L('Candidate order', 'סדר המועמדים')}
              <select value={order} onChange={(e) => setOrder(e.target.value as 'interleave' | 'concat')}>
                <option value="interleave">{L('Alternating (1st of each, then 2nd…)', 'לסירוגין (הראשון מכל אחת, אחר כך השני…)')}</option>
                <option value="concat">{L('One list after the other', 'רשימה אחר רשימה')}</option>
              </select></label>
            <label className="field">{L('Colour', 'צבע')}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
          </>}
        </div>
      )}
      <Preview s={s} r={r} actions={actions} />
      <button className="btn primary" style={{ marginTop: 10 }} disabled={!actions} onClick={go}>{ids.length >= 2 ? L(`Merge ${ids.length} lists`, `איחוד ${ids.length} רשימות`) : L('Choose at least two lists', 'בחרו לפחות שתי רשימות')}</button>
    </div>
  );
}

function Split({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [id, setId] = useState('');
  const l = s.lists.find((x) => x.id === id);
  const parties = l?.parties ?? [];
  const byParty = parties.length >= 2;
  const [mode, setMode] = useState<'alternate' | 'top'>('top');
  const [topN, setTopN] = useState(10);
  const [shareA, setShareA] = useState(50);
  const [ids] = useState(() => [newId(), newId() + 'b', newId() + 'c', newId() + 'd', newId() + 'e']);
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;
  // by party: each party's share of the list's elected members (else of its candidates) is the stated assumption
  const partyShares = useMemo(() => {
    if (!l || !byParty) return [];
    const seated = l.candidates.filter((c) => !c.notSeated).slice(0, lr?.seats ?? 0);
    const w = parties.map((p) => seated.filter((c) => c.partyId === p.id).length);
    const base = w.some((x) => x > 0) ? w : parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
    const t = base.reduce((a, b) => a + b, 0) || 1;
    return base.map((x) => x / t);
  }, [l, byParty, parties, lr]);
  const actions: Action[] | null = useMemo(() => {
    if (!l) return null;
    if (byParty) {
      const lead = l.candidates.find((c) => c.partyId)?.partyId ?? parties[0].id;
      const votes = partyShares.map((x) => Math.round(l.votes * x));
      votes[0] += l.votes - votes.reduce((a, b) => a + b, 0);
      const parts = parties.map((p, i) => ({ newId: ids[i], nameHe: p.nameHe, letters: i === 0 ? l.letters : `${l.letters}${i + 1}`, color: p.color ?? l.color, votes: votes[i],
        candidateIds: l.candidates.filter((c) => (c.partyId && parties.some((x) => x.id === c.partyId) ? c.partyId : lead) === p.id).map((c) => c.id) }));
      return [{ type: 'split', id: l.id, parts }, ...parts.map((pt, i) => ({ type: 'setListMeta', listId: pt.newId, patch: { shortEn: parties[i].nameEn } }) as Action)];
    }
    const c = l.candidates;
    const [ca, cb] = mode === 'top' ? [c.slice(0, topN), c.slice(topN)] : [c.filter((_, i) => i % 2 === 0), c.filter((_, i) => i % 2 === 1)];
    const va = Math.round((l.votes * shareA) / 100);
    return [{ type: 'split', id: l.id, parts: [
      { newId: ids[0], nameHe: `${l.shortHe} א`, letters: l.letters, color: l.color, votes: va, candidateIds: ca.map((x) => x.id) },
      { newId: ids[1], nameHe: `${l.shortHe} ב`, letters: `${l.letters}2`, color: '#8a8f99', votes: l.votes - va, candidateIds: cb.map((x) => x.id) }] },
      { type: 'setListMeta', listId: ids[0], patch: { shortEn: `${listLabel(l, 'en')} A` } }, { type: 'setListMeta', listId: ids[1], patch: { shortEn: `${listLabel(l, 'en')} B` } }];
  }, [l, byParty, parties, partyShares, mode, topN, shareA, ids]);
  const go = () => { if (actions && dispatchMany(actions)) { setId(''); setState({ selectedListId: ids[0], tool: 'board' }); } };
  return (
    <div className="st-task">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Choose a list to split', 'בחירת רשימה לפיצול')} <Info title={L('Split assumptions', 'הנחות הפיצול')}>{L('What if a list had run as separate lists? Joint lists split into their own parties; any other list splits in two. How its votes would have divided is an assumption you can see and change.', 'מה אילו רשימה הייתה רצה כרשימות נפרדות? רשימה משותפת מתפצלת למפלגותיה; כל רשימה אחרת — לשתיים. חלוקת הקולות היא הנחה גלויה שאפשר לשנות.')}</Info></p>
      <ListPicker s={s} picked={id ? [id] : []} single onToggle={(x) => setId(id === x ? '' : x)} />
      {l && byParty && (
        <div className="st-options">
          <p className="small" style={{ margin: 0, gridColumn: '1 / -1' }}>{L('Split into its parties. Each gets the votes in proportion to its share of the list’s elected members (the assumption):', 'פיצול למפלגותיה. כל מפלגה מקבלת קולות לפי חלקה בנבחרי הרשימה (ההנחה):')}</p>
          {parties.map((p, i) => <span key={p.id} className="small"><Slip letters={l.letters} name={lang === 'he' ? p.nameHe : p.nameEn} color={p.color ?? l.color} logo={p.logo} /> {lang === 'he' ? p.nameHe : p.nameEn}: <b>{Math.round(partyShares[i] * 1000) / 10}%</b></span>)}
          <p className="tiny muted" style={{ margin: 0, gridColumn: '1 / -1' }}>{L('To set the shares yourself, open the list on the Overview and use “Split into separate lists”.', 'כדי לקבוע את החלוקה בעצמכם, פתחו את הרשימה בתמונת המצב והשתמשו ב"פיצול לרשימות נפרדות".')}</p>
        </div>
      )}
      {l && !byParty && (
        <div className="st-options">
          <label className="field">{L('Candidates', 'מועמדים')}
            <select value={mode} onChange={(e) => setMode(e.target.value as 'alternate' | 'top')}>
              <option value="top">{L('The first N go to the first list', 'N הראשונים לרשימה הראשונה')}</option>
              <option value="alternate">{L('Alternating ranks', 'מקומות לסירוגין')}</option>
            </select></label>
          {mode === 'top' && <label className="field">N<NumberInput value={topN} onCommit={setTopN} label="N" width={80} /></label>}
          <label className="field" style={{ gridColumn: '1 / -1' }}>{L(`Votes of the first list: ${shareA}%`, `קולות הרשימה הראשונה: ${shareA}%`)}
            <input type="range" min={0} max={100} value={shareA} onChange={(e) => setShareA(Number(e.target.value))} /></label>
        </div>
      )}
      <Preview s={s} r={r} actions={actions} />
      <button className="btn primary" style={{ marginTop: 10 }} disabled={!actions} onClick={go}>{l ? L('Split', 'פיצול') : L('Choose a list', 'בחרו רשימה')}</button>
    </div>
  );
}

function AddList({ s }: { s: Scenario }) {
  const L = useL();
  const [nameHe, setName] = useState(''); const [letters, setLetters] = useState(''); const [votes, setVotes] = useState(0);
  void s;
  return (
    <div>
      <h3>{L('Add a new list', 'הוספת רשימה חדשה')}</h3>
      <div className="grid2">
        <label className="field">{L('New list name', 'שם הרשימה החדשה')}<input type="text" value={nameHe} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field">{L('New list letters', 'אותיות הרשימה החדשה')}<input type="text" value={letters} onChange={(e) => setLetters(e.target.value)} /></label>
        <label className="field">{L('Votes (new voters)', 'קולות (מצביעים חדשים)')}<NumberInput value={votes} onCommit={setVotes} label={L('Votes', 'קולות')} /></label>
      </div>
      <button className="btn primary" style={{ marginTop: 6 }} disabled={!nameHe} onClick={() => { const id = newId(); if (dispatch({ type: 'addList', newId: id, nameHe, letters, color: '#5f9ea0', votes })) { setName(''); setLetters(''); setState({ selectedListId: id, tool: 'board' }); } }}>{L('Add list', 'הוספה')}</button>
      <p className="small muted">{L('No candidates yet', 'עדיין אין מועמדים')} <Info title={L('New lists', 'רשימות חדשות')}>{L('A new list starts with no candidates; add them in the list panel (Expert). Move votes to it with the vote tools.', 'רשימה חדשה מתחילה ללא מועמדים; הוסיפו אותם בחלונית הרשימה (מומחה).')}</Info></p>
    </div>
  );
}
