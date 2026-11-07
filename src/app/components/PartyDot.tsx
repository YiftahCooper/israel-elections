import{partySeparator}from'../../data/colourGuard.ts';
/** 1.5 CSS-pixel separator at 1× (4.5 raster pixels at 3×), independent of responsive SVG size. */
export function PartyDot({x,y,r,color,ring,partyId,className}:{x:number;y:number;r:number;color:string;ring:string;partyId?:string;className?:string}){
 const separator=partySeparator(color,ring);
 return <>{separator.outer&&<circle data-component-outline="" aria-hidden="true" pointerEvents="none" cx={x} cy={y} r={r} fill="none" stroke={separator.outer} strokeWidth={2} vectorEffect="non-scaling-stroke" className={className}/>}
  <circle data-component-seat={partyId} pointerEvents="none" cx={x} cy={y} r={r} fill={color} stroke={separator.inner} strokeWidth={separator.outer?1:1.5} vectorEffect="non-scaling-stroke" className={className}/></>;
}
export function PartyKey({color,ring,partyId,hover}:{color:string;ring:string;partyId?:string;hover?:boolean}){
 return <span className="component-key" data-party-key={hover?undefined:partyId} data-hover-party={hover?partyId:undefined} style={{background:color}}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx={7} cy={7} r={7} fill={ring}/><PartyDot x={7} y={7} r={4.3} color={color} ring={ring}/></svg></span>;
}
