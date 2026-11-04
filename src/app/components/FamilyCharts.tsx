import {useEffect,useId,useRef,useState} from 'react';
import {aggregate,type Family} from '../../families/model.ts';
import {familyColor,historyElections,shortFamilyName,type HistoryElection} from '../../families/runtime.ts';
import {openElection,setState} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import type {ElectionId} from '../../data/schema.ts';
export const familyDate=(d:HistoryElection,lang:'he'|'en')=>new Date(d.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{year:'numeric',month:'short',day:'numeric'});
export async function openFamilyElection(id:ElectionId,family?:Family){if(await openElection(id))setState({tool:'board',...(family?{familyView:family}:{})});}
export function FamilyCharts({families,cursor,onCursor}:{families:Family[];cursor:ElectionId;onCursor:(id:ElectionId)=>void}) {
 const L=useL();
 return <div className="family-plots">{(['share','votes'] as const).map(metric=>{
  const max=Math.max(1,...families.flatMap(f=>historyElections.map(d=>{const a=aggregate(f,d),n=Number(a.votes??0n)+Number(a.mixed??0n);return metric==='share'?n*100/d.totals.valid:n;})));
  const step=10**Math.floor(Math.log10(max))/2,top=Math.ceil(max*1.15/step)*step;
  return <section key={metric}><h3>{metric==='share'?L('Share of valid votes','שיעור הקולות הכשרים'):L('Absolute votes','מספר קולות')}</h3>{families.map(f=><Plot key={f.id} family={f} metric={metric} max={top} cursor={cursor} onCursor={onCursor}/>)}</section>;
 })}</div>;
}
function Plot({family:f,metric,max,cursor,onCursor}:{family:Family;metric:'share'|'votes';max:number;cursor:ElectionId;onCursor:(id:ElectionId)=>void}) {
 const L=useL(),lang=useLang(),ref=useRef<HTMLDivElement>(null),id=useId().replace(/:/g,''),[width,setWidth]=useState(640),[hover,setHover]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el)return;const o=new ResizeObserver(()=>setWidth(Math.max(270,el.clientWidth)));o.observe(el);setWidth(Math.max(270,el.clientWidth));return()=>o.disconnect();},[]);
 const height=width<500?240:300,left=50,right=width<500?80:110,bottom=height-38;
 const x=(d:HistoryElection)=>left+(Date.parse(d.electionDate)-Date.parse(historyElections[0].electionDate))/(Date.parse(historyElections[25].electionDate)-Date.parse(historyElections[0].electionDate))*(width-left-right);
 const value=(n:bigint,d:HistoryElection)=>metric==='share'?Number(n)*100/d.totals.valid:Number(n);
 const y=(n:bigint,d:HistoryElection)=>bottom-value(n,d)/max*(height-75);
 const data=historyElections.map(d=>aggregate(f,d));let path='';let connected=false;
 data.forEach((a,i)=>{if(a.votes===null||a.status==='did-not-contest'){connected=false;return;}path+=`${connected?'L':'M'}${x(historyElections[i])},${y(a.votes,historyElections[i])} `;connected=true;});
 const at=historyElections.findIndex(d=>d.id===cursor),d=historyElections[at],a=data[at],last=data[25],color=familyColor(f);
 const exact=(v:bigint|null,e:HistoryElection)=>v===null?L('Unknown','לא ידוע'):metric==='share'?`${value(v,e).toFixed(4)}% · ${Number(v).toLocaleString()} ${L('votes','קולות')}`:Number(v).toLocaleString();
 const text=a.status==='did-not-contest'?L('Did not contest','לא התמודדו'):exact(a.votes,d);
 const policy={'separate-segment':L('Mixed separately','מעורבות בנפרד'),'include-whole-list':L('Include whole lists','הכללת רשימות שלמות'),exclude:L('Exclude mixed lists','ללא רשימות מעורבות')}[f.defaultMixedPolicy];
 const tooltip=`${familyDate(d,lang)} · ${text}${a.mixed?` · ${L('Mixed separately','מעורבות בנפרד')}: ${exact(a.mixed,d)}`:''}${d.pending?` · ${L('Pending gazette','טרם פורסם ברשומות')}`:''} · ${policy}`;
 const ticks=width<500?[0,8,15,25]:[0,5,10,14,18,21,25];
 const label=shortFamilyName(f,lang);
 const labelLines:string[]=[];
 for(const word of label.split(' ')) {const last=labelLines.length-1;if(last>=0&&(labelLines[last]+' '+word).length<=(width<500?11:16))labelLines[last]+=' '+word;else labelLines.push(word);}
 const endY=last.votes===null?20:Math.max(25,Math.min(height-90,y(last.votes,historyElections[25])-15));

 return <div ref={ref} className="family-plot" style={{['--family-color' as string]:color}} onPointerLeave={()=>setHover(false)}>
  <svg viewBox={`0 0 ${width} ${height}`} height={height} role="group" aria-label={`${label} — ${metric==='share'?L('Vote share','שיעור קולות'):L('Votes','קולות')}`}>
   <defs><pattern id={`hatch${id}`} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke={color}/></pattern></defs>
   {[0,.25,.5,.75,1].map(t=><g key={t} className="family-axis"><path d={`M${left} ${bottom-t*(height-75)}H${width-right+8}`} className="family-grid"/><text x={left-8} y={bottom-t*(height-75)+4} textAnchor="end">{metric==='share'?`${(max*t).toFixed(0)}%`:max*t>=1000000?`${(max*t/1000000).toFixed(1)}m`:max*t>=1000?`${Math.round(max*t/1000)}k`:Math.round(max*t)}</text></g>)}
   {ticks.map(i=><g key={i} className="family-axis"><path d={`M${x(historyElections[i])} ${bottom}v6`} stroke="currentColor"/><text x={x(historyElections[i])} y={height-13} textAnchor="middle">{historyElections[i].electionDate.slice(0,4)}</text></g>)}
   <path d={path} fill="none" stroke={color} strokeWidth="2.5"/>
   <path d={`M${x(d)} 20V${bottom}`} className="family-cursor"/>
   {historyElections.map((e,i)=>{const row=data[i];const label=`${familyDate(e,lang)} · ${row.status==='did-not-contest'?L('Did not contest','לא התמודדו'):exact(row.votes,e)}${e.pending?` · ${L('Pending gazette','טרם פורסם ברשומות')}`:''} · ${policy}`;return <g key={e.id} role="link" tabIndex={cursor===e.id?0:-1} aria-label={label} onFocus={()=>{onCursor(e.id);setHover(true);}} onPointerEnter={()=>{onCursor(e.id);setHover(true);}} onClick={()=>void openFamilyElection(e.id,f)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void openFamilyElection(e.id,f);}if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const next=Math.max(0,Math.min(25,i+(event.key==='ArrowRight'?1:-1)));onCursor(historyElections[next].id);(event.currentTarget.parentElement?.querySelectorAll('[role=link]')[next] as SVGElement)?.focus();}}}>
    {row.votes!==null&&row.status!=='did-not-contest'&&<><circle cx={x(e)} cy={y(row.votes,e)} r="12" fill="transparent"/><circle cx={x(e)} cy={y(row.votes,e)} r={e.pending?5:3.5} fill={e.pending?'var(--surface)':color} stroke={color} strokeWidth="2"/></>}
    {!!row.mixed&&<rect x={x(e)-5} y={y(row.mixed,e)} width="10" height={bottom-y(row.mixed,e)} fill={`url(#hatch${id})`} stroke={color}/>}<title>{label}</title>
   </g>;})}
   {last.votes!==null&&<text className="family-end-label" x={width-right+10} y={endY} fill={color} textAnchor="start">{labelLines.slice(0,3).map((line,i)=><tspan key={i} x={width-right+10} dy={i?13:0}>{line.length>(width<500?11:17)?line.slice(0,width<500?10:16)+'…':line}{i===2&&labelLines.length>3?'…':''}</tspan>)}</text>}
  </svg>
  {hover&&<div className="family-tooltip" role="tooltip">{tooltip}</div>}
 </div>;
}
