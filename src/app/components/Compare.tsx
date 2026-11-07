import { AnalysisEdits } from './AnalysisEdits.tsx';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { CandidateName } from './CandidateName.tsx';
import { Info, Slip } from './ui.tsx';
import { blocDisplayOrder } from '../blocOrder.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { baselineOf, referenceLabel } from '../derive.ts';
import { scenarioColor } from '../scenarioIdentity.ts';
import { useEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { votesCast, type Scenario } from '../../model/scenario.ts';
import { resultChanges, allocationOf, comparisonGroups, groupingBaseline, groupingLabel, nonSeatChanges, blocPieces, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, fmtRat, fmtSigned } from '../format.ts';
import { loadDataset, replay, setState, toast, useStore, useDigits } from '../store.ts';
import { electionLabel } from '../electionLabel.ts';
import { ChoicePicker, type Choice } from './ChoicePicker.tsx';
import { Hemicycle } from './Hemicycle.tsx';
import { ResultPreview } from './ResultPreview.tsx';

const ELECTION = 'election:';
type L = (en: string, he: string) => string;

/** A signed decimal with a true minus sign ("+5.85", "−1.36"), for left-to-right isolation in either language. */
const signedDecimal = (t: string) => (t.startsWith('-') ? `−${t.slice(1)}` : /^0(\.0*)?$/.test(t) ? t : `+${t}`);
const blocSums = (sc: Scenario, rr: AllocationResult) => Object.fromEntries(sc.blocs.map((b) => [b.id, blocPieces(sc, rr).filter((p) => p.bloc === b.id).reduce((t, p) => t + p.n, 0)]));
const turnout = (sc: Scenario, digits: number) => sc.registered ? fmtPct(votesCast(sc), sc.registered, digits) : '—';
const threshold = (sc: Scenario, rr: AllocationResult, L: L) => Number(sc.rules.thresholdPct) === 0 ? L('None', 'אין') : fmtInt(rr.thresholdVotes);

export function Compare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const compareWith = useStore((st) => st.compareWith);
  const elections = useStore((st) => st.elections);
  const otherElection = compareWith.startsWith(ELECTION) ? compareWith.slice(ELECTION.length) as ElectionId : null;
  if (otherElection && otherElection !== s.electionId && elections.some((e) => e.id === otherElection && e.available)) return <ElectionCompare s={s} r={r} base={base} ds={ds} otherId={otherElection} />;
  return <ScenarioCompare s={s} r={r} base={base} ds={ds} />;
}

/** What the current result can be compared with: this election's official result, the loaded reference and saved
 *  scenarios, or another election's official result. */
function useCompareChoices(s: Scenario, ds: ElectionDataset) {
  const L = useL(), lang = useLang();
  const { markerReference: reference } = useActiveReference();
  const saved = useStore((st) => st.saved);
  const elections = useStore((st) => st.elections);
  const here = L('This election', 'הבחירות האלה'), others = L('Other elections', 'בחירות אחרות');
  const savedHere = saved.filter((x) => x.electionId === s.electionId && x.id !== s.id);
  const choices: Choice[] = useMemo(() => [
    ...(reference ? [{ value: 'official', label: L('Official result', 'התוצאה הרשמית'), group: here }] : []),
    { value: 'historical', label: referenceLabel(reference, lang).name, group: here },
    ...savedHere.map((x) => ({ value: x.id, label: x.name, group: here, preview: <span className="swatch" style={{ background: (()=>{const sc=replay(ds,x.name,x.log,x.factionSplitBaseline??false).scenario;return resultChanges(sc,baselineOf(ds)).length?scenarioColor(sc):'var(--muted)';})() }} /> })),
    ...elections.filter((e) => e.available && e.id !== s.electionId).map((e) => ({ value: ELECTION + e.id, label: electionLabel(e, elections, lang), detail: L('Official result', 'התוצאה הרשמית'), group: others })),
  ], [reference, saved, ds, elections, lang, s.electionId, s.id]); // eslint-disable-line react-hooks/exhaustive-deps -- L and the filtered lists follow lang, saved and s
  const at = elections.findIndex((e) => e.id === s.electionId);
  const previous = elections.slice(at + 1).find((e) => e.available);
  return { choices, previous, label: L('Compare with', 'השוואה עם'), electionName: (id: string) => { const e = elections.find((x) => x.id === id); return e ? electionLabel(e, elections, lang) : id; } };
}

function ComparePicker({ s, ds, name, value, children }: { s: Scenario; ds: ElectionDataset; name: string; value: string; children?: ReactNode }) {
  const L = useL();
  const { choices, label } = useCompareChoices(s, ds);
  return <div className="row cmp-head">
    <span>{L('Compare', 'השוואה בין')} <b>{name}</b> {L('with', 'לבין')}</span>
    <ChoicePicker label={label} value={value} options={choices} onChange={(v) => setState({ compareWith: v })} />
    {children}
  </div>;
}

/** Toggling a disclosure keeps its summary under the pointer. When closing it would shorten the page below the
 *  current scroll position (the browser would then pull the page, and the summary, down), a spacer holds the page
 *  where it was; the spacer gives way as the reader scrolls back up, so nothing ever jumps. */
function useSteadyDisclosure() {
  const ref = useRef<HTMLDivElement>(null);
  const shrink = () => {
    const el = ref.current; if (!el || !el.offsetHeight) return;
    const below = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (below > 0) el.style.height = `${Math.max(0, el.offsetHeight - below)}px`;
  };
  useEffect(() => { window.addEventListener('scroll', shrink, { passive: true }); return () => window.removeEventListener('scroll', shrink); }, []);
  const onClick = (e: MouseEvent<HTMLElement>) => {
    const details = e.currentTarget.parentElement as HTMLDetailsElement, el = ref.current;
    if (!el) return;
    e.preventDefault();
    const y = window.scrollY;
    details.open = !details.open;
    const short = y + window.innerHeight - document.documentElement.scrollHeight;
    if (short > 0) el.style.height = `${el.offsetHeight + short}px`;
    window.scrollTo({ top: y, behavior: 'instant' });
    shrink();
  };
  return { onClick, spacer: <div ref={ref} className="cmp-spacer" aria-hidden /> };
}

function ScenarioCompare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const { markerReference: reference } = useActiveReference();
  const compareWithRaw = useStore((st) => st.compareWith);
  const { previous } = useCompareChoices(s, ds);
  const saved = useStore((st) => st.saved);
  const compareWith = compareWithRaw === 'official' ? 'official' : saved.some((x) => x.id === compareWithRaw && x.electionId === s.electionId && x.id !== s.id) ? compareWithRaw : 'historical';
  const digits = useDigits();
  const advanced = useStore((st) => st.level === 'expert');
  const steady = useSteadyDisclosure();
  const other = useMemo(() => {
    if (compareWith === 'official') return base;
    if (compareWith === 'historical') return reference ?? base;
    const sv = saved.find((x) => x.id === compareWith && x.electionId === s.electionId);
    return sv ? replay(ds, sv.name, sv.log, sv.factionSplitBaseline ?? false).scenario : base;
  }, [compareWith, saved, base, ds, s.electionId, reference]);
  const a = other, ar = allocationOf(other);
  const groups = useMemo(() => comparisonGroups(s, r, a, ar), [ar, a, r, s]);

  const groupIcons = (g: { bIds: string[]; aIds: string[] }) => (g.bIds.length ? g.bIds.map(id => s.lists.find(l => l.id === id)) : g.aIds.map(id => a.lists.find(l => l.id === id))).filter(l => !!l).map(l => <span key={l.id} aria-hidden="true"><Slip {...l} name={listLabel(l, lang)} size="sm" /></span>);
  const gName = (ids: string[], sc: Scenario) => ids.map((id) => { const l = sc.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : (lang === 'he' ? 'רשימה לא ידועה' : 'Unknown list'); }).join(' + ') || '—';
  const changed = groups.filter((g) => g.seatsA !== g.seatsB).sort((x, y) => (y.seatsB - y.seatsA) - (x.seatsB - x.seatsA));
  const gainers = changed.filter((g) => g.seatsB > g.seatsA);
  // direct vs indirect
  const direct = groups.filter((g) => g.votesA !== g.votesB || g.aIds.join() !== g.bIds.join());
  const indirect = changed.filter((g) => !direct.includes(g));

  // candidates entering / leaving
  const electedIds = (sc: Scenario, rr: AllocationResult) => new Map(sc.lists.flatMap((l) => electedOf(l, rr.lists.find((x) => x.id === l.id)?.seats ?? 0).map((c) => [c.id, { c, l }] as const)));
  const ea = electedIds(a, ar), eb = electedIds(s, r);
  const entering = [...eb.entries()].filter(([id]) => !ea.has(id)).map(([, v]) => v);
  const leaving = [...ea.entries()].filter(([id]) => !eb.has(id)).map(([, v]) => v);

  const groupedA = groupingBaseline(s, a);
  const ba = groupedA ? blocSums(groupedA, allocationOf(groupedA)) : {}, bb = blocSums(s, r);

  const baseLabel = referenceLabel(a === base ? null : a, lang);
  const nameA = baseLabel.name;
  const nameB = resultChanges(s, base).length ? s.name || L('Your scenario', 'התרחיש שלכם') : L('Official result', 'התוצאה הרשמית');
  const colorOfGroup = (g: (typeof groups)[number]) => (s.lists.find((l) => l.id === g.bIds[0]) ?? a.lists.find((l) => l.id === g.aIds[0]))?.color ?? '#888';
  const labelOf = (g: (typeof groups)[number]) => gName(g.bIds.length ? g.bIds : g.aIds, g.bIds.length ? s : a);
  const maxChange = Math.max(1, ...changed.map((g) => Math.abs(g.seatsB - g.seatsA)));
  const total = s.rules.seats;
  const same = changed.length === 0 && resultChanges(s, a).length === 0;
  const otherNow = nonSeatChanges(s, a, lang);

  // Derive the automatic target without changing the session choice or undo history.
  if (same && compareWithRaw === 'auto' && previous) return <ElectionCompare s={s} r={r} base={base} ds={ds} otherId={previous.id} />;
  if (same) return <EmptyCompare s={s} ds={ds} base={base} compareWith={compareWith} nameA={nameA} nameB={nameB} />;

  return (
    <div className="cmp">
      <AnalysisEdits s={s} outlet="compare-grouping" /><ComparePicker s={s} ds={ds} name={nameB} value={compareWith}>
        {changed.length === 0 && <span className="small muted">{[L('No seats changed', 'המנדטים לא השתנו'), ...otherNow].join(' · ')}</span>}
      </ComparePicker>

      <div className="cmp-chambers">
        <figure style={{ border: `2px solid ${resultChanges(a,base).length ? scenarioColor(a) : 'var(--rule)'}` }}><figcaption>{nameA}</figcaption><Hemicycle reference={groupedA ?? a} s={groupedA ?? a} r={ar} compact paired title={nameA} /></figure>
        <figure style={{ border: `2px solid ${resultChanges(s, base).length ? scenarioColor(s) : 'var(--rule)'}` }}><figcaption>{nameB}</figcaption><Hemicycle reference={groupedA ?? a} s={s} r={r} compact paired title={nameB} /></figure>
      </div>
      {gainers.length > 0 && <p className="small muted cmp-key">{L(`Outlined: seats gained compared with ${nameA}`, `מתאר: מנדטים שנוספו לעומת ${nameA}`)} <Info title={L('About these outlines', 'על המתארים')}>{L('Outlines compare list seat counts, not individual seats or voters moving between lists.', 'המתארים משווים את מספר המנדטים של הרשימות; אין משמעות של מנדט או בוחר שעבר בין רשימות.')}</Info></p>}

      {s.blocs.length > 0 && (
        <section className="cmp-section">
          <h3>{L('Blocs', 'גושים')}</h3>
          {groupedA && <BlocBarRow sums={ba} title={nameA} sc={groupedA} />}
          <BlocBarRow sums={bb} title={nameB} sc={s} />
          <div className="legend small" style={{marginTop:6}}>{blocDisplayOrder(s).map(id=>{
            const bloc=s.blocs.find(b=>b.id===id), color=bloc?.color??'var(--muted)';
            const before=id===null ? total-Object.values(ba).reduce((n,v)=>n+v,0) : ba[id]??0;
            const now=id===null ? total-Object.values(bb).reduce((n,v)=>n+v,0) : bb[id]??0;
            if(!now&&!before)return null;
            return <span key={id??'__none'} className="row" title={bloc?.appDefined ? appGroupingExplanation(lang) : undefined} style={{gap:5}}><span className="swatch" style={{background:`color-mix(in srgb, ${color} 24%, var(--surface))`,border:`1px ${id===null?'dotted':'solid'} ${color}`}} />{bloc?groupingName(bloc, lang, !groupedA ? s.blocSchemes?.find(g => g.id === s.blocSchemeId) : undefined):L('No bloc','ללא גוש')} <b><bdi dir="ltr">{groupedA?`${before} → `:''}{now}</bdi></b></span>;
          })}</div>
          {!groupedA && <p className="small muted" style={{ margin: '4px 0 0' }}>{L(`${groupingLabel(s, lang)}: no counterpart in ${nameA}`, `${groupingLabel(s, lang)}: אין מקבילה ב${nameA}`)}</p>}
        </section>
      )}

      {changed.length > 0 && (
        <section className="cmp-section">
          <h3>{L('Seats gained and lost', 'מנדטים שהתווספו ואבדו')}</h3>
          <ul className="cmp-diff">
            {changed.map((g) => {
              const d = g.seatsB - g.seatsA;
              return (
                <li key={g.key}>
                  <span className="cmp-label">{groupIcons(g)} {labelOf(g)} <bdi className="muted" dir="ltr">{g.seatsA} → {g.seatsB}</bdi></span>
                  <span className="cmp-neg">{d < 0 && <i style={{ width: `${(-d / maxChange) * 100}%`, background: 'var(--ink)' }} />}</span>
                  <span className="cmp-axis" aria-hidden />
                  <span className="cmp-pos">{d > 0 && <i style={{ width: `${(d / maxChange) * 100}%`, background: 'var(--ink)' }} />}</span>
                  <b className="cmp-d" dir="ltr"><SeatDelta value={d} /></b>
                </li>
              );
            })}
          </ul>
          {indirect.length > 0 && <p className="small ink2" style={{ margin: '6px 0 0' }}>{L('Changed only through the recalculation (their votes did not change): ', 'השתנו רק בגלל החישוב מחדש (קולותיהן לא השתנו): ')}{indirect.map(g => <span key={g.key}>{gName(g.bIds, s)} <SeatDelta value={g.seatsB - g.seatsA} /> </span>)}</p>}
          {gainers.length > 1 && <p className="small muted" style={{ margin: '4px 0 0' }}>{L('Net seat changes', 'שינויי מנדטים נטו')} <Info title={L('Seat changes', 'שינויי מנדטים')}>{L('With several lists gaining, the method does not say which seat “came from” which list; the net changes are exact.', 'כשכמה רשימות מרוויחות, השיטה אינה קובעת איזה מנדט "עבר" מאיזו רשימה; השינויים נטו מדויקים.')}</Info></p>}
        </section>
      )}

      <KeyNumbers rows={[
        [L('Valid votes', 'קולות כשרים'), fmtInt(ar.totalValid), fmtInt(r.totalValid)],
        [L('Turnout', 'שיעור הצבעה'), turnout(a, digits), turnout(s, digits)],
        [L('Threshold (votes)', 'אחוז החסימה (קולות)'), threshold(a, ar, L), threshold(s, r, L)],
        [L('Votes per seat', 'קולות למנדט'), fmtRat(ar.quota, 0), fmtRat(r.quota, 0)],
        [L('Remainder seats', 'מנדטים מעודפים'), String(ar.remainderSeatsTotal), String(r.remainderSeatsTotal)],
        [L('Votes with no seat', 'קולות ללא מנדט'), fmtPct(ar.unrepresentedVotes, ar.totalValid, digits), fmtPct(r.unrepresentedVotes, r.totalValid, digits)],
      ]} was={L('was', 'היה')} />

      {(entering.length > 0 || leaving.length > 0) && <div className="grid2 stack-sm cmp-section">
        <div>
          <h3>{L(`Entering the Knesset (${entering.length})`, `נכנסים לכנסת (${entering.length})`)}</h3>
          {entering.length === 0 ? <p className="muted small">—</p> : <ul className="small">{entering.map(({ c, l }) => <li key={c.id}><CandidateName candidate={c} /> <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
        <div>
          <h3>{L(`Leaving the Knesset (${leaving.length})`, `יוצאים מהכנסת (${leaving.length})`)}</h3>
          {leaving.length === 0 ? <p className="muted small">—</p> : <ul className="small">{leaving.map(({ c, l }) => <li key={c.id}><CandidateName candidate={c} /> <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
      </div>}

      <details className="cmp-section" open={advanced}>
        <summary className="small" onClick={steady.onClick}>{L('Votes & seats by list', 'קולות ומנדטים לפי רשימה')}</summary>
        <SeatDumbbell rows={[...groups].sort((x, y) => y.seatsB - x.seatsB || y.seatsA - x.seatsA).filter((g) => g.seatsA || g.seatsB).map((g) => ({ key: g.key, a: g.seatsA, b: g.seatsB, label: labelOf(g), color: colorOfGroup(g), icon: groupIcons(g) }))} nameA={nameA} nameB={nameB} />
        <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')}>
          <table className="tbl">
            <thead><tr>
              <th>{L('List(s)', 'רשימה/ות')}</th><th className="n">{L('Votes before', 'קולות לפני')}</th><th className="n">{L('Votes after', 'קולות אחרי')}</th><th className="n">Δ</th><th className="n">{L('Δ share (pp)', 'Δ שיעור (נקודות אחוז)')}</th>
              <th className="n">{L('Seats before', 'מנדטים לפני')}</th><th className="n">{L('after', 'אחרי')}</th><th className="n">Δ</th>
            </tr></thead>
            <tbody>
              {[...groups].sort((x, y) => y.seatsB - x.seatsB || Number(y.votesB - x.votesB)).filter((g) => g.seatsA || g.seatsB || g.votesA !== g.votesB || g.votesB * 100n >= r.totalValid).map((g) => {
                const dv = g.votesB - g.votesA, ds_ = g.seatsB - g.seatsA;
                const share = { num: 100n * (g.votesB * ar.totalValid - g.votesA * r.totalValid), den: ar.totalValid * r.totalValid };
                return (
                  <tr key={g.key}>
                    <td>{g.bIds.length ? g.bIds.map((id) => <button key={id} className="table-action" onClick={() => setState({ selectedListId: id })}>{gName([id], s)}</button>) : gName(g.aIds, a)}{g.aIds.join() !== g.bIds.join() && <small className="muted"> · {baseLabel.at} {gName(g.aIds, a)}</small>}</td>
                    <td className="n">{fmtInt(g.votesA)}</td><td className="n">{fmtInt(g.votesB)}</td>
                    <td className="n"><bdi dir="ltr">{dv === 0n ? '—' : fmtSigned(dv)}</bdi></td>
                    <td className="n"><bdi dir="ltr">{ar.totalValid > 0n && r.totalValid > 0n && share.num !== 0n ? signedDecimal(fmtRat(share, 2)) : '—'}</bdi></td>
                    <td className="n">{g.seatsA}</td><td className="n"><b>{g.seatsB}</b></td>
                    <td className="n"><bdi dir="ltr"><SeatDelta value={ds_} /></bdi></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
      <p className="small muted">{L('Election-night candidates', 'מועמדים בליל הבחירות')} <Info title={L('Candidate coverage', 'כיסוי המועמדים')}>{L('Elected candidates are the first names on each list as registered (election night). Later changes in membership are not modelled.', 'הנבחרים הם המועמדים הראשונים בכל רשימה כפי שנרשמה (ליל הבחירות). שינויים מאוחרים בהרכב אינם מוצגים.')}</Info></p>
      {steady.spacer}
    </div>
  );
}

/** Nothing differs: instead of two identical pictures, the quickest ways to something worth comparing,
 *  each with a strip of its seats. */
function EmptyCompare({ s, ds, base, compareWith, nameA, nameB }: { s: Scenario; ds: ElectionDataset; base: Scenario; compareWith: string; nameA: string; nameB: string }) {
  const L = useL();
  const { markerReference: reference } = useActiveReference();
  const saved = useStore((st) => st.saved);
  const { choices, previous, electionName } = useCompareChoices(s, ds);
  const prevDs = useStore((st) => previous ? st.datasets[previous.id] : undefined);
  useEffect(() => { if (previous && !prevDs) loadDataset(previous.id).catch(() => {}); }, [previous, prevDs]);
  const scenarioOf = (value: string) => {
    if (value === 'official') return base;
    if (value === 'historical') return reference ?? base;
    const sv = saved.find((x) => x.id === value);
    return sv ? replay(ds, sv.name, sv.log, sv.factionSplitBaseline ?? false).scenario : null;
  };
  const card = (key: string, title: string, sc: Scenario | null, onClick: () => void) => <button key={key} type="button" className="btn cmp-pick" onClick={onClick}>
    <b>{title}</b>{sc ? <ResultPreview s={sc} blocs={false} /> : <span className="result-preview" aria-hidden />}
  </button>;
  return (
    <div className="cmp">
      <AnalysisEdits s={s} outlet="compare-grouping" /><ComparePicker s={s} ds={ds} name={nameB} value={compareWith} />
      <section className="cmp-empty" aria-labelledby="cmp-empty-title">
        <h3 id="cmp-empty-title">{L('Compare ', 'השוואת ')}<bdi>{nameB}</bdi>{L(' with…', ' עם…')}</h3>
        <div className="cmp-picks">
          {choices.filter((c) => c.value !== compareWith && !c.value.startsWith(ELECTION)).map((c) => card(c.value, c.label, scenarioOf(c.value), () => setState({ compareWith: c.value })))}
          {previous && card(previous.id, electionName(previous.id), prevDs ? baselineOf(prevDs) : null, () => setState({ compareWith: ELECTION + previous.id }))}
          <ChoicePicker className="cmp-other" label={L('Another election', 'בחירות אחרות')} placeholder={L('Another election…', 'בחירות אחרות…')} value="" options={choices.filter((c) => c.value.startsWith(ELECTION))} onChange={(v) => setState({ compareWith: v })} />
          <button type="button" className="btn" onClick={() => setState({ tool: 'whatif' })}>{L('A What-if question…', 'שאלת "מה אם"…')}</button>
        </div>
        <p className="small muted">{nameA !== nameB && <>{L(`Same as ${nameA}. `, `זהה ל${nameA}. `)}</>}{L('Your changes show here.', 'השינויים שלכם יוצגו כאן.')}</p>
      </section>
    </div>
  );
}

/** Two elections side by side: each official (or edited) result with its own grouping. Lists are not matched
 *  across elections, since no sourced list-to-list correspondence exists; Party families follows parties over time. */
function ElectionCompare({ s, r, base, ds, otherId }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset; otherId: ElectionId }) {
  const L = useL(), lang = useLang(), digits = useDigits();
  const ods = useStore((st) => st.datasets[otherId]);
  const { electionName } = useCompareChoices(s, ds);
  useEffect(() => { if (!ods) loadDataset(otherId).catch(() => { toast('error', L('Could not load this election.', 'לא ניתן לטעון את הבחירות האלה.')); setState({ compareWith: 'historical' }); }); }, [ods, otherId]); // eslint-disable-line react-hooks/exhaustive-deps
  const o = ods ? baselineOf(ods) : null;
  const or = useMemo(() => o ? allocationOf(o) : null, [o]);
  const current = { sc: s, rr: r, election: electionName(s.electionId), name: resultChanges(s, base).length ? s.name || L('Your scenario', 'התרחיש שלכם') : L('Official result', 'התוצאה הרשמית'), color: resultChanges(s, base).length ? scenarioColor(s) : 'var(--rule)' };
  if (!o || !or || !ods) return <div className="cmp"><AnalysisEdits s={s} outlet="compare-grouping" /><ComparePicker s={s} ds={ds} name={current.name} value={ELECTION + otherId} /><p className="small muted">{L('Loading…', 'טוען…')}</p></div>;
  const otherSide = { sc: o, rr: or, election: electionName(otherId), name: L('Official result', 'התוצאה הרשמית'), color: 'var(--rule)' };
  // the earlier election is drawn first, so time reads left to right in either language
  const [left, right] = ods.electionDate < ds.electionDate ? [otherSide, current] : [current, otherSide];
  const elected = (rr: AllocationResult) => String(rr.lists.filter((x) => x.seats > 0).length);
  const when = left.election.split(' · ')[0];
  return (
    <div className="cmp">
      <AnalysisEdits s={s} outlet="compare-grouping" /><ComparePicker s={s} ds={ds} name={current.name} value={ELECTION + otherId} />
      <div className="cmp-chambers">
        {[left, right].map((x) => <figure key={x.sc.electionId} style={{ border: `2px solid ${x.color}` }}>
          <figcaption>{x.election}<span className="small muted cmp-sub">{x.name}</span></figcaption>
          {/* another election's seats open no list here: its lists are not part of the open scenario */}
          <div onClickCapture={x.sc === o ? (e) => e.stopPropagation() : undefined}><Hemicycle reference={x.sc} s={x.sc} r={x.rr} compact paired title={x.election} /></div>
        </figure>)}
      </div>
      <p className="small muted cmp-key">{L('Lists are not matched across elections', 'הרשימות אינן מותאמות בין בחירות')} <Info title={L('Comparing elections', 'השוואת בחירות')}>{L('Parties merge, split and rename between elections, so lists are not paired here and no seat change is computed. Party families follows parties over time.', 'מפלגות מתאחדות, מתפצלות ומשנות שם בין בחירות, ולכן הרשימות אינן מוצמדות כאן ולא מחושב שינוי במנדטים. "משפחות מפלגות" עוקב אחר המפלגות לאורך זמן.')}</Info> <button type="button" className="btn small ghost" onClick={() => setState({ tool: 'families' })}>{L('Party families', 'משפחות מפלגות')}</button></p>

      {(left.sc.blocs.length > 0 || right.sc.blocs.length > 0) && <section className="cmp-section">
        <h3>{L('Blocs', 'גושים')}</h3>
        {[left, right].filter((x) => x.sc.blocs.length).map((x) => { const sums = blocSums(x.sc, x.rr); return <div key={x.sc.electionId}>
          <BlocBarRow sums={sums} title={x.election} sc={x.sc} />
          <div className="legend small cmp-bloclegend"><span className="muted">{groupingLabel(x.sc, lang)}:</span>{blocDisplayOrder(x.sc).map((id) => { const bloc = x.sc.blocs.find((b) => b.id === id), n = id === null ? x.sc.rules.seats - Object.values(sums).reduce((t, v) => t + v, 0) : sums[id] ?? 0; if (!n) return null; const color = bloc?.color ?? 'var(--muted)';
            return <span key={id ?? '__none'} className="row" title={bloc?.appDefined ? appGroupingExplanation(lang) : undefined} style={{ gap: 5 }}><span className="swatch" style={{ background: `color-mix(in srgb, ${color} 24%, var(--surface))`, border: `1px ${id === null ? 'dotted' : 'solid'} ${color}` }} />{bloc ? groupingName(bloc, lang, x.sc.blocSchemes?.find(g => g.id === x.sc.blocSchemeId)) : L('No bloc', 'ללא גוש')} <b>{n}</b></span>; })}</div>
        </div>; })}
      </section>}

      <KeyNumbers rows={[
        [L('Valid votes', 'קולות כשרים'), fmtInt(left.rr.totalValid), fmtInt(right.rr.totalValid)],
        [L('Turnout', 'שיעור הצבעה'), turnout(left.sc, digits), turnout(right.sc, digits)],
        [L('Threshold (votes)', 'אחוז החסימה (קולות)'), threshold(left.sc, left.rr, L), threshold(right.sc, right.rr, L)],
        [L('Votes per seat', 'קולות למנדט'), fmtRat(left.rr.quota, 0), fmtRat(right.rr.quota, 0)],
        [L('Lists elected', 'רשימות שנבחרו'), elected(left.rr), elected(right.rr)],
        [L('Votes with no seat', 'קולות ללא מנדט'), fmtPct(left.rr.unrepresentedVotes, left.rr.totalValid, digits), fmtPct(right.rr.unrepresentedVotes, right.rr.totalValid, digits)],
      ]} was={L(`${when}:`, /^\d/.test(when) ? `ב-${when}:` : `ב${when}:`)} always />
    </div>
  );
}

function KeyNumbers({ rows, was, always = false }: { rows: string[][]; was: string; always?: boolean }) {
  const L = useL();
  return <section className="cmp-section">
    <h3>{L('Key numbers', 'מספרי מפתח')}</h3>
    <div className="figures">
      {rows.map(([k, x, y]) => <div key={k} className="fig static"><span className="k"><span>{k}</span></span><span className="v">{y}</span><span className="d">{x === y && !always ? ' ' : `${was} ${x}`}</span></div>)}
    </div>
  </section>;
}

function BlocBarRow({ sums, title, sc }: { sums: Record<string, number>; title: string; sc: Scenario }) {
  const L = useL(), lang = useLang();
  const total = sc.rules.seats, majority = Math.floor(total / 2) + 1;
  const rest = total - sc.blocs.reduce((t, b) => t + (sums[b.id] ?? 0), 0);
  return (
    <div className="cmp-blocrow">
      <span className="small ink2">{title}</span>
      <div className="coal-bar big" aria-label={`${title}: ${sc.blocs.map((b) => `${groupingName(b, lang)} ${sums[b.id] ?? 0}`).join(', ')}, ${L('No bloc','ללא גוש')} ${rest}`}>
        {blocDisplayOrder(sc).map(id=>{
          const bloc=sc.blocs.find(b=>b.id===id), n=id===null?rest:sums[id]??0;
          if(!n)return null;
          const color=bloc?.color ?? 'var(--muted)';
          return <i key={id??'__none'} data-bloc={id??'__none'} style={{flexBasis:`${n/total*100}%`,background:`color-mix(in srgb, ${color} 24%, var(--surface))`,border:`1px ${id===null?'dotted':'solid'} ${color}`}} title={`${bloc?.appDefined ? appGroupingExplanation(lang) + " " : ""}${bloc ? groupingName(bloc, lang) : L('No bloc','ללא גוש')} ${n}`}><span className="cmp-n">{n}</span></i>;
        })}
        <span className="maj" style={{ left: `${(majority / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** Seats before → after for every list, one row each (a dumbbell): the hollow dashed dot is the baseline, the filled dot
 *  the result, joined in neutral ink when they differ. Rows never collide, so equal seat counts stay readable.
 *  The track reads left to right in both languages; only the names follow the page direction. */
export function SeatDumbbell({ rows, nameA, nameB }: { rows: { key: string; a: number; b: number; label: string; color: string; icon?: ReactNode }[]; nameA: string; nameB: string }) {
  const L = useL();
  const max = Math.max(1, ...rows.flatMap((g) => [g.a, g.b]));
  const step = max > 40 ? 20 : max > 16 ? 10 : 5;
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const at = (v: number) => `${(v / max) * 100}%`;
  return (
    <figure className="cmp-dumbbell" aria-label={L(`Seats: ${nameA} → ${nameB}`, `מנדטים: ${nameA} → ${nameB}`)}>
      <figcaption className="small ink2 db-key"><span className="db-was" aria-hidden /> <bdi>{nameA}</bdi> <span className="db-now" aria-hidden /> <bdi>{nameB}</bdi></figcaption>
      <ul>
        {rows.map((g) => {
          const changed = g.a !== g.b, lo = Math.min(g.a, g.b);
          return (
            <li key={g.key} className={changed ? 'changed' : ''} title={`${g.label}: ${g.a} → ${g.b}`}>
              <span className="cmp-label">{g.icon ?? <span className="swatch" style={{ background: g.color }} />} {g.label}</span>
              <span className="db-track" aria-hidden>
                {ticks.map((t) => <span key={t} className="db-tick" style={{ left: at(t) }} />)}
                {changed && <i className="db-seg" style={{ left: at(lo), width: `${(Math.abs(g.b - g.a) / max) * 100}%` }} />}
                {changed && <i className="db-was" style={{ left: at(g.a) }} />}
                <i className="db-now" style={{ left: at(g.b), background: g.color }} />
              </span>
              <bdi dir="ltr" className="db-v">{changed ? <>{g.a} → <b>{g.b}</b></> : g.b}</bdi>
            </li>
          );
        })}
      </ul>
      <div className="db-axis" aria-hidden><span />{<span className="db-track">{ticks.map((t) => <span key={t} style={{ left: at(t) }}>{t}</span>)}</span>}<span /></div>
    </figure>
  );
}
