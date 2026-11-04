import { ScenarioSwitcher } from './ScenarioSwitcher.tsx';
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
import { Mark } from './ListBars.tsx';
import { PartyLinks } from './PartyLinks.tsx';
import { Slip } from './ui.tsx';

export function ListSidePanel({ s, r, ds, base, baseR, listId }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult; listId: string }) {
  const reference = useStore(st => st.markOfficial ? null : st.reference);
  if (reference) { base = reference; baseR = allocationOf(reference); }
  const L = useL();
  const lang = useLang();
  const baseLabel = referenceLabel(reference, lang);
  const ref = useRef<HTMLElement>(null);
  const l = s.lists.find((x) => x.id === listId);
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;
  // a newly opened list starts at the top of the panel
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [listId]);
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
        <Slip letters={l.letters} color={l.color} logo={l.logo} size="lg" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0 }}>{listLabel(l, lang)}</h2>
          <div className="small ink2" lang="he">{l.nameHe}</div>
          <PartyLinks links={l.links} name={listLabel(l, lang)} />
        </div>
        <div className="sp-seats">
          <b>{lr.seats}</b><span className="small ink2">{L('seats', 'מנדטים')}</span>
          {d !== 0 && <small dir="ltr"><Mark up={d > 0} />{Math.abs(d)}</small>}
        </div>
        <button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={() => setState({ selectedListId: null })}><X className="icon" aria-hidden /></button>
      </header>
      <div className="phone-result-strip" role="status">
        <span><b>{lr.seats}</b> {L('seats', 'מנדטים')} · <bdi>{was === null ? '—' : d > 0 ? `+${d}` : String(d)}</bdi> {baseLabel.since} · {L(`${changed} lists changed seats`, `${changed} רשימות שינו מנדטים`)}</span>
        <span className="tiny muted">{groupingLabel(s, lang)}</span>
        {blocs.map(b => <span key={b.id}>{lang === 'he' ? b.nameHe : b.nameEn}: <Majority n={pieces.filter(p => p.bloc === b.id).reduce((n,p) => n+p.n,0)} total={s.rules.seats} /></span>)}
        {!assignedBlocs.length && <span>{L('No bloc assigned', 'ללא שיוך לגוש')}</span>}
      </div>
      <div className="sp-body"><ElectionAbout electionId={ds.id} listId={listId} /><ListDetail s={s} r={r} ds={ds} base={base} baseR={baseR} l={l} /></div>
    </aside>
  );
}
