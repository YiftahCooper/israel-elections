import { groupingName, appGroupingExplanation } from '../groupingName.ts';
import { SeatDelta } from './SeatDelta.tsx';
import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
import { useActiveReference } from '../useActiveReference.ts';
import { referenceLabel } from '../derive.ts';
import { ElectionAbout } from './ElectionContext.tsx';
import { allocationOf } from '../derive.ts';
import { Majority } from './Majority.tsx';
// The opened list, in a panel beside the board (a full-screen sheet on narrow screens). It appears only when a
// list is chosen, and keeps its place while the rest of the board updates.
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, comparisonGroups, groupingLabel, listLabel, officialSeatsFor } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { setState, useStore } from '../store.ts';
import { ListDetail } from './ListDetail.tsx';
import { PartyLinks } from './PartyLinks.tsx';
import { Slip } from './ui.tsx';
import { LazyHistorySection } from './PartyHistoryLazy.tsx';
import { useRefRows } from '../compare/useRefRows.ts';
import { RefLine } from '../compare/RefLine.tsx';
import { askCopy } from '../compare/copyAsk.ts';
import { usePanelFocus } from '../focusReturn.ts';

/** While comparing: the list's line in the compared result and its Copy votes… button. */
function SidePanelCompare({ s, r, listId }: { s: Scenario; r: AllocationResult; listId: string }) {
  const L = useL();
  const cmp = useRefRows(s);
  const line = cmp?.rows.byList.get(listId);
  if (!cmp || !line) return null;
  return <div className="cmpm-sp"><RefLine line={line} label={cmp.label} r={r} />
    {line.kind === 'pair' && <button type="button" className="btn small cmpm-copy-btn" onClick={() => askCopy({ lists: [listId] })}>{L('Copy votes…', 'העתקת קולות…')}</button>}</div>;
}

export function ListSidePanel({ s, r, ds, base, baseR, listId }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult; listId: string }) {
  const { reference } = useActiveReference();
  if (reference) { base = reference; baseR = allocationOf(reference); }
  const L = useL();
  const lang = useLang();
  const baseLabel = referenceLabel(reference, lang);
  const ref = useRef<HTMLElement>(null);
  const l = s.lists.find((x) => x.id === listId);
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;
  const previewing = useStore(st => st.preview) === s;
  const previousSeats = useRef({ id: listId, seats: lr?.seats });
  useEffect(() => { if (!previewing) previousSeats.current = { id: listId, seats: lr?.seats }; }, [listId, lr?.seats, previewing]);
  // a newly opened list starts at the top of the panel
  useEffect(() => { ref.current?.querySelector('.sp-body')?.scrollTo({ top: 0 }); }, [listId]);
  // keyboard focus comes in at the heading and, on closing, goes back to what opened it (else the list's row)
  usePanelFocus(ref, listId, () => document.querySelector<HTMLElement>(`.lb-row[data-list-id="${CSS.escape(listId)}"]`));
  if (!l || !lr) return null;
  const was = officialSeatsFor(l.id, s, r, base, baseR);
  const d = was === null ? 0 : lr.seats - was;
  const changed = comparisonGroups(s, r, base, baseR).filter(g => g.seatsA !== g.seatsB).reduce((n,g) => n + Math.max(g.aIds.length, g.bIds.length), 0);
  const pieces = blocPieces(s, r);
  const blocIds = new Set(pieces.filter(p => p.listId === l.id).map(p => p.bloc));
  // A list with no seats still belongs to its assigned bloc.
  if (!blocIds.size) blocIds.add(l.bloc);
  const assignedBlocs = s.blocs.filter(b => blocIds.has(b.id));
  const blocs = assignedBlocs.length ? assignedBlocs : s.blocs;
  return (
    <aside className="panel side-panel" ref={ref} aria-label={listLabel(l, lang)}>
      <div className="sheet-scenario-switcher"><ScenarioSwitcher s={s} ds={ds} /></div>
      <header className="sp-head">
        <Slip name={listLabel(l, lang)} letters={l.letters} color={l.color} logo={l.logo} synthetic={l.synthetic} size="lg" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0 }} tabIndex={-1} data-panel-heading>{listLabel(l, lang)}</h2>
          <div className="small ink2" lang="he">{l.nameHe}</div>
          <PartyLinks links={l.links} name={listLabel(l, lang)} />
        </div>
        <div className="sp-seats">
          <b key={lr.seats} className={previousSeats.current.id === listId && previousSeats.current.seats !== lr.seats ? 'tick' : ''}>{lr.seats}</b><span className="small ink2">{L('seats', 'מנדטים')}</span>
          {d !== 0 && <small dir="ltr"><SeatDelta value={d} /></small>}
        </div>
        <button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={() => setState({ selectedListId: null })}><X className="icon" aria-hidden /></button>
      </header>
      <div className="phone-result-strip" role="status">
        <span>{d !== 0 && <><bdi dir="ltr"><SeatDelta value={d} /></bdi> </>}{baseLabel.since}{changed > 0 && <> · {L(`${changed} lists changed seats`, `${changed} רשימות שינו מנדטים`)}</>}</span>
        <span className="tiny muted">{groupingLabel(s, lang)}</span>
        {blocs.map(b => <span key={b.id} title={b.appDefined ? appGroupingExplanation(lang) : undefined}>{groupingName(b, lang, s.blocSchemes?.find(g => g.id === s.blocSchemeId))}: <Majority n={pieces.filter(p => p.bloc === b.id).reduce((n,p) => n+p.n,0)} total={s.rules.seats} /></span>)}
        {!assignedBlocs.length && <span>{L('No bloc assigned', 'ללא שיוך לגוש')}</span>}
      </div>
      <SidePanelCompare s={s} r={r} listId={listId} />
      <div className="sp-body"><LazyHistorySection s={s} r={r} listId={listId} /><ElectionAbout electionId={ds.id} listId={listId} /><ListDetail s={s} r={r} ds={ds} base={base} baseR={baseR} l={l} /></div>
    </aside>
  );
}
