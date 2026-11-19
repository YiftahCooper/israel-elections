// An MK's own history (owner decisions M1–M3, 9 Nov 2026): every Knesset they sat in or ran for, one row each, with
// their place on the list, their time in that Knesset and the dated facts. Facts only, never judgements. Graphics run
// left to right in both languages; only text mirrors.
import { seatsText } from '../format.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { History, X } from 'lucide-react';
import { useL, useLang, type Lang } from '../i18n.ts';
import { appLocale, formatDate } from '../dateFormat.ts';
import { useStore } from '../store.ts';
import type { ElectionId } from '../../data/schema.ts';
import { englishLabel } from '../../data/names.ts';
import { closeMkHistory, daysBetween, knessetName, knessetUrl, mkView, openMkHistory, personOfCandidate, servedText, soloFactionMember, useMkRuntime, useOpenMkHistory, wikiUrl,
  type MkEvent, type MkRow, type MkRuntime, type MkView } from '../../history/mk.ts';
import { Info } from './ui.tsx';
import { reasonWords } from '../../history/reasons.ts';
import './mk-history.css';
import { openModal } from '../focusReturn.ts';
import { publisherIn } from '../publisherName.ts';

type T = (en: string, he: string) => string;
const monthYear = (d: string, lang: Lang) => new Date(`${d}T12:00:00Z`).toLocaleDateString(appLocale(lang), { timeZone: 'UTC', month: 'short', year: 'numeric' });
const listName = (r: { he: string; en: string | null }, lang: Lang) => lang === 'he' ? r.he : englishLabel(r.en, r.he);
const factionName = (f: { he: string; en: string | null }, lang: Lang) => lang === 'he' ? f.he : englishLabel(f.en, f.he);
// in a sentence, a one-member faction is named as one (the term timeline's faction lines do the same)
const factionMoveName = (f: { he: string; en: string | null }, lang: Lang) => {
  const solo = soloFactionMember(f, lang);
  return solo ? (lang === 'he' ? `סיעת היחיד של ${solo}` : `single-member faction of ${solo}`) : factionName(f, lang);
};
/** dark or light text on a colour */
function inkOn(hex: string | null): string {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return 'var(--ink)';
  const c = [1, 3, 5].map((i) => { const v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.33 ? '#15171a' : '#ffffff';
}
/** Gendered words only where the Knesset's own record of the person gives the gender (v.gender, from KNS_Person);
 *  otherwise the neutral form. Never from a name. Hebrew: masculine, feminine, neutral. */
type Gender = MkView['gender'];
const g = (gender: Gender, m: string, f: string, n: string) => gender === 'f' ? f : gender === 'm' ? m : n;
/** English pronouns the same way: they/them/their when the record has none */
const pro = (gender: Gender) => gender === 'f' ? { s: 'she', o: 'her', p: 'her', was: 'was' } : gender === 'm' ? { s: 'he', o: 'him', p: 'his', was: 'was' } : { s: 'they', o: 'them', p: 'their', was: 'were' };

// ---------- entry points ----------
/** True when this candidacy is shown on someone's history and the scenario still has the official name. */
export function usePersonOf(candidate: { id: string; nameHe: string } | null | undefined): number | null {
  const rt = useMkRuntime();
  const electionId = (candidate ? `k${candidate.id.split('-')[0]}` : 'k1') as ElectionId;
  const official = useStore((st) => st.datasets[electionId]);
  if (!rt || !candidate || !official) return null;
  const id = personOfCandidate(rt, candidate.id);
  if (id === null) return null;
  // an edited name is no longer the official candidacy
  const same = official.lists.some((l) => l.candidates.some((c) => c.id === candidate.id && c.nameHe === candidate.nameHe));
  return same ? id : null;
}
/** A candidate's name that opens their history when they have one; otherwise the name as it was. */
export function MkName({ candidate, children }: { candidate: { id: string; nameHe: string }; children: ReactNode }) {
  const L = useL();
  const id = usePersonOf(candidate);
  if (id === null) return <>{children}</>;
  return <button type="button" className="mk-name" onClick={() => openMkHistory(id)} title={L('History in the Knesset', 'המסלול בכנסת')}>{children}</button>;
}
/** The seat card's way in: a small button under the name. */
export function MkSeatLink({ candidate }: { candidate: { id: string; nameHe: string } | null }) {
  const L = useL();
  const id = usePersonOf(candidate);
  const rt = useMkRuntime();
  if (id === null || !rt) return null;
  const gender = rt.people[id]?.gender ?? null;
  return <button type="button" className="btn small ghost mk-seatlink" onClick={() => openMkHistory(id)}>
    <History className="icon sm" aria-hidden />{L(g(gender, 'His history', 'Her history', 'MK history'), g(gender, 'המסלול שלו בכנסת', 'המסלול שלה בכנסת', 'המסלול בכנסת'))}</button>;
}

// ---------- the card ----------
export function MkHistoryHost() {
  const id = useOpenMkHistory();
  const rt = useMkRuntime();
  if (id === null || !rt) return null;
  return <MkHistoryDialog rt={rt} id={id} />;
}

function MkHistoryDialog({ rt, id }: { rt: MkRuntime; id: number }) {
  const L = useL(), lang = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const v = useMemo(() => mkView(rt, id), [rt, id]);
  // recorded events are numbered down the card, so each mark on a bar matches its line under the row
  const nums = useMemo(() => new Map((v?.rows ?? []).flatMap((r) => r.events.filter((e) => e.kind === 'recorded')).map((e, i) => [e, i + 1] as const)), [v]);
  // closing gives focus back to what opened it
  useEffect(() => openModal(ref.current), []);
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [id]);
  if (!v) return null;
  const name = lang === 'he' || !v.en ? v.he : v.en;
  return <dialog ref={ref} className="mk-sheet" aria-labelledby="mk-title" onCancel={(e) => { e.preventDefault(); closeMkHistory(); }}
    onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }} onClick={(e) => { if (e.target === e.currentTarget) closeMkHistory(); }}>
    <header className="mk-head">
      <div className="mk-who">
        <h2 id="mk-title"><bdi>{name}</bdi> <span className="mk-sub">{L('History in the Knesset', 'המסלול בכנסת')}</span></h2>
        {lang === 'en' && v.en && <div className="small ink2"><bdi lang="he">{v.he}</bdi></div>}
        <div className="small ink2">{summary(v, L, lang)}</div>
      </div>
      <div className="mk-acts">
        {v.site != null && <a href={knessetUrl(v.site)} target="_blank" rel="noreferrer" title={L('Official member page, Knesset website', 'דף חבר הכנסת הרשמי, אתר הכנסת')}>{L('Knesset page', 'דף בכנסת')}</a>}
        {v.wiki && <a href={wikiUrl(v.wiki)} target="_blank" rel="noreferrer" hrefLang="he" title={L('Hebrew Wikipedia: a secondary source', 'ויקיפדיה העברית: מקור משני')}>{L('Wikipedia (he)', 'ויקיפדיה')}</a>}
        <button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={closeMkHistory}><X className="icon" aria-hidden /></button>
      </div>
    </header>
    <MkKey v={v} />
    <ol className="mk-rows" aria-label={L('Every Knesset, one by one', 'כל כנסת בנפרד')}>
      {v.rows.map((r) => <Row key={r.k} r={r} v={v} nums={nums} />)}
    </ol>
    <p className="tiny muted mk-note">{coverageText(v, L)} <Info title={L('What is shown', 'מה מוצג')}>
      {L('Terms, factions and entry and leaving dates: the Knesset’s own records. Places on the lists: the official candidate lists. A candidacy is linked to a member by the Knesset member ID; a list that did not win them a seat is linked by the name, letter for letter, and only when no one else could be meant. Anything uncertain is left out. Events: dated reports and records, each with its source.',
        'תקופות כהונה, סיעות ומועדי כניסה ויציאה: רישומי הכנסת. מקומות ברשימות: רשימות המועמדים הרשמיות. מועמדות מקושרת לחבר כנסת לפי מספר חבר הכנסת; מועמדות שלא הובילה למושב מקושרת לפי השם, אות באות, ורק כשאין אפשרות לאדם אחר. מה שאינו ודאי אינו מוצג. אירועים: רשומות ודיווחים מתוארכים, כל אחד עם מקורו.')}
    </Info></p>
  </dialog>;
}

/** What each part of a row draws (owner, 16 Nov 2026: why the bars differ in length and are not all full). */
export function MkKey({ v }: { v: MkView }) {
  const L = useL();
  const f = v.gender, e = pro(f);
  return <div className="mk-key tiny ink2" role="note">
    <span><svg className="mk-key-places" width="34" height="14" viewBox="0 0 34 14" aria-hidden><rect x="1" y="4" width="6" height="9" className="mk-key-fill" /><rect x="9" y="4" width="6" height="9" className="mk-key-fill" /><rect x="17" y="4" width="6" height="9" className="mk-key-empty" /><rect x="25" y="4" width="6" height="9" className="mk-key-empty" /><path d="M16.5 0 L23.5 0 L20 4.5 Z" className="mk-key-pin" /><rect x="19.1" y="3" width="1.8" height="11" className="mk-key-pin" /></svg>{L(`List places: filled won a seat; the pin is ${e.p} place`, `מקומות ברשימה: מלא – זכה במושב; הסיכה – ${g(f, 'מקומו', 'מקומה', 'המקום האישי')}`)}</span>
    <span><i className="mk-key-track" aria-hidden><i className="mk-key-seg" /></i>{L(`Bar: the whole Knesset; coloured: ${e.p} time in it`, `פס: הכנסת כולה; הצבוע – ${g(f, 'הזמן שלו', 'הזמן שלה', 'זמן הכהונה')} בה`)}</span>
    {v.rows.some((r) => r.terms.some((t) => t.unrecorded.length)) && <span><i className="mk-key-track" aria-hidden><i className="mk-key-seg mk-unrec" /></i>{L('No faction recorded', 'לא תועדה סיעה')}</span>}
    {/* only where the card has a numbered mark, and drawn with no number: a lone "1" read as "only event 1 is this" (review V3 F3) */}
    {v.rows.some((r) => r.events.some((e) => e.kind === 'recorded')) && <span><i className="mk-key-mark" aria-hidden />{L('A recorded event; its number is listed under the row', 'אירוע מתועד; מספרו מופיע מתחת לשורה')}</span>}
    <Info title={L('How to read the rows', 'איך לקרוא את השורות')}>{L(
      `One row per Knesset. On the left, the election and the list ${e.s} ran on: each small square is one place on that list, filled for the places that won a seat, and the pin marks ${e.p} own place. The bar is that whole Knesset, from its first sitting to its end. Every row uses one scale, so a Knesset that lasted less time (one dissolved early) has a shorter bar. The coloured part is the time ${e.s} sat in it, in the colour of ${e.p} faction; a change of colour is a change of faction. The pale part is time ${e.s} ${e.was} not a member: ${e.s} entered later, left early, or did not sit in that Knesset at all. A dotted part: the Knesset’s records give no faction for those days. A short dark line across the bar, with a number over it, is a recorded event; the same number is listed under the row, with the date and what happened.`,
      `שורה לכל כנסת. בצד: הבחירות והרשימה ${g(f, 'שבה רץ', 'שבה רצה', 'של המועמדות')}. כל ריבוע קטן הוא מקום אחד ברשימה, מלא במקומות שזכו במושב, והסיכה מסמנת את ${g(f, 'מקומו', 'מקומה', 'המקום האישי')}. הפס הוא הכנסת כולה, מהישיבה הראשונה ועד סופה. כל השורות באותו קנה מידה, ולכן כנסת שכיהנה זמן קצר יותר (למשל כזו שהתפזרה מוקדם) מקבלת פס קצר יותר. החלק הצבוע הוא ${g(f, 'הזמן שכיהן', 'הזמן שכיהנה', 'זמן הכהונה')} בה, בצבע ${g(f, 'סיעתו', 'סיעתה', 'הסיעה')}; שינוי צבע הוא מעבר סיעה. החלק הבהיר הוא ${g(f, 'זמן שלא היה חבר', 'זמן שלא הייתה חברה', 'זמן ללא חברות')} בה: ${g(f, 'נכנס מאוחר יותר, עזב מוקדם', 'נכנסה מאוחר יותר, עזבה מוקדם', 'כניסה מאוחרת, עזיבה מוקדמת')}, או ${g(f, 'לא כיהן', 'לא כיהנה', 'היעדר כהונה')} בכנסת זו כלל. חלק מנוקד: ברישומי הכנסת אין סיעה לימים אלה. קו כהה קצר לרוחב הפס, ומספר מעליו, הוא אירוע מתועד; אותו מספר מופיע מתחת לשורה, עם התאריך ומה שקרה.`)}</Info>
  </div>;
}

function summary(v: MkView, L: T, lang: Lang): string {
  const knessets = v.rows.filter((r) => r.terms.length).length;
  // a list that withdrew before the vote is not a run: it is not counted, nor does it stretch the years
  const ran = v.rows.filter((r) => r.run && r.run.outcome !== 'withdrawn');
  const first = ran[0]?.electionDate.slice(0, 4), last = ran[ran.length - 1]?.electionDate.slice(0, 4);
  const span = first && last && first !== last ? `${first}\u2060–\u2060${last}` : first ?? ''; // word joiners: the range never breaks at the dash
  const parts = [
    knessets ? L(`${servedText(v.daysServed, 'en')} in the Knesset, in ${knessets === 1 ? 'one Knesset' : `${knessets} Knessets`}`,
      `${servedText(v.daysServed, 'he')} בכנסת, ${knessets === 1 ? 'בכנסת אחת' : `ב־${knessets} כנסות`}`) : L('Elected to the 26th Knesset', g(v.gender, 'נבחר לכנסת ה־26', 'נבחרה לכנסת ה־26', 'בין הנבחרים לכנסת ה־26')),
    v.runs ? L(`on a list in ${v.runs === 1 ? 'one election' : `${v.runs} elections`}${span ? `, ${span}` : ''}`, `${v.runs === 1 ? 'ברשימה במערכת בחירות אחת' : `ברשימות ב־${v.runs} מערכות בחירות`}${span ? `, ${span}` : ''}`) : '',
  ];
  void lang;
  return parts.filter(Boolean).join(' · ');
}

function coverageText(v: MkView, L: T): string {
  const partial = v.coverage.partial.join(L(' and ', ' ו־'));
  return L(`Elections where a list did not win ${pro(v.gender).o} a seat are shown from ${v.coverage.from} on${partial ? `, and in ${partial} for the lists whose full candidate list we have` : ''}. Before that, only those elected are known.`,
    `בחירות ${g(v.gender, 'שבהן הרשימה לא הכניסה אותו לכנסת', 'שבהן הרשימה לא הכניסה אותה לכנסת', 'שבהן המקום ברשימה לא הספיק למושב')} מוצגות מ־${v.coverage.from} ואילך${partial ? `, וב־${partial} ברשימות שהרשימה המלאה שלהן בידינו` : ''}. לפני כן ידועים רק הנבחרים.`);
}

/** An element's drawn width, to decide which labels fit. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// ---------- one Knesset ----------
function Row({ r, v, nums }: { r: MkRow; v: MkView; nums: Map<MkEvent, number> }) {
  const L = useL(), lang = useLang();
  const run = r.run;
  // the result already says when they entered; the event line would only repeat it
  const said = r.terms[0] && r.terms[0].start !== r.opening && (!run || run.outcome === 'later') ? r.terms[0].start : null;
  const events = r.events.filter((e) => !(e.kind === 'entered' && e.date === said));
  return <li className={`mk-row ${run?.outcome ?? 'served'}`}>
    <div className="mk-when"><b>{monthYear(r.electionDate, lang)}</b><span className="tiny ink2">{knessetName(r.k, lang)}</span></div>
    <div className="mk-list">{run ? <>
      <span className="mk-lname"><span className="mk-sw" style={{ background: run.color }} aria-hidden /><b>{listName(run, lang)}</b></span>
      {run.outcome === 'withdrawn' ? <span className="tiny ink2">{L(`No. ${run.rank}`, `מקום ${run.rank}`)}</span> : <>
        <Places rank={run.rank} seats={run.seats} color={run.color} />
        <span className="tiny ink2">{L(`No. ${run.rank} · the list won ${run.seats}`, `מקום ${run.rank} · הרשימה זכתה ב־${run.seats}`)}</span>
      </>}
    </> : <span className="tiny muted">{L('Place on the list not in our data', 'המקום ברשימה אינו בנתונים')}</span>}</div>
    <div className="mk-term"><TermBar r={r} v={v} nums={nums} /></div>
    <div className="mk-res"><Result r={r} v={v} /></div>
    {events.length > 0 && <ul className="mk-events">{events.map((e, i) => <li key={i}>{nums.has(e) ? <span className="mk-enum" aria-label={L(`Event ${nums.get(e)}`, `אירוע ${nums.get(e)}`)}>{nums.get(e)}<i aria-hidden /></span> : nums.size > 0 && <span className="mk-enum" aria-hidden />}<span className="mk-edate">{formatDate(e.date, lang)}{e.time ? `, ${e.time}` : ''}</span><span>{eventText(e, v, L, lang)}</span>
      {e.kind === 'recorded' && <EventSource e={e} />}{e.kind === 'unsettled' && <Unsettled />}</li>)}</ul>}
  </li>;
}

function eventText(e: MkEvent, v: MkView, L: T, lang: Lang): ReactNode {
  switch (e.kind) {
    case 'entered': return L('Entered the Knesset', g(v.gender, 'נכנס לכנסת', 'נכנסה לכנסת', 'כניסה לכנסת'));
    // the Knesset records no reason for an end (a resignation, an appointment, a death in office): the words claim none
    // (audit 12 Nov 2026, c-famous-late-07: Rabin and Ze'evi read "Left the Knesset"), unless the research records one
    // with its source (owner, 16 Nov 2026: the reason wherever a source records it)
    case 'left': { const why = reasonWords(e.reason, v.gender, lang); return `${L('Membership ended', 'הכהונה הסתיימה')}${why ? ` · ${why}` : ''}`; }
    case 'faction': return L(`Faction: ${factionMoveName(e.faction!.now, lang)} (until then ${factionMoveName(e.faction!.was, lang)})`, `סיעה: ${factionMoveName(e.faction!.now, lang)} (עד אז ${factionMoveName(e.faction!.was, lang)})`);
    // the Knesset's record gives no faction for these days: none is shown, and the line says so (audit 12 Nov 2026, cx-factions-05)
    case 'unrecorded': return L(`Faction not recorded until ${formatDate(e.until!, 'en')}`, `הסיעה לא תועדה עד ${formatDate(e.until!, 'he')}`);
    case 'unsettled': return L('A second membership record: dates not settled', 'רשומת כהונה נוספת: המועדים אינם ברורים');
    default: return lang === 'he' ? e.text!.he : e.text!.en;
  }
}
/** Why a membership record is not drawn as time served. */
function Unsettled() {
  const L = useL();
  return <Info title={L('Dates not settled', 'המועדים אינם ברורים')}>{L('The Knesset’s record has another membership on this day that ends no later than it starts. It is not counted as time in the Knesset.',
    'ברישומי הכנסת יש ביום זה כהונה נוספת שמסתיימת לא יאוחר משהיא מתחילה. היא אינה נספרת כזמן בכנסת.')}</Info>;
}
function EventSource({ e }: { e: MkEvent }) {
  const L = useL(); const lang = useLang();
  if (!e.sources?.length) return null;
  const kind = /^Official/.test(e.evidence ?? '') ? L('Official record', 'רשומה רשמית') : /statement/i.test(e.evidence ?? '') ? L('Own statement, as reported', 'הודעה אישית, כפי שדווחה') : L('Press report', 'דיווח בעיתונות');
  return <Info title={kind} label={L('Source', 'מקור')}><span className="mk-src">{e.sources.map(([pub, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{publisherIn(lang, pub)}</a>)}</span></Info>;
}

export function Result({ r, v }: { r: MkRow; v: MkView }) {
  const L = useL(), lang = useLang();
  const run = r.run, f = v.gender, e = pro(f);
  const noteText = run?.notes.length ? run.notes.map(([en, he], i) => <span key={i} className="mk-why">{lang === 'he' ? he : en}</span>) : null;
  const basisText = run?.basis === 'name' && run.via ? <span className="mk-why">{L(
    `The list has this name letter for letter, as on the list of ${monthYear(v.rows.find((x) => x.k === run.via)?.electionDate ?? '', 'en')}, where the Knesset member ID identifies ${e.o}. No other member of the Knesset has this name.`,
    `השם ברשימה זהה, אות באות, לשם ברשימה של ${monthYear(v.rows.find((x) => x.k === run.via)?.electionDate ?? '', 'he')}, ${g(f, 'שבה מספר חבר הכנסת מזהה אותו', 'שבה מספר חבר הכנסת מזהה אותה', 'שבה הזיהוי לפי מספר חבר הכנסת')}. לאף חבר כנסת אחר אין שם זה.`)}</span> : null;
  // a run that research tied to the person: the sources that tie it (owner, 16 Nov 2026), instead of the name rule
  const researchText = run?.research?.length ? <>
    <span className="mk-why">{L(`A report or biography from the time names ${e.o} on this list:`, `דיווח או ביוגרפיה מאותה עת ${g(f, 'מציינים אותו', 'מציינים אותה', 'מזכירים את השם')} ברשימה זו:`)}</span>
    <span className="mk-src">{run.research.map(([pub, url]) => <a key={url} href={url} target="_blank" rel="noreferrer" hrefLang={/he\.wikipedia\.org/.test(url) ? 'he' : undefined}>{/he\.wikipedia\.org/.test(url) ? L('Hebrew Wikipedia (a secondary source)', 'ויקיפדיה העברית (מקור משני)') : publisherIn(lang, pub)}</a>)}</span>
  </> : null;
  const linkText = researchText ?? basisText;
  const linkTitle = L('How this list is linked', 'איך הרשימה מקושרת');
  const notes = noteText ? <Info title={L('Official note', 'הערה רשמית')}>{noteText}</Info> : null;
  const linked = linkText ? <Info title={linkTitle} label={researchText ? L('Source', 'מקור') : undefined}>{linkText}</Info> : null;
  // the official note and how the list is linked share one (i): two identical buttons side by side could not be told
  // apart (review D2, 19 Nov 2026: Abutbul, Moshiashvili, Deri and Amos in 2026)
  const notesAndLink = noteText && linkText ? <Info title={L('Official note', 'הערה רשמית')}>{noteText}<b className="mk-why mk-info-sub">{linkTitle}</b>{linkText}</Info> : (notes ?? linked);
  if (!run) {
    const t = r.terms[0];
    return <span>{t && t.start !== r.opening ? L(`Entered on ${formatDate(t.start, 'en')}`, `${g(f, 'נכנס', 'נכנסה', 'כניסה')} ב־${formatDate(t.start, 'he')}`) : L('Sat from the first sitting', g(f, 'כיהן מהישיבה הראשונה', 'כיהנה מהישיבה הראשונה', 'כהונה מהישיבה הראשונה'))}</span>;
  }
  switch (run.outcome) {
    case 'elected': return <span>{L('Elected', g(f, 'נבחר', 'נבחרה', 'בין הנבחרים'))}</span>;
    case 'first': return <span>{L('Sat from the first sitting', g(f, 'כיהן מהישיבה הראשונה', 'כיהנה מהישיבה הראשונה', 'כהונה מהישיבה הראשונה'))} {notes}</span>;
    case 'later': return <span>{L(`Entered on ${formatDate(r.terms[0]?.start ?? '', 'en')}`, `${g(f, 'נכנס', 'נכנסה', 'כניסה')} ב־${formatDate(r.terms[0]?.start ?? '', 'he')}`)}</span>;
    case 'declined': return <span>{L('Elected; did not sit', g(f, 'נבחר; לא כיהן', 'נבחרה; לא כיהנה', 'בין הנבחרים; ללא כהונה'))} {notesAndLink}</span>;
    case 'withdrawn': return <span className="mk-out">{L('The list withdrew before the election', 'הרשימה פרשה לפני הבחירות')} {linked}</span>;
    default: {
      const short = run.rank - run.seats;
      const sub = run.seats === 0 && run.share < run.threshold
        ? L(`The list got ${run.share}%, below the ${run.threshold}% threshold`, `הרשימה קיבלה ${run.share}%, מתחת לאחוז החסימה (${run.threshold}%)`)
        : run.seats === 0 ? L('The list won no seats', 'הרשימה לא זכתה במנדטים')
        : L(short === 1 ? '1 place short' : `${short} places short`, short === 1 ? 'חסר מקום אחד' : `חסרו ${short} מקומות`);
      return <span className="mk-out">{L('Not elected', g(f, 'לא נבחר', 'לא נבחרה', 'לא בין הנבחרים'))} {notesAndLink}<span className="tiny ink2 mk-block">{sub}</span></span>;
    }
  }
}

/** The list's places: coloured = seats the list won; the pin = this person's place (drawn left to right). */
function Places({ rank, seats, color }: { rank: number; seats: number; color: string }) {
  const L = useL();
  const n = Math.max(rank, seats) + 1, w = 220, u = Math.min(10, w / n), h = 10, gap = u > 4 ? 1.5 : 0.5;
  const x = 1 + (rank - 1) * u + (u - gap) / 2;
  return <svg className="mk-places" width={n * u + 2} height={h + 6} viewBox={`0 0 ${n * u + 2} ${h + 6}`} direction="ltr" role="img"
    aria-label={L(`Place ${rank}; the list won ${seatsText(seats, 'en')}`, `מקום ${rank}; הרשימה זכתה ${hebrewPrefix('ב', seatsText(seats, 'he'))}`)}>
    {Array.from({ length: n }, (_, i) => i < seats
      ? <rect key={i} x={1 + i * u} y={4} width={Math.max(0.8, u - gap)} height={h} fill={color} rx={u > 6 ? 1 : 0} />
      : <rect key={i} x={1 + i * u} y={4} width={Math.max(0.8, u - gap)} height={h} className="mk-empty" rx={u > 6 ? 1 : 0} />)}
    <path d={`M${x - 3.5} 0 L${x + 3.5} 0 L${x} 4.5 Z`} className="mk-pin" /><rect x={x - 0.9} y={3} width={1.8} height={h + 3} className="mk-pin" />
  </svg>;
}

/** Time in one Knesset: the faint track is the whole Knesset, coloured parts are the time served (by faction). */
function TermBar({ r, v, nums }: { r: MkRow; v: MkView; nums: Map<MkEvent, number> }) {
  const L = useL(), lang = useLang();
  const [ref, px] = useWidth();
  if (!r.opening) return <span className="tiny muted">{L('This Knesset has not yet opened', 'הכנסת טרם נפתחה')}</span>;
  // opened, but its member records are not yet in the data (the 26th, from 10 Nov 2026): the date, and no bar
  // a candidate who did not win a seat was not in it, records or not
  if (!r.end && r.run && !['elected', 'first', 'later'].includes(r.run.outcome)) return <span className="tiny muted">{L(`Not in this Knesset (from ${monthYear(r.opening, 'en')})`, `${g(v.gender, 'לא כיהן', 'לא כיהנה', 'ללא כהונה')} בכנסת זו (מ־${monthYear(r.opening, 'he')})`)}</span>;
  if (!r.end) return <span className="tiny muted mk-pending">{L(`Opened on ${formatDate(r.opening, 'en')}; time in it not yet in our records`, `נפתחה ב־${formatDate(r.opening, 'he')}; רישומי הכהונה בה טרם נאספו`)}</span>;
  const len = Math.max(1, daysBetween(r.opening, r.end));
  // one scale for every row (the longest Knesset is the full width), so a short Knesset draws a short bar
  const W = 100 * Math.min(1, len / v.longest), x = (d: string) => (daysBetween(r.opening!, d) / len) * W;
  const caption = r.terms.length
    ? r.terms.map((t) => t.ongoing ? L(`from ${formatDate(t.start, 'en')}`, `מ־${formatDate(t.start, 'he')}`) : `${formatDate(t.start, lang)} – ${formatDate(t.end, lang)}`).join(' · ')
    : r.ongoing
      // the Knesset still sits: no closing month (19 Nov 2026, the 26th)
      ? L(`Not in this Knesset (from ${monthYear(r.opening, 'en')})`, `${g(v.gender, 'לא כיהן', 'לא כיהנה', 'ללא כהונה')} בכנסת זו (מ־${monthYear(r.opening, 'he')})`)
      : L(`Not in this Knesset (${monthYear(r.opening, 'en')} – ${monthYear(r.end, 'en')})`, `${g(v.gender, 'לא כיהן', 'לא כיהנה', 'ללא כהונה')} בכנסת זו (${monthYear(r.opening, 'he')} – ${monthYear(r.end, 'he')})`);
  const marks = r.events.filter((e) => e.kind === 'recorded');
  // events too close to number apart (Eichler: 15 and 19 Jan 2026) share one line, numbered "1–2"
  const near: MkEvent[][] = [];
  for (const e of marks) { const last = near.at(-1); if (last && ((x(e.date) - x(last[0].date)) / W) * px < 22) last.push(e); else near.push([e]); }
  const numbered = (es: MkEvent[]) => { const n = es.map((e) => nums.get(e) ?? 0); return n.length === 1 ? `${n[0]}` : n.every((k, i) => !i || k === n[i - 1] + 1) ? `${n[0]}–${n.at(-1)}` : n.join(','); };
  return <>
    <div className={`mk-bar${marks.length ? ' has-marks' : ''}`} dir="ltr" ref={ref} style={{ inlineSize: `${W}%` }} role="img" aria-label={caption}>
      {r.terms.flatMap((t) => t.unrecorded).map((g, i) => <span key={`u${i}`} className="mk-seg mk-unrec" title={L('Faction not recorded', 'הסיעה לא תועדה')}
        style={{ insetInlineStart: `${(x(g.start) / W) * 100}%`, inlineSize: `${Math.max(0.6, ((x(g.end) - x(g.start)) / W) * 100)}%` }} />)}
      {r.terms.flatMap((t) => t.segments).map((s, i) => {
        const a = x(s.start), b = x(s.end), name = factionName(s, lang);
        // the faction is named inside its part of the bar only where the whole name fits
        const fits = ((b - a) / W) * px > name.length * 6.4 + 12;
        return <span key={i} className="mk-seg" style={{ insetInlineStart: `${(a / W) * 100}%`, inlineSize: `${Math.max(0.6, ((b - a) / W) * 100)}%`, background: s.color ?? 'var(--muted)', color: inkOn(s.color) }}
          title={name}>{fits && <span className="mk-segname">{name}</span>}</span>;
      })}
      {/* a recorded event: a short ink line across the bar, numbered as in the lines under the row (owner, 19 Nov 2026: no arrow) */}
      {near.map((es, i) => <span key={i} className="mk-mark" style={{ insetInlineStart: `${(x(es[0].date) / W) * 100}%` }}
        title={es.map((e) => `${nums.get(e) ?? ''} · ${formatDate(e.date, lang)}: ${lang === 'he' ? e.text!.he : e.text!.en}`).join('\n')}><b>{numbered(es)}</b></span>)}
    </div>
    <span className="tiny ink2 mk-block">{caption}</span>
  </>;
}
