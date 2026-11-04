// "What changed": the session's net effect against the official result, kept to one line however many edits
// were made (seats that moved, the blocs, the majority), with the full undoable history one click away.
import { lazy, Suspense, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import { applyAction } from '../../model/actions.ts';
import type { Scenario } from '../../model/scenario.ts';
import { blocPieces, comparisonGroups, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';

const History = lazy(() => import('./Panels.tsx').then((m) => ({ default: m.History })));
const MAX_MOVES = 5;

/** Seats each list holds now against the official result; a list made by a merge or split is compared with
 *  the official seats of the lists it came from, and lists that no longer exist count as losing theirs. */
export function seatMoves(s: Scenario, r: AllocationResult, base: Scenario, baseR: AllocationResult) {
  return comparisonGroups(s, r, base, baseR).filter(g => g.seatsA !== g.seatsB).map(g => ({
    id: g.key, d: g.seatsB - g.seatsA,
    label: (lang: 'he' | 'en') => (g.bIds.length ? g.bIds.map(id => s.lists.find(l => l.id === id)!) : g.aIds.map(id => base.lists.find(l => l.id === id)!)).map(l => listLabel(l, lang)).join(' + '),
  })).sort((a,b) => Math.abs(b.d)-Math.abs(a.d) || b.d-a.d);
}

function blocTotals(s: Scenario, r: AllocationResult) {
  const t = new Map<string | null, number>();
  for (const p of blocPieces(s, r)) t.set(p.bloc, (t.get(p.bloc) ?? 0) + p.n);
  return t;
}

export function ChangeSummary({ s, r, base, baseR, ds }: { s: Scenario; r: AllocationResult; base: Scenario; baseR: AllocationResult; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const moves = useMemo(() => seatMoves(s, r, base, baseR), [s, r, base, baseR]);
  // blocs are compared under the same sourced grouping; an edited grouping has no official counterpart
  const blocs = useMemo(() => {
    if (!s.blocs.length) return null;
    const now = blocTotals(s, r);
    let was: Map<string | null, number> | null = null;
    if (s.blocSchemeId) {
      try {
        const b = s.blocSchemeId === base.blocSchemeId ? base : applyAction(base, { type: 'applyBlocScheme', schemeId: s.blocSchemeId });
        was = blocTotals(b, baseR);
      } catch { was = null; }
    }
    return s.blocs.map((b) => ({ b, n: now.get(b.id) ?? 0, d: was ? (now.get(b.id) ?? 0) - (was.get(b.id) ?? 0) : null }));
  }, [s, r, base, baseR]);
  if (!s.log.length) return null;

  const majority = Math.floor(s.rules.seats / 2) + 1;
  const holder = blocs?.find((x) => x.n >= majority);
  const name = (b: { nameHe: string; nameEn: string }) => (lang === 'he' ? b.nameHe : b.nameEn);
  const sign = (d: number) => (d > 0 ? `+${d}` : `−${-d}`);
  const shown = moves.slice(0, MAX_MOVES);

  return (
    <div className="session" role="status" aria-live="polite">
      {s.name && <span className="scn-name" title={s.description ?? s.name}>{s.name}</span>}
      <b>{L('What changed', 'מה השתנה')}</b>
      {moves.length === 0
        ? <span className="muted">{L('No seat moved', 'אף מנדט לא זז')}</span>
        : <span className="moves">
            {shown.map((m) => <span key={m.id}><bdi>{m.label(lang)}</bdi> <b dir="ltr">{sign(m.d)}</b></span>)}
            {moves.length > MAX_MOVES && <span className="muted">{L(`+${moves.length - MAX_MOVES} more`, `ועוד ${moves.length - MAX_MOVES}`)}</span>}
          </span>}
      {blocs && <span className="moves" style={{ color: 'var(--ink-2)' }}>
        {blocs.filter((x) => x.n > 0 || x.d).map(({ b, n, d }) => <span key={b.id}><bdi>{name(b)}</bdi> {n}{d ? <span dir="ltr"> ({sign(d)})</span> : null}</span>)}
        <span>{holder ? L(`${name(holder.b)} holds a majority`, `ל${name(holder.b)} יש רוב`) : L('no bloc has a majority', 'לאף גוש אין רוב')}</span>
      </span>}
      {s.mode === 'experimental' && <span className="chip exp">{L('Experimental rules', 'כללים ניסיוניים')}</span>}
      <span className="spacer" />
      <button className="btn small ghost" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {L(`${s.log.length} edit${s.log.length === 1 ? '' : 's'}`, `${s.log.length} שינויים`)}
        {open ? <ChevronUp className="icon sm" aria-hidden /> : <ChevronDown className="icon sm" aria-hidden />}
      </button>
      {open && <div className="history"><Suspense fallback={<p className="muted small">{L('Loading…', 'טוען…')}</p>}><History s={s} r={r} ds={ds} /></Suspense></div>}
    </div>
  );
}
