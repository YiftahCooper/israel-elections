import { formatDate } from '../dateFormat.ts';
import { reviewedAftermath } from '../../data/aftermath-runtime.ts';
import { englishLabel } from '../../data/names.ts';
import type { Certainty } from '../../data/evidence.ts';
import { AnalysisEdits } from './AnalysisEdits.tsx';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { dispatch } from '../store.ts';
import { StartFrom } from './StartFrom.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, NO_COALITION, COALITION_ROLES, withCoalitionRole, type CoalitionRole, type Scenario } from '../../model/scenario.ts';
import { coalitionPieces, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtSigned } from '../format.ts';
import { runTasks } from '../analysisPool.ts';
import { partsOf, type SecurityFigure, type SecurityItem, type SecurityPart } from '../analysisTasks.ts';
import { setState } from '../store.ts';
import { stayingHome, toVoteSource, type SourceChoice } from '../voteEdit.ts';
import { DisclosureToggle, Info, Seg, Slip } from './ui.tsx';
import { minimalWinning, governmentVote, recordedRoles } from '../coalitions.ts';
import { Majority } from './Majority.tsx';
import './coalitions.css';

type Kind = 'proportional' | 'new';
type Figures = Map<string, SecurityFigure>;
const figureKey = (id: string, part: SecurityPart) => `${id} ${part}`;
/** Figures per election input and vote source (a few recent ones), so revisiting the tab, undo/redo and
 *  edits that move no votes (names, colours, blocs) are instant. A run stopped half-way keeps what it found. */
const figureCache = new Map<string, Figures>();
const remember = (key: string, m: Figures) => {
  figureCache.delete(key);
  figureCache.set(key, m);
  while (figureCache.size > 12) figureCache.delete(figureCache.keys().next().value!);
};
const noFigures: Figures = new Map();

/** How close every list is to its next seat and to losing one — the "knife-edge" view — and how far each
 *  list below the threshold is from crossing it. */
export function SeatSecurity({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [kind, setKind] = useState<Kind>('proportional');
  const [allBelow, setAllBelow] = useState(false);
  const input = useMemo(() => toEngineInput(s), [s]);
  // new voters are capped by the voters staying home, which the engine input does not carry
  const home = kind === 'new' ? stayingHome(s) : 0;
  const key = useMemo(() => kind + home + JSON.stringify(input, (_, v) => (typeof v === 'bigint' ? v.toString() : v)), [input, kind, home]);
  const thr = Number(r.thresholdVotes);
  // Every row is known before any search, so the table is laid out at once in its final order and
  // fills in as figures arrive: lists that passed the threshold by seats, then votes; the rest by votes.
  const { above, below } = useMemo(() => {
    const live = s.lists.flatMap((l) => {
      const lr = r.lists.find((x) => x.id === l.id);
      return lr && !l.withdrawn && l.votes > 0 ? [{ l, item: { id: l.id, qualified: lr.qualified, seats: lr.qualified ? lr.seats : 0 } as SecurityItem }] : [];
    });
    return {
      above: live.filter((x) => x.item.qualified).sort((a, b) => b.item.seats - a.item.seats || b.l.votes - a.l.votes),
      below: live.filter((x) => !x.item.qualified).sort((a, b) => b.l.votes - a.l.votes),
    };
  }, [s, r]);
  // threshold searches take a millisecond each, so they go first; then the table, top row first
  const items = useRef<SecurityItem[]>([]);
  items.current = [...below, ...above].map((x) => x.item);

  const [live, setLive] = useState<{ key: string; m: Figures }>({ key: '', m: noFigures });
  useEffect(() => {
    const m = new Map(figureCache.get(key) ?? noFigures);
    remember(key, m);
    const todo = items.current.flatMap((item) => partsOf(item).filter((part) => !m.has(figureKey(item.id, part))).map((part) => ({ kind: 'security' as const, input, src: toVoteSource({ kind } as SourceChoice, s), part, item })));
    setLive({ key, m: new Map(m) });
    if (!todo.length) return;
    return runTasks(todo, (k, value) => {
      m.set(figureKey(todo[k].item.id, todo[k].part), value);
      setLive({ key, m: new Map(m) });
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- input and items follow from key
  // on the render that changes the key, show what is already known for it (all of it, on a revisit)
  const figs = live.key === key ? live.m : (figureCache.get(key) ?? noFigures);
  const fig = (id: string, part: SecurityPart) => figs.get(figureKey(id, part));
  const all = [...below, ...above];
  const done = all.filter((x) => partsOf(x.item).every((p) => figs.has(figureKey(x.item.id, p)))).length;
  const busy = done < all.length;

  // A fixed scale independent of the order in which workers finish;
  // square root, so knife-edge margins stay visible.
  const perSeat = Number(r.qualifyingVotes) / Math.max(1, r.rules.seats);
  const max = Math.max(1, 1.25 * perSeat);
  const scale = (v: number) => Math.sqrt(Math.min(v, max) / max) * 100;
  const nm = (id: string) => listLabel(s.lists.find((l) => l.id === id)!, lang);

  const text = (f: SecurityFigure | undefined) => {
    if (!f) return <span className="sec-pending" aria-label={L('Calculating', 'מחשב')}>…</span>;
    if (f.value !== null) return f.exact ? fmtInt(f.value) : <span title={L('Found by sampling: the smallest may be lower', 'נמצא בדגימה: הקטן ביותר עשוי להיות נמוך יותר')}>≤ {fmtInt(f.value)}</span>;
    if (f.reason === 'already') return '0';
    if (f.reason === 'infeasible') return <span title={L('Not possible', 'לא אפשרי')}>—</span>;
    if (f.exact) return <span title={L(`None within ${fmtInt(f.limit)} votes`, `אין עד ${fmtInt(f.limit)} קולות`)}>&gt; {fmtInt(f.limit)}</span>;
    return <span title={L(`Not found by sampling up to ${fmtInt(f.limit)}`, `לא נמצא בדגימה עד ${fmtInt(f.limit)}`)}>?</span>;
  };
  const shown = [...above.flatMap((x) => partsOf(x.item).map((p) => fig(x.l.id, p))), ...below.map((x) => fig(x.l.id, 'qualify'))].filter((f): f is SecurityFigure => !!f);
  const sampled = shown.some((f) => !f.exact && f.value !== null);
  const unknown = shown.some((f) => f.value === null && !f.exact && f.reason !== 'infeasible' && f.reason !== 'already');
  const bounded = shown.some((f) => f.value === null && f.exact && f.reason === 'limit');

  const tightest = busy ? [] : above
    .filter((x) => x.item.seats > 0 && fig(x.l.id, 'gain')?.exact && fig(x.l.id, 'lose')?.exact)
    .flatMap((x) => [{ id: x.l.id, v: fig(x.l.id, 'gain')?.value ?? Infinity, t: 'gain' as const }, { id: x.l.id, v: fig(x.l.id, 'lose')?.value ?? Infinity, t: 'lose' as const }])
    .filter((x) => Number.isFinite(x.v)).sort((a, b) => a.v - b.v).slice(0, 3);

  const near = below.filter((x) => x.l.votes >= thr / 2);
  const belowShown = allBelow ? below : near;
  const open = (id: string) => setState({ selectedListId: id });
  const name = (l: Scenario['lists'][number]) => (
    <span className="sec-name"><span className="swatch" style={{ background: l.color }} /><button className="table-action" onClick={() => open(l.id)}>{listLabel(l, lang)}</button></span>
  );

  return (
    <div className="sec">
      <div className="sec-controls">
        <span className="small ink2">{L('Votes come from', 'הקולות מגיעים מ־')}</span>
        <Seg label={L('Votes come from', 'הקולות מגיעים מ־')} value={kind} onChange={setKind} options={[{ v: 'proportional', label: L('Other lists', 'שאר הרשימות') }, { v: 'new', label: L('New voters', 'מצביעים חדשים') }]} />
        <Info title={L('How this is computed', 'איך זה מחושב')}>
          {L('Each figure is the fewest votes a list must lose or gain to change its seats, found by recomputing the whole election.', 'כל מספר הוא הכי מעט קולות שרשימה צריכה לאבד או להוסיף כדי שמספר המנדטים שלה ישתנה, לפי חישוב מחדש של כל הבחירות.')}{' '}
          {L('Other lists: votes move to or from all other lists in proportion; turnout stays the same. New voters: votes come from new voters, or are lost to voters staying home, so the threshold moves too.', 'שאר הרשימות: הקולות עוברים מכל שאר הרשימות או אליהן, באופן יחסי; שיעור ההצבעה לא משתנה. מצביעים חדשים: הקולות באים ממצביעים חדשים, או הולכים לנמנעים, ולכן גם אחוז החסימה בקולות זז.')}{' '}
          {L('Bars use a fixed square-root scale, capped at 1.25 seats’ worth of votes; numbers show the full margin. ≤ marks a figure found by sampling: the smallest may be lower. > means none was found within the search limit; ? that sampling found none.', 'הפסים בסקאלת שורש קבועה, עד קולות בשווי 1.25 מנדטים; המספרים מציגים את הפער המלא. ≤ מסמן מספר שנמצא בדגימה: הקטן ביותר עשוי להיות נמוך יותר. > פירושו שלא נמצא בגבול החיפוש; ? שהדגימה לא מצאה.')}
        </Info>
      </div>
      <div className="sec-summary small">
        {busy
          ? <span className="muted" role="status">{L(`Calculating… ${done} of ${all.length} lists`, `מחשב… ${done} מתוך ${all.length} רשימות`)}</span>
          : tightest.length > 0 && <>
            <span className="ink2">{L('Closest calls:', 'הקרובים ביותר:')}</span>
            {tightest.map((x) => {
              const l = s.lists.find((y) => y.id === x.id)!;
              const say = x.t === 'gain' ? L(`${nm(x.id)} is ${fmtInt(x.v)} votes from another seat`, `${nm(x.id)} במרחק ${fmtInt(x.v)} קולות ממנדט נוסף`) : L(`${nm(x.id)} would lose a seat after losing ${fmtInt(x.v)} votes`, `${nm(x.id)} תאבד מנדט באובדן ${fmtInt(x.v)} קולות`);
              return <button key={x.id + x.t} type="button" className="chip sec-call" title={say} aria-label={say} onClick={() => open(x.id)}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <bdi dir="ltr" className="tabnum">{fmtSigned(x.t === 'gain' ? x.v : -x.v)}</bdi></button>;
            })}
          </>}
      </div>
      {above.length > 0 && (
        <div className="security" role="table" aria-label={L('Seat security', 'ביטחון המנדטים')}>
          <div className="sec-row head" role="row"><span role="columnheader" className="sec-name">{L('List', 'רשימה')}</span><span role="columnheader" className="sec-l">{L('Votes to lose a seat', 'קולות לאובדן מנדט')} <SeatDelta value={-1} /></span><span role="columnheader" className="sec-seats">{L('Seats', 'מנדטים')}</span><span role="columnheader" className="sec-r">{L('Votes to gain a seat', 'קולות למנדט נוסף')} <SeatDelta value={1} /></span></div>
          {above.map(({ l, item }) => {
            const lose = item.seats > 0 ? fig(l.id, 'lose') : undefined;
            const gain = fig(l.id, 'gain');
            return (
              <div key={l.id} className="sec-row" role="row">
                <span role="cell" style={{ minWidth: 0 }}>{name(l)}</span>
                <span role="cell" className="sec-l">{item.seats > 0 && <><span className="tabnum small">{text(lose)}</span><span className="sec-track">{lose?.value != null && <span className="sec-bar" style={{ width: `${scale(lose.value)}%`, background: `color-mix(in srgb, ${l.color} 30%, transparent)`, boxShadow: `inset 0 0 0 1px ${l.color}` }} />}</span></>}</span>
                <span role="cell" className="sec-seats tabnum">{item.seats}</span>
                <span role="cell" className="sec-r"><span className="sec-track">{gain?.value != null && <span className="sec-bar" style={{ width: `${scale(gain.value)}%`, background: l.color }} />}</span><span className="tabnum small">{text(gain)}</span></span>
              </div>
            );
          })}
        </div>
      )}
      {below.length > 0 && (
        <section className="sec-below" aria-label={L('Below the threshold', 'מתחת לאחוז החסימה')}>
          <h3 className="small">{L('Below the threshold', 'מתחת לאחוז החסימה')} <span className="muted tabnum" style={{ fontWeight: 400 }}>· {fmtInt(thr)} {L('votes', 'קולות')}</span></h3>
          {near.length < below.length && <DisclosureToggle open={allBelow} onToggle={() => setAllBelow(!allBelow)} more={L(`${below.length - near.length} smaller lists`, `עוד ${below.length - near.length} רשימות קטנות`)} fewer={L('Fewer', 'פחות')} />}
          <ul>
            {belowShown.map(({ l }) => {
              const q = fig(l.id, 'qualify');
              return (
                <li key={l.id}>
                  {name(l)}
                  <span className="sec-gauge" role="img" aria-label={L(`${fmtInt(l.votes)} of ${fmtInt(thr)} votes`, `${fmtInt(l.votes)} מתוך ${fmtInt(thr)} קולות`)}><i style={{ width: `${Math.min(100, (l.votes / Math.max(1, thr)) * 100)}%`, background: l.color }} /></span>
                  <span className="small sec-short">{q && q.value !== null && q.exact ? L(`${fmtInt(q.value)} short`, `חסרים ${fmtInt(q.value)}`) : <>{L('Short', 'חסרים')} <span className="tabnum">{text(q)}</span></>}</span>
                </li>
              );
            })}
          </ul>

        </section>
      )}
      {(sampled || unknown || bounded) && (
        <p className="small muted" style={{ marginBottom: 0 }}>
          {[sampled && L('≤ found by sampling', '≤ נמצא בדגימה'), bounded && L('> none within the search limit', '> לא נמצא בגבול החיפוש'), unknown && L('? sampling found none', '? הדגימה לא מצאה')].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}

/** Coalition arithmetic: give each list a role, see the confidence vote and the 61 majority, list minimal
 *  winning coalitions. Outside support votes for without joining; an arranged abstention lowers the votes
 *  against (src/app/coalitions.ts states the law). */
export function Coalitions({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const seated = coalitionPieces(s, r).map(p => {
    const list = s.lists.find(l => l.id === p.listId)!;
    const party = list.parties?.find(x => x.id === p.partyId);
    const label = party ? `${lang === 'he' ? party.nameHe : party.nameEn} (${listLabel(list, lang)})` : listLabel(list, lang);
    return { l: { id: p.id, color: p.color, bloc: p.bloc }, letters: party ? '' : list.letters, listId: p.listId, partyId: p.partyId, logo: party ? party.logo : list.logo, synthetic: party ? undefined : list.synthetic, n: p.n, label };
  });
  const [inspected, setInspected] = useState<{ election: string; ids: string[] } | null>(null);
  const selected = inspected?.election === s.electionId ? inspected.ids.filter(id => seated.some(x => x.l.id === id)) : [];
  const choices = s.coalition ?? NO_COALITION;
  // choices name units by id; a unit no longer seated (after an edit) keeps its choice but counts for nothing
  const live = (ids: string[]) => ids.filter(id => seated.some(x => x.l.id === id));
  const roleOf = (id: string): CoalitionRole | 'any' => COALITION_ROLES.find(k => choices[k].includes(id)) ?? 'any';
  const pickedIds = live(choices.in), supportIds = live(choices.support), abstainIds = live(choices.abstain);
  const total = s.rules.seats;
  const seatsOf = (id: string) => seated.find((x) => x.l.id === id)?.n ?? 0;
  const sumOf = (ids: string[]) => ids.reduce((n, id) => n + seatsOf(id), 0);
  const support = sumOf(supportIds), abstain = sumOf(abstainIds);
  const voteOf = (ids: string[]) => governmentVote({ members: sumOf(ids), support, abstain, total });
  const { forNeeded, majority } = voteOf([]);
  // members a winning coalition needs: outside support already votes for, abstentions lower the bar
  const memberNeed = forNeeded - support;
  // pruned search (src/app/coalitions.ts): same coalitions and order as the former 2^N enumeration,
  // without its 18-list limit; it stops at 100,000 coalitions and says so
  const { coalitions: minimal, truncated } = useMemo(
    () => memberNeed > 0 ? minimalWinning(seated.filter((x) => { const k = roleOf(x.l.id); return k === 'in' || k === 'any'; }).map((x) => ({ id: x.l.id, n: x.n })), memberNeed, pickedIds) : { coalitions: [], truncated: false },
    [seated.map(x => `${x.l.id}:${x.n}`).join(), memberNeed, JSON.stringify(choices)]);
  const nm = (id: string) => seated.find(x => x.l.id === id)!.label;
  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));
  const choose = (id: string, role: CoalitionRole | 'any') => {
    if (role === roleOf(id)) return;
    setInspected(null);
    dispatch({ type: 'setCoalition', coalition: withCoalitionRole(choices, id, role) });
  };
  const government = s.blocSchemes?.find(g => g.kind === 'government');
  const governmentBloc = government?.blocs.find(b => b.id === 'coalition');
  // A structural edit or a collapsed mixed list cannot establish partner identity.
  const historyComparable = governmentBloc && !governmentBloc.candidates.length &&
    governmentBloc.lists.every(id => s.lists.some(l => l.id === id)) &&
    !seated.some(x => !x.partyId && s.lists.find(l => l.id === x.listId)?.parties?.some(p => governmentBloc.parties.includes(p.id)));
  const missingGovernmentPartner = governmentBloc?.lists.some(id => !seated.some(x => x.listId === id));
  const historicalIds = historyComparable
    ? seated.filter(x => governmentBloc.lists.includes(x.listId) || (!!x.partyId && governmentBloc.parties.includes(x.partyId))).map(x => x.l.id) : null;
  const historyMatches = (ids: string[]) => !missingGovernmentPartner && !!historicalIds?.length && historicalIds.length === ids.length && historicalIds.every(id => ids.includes(id));
  const sorted = [...minimal].sort((a, b) => a.n - b.n || a.ids.length - b.ids.length);
  const shown = sorted.slice(0, 24);
  const blocName = (b: { nameHe: string; nameEn: string; appDefined?: boolean }) => groupingName(b, lang);
  // a bloc fills members; a sourced government grouping's outside-support or abstention group is not a member set
  const startFrom = s.blocs.filter((b) => b.id !== 'outside-support' && b.id !== 'abstained-by-arrangement').map((b) => ({ b, ids: seated.filter((x) => x.l.bloc === b.id).map((x) => x.l.id) })).filter((x) => x.ids.length);
  /** The researched first government (data/meta/aftermath, docs/source-policy.md) as roles: members In, outside
   *  support Support, arranged abstention Abstain. A confidence vote alone, or an unknown relationship, is not an
   *  arrangement and stays Any. Each row keeps its recorded certainty; nothing is upgraded. */
  const record = reviewedAftermath(s.electionId)?.government;
  const { recorded: recordedRows, choices: recordedChoices } = recordedRoles(record?.coalition ?? [], s.lists, seated.map((x) => ({ id: x.l.id, listId: x.listId })));
  const recorded = recordedRows.map((x) => ({ ...x, name: x.list ? listLabel(x.list, lang) : x.r.factionNameHe ? (lang === 'he' ? x.r.factionNameHe : englishLabel(null, x.r.factionNameHe)) : (x.r.letters ?? '') }));
  const recordOn = !!recordedChoices && COALITION_ROLES.every((k) => sameSet(live(choices[k]), recordedChoices[k]));
  const certaintyName = (c: Certainty) => ({ confirmed: L('confirmed', 'מאושר'), probable: L('probable', 'סביר'), provisional: L('provisional', 'זמני'), disputed: L('disputed', 'שנוי במחלוקת'), unknown: L('unknown', 'לא ידוע') })[c];
  const colorOf = (id: string) => seated.find(x => x.l.id === id)!.l.color;
  const roleNames: Record<CoalitionRole | 'any', [string, string, string]> = {
    in: [L('In', 'בפנים'), L('Member of the government', 'חברה בקואליציה'), L('members', 'בקואליציה')],
    support: [L('Support', 'תומכת'), L('Outside support: votes for the government without joining it', 'תמיכה מבחוץ: מצביעה בעד הממשלה בלי להצטרף אליה'), L('outside support', 'תמיכה מבחוץ')],
    abstain: [L('Abstain', 'נמנעת'), L('Abstains by arrangement: not counted among those voting', 'נמנעת בהסדר: אינה נמנית עם המצביעים'), L('abstaining', 'נמנעים')],
    out: [L('Out', 'בחוץ'), L('In no coalition; votes against', 'מחוץ לכל קואליציה; מצביעה נגד'), ''],
    any: [L('Any', 'כל אפשרות'), L('Either', 'כל אחת מהאפשרויות'), ''],
  };
  /** a 120-seat bar: members in their colours from the start, then outside support hatched, the rest pale;
   *  arranged abstentions sit hollow at the far end, off the votes against. Lines: 61, and the lower
   *  confidence-vote bar when abstentions lower it. */
  const SeatBar = ({ ids, big }: { ids: string[]; big?: boolean }) => (
    <div className={`coal-bar ${big ? 'big' : ''}`} aria-hidden>
      {ids.map((id) => <i key={id} style={{ flexBasis: `${(seatsOf(id) / total) * 100}%`, background: colorOf(id) }} title={`${nm(id)} ${seatsOf(id)}`} />)}
      {supportIds.map((id) => <i key={id} className="coal-support" style={{ flexBasis: `${(seatsOf(id) / total) * 100}%`, ['--c' as string]: colorOf(id) }} title={`${nm(id)} ${seatsOf(id)} · ${roleNames.support[2]}`} />)}
      {abstainIds.length > 0 && <span className="coal-gap" />}
      {abstainIds.map((id) => <i key={id} className="coal-abstain" style={{ flexBasis: `${(seatsOf(id) / total) * 100}%`, ['--c' as string]: colorOf(id) }} title={`${nm(id)} ${seatsOf(id)} · ${roleNames.abstain[2]}`} />)}
      {big && forNeeded !== majority && <span className="maj conf" style={{ insetInlineStart: `${(forNeeded / total) * 100}%` }}><em>{forNeeded}</em></span>}
      <span className="maj" style={{ insetInlineStart: `${(majority / total) * 100}%` }}>{big && <em>{majority}</em>}</span>
    </div>
  );
  /** "56 members + 5 outside support = 61", each term keyed to its bar pattern (only when roles beyond members
   *  exist), then both tests with ✓/✗ and words: the confidence vote (more for than against) and the 61
   *  majority in the app's usual "n / 120 · above 61" form. */
  const Vote = ({ ids }: { ids: string[] }) => {
    const v = voteOf(ids);
    const term = (cls: string, n: number, what: string) => <span className="coal-term"><i className={`coal-key ${cls}`} aria-hidden /><b>{n}</b> {what}</span>;
    const mark = (ok: boolean) => <><span className="coal-mark" aria-hidden>{ok ? '✓' : '✗'}</span><span className="sr-only">{ok ? L('Yes: ', 'כן: ') : L('No: ', 'לא: ')}</span></>;
    return <div className="coal-vote">
      {(support > 0 || abstain > 0) && <span className="coal-sum">{term('', v.members, roleNames.in[2])}{support > 0 && <> + {term('coal-support', support, roleNames.support[2])} = <b>{v.votesFor}</b></>}</span>}
      {abstain > 0 && <span className="coal-sum">{term('coal-abstain', abstain, roleNames.abstain[2])}</span>}
      <span className="coal-tests">
        <span className="coal-test" data-ok={v.passes}>{mark(v.passes)}{L('More for than against', 'יותר תומכים ממתנגדים')}: <span className="coal-for">{L(`${v.votesFor} for`, `${v.votesFor} בעד`)}</span> · <span className="coal-against">{L(`${v.against} against`, `${v.against} נגד`)}</span></span>
        <span className="coal-test" data-ok={v.stable}>{mark(v.stable)}<Majority n={v.votesFor} total={total} /></span>
        <Info title={L('Forming a government', 'הקמת ממשלה')}>{L(
          `The Knesset forms a government by a confidence vote (Basic Law: The Government, §13(d)). No special majority is set, so the general rule applies (Basic Law: The Knesset, §25): a majority of those voting, abstainers not counted, so more for than against, not ${v.majority}. ${v.majority} of ${total} is a majority of all members, needed to replace a government by a constructive no-confidence vote (Basic Law: The Government, §28(b)); a government with ${v.majority} cannot be replaced while they hold. Here members and outside support vote for, arranged abstentions abstain and every other seat votes against; absences are not modelled. Pivotal: losing that partner, member or outside support, loses the vote. Members are split by bloc when they span blocs. Arithmetic only, not political feasibility.`,
          `הממשלה מוקמת בהבעת אמון של הכנסת (חוק־יסוד: הממשלה, סעיף 13(ד)). לא נקבע רוב מיוחד, ולכן חל הכלל הכללי (חוק־יסוד: הכנסת, סעיף 25): רוב המשתתפים בהצבעה, והנמנעים אינם נמנים עמם. די ביותר תומכים ממתנגדים, לא ב־${v.majority}. ${v.majority} מתוך ${total} הם רוב חברי הכנסת, הדרוש להחלפת ממשלה בהבעת אי־אמון קונסטרוקטיבית (חוק־יסוד: הממשלה, סעיף 28(ב)); ממשלה שיש לה ${v.majority} אינה ניתנת להחלפה כל עוד הם עומדים לצדה. כאן חברות הקואליציה והתמיכה מבחוץ מצביעות בעד, הנמנעות בהסדר נמנעות וכל השאר מצביעים נגד; היעדרויות אינן מחושבות. חיונית: שותפה, חברה או תומכת מבחוץ, שבלעדיה ההצבעה נכשלת. החברות מפוצלות לפי גוש כשהן משתייכות ליותר מגוש אחד. חשבון בלבד, לא היתכנות פוליטית.`)}</Info>
      </span>
    </div>;
  };
  /** Partners with seats, the bloc split and the first-government comparison. "Pivotal" is named only when it
   *  tells partners apart; in a smallest winning coalition every partner is pivotal, which the list says once.
   *  Outside support follows the members on its own line: it can be pivotal too. */
  const Partners = ({ ids, sayAllNeeded }: { ids: string[]; sayAllNeeded?: boolean }) => {
    const v = voteOf(ids);
    const pivotal = v.passes ? [...ids, ...supportIds].filter(id => v.votesFor - seatsOf(id) < v.forNeeded) : [];
    const tag = pivotal.length > 0 && pivotal.length < ids.length + supportIds.length;
    const item = (id: string) => <li key={id}><Slip letters={seated.find(x => x.l.id === id)?.letters ?? ''} synthetic={seated.find(x => x.l.id === id)?.synthetic} name={nm(id)} logo={seated.find(x => x.l.id === id)?.logo} color={colorOf(id)} size="sm" />{nm(id)} <b>{seatsOf(id)}</b> {tag && pivotal.includes(id) && <span className="small">{L('Pivotal', 'חיונית לרוב')}</span>}</li>;
    const split = [...s.blocs, { id: null, nameHe: 'ללא גוש', nameEn: 'No bloc' }].map(b => ({ b, n: seated.filter(x => ids.includes(x.l.id) && x.l.bloc === b.id).reduce((n, x) => n + x.n, 0) })).filter(x => x.n > 0);
    const everyNeeded = !!sayAllNeeded && pivotal.length === ids.length + supportIds.length && pivotal.length > 1;
    const others = (role: 'support' | 'abstain', list: string[]) => list.length > 0 && <ul className="coal-partners" data-role={role}><li className="small ink2"><i className={`coal-key coal-${role}`} aria-hidden />{role === 'support' ? <>{L('Outside support', 'תמיכה מבחוץ')} <Info term="outside-support" /></> : L('Abstains by arrangement', 'נמנעות בהסדר')}</li>{list.map(item)}</ul>;
    return <>
      <ul className="coal-partners">{ids.map(item)}</ul>
      {others('support', supportIds)}
      {others('abstain', abstainIds)}
      {/* members by bloc only when they span blocs: one bloc would repeat the members total above */}
      {(split.length > 1 || everyNeeded) && <div className="row small coal-blocs">{split.length > 1 && split.map(({ b, n }) => <span key={b.id ?? 'none'} title={'appDefined' in b && b.appDefined ? appGroupingExplanation(lang) : undefined}>{blocName(b)} <b>{n}</b></span>)}
        {everyNeeded && <span className="muted">{L('Each is needed for the majority', 'כל אחת נחוצה לרוב')}</span>}</div>}
      {governmentBloc && <p className="small muted" style={{ margin: 0 }}>{!historicalIds ? L('First-government comparison unavailable', 'אין נתונים להשוואה לממשלה הראשונה') : historyMatches(ids) ? (recordedChoices?.support.length && sameSet(supportIds, recordedChoices.support) ? L('Matches the recorded first government and its outside support', 'תואמת לממשלה הראשונה המתועדת ולתמיכה מבחוץ בה') : L('Matches the recorded first-government partners', 'תואמת לשותפות הממשלה הראשונה המתועדת')) : L('Different from the recorded first-government partners', 'שונה משותפות הממשלה הראשונה המתועדת')}{' '}
        <Info title={L('Historical comparison', 'השוואה היסטורית')}>{L('Compares members with the recorded first government only, not every government during this Knesset, and not its outside support. Scenario seats can differ from the official result.', 'השוואת החברות בקואליציה לממשלה הראשונה המתועדת בלבד, ולא לכל ממשלה במהלך הכנסת או לתמיכה מבחוץ בה. המנדטים בתרחיש עשויים להיות שונים מהתוצאה הרשמית.')} {government && `${blocName(government)} · ${government.date ? formatDate(government.date,lang) : ''}`}</Info></p>}
    </>;
  };
  const already = voteOf(pickedIds);
  return (
    <div className="coal">
      {/* one line that is always there: its reset/copy buttons appear beside the text, never above the cards */}
      <div className="row coal-head"><span className="small ink2">{L('Choose each list’s role', 'בחרו את תפקיד כל רשימה')} <Info title={L('Coalition assumptions', 'הנחות הקואליציה')}>{L('In: a member of every coalition below. Support: outside support, voting for the government without joining it. Abstain: abstains by arrangement, so it is not counted among those voting. Out: in no coalition; it votes against. Any: either. Arithmetic only — it says nothing about political feasibility.', 'בפנים: חברה בכל קואליציה למטה. תומכת: תמיכה מבחוץ, הצבעה בעד הממשלה בלי להצטרף אליה. נמנעת: נמנעת בהסדר, ולכן אינה נמנית עם המצביעים. בחוץ: מחוץ לכל קואליציה; מצביעה נגד. כל אפשרות: כל אחת מהן. חשבון בלבד — לא הערכה פוליטית.')}</Info></span>
        <span className="spacer" /><StartFrom s={s} part="coalitions" /><AnalysisEdits s={s} part="coalitions" outlet="coalition-panel" /></div>
      {record && (
        <div className="row coal-record" style={{ marginBottom: 8 }}>
          <button type="button" className={`btn small ${recordOn ? 'primary' : ''}`} aria-pressed={recordOn} disabled={!recordedChoices} title={recordedChoices ? undefined : L('A recorded partner is not in this scenario', 'שותפה מתועדת אינה בתרחיש זה')}
            onClick={() => { if (recordOn || !recordedChoices) return; setInspected(null); dispatch({ type: 'setCoalition', coalition: recordedChoices }); }}>{L('Recorded first government', 'הממשלה הראשונה המתועדת')}</button>
          <Info title={lang === 'he' ? record.nameHe : record.nameEn}>
            {formatDate(record.startDate, lang)}.{' '}
            {([['in', L('In', 'בפנים')], ['support', L('Outside support', 'תמיכה מבחוץ')], ['abstain', L('Abstains by arrangement', 'נמנעת בהסדר')], [null, L('Left as Any', 'נשארות ב״כל אפשרות״')]] as const).map(([role, label]) => {
              const rows = recorded.filter((x) => x.role === role);
              return rows.length > 0 && <span key={role ?? 'any'}>{label}: {rows.map((x, i) => <span key={i}>{i > 0 && ', '}{x.name}{x.r.certainty !== 'confirmed' && ` (${certaintyName(x.r.certainty)})`}{role === null && ` · ${x.r.certainty === 'unknown' ? L('relationship unknown', 'המעמד לא ידוע') : x.r.role === 'confidence-vote-only' ? L('voted for at investiture only', 'הצביעה בעד באמון בלבד') : L('other relationship', 'מעמד אחר')}`}{x.r.seats !== null && x.list && x.r.seats < sumOf(x.units) && ` · ${L(`${x.r.seats} of its seats took part, counted whole here`, `${x.r.seats} ממנדטיה השתתפו, נספרת כאן במלואה`)}`}</span>)}. </span>;
            })}
            {L('Certainty follows the project’s source policy; a role is never shown as surer than its sources.', 'הוודאות לפי מדיניות המקורות של הפרויקט; תפקיד אינו מוצג ודאי יותר ממקורותיו.')}
          </Info>
        </div>
      )}
      {startFrom.length > 0 && (
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="small ink2">{L('Fill with a bloc', 'מילוי לפי גוש')}</span>
          {/* a bloc fills the members; outside support and abstentions outside the bloc stay as they are */}
          {startFrom.map(({ b, ids }) => { const on = live(choices.out).length === 0 && sameSet(pickedIds, ids); return <button key={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined} className={`btn small ${on ? 'primary' : ''}`} aria-pressed={on} onClick={() => { if (on) return; setInspected(null); dispatch({ type: 'setCoalition', coalition: { in: ids, support: choices.support.filter(id => !ids.includes(id)), abstain: choices.abstain.filter(id => !ids.includes(id)), out: [] } }); }}><span className="swatch" style={{ background: b.color }} />{blocName(b)}</button>; })}
        </div>
      )}
      <div className="coal-chips">
        {seated.map(({ l, n, label, logo, letters, synthetic }) => (
          <div key={l.id} className="coal-choice" data-role={roleOf(l.id)}>
            <span className="coal-who"><Slip letters={letters} name={label} logo={logo} synthetic={synthetic} color={l.color} size="sm" /><span>{label} <b>{n}</b></span></span>
            <Seg label={label} value={roleOf(l.id)} onChange={v => choose(l.id, v)} options={(['in', 'support', 'abstain', 'out', 'any'] as const).map(v => ({ v, label: roleNames[v][0], title: roleNames[v][1] }))} />
          </div>
        ))}
      </div>
      {(pickedIds.length > 0 || supportIds.length > 0) && <section className="coal-now" aria-label={L('Coalition details', 'פרטי הקואליציה')}>
        <h3 style={{ margin: 0 }}>{L('Required partners', 'השותפות הנדרשות')}</h3>
        <Vote ids={pickedIds} />
        <SeatBar ids={pickedIds} big />
        <Partners ids={pickedIds} sayAllNeeded />
      </section>}
      <h3 style={{ marginTop: 16 }}>{L(`Smallest winning coalitions${pickedIds.length ? ' with your In lists' : ''}`, `הקואליציות המנצחות הקטנות ביותר${pickedIds.length ? ' עם הרשימות שבפנים' : ''}`)}
        <span className="muted" style={{ fontWeight: 400 }}> · {minimal.length.toLocaleString('en-US')}{truncated ? '+' : ''} {L('in all', 'בסך הכול')}</span></h3>
      <p className="small muted" style={{ marginTop: 0 }}>{L('Select one to see its partners', 'בחרו אחת כדי לראות את השותפות')} <Info title={L('Winning coalitions', 'קואליציות מנצחות')}>{L('Each wins the confidence vote, with any outside support, and needs every member: remove one and it loses. Without abstentions that means 61 seats. Selecting one shows its partners beneath it; your choices stay as they are.', 'כל אחת זוכה בהצבעה על האמון, יחד עם התמיכה מבחוץ אם יש, וזקוקה לכל חברותיה: הוצאת אחת מפילה אותה. בלי נמנעות פירוש הדבר 61 מנדטים. בחירה באחת מציגה את שותפותיה מתחתיה; הבחירות שלכם נשארות כפי שהן.')}</Info></p>
      {!minimal.length && <p className="small muted">{already.passes
        ? already.stable ? L('Your In lists already have a majority, with lists to spare.', 'לרשימות שבפנים כבר יש רוב, עם רשימות עודפות.')
          : L('Your choices already win the confidence vote, with lists to spare.', 'הבחירות שלכם כבר זוכות בהצבעה על האמון, עם רשימות עודפות.')
        : L('No winning coalition fits these choices. Set some lists to Any.', 'אין קואליציה מנצחת שמתאימה לבחירות אלה. העבירו רשימות ל״כל אפשרות״.')}</p>}
      {truncated && <p className="small">{L('There are more than 100,000: include or rule out lists to narrow the search.', 'יש יותר מ-100,000: הכלילו או פסלו רשימות כדי לצמצם את החיפוש.')}</p>}
      {/* the chosen coalition opens in place, on the full row beneath it; dense packing keeps its row-mates beside it */}
      <ul className="coal-list">
        {shown.flatMap((c) => {
          const on = sameSet(c.ids, selected);
          const row = <li key={c.ids.join()}>
            <button type="button" aria-pressed={on} aria-expanded={on} onClick={() => setInspected(on ? null : { election: s.electionId, ids: c.ids })}>
              <span className="coal-n"><bdi dir="ltr">{c.n}{support > 0 && <small>+{support}</small>}</bdi></span>
              <SeatBar ids={c.ids} />
              <span className="coal-names">{c.ids.map(nm).join(' · ')}</span>
            </button>
          </li>;
          return on ? [row, <li key="detail" className="coal-detail" aria-label={L('Selected coalition', 'הקואליציה שנבחרה')}>
            <div className="row"><Vote ids={c.ids} /><span className="spacer" /><button type="button" className="btn small ghost" onClick={() => setInspected(null)}>{L('Close', 'סגירה')}</button></div>
            <Partners ids={c.ids} />
          </li>] : [row];
        })}
      </ul>
      {minimal.length > shown.length && <p className="small muted">{L(`Showing the ${shown.length} smallest of ${minimal.length.toLocaleString('en-US')}. Include or rule out lists to see others.`, `מוצגות ${shown.length} הקטנות מתוך ${minimal.length.toLocaleString('en-US')}. הכלילו או פסלו רשימות כדי לראות אחרות.`)}</p>}
    </div>
  );
}
