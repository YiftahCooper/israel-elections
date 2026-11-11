/** How a seat of a joint list counted by party shows its party (Settings → Joint-list seats). */
export type JointLook = 'both' | 'party' | 'list';
/** Share of the seat the party colour fills when both colours show: the list colour is only a thin ring at the edge. */
export const PARTY_SHARE = 0.8;
/** The party colour inside a list-colour seat (`r`: the seat's own radius, or half its side for a square seat). The
 *  party fills most of the seat and the list colour is a thin ring at its edge, with no outline between them. */
export function PartyDot({x,y,r,color,partyId,className,square}:{x:number;y:number;r:number;color:string;partyId?:string;className?:string;square?:{rx:number}}){
 const p=r*PARTY_SHARE;
 return square
  ? <rect data-component-seat={partyId} pointerEvents="none" x={x-p} y={y-p} width={2*p} height={2*p} rx={square.rx*PARTY_SHARE} fill={color} className={className}/>
  : <circle data-component-seat={partyId} pointerEvents="none" cx={x} cy={y} r={p} fill={color} className={className}/>;
}
/** A legend swatch for one party of a joint list: the seat as drawn, a party dot in a list ring (or the party colour alone). */
export function PartyKey({color,ring,partyId,hover}:{color:string;ring?:string;partyId?:string;hover?:boolean}){
 return <span className="component-key" data-party-key={hover?undefined:partyId} data-hover-party={hover?partyId:undefined} style={{background:color}}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx={7} cy={7} r={7} fill={ring??color}/>{ring&&<PartyDot x={7} y={7} r={7} color={color}/>}</svg></span>;
}
