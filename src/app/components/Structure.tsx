import { Slip } from './ui.tsx';
import { EditMarker } from './EditMarker.tsx';
import { useDisclosure } from './Feature.tsx';
import { StartFrom } from './StartFrom.tsx';
import { PartEdits } from './PartEdits.tsx';
import { ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { allocate } from '../../engine/allocate.ts';
import { compareAllocations } from '../../engine/analysis.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { applyAction, apportion } from '../../model/actions.ts';
import { toEngineInput, type Action, type Scenario, type SimRules } from '../../model/scenario.ts';
import { allocationOf, listLabel, referenceLabel } from '../derive.ts';
import { useL, useLang, type Lang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { partColours, distinctColour } from '../newListColour.ts';
import { dispatch, dispatchMany, setState } from '../store.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { Info, NumberInput, Seg } from './ui.tsx';

const newId = () => `sim-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
const splitIds = () => { const b = newId(); return [b, `${b}b`, `${b}c`, `${b}d`, `${b}e`, `${b}f`]; };
type Task = 'merge' | 'split' | 'add' | 'agreements';
// the task last open, so returning to this page (or applying a change) keeps the user where they were
let lastTask: Task = 'merge';
/** Colours of the lists that share the chamber with a new list (a new list must be told apart from them). */
const seatColours = (s: Scenario, r: AllocationResult, except: string[] = []) =>
  s.lists.filter((l) => !except.includes(l.id) && !l.withdrawn && (r.lists.find((x) => x.id === l.id)?.seats ?? 0) > 0).map((l) => l.color);
/** After an applied change the form clears; focus moves to the record of it without scrolling the page. */
const focusApplied = () => requestAnimationFrame(() => document.getElementById('st-applied')?.focus({ preventScroll: true }));

export function Structure({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const [task, setTaskState] = useState<Task>(lastTask);
  const setTask = (t: Task) => { lastTask = t; setTaskState(t); };
  return (
    <div className="structure">
      {/* one header row for every task, so the tabs never move when the task changes */}
      <div className="st-head">
        <Seg label={L('Task', 'משימה')} value={task} onChange={setTask} options={[
          { v: 'merge', label: L('Merge lists', 'איחוד רשימות') }, { v: 'split', label: L('Split a list', 'פיצול רשימה') },
          { v: 'add', label: L('Add a list', 'הוספת רשימה') }, { v: 'agreements', label: L('Surplus agreements', 'הסכמי עודפים') }]} />
        <StartFrom key={task === 'agreements' ? 'agreements' : 'structure'} s={s} part={task === 'agreements' ? 'agreements' : 'structure'} />
      </div>
      <div style={{ marginTop: 14 }}>
        {task === 'merge' && <Merge s={s} r={r} />}
        {task === 'split' && <Split s={s} r={r} />}
        {task === 'add' && <AddList s={s} r={r} />}
        {task === 'agreements' && <Agreements s={s} r={r} base={base} />}
      </div>
      {task !== 'agreements' && <Applied s={s} r={r} base={base} />}
    </div>
  );
}

type Side = { id: string; label: string; color: string; seats: number; withdrawn: boolean };
type Row = { key: string; from: Side[]; to: Side[]; was: number; now: number; structural: boolean; withdrew: boolean; returned: boolean };

/** Seat changes from one scenario to another, grouped by connected origins (as Compare and the summary do): a merged
 *  list is compared with the lists it absorbed, and a split list once with all its parts, never once per part. */
function changeRows(aS: Scenario, aR: AllocationResult, bS: Scenario, bR: AllocationResult, lang: Lang): Row[] {
  const side = (S: Scenario, R: AllocationResult, id: string): Side => {
    const l = S.lists.find((x) => x.id === id)!;
    return { id, label: listLabel(l, lang), color: l.color, seats: R.lists.find((x) => x.id === id)?.seats ?? 0, withdrawn: l.withdrawn };
  };
  return compareAllocations(aR, aS.lists, bR, bS.lists).map((g) => {
    const from = g.aIds.map((id) => side(aS, aR, id)), to = g.bIds.map((id) => side(bS, bR, id));
    const same = g.aIds.length === 1 && g.bIds.length === 1 && g.aIds[0] === g.bIds[0];
    return { key: g.key, from, to, was: g.seatsA, now: g.seatsB, structural: !same,
      withdrew: same && !from[0].withdrawn && to[0].withdrawn, returned: same && from[0].withdrawn && !to[0].withdrawn };
  });
}

/** One row per change: what became what (left to right in both languages, like every before → after), and the net
 *  seat change drawn on a shared axis. `open` makes each resulting list a link to it on the Overview. */
function ChangeRows({ rows, open }: { rows: Row[]; open?: boolean }) {
  const L = useL();
  const dir = useLang() === 'he' ? 'rtl' : 'ltr';
  // a one-seat change is a short bar, not half the width: the scale starts at five seats
  const max = Math.max(5, ...rows.map((x) => Math.abs(x.now - x.was)));
  // each list reads in the page's language (swatch, name, seats); only the flow between lists runs left to right
  const part = (p: Side, seats = true) => {
    const body = <><span className="swatch" style={{ background: p.color }} /><bdi>{p.label}</bdi>{seats && <span className="muted tabnum">{p.seats}</span>}</>;
    return open && !p.withdrawn
      ? <button key={p.id} type="button" dir={dir} className="st-part st-link" title={L('Show on the Overview', 'הצגה בתמונת המצב')}
        onClick={() => setState({ selectedListId: p.id, tool: 'board' })}>{body}</button>
      : <span key={p.id} dir={dir} className="st-part">{body}</span>;
  };
  const join = (xs: Side[]) => xs.flatMap((p, i) => (i ? [<span key={`+${p.id}`} className="muted"> + </span>, part(p)] : [part(p)]));
  return (
    <ul className="st-rows">
      {rows.map((x) => { const d = x.now - x.was; return (
        <li key={x.key}>
          <span className="st-what">{x.structural
            ? <span className="st-flow" dir="ltr">{x.from.length ? join(x.from) : <span className="muted">{L('New', 'חדשה')}</span>}<span className="muted"> → </span>{x.to.length ? join(x.to) : <span className="muted">{L('Removed', 'הוסרה')}</span>}</span>
            : <>{part(x.to[0], false)} <bdi className="muted" dir="ltr">{x.was} → {x.now}</bdi>{x.withdrew && <span className="muted"> · {L('withdrew', 'פרשה')}</span>}{x.returned && <span className="muted"> · {L('back in the race', 'חזרה למרוץ')}</span>}</>}</span>
          <span className="st-bar" aria-hidden>
            <span className="cmp-neg">{d < 0 && <i style={{ width: `${(-d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
            <span className="cmp-axis" />
            <span className="cmp-pos">{d > 0 && <i style={{ width: `${(d / max) * 100}%`, background: 'var(--ink)' }} />}</span>
          </span>
          <b className="cmp-d" dir="ltr">{d === 0 ? '0' : d > 0 ? `+${d}` : `−${-d}`}</b>
        </li>
      ); })}
    </ul>
  );
}
const rowOrder = (a: Row, b: Row) => Number(b.structural) - Number(a.structural) || Math.abs(b.now - b.was) - Math.abs(a.now - a.was) || (b.now - b.was) - (a.now - a.was);

/** What an action would do to the seats, drawn before it is applied (exact: the same engine on a copy). */
function Preview({ s, r, actions }: { s: Scenario; r: AllocationResult; actions: Action[] | null }) {
  const L = useL();
  const lang = useLang();
  const res = useMemo(() => {
    if (!actions?.length) return null;
    try {
      const next = actions.reduce((x, a) => applyAction(x, a), s);
      const rows = changeRows(s, r, next, allocate(toEngineInput(next)), lang).filter((x) => x.structural || x.was !== x.now);
      return { rows: rows.sort(rowOrder) };
    } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
  }, [s, r, actions, lang]);
  if (!res) return null;
  if ('error' in res) return <p className="small bad">{res.error}</p>;
  return (
    <div className="st-preview" aria-live="polite">
      <h4>{L('What would change', 'מה ישתנה')}</h4>
      {res.rows.length === 0 ? <p className="small muted" style={{ margin: 0 }}>{L('No seat would move.', 'אף מנדט לא יזוז.')}</p> : <ChangeRows rows={res.rows} />}
    </div>
  );
}

/** The merges, splits, new lists and withdrawals already applied, against the active reference, with the seats they
 *  give now: the record of this page's work stays on this page. */
function Applied({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const { reference } = useActiveReference();
  const ref = reference && reference.electionId === s.electionId ? reference : base;
  const rows = useMemo(() => changeRows(ref, allocationOf(ref), s, r, lang).filter((x) => x.structural || x.withdrew || x.returned).sort(rowOrder), [ref, s, r, lang]);
  if (!rows.length) return null;
  return (
    <section className="st-preview st-applied" id="st-applied" tabIndex={-1} aria-labelledby="st-applied-h">
      <h4 id="st-applied-h">{L('Changed lists', 'רשימות ששונו')} <span className="small muted" style={{ fontWeight: 'normal' }}>· {referenceLabel(ref === base ? null : ref, lang).since}</span></h4>
      <ChangeRows rows={rows} open />
    </section>
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
      {/* a chip like its siblings (same box, same edge), with a chevron: it reads as the control it is */}
      {sorted.length > shown.length && <button type="button" className="chip st-more" onClick={() => setAll(true)}>{L(`All ${sorted.length} lists`, `כל ${sorted.length} הרשימות`)}<ChevronDown className="icon sm" aria-hidden /></button>}
    </div>
  );
}

/** The agreement rule of the rules in force (each era's law, or the experimental rules), in a few words. */
function agreementRule(rules: SimRules, L: (en: string, he: string) => string): string {
  const pair = rules.maxAgreementSize <= 2, pct = Number(rules.thresholdPct) > 0 ? rules.thresholdPct : null;
  const out = [pair ? L('Pairs of lists', 'זוגות של רשימות') : L(`Up to ${rules.maxAgreementSize} lists`, `עד ${rules.maxAgreementSize} רשימות`)];
  if (pct) out.push(rules.agreementRequiresAllQualify
    ? (pair ? L(`both must pass the ${pct}% threshold`, `שתיהן חייבות לעבור את אחוז החסימה (${pct}%)`) : L(`all must pass the ${pct}% threshold`, `כולן חייבות לעבור את אחוז החסימה (${pct}%)`))
    : L(`a partner below ${pct}% drops out`, `שותפה מתחת ל־${pct}% נשמטת`));
  if (rules.agreementRequiresInitialSeat) out.push(pair ? L('each must win a whole-quota seat', 'כל אחת חייבת לזכות במנדט במודד שלם') : L('every partner must win a whole-quota seat', 'כל שותפה חייבת לזכות במנדט במודד שלם'));
  return out.join(' · ');
}

function Agreements({ s, r, base }: { s: Scenario; r: AllocationResult; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const list = (id: string) => s.lists.find((x) => x.id === id);
  const name = (id: string) => { const l = list(id); return l ? listLabel(l, lang) : L('Removed list', 'רשימה שהוסרה'); };
  const effects = useMemo(() => Object.fromEntries(s.agreements.map((ag) => {
    const alt = allocate(toEngineInput({ ...s, agreements: s.agreements.map((x) => (x.id === ag.id ? { ...x, enabled: !x.enabled } : x)) }));
    const d = r.lists.map((x) => ({ id: x.id, d: x.seats - (alt.lists.find((y) => y.id === x.id)?.seats ?? 0) })).filter((x) => x.d !== 0);
    return [ag.id, d];
  })), [s, r]);
  const used = new Set(s.agreements.filter((x) => x.enabled).flatMap((x) => x.members));
  const exp = s.mode === 'experimental';
  return (
    <div className="st-task">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{L('Surplus-vote agreements', 'הסכמי עודפים')} <Info term="surplus" /></h3>
        {JSON.stringify(s.agreements) !== JSON.stringify(base.agreements) && <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'agreements' })}>{L('Restore historical agreements', 'שחזור ההסכמים ההיסטוריים')}</button>}
      </div>
      {/* the eligibility rule of this election's law (or of the experimental rules), stated where agreements are made */}
      <p className="small ink2 st-rule" style={{ margin: 0 }}><b>{L('Rule', 'הכלל')}:</b> {agreementRule(s.rules, L)}</p>
      <PartEdits s={s} prefix={['agreements']} />
      {s.agreements.length === 0 && <p className="muted small" style={{ margin: 0 }}>{L('None.', 'אין.')}</p>}
      {s.agreements.length > 0 && <ul className="cands st-agreements">
        {s.agreements.map((ag) => {
          const st = r.agreements.find((x) => x.id === ag.id);
          const eff = effects[ag.id] ?? [];
          const inactive = ag.enabled && !st?.active;
          return (
            <li key={ag.id} className="cand" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <span>
                {ag.members.length === 2 ? <>
                  <EditMarker s={s} path={['agreements', ag.id]} /><b>{name(ag.members[0])}</b>{' ⇄ '}
                  <select value={ag.members[1]} aria-label={L(`Partner of ${name(ag.members[0])}`, `השותפה של ${name(ag.members[0])}`)} style={{ maxWidth: 260 }}
                    onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...ag, members: [ag.members[0], e.target.value] } })}>
                    {s.lists.filter((x) => x.id === ag.members[1] || (x.id !== ag.members[0] && !x.withdrawn && (exp || !s.agreements.some((o) => o.id !== ag.id && o.enabled && o.members.includes(x.id)))))
                      .sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}
                  </select>
                </> : <b>{ag.members.map(name).join(' ⇄ ')}</b>}{' '}
                {inactive && <span className="chip no">{st?.reason === 'member-failed-threshold' ? L(`no effect: ${st.failedMembers.map(name).join(', ')} below threshold`, `ללא השפעה: ${st.failedMembers.map(name).join(', ')} מתחת לחסימה`)
                  : st?.reason === 'member-no-initial-seat' ? L(`no effect: ${st.failedMembers.map(name).join(', ')} won no whole-quota seat`, `ללא השפעה: ${st.failedMembers.map(name).join(', ')} לא זכתה במנדט במודד שלם`)
                  : st?.reason === 'member-withdrawn' ? L('no effect: a partner withdrew', 'ללא השפעה: שותפה פרשה')
                  : st?.reason === 'duplicate-membership' ? L('no effect: a list is already in another agreement', 'ללא השפעה: רשימה כבר בהסכם אחר')
                  : st?.reason === 'too-many-members' ? L('not allowed under these rules', 'לא מותר לפי הכללים')
                  : st?.reason === 'unknown-list' ? L('refers to a list that no longer exists', 'מתייחס לרשימה שאינה קיימת') : L('no effect', 'ללא השפעה')}</span>}
                {ag.members.length > 2 && <span className="chip exp">{L('not legal in Israel', 'לא חוקי בישראל')}</span>}
                {/* the seats the agreement moves, as the lists' own colours and signed counts; an agreement with no effect says so once, in its chip */}
                {!inactive && <div className="small muted st-effect">{eff.length === 0
                  ? (ag.enabled ? L('Moves no seat.', 'אינו מזיז מנדט.') : L('Switching it on would move no seat.', 'הפעלתו לא הייתה מזיזה מנדט.'))
                  : <>{ag.enabled ? L('Effect:', 'השפעה:') : L('If switched on:', 'אם יופעל:')}{' '}{eff.map((e) => (
                    <span key={e.id} className="st-eff"><span className="swatch" style={{ background: list(e.id)?.color }} /><bdi>{name(e.id)}</bdi> <b className="tabnum">{signed(ag.enabled ? e.d : -e.d)}</b></span>))}</>}</div>}
              </span>
              <span className="tools">
                <label className="switch small"><input type="checkbox" checked={ag.enabled} onChange={(e) => dispatch({ type: 'setAgreement', agreement: { ...ag, enabled: e.target.checked } })}
                  aria-label={L(`Agreement between ${ag.members.map(name).join(' and ')} in force`, `ההסכם בין ${ag.members.map(name).join(' ל')} בתוקף`)} />{ag.enabled ? L('In force', 'בתוקף') : L('Off', 'כבוי')}</label>
                <button className="btn small ghost danger icon-only" onClick={() => dispatch({ type: 'removeAgreement', id: ag.id })} aria-label={L(`Remove the agreement between ${ag.members.map(name).join(' and ')}`, `הסרת ההסכם בין ${ag.members.map(name).join(' ל')}`)}><X className="icon sm" aria-hidden /></button>
              </span>
            </li>
          );
        })}
      </ul>}
      <div className="row">
        <select style={{ maxWidth: 300 }} value={a} onChange={(e) => setA(e.target.value)} aria-label={L('First list', 'רשימה ראשונה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => exp || !used.has(x.id)).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
        ⇄
        <select style={{ maxWidth: 300 }} value={b} onChange={(e) => setB(e.target.value)} aria-label={L('Second list', 'רשימה שנייה')}><option value="">{L('List…', 'רשימה…')}</option>{s.lists.filter((x) => x.id !== a && (exp || !used.has(x.id))).sort((x, y) => y.votes - x.votes).map((x) => <option key={x.id} value={x.id}>{listLabel(x, lang)}</option>)}</select>
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
  const [pendingId, setPendingId] = useState(newId);
  const sel = s.lists.filter((l) => ids.includes(l.id));
  const total = sel.reduce((t, l) => t + l.votes, 0);
  const kept = Number((BigInt(total) * BigInt(Math.round(retention * 100))) / 10000n);
  const defaultHe = sel.map((l) => l.shortHe).join('–'), defaultEn = sel.map((l) => listLabel(l, 'en')).join('–');
  // the merged list looks like its largest member (a merged Likud stays Likud-blue with Likud's letters)
  const biggest = sel.reduce<typeof sel[number] | undefined>((b, l) => (!b || l.votes > b.votes ? l : b), undefined);
  const color = chosenColor ?? biggest?.color ?? '#7a6fd0';
  const actions: Action[] | null = ids.length >= 2 ? [{ type: 'merge', ids, newId: pendingId, nameHe: nameHe || defaultHe, letters: letters || biggest?.letters || '', color: biggest?.color ?? color, retentionPct: retention, candidateOrder: order, nonRetained: 'abstain' },
    { type: 'setListMeta', listId: pendingId, patch: { shortEn: nameHe || defaultEn, ...(standard && chosenColor ? { color: chosenColor } : {}) } }] : null;
  // the result is shown here, under "Changed lists"; the page stays put so the next merge is one step away
  const go = () => {
    if (!actions) return;
    if (dispatchMany(actions)) { setIds([]); setName(''); setLetters(''); setColor(null); setRetention(100); setPendingId(newId()); focusApplied(); }
  };
  return (
    <div className="st-task">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Choose lists to merge', 'בחירת רשימות לאיחוד')} <Info title={L('Merge assumptions', 'הנחות האיחוד')}>{L('Choose two or more lists to run together. The merged list faces the threshold and the seat count as one list; its members’ surplus agreements are dropped. Voters who do not stay with it stay home.', 'בחרו שתי רשימות או יותר שירוצו יחד. הרשימה המאוחדת מתמודדת עם אחוז החסימה ועם חלוקת המנדטים כרשימה אחת; הסכמי העודפים של חברותיה מבוטלים. מצביעים שאינם נשארים איתה נמנעים.')}</Info></p>
      <ListPicker s={s} picked={ids} onToggle={(id) => setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])} />
      {ids.length >= 2 && (
        <div className="st-options">
          <label className="field">{L(`Voters who stay: ${retention}%`, `מצביעים שנשארים: ${retention}%`)}
            <input type="range" min={50} max={100} value={retention} onChange={(e) => setRetention(Number(e.target.value))} />
            <span className="tiny muted tabnum">{L(`${fmtInt(kept)} of ${fmtInt(total)} votes`, `${fmtInt(kept)} מתוך ${fmtInt(total)} קולות`)}{kept < total && L(` · ${fmtInt(total - kept)} stay home`, ` · ${fmtInt(total - kept)} נמנעים`)}</span></label>
          {control}
          {standard && <>
            <label className="field">{L('Name', 'שם')}<input type="text" value={nameHe} placeholder={lang === 'he' ? defaultHe : defaultEn} onChange={(e) => setName(e.target.value)} /></label>
            <label className="field">{L('Ballot letters', 'אותיות')}<input type="text" value={letters} placeholder={biggest?.letters} onChange={(e) => setLetters(e.target.value)} /></label>
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
      <button className="btn primary" disabled={!actions} onClick={go}>{ids.length >= 2 ? L(`Merge ${ids.length} lists`, `איחוד ${ids.length} רשימות`) : L('Choose at least two lists', 'בחרו לפחות שתי רשימות')}</button>
    </div>
  );
}

/** A 100% bar of how a list's votes are divided between its parts, in the parts' colours (left to right in both languages). */
function ShareBar({ parts }: { parts: { key: string; color: string; votes: number }[] }) {
  const total = parts.reduce((t, p) => t + p.votes, 0) || 1;
  return <div className="st-sharebar" aria-hidden>{parts.map((p) => <i key={p.key} style={{ width: `${(p.votes / total) * 100}%`, background: p.color }} />)}</div>;
}
const pctOf = (votes: number, total: number) => (total ? Math.round((votes / total) * 1000) / 10 : 0);

function Split({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [id, setIdState] = useState('');
  const l = s.lists.find((x) => x.id === id);
  const parties = useMemo(() => l?.parties ?? [], [l]);
  const byParty = parties.length >= 2;
  const [mode, setMode] = useState<'alternate' | 'top'>('top');
  // the first list's candidates when the list is cut at a rank; null = half of them (to match an even vote split)
  const [topN, setTopN] = useState<number | null>(null);
  const [shareA, setShareA] = useState(50);
  // by party: the user's own shares; null = the stated default assumption
  const [shares, setShares] = useState<number[] | null>(null);
  const [ids, setIds] = useState(splitIds);
  const setId = (x: string) => { setIdState(x); setShares(null); setTopN(null); };
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;
  // by party: each party's share of the list's elected members (else of its candidates) is the default assumption
  const defaults = useMemo(() => {
    if (!l || !byParty) return [];
    const seated = l.candidates.filter((c) => !c.notSeated).slice(0, lr?.seats ?? 0);
    const w = parties.map((p) => seated.filter((c) => c.partyId === p.id).length);
    const basis = w.some((x) => x > 0) ? w : parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
    const t = basis.reduce((a, b) => a + b, 0) || 1;
    return basis.map((x) => Math.round((x / t) * 1000) / 10);
  }, [l, byParty, parties, lr]);
  const pct = shares ?? defaults;
  const sumPct = Math.round(pct.reduce((a, b) => a + b, 0) * 10) / 10;
  const partyVotes = useMemo(() => (l && byParty && sumPct > 0 ? apportion(l.votes, pct.map((x) => Math.max(0, x))) : []), [l, byParty, pct, sumPct]);
  // a part takes its party's own colour; a party without one gets a variant of the list's colour that the chamber can tell apart
  const colours = useMemo(() => {
    if (!l) return [];
    const taken = seatColours(s, r, [l.id]);
    if (byParty) return partColours(parties.map((p) => p.color), l.color, taken);
    return [l.color, distinctColour(l.color, [...taken, l.color])];
  }, [s, r, l, byParty, parties]);
  const lead = l?.candidates.find((c) => c.partyId)?.partyId ?? parties[0]?.id;
  const unassigned = l && byParty ? l.candidates.filter((c) => !c.partyId || !parties.some((p) => p.id === c.partyId)).length : 0;
  const n = l ? Math.min(Math.max(0, topN ?? Math.ceil(l.candidates.length / 2)), l.candidates.length) : 0;
  const plainVotes = l ? Math.round((l.votes * shareA) / 100) : 0;
  const plainNames = useMemo(() => (l ? [[`${l.shortHe} א`, `${listLabel(l, 'en')} A`], [`${l.shortHe} ב`, `${listLabel(l, 'en')} B`]] : []), [l]);
  const actions: Action[] | null = useMemo(() => {
    if (!l) return null;
    if (byParty) {
      if (!partyVotes.length) return null;
      const parts = parties.map((p, i) => ({ newId: ids[i], nameHe: p.nameHe, letters: i === 0 ? l.letters : `${l.letters}${i + 1}`, color: colours[i], votes: partyVotes[i],
        candidateIds: l.candidates.filter((c) => (c.partyId && parties.some((x) => x.id === c.partyId) ? c.partyId : lead) === p.id).map((c) => c.id) }));
      return [{ type: 'split', id: l.id, parts }, ...parts.map((pt, i) => ({ type: 'setListMeta', listId: pt.newId, patch: { shortEn: parties[i].nameEn } }) as Action)];
    }
    const c = l.candidates;
    const [ca, cb] = mode === 'top' ? [c.slice(0, n), c.slice(n)] : [c.filter((_, i) => i % 2 === 0), c.filter((_, i) => i % 2 === 1)];
    return [{ type: 'split', id: l.id, parts: [
      { newId: ids[0], nameHe: plainNames[0][0], letters: l.letters, color: colours[0], votes: plainVotes, candidateIds: ca.map((x) => x.id) },
      { newId: ids[1], nameHe: plainNames[1][0], letters: `${l.letters}2`, color: colours[1], votes: l.votes - plainVotes, candidateIds: cb.map((x) => x.id) }] },
      { type: 'setListMeta', listId: ids[0], patch: { shortEn: plainNames[0][1] } }, { type: 'setListMeta', listId: ids[1], patch: { shortEn: plainNames[1][1] } }];
  }, [l, byParty, parties, partyVotes, colours, lead, mode, n, plainVotes, plainNames, ids]);
  const go = () => { if (actions && dispatchMany(actions)) { setId(''); setIds(splitIds()); focusApplied(); } };
  const name = (p: { nameHe: string; nameEn: string }) => (lang === 'he' ? p.nameHe : p.nameEn);
  return (
    <div className="st-task">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Choose a list to split', 'בחירת רשימה לפיצול')} <Info title={L('Split assumptions', 'הנחות הפיצול')}>{L('What if a list had run as separate lists? Joint lists split into their own parties; any other list splits in two. Each part must pass the threshold on its own, and the list’s surplus agreement is dropped. How its votes would have divided is an assumption you can see and change.', 'מה אילו רשימה הייתה רצה כרשימות נפרדות? רשימה משותפת מתפצלת למפלגותיה; כל רשימה אחרת — לשתיים. כל חלק צריך לעבור את אחוז החסימה בעצמו, והסכם העודפים של הרשימה מבוטל. חלוקת הקולות היא הנחה גלויה שאפשר לשנות.')}</Info></p>
      <ListPicker s={s} picked={id ? [id] : []} single onToggle={(x) => setId(id === x ? '' : x)} />
      {l && byParty && (
        <div className="st-options">
          <p className="small ink2 st-full" style={{ margin: 0 }}>{L('Assumed vote shares', 'חלוקת קולות משוערת')} <Info title={L('Vote shares', 'חלוקת הקולות')}>{L('Nobody knows how the joint list’s votes would have divided. By default each party gets its share of the list’s elected members (of its candidates if none was elected). Change the shares to try other assumptions.', 'איש אינו יודע כיצד היו מתחלקים קולות הרשימה המשותפת. כברירת מחדל כל מפלגה מקבלת את חלקה בנבחרי הרשימה (או במועמדיה, אם לא נבחר איש). שנו את החלוקה כדי לבדוק הנחות אחרות.')}</Info></p>
          <div className="st-full"><ShareBar parts={parties.map((p, i) => ({ key: p.id, color: colours[i], votes: partyVotes[i] ?? 0 }))} /></div>
          {parties.map((p, i) => (
            <div key={p.id} className="st-share st-full">
              <Slip letters={l.letters} name={name(p)} color={colours[i]} logo={p.logo} />
              <span style={{ minWidth: 0 }}>{name(p)}</span>
              <span className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
                <input type="number" min={0} max={100} step={0.1} value={pct[i]} style={{ width: 76 }} aria-label={L(`Vote share of ${p.nameEn} (%)`, `חלק הקולות של ${p.nameHe} (%)`)}
                  onChange={(e) => { const next = [...pct]; next[i] = Math.max(0, Number(e.target.value) || 0); setShares(next); }} />%</span>
              <span className="small muted tabnum">{L(`${fmtInt(partyVotes[i] ?? 0)} votes`, `${fmtInt(partyVotes[i] ?? 0)} קולות`)}</span>
            </div>
          ))}
          {sumPct === 0 ? <p className="small st-full" style={{ margin: 0, color: 'var(--warn-ink)' }}>{L('Give at least one party a share.', 'תנו לפחות למפלגה אחת חלק מהקולות.')}</p>
            : Math.abs(sumPct - 100) > 0.05 && <p className="small st-full" style={{ margin: 0, color: 'var(--warn-ink)' }}>{L(`The shares add up to ${sumPct}%; the votes are divided in these proportions.`, `החלקים מסתכמים ב־${sumPct}%; הקולות יחולקו ביחס הזה.`)}</p>}
          {(shares || unassigned > 0) && <div className="row st-full" style={{ gap: 8 }}>
            {shares && <button type="button" className="btn small ghost" onClick={() => setShares(null)}>{L('Reset shares', 'איפוס החלוקה')}</button>}
            {unassigned > 0 && <span className="tiny muted">{L(`${unassigned} candidates go with the lead party`, `${unassigned} מועמדים עם מפלגת הראש`)} <Info title={L('Candidate assignment', 'שיוך מועמדים')}>{L(`${unassigned} candidate(s) without a recorded party go with ${name(parties.find((p) => p.id === lead) ?? parties[0])} (the party of the list’s leader).`, `${unassigned} מועמדים שמפלגתם לא תועדה מצורפים ל${name(parties.find((p) => p.id === lead) ?? parties[0])} (מפלגת העומד בראש הרשימה).`)}</Info></span>}
          </div>}
        </div>
      )}
      {l && !byParty && (
        <div className="st-options">
          <label className="field">{L('Candidates', 'מועמדים')}
            <select value={mode} onChange={(e) => setMode(e.target.value as 'alternate' | 'top')}>
              <option value="top">{L('Cut at a rank', 'חיתוך במקום ברשימה')}</option>
              <option value="alternate">{L('Alternating ranks', 'מקומות לסירוגין')}</option>
            </select></label>
          {mode === 'top' && <label className="field">{L(`Candidates on ${plainNames[0][lang === 'he' ? 0 : 1]}`, `מועמדים ב${plainNames[0][0]}`)}<NumberInput value={n} onCommit={(v) => setTopN(Math.min(v, l.candidates.length))} label={L('Candidates on the first list', 'מועמדים ברשימה הראשונה')} width={90} /></label>}
          <label className="field st-full">{L('Vote share', 'חלוקת הקולות')}
            <input type="range" min={0} max={100} value={shareA} aria-label={L(`Vote share of ${plainNames[0][1]} (%)`, `חלק הקולות של ${plainNames[0][0]} (%)`)} onChange={(e) => setShareA(Number(e.target.value))} /></label>
          <div className="st-full"><ShareBar parts={[{ key: 'a', color: colours[0], votes: plainVotes }, { key: 'b', color: colours[1], votes: l.votes - plainVotes }]} /></div>
          {[plainVotes, l.votes - plainVotes].map((v, i) => (
            <span key={i} className="small st-eff"><span className="swatch" style={{ background: colours[i] }} /><bdi>{plainNames[i][lang === 'he' ? 0 : 1]}</bdi> <b className="tabnum">{pctOf(v, l.votes)}%</b> <span className="muted tabnum">{L(`${fmtInt(v)} votes`, `${fmtInt(v)} קולות`)}</span></span>
          ))}
        </div>
      )}
      <Preview s={s} r={r} actions={actions} />
      <button className="btn primary" disabled={!actions} onClick={go}>{l ? L('Split', 'פיצול') : L('Choose a list', 'בחרו רשימה')}</button>
    </div>
  );
}

function AddList({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const [nameHe, setName] = useState(''); const [letters, setLetters] = useState(''); const [votes, setVotes] = useState(0);
  const [pendingId, setPendingId] = useState(newId);
  // a colour the chamber can tell apart from every list already in it
  const color = useMemo(() => distinctColour('#5f9ea0', seatColours(s, r)), [s, r]);
  const name = nameHe.trim();
  const actions: Action[] | null = name ? [{ type: 'addList', newId: pendingId, nameHe: name, letters, color, votes },
    { type: 'setListMeta', listId: pendingId, patch: { shortEn: name } }] : null;
  const go = () => { if (actions && dispatchMany(actions)) { setName(''); setLetters(''); setVotes(0); setPendingId(newId()); focusApplied(); } };
  return (
    <div className="st-task">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('A new list, with new voters', 'רשימה חדשה, עם מצביעים חדשים')} <Info title={L('New lists', 'רשימות חדשות')}>{L('Its votes come from people who did not vote, so turnout rises and no other list loses votes; move votes to it later with the vote tools. It starts with no candidates; add them in the list panel (Expert).', 'קולותיה באים ממי שלא הצביעו, כך ששיעור ההצבעה עולה ואף רשימה אחרת אינה מאבדת קולות; אפשר להעביר אליה קולות אחר כך בכלי הקולות. היא מתחילה ללא מועמדים; הוסיפו אותם בחלונית הרשימה (מומחה).')}</Info></p>
      <div className="st-options">
        <label className="field">{L('New list name', 'שם הרשימה החדשה')}<input type="text" value={nameHe} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field">{L('New list letters', 'אותיות הרשימה החדשה')}<input type="text" value={letters} onChange={(e) => setLetters(e.target.value)} /></label>
        <label className="field">{L('Votes', 'קולות')}<NumberInput value={votes} onCommit={setVotes} label={L('Votes', 'קולות')} /></label>
      </div>
      <Preview s={s} r={r} actions={actions} />
      <button className="btn primary" disabled={!actions} onClick={go}>{L('Add list', 'הוספה')}</button>
    </div>
  );
}
