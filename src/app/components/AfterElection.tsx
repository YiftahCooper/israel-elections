import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { MarkedText, otherLang } from './LangLabel.tsx';
import { recommendationPieces, visibleTermEvents, completePolls, chronological, termEndFact, termWithEnd, sourceLabel, sourceRows, isFieldRecord, type Aftermath, type Cite, type DatedFact, type HistorySource, type RecommendationRound } from '../../data/aftermath-model.ts';
import { useReviewedAftermath } from '../aftermathData.ts';
import aftermathNames from 'virtual:aftermath-names';
import type { GovernmentSupport, GovernmentParticipant, GovernmentIndividual } from '../../data/aftermath.ts';
import { supportRoleGroups, participantName, listsBelowTheirSeats, majorityCrossing, type SupportGroup } from '../governmentSupport.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { openElection, setState, useShown, useStore } from '../store.ts';
import { electionLabel } from '../electionLabel.ts';
import { Info } from './ui.tsx';
import { TermTimeline } from './TermTimeline.tsx';
import { formatDate } from '../dateFormat.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { rotationFor, statutory, type RotationAgreement } from '../../data/rotations.ts';
import './AfterElection.css';
import { sourceLinkText } from '../hewiki.ts';
import { latinQuotesInHebrew } from '../bidiRuns.tsx';

/** Ranges follow the reader: start on the right in Hebrew, on the left in English. */
function DateRun({ date, end }: { date: string; end?: string }) {
  const lang = useLang();
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  return <bdi dir={dir} className="after-date-run"><bdi dir={dir}><time dateTime={date}>{formatDate(date, lang)}</time></bdi>{end && <> – <bdi dir={dir}><time dateTime={end}>{formatDate(end, lang)}</time></bdi></>}</bdi>;
}

/** The rotation agreement of this government, also when the rotation never happened (16 Nov 2026). The planned and the
 *  actual handover are the research record's own; a source read only as a search snippet is not shown as support. */
// Hebrew names from every election's record, worked out at build time (vite.config.ts), so this page needs only its own
const NAMES = new Map(aftermathNames);
function Rotation({ number }: { number: number }) {
  const L = useL(); const lang = useLang();
  const a = rotationFor(number);
  if (!a) return null;
  const name = (en: string) => <bdi>{lang === 'he' ? NAMES.get(en) ?? en : en}</bdi>;
  const date = (d: string) => <bdi><time dateTime={d}>{formatDate(d, lang)}</time></bdi>;
  const plan = a.plannedRotationDate ? <>{L('rotation planned for ', 'רוטציה מתוכננת ל־')}{date(a.plannedRotationDate)}</>
    : a.plannedIntervalMonths ? <>{L('after ', 'אחרי ')}<bdi dir="ltr">{a.plannedIntervalMonths}</bdi>{L(' months', ' חודשים')}</> : null;
  const outcome = a.outcome === 'did-not-occur' ? L('did not take place', 'הרוטציה לא התקיימה')
    : a.actualRotationDate ? <>{a.outcome === 'occurred-early' ? L('took place early, on ', 'הרוטציה התקיימה מוקדם, ב־') : L('took place on ', 'הרוטציה התקיימה ב־')}{date(a.actualRotationDate)}</> : null;
  const shown = a.sources.filter((s) => s.url && s.inspection !== 'search-snippet-only');
  const info = <Info title={L('Rotation agreement', 'הסכם רוטציה')}>
    <RotationWhy a={a} name={name} />
    {shown.length > 0 && <span className="after-rotation-src">{shown.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer"><MarkedText text={sourceLinkText(s.url, s.publisher ?? s.url ?? '', lang)} />{s.date ? <> · {date(s.date)}</> : null}</a>)}</span>}
  </Info>;
  // the line wraps on a phone; only its last words keep the (i) beside them
  const parts = [plan, outcome].filter(Boolean);
  return <div className="after-rotation small">
    <span className="muted">{statutory(a) ? L('Alternate Prime Minister: ', 'ראש הממשלה החלופי: ') : L('Rotation agreement: ', 'הסכם רוטציה: ')}</span>{parts.length ? name(a.secondPrimeMinister) : <span className="after-help-anchor">{name(a.secondPrimeMinister)} {info}</span>}
    {parts.map((p, i) => <span key={i}> · {i === parts.length - 1 ? <span className="after-help-anchor">{p} {info}</span> : p}</span>)}
  </div>;
}
function RotationWhy({ a, name }: { a: RotationAgreement; name: (en: string) => ReactNode }) {
  const L = useL();
  return <span className="after-rotation-why">
    {L('Under the coalition agreement: ', 'לפי הסכם הקואליציה: ')}{L('', 'קודם ')}{name(a.firstPrimeMinister)}{L(' first, then ', ', אחר כך ')}{name(a.secondPrimeMinister)}.
    {statutory(a) ? <>{L(' Until the handover, ', ' עד החילוף, ')}{name(a.secondPrimeMinister)}{L(': alternate prime minister, an office set by law in 2020.', ': ראש הממשלה החלופי, תפקיד שנקבע בחוק ב־2020.')}</> : L(' The handover formed a new government.', ' החילוף נעשה בהקמת ממשלה חדשה.')}
    {a.plannedRotationDateCertainty === 'provisional' && L(' The planned date is as reported at the time.', ' המועד המתוכנן כפי שדווח באותה עת.')}
  </span>;
}

/** Covers numbers and embedded ISO dates in all 26 records, including future prose additions.
 * Verbatim source quotations retain their exact text, with bidi isolation only. */
function HistoryText({ text, verbatim = false }: { text: string; verbatim?: boolean }): ReactNode {
  // An English quotation inside Hebrew ("03/49 · Ben-Gurion · … · 73") is one left-to-right island, so its numbers and
  // the Hebrew numbers beside it cannot swap places across the change of direction.
  const quoted = latinQuotesInHebrew(text);
  if (quoted.length > 1) return <>{quoted.map((q, i) => q.latin ? <bdi key={i} dir="ltr">{q.text}</bdi> : <HistoryText key={i} text={q.text} verbatim={verbatim} />)}</>;
  const runs = text.split(/(\d{4}-\d{2}(?:-\d{2})?(?:\s+[–-]\s+\d{4}-\d{2}(?:-\d{2})?)?|\d+(?:[,.]\d+)*(?:\s*[–−/:\-]\s*\d+(?:[,.]\d+)*)*%?)/g);
  return <>{runs.map((run, i) => {
    if (!/^\d/.test(run)) return run;
    if (!verbatim && /^\d{4}-\d{2}/.test(run)) {
      const [date, end] = run.split(/\s+[–-]\s+/);
      return <DateRun key={i} date={date} end={end} />;
    }
    return <bdi key={i} dir="ltr">{run}</bdi>;
  })}</>;
}

function HelpText({ data, text, cites, explanation }: { data: Aftermath; text: string; cites?: Cite[]; explanation?: string }) {
  const tail = /^(.*\s)(\S+)$/s.exec(text);
  return <span>{tail && <HistoryText text={tail[1]} />}<span className="after-help-anchor"><HistoryText text={tail?.[2] ?? text} /> <Evidence data={data} cites={cites} explanation={explanation && <HistoryText text={explanation} verbatim />} /></span></span>;
}
function FactText({ data, event }: { data: Aftermath; event: DatedFact }) {
  const lang = useLang();
  return <HelpText data={data} text={lang === 'he' ? event.textHe : event.textEn} cites={event.cites} />;
}

function useKindLabel() {
  const L = useL();
  return (s: HistorySource) => s.kind === 'official' ? L('Official', 'רשמי') : s.kind === 'archival' ? L('Archival', 'ארכיוני') : s.kind === 'academic' ? L('Academic', 'אקדמי') : L('Secondary', 'משני');
}
/** The two plain locator forms of the data ("p. 333"; "paragraph beginning «…»" for Word records) in the page's
 *  language; the quoted opening keeps its own direction inside either language's line. */
function LocatorText({ locator }: { locator: string }) {
  const lang = useLang();
  const para = /^paragraph beginning «?(.+?)»?$/.exec(locator);
  if (para) return <>{lang === 'he' ? 'הפסקה שמתחילה ' : 'paragraph beginning '}<span style={{ display: 'inline-block' }}>«<bdi dir="auto">{para[1]}</bdi>»</span></>;
  const page = /^p\. (\S+)$/.exec(locator);
  if (page && lang === 'he') return <>עמ׳ <bdi dir="ltr">{page[1]}</bdi></>;
  return <HistoryText text={locator} verbatim />;
}
/** A cite's note is research commentary (how a record was read or matched), which visitors never see (clarity pass,
 *  26 Nov 2026). Only an official record's fields (a minister's name and faction) are shown, as plain words. */
function citeFields(c: Cite, lang: 'he' | 'en'): string | null {
  const m = /:\s*(.+?);\s*(?:faction|סיעה):\s*(.+?)\.?$/.exec((lang === 'he' ? c.noteHe ?? c.note : c.note) ?? '');
  if (m && /^(Fields of|שדות מתוך)/.test((lang === 'he' ? c.noteHe ?? c.note : c.note) ?? '')) return `${m[1]} · ${m[2]}`;
  return null;
}
/** The sources of a fact: each one named, with its kind and the quoted words. The research notes and the dates sources were
 *  read stay in the record and on the Sources tab (clarity pass, 26 Nov 2026). */
function CiteItems({ data, cites }: { data: Aftermath; cites: Cite[] }) {
  const lang = useLang(); const kind = useKindLabel();
  return <>{cites.filter((c) => data.sources[c.source]).map((c, i) => { const s = data.sources[c.source]; const fields = citeFields(c, lang); return <div key={i} className="after-evidence"><a href={s.url} target="_blank" rel="noreferrer"><bdi lang={otherLang(sourceLabel(s, lang), lang)}><HistoryText text={sourceLabel(s, lang)} /></bdi></a> · {kind(s)}{c.quote && !isFieldRecord(c.quote) && <blockquote dir="auto"><HistoryText text={c.quote} verbatim /></blockquote>}{fields && <p dir="auto"><bdi>{fields}</bdi></p>}{c.locator && <p dir="auto"><LocatorText locator={c.locator} /></p>}</div>; })}</>;
}
function Evidence({ data, cites = [], explanation }: { data: Aftermath; cites?: Cite[]; explanation?: ReactNode }) {
  const L = useL();
  const shown = cites.filter((c) => data.sources[c.source]);
  if (!shown.length && !explanation) return null;
  return <Info title={shown.length ? L('Sources', 'מקורות') : L('Note', 'הערה')}>
    {explanation && <p>{explanation}</p>}
    <CiteItems data={data} cites={shown} />
  </Info>;
}
/** One fact of a card and its sources, for the card's single Sources (i). */
type SourceGroup = { key: string; label: ReactNode; cites?: Cite[] };
/** A whole card's sources behind one (i), each fact's under a short label (round 2 of the clarity pass, 26 Nov 2026:
 *  seven (i)s on one government card, one after every party and figure, made the card hard to read). */
function CardSources({ data, groups }: { data: Aftermath; groups: SourceGroup[] }) {
  const L = useL();
  const shown = groups.filter((g) => g.cites?.some((c) => data.sources[c.source]));
  if (!shown.length) return null;
  return <Info title={L('Sources', 'מקורות')}>
    {shown.map((g) => <div key={g.key} className="after-source-group"><h5>{g.label}</h5><CiteItems data={data} cites={g.cites!} /></div>)}
  </Info>;
}
function FactRows({ data, events }: { data: Aftermath; events: DatedFact[] }) {
  return <ol className="after-events">{chronological(events).map((e, i) => <li key={i}><DateRun date={e.date} end={e.endDate} /><FactText data={data} event={e} /></li>)}</ol>;
}
/** Each group's name and seats under its own run of the bar, left to right in both languages like the bar (charts
 *  never mirror; c-design-principles-01, c-rtl-phone-02). A bracket spans the run; the label is centred under it, kept
 *  inside the bar's width, and moved down a row where it would touch the label before it. */
function GroupKey({ groups, label }: { groups: [string, number][]; label: (key: string) => string }) {
  const lang = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ x: number; row: number }[] | null>(null);
  const shape = JSON.stringify(groups);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const lay = () => {
      const left = el.getBoundingClientRect().left, width = el.clientWidth;
      const brackets = el.querySelectorAll<HTMLElement>('.after-bracket'), labels = el.querySelectorAll<HTMLElement>('.after-group-label');
      const rowEnds: number[] = [];
      const next = [...brackets].map((b, i) => {
        const r = b.getBoundingClientRect(), w = labels[i].offsetWidth;
        const x = Math.max(0, Math.min(r.left - left + r.width / 2 - w / 2, width - w));
        let row = 0; while (row < rowEnds.length && rowEnds[row] + 12 > x) row++;
        rowEnds[row] = x + w;
        return { x, row };
      });
      setPlace(p => p?.length === next.length && p.every((q, i) => Math.abs(q.x - next[i].x) < 0.5 && q.row === next[i].row) ? p : next);
    };
    lay();
    if (typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(lay); watch.observe(el); el.querySelectorAll('.after-group-label').forEach(l => watch.observe(l));
    return () => watch.disconnect();
  }, [shape, lang]);
  const rows = place ? Math.max(...place.map(p => p.row)) + 1 : 1;
  // before the first measurement: centred on the run's share of 120 seats
  let before = 0;
  return <div className="after-key" dir="ltr" ref={box} style={{ height: 10 + rows * 22 }}>
    <div className="after-brackets" aria-hidden="true">{groups.map(([key, total]) => <i key={key} className="after-bracket" style={{ flex: total }} />)}</div>
    {groups.map(([key, total], i) => {
      const centre = (before + total / 2) / 120 * 100; before += total;
      return <span key={key} className="after-group-label" data-group={key} dir={lang === 'he' ? 'rtl' : 'ltr'} style={place?.[i] ? { left: place[i].x, top: 10 + place[i].row * 22 } : { left: `${centre}%`, top: 10, transform: 'translateX(-50%)' }}><bdi>{label(key)}</bdi> <b><bdi dir="ltr">{total}</bdi></b></span>;
    })}
  </div>;
}
function Recommendations({ data, ds, round }: { data: Aftermath; ds: ElectionDataset; round: RecommendationRound }) {
  const L = useL(); const lang = useLang();
  const pieces = recommendationPieces(round);
  const groupLabel = (key: string) => round.nominees[key] ? (lang === 'he' ? round.nominees[key].nameHe : round.nominees[key].nameEn) : key === 'none' ? L('No recommendation', 'ללא המלצה') : key === 'other' ? L('Other', 'אחר') : key === 'disputed' ? L('Sources disagree', 'המקורות חלוקים') : L('Not documented', 'לא מתועד');
  const tail = (key: string) => key === 'unknown' ? 4 : key === 'disputed' ? 3 : key === 'none' ? 2 : key === 'other' || key === 'knesset' ? 1 : 0;
  const groups = Object.entries(round.totals).sort(([a, x], [b, y]) => tail(a) - tail(b) || y - x);
  const list = (letters: string) => ds.lists.find(l => l.letters === letters)!;
  // the 61 line must not run through a list's letters (V2 fault A8): the piece it crosses sets its letters in its larger
  // part, away from the line; where that part is too narrow (under 5 seats, or any crossed piece on a phone) it leaves them out
  const ordered = groups.flatMap(([key]) => pieces.filter(p => p.group === key));
  const crossing = majorityCrossing(ordered.map(p => p.seats));
  return <div className="after-round">
    <h4><span className="after-help-anchor"><DateRun date={round.date} end={round.endDate} /> <Evidence data={data} cites={round.cites} /></span></h4>
    <div className="after-bar-wrap"><div className="after-bar" dir="ltr" aria-hidden="true">{groups.map(([key, total]) => <div key={key} className="after-group" style={{ flex: total }}>{pieces.filter(p => p.group === key).map((p, i) => <span key={i} className={[key === 'unknown' ? 'after-unknown' : '', crossing?.index === ordered.indexOf(p) ? `after-crossed ${crossing.side}${crossing.room < 5 ? ' tight' : ''}` : ''].filter(Boolean).join(' ') || undefined} style={{ flex: p.seats, backgroundColor: key === 'unknown' ? undefined : list(p.letters).color }} title={`${p.letters} · ${listLabel(list(p.letters), lang)}${p.partEn ? ` (${lang === 'he' ? p.partHe : p.partEn})` : ''} · ${p.seats}`}>{p.seats >= 6 && <bdi className={p.seats < 10 ? 'after-small-slip' : undefined} lang="he">{p.letters}</bdi>}</span>)}</div>)}<i className="after-majority">61</i></div></div>
    <GroupKey groups={groups} label={groupLabel} />
    <details className="after-breakdown"><summary>{L('Lists & recommendations', 'רשימות והמלצות')}</summary><table><thead><tr><th>{L('List', 'רשימה')}</th><th>{L('Recommendation', 'המלצה')}</th><th>{L('Seats', 'מנדטים')}</th></tr></thead><tbody>{groups.flatMap(([key]) => pieces.filter(p => p.group === key).map((p, i) => <tr key={`${key}-${i}`}><td><span className="after-party" style={{ '--party': list(p.letters).color } as CSSProperties}><bdi lang="he">{p.letters}</bdi> <bdi>{listLabel(list(p.letters), lang)}</bdi>{p.partEn && <> <bdi>({lang === 'he' ? p.partHe : p.partEn})</bdi></>}</span></td><td><HelpText data={data} text={groupLabel(key)} cites={p.cites} explanation={lang === 'he' ? p.noteHe : p.noteEn} /></td><td><bdi dir="ltr">{p.seats}</bdi></td></tr>))}</tbody></table></details>
  </div>;
}
const MANDATE_ENDS = ['mandate-expired', 'mandate-returned', 'confidence-vote', 'informed-success'];
function Formation({ data }: { data: Aftermath }) {
  const L = useL(); const lang = useLang();
  const nominees = Object.assign({}, ...data.recommendationRounds.map(r => r.nominees), data.formation.people) as RecommendationRound['nominees'];
  const events = chronological(data.formation.events);
  if (!events.length) return null;
  const mandates = events.flatMap((e, i) => e.type === 'mandate-given' ? [{ e, close: events.slice(i + 1).find(f => MANDATE_ENDS.includes(f.type ?? '')) }] : []);
  // the last mandate, with nothing after it that ends it and no government formed, is still running (c-design-principles-02):
  // the line runs on to the day the record was checked, and the bar is drawn open
  const open = mandates.length > 0 && !mandates.at(-1)!.close && !data.government;
  const lineEnd = open && data.reviewedAt > events.at(-1)!.date ? data.reviewedAt : events.at(-1)!.date;
  const first = Date.parse(data.results.electionDate); const last = Date.parse(lineEnd);
  const pos = (date: string) => (Date.parse(date) - first) / Math.max(last - first, 86400000) * 100;
  return <section><h3>{L('Government formation', 'הרכבת הממשלה')}</h3><div className="after-formation" dir="ltr" aria-hidden="true"><div className="after-date-line"><span><DateRun date={data.results.electionDate} /></span><span>{lineEnd !== events.at(-1)!.date && <>{L('As of', 'נכון ל־')} </>}<DateRun date={lineEnd} /></span>{events.map((e, i) => <i key={i} style={{ left: `${pos(e.date)}%` }} title={`${formatDate(e.date, lang)} · ${lang === 'he' ? e.textHe : e.textEn}`} />)}</div>{mandates.map(({ e, close }, i) => {
    const running = open && i === mandates.length - 1;
    const end = close?.date ?? lineEnd;
    const nominee = e.person ? nominees[e.person] : undefined;
    const extension = events.find(f => f.type === 'extension' && f.date >= e.date && f.date < end);
    const boundary = extension ? (pos(extension.date) - pos(e.date)) / Math.max(1, pos(end) - pos(e.date)) * 100 : 100;
    const start = Math.min(pos(e.date), 99), width = Math.max(1, Math.min(100, pos(end)) - start);
    const name = <bdi dir={lang === 'he' ? 'rtl' : 'ltr'}>{nominee ? (lang === 'he' ? nominee.nameHe : nominee.nameEn) : L('Mandate', 'מנדט')}{running && <> · {L('ongoing', 'בתוקף')}</>}</bdi>;
    // the name sits beside its own bar: from its start when the bar begins in the left half, else ending where the bar ends
    return <div key={i} className="after-mandate" data-open={running || undefined}><small style={start <= 50 ? { left: `${start}%` } : { right: `${100 - start - width}%`, textAlign: 'right' }}>{name}</small><span dir={lang === 'he' ? 'rtl' : 'ltr'} style={{ background: running ? 'linear-gradient(to right, var(--axis) 55%, transparent)' : `linear-gradient(to right, var(--axis) ${boundary}%, var(--rule-2) ${boundary}%)`, marginLeft: `${start}%`, width: `${width}%` }} title={`${formatDate(e.date, lang)} – ${running ? L('ongoing', 'בתוקף') : formatDate(end, lang)}`} /></div>;
  })}</div><FactRows data={data} events={events} /></section>;
}
type SupportSnapshot = GovernmentSupport & { number?: number; cites?: Cite[]; coalitionSeatsNote?: string; roleGap?: string };
const SUPPORT_LABELS: Record<SupportGroup, readonly [string, string]> = {
  'member-with-ministries': ['Members', 'חברי הקואליציה'],
  'member-without-ministries': ['Members without ministries', 'חברות בקואליציה ללא שרים'],
  'outside-support': ['Outside support', 'תמיכה מבחוץ'],
  'confidence-vote-only': ['Voted confidence only', 'הצבעת אמון בלבד'],
  'abstained-by-arrangement': ['Abstained by arrangement', 'הימנעות בהסדר'],
  other: ['Other participation', 'השתתפות אחרת'], unknown: ['Unknown role', 'מעמד לא ידוע'],
};
function SupportCount({ value }: { value: number | null | undefined }) {
  const L = useL();
  return <bdi dir={typeof value === 'number' ? 'ltr' : 'auto'}>{value == null ? L('Unknown', 'לא ידוע') : value}</bdi>;
}
/** The facts of a government's make-up that have sources, labelled for the card's one Sources (i). */
function compositionSources(g: SupportSnapshot, ds: ElectionDataset, lang: 'he' | 'en', L: (en: string, he: string) => string, investiture: boolean): SourceGroup[] {
  return [
    { key: 'seats', label: L('Coalition seats', 'מושבי הקואליציה'), cites: g.cites },
    ...investiture ? [{ key: 'vote', label: L('Investiture vote', 'הצבעת האמון'), cites: g.confidenceVoteCites }] : [],
    ...g.coalition.map((entry, i) => ({ key: `p${i}`, label: <bdi>{participantName(entry, ds.lists, lang).name}</bdi>, cites: entry.cites })),
    ...(g.individuals ?? []).map((person) => ({ key: `i${person.id}`, label: <bdi>{lang === 'he' ? person.nameHe : person.nameEn}</bdi>, cites: person.cites })),
  ];
}
/** `investiture`: this snapshot is a government the Knesset voted on; a mid-term change (a party leaving) has no vote of its own.
 *  Its sources go to the card's one Sources (i) (`ownSources`: a change's make-up shows its own, beside its totals);
 *  a fact keeps a small (i) of its own only for a note that explains it. */
function GovernmentComposition({ data, ds, government: g, investiture = true, ownSources = false }: { data: Aftermath; ds: ElectionDataset; government: SupportSnapshot; investiture?: boolean; ownSources?: boolean }) {
  const L = useL(); const lang = useLang();
  const vote = g.confidenceVote;
  const qualification = (entry: GovernmentParticipant | GovernmentIndividual) => entry.certainty === 'unknown'
    ? L('Its part in the coalition is not known, so it is not counted.', 'חלקה בקואליציה אינו ידוע, ולכן אינה נספרת.')
    : entry.certainty === 'provisional' ? L('The exact terms of this arrangement are not known.', 'התנאים המדויקים של ההסדר אינם ידועים.')
    : entry.certainty === 'disputed' ? L('Sources disagree on this.', 'המקורות חלוקים בעניין זה.') : undefined;
  const votes = { for: L('For', 'בעד'), against: L('Against', 'נגד'), abstain: L('Abstained', 'הימנעות'), absent: L('Absent', 'היעדרות'), unknown: L('Vote unknown', 'הצבעה לא ידועה') };
  // said only where the numbers on screen do not add up and nothing else explains it
  const reconciliation = g.reconciliation.status === 'unresolved' ? L('The vote differs from the coalition’s seats, and the record does not say how each member voted.', 'תוצאת ההצבעה שונה ממספר מושבי הקואליציה, והרישום אינו מראה איך הצביע כל חבר כנסת.') : undefined;
  const below = listsBelowTheirSeats(g.coalition, g.coalitionSeats, (letters) => { const l = ds.lists.find((x) => x.letters === letters); return l ? ds.officialSeats?.[l.id] : undefined; });
  return <div className="after-support" role="group" aria-label={L('Government participation', 'השתתפות בממשלה')}>
    <div className="after-support-totals">
      {/* faction sizes at the time not recorded (V2 fault A4): no column of "Unknown"s beside seats that are on the page;
          a partial count is a floor, and one sentence says why there is no total */}
      <span className="after-help-anchor">{L('Coalition seats', 'מושבי הקואליציה')} <strong className="after-members-total">{g.coalitionSeats != null ? <SupportCount value={g.coalitionSeats} /> : g.knownMemberSeats ? <>{L('at least ', 'לפחות ')}<SupportCount value={g.knownMemberSeats} /></> : '—'}</strong> <Evidence data={data} explanation={below && <>{L('The coalition’s lists won ', 'רשימות הקואליציה זכו ב־')}<bdi dir="ltr">{below.won}</bdi>{L(' seats; ', ' מנדטים; ')}<bdi dir="ltr">{g.coalitionSeats}</bdi>{L(' of their members joined: ', ' מחבריהן הצטרפו: ')}{below.lists.map(({ row, won }, i) => <span key={i}>{i > 0 && ', '}<bdi>{participantName(row, ds.lists, lang).name}</bdi> <bdi dir="ltr">{row.seats}</bdi>{L(' of ', ' מתוך ')}<bdi dir="ltr">{won}</bdi></span>)}.</>} /></span>
      {investiture && <span className="after-help-anchor">{L('Investiture vote', 'הצבעת האמון')} <strong className="after-confidence-vote">{vote ? <><SupportCount value={vote.for} /> {L('for', 'בעד')} · <SupportCount value={vote.against} /> {L('against', 'נגד')}{!!vote.abstain && <> · <SupportCount value={vote.abstain} /> {vote.abstain === 1 ? L('abstaining', 'נמנע') : L('abstaining', 'נמנעים')}</>}</> : <SupportCount value={null} />}</strong> <Evidence data={data} explanation={reconciliation} /></span>}
      {!!g.supportSeats && <span>{L('Outside support', 'תמיכה מבחוץ')} <strong className="after-support-total"><SupportCount value={g.supportSeats} /></strong></span>}
      {ownSources && <CardSources data={data} groups={compositionSources(g, ds, lang, L, investiture)} />}
    </div>
    {/* why there is no full total, once and plainly: a faction size not recorded, a faction whose role is not known, or
        members not all known (20 Nov 2026; shorter words in the clarity pass, 26 Nov 2026) */}
    {g.coalitionSeats == null && <p className="small muted after-size-note">{g.coalition.some(r => r.seats == null)
      ? L('Faction sizes at that time are not known, so the coalition’s seats cannot all be added up.', 'גודל הסיעות באותה עת אינו ידוע, ולכן אי אפשר לסכם את כל מושבי הקואליציה.')
      : g.coalition.some(r => r.certainty === 'unknown')
        ? L('A faction whose role is not known (under “Unknown role”) is not counted.', 'סיעה שמעמדה אינו ידוע (תחת "מעמד לא ידוע") אינה נספרת.')
        : L('Not every coalition member is known.', 'לא כל חברי הקואליציה ידועים.')}</p>}
    {supportRoleGroups(g.coalition).map(group => <div className="after-role-group" data-support-role={group.role} key={group.role}>
      <h4>{L(...SUPPORT_LABELS[group.role])}</h4>
      <div className="after-coalition">{group.rows.map((entry, i) => {
        const { list, name, hebrew } = participantName(entry, ds.lists, lang);
        return <span key={i} className="after-party" style={{ '--party': list?.color ?? 'var(--axis)' } as CSSProperties}>
          {(entry.letters ?? list?.letters) && <bdi lang="he">{entry.letters ?? list?.letters}</bdi>}<bdi className="after-party-name" lang={hebrew ? 'he' : undefined}>{name}</bdi>{entry.seats != null && <> <b><SupportCount value={entry.seats} /></b></>}
          {entry.certainty === 'provisional' && <span className="small muted">{L('Terms not known', 'התנאים לא ידועים')}</span>}
          <Evidence data={data} explanation={[qualification(entry), lang === 'he' ? entry.noteHe : entry.noteEn].filter(Boolean).join(' ') || undefined} />
        </span>;
      })}</div>
    </div>)}
    {!!g.individuals?.length && <div className="after-individuals"><h4>{L('Individual participation & votes', 'השתתפות והצבעות אישיות')}</h4>{g.individuals.map(person => {
      const origin = ds.lists.find(l => l.letters === person.fromLetters);
      const role = person.certainty === 'unknown' ? 'unknown' : person.role;
      return <div className="after-individual" key={person.id} data-individual={person.id}>
        <bdi>{lang === 'he' ? person.nameHe : person.nameEn}</bdi>
        <span className="muted small">{L('Elected on', 'מרשימת')} <bdi>{origin ? listLabel(origin, lang) : person.fromLetters}</bdi></span>
        {/* an MK elected on a coalition list whose part is "other" stood outside the coalition (Mapam's six in 1984,
            Chikli in 2021): said in those words, not "Other participation" (V2 fault A7) */}
        {!person.countedInFactionSeats && <span className="small">{role === 'member-with-ministries' ? L('Member', 'חברות בקואליציה') : role === 'other' ? L('Not in the coalition', 'מחוץ לקואליציה') : L(...SUPPORT_LABELS[role])}</span>}
        <span className="after-help-anchor">{votes[person.vote]} <Evidence data={data} explanation={person.countedInFactionSeats ? L('Counted in their list’s seats.', 'כלול במושבי הרשימה.') : qualification(person)} /></span>
      </div>;
    })}</div>}
  </div>;
}

/** The election after this one: the one the record says ended the term, else the next number. */
const nextElectionOf = (id: ElectionDataset['id'], endedBy?: Aftermath['term']['endedBy']) =>
  (endedBy?.nextElection?.startsWith('k') ? endedBy.nextElection : `k${Number(id.slice(1)) + 1}`) as ElectionDataset['id'];

/** The only input is the immutable election dataset; scenario edits never enter this page. */
export function AfterElection({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang();
  const elections = useStore(s => s.elections);
  // a tool set to Hidden (Custom) is not offered by any link
  const sourcesShown = useShown('sources');
  // this election's record and the next one's (for the Next election button) are fetched together
  const [data, nextRecord] = useReviewedAftermath(ds.id, nextElectionOf(ds.id));
  if (!data) return <p>{L('No history for this election yet.', 'אין עדיין היסטוריה לבחירות אלה.')}</p>;
  const government = data.government; const termEvents = visibleTermEvents(data.term.events);
  const direct = data.formation.events.find(e => e.type === 'direct-election');
  const polls = completePolls(data); const next = data.term.endedBy;
  // the fact that ended the term takes its place among the term's events by date (V2 fault A2, 19 Nov 2026): placed
  // after them it read as the last event even when, say, Eichmann's trial came after the dissolution law
  const termRows = termWithEnd(termEvents, termEndFact(data));
  const nextId = nextElectionOf(ds.id, next);
  // a record naming another next election than the one fetched with it is asked for now (only React's `use` inside, which
  // may be called conditionally)
  const nextData = nextId === nextElectionOf(ds.id) ? nextRecord : useReviewedAftermath(nextId)[0];
  const nextEntry = elections.find(e => e.id === nextId);
  return <article className="after-election" data-election={ds.id}>
    {direct ? <p><HelpText data={data} text={L('PM elected directly – no recommendations', 'ראש הממשלה נבחר ישירות – ללא המלצות')} cites={direct.cites} /></p> : data.recommendationRounds.length > 0 && <section><h3>{L('Recommendations to the President', 'המלצות לנשיא')}</h3>{data.recommendationRounds.map(round => <Recommendations key={round.id} data={data} ds={ds} round={round} />)}</section>}
    <Formation data={data} />
    {government && <section><h3><bdi>{L('Government ', 'הממשלה ')}<bdi dir={lang === 'he' ? 'rtl' : 'ltr'}>{lang === 'he' ? hebrewPrefix('ה', government.number) : government.number}</bdi></bdi> · <span className="after-help-anchor"><DateRun date={government.startDate} end={government.endDate} /> <CardSources data={data} groups={[{ key: 'dates', label: L('Dates', 'תאריכים'), cites: [...government.cites, ...government.endDateCites ?? []] }, ...compositionSources(government, ds, lang, L, true)]} /></span></h3>
      <div className="after-pms">{government.primeMinisters.map((p, i) => <span key={i}>{i > 0 && <bdi className="after-forward" dir="ltr">{lang === 'he' ? '←' : '→'}</bdi>}<bdi>{lang === 'he' ? p.nameHe : p.nameEn}</bdi>{p.titleEn && <span className="after-pm-title"> (<bdi>{lang === 'he' ? p.titleHe : p.titleEn}</bdi>)</span>}{(government.primeMinisters.length > 1 || p.from !== government.startDate) && <> · <DateRun date={p.from} /></>}</span>)}</div>
      <Rotation number={government.number} />
      <GovernmentComposition data={data} ds={ds} government={government} />
      {!!government.changes?.length && <details><summary>{L('Government changes', 'שינויים בממשלה')}</summary>{chronological(government.changes).map((change, i) => <div className="after-government-change" key={i}><FactRows data={data} events={[change]} />{change.coalition && <GovernmentComposition data={data} ds={ds} government={change as SupportSnapshot} investiture={change.number !== undefined} ownSources />}</div>)}</details>}
    </section>}
    <TermTimeline ds={ds} />
    {!!data.reaction?.items.length && <section><h3>{L('Statements & institutional steps', 'הצהרות וצעדים מוסדיים')}</h3><FactRows data={data} events={data.reaction.items} /></section>}
    {polls.map((p, i) => <section key={i}><h3>{p.timing === 'after-election' ? L('After-election polling', 'סקרים לאחר הבחירות') : L('Issue polling', 'סקרי סדר יום')} · <span className="after-help-anchor"><DateRun date={p.date ?? p.fieldDates!.to} /> <Evidence data={data} cites={[...p.cites ?? [], { source: p.sourceId, quote: lang === 'he' ? p.questionHe! : p.questionEn! }]} /></span></h3><p className="small muted"><HistoryText text={(lang === 'he' ? p.populationHe : p.populationEn)!} /> · <DateRun date={p.fieldDates!.from} end={p.fieldDates!.to} /></p>{p.answers.map((a, j) => <div className="after-poll" key={j}><span><HistoryText text={(lang === 'he' ? a.labelHe : a.labelEn)!} /></span><meter dir="ltr" min="0" max="100" value={a.pct} /><b><bdi dir="ltr">{a.pct}%</bdi></b></div>)}</section>)}
    {termRows.length > 0 && <section><h3>{L('During the term', 'במהלך הכהונה')}</h3><FactRows data={data} events={termRows} /></section>}
    {nextData && <footer><button className="btn" onClick={() => { void openElection(nextId).then(() => setState({ tool: 'after' })); window.scrollTo({ top: 0 }); }}><bdi dir="ltr" className="after-forward">{lang === 'he' ? '←' : '→'}</bdi> {L('Next election', 'הבחירות הבאות')} · {nextEntry ? <bdi>{electionLabel(nextEntry, elections, lang)}</bdi> : <DateRun date={nextData.results.electionDate} />}</button></footer>}
    {sourcesShown && <button className="btn small after-sources-btn" onClick={() => setState({ tool: 'sources' })}>{L('Sources', 'מקורות')} <span aria-hidden>{lang === 'he' ? '‹' : '›'}</span></button>}
  </article>;
}

export function AfterElectionSources({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const kind = useKindLabel(); const [data] = useReviewedAftermath(ds.id);
  if (!data) return null;
  const excluded = data.term.events.filter(e => !visibleTermEvents([e]).length);
  // one row per address, official first, each named and dated (c-design-principles-17, c-rtl-phone-06)
  return <section className="after-sources"><h3>{L('After the election · sources', 'אחרי הבחירות · מקורות')}</h3><ul className="after-source-list small">{sourceRows(data, lang).map(r => <li key={r.sources[0].url}>{r.sources.length === 1
      ? <a href={r.sources[0].url} target="_blank" rel="noreferrer"><bdi lang={otherLang(r.label, lang)}><HistoryText text={r.label} /></bdi></a>
      : <><bdi lang={otherLang(r.label, lang)}><HistoryText text={r.label} /></bdi> {r.sources.map((s, i) => <Fragment key={s.url}>{i > 0 && ' · '}<a href={s.url} target="_blank" rel="noreferrer" aria-label={`${r.label} ${i + 1}`} lang={otherLang(r.label, lang)}><bdi dir="ltr">{i + 1}</bdi></a></Fragment>)}</>}
      {' '}<span className="muted">· {kind(r.sources[0])} · {L('Retrieved', 'נשלף')} <DateRun date={r.accessed} /></span></li>)}</ul>{/* events still waiting for a second source are research records (data/meta/aftermath, term.candidatesPending):
     they never show to visitors, in any language (S2, 19 Nov 2026) */}
    {excluded.length > 0 && <details><summary>{L('Not shown: waiting for a second source', 'לא מוצגים: ממתינים למקור נוסף')}</summary>{excluded.map((e, i) => <div key={i}><DateRun date={e.date} /> · <FactText data={data} event={e} /></div>)}</details>}</section>;
}
