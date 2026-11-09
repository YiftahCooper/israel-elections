import {Fragment,useEffect,useId,useRef,useState} from 'react';
import {Floating} from '../floating.tsx';
import {useHoverIntent} from '../hoverIntent.ts';
import {englishLabel} from '../../data/names.ts';
import {aggregate,type Family} from '../../families/model.ts';
import {familyColor,historyElections,historyListName,shortFamilyName,type HistoryElection} from '../../families/runtime.ts';
import {familySeatRow,seatAxis,stackBar,type FamilySeatRow,type SeatPart} from '../../families/seatBars.ts';
import {partyDisplayColor} from '../partyDisplayColor.ts';
import {useSetting} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import {Info} from './ui.tsx';
import {familyDate,familyStatus} from './FamilyCharts.tsx';
import type {ElectionId} from '../../data/schema.ts';

const PARTNERS='israel-elections:families:partners';
const UNRECORDED='#8a929b';
const readPartners=()=>{try{return localStorage.getItem(PARTNERS)!=='off';}catch{return true;}};
type Tr=(en:string,he:string)=>string;
export const partnerColor=(p:SeatPart)=>p.kind==='unrecorded'||!p.partyId?UNRECORDED:partyDisplayColor({id:p.listId,color:UNRECORDED,parties:[{id:p.partyId,...(p.color?{color:p.color}:{})}]},p.partyId);
const partnerName=(p:SeatPart,lang:'he'|'en',L:Tr)=>p.kind==='unrecorded'?L('Party not recorded','מפלגה לא מתועדת'):lang==='en'?englishLabel(p.nameEn,p.nameHe):p.nameHe;
const year=(e:HistoryElection,lang:'he'|'en')=>{const y=e.electionDate.slice(0,4),twice=historyElections.filter(d=>d.electionDate.startsWith(y)).length>1;return twice?new Date(e.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{year:'numeric',month:'short'}):y;};
const seatsWord=(n:number,L:Tr)=>n===1?L('1 seat','מנדט אחד'):`${n} ${L('seats','מנדטים')}`;
/** Exact words for one segment: party, seats, list and year. */
function segmentText(p:SeatPart,e:HistoryElection,lang:'he'|'en',L:Tr){return `${partnerName(p,lang,L)}: ${seatsWord(p.seats,L)} · ${historyListName(e.id,p.listId,lang)} · ${year(e,lang)}`;}

/** Seats won at each of the 26 elections, one bar per election, with the partners elected on the family's joint lists
 * stacked above its own seats (smallest first). The scale follows the family's own seats; taller bars fade out at the top. */
export function FamilySeatCharts({families,cursor,onCursor,onInspect}:{families:Family[];cursor:ElectionId;onCursor:(id:ElectionId)=>void;onInspect:(f:Family,id:ElectionId)=>void}) {
 const L=useL(),[show,setShow]=useState(readPartners);
 const rows=families.map(f=>historyElections.map(e=>familySeatRow(f,e.id)));
 const axis=seatAxis(Math.max(...rows.flat().map(r=>r.own)));
 const anyPartners=rows.flat().some(r=>r.partners.length>0);
 const toggle=(on:boolean)=>{setShow(on);try{localStorage.setItem(PARTNERS,on?'on':'off');}catch{/* a view preference only */}};
 return <section className="family-seat-section" style={families.length===1?{['--family-color' as string]:familyColor(families[0])}:undefined}>
  <div className="family-plot-head"><h3>{L('Seats won','מנדטים')} <Info title={L('Seats and partners','מנדטים ומפלגות שותפות')}>{L('Counted from each elected member’s party, so nothing is estimated. Solid: the family’s own seats. Striped, above: the other parties elected on the same joint list, smallest first, in their own colours. A bar taller than the chart fades out at the top; the numbers above it are exact (own seats, then +partners). Bars are elections, evenly spaced: this is not a time scale, since Knessets last different lengths. The shaded column is the election you are looking at.','נספר לפי המפלגה של כל נבחר ונבחרת, כך ששום דבר אינו מוערך. מלא: המנדטים של המשפחה עצמה. מפוספס, מעל: המפלגות האחרות שנבחרו באותה רשימה משותפת, מהקטנה לגדולה, כל אחת בצבעה. עמודה גבוהה מהתרשים נמוגה למעלה; המספרים שמעליה מדויקים (מנדטי המשפחה, ואחריהם +השותפות). העמודות הן מערכות בחירות, במרווחים שווים: זה אינו ציר זמן, כי משך כל כנסת שונה. העמודה המוצללת היא הבחירות שבהן אתם צופים.')}</Info></h3>
   <div className="family-seat-tools">{show&&anyPartners&&<p className="family-legend" aria-hidden><span><i className="family-key-own"/>{L('Own seats','מנדטי המשפחה')}</span><span><i className="family-key-partner"/>{L('Partners on a joint list','שותפות ברשימה משותפת')}</span></p>}
    <label className="switch small"><input type="checkbox" role="switch" checked={show} onChange={e=>toggle(e.target.checked)}/>{L('Show partners','הצגת מפלגות שותפות')}</label></div></div>
  {families.map((f,i)=><SeatPlot key={f.id} family={f} rows={rows[i]} axis={axis} partners={show} named={families.length>1} cursor={cursor} onCursor={onCursor} onInspect={onInspect}/>)}
 </section>;
}

type Active={bar:number;seg:number|null};
function SeatPlot({family:f,rows,axis,partners:show,named,cursor,onCursor,onInspect}:{family:Family;rows:FamilySeatRow[];axis:{top:number;ticks:number[]};partners:boolean;named:boolean;cursor:ElectionId;onCursor:(id:ElectionId)=>void;onInspect:(f:Family,id:ElectionId)=>void}) {
 const L=useL(),lang=useLang(),ref=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null),id=useId().replace(/:/g,''),hoverPopups=useSetting('hoverPopups');
 const [width,setWidth]=useState(640),[active,setActive]=useState<Active|null>(null),touch=useRef(false),shown=useRef(false);
 // shared hover timing (hoverIntent.ts): a resting mouse opens the facts; tap, click and keys open them at once
 const intent=useHoverIntent(()=>setActive(null),!!active);
 useEffect(()=>{const el=ref.current;if(!el)return;const o=new ResizeObserver(()=>setWidth(Math.max(270,el.clientWidth)));o.observe(el);setWidth(Math.max(270,el.clientWidth));return()=>o.disconnect();},[]);
 const narrow=width<500,height=narrow?240:300,left=narrow?30:38,right=10,top=narrow?28:30,bottom=height-(narrow?34:38),plot=bottom-top;
 const headroom=narrow?44:56,fade=narrow?30:40,color=familyColor(f),n=historyElections.length;
 const slot=(width-left-right)/n,barW=Math.min(34,Math.max(3,slot*.66)),cx=(i:number)=>left+slot*(i+.5);
 const labels=slot>=26,yearEvery=Math.max(1,Math.ceil(30/slot));
 const at=historyElections.findIndex(d=>d.id===cursor);
 const geometry={plot,headroom,fade,axisTop:axis.top,minSlice:4};
 const Y=(px:number)=>bottom-px;
 const colours=[...new Set(rows.flatMap(r=>r.partners.map(partnerColor)))];
 const pattern=(c:string)=>`${id}p${colours.indexOf(c)}`;
 const label=shortFamilyName(f,lang);
 const status=(r:FamilySeatRow,e:HistoryElection)=>r.status==='unknown'?L('Unknown','לא ידוע'):r.status==='none'?familyStatus(aggregate(f,e),L):null;
 const partnerTotal=(r:FamilySeatRow)=>r.partners.reduce((t,p)=>t+p.seats,0);
 const barText=(r:FamilySeatRow,e:HistoryElection)=>{const s=status(r,e),p=partnerTotal(r);return [familyDate(e,lang),label,s??seatsWord(r.own,L),...(!s&&show&&p?[`${L('Partners on joint lists','שותפות ברשימות משותפות')}: +${p}`]:[])].join(' · ');};
 const ownText=(r:FamilySeatRow,e:HistoryElection)=>`${label}: ${seatsWord(r.own,L)} · ${r.ownLists.filter(l=>l.seats>0).map(l=>historyListName(e.id,l.listId,lang)).join(', ')||L('no list won seats','אף רשימה לא זכתה במנדטים')} · ${year(e,lang)}`;
 const focusAt=(bar:number,seg:number|null)=>{const el=svg.current?.querySelector<SVGElement>(seg===null?`[data-bar="${bar}"]`:`[data-bar="${bar}"][data-seg="${seg}"]`);el?.focus({preventScroll:true});};
 const segCount=(r:FamilySeatRow)=>r.status!=='observed'?0:1+(show?r.partners.length:0);
 const keys=(i:number,seg:number|null)=>(event:React.KeyboardEvent)=>{
  const r=rows[i];
  if(event.key==='Enter'||event.key===' '){event.preventDefault();onInspect(f,historyElections[i].id);return;}
  if(event.key==='Escape'&&seg!==null){event.preventDefault();focusAt(i,null);return;}
  if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();const c=segCount(r);if(!c)return;const up=event.key==='ArrowUp';const next=seg===null?(up?0:null):up?Math.min(c-1,seg+1):seg-1<0?null:seg-1;focusAt(i,next);return;}
  const step={ArrowRight:1,ArrowLeft:-1,Home:-99,End:99}[event.key];
  if(step){event.preventDefault();const next=Math.max(0,Math.min(n-1,i+step));onCursor(historyElections[next].id);focusAt(next,null);}
 };
 const enter=(i:number,seg:number|null)=>(ev:React.PointerEvent)=>{touch.current=ev.pointerType==='touch';if(ev.pointerType==='touch'||ev.pointerType==='mouse'&&!hoverPopups)return;intent.enter(()=>{onCursor(historyElections[i].id);setActive({bar:i,seg});});};
 // Touch: the first tap shows the facts, a second tap on the same place opens the election's details.
 const click=(i:number,seg:number|null)=>()=>{if(touch.current&&!shown.current){setActive({bar:i,seg});onCursor(historyElections[i].id);return;}onInspect(f,historyElections[i].id);};
 const focus=(i:number,seg:number|null)=>()=>{intent.keep();onCursor(historyElections[i].id);setActive({bar:i,seg});};
 const handlers=(i:number,seg:number|null)=>({onPointerEnter:enter(i,seg),onPointerDown:(ev:React.PointerEvent)=>{touch.current=ev.pointerType==='touch';shown.current=!!active&&active.bar===i&&active.seg===seg;},onClick:click(i,seg),onFocus:focus(i,seg),onKeyDown:keys(i,seg),'aria-haspopup':'dialog' as const});
 const fmtYear=(i:number)=>{const e=historyElections[i],y=e.electionDate.slice(0,4);return y;};
 const month=(e:HistoryElection)=>historyElections.filter(d=>d.electionDate.slice(0,4)===e.electionDate.slice(0,4)).length>1?new Date(e.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{month:'short'}):'';
 const anchor=()=>{if(!active)return ref.current?.getBoundingClientRect();const el=svg.current?.querySelector(active.seg===null?`[data-bar="${active.bar}"]`:`[data-bar="${active.bar}"][data-seg="${active.seg}"]`);return el?.getBoundingClientRect()??ref.current?.getBoundingClientRect();};
 return <div ref={ref} className="family-plot family-seat-plot" style={{['--family-color' as string]:color}} onPointerLeave={ev=>{if(ev.pointerType!=='touch')intent.leave();if(!intent.isShown)setActive(null);}}>
  {named&&<p className="family-seat-name"><i aria-hidden/>{label}</p>}
  <svg ref={svg} viewBox={`0 0 ${width} ${height}`} height={height} role="group" aria-label={`${label} — ${L('Seats won','מנדטים')}`} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setActive(null);}}>
   <defs>
    {colours.map(c=><pattern key={c} id={pattern(c)} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill={c}/><rect width="2" height="6" fill="#fff"/></pattern>)}
    <linearGradient id={`${id}fade`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={top+fade}><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#fff" stopOpacity="1"/></linearGradient>
    <mask id={`${id}mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}><rect x="0" y={top} width={width} height={height-top} fill={`url(#${id}fade)`}/></mask>
   </defs>
   {axis.ticks.map(t=>{const y=Y(t/axis.top*(plot-headroom));return <g key={t} className="family-axis"><path d={`M${left} ${y}H${width-right}`} className="family-grid"/><text x={left-6} y={y+4} textAnchor="end">{t}</text></g>;})}
   {/* the selected election: a soft band behind its column and its year; its value and year in bold */}
   {at>=0&&<rect className="family-selband" x={cx(at)-slot/2+0.5} y={top-6} width={Math.max(1,slot-1)} height={plot+6+(labels&&month(historyElections[at])?31:20)} rx={3}/>}
   {historyElections.map((e,i)=>{const sel=i===at,regular=i%yearEvery===0||i===n-1&&(n-1)%yearEvery>=yearEvery/2;
    if(!sel&&(!regular||at>=0&&Math.abs(i-at)*slot<30))return null;
    return <g key={e.id} className="family-axis"><text x={cx(i)} y={bottom+15} textAnchor="middle" className={sel?'family-sel-year':undefined}>{fmtYear(i)}</text>{labels&&month(e)&&<text x={cx(i)} y={bottom+27} textAnchor="middle" className={`family-seat-month ${sel?'family-sel-year':''}`}>{month(e)}</text>}</g>;})}
   {historyElections.map((e,i)=>{
    const r=rows[i],parts=show?r.partners:[],lay=stackBar(r.own,parts.map(p=>p.seats),geometry),x=cx(i)-barW/2,s=status(r,e);
    const drawnTop=Math.max(lay.own,...lay.parts.map(p=>p.y1)),p=partnerTotal(r),isActive=active?.bar===i;
    const segs=parts.map((pt,j)=>({pt,box:lay.parts[j]}));
    return <g key={e.id} className="family-seat-bar" data-active={isActive||undefined}>
     <rect data-bar={i} role="button" tabIndex={cursor===e.id?0:-1} aria-label={barText(r,e)} className="family-seat-hit" x={cx(i)-slot/2} y={top-(narrow?20:26)} width={slot} height={plot+(narrow?20:26)} fill="transparent" {...handlers(i,null)}/>
     {r.status==='observed'&&lay.own>0&&<rect data-bar={i} data-seg="0" role="button" tabIndex={-1} aria-label={ownText(r,e)} className="family-seat-own" x={x} y={Y(lay.own)} width={barW} height={lay.own} fill={color} data-on={isActive&&active?.seg===0||undefined} {...handlers(i,0)}/>}
     {segs.length>0&&<g mask={lay.clipped?`url(#${id}mask)`:undefined} className="family-seat-partners">{segs.map(({pt,box},j)=><rect key={j} data-bar={i} data-seg={j+1} role="button" tabIndex={-1} aria-label={segmentText(pt,e,lang,L)} className="family-seat-partner" x={x} y={Y(box.y1)} width={barW} height={Math.max(0,box.y1-box.y0)} fill={`url(#${pattern(partnerColor(pt))})`} data-on={isActive&&active?.seg===j+1||undefined} {...handlers(i,j+1)}/>)}</g>}
     {/* hairlines between partners keep two partners of the same colour apart, without taking from either */}
     {segs.slice(1).map(({box},j)=>box.y1-box.y0>=4&&segs[j].box.y1-segs[j].box.y0>=4?<path key={j} d={`M${x} ${Y(box.y0)}h${barW}`} className="family-seat-gap" mask={lay.clipped?`url(#${id}mask)`:undefined}/>:null)}
     {(labels||isActive||cursor===e.id)&&<text className={`family-seat-label ${cursor===e.id?'sel':''}`} data-status={s?"":undefined} x={cx(i)} y={Y(Math.min(drawnTop,plot))-(show&&p?16:5)} textAnchor="middle" aria-hidden>{s?(r.status==='unknown'?'?':'–'):r.own}</text>}
     {(labels||isActive||cursor===e.id)&&!s&&show&&p>0&&<text className="family-seat-plus" x={cx(i)} y={Y(Math.min(drawnTop,plot))-4} textAnchor="middle" aria-hidden>+{p}</text>}
    </g>;})}
   <path d={`M${left} ${bottom}H${width-right}`} className="family-seat-base"/>
  </svg>
  {active&&<Floating className="family-tooltip family-seat-tooltip" anchor={anchor}><SeatFacts f={f} row={rows[active.bar]} e={historyElections[active.bar]} seg={active.seg} show={show} status={status(rows[active.bar],historyElections[active.bar])} touch={touch.current}/></Floating>}
 </div>;
}

/** The bar's facts: own seats by list and every partner with its seats and list; the pointed segment leads. */
function SeatFacts({f,row:r,e,seg,show,status,touch}:{f:Family;row:FamilySeatRow;e:HistoryElection;seg:number|null;show:boolean;status:string|null;touch:boolean}) {
 const L=useL(),lang=useLang(),label=shortFamilyName(f,lang),p=r.partners.reduce((t,x)=>t+x.seats,0);
 const lead=seg===null||status?null:seg===0?<><b>{label}: {seatsWord(r.own,L)}</b></>:<><b>{partnerName(r.partners[seg-1],lang,L)}: {seatsWord(r.partners[seg-1].seats,L)}</b> · {historyListName(e.id,r.partners[seg-1].listId,lang)}</>;
 return <>
  <span>{familyDate(e,lang)} · {label}</span>
  {lead&&<span className="ft-delta">{lead}</span>}
  {status?<span>{status}</span>:<>
   <span className="ft-row" data-on={seg===0||undefined}><i className="family-key-own" aria-hidden/><span><b>{seatsWord(r.own,L)}</b>{r.ownLists.some(l=>l.seats>0)&&<> · {r.ownLists.filter(l=>l.seats>0).map((l,i)=><Fragment key={l.listId}>{i>0&&', '}{historyListName(e.id,l.listId,lang)}{r.ownLists.filter(x=>x.seats>0).length>1&&<> {l.seats}</>}</Fragment>)}</>}</span></span>
   {show&&p>0&&<><span className="ft-sub">{L('Partners on joint lists','שותפות ברשימות משותפות')}: +{p}</span>
    {r.partners.map((x,i)=><span key={i} className="ft-row" data-on={seg===i+1||undefined}><i className="family-key-partner" style={{['--partner' as string]:partnerColor(x)}} aria-hidden/><span>{partnerName(x,lang,L)} <b>{x.seats}</b> · {historyListName(e.id,x.listId,lang)}</span></span>)}</>}
  </>}
  {e.pending&&<span>{L('Gazette not yet verified','הפרסום ברשומות טרם אומת')}</span>}
  <span className="ft-hint">{touch?L('Tap again for details','הקשה נוספת לפירוט'):L('Click for details and changes','לחיצה לפירוט ולשינויים')}</span>
 </>;
}
