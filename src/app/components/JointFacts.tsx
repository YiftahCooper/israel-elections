import {englishLabel} from '../../data/names.ts';
import {useEffect,useState} from 'react';
import type facts from '../../../data/meta/joint-facts.json';
import {useL,useLang} from '../i18n.ts';
import {formatDate} from '../dateFormat.ts';
import {HEWIKI_LABEL} from '../hewiki.ts';
import {Info} from './ui.tsx';
type Fact=(typeof facts)[number];
let loaded:Promise<Fact[]>|undefined;
/** The official facts of a joint list at the election (who heads it, who was elected for each party, the factions its
 *  members sat in at the Knesset's opening), apart from the scenario. Loaded only at point of use. Facts only: how the
 *  members were matched to parties and factions is not the reader's question (clarity pass, 26 Nov 2026). */
export function JointFacts({listId,showListName=false,compact=false}:{listId:string;showListName?:boolean;compact?:boolean}) {
 const L=useL(),lang=useLang(),[all,setAll]=useState<Fact[]>([]),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 // a failed download says so, with Try again; the facts are never silently left out
 useEffect(()=>{let live=true;setFailed(false);loaded??=import('../../../data/meta/joint-facts.json').then(m=>m.default);loaded.then(x=>{if(live)setAll(x);}).catch(()=>{loaded=undefined;if(live)setFailed(true);});return()=>{live=false;};},[attempt]);
 if(failed)return <span className="joint-facts small bad" role="status">{L('The joint-list facts could not be loaded.','העובדות על הרשימה המשותפת לא נטענו.')} <button type="button" className="btn small" onClick={()=>setAttempt(a=>a+1)}>{L('Try again','נסו שוב')}</button></span>;
 const f=all.find(f=>f.listId===listId);if(!f)return null;
 const name=(p:Fact['parties'][number])=>lang==='he'?p.nameHe:p.nameEn;
 const head=f.parties.find(p=>p.id===f.headPartyId);
 const elected=[...f.parties.filter(p=>p.elected>0).map(p=>`${name(p)} ${p.elected}`),...(f.unknownElected>0?[`${L('party not known','מפלגה לא ידועה')} ${f.unknownElected}`]:[])].join(' · ');
 // the factions at the opening, each with its seats from every party of the list
 const seatsBy=new Map<string,number>();
 for(const p of f.parties)for(const x of p.factions)seatsBy.set(x.nameHe,(seatsBy.get(x.nameHe)??0)+x.seats);
 const factionName=(he:string)=>lang==='he'?he:englishLabel(f.parties.find(p=>p.nameHe===he)?.nameEn,he);
 const factions=[...seatsBy].map(([he,n])=>`${factionName(he)} ${n}`).join(' · ');
 const headLine=head?L(`Headed by ${name(head)}`,`בראשות ${name(head)}`):'';
 const factionLine=seatsBy.size?(seatsBy.size===1?L('sat as one faction','ישבו כסיעה אחת'):L(`sat as ${seatsBy.size} factions`,`ישבו ב־${seatsBy.size} סיעות`)):'';
 return <span className="joint-facts small">
  {showListName&&<b>{L('Joint list','רשימה משותפת')} · </b>}
  {!compact&&<span>{[headLine,elected&&L(`elected: ${elected}`,`נבחרו: ${elected}`),factionLine].filter(Boolean).join(' · ')} </span>}
  <Info title={L('The joint list at the election','הרשימה המשותפת בבחירות')}>
   {headLine&&<>{headLine}. </>}{elected&&L(`Elected: ${elected}.`,`נבחרו: ${elected}.`)}
   {seatsBy.size>0&&<><br/>{f.openingDate?L(`At the Knesset’s opening (${formatDate(f.openingDate,'en')}): ${factions}.`,`בפתיחת הכנסת (${formatDate(f.openingDate,'he')}): ${factions}.`):L(`At the Knesset’s opening: ${factions}.`,`בפתיחת הכנסת: ${factions}.`)}</>}
   {(f.sources.length>0||f.secondarySources.length>0)&&<br/>}
   {f.sources.map((url,i)=><span key={url}><a href={url} target="_blank" rel="noreferrer">{L('Knesset records','רישומי הכנסת')}{f.sources.length>1?` ${i+1}`:''}</a>{' '}</span>)}
   {f.secondarySources.map(url=><span key={url}><a href={url} target="_blank" rel="noreferrer" hrefLang={/he\.wikipedia\.org/.test(url)?'he':undefined}>{/he\.wikipedia\.org/.test(url)?L(...HEWIKI_LABEL):L('Secondary source','מקור משני')}</a>{' '}</span>)}
  </Info>
 </span>;
}
