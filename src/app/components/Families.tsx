import { percent as ratioPercent } from './Percentage.tsx';
import {inkOn} from '../../data/colourGuard.ts';
import { hebrewPrefix } from '../hebrewPrefix.ts';
import { useDigits } from '../store.ts';
import { SeatDelta } from './SeatDelta.tsx';
import {ChoicePicker} from './ChoicePicker.tsx';
import {lazy,Suspense,useMemo,useRef,useState} from 'react';
import type {Scenario} from '../../model/scenario.ts';
import {applyAction} from '../../model/actions.ts';
import {aggregate,fork,groupingAction,membership,resolve,scaleAction,visibility,type Family,type MixedPolicy} from '../../families/model.ts';
import {builtins,fullDefinition,importPreset,readCatalogue,writeCatalogue} from '../../families/catalogue.ts';
import {familyColor,historyElections,shortFamilyName} from '../../families/runtime.ts';
import {allocationOf} from '../derive.ts';
import {chooseSource,dispatch,motionReduced,setSetting,useSetting,useStore} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import {voteSourceLabel} from '../voteEdit.ts';
import {Feature} from './Feature.tsx';
import {Seg,Info} from './ui.tsx';
import {FamilyCharts,familyDate,familyStatus,reviewNote} from './FamilyCharts.tsx';
import {FamilySeatCharts} from './FamilySeatChart.tsx';
import {familySeatRow} from '../../families/seatBars.ts';
import './families.css';
import {useHoverIntent} from '../hoverIntent.ts';
const Editor=lazy(()=>import('./FamilyEditor.tsx').then(m=>({default:m.FamilyEditor})));
const Point=lazy(()=>import('./FamilyPoint.tsx').then(m=>({default:m.FamilyPoint})));
const Evidence=lazy(()=>import('./FamilyEvidence.tsx').then(m=>({default:m.FamilyEvidence})));
const POLICY='israel-elections:families:policy';
const POLICIES=['separate-segment','include-headed-list','include-whole-list','exclude'] as const;
/** How mixed lists are counted is a way of viewing a family, not an edit of its membership: it never forks. */
function readPolicies():Record<string,MixedPolicy>{try{const x=JSON.parse(localStorage.getItem(POLICY)??'{}');return Object.fromEntries(Object.entries(x).filter(([,v])=>(POLICIES as readonly unknown[]).includes(v))) as Record<string,MixedPolicy>;}catch{return {};}}
/** Seats of the family, its mixed lists and everyone else, as one 120-seat strip. */
function FamilySeats({s,f,label,before}:{s:Scenario;f:Family;label:string;before?:number}) {
 const L=useL(),r=allocationOf(s),fam=new Map(resolve(f,s).map(l=>[l.id,l.family]));
 const n={selected:0,mixed:0,other:0};for(const l of r.lists)n[(fam.get(l.id)??'other') as keyof typeof n]+=l.seats;
 const total=n.selected+n.mixed+n.other,delta=before===undefined?0:n.selected-before;
 return <div className="family-seats"><span>{label}</span><span className="family-seat-strip" aria-hidden style={{['--family-color' as string]:familyColor(f),['--family-ink' as string]:inkOn(familyColor(f))}}>{(['selected','mixed','other'] as const).filter(k=>n[k]>0).map(k=><i key={k} data-part={k} style={{flex:n[k]}}></i>)}<b className="family-majority" style={{insetInlineStart:`${100*(Math.floor(total/2)+1)/Math.max(1,total)}%`}}/></span>
  <span className="family-seat-count"><b>{n.selected}</b> {L('seats','מנדטים')}{n.mixed?<small> + {n.mixed} {L('mixed','מעורבות')}</small>:null}{before!==undefined&&<em data-sign={Math.sign(delta)}><bdi dir="ltr"><SeatDelta value={delta} /></bdi></em>}</span></div>;
}
export function Families({s}:{s:Scenario}) {
 const digits=useDigits(); const L=useL(),lang=useLang(),source=useStore(st=>st.voteSource);
 const [catalogue,setCatalogue]=useState(readCatalogue),[selected,setSelected]=useState<string[]>(['haredi']),[active,setActive]=useState('haredi');
 // a table row the mouse rests on moves the charts' selection, on the shared hover timing (hoverIntent.ts)
 const rowHover=useHoverIntent(()=>{},false);
 const [cursor,setCursor]=useState(s.electionId),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirmDelete,setConfirmDelete]=useState('');
 const [point,setPoint]=useState<{family:Family;electionId:Scenario['electionId']}|null>(null);
 const [policies,setPolicies]=useState(readPolicies);
 const [sheet,setSheet]=useState<'edit'|'evidence'|'manage'|'point'|null>(null),dialog=useRef<HTMLDialogElement>(null),returnFocus=useRef<HTMLElement|null>(null),importer=useRef<HTMLInputElement>(null);
 // Settings → Tables instead of charts
 const preferExact=useSetting('preferTables');
 const [exactOpen,setExactOpen]=useState(()=>preferExact||motionReduced());
 const [mode,setMode]=useState<'multiplier'|'share'>('multiplier'),[value,setValue]=useState('10');
 const view=(x:Family):Family=>policies[x.id]&&policies[x.id]!==x.defaultMixedPolicy?{...x,defaultMixedPolicy:policies[x.id]}:x;
 const all=[...builtins,...catalogue.users].map(view),chosen=selected.map(id=>all.find(f=>f.id===id)).filter((f):f is Family=>!!f&&!catalogue.hidden.includes(f.id));
 const f=chosen.find(f=>f.id===active)??chosen[0];
 const name=(f:Family)=>shortFamilyName(f,lang);
 const save=(next:typeof catalogue)=>{setCatalogue(next);try{setCatalogue(writeCatalogue(next,catalogue));setError('');}catch{setError(L('Browser storage unavailable. Export to keep your definition.','אחסון הדפדפן אינו זמין. ייצאו כדי לשמור את ההגדרה.'));}};
 /** The full evidence file with the policy the reader is viewing. */
 const definition=async(x:Family)=>({...await fullDefinition(x),defaultMixedPolicy:x.defaultMixedPolicy});
 const setPolicy=(v:MixedPolicy)=>{if(!f)return;const next={...readPolicies(),[f.id]:v};setPolicies(next);try{localStorage.setItem(POLICY,JSON.stringify(next));}catch{/* view-only preference */}};
 const edit=async(change:(f:Family)=>Family,saveNew=false)=>{
  if(!f||busy)return;setBusy(true);
  try{const full=await definition(f),copy=saveNew||full.status!=='personal';
   const personal=copy?fork(full,all.map(familyColor)):structuredClone(full);
   // A copy never wears its source's exact name: two identical chips would be indistinguishable.
   if(copy){const again=full.status==='personal';personal.labelEn=shortFamilyName(full,'en')+(again?' (copy)':' (mine)');personal.labelHe=shortFamilyName(full,'he')+(again?' (עותק)':' (שלי)');}
   const next=change(personal);next.revision=new Date().toISOString();save({...catalogue,users:[...catalogue.users.filter(x=>x.id!==next.id),next]});setSelected(ids=>ids.map(id=>id===f.id?next.id:id));setActive(next.id);}
  catch{setError(L('Could not load this definition. Nothing changed.','לא ניתן לטעון את ההגדרה. דבר לא השתנה.'));}finally{setBusy(false);}
 };
 const show=(kind:typeof sheet)=>{returnFocus.current=document.activeElement as HTMLElement;setSheet(kind);setConfirmDelete('');dialog.current?.showModal();};
 const close=()=>{dialog.current?.close();setSheet(null);returnFocus.current?.focus({preventScroll:true});};
 const toggle=(id:string)=>{setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);setActive(id);};
 const members=f?resolve(f,s).filter(l=>l.family==='selected'&&!l.withdrawn).reduce((n,l)=>n+l.votes,0):0;
 const preview=useMemo(()=>{if(!f)return null;try{const action=scaleAction(f,s,mode,value,source);return {action,after:applyAction(s,action)};}catch{return null;}},[f,s,mode,value,source]);
 const commitScale=async()=>{if(!preview||!f||busy)return;setBusy(true);try{dispatch({...preview.action,definition:await definition(f)});}catch{setError(L('Could not load this definition.','לא ניתן לטעון את ההגדרה.'));}finally{setBusy(false);}};
 const applyGrouping=async()=>{if(!f||busy)return;setBusy(true);try{const full=await definition(f);if(dispatch(groupingAction(full,s,lang))){const {setState}=await import('../store.ts');setState({tool:'board',familyView:null,blocPanel:'selected',selectedListId:null});}}catch{setError(L('Could not load this definition.','לא ניתן לטעון את ההגדרה.'));}finally{setBusy(false);}};
 const current=historyElections.find(d=>d.id===s.electionId)!;
 const policyLabel=(v:MixedPolicy)=>({'separate-segment':L('Show hatched','הצגה בקווקוו'),'include-headed-list':L('Count if family heads it','ספירה אם המשפחה בראש'),'include-whole-list':L('Count all','ספירת כולן'),exclude:L('Leave out','השמטה')}[v]);
 const exportDefinition=async()=>{if(!f)return;try{const full=await definition(f),url=URL.createObjectURL(new Blob([JSON.stringify(full,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`party-family-${full.id}.json`;a.click();URL.revokeObjectURL(url);}catch{setError(L('Could not export definition.','לא ניתן לייצא את ההגדרה.'));}};
 const removeUser=(id:string)=>{save({...catalogue,users:catalogue.users.filter(x=>x.id!==id),hidden:catalogue.hidden.filter(x=>x!==id)});setSelected(ids=>ids.filter(x=>x!==id));setConfirmDelete('');};
 const stepValue=(by:number)=>{const n=Number(value);setValue(String(Math.round(((Number.isFinite(n)?n:0)+by)*100)/100));};
 const percent=(n:number)=><bdi dir="ltr">{n>0?'+':'−'}{Math.abs(n)}%</bdi>;
 const onlyMixedNow=!!f&&members===0&&resolve(f,s).some(l=>l.family==='mixed'||membership(f,s.electionId).excluded.has(l.id));
 const unavailable=!f?'':members===0?(onlyMixedNow?L(`${name(f)} has only mixed lists in this election. Choose “Count all” under Mixed lists to scale them.`,`${hebrewPrefix('ל', name(f))} יש רק רשימות מעורבות בבחירות אלה. בחרו "ספירת כולן" ברשימות מעורבות כדי לשנות אותן.`):L(`${name(f)} has no list in this election.`,`${hebrewPrefix('ל', name(f))} אין רשימה בבחירות אלה.`))
  :mode==='multiplier'&&Number(value)<-100?L('A family cannot lose more than all its votes (−100%).','משפחה אינה יכולה לאבד יותר מכל קולותיה (‎−100%).')
  :L('Enter a number. There must be enough other votes to move.','הזינו מספר. דרושים מספיק קולות אחרים להעברה.');
 return <div className="families">
  <div className="family-top"><div className="family-chips" role="group" aria-label={L('Families to explore','משפחות לחקירה')}>{all.filter(f=>!catalogue.hidden.includes(f.id)).map(f=><button key={f.id} className="family-chip" aria-pressed={selected.includes(f.id)} onClick={()=>toggle(f.id)} style={{['--family-color' as string]:familyColor(f),['--family-ink' as string]:inkOn(familyColor(f))}} title={name(f)}><i aria-hidden/><span>{name(f)}</span></button>)}</div><button className="btn small" onClick={()=>show('manage')}>{L('Manage','ניהול')}</button></div>
  {error&&<p role="alert">{error}</p>}
  {f?<>
   <div className="family-profile"><div><h2>{chosen.length===1?name(f):L(`${chosen.length} families · shared scales`,`${chosen.length} משפחות · קנה מידה משותף`)}</h2><p className="family-definition">{chosen.length===1?(lang==='he'?f.definitionHe:f.definition)?.split('. ')[0]:L('Overlaps stay separate; totals are never added.','חפיפות מוצגות בנפרד; הסכומים אינם מחוברים.')} <button className="family-info" aria-label={L('Definition, sources and limitations','הגדרה, מקורות ומגבלות')} onClick={()=>show('evidence')}>i</button></p></div><span className="small muted">{f.status==='personal'?L('Personal copy','עותק אישי'):L('Sourced draft interpretation','פרשנות טיוטה מבוססת מקורות')}</span></div>
   <div className="family-chart-toolbar"><div className="row"><Feature id="familyEdit"><button className="btn" onClick={()=>show('edit')}>{L('Edit membership','עריכת חברות')}</button></Feature><Feature id="familyGrouping"><button className="btn" disabled={busy} onClick={()=>void applyGrouping()}>{L('Apply grouping & open Overview','החלת החלוקה ופתיחת תמונת המצב')}</button></Feature></div></div>
   {chosen.length>1&&<p className="small muted">{L('Policy and editing apply to','המדיניות והעריכה חלות על')}: <b>{name(f)}</b></p>}
   <FamilySeatCharts families={chosen} cursor={cursor} onCursor={setCursor} onInspect={(family,electionId)=>{setPoint({family,electionId});show('point');}}/>
   <FamilyCharts policy={<div className="family-policy" style={{['--family-color' as string]:familyColor(f),['--family-ink' as string]:inkOn(familyColor(f))}}><span className="family-policy-label">{L('Mixed lists','רשימות מעורבות')} <small>({L('family + other parties','משפחה + מפלגות אחרות')})</small> <Info title={L('Counting mixed lists','ספירת רשימות מעורבות')}>{L('A mixed list is one ballot shared by family parties and parties outside the family; its votes cannot be split between them. Show hatched: the line counts whole family lists only and a hatched bar shows how much mixed lists could add. Count if family heads it: a mixed list counts in full when a family party holds first place. Count all: every mixed list counts in full. Leave out: mixed lists are not counted. Edit membership can override one list.','רשימה מעורבת היא פתק אחד שמשותף למפלגות מהמשפחה ולמפלגות מחוצה לה; אי אפשר לפצל את קולותיה ביניהן. הצגה בקווקוו: הקו סופר רק רשימות שלמות של המשפחה, ועמודה מקווקוות מראה כמה הרשימות המעורבות יכולות להוסיף. ספירה אם המשפחה בראש: רשימה מעורבת נספרת במלואה כשמפלגה מהמשפחה במקום הראשון. ספירת כולן: כל רשימה מעורבת נספרת במלואה. השמטה: רשימות מעורבות אינן נספרות. בעריכת חברות אפשר לשנות רשימה אחת.')}</Info></span><span className="seg" role="group" aria-label={L('Mixed-list policy','מדיניות רשימות מעורבות')}>{POLICIES.map(v=><button key={v} type="button" aria-pressed={f.defaultMixedPolicy===v} onClick={()=>setPolicy(v)}><i className="family-policy-icon" data-policy={v} aria-hidden>{v==='include-headed-list'?'1':null}</i>{policyLabel(v)}</button>)}</span></div>} families={chosen} cursor={cursor} onCursor={setCursor} onInspect={(family,electionId)=>{setPoint({family,electionId});show('point');}}/>
   <details className="family-exact" open={exactOpen} onToggle={e=>setExactOpen(e.currentTarget.open)}><summary>{L('Exact figures (26 elections)','נתונים מדויקים (26 מערכות בחירות)')}</summary><div className="family-table"><table><thead><tr><th>{L('Election','בחירות')}</th>{chosen.map(x=><th key={x.id}>{name(x)}</th>)}<th>{L('Valid ballots','פתקים כשרים')}</th></tr></thead><tbody>{historyElections.map(d=><tr key={d.id} aria-current={d.id===cursor||undefined} onFocus={()=>setCursor(d.id)} onPointerEnter={ev=>{if(ev.pointerType==='touch')setCursor(d.id);else rowHover.enter(()=>setCursor(d.id));}} onPointerLeave={rowHover.leave}><th><button className="btn small" onClick={()=>{setPoint({family:f,electionId:d.id});show('point');}}>{familyDate(d,lang)}</button></th>{chosen.map(x=>{const a=aggregate(x,d),status=familyStatus(a,L),whole=a.votes!==null&&a.status==='observed'&&!(a.votes===0n&&a.mixed),seat=familySeatRow(x,d.id),partners=seat.partners.reduce((t,p)=>t+p.seats,0);return <td key={x.id}>{seat.status==='observed'&&<span className="family-table-seats">{seat.own===1?L('1 seat','מנדט אחד'):`${seat.own} ${L('seats','מנדטים')}`}{partners>0&&<> <bdi dir="ltr">+{partners}</bdi> {partners===1?L('partner','שותפה'):L('partners','שותפות')}</>}</span>}{status&&<span className="muted">{status}</span>}{whole&&<>{Number(a.votes).toLocaleString('en-US')} · {ratioPercent(a.votes!,d.totals.valid,digits)}</>}{!!a.mixed&&<small>{whole?`${L('Mixed lists','רשימות מעורבות')}: `:''}{Number(a.mixed).toLocaleString('en-US')} · {ratioPercent(a.mixed,d.totals.valid,digits)}</small>}{!!a.excluded&&<small>{L('Mixed lists left out','רשימות מעורבות שהושמטו')}: {Number(a.excluded).toLocaleString('en-US')}</small>}{reviewNote(a,L)&&<small>{reviewNote(a,L)}</small>}{d.pending&&<small>{L('Gazette not yet verified','הפרסום ברשומות טרם אומת')}</small>}</td>;})}<td>{d.totals.valid.toLocaleString('en-US')}</td></tr>)}</tbody></table></div><p className="small">{L('Mixed lists','רשימות מעורבות')}: {policyLabel(f.defaultMixedPolicy)} · {L('Whole ballots only; no constituent splits.','פתקים שלמים בלבד; אין פיצול למרכיבים.')}</p></details>
   <Feature id="familyScale"><section className="family-scale"><div><h3>{L('Scale this family’s votes','שינוי קולות המשפחה')}</h3><p className="small muted">{familyDate(current,lang)} · <ChoicePicker label={L('Votes come from','הקולות מגיעים מ־')} value={source.kind==='transfer'?'t':source.kind} onChange={v=>{if(v!=='t')chooseSource('family', {kind:v as 'new'|'proportional'});}} options={[{value:'proportional',label:L('Other lists','שאר הרשימות')},{value:'new',label:L('New voters','מצביעים חדשים')},...(source.kind==='transfer'?[{value:'t',label:voteSourceLabel(source,s,lang)}]:[])]}/></p></div><div className="family-scale-inputs"><Seg label={L('Scale mode','אופן השינוי')} value={mode} onChange={v=>{setMode(v);setValue(v==='share'?(100*members/Math.max(1,s.lists.reduce((n,l)=>n+l.votes,0))).toFixed(digits):'10');}} options={[{v:'multiplier',label:L('Change votes (%)','שינוי קולות (%)')},{v:'share',label:L('Target share (%)','יעד שיעור הקולות (%)')}]}/><div className="family-quick-step" role="group" aria-label={L('Family vote step','צעד קולות למשפחה')}><button className="btn" aria-label={L('Decrease scale value','הקטנת ערך השינוי')} disabled={Number(value)<=(mode==='share'?0:-100)} onClick={()=>stepValue(-1)}>−</button><input type="text" aria-label={L('Scale value','ערך השינוי')} inputMode="decimal" dir="ltr" value={value} onChange={e=>setValue(e.target.value.replace(/[−–]/g,'-').replace(/[%\s]/g,''))} aria-invalid={!preview&&members>0}/><button className="btn" aria-label={L('Increase scale value','הגדלת ערך השינוי')} disabled={mode==='share'&&Number(value)>=100} onClick={()=>stepValue(1)}>+</button></div>{<div className="quick-actions" style={{visibility:mode==='multiplier'?'visible':'hidden'}}>{[-10,-5,5,10].map(n=><button className="btn small" key={n} aria-pressed={value===String(n)} onClick={()=>setValue(String(n))}>{percent(n)}</button>)}</div>}</div>
    {preview?<div className="family-consequence"><FamilySeats s={s} f={f} label={L('Before','לפני')}/><FamilySeats s={preview.after} f={f} label={L('After','אחרי')} before={(()=>{const r=allocationOf(s),fam=new Map(resolve(f,s).map(l=>[l.id,l.family]));return r.lists.reduce((n,l)=>n+(fam.get(l.id)==='selected'?l.seats:0),0);})()}/><p role="status">{L('Family votes','קולות המשפחה')}: <bdi dir="ltr">{members.toLocaleString('en-US')} → <b>{preview.action.target.toLocaleString('en-US')}</b></bdi> · {source.kind==='new'?L('Participation changes','ההשתתפות משתנה'):L('Valid total conserved exactly','סך הכשרים נשמר בדיוק')}</p><button className="btn primary" disabled={busy} onClick={()=>void commitScale()}>{L('Apply vote scaling','החלת שינוי הקולות')}</button></div>:<p role="status" className="family-unavailable">{unavailable}</p>}
   </section></Feature>
  </>:<p>{L('Choose a family above to explore its history.','בחרו משפחה למעלה לצפייה בהיסטוריה שלה.')}</p>}
  <dialog ref={dialog} className="family-sheet" aria-label={sheet==='point'?L('Election breakdown','פירוט הבחירות'):sheet==='edit'?L('Edit membership','עריכת חברות'):sheet==='evidence'?L('Definition, sources and limitations','הגדרה, מקורות ומגבלות'):L('Manage families','ניהול משפחות')} onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onKeyDown={e=>{if(e.key==='Escape')e.stopPropagation();}}>
   <header><h2>{sheet==='point'?L('Election breakdown','פירוט הבחירות'):sheet==='edit'?L('Edit membership','עריכת חברות'):sheet==='evidence'?L('Definition, sources and limitations','הגדרה, מקורות ומגבלות'):L('Manage families','ניהול משפחות')}</h2><button className="btn" aria-label={L('Close','סגירה')} onClick={close}>×</button></header>
   <div className="family-sheet-body" aria-busy={busy}><Suspense fallback={<p role="status">{L('Loading…','טעינה…')}</p>}>
    {sheet==='point'&&point&&<Point family={all.find(x=>x.id===point.family.id)??point.family} electionId={point.electionId}/>}
    {sheet==='edit'&&f&&<Editor f={f} initialElection={s.electionId} onEdit={change=>void edit(change)} onSave={()=>void edit(x=>x,true)}/>}
    {sheet==='evidence'&&f&&<Evidence family={f}/>}
    {sheet==='manage'&&<div className="family-manage"><p className="small">{L('Shown families appear as chips. Saved in this browser only; export for backup or another device.','משפחות מסומנות מוצגות כשבבים. נשמר בדפדפן זה בלבד; ייצאו לגיבוי או למכשיר אחר.')}</p>{all.map(x=><div className="family-manage-row" key={x.id} style={{['--family-color' as string]:familyColor(x)}}><label><input type="checkbox" checked={!catalogue.hidden.includes(x.id)} onChange={e=>{save(visibility(catalogue,x.id,!e.target.checked));if(!e.target.checked)setSelected(ids=>ids.filter(id=>id!==x.id));}}/><i aria-hidden/><span>{name(x)}</span></label>{x.status==='personal'&&(confirmDelete===x.id?<span className="row"><button className="btn small danger" onClick={()=>removeUser(x.id)}>{L('Delete permanently','מחיקה לצמיתות')}</button><button className="btn small" onClick={()=>setConfirmDelete('')}>{L('Keep','השארה')}</button></span>:<button className="btn small" aria-label={L(`Delete ${name(x)}`,`מחיקת ${name(x)}`)} onClick={()=>setConfirmDelete(x.id)}>{L('Delete','מחיקה')}</button>)}</div>)}
     <label><input type="checkbox" checked={preferExact} onChange={e=>{setSetting('preferTables',e.target.checked);setExactOpen(e.target.checked);}}/>{L('Tables instead of charts','טבלאות במקום תרשימים')}</label>
     <div className="row"><button className="btn" disabled={!f} onClick={()=>void exportDefinition()}>{f?L(`Export “${name(f)}”`,`ייצוא "${name(f)}"`):L('Export definition','ייצוא הגדרה')}</button><button className="btn" onClick={()=>importer.current?.click()}>{L('Import family JSON…','ייבוא משפחה מקובץ JSON…')}</button><input ref={importer} hidden type="file" accept="application/json,.json" aria-label={L('Import family JSON','ייבוא משפחה מקובץ JSON')} onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>2000000)throw Error();const x=fork(await importPreset(await file.text()),all.map(familyColor));save({...catalogue,users:[...catalogue.users,x]});setSelected([x.id]);setActive(x.id);close();}catch{setError(L('Invalid family file. Nothing imported.','קובץ המשפחה אינו תקין. דבר לא יובא.'));}finally{e.target.value='';}}}/></div>
    </div>}
   </Suspense></div>
  </dialog>
 </div>;
}
