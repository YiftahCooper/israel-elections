import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { reviewedAftermath, recommendationPieces, visibleTermEvents, completePolls, chronological, termEndFact, termWithEnd, sourceLabel, sourceRows, isFieldRecord, type Aftermath, type Cite, type Conflict, type DatedFact, type HistorySource, type RecommendationRound } from '../../data/aftermath-runtime.ts';
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
import { personNames, rotationFor, statutory, type RotationAgreement } from '../../data/rotations.ts';
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
const NAMES = personNames();
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
    {shown.length > 0 && <span className="after-rotation-src">{shown.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{sourceLinkText(s.url, s.publisher ?? s.url ?? '', lang)}{s.date ? <> · {date(s.date)}</> : null}</a>)}</span>}
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
    {a.plannedRotationDateCertainty === 'provisional' && L(' The planned date comes from reports at the time; the agreement itself is not yet checked.', ' המועד המתוכנן לקוח מדיווחים מאותה עת; ההסכם עצמו טרם נבדק.')}
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

function HelpText({ data, text, cites, notes, explanation }: { data: Aftermath; text: string; cites?: Cite[]; notes?: string[]; explanation?: string }) {
  const tail = /^(.*\s)(\S+)$/s.exec(text);
  return <span>{tail && <HistoryText text={tail[1]} />}<span className="after-help-anchor"><HistoryText text={tail?.[2] ?? text} /> <Evidence data={data} cites={cites} notes={notes} explanation={explanation && <HistoryText text={explanation} verbatim />} /></span></span>;
}
function FactText({ data, event }: { data: Aftermath; event: DatedFact }) {
  const lang = useLang();
  return <HelpText data={data} text={lang === 'he' ? event.textHe : event.textEn} cites={event.cites} notes={event.notes} />;
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
/** Sources that disagree: each one's account with its source, then how the record settles it (research language). */
function ConflictText({ data, conflict }: { data: Aftermath; conflict: Conflict }) {
  const lang = useLang();
  return <div className="after-conflict" dir="auto"><p><b><HistoryText text={conflict.about} verbatim /></b></p><ul>{conflict.values.map((v, i) => { const s = data.sources[v.source]; return <li key={i}><HistoryText text={v.value} verbatim />{s && <> · <a href={s.url} target="_blank" rel="noreferrer"><bdi><HistoryText text={sourceLabel(s, lang)} /></bdi></a></>}</li>; })}</ul><p><HistoryText text={conflict.resolution} verbatim /></p></div>;
}
function Evidence({ data, cites = [], notes = [], explanation }: { data: Aftermath; cites?: Cite[]; notes?: (string | ReactNode)[]; explanation?: ReactNode }) {
  const L = useL(); const lang = useLang(); const kind = useKindLabel();
  return <Info title={L('Sources & qualifications', 'מקורות וסייגים')}>
    {explanation && <p>{explanation}</p>}
    {cites.map((c, i) => { const s = data.sources[c.source]; return s && <div key={i} className="after-evidence"><a href={s.url} target="_blank" rel="noreferrer"><bdi><HistoryText text={sourceLabel(s, lang)} /></bdi></a> · {kind(s)} · <DateRun date={s.accessed} />{c.quote && !isFieldRecord(c.quote) && <blockquote dir="auto"><HistoryText text={c.quote} verbatim /></blockquote>}{c.locator && <p dir="auto"><LocatorText locator={c.locator} /></p>}{(lang === 'he' ? c.noteHe ?? c.note : c.note) && <p dir="auto"><HistoryText text={(lang === 'he' ? c.noteHe ?? c.note : c.note)!} verbatim /></p>}</div>; })}
    {notes.length > 0 && <details><summary>{L('Research notes · original language', 'הערות מחקר · בשפת המקור')}</summary>{notes.map((n, i) => typeof n === 'string' ? <p key={i} dir="auto"><HistoryText text={n} verbatim /></p> : n)}</details>}
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
    <h4><span className="after-help-anchor"><DateRun date={round.date} end={round.endDate} /> <Evidence data={data} cites={round.cites} notes={round.notes} /></span></h4>
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
  return <section><h3><span className="after-help-anchor">{L('Government formation', 'הרכבת הממשלה')}{data.formation.conflicts?.length ? <> <Evidence data={data} cites={data.formation.conflicts.flatMap(c => c.cites ?? [])} notes={data.formation.conflicts.map((c, i) => <ConflictText key={i} data={data} conflict={c} />)} /></> : null}</span></h3><div className="after-formation" dir="ltr" aria-hidden="true"><div className="after-date-line"><span><DateRun date={data.results.electionDate} /></span><span>{lineEnd !== events.at(-1)!.date && <>{L('Checked', 'נבדק')} </>}<DateRun date={lineEnd} /></span>{events.map((e, i) => <i key={i} style={{ left: `${pos(e.date)}%` }} title={`${formatDate(e.date, lang)} · ${lang === 'he' ? e.textHe : e.textEn}`} />)}</div>{mandates.map(({ e, close }, i) => {
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
/** `investiture`: this snapshot is a government the Knesset voted on; a mid-term change (a party leaving) has no vote of its own. */
function GovernmentComposition({ data, ds, government: g, investiture = true }: { data: Aftermath; ds: ElectionDataset; government: SupportSnapshot; investiture?: boolean }) {
  const L = useL(); const lang = useLang();
  const vote = g.confidenceVote;
  const qualification = (entry: GovernmentParticipant | GovernmentIndividual) => entry.certainty === 'unknown'
    ? L('The relationship has not been established. It is not counted as membership.', 'המעמד טרם הוברר. אין לראות בו חברות בקואליציה.')
    : entry.certainty === 'provisional' ? L('Provisional classification; the original terms are not fully authenticated.', 'סיווג זמני; תנאי ההסדר המקוריים טרם אומתו במלואם.')
    : entry.certainty === 'disputed' ? L('Sources disagree; both sides are cited below.', 'המקורות חלוקים; שני הצדדים מובאים להלן.') : undefined;
  const votes = { for: L('For', 'בעד'), against: L('Against', 'נגד'), abstain: L('Abstained', 'הימנעות'), absent: L('Absent', 'היעדרות'), unknown: L('Vote unknown', 'הצבעה לא ידועה') };
  const reconciliation = g.reconciliation.status === 'unresolved' ? L('The difference has not been reconciled.', 'הפער טרם הוסבר.')
    : g.reconciliation.status === 'explained' ? L('The recorded participation and individual votes explain the difference.', 'רישומי ההשתתפות וההצבעות האישיות מסבירים את הפער.')
    : g.reconciliation.status === 'vote-unavailable' ? L('The investiture vote has not been recovered.', 'הצבעת האמון טרם אותרה.')
    : L('The totals match; this does not establish each individual vote.', 'הסכומים שווים; אין בכך אישור להצבעתו של כל חבר כנסת.');
  const below = listsBelowTheirSeats(g.coalition, g.coalitionSeats, (letters) => { const l = ds.lists.find((x) => x.letters === letters); return l ? ds.officialSeats?.[l.id] : undefined; });
  return <div className="after-support" role="group" aria-label={L('Government participation', 'השתתפות בממשלה')}>
    <div className="after-support-totals">
      {/* faction sizes at the time not recorded (V2 fault A4): no column of "Unknown"s beside seats that are on the page;
          a partial count is a floor, and one sentence says why there is no total */}
      <span className="after-help-anchor">{L('Members', 'חברי הקואליציה')} <strong className="after-members-total">{g.coalitionSeats != null ? <SupportCount value={g.coalitionSeats} /> : g.knownMemberSeats ? <>{L('at least ', 'לפחות ')}<SupportCount value={g.knownMemberSeats} /></> : '—'}</strong> <Evidence data={data} cites={g.cites} explanation={<>{below && <>{L('The coalition’s lists won ', 'רשימות הקואליציה זכו ב־')}<bdi dir="ltr">{below.won}</bdi>{L(' seats; ', ' מנדטים; ')}<bdi dir="ltr">{g.coalitionSeats}</bdi>{L(' of their members are counted, as some never joined: ', ' מחבריהן נספרים, כי חלקם לא הצטרפו: ')}{below.lists.map(({ row, won }, i) => <span key={i}>{i > 0 && ', '}<bdi>{participantName(row, ds.lists, lang).name}</bdi> <bdi dir="ltr">{row.seats}</bdi>{L(' of ', ' מתוך ')}<bdi dir="ltr">{won}</bdi></span>)}{'. '}</>}{L('Membership is separate from supporting or voting for the government.', 'חברות בקואליציה נפרדת מתמיכה בממשלה או מהצבעת אמון.')}</>} notes={[g.coalitionSeatsNote, g.roleGap].filter((s): s is string => !!s)} /></span>
      {investiture && <span className="after-help-anchor">{L('Investiture vote', 'הצבעת האמון')} <strong className="after-confidence-vote">{vote ? <><SupportCount value={vote.for} /> {L('for', 'בעד')} · <SupportCount value={vote.against} /> {L('against', 'נגד')}{vote.abstain !== undefined && <> · <SupportCount value={vote.abstain} /> {vote.abstain === 1 ? L('abstaining', 'נמנע') : L('abstaining', 'נמנעים')}</>}</> : <SupportCount value={null} />}</strong> <Evidence data={data} cites={g.confidenceVoteCites} explanation={reconciliation} notes={[g.reconciliation.note]} /></span>}
      {g.supportSeats != null && <span>{L('Outside support', 'תמיכה מבחוץ')} <strong className="after-support-total"><SupportCount value={g.supportSeats} /></strong></span>}
    </div>
    {/* why there is no total (20 Nov 2026): a faction size not recorded, a faction whose place is not recorded, or members not all known */}
    {g.coalitionSeats == null && <p className="small muted after-size-note">{g.coalition.some(r => r.seats == null)
      ? L('The size of each faction at that time is not recorded, so the coalition’s seats are not added up; the seats won at the election are not used instead.', 'גודל הסיעות באותה עת לא תועד, ולכן מושבי הקואליציה אינם מסוכמים; המנדטים שבהם זכו בבחירות אינם משמשים במקומם.')
      : g.coalition.some(r => r.certainty === 'unknown')
        ? L('A faction whose place in the coalition is not recorded is listed under “Unknown role” and not counted, so the total is a minimum.', 'סיעה שמעמדה בקואליציה לא תועד מופיעה תחת "מעמד לא ידוע" ואינה נספרת, ולכן הסכום הוא מינימום.')
        : L('Not every member of the coalition is known, so the total is a minimum.', 'לא כל חברי הקואליציה ידועים, ולכן הסכום הוא מינימום.')}</p>}
    {supportRoleGroups(g.coalition).map(group => <div className="after-role-group" data-support-role={group.role} key={group.role}>
      <h4>{L(...SUPPORT_LABELS[group.role])}</h4>
      <div className="after-coalition">{group.rows.map((entry, i) => {
        const { list, name, hebrew } = participantName(entry, ds.lists, lang);
        return <span key={i} className="after-party" style={{ '--party': list?.color ?? 'var(--axis)' } as CSSProperties}>
          {(entry.letters ?? list?.letters) && <bdi lang="he">{entry.letters ?? list?.letters}</bdi>}<bdi className="after-party-name" lang={hebrew ? 'he' : undefined}>{name}</bdi>{entry.seats != null && <> <b><SupportCount value={entry.seats} /></b></>}
          {entry.certainty === 'provisional' && <span className="small muted">{L('Provisional', 'זמני')}</span>}
          <Evidence data={data} cites={entry.cites} notes={entry.note ? [entry.note] : []} explanation={[qualification(entry), lang === 'he' ? entry.noteHe : entry.noteEn].filter(Boolean).join(' ') || undefined} />
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
        <span className="after-help-anchor">{votes[person.vote]} <Evidence data={data} cites={person.cites} explanation={person.countedInFactionSeats ? L('Already included in the list seat count. The faction role does not establish a personal ministerial appointment or support.', 'כלול כבר במנדטים של הרשימה. מעמד הסיעה אינו מעיד על מינוי אישי לשר או על תמיכה אישית.'): qualification(person)} notes={person.note ? [person.note] : []} /></span>
      </div>;
    })}</div>}
  </div>;
}

/** The only input is the immutable election dataset; scenario edits never enter this page. */
export function AfterElection({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const data = reviewedAftermath(ds.id);
  const elections = useStore(s => s.elections);
  // a tool set to Hidden (Custom) is not offered by any link
  const sourcesShown = useShown('sources');
  if (!data) return <p>{L('History has not yet been reviewed.', 'ההיסטוריה טרם נבדקה.')}</p>;
  const government = data.government; const termEvents = visibleTermEvents(data.term.events);
  const direct = data.formation.events.find(e => e.type === 'direct-election');
  const polls = completePolls(data); const next = data.term.endedBy;
  // the fact that ended the term takes its place among the term's events by date (V2 fault A2, 19 Nov 2026): placed
  // after them it read as the last event even when, say, Eichmann's trial came after the dissolution law
  const termRows = termWithEnd(termEvents, termEndFact(data));
  const nextId = (next?.nextElection?.startsWith('k') ? next.nextElection : `k${Number(ds.id.slice(1)) + 1}`) as typeof ds.id;
  const nextData = reviewedAftermath(nextId);
  const nextEntry = elections.find(e => e.id === nextId);
  return <article className="after-election" data-election={ds.id}>
    <p className="muted small">{L('Recorded history · checked', 'היסטוריה מתועדת · נבדק')} <span className="after-help-anchor"><DateRun date={data.reviewedAt} /> <Info title={L('Recorded history', 'היסטוריה מתועדת')}>{L('These facts use the official election result. Editing votes does not change history. Unknown recommendations do not mean no recommendation.', 'העובדות מבוססות על תוצאות הבחירות הרשמיות. עריכת קולות אינה משנה את ההיסטוריה. המלצה שלא תועדה אינה זהה להיעדר המלצה.')}</Info></span></p>
    {direct ? <p><HelpText data={data} text={L('PM elected directly – no recommendations', 'ראש הממשלה נבחר ישירות – ללא המלצות')} cites={direct.cites} /></p> : data.recommendationRounds.length > 0 && <section><h3>{L('Recommendations to the President', 'המלצות לנשיא')}</h3>{data.recommendationRounds.map(round => <Recommendations key={round.id} data={data} ds={ds} round={round} />)}</section>}
    <Formation data={data} />
    {government && <section><h3><bdi>{L('Government ', 'הממשלה ')}<bdi dir={lang === 'he' ? 'rtl' : 'ltr'}>{lang === 'he' ? hebrewPrefix('ה', government.number) : government.number}</bdi></bdi> · <span className="after-help-anchor"><DateRun date={government.startDate} end={government.endDate} /> <Evidence data={data} cites={[...government.cites, ...government.endDateCites ?? []]} notes={[...government.notes ?? [], ...government.coalitionSeatsNote ? [government.coalitionSeatsNote] : []]} /></span></h3>
      <div className="after-pms">{government.primeMinisters.map((p, i) => <span key={i}>{i > 0 && <bdi className="after-forward" dir="ltr">{lang === 'he' ? '←' : '→'}</bdi>}<bdi>{lang === 'he' ? p.nameHe : p.nameEn}</bdi>{p.titleEn && <span className="after-pm-title"> (<bdi>{lang === 'he' ? p.titleHe : p.titleEn}</bdi>)</span>} · <DateRun date={p.from} /></span>)}</div>
      <Rotation number={government.number} />
      <GovernmentComposition data={data} ds={ds} government={government} />
      {!!government.changes?.length && <details><summary>{L('Government changes', 'שינויים בממשלה')}</summary>{chronological(government.changes).map((change, i) => <div className="after-government-change" key={i}><FactRows data={data} events={[change]} />{change.coalition && <GovernmentComposition data={data} ds={ds} government={change as SupportSnapshot} investiture={change.number !== undefined} />}</div>)}</details>}
    </section>}
    <TermTimeline ds={ds} />
    {!!data.reaction?.items.length && <section><h3>{L('Statements & institutional steps', 'הצהרות וצעדים מוסדיים')}</h3><FactRows data={data} events={data.reaction.items} /></section>}
    {polls.map((p, i) => <section key={i}><h3>{p.timing === 'after-election' ? L('After-election polling', 'סקרים לאחר הבחירות') : L('Issue polling', 'סקרי סדר יום')} · <span className="after-help-anchor"><DateRun date={p.date ?? p.fieldDates!.to} /> <Evidence data={data} cites={[...p.cites ?? [], { source: p.sourceId, quote: lang === 'he' ? p.questionHe! : p.questionEn! }]} /></span></h3><p className="small muted"><HistoryText text={(lang === 'he' ? p.populationHe : p.populationEn)!} /> · <DateRun date={p.fieldDates!.from} end={p.fieldDates!.to} /></p>{p.answers.map((a, j) => <div className="after-poll" key={j}><span><HistoryText text={(lang === 'he' ? a.labelHe : a.labelEn)!} /></span><meter dir="ltr" min="0" max="100" value={a.pct} /><b><bdi dir="ltr">{a.pct}%</bdi></b></div>)}</section>)}
    {termRows.length > 0 && <section><h3>{L('During the term', 'במהלך הכהונה')}</h3><FactRows data={data} events={termRows} /></section>}
    {nextData && <footer><button className="btn" onClick={() => { void openElection(nextId).then(() => setState({ tool: 'after' })); window.scrollTo({ top: 0 }); }}><bdi dir="ltr" className="after-forward">{lang === 'he' ? '←' : '→'}</bdi> {L('Next election', 'הבחירות הבאות')} · {nextEntry ? <bdi>{electionLabel(nextEntry, elections, lang)}</bdi> : <DateRun date={nextData.results.electionDate} />}</button></footer>}
    {sourcesShown && <button className="btn small after-sources-btn" onClick={() => setState({ tool: 'sources' })}>{L('Sources & research coverage', 'מקורות וכיסוי המחקר')} <span aria-hidden>{lang === 'he' ? '‹' : '›'}</span></button>}
  </article>;
}

export function AfterElectionSources({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const kind = useKindLabel(); const data = reviewedAftermath(ds.id);
  if (!data) return null;
  const excluded = data.term.events.filter(e => !visibleTermEvents([e]).length);
  // one row per address, official first, each named and dated (c-design-principles-17, c-rtl-phone-06)
  return <section className="after-sources"><h3>{L('After the election · sources', 'אחרי הבחירות · מקורות')}</h3><ul className="after-source-list small">{sourceRows(data, lang).map(r => <li key={r.sources[0].url}>{r.sources.length === 1
      ? <a href={r.sources[0].url} target="_blank" rel="noreferrer"><bdi><HistoryText text={r.label} /></bdi></a>
      : <><bdi><HistoryText text={r.label} /></bdi> {r.sources.map((s, i) => <Fragment key={s.url}>{i > 0 && ' · '}<a href={s.url} target="_blank" rel="noreferrer" aria-label={`${r.label} ${i + 1}`}><bdi dir="ltr">{i + 1}</bdi></a></Fragment>)}</>}
      {' '}<span className="muted">· {kind(r.sources[0])} · {L('Retrieved', 'נשלף')} <DateRun date={r.accessed} /></span></li>)}</ul>{/* events still waiting for a second source are research records (data/meta/aftermath, term.candidatesPending):
     they never show to visitors, in any language (S2, 19 Nov 2026) */}
    {excluded.length > 0 && <details><summary>{L('Pending corroboration · excluded from history', 'ממתינים לאימות נוסף · אינם מוצגים בהיסטוריה')}</summary>{excluded.map((e, i) => <div key={i}><DateRun date={e.date} /> · <FactText data={data} event={e} /></div>)}</details>}</section>;
}
