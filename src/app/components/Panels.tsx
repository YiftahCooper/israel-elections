import { Fragment, useEffect, useMemo, useState } from 'react';
import { isEnvelopeRow, type ElectionDataset } from '../../data/schema.ts';
import { ruleDepartures, RULESETS } from '../../engine/rules.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { electionRuleSetId, toRuleSet, type Action, type Scenario } from '../../model/scenario.ts';
import { listLabel, methodOf } from '../derive.ts';
import { GLOSSARY, useL, useLang, type Lang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { dispatch, getState, redo, replay, setState, undo, useStore, useDigits } from '../store.ts';
import { useLocalities } from './Turnout.tsx';
import { GlossaryLink, Info, NumberInput, TextField } from './ui.tsx';

// ------------------------------------------------------------------ rules

export function Rules({ s, base }: { s: Scenario; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const exp = s.mode === 'experimental';
  const dep = ruleDepartures(toRuleSet(s.rules, null), RULESETS[electionRuleSetId(s.electionId)]);
  const depName: Record<string, [string, string]> = {
    seats: ['Number of seats', 'מספר המושבים'], threshold: ['Threshold', 'אחוז החסימה'], quotaRounding: ['Quota rounding', 'עיגול המודד'],
    remainderMethod: ['Remainder method', 'שיטת חלוקת העודפים'], majorityCap: ['Half-seats cap (81(d)(4))', 'מגבלת מחצית (81(ד)(4))'],
    maxAgreementSize: ['Agreement size', 'גודל הסכם עודפים'], agreementRequiresAllQualify: ['Agreement threshold condition', 'תנאי החסימה בהסכם'],
    quotaSeatOffset: ['Quota divisor (seats + 1 in 1949)', 'מחלק המודד (מושבים + 1 ב-1949)'], remainderRequiresInitialSeat: ['Remainder seats only for lists with a whole quota', 'עודפים רק לרשימות עם מודד שלם'],
    agreementRequiresInitialSeat: ['Agreement needs a whole quota for each partner', 'הסכם מחייב מודד שלם לכל שותפה'], quotientRounding: ['Quotient rounding', 'עיגול המודדים'],
    largestRemainderRepeat: ['Several largest-remainder seats per list', 'כמה מנדטי שארית לרשימה'], tiePolicy: ['Tie procedure', 'הכרעה בשוויון'],
    seatsCappedAtCandidates: ['No more seats than candidates (1977, inferred)', 'לא יותר מנדטים ממועמדים (1977, מוסק)'],
  };
  const set = (patch: Partial<Scenario['rules']>) => dispatch({ type: 'setRules', patch });
  return (
    <div className="grid2" style={{ alignItems: 'start', gap: 18 }}>
      <div>
        <h4>{L('Electoral rules', 'כללי הבחירות')}</h4>
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="seg" role="group" aria-label={L('Simulation mode', 'מצב סימולציה')}>
            <button aria-pressed={!exp} onClick={() => dispatch({ type: 'setMode', mode: 'historical' })}>{L('Historically valid', 'תקף היסטורית')}</button>
            <button aria-pressed={exp} onClick={() => dispatch({ type: 'setMode', mode: 'experimental' })}>{L('Experimental', 'ניסיוני')}</button>
          </span>
        </div>
        <p className="small ink2">{exp
          ? L('Experimental: you may change the electoral system itself. Results are labelled as an alternative system, not Israeli law.', 'ניסיוני: ניתן לשנות את שיטת הבחירות עצמה. התוצאות מסומנות כשיטה חלופית ולא כחוק הישראלי.')
          : L(`Historically valid: the law of this election is enforced — ${s.rules.seats} seats, ${Number(s.rules.thresholdPct) > 0 ? `${s.rules.thresholdPct}% threshold` : 'no percentage threshold'}, ${s.rules.remainderMethod === 'largest-remainder' ? 'largest remainder' : s.rules.remainderRequiresInitialSeat ? 'highest averages' : 'Bader–Ofer'}, two-list agreements. Votes, lists, candidates and agreements can still change.`, `תקף היסטורית: החוק של בחירות אלה נאכף — ${s.rules.seats} מושבים, ${Number(s.rules.thresholdPct) > 0 ? `אחוז חסימה ${s.rules.thresholdPct}%` : 'ללא אחוז חסימה'}, ${s.rules.remainderMethod === 'largest-remainder' ? 'השארית הגדולה' : s.rules.remainderRequiresInitialSeat ? 'הממוצע הגבוה' : 'בדר–עופר'}, הסכמים של שתי רשימות. עדיין ניתן לשנות קולות, רשימות, מועמדים והסכמים.`)}</p>
        {Object.keys(s.lotteryWinners).length > 0 && <p className="small">{L('You have recorded lottery outcomes for tied seats.', 'רשמתם תוצאות הגרלה למושבים בשוויון.')} <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'lottery' })}>{L('Clear them', 'ניקוי')}</button></p>}
        {exp && dep.length > 0 && <div className="callout small" style={{ marginBottom: 8 }}><b>{L('Departs from Israeli law in: ', 'שונה מהחוק הישראלי ב: ')}</b>{dep.map((d) => (lang === 'he' ? depName[d][1] : depName[d][0])).join(', ')}</div>}
        <fieldset disabled={!exp} style={{ border: 0, padding: 0, margin: 0 }}>
          <div className="grid2">
            <label className="field">{L('Seats', 'מושבים')}<NumberInput value={s.rules.seats} onCommit={(n) => set({ seats: n })} label={L('Seats', 'מושבים')} /></label>
            <label className="field">{L('Threshold %', 'אחוז חסימה %')}<TextField value={s.rules.thresholdPct} label={L('Threshold %', 'אחוז חסימה %')} onCommit={(v) => set({ thresholdPct: v.trim().replace('%', '') })} /></label>
            <div className="field"><span><span id="remainder-method-label">{L('Remainder method', 'שיטת העודפים')}</span> <Info term={methodOf(s.rules).term} /></span>
              <select aria-labelledby="remainder-method-label" value={s.rules.remainderMethod} onChange={(e) => set({ remainderMethod: e.target.value as Scenario['rules']['remainderMethod'] })}>
                <option value="bader-ofer">{L('Bader–Ofer (law since 1973)', 'בדר–עופר (החוק מאז 1973)')}</option>
                <option value="largest-remainder">{L('Largest remainder (pre-1973 Israeli rule)', 'שארית גדולה (השיטה לפני 1973)')}</option>
                <option value="sainte-lague">{L('Sainte-Laguë (all seats)', 'סנט-לגה (כל המושבים)')}</option>
                <option value="dhondt">{L('D’Hondt (all seats; same seats as Bader–Ofer without agreements or the half cap)', 'ד׳הונדט (כל המושבים; כמו בדר–עופר ללא הסכמים ומגבלת מחצית)')}</option>
                <option value="modified-sainte-lague">{L('Modified Sainte-Laguë (first divisor 1.4)', 'סנט-לגה מתוקנת (מחלק ראשון 1.4)')}</option>
                <option value="droop">{L('Largest remainder, Droop quota', 'שארית גדולה, מודד דרופ')}</option>
              </select>
            </div>
            <label className="field">{L('Quota rounding', 'עיגול המודד')}
              <select value={s.rules.quotaRounding} onChange={(e) => set({ quotaRounding: e.target.value as 'floor' | 'exact' })}>
                <option value="floor">{L('Whole number (law)', 'מספר שלם (החוק)')}</option><option value="exact">{L('Exact fraction', 'שבר מדויק')}</option>
              </select>
            </label>
            <label className="field">{L('Lists per agreement', 'רשימות בהסכם')}<NumberInput value={s.rules.maxAgreementSize} onCommit={(n) => set({ maxAgreementSize: n })} label={L('Lists per agreement', 'רשימות בהסכם')} /></label>
            <label className="row small"><input type="checkbox" checked={s.rules.majorityCap} onChange={(e) => set({ majorityCap: e.target.checked })} />{L('Half-seats cap', 'מגבלת מחצית')}</label>
            <label className="row small"><input type="checkbox" checked={s.rules.agreementRequiresAllQualify} onChange={(e) => set({ agreementRequiresAllQualify: e.target.checked })} />{L('Agreement needs all partners above threshold', 'הסכם דורש שכל השותפות יעברו')}</label>
          </div>
        </fieldset>
        <hr />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h4>{L('Electorate', 'ציבור הבוחרים')}</h4>
          {(s.registered !== base.registered || s.invalid !== base.invalid) && <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'totals' })}>{L('Restore historical', 'שחזור הנתונים ההיסטוריים')}</button>}
        </div>
        <div className="grid2">
          <label className="field">{L('Registered voters', 'בעלי זכות בחירה')}<NumberInput value={s.registered} onCommit={(n) => dispatch({ type: 'setTotals', registered: n })} label={L('Registered voters', 'בעלי זכות בחירה')} /></label>
          <label className="field">{L('Invalid ballots', 'קולות פסולים')}<NumberInput value={s.invalid} onCommit={(n) => dispatch({ type: 'setTotals', invalid: n })} label={L('Invalid ballots', 'קולות פסולים')} /></label>
        </div>
      </div>
      <div>
        <h4>{L('Blocs', 'גושים')}</h4>
        <p className="small ink2">{L('Choose a grouping, move lists and constituent parties between blocs, and rename or recolour blocs with “Edit blocs” under the bloc bar.', 'בחירת חלוקה, העברת רשימות ומפלגות בין גושים ושינוי שמות וצבעים — ב„עריכת גושים” מתחת לפס הגושים.')}</p>
        <hr />
        <h4>{L('Display', 'תצוגה')}</h4>
        <label className="field" style={{ maxWidth: 220 }}>{L('Decimal places for percentages', 'ספרות אחרי הנקודה באחוזים')}
          <select value={digits} onChange={(e) => setState({ digits: Number(e.target.value) })}>{[0, 1, 2, 3, 4, 6, 8].map((d) => <option key={d} value={d}>{d}</option>)}</select>
        </label>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ localities

export function Localities({ s }: { s: Scenario }) {
  const L = useL();
  const lang = useLang();
  const digits = useDigits();
  const hasLocalities = useStore((st) => st.datasets[s.electionId]?.hasLocalities !== false);
  const { data, error } = useLocalities(s.electionId, hasLocalities);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'registered' | 'turnout' | 'name'>('registered');
  const [open, setOpen] = useState<string | null>(null);
  const histLists = useMemo(() => (data ? data.listIds.map((id) => s.lists.find((l) => l.id === id) ?? null) : []), [data, s]);
  if (!hasLocalities) return <p className="ink2">{L('Locality-level results are not available for this election in the sources used here; only national results are.', 'תוצאות לפי יישובים אינן זמינות לבחירות אלה במקורות שבשימוש כאן; זמינות רק תוצאות ארציות.')}</p>;
  if (error) return <p className="down">{error}</p>;
  if (!data) return <p className="muted">{L('Loading official locality results…', 'טוען תוצאות לפי יישובים…')}</p>;
  // rows are keyed by position in the file: older elections have no locality codes
  const keyed = data.rows.map((r, i) => ({ r, key: String(i) }));
  const hasRegistered = data.rows.some((r) => r.registered !== null);
  const rows = keyed.filter(({ r }) => !q || r.nameHe.includes(q) || String(r.code) === q)
    .sort(({ r: a }, { r: b }) => sort === 'name' || (!hasRegistered && sort !== 'turnout') ? a.nameHe.localeCompare(b.nameHe, 'he')
      : sort === 'turnout' ? (b.registered ? b.votesCast / b.registered : -1) - (a.registered ? a.votesCast / a.registered : -1)
      : (b.registered ?? 0) - (a.registered ?? 0)).slice(0, 300);
  const localityCount = data.rows.filter((r) => !isEnvelopeRow(r)).length;
  const nameOf = (k: number) => histLists[k] ? listLabel(histLists[k]!, lang) : data.listIds[k];
  return (
    <div>
      <p className="small ink2">{L(`Official CEC results for ${localityCount} localities plus double-envelope votes. These are the historical figures; your scenario changes are national and are not distributed to localities.`, `תוצאות רשמיות של ועדת הבחירות ל-${localityCount} יישובים ולמעטפות החיצוניות. אלה הנתונים ההיסטוריים; שינויי התרחיש הם ארציים ואינם מחולקים ליישובים.`)}</p>
      {(data.noteEn || data.noteHe) && <p className="small callout">{lang === 'he' ? data.noteHe ?? data.noteEn : data.noteEn ?? data.noteHe}</p>}
      <div className="row" style={{ marginBottom: 8 }}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Locality name or code', 'שם יישוב או סמל')} aria-label={L('Search localities', 'חיפוש יישוב')} />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={L('Sort', 'מיון')}>
          <option value="registered">{L('Largest electorate', 'הגדולים ביותר')}</option><option value="turnout">{L('Highest turnout', 'הצבעה גבוהה')}</option><option value="name">{L('Name', 'שם')}</option>
        </select>
      </div>
      <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')}>
        <table className="tbl">
          <thead><tr><th>{L('Locality', 'יישוב')}</th><th className="n">{L('Registered', 'בעלי זכות')}</th><th className="n">{L('Cast', 'מצביעים')}</th><th className="n">{L('Turnout', 'הצבעה')}</th><th className="n">{L('Valid', 'כשרים')}</th><th>{L('Leading lists', 'רשימות מובילות')}</th></tr></thead>
          <tbody>{rows.map(({ r, key }) => {
            const top = r.votes.map((v, k) => ({ v, k })).sort((a, b) => b.v - a.v);
            return (
              <Fragment key={key}>
                <tr onClick={() => setOpen(open === key ? null : key)} style={{ cursor: 'pointer' }} className={open === key ? 'sel' : ''} tabIndex={0} aria-expanded={open === key} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(open === key ? null : key); } }}>
                  <td lang="he">{r.nameHe} <span className="muted tiny">{r.code}</span></td>
                  <td className="n">{r.registered ? fmtInt(r.registered) : '—'}</td><td className="n">{fmtInt(r.votesCast)}</td>
                  <td className="n">{r.registered ? fmtPct(r.votesCast, r.registered, 1) : '—'}</td><td className="n">{fmtInt(r.valid)}</td>
                  <td className="small">{top.slice(0, 3).filter((x) => x.v > 0).map((x) => `${nameOf(x.k)} ${fmtPct(x.v, r.valid, 0)}`).join(' · ')}</td>
                </tr>
                {open === key && (
                  <tr><td colSpan={6}>
                    <div className="grid2 small">{top.filter((x) => x.v > 0).slice(0, 16).map((x) => <span key={x.k}>{nameOf(x.k)}: {fmtInt(x.v)} ({fmtPct(x.v, r.valid, digits)})</span>)}</div>
                    {isEnvelopeRow(r) && <p className="small muted">{L('Double-envelope votes: cast away from home polling stations; not attributable to localities.', 'מעטפות חיצוניות: קולות שהוטלו מחוץ לקלפי הבית; אינם משויכים ליישובים.')}</p>}
                  </td></tr>
                )}
              </Fragment>
            );
          })}</tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="small">{L('No locality matches the search.', 'אין יישוב תואם לחיפוש.')}</p>}
      {rows.length === 300 && <p className="small muted">{L('Showing the first 300 localities in this order; search to find others.', 'מוצגים 300 היישובים הראשונים לפי המיון; חפשו כדי למצוא אחרים.')}</p>}
      <p className="small muted">{L('Locality turnout excludes double-envelope votes (soldiers, patients, diplomats…), so it understates true turnout.', 'ההצבעה ביישוב אינה כוללת מעטפות חיצוניות ולכן נמוכה מההצבעה האמיתית.')}</p>
    </div>
  );
}

// ------------------------------------------------------------------ sources

interface Src { id: string; url: string; publisher: string; official: boolean; description: string; retrievedAt?: string; sha256?: string; bytes?: number; note?: string; method: string; file: string }

export function Sources({ ds }: { ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const [src, setSrc] = useState<Src[]>([]);
  useEffect(() => { fetch('data/sources.json').then((r) => r.json()).then(setSrc).catch(() => setSrc([])); }, []);
  const used = src.filter((x) => ds.sourceIds.includes(x.id));
  return (
    <div className="grid2" style={{ alignItems: 'start', gap: 18 }}>
      <div>
        <h4>{L('Data status', 'מצב הנתונים')}</h4>
        <p className={ds.status.stage === 'official-final' ? 'small' : 'small'} style={ds.status.stage === 'official-final' ? undefined : { color: 'var(--warn-ink)' }}>{lang === 'he' ? ds.status.noteHe : ds.status.noteEn}</p>
        <div className="kv small" style={{ maxWidth: 440 }}>
          <span>{L('Registered voters', 'בעלי זכות בחירה')}</span><span>{fmtInt(ds.totals.registered)}</span>
          <span>{L('Votes cast', 'מצביעים')}</span><span>{fmtInt(ds.totals.votesCast)}</span>
          <span>{L('Valid', 'כשרים')}</span><span>{fmtInt(ds.totals.valid)}</span>
          <span>{L('Invalid', 'פסולים')}</span><span>{fmtInt(ds.totals.invalid)}</span>
          <span>{L('Polling stations', 'קלפיות')} <Info term="polling-station" /></span><span>{fmtInt(ds.totals.ballotBoxes)}</span>
          <span>{L('Localities', 'יישובים')}</span><span>{fmtInt(ds.totals.localities)}</span>
          {ds.totals.envelopeVotes !== undefined && <><span>{L('Double-envelope votes', 'מעטפות חיצוניות')} <Info term="envelopes" /></span><span>{fmtInt(ds.totals.envelopeVotes)}</span></>}
          <span>{L('Lists / candidates', 'רשימות / מועמדים')}</span><span>{ds.lists.length} / {fmtInt(ds.lists.reduce((t, l) => t + l.candidates.length, 0))}</span>
          <span>{L('Dataset built', 'נבנה')}</span><span>{ds.buildInfo.builtAt.slice(0, 10)}</span>
        </div>
        <h4 style={{ marginTop: 14 }}>{L('Sources', 'מקורות')}</h4>
        <p className="small ink2">{L('Official sources come first; secondary sources are labelled. English-language Wikipedia is never used or linked: it is unreliable on Israel-related information.', 'מקורות רשמיים קודמים לכול; מקורות משניים מסומנים. ויקיפדיה באנגלית אינה משמשת כמקור ואין אליה קישורים: היא אינה אמינה במידע הנוגע לישראל.')}</p>
        <ul className="small" style={{ paddingInlineStart: 18 }}>
          {used.map((x) => (
            <li key={x.id} style={{ marginBottom: 8 }}>
              <b>{x.publisher}</b> {x.official ? <span className="chip ok">{L('official', 'רשמי')}</span> : <span className="chip no">{L('secondary', 'משני')}</span>}<br />
              {x.description}<br />
              <a href={x.url.split(' ')[0]} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>{x.url}</a>
              <div className="muted tiny">{L('Retrieved', 'נשלף')} {x.retrievedAt?.slice(0, 10)}{x.sha256 ? ` · SHA-256 ${x.sha256.slice(0, 16)}…` : ''}{x.note ? ` · ${x.note}` : ''}</div>
            </li>
          ))}
        </ul>
        <p className="small muted">{L('List colours, short and English names, and blocs are assigned by this application for legibility; they are not official.', 'צבעי הרשימות, השמות המקוצרים והאנגליים והגושים נקבעו ביישום זה לנוחות; אינם רשמיים.')}</p>
      </div>
      <div>
        <h4>{L('Glossary', 'מונחים')}</h4>
        <dl className="small">{GLOSSARY.map((g) => <div key={g.id} id={`term-${g.id}`} style={{ marginBottom: 10 }}><dt><b>{lang === 'he' ? g.nameHe : g.nameEn}</b>{lang === 'he' ? '' : <span className="muted"> · {g.nameHe}</span>}</dt><dd style={{ margin: 0 }}>{lang === 'he' ? g.defHe : g.defEn}<br /><GlossaryLink g={g} lang={lang} /></dd></div>)}</dl>
        <h4>{L('Method and limits', 'שיטה ומגבלות')}</h4>
        <ul className="small" style={{ paddingInlineStart: 18 }}>
          <li>{L('Seats are computed by deterministic code implementing sections 81–82 of the Knesset Elections Law with exact integer arithmetic. Automated tests check that it reproduces the officially published seats of every list in every election offered here (2026: the reported final count).', 'המנדטים מחושבים בקוד דטרמיניסטי המממש את סעיפים 81–82 לחוק הבחירות בחשבון שלמים מדויק. בדיקות אוטומטיות מוודאות שהוא משחזר את המנדטים שפורסמו רשמית לכל רשימה בכל מערכת בחירות המוצגת כאן (2026: הספירה הסופית שדווחה).')}</li>
          <li>{L('Exact ties are decided by lottery under the law; the app flags them and lets you choose the lottery outcome.', 'שוויון מדויק מוכרע בהגרלה לפי החוק; היישום מסמן זאת ומאפשר לבחור את תוצאת ההגרלה.')}</li>
          <li>{L('Elected candidates are those elected on election night; later replacements and the Norwegian Law are not modelled.', 'הנבחרים הם מי שנבחרו בליל הבחירות; מחליפים מאוחרים והחוק הנורבגי אינם ממודלים.')}</li>
          <li>{L('Demographic turnout tools are hypothetical and labelled as such.', 'כלי ההצבעה הדמוגרפיים היפותטיים ומסומנים ככאלה.')}</li>
        </ul>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ history

export function describe(a: Action, s: Scenario, lang: Lang): string {
  const n = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const he = lang === 'he';
  switch (a.type) {
    case 'setVotes': return he ? `${n(a.listId)}: ${fmtInt(a.votes)} קולות` : `${n(a.listId)}: set to ${fmtInt(a.votes)} votes`;
    case 'transfer': return he ? `העברת ${fmtInt(a.votes)} קולות מ${n(a.from)} ל${n(a.to)}` : `Moved ${fmtInt(a.votes)} votes from ${n(a.from)} to ${n(a.to)}`;
    case 'addVoters': return he ? `נוספו ${fmtInt(a.allocations.reduce((t, x) => t + x.votes, 0) + a.invalid)} מצביעים${a.label ? ` (${a.label})` : ''}` : `Added ${fmtInt(a.allocations.reduce((t, x) => t + x.votes, 0) + a.invalid)} voters${a.label ? ` (${a.label})` : ''}`;
    case 'redistribute': return he ? `חלוקה מחדש של ${fmtInt(a.votes)} קולות` : `Redistributed ${fmtInt(a.votes)} votes`;
    case 'scaleAll': return he ? `שינוי כל הקולות ל-${a.factorPct}%` : `Scaled all votes to ${a.factorPct}%`;
    case 'merge': return he ? `איחוד: ${a.nameHe} (${a.ids.length} רשימות, שימור ${a.retentionPct}%)` : `Merged ${a.ids.length} lists into ${a.nameHe} (${a.retentionPct}% retained)`;
    case 'split': return he ? `פיצול ל-${a.parts.map((p) => p.nameHe).join(' / ')}` : `Split into ${a.parts.map((p) => p.nameHe).join(' / ')}`;
    case 'addList': return he ? `רשימה חדשה: ${a.nameHe}` : `New list: ${a.nameHe}`;
    case 'removeList': return he ? `הוסרה רשימה` : `Removed a list`;
    case 'setWithdrawn': return `${n(a.listId)}: ${a.withdrawn ? (he ? 'פרשה' : 'withdrawn') : (he ? 'הוחזרה' : 'reinstated')}`;
    case 'setListMeta': return he ? `${n(a.listId)}: עריכת פרטים` : `${n(a.listId)}: edited details`;
    case 'setAgreement': return `${a.agreement.members.map(n).join(' ⇄ ')}: ${a.agreement.enabled ? (he ? 'הסכם פעיל' : 'agreement on') : (he ? 'הסכם כבוי' : 'agreement off')}`;
    case 'removeAgreement': return he ? 'הוסר הסכם עודפים' : 'Removed an agreement';
    case 'candidates': return he ? `${n(a.listId)}: עריכת מועמדים (${a.note})` : `${n(a.listId)}: candidates (${a.note})`;
    case 'setRules': return he ? `כללים: ${Object.entries(a.patch).map(([k, v]) => `${k}=${v}`).join(', ')}` : `Rules: ${Object.entries(a.patch).map(([k, v]) => `${k}=${v}`).join(', ')}`;
    case 'setMode': return a.mode === 'historical' ? (he ? 'מצב תקף היסטורית' : 'Historically valid mode') : (he ? 'מצב ניסיוני' : 'Experimental mode');
    case 'setTotals': return he ? 'עדכון בעלי זכות / פסולים' : 'Electorate / invalid ballots changed';
    case 'setBlocs': return he ? 'עריכת גושים' : 'Edited blocs';
    case 'applyBlocScheme': { const sc = s.blocSchemes?.find((x) => x.id === a.schemeId); return he ? `חלוקה לגושים: ${sc?.nameHe ?? a.schemeId}` : `Bloc grouping: ${sc?.nameEn ?? a.schemeId}`; }
    case 'setPartyBloc': { const p = s.lists.flatMap((l) => l.parties ?? []).find((x) => x.id === a.partyId); const b = s.blocs.find((x) => x.id === a.bloc);
      return he ? `${p?.nameHe ?? a.partyId} ← ${b?.nameHe ?? 'ללא גוש'}` : `${p?.nameEn ?? a.partyId} → ${b?.nameEn ?? 'no bloc'}`; }
    case 'setLottery': return he ? 'נבחרה תוצאת הגרלה' : 'Chose a lottery outcome';
    case 'resetList': return he ? `${n(a.listId)}: אופסה` : `${n(a.listId)}: reset`;
    case 'rename': return he ? `שם התרחיש: ${a.name}` : `Renamed to ${a.name}`;
    case 'resetVotes': return he ? `${n(a.listId)}: הקולות אופסו` : `${n(a.listId)}: votes reset`;
    case 'resetCandidates': return he ? `${n(a.listId)}: רשימת המועמדים שוחזרה` : `${n(a.listId)}: candidate list restored`;
    case 'setTurnout': return he ? `שיעור ההצבעה נקבע ל-${a.pct}%` : `Turnout set to ${a.pct}%`;
    case 'restore': return he ? ({ agreements: 'שוחזרו הסכמי העודפים', totals: 'שוחזרו בעלי זכות הבחירה והפסולים', blocs: 'שוחזרו הגושים', lottery: 'בוטלו תוצאות ההגרלה' } as const)[a.what] : ({ agreements: 'Restored the historical agreements', totals: 'Restored electorate and invalid ballots', blocs: 'Restored the default blocs', lottery: 'Cleared lottery outcomes' } as const)[a.what];
  }
}

export function History({ s, r, ds }: { s: Scenario; r: AllocationResult; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const past = useStore((st) => st.past.length), future = useStore((st) => st.future.length);
  void r;
  const revertTo = (n: number) => {
    const { scenario } = replay(ds, s.name, s.log.slice(0, n).map((e) => e.action));
    setState({ scenario: { ...scenario, id: s.id }, past: [...getState().past, s], future: [] });
  };
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="btn small" onClick={undo} disabled={!past}>{L('Undo', 'ביטול')}</button>
        <button className="btn small" onClick={redo} disabled={!future}>{L('Redo', 'חזרה')}</button>
        <span className="muted small">{L(`${s.log.length} changes from the historical result`, `${s.log.length} שינויים מהתוצאה ההיסטורית`)}</span>
      </div>
      {s.log.length === 0 ? <p className="muted">{L('No changes yet — this is the historical result.', 'אין שינויים — זו התוצאה ההיסטורית.')}</p> : (
        <ol className="small" style={{ paddingInlineStart: 22 }}>
          {s.log.map((e, i) => (
            <li key={i} style={{ marginBottom: 3 }}>
              <span className="muted tiny">{new Date(e.at).toLocaleTimeString()}</span> {describe(e.action, s, lang)}{' '}
              <button className="btn small ghost" onClick={() => revertTo(i + 1)}>{L('revert to here', 'חזרה לכאן')}</button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
