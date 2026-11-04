import { useEffect, useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import { toEngineInput, type Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { runTasks } from '../analysisPool.ts';
import { partsOf, securityRow, type SecurityItem, type SecurityPart, type SecurityRow as Row } from '../analysisTasks.ts';
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
  // Each figure is an exact search over the whole election (up to ~1 s each), so they are computed
  // in background workers and shown as each list finishes.
  useEffect(() => {
    const cached = rowCache.get(s)?.get(kind);
    if (cached) { setRows(cached); setProgress({ done: cached.length, total: cached.length }); return; }
    const input = toEngineInput(s);
    const src = toVoteSource({ kind } as SourceChoice);
    const thr = Number(r.thresholdVotes);
    const todo = s.lists.filter((l) => !l.withdrawn && l.votes > 0 && (r.lists.find((x) => x.id === l.id)!.qualified || l.votes >= thr * 0.5));
    const items: SecurityItem[] = todo.map((l) => { const lr = r.lists.find((x) => x.id === l.id)!; return { id: l.id, qualified: lr.qualified, seats: lr.qualified ? lr.seats : 0 }; });
    const parts = items.map((): Partial<Record<SecurityPart, number | null>> => ({}));
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
  const tightest = rows.filter((x) => x.seats > 0).flatMap((x) => [{ id: x.id, v: x.gain ?? Infinity, t: 'gain' }, { id: x.id, v: x.lose ?? Infinity, t: 'lose' }]).sort((a, b) => a.v - b.v).slice(0, 3);
  const nm = (id: string) => listLabel(s.lists.find((l) => l.id === id)!, lang);

  return (
    <div>
      <div className="row" style={{ marginBottom: 8, justifyContent: 'space-between' }}>
        <p className="small ink2" style={{ margin: 0, maxWidth: 720 }}>{L('For each list: how many votes it could lose before losing a seat (left column), and how many more it needs for one more seat (right column). Short bars are knife-edge seats.', 'לכל רשימה: כמה קולות היא יכולה לאבד בלי לאבד מנדט (העמודה הימנית), וכמה קולות נוספים היא צריכה למנדט נוסף (העמודה השמאלית). פסים קצרים = מנדטים על חוט השערה.')}
          <Info title={L('How this is computed', 'איך זה מחושב')}>{L('Each figure is the exact minimum found by recomputing the whole election vote by vote, with votes moved as selected. Bars use a square-root scale so small margins stay visible; the numbers are exact.', 'כל מספר הוא המינימום המדויק שנמצא בחישוב מחדש של כל הבחירות, עם הקולות מועברים לפי הבחירה. הפסים בסקאלת שורש כדי שמרווחים קטנים ייראו; המספרים מדויקים.')}</Info>
        </p>
        <Seg label={L('Votes move', 'הקולות עוברים')} value={kind} onChange={setKind} options={[{ v: 'proportional', label: L('between lists', 'בין רשימות') }, { v: 'new', label: L('new / staying home', 'חדשים / נמנעים') }]} />
      </div>
      {progress.done < progress.total && <p className="small muted" aria-live="polite">{L(`Calculating exactly… ${progress.done} of ${progress.total} lists`, `מחשב במדויק… ${progress.done} מתוך ${progress.total} רשימות`)}</p>}
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
            <div key={x.id} className="sec-row" role="row" onClick={() => setState({ selectedListId: x.id })}>
              <span role="cell" className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</span>
              <span role="cell" className="sec-l">
                {x.lose !== null && <><span className="tabnum small">{fmtInt(x.lose)}</span><span className="sec-bar" style={{ width: `${scale(x.lose)}%`, background: l.color, opacity: 0.55 }} /></>}
              </span>
              <span role="cell" className="tabnum" style={{ textAlign: 'center', fontWeight: 700 }}>{x.seats || '—'}</span>
              <span role="cell" className="sec-r">
                {x.gain !== null && <><span className="sec-bar" style={{ width: `${scale(x.gain)}%`, background: l.color }} /><span className="tabnum small">{fmtInt(x.gain)}</span></>}
                {x.qualify !== null && <><span className="sec-bar" style={{ width: `${scale(x.qualify)}%`, background: 'var(--axis)' }} /><span className="small">{L(`${fmtInt(x.qualify)} to pass the threshold`, `${fmtInt(x.qualify)} למעבר החסימה`)}</span></>}
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
  const seated = s.lists.map((l) => ({ l, n: r.lists.find((x) => x.id === l.id)?.seats ?? 0 })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
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
  const nm = (id: string) => listLabel(s.lists.find((l) => l.id === id)!, lang);
  const toggle = (id: string) => {
    if (picked.includes(id)) { setPicked(picked.filter((x) => x !== id)); setExcluded([...excluded, id]); }
    else if (excluded.includes(id)) setExcluded(excluded.filter((x) => x !== id));
    else setPicked([...picked, id]);
  };
  return (
    <div>
      <p className="small ink2" style={{ marginTop: 0 }}>{L('Click a list once to include it, again to rule it out, a third time to clear. Coalitions are arithmetic only — they say nothing about political feasibility.', 'לחיצה אחת מכלילה רשימה, שנייה פוסלת אותה, שלישית מנקה. קואליציות כאן הן חשבון בלבד — לא הערכה פוליטית.')} <Info term="minimal-winning-coalition" /> <Info term="majority-61" /></p>
      <div className="row" style={{ marginBottom: 10 }}>
        {seated.map(({ l, n }) => {
          const st = picked.includes(l.id) ? 'in' : excluded.includes(l.id) ? 'out' : '';
          return <button key={l.id} className={`chip coal ${st}`} aria-pressed={st === 'in'} onClick={() => toggle(l.id)} style={{ ['--c' as string]: l.color }}>
            <span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)} <b className="tabnum">{n}</b>{st === 'out' ? ' ✕' : ''}
          </button>;
        })}
      </div>
      <div className="majority-bar" aria-label={L(`Selected: ${pickedSeats} seats`, `נבחרו: ${pickedSeats} מנדטים`)}>
        {seated.filter((x) => picked.includes(x.l.id)).map(({ l, n }) => <div key={l.id} style={{ flexBasis: `${(n / s.rules.seats) * 100}%`, background: l.color }} title={`${listLabel(l, lang)} ${n}`} />)}
        <span className="majority-line" style={{ insetInlineStart: `calc(${(majority / s.rules.seats) * 100}% - 1px)` }} aria-hidden />
      </div>
      <p><b className="tabnum" style={{ fontSize: 20 }}>{pickedSeats}</b> / {s.rules.seats} {pickedSeats >= majority ? <span className="chip ok">{L('majority', 'רוב')}</span> : <span className="muted">{L(`${majority - pickedSeats} short of ${majority}`, `חסרים ${majority - pickedSeats} ל-${majority}`)}</span>}</p>
      <h3>{L(`Minimal winning coalitions${picked.length ? ' containing your selection' : ''} (${minimal.length.toLocaleString('en-US')}${truncated ? '+' : ''})`, `קואליציות מנצחות מינימליות${picked.length ? ' הכוללות את הבחירה' : ''} (${minimal.length.toLocaleString('en-US')}${truncated ? '+' : ''})`)}</h3>
      <p className="small muted" style={{ marginTop: 0 }}>{L('Minimal: removing any one member would lose the majority.', 'מינימלית: הוצאת כל אחת מהחברות תבטל את הרוב.')}</p>
      {truncated && <p className="small">{L('There are more than 100,000: include or rule out lists to narrow the search.', 'יש יותר מ-100,000: הכלילו או פסלו רשימות כדי לצמצם את החיפוש.')}</p>}
      <ul className="small" style={{ columns: 2, paddingInlineStart: 18 }}>
        {minimal.slice(0, 40).map((c) => <li key={c.ids.join()} style={{ breakInside: 'avoid', marginBottom: 3 }}><b className="tabnum">{c.n}</b> · {c.ids.map(nm).join(' + ')}</li>)}
      </ul>
      {minimal.length > 40 && <p className="small muted">{L(`…and ${minimal.length - 40} more. Include or rule out lists to narrow the list.`, `…ועוד ${minimal.length - 40}. הכלילו או פסלו רשימות כדי לצמצם.`)}</p>}
    </div>
  );
}
