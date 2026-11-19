import { fmtPct, fmtPctNum, PP } from '../format.ts';
import { percent, percentNum, points } from './Percentage.tsx';
import { Floating } from '../floating.tsx';
import {Fragment,useEffect,useRef,useState,type ReactNode} from 'react';
import {Info} from './ui.tsx';
import {useHoverIntent} from '../hoverIntent.ts';
import {aggregate,membership,type Family} from '../../families/model.ts';
import {familyColor,historyElections,historyListName,mixedComposition,shortFamilyName,type HistoryElection} from '../../families/runtime.ts';
import {familyEstimate} from '../../families/seatBars.ts';
import {openElection,setState,useDigits,useSetting} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import type {ElectionId} from '../../data/schema.ts';
export const familyDate=(d:HistoryElection,lang:'he'|'en')=>new Date(d.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{year:'numeric',month:'short',day:'numeric'});
export async function openFamilyElection(id:ElectionId,family?:Family){if(await openElection(id))setState({tool:'board',...(family?{familyView:family}:{})});}
type Agg=ReturnType<typeof aggregate>;
type Tr=(en:string,he:string)=>string;
/** Lists counted only inside a joint list: the line has no whole-list value to show there. */
const onlyMixed=(a:Agg)=>a.votes===0n&&!!a.mixed;
/** A point on the estimate line: any observed election, including one where the family ran only in mixed lists. */
const plotted=(a:Agg)=>a.votes!==null&&a.status==='observed';
/** One wording for every state a family can be in at one election (chart, tooltip and table share it). */
export function familyStatus(a:Agg,L:Tr):string|null {
 if(a.votes===null)return L('Unknown','לא ידוע');
 if(a.status==='none-classified')return L('No list classified','אין רשימה מסווגת');
 if(a.status==='unclassified')return L('Lists not yet classified','רשימות שטרם סווגו');
 if(a.status==='not-counted')return a.excluded?L('Only in mixed lists (left out)','רק ברשימות מעורבות (הושמטו)'):L('No list counted','אין רשימה שנספרה');
 if(onlyMixed(a))return L('Only in mixed lists','רק ברשימות מעורבות');
 return null;
}
/** Beside a total: the family has lists still under review in this election, so the total may not be all of it. */
export function reviewNote(a:Agg,L:Tr):string|null {
 return a.reviews>0&&a.status!=='unclassified'&&a.status!=='unknown'?L('Some lists not yet classified','חלק מהרשימות טרם סווגו'):null;
}
/** Round axis steps (1, 2, 2.5, 5 × 10ⁿ) so gridlines read 5/10/15/20 %, never 11/23/34 %. */
function niceScale(max:number){const raw=max/4,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw)!;const top=Math.ceil(max*1.04/step)*step;return {top,ticks:Array.from({length:Math.round(top/step)+1},(_,i)=>i*step)};}
/** "2019" or, in a year with two elections, "Apr 2019". */
export const electionYear=(e:HistoryElection,lang:'he'|'en')=>{const y=e.electionDate.slice(0,4),twice=historyElections.filter(d=>d.electionDate.startsWith(y)).length>1;return twice?new Date(e.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB',{year:'numeric',month:'short'}):y;};
/** The vote charts: how mixed lists count (`policy`, which changes these two charts only), then share and votes. */
export function FamilyCharts({families,cursor,onCursor,onInspect,policy}:{families:Family[];cursor:ElectionId;onCursor:(id:ElectionId)=>void;onInspect:(f:Family,id:ElectionId)=>void;policy?:ReactNode}) {
 const L=useL();
 const anyMixed=families.some(f=>historyElections.some(d=>!!aggregate(f,d).mixed));
 return <div className="family-plots">{policy&&<div className="family-vote-tools">{policy}</div>}{(['share','votes'] as const).map(metric=>{
  const max=Math.max(metric==='share'?1:1000,...families.flatMap(f=>historyElections.map(d=>{const a=aggregate(f,d),n=Number(a.votes??0n)+Number(a.mixed??0n);return metric==='share'?n*100/d.totals.valid:n;})));
  const scale=niceScale(max);
  return <section key={metric}><div className="family-plot-head"><h3>{metric==='share'?L('Share of valid votes','שיעור הקולות הכשרים'):L('Absolute votes','מספר קולות')} <Info title={L('Time axis','ציר הזמן')}>{L('A true time scale: each point sits on its election day, so the gaps show the time between elections (April and September 2019 almost touch). The shaded column is the election you are looking at.','ציר זמן אמיתי: כל נקודה נמצאת ביום הבחירות שלה, כך שהמרווחים מראים את הזמן שעבר בין מערכות הבחירות (אפריל וספטמבר 2019 כמעט נוגעות זו בזו). העמודה המוצללת היא הבחירות שבהן אתם צופים.')}</Info></h3>
   {anyMixed&&metric==='share'&&<p className="family-legend" style={families.length===1?{['--key' as string]:familyColor(families[0])}:undefined}><span aria-hidden><i className="family-key-line"/>{L('Estimate by seats','הערכה לפי מנדטים')}</span><span aria-hidden><i className="family-key-dashed"/>{L('Mixed lists counted whole','רשימות מעורבות במלואן')}</span><span aria-hidden><i className="family-key-mixed"/>{L('The real figure lies between','הנתון האמיתי ביניהם')}</span> <Info title={L('Estimate by seats','הערכה לפי מנדטים')}>{L('A mixed list’s votes cannot be split between its parties, so the solid line is an estimate by a rule: the family’s whole lists count in full, and each mixed list adds its votes in proportion to the family’s own elected members on it. In 2013 Likud won 20 of the 31 seats of Likud Yisrael Beiteinu, so 20/31 of that list’s votes count for the Likud lineage. A mixed list that won no seat adds nothing to the estimate. The dashed line counts every mixed list whole; the real figure lies in the shaded gap between the two lines.','קולות של רשימה מעורבת אינם מתחלקים בין מפלגותיה, ולכן הקו המלא הוא הערכה לפי כלל: רשימות שלמות של המשפחה נספרות במלואן, וכל רשימה מעורבת מוסיפה מקולותיה לפי חלקם של חברי הכנסת של המשפחה מבין הנבחרים בה. ב־2013 זכה הליכוד ב־20 מתוך 31 המנדטים של הליכוד ביתנו, ולכן 20/31 מקולות הרשימה נספרים לשושלת הליכוד. רשימה מעורבת שלא זכתה במנדט אינה מוסיפה להערכה. הקו המקווקו סופר כל רשימה מעורבת במלואה; הנתון האמיתי נמצא בשטח המוצלל שבין שני הקווים.')}</Info></p>}</div>
   {families.map(f=><Plot key={f.id} family={f} metric={metric} scale={scale} cursor={cursor} onCursor={onCursor} onInspect={onInspect}/>)}</section>;
 })}</div>;
}
function Plot({family:f,metric,scale,cursor,onCursor,onInspect}:{family:Family;metric:'share'|'votes';scale:{top:number;ticks:number[]};cursor:ElectionId;onCursor:(id:ElectionId)=>void;onInspect:(f:Family,id:ElectionId)=>void}) {
 const L=useL(),lang=useLang(),ref=useRef<HTMLDivElement>(null),[width,setWidth]=useState(640),[hover,setHover]=useState(false),hoverPopups=useSetting('hoverPopups'),digits=useDigits();
 // shared hover timing (hoverIntent.ts): a resting mouse moves the selection and opens the facts; touch and keys at once
 const intent=useHoverIntent(()=>setHover(false),hover);
 useEffect(()=>{const el=ref.current;if(!el)return;const o=new ResizeObserver(()=>setWidth(Math.max(270,el.clientWidth)));o.observe(el);setWidth(Math.max(270,el.clientWidth));return()=>o.disconnect();},[]);
 const narrow=width<500,height=narrow?240:300,left=narrow?44:50,right=narrow?78:110,bottom=height-38,top=20,max=scale.top;
 const t0=Date.parse(historyElections[0].electionDate),t1=Date.parse(historyElections[25].electionDate);
 const xAt=(t:number)=>left+(t-t0)/(t1-t0)*(width-left-right);
 const x=(d:HistoryElection)=>xAt(Date.parse(d.electionDate));
 const data=historyElections.map(d=>aggregate(f,d)),est=historyElections.map((d,i)=>plotted(data[i])?familyEstimate(f,d.id):null);
 const yv=(v:number,d:HistoryElection)=>bottom-(metric==='share'?v*100/d.totals.valid:v)/max*(bottom-top);
 // Design 2 (owner, 19 Nov 2026): the solid estimate line, the dashed line with mixed lists counted whole, the gap shaded
 let path='',upper='';const runs:number[][]=[];
 est.forEach((v,i)=>{if(!v){runs.push([]);return;}const d=historyElections[i],cont=i>0&&!!est[i-1];path+=`${cont?'L':'M'}${x(d)},${yv(v.estimate,d)} `;upper+=`${cont?'L':'M'}${x(d)},${yv(v.high,d)} `;if(!cont)runs.push([]);runs[runs.length-1].push(i);});
 const gap=runs.filter(r=>r.some(i=>est[i]!.high>est[i]!.estimate)).map(r=>[...r.map(i=>`${x(historyElections[i])},${yv(est[i]!.high,historyElections[i])}`),...[...r].reverse().map(i=>`${x(historyElections[i])},${yv(est[i]!.estimate,historyElections[i])}`)].join(' '));
 const at=historyElections.findIndex(d=>d.id===cursor),color=familyColor(f);
 const num=(v:bigint,e:HistoryElection)=>metric==='share'?<>{percent(v,e.totals.valid,digits)} · {Number(v).toLocaleString('en-US')} {L('votes','קולות')}</>:`${Number(v).toLocaleString('en-US')} ${L('votes','קולות')}`;
 const estOf=(e:HistoryElection)=>est[historyElections.indexOf(e)];
 const estimated=(e:HistoryElection)=>{const v=estOf(e);return v&&v.high>v.estimate&&v.estimate>v.low?v:null;};
 const estimateText=(e:HistoryElection)=>{const est=estimated(e);return est?`${L('Estimate by seats','הערכה לפי מנדטים')}: ${metric==='share'?fmtPctNum(est.estimate*100/e.totals.valid,digits)+' · ':''}${Math.round(est.estimate).toLocaleString('en-US')} ${L('votes','קולות')}`:null;};
 const estimateRich=(e:HistoryElection)=>{const est=estimated(e);return est?<b>{L('Estimate by seats','הערכה לפי מנדטים')}: {metric==='share'&&<>{percentNum(est.estimate*100/e.totals.valid,digits)} · </>}{Math.round(est.estimate).toLocaleString('en-US')} {L('votes','קולות')}</b>:null;};
 const describeRich=(a:Agg,e:HistoryElection)=>{const status=familyStatus(a,L);const parts: React.ReactNode[]=[familyDate(e,lang)];
  if(status)parts.push(status);const estimate=estimateRich(e);if(estimate)parts.push(estimate);if(a.votes!==null&&a.status==='observed'&&!onlyMixed(a))parts.push(<>{estimate?L('Whole lists','רשימות שלמות')+': ':''}{num(a.votes,e)}</>);
  if(a.mixed)parts.push(<>{onlyMixed(a)?'':L('Mixed lists','רשימות מעורבות')+': '}{num(a.mixed,e)}</>);
  if(a.excluded&&a.status==='observed')parts.push(`${L('Mixed lists left out','רשימות מעורבות שהושמטו')}: ${Number(a.excluded).toLocaleString('en-US')}`);
  const note=reviewNote(a,L);if(note)parts.push(note);
  if(e.pending)parts.push(L('Gazette not yet verified','הפרסום ברשומות טרם אומת'));return <>{parts.map((part,i)=><span key={i}>{i ? ' · ' : ''}{part}</span>)}</>;};
 const describe=(a:Agg,e:HistoryElection)=>{
  const num=(v:bigint)=>`${metric==='share'?fmtPct(v,e.totals.valid,digits)+' · ':''}${Number(v).toLocaleString('en-US')} ${L('votes','קולות')}`;
  const parts=[familyDate(e,lang)],status=familyStatus(a,L),estimate=estimateText(e);
  if(status)parts.push(status);if(estimate)parts.push(estimate);
  if(a.votes!==null&&a.status==='observed'&&!onlyMixed(a))parts.push(`${estimate?L('Whole lists','רשימות שלמות')+': ':''}${num(a.votes)}`);
  if(a.mixed)parts.push(`${onlyMixed(a)?'':L('Mixed lists','רשימות מעורבות')+': '}${num(a.mixed)}`);
  if(a.excluded&&a.status==='observed')parts.push(`${L('Mixed lists left out','רשימות מעורבות שהושמטו')}: ${Number(a.excluded).toLocaleString('en-US')}`);
  const note=reviewNote(a,L);if(note)parts.push(note);
  if(e.pending)parts.push(L('Gazette not yet verified','הפרסום ברשומות טרם אומת'));
  return parts.join(' · ');
 };
 const years=historyElections.map(d=>+d.electionDate.slice(0,4)),every=narrow?20:10;
 const ticks:number[]=[];for(let yr=Math.ceil(years[0]/every)*every;yr<=years[25];yr+=every)ticks.push(yr);
 const label=shortFamilyName(f,lang);
 const labelLines:string[]=[];
 for(const word of label.split(' ')) {const last=labelLines.length-1;if(last>=0&&(labelLines[last]+' '+word).length<=(narrow?10:15))labelLines[last]+=' '+word;else labelLines.push(word);}
 const lastAt=est.map((v,i)=>v?i:-1).filter(i=>i>=0).pop();
 // elections where the family's lists are not yet classified, with the line on both sides: a "?" at the height between
 const unclassified=data.flatMap((a,i)=>{if(a.status!=='unclassified')return [];const near=[i-1,i+1].filter(j=>j>=0&&j<26&&!!est[j]).map(j=>yv(est[j]!.estimate,historyElections[j]));return [{i,y:near.length?near.reduce((t,v)=>t+v,0)/near.length:bottom-10}];});
 const endY=lastAt===undefined?top+10:Math.max(top+5,Math.min(bottom-10-13*(Math.min(3,labelLines.length)-1),yv(est[lastAt]!.estimate,historyElections[lastAt])+4));
 const mid=(i:number)=>i<0?left-6:i>25?width-right+6:x(historyElections[i]);
 // the selected election's band covers its own stretch of time: halfway to the elections either side (at least 12px)
 const band=(()=>{if(at<0)return {x:0,w:0};const cx=x(historyElections[at]),a=(mid(at-1)+cx)/2,b=(cx+mid(at+1))/2;return b-a>=12?{x:a,w:b-a}:{x:cx-6,w:12};})();
 const fmtTick=(v:number)=>metric==='share'?`${+v.toFixed(1)}%`:v>=1000000?`${+(v/1000000).toFixed(2)}m`:v>=1000?`${Math.round(v/1000)}k`:String(v);

 return <div ref={ref} className="family-plot" style={{['--family-color' as string]:color}} onPointerLeave={ev=>{if(ev.pointerType!=='touch')intent.leave();if(!intent.isShown)setHover(false);}}>
  <svg viewBox={`0 0 ${width} ${height}`} height={height} role="group" aria-label={`${label} — ${metric==='share'?L('Vote share','שיעור קולות'):L('Votes','קולות')}`}>
   {scale.ticks.map(t=><g key={t} className="family-axis"><path d={`M${left} ${bottom-t/max*(bottom-top)}H${width-right+8}`} className="family-grid"/><text x={left-8} y={bottom-t/max*(bottom-top)+4} textAnchor="end">{fmtTick(t)}</text></g>)}
   {/* the selected election: a soft band over its stretch of time and its year; its value and year in bold */}
   {at>=0&&<rect className="family-selband" x={band.x} y={top-6} width={band.w} height={height-6-top} rx={3}/>}
   {ticks.map(yr=>{const tx=xAt(Date.parse(`${yr}-01-01`)),hidden=at>=0&&Math.abs(tx-x(historyElections[at]))<(narrow?34:40);return <g key={yr} className="family-axis"><path d={`M${tx} ${bottom}v5`} stroke="currentColor"/>{!hidden&&<text x={tx} y={height-13} textAnchor="middle">{yr}</text>}</g>;})}
   {at>=0&&<text className="family-axis family-sel-year" x={Math.min(width-right,Math.max(left,x(historyElections[at])))} y={height-13} textAnchor="middle">{electionYear(historyElections[at],lang)}</text>}
   {gap.map((pts,k)=><polygon key={k} className="family-gap" points={pts} fill={color}/>)}
   {upper&&<path className="family-upper" d={upper} fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="5 3.5" strokeLinejoin="round"/>}
   <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
   {/* an election whose lists are not yet classified breaks the line: the break is marked where it happens (V2 fault F3) */}
   {unclassified.map(({i,y})=>{const e=historyElections[i];return <g key={e.id} className="family-unclassified" aria-hidden><path d={`M${x(e)} ${top}V${bottom}`}/><circle cx={x(e)} cy={y} r={7}/><text x={x(e)} y={y+4} textAnchor="middle">?</text></g>;})}
   {historyElections.map((e,i)=>{const row=data[i],text=describe(row,e);return <g key={e.id} role="button" tabIndex={cursor===e.id?0:-1} aria-label={text} aria-haspopup="dialog" onFocus={()=>{intent.keep();onCursor(e.id);setHover(true);}} onPointerEnter={ev=>{if(ev.pointerType==='mouse'&&!hoverPopups)return;const show=()=>{onCursor(e.id);setHover(true);};if(ev.pointerType==='touch')show();else intent.enter(show);}} onClick={()=>onInspect(f,e.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onInspect(f,e.id);}const step={ArrowRight:1,ArrowLeft:-1,Home:-99,End:99}[event.key];if(step){event.preventDefault();const next=Math.max(0,Math.min(25,i+step));onCursor(historyElections[next].id);(event.currentTarget.parentElement?.querySelectorAll('[role=button]')[next] as SVGElement )?.focus({preventScroll:true});}}}>
    <rect x={(mid(i-1)+x(e))/2} y={top} width={Math.max(4,(mid(i+1)-mid(i-1))/2)} height={bottom-top} fill="transparent"/>
    {est[i]&&<circle cx={x(e)} cy={yv(est[i]!.estimate,e)} r={e.pending?4.5:3.5} fill={e.pending?'var(--surface)':color} stroke={color} strokeWidth="2"/>}
    <title>{text}</title>
   </g>;})}
   {at>=0&&est[at]&&(()=>{const e=historyElections[at],v=est[at]!,py=yv(v.estimate,e),estimated=v.high>v.estimate&&v.estimate>v.low;
     // an estimate reads "≈"; an exact whole-list figure reads exactly
     const text=<>{estimated?'≈':''}{metric==='share'?(estimated?percentNum(v.estimate*100/e.totals.valid,digits,{svg:true}):percent(BigInt(Math.round(v.estimate)),e.totals.valid,digits,undefined,{svg:true})):Math.round(v.estimate).toLocaleString('en-US')}</>;
     // the last point: under the family's name in the right margin, where no line runs
     if(at===lastAt)return <text className="family-sel-value" x={width-right+12} y={endY+13*(Math.min(3,labelLines.length)-1)+15} textAnchor="start" aria-hidden>{text}</text>;
     const near=[at-1,at+1].filter(i=>i>=0&&i<26&&!!est[i]).map(i=>yv(est[i]!.estimate,historyElections[i]));
     // elsewhere on the side away from the line: below a point that sits lower than its neighbours, else above; below
     // when the dashed line runs above it
     const below=py-top<18||(v.high>v.estimate&&bottom-py>22)||(near.length>0&&near.reduce((t,v)=>t+v,0)/near.length<py&&bottom-py>22);
     return <text className="family-sel-value" x={Math.min(width-right-4,Math.max(left+4,x(e)))} y={below?py+18:py-9} textAnchor={x(e)<left+30?'start':'middle'} aria-hidden>{text}</text>;})()}
   {!path&&<text className="family-empty" x={(left+width-right)/2} y={(top+bottom)/2} textAnchor="middle">{L('No lists counted in any election','לא נספרו רשימות באף מערכת בחירות')}</text>}
   {lastAt!==undefined&&<text className="family-end-label" x={width-right+12} y={endY} textAnchor="start">{labelLines.slice(0,3).map((line,i)=><tspan key={i} x={width-right+12} dy={i?13:0}>{line.length>(narrow?11:17)?line.slice(0,narrow?10:16)+'…':line}{i===2&&labelLines.length>3?'…':''}</tspan>)}</text>}
  </svg>
  {unclassified.length>0&&<p className="family-unclassified-note small muted"><b aria-hidden>?</b> {L('Lists not yet classified','רשימות שטרם סווגו')}: {unclassified.map(({i})=>electionYear(historyElections[i],lang)).join(', ')}</p>}
  {hover&&at>=0&&<Floating className="family-tooltip" anchor={() => ref.current?.querySelector(`[aria-label="${CSS.escape(describe(data[at],historyElections[at]))}"]`)?.getBoundingClientRect() ?? ref.current?.getBoundingClientRect()}><PointFacts f={f} at={at} metric={metric} text={describeRich(data[at],historyElections[at])}/></Floating>}
 </div>;
}

/** What one point is made of, from the packed runtime (no loading, so the box never grows under the pointer):
 * the change since the previous election, the counted lists, and each hatched mixed list with the family's own parties in bold. */
function PointFacts({f,at,metric,text}:{f:Family;at:number;metric:'share'|'votes';text:React.ReactNode}) {
 const digits=useDigits();
 const L=useL(),lang=useLang(),e=historyElections[at],prev=historyElections[at-1],m=membership(f,e.id);
 const votes=new Map(e.lists.map(l=>[l.id,l.votes])),byVotes=(ids:Set<string>)=>[...ids].filter(id=>votes.has(id)).sort((x,y)=>votes.get(y)!-votes.get(x)!);
 const name=(id:string)=>historyListName(e.id,id,lang);
 const now=familyEstimate(f,e.id),before=prev?familyEstimate(f,prev.id):null;
 const delta=now&&before?(metric==='share'?now.estimate*100/e.totals.valid-before.estimate*100/prev!.totals.valid:Math.round(now.estimate-before.estimate)):null;
 const sign=(n:number)=>n>0?'+':n<0?'−':'±';
 return <>
  <span>{text}</span>
  {delta!==null&&<span className="ft-delta">{L('Since','מאז')} {familyDate(prev!,lang)}: <bdi dir="ltr">{metric==='share'?points(delta,digits):<>{sign(delta)}{Math.abs(delta).toLocaleString('en-US')}</>}</bdi>{metric==='share'&&<> {L(...PP)}</>}</span>}
  {m.selected.size>0&&<span className="ft-row"><i className="family-key-line" aria-hidden/>{byVotes(m.selected).map(name).join(' · ')}</span>}
  {byVotes(m.mixed).map(id=>{const parts=mixedComposition(f,e.id,id,lang);return <span key={id} className="ft-row"><i className="family-key-mixed" aria-hidden/><span>{name(id)}{parts.length>1&&<>: {parts.map((p,i)=><Fragment key={i}>{i>0&&' + '}{p.own?<b>{p.name}</b>:p.name}</Fragment>)}</>}</span></span>;})}
  {m.excluded.size>0&&<span className="ft-row muted">{L('Left out','לא נספרו')}: {byVotes(m.excluded).map(name).join(' · ')}</span>}
  <span className="ft-hint">{L('Click for details and changes','לחיצה לפירוט ולשינויים')}</span>
 </>;
}
