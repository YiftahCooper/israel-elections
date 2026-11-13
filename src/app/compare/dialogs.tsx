import { percent } from '../components/Percentage.tsx';
import { hebrewPrefixName } from '../hebrewPrefix.ts';
// Compare's dialogs: the copy question, whole-list replacement, list matching, a side's vote editor, the phone row sheet
// and saving a comparison. Every figure shown before committing is the engine's, computed on a scratch copy.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { allocationOf, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { useDigits, useStore } from '../store.ts';
import { deltaAction, voteSourceLabel, type SourceChoice } from '../voteEdit.ts';
import { sourceChoice, sourceValue } from '../preferences.ts';
import { Info, Slip } from '../components/ui.tsx';
import { SeatDelta } from '../components/SeatDelta.tsx';
import { COPY_MODE_DEFAULT, duplicatePeople, isDefaultCopyMode, planRoster, planWholeList, type CopyMode, type Plan, type Removal } from './copy.ts';
import { CandidateName } from '../components/CandidateName.tsx';
import { inOf, personKey, sharedCandidates, type MatchOverride, type MatchRow, type MatchTag } from './match.ts';
import { cellsOf, sourceOf, type SideModel } from './model.ts';
import { partyLabel } from '../../families/registry.ts';
import { CertChip, CERT_INFO, countedText, EvidenceLinks, eventText, relationYear, useCrossComparison } from '../components/PartyHistory.tsx';
import type { Comparison } from '../../history/compare.ts';
import { RELATIONS } from '../../history/relations.ts';
import { openModal } from '../focusReturn.ts';

type L = (en: string, he: string) => string;
export const TAGS: Record<MatchTag, [string, string]> = {
  same: ['Same', 'אותה'], renamed: ['Renamed', 'שם חדש'], joined: ['Joined', 'הצטרפה'], 'ran-jointly': ['Ran jointly', 'רצו יחד'], merged: ['Merged', 'אוחדו'], split: ['Split', 'פוצלה'],
  new: ['New', 'חדשה'], ended: ['Ended', 'הסתיימה'], check: ['Check', 'לבדיקה'], yours: ['Yours', 'שלכם'],
};
export const TAG_INFO: Record<MatchTag, [string, string]> = {
  same: ['The same party ran, alone or leading the list (party registry).', 'אותה מפלגה התמודדה, לבדה או בראש הרשימה (מרשם המפלגות).'],
  renamed: ['The same party under a new name (recorded rename).', 'אותה מפלגה בשם חדש (שינוי שם מתועד).'],
  joined: ['The party now runs inside a joint list led by another party (party registry).', 'המפלגה רצה כעת בתוך רשימה משותפת בראשות מפלגה אחרת (מרשם המפלגות).'],
  'ran-jointly': ['Several parties shared one list at this election; they did not merge (party registry).', 'כמה מפלגות התמודדו ברשימה אחת בבחירות אלה; הן לא התאחדו (מרשם המפלגות).'],
  merged: ['Parties merged into one party (recorded merger).', 'מפלגות התאחדו למפלגה אחת (איחוד מתועד).'],
  split: ['Its parties now run on several lists. Its votes cannot be divided by list.', 'מפלגותיה רצות כעת בכמה רשימות. אין לחלק את קולותיה לפי רשימה.'],
  new: ['No sourced predecessor. Lists are never matched by name, letters or rank.', 'אין קודמת מתועדת. רשימות אינן מותאמות לפי שם, אותיות או דירוג.'],
  ended: ['No sourced successor.', 'אין ממשיכה מתועדת.'],
  check: ['A recorded link that is not yet established (To verify). Accept it to copy along it.', 'קשר מתועד שטרם אומת (לבדיקה). אשרו אותו כדי להעתיק לפיו.'],
  yours: ['Paired by you, for this comparison only.', 'הותאם על ידיכם, להשוואה זו בלבד.'],
};
export const tagText = (t: MatchTag, L: L) => L(...TAGS[t]);

/** A modal dialog that keeps focus and closes on Escape or the backdrop. */
export function Modal({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  // closing gives focus back to what opened it
  useEffect(() => openModal(ref.current), []);
  return <dialog ref={ref} className={`cmp-dialog ${className}`} aria-label={label} onCancel={(e) => { e.preventDefault(); onClose(); }}
    onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>{children}</dialog>;
}

const listName = (x: SideModel, ids: string[], lang: 'he' | 'en') => ids.map((id) => { const l = x.sc.lists.find((y) => y.id === id); return l ? listLabel(l, lang) : id; }).join(' + ');

/** The balance choice: the app's own vote-source question and labels. */
/** info: what the chosen source does, behind an (i) on the label */
export function SourceSelect({ dest, exclude, value, onChange, label, info }: { dest: Scenario; exclude: string[]; value: SourceChoice; onChange: (v: SourceChoice) => void; label: string; info?: ReactNode }) {
  const L = useL(), lang = useLang();
  const others = dest.lists.filter((l) => !exclude.includes(l.id) && !l.withdrawn).sort((a, b) => b.votes - a.votes);
  // the words name and focus the drop-down; the (i) stays a button of its own, outside the <label>
  const id = useId();
  return <div className="field"><span><label htmlFor={id}>{label}</label>{info && <> {info}</>}</span>
    <select id={id} value={sourceValue(value)} onChange={(e) => onChange(sourceChoice(e.target.value))}>
      <option value="proportional">{L('Other lists, proportionally', 'שאר הרשימות, באופן יחסי')}</option>
      <option value="new">{L('New voters / staying home', 'מצביעים חדשים / מי שלא הצביעו')}</option>
      <optgroup label={L('One list', 'רשימה אחת')}>{others.map((l) => <option key={l.id} value={`t:${l.id}`}>{listLabel(l, lang)}</option>)}</optgroup>
    </select>
  </div>;
}

/** What a plan does to the destination, in seats: "Likud 27 → 30 ▲ +3 · Yashar! 21 → 19 ▼ −2". */
export function Outcome({ plan, to, focus }: { plan: Plan; to: SideModel; focus?: string[] }) {
  const L = useL(), lang = useLang();
  if (!plan.ok) return <span className="cmp-refused">{lang === 'he' ? plan.reason.he : plan.reason.en}</span>;
  const after = allocationOf(plan.result);
  const changed = plan.result.lists.map((l) => ({ l, a: to.r.lists.find((x) => x.id === l.id)?.seats ?? 0, b: after.lists.find((x) => x.id === l.id)?.seats ?? 0 }))
    .filter((x) => x.a !== x.b || focus?.includes(x.l.id)).sort((x, y) => Number(focus?.includes(y.l.id)) - Number(focus?.includes(x.l.id)) || Math.abs(y.b - y.a) - Math.abs(x.b - x.a));
  return <span className="cmp-outcome">{changed.length ? changed.slice(0, 4).map(({ l, a, b }) => <span key={l.id}><bdi>{listLabel(l, lang)}</bdi> <bdi dir="ltr">{a} → {b}</bdi> {a !== b && <SeatDelta value={b - a} />}</span>) : L('Seats unchanged', 'המנדטים ללא שינוי')}
    {plan.capped !== undefined && <span className="cmp-capped">{L(`Capped at ${fmtInt(plan.capped)} voters staying home`, `מוגבל ל־${fmtInt(plan.capped)} שלא הצביעו`)}</span>}</span>;
}

/** candidatesOnly: the Candidates copy, asked here only when it would put someone on two lists */
export interface WholeRequest { from: SideModel; to: SideModel; srcId: string; dstId: string | null; cross: boolean; candidatesOnly?: boolean }
/** Replace a list with the other side's list, or add it beside the existing lists (the Likud example). */
export function WholeListDialog({ req, onClose, onDone }: { req: WholeRequest; onClose: () => void; onDone: (plan: Plan & { ok: true }, text: string) => void }) {
  const L = useL(), lang = useLang();
  const voteSource = useStore((st) => st.voteSource);
  const only = !!req.candidatesOnly;
  const [opts, setOpts] = useState({ votes: !only, candidates: true, identity: false, appearance: false });
  const [remove, setRemove] = useState<Removal[]>([]);
  const savedMode = useStore((st) => st.preferences.copyMode);
  const [mode, setMode] = useState<CopyMode>(req.cross ? (isDefaultCopyMode(savedMode) ? savedMode : COPY_MODE_DEFAULT) : 'count');
  const [source, setSource] = useState<SourceChoice>(voteSource.kind === 'transfer' && voteSource.listId === req.dstId ? { kind: 'proportional' } : voteSource);
  const [adding, setAdding] = useState(req.dstId === null);
  const src = req.from.sc.lists.find((l) => l.id === req.srcId)!, dst = req.dstId ? req.to.sc.lists.find((l) => l.id === req.dstId) : undefined;
  const planWith = (rm: Removal[]) => only && req.dstId
    ? planRoster({ from: sourceOf(req.from), to: req.to.sc, ctx: { base: req.to.base }, srcId: req.srcId, dstId: req.dstId, remove: rm })
    : planWholeList({ from: sourceOf(req.from), to: req.to.sc, ctx: { base: req.to.base }, srcId: req.srcId, dstId: adding ? null : req.dstId, opts: { ...opts, mode, policy: source }, remove: rm });
  const plan = useMemo(() => planWith(remove), [req, opts, mode, source, adding, remove]); // eslint-disable-line react-hooks/exhaustive-deps -- planWith reads these
  // people the import puts on two lists, found before any removal so a removed one stays listed (and can be put back)
  const dupes = useMemo(() => { const p = planWith([]); if (!p.ok) return []; const id = (p.action as { provenance?: { targetListIds?: string[] } }).provenance?.targetListIds?.[0]; return id && (opts.candidates || adding) ? duplicatePeople(p.result, id) : []; }, [req, opts, mode, source, adding]); // eslint-disable-line react-hooks/exhaustive-deps
  const elected = (sc: Scenario) => { const r = allocationOf(sc); return new Map(sc.lists.flatMap((l) => electedOf(l, r.lists.find((x) => x.id === l.id)?.seats ?? 0).map((c) => [personKey(c), c] as const))); };
  const people = plan.ok ? (() => { const a = elected(req.to.sc), b = elected(plan.result); return { entering: [...b.keys()].filter((k) => !a.has(k)).length, leaving: [...a.keys()].filter((k) => !b.has(k)).length }; })() : null;
  const box = (k: keyof typeof opts, label: string, locked = false) => <label><input type="checkbox" checked={opts[k] || locked} disabled={locked || adding && k !== 'votes'} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />{label}</label>;
  const isRemoved = (d: { otherListId: string; otherCandidateId: string }) => remove.some((r) => r.listId === d.otherListId && r.candidateId === d.otherCandidateId);
  const toggleRemove = (d: { otherListId: string; otherCandidateId: string }) => setRemove(isRemoved(d) ? remove.filter((r) => !(r.listId === d.otherListId && r.candidateId === d.otherCandidateId)) : [...remove, { listId: d.otherListId, candidateId: d.otherCandidateId }]);
  const otherName = (id: string) => { const l = req.to.sc.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  return <Modal label={only ? L('Candidates', 'מועמדים') : L('Whole list', 'הרשימה כולה')} onClose={onClose} className="cmp-whole">
    <div className="cmp-whole-head"><Slip {...src} name={listLabel(src, lang)} size="sm" /><b><bdi>{listLabel(src, lang)}</bdi></b><span className="muted">{req.from.year}</span><span aria-hidden>{req.from === req.to ? '' : '→'}</span>
      {dst && !adding ? <><Slip {...dst} name={listLabel(dst, lang)} size="sm" /><b><bdi>{listLabel(dst, lang)}</bdi></b><span className="muted">{req.to.year}</span></> : <b>{L(`New list in ${req.to.year}`, `רשימה חדשה ב־${req.to.year}`)}</b>}</div>
    {!only && <fieldset className="cmp-takes"><legend>{L(`Take from ${req.from.year}`, `לקחת מ־${req.from.year}`)}</legend>
      {box('votes', L('Votes', 'קולות'))}{box('candidates', L('Candidates', 'מועמדים'), adding)}<label><input type="checkbox" checked={opts.candidates || adding} disabled />{L('Constituent parties (follow the candidates)', 'המפלגות המרכיבות (לפי המועמדים)')}</label>
      {!adding && box('identity', L('Name and letters', 'שם ואותיות'))}{!adding && box('appearance', L('Colour', 'צבע'))}
    </fieldset>}
    {opts.votes && <div className="row cmp-whole-votes">
      {req.cross && <label className="field">{L('Votes as', 'קולות לפי')}<select value={mode} onChange={(e) => setMode(e.target.value as CopyMode)}><option value="share">{L('Share of the vote', 'שיעור מהקולות')}</option><option value="count">{L('Number of votes', 'מספר הקולות')}</option></select></label>}
      <SourceSelect dest={req.to.sc} exclude={req.dstId ? [req.dstId] : []} value={source} onChange={setSource} label={L('Balance with', 'איזון מול')} />
    </div>}
    {!adding && !only && <p className="small muted">{L(`Kept from ${req.to.year}: rules, agreements, bloc and coalition.`, `נשמרים מ־${req.to.year}: הכללים, ההסכמים, הגוש והקואליציה.`)}</p>}
    {dupes.length > 0 && <div className="cmp-dupes" role="group" aria-label={L('On two lists', 'בשתי רשימות')}>
      <p className="small"><b>{L(`${dupes.length} on two lists`, `${dupes.length} בשתי רשימות`)}</b> <Info title={L('On two lists', 'בשתי רשימות')}>{L(`These people would also stand on another list in ${req.to.year}. A person can sit for one list only; the app doesn’t choose which. Removing them there is an ordinary, marked edit of that list. Matched by Knesset member record, never by name.`, `אנשים אלה יופיעו גם ברשימה אחרת ב־${req.to.year}. אדם יכול לכהן מטעם רשימה אחת בלבד; האפליקציה אינה מחליטה איזו. הסרתם משם היא עריכה רגילה ומסומנת של אותה רשימה. ההתאמה לפי רישום חבר הכנסת, לעולם לא לפי שם.`)}</Info></p>
      <ul>{dupes.map((d) => { const on = isRemoved(d), other = otherName(d.otherListId); return <li key={`${d.otherListId}:${d.otherCandidateId}`} className="row">
        <span><span aria-hidden>⚠ </span><b><CandidateName candidate={d.candidate} /></b> · {on ? L(`removed from ${other}`, `הוסר מרשימת ${other}`) : L(`also on ${other}`, `גם ברשימת ${other}`)}</span>
        <button type="button" className="btn small" aria-pressed={on} onClick={() => toggleRemove(d)}>{on ? L('Undo', 'ביטול') : L(`Remove from ${other}`, `הסרה מרשימת ${other}`)}</button>
      </li>; })}</ul>
    </div>}
    <p className="small"><b>{L(`Result in ${req.to.year}:`, `התוצאה ב־${req.to.year}:`)}</b> <Outcome plan={plan} to={req.to} focus={req.dstId ? [req.dstId] : []} />
      {people && <span className="muted"> · {L(`Entering ${people.entering}, leaving ${people.leaving}`, `נכנסים ${people.entering}, יוצאים ${people.leaving}`)}</span>}</p>
    <div className="row">
      {only && <button type="button" className="btn small primary" disabled={!plan.ok} onClick={() => plan.ok && onDone(plan, L(`Candidates copied to ${req.to.year}`, `המועמדים הועתקו ל־${req.to.year}`))}>{L('Copy candidates', 'העתקת המועמדים')}</button>}
      {!only && !adding && <button type="button" className="btn small primary" disabled={!plan.ok} onClick={() => plan.ok && onDone(plan, L(`${listLabel(src, 'en')} ${req.from.year} replaced ${dst ? listLabel(dst, 'en') : ''} in ${req.to.year}`, `${listLabel(src, 'he')} ${req.from.year} החליפה את ${dst ? listLabel(dst, 'he') : ''} ב־${req.to.year}`))}>{L('Replace', 'החלפה')}</button>}
      {only ? null : adding ? <button type="button" className="btn small primary" disabled={!plan.ok} onClick={() => plan.ok && onDone(plan, L(`${listLabel(src, 'en')} ${req.from.year} added to ${req.to.year}`, `${listLabel(src, 'he')} ${req.from.year} נוספה ל־${req.to.year}`))}>{L('Add as a new list', 'הוספה כרשימה חדשה')}</button>
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
  const label = L(`Votes for ${listLabel(l, 'en')} (${side.year})`, `קולות ${hebrewPrefixName('ל', listLabel(l, 'he'))} (${side.year})`);
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
  if (r.kind === 'lineage') { const rel = RELATIONS.find((x) => x.id === r.edgeId); return rel ? eventText(rel, lang) : L('Documented lineage', 'שושלת מתועדת'); }
  if (r.kind === 'pending') return L('Announced merger, not legally completed', 'איחוד שהוכרז, טרם הושלם כחוק');
  if (r.kind === 'origin') return L('Same origin in this election', 'אותו מקור בבחירות אלה');
  if (r.kind === 'user') return L('Paired by you', 'הותאם על ידיכם');
  return lang === 'he' ? 'אין קשר מתועד' : 'No sourced relation';
};

/**
 * One pairing in plain words: what is compared with what, why, how sure, and the evidence. The same text sits behind
 * the (i) by each row's tag, in Matching and in the phone row sheet. `c`: the shared comparison rule's answer for the
 * later list (between elections, one later list), or null.
 */
export function PairingWhy({ row, early, late, earlyIds, lateIds, c }: { row: MatchRow; early: SideModel; late: SideModel; earlyIds: string[]; lateIds: string[]; c: Comparison | null }) {
  const L = useL(), lang = useLang();
  const cross = early.sc.electionId !== late.sc.electionId;
  const at = (x: SideModel) => cross ? x.year : x.name;
  const lateN = lateIds.length ? listName(late, lateIds, lang) : '', earlyN = earlyIds.length ? listName(early, earlyIds, lang) : '';
  const used = c && c.kind !== 'first' && c.kind !== 'new' && c.kind !== 'verify' && c.kind !== 'withdrawn' && c.counted.length > 0 ? c : null;
  const head = !lateN ? L(`${earlyN} (${at(early)}): no list continues it in ${at(late)}.`, `${earlyN} (${at(early)}): אין רשימה שממשיכה אותה ב־${at(late)}.`)
    : !earlyN ? L(`${lateN} (${at(late)}): no earlier list to compare with, so it is shown as new.`, `${lateN} (${at(late)}): אין רשימה קודמת להשוות אליה, ולכן היא מוצגת כחדשה.`)
    : used ? L(`${lateN} (${at(late)}) is compared with ${countedText(used, 'en')} in ${at(early)}${used.counted.length > 1 ? ', taken together' : ''}.`, `${lateN} (${at(late)}) מול ${countedText(used, 'he')} ב־${at(early)}${used.counted.length > 1 ? ', יחד' : ''}.`)
    : L(`${lateN} (${at(late)}) is compared with ${earlyN} (${at(early)}).`, `${lateN} (${at(late)}) מול ${earlyN} (${at(early)}).`);
  // the reason the lists were paired; a recorded relation is listed below with its certainty instead
  const listed = row.reason.kind === 'lineage' && used?.relations.some((x) => row.reason.kind === 'lineage' && x.id === row.reason.edgeId);
  const why = row.reason.kind === 'none' || listed ? null : reasonText(row, L, lang);
  const joint = (used?.counted.length ?? 0) > 1 || row.tag === 'ran-jointly' || row.tag === 'joined' || row.tag === 'split';
  return <span className="ph-why cmp-why">
    <span>{head}</span>
    <span><span className="cmp-why-k">{L('Why', 'למה')}:</span> {why ? <>{why}. </> : null}{L(...TAG_INFO[row.tag])}</span>
    {used?.relations.map((r) => <span key={r.id} className="cmp-why-rel"><span>{eventText(r, lang)} ({relationYear(r.date)}) <CertChip c={r.certainty} /></span><EvidenceLinks r={r} /></span>)}
    {used?.notCounted.map((n) => <span key={n.partyId + n.listId} className="muted">{L(`Not counted: ${partyLabel(n.partyId, 'en')} ran inside another list in ${at(early)}, and that list's votes cannot be divided.`, `לא נספרה: ${partyLabel(n.partyId, 'he')} רצה ב־${at(early)} בתוך רשימה אחרת, ואת קולות הרשימה ההיא אי אפשר לחלק.`)}</span>)}
    {used?.left.map((n) => <span key={`l${n.partyId}`} className="muted">{L(`${partyLabel(n.partyId, 'en')} has since left for another list.`, `${partyLabel(n.partyId, 'he')} עברה מאז לרשימה אחרת.`)}</span>)}
    {c?.kind === 'verify' && <span>{L('Not compared yet: the link that decides it is not established.', 'טרם הושווה: הקשר שמכריע זאת טרם בוסס.')} {c.toVerify.map((r) => <span key={r.id} className="cmp-why-rel"><span>{eventText(r, lang)} ({relationYear(r.date)}) <CertChip c={r.certainty} /></span><EvidenceLinks r={r} /></span>)}</span>}
    {used && <span><span className="cmp-why-k">{L('How sure', 'מידת הוודאות')}:</span> <CertChip c={used.certainty} /> <span className="tiny muted">{L(...CERT_INFO[used.certainty])}</span></span>}
    {joint && <span className="tiny muted">{L('A joint list’s votes are never divided among its parties.', 'קולות של רשימה משותפת אינם מחולקים בין מפלגותיה.')}</span>}
  </span>;
}

/** Every pairing with its tag and reason; Check pairs can be accepted, unmatched lists mapped by hand. */
export function MatchingPanel({ rows, flip, left, right, overrides, setOverrides, onClose }: { rows: MatchRow[]; flip: boolean; left: SideModel; right: SideModel; overrides: MatchOverride[]; setOverrides: (o: MatchOverride[]) => void; onClose: () => void }) {
  const L = useL(), lang = useLang();
  const [filter, setFilter] = useState<'all' | 'check' | 'unmatched'>(rows.some((r) => r.tag === 'check') ? 'check' : 'all');
  const [mapping, setMapping] = useState<string | null>(null);
  const shown = rows.filter((r) => filter === 'all' ? true : filter === 'check' ? r.tag === 'check' : r.tag === 'new' || r.tag === 'ended');
  const name = (x: SideModel, ids: string[]) => ids.length ? listName(x, ids, lang) : '—';
  const without = (pred: (o: MatchOverride) => boolean) => overrides.filter((o) => !pred(o));
  // pairings are stored earlier → later; flip: the later side is drawn on the left
  const early = flip ? right : left, late = flip ? left : right;
  const earlyIds = (row: MatchRow) => flip ? row.right : row.left, lateIds = (row: MatchRow) => flip ? row.left : row.right;
  const shown1 = (x: SideModel, row: MatchRow, side: 'left' | 'right') => inOf(row, side) ? L(`in ${name(x, [inOf(row, side)!])}`, `בתוך ${name(x, [inOf(row, side)!])}`) : name(x, row[side]);
  const mine = (row: MatchRow) => overrides.some((o) => earlyIds(row).includes(o.left) && lateIds(row).includes(o.right ?? ''));
  const lineage = useCrossComparison(early.sc.electionId !== late.sc.electionId ? late : null, early.sc.electionId !== late.sc.electionId ? early : null);
  return <Modal label={L('Matching', 'התאמת רשימות')} onClose={onClose} className="cmp-matching">
    <div className="choice-head"><b>{L('Matching', 'התאמת רשימות')}</b> <Info title={L('How lists are matched', 'כיצד רשימות מותאמות')}>{L('From the party registry and documented lineage only: the leading party, shared constituent parties, renames, mergers and splits. Never by name, ballot letters or rank. Your pairings stay with this comparison and never change a result.', 'רק לפי מרשם המפלגות והשושלת המתועדת: המפלגה המובילה, מפלגות מרכיבות משותפות, שינויי שם, איחודים ופיצולים. לעולם לא לפי שם, אותיות או דירוג. ההתאמות שלכם נשמרות להשוואה זו בלבד ואינן משנות תוצאה.')}</Info><button className="btn" aria-label={L('Close', 'סגירה')} onClick={onClose}>×</button></div>
    <div className="seg-row" role="group" aria-label={L('Show', 'הצגה')}>{([['all', L('All', 'הכול')], ['check', L('To verify', 'לבדיקה')], ['unmatched', L('Unmatched', 'ללא התאמה')]] as const).map(([v, t]) =>
      <button key={v} type="button" className={`btn small ${filter === v ? 'primary' : ''}`} aria-pressed={filter === v} onClick={() => setFilter(v)}>{t}</button>)}</div>
    <ul className="cmp-match-list">{shown.map((row) => <li key={row.key}>
      <div className="row cmp-match-names" dir="ltr"><bdi>{shown1(left, row, 'left')}</bdi><span aria-hidden>{flip ? '←' : '→'}</span><bdi>{shown1(right, row, 'right')}</bdi>
        <span className={`cmp-tag tag-${row.tag}`}>{tagText(row.tag, L)}</span></div>
      <PairingWhy row={row} early={early} late={late} earlyIds={earlyIds(row)} lateIds={lateIds(row)} c={lateIds(row).length === 1 && !row.group ? lineage(lateIds(row)[0]) : null} />
      {row.check?.length ? <div className="small muted">{L('to check', 'לבדיקה')}: {name(early, row.check)}</div> : null}
      <div className="row cmp-match-actions">
        {row.tag === 'check' && row.check?.map((id) => <span key={id} className="row">
          <button type="button" className="btn small" onClick={() => setOverrides([...without((o) => o.left === id), { left: id, right: lateIds(row)[0], status: 'accepted' }])}>{L(`Accept ${name(early, [id])}`, `אישור ${name(early, [id])}`)}</button>
          <button type="button" className="btn small ghost" onClick={() => setOverrides([...without((o) => o.left === id), { left: id, right: lateIds(row)[0], status: 'rejected' }])}>{L('No match', 'אין התאמה')}</button></span>)}
        {(row.tag === 'yours' || mine(row)) && <button type="button" className="btn small ghost" onClick={() => setOverrides(without((o) => earlyIds(row).includes(o.left) || lateIds(row).includes(o.right ?? '')))}>{L('Undo my pairing', 'ביטול ההתאמה שלכם')}</button>}
        {(row.tag === 'new' || row.tag === 'ended') && <button type="button" className="btn small" aria-expanded={mapping === row.key} onClick={() => setMapping(mapping === row.key ? null : row.key)}>{L('Map to…', 'התאמה ל…')}</button>}
      </div>
      {mapping === row.key && <MapTo row={row} early={early} late={late} earlyIds={earlyIds(row)} lateIds={lateIds(row)} onPick={(other) => { setOverrides([...overrides, row.tag === 'ended' ? { left: earlyIds(row)[0], right: other, status: 'user' } : { left: other, right: lateIds(row)[0], status: 'user' }]); setMapping(null); }} />}
    </li>)}{!shown.length && <li className="muted small">{L('Nothing here.', 'אין כאן דבר.')}</li>}</ul>
  </Modal>;
}

/** Suggestions ranked by shared candidates (Knesset member id), labelled by count and never asserted. */
function MapTo({ row, early, late, earlyIds, lateIds, onPick }: { row: MatchRow; early: SideModel; late: SideModel; earlyIds: string[]; lateIds: string[]; onPick: (id: string) => void }) {
  const L = useL(), lang = useLang();
  const [q, setQ] = useState('');
  // an ended list maps to a later list; a new list to an earlier one
  const mine = row.tag === 'ended' ? early.sc.lists.find((l) => l.id === earlyIds[0])! : late.sc.lists.find((l) => l.id === lateIds[0])!;
  const other = row.tag === 'ended' ? late : early;
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
export function RowSheet({ row, left, right, why, onClose, actions }: { row: MatchRow; left: SideModel; right: SideModel; why: ReactNode; onClose: () => void; actions: ReactNode }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const side = (x: SideModel, ids: string[]) => { const c = cellsOf(x, ids), inside = inOf(row, x === left ? 'left' : 'right'); return <div className="cmp-sheet-side">
    <span className="muted small">{x.year} · {x.name}</span>
    <b><bdi>{c ? listName(x, ids, lang) : inside ? L(`in ${listName(x, [inside], 'en')}`, `בתוך ${listName(x, [inside], 'he')}`) : '—'}</bdi></b>
    {c && <span className="small"><bdi dir="ltr">{fmtInt(c.votes)}</bdi> {L('votes', 'קולות')} · <bdi dir="ltr">{percent(c.votes, c.total, digits, x.sc.rules.thresholdPct)}</bdi> · <b>{c.seats}</b> {L('seats', 'מנדטים')}</span>}
  </div>; };
  return <Modal label={L('List details', 'פרטי הרשימה')} onClose={onClose} className="cmp-sheet">
    <div className="choice-head"><span className={`cmp-tag tag-${row.tag}`}>{tagText(row.tag, L)}</span><button className="btn" aria-label={L('Close', 'סגירה')} onClick={onClose}>×</button></div>
    <div className="cmp-sheet-sides" dir="ltr">{side(left, row.left)}{side(right, row.right)}</div>
    <div className="small cmp-sheet-why">{why}</div>
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
