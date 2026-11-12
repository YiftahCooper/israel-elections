// An MK's own history (owner decisions M1–M3, 9 Nov 2026): every Knesset they sat in or ran for, one row each, with
// their place on the list, their time in that Knesset and the dated facts. Facts only, never judgements. Graphics run
// left to right in both languages; only text mirrors.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { History, X } from 'lucide-react';
import { useL, useLang, type Lang } from '../i18n.ts';
import { appLocale, formatDate } from '../dateFormat.ts';
import { useStore } from '../store.ts';
import type { ElectionId } from '../../data/schema.ts';
import { englishLabel } from '../../data/names.ts';
import { closeMkHistory, daysBetween, knessetName, knessetUrl, mkView, openMkHistory, personOfCandidate, servedText, useMkRuntime, useOpenMkHistory, wikiUrl,
  type MkEvent, type MkRow, type MkRuntime, type MkView } from '../../history/mk.ts';
import { Info } from './ui.tsx';
import './mk-history.css';

type T = (en: string, he: string) => string;
const monthYear = (d: string, lang: Lang) => new Date(`${d}T12:00:00Z`).toLocaleDateString(appLocale(lang), { timeZone: 'UTC', month: 'short', year: 'numeric' });
const listName = (r: { he: string; en: string | null }, lang: Lang) => lang === 'he' ? r.he : englishLabel(r.en, r.he);
const factionName = (f: { he: string; en: string | null }, lang: Lang) => lang === 'he' ? f.he : englishLabel(f.en, f.he);
/** dark or light text on a colour */
function inkOn(hex: string | null): string {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return 'var(--ink)';
  const c = [1, 3, 5].map((i) => { const v = parseInt(hex.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.33 ? '#15171a' : '#ffffff';
}
/** gendered Hebrew: [masculine, feminine] */
const g = (female: boolean, m: string, f: string) => female ? f : m;

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
  const female = rt.people[id]?.female ?? false;
  return <button type="button" className="btn small ghost mk-seatlink" onClick={() => openMkHistory(id)}>
    <History className="icon sm" aria-hidden />{L(female ? 'Her history' : 'His history', female ? 'המסלול שלה בכנסת' : 'המסלול שלו בכנסת')}</button>;
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
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); return () => { if (d?.open) d.close(); }; }, []);
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
    <ol className="mk-rows" aria-label={L('Every Knesset, one by one', 'כל כנסת בנפרד')}>
      {v.rows.map((r) => <Row key={r.k} r={r} v={v} />)}
    </ol>
    <p className="tiny muted mk-note">{coverageText(v, L)} <Info title={L('What is shown', 'מה מוצג')}>
      {L('Terms, factions and entry and leaving dates: the Knesset’s own records. Places on the lists: the official candidate lists. A candidacy is linked to a member by the Knesset member ID; a list that did not win them a seat is linked by the name, letter for letter, and only when no one else could be meant. Anything uncertain is left out. Events: dated reports and records, each with its source.',
        'תקופות כהונה, סיעות ומועדי כניסה ויציאה: רישומי הכנסת. מקומות ברשימות: רשימות המועמדים הרשמיות. מועמדות מקושרת לחבר כנסת לפי מספר חבר הכנסת; רשימה שלא הכניסה אותו לכנסת מקושרת לפי השם, אות באות, ורק כשאין אפשרות לאדם אחר. מה שאינו ודאי אינו מוצג. אירועים: רשומות ודיווחים מתוארכים, כל אחד עם מקורו.')}
    </Info></p>
  </dialog>;
}

function summary(v: MkView, L: T, lang: Lang): string {
  const knessets = v.rows.filter((r) => r.terms.length).length;
  // a list that withdrew before the vote is not a run: it is not counted, nor does it stretch the years
  const ran = v.rows.filter((r) => r.run && r.run.outcome !== 'withdrawn');
  const first = ran[0]?.electionDate.slice(0, 4), last = ran[ran.length - 1]?.electionDate.slice(0, 4);
  const span = first && last && first !== last ? `${first}\u2060–\u2060${last}` : first ?? ''; // word joiners: the range never breaks at the dash
  const parts = [
    knessets ? L(`${servedText(v.daysServed, 'en')} in the Knesset, in ${knessets === 1 ? 'one Knesset' : `${knessets} Knessets`}`,
      `${servedText(v.daysServed, 'he')} בכנסת, ${knessets === 1 ? 'בכנסת אחת' : `ב־${knessets} כנסות`}`) : L('Elected to the 26th Knesset', g(v.female, 'נבחר לכנסת ה־26', 'נבחרה לכנסת ה־26')),
    v.runs ? L(`on a list in ${v.runs === 1 ? 'one election' : `${v.runs} elections`}${span ? `, ${span}` : ''}`, `${v.runs === 1 ? 'ברשימה בבחירות אחת' : `ברשימות ב־${v.runs} מערכות בחירות`}${span ? `, ${span}` : ''}`) : '',
  ];
  void lang;
  return parts.filter(Boolean).join(' · ');
}

function coverageText(v: MkView, L: T): string {
  const partial = v.coverage.partial.join(L(' and ', ' ו־'));
  return L(`Elections where a list did not win ${v.female ? 'her' : 'him'} a seat are shown from ${v.coverage.from} on${partial ? `, and in ${partial} for the lists whose full candidate list we have` : ''}. Before that, only those elected are known.`,
    `בחירות שבהן הרשימה לא הכניסה ${g(v.female, 'אותו', 'אותה')} לכנסת מוצגות מ־${v.coverage.from} ואילך${partial ? `, וב־${partial} ברשימות שהרשימה המלאה שלהן בידינו` : ''}. לפני כן ידועים רק הנבחרים.`);
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
function Row({ r, v }: { r: MkRow; v: MkView }) {
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
    <div className="mk-term"><TermBar r={r} v={v} /></div>
    <div className="mk-res"><Result r={r} v={v} /></div>
    {events.length > 0 && <ul className="mk-events">{events.map((e, i) => <li key={i}><span className="mk-edate">{formatDate(e.date, lang)}{e.time ? `, ${e.time}` : ''}</span><span>{eventText(e, v, L, lang)}</span>
      {e.kind === 'recorded' && <EventSource e={e} />}{e.kind === 'unsettled' && <Unsettled />}</li>)}</ul>}
  </li>;
}

function eventText(e: MkEvent, v: MkView, L: T, lang: Lang): ReactNode {
  switch (e.kind) {
    case 'entered': return L('Entered the Knesset', g(v.female, 'נכנס לכנסת', 'נכנסה לכנסת'));
    // the Knesset records no reason for an end (a resignation, an appointment, a death in office): the words claim none
    // (audit 12 Nov 2026, c-famous-late-07: Rabin and Ze'evi read "Left the Knesset")
    case 'left': return L('Membership ended', 'הכהונה הסתיימה');
    case 'faction': return L(`Faction: ${factionName(e.faction!.now, lang)} (until then ${factionName(e.faction!.was, lang)})`, `סיעה: ${factionName(e.faction!.now, lang)} (עד אז ${factionName(e.faction!.was, lang)})`);
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
  const L = useL();
  if (!e.sources?.length) return null;
  const kind = /^Official/.test(e.evidence ?? '') ? L('Official record', 'רשומה רשמית') : /statement/i.test(e.evidence ?? '') ? L('Own statement, as reported', 'הודעה אישית, כפי שדווחה') : L('Press report', 'דיווח בעיתונות');
  return <Info title={kind} label={L('Source', 'מקור')}><span className="mk-src">{e.sources.map(([pub, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{pub}</a>)}</span></Info>;
}

function Result({ r, v }: { r: MkRow; v: MkView }) {
  const L = useL(), lang = useLang();
  const run = r.run, f = v.female;
  const notes = run?.notes.length ? <Info title={L('Official note', 'הערה רשמית')}>{run.notes.map(([en, he], i) => <span key={i} className="mk-why">{lang === 'he' ? he : en}</span>)}</Info> : null;
  const basis = run?.basis === 'name' && run.via ? <Info title={L('How this list is linked', 'איך הרשימה מקושרת')}>{L(
    `The list has this name letter for letter, as on the list of ${monthYear(v.rows.find((x) => x.k === run.via)?.electionDate ?? '', 'en')}, where the Knesset member ID identifies ${f ? 'her' : 'him'}. No other member of the Knesset has this name.`,
    `השם ברשימה זהה, אות באות, לשם ברשימה של ${monthYear(v.rows.find((x) => x.k === run.via)?.electionDate ?? '', 'he')}, שבה מספר חבר הכנסת מזהה ${g(f, 'אותו', 'אותה')}. לאף חבר כנסת אחר אין שם זה.`)}</Info> : null;
  if (!run) {
    const t = r.terms[0];
    return <span>{t && t.start !== r.opening ? L(`Entered on ${formatDate(t.start, 'en')}`, `${g(f, 'נכנס', 'נכנסה')} ב־${formatDate(t.start, 'he')}`) : L('Sat from the first sitting', g(f, 'כיהן מהישיבה הראשונה', 'כיהנה מהישיבה הראשונה'))}</span>;
  }
  switch (run.outcome) {
    case 'elected': return <span>{L('Elected', g(f, 'נבחר', 'נבחרה'))}</span>;
    case 'first': return <span>{L('Sat from the first sitting', g(f, 'כיהן מהישיבה הראשונה', 'כיהנה מהישיבה הראשונה'))} {notes}</span>;
    case 'later': return <span>{L(`Entered on ${formatDate(r.terms[0]?.start ?? '', 'en')}`, `${g(f, 'נכנס', 'נכנסה')} ב־${formatDate(r.terms[0]?.start ?? '', 'he')}`)}</span>;
    case 'declined': return <span>{L('Elected; did not sit', g(f, 'נבחר; לא כיהן', 'נבחרה; לא כיהנה'))} {notes}{basis}</span>;
    case 'withdrawn': return <span className="mk-out">{L('The list withdrew before the election', 'הרשימה פרשה לפני הבחירות')} {basis}</span>;
    default: {
      const short = run.rank - run.seats;
      const sub = run.seats === 0 && run.share < run.threshold
        ? L(`The list got ${run.share}%, below the ${run.threshold}% threshold`, `הרשימה קיבלה ${run.share}%, מתחת לאחוז החסימה (${run.threshold}%)`)
        : run.seats === 0 ? L('The list won no seats', 'הרשימה לא זכתה במנדטים')
        : L(short === 1 ? '1 place short' : `${short} places short`, short === 1 ? 'חסר מקום אחד' : `חסרו ${short} מקומות`);
      return <span className="mk-out">{L('Not elected', g(f, 'לא נבחר', 'לא נבחרה'))} {basis}<span className="tiny ink2 mk-block">{sub}</span></span>;
    }
  }
}

/** The list's places: coloured = seats the list won; the pin = this person's place (drawn left to right). */
function Places({ rank, seats, color }: { rank: number; seats: number; color: string }) {
  const L = useL();
  const n = Math.max(rank, seats) + 1, w = 220, u = Math.min(10, w / n), h = 10, gap = u > 4 ? 1.5 : 0.5;
  const x = 1 + (rank - 1) * u + (u - gap) / 2;
  return <svg className="mk-places" width={n * u + 2} height={h + 6} viewBox={`0 0 ${n * u + 2} ${h + 6}`} direction="ltr" role="img"
    aria-label={L(`Place ${rank}; the list won ${seats} seats`, `מקום ${rank}; הרשימה זכתה ב־${seats} מנדטים`)}>
    {Array.from({ length: n }, (_, i) => i < seats
      ? <rect key={i} x={1 + i * u} y={4} width={Math.max(0.8, u - gap)} height={h} fill={color} rx={u > 6 ? 1 : 0} />
      : <rect key={i} x={1 + i * u} y={4} width={Math.max(0.8, u - gap)} height={h} className="mk-empty" rx={u > 6 ? 1 : 0} />)}
    <path d={`M${x - 3.5} 0 L${x + 3.5} 0 L${x} 4.5 Z`} className="mk-pin" /><rect x={x - 0.9} y={3} width={1.8} height={h + 3} className="mk-pin" />
  </svg>;
}

/** Time in one Knesset: the faint track is the whole Knesset, coloured parts are the time served (by faction). */
function TermBar({ r, v }: { r: MkRow; v: MkView }) {
  const L = useL(), lang = useLang();
  const [ref, px] = useWidth();
  if (!r.opening || !r.end) return <span className="tiny muted">{L('This Knesset has not yet opened', 'הכנסת טרם נפתחה')}</span>;
  const len = Math.max(1, daysBetween(r.opening, r.end));
  // one scale for every row (the longest Knesset is the full width), so a short Knesset draws a short bar
  const W = 100 * Math.min(1, len / v.longest), x = (d: string) => (daysBetween(r.opening!, d) / len) * W;
  const caption = r.terms.length
    ? r.terms.map((t) => t.ongoing ? L(`from ${formatDate(t.start, 'en')}`, `מ־${formatDate(t.start, 'he')}`) : `${formatDate(t.start, lang)} – ${formatDate(t.end, lang)}`).join(' · ')
    : L(`Not in this Knesset (${monthYear(r.opening, 'en')} – ${monthYear(r.end, 'en')})`, `לא ${g(v.female, 'כיהן', 'כיהנה')} בכנסת זו (${monthYear(r.opening, 'he')} – ${monthYear(r.end, 'he')})`);
  const marks = r.events.filter((e) => e.kind === 'recorded');
  return <>
    <div className="mk-bar" dir="ltr" ref={ref} style={{ inlineSize: `${W}%` }} role="img" aria-label={caption}>
      {r.terms.flatMap((t) => t.unrecorded).map((g, i) => <span key={`u${i}`} className="mk-seg mk-unrec" title={L('Faction not recorded', 'הסיעה לא תועדה')}
        style={{ insetInlineStart: `${(x(g.start) / W) * 100}%`, inlineSize: `${Math.max(0.6, ((x(g.end) - x(g.start)) / W) * 100)}%` }} />)}
      {r.terms.flatMap((t) => t.segments).map((s, i) => {
        const a = x(s.start), b = x(s.end), name = factionName(s, lang);
        // the faction is named inside its part of the bar only where the whole name fits
        const fits = ((b - a) / W) * px > name.length * 6.4 + 12;
        return <span key={i} className="mk-seg" style={{ insetInlineStart: `${(a / W) * 100}%`, inlineSize: `${Math.max(0.6, ((b - a) / W) * 100)}%`, background: s.color ?? 'var(--muted)', color: inkOn(s.color) }}
          title={name}>{fits && <span className="mk-segname">{name}</span>}</span>;
      })}
      {marks.map((e, i) => <span key={i} className="mk-mark" style={{ insetInlineStart: `${(x(e.date) / W) * 100}%` }} title={`${formatDate(e.date, lang)}: ${lang === 'he' ? e.text!.he : e.text!.en}`} />)}
    </div>
    <span className="tiny ink2 mk-block">{caption}</span>
  </>;
}
