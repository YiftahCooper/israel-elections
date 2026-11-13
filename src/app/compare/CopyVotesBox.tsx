// The Copy votes box (owner, 12 Nov 2026): one box wherever votes are copied from the compared result into your work, on
// the Overview and in Side by side. Each method says plainly what stays the same, with its figure, and shows what it
// would do before anything changes; the box also says where extra votes come from. By level: Simple offers the one
// method as a sentence; Standard three; Expert also the two that copy an edit. The box always opens; a remembered
// method is only where it starts. Every figure is the engine's, computed on a scratch copy.
import { useMemo, useState, type ReactNode } from 'react';
import { percent, rationalPoints } from '../components/Percentage.tsx';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { setState, useDigits, useLevel, useStore } from '../store.ts';
import { stayingHome, type SourceChoice } from '../voteEdit.ts';
import { Info } from '../components/ui.tsx';
import { COPY_MODE_DEFAULT, isDefaultCopyMode, planVotes, ratioText, type CopyMode, type CopyUnit, type Plan } from './copy.ts';
import { remember, remembered } from './answers.ts';
import { Modal, Outcome, SourceSelect } from './dialogs.tsx';
import { sourceOf, type SideModel } from './model.ts';
import './compare.css';

/** One list (or row) the box can copy; when several are offered the box ticks them all and copies the ticked ones. */
export interface CopyChoice { key: string; name: string; unit: CopyUnit }
/** notCopied: your lists the compared result has no list for (named in the box, never copied) */
export interface CopyRequest { from: SideModel; to: SideModel; units: CopyUnit[]; title: string; cross: boolean; choices?: CopyChoice[]; notCopied?: string[] }

const votes = (x: SideModel['sc'], ids: string[]) => ids.reduce((t, id) => t + (x.lists.find((l) => l.id === id)?.votes ?? 0), 0);
const valid = (x: SideModel['sc']) => x.lists.reduce((t, l) => t + l.votes, 0);

export function CopyVotesBox({ req, onClose, onDone }: { req: CopyRequest; onClose: () => void; onDone: (plan: Plan & { ok: true }, req: CopyRequest) => void }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const { simple, expert } = useLevel();
  const voteSource = useStore((st) => st.voteSource);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(req.choices?.map((c) => c.key)));
  const units = req.choices ? req.choices.filter((c) => ticked.has(c.key)).map((c) => c.unit) : req.units;
  const one = units.length === 1 && units[0].dst.length === 1 ? units[0].dst[0] : null;
  const dst = units.flatMap((u) => u.dst);
  const { from, to, cross } = req;
  // "2022" between elections; the compared result's own name within one
  const where = cross ? from.year : from.name;
  const edited = units.some((u) => u.src.some((id) => from.sc.lists.find((l) => l.id === id)?.votes !== from.start.lists.find((l) => l.id === id)?.votes));
  const startName = from.start === from.sc || from.official ? L('the official result', 'התוצאה הרשמית') : L('its starting point', 'נקודת ההתחלה שלה');
  // within one election everyone entitled to vote is the same, so the same number is also the same share of them
  const basic: CopyMode[] = !cross ? ['count'] : simple ? ['eligible'] : ['eligible', 'share', 'count'];
  const modes: CopyMode[] = [...basic, ...(expert ? ['change', 'ratio'] as const : [])];
  const rem = remembered(to.sc, one, cross);
  const [mode, setMode] = useState<CopyMode>(() => { const m = rem.mode ?? COPY_MODE_DEFAULT; return basic.includes(m) ? m : basic[0]; });
  const [source, setSource] = useState<SourceChoice>(() => { const v = rem.source ?? voteSource; return v.kind === 'transfer' && dst.includes(v.listId) ? { kind: 'proportional' } : v; });
  const [scope, setScope] = useState<'once' | 'item' | 'always'>('once');
  const plans = useMemo(() => Object.fromEntries(modes.map((m) => [m, (m === 'change' || m === 'ratio') && !edited ? null
    : planVotes({ from: sourceOf(from), to: to.sc, ctx: { base: to.base }, units, mode: m, policy: source })])) as Record<CopyMode, Plan | null>,
  [source, req, ticked, expert, simple, edited]); // eslint-disable-line react-hooks/exhaustive-deps
  const plan = plans[mode];
  const target = (p: Plan | null) => p?.ok ? p.targets.reduce((t, x) => t + x.after, 0) : null;

  // what stays the same, with its figure when one list (or one joined row) is copied
  const u = units.length === 1 ? units[0] : null;
  const s = u ? votes(from.sc, u.src) : 0, s0 = u ? votes(from.start, u.src) : 0;
  const fig = (m: CopyMode): ReactNode => {
    // the two methods that copy an edit have no figure until the source was edited
    if (!u || ((m === 'change' || m === 'ratio') && !edited)) return null;
    if (m === 'eligible') return from.sc.registered ? percent(s, from.sc.registered, digits) : null;
    if (m === 'share') return percent(s, valid(from.sc), digits);
    if (m === 'count') return <bdi dir="ltr">{fmtInt(s)}</bdi>;
    if (m === 'change') { const S = BigInt(valid(from.sc)), S0 = BigInt(valid(from.start)); if (!S || !S0) return null;
      return <>{rationalPoints({ num: 100n * (BigInt(s) * S0 - BigInt(s0) * S), den: S * S0 }, digits)} {L('points', 'נק׳ אחוז')}</>; }
    return s0 ? <bdi dir="ltr">{ratioText(s, s0)}</bdi> : null;
  };
  const inWhere = (he: string) => hebrewPrefix('ב', he);
  /** the method in words, without its figure (also the (i)'s title) */
  const words = (m: CopyMode) => {
    switch (m) {
      case 'eligible': return L(`Same share of all eligible voters as in ${where}`, `אותו חלק מכלל בעלי זכות הבחירה כמו ${inWhere(where)}`);
      case 'share': return L(`Same share of the valid votes as in ${where}`, `אותו חלק מהקולות הכשרים כמו ${inWhere(where)}`);
      case 'count': return L(`Same number of votes as in ${where}`, `אותו מספר קולות כמו ${inWhere(where)}`);
      case 'change': return L(`Same change in share as in ${where} since ${startName}`, `אותו שינוי בשיעור כמו ${inWhere(where)} לעומת ${startName}`);
      case 'ratio': return L(`Same growth as in ${where} since ${startName}`, `אותו יחס גידול כמו ${inWhere(where)} לעומת ${startName}`);
    }
  };
  const label = (m: CopyMode) => { const f = fig(m); return <>{words(m)}{f ? <> ({f})</> : null}</>; };
  const why: Partial<Record<CopyMode, string>> = {
    eligible: L('Keeps how many of everyone entitled to vote chose the list, so a bigger electorate gives it more votes.', 'שומר על החלק של הרשימה מכל מי שזכאי להצביע, כך שציבור בוחרים גדול יותר נותן לה יותר קולות.'),
    share: L('Keeps the list’s strength among the votes cast, whatever the turnout.', 'שומר על כוח הרשימה בין הקולות שהוטלו, בלי קשר לשיעור ההצבעה.'),
    count: cross ? L('Copies the number as it is, so a bigger or smaller electorate changes its strength.', 'מעתיק את המספר כמו שהוא, ולכן ציבור בוחרים גדול או קטן יותר משנה את כוחה.')
      : L('Within one election everyone entitled to vote is the same, so the same number of votes is also the same share of them.', 'בתוך אותן בחירות ציבור בעלי זכות הבחירה זהה, ולכן אותו מספר קולות הוא גם אותו חלק מהם.'),
    change: L('Adds the change the list made there to its share here.', 'מוסיף לשיעור שלה כאן את השינוי שעשתה שם.'),
    ratio: L('Grows (or shrinks) its votes here by the same proportion.', 'מגדיל (או מקטין) את קולותיה כאן באותו יחס.'),
  };
  const disabledWhy = L(`Only when ${where} was edited: this copies the edit.`, `רק כאשר ${where} נערכה: שיטה זו מעתיקה את העריכה.`);
  const otherName = source.kind === 'transfer' ? (() => { const l = to.sc.lists.find((x) => x.id === source.listId); return l ? listLabel(l, lang) : ''; })() : '';
  const fromText = source.kind === 'new'
    ? L(`Extra votes come from people who stayed home (${fmtInt(stayingHome(to.sc))} did); votes it no longer gets mean people staying home.`, `קולות נוספים מגיעים ממי שנשארו בבית (${fmtInt(stayingHome(to.sc))} נשארו); קולות שהיא מאבדת הם אנשים שנשארים בבית.`)
    : source.kind === 'transfer' ? L(`Extra votes come from ${otherName}; votes it no longer gets go to ${otherName}.`, `קולות נוספים מגיעים מ${otherName}; קולות שהיא מאבדת עוברים ל${otherName}.`)
    : L('Extra votes come from the other lists, in proportion to their votes; votes it no longer gets go back to them the same way.', 'קולות נוספים מגיעים משאר הרשימות, באופן יחסי לקולותיהן; קולות שהיא מאבדת חוזרים אליהן באותו אופן.');
  const nameList = (x: SideModel, ids: string[]) => ids.map((id) => { const l = x.sc.lists.find((y) => y.id === id); return l ? listLabel(l, lang) : id; }).join(' + ');
  const seatsOf = (x: SideModel, ids: string[]) => ids.reduce((n, id) => n + (x.r.lists.find((l) => l.id === id)?.seats ?? 0), 0);
  const names = units.map((x) => x.dst.map((id) => { const l = to.sc.lists.find((y) => y.id === id); return l ? listLabel(l, lang) : id; }).join(' + '));
  const result = (m: CopyMode) => { const p = plans[m]; const n = target(p); return p ? <>
    {p.ok && n !== null && <span className="muted"><bdi dir="ltr">{fmtInt(n)}</bdi> {L('votes', 'קולות')} · </span>}<Outcome plan={p} to={to} focus={dst} />
  </> : <span className="muted">{disabledWhy}</span>; };

  return <Modal label={req.title} onClose={onClose} className="cmp-ask cmpm-copy">
    <form onSubmit={(e) => { e.preventDefault(); if (!plan?.ok) return; remember(to.sc, one, cross, mode, source, simple ? 'once' : scope); onDone(plan, { ...req, units }); }}>
      <p className="cmp-ask-title"><b>{req.title}</b> <Info title={L('How copying votes works', 'איך העתקת קולות עובדת')}>{L(
        `Only votes are copied; seats are always recalculated by the rules of ${to.year}. Share of eligible voters: the list's votes ÷ everyone entitled to vote in ${where} × everyone entitled to vote here. Share of the valid votes: the list's votes ÷ the valid votes in ${where} × the valid votes here. Number of votes: the same count. Rounded to the nearest vote, never across the threshold.`,
        `מועתקים רק קולות; המנדטים מחושבים תמיד מחדש לפי הכללים של ${to.year}. חלק מבעלי זכות הבחירה: קולות הרשימה ÷ כל בעלי זכות הבחירה ${inWhere(where)} × כל בעלי זכות הבחירה כאן. חלק מהקולות הכשרים: קולות הרשימה ÷ הקולות הכשרים ${inWhere(where)} × הקולות הכשרים כאן. מספר קולות: אותו מספר. מעוגל לקול הקרוב, ולעולם לא מעבר לאחוז החסימה.`)}</Info></p>
      {u && <p className="small cmpm-copy-fromto"><span><bdi>{nameList(from, u.src)}</bdi> · {from.year}, {from.name}: <bdi dir="ltr">{fmtInt(s)}</bdi> {L('votes', 'קולות')}, {seatsOf(from, u.src)} {L('seats', 'מנדטים')}</span>
        <span aria-hidden> {lang === 'he' ? '←' : '→'} </span><span className="sr-only">{L('into', 'אל')}</span>
        <span><bdi>{nameList(to, u.dst)}</bdi> · {to.year}, {to.role === 'main' ? L('your work', 'העבודה שלכם') : to.name}: <bdi dir="ltr">{fmtInt(votes(to.sc, u.dst))}</bdi> {L('votes', 'קולות')}, {seatsOf(to, u.dst)} {L('seats', 'מנדטים')}</span></p>}
      {req.choices && req.choices.length > 1 && <fieldset className="cmpm-copy-lists"><legend>{L(`Lists to copy (${ticked.size} of ${req.choices.length})`, `רשימות להעתקה (${ticked.size} מתוך ${req.choices.length})`)}</legend>
        <div className="row"><button type="button" className="link-btn" onClick={() => setTicked(new Set(req.choices!.map((c) => c.key)))}>{L('All', 'הכול')}</button>
          <button type="button" className="link-btn" onClick={() => setTicked(new Set())}>{L('None', 'אף אחת')}</button></div>
        <div className="cmpm-copy-ticks">{req.choices.map((c) => <label key={c.key}><input type="checkbox" checked={ticked.has(c.key)}
          onChange={(e) => { const n = new Set(ticked); if (e.target.checked) n.add(c.key); else n.delete(c.key); setTicked(n); }} /><bdi>{c.name}</bdi></label>)}</div>
      </fieldset>}
      {!units.length ? <p className="muted">{L('Tick at least one list.', 'סמנו לפחות רשימה אחת.')}</p>
        : simple ? <p className="cmpm-copy-sentence" data-mode={mode}>
          {names.length === 1 ? <><b><bdi>{names[0]}</bdi></b>{L(' gets the ', ' מקבלת ')}</> : L('Each list gets the ', 'כל רשימה מקבלת ')}
          {mode === 'count' ? L(`same number of votes as in ${where}`, `אותו מספר קולות כמו ${inWhere(where)}`) : L(`same share of all eligible voters as in ${where}`, `אותו חלק מכלל בעלי זכות הבחירה כמו ${inWhere(where)}`)}
          {fig(mode) ? <> ({fig(mode)})</> : null}.
          <br />{result(mode)}</p>
        : <fieldset className="cmp-modes"><legend>{L('What stays the same', 'מה נשאר זהה')}</legend>
          {modes.map((m) => { const p = plans[m]; return <label key={m} className={`cmp-mode ${p?.ok ? '' : 'refused'}`} data-mode={m}>
            <input type="radio" name="cmp-mode" value={m} checked={mode === m} disabled={!p} onChange={() => setMode(m)} />
            <span><b>{label(m)}</b> <Info title={words(m)}>{why[m]}</Info><br />{result(m)}</span>
          </label>; })}
        </fieldset>}
      {req.notCopied && req.notCopied.length > 0 && <p className="small muted">{L(`Not copied, no list in ${where}: `, `לא מועתקות, אין להן רשימה ${inWhere(where)}: `)}<bdi>{req.notCopied.join(', ')}</bdi></p>}
      {/* asked at every level (owner, 9 Nov 2026) */}
      {<SourceSelect dest={to.sc} exclude={dst} value={source} onChange={setSource} label={L('Extra votes come from', 'מקור הקולות הנוספים')}
        info={<Info title={L('Extra votes come from', 'מקור הקולות הנוספים')}>{fromText}</Info>} />}
      {!simple && <fieldset className="preference-scope"><legend>{L('Use this choice', 'שימוש בבחירה')}</legend>
        {([['once', L('Just this once', 'רק הפעם')], ...(one ? [['item', L('For this list', 'לרשימה זו')]] : []), ['always', L('Always', 'תמיד')]] as [typeof scope, string][]).map(([v, t]) =>
          <label key={v}><input type="radio" name="cmp-scope" value={v} checked={scope === v} onChange={() => setScope(v)} />{t}</label>)}
        {scope === 'always' && <span className="tiny muted">{isDefaultCopyMode(mode) && cross ? L('Every Copy votes box will start on this method and source. Settings → Editing can change it.', 'כל חלון העתקת קולות יתחיל בשיטה ובמקור האלה. אפשר לשנות בהגדרות ← עריכה.') : L('Every Copy votes box will start on this source. Settings → Editing can change it.', 'כל חלון העתקת קולות יתחיל במקור הזה. אפשר לשנות בהגדרות ← עריכה.')}</span>}
      </fieldset>}
      <p className="tiny muted"><button type="button" className="link-btn" onClick={() => { onClose(); setState({ settingsOpen: true, settingsFocus: cross ? 'copyMode' : 'voteSource' }); }}>{L('Change the default in Settings', 'שינוי ברירת המחדל בהגדרות')}</button></p>
      <div className="row"><button type="submit" className="btn small primary" disabled={!plan?.ok}>{to.year !== from.year ? L(`Copy into ${to.year}`, `העתקה ${hebrewPrefix('ל', to.year)}`) : to.role === 'main' ? L('Copy into your work', 'העתקה לעבודה שלכם') : L(`Copy into ${to.name}`, `העתקה ${hebrewPrefix('ל', to.name)}`)}</button>
        <button type="button" className="btn small ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button></div>
    </form>
  </Modal>;
}
