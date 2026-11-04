// The opened list, in a panel beside the board (a full-screen sheet on narrow screens). It appears only when a
// list is chosen, and keeps its place while the rest of the board updates.
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { setState } from '../store.ts';
import { ListDetail } from './ListDetail.tsx';
import { Mark } from './ListBars.tsx';
import { Slip } from './ui.tsx';

export function ListSidePanel({ s, r, ds, base, baseR, listId }: { s: Scenario; r: AllocationResult; ds: ElectionDataset; base: Scenario; baseR: AllocationResult; listId: string }) {
  const L = useL();
  const lang = useLang();
  const ref = useRef<HTMLElement>(null);
  const l = s.lists.find((x) => x.id === listId);
  const lr = l ? r.lists.find((x) => x.id === l.id) : undefined;
  // a newly opened list starts at the top of the panel
  useEffect(() => { ref.current?.scrollTo({ top: 0 }); }, [listId]);
  if (!l || !lr) return null;
  const was = base.lists.some((b) => b.id === l.id)
    ? baseR.lists.find((x) => x.id === l.id)?.seats ?? 0
    : l.originIds.reduce((t, o) => t + (baseR.lists.find((x) => x.id === o)?.seats ?? 0), 0);
  const d = lr.seats - was;
  return (
    <aside className="panel side-panel" ref={ref} aria-label={listLabel(l, lang)}>
      <header className="sp-head">
        <Slip letters={l.letters} color={l.color} logo={l.logo} size="lg" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0 }}>{listLabel(l, lang)}</h2>
          <div className="small ink2" lang="he">{l.nameHe}</div>
        </div>
        <div className="sp-seats">
          <b>{lr.seats}</b><span className="small ink2">{L('seats', 'מנדטים')}</span>
          {d !== 0 && <small dir="ltr"><Mark up={d > 0} />{Math.abs(d)}</small>}
        </div>
        <button className="btn ghost icon-only" aria-label={L('Close', 'סגירה')} onClick={() => setState({ selectedListId: null })}><X className="icon" aria-hidden /></button>
      </header>
      <div className="sp-body"><ListDetail s={s} r={r} ds={ds} base={base} baseR={baseR} l={l} /></div>
    </aside>
  );
}
