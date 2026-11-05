import { Floating } from '../floating.tsx';
import {useEffect,useId,useRef,useState} from 'react';
import {aggregate,type Family} from '../../families/model.ts';
import {familyColor,historyElections,shortFamilyName,type HistoryElection} from '../../families/runtime.ts';
import {openElection,setState} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import type {ElectionId} from '../../data/schema.ts';
export const familyDate=(d:HistoryElection,lang:'he'|'en')=>new Date(d.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{year:'numeric',month:'short',day:'numeric'});
export async function openFamilyElection(id:ElectionId,family?:Family){if(await openElection(id))setState({tool:'board',...(family?{familyView:family}:{})});}
type Agg=ReturnType<typeof aggregate>;
type Tr=(en:string,he:string)=>string;
/** Lists counted only inside a joint list: the line has no whole-list value to show there. */
const onlyMixed=(a:Agg)=>a.votes===0n&&!!a.mixed;
const drawn=(a:Agg)=>a.votes!==null&&a.status==='observed'&&!onlyMixed(a);
/** One wording for every state a family can be in at one election (chart, tooltip and table share it). */
export function familyStatus(a:Agg,L:Tr):string|null {
 if(a.votes===null)return L('Unknown','לא ידוע');
 if(a.status==='did-not-contest')return L('Did not contest','לא התמודדו');
 if(a.status==='not-counted')return a.excluded?L('Only in mixed lists (excluded)','רק ברשימות מעורבות (לא נכללות)'):L('No list counted','אין רשימה שנספרה');
 if(onlyMixed(a))return L('Only in mixed lists','רק ברשימות מעורבות');
 return null;
}
/** Round axis steps (1, 2, 2.5, 5 × 10ⁿ) so gridlines read 5/10/15/20 %, never 11/23/34 %. */
function niceScale(max:number){const raw=max/4,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw)!;const top=Math.ceil(max*1.04/step)*step;return {top,ticks:Array.from({length:Math.round(top/step)+1},(_,i)=>i*step)};}
export function FamilyCharts({families,cursor,onCursor}:{families:Family[];cursor:ElectionId;onCursor:(id:ElectionId)=>void}) {
 const L=useL();
 const anyMixed=families.some(f=>historyElections.some(d=>!!aggregate(f,d).mixed));
 return <div className="family-plots">{(['share','votes'] as const).map(metric=>{
  const max=Math.max(metric==='share'?1:1000,...families.flatMap(f=>historyElections.map(d=>{const a=aggregate(f,d),n=Number(a.votes??0n)+Number(a.mixed??0n);return metric==='share'?n*100/d.totals.valid:n;})));
  const scale=niceScale(max);
  return <section key={metric}><div className="family-plot-head"><h3>{metric==='share'?L('Share of valid votes','שיעור הקולות הכשרים'):L('Absolute votes','מספר קולות')}</h3>
   {anyMixed&&metric==='share'&&<p className="family-legend" aria-hidden><span><i className="family-key-line"/>{L('Whole lists','רשימות שלמות')}</span><span><i className="family-key-mixed"/>{L('Mixed lists (up to)','רשימות מעורבות (עד)')}</span></p>}</div>
   {families.map(f=><Plot key={f.id} family={f} metric={metric} scale={scale} cursor={cursor} onCursor={onCursor}/>)}</section>;
 })}</div>;
}
function Plot({family:f,metric,scale,cursor,onCursor}:{family:Family;metric:'share'|'votes';scale:{top:number;ticks:number[]};cursor:ElectionId;onCursor:(id:ElectionId)=>void}) {
 const L=useL(),lang=useLang(),ref=useRef<HTMLDivElement>(null),id=useId().replace(/:/g,''),[width,setWidth]=useState(640),[hover,setHover]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el)return;const o=new ResizeObserver(()=>setWidth(Math.max(270,el.clientWidth)));o.observe(el);setWidth(Math.max(270,el.clientWidth));return()=>o.disconnect();},[]);
 const narrow=width<500,height=narrow?240:300,left=narrow?44:50,right=narrow?78:110,bottom=height-38,top=20,max=scale.top;
 const t0=Date.parse(historyElections[0].electionDate),t1=Date.parse(historyElections[25].electionDate);
 const xAt=(t:number)=>left+(t-t0)/(t1-t0)*(width-left-right);
 const x=(d:HistoryElection)=>xAt(Date.parse(d.electionDate));
 const value=(n:bigint,d:HistoryElection)=>metric==='share'?Number(n)*100/d.totals.valid:Number(n);
 const y=(n:bigint,d:HistoryElection)=>bottom-value(n,d)/max*(bottom-top);
 const data=historyElections.map(d=>aggregate(f,d));let path='';let connected=false;
 data.forEach((a,i)=>{if(!drawn(a)){connected=false;return;}path+=`${connected?'L':'M'}${x(historyElections[i])},${y(a.votes!,historyElections[i])} `;connected=true;});
 const at=historyElections.findIndex(d=>d.id===cursor),color=familyColor(f);
 const num=(v:bigint,e:HistoryElection)=>metric==='share'?`${value(v,e).toFixed(2)}% · ${Number(v).toLocaleString()} ${L('votes','קולות')}`:`${Number(v).toLocaleString()} ${L('votes','קולות')}`;
 const describe=(a:Agg,e:HistoryElection)=>{const status=familyStatus(a,L);const parts=[familyDate(e,lang)];
  if(status)parts.push(status);if(a.votes!==null&&a.status==='observed'&&!onlyMixed(a))parts.push(num(a.votes,e));
  if(a.mixed)parts.push(`${onlyMixed(a)?'':L('Mixed lists','רשימות מעורבות')+': '}${num(a.mixed,e)}`);
  if(a.excluded&&a.status==='observed')parts.push(`${L('Mixed lists excluded','רשימות מעורבות שלא נכללו')}: ${Number(a.excluded).toLocaleString()}`);
  if(e.pending)parts.push(L('Gazette unverified','הפרסום ברשומות לא אומת'));return parts.join(' · ');};
 const years=historyElections.map(d=>+d.electionDate.slice(0,4)),every=narrow?20:10;
 const ticks:number[]=[];for(let yr=Math.ceil(years[0]/every)*every;yr<=years[25];yr+=every)ticks.push(yr);
 const label=shortFamilyName(f,lang);
 const labelLines:string[]=[];
 for(const word of label.split(' ')) {const last=labelLines.length-1;if(last>=0&&(labelLines[last]+' '+word).length<=(narrow?10:15))labelLines[last]+=' '+word;else labelLines.push(word);}
 const lastAt=data.map((a,i)=>drawn(a)?i:-1).filter(i=>i>=0).pop();
 const endY=lastAt===undefined?top+10:Math.max(top+5,Math.min(bottom-10-13*(Math.min(3,labelLines.length)-1),y(data[lastAt].votes!,historyElections[lastAt])+4));
 const mid=(i:number)=>i<0?left-6:i>25?width-right+6:x(historyElections[i]);
 const fmtTick=(v:number)=>metric==='share'?`${+v.toFixed(1)}%`:v>=1000000?`${+(v/1000000).toFixed(2)}m`:v>=1000?`${Math.round(v/1000)}k`:String(v);

 return <div ref={ref} className="family-plot" style={{['--family-color' as string]:color}} onPointerLeave={()=>setHover(false)}>
  <svg viewBox={`0 0 ${width} ${height}`} height={height} role="group" aria-label={`${label} — ${metric==='share'?L('Vote share','שיעור קולות'):L('Votes','קולות')}`}>
   <defs><pattern id={`hatch${id}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V5" stroke={color} strokeWidth="1.6"/></pattern></defs>
   {scale.ticks.map(t=><g key={t} className="family-axis"><path d={`M${left} ${bottom-t/max*(bottom-top)}H${width-right+8}`} className="family-grid"/><text x={left-8} y={bottom-t/max*(bottom-top)+4} textAnchor="end">{fmtTick(t)}</text></g>)}
   {ticks.map(yr=><g key={yr} className="family-axis"><path d={`M${xAt(Date.parse(`${yr}-01-01`))} ${bottom}v5`} stroke="currentColor"/><text x={xAt(Date.parse(`${yr}-01-01`))} y={height-13} textAnchor="middle">{yr}</text></g>)}
   {at>=0&&<path d={`M${x(historyElections[at])} ${top}V${bottom}`} className="family-cursor"/>}
   {historyElections.map((e,i)=>{const row=data[i];if(!row.mixed)return null;const base=row.votes??0n,h=y(base,e)-y(base+row.mixed,e);
    return <rect key={e.id} className="family-mixed" x={x(e)-3.5} y={y(base+row.mixed,e)} width="7" height={Math.max(1,h)} fill={`url(#hatch${id})`} stroke={color}/>;})}
   <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
   {historyElections.map((e,i)=>{const row=data[i],text=describe(row,e);return <g key={e.id} role="link" tabIndex={cursor===e.id?0:-1} aria-label={text} onFocus={()=>{onCursor(e.id);setHover(true);}} onPointerEnter={()=>{onCursor(e.id);setHover(true);}} onClick={()=>void openFamilyElection(e.id,f)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void openFamilyElection(e.id,f);}const step={ArrowRight:1,ArrowLeft:-1,Home:-99,End:99}[event.key];if(step){event.preventDefault();const next=Math.max(0,Math.min(25,i+step));onCursor(historyElections[next].id);(event.currentTarget.parentElement?.querySelectorAll('[role=link]')[next] as SVGElement)?.focus();}}}>
    <rect x={(mid(i-1)+x(e))/2} y={top} width={Math.max(4,(mid(i+1)-mid(i-1))/2)} height={bottom-top} fill="transparent"/>
    {drawn(row)&&<circle cx={x(e)} cy={y(row.votes!,e)} r={e.pending?4.5:3.5} fill={e.pending?'var(--surface)':color} stroke={color} strokeWidth="2"/>}
    <title>{text}</title>
   </g>;})}
   {!path&&!data.some(a=>a.mixed)&&<text className="family-empty" x={(left+width-right)/2} y={(top+bottom)/2} textAnchor="middle">{L('No lists counted in any election','לא נספרו רשימות באף מערכת בחירות')}</text>}
   {lastAt!==undefined&&<text className="family-end-label" x={width-right+12} y={endY} textAnchor="start">{labelLines.slice(0,3).map((line,i)=><tspan key={i} x={width-right+12} dy={i?13:0}>{line.length>(narrow?11:17)?line.slice(0,narrow?10:16)+'…':line}{i===2&&labelLines.length>3?'…':''}</tspan>)}</text>}
  </svg>
  {hover&&at>=0&&<Floating className="family-tooltip" anchor={() => ref.current?.querySelector(`[aria-label="${CSS.escape(describe(data[at],historyElections[at]))}"]`)?.getBoundingClientRect() ?? ref.current?.getBoundingClientRect()}>{describe(data[at],historyElections[at])}</Floating>}
 </div>;
}
