import type { CSSProperties } from 'react';
import { reviewedAftermath, recommendationPieces, visibleTermEvents, completePolls, type Aftermath, type Cite, type DatedFact, type RecommendationRound } from '../../data/aftermath-runtime.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { openElection, setState } from '../store.ts';
import { Info } from './ui.tsx';
import { formatAfterDate } from '../afterDate.ts';
import './AfterElection.css';

/** Isolate the whole chronological range, and each localised endpoint within it. */
function DateRun({ date, end }: { date: string; end?: string }) {
  const lang = useLang();
  return <bdi dir="ltr" className="after-date-run"><time dateTime={date} dir={lang === 'he' ? 'rtl' : 'ltr'}>{formatAfterDate(date, lang)}</time>{end && <> – <time dateTime={end} dir={lang === 'he' ? 'rtl' : 'ltr'}>{formatAfterDate(end, lang)}</time></>}</bdi>;
}

/** Covers numbers and embedded ISO dates in all 26 records, including future prose additions.
 * Verbatim source quotations retain their exact text, with bidi isolation only. */
function HistoryText({ text, verbatim = false }: { text: string; verbatim?: boolean }) {
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

function HelpText({ data, text, cites, notes }: { data: Aftermath; text: string; cites?: Cite[]; notes?: string[] }) {
  const tail = /^(.*\s)(\S+)$/s.exec(text);
  return <span>{tail && <HistoryText text={tail[1]} />}<span className="after-help-anchor"><HistoryText text={tail?.[2] ?? text} /> <Evidence data={data} cites={cites} notes={notes} /></span></span>;
}
function FactText({ data, event }: { data: Aftermath; event: DatedFact }) {
  const lang = useLang();
  return <HelpText data={data} text={lang === 'he' ? event.textHe : event.textEn} cites={event.cites} notes={event.notes} />;
}

function Evidence({ data, cites = [], notes = [] }: { data: Aftermath; cites?: Cite[]; notes?: string[] }) {
  const L = useL(); const lang = useLang();
  return <Info title={L('Sources & qualifications', 'מקורות וסייגים')}>
    {cites.map((c, i) => { const s = data.sources[c.source]; return s && <div key={i} className="after-evidence"><a href={s.url} target="_blank" rel="noreferrer"><HistoryText text={lang === 'he' ? s.publisherHe ?? new URL(s.url).hostname : s.publisher ?? s.title ?? new URL(s.url).hostname} /></a> · {s.kind === 'official' ? L('Official', 'רשמי') : s.kind === 'archival' ? L('Archival', 'ארכיוני') : s.kind === 'academic' ? L('Academic', 'אקדמי') : L('Secondary', 'משני')} · <DateRun date={s.accessed} /><blockquote dir="auto"><HistoryText text={c.quote} verbatim /></blockquote></div>; })}
    {notes.length > 0 && <details><summary>{L('Research notes · original language', 'הערות מחקר · בשפת המקור')}</summary>{notes.map((n, i) => <p key={i} dir="auto"><HistoryText text={n} verbatim /></p>)}</details>}
  </Info>;
}
function FactRows({ data, events }: { data: Aftermath; events: DatedFact[] }) {
  return <ol className="after-events">{events.map((e, i) => <li key={i}><DateRun date={e.date} end={e.endDate} /><FactText data={data} event={e} /></li>)}</ol>;
}
function Recommendations({ data, ds, round }: { data: Aftermath; ds: ElectionDataset; round: RecommendationRound }) {
  const L = useL(); const lang = useLang();
  const pieces = recommendationPieces(round);
  const groupLabel = (key: string) => round.nominees[key] ? (lang === 'he' ? round.nominees[key].nameHe : round.nominees[key].nameEn) : key === 'none' ? L('No recommendation', 'ללא המלצה') : key === 'other' ? L('Other', 'אחר') : L('Not documented', 'לא מתועד');
  const tail = (key: string) => key === 'unknown' ? 3 : key === 'none' ? 2 : key === 'other' || key === 'knesset' ? 1 : 0;
  const groups = Object.entries(round.totals).sort(([a, x], [b, y]) => tail(a) - tail(b) || y - x);
  const list = (letters: string) => ds.lists.find(l => l.letters === letters)!;
  return <div className="after-round">
    <h4><span className="after-help-anchor"><DateRun date={round.date} end={round.endDate} /> <Evidence data={data} cites={round.cites} notes={round.notes} /></span></h4>
    <div className="after-bar-wrap"><div className="after-bar" dir="ltr" aria-hidden="true">{groups.map(([key, total]) => <div key={key} className="after-group" style={{ flex: total }}>{pieces.filter(p => p.group === key).map((p, i) => <span key={i} className={key === 'unknown' ? 'after-unknown' : ''} style={{ flex: p.seats, backgroundColor: key === 'unknown' ? undefined : list(p.letters).color }} title={`${p.letters} · ${listLabel(list(p.letters), lang)} · ${p.seats}`}>{p.seats >= 6 && <bdi className={p.seats < 10 ? 'after-small-slip' : undefined} lang="he">{p.letters}</bdi>}</span>)}</div>)}<i className="after-majority">61</i></div></div>
    <div className="after-key">{groups.map(([key, total]) => <span key={key}><bdi>{groupLabel(key)}</bdi> <b><bdi dir="ltr">{total}</bdi></b></span>)}</div>
    <details className="after-breakdown"><summary>{L('Lists & recommendations', 'רשימות והמלצות')}</summary><table><thead><tr><th>{L('List', 'רשימה')}</th><th>{L('Recommendation', 'המלצה')}</th><th>{L('Seats', 'מנדטים')}</th></tr></thead><tbody>{groups.flatMap(([key]) => pieces.filter(p => p.group === key).map((p, i) => <tr key={`${key}-${i}`}><td><span className="after-party" style={{ '--party': list(p.letters).color } as CSSProperties}><bdi lang="he">{p.letters}</bdi> <bdi>{listLabel(list(p.letters), lang)}</bdi></span></td><td><HelpText data={data} text={groupLabel(key)} cites={p.cites} /></td><td><bdi dir="ltr">{p.seats}</bdi></td></tr>))}</tbody></table></details>
  </div>;
}
function Formation({ data }: { data: Aftermath }) {
  const L = useL(); const lang = useLang();
  const nominees = Object.assign({}, ...data.recommendationRounds.map(r => r.nominees)) as RecommendationRound['nominees'];
  const events = [...data.formation.events].sort((a, b) => a.date.localeCompare(b.date));
  if (!events.length) return null;
  const first = Date.parse(data.results.electionDate); const last = Date.parse(events.at(-1)!.date);
  const pos = (date: string) => (Date.parse(date) - first) / Math.max(last - first, 86400000) * 100;
  const mandates = events.filter(e => e.type === 'mandate-given');
  return <section><h3><span className="after-help-anchor">{L('Government formation', 'הרכבת הממשלה')}{data.formation.conflicts?.length ? <> <Evidence data={data} notes={data.formation.conflicts.map(c => JSON.stringify(c))} /></> : null}</span></h3><div className="after-formation" dir="ltr" aria-hidden="true"><div className="after-date-line"><span><DateRun date={data.results.electionDate} /></span><span><DateRun date={events.at(-1)!.date} /></span>{events.map((e, i) => <i key={i} style={{ left: `${pos(e.date)}%` }} title={formatAfterDate(e.date, lang)} />)}</div>{mandates.map((e, i) => {
    const end = events.find(f => f.date > e.date && ['mandate-expired', 'mandate-returned', 'confidence-vote', 'informed-success'].includes(f.type ?? ''))?.date ?? events.at(-1)!.date;
    const nominee = e.person ? nominees[e.person] : undefined;
    const extension = events.find(f => f.type === 'extension' && f.date >= e.date && f.date < end);
    const boundary = extension ? (pos(extension.date) - pos(e.date)) / Math.max(1, pos(end) - pos(e.date)) * 100 : 100;
    return <div key={i} className="after-mandate"><small><bdi>{nominee ? (lang === 'he' ? nominee.nameHe : nominee.nameEn) : L('Mandate', 'מנדט')}</bdi></small><span style={{ background: `linear-gradient(to right, var(--axis) ${boundary}%, var(--rule-2) ${boundary}%)`, marginLeft: `${pos(e.date)}%`, width: `${Math.max(1, pos(end) - pos(e.date))}%` }} title={`${formatAfterDate(e.date, lang)} – ${formatAfterDate(end, lang)}`} /></div>;
  })}</div><FactRows data={data} events={events} /></section>;
}
/** The only input is the immutable election dataset; scenario edits never enter this page. */
export function AfterElection({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const data = reviewedAftermath(ds.id);
  if (!data) return <p>{L('History has not yet been reviewed.', 'ההיסטוריה טרם נבדקה.')}</p>;
  const government = data.government; const termEvents = visibleTermEvents(data.term.events);
  const direct = data.formation.events.find(e => e.type === 'direct-election');
  const polls = completePolls(data); const next = data.term.endedBy;
  const nextId = (next?.nextElection?.startsWith('k') ? next.nextElection : `k${Number(ds.id.slice(1)) + 1}`) as typeof ds.id;
  const nextData = reviewedAftermath(nextId);
  return <article className="after-election" data-election={ds.id}>
    <p className="muted small">{L('Recorded history · checked', 'היסטוריה מתועדת · נבדק')} <span className="after-help-anchor"><DateRun date={data.reviewedAt} /> <Info title={L('Recorded history', 'היסטוריה מתועדת')}>{L('These facts use the official election result. Editing votes does not change history. Unknown recommendations do not mean no recommendation.', 'העובדות מבוססות על תוצאות הבחירות הרשמיות. עריכת קולות אינה משנה את ההיסטוריה. המלצה שלא תועדה אינה זהה להיעדר המלצה.')}</Info></span></p>
    {direct ? <p><HelpText data={data} text={L('PM elected directly – no recommendations', 'ראש הממשלה נבחר ישירות – ללא המלצות')} cites={direct.cites} /></p> : data.recommendationRounds.length > 0 && <section><h3>{L('Recommendations to the President', 'המלצות לנשיא')}</h3>{data.recommendationRounds.map(round => <Recommendations key={round.id} data={data} ds={ds} round={round} />)}</section>}
    <Formation data={data} />
    {government && <section><h3><bdi>{L('Government ', 'הממשלה ה־')}<bdi dir="ltr">{government.number}</bdi></bdi> · <span className="after-help-anchor"><DateRun date={government.startDate} end={government.endDate} /> <Evidence data={data} cites={[...government.cites, ...government.endDateCites ?? []]} notes={[...government.notes ?? [], ...government.coalitionSeatsNote ? [government.coalitionSeatsNote] : []]} /></span></h3>
      <div className="after-pms">{government.primeMinisters.map((p, i) => <span key={i}>{i > 0 && <bdi className="after-forward" dir="ltr">{lang === 'he' ? '←' : '→'}</bdi>}<bdi>{lang === 'he' ? p.nameHe : p.nameEn}</bdi> · <DateRun date={p.from} /></span>)}</div>
      <h4>{L('Lists at formation', 'רשימות בעת ההקמה')}</h4><div className="after-coalition">{government.coalition.map((c, i) => { const l = ds.lists.find(l => l.letters === c.letters)!; return <span key={i} className="after-party" style={{ '--party': l.color } as CSSProperties}><bdi lang="he">{c.letters}</bdi> <bdi>{listLabel(l, lang)}</bdi> <b><bdi dir="ltr">{c.coalitionSeats ?? c.seats}</bdi></b>{(c.note || c.electionSeats) && <Evidence data={data} cites={government.cites} notes={[c.note ?? '', `Election seats: ${c.electionSeats ?? c.seats}`]} />}</span>; })}</div>
      {!!government.changes?.length && <details><summary>{L('Government changes', 'שינויים בממשלה')}</summary><FactRows data={data} events={government.changes} /></details>}
    </section>}
    {!!data.reaction?.items.length && <section><h3>{L('Statements & institutional steps', 'הצהרות וצעדים מוסדיים')}</h3><FactRows data={data} events={data.reaction.items} /></section>}
    {polls.map((p, i) => <section key={i}><h3>{p.timing === 'after-election' ? L('After-election polling', 'סקרים לאחר הבחירות') : L('Issue polling', 'סקרי סדר יום')} · <span className="after-help-anchor"><DateRun date={p.date ?? p.fieldDates!.to} /> <Evidence data={data} cites={[...p.cites ?? [], { source: p.sourceId, quote: lang === 'he' ? p.questionHe! : p.questionEn! }]} /></span></h3><p className="small muted"><HistoryText text={(lang === 'he' ? p.populationHe : p.populationEn)!} /> · <DateRun date={p.fieldDates!.from} end={p.fieldDates!.to} /></p>{p.answers.map((a, j) => <div className="after-poll" key={j}><span><HistoryText text={(lang === 'he' ? a.labelHe : a.labelEn)!} /></span><meter dir="ltr" min="0" max="100" value={a.pct} /><b><bdi dir="ltr">{a.pct}%</bdi></b></div>)}</section>)}
    {termEvents.length > 0 && <section><h3>{L('During the term', 'במהלך הכהונה')}</h3><FactRows data={data} events={termEvents} /></section>}
    {nextData && <footer>{next?.cites?.length ? <FactRows data={data} events={[next]} /> : null}<button className="btn" onClick={() => { void openElection(nextId).then(() => setState({ tool: 'after' })); window.scrollTo({ top: 0 }); }}><bdi dir="ltr" className="after-forward">{lang === 'he' ? '←' : '→'}</bdi> {L('Next election', 'הבחירות הבאות')} · <bdi dir="ltr">{nextId.slice(1)}</bdi> · <DateRun date={nextData.results.electionDate} /></button></footer>}
    <button className="table-action" onClick={() => setState({ tool: 'sources' })}>{L('Sources & research coverage', 'מקורות וכיסוי המחקר')}</button>
  </article>;
}

export function AfterElectionSources({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const data = reviewedAftermath(ds.id);
  if (!data) return null;
  const excluded = data.term.events.filter(e => !visibleTermEvents([e]).length);
  return <section className="after-sources"><h3>{L('After the election · sources', 'אחרי הבחירות · מקורות')}</h3>{Object.entries(data.sources).map(([id, s]) => <div key={id} className="after-source-row"><Evidence data={data} cites={[{ source: id, quote: '' }]} /> <a href={s.url} target="_blank" rel="noreferrer"><HistoryText text={lang === 'he' ? s.publisherHe ?? new URL(s.url).hostname : s.publisher ?? s.title ?? new URL(s.url).hostname} /></a></div>)}{(data.term.candidatesPending.length > 0 || excluded.length > 0) && <details><summary>{L('Pending corroboration · excluded from history', 'ממתינים לאימות נוסף · אינם מוצגים בהיסטוריה')}</summary>{excluded.map((e, i) => <div key={i}><DateRun date={e.date} /> · <FactText data={data} event={e} /></div>)}<p className="small muted">{L('Research notes · original language', 'הערות מחקר · בשפת המקור')}</p>{data.term.candidatesPending.map((e, i) => <p key={i} lang="en" dir="ltr">{e.date && <><DateRun date={e.date} /> · </>}<HistoryText text={e.label} /> · <HistoryText text={e.why} /></p>)}</details>}</section>;
}
