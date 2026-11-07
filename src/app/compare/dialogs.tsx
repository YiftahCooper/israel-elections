// Compare's dialogs: the copy question, whole-list replacement, list matching, a side's vote editor, the phone row sheet
// and saving a comparison. Every figure shown before committing is the engine's, computed on a scratch copy.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { useLevel, useStore } from '../store.ts';
import { deltaAction, voteSourceLabel, type SourceChoice } from '../voteEdit.ts';
import { sourceChoice, sourceValue } from '../preferences.ts';
import { Info, Slip } from '../components/ui.tsx';
import { SeatDelta } from '../components/SeatDelta.tsx';
import { COPY_MODE_DEFAULT, planVotes, planWholeList, type CopyMode, type CopyUnit, type Plan } from './copy.ts';
import { remember } from './answers.ts';
import { sharedCandidates, type MatchOverride, type MatchRow, type MatchTag } from './match.ts';
import { cellsOf, sourceOf, type SideModel } from './model.ts';
import { partyLabel } from '../../families/registry.ts';

type L = (en: string, he: string) => string;
export const TAGS: Record<MatchTag, [string, string]> = {
  same: ['Same', 'אותה'], renamed: ['Renamed', 'שם חדש'], joined: ['Joined', 'הצטרפה'], merged: ['Merged', 'אוחדו'], split: ['Split', 'פוצלה'],
  new: ['New', 'חדשה'], ended: ['Ended', 'הסתיימה'], check: ['Check', 'לבדיקה'], yours: ['Yours', 'שלכם'],
};
export const TAG_INFO: Record<MatchTag, [string, string]> = {
  same: ['The same party ran, alone or leading the list (party registry).', 'אותה מפלגה התמודדה, לבדה או בראש הרשימה (מרשם המפלגות).'],
  renamed: ['The party is unchanged but renamed (documented lineage).', 'המפלגה לא השתנתה אך שינתה את שמה (שושלת מתועדת).'],
  joined: ['The party now runs inside a joint list led by another party (party registry).', 'המפלגה רצה כעת בתוך רשימה משותפת בראשות מפלגה אחרת (מרשם המפלגות).'],
  merged: ['Several lists are one list now (shared constituent parties or documented lineage).', 'כמה רשימות הן כעת רשימה אחת (מפלגות משותפות או שושלת מתועדת).'],
  split: ['Its parties now run on several lists. Its votes cannot be divided by list.', 'מפלגותיה רצות כעת בכמה רשימות. אין לחלק את קולותיה לפי רשימה.'],
  new: ['No sourced predecessor. Lists are never matched by name, letters or rank.', 'אין קודמת מתועדת. רשימות אינן מותאמות לפי שם, אותיות או דירוג.'],
  ended: ['No sourced successor.', 'אין ממשיכה מתועדת.'],
  check: ['A relation that was announced but is not confirmed. Accept it to copy along it.', 'קשר שהוכרז אך לא אושר. אשרו אותו כדי להעתיק לפיו.'],
  yours: ['Paired by you, for this comparison only.', 'הותאם על ידיכם, להשוואה זו בלבד.'],
};
export const tagText = (t: MatchTag, L: L) => L(...TAGS[t]);

/** A modal dialog that keeps focus and closes on Escape or the backdrop. */
export function Modal({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); return () => { if (d?.open) d.close(); }; }, []);
  return <dialog ref={ref} className={`cmp-dialog ${className}`} aria-label={label} onCancel={(e) => { e.preventDefault(); onClose(); }}
    onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>{children}</dialog>;
}

const listName = (x: SideModel, ids: string[], lang: 'he' | 'en') => ids.map((id) => { const l = x.sc.lists.find((y) => y.id === id); return l ? listLabel(l, lang) : id; }).join(' + ');

/** The balance choice: the app's own vote-source question and labels. */
export function SourceSelect({ dest, exclude, value, onChange, label }: { dest: Scenario; exclude: string[]; value: SourceChoice; onChange: (v: SourceChoice) => void; label: string }) {
  const L = useL(), lang = useLang();
  const others = dest.lists.filter((l) => !exclude.includes(l.id) && !l.withdrawn).sort((a, b) => b.votes - a.votes);
  return <label className="field">{label}
    <select aria-label={label} value={sourceValue(value)} onChange={(e) => onChange(sourceChoice(e.target.value))}>
      <option value="proportional">{L('Other lists, proportionally', 'שאר הרשימות, באופן יחסי')}</option>
      <option value="new">{L('New voters / staying home', 'מצביעים חדשים / נמנעים')}</option>
      <optgroup label={L('One list', 'רשימה אחת')}>{others.map((l) => <option key={l.id} value={`t:${l.id}`}>{listLabel(l, lang)}</option>)}</optgroup>
    </select>
  </label>;
}

/** What a plan does to the destination, in seats: "Likud 27 → 30 ▲ +3 · Yashar! 21 → 19 ▼ −2". */
function Outcome({ plan, to, focus }: { plan: Plan; to: SideModel; focus?: string[] }) {
  const L = useL(), lang = useLang();
  if (!plan.ok) return <span className="cmp-refused">{lang === 'he' ? plan.reason.he : plan.reason.en}</span>;
  const after = allocationOf(plan.result);
  const changed = plan.result.lists.map((l) => ({ l, a: to.r.lists.find((x) => x.id === l.id)?.seats ?? 0, b: after.lists.find((x) => x.id === l.id)?.seats ?? 0 }))
    .filter((x) => x.a !== x.b || focus?.includes(x.l.id)).sort((x, y) => Number(focus?.includes(y.l.id)) - Number(focus?.includes(x.l.id)) || Math.abs(y.b - y.a) - Math.abs(x.b - x.a));
  return <span className="cmp-outcome">{changed.length ? changed.slice(0, 4).map(({ l, a, b }) => <span key={l.id}><bdi>{listLabel(l, lang)}</bdi> <bdi dir="ltr">{a} → {b}</bdi> {a !== b && <SeatDelta value={b - a} />}</span>) : L('Seats unchanged', 'המנדטים ללא שינוי')}
    {plan.capped !== undefined && <span className="cmp-capped">{L(`Capped at ${fmtInt(plan.capped)} voters staying home`, `מוגבל ל־${fmtInt(plan.capped)} הנמנעים`)}</span>}</span>;
}

export interface CopyRequest { from: SideModel; to: SideModel; units: CopyUnit[]; title: string; cross: boolean; direct?: { mode: CopyMode; source: SourceChoice } }

/** The copy question at the point of use: copy as share, count or change, and where the balance comes from. */
export function CopyVotesDialog({ req, onClose, onDone }: { req: CopyRequest; onClose: () => void; onDone: (plan: Plan & { ok: true }, req: CopyRequest) => void }) {
  const L = useL(), { expert } = useLevel();
  const voteSource = useStore((st) => st.voteSource);
  const one = req.units.length === 1 && req.units[0].dst.length === 1 ? req.units[0].dst[0] : null;
  const dst = req.units.flatMap((u) => u.dst);
  const [mode, setMode] = useState<CopyMode>(req.cross ? COPY_MODE_DEFAULT : 'count');
  const [source, setSource] = useState<SourceChoice>(voteSource.kind === 'transfer' && dst.includes(voteSource.listId) ? { kind: 'proportional' } : voteSource);
  const [scope, setScope] = useState<'once' | 'item' | 'always'>('once');
  const changed = req.units.some((u) => u.src.some((id) => JSON.stringify(req.from.sc.lists.find((l) => l.id === id)?.votes) !== JSON.stringify(req.from.start.lists.find((l) => l.id === id)?.votes)));
  const modes: CopyMode[] = req.cross ? ['share', 'count', ...(expert && changed ? ['change' as const] : [])] : ['count', ...(expert && changed ? ['change' as const] : [])];
  const plans = useMemo(() => Object.fromEntries(modes.map((m) => [m, planVotes({ from: sourceOf(req.from), to: req.to.sc, ctx: { base: req.to.start }, units: req.units, mode: m, policy: source })])) as Record<CopyMode, Plan>, [mode, source, req]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = plans[mode];
  const modeText: Record<CopyMode, [string, string]> = { share: ['Share of the vote', 'שיעור מהקולות'], count: ['Number of votes', 'מספר הקולות'], change: ['Change since its start', 'השינוי מאז נקודת ההתחלה'] };
  const target = (p: Plan) => p.ok ? p.targets.reduce((t, x) => t + x.after, 0) : null;
  return <Modal label={req.title} onClose={onClose} className="cmp-ask">
    <form onSubmit={(e) => { e.preventDefault(); if (!plan?.ok) return; remember(req.to.sc, one, req.cross, mode, source, scope); onDone(plan, req); }}>
      <p className="cmp-ask-title"><b>{req.title}</b> <Info title={L('Copying votes', 'העתקת קולות')}>{L('Share keeps the list’s strength: its share of all valid votes. Count copies the number of votes, so a larger or smaller electorate changes its strength. Seats are always recalculated.', 'שיעור שומר על כוח הרשימה: חלקה מכלל הקולות הכשרים. מספר מעתיק את מספר הקולות, ולכן ציבור בוחרים גדול או קטן יותר משנה את כוחה. המנדטים תמיד מחושבים מחדש.')}</Info></p>
      <fieldset className="cmp-modes"><legend>{L('Copy as', 'העתקה לפי')}</legend>
        {modes.map((m) => { const p = plans[m], n = target(p); return <label key={m} className={`cmp-mode ${p.ok ? '' : 'refused'}`}>
          <input type="radio" name="cmp-mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
          <span><b>{L(...modeText[m])}</b>{p.ok && n !== null && <span className="muted"> · <bdi dir="ltr">{fmtInt(n)}</bdi> {L('votes', 'קולות')}{m === 'share' && p.ok && (p.action as { provenance?: { value?: string } }).provenance?.value ? <> · <bdi dir="ltr">{(p.action as { provenance: { value?: string } }).provenance.value}</bdi></> : null}</span>}
            <br /><Outcome plan={p} to={req.to} focus={dst} /></span>
        </label>; })}
      </fieldset>
      <SourceSelect dest={req.to.sc} exclude={dst} value={source} onChange={setSource} label={L('Balance with', 'איזון מול')} />
      <fieldset className="preference-scope"><legend>{L('Use this choice', 'שימוש בבחירה')}</legend>
        {([['once', L('Just this once', 'רק הפעם')], ...(one ? [['item', L('For this list', 'לרשימה זו')]] : []), ['always', L('Always', 'תמיד')]] as [typeof scope, string][]).map(([v, t]) =>
          <label key={v}><input type="radio" name="cmp-scope" value={v} checked={scope === v} onChange={() => setScope(v)} />{t}</label>)}
      </fieldset>
      <p className="tiny muted">{L('Manage answers in Your settings.', 'ניהול התשובות בהגדרות שלכם.')}</p>
      <div className="row"><button type="submit" className="btn small primary" disabled={!plan?.ok}>{L(`Copy to ${req.to.year}`, `העתקה ל־${req.to.year}`)}</button><button type="button" className="btn small ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button></div>
    </form>
  </Modal>;
}

export interface WholeRequest { from: SideModel; to: SideModel; srcId: string; dstId: string | null; cross: boolean }
/** Replace a list with the other side's list, or add it beside the existing lists (the Likud example). */
export function WholeListDialog({ req, onClose, onDone }: { req: WholeRequest; onClose: () => void; onDone: (plan: Plan & { ok: true }, text: string) => void }) {
  const L = useL(), lang = useLang();
  const voteSource = useStore((st) => st.voteSource);
  const [opts, setOpts] = useState({ votes: true, candidates: true, identity: false, appearance: false });
  const [mode, setMode] = useState<CopyMode>(req.cross ? COPY_MODE_DEFAULT : 'count');
  const [source, setSource] = useState<SourceChoice>(voteSource.kind === 'transfer' && voteSource.listId === req.dstId ? { kind: 'proportional' } : voteSource);
  const [adding, setAdding] = useState(req.dstId === null);
  const src = req.from.sc.lists.find((l) => l.id === req.srcId)!, dst = req.dstId ? req.to.sc.lists.find((l) => l.id === req.dstId) : undefined;
  const plan = useMemo(() => planWholeList({ from: sourceOf(req.from), to: req.to.sc, ctx: { base: req.to.start }, srcId: req.srcId, dstId: adding ? null : req.dstId, opts: { ...opts, mode, policy: source } }), [req, opts, mode, source, adding]);
  const elected = (sc: Scenario) => { const r = allocationOf(sc); return new Map(sc.lists.flatMap((l) => electedOf(l, r.lists.find((x) => x.id === l.id)?.seats ?? 0).map((c) => [c.bio?.knesset ?? c.id, c] as const))); };
  const people = plan.ok ? (() => { const a = elected(req.to.sc), b = elected(plan.result); return { entering: [...b.keys()].filter((k) => !a.has(k)).length, leaving: [...a.keys()].filter((k) => !b.has(k)).length }; })() : null;
  const box = (k: keyof typeof opts, label: string, locked = false) => <label><input type="checkbox" checked={opts[k] || locked} disabled={locked || adding && k !== 'votes'} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />{label}</label>;
  return <Modal label={L('Whole list', 'הרשימה כולה')} onClose={onClose} className="cmp-whole">
    <div className="cmp-whole-head"><Slip {...src} name={listLabel(src, lang)} size="sm" /><b><bdi>{listLabel(src, lang)}</bdi></b><span className="muted">{req.from.year}</span><span aria-hidden>{req.from === req.to ? '' : '→'}</span>
      {dst && !adding ? <><Slip {...dst} name={listLabel(dst, lang)} size="sm" /><b><bdi>{listLabel(dst, lang)}</bdi></b><span className="muted">{req.to.year}</span></> : <b>{L(`New list in ${req.to.year}`, `רשימה חדשה ב־${req.to.year}`)}</b>}</div>
    <fieldset className="cmp-takes"><legend>{L(`Take from ${req.from.year}`, `לקחת מ־${req.from.year}`)}</legend>
      {box('votes', L('Votes', 'קולות'))}{box('candidates', L('Candidates', 'מועמדים'), adding)}<label><input type="checkbox" checked={opts.candidates || adding} disabled />{L('Constituent parties (follow the candidates)', 'המפלגות המרכיבות (לפי המועמדים)')}</label>
      {!adding && box('identity', L('Name and letters', 'שם ואותיות'))}{!adding && box('appearance', L('Colour', 'צבע'))}
    </fieldset>
    {opts.votes && <div className="row cmp-whole-votes">
      {req.cross && <label className="field">{L('Votes as', 'קולות לפי')}<select value={mode} onChange={(e) => setMode(e.target.value as CopyMode)}><option value="share">{L('Share of the vote', 'שיעור מהקולות')}</option><option value="count">{L('Number of votes', 'מספר הקולות')}</option></select></label>}
      <SourceSelect dest={req.to.sc} exclude={req.dstId ? [req.dstId] : []} value={source} onChange={setSource} label={L('Balance with', 'איזון מול')} />
    </div>}
    {!adding && <p className="small muted">{L(`Kept from ${req.to.year}: rules, agreements, bloc and coalition.`, `נשמרים מ־${req.to.year}: הכללים, ההסכמים, הגוש והקואליציה.`)}</p>}
    <p className="small"><b>{L(`Result in ${req.to.year}:`, `התוצאה ב־${req.to.year}:`)}</b> <Outcome plan={plan} to={req.to} focus={req.dstId ? [req.dstId] : []} />
      {people && <span className="muted"> · {L(`Entering ${people.entering}, leaving ${people.leaving}`, `נכנסים ${people.entering}, יוצאים ${people.leaving}`)}</span>}</p>
    <div className="row">
      {!adding && <button type="button" className="btn small primary" disabled={!plan.ok} onClick={() => plan.ok && onDone(plan, L(`${listLabel(src, 'en')} ${req.from.year} replaced ${dst ? listLabel(dst, 'en') : ''} in ${req.to.year}`, `${listLabel(src, 'he')} ${req.from.year} החליפה את ${dst ? listLabel(dst, 'he') : ''} ב־${req.to.year}`))}>{L('Replace', 'החלפה')}</button>}
      {adding ? <button type="button" className="btn small primary" disabled={!plan.ok} onClick={() => plan.ok && onDone(plan, L(`${listLabel(src, 'en')} ${req.from.year} added to ${req.to.year}`, `${listLabel(src, 'he')} ${req.from.year} נוספה ל־${req.to.year}`))}>{L('Add as a new list', 'הוספה כרשימה חדשה')}</button>
        : <button type="button" className="btn small" onClick={() => setAdding(true)}>{L('Add as a new list instead', 'הוספה כרשימה חדשה במקום')}</button>}
      <button type="button" className="btn small ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button>
    </div>
  </Modal>;
}

/** A side's votes for one list, balanced by the app's vote-source choice (an ordinary vote edit on that side). */
export function VotesEditor({ side, listId, onClose }: { side: SideModel; listId: string; onClose: () => void }) {
  const L = useL(), lang = useLang();
  const voteSource = useStore((st) => st.voteSource);
  const l = side.sc.lists.find((x) => x.id === listId)!;
  const [text, setText] = useState(String(l.votes));
  const [source, setSource] = useState<SourceChoice>(voteSource.kind === 'transfer' && voteSource.listId === listId ? { kind: 'proportional' } : voteSource);
  const n = /^\d+$/.test(text.replace(/[,\s]/g, '')) ? Number(text.replace(/[,\s]/g, '')) : null;
  const action = n === null ? null : deltaAction(side.sc, l, n - l.votes, source);
  const label = L(`Votes for ${listLabel(l, 'en')} (${side.year})`, `קולות ל${listLabel(l, 'he')} (${side.year})`);
  return <Modal label={label} onClose={onClose} className="cmp-ask">
    <form onSubmit={(e) => { e.preventDefault(); if (action && side.apply(action)) onClose(); }}>
      <p className="cmp-ask-title"><b>{label}</b></p>
      <label className="field">{L('Votes', 'קולות')}<input inputMode="numeric" autoFocus value={text} onChange={(e) => setText(e.target.value)} aria-label={label} /></label>
      {l.withdrawn && <p className="small cmp-refused">{L('This list withdrew; reinstate it in its list panel first.', 'רשימה זו פרשה; החזירו אותה תחילה בחלונית הרשימה.')}</p>}
      <SourceSelect dest={side.sc} exclude={[listId]} value={source} onChange={setSource} label={L('Balance with', 'איזון מול')} />
      <p className="tiny muted">{voteSourceLabel(source, side.sc, lang)}</p>
      <div className="row"><button type="submit" className="btn small primary" disabled={!action || l.withdrawn}>{L('Apply', 'החלה')}</button><button type="button" className="btn small ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button></div>
    </form>
  </Modal>;
}

const reasonText = (row: MatchRow, L: L, lang: 'he' | 'en') => {
  const r = row.reason;
  if (r.kind === 'leading-party') return L(`Same leading party: ${partyLabel(r.partyId, 'en')}`, `אותה מפלגה מובילה: ${partyLabel(r.partyId, 'he')}`);
  if (r.kind === 'constituent') return L(`Shared party: ${r.partyIds.map((p) => partyLabel(p, 'en')).join(', ')}`, `מפלגה משותפת: ${r.partyIds.map((p) => partyLabel(p, 'he')).join(', ')}`);
  if (r.kind === 'lineage') return L(`Documented lineage (${r.relation})`, `שושלת מתועדת (${r.relation})`);
  if (r.kind === 'pending') return L('Announced merger, not legally completed', 'איחוד שהוכרז, טרם הושלם כחוק');
  if (r.kind === 'origin') return L('Same origin in this election', 'אותו מקור בבחירות אלה');
  if (r.kind === 'user') return L('Paired by you', 'הותאם על ידיכם');
  return lang === 'he' ? 'אין קשר מתועד' : 'No sourced relation';
};

/** Every pairing with its tag and reason; Check pairs can be accepted, unmatched lists mapped by hand. */
export function MatchingPanel({ rows, left, right, overrides, setOverrides, onClose }: { rows: MatchRow[]; left: SideModel; right: SideModel; overrides: MatchOverride[]; setOverrides: (o: MatchOverride[]) => void; onClose: () => void }) {
  const L = useL(), lang = useLang();
  const [filter, setFilter] = useState<'all' | 'check' | 'unmatched'>(rows.some((r) => r.tag === 'check') ? 'check' : 'all');
  const [mapping, setMapping] = useState<string | null>(null);
  const shown = rows.filter((r) => filter === 'all' ? true : filter === 'check' ? r.tag === 'check' : r.tag === 'new' || r.tag === 'ended');
  const name = (x: SideModel, ids: string[]) => ids.length ? listName(x, ids, lang) : '—';
  const without = (pred: (o: MatchOverride) => boolean) => overrides.filter((o) => !pred(o));
  return <Modal label={L('Matching', 'התאמת רשימות')} onClose={onClose} className="cmp-matching">
    <div className="choice-head"><b>{L('Matching', 'התאמת רשימות')}</b> <Info title={L('How lists are matched', 'כיצד רשימות מותאמות')}>{L('From the party registry and documented lineage only: the leading party, shared constituent parties, renames, mergers and splits. Never by name, ballot letters or rank. Your pairings stay with this comparison and never change a result.', 'רק לפי מרשם המפלגות והשושלת המתועדת: המפלגה המובילה, מפלגות מרכיבות משותפות, שינויי שם, איחודים ופיצולים. לעולם לא לפי שם, אותיות או דירוג. ההתאמות שלכם נשמרות להשוואה זו בלבד ואינן משנות תוצאה.')}</Info><button className="btn" aria-label={L('Close', 'סגירה')} onClick={onClose}>×</button></div>
    <div className="seg-row" role="group" aria-label={L('Show', 'הצגה')}>{([['all', L('All', 'הכול')], ['check', L('To check', 'לבדיקה')], ['unmatched', L('Unmatched', 'ללא התאמה')]] as const).map(([v, t]) =>
      <button key={v} type="button" className={`btn small ${filter === v ? 'primary' : ''}`} aria-pressed={filter === v} onClick={() => setFilter(v)}>{t}</button>)}</div>
    <ul className="cmp-match-list">{shown.map((row) => <li key={row.key}>
      <div className="row cmp-match-names" dir="ltr"><bdi>{row.inLeft ? L(`in ${name(left, [row.inLeft])}`, `בתוך ${name(left, [row.inLeft])}`) : name(left, row.left)}</bdi><span aria-hidden>→</span><bdi>{name(right, row.right)}</bdi>
        <span className={`cmp-tag tag-${row.tag}`}>{tagText(row.tag, L)}</span></div>
      <div className="small muted">{reasonText(row, L, lang)}{row.check?.length ? ` · ${L('to check', 'לבדיקה')}: ${name(left, row.check)}` : ''}</div>
      <div className="row cmp-match-actions">
        {row.tag === 'check' && row.check?.map((id) => <span key={id} className="row">
          <button type="button" className="btn small" onClick={() => setOverrides([...without((o) => o.left === id), { left: id, right: row.right[0], status: 'accepted' }])}>{L(`Accept ${name(left, [id])}`, `אישור ${name(left, [id])}`)}</button>
          <button type="button" className="btn small ghost" onClick={() => setOverrides([...without((o) => o.left === id), { left: id, right: row.right[0], status: 'rejected' }])}>{L('No match', 'אין התאמה')}</button></span>)}
        {(row.tag === 'yours' || overrides.some((o) => row.left.includes(o.left) && row.right.includes(o.right ?? ''))) && <button type="button" className="btn small ghost" onClick={() => setOverrides(without((o) => row.left.includes(o.left) || row.right.includes(o.right ?? '')))}>{L('Undo my pairing', 'ביטול ההתאמה שלי')}</button>}
        {(row.tag === 'new' || row.tag === 'ended') && <button type="button" className="btn small" aria-expanded={mapping === row.key} onClick={() => setMapping(mapping === row.key ? null : row.key)}>{L('Map to…', 'התאמה ל…')}</button>}
      </div>
      {mapping === row.key && <MapTo row={row} left={left} right={right} onPick={(other) => { setOverrides([...overrides, row.tag === 'ended' ? { left: row.left[0], right: other, status: 'user' } : { left: other, right: row.right[0], status: 'user' }]); setMapping(null); }} />}
    </li>)}{!shown.length && <li className="muted small">{L('Nothing here.', 'אין כאן דבר.')}</li>}</ul>
  </Modal>;
}

/** Suggestions ranked by shared candidates (Knesset member id), labelled by count and never asserted. */
function MapTo({ row, left, right, onPick }: { row: MatchRow; left: SideModel; right: SideModel; onPick: (id: string) => void }) {
  const L = useL(), lang = useLang();
  const [q, setQ] = useState('');
  const mine = row.tag === 'ended' ? left.sc.lists.find((l) => l.id === row.left[0])! : right.sc.lists.find((l) => l.id === row.right[0])!;
  const other = row.tag === 'ended' ? right : left;
  const ranked = other.sc.lists.map((l) => ({ l, n: sharedCandidates(mine, l) })).filter((x) => x.l.votes > 0 || x.n > 0)
    .filter((x) => !q || `${x.l.nameHe} ${x.l.shortHe} ${x.l.shortEn ?? ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.n - a.n || b.l.votes - a.l.votes).slice(0, 12);
  return <div className="cmp-mapto">
    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Find a list…', 'חיפוש רשימה…')} aria-label={L('Find a list', 'חיפוש רשימה')} />
    <ul>{ranked.map(({ l, n }) => <li key={l.id}><button type="button" className="btn small ghost" onClick={() => onPick(l.id)}><Slip {...l} name={listLabel(l, lang)} size="sm" /> <bdi>{listLabel(l, lang)}</bdi>
      {n > 0 && <span className="muted"> · {L(`${n} shared candidates`, `${n} מועמדים משותפים`)}</span>}</button></li>)}</ul>
  </div>;
}

/** Phone: one row's figures on both sides and big copy buttons with their outcomes. */
export function RowSheet({ row, left, right, onClose, actions }: { row: MatchRow; left: SideModel; right: SideModel; onClose: () => void; actions: ReactNode }) {
  const L = useL(), lang = useLang();
  const side = (x: SideModel, ids: string[]) => { const c = cellsOf(x, ids); return <div className="cmp-sheet-side">
    <span className="muted small">{x.year} · {x.name}</span>
    <b><bdi>{c ? listName(x, ids, lang) : row.inLeft && x === left ? L(`in ${listName(left, [row.inLeft], 'en')}`, `בתוך ${listName(left, [row.inLeft], 'he')}`) : '—'}</bdi></b>
    {c && <span className="small"><bdi dir="ltr">{fmtInt(c.votes)}</bdi> {L('votes', 'קולות')} · <bdi dir="ltr">{fmtPct(c.votes, c.total)}</bdi> · <b>{c.seats}</b> {L('seats', 'מנדטים')}</span>}
  </div>; };
  return <Modal label={L('List details', 'פרטי הרשימה')} onClose={onClose} className="cmp-sheet">
    <div className="choice-head"><span className={`cmp-tag tag-${row.tag}`}>{tagText(row.tag, L)}</span><button className="btn" aria-label={L('Close', 'סגירה')} onClick={onClose}>×</button></div>
    <div className="cmp-sheet-sides" dir="ltr">{side(left, row.left)}{side(right, row.right)}</div>
    <div className="cmp-sheet-actions">{actions}</div>
  </Modal>;
}

export function SaveDialog({ onSave, onClose, suggested }: { onSave: (name: string) => void; onClose: () => void; suggested: string }) {
  const L = useL();
  const [name, setName] = useState(suggested);
  return <Modal label={L('Save comparison', 'שמירת ההשוואה')} onClose={onClose} className="cmp-ask">
    <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
      <p className="cmp-ask-title"><b>{L('Save comparison', 'שמירת ההשוואה')}</b> <Info title={L('Saved comparisons', 'השוואות שמורות')}>{L('Keeps both sides with their changes and your pairings, in this browser. Reopen it from Compare.', 'שומר את שני הצדדים עם השינויים שלהם ואת ההתאמות שלכם, בדפדפן זה. אפשר לפתוח מחדש מתוך ההשוואה.')}</Info></p>
      <label className="field">{L('Name', 'שם')}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="row"><button type="submit" className="btn small primary" disabled={!name.trim()}>{L('Save', 'שמירה')}</button><button type="button" className="btn small ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button></div>
    </form>
  </Modal>;
}
export type { SimList };
