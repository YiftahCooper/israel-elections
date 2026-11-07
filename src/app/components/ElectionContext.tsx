import { hebrewPrefix } from '../hebrewPrefix.ts';
import { useFloating } from '../floating.tsx';
import { electionContext, type ContextSource, type PMContest } from '../../data/electionContext.ts';
import type { ElectionId } from '../../data/schema.ts';
import { useL, useLang } from '../i18n.ts';
import { setState, useStore } from '../store.ts';
import { useEffect, useRef, useState } from 'react';
import { listLabel } from '../derive.ts';

const ordinal = (n: number) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');

export function EvidenceLink({ source }: { source: ContextSource }) {
  const L = useL(); const lang = useLang();
  const label = source.evidence === 'official' ? L('Official', 'רשמי') : source.evidence === 'secondary' ? L('Secondary', 'מקור משני') : L('Unresolved', 'טרם הוברר');
  return <a href={source.url} target="_blank" rel="noreferrer" className="context-source">{lang === 'he' ? source.publisherHe : source.publisher} · {label}{source.verification === 'report-only' && <> · {L('Unverified in this build; report transcription', 'לא אומת בבנייה זו; תעתיק מהדוח')}</>}</a>;
}

/** Immutable history, deliberately independent of the scenario/action log. */
export function ElectionAbout({ electionId, listId }: { electionId: ElectionId; listId?: string }) {
  const L = useL(); const lang = useLang();
  // the result's own status leads; the rest read as a timeline (the record order groups by list)
  const events = electionContext.events.filter(e => e.electionId === electionId && (!listId || e.listId === listId))
    .sort((a, b) => Number(b.type === 'publication-status') - Number(a.type === 'publication-status') || a.effectiveDate.localeCompare(b.effectiveDate));
  const lists = useStore(st => st.datasets[electionId]?.lists);
  // the band's About is a popover: like the other menus it closes on Escape or a press outside it
  const ref = useRef<HTMLDetailsElement>(null);
  const popup = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  useFloating(popup, () => ref.current?.querySelector('summary')?.getBoundingClientRect(), open && !listId);
  useEffect(() => {
    if (listId) return;
    const onKey = (e: KeyboardEvent) => { const d = ref.current; if (e.key === 'Escape' && d?.open) { d.open = false; d.querySelector('summary')?.focus({preventScroll:true}); } };
    const onDown = (e: PointerEvent) => { const d = ref.current; if (d?.open && !d.contains(e.target as Node)) d.open = false; };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [listId]);
  if (listId && !events.length) return null;
  const pending = events.find(e => e.type === 'publication-status');
  // in the election's own About, a list's event says which list ("this list" alone is ambiguous there)
  const listName = (id?: string) => { const l = !listId && id ? lists?.find(x => x.id === id) : undefined; return l ? <b><bdi>{listLabel(l, lang)}</bdi>: </b> : null; };
  return <details ref={ref} onToggle={e => setOpen(e.currentTarget.open)} className={`election-about ${pending ? 'publication-pending' : ''}`}>
    <summary>{L('About', 'אודות')}{pending && <><span className="publication-summary"> · {L('Gazette not yet verified', 'רשומות: טרם אומת')}</span><span className="publication-short" title={L('Gazette publication not yet verified', 'הפרסום ברשומות טרם אומת')}> · {L('Not yet verified', 'טרם אומת')}</span></>}</summary>
    <ul ref={popup}>{!listId && <li><button className="table-action" onClick={() => { setState({ tool: 'after' }); window.scrollTo({ top: 0 }); if (ref.current) ref.current.open = false; }}>{L('Government & term →', 'הממשלה והכהונה ←')}</button></li>}{events.map(e => <li key={e.id}>
      <time dateTime={e.effectiveDate}>{e.effectiveDate}</time> · {listName(e.listId)}{e.source.evidence === 'unresolved' && <strong>{L('Unresolved: ', 'טרם הוברר: ')}</strong>}{lang === 'he' ? e.textHe : e.textEn}{' '}
      <EvidenceLink source={e.source} />{e.relatedSources?.map(s => <span key={s.url}> · <EvidenceLink source={s} /></span>)}
    </li>)}{!listId && <li className="independence-note"><b>{L('Independent election simulator', 'סימולטור בחירות עצמאי')}</b><br />{L('Seats are computed by deterministic code from the official results (Central Elections Committee, Reshumot); secondary sources are labelled under Sources. Not affiliated with the CEC or any party.', 'המנדטים מחושבים בקוד דטרמיניסטי מהתוצאות הרשמיות (ועדת הבחירות המרכזית, רשומות); מקורות משניים מסומנים בלשונית מקורות. אין קשר לוועדת הבחירות או לאף מפלגה.')}</li>}</ul>
  </details>;
}

export function PMResult({ contest, onKnesset }: { contest: PMContest; onKnesset?: () => void }) {
  const L = useL(); const lang = useLang();
  const num = (n: number) => n.toLocaleString(lang === 'he' ? 'he-IL' : 'en-US');
  const b = electionContext.ballotIndependence;
  return <section className="panel pm-result" aria-label={L('Prime Minister result', 'תוצאות הבחירות לראש הממשלה')}>
    <header><h2>{L('Prime Minister', 'ראש הממשלה')} · {contest.effectiveDate}</h2></header>
    <div className="body">
      {contest.contestType === 'prime-minister-only' && <p>{L(`No Knesset was elected in this election. Knesset ${contest.electionId.slice(1)} continued serving, with its seats unchanged.`, `בבחירות אלה לא נבחרה כנסת. הכנסת ${hebrewPrefix('ה', contest.electionId.slice(1))} המשיכה לכהן, ללא שינוי במנדטים.`)} <button className="btn small" onClick={onKnesset}>{L(`The ${ordinal(Number(contest.electionId.slice(1)))} Knesset`, `לכנסת ${hebrewPrefix('ה', contest.electionId.slice(1))}`)}</button></p>}
      <p className="small muted">{L('Historical result · separate PM ballot · read only', 'תוצאה היסטורית · פתק נפרד לראש הממשלה · לקריאה בלבד')}</p>
      <div className="pm-bars">
        <div className="pm-majority-label">{L('50% of valid PM votes', '50% מהקולות הכשרים לראש הממשלה')}</div>
        {contest.candidates.filter(c => c.status === 'final').map(c => {
          const share = c.votes!.value / contest.totals.valid.value * 100;
          return <div className="pm-candidate" key={c.id}>
            <div>{lang === 'he' ? c.nameHe : c.nameEn} <strong>{num(c.votes!.value)}</strong> · {(c.publishedPercent?.value ?? share).toFixed(2)}%</div>
            <div className="pm-track" aria-hidden="true"><span style={{ width: `${share}%` }} /><i /></div>
          </div>;
        })}
      </div>
      <EvidenceLink source={contest.source} />
      <details className="pm-evidence"><summary>{L('Ballot totals & sources', 'סיכומי ההצבעה ומקורות')}</summary>
        <dl>{(['valid', 'invalid', 'cast'] as const).map(key => <div key={key}><dt>{key === 'valid' ? L('Valid', 'כשרים') : key === 'invalid' ? L('Invalid', 'פסולים') : L('Cast', 'מצביעים')}</dt><dd>{num(contest.totals[key].value)} · <EvidenceLink source={contest.totals[key].source} /></dd></div>)}</dl>
        <p>{lang === 'he' ? b.textHe : b.textEn} <EvidenceLink source={b.source} /></p>
        {contest.noteEn && <p>{lang === 'he' ? contest.noteHe : contest.noteEn}</p>}
      </details>
      {contest.candidates.some(c => c.status === 'withdrawn') && <details><summary>{L('Withdrawn nominees', 'מועמדים שפרשו')} ({contest.candidates.filter(c => c.status === 'withdrawn').length})</summary><ul>{contest.candidates.filter(c => c.status === 'withdrawn').map(c => <li key={c.id}>{lang === 'he' ? c.nameHe : c.nameEn} · {L('Withdrawn before polling', 'פרש לפני ההצבעה')} · <EvidenceLink source={c.source!} /></li>)}</ul></details>}
    </div>
  </section>;
}
