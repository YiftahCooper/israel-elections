import type { CSSProperties } from 'react';
import { reviewedAftermath, recommendationPieces, visibleTermEvents, completePolls, type Aftermath, type Cite, type DatedFact, type RecommendationRound } from '../../data/aftermath-runtime.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { openElection, setState } from '../store.ts';
import { Info } from './ui.tsx';
import './AfterElection.css';

function Evidence({ data, cites = [], notes = [] }: { data: Aftermath; cites?: Cite[]; notes?: string[] }) {
  const L = useL(); const lang = useLang();
  return <Info title={L('Sources & qualifications', 'מקורות וסייגים')}>
    {cites.map((c, i) => { const s = data.sources[c.source]; return s && <div key={i} className="after-evidence"><a href={s.url} target="_blank" rel="noreferrer">{lang === 'he' ? s.publisherHe ?? new URL(s.url).hostname : s.publisher ?? s.title ?? new URL(s.url).hostname}</a> · {s.kind === 'official' ? L('Official', 'רשמי') : s.kind === 'archival' ? L('Archival', 'ארכיוני') : s.kind === 'academic' ? L('Academic', 'אקדמי') : L('Secondary', 'משני')} · {s.accessed}<blockquote dir="auto">{c.quote}</blockquote></div>; })}
    {notes.length > 0 && <details><summary>{L('Research notes · original language', 'הערות מחקר · בשפת המקור')}</summary>{notes.map((n, i) => <p key={i} dir="auto">{n}</p>)}</details>}
  </Info>;
}
function FactRows({ data, events }: { data: Aftermath; events: DatedFact[] }) {
  const lang = useLang(); const L = useL();
  const categories: Record<string, [string, string, string]> = { governance: ['⚖', 'Governance', 'ממשל'], politics: ['▣', 'Politics', 'פוליטיקה'], economy: ['₪', 'Economy', 'כלכלה'], 'foreign-relations': ['◎', 'Foreign relations', 'יחסי חוץ'], security: ['◇', 'Security', 'ביטחון'], society: ['●', 'Society', 'חברה'] };
  return <ol className="after-events">{events.map((e, i) => <li key={i}><time dateTime={e.date}>{e.date}{e.endDate && <> – {e.endDate}</>}</time><span>{e.category && categories[e.category] && <span className="after-category" role="img" aria-label={L(categories[e.category][1], categories[e.category][2])}>{categories[e.category][0]} </span>}{lang === 'he' ? e.textHe : e.textEn} <Evidence data={data} cites={e.cites} notes={e.notes} /></span></li>)}</ol>;
}
function Recommendations({ data, ds, round }: { data: Aftermath; ds: ElectionDataset; round: RecommendationRound }) {
  const L = useL(); const lang = useLang();
  const pieces = recommendationPieces(round);
  const groupLabel = (key: string) => round.nominees[key] ? (lang === 'he' ? round.nominees[key].nameHe : round.nominees[key].nameEn) : key === 'none' ? L('No recommendation', 'ללא המלצה') : key === 'other' ? L('Other', 'אחר') : L('Not documented', 'לא מתועד');
  const tail = (key: string) => key === 'unknown' ? 3 : key === 'none' ? 2 : key === 'other' || key === 'knesset' ? 1 : 0;
  const groups = Object.entries(round.totals).sort(([a, x], [b, y]) => tail(a) - tail(b) || y - x);
  const list = (letters: string) => ds.lists.find(l => l.letters === letters)!;
  return <div className="after-round">
    <h4><time dateTime={round.date}>{round.date}{round.endDate && ` – ${round.endDate}`}</time> <Evidence data={data} cites={round.cites} notes={round.notes} /></h4>
    <div className="after-bar-wrap"><div className="after-bar" dir="ltr" aria-hidden="true">{groups.map(([key, total]) => <div key={key} className="after-group" style={{ flex: total }}>{pieces.filter(p => p.group === key).map((p, i) => <span key={i} className={key === 'unknown' ? 'after-unknown' : ''} style={{ flex: p.seats, backgroundColor: key === 'unknown' ? undefined : list(p.letters).color }} title={`${p.letters} · ${listLabel(list(p.letters), lang)} · ${p.seats}`}>{p.seats >= 6 && <bdi className={p.seats < 10 ? 'after-small-slip' : undefined} lang="he">{p.letters}</bdi>}</span>)}</div>)}<i className="after-majority">61</i></div></div>
    <div className="after-key">{groups.map(([key, total]) => <span key={key}>{groupLabel(key)} <b>{total}</b></span>)}</div>
    <details className="after-breakdown"><summary>{L('Lists & recommendations', 'רשימות והמלצות')}</summary><table><thead><tr><th>{L('List', 'רשימה')}</th><th>{L('Recommendation', 'המלצה')}</th><th>{L('Seats', 'מנדטים')}</th></tr></thead><tbody>{groups.flatMap(([key]) => pieces.filter(p => p.group === key).map((p, i) => <tr key={`${key}-${i}`}><td><span className="after-party" style={{ '--party': list(p.letters).color } as CSSProperties}><bdi lang="he">{p.letters}</bdi> {listLabel(list(p.letters), lang)}</span></td><td>{groupLabel(key)} <Evidence data={data} cites={p.cites} /></td><td>{p.seats}</td></tr>))}</tbody></table></details>
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
  return <section><h3>{L('Government formation', 'הרכבת הממשלה')}</h3><div className="after-formation" dir="ltr" aria-hidden="true"><div className="after-date-line"><span>{data.results.electionDate}</span><span>{events.at(-1)!.date}</span>{events.map((e, i) => <i key={i} style={{ left: `${pos(e.date)}%` }} title={e.date} />)}</div>{mandates.map((e, i) => {
    const end = events.find(f => f.date > e.date && ['mandate-expired', 'mandate-returned', 'confidence-vote', 'informed-success'].includes(f.type ?? ''))?.date ?? events.at(-1)!.date;
    const nominee = e.person ? nominees[e.person] : undefined;
    const extension = events.find(f => f.type === 'extension' && f.date >= e.date && f.date < end);
    const boundary = extension ? (pos(extension.date) - pos(e.date)) / Math.max(1, pos(end) - pos(e.date)) * 100 : 100;
    return <div key={i} className="after-mandate"><small>{nominee ? (lang === 'he' ? nominee.nameHe : nominee.nameEn) : L('Mandate', 'מנדט')}</small><span style={{ background: `linear-gradient(to right, var(--axis) ${boundary}%, var(--rule-2) ${boundary}%)`, marginLeft: `${pos(e.date)}%`, width: `${Math.max(1, pos(end) - pos(e.date))}%` }} title={`${e.date} – ${end}`} /></div>;
  })}</div><FactRows data={data} events={events} />{data.formation.conflicts?.length ? <Evidence data={data} notes={data.formation.conflicts.map(c => JSON.stringify(c))} /> : null}</section>;
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
    <p className="muted small">{L('Recorded history · checked', 'היסטוריה מתועדת · נבדק')} <time>{data.reviewedAt}</time> <Info title={L('Recorded history', 'היסטוריה מתועדת')}>{L('These facts use the official election result. Editing votes does not change history. Unknown recommendations do not mean no recommendation.', 'העובדות מבוססות על תוצאות הבחירות הרשמיות. עריכת קולות אינה משנה את ההיסטוריה. המלצה שלא תועדה אינה זהה להיעדר המלצה.')}</Info></p>
    {direct ? <p>{L('PM elected directly – no recommendations', 'ראש הממשלה נבחר ישירות – ללא המלצות')} <Evidence data={data} cites={direct.cites} /></p> : data.recommendationRounds.length > 0 && <section><h3>{L('Recommendations to the President', 'המלצות לנשיא')}</h3>{data.recommendationRounds.map(round => <Recommendations key={round.id} data={data} ds={ds} round={round} />)}</section>}
    <Formation data={data} />
    {government && <section><h3>{L(`Government ${government.number}`, `הממשלה ה־${government.number}`)} · <time>{government.startDate}{government.endDate && ` – ${government.endDate}`}</time> <Evidence data={data} cites={[...government.cites, ...government.endDateCites ?? []]} notes={[...government.notes ?? [], ...government.coalitionSeatsNote ? [government.coalitionSeatsNote] : []]} /></h3>
      <div className="after-pms">{government.primeMinisters.map((p, i) => <span key={i}>{i > 0 && ' → '}{lang === 'he' ? p.nameHe : p.nameEn} · <time>{p.from}</time></span>)}</div>
      <h4>{L('Coalition & supporting lists', 'קואליציה ורשימות תומכות')} <b>{government.coalitionSeats}</b></h4><div className="after-coalition">{government.coalition.map((c, i) => { const l = ds.lists.find(l => l.letters === c.letters)!; return <span key={i} className="after-party" style={{ '--party': l.color } as CSSProperties}><bdi lang="he">{c.letters}</bdi> {listLabel(l, lang)} <b>{c.coalitionSeats ?? c.seats}</b>{(c.note || c.electionSeats) && <Evidence data={data} cites={government.cites} notes={[c.note ?? '', `Election seats: ${c.electionSeats ?? c.seats}`]} />}</span>; })}</div>
      {!!government.changes?.length && <details><summary>{L('Government changes', 'שינויים בממשלה')}</summary><FactRows data={data} events={government.changes} /></details>}
    </section>}
    {!!data.reaction?.items.length && <section><h3>{L('Statements & institutional steps', 'הצהרות וצעדים מוסדיים')}</h3><FactRows data={data} events={data.reaction.items} /></section>}
    {polls.map((p, i) => <section key={i}><h3>{p.timing === 'after-election' ? L('After-election polling', 'סקרים לאחר הבחירות') : L('Issue polling', 'סקרי סדר יום')} · {p.date ?? p.fieldDates!.to} <Evidence data={data} cites={[...p.cites ?? [], { source: p.sourceId, quote: lang === 'he' ? p.questionHe! : p.questionEn! }]} /></h3><p className="small muted">{lang === 'he' ? p.populationHe : p.populationEn} · {p.fieldDates!.from} – {p.fieldDates!.to}</p>{p.answers.map((a, j) => <div className="after-poll" key={j}><span>{lang === 'he' ? a.labelHe : a.labelEn}</span><meter dir="ltr" min="0" max="100" value={a.pct} /><b>{a.pct}%</b></div>)}</section>)}
    {termEvents.length > 0 && <section><h3>{L('During the term', 'במהלך הכהונה')}</h3><FactRows data={data} events={termEvents} /></section>}
    {nextData && <footer>{next?.cites?.length ? <FactRows data={data} events={[next]} /> : null}<button className="btn" onClick={() => { void openElection(nextId).then(() => setState({ tool: 'after' })); window.scrollTo({ top: 0 }); }}>{L('→ Next election', '→ הבחירות הבאות')} · {nextId.slice(1)} · {nextData.results.electionDate}</button></footer>}
    <button className="table-action" onClick={() => setState({ tool: 'sources' })}>{L('Sources & research coverage', 'מקורות וכיסוי המחקר')}</button>
  </article>;
}

export function AfterElectionSources({ ds }: { ds: ElectionDataset }) {
  const L = useL(); const lang = useLang(); const data = reviewedAftermath(ds.id);
  if (!data) return null;
  const excluded = data.term.events.filter(e => !visibleTermEvents([e]).length);
  return <section className="after-sources"><h3>{L('After the election · sources', 'אחרי הבחירות · מקורות')}</h3>{Object.entries(data.sources).map(([id, s]) => <div key={id}><Evidence data={data} cites={[{ source: id, quote: '' }]} /> <a href={s.url} target="_blank" rel="noreferrer">{lang === 'he' ? s.publisherHe ?? new URL(s.url).hostname : s.publisher ?? s.title ?? new URL(s.url).hostname}</a></div>)}{(data.term.candidatesPending.length > 0 || excluded.length > 0) && <details><summary>{L('Pending corroboration · excluded from history', 'ממתינים לאימות נוסף · אינם מוצגים בהיסטוריה')}</summary>{excluded.map((e, i) => <p key={i}>{e.date} · {lang === 'he' ? e.textHe : e.textEn} <Evidence data={data} cites={e.cites} /></p>)}<p className="small muted">{L('Research notes · original language', 'הערות מחקר · בשפת המקור')}</p>{data.term.candidatesPending.map((e, i) => <p key={i} lang="en" dir="ltr">{e.date} · {e.label} · {e.why}</p>)}</details>}</section>;
}
