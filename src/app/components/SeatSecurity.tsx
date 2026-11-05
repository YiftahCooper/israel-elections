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
import { toVoteSource, type SourceChoice } from '../voteEdit.ts';
import { Info, Seg } from './ui.tsx';
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
  const key = useMemo(() => kind + JSON.stringify(input, (_, v) => (typeof v === 'bigint' ? v.toString() : v)), [input, kind]);
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
    const todo = items.current.flatMap((item) => partsOf(item).filter((part) => !m.has(figureKey(item.id, part))).map((part) => ({ kind: 'security' as const, input, src: toVoteSource({ kind } as SourceChoice), part, item })));
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

  // A stable bar scale: a quarter more than one seat's worth of votes, or the largest figure if larger;
  // square root, so knife-edge margins stay visible.
  const perSeat = Number(r.qualifyingVotes) / Math.max(1, r.rules.seats);
  const values = above.flatMap((x) => (['gain', 'lose'] as const).map((p) => fig(x.l.id, p)?.value ?? 0));
  const max = Math.max(1, 1.25 * perSeat, ...values);
  const scale = (v: number) => Math.sqrt(v / max) * 100;
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
          {L('Bars use a square-root scale, so small margins stay visible. ≤ marks a figure found by sampling: the smallest may be lower. > means none was found within the search limit; ? that sampling found none.', 'הפסים בסקאלת שורש, כדי שגם פערים קטנים ייראו. ≤ מסמן מספר שנמצא בדגימה: הקטן ביותר עשוי להיות נמוך יותר. > פירושו שלא נמצא בגבול החיפוש; ? שהדגימה לא מצאה.')}
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
          <div className="sec-row head" role="row"><span role="columnheader" className="sec-name">{L('List', 'רשימה')}</span><span role="columnheader" className="sec-l">{L('Votes to lose a seat', 'קולות לאובדן מנדט')}</span><span role="columnheader" className="sec-seats">{L('Seats', 'מנדטים')}</span><span role="columnheader" className="sec-r">{L('Votes to gain a seat', 'קולות למנדט נוסף')}</span></div>
          {above.map(({ l, item }) => {
            const lose = item.seats > 0 ? fig(l.id, 'lose') : undefined;
            const gain = fig(l.id, 'gain');
            return (
              <div key={l.id} className="sec-row" role="row">
                <span role="cell" style={{ minWidth: 0 }}>{name(l)}</span>
                <span role="cell" className="sec-l">{item.seats > 0 && <><span className="tabnum small">{text(lose)}</span>{lose?.value != null && <span className="sec-bar" style={{ width: `${scale(lose.value)}%`, background: `color-mix(in srgb, ${l.color} 30%, transparent)`, boxShadow: `inset 0 0 0 1px ${l.color}` }} />}</>}</span>
                <span role="cell" className="sec-seats tabnum">{item.seats}</span>
                <span role="cell" className="sec-r">{gain?.value != null && <span className="sec-bar" style={{ width: `${scale(gain.value)}%`, background: l.color }} />}<span className="tabnum small">{text(gain)}</span></span>
              </div>
            );
          })}
        </div>
      )}
      {below.length > 0 && (
        <section className="sec-below" aria-label={L('Below the threshold', 'מתחת לאחוז החסימה')}>
          <h3 className="small">{L('Below the threshold', 'מתחת לאחוז החסימה')} <span className="muted tabnum" style={{ fontWeight: 400 }}>· {fmtInt(thr)} {L('votes', 'קולות')}</span></h3>
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
          {near.length < below.length && (
            <button type="button" className="btn small" aria-expanded={allBelow} onClick={() => setAllBelow(!allBelow)}>
              {allBelow ? L('Fewer', 'פחות') : L(`${below.length - near.length} smaller lists`, `עוד ${below.length - near.length} רשימות קטנות`)}
            </button>
          )}
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
    return { l: { id: p.id, color: p.color, bloc: p.bloc }, n: p.n, label };
  });
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const picked = s.coalition?.in ?? [];
  const excluded = s.coalition?.out ?? [];
  const pickedSeats = seated.filter((x) => picked.includes(x.l.id)).reduce((t, x) => t + x.n, 0);
  // pruned search (src/app/coalitions.ts): same coalitions and order as the former 2^N enumeration,
  // without its 18-list limit; it stops at 100,000 coalitions and says so
  const { coalitions: minimal, truncated } = useMemo(
    () => minimalWinning(seated.filter((x) => !excluded.includes(x.l.id)).map((x) => ({ id: x.l.id, n: x.n })), majority, picked),
    [seated, majority, picked, excluded]);
  const nm = (id: string) => seated.find(x => x.l.id === id)!.label;
  const choose = (id: string, state: string) => {
    dispatch({ type: 'setCoalition', coalition: { in: state === 'in' ? [...picked.filter(x => x !== id), id] : picked.filter(x => x !== id), out: state === 'out' ? [...excluded.filter(x => x !== id), id] : excluded.filter(x => x !== id) } });
  };
  const total = s.rules.seats;
  const sorted = [...minimal].sort((a, b) => a.n - b.n || a.ids.length - b.ids.length);
  const shown = sorted.slice(0, 24);
  const blocName = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const startFrom = s.blocs.map((b) => ({ b, ids: seated.filter((x) => x.l.bloc === b.id).map((x) => x.l.id) })).filter((x) => x.ids.length);
  const colorOf = (id: string) => seated.find(x => x.l.id === id)!.l.color;
  const seatsOf = (id: string) => seated.find((x) => x.l.id === id)?.n ?? 0;
  /** a 120-seat bar: the given lists in their colours from the start, the rest pale, and the majority line */
  const SeatBar = ({ ids, big }: { ids: string[]; big?: boolean }) => (
    <div className={`coal-bar ${big ? 'big' : ''}`} aria-hidden>
      {ids.map((id) => <i key={id} style={{ flexBasis: `${(seatsOf(id) / total) * 100}%`, background: colorOf(id) }} title={`${nm(id)} ${seatsOf(id)}`} />)}
      <span className="maj" style={{ insetInlineStart: `${(majority / total) * 100}%` }}>{big && <em>{majority}</em>}</span>
    </div>
  );
  return (
    <div className="coal"><div className="row"><StartFrom s={s} part="coalitions" /><EditMarker s={s} path={['coalition']} /></div>
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Choose In, Out or Any', 'בחרו בפנים, בחוץ או כל אפשרות')} <Info title={L('Coalition assumptions', 'הנחות הקואליציה')}>{L('Build a coalition: choose In, Out or Any for each list. Arithmetic only — it says nothing about political feasibility.', 'בנו קואליציה: בחרו בפנים, בחוץ או כל אפשרות לכל רשימה. חשבון בלבד — לא הערכה פוליטית.')}</Info> <Info term="minimal-winning-coalition" /> <Info term="majority-61" /></p>
      {startFrom.length > 0 && (
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="small ink2">{L('Fill with a bloc', 'מילוי לפי גוש')}</span>
          {startFrom.map(({ b, ids }) => { const on = excluded.length === 0 && picked.length === ids.length && ids.every((id) => picked.includes(id)); return <button key={b.id} className={`btn small ${on ? 'primary' : ''}`} aria-pressed={on} onClick={() => { dispatch({ type: 'setCoalition', coalition: { in: ids, out: [] } }); }}><span className="swatch" style={{ background: b.color }} />{blocName(b)}</button>; })}
          {(picked.length > 0 || excluded.length > 0) && <button className="btn small ghost" onClick={() => { dispatch({ type: 'setCoalition', coalition: { in: [], out: [] } }); }}>{L('Clear', 'ניקוי')}</button>}
        </div>
      )}
      <div className="row coal-chips">
        {seated.map(({ l, n, label }) => {
          const st = picked.includes(l.id) ? 'in' : excluded.includes(l.id) ? 'out' : '';
          return <div key={l.id} className="coal-choice">
            <span><span className="swatch" style={{ background: l.color }} />{label} <b>{n}</b></span>
            <Seg label={label} value={st || 'any'} onChange={v => choose(l.id, v)} options={[{ v: 'in', label: L('In', 'בפנים') }, { v: 'out', label: L('Out', 'בחוץ') }, { v: 'any', label: L('Any', 'כל אפשרות') }]} />
          </div>;
        })}
      </div>
      <div className="coal-now">
        <Majority n={pickedSeats} total={total} />
        <SeatBar ids={seated.filter((x) => picked.includes(x.l.id)).map((x) => x.l.id)} big />
      </div>
      <h3 style={{ marginTop: 16 }}>{L(`Smallest winning coalitions${picked.length ? ' with your selection' : ''}`, `הקואליציות המנצחות הקטנות ביותר${picked.length ? ' עם הבחירה שלכם' : ''}`)}
        <span className="muted" style={{ fontWeight: 400 }}> · {minimal.length.toLocaleString('en-US')}{truncated ? '+' : ''} {L('in all', 'בסך הכול')}</span></h3>
      <p className="small muted" style={{ marginTop: 0 }}>{L('Choose a coalition to try', 'בחרו קואליציה לניסיון')} <Info title={L('Winning coalitions', 'קואליציות מנצחות')}>{L('Each needs every member: remove one and the majority is lost. Click one to load it above.', 'כל אחת זקוקה לכל חברותיה: הוצאת אחת מבטלת את הרוב. לחצו על אחת כדי לטעון אותה למעלה.')}</Info></p>
      {truncated && <p className="small">{L('There are more than 100,000: include or rule out lists to narrow the search.', 'יש יותר מ-100,000: הכלילו או פסלו רשימות כדי לצמצם את החיפוש.')}</p>}
      <ul className="coal-list">
        {shown.map((c) => (
          <li key={c.ids.join()}>
            <button type="button" aria-pressed={excluded.length === 0 && picked.length === c.ids.length && c.ids.every((id) => picked.includes(id))} onClick={() => { dispatch({ type: 'setCoalition', coalition: { in: c.ids, out: [] } }); }}>
              <span className="coal-n">{c.n}</span>
              <SeatBar ids={c.ids} />
              <span className="coal-names">{c.ids.map(nm).join(' · ')}</span>
            </button>
          </li>
        ))}
      </ul>
      {minimal.length > shown.length && <p className="small muted">{L(`Showing the ${shown.length} smallest of ${minimal.length.toLocaleString('en-US')}. Include or rule out lists to see others.`, `מוצגות ${shown.length} הקטנות מתוך ${minimal.length.toLocaleString('en-US')}. הכלילו או פסלו רשימות כדי לראות אחרות.`)}</p>}
    </div>
  );
}
