// Blocs while comparing: the compared result's own bloc bar (that election's own grouping, e.g. the 37th government:
// 64 against 56) under yours, on the same scale, with its majority line in the same place. To look at: nothing is
// copied, blocs are definitions, not votes.
import { useMemo } from 'react';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf, blocPieces, groupingLabel } from '../derive.ts';
import { blocDisplayOrder } from '../blocOrder.ts';
import { groupingName } from '../groupingName.ts';
import { useL, useLang } from '../i18n.ts';
import { useReference } from './mode.ts';
import { refLabel } from './useRefRows.ts';

export function RefBlocs({ s }: { s: Scenario }) {
  const L = useL(), lang = useLang();
  const state = useReference(s);
  const ref = state.status === 'ready' ? state.ref : null;
  const groups = useMemo(() => {
    if (!ref) return [];
    const sc = ref.sc, pieces = blocPieces(sc, allocationOf(sc)), order = blocDisplayOrder(sc);
    const scheme = sc.blocSchemes?.find((x) => x.id === sc.blocSchemeId);
    return [...sc.blocs.map((b) => ({ id: b.id as string | null, label: groupingName(b, lang, scheme), color: b.color })), { id: null, label: L('No bloc', 'ללא גוש'), color: '#8a9099' }]
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
      .map((g) => ({ ...g, n: pieces.filter((p) => p.bloc === g.id).reduce((t, p) => t + p.n, 0) }))
      .filter((g) => g.n > 0);
  }, [ref?.sc, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ref || !groups.length) return null;
  const total = ref.sc.rules.seats, majority = Math.floor(total / 2) + 1;
  const label = refLabel(ref, s), grouping = groupingLabel(ref.sc, lang);
  return <div className="cmpm-refblocs">
    <p className="small muted cmpm-refblocs-head"><bdi>{label}</bdi>: {grouping}</p>
    <div className="strip" role="img" aria-label={`${label}, ${grouping}: ${groups.map((g) => `${g.label} ${g.n}`).join(', ')}`}>
      {groups.map((g) => <span key={g.id ?? 'none'} className={`corridor ${g.id === null ? 'no-bloc' : ''}`} style={{ flexGrow: g.n, flexBasis: 0, ['--bc' as string]: g.color }}>
        <span className="label"><span className="clip">{g.label}</span> <b>{g.n}</b></span>
      </span>)}
      <span className="milestone" aria-hidden style={{ left: `${(majority / total) * 100}%` }}><span>{majority}</span></span>
    </div>
  </div>;
}
