import {lazy,Suspense,useMemo,useRef,useState} from 'react';
import type {Scenario} from '../../model/scenario.ts';
import {applyAction} from '../../model/actions.ts';
import {aggregate,fork,groupingAction,resolve,scaleAction,visibility,type Family,type MixedPolicy} from '../../families/model.ts';
import {builtins,fullDefinition,importPreset,readCatalogue,writeCatalogue} from '../../families/catalogue.ts';
import {familyColor,historyElections,shortFamilyName} from '../../families/runtime.ts';
import {dispatch,useStore} from '../store.ts';
import {useL,useLang} from '../i18n.ts';
import {voteSourceLabel} from '../voteEdit.ts';
import {Feature} from './Feature.tsx';
import {Seg} from './ui.tsx';
import {ResultPreview} from './ResultPreview.tsx';
import {FamilyCharts,familyDate,openFamilyElection} from './FamilyCharts.tsx';
import './families.css';
const Editor=lazy(()=>import('./FamilyEditor.tsx').then(m=>({default:m.FamilyEditor})));
const Evidence=lazy(()=>import('./FamilyEvidence.tsx').then(m=>({default:m.FamilyEvidence})));
const EXACT='israel-elections:families:exact';
export function Families({s}:{s:Scenario}) {
 const L=useL(),lang=useLang(),source=useStore(st=>st.voteSource);
 const [catalogue,setCatalogue]=useState(readCatalogue),[selected,setSelected]=useState<string[]>(['haredi']),[active,setActive]=useState('haredi');
 const [cursor,setCursor]=useState(s.electionId),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [sheet,setSheet]=useState<'edit'|'evidence'|'manage'|null>(null),dialog=useRef<HTMLDialogElement>(null),returnFocus=useRef<HTMLElement|null>(null);
 const [preferExact,setPreferExact]=useState(()=>{try{return localStorage.getItem(EXACT)==='true';}catch{return false;}});
 const [exactOpen,setExactOpen]=useState(()=>{try{return localStorage.getItem(EXACT)==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}});
 const [mode,setMode]=useState<'multiplier'|'share'>('multiplier'),[value,setValue]=useState('10');
 const all=[...builtins,...catalogue.users],chosen=selected.map(id=>all.find(f=>f.id===id)).filter((f):f is Family=>!!f&&!catalogue.hidden.includes(f.id));
 const f=chosen.find(f=>f.id===active)??chosen[0];
 const name=(f:Family)=>shortFamilyName(f,lang);
 const save=(next:typeof catalogue)=>{setCatalogue(next);try{writeCatalogue(next);setError('');}catch{setError(L('Browser storage unavailable. Export to keep your definition.','אחסון הדפדפן אינו זמין. ייצאו כדי לשמור את ההגדרה.'));}};
 const edit=async(change:(f:Family)=>Family,saveNew=false)=>{
  if(!f||busy)return;setBusy(true);
  try{const full=await fullDefinition(f),personal=saveNew||full.status!=='personal'?fork(full):structuredClone(full),next=change(personal);next.revision=new Date().toISOString();save({...catalogue,users:[...catalogue.users.filter(x=>x.id!==next.id),next]});setSelected(ids=>ids.map(id=>id===f.id?next.id:id));setActive(next.id);}catch{setError(L('Could not load this definition. Nothing changed.','לא ניתן לטעון את ההגדרה. דבר לא השתנה.'));}finally{setBusy(false);}
 };
 const show=(kind:typeof sheet)=>{returnFocus.current=document.activeElement as HTMLElement;setSheet(kind);dialog.current?.showModal();};
 const close=()=>{dialog.current?.close();setSheet(null);returnFocus.current?.focus();};
 const toggle=(id:string)=>{setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);setActive(id);};
 const preview=useMemo(()=>{if(!f)return null;try{const action=scaleAction(f,s,mode,value,source);return {action,after:applyAction(s,action)};}catch{return null;}},[f,s,mode,value,source]);
 const commitScale=async()=>{if(!preview||!f||busy)return;setBusy(true);try{const definition=await fullDefinition(f);dispatch({...preview.action,definition});}catch{setError(L('Could not load this definition.','לא ניתן לטעון את ההגדרה.'));}finally{setBusy(false);}};
 const applyGrouping=async()=>{if(!f||busy)return;setBusy(true);try{const definition=await fullDefinition(f);if(dispatch(groupingAction(definition,s,lang))){const {setState}=await import('../store.ts');setState({tool:'board',familyView:null,blocPanel:'selected',selectedListId:null});}}catch{setError(L('Could not load this definition.','לא ניתן לטעון את ההגדרה.'));}finally{setBusy(false);}};
 const current=historyElections.find(d=>d.id===s.electionId)!;
 const policyLabel=(v:MixedPolicy)=>({'separate-segment':L('Separate','בנפרד'),'include-whole-list':L('Include whole lists','הכללת רשימות שלמות'),exclude:L('Exclude','ללא מעורבות')}[v]);
 const exportDefinition=async()=>{if(!f)return;try{const full=await fullDefinition(f),url=URL.createObjectURL(new Blob([JSON.stringify(full,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='party-family.json';a.click();URL.revokeObjectURL(url);}catch{setError(L('Could not export definition.','לא ניתן לייצא את ההגדרה.'));}};
 return <div className="families">
  <div className="family-top"><div className="family-chips" role="group" aria-label={L('Families to explore','משפחות לחקירה')}>{all.filter(f=>!catalogue.hidden.includes(f.id)).map(f=><button key={f.id} className="family-chip" aria-pressed={selected.includes(f.id)} onClick={()=>toggle(f.id)} style={{['--family-color' as string]:familyColor(f)}}><i aria-hidden/>{name(f)}</button>)}</div><button className="btn small" onClick={()=>show('manage')}>{L('Manage','ניהול')}</button></div>
  {error&&<p role="alert">{error}</p>}
  {f?<>
   <div className="family-profile"><div><h2>{chosen.length===1?name(f):L(`${chosen.length} families · shared scales`,`${chosen.length} משפחות · קנה מידה משותף`)}</h2><p className="family-definition">{chosen.length===1?(lang==='he'?f.definitionHe:f.definition)?.split('. ')[0]:L('Overlaps stay separate; totals are never added.','חפיפות מוצגות בנפרד; הסכומים אינם מחוברים.')} <button className="family-info" aria-label={L('Definition, sources and limitations','הגדרה, מקורות ומגבלות')} onClick={()=>show('evidence')}>i</button></p></div><span className="small muted">{f.status==='personal'?L('Personal copy','עותק אישי'):L('Sourced draft interpretation','פרשנות טיוטה מבוססת מקורות')} · 26 {L('elections','מערכות בחירות')} · {f.elections.reduce((n,e)=>n+e.members.filter(m=>m.scope==='mixed').length+e.reviewCandidates.length,0)} {L('mixed / contested','מעורבות / במחלוקת')}</span></div>
   <div className="family-chart-toolbar"><div className="family-policy"><span>{L('Mixed lists','רשימות מעורבות')}</span><Seg<MixedPolicy> label={L('Mixed-list policy','מדיניות רשימות מעורבות')} value={f.defaultMixedPolicy} options={(['separate-segment','include-whole-list','exclude'] as const).map(v=>({v,label:policyLabel(v)}))} onChange={v=>void edit(x=>({...x,defaultMixedPolicy:v}))}/></div><div className="row"><Feature id="familyEdit"><button className="btn" onClick={()=>show('edit')}>{L('Edit membership','עריכת חברות')}</button></Feature><Feature id="familyGrouping"><button className="btn" disabled={busy} onClick={()=>void applyGrouping()}>{L('Apply family as grouping','החלת המשפחה כקיבוץ')}</button></Feature></div></div>
   {chosen.length>1&&<p className="small muted">{L('Policy and editing apply to','המדיניות והעריכה חלות על')}: {name(f)}. {L('The most recently selected family is active.','המשפחה שנבחרה לאחרונה היא הפעילה.')}</p>}
   <FamilyCharts families={chosen} cursor={cursor} onCursor={setCursor}/>
   <details className="family-exact" open={exactOpen} onToggle={e=>setExactOpen(e.currentTarget.open)}><summary>{L('Exact figures (26 elections)','נתונים מדויקים (26 מערכות בחירות)')}</summary><div className="family-table"><table><thead><tr><th>{L('Election','בחירות')}</th>{chosen.map(x=><th key={x.id}>{name(x)}</th>)}<th>{L('Valid ballots','פתקים כשרים')}</th></tr></thead><tbody>{historyElections.map(d=><tr key={d.id} onFocus={()=>setCursor(d.id)} onPointerEnter={()=>setCursor(d.id)}><th><button className="btn small" onClick={()=>void openFamilyElection(d.id,f)}>{familyDate(d,lang)}</button></th>{chosen.map(x=>{const a=aggregate(x,d);return <td key={x.id} title={policyLabel(x.defaultMixedPolicy)}>{a.votes===null?L('Unknown','לא ידוע'):a.status==='did-not-contest'?L('Did not contest','לא התמודדו'):<>{Number(a.votes).toLocaleString()} · {(Number(a.votes)*100/d.totals.valid).toFixed(4)}%{a.mixed!==0n&&<small>{L('Mixed separately','מעורבות בנפרד')}: {Number(a.mixed).toLocaleString()}</small>}</>}{d.pending&&<small>{L('Pending gazette','טרם פורסם ברשומות')}</small>}</td>;})}<td>{d.totals.valid.toLocaleString()}</td></tr>)}</tbody></table></div><p className="small">{policyLabel(f.defaultMixedPolicy)} · {L('Whole ballots only; no constituent splits.','פתקים שלמים בלבד; אין פיצול למרכיבים.')}</p></details>
   <Feature id="familyScale"><section className="family-scale"><div><h3>{L('Scale this family’s votes','שינוי קולות המשפחה')}</h3><p className="small muted">{familyDate(current,lang)} · {voteSourceLabel(source,s,lang)}</p></div><div className="family-scale-inputs"><Seg label={L('Scale mode','אופן השינוי')} value={mode} onChange={v=>{setMode(v);setValue(v==='share'?(100*resolve(f,s).filter(l=>l.family==='selected'&&!l.withdrawn).reduce((n,l)=>n+l.votes,0)/Math.max(1,s.lists.reduce((n,l)=>n+l.votes,0))).toFixed(2):'10');}} options={[{v:'multiplier',label:L('Increase votes (%)','הגדלת קולות (%)')},{v:'share',label:L('Target share (%)','יעד שיעור הקולות (%)')}]}/><div className="family-quick-step" role="group" aria-label={L('Family vote step','צעד קולות למשפחה')}><button className="btn" aria-label={L('Decrease scale value','הקטנת ערך השינוי')} onClick={()=>setValue(String(Math.max(0,Number(value)-1)))}>−</button><input aria-label={L('Scale value','ערך השינוי')} inputMode="decimal" value={value} onChange={e=>setValue(e.target.value)}/><button className="btn" aria-label={L('Increase scale value','הגדלת ערך השינוי')} onClick={()=>setValue(String(Number(value)+1))}>+</button></div>{mode==='multiplier'&&<div className="quick-actions">{[1,5,10].map(n=><button className="btn small" key={n} aria-pressed={value===String(n)} onClick={()=>setValue(String(n))}>+{n}%</button>)}</div>}</div>
    {preview?<div className="family-consequence"><div><span>{L('Before','לפני')}</span><ResultPreview s={s} blocs={false}/></div><div><span>{L('After','אחרי')}</span><ResultPreview s={preview.after} blocs={false}/></div><p role="status">{L('Family votes after change','קולות המשפחה לאחר השינוי')}: <b>{preview.action.target.toLocaleString()}</b> · {source.kind==='new'?L('Participation changes','ההשתתפות משתנה'):L('Valid total conserved exactly','סך הכשרים נשמר בדיוק')}</p><button className="btn primary" disabled={busy} onClick={()=>void commitScale()}>{L('Apply vote scaling','החלת שינוי הקולות')}</button></div>:<p role="status">{L('Unavailable: check target, positive family votes and eligible donors.','לא זמין: בדקו את היעד, קולות המשפחה והתורמים הזמינים.')}</p>}
   </section></Feature>
  </>:<p>{L('Choose a family above to explore its history.','בחרו משפחה למעלה לצפייה בהיסטוריה שלה.')}</p>}
  <dialog ref={dialog} className="family-sheet" aria-label={sheet==='edit'?L('Edit membership','עריכת חברות'):sheet==='evidence'?L('Definition, sources and limitations','הגדרה, מקורות ומגבלות'):L('Manage families','ניהול משפחות')} onCancel={e=>{e.preventDefault();e.stopPropagation();close();}} onKeyDown={e=>{if(e.key==='Escape')e.stopPropagation();}}>
   <header><h2>{sheet==='edit'?L('Edit membership','עריכת חברות'):sheet==='evidence'?L('Definition, sources and limitations','הגדרה, מקורות ומגבלות'):L('Manage families','ניהול משפחות')}</h2><button className="btn" aria-label={L('Close','סגירה')} onClick={close}>×</button></header>
   <div className="family-sheet-body" aria-busy={busy}><Suspense fallback={<p role="status">{L('Loading…','טעינה…')}</p>}>
    {sheet==='edit'&&f&&<Editor f={f} initialElection={s.electionId} onEdit={change=>void edit(change)} onSave={()=>void edit(x=>x,true)}/>}
    {sheet==='evidence'&&f&&<Evidence family={f}/>}
    {sheet==='manage'&&<div className="family-manage"><p className="small">{L('Saved in this browser only. Export for backup or another device.','נשמר בדפדפן זה בלבד. ייצאו לגיבוי או למכשיר אחר.')}</p>{all.map(x=><div className="family-manage-row" key={x.id}><label><input type="checkbox" checked={!catalogue.hidden.includes(x.id)} onChange={e=>save(visibility(catalogue,x.id,!e.target.checked))}/>{name(x)}</label>{x.id===f?.id&&<button className="btn small" onClick={()=>{save(visibility(catalogue,x.id,true));setSelected(ids=>ids.filter(id=>id!==x.id));}}>{L('Hide preset','הסתרת תבנית')}</button>}</div>)}
     <label><input type="checkbox" checked={preferExact} onChange={e=>{setPreferExact(e.target.checked);setExactOpen(e.target.checked);try{localStorage.setItem(EXACT,String(e.target.checked));}catch{/* browser refused */}}}/>{L('Prefer exact figures (screen-reader/table view)','העדפת נתונים מדויקים (קורא מסך או טבלה)')}</label>
     <button className="btn" disabled={!f} onClick={()=>void exportDefinition()}>{L('Export definition','ייצוא הגדרה')}</button><label>{L('Import family JSON','ייבוא משפחה מקובץ JSON')}<input type="file" accept="application/json,.json" onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>2000000)throw Error();const x=fork(await importPreset(await file.text()));save({...catalogue,users:[...catalogue.users,x]});setSelected([x.id]);setActive(x.id);close();}catch{setError(L('Invalid family file. Nothing imported.','קובץ המשפחה אינו תקין. דבר לא יובא.'));}}}/></label>
    </div>}
   </Suspense></div>
  </dialog>
 </div>;
}
