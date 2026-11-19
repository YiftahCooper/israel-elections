import { percentNum, points } from './Percentage.tsx';
import { PP } from '../format.ts';
import { partyDisplayColor } from '../partyDisplayColor.ts';
import { datesInText, formatDate } from '../dateFormat.ts';
import { SeatDelta } from './SeatDelta.tsx';
import {englishLabel} from '../../data/names.ts';
import {useEffect,useState} from 'react';
import type {ElectionDataset,ElectionId} from '../../data/schema.ts';
import {aggregate,membership,type Family} from '../../families/model.ts';
import {fullDefinition} from '../../families/catalogue.ts';
import {familyColor,historyElections,shortFamilyName} from '../../families/runtime.ts';
import {familyEstimate,familySeatSummary} from '../../families/seatBars.ts';
import {appearances,canonicalParty,partyLabel} from '../../families/registry.ts';
import {RELATION_WORD,type RelationKind} from '../../history/relations.ts';
import lineage from '../../../data/meta/party-lineage.json';
import {loadDataset,useDigits} from '../store.ts';
import {allocationOf,baselineOf,listLabel} from '../derive.ts';
import {useL,useLang} from '../i18n.ts';
import {Info,Slip} from './ui.tsx';
import {JointFacts} from './JointFacts.tsx';
import {PageAndQuote} from './BookQuote.tsx';
import {familyDate,familyStatus,openFamilyElection,reviewNote} from './FamilyCharts.tsx';

/** Official ballots and sourced organisation changes; never infer voter transfers from a trend. */
export function FamilyPoint({family:f,electionId}:{family:Family;electionId:ElectionId}) {
 const digits=useDigits();
 const L=useL(),lang=useLang(),[loaded,setLoaded]=useState<{ds:ElectionDataset;previous:ElectionDataset|null;full:Family}|null>(null),[error,setError]=useState(false);
 const at=historyElections.findIndex(d=>d.id===electionId),before=historyElections[at-1];
 useEffect(()=>{let live=true;setLoaded(null);setError(false);Promise.all([loadDataset(electionId),before?loadDataset(before.id):null,fullDefinition(f)]).then(([ds,previous,full])=>{if(live)setLoaded({ds,previous,full});}).catch(()=>{if(live)setError(true);});return()=>{live=false;};},[f,electionId,before]);
 if(!loaded)return <p role="status">{error?L('Could not load details. Close and try again.','לא ניתן לטעון פירוט. סגרו ונסו שוב.'):L('Loading…','טעינה…')}</p>;
 const {ds,previous,full}=loaded,m=membership(f,electionId),row=full.elections.find(e=>e.electionId===electionId);
 const ids=new Set([...row?.members.map(m=>m.listId)??[],...row?.reviewCandidates.map(m=>m.listId)??[],...m.selected,...m.mixed,...m.excluded]);
 const a=aggregate(f,ds),prev=previous?aggregate(f,previous):null;
 // Compare canonical constituent identities, not election-specific list ids or ballot letters. In a mixed list only the
 // family's own parties count as the family being represented; its partners are not.
 const own=(id:ElectionId,listId:string)=>full.elections.find(e=>e.electionId===id)?.members.find(x=>x.listId===listId);
 const partyIds=(id:ElectionId)=>{const m=membership(f,id),ids=new Set([...m.selected,...m.mixed,...m.excluded]);return new Set(appearances.filter(p=>p.electionId===id&&ids.has(p.listId)&&p.role!=='alliance'&&(own(id,p.listId)?.scope!=='mixed'||own(id,p.listId)!.partyIds.some(x=>canonicalParty(x)===canonicalParty(p.partyId)))).map(p=>canonicalParty(p.partyId)));};
 const partyName=(id:string)=>partyLabel(id,lang);
 const now=partyIds(electionId),old=previous?partyIds(previous.id):new Set<string>();
 const joined=[...now].filter(id=>!old.has(id)),left=[...old].filter(id=>!now.has(id));
 const edges=lineage.edges.filter(e=>e.relation!=='electoral-partner'&&before&&e.date.slice(0,4)>=before.electionDate.slice(0,4)&&e.date.slice(0,4)<=ds.electionDate.slice(0,4)&&[...e.from,...e.to].some(id=>now.has(canonicalParty(id))||old.has(canonicalParty(id))));
 const seatsOf=(d:ElectionDataset)=>d.officialSeats??Object.fromEntries(allocationOf(baselineOf(d)).lists.map(l=>[l.id,l.seats]));
 const seats=seatsOf(ds);
 // The family's own seats and partners, exactly as the seats chart counts them: the vote policy never changes them, and
 // a joint list's whole total appears only on that list's own row.
 const seat=familySeatSummary(f,electionId);
 const seatsWord=(n:number)=>n===1?L('1 seat','מנדט אחד'):`${n} ${L('seats','מנדטים')}`;
 const counted=a.votes!==null&&!(a.votes===0n&&a.mixed),prevCounted=!!prev&&prev.votes!==null&&!(prev.votes===0n&&prev.mixed);
 const share=(v:bigint,d:ElectionDataset)=>Number(v)*100/d.totals.valid;
 const status=familyStatus(a,L),mixedDelta=a.mixed&&prev?.mixed?a.mixed-prev.mixed:null;
 // The chart's solid line at this election when a mixed list makes it an estimate (strictly between its two bounds).
 const nowEst=(v=>v&&v.high>v.estimate&&v.estimate>v.low?v:null)(familyEstimate(f,electionId));
 // The change follows the vote chart's solid line: exact when neither election has a mixed list, otherwise the estimate by seats.
 const exact=counted&&prevCounted&&!a.mixed&&!prev?.mixed,est=!exact&&before&&previous?[familyEstimate(f,electionId),familyEstimate(f,before.id)] as const:null;
 const voteChange=exact?{approx:false,votes:Number(a.votes!-prev!.votes!),pp:share(a.votes!,ds)-share(prev!.votes!,previous!)}:est?.[0]&&est[1]?{approx:est.some(v=>v!.high>v!.estimate&&v!.estimate>v!.low),votes:Math.round(est[0].estimate-est[1].estimate),pp:est[0].estimate*100/ds.totals.valid-est[1].estimate*100/previous!.totals.valid}:null;
 const signed=(n:number|bigint,digits?:number)=>{const x=Number(n);return <bdi dir="ltr">{digits===undefined?<>{x>0?'+':x<0?'−':'±'}{Math.abs(x).toLocaleString('en-US')}</>:points(x,digits)}</bdi>;};
 // every recorded kind has its words; a data code is never shown (an unknown kind reads as a plain change)
 const relation=(s:string)=>L(...(RELATION_WORD[s as RelationKind]??['Change','שינוי']));
 // a source is named by who published it; one without a link (the official results the app holds) is plain text, never a file name or id
 const source=(id:string,s:Family['sources'][string])=>{const text=<>{s.kind==='secondary'?L('Secondary source','מקור משני'):L('Source','מקור')}{((lang==='he'&&s.publisherHe)||s.publisher)&&<> · {(lang==='he'&&s.publisherHe)||s.publisher}</>}</>;return <span key={id} className="book-source">{s.url?<a href={s.url} target="_blank" rel="noreferrer">{text}</a>:<span>{text}</span>}<PageAndQuote locator={s.locator} quote={s.quote}/></span>;};
 // Counted lists first, then the mixed lists estimated by seats, then lists named but not counted.
 const rank=(id:string)=>m.selected.has(id)?0:m.mixed.has(id)?1:2;
 const lists=ds.lists.filter(l=>ids.has(l.id)).sort((x,y)=>rank(x.id)-rank(y.id)||y.votes-x.votes);
 return <div className="family-point" style={{['--family-color' as string]:familyColor(f)}}>
  <h3>{shortFamilyName(f,lang)} · {familyDate(historyElections[at],lang)}</h3>
  <div className="family-point-total">{status&&<span>{status}</span>}{counted&&<span><b>{Number(a.votes).toLocaleString('en-US')} {L('votes','קולות')}</b> · <bdi dir="ltr">{percentNum(share(a.votes!,ds),digits)}</bdi></span>}{seat.known&&<span className="family-point-seats"><b>{seatsWord(seat.own)}</b>{seat.partners>0&&<> <bdi dir="ltr">+{seat.partners}</bdi> {seat.partners===1?L('partner','שותפה'):L('partners','שותפות')}</>}</span>}{!!a.mixed&&<span className="family-point-mixed"><i className="family-key-mixed" aria-hidden/><span>{L('Mixed lists','רשימות מעורבות')}: {Number(a.mixed).toLocaleString('en-US')} · <bdi dir="ltr">{percentNum(share(a.mixed,ds),digits)}</bdi></span></span>}{nowEst&&<span className="family-point-estimate"><b>{L('Estimate by seats','הערכה לפי מנדטים')}: ≈{Math.round(nowEst.estimate).toLocaleString('en-US')}</b> · <bdi dir="ltr">≈{percentNum(nowEst.estimate*100/ds.totals.valid,digits)}</bdi></span>}{reviewNote(a,L)&&<span className="family-point-review">{reviewNote(a,L)}</span>}</div>
  {before&&previous&&prev&&(voteChange||seat.change!==null||mixedDelta!==null)&&<p className="family-point-delta">{L('Since','מאז')} {familyDate(before,lang)}: {voteChange&&<>{voteChange.approx&&<span title={L('Estimate by seats','הערכה לפי מנדטים')}>≈</span>}{signed(voteChange.votes)} {L('votes','קולות')} · {signed(voteChange.pp,digits)} {L(...PP)}</>}{seat.change!==null&&<>{voteChange?' · ':''}<SeatDelta value={seat.change} /> {L('seats','מנדטים')}</>}{mixedDelta!==null&&<>{voteChange||seat.change!==null?' · ':''}{L('mixed lists','רשימות מעורבות')} {signed(mixedDelta)}</>}</p>}
  {!ds.officialSeats&&<p className="small muted">{L('Calculated seats · Gazette not yet verified','מנדטים מחושבים · הפרסום ברשומות טרם אומת')} <Info title={L('Seat counts','ספירת מנדטים')}>{L('Calculated from the published vote counts under this election’s rules. Gazetted seat counts are unavailable.','חושב מספירת הקולות שפורסמה לפי כללי הבחירות האלה. ספירת מנדטים שפורסמה ברשומות אינה זמינה.')}</Info></p>}
  <div className="family-point-lists">{lists.map(l=>{const member=row?.members.find(x=>x.listId===l.id),review=row?.reviewCandidates.find(x=>x.listId===l.id),mixed=member?.scope==='mixed',isCounted=m.selected.has(l.id),separate=m.mixed.has(l.id);
   const ownParty=(id:string)=>!!member?.partyIds.some(x=>canonicalParty(x)===canonicalParty(id));
   const state=isCounted?L('Counted','נספרת'):separate?L('Estimated by seats','מוערכת לפי מנדטים'):l.withdrawn?L('Withdrawn','פרשה'):review?L('Contested, not counted','במחלוקת, לא נספרת'):mixed?L('Left out','הושמטה'):L('Not counted','לא נספרת');
   return <article key={l.id} data-state={isCounted?'counted':separate?'mixed':'other'}>
   <div className="family-point-list"><Slip letters={l.letters} color={l.color} logo={l.logo} name={listLabel(l,lang)} size="sm"/><strong>{listLabel(l,lang)}</strong><span>{l.votes.toLocaleString('en-US')} {L('votes','קולות')} · {seatsWord(seats[l.id]??0)}</span></div>
   <p className="small">{mixed&&<>{L('Mixed list','רשימה מעורבת')} · </>}{state}{member?.headsList&&` · ${L('Family heads this list','המשפחה בראש הרשימה')}`}{' '}
    {member&&<Info title={L('Classification and sources','סיווג ומקורות')}><span>{lang==='en'?member.classificationEvidence.claim:member.classificationEvidence.claimHe??'הפרויקט שיבץ אותה כאן, לפי המקורות שלהלן.'}</span>{member.classificationEvidence.sourceIds.map(id=>full.sources[id]?source(id,full.sources[id]):null)}</Info>}
    {!member&&review&&<Info title={L('Why not counted','מדוע לא נספרת')}><span>{lang==='en'?review.reason:review.reasonHe??'הסיווג במחלוקת או שטרם הוכרע, ולכן הרשימה אינה נספרת. הנימוק המלא מתועד במקור (באנגלית).'}</span>{review.sourceIds.map(id=>full.sources[id]?source(id,full.sources[id]):null)}</Info>}</p>
   {!!l.parties?.length&&<div className="family-point-parties">{l.parties.map(p=>{const mine=mixed&&ownParty(p.id),label=lang==='he'?p.nameHe:englishLabel(p.nameEn,p.nameHe);return <span key={p.id} data-own={mine||undefined}><Slip letters="" color={partyDisplayColor(l, p.id)} logo={p.logo} name={label} size="sm"/>{mine?<><i className="family-own-dot" aria-hidden/><b>{label}</b><span className="sr-only"> ({L('in this family','במשפחה זו')})</span></>:label}</span>;})}<JointFacts listId={l.id} compact/></div>}
  </article>;})}</div>
  {!lists.length&&<p>{L('No named lists.','אין רשימות מזוהות.')}</p>}
  {before&&<section className="family-point-changes"><h3>{L('Parties since','מפלגות מאז')} {familyDate(before,lang)} <Info title={L('Reading the change','פירוש השינוי')}>{L('Compared under the current counting choice. Parties new on, or gone from, the family’s lists are recorded constituent identities, whether or not their list won a seat; they describe, not voter movement or the cause of a vote change. Names with no recorded English form are shown in Hebrew. Unrecorded mergers, splits and renamings stay unknown. Year-only relationship dates may overlap either election year. Whole joint-list votes cannot be divided among parties.','ההשוואה לפי אפשרות הספירה הנוכחית. שינויי ייצוג מתארים זהויות מרכיבים מתועדות, לא תנועת מצביעים או סיבה לשינוי בקולות. מיזוגים, פיצולים ושינויי שם שלא תועדו נשארים לא ידועים. תאריכים ברמת שנה בלבד עשויים לחפוף לשנת אחת הבחירות. אין לפצל קולות של רשימה משותפת בין מפלגותיה.')}</Info></h3>
   {!!joined.length&&<p>{L('New on its lists','חדשות ברשימות המשפחה')}: {joined.map(id=>partyName(id)).join(' · ')}</p>}
   {!!left.length&&<p>{L('No longer on its lists','כבר לא ברשימות המשפחה')}: {left.map(id=>partyName(id)).join(' · ')}</p>}
   {!joined.length&&!left.length&&<p>{L('No recorded constituent change','אין שינוי מתועד במרכיבים')}</p>}
   {edges.map(e=><p key={e.id}>{relation(e.relation)} · <bdi dir="ltr">{formatDate(e.date,lang)}</bdi>: <bdi dir="ltr">{e.from.map(id=>partyName(id)).join(' + ')} → {e.to.map(id=>partyName(id)).join(' + ')}</bdi> <Info title={L('Relationship sources','מקורות לקשר')}>{e.sources.map(id=>{const s=lineage.sources[id as keyof typeof lineage.sources];return s?source(id,s):null;})}</Info></p>)}
   {previous&&<details><summary>{L('Previous ballot lists','הרשימות בבחירות הקודמות')}</summary>{previous.lists.filter(l=>{const m=membership(f,previous.id);return m.selected.has(l.id)||m.mixed.has(l.id)||m.excluded.has(l.id);}).map(l=><p key={l.id}>{listLabel(l,lang)} · {l.votes.toLocaleString('en-US')} {L('votes','קולות')}</p>)}</details>}

  </section>}
  <details><summary>{L('Election notes and sources','הערות ומקורות לבחירות')}</summary><p>{datesInText(lang==='he'?ds.status.noteHe:ds.status.noteEn)}</p>{Object.entries(full.sources).filter(([id])=>(row?.voteSourceIds as string[]|undefined)?.includes(id)).map(([id,s])=>source(id,s))}</details>
  <button className="btn primary" onClick={()=>void openFamilyElection(electionId,f)}>{L('Open this election','פתיחת הבחירות האלה')}</button>
 </div>;
}
