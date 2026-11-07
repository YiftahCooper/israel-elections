import { SeatDelta } from './SeatDelta.tsx';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { comparisonGroups, listLabel, referenceLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { useGraphicReference } from '../useGraphicReference.ts';

/** Each changed list's seats against the reference, drawn: the bar now, the reference dashed, the change in ink. */
export function GraphicChanges({s,r,reference}: {s:Scenario;r:AllocationResult;reference?:Scenario}) {
  const {base,result,labelReference} = useGraphicReference(s,reference);
  const lang = useLang(), L = useL();
  const groups = comparisonGroups(s,r,base,result).filter(g => g.seatsA !== g.seatsB);
  if (!groups.length) return null;
  const rows = groups.map(g => <span className="graphic-change-row" key={g.key}>
    <span>{(g.bIds.length ? g.bIds.map(id => s.lists.find(l=>l.id===id)!) : g.aIds.map(id=>base.lists.find(l=>l.id===id)!)).map(l=>listLabel(l,lang)).join(' + ')}</span>
    <span className="lb-bar"><i style={{width:`${g.seatsB/s.rules.seats*100}%`,background:s.lists.find(l=>l.id===g.bIds[0])?.color ?? 'var(--muted)'}} /><span className="was" style={{width:`${g.seatsA/s.rules.seats*100}%`}} /><span className="delta-segment" style={{insetInlineStart:`${Math.min(g.seatsA,g.seatsB)/s.rules.seats*100}%`,width:`${Math.abs(g.seatsB-g.seatsA)/s.rules.seats*100}%`}} /></span>
    <b dir="ltr">{g.seatsA} → {g.seatsB} (<SeatDelta value={g.seatsB-g.seatsA} />)</b>
  </span>);
  return <div className="graphic-changes" aria-label={L(`Changes ${referenceLabel(labelReference, lang).since}`, `שינויים ${referenceLabel(labelReference, lang).since}`)}>
    <p className="small muted">{referenceLabel(labelReference,lang).since}</p>
    <div className="change-bars">{rows}</div>
  </div>;
}
