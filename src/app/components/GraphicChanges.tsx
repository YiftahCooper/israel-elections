import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { comparisonGroups, listLabel, referenceLabel } from '../derive.ts';
import { signed } from '../format.ts';
import { useL, useLang } from '../i18n.ts';
import { useGraphicReference } from '../useGraphicReference.ts';

/** Static numeric evidence; large desktop lists disclose in place, phones retain every row. */
export function GraphicChanges({s,r,reference,compact=false}: {s:Scenario;r:AllocationResult;reference?:Scenario;compact?:boolean}) {
  const {base,result,labelReference} = useGraphicReference(s,reference);
  const lang = useLang(), L = useL();
  const groups = comparisonGroups(s,r,base,result).filter(g => g.seatsA !== g.seatsB);
  if (!groups.length) return null;
  const rows = groups.map(g => <span className="graphic-change-row" key={g.key}>
    <span>{(g.bIds.length ? g.bIds.map(id => s.lists.find(l=>l.id===id)!) : g.aIds.map(id=>base.lists.find(l=>l.id===id)!)).map(l=>listLabel(l,lang)).join(' + ')}</span>
    {!compact && <span className="lb-bar"><i style={{width:`${g.seatsB/s.rules.seats*100}%`,background:s.lists.find(l=>l.id===g.bIds[0])?.color ?? 'var(--muted)'}} /><span className="was" style={{width:`${g.seatsA/s.rules.seats*100}%`}} /><span className="delta-segment" style={{insetInlineStart:`${Math.min(g.seatsA,g.seatsB)/s.rules.seats*100}%`,width:`${Math.abs(g.seatsB-g.seatsA)/s.rules.seats*100}%`}} /></span>}
    <b dir="ltr">{g.seatsA} → {g.seatsB} ({signed(g.seatsB-g.seatsA)})</b>
  </span>);
  const content=<div className={compact?'change-items':'change-bars'}>{rows}</div>;
  return <div className={`graphic-changes ${compact?'compact-changes':''}`} aria-label={L(`Changes since ${labelReference?.name || 'Official result'}`,`שינויים מאז ${labelReference?.name || 'התוצאה הרשמית'}`)}>
    {!compact && <p className="small muted">{referenceLabel(labelReference,lang).since}</p>}
    {compact && groups.length>5 ? <><details className="desktop-changes"><summary>{L(`${groups.length} lists changed`,`${groups.length} רשימות השתנו`)}</summary>{content}</details><div className="phone-changes">{content}</div></> : content}
  </div>;
}
