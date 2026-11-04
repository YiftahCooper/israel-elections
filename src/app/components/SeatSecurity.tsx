import { Majority } from './Majority.tsx';
import { useEffect, useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { coalitionPieces, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { runTasks } from '../analysisPool.ts';
import { partsOf, securityRow, type SecurityFigure, type SecurityItem, type SecurityPart, type SecurityRow as Row } from '../analysisTasks.ts';
import { setState } from '../store.ts';
import { toVoteSource, type SourceChoice } from '../voteEdit.ts';
import { Info, Seg } from './ui.tsx';
import { minimalWinning } from '../coalitions.ts';

/** How close every list is to its next seat and to losing one — the "knife-edge" view. */
// results per scenario and vote source, so revisiting the tab is instant
const rowCache = new WeakMap<Scenario, Map<string, Row[]>>();

export function SeatSecurity({ s, r }: { s: Scenario; r: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const [kind, setKind] = useState<'proportional' | 'new'>('proportional');
  const [rows, setRows] = useState<Row[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  // Each figure is a search over the whole election (up to ~1 s each), so they are computed
  // in background workers and shown as each list finishes.
  useEffect(() => {
    const cached = rowCache.get(s)?.get(kind);
    if (cached) { setRows(cached); setProgress({ done: cached.length, total: cached.length }); return; }
    const input = toEngineInput(s);
    const src = toVoteSource({ kind } as SourceChoice);
    const thr = Number(r.thresholdVotes);
    const todo = s.lists.filter((l) => !l.withdrawn && l.votes > 0 && (r.lists.find((x) => x.id === l.id)!.qualified || l.votes >= thr * 0.5));
    const items: SecurityItem[] = todo.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return { id: l.id, qualified: lr.qualified, seats: lr.qualified ? lr.seats : 0 }; });
    const parts = items.map((): Partial<Record<SecurityPart, SecurityFigure>> => ({}));
    // finished rows stay in list order, so equal rows sort the same however the workers finish
    const finished: (Row | undefined)[] = items.map(() => undefined);
    let count = 0;
    setRows([]); setProgress({ done: 0, total: items.length });
    const sortRows = (xs: Row[]) => [...xs].sort((a, b) => (b.seats - a.seats) || ((a.qualify ?? 0) - (b.qualify ?? 0)));
    const store = () => { const m = rowCache.get(s) ?? new Map(); m.set(kind, sortRows(finished as Row[])); rowCache.set(s, m); };
    if (!items.length) { store(); return; }
    const tasks = items.flatMap((item, index) => partsOf(item).map((part) => ({ index, task: { kind: 'security' as const, input, src, part, item } })));
    return runTasks(tasks.map((x) => x.task), (k, value) => {
      const { index, task } = tasks[k];
      const p = parts[index];
      p[task.part] = value;
      if (!partsOf(task.item).every((x) => x in p)) return;
      finished[index] = securityRow(task.item, p);
      count++;
      setRows(sortRows(finished.filter((x): x is Row => !!x))); setProgress({ done: count, total: items.length });
      if (count === items.length) store();
    });
  }, [s, r, kind]);

  const max = Math.max(1, ...rows.flatMap((x) => [x.gain ?? 0, x.lose ?? 0, x.qualify ?? 0]));
  const scale = (v: number) => Math.sqrt(v / max) * 100; // square-root scale keeps small margins visible
  const tightest = rows.filter((x) => x.seats > 0 && x.qualification.gain?.exact && x.qualification.lose?.exact).flatMap((x) => [{ id: x.id, v: x.gain ?? Infinity, t: 'gain' }, { id: x.id, v: x.lose ?? Infinity, t: 'lose' }]).sort((a, b) => a.v - b.v).slice(0, 3);
  const nm = (id: string) => listLabel(s.lists.find((l) => l.id === id)!, lang);

  const figure = (x: Row, part: SecurityPart) => {
    const q = x.qualification[part];
    if (!q) return '—';
    if (q.value === null) return L(`Not found within ${fmtInt(q.limit)} (${q.exact ? 'bounded search' : 'sampled, inconclusive'})`, `לא נמצא עד ${fmtInt(q.limit)} (${q.exact ? 'חיפוש מוגבל' : 'דגימה, ללא הכרעה'})`);
    if (q.exact) return fmtInt(q.value);
    return part === 'lose'
      ? L(`Loss found at ${fmtInt(q.value + 1)} (searched, not proven; smaller losses may also lose a seat)`, `אובדן נמצא ב־${fmtInt(q.value + 1)} (חיפוש, לא הוכח; גם אובדן קטן יותר עשוי לאבד מנדט)`)
      : L(`At most ${fmtInt(q.value)} (searched, not proven)`, `לכל היותר ${fmtInt(q.value)} (חיפוש, לא הוכח)`);
  };
  return (
    <div>
      <div className="row" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
        <p className="small ink2" style={{ margin: 0, maxWidth: 720 }}>{L('For each list: how many votes it could lose before losing a seat (left column), and how many more it needs for one more seat (right column). Short bars are knife-edge seats.', 'לכל רשימה: כמה קולות היא יכולה לאבד בלי לאבד מנדט (העמודה הימנית), וכמה קולות נוספים היא צריכה למנדט נוסף (העמודה השמאלית). פסים קצרים = מנדטים על חוט השערה.')}
          <Info title={L('How this is computed', 'איך זה מחושב')}>{L('Exact minima are proven by the search. Large non-monotone searches may sample: a found change is an upper bound, not a proven minimum; no result within the search bound is not proof of impossibility. For losses, a sampled figure does not guarantee that all smaller losses keep the seat. Bars use a square-root scale.', 'מינימום מדויק הוכח בחיפוש. חיפושים גדולים שאינם מונוטוניים עשויים להשתמש בדגימה: שינוי שנמצא הוא חסם עליון ולא מינימום מוכח. תוצאה שלא נמצאה בגבול החיפוש אינה הוכחה לחוסר אפשרות. באובדן קולות, תוצאה מדגימה אינה מבטיחה שכל אובדן קטן יותר שומר על המנדט. הפסים בסקאלת שורש.')}</Info>
        </p>
        <Seg label={L('Votes move', 'הקולות עוברים')} value={kind} onChange={setKind} options={[{ v: 'proportional', label: L('between lists', 'בין רשימות') }, { v: 'new', label: L('new / staying home', 'חדשים / נמנעים') }]} />
      </div>
      {progress.done < progress.total && <p className="small muted" aria-live="polite">{L(`Searching… ${progress.done} of ${progress.total} lists`, `מחפש… ${progress.done} מתוך ${progress.total} רשימות`)}</p>}
      {tightest.length > 0 && progress.done === progress.total && (
        <div className="callout small" style={{ marginBottom: 10 }}>
          {L('Closest calls: ', 'הקרובים ביותר: ')}{tightest.map((x) => x.t === 'gain' ? L(`${nm(x.id)} is ${fmtInt(x.v)} votes from another seat`, `${nm(x.id)} במרחק ${fmtInt(x.v)} קולות ממנדט נוסף`) : L(`${nm(x.id)} would lose a seat after losing ${fmtInt(x.v + 1)} votes`, `${nm(x.id)} תאבד מנדט באובדן ${fmtInt(x.v + 1)} קולות`)).join(' · ')}
        </div>
      )}
      <div className="security" role="table" aria-label={L('Seat security', 'ביטחון המנדטים')}>
        <div className="sec-row head" role="row"><span role="columnheader">{L('List', 'רשימה')}</span><span role="columnheader" className="sec-l">{L('can lose without losing a seat', 'אפשר לאבד בלי לאבד מנדט')}</span><span role="columnheader">{L('Seats', 'מנדטים')}</span><span role="columnheader">{L('needs for one more seat', 'חסר למנדט נוסף')}</span></div>
        {rows.map((x) => {
          const l = s.lists.find((y) => y.id === x.id)!;
          return (
            <div key={x.id} className="sec-row" role="row">
              <span role="cell" className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: l.color }} /><button className="table-action" onClick={() => setState({ selectedListId: x.id })}>{listLabel(l, lang)}</button></span>
              <span role="cell" className="sec-l">
                {x.lose === null && x.qualification.lose && <span className="small">{figure(x, 'lose')}</span>}{x.lose !== null && <><span className="tabnum small">{figure(x, 'lose')}</span><span className="sec-bar" style={{ width: `${scale(x.lose)}%`, background: l.color, opacity: 0.55 }} /></>}
              </span>
              <span role="cell" className="tabnum" style={{ textAlign: 'center', fontWeight: 700 }}>{x.seats || '—'}</span>
              <span role="cell" className="sec-r">
                {x.gain === null && x.qualification.gain && <span className="small">{figure(x, 'gain')}</span>}{x.gain !== null && <><span className="sec-bar" style={{ width: `${scale(x.gain)}%`, background: l.color }} /><span className="tabnum small">{figure(x, 'gain')}</span></>}
                {x.qualify === null && x.qualification.qualify && <span className="small">{figure(x, 'qualify')}</span>}{x.qualify !== null && <><span className="sec-bar" style={{ width: `${scale(x.qualify)}%`, background: 'var(--axis)' }} /><span className="small">{L(`${figure(x, 'qualify')} to pass the threshold`, `${figure(x, 'qualify')} למעבר החסימה`)}</span></>}
              </span>
            </div>
          );
        })}
      </div>
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
  const [picked, setPicked] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  // a list that has lost its seats (after an edit) can no longer be part of a coalition
  useEffect(() => {
    const ids = new Set(seated.map((x) => x.l.id));
    if (picked.some((p) => !ids.has(p))) setPicked(picked.filter((p) => ids.has(p)));
    if (excluded.some((p) => !ids.has(p))) setExcluded(excluded.filter((p) => ids.has(p)));
  }, [seated, picked, excluded]);
  const pickedSeats = seated.filter((x) => picked.includes(x.l.id)).reduce((t, x) => t + x.n, 0);
  // pruned search (src/app/coalitions.ts): same coalitions and order as the former 2^N enumeration,
  // without its 18-list limit; it stops at 100,000 coalitions and says so
  const { coalitions: minimal, truncated } = useMemo(
    () => minimalWinning(seated.filter((x) => !excluded.includes(x.l.id)).map((x) => ({ id: x.l.id, n: x.n })), majority, picked),
    [seated, majority, picked, excluded]);
  const nm = (id: string) => seated.find(x => x.l.id === id)!.label;
  const choose = (id: string, state: string) => {
    setPicked(xs => state === 'in' ? [...xs.filter(x => x !== id), id] : xs.filter(x => x !== id));
    setExcluded(xs => state === 'out' ? [...xs.filter(x => x !== id), id] : xs.filter(x => x !== id));
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
    <div className="coal">
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Build a coalition: choose In, Out or Any for each list. Arithmetic only — it says nothing about political feasibility.', 'בנו קואליציה: בחרו בפנים, בחוץ או כל אפשרות לכל רשימה. חשבון בלבד — לא הערכה פוליטית.')} <Info term="minimal-winning-coalition" /> <Info term="majority-61" /></p>
      {startFrom.length > 0 && (
        <div className="row" style={{ marginBottom: 8 }}>
          <span className="small ink2">{L('Start from', 'התחלה מ')}</span>
          {startFrom.map(({ b, ids }) => <button key={b.id} className="btn small" onClick={() => { setPicked(ids); setExcluded([]); }}><span className="swatch" style={{ background: b.color }} />{blocName(b)}</button>)}
          {(picked.length > 0 || excluded.length > 0) && <button className="btn small ghost" onClick={() => { setPicked([]); setExcluded([]); }}>{L('Clear', 'ניקוי')}</button>}
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
      <p className="small muted" style={{ marginTop: 0 }}>{L('Each needs every member: remove one and the majority is lost. Click one to load it above.', 'כל אחת זקוקה לכל חברותיה: הוצאת אחת מבטלת את הרוב. לחצו על אחת כדי לטעון אותה למעלה.')}</p>
      {truncated && <p className="small">{L('There are more than 100,000: include or rule out lists to narrow the search.', 'יש יותר מ-100,000: הכלילו או פסלו רשימות כדי לצמצם את החיפוש.')}</p>}
      <ul className="coal-list">
        {shown.map((c) => (
          <li key={c.ids.join()}>
            <button type="button" onClick={() => { setPicked(c.ids); setExcluded([]); }}>
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
