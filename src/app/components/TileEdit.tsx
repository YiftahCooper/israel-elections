// A number you can change is changed on its own tile (owner, 19 Nov 2026, editable-tiles: the popup, for every such
// number wherever its tile appears). A tap on the tile, or its pencil, opens a small window under the tile with the
// field, its step sizes and Reset; nothing on the page moves, and Done, Esc or a tap outside closes it. The window is
// placed beside the tile, never over it, in the visible part of the screen (a phone's keyboard shrinks that part).
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { NumericStepper } from './NumericStepper.tsx';
import { TurnoutOtherElection, TURNOUT_FIELD_DIGITS } from './TurnoutSteps.tsx';
import { StartFrom } from './StartFrom.tsx';
import { useFloating } from '../floating.tsx';
import { useCloseOnFocusAway } from '../focusReturn.ts';
import { votesCast, electionRuleSetId, historicalRules, type Scenario } from '../../model/scenario.ts';
import { dispatch, getState, undo, useStore } from '../store.ts';
import { useL } from '../i18n.ts';
import { fmtInt, trimDecimal } from '../format.ts';
import { Info } from './ui.tsx';
import './tile-edit.css';

export type TileField = 'turnout' | 'registered' | 'invalid' | 'threshold';

/** Each statutory threshold with the election years it applied in, from the election index (none typed by hand). */
export function thresholdEras(elections: { id: string; date: string }[]) {
  const years = new Map<string, number[]>();
  for (const e of elections) {
    let id: string;
    try { id = electionRuleSetId(e.id as Scenario['electionId']); } catch { continue; }
    const pct = historicalRules(id).thresholdPct;
    years.set(pct, [...(years.get(pct) ?? []), Number(e.date.slice(0, 4))]);
  }
  return [...years].map(([pct, ys]) => ({ pct, from: Math.min(...ys), to: Math.max(...ys) })).sort((a, b) => a.from - b.from);
}

/** Whether this tile's number can be changed here: the threshold only under Experimental rules (otherwise the law
 *  fixes it), the others always. */
export const tileEditable = (s: Scenario, field: TileField) => field !== 'threshold' || s.mode === 'experimental';

/** The official value of a tile's number, and whether the scenario differs from it. */
export function useTileOfficial(s: Scenario, field: TileField) {
  const ds = useStore(st => st.datasets[s.electionId]);
  if (!ds) return { official: null, edited: false };
  const t = ds.totals;
  switch (field) {
    case 'registered': return { official: t.registered, edited: s.registered !== t.registered };
    case 'invalid': return { official: t.invalid, edited: s.invalid !== t.invalid };
    // turnout differs when either of its two counts does (the tile shows their ratio)
    case 'turnout': return { official: 100 * t.votesCast / t.registered, edited: votesCast(s) !== t.votesCast || s.registered !== t.registered };
    case 'threshold': { const law = historicalRules(electionRuleSetId(s.electionId)).thresholdPct; return { official: Number(law), edited: Number(s.rules.thresholdPct) !== Number(law) }; }
  }
}

/** Turnout back to the official one. Scaling every list back by a percentage leaves a vote of rounding here and there,
 *  so when the last steps were turnout changes made from the official turnout they are stepped back exactly (Redo
 *  brings them back). Otherwise: with the official electorate, the official totals ("Official turnout"); with
 *  another electorate, the official percentage. */
function resetTurnout(officialPct: number) {
  const { scenario, past, datasets } = getState();
  const ds = scenario && datasets[scenario.electionId];
  if (!scenario || !ds) return;
  const official = (x: Scenario) => x.registered === ds.totals.registered && votesCast(x) === ds.totals.votesCast;
  let at = scenario, steps = 0;
  while (steps < past.length && at.log.at(-1)?.action.type === 'setTurnout' && past[past.length - 1 - steps].log.length === at.log.length - 1) at = past[past.length - 1 - steps++];
  if (steps && official(at)) { for (let i = 0; i < steps; i++) undo(); return; }
  dispatch(scenario.registered === ds.totals.registered ? { type: 'startPart', part: 'totals', source: 'official' } : { type: 'setTurnout', pct: officialPct });
}

/** The tile's words: [title of the window, the field's own label] */
const WORDS: Record<TileField, Record<'title' | 'label', [string, string]>> = {
  turnout: { title: ['Change turnout', 'שינוי שיעור ההצבעה'], label: ['Turnout %', 'שיעור הצבעה %'] },
  registered: { title: ['Change eligible voters', 'שינוי מספר בעלי זכות הבחירה'], label: ['Eligible voters', 'בעלי זכות בחירה'] },
  invalid: { title: ['Change invalid ballots', 'שינוי מספר הקולות הפסולים'], label: ['Invalid ballots', 'קולות פסולים'] },
  threshold: { title: ['Change the threshold', 'שינוי אחוז החסימה'], label: ['Threshold %', 'אחוז חסימה %'] },
};
const words = (field: TileField) => WORDS[field];

/** The window's contents: the field with its steps, what else belongs to it, then Reset and Done. */
export function TileEditor({ s, field, close, title = true }: { s: Scenario; field: TileField; close: () => void; title?: boolean }) {
  const L = useL();
  const elections = useStore(st => st.elections);
  const { official, edited } = useTileOfficial(s, field);
  const w = words(field);
  const label = L(...w.label);
  const cast = votesCast(s);
  const root = useRef<HTMLDivElement>(null);
  const reset = () => {
    if (official === null) return;
    // Reset goes once the number is back: focus stays in the window, on the field
    requestAnimationFrame(() => root.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }));
    if (field === 'registered') dispatch({ type: 'setTotals', registered: official });
    else if (field === 'invalid') dispatch({ type: 'setTotals', invalid: official });
    else if (field === 'turnout') resetTurnout(official);
    else dispatch({ type: 'setRules', patch: { thresholdPct: historicalRules(electionRuleSetId(s.electionId)).thresholdPct } });
  };
  const officialText = official === null ? '' : field === 'registered' || field === 'invalid' ? fmtInt(official)
    : field === 'turnout' ? `${official.toFixed(TURNOUT_FIELD_DIGITS)}%` : `${trimDecimal(String(official))}%`;
  const control = field === 'turnout'
    ? <NumericStepper label={label} value={s.registered ? 100 * cast / s.registered : 0} digits={TURNOUT_FIELD_DIGITS} min={0.01} max={100} onCommit={pct => dispatch({ type: 'setTurnout', pct })}
        steps={[{ id: '0.1', label: L('0.1 pts', '0.1 נק׳ אחוז'), amount: 0.1 }, { id: '1', label: L('1 pt', '1 נק׳ אחוז'), amount: 1 }]} />
    : field === 'threshold'
      ? <NumericStepper label={label} value={Number(s.rules.thresholdPct)} digits={2} min={0} max={100} onCommit={n => { if (n !== Number(s.rules.thresholdPct)) dispatch({ type: 'setRules', patch: { thresholdPct: trimDecimal(String(Math.round(n * 100) / 100)) } }); }}
          steps={[{ id: '0.25', label: L('0.25 pts', '0.25 נק׳ אחוז'), amount: 0.25 }, { id: '1', label: L('1 pt', '1 נק׳ אחוז'), amount: 1 }]} />
      : <NumericStepper label={label} value={field === 'registered' ? s.registered : s.invalid}
          onCommit={n => { if (n !== (field === 'registered' ? s.registered : s.invalid)) dispatch({ type: 'setTotals', [field]: n }); }}
          steps={[{ id: '1k', label: '1k', amount: 1000 }, { id: '10k', label: '10k', amount: 10000 }]} />;
  // how a turnout change is made: said behind (i), beside the window's title
  const note = field === 'turnout' && <Info title={L('Proportional turnout', 'הצבעה יחסית')}>{L('Every list, and the invalid ballots, grows or shrinks in proportion.', 'כל הרשימות, והקולות הפסולים, גדלים או קטנים באופן יחסי.')}</Info>;
  return <div ref={root} className="tile-editor" data-tile-editor={field}>
    {title && <span className="tile-editor-title"><b>{L(...w.title)}</b>{note}</span>}
    {control}
    {field === 'turnout' && <span className="row tile-editor-more"><TurnoutOtherElection s={s} /><StartFrom s={s} part="totals" copyOnly />{!title && note}</span>}
    {field === 'threshold' && <div className="quick-actions era-thresholds" role="group" aria-label={L('Thresholds by era', 'אחוזי חסימה לפי תקופה')}>
      {thresholdEras(elections).map(({ pct, from, to }) => { const on = Number(s.rules.thresholdPct) === Number(pct); const years = from === to ? `${from}` : `${from}–${to}`;
        return <button type="button" key={pct} className={`btn small ${on ? 'primary' : ''}`} aria-pressed={on} onClick={() => { if (!on) dispatch({ type: 'setRules', patch: { thresholdPct: pct } }); }}><b>{pct}%</b>{' '}<span className="tiny">{years}</span></button>; })}
    </div>}
    <div className="row tile-editor-foot">
      <button type="button" className="btn small" onClick={close}>{L('Done', 'סיום')}</button>
      {edited && official !== null && <button type="button" className="btn small" title={L(`Back to the official ${officialText}`, `חזרה לנתון הרשמי, ${officialText}`)} onClick={reset}><RotateCcw className="icon sm" aria-hidden />{L('Reset', 'איפוס')} <bdi dir="ltr" className="ink2">{officialText}</bdi></button>}
    </div>
  </div>;
}

/** While a tile's window is open the tile keeps the height it opened with, so the window under it never moves under
 *  the pointer as you edit (an edit can add a line to the tile, such as the official value or the Edited mark).
 *  The tile takes its new height when the window closes. */
export function holdHeight(el: HTMLElement | null | undefined, on: boolean) {
  if (!el) return;
  // measured exactly (offsetHeight rounds), in the page's own pixels (Settings → Text size zooms the root)
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  el.style.blockSize = on ? `${el.getBoundingClientRect().height / zoom}px` : '';
}

/** A tile's pencil and its window. `tile` is the tile around it: the window is placed beside the whole tile, and a
 *  tap anywhere on the tile (outside its own buttons) opens it too. */
export function TileEditPopup({ s, field, tile, children }: { s: Scenario; field: TileField; tile: React.RefObject<HTMLElement | null>; children?: ReactNode }) {
  const L = useL();
  const id = useId();
  const pop = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // a popover over the page: it closes when focus moves outside it (Tab past its end), so it never covers the control
  // that has focus
  useCloseOnFocusAway(true, t => !pop.current?.matches(':popover-open') || pop.current.contains(t) || !!tile.current?.contains(t), () => pop.current?.hidePopover());
  useFloating(pop, () => tile.current?.getBoundingClientRect(), open, false);
  // a tap on the tile's own surface opens the window, as its pencil does (its (i) and copy buttons keep their own job)
  useEffect(() => {
    const el = tile.current; if (!el) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (pop.current?.contains(t) || t.closest('button, a, input, select, [role="button"], [popover]')) return;
      trigger.current?.click();
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [tile]);
  // with a mouse or keyboard the field takes focus at once; on a touch screen it waits for a tap, so the keyboard
  // does not cover the screen before you choose
  useEffect(() => {
    if (!open || !matchMedia('(pointer: fine)').matches) return;
    pop.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
  }, [open]);
  const title = L(...words(field).title);
  return <>
    <button ref={trigger} type="button" className="btn ghost icon-only tile-pencil" aria-label={title} title={title} aria-expanded={open} aria-controls={id} popoverTarget={id}><Pencil className="icon sm" aria-hidden /></button>
    <div id={id} ref={pop} className="tile-pop" popover="auto" role="dialog" aria-label={title} onToggle={e => { const on = e.newState === 'open'; setOpen(on); tile.current?.classList.toggle('editing', on); holdHeight(tile.current, on); }}>
      {open && <TileEditor s={s} field={field} close={() => { pop.current?.hidePopover(); trigger.current?.focus({ preventScroll: true }); }} />}
      {children}
    </div>
  </>;
}

/** The edit mark of a tile whose number has no single edit of its own to point at (turnout is the ratio of two
 *  counts): the same word as every other edit mark; a tap on it opens the tile's window, which offers Reset. */
export function TileEditedMark({ s, field }: { s: Scenario; field: TileField }) {
  const L = useL();
  const { official, edited } = useTileOfficial(s, field);
  if (!edited || official === null) return null;
  const text = field === 'turnout' ? `${official.toFixed(TURNOUT_FIELD_DIGITS)}%` : fmtInt(official);
  return <span className="edit-marker-slot"><span className="edit-marker tile-mark" data-tile-mark={field} title={L(`Edited · official ${text}`, `נערך · הנתון הרשמי ${text}`)}>{L('Edited', 'נערך')}</span></span>;
}
