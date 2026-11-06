import { SeatDelta } from './SeatDelta.tsx';
import { dispatch } from '../store.ts';
import { StartFrom } from './StartFrom.tsx';
import { EditMarker } from './EditMarker.tsx';
import { Majority } from './Majority.tsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { coalitionPieces, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtSigned } from '../format.ts';
import { runTasks } from '../analysisPool.ts';
import { partsOf, type SecurityFigure, type SecurityItem, type SecurityPart } from '../analysisTasks.ts';
import { setState } from '../store.ts';
import { stayingHome, toVoteSource, type SourceChoice } from '../voteEdit.ts';
import { DisclosureToggle, Info, Seg, Slip } from './ui.tsx';
import { minimalWinning } from '../coalitions.ts';

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
        <span className="small ink2">{L('Votes from', 'הקולות מ')}</span>
        <Seg label={L('Votes from', 'הקולות מ')} value={kind} onChange={setKind} options={[{ v: 'proportional', label: L('Other lists', 'שאר הרשימות') }, { v: 'new', label: L('New voters', 'מצביעים חדשים') }]} />
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

/** Coalition arithmetic: pick lists, see the total against the majority, list minimal winning coalitions. */
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
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const picked = s.coalition?.in ?? [];
  const excluded = s.coalition?.out ?? [];
  // pruned search (src/app/coalitions.ts): same coalitions and order as the former 2^N enumeration,
  // without its 18-list limit; it stops at 100,000 coalitions and says so
  const { coalitions: minimal, truncated } = useMemo(
    () => minimalWinning(seated.filter((x) => !excluded.includes(x.l.id)).map((x) => ({ id: x.l.id, n: x.n })), majority, picked),
    [seated, majority, picked, excluded]);
  const nm = (id: string) => seated.find(x => x.l.id === id)!.label;
  const choose = (id: string, state: string) => {
    const current = picked.includes(id) ? 'in' : excluded.includes(id) ? 'out' : 'any';
    if (state === current) return;
    setInspected(null);
    dispatch({ type: 'setCoalition', coalition: { in: state === 'in' ? [...picked.filter(x => x !== id), id] : picked.filter(x => x !== id), out: state === 'out' ? [...excluded.filter(x => x !== id), id] : excluded.filter(x => x !== id) } });
  };
  const total = s.rules.seats;
  const pickedIds = picked.filter(id => seated.some(x => x.l.id === id));
  const seatsOf = (id: string) => seated.find((x) => x.l.id === id)?.n ?? 0;
  const sumOf = (ids: string[]) => ids.reduce((n, id) => n + seatsOf(id), 0);
  const pickedSeats = sumOf(pickedIds);
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
  const blocName = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const startFrom = s.blocs.map((b) => ({ b, ids: seated.filter((x) => x.l.bloc === b.id).map((x) => x.l.id) })).filter((x) => x.ids.length);
  const colorOf = (id: string) => seated.find(x => x.l.id === id)!.l.color;
  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));
  /** a 120-seat bar: the given lists in their colours from the start, the rest pale, and the majority line */
  const SeatBar = ({ ids, big }: { ids: string[]; big?: boolean }) => (
    <div className={`coal-bar ${big ? 'big' : ''}`} aria-hidden>
      {ids.map((id) => <i key={id} style={{ flexBasis: `${(seatsOf(id) / total) * 100}%`, background: colorOf(id) }} title={`${nm(id)} ${seatsOf(id)}`} />)}
      <span className="maj" style={{ insetInlineStart: `${(majority / total) * 100}%` }}>{big && <em>{majority}</em>}</span>
    </div>
  );
  /** Partners with seats, the bloc split and the first-government comparison. "Pivotal" is named only when it
   *  tells partners apart; in a smallest winning coalition every partner is pivotal, which the list says once. */
  const Partners = ({ ids, sayAllNeeded }: { ids: string[]; sayAllNeeded?: boolean }) => {
    const seats = sumOf(ids);
    const pivotal = seats >= majority ? ids.filter(id => seats - seatsOf(id) < majority) : [];
    const tag = pivotal.length > 0 && pivotal.length < ids.length;
    return <>
      <ul className="coal-partners">{ids.map(id => <li key={id}><Slip letters={seated.find(x => x.l.id === id)?.letters ?? ''} synthetic={seated.find(x => x.l.id === id)?.synthetic} name={nm(id)} logo={seated.find(x => x.l.id === id)?.logo} color={colorOf(id)} size="sm" />{nm(id)} <b>{seatsOf(id)}</b> {tag && pivotal.includes(id) && <span className="small">{L('Pivotal', 'חיונית לרוב')}</span>}</li>)}</ul>
      <div className="row small">{[...s.blocs, { id: null, nameHe: 'ללא גוש', nameEn: 'No bloc' }].map(b => {
        const n = seated.filter(x => ids.includes(x.l.id) && x.l.bloc === b.id).reduce((n, x) => n + x.n, 0);
        return n > 0 && <span key={b.id ?? 'none'}>{blocName(b)} <b>{n}</b></span>;
      })}{sayAllNeeded && pivotal.length === ids.length && pivotal.length > 1 && <span className="muted">{L('Each is needed for the majority', 'כל אחת נחוצה לרוב')}</span>}
        <Info title={L('Coalition breakdown', 'הרכב הקואליציה')}>{L('Uses the active grouping. Pivotal means this partner’s departure would remove the majority. Arithmetic does not establish political feasibility.', 'לפי החלוקה הפעילה. שותפה חיונית היא כזו שבלעדיה אין רוב. חשבון אינו מעיד על היתכנות פוליטית.')}</Info></div>
      {governmentBloc && <p className="small muted" style={{ margin: 0 }}>{!historicalIds ? L('First-government comparison unavailable', 'אין נתונים להשוואה לממשלה הראשונה') : historyMatches(ids) ? L('Matches the recorded first-government partners', 'תואמת לשותפות הממשלה הראשונה המתועדת') : L('Different from the recorded first-government partners', 'שונה משותפות הממשלה הראשונה המתועדת')}{' '}
        <Info title={L('Historical comparison', 'השוואה היסטורית')}>{L('Compares partners with the recorded first government only, not every government during this Knesset. Scenario seats can differ from the historical result.', 'השוואת שותפות לממשלה הראשונה המתועדת בלבד, ולא לכל ממשלה במהלך הכנסת. המנדטים בתרחיש עשויים להיות שונים מהתוצאה ההיסטורית.')} {government && `${blocName(government)} · ${government.date ?? ''}`}</Info></p>}
    </>;
  };
  return (
    <div className="coal">
      {/* one line that is always there: its reset/copy buttons appear beside the text, never above the cards */}
      <div className="row coal-head"><span className="small ink2">{L('Require or rule out lists', 'חייבו או פסלו רשימות')} <Info title={L('Coalition assumptions', 'הנחות הקואליציה')}>{L('In: every coalition below includes the list. Out: none does. Any: either. Arithmetic only — it says nothing about political feasibility.', 'בפנים: כל קואליציה למטה כוללת את הרשימה. בחוץ: אף אחת אינה כוללת. כל אפשרות: שתיהן. חשבון בלבד — לא הערכה פוליטית.')}</Info></span>
        <span className="spacer" /><StartFrom s={s} part="coalitions" /><EditMarker s={s} path={['coalition']} /></div>
      {startFrom.length > 0 && (
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="small ink2">{L('Fill with a bloc', 'מילוי לפי גוש')}</span>
          {startFrom.map(({ b, ids }) => { const on = excluded.length === 0 && picked.length === ids.length && ids.every((id) => picked.includes(id)); return <button key={b.id} className={`btn small ${on ? 'primary' : ''}`} aria-pressed={on} onClick={() => { if (on) return; setInspected(null); dispatch({ type: 'setCoalition', coalition: { in: ids, out: [] } }); }}><span className="swatch" style={{ background: b.color }} />{blocName(b)}</button>; })}
        </div>
      )}
      <div className="coal-chips">
        {seated.map(({ l, n, label, logo, letters, synthetic }) => {
          const st = picked.includes(l.id) ? 'in' : excluded.includes(l.id) ? 'out' : '';
          return <div key={l.id} className="coal-choice">
            <span className="coal-who"><Slip letters={letters} name={label} logo={logo} synthetic={synthetic} color={l.color} size="sm" /><span>{label} <b>{n}</b></span></span>
            <Seg label={label} value={st || 'any'} onChange={v => choose(l.id, v)} options={[{ v: 'in', label: L('In', 'בפנים') }, { v: 'out', label: L('Out', 'בחוץ') }, { v: 'any', label: L('Any', 'כל אפשרות') }]} />
          </div>;
        })}
      </div>
      {pickedIds.length > 0 && <section className="coal-now" aria-label={L('Coalition details', 'פרטי הקואליציה')}>
        <h3 style={{ margin: 0 }}>{L('Required partners', 'השותפות הנדרשות')}</h3>
        <Majority n={pickedSeats} total={total} />
        <SeatBar ids={pickedIds} big />
        <Partners ids={pickedIds} sayAllNeeded />
      </section>}
      <h3 style={{ marginTop: 16 }}>{L(`Smallest winning coalitions${picked.length ? ' with your In lists' : ''}`, `הקואליציות המנצחות הקטנות ביותר${picked.length ? ' עם הרשימות שבפנים' : ''}`)}
        <span className="muted" style={{ fontWeight: 400 }}> · {minimal.length.toLocaleString('en-US')}{truncated ? '+' : ''} {L('in all', 'בסך הכול')}</span></h3>
      <p className="small muted" style={{ marginTop: 0 }}>{L('Select one to see its partners', 'בחרו אחת כדי לראות את השותפות')} <Info title={L('Winning coalitions', 'קואליציות מנצחות')}>{L('Each needs every member: remove one and the majority is lost. Selecting one shows its partners beneath it; your In and Out choices stay as they are.', 'כל אחת זקוקה לכל חברותיה: הוצאת אחת מבטלת את הרוב. בחירה באחת מציגה את שותפותיה מתחתיה; בחירות בפנים ובחוץ נשארות כפי שהן.')}</Info></p>
      {!minimal.length && <p className="small muted">{pickedSeats >= majority
        ? L('Your In lists already have a majority, with lists to spare.', 'לרשימות שבפנים כבר יש רוב, עם רשימות עודפות.')
        : L('No winning coalition fits these choices. Set some lists to Any.', 'אין קואליציה מנצחת שמתאימה לבחירות אלה. העבירו רשימות ל״כל אפשרות״.')}</p>}
      {truncated && <p className="small">{L('There are more than 100,000: include or rule out lists to narrow the search.', 'יש יותר מ-100,000: הכלילו או פסלו רשימות כדי לצמצם את החיפוש.')}</p>}
      {/* the chosen coalition opens in place, on the full row beneath it; dense packing keeps its row-mates beside it */}
      <ul className="coal-list">
        {shown.flatMap((c) => {
          const on = sameSet(c.ids, selected);
          const row = <li key={c.ids.join()}>
            <button type="button" aria-pressed={on} aria-expanded={on} onClick={() => setInspected(on ? null : { election: s.electionId, ids: c.ids })}>
              <span className="coal-n">{c.n}</span>
              <SeatBar ids={c.ids} />
              <span className="coal-names">{c.ids.map(nm).join(' · ')}</span>
            </button>
          </li>;
          return on ? [row, <li key="detail" className="coal-detail" aria-label={L('Selected coalition', 'הקואליציה שנבחרה')}>
            <div className="row"><Majority n={c.n} total={total} /><span className="spacer" /><button type="button" className="btn small ghost" onClick={() => setInspected(null)}>{L('Close', 'סגירה')}</button></div>
            <Partners ids={c.ids} />
          </li>] : [row];
        })}
      </ul>
      {minimal.length > shown.length && <p className="small muted">{L(`Showing the ${shown.length} smallest of ${minimal.length.toLocaleString('en-US')}. Include or rule out lists to see others.`, `מוצגות ${shown.length} הקטנות מתוך ${minimal.length.toLocaleString('en-US')}. הכלילו או פסלו רשימות כדי לראות אחרות.`)}</p>}
    </div>
  );
}
