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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCloseOnFocusAway } from '../focusReturn.ts';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, groupingBaseline, groupingLabel, nonSeatChanges, comparisonGroups, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { CompareButton } from '../compare/CompareStrip.tsx';

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
    mark(); el.addEventListener('scroll', mark, { passive: true });
    const o = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(mark); o?.observe(el);
    return () => { el.removeEventListener('scroll', mark); o?.disconnect(); };
  });
  const moves = useMemo(() => seatMoves(s, r, base, baseR), [s, r, base, baseR]);
  // blocs are compared under the same sourced grouping; an edited grouping has no official counterpart
  const blocs = useMemo(() => {
    if (!s.blocs.length) return null;
    const now = blocTotals(s, r);
    let was: Map<string | null, number> | null = null;
    const b = groupingBaseline(s, base);
    if (b) was = blocTotals(b, allocationOf(b));
    return s.blocs.map((b) => ({ b, n: now.get(b.id) ?? 0, d: was ? (now.get(b.id) ?? 0) - (was.get(b.id) ?? 0) : null }));
  }, [s, r, base, baseR]);
  const edited = resultChanges(s,base).length > 0;
  // a grouping or coalition change is a change, but the result itself is untouched: say so
  const resultUnchanged = groupingOnly(s, base);
  const familyGrouping = isFamilyGrouping(s);
  const majority = Math.floor(s.rules.seats / 2) + 1;
  const holder = blocs?.find((x) => x.n >= majority);
  const name = (b: { nameHe: string; nameEn: string; appDefined?: boolean }) => groupingName(b, lang, s.blocSchemes?.find(g => g.id === s.blocSchemeId));
  const shown = moves.slice(0, MAX_MOVES);

  return (
    <div ref={line} className={`session ${edited ? '' : 'idle'}`} role="status" aria-live="polite">
      <FittingLabel full={label} short={reference ? String(count) : compact} reference={namedReference} locale={appLocale(lang)} />
      {/* the (i) right after the label it explains, on the same line at every width */}
      <Info title={L('Your changes', 'השינויים שלכם')}>{L('Reference: ', 'נקודת ההשוואה: ')}<bdi>{referenceLabel(reference, lang).name}</bdi>. {L('Counts your actions since the named reference, not individual fields: votes, rules, lists, blocs and coalition roles. Colours do not count. History shows all changes from the official result; undo, redo or return to an earlier change there.', 'סופר את הפעולות שלכם מאז נקודת ההשוואה הנקובה, ולא שדות בודדים: קולות, כללים, רשימות, גושים ותפקידים בקואליציה. צבעים אינם נספרים. בהיסטוריה מוצגים כל השינויים מהתוצאה הרשמית; אפשר לבטל, לבצע שוב או לחזור לשינוי קודם.')}</Info>
      <span ref={changes} className="session-changes">
        {edited && <>
          {moves.length === 0
            ? <span className="muted">{resultUnchanged ? unchangedResultNote(lang) : L('No seats changed', 'המנדטים לא השתנו')}</span>
            : <span className="moves">
                {shown.map((m) => <span key={m.id}><bdi>{m.label(lang)}</bdi> {m.n} <span dir="ltr">(<SeatDelta value={m.d} />)</span></span>)}
                {moves.length > MAX_MOVES && <span className="muted">{L(`+${moves.length - MAX_MOVES} more`, `ועוד ${moves.length - MAX_MOVES}`)}</span>}
              </span>}
          {nonSeatChanges(s, base, lang).length > 0 && <span>{nonSeatChanges(s, base, lang).join(' · ')}</span>}
          {blocs && <span className="moves" style={{ color: 'var(--ink-2)' }}>
            {!familyGrouping && <span>{groupingLabel(s, lang)}</span>}
            {blocs.filter((x) => x.n > 0 || x.d).map(({ b, n, d }) => <span key={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined}><bdi>{name(b)}</bdi> {n}{d ? <span dir="ltr"> (<SeatDelta value={d} />)</span> : null}</span>)}
            {!familyGrouping && <span>{holder ? L(`${name(holder.b)} holds a majority`, `${hebrewPrefixName('ל', name(holder.b))} יש רוב`) : L('no bloc has a majority', 'לאף גוש אין רוב')}</span>}
          </span>}
          {s.mode === 'experimental' && <span className="chip exp">{L('Experimental rules', 'כללים ניסיוניים')}</span>}
        </>}
      </span>
      <CompareButton />
      {edited && <button ref={trigger} className="btn small ghost" aria-expanded={open} aria-controls={historyId} popoverTarget={historyId}>
        {L('History', 'היסטוריה')}
        {open ? <ChevronUp className="icon sm" aria-hidden /> : <ChevronDown className="icon sm" aria-hidden />}
      </button>}
      <div id={historyId} ref={pop} className="history" popover="auto" onToggle={(e) => setOpen(e.newState === 'open')}>
        {open && <Suspense fallback={<p className="muted small">{L('Loading…', 'טוען…')}</p>}><History s={s} r={r} ds={ds} reference={reference} /></Suspense>}
      </div>
    </div>
  );
}
