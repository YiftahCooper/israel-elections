import {englishLabel} from '../../data/names.ts';
import {useEffect,useState} from 'react';
import type facts from '../../../data/meta/joint-facts.json';
import {useL,useLang} from '../i18n.ts';
import {Info} from './ui.tsx';
type Fact=(typeof facts)[number];
let loaded:Promise<Fact[]>|undefined;
/** Official baseline facts remain distinct from a simulated allocation. Loaded only at point of use. */
export function JointFacts({listId,showListName=false,compact=false}:{listId:string;showListName?:boolean;compact?:boolean}) {
 const L=useL(),lang=useLang(),[all,setAll]=useState<Fact[]>([]);
 useEffect(()=>{let live=true;loaded??=import('../../../data/meta/joint-facts.json').then(m=>m.default);loaded.then(x=>{if(live)setAll(x);}).catch(()=>{});return()=>{live=false;};},[]);
 const f=all.find(f=>f.listId===listId);if(!f)return null;
 const name=(p:Fact['parties'][number])=>lang==='he'?p.nameHe:p.nameEn;
 const head=f.parties.find(p=>p.id===f.headPartyId);
 const elected=f.parties.filter(p=>p.elected>0).map(p=>`${name(p)} ${p.elected}`).join(' · ');
 const factions=[...new Set(f.parties.flatMap(p=>p.factions.map(x=>x.nameHe)))];
 const unknown=f.unknownElected+f.parties.reduce((n,p)=>n+p.unknownFaction,0);
 return <span className="joint-facts small">
  {showListName&&<b>{L('Joint list','רשימה משותפת')} · </b>}
  {!compact && <>   <span>{L('Head','בראש')}: {head?name(head):L('Unknown','לא ידוע')} · {L('Elected','נבחרים')}: {elected||'0'}{f.unknownElected>0&&` · ${L('Unknown','לא ידוע')} ${f.unknownElected}`}{f.pending&&` · ${L('Provisional','זמני')}`}{f.secondaryAffiliations&&` · ${L('Secondary affiliations','שיוך ממקור משני')}`}</span>
  <span> · {L('Opening factions','סיעות בהשבעה')}: {factions.length?(factions.length===1?L('1 faction','סיעה אחת'):`${factions.length} ${L('factions','סיעות')}`):L('Unknown','לא ידוע')}{unknown>0&&factions.length>0&&` · ${L('Unknown','לא ידוע')} ${unknown}`}</span>{' '}
</>}
  <Info title={L('Joint-list facts and sources','עובדות ומקורות לרשימה משותפת')}>
   <span>{L('Head','בראש')}: {head?name(head):L('Unknown','לא ידוע')} · {L('Elected','נבחרים')}: {elected||'0'}{f.unknownElected>0&&` · ${L('Unknown','לא ידוע')} ${f.unknownElected}`}{f.pending&&` · ${L('Provisional','זמני')}`}{f.secondaryAffiliations&&` · ${L('Secondary affiliations','שיוך ממקור משני')}`}</span>
  <span> · {L('Opening factions','סיעות בהשבעה')}: {factions.length?(factions.length===1?L('1 faction','סיעה אחת'):`${factions.length} ${L('factions','סיעות')}`):L('Unknown','לא ידוע')}{unknown>0&&factions.length>0&&` · ${L('Unknown','לא ידוע')} ${unknown}`}</span>{' '}
<br/>
   <strong>{L('Official submission','הגשה רשמית')}: </strong>{(lang === 'he' ? f.submissionHe.join(' · ') : f.parties.map(name).join(' · '))||L('Unknown','לא ידוע')}<br/>
   {L('Published baseline, not the current simulation. Component affiliations follow the reviewed metadata; secondary evidence is labelled. Rank 1 identifies the head party. Elected seats are not a division of votes.','נתוני המקור, לא ההדמיה הנוכחית. שיוכי המפלגות לפי המטא־דאטה שנבדק; מקורות משניים מסומנים. מקום 1 מזהה את המפלגה שבראש. חלוקת הנבחרים אינה חלוקת קולות.')}<br/>
   {L('Opening day','יום ההשבעה')}: {f.openingDate??L('Unconfirmed','טרם אומת')}<br/>
   {f.parties.map(p=><span key={p.id}>{name(p)}: {p.factions.map(x=>`${lang === 'he' ? x.nameHe : englishLabel(f.parties.find(p => p.nameHe === x.nameHe)?.nameEn, x.nameHe)} ${x.seats}`).join(' · ')}{p.unknownFaction>0&&` · ${L('Unknown','לא ידוע')} ${p.unknownFaction}`}<br/></span>)}
   {L('Only unique exact names and faction date intervals are matched. Unmatched members, missing faction records and future swearings-in stay unknown.','ההתאמה לפי שם מדויק וייחודי, ובטווח התאריכים של הסיעה. נבחרים שלא זוהו, רשומות חסרות והשבעה עתידית נשארים לא ידועים.')}<br/>
   {f.sources.map((url,i)=><span key={url}><a href={url} target="_blank" rel="noreferrer">{L('Official source','מקור רשמי')} {i+1}</a>{' '}</span>)}
   {f.secondarySources.map(url=><span key={url}><a href={url} target="_blank" rel="noreferrer">{L('Secondary affiliation source','מקור משני לשיוך')}</a>{' '}</span>)}
  </Info>
 </span>;
}
