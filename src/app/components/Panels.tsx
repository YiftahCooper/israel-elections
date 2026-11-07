import { formatDate } from '../dateFormat.ts';
import { AfterElectionSources } from './AfterElection.tsx';
import { factLog, isFactAction } from '../../model/actionClassification.ts';
import { Download } from 'lucide-react';
import { NumericStepper } from './NumericStepper.tsx';
import { TurnoutSteps } from './TurnoutSteps.tsx';
import { StartFrom } from './StartFrom.tsx';
import { PartEdits } from './PartEdits.tsx';
import { describe } from '../actionDescription.ts';
import { EditMarker } from './EditMarker.tsx';
import { ruleEraLabel } from '../changeValue.tsx';
import { LocalityMap, Locality2006Note, LocalityName, localityName, localityNameSource, useLocalityLocations, useLocalityNames } from './LocalityMap.tsx';
import { localityHebrewName, type LocalityNames } from '../../data/locality-names.ts';
import { matchesLocality } from '../locality-map-model.ts';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isEnvelopeRow, type ElectionDataset, type LocalityDataset } from '../../data/schema.ts';
import { RULESETS } from '../../engine/rules.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { electionRuleSetId, historicalRules, type Scenario } from '../../model/scenario.ts';
import { historyChangesLabels, baselineOf, listLabel, methodOf } from '../derive.ts';
import { GLOSSARY, useL, useLang } from '../i18n.ts';
import { download, fmtInt, fmtPct } from '../format.ts';
import { dispatch, getState, redo, replay, setState, undo, useStore, useDigits, useSetting } from '../store.ts';
import { useLocalities } from './Turnout.tsx';
import { GlossaryLink, Info, TextField } from './ui.tsx';

// ------------------------------------------------------------------ rules

const DIVISOR_METHODS = ['sainte-lague', 'dhondt', 'modified-sainte-lague'];

/** Each statutory threshold with the election years it applied in, from the election index (none typed by hand). */
function thresholdEras(elections: { id: string; date: string }[]) {
  const years = new Map<string, number[]>();
  for (const e of elections) {
    let id: string;
    try { id = electionRuleSetId(e.id as Scenario['electionId']); } catch { continue; }
    const pct = historicalRules(id).thresholdPct;
    years.set(pct, [...(years.get(pct) ?? []), Number(e.date.slice(0, 4))]);
  }
  return [...years].map(([pct, ys]) => ({ pct, from: Math.min(...ys), to: Math.max(...ys) })).sort((a, b) => a.from - b.from);
}

export function Rules({ s, base }: { s: Scenario; base: Scenario }) {
  const L = useL();
  const lang = useLang();
  const elections = useStore(st => st.elections);
  const eras = useMemo(() => thresholdEras(elections), [elections]);
  const exp = s.mode === 'experimental';
  // re-choosing the value already in force is not an edit: only real changes reach the history
  const set = (patch: Partial<Scenario['rules']>) => {
    const changed = Object.fromEntries(Object.entries(patch).filter(([k, v]) => k === 'thresholdPct' ? Number(v) !== Number(s.rules.thresholdPct) || !/^\d+(\.\d+)?$/.test(String(v)) : s.rules[k as keyof Scenario['rules']] !== v));
    if (Object.keys(changed).length) dispatch({ type: 'setRules', patch: changed });
  };
  const setMode = (mode: Scenario['mode']) => { if (s.mode !== mode) dispatch({ type: 'setMode', mode }); };
  const law = RULESETS[electionRuleSetId(s.electionId)];
  const divisor = DIVISOR_METHODS.includes(s.rules.remainderMethod);
  const mark = (k: keyof Scenario['rules']) => <EditMarker s={s} path={['rules', k]} />;
  // an on/off rule: its label says what "on" means; the (i) names the law it comes from
  const rule = (k: keyof Scenario['rules'], on: boolean, change: (on: boolean) => void, label: string, info?: ReactNode, disabled = false) =>
    <label className="row small rule-check"><input type="checkbox" checked={on} disabled={!exp || disabled} onChange={(e) => change(e.target.checked)} /><span>{label} {info}{mark(k)}</span></label>;
  return (
    <div className="grid2 stack-sm rules-page">
      {/* the scenario's rules and electorate: edits here are marked, undoable and saved with the scenario */}
      <div>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3>{L('Electoral rules', 'כללי הבחירות')}</h3>
        </div>
        <div className="row" style={{ marginBottom: 6 }}>
          <span className="seg" role="group" aria-label={L('Simulation mode', 'מצב סימולציה')}>
            <button aria-pressed={!exp} onClick={() => setMode('historical')}>{L('Historically valid', 'תקף היסטורית')}</button>
            <button aria-pressed={exp} onClick={() => setMode('experimental')}>{L('Experimental', 'ניסיוני')}</button>
          </span>
          <EditMarker s={s} path={['mode']} />
          {!exp && <span className="small ink2">{L('Locked to the law: choose Experimental to change', 'נעול לפי החוק: לשינוי בחרו ״ניסיוני״')}</span>}
        </div>
        {/* the law of this election, named by era, in both modes: what the experiment departs from */}
        <p className="small ink2 rules-law">{L('Law', 'החוק')}: <b>{ruleEraLabel(law, lang)}</b> <Info title={exp ? L('Experimental rules', 'כללים ניסיוניים') : L('Historically valid', 'תקף היסטורית')}>{exp
          ? L('You may change the electoral system itself. Results are an alternative system, not Israeli law; each rule that differs is marked Edited.', 'ניתן לשנות את שיטת הבחירות עצמה. התוצאות הן שיטה חלופית ולא החוק הישראלי; כל כלל ששונה מסומן ״נערך״.')
          : L('The law of this election is enforced. Votes, lists, candidates and agreements can still change; choose Experimental to change the rules themselves.', 'החוק של בחירות אלה נאכף. עדיין ניתן לשנות קולות, רשימות, מועמדים והסכמים; לשינוי הכללים עצמם בחרו ״ניסיוני״.')}</Info></p>
        {Object.keys(s.lotteryWinners).length > 0 && <p className="small">{L('You have recorded lottery outcomes for tied seats.', 'רשמתם תוצאות הגרלה למושבים בשוויון.')} <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'lottery' })}>{L('Clear them', 'ניקוי')}</button></p>}
        <fieldset className="rules-fields">
          <div className="grid2 rules-grid">
            <div className="field"><span>{L('Seats', 'מושבים')}{mark('seats')}</span><NumericStepper disabled={!exp} value={s.rules.seats} min={1} max={1000} onCommit={(n) => set({ seats: n })} label={L('Seats', 'מושבים')} steps={[{ id: '1', label: '1', amount: 1 }]} /></div>
            <label className="field"><span>{L('Threshold %', 'אחוז חסימה %')} <Info term="threshold" />{mark('thresholdPct')}</span><TextField disabled={!exp} value={s.rules.thresholdPct} label={L('Threshold %', 'אחוז חסימה %')} onCommit={(v) => set({ thresholdPct: v.trim().replace('%', '') })} /></label>
            <div className="field"><span><span id="remainder-method-label">{L('Remainder method', 'שיטת העודפים')}</span> <Info term={methodOf(s.rules).term} />{mark('remainderMethod')}</span>
              <select disabled={!exp} aria-labelledby="remainder-method-label" value={s.rules.remainderMethod} onChange={(e) => {
                const m = e.target.value as Scenario['rules']['remainderMethod'];
                // divisor methods have no whole-quota stage, so 1949's "only lists with a whole quota" rules would leave every seat unallocated
                set({ remainderMethod: m, ...(DIVISOR_METHODS.includes(m) && (s.rules.remainderRequiresInitialSeat || s.rules.agreementRequiresInitialSeat) ? { remainderRequiresInitialSeat: false, agreementRequiresInitialSeat: false } : {}) });
              }}>
                {/* with 1949's whole-quota condition the same divisor rule is that election's highest averages, named as such */}
                <option value="bader-ofer">{s.rules.remainderRequiresInitialSeat ? L('Highest averages (1949 law)', 'הממוצע הגבוה (חוק 1949)') : L('Bader–Ofer (law since 1973)', 'בדר–עופר (החוק מאז 1973)')}</option>
                <option value="largest-remainder">{L('Largest remainder (1951–1969 law)', 'שארית גדולה (חוק 1951–1969)')}</option>
                <option value="sainte-lague">{L('Sainte-Laguë (all seats)', 'סנט-לגה (כל המושבים)')}</option>
                <option value="dhondt">{L('D’Hondt (all seats)', 'ד׳הונדט (כל המושבים)')}</option>
                <option value="modified-sainte-lague">{L('Modified Sainte-Laguë (all seats)', 'סנט-לגה מתוקנת (כל המושבים)')}</option>
                <option value="droop">{L('Largest remainder, Droop quota', 'שארית גדולה, מודד דרופ')}</option>
              </select>
            </div>
            <label className="field"><span>{L('Quota rounding', 'עיגול המודד')} <Info term="quota" />{mark('quotaRounding')}</span>
              <select disabled={!exp} value={s.rules.quotaRounding} onChange={(e) => set({ quotaRounding: e.target.value as 'floor' | 'exact' })}>
                <option value="floor">{L('Whole number (law)', 'מספר שלם (החוק)')}</option><option value="exact">{L('Exact fraction', 'שבר מדויק')}</option>
              </select>
            </label>
            <div className="field"><span>{L('Lists per agreement', 'רשימות בהסכם')} <Info term="surplus" />{mark('maxAgreementSize')}</span><NumericStepper disabled={!exp} value={s.rules.maxAgreementSize} min={2} onCommit={(n) => set({ maxAgreementSize: n })} label={L('Lists per agreement', 'רשימות בהסכם')} steps={[{ id: '1', label: '1', amount: 1 }]} /></div>
            <div className="rules-checks">
              {rule('majorityCap', s.rules.majorityCap, (on) => set({ majorityCap: on }), L('Half-seats cap', 'מגבלת מחצית'), <Info term="cap" />)}
              {rule('agreementRequiresAllQualify', s.rules.agreementRequiresAllQualify, (on) => set({ agreementRequiresAllQualify: on }), L('Agreement needs all partners above threshold', 'הסכם דורש שכל השותפות יעברו'))}
              {/* each era's own rules, shown where they apply (that election, or once set) so they can be seen and changed */}
              {(law.remainderRequiresInitialSeat || s.rules.remainderRequiresInitialSeat) && rule('remainderRequiresInitialSeat', !!s.rules.remainderRequiresInitialSeat, (on) => set({ remainderRequiresInitialSeat: on, agreementRequiresInitialSeat: on }), L('Remainder seats only for lists with a whole quota', 'עודפים רק לרשימות עם מודד שלם'), <Info term="rules-1949" />, divisor)}
              {(law.quotaSeatOffset || s.rules.quotaSeatOffset) ? rule('quotaSeatOffset', !!s.rules.quotaSeatOffset, (on) => set({ quotaSeatOffset: on ? 1 : 0 }), L('Quota divides by the seats plus one', 'המודד מחולק במושבים ועוד אחד'), <Info term="rules-1949" />) : null}
              {(law.largestRemainderRepeat === false || s.rules.largestRemainderRepeat === false) && rule('largestRemainderRepeat', s.rules.largestRemainderRepeat === false, (on) => set({ largestRemainderRepeat: !on }), L('At most one remainder seat per list', 'לכל היותר מנדט עודף אחד לרשימה'),
                <Info title={L('1951–1969 law', 'החוק ב-1951–1969')}>{L('The largest-remainder law of 1951–1969 gives each list at most one remainder seat. Off: once every list has had one, the round starts again.', 'חוק השארית הגדולה של 1951–1969 נותן לכל רשימה לכל היותר מנדט עודף אחד. כבוי: אחרי שכל רשימה קיבלה אחד, הסבב מתחיל מחדש.')}</Info>,
                !['largest-remainder', 'droop'].includes(s.rules.remainderMethod))}
              {(law.seatsCappedAtCandidates || s.rules.seatsCappedAtCandidates) && rule('seatsCappedAtCandidates', !!s.rules.seatsCappedAtCandidates, (on) => set({ seatsCappedAtCandidates: on }), L('No more seats than candidates', 'לא יותר מנדטים ממועמדים'), <Info term="candidate-cap-1977" />)}
            </div>
          </div>
          {/* a timeline of the law's thresholds: reads left to right in Hebrew too */}
          <div className="quick-actions era-thresholds" role="group" aria-label={L('Thresholds by era', 'אחוזי חסימה לפי תקופה')}>
            {eras.map(({ pct, from, to }) => { const on = Number(s.rules.thresholdPct) === Number(pct); const years = from === to ? `${from}` : `${from}–${to}`;
              return <button disabled={!exp} key={pct} className={`btn small ${on ? 'primary' : ''}`} aria-pressed={on} aria-label={`${pct}% (${years})`} onClick={() => set({ thresholdPct: pct })}><b>{pct}%</b><span className="tiny">{years}</span></button>; })}
          </div>
        </fieldset>
        <span className="row"><PartEdits s={s} prefix={['rules']} /><StartFrom s={s} part="rules" /></span>
        <hr />
        <div className="row electorate-heading" style={{ justifyContent: 'space-between' }}>
          <h3>{L('Electorate', 'ציבור הבוחרים')}</h3>
          {(s.registered !== base.registered || s.invalid !== base.invalid) && <button className="btn small" onClick={() => dispatch({ type: 'restore', what: 'totals' })}>{L('Restore historical', 'שחזור הנתונים ההיסטוריים')}</button>}
        </div>
        {/* sized like its sibling steppers below */}
        <div className="rules-turnout"><TurnoutSteps s={s} /></div>
        <div className="grid2">
          <div className="field"><span>{L('Registered voters', 'בעלי זכות בחירה')}<EditMarker s={s} path={['registered']} /></span><NumericStepper value={s.registered} onCommit={(n) => { if (n !== s.registered) dispatch({ type: 'setTotals', registered: n }); }} label={L('Registered voters', 'בעלי זכות בחירה')} steps={[{ id: '1k', label: '1k', amount: 1000 }, { id: '10k', label: '10k', amount: 10000 }]} /></div>
          <div className="field"><span>{L('Invalid ballots', 'קולות פסולים')}<EditMarker s={s} path={['invalid']} /></span><NumericStepper value={s.invalid} onCommit={(n) => { if (n !== s.invalid) dispatch({ type: 'setTotals', invalid: n }); }} label={L('Invalid ballots', 'קולות פסולים')} steps={[{ id: '1k', label: '1k', amount: 1000 }, { id: '10k', label: '10k', amount: 10000 }]} /></div>
        </div>
        <hr />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{L('Blocs', 'גושים')} <Info title={L('Editing blocs', 'עריכת גושים')}>{L('Choose a grouping, move lists and constituent parties between blocs, and rename or recolour blocs in the bloc editor beside the chamber.', 'בחירת חלוקה, העברת רשימות ומפלגות בין גושים ושינוי שמות וצבעים — בעורך הגושים שליד המליאה.')}</Info></h3>
          <button className="btn small" onClick={() => { setState({ tool: 'board', blocPanel: s.blocs[0]?.id ?? '__none', selectedListId: null }); window.scrollTo({ top: 0 }); }}>{L('Edit blocs', 'עריכת גושים')}</button>
        </div>
      </div>
      <button className="btn" onClick={() => setState({ settingsOpen: true })}>{L('Settings…', 'הגדרות…')}</button>
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
  const { locations, error: locationError } = useLocalityLocations(s.electionId, hasLocalities);
  const names = useLocalityNames(s.electionId, hasLocalities);
  const preferTables = useSetting('preferTables');
  const [view, setView] = useState<'map' | 'table'>(preferTables ? 'table' : 'map');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'registered' | 'turnout' | 'name'>('registered');
  const [open, setOpen] = useState<string | null>(null);
  const ds = useStore(st => st.datasets[s.electionId]);
  const histLists = useMemo(() => (data && ds ? data.listIds.map(id => baselineOf(ds).lists.find(l => l.id === id) ?? null) : []), [data, ds]);
  if (!hasLocalities) return <p className="ink2">{L('National results only', 'תוצאות ארציות בלבד')} <Info title={L('Locality coverage', 'כיסוי לפי יישובים')}>{L('Locality-level results are not available for this election in the sources used here; only national results are. Locality results start with the 2003 election (16th Knesset).', 'תוצאות לפי יישובים אינן זמינות לבחירות אלה במקורות שבשימוש כאן; זמינות רק תוצאות ארציות. תוצאות לפי יישובים זמינות החל מבחירות 2003 (הכנסת ה־16).')}</Info></p>;
  if (error) return <p className="bad">{error}</p>;
  if (!data || data.id !== s.electionId) return <p className="muted">{L('Loading official locality results…', 'טוען תוצאות לפי יישובים…')}</p>;
  // rows are keyed by position in the file: older elections have no locality codes
  const keyed = data.rows.map((r, i) => ({ r, key: String(i) }));
  const hasRegistered = data.rows.some((r) => r.registered !== null);
  const nameAt = (key: string) => localityName(names, data.rows[Number(key)], Number(key), lang);
  const rows = keyed.filter(({ r, key }) => matchesLocality(q, { ...locations[String(r.code)], nameHe: localityHebrewName(names, r, Number(key)), code: r.code, aliases: [...(locations[String(r.code)]?.aliases ?? []), names.names[Number(key)] ?? '', r.nameHe] }))
    .sort(({ r: a, key: ka }, { r: b, key: kb }) => sort === 'name' || (!hasRegistered && sort !== 'turnout') ? nameAt(ka).localeCompare(nameAt(kb), lang)
      : sort === 'turnout' ? (b.registered ? b.votesCast / b.registered : -1) - (a.registered ? a.votesCast / a.registered : -1)
      : (b.registered ?? 0) - (a.registered ?? 0)).slice(0, 300);
  const localityCount = data.rows.filter((r) => !isEnvelopeRow(r)).length;
  const nameOf = (k: number) => histLists[k] ? listLabel(histLists[k]!, lang) : data.listIds[k];
  return (
    <div>
      <span className="seg" role="group" aria-label={L('Locality view', 'תצוגת יישובים')}>
        <button aria-pressed={view === 'map'} onClick={() => setView('map')}>{L('Map', 'מפה')}</button>
        <button aria-pressed={view === 'table'} onClick={() => setView('table')}>{L('Table', 'טבלה')}</button>
      </span>
      {view === 'map' ? <LocalityMap key={s.electionId} s={s} data={data} historicalLists={histLists} locations={locations} names={names} locationError={locationError} /> : <>
      <p className="small ink2">{L('Historical locality results', 'תוצאות היסטוריות לפי יישוב')} <Info title={L('Locality results', 'תוצאות לפי יישוב')}>{L(`Official CEC results for ${localityCount} localities plus double-envelope votes. These are the historical figures; your scenario changes are national and are not distributed to localities.`, `תוצאות רשמיות של ועדת הבחירות ל-${localityCount} יישובים ולמעטפות החיצוניות. אלה הנתונים ההיסטוריים; שינויי התרחיש הם ארציים ואינם מחולקים ליישובים.`)}</Info></p>
      {data.id === 'k17' ? <Locality2006Note /> : (data.noteEn || data.noteHe) && <p className="small callout">{lang === 'he' ? data.noteHe ?? data.noteEn : data.noteEn ?? data.noteHe}</p>}
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
                <tr className={open === key ? 'sel' : ''}>
                  <td><button className="table-action" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)} title={localityNameSource(names, r, Number(key), lang)}><LocalityName names={names} row={r} index={Number(key)} showCbs /></button> <span className="muted tiny">{r.code}</span></td>
                  <td className="n">{r.registered ? fmtInt(r.registered) : '—'}</td><td className="n">{fmtInt(r.votesCast)}</td>
                  <td className="n">{r.registered ? fmtPct(r.votesCast, r.registered, digits) : '—'}</td><td className="n">{fmtInt(r.valid)}</td>
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
      <p className="small muted">{L('Excludes double envelopes', 'ללא מעטפות חיצוניות')} <Info title={L('Locality turnout', 'הצבעה ביישוב')}>{L('Locality turnout excludes double-envelope votes (soldiers, patients, diplomats…), so it understates true turnout.', 'ההצבעה ביישוב אינה כוללת מעטפות חיצוניות ולכן נמוכה מההצבעה האמיתית.')}</Info></p>
      </>}
    </div>
  );
}

// ------------------------------------------------------------------ sources

interface Src { id: string; url: string; publisher: string; publisherEn?: string; official: boolean; description: string; descriptionEn?: string; retrievedAt?: string; sha256?: string; bytes?: number; note?: string; method: string; file: string }

/** A source's address: a link for a web address (any words after it stay plain text); a project
 *  record (no web address) is named by its retained file, never as a dead link. */
function SourceAddress({ x }: { x: Src }) {
  const L = useL();
  const [href, ...rest] = x.url.split(' ');
  if (!/^https?:\/\//.test(href)) return <span className="muted" style={{ display: 'block' }}>{L('Project record', 'רשומת הפרויקט')}: <bdi dir="ltr">{x.file && !x.file.startsWith('..') ? `data/raw/${x.file}` : x.url.replace(/^(local|project):/, '')}</bdi></span>;
  return <span dir="ltr" style={{ display: 'block', wordBreak: 'break-all' }}><a href={href} target="_blank" rel="noreferrer">{href}</a>{rest.length ? ` ${rest.join(' ')}` : ''}</span>;
}

/** The manifest is fetched once per page load and kept, so a return visit to Sources renders at once. */
let sourcesCache: Src[] | undefined;
let sourcesLoad: Promise<Src[]> | undefined;
const loadSources = () => sourcesLoad ??= fetch('data/sources.json')
  .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Src[]>; })
  .then((x) => (sourcesCache = x))
  .catch((e) => { sourcesLoad = undefined; throw e; });

export function Sources({ ds }: { ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const [exportError, setExportError] = useState(false);
  async function exportLocalities() {
    try {
      const [data, names] = await Promise.all(['localities', 'locality-names'].map(async suffix => {
        const r = await fetch(`${import.meta.env.BASE_URL}data/${ds.id}-${suffix}.json`);
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })) as [LocalityDataset, LocalityNames];
      download(`${ds.id}-localities-display.json`, JSON.stringify({ ...data, rows: data.rows.map((row, i) => ({ ...row, nameHe: localityHebrewName(names, row, i), cecNameHe: row.nameHe, nameSource: names.hebrew?.[i] })) }, null, 2), 'application/json');
      setExportError(false);
    } catch { setExportError(true); }
  }
  // A failed load says so rather than showing an empty list.
  const [src, setSrc] = useState<Src[] | null>(sourcesCache ?? null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (!src) loadSources().then(setSrc).catch(() => setFailed(true)); }, [src]);
  // The page appears whole once the list has loaded: the list is long, and inserting it into a page already
  // shown would push everything after it (on phones the whole second column) hundreds of pixels down.
  if (!src && !failed) return <p className="small muted" role="status">{L('Loading…', 'טוען…')}</p>;
  const byId = new Map((src ?? []).map((x) => [x.id, x]));
  const listed = ds.sourceIds.flatMap((id) => byId.get(id) ?? []);
  // "official sources first": the list keeps that promise; the dataset's order is kept within each group
  const used = [...listed.filter((x) => x.official), ...listed.filter((x) => !x.official)];
  const englishSourceText = (text: string) => ds.lists.reduce((out, l) => [l.nameHe, l.shortHe].filter(Boolean).sort((a, b) => b.length - a.length).reduce((t, name) => t.replaceAll(name, listLabel(l, 'en')), out), text).replace(/\s*\([א-ת״׳]+\)/g, '');
  const noLocalities = !ds.totals.ballotBoxes && !ds.totals.localities;
  return (
    <div className="grid2 stack-sm" style={{ alignItems: 'start', gap: 18 }}>
      <AfterElectionSources ds={ds} />
      <div>
        <h3>{L('Data status', 'מצב הנתונים')}</h3>
        <p className="small" style={ds.status.stage === 'official-final' ? undefined : { color: 'var(--warn-ink)' }}>{ds.status.stage === 'official-final' ? L('Official final results', 'תוצאות סופיות רשמיות') : L('Gazette not yet verified', 'הפרסום ברשומות טרם אומת')} <Info title={L('Data status details', 'פירוט מצב הנתונים')}>{lang === 'he' ? ds.status.noteHe.replaceAll('הפרסום ברשומות לא אומת', 'הפרסום ברשומות טרם אומת') : ds.status.noteEn.replaceAll('Gazette publication unverified', 'Gazette publication not yet verified')}</Info></p>
        <div className="kv small" style={{ maxWidth: 440 }}>
          <span>{L('Registered voters', 'בעלי זכות בחירה')}</span><span>{fmtInt(ds.totals.registered)}</span>
          <span>{L('Votes cast', 'מצביעים')}</span><span>{fmtInt(ds.totals.votesCast)}</span>
          <span>{L('Valid', 'כשרים')}</span><span>{fmtInt(ds.totals.valid)}</span>
          <span>{L('Invalid', 'פסולים')}</span><span>{fmtInt(ds.totals.invalid)}</span>
          {/* elections without locality data have no counts here: "0" would read as a real figure */}
          {noLocalities
            ? <><span>{L('Polling stations and localities', 'קלפיות ויישובים')}</span><span className="muted">{L('Not in the data', 'אין בנתונים')}</span></>
            : <><span>{L('Polling-station results', 'תוצאות קלפי')} <Info term="polling-station"><span>{L('Rows in the official results table, which can include central double-envelope counts; not the number of physical polling stations.', 'שורות בטבלת התוצאות הרשמית, שעשויות לכלול ספירה מרכזית של מעטפות חיצוניות; אין זה מספר הקלפיות הפיזיות.')}</span></Info></span><span>{fmtInt(ds.totals.ballotBoxes)}</span>
              <span>{L('Localities', 'יישובים')}</span><span>{fmtInt(ds.totals.localities)}</span></>}
          {ds.totals.envelopeVotes !== undefined && <><span>{(ds.id === 'k16' ? L('Double-envelope voters (incl. invalid)', 'מצביעים במעטפות חיצוניות (כולל פסולים)') : L('Double-envelope votes', 'מעטפות חיצוניות'))} <Info term="envelopes" /></span><span>{fmtInt(ds.totals.envelopeVotes)}</span></>}
          <span>{L('Lists', 'רשימות')}</span><span>{ds.lists.length}</span>
          <span>{L('Candidates in the data', 'מועמדים בנתונים')}</span><span>{fmtInt(ds.lists.reduce((t, l) => t + l.candidates.length, 0))}</span>
          <span>{L('Dataset built', 'נבנה')}</span><span><bdi dir="ltr">{formatDate(ds.buildInfo.builtAt, lang)}</bdi></span>
        </div>
        <p className="small"><Download className="icon sm" aria-hidden style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />{L('Download', 'הורדה')}:{' '}
          <a href={`data/${ds.id}.json`} download>{L('election data', 'נתוני הבחירות')}</a>
          {!noLocalities && <> · <button className="table-action" onClick={exportLocalities}>{L('localities', 'יישובים')}</button> · <a href={`data/${ds.id}-localities.json`} download>{L('original CEC names', 'שמות מקוריים מוועדת הבחירות')}</a></>}
          {' · '}<a href="data/sources.json" download>{L('all sources', 'כל המקורות')}</a> <span className="muted">(JSON)</span></p>
        {exportError && <p className="bad" role="status">{L('Could not export localities.', 'לא ניתן לייצא יישובים.')}</p>}
        <h3 style={{ marginTop: 14 }}>{L('Sources', 'מקורות')}</h3>
        <p className="small ink2">{L('Official sources first', 'מקורות רשמיים תחילה')} <Info title={L('Source policy', 'מדיניות המקורות')}>{L('Official sources come first; secondary sources are labelled. English-language Wikipedia is never used or linked: it is unreliable on Israel-related information.', 'מקורות רשמיים קודמים לכול; מקורות משניים מסומנים. ויקיפדיה באנגלית אינה משמשת כמקור ואין אליה קישורים: היא אינה אמינה במידע הנוגע לישראל.')}</Info></p>
        {failed ? <p className="small" role="alert">{L('The source list could not be loaded. Reload to try again.', 'לא ניתן לטעון את רשימת המקורות. טענו מחדש כדי לנסות שוב.')}</p>
          : <ul className="small credits" style={{ paddingInlineStart: 18 }}>
          {used.map((x) => (
            <li key={x.id} style={{ marginBottom: 8 }}>
              {/* source records are written in English (Hebrew originals keep an English publisher for English
                  pages); each runs in its own direction inside a Hebrew page */}
              <b dir="auto">{lang === 'en' ? x.publisherEn ?? x.publisher : x.publisher}</b> {x.official ? <span className="chip ok">{L('official', 'רשמי')}</span> : <span className="chip secondary">{L('secondary', 'משני')}</span>}<br />
              <span dir="auto" style={{ display: 'block' }}>{lang === 'en' ? englishSourceText(x.descriptionEn ?? x.description) : x.description}</span>
              <SourceAddress x={x} />
              <div className="muted tiny">{x.retrievedAt && <>{L('Retrieved', 'נשלף')} <bdi dir="ltr">{formatDate(x.retrievedAt, lang)}</bdi></>}{x.sha256 && <>{x.retrievedAt ? ' · ' : ''}<bdi dir="ltr">SHA-256 {x.sha256.slice(0, 16)}…</bdi></>}{x.note ? <> · <bdi dir="auto">{x.note}</bdi></> : ''}</div>
            </li>
          ))}
        </ul>}
        <p className="small muted">{L('Names, colours and blocs', 'שמות, צבעים וגושים')} <Info title={L('App annotations', 'נתונים של היישום')}>{L('Short and English list names are assigned by this application. Colours are the colours associated with each party where a source supports it, otherwise an app colour; blocs follow the sources given for each grouping (see decision 0087). None of these is official election data.', 'השמות המקוצרים והאנגליים של הרשימות נקבעו ביישום זה. הצבעים הם הצבעים המזוהים עם כל מפלגה כשיש לכך מקור, ואחרת צבע של היישום; הגושים לפי המקורות של כל חלוקה (ראו החלטה 0087). אף אחד מאלה אינו נתון בחירות רשמי.')}</Info></p>
        <h3 style={{ marginTop: 14 }}>{L('Method and limits', 'שיטה ומגבלות')}</h3>
        <ul className="small" style={{ paddingInlineStart: 18 }}>
          <li>{L('Seats are computed by deterministic code implementing sections 81–82 of the Knesset Elections Law with exact integer arithmetic. Automated tests check that it reproduces the officially published seats of every list in every election offered here.', 'המנדטים מחושבים בקוד דטרמיניסטי המממש את סעיפים 81–82 לחוק הבחירות בחשבון שלמים מדויק. בדיקות אוטומטיות מוודאות שהוא משחזר את המנדטים שפורסמו רשמית לכל רשימה בכל מערכת בחירות המוצגת כאן.')}</li>
          <li>{L('Exact ties are decided by lottery under the law; the app flags them and lets you choose the lottery outcome.', 'שוויון מדויק מוכרע בהגרלה לפי החוק; היישום מסמן זאת ומאפשר לבחור את תוצאת ההגרלה.')}</li>
          <li>{L('Elected candidates are those elected on election night; later replacements and the Norwegian Law are not modelled.', 'הנבחרים הם מי שנבחרו בליל הבחירות; מחליפים מאוחרים והחוק הנורבגי אינם ממודלים.')}</li>
          <li>{L('Demographic turnout tools are hypothetical and labelled as such.', 'כלי ההצבעה הדמוגרפיים היפותטיים ומסומנים ככאלה.')}</li>
        </ul>
      </div>
      <div>
        <details><summary>{L('English list names', 'שמות הרשימות באנגלית')}</summary>
          <p className="small">{L('Existing common-use English labels are app annotations. The entries below are unofficial shortened transliterations, not verified official English names. Unmatched sponsor/faction names and legacy or user-created names use unofficial consonantal romanisation.', 'השמות האנגליים המקובלים הם נתוני תצוגה של היישום. הרשומות להלן הן תעתיקים מקוצרים לא רשמיים, לא שמות רשמיים באנגלית שאומתו. לשמות ישנים או חדשים ללא שם אנגלי מוצג תעתיק עיצורים.')}</p>
          <ul className="small">{ds.lists.filter(l => l.englishName).map(l => <li key={l.id}>{listLabel(l, lang)} · {L('Unofficial transliteration', 'תעתיק לא רשמי')} · {l.englishName!.sourceId}</li>)}</ul>
        </details>
        {(() => {
          // Logos keep their licence or fair-use notice and attribution with the images. One entry per image
          // file: a joint list and its party often share one logo, and the credit is the same.
          const byFile = new Map<string, { names: string[]; logo: NonNullable<ElectionDataset['lists'][number]['logo']> }>();
          for (const l of ds.lists) for (const x of [...(l.logo ? [{ name: listLabel(l, lang), logo: l.logo }] : []),
            ...(l.parties ?? []).filter((p) => p.logo).map((p) => ({ name: lang === 'he' ? p.nameHe : p.nameEn, logo: p.logo! }))]) {
            const e = byFile.get(x.logo.file);
            if (!e) byFile.set(x.logo.file, { names: [x.name], logo: x.logo });
            else if (!e.names.includes(x.name)) e.names.push(x.name);
          }
          const logos = [...byFile.values()];
          // the credit line, without repeating the licence shown beside it; in English the party's Hebrew
          // name that opens an official-mark credit is dropped (the English name already leads the row)
          // The credit line, without repeating the licence shown beside it. In English the credit leads with its
          // English part; a Hebrew or Arabic opening (the party's own name, a credited uploader) moves to a
          // quiet note at the end of the row rather than being dropped.
          const nonLatin = /[\u0590-\u05FF\u0600-\u06FF]/;
          const credit = (a: string, licence: string): { main: string; original?: string } => {
            const c = a.replace(`; ${licence}.`, '.');
            if (lang !== 'en' || !nonLatin.test(c)) return { main: c };
            const parts = c.split(/(; | — )/);
            let i = 0;
            while (i < parts.length && (nonLatin.test(parts[i]) || /^(; | — )$/.test(parts[i]))) i++;
            if (i >= parts.length) return { main: 'Rights holder credit', original: c };
            if (i === 0) return { main: c };
            return { main: parts.slice(i).join(''), original: parts.slice(0, i).join('').replace(/(; | — )$/, '') };
          };
          const commons = (url: string) => { try { return new URL(url).hostname.endsWith('wikimedia.org'); } catch { return false; } };
          // a credit runs in the direction of most of its letters, so a Hebrew uploader name before a Latin
          // file name does not reorder the line
          const dir = (t: string) => (t.match(/[A-Za-z]/g)?.length ?? 0) >= (t.match(/[\u0590-\u05FF\u0600-\u06FF]/g)?.length ?? 0) ? 'ltr' : 'rtl';
          const item = (x: typeof logos[number]) => { const c = credit(x.logo.attribution, x.logo.licence); return <li key={x.logo.file}><b>{x.names.join(' · ')}</b>: <bdi dir={dir(c.main)}><a href={x.logo.sourceUrl} target="_blank" rel="noreferrer">{c.main}</a></bdi> · <bdi dir="auto">{x.logo.licence}</bdi>{c.original && <> · <bdi className="muted" dir="rtl" lang={/[\u0600-\u06FF]/.test(c.original) ? 'ar' : 'he'}>{c.original}</bdi></>}</li>; };
          // the secondary label is said once, for the Commons group, not on every row
          const groups = [{ id: 'party', title: L('From the parties', 'מהמפלגות'), secondary: false, rows: logos.filter((x) => !commons(x.logo.sourceUrl)) },
            { id: 'commons', title: 'Wikimedia Commons', secondary: true, rows: logos.filter((x) => commons(x.logo.sourceUrl)) }].filter((g) => g.rows.length);
          return logos.length ? <>
            <h3>{L('Party logos', 'סמלי המפלגות')}</h3>
            <p className="small ink2">{L('Separate licences', 'רישיונות נפרדים')} <Info title={L('Logo licences', 'רישיונות הסמלים')}>{L('Verified party marks from official sources or Wikimedia Commons (secondary). Logos are shown only with evidence for this election. Rights and credits are separate from the app licence.', 'סמלים ממקורות רשמיים או מוויקישיתוף (משני). סמלים מוצגים רק עם ראיות לשימוש בבחירות האלה. הזכויות והייחוס נפרדים מרישיון היישום.')}</Info></p>
            {groups.map((g) => <Fragment key={g.id}>
              <p className="small" style={{ margin: '8px 0 2px', fontWeight: 600 }}><bdi>{g.title}</bdi>{g.secondary && <> <span className="chip secondary">{L('secondary', 'משני')}</span></>}</p>
              <ul className="small credits" style={{ paddingInlineStart: 18, marginTop: 2 }}>{g.rows.map(item)}</ul>
            </Fragment>)}
          </> : null;
        })()}
        <h3>{L('Glossary', 'מונחים')}</h3>
        <dl className="small">{GLOSSARY.map((g) => <div key={g.id} id={`term-${g.id}`} style={{ marginBottom: 10 }}><dt><b>{lang === 'he' ? g.nameHe : g.nameEn}</b>{lang === 'he' ? '' : <span className="muted"> · {g.nameHe}</span>}</dt><dd style={{ margin: 0 }}>{lang === 'he' ? g.defHe : g.defEn}<br /><GlossaryLink g={g} lang={lang} /></dd></div>)}</dl>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ history

export function History({ s, r, ds, reference = null }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; reference?: Scenario | null }) {
  const L = useL();
  const lang = useLang();
  const counts = historyChangesLabels(s, reference, lang);
  const past = useStore((st) => st.past.length), future = useStore((st) => st.future);
  const last = s.log.at(-1);
  const next = future.at(-1)?.log.at(-1);
  const undoName = last ? L('Undo: ', 'ביטול: ') + describe(last.action, s, lang) : L('Undo', 'ביטול');
  const redoName = next ? L('Redo: ', 'חזרה: ') + describe(next.action, future.at(-1)!, lang) : L('Redo', 'חזרה');
  void r;
  const revertTo = (n: number) => {
    const { scenario } = replay(ds, s.name, s.log.slice(0, n).map((e) => e.action), s.factionSplitBaseline ?? false);
    setState({ scenario: { ...scenario, id: s.id }, past: [...getState().past, s], future: [] });
  };
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="btn small" onClick={undo} disabled={!past}>{undoName}</button>
        <button className="btn small" onClick={redo} disabled={!future.length}>{redoName}</button>
        {(reference || factLog(s).length > 0) && <span className="muted small history-counts"><bdi>{counts.active}</bdi>{counts.official !== null && <>{' · '}<bdi>{counts.official}</bdi></>}</span>}
      </div>
      {factLog(s).length === 0 ? <p className="muted">{reference ? L('History is empty.', 'ההיסטוריה ריקה.') : L('No changes — this is the official result.', 'אין שינויים — זו התוצאה הרשמית.')}</p> : (
        <ol className="small" style={{ paddingInlineStart: 22 }}>
          {s.log.map((e, i) => !isFactAction(e.action) ? null : (
            <li key={i} style={{ marginBottom: 3 }}>
              <span className="muted tiny">{new Date(e.at).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-GB')}</span> {describe(e.action, s, lang)}{' '}
              <button className="btn small ghost" onClick={() => revertTo(i + 1)}>{L('revert to here', 'חזרה לכאן')}</button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
