import {familyLabel} from '../../families/labels.ts';
import { useEffect, useState } from 'react';
import type { ElectionDataset, ElectionId } from '../../data/schema.ts';
import { membership, type Family } from '../../families/model.ts';
import { appearances, parties, suggestions, linkedAppearances, partyLabel } from '../../families/registry.ts';
import { loadDataset } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import {JointFacts} from './JointFacts.tsx';
import { Seg } from './ui.tsx';
import { historyElections } from '../../families/runtime.ts';
export function FamilyEditor({f,initialElection,onEdit,onSave}: {f:Family;initialElection:ElectionId;onEdit:(change:(f:Family)=>Family)=>void;onSave:()=>void}) {
 const L=useL(),lang=useLang();
 const [election,setElection]=useState(initialElection),[ds,setDataset]=useState<ElectionDataset|null>(null),[search,setSearch]=useState(''),[error,setError]=useState('');
 const [from,setFrom]=useState(''),[to,setTo]=useState(''),[type,setType]=useState<'lineage'|'electoral-partner'>('electoral-partner'),[preview,setPreview]=useState(false),[suggested,setSuggested]=useState('');
 useEffect(()=>{let live=true;setDataset(null);loadDataset(election).then(d=>{if(live)setDataset(d);}).catch(()=>setError(L('Could not load election.','לא ניתן לטעון את הבחירות.')));return()=>{live=false;};},[election]);
 const row=f.elections.find(e=>e.electionId===election), m=membership(f,election),selected={selected:m.selected,mixed:new Set([...m.mixed,...m.excluded])},at=historyElections.findIndex(d=>d.id===election);
 const listName=(id:string)=>{const l=ds?.lists.find(l=>l.id===id);if(l)return lang==='he'?l.shortHe:l.shortEn??l.shortHe;return partyLabel(appearances.find(a=>a.listId===id)?.partyId??'',lang);};
 const toggle=(id:string,on:boolean)=>onEdit(x=>({...x,disabled:on?x.disabled?.filter(v=>v!==id):[...new Set([...x.disabled??[],id])],included:on?[...new Set([...x.included??[],id])]:x.included?.filter(v=>v!==id)}));
 const edge=suggestions.find(e=>e.id===suggested);
 const ids=edge?[...edge.from,...edge.to]:[from,to];
 const scope=edge?('electionId' in edge?edge.electionId:undefined):type==='electoral-partner'?election:undefined;
 const linked=linkedAppearances(ids,scope);
 const apply=()=>{onEdit(x=>({...x,included:[...new Set([...x.included??[],...linked])],links:[...(x.links??[]),...(edge?edge.from.flatMap(from=>edge.to.map(to=>({from,to,type:edge.relation==='electoral-partner'?'electoral-partner' as const:'lineage' as const,sourceEdgeId:edge.id,...(scope?{electionId:scope}:{})}))):[{from,to,type,...(scope?{electionId:scope}:{})}])]}));setPreview(false);setSuggested('');};
 return <div className="family-editor">
  <div className="row"><button className="btn" onClick={onSave}>{L('Save as my preset','שמירה כתבנית שלי')}</button><span className="small muted">{L('Browser-only · edits make a personal copy','בדפדפן זה בלבד · עריכות יוצרות עותק אישי')}</span></div>
  <label>{L('Preset name','שם התבנית')}<input key={`${f.id}-${lang}`} defaultValue={familyLabel(f,lang)} onBlur={e=>{const v=e.target.value.trim();if(v&&v!==(familyLabel(f,lang)))onEdit(x=>({...x,[lang==='he'?'nameHe':'nameEn']:v,[lang==='he'?'labelHe':'labelEn']:v}));}}/></label>
  <div className="family-election-stepper" role="group" aria-label={L('Membership election','בחירות לעריכת חברות')}>
   <button className="btn" disabled={at===0} aria-label={L('Earlier membership election','בחירות קודמות לעריכת חברות')} onClick={()=>setElection(historyElections[at-1].id)}>‹</button>
   <ChoicePicker label={L('Membership election','בחירות לעריכת חברות')} value={election} options={historyElections.map(d=>({value:d.id,label:new Date(d.electionDate+'T12:00:00').toLocaleDateString(lang==='he'?'he-IL':'en-GB')}))} onChange={id=>setElection(id as ElectionId)}/>
   <button className="btn" disabled={at===25} aria-label={L('Later membership election','בחירות הבאות לעריכת חברות')} onClick={()=>setElection(historyElections[at+1].id)}>›</button>
  </div>
  <label>{L('Search lists and aliases','חיפוש רשימות וכינויים')}<input type="search" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  {error&&<p role="alert">{error}</p>}
  <div className="family-selected">{ds?.lists.filter(l=>selected.selected.has(l.id)).map(l=><button key={l.id} className="btn small" onClick={()=>toggle(l.id,false)}>{listName(l.id)} ×</button>)}</div>
  {!ds?<p role="status">{L('Loading lists…','טעינת רשימות…')}</p>:<div className="family-picker">{ds.lists.filter(l=>[l.nameHe,l.shortHe,l.shortEn,...appearances.filter(a=>a.listId===l.id).flatMap(a=>{const p=parties.find(p=>p.id===a.partyId);return p?[p.nameHe,p.nameEn,...p.names.flatMap(n=>[n.nameHe,n.nameEn])]:[];})].join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(l=><label key={l.id}><input type="checkbox" checked={selected.selected.has(l.id)} ref={el=>{if(el)el.indeterminate=selected.mixed.has(l.id);}} onChange={e=>toggle(l.id,e.target.checked)}/><span>{listName(l.id)}{l.parties?.length?<small>{l.parties.map(p=>lang==='he'?p.nameHe:p.nameEn).join(' · ')}</small>:null}</span>{selected.mixed.has(l.id)&&<small>{L('Mixed','מעורבת')}</small>}</label>)}</div>}
  {!!row?.members.some(m=>m.scope==='mixed')&&<details><summary>{L('Mixed-list overrides','חריגות לרשימות מעורבות')}</summary>{row.members.filter(m=>m.scope==='mixed').map(m=><div key={m.listId}>
   <label>{listName(m.listId)} <select aria-label={L(`Counting override for ${listName(m.listId)}`,`חריגת ספירה עבור ${listName(m.listId)}`)} value={f.disabled?.includes(m.listId)?'exclude':f.included?.includes(m.listId)?'include':'default'} onChange={e=>{const v=e.target.value;onEdit(x=>({...x,disabled:[...(x.disabled??[]).filter(id=>id!==m.listId),...(v==='exclude'?[m.listId]:[])],included:[...(x.included??[]).filter(id=>id!==m.listId),...(v==='include'?[m.listId]:[])]}));}}>
    <option value="default">{L('Use policy','לפי המדיניות')}</option><option value="include">{L('Include whole list','הכללת הרשימה')}</option><option value="exclude">{L('Exclude','ללא הרשימה')}</option>
   </select></label><JointFacts listId={m.listId}/>
  </div>)}</details>}
  {!!row?.members.some(m=>m.scope==='extension')&&<details><summary>{L('Optional extensions','הרחבות לבחירה')}</summary>{row.members.filter(m=>m.scope==='extension').map(m=><label key={m.listId}><input type="checkbox" checked={!f.disabled?.includes(m.listId)} onChange={e=>toggle(m.listId,e.target.checked)}/>{listName(m.listId)}</label>)}</details>}
  {!!row?.reviewCandidates.length&&<details><summary>{L('Excluded or contested','לא נכללות או שנויות במחלוקת')}</summary>{row.reviewCandidates.map(m=><label key={m.listId}><input type="checkbox" checked={f.included?.includes(m.listId)??false} onChange={e=>toggle(m.listId,e.target.checked)}/>{listName(m.listId)}</label>)}</details>}
  <details><summary>{L('Link historic partners','קישור שותפים היסטוריים')}</summary>
   <ChoicePicker label={L('Sourced suggestions','הצעות ממקורות')} value={suggested} placeholder={L('Preview a relationship','תצוגה מקדימה לקשר')} options={suggestions.map(e=>({value:e.id,label:`${e.from.map(id=>partyLabel(id,lang)).join(' + ')} → ${e.to.map(id=>partyLabel(id,lang)).join(' + ')} · ${e.date}`,detail:e.relation==='electoral-partner'?L('Electoral partner','שותפות בבחירות'):L('Lineage','שושלת')}))} onChange={v=>{setSuggested(v);setPreview(true);}}/>
   <div className="family-link-pickers">{([['from',from,setFrom],['to',to,setTo]] as const).map(([key,v,set])=><ChoicePicker key={key} label={key==='from'?L('From party','ממפלגה'):L('To party','למפלגה')} value={v} options={parties.map(p=>({value:p.id,label:lang==='he'?p.nameHe:p.nameEn??p.nameHe}))} onChange={v=>{set(v);setPreview(false);setSuggested('');}}/>)}</div>
   <Seg value={type} label={L('Link type','סוג הקישור')} onChange={v=>{setType(v);setPreview(false);setSuggested('');}} options={[{v:'lineage',label:L('Lineage','שושלת')},{v:'electoral-partner',label:L('Partner in this election','שותפות בבחירות אלה')}]}/>
   <button className="btn" disabled={!from||!to||from===to} onClick={()=>setPreview(true)}>{L('Preview link','תצוגה מקדימה לקישור')}</button>
   {preview&&<div className="family-link-preview"><p>{ids.map(id=>partyLabel(id,lang)).join(' → ')}</p><p>{L('Only these whole appearances will be added. No inherited or split votes.','רק הופעות שלמות אלה יתווספו. אין הורשה או פיצול קולות.')}</p><ul>{linked.map(id=><li key={id}>{listName(id)} · {historyElections.find(d=>d.lists.some(l=>l.id===id))?.electionDate}</li>)}</ul><button className="btn" onClick={apply}>{edge?L('Apply suggested link','החלת הקשר המוצע'):L('Apply link','החלת הקישור')}</button></div>}
  </details>
 </div>;
}
