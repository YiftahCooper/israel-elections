import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { comparisonGroups, listLabel, referenceLabel } from '../derive.ts';
import { signed } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { useGraphicReference } from '../useGraphicReference.ts';

/** Static, shared change evidence; never relies on the transient number animation. */
export function GraphicChanges({s,r,reference}: {s:Scenario;r:AllocationResult;reference?:Scenario}) {
  const {base,result,labelReference} = useGraphicReference(s,reference);
  const lang = useLang(), L = useL();
  const groups = comparisonGroups(s,r,base,result).filter(g => g.seatsA !== g.seatsB);
  if (!groups.length) return null;
  return <div className="graphic-changes" aria-label={referenceLabel(labelReference,lang).since}>
    <p className="small muted">{referenceLabel(labelReference,lang).since} · {L('Dashed: reference · ink segment: change','מקווקו: בסיס · מקטע דיו: שינוי')}</p>
    {groups.map(g => <div className="graphic-change-row" key={g.key}>
      <span>{(g.bIds.length ? g.bIds.map(id => s.lists.find(l=>l.id===id)!) : g.aIds.map(id=>base.lists.find(l=>l.id===id)!)).map(l=>listLabel(l,lang)).join(' + ')}</span>
      <span className="lb-bar"><i style={{width:`${g.seatsB/s.rules.seats*100}%`,background:s.lists.find(l=>l.id===g.bIds[0])?.color ?? 'var(--muted)'}} /><span className="was" style={{width:`${g.seatsA/s.rules.seats*100}%`}} /><span className="delta-segment" style={{insetInlineStart:`${Math.min(g.seatsA,g.seatsB)/s.rules.seats*100}%`,width:`${Math.abs(g.seatsB-g.seatsA)/s.rules.seats*100}%`}} /></span>
      <b dir="ltr">{g.seatsA} → {g.seatsB} ({signed(g.seatsB-g.seatsA)})</b>
    </div>)}
  </div>;
}
