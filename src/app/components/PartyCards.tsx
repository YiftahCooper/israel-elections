import { useMemo, useState } from 'react';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { setState, useLevel, useStore } from '../store.ts';
import { Seg, Slip } from './ui.tsx';

export function PartyCards({ s, r, base, baseR }: { s: Scenario; r: AllocationResult; base: Scenario; baseR: AllocationResult }) {
  const L = useL();
  const lang = useLang();
  const selected = useStore((st) => st.selectedListId);
  const digits = useStore((st) => st.digits);
  const { standard } = useLevel();
  const [filter, setFilter] = useState<'main' | 'all'>('main');
  const [q, setQ] = useState('');
  const total = r.totalValid;

  const rows = useMemo(() => {
    const thr = Number(r.thresholdVotes);
    return s.lists
      .map((l) => ({ l, lr: r.lists.find((x) => x.id === l.id)! }))
      .filter(({ l, lr }) => filter === 'all' || lr.seats > 0 || l.votes >= thr * 0.25 || !l.originIds.length || l.originIds.some((o) => !base.lists.some((b) => b.id === o)) || l.id === selected)
      .filter(({ l }) => !q || l.nameHe.includes(q) || l.shortHe.includes(q) || (l.shortEn ?? '').toLowerCase().includes(q.toLowerCase()) || l.letters.includes(q))
      .sort((a, b) => b.lr.seats - a.lr.seats || b.l.votes - a.l.votes);
  }, [s, r, filter, q, selected, base]);

  const baseSeats = (originIds: string[], id: string) => {
    if (base.lists.some((b) => b.id === id)) return baseR.lists.find((x) => x.id === id)?.seats ?? 0;
    return originIds.reduce((t, o) => t + (baseR.lists.find((x) => x.id === o)?.seats ?? 0), 0);
  };

  return (
    <section className="panel scroll left" aria-label={L('Lists', 'רשימות')}>
      <header>
        <h2>{L('Lists', 'הרשימות')}</h2>
        <span className="spacer" />
        <Seg label={L('Filter', 'סינון')} value={filter} onChange={setFilter} options={[{ v: 'main', label: L('Main', 'עיקריות') }, { v: 'all', label: L(`All ${s.lists.length}`, `כל ה-${s.lists.length}`) }]} />
      </header>
      {standard && <div style={{ padding: '8px 8px 0' }}>
        <input type="search" placeholder={L('Search lists…', 'חיפוש רשימה…')} value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%' }} aria-label={L('Search lists', 'חיפוש רשימה')} />
      </div>}
      <div className="cards">
        {rows.map(({ l, lr }) => {
          const d = lr.seats - baseSeats(l.originIds, l.id);
          const agr = r.agreements.find((a) => a.members.includes(l.id));
          const partner = agr ? s.lists.find((x) => x.id === agr.members.find((m) => m !== l.id)) : null;
          return (
            <button key={l.id} className={`card ${lr.qualified ? '' : 'out'}`} aria-pressed={selected === l.id} onClick={() => {
              const next = selected === l.id ? null : l.id;
              setState({ selectedListId: next });
              // on narrow screens the details panel is elsewhere on the page: bring it into view
              if (next && window.innerWidth <= 1180) requestAnimationFrame(() => document.getElementById('detail-col')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            }}>
              <Slip letters={l.letters} color={l.color} />
              <div style={{ minWidth: 0 }}>
                <div className="name" title={l.nameHe}>{listLabel(l, lang)}</div>
                <div className="meta">
                  <span className="tabnum">{fmtInt(l.votes)}</span>
                  <span className="tabnum">{fmtPct(l.votes, total, digits)}</span>
                  {l.withdrawn ? <span className="chip no">{L('Withdrew', 'פרשה')}</span>
                    : lr.qualified ? null : <span className="chip no">{L('Below threshold', 'מתחת לאחוז החסימה')}</span>}
                  {partner && standard && <span className={`chip ${agr!.active ? 'ok' : ''}`} title={agr!.active ? L('Surplus-vote agreement (active)', 'הסכם עודפים (בתוקף)') : L('Surplus-vote agreement with no effect', 'הסכם עודפים ללא השפעה')}>⇄ {listLabel(partner, lang)}{agr!.active ? '' : ' ✕'}</span>}
                </div>
              </div>
              <div className="seats">{lr.seats}<small dir="ltr">{d === 0 ? <span className="muted">±0</span> : <span className={d > 0 ? 'up' : 'down'}>{d > 0 ? `+${d}` : `−${-d}`}</span>}</small></div>
            </button>
          );
        })}
        {rows.length === 0 && <p className="muted small">{L('No list matches.', 'אין רשימה תואמת.')}</p>}
      </div>
    </section>
  );
}
