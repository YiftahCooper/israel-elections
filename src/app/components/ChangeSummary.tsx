import { appLocale } from '../dateFormat.ts';
import { FittingLabel } from './FittingLabel.tsx';
import { hebrewPrefixName } from '../hebrewPrefix.ts';
import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { Info } from './ui.tsx';
import {isFamilyGrouping} from '../../families/labels.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { changeCount, changesLabel, groupingOnly, referenceLabel, resultChanges, unchangedResultNote } from '../derive.ts';
import { allocationOf } from '../derive.ts';
// "What changed": the session's net effect against the official result, kept to one line however many edits
// were made (seats that moved, the blocs, the majority), with the full undoable history one click away.
// The line is always there (before the first edit it says so) and never wraps or grows: a first edit, or one
// that changes how much there is to say, must not push the page down under the pointer. What does not fit
// scrolls sideways; History opens as a popover over the page.
import { lazy, Suspense, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFloating } from '../floating.tsx';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useCloseOnFocusAway } from '../focusReturn.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, groupingBaseline, groupingLabel, nonSeatChanges, comparisonGroups, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { CompareButton } from '../compare/CompareStrip.tsx';
import { SessionUndo, usePhone } from './UndoGroup.tsx';

const History = lazy(() => import('./Panels.tsx').then((m) => ({ default: m.History })));
const MAX_MOVES = 5;

/** Seats each list holds now against the official result; a list made by a merge or split is compared with
 *  the official seats of the lists it came from, and lists that no longer exist count as losing theirs. */
export function seatMoves(s: Scenario, r: AllocationResult, base: Scenario, baseR: AllocationResult) {
  return comparisonGroups(s, r, base, baseR).filter(g => g.seatsA !== g.seatsB).map(g => ({
    id: g.key, d: g.seatsB - g.seatsA, n: g.seatsB,
    label: (lang: 'he' | 'en') => (g.bIds.length ? g.bIds.map(id => s.lists.find(l => l.id === id)!) : g.aIds.map(id => base.lists.find(l => l.id === id)!)).map(l => listLabel(l, lang)).join(' + '),
  })).sort((a,b) => Math.abs(b.d)-Math.abs(a.d) || b.d-a.d);
}

function blocTotals(s: Scenario, r: AllocationResult) {
  const t = new Map<string | null, number>();
  for (const p of blocPieces(s, r)) t.set(p.bloc, (t.get(p.bloc) ?? 0) + p.n);
  return t;
}

export function ChangeSummary({ s, r, base, baseR, ds }: { s: Scenario; r: AllocationResult; base: Scenario; baseR: AllocationResult; ds: ElectionDataset }) {
  const { reference } = useActiveReference();
  if (reference) { base = reference; baseR = allocationOf(reference); }
  const L = useL();
  const lang = useLang();
  const count = changeCount(s, reference);
  const label = changesLabel(count, reference, lang);
  const referenceName = referenceLabel(reference, lang).name;
  const compact = changesLabel(count, reference, lang, true);
  const namedReference = reference ? { prefix: compact.slice(0, -referenceName.length), name: referenceName } : undefined;
  const [open, setOpen] = useState(false);
  const historyId = useId();
  const pop = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  // a popover over the page: it closes when focus moves outside it (Tab past its end), so it never covers the control
  // that has focus; read from the element, since its toggle event comes a moment after the press
  useCloseOnFocusAway(true, t => !pop.current?.matches(':popover-open') || pop.current.contains(t) || !!trigger.current?.contains(t), () => pop.current?.hidePopover());
  const line = useRef<HTMLDivElement>(null);
  const changes = useRef<HTMLSpanElement>(null);
  useFloating(pop, () => trigger.current?.getBoundingClientRect(), open, false);
  // the sticky header stack (band, tools, this line) is what the board, side panel and focus scrolling sit under
  useLayoutEffect(() => {
    const el = line.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement.style;
    const o = new ResizeObserver(() => root.setProperty('--session-h', `${el.offsetHeight}px`));
    o.observe(el); return () => { o.disconnect(); root.removeProperty('--session-h'); };
  }, []);
  // a trailing fade says there is more to scroll to, and goes once the end is reached
  useLayoutEffect(() => {
    const el = changes.current; if (!el) return;
    const mark = () => { const rest = el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft); el.toggleAttribute('data-more', rest > 1); };
    // with a mouse the strip has no scroll bar: the wheel scrolls it sideways (V1 review, 19 Nov)
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault(); el.scrollLeft += (getComputedStyle(el).direction === 'rtl' ? -1 : 1) * e.deltaY;
    };
    mark(); el.addEventListener('scroll', mark, { passive: true }); el.addEventListener('wheel', wheel, { passive: false });
    const o = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(mark); o?.observe(el);
    return () => { el.removeEventListener('scroll', mark); el.removeEventListener('wheel', wheel); o?.disconnect(); };
  });
  // the rest of a line too long for its row is one press away, at the fade that says it is there
  const more = () => { const el = changes.current; if (el) el.scrollBy({ left: (getComputedStyle(el).direction === 'rtl' ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' }); };
  const moves = useMemo(() => seatMoves(s, r, base, baseR), [s, r, base, baseR]);
  // blocs are compared under the same sourced grouping; an edited grouping has no official counterpart
  const blocs = useMemo(() => {
    if (!s.blocs.length) return null;
    const now = blocTotals(s, r);
    let was: Map<string | null, number> | null = null;
    const b = groupingBaseline(s, base);
    if (b) was = blocTotals(b, allocationOf(b));
    // seats in no bloc are named too, so the line's blocs always add up to the chamber (2022, Labor withdrawn: Meretz's
    // four seats are in no bloc)
    const none = { id: null as string | null, nameHe: 'ללא גוש', nameEn: 'No bloc' };
    return [...s.blocs, none].map((b) => ({ b, n: now.get(b.id) ?? 0, d: was ? (now.get(b.id) ?? 0) - (was.get(b.id) ?? 0) : null }))
      .filter((x) => x.b.id !== null || x.n > 0 || x.d);
  }, [s, r, base, baseR]);
  const edited = resultChanges(s,base).length > 0;
  // a grouping or coalition change is a change, but the result itself is untouched: say so
  const resultUnchanged = groupingOnly(s, base);
  const familyGrouping = isFamilyGrouping(s);
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const holder = blocs?.find((x) => x.b.id !== null && x.n >= majority);
  const name = (b: { id: string | null; nameHe: string; nameEn: string; appDefined?: boolean }) => b.id === null ? L('No bloc', 'ללא גוש') : groupingName(b, lang, s.blocSchemes?.find(g => g.id === s.blocSchemeId));
  const shown = moves.slice(0, MAX_MOVES);
  // phones keep Undo and Redo in their pinned bar, and Start over in the scenario panel (this line scrolls away there)
  const phone = usePhone();

  return (
    // the label and the changed seats are read out when they change, not the buttons beside them (review V4 A12)
    <div ref={line} className={`session ${edited ? '' : 'idle'}`}>
      <FittingLabel full={label} short={reference ? String(count) : compact} reference={namedReference} locale={appLocale(lang)} />
      {/* the (i) right after the label it explains, on the same line at every width; with no changes there is nothing to
          explain (round 2 of the clarity pass, 26 Nov 2026) */}
      {count > 0 && <Info title={L('Your changes', 'השינויים שלכם')}>{L('Each edit counts once: votes, rules, lists, blocs or coalition roles. Colours don’t count. History lists every change and lets you go back to one.', 'כל עריכה נספרת פעם אחת: קולות, כללים, רשימות, גושים או תפקידים בקואליציה. צבעים אינם נספרים. בהיסטוריה מופיע כל שינוי, ואפשר לחזור אליו.')}</Info>}
      <span ref={changes} className="session-changes" role="status">
        {edited && <>
          {moves.length === 0
            ? <span className="muted">{resultUnchanged ? unchangedResultNote(lang) : L('No seats changed', 'המנדטים לא השתנו')}</span>
            : <span className="moves">
                <span className="muted">{L('Seats:', 'מנדטים:')}</span>
                {shown.map((m) => <span key={m.id}><bdi>{m.label(lang)}</bdi> {m.n} <span dir="ltr">(<SeatDelta value={m.d} />)</span></span>)}
                {moves.length > MAX_MOVES && <span className="muted">{L(`+${moves.length - MAX_MOVES} more`, `ועוד ${moves.length - MAX_MOVES}`)}</span>}
              </span>}
          {nonSeatChanges(s, base, lang).length > 0 && <span>{nonSeatChanges(s, base, lang).join(' · ')}</span>}
          {blocs && <span className="moves" style={{ color: 'var(--ink-2)' }}>
            {!familyGrouping && <span>{groupingLabel(s, lang)}</span>}
            {blocs.filter((x) => x.n > 0 || x.d).map(({ b, n, d }) => <span key={b.id ?? 'none'} title={'appDefined' in b && b.appDefined ? appGroupingExplanation(lang) : undefined}><bdi>{name(b)}</bdi> {n}{d ? <> <span dir="ltr">(<SeatDelta value={d} />)</span></> : null}</span>)}
            {!familyGrouping && <span>{holder ? L(`${name(holder.b)} holds a majority`, `${hebrewPrefixName('ל', name(holder.b))} יש רוב`) : L('No bloc has a majority', 'לאף גוש אין רוב')}</span>}
          </span>}
          {s.mode === 'experimental' && <span className="chip exp">{L('Experimental rules', 'כללים ניסיוניים')}</span>}
        </>}
      </span>
      {edited && <button type="button" className="btn small ghost icon-only session-more" onClick={more} aria-label={L('Show the rest of the line', 'הצגת המשך השורה')} title={L('Show the rest of the line', 'הצגת המשך השורה')}><ChevronRight className="icon sm rtl-mirror" aria-hidden /></button>}
      <CompareButton />
      {edited && <button ref={trigger} className="btn small ghost" aria-expanded={open} aria-controls={historyId} popoverTarget={historyId}>
        {L('History', 'היסטוריה')}
        {open ? <ChevronUp className="icon sm" aria-hidden /> : <ChevronDown className="icon sm" aria-hidden />}
      </button>}
      <div id={historyId} ref={pop} className="history" popover="auto" role="group" aria-label={L('History', 'היסטוריה')} onToggle={(e) => setOpen(e.newState === 'open')}>
        {open && <Suspense fallback={<p className="muted small">{L('Loading…', 'טוען…')}</p>}><History s={s} r={r} ds={ds} reference={reference} /></Suspense>}
      </div>
      {!phone && <SessionUndo />}
    </div>
  );
}
