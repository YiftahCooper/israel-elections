import { SeatDelta } from './SeatDelta.tsx';
import {englishLabel} from '../../data/names.ts';
import {useEffect,useState} from 'react';
import type {ElectionDataset,ElectionId} from '../../data/schema.ts';
import {aggregate,membership,type Family} from '../../families/model.ts';
import {fullDefinition} from '../../families/catalogue.ts';
import {familyColor,historyElections,shortFamilyName} from '../../families/runtime.ts';
import {appearances,canonicalParty,partyLabel} from '../../families/registry.ts';
import lineage from '../../../data/meta/party-lineage.json';
import {loadDataset} from '../store.ts';
import {allocationOf,baselineOf,listLabel} from '../derive.ts';
import {useL,useLang} from '../i18n.ts';
import {Info,Slip} from './ui.tsx';
import {JointFacts} from './JointFacts.tsx';
import {familyDate,familyStatus,openFamilyElection} from './FamilyCharts.tsx';

/** Official ballots and sourced organisation changes; never infer voter transfers from a trend. */
export function FamilyPoint({family:f,electionId}:{family:Family;electionId:ElectionId}) {
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
 const partyName=(id:string)=>lang==='he'?partyLabel(id,lang):englishLabel(partyLabel(id,lang),'');
 const now=partyIds(electionId),old=previous?partyIds(previous.id):new Set<string>();
 const joined=[...now].filter(id=>!old.has(id)),left=[...old].filter(id=>!now.has(id));
 const edges=lineage.edges.filter(e=>e.relation!=='electoral-partner'&&before&&e.date.slice(0,4)>=before.electionDate.slice(0,4)&&e.date.slice(0,4)<=ds.electionDate.slice(0,4)&&[...e.from,...e.to].some(id=>now.has(canonicalParty(id))||old.has(canonicalParty(id))));
 const seatsOf=(d:ElectionDataset)=>d.officialSeats??Object.fromEntries(allocationOf(baselineOf(d)).lists.map(l=>[l.id,l.seats]));
 const seats=seatsOf(ds);
 const familySeats=(d:ElectionDataset,set:Set<string>)=>{const s=seatsOf(d);return d.lists.reduce((n,l)=>n+(set.has(l.id)?s[l.id]??0:0),0);};
 const counted=a.votes!==null&&!(a.votes===0n&&a.mixed),prevCounted=!!prev&&prev.votes!==null&&!(prev.votes===0n&&prev.mixed);
 const share=(v:bigint,d:ElectionDataset)=>Number(v)*100/d.totals.valid;
 const status=familyStatus(a,L),mixedDelta=a.mixed!==null&&prev?.mixed!==null&&prev?.mixed!==undefined?a.mixed-prev.mixed:null;
 const signed=(n:number|bigint,digits?:number)=>{const x=Number(n);return <bdi dir="ltr">{x>0?'+':x<0?'−':'±'}{digits===undefined?Math.abs(x).toLocaleString():Math.abs(x).toFixed(digits)}</bdi>;};
 const relation=(s:string)=>({'merged-into':L('Merged','מיזוג'),'split-from':L('Split','פיצול'),'renamed-to':L('Renamed','שינוי שם')}[s]??s);
 const source=(id:string,s:Family['sources'][string])=><a key={id} href={s.url} target="_blank" rel="noreferrer">{s.kind==='secondary'?L('Secondary source','מקור משני'):L('Source','מקור')} · {s.publisher??id}</a>;
 // Counted lists first, then the hatched mixed lists, then lists named but not counted.
 const rank=(id:string)=>m.selected.has(id)?0:m.mixed.has(id)?1:2;
 const lists=ds.lists.filter(l=>ids.has(l.id)).sort((x,y)=>rank(x.id)-rank(y.id)||y.votes-x.votes);
 return <div className="family-point" style={{['--family-color' as string]:familyColor(f)}}>
  <h3>{shortFamilyName(f,lang)} · {familyDate(historyElections[at],lang)}</h3>
  <div className="family-point-total">{status&&<span>{status}</span>}{counted&&<span><b>{Number(a.votes).toLocaleString()} {L('votes','קולות')}</b> · <bdi dir="ltr">{share(a.votes!,ds).toFixed(2)}%</bdi> · {familySeats(ds,m.selected)} {L('seats','מנדטים')}</span>}{!!a.mixed&&<span className="family-point-mixed"><i className="family-key-mixed" aria-hidden/><span>{L('Mixed lists','רשימות מעורבות')}: {Number(a.mixed).toLocaleString()} · <bdi dir="ltr">{share(a.mixed,ds).toFixed(2)}%</bdi></span></span>}</div>
  {before&&previous&&prev&&(counted&&prevCounted||mixedDelta!==null&&(!!a.mixed||!!prev.mixed))&&<p className="family-point-delta">{L('Since','מאז')} {familyDate(before,lang)}: {counted&&prevCounted&&<>{signed(a.votes!-prev.votes!)} {L('votes','קולות')} · {signed(share(a.votes!,ds)-share(prev.votes!,previous),2)} {L('points','נקודות אחוז')} · <SeatDelta value={familySeats(ds,m.selected)-familySeats(previous,membership(f,previous.id).selected)} /> {L('seats','מנדטים')}</>}{!!(a.mixed||prev.mixed)&&mixedDelta!==null&&<>{counted&&prevCounted?' · ':''}{L('mixed lists','רשימות מעורבות')} {signed(mixedDelta)}</>}</p>}
  {!ds.officialSeats&&<p className="small muted">{L('Calculated seats · Gazette not yet verified','מנדטים מחושבים · הפרסום ברשומות טרם אומת')} <Info title={L('Seat counts','ספירת מנדטים')}>{L('Calculated from the published vote counts under this election’s rules. Gazetted seat counts are unavailable.','חושב מספירת הקולות שפורסמה לפי כללי הבחירות האלה. ספירת מנדטים שפורסמה ברשומות אינה זמינה.')}</Info></p>}
  <div className="family-point-lists">{lists.map(l=>{const member=row?.members.find(x=>x.listId===l.id),review=row?.reviewCandidates.find(x=>x.listId===l.id),mixed=member?.scope==='mixed',isCounted=m.selected.has(l.id),separate=m.mixed.has(l.id);
   const ownParty=(id:string)=>!!member?.partyIds.some(x=>canonicalParty(x)===canonicalParty(id));
   const state=isCounted?L('Counted','נספרת'):separate?L('Shown hatched, not counted','מוצגת בקווקוו, לא נספרת'):l.withdrawn?L('Withdrawn','פרשה'):review?L('Contested, not counted','במחלוקת, לא נספרת'):mixed?L('Left out','הושמטה'):L('Not counted','לא נספרת');
   return <article key={l.id} data-state={isCounted?'counted':separate?'mixed':'other'}>
   <div className="family-point-list"><Slip letters={l.letters} color={l.color} logo={l.logo} name={listLabel(l,lang)} size="sm"/><strong>{listLabel(l,lang)}</strong><span>{l.votes.toLocaleString()} {L('votes','קולות')} · {seats[l.id]??0} {L('seats','מנדטים')}</span></div>
   <p className="small">{mixed&&<>{L('Mixed list','רשימה מעורבת')} · </>}{state}{member?.headsList&&` · ${L('Family heads this list','המשפחה בראש הרשימה')}`}{' '}
    {member&&<Info title={L('Classification and sources','סיווג ומקורות')}><span>{lang==='en'?member.classificationEvidence.claim:'סיווג מערכתי לפי הגדרת המשפחה; אין הסקה על חלוקת קולות בין המרכיבים.'}</span>{member.classificationEvidence.sourceIds.map(id=>full.sources[id]?source(id,full.sources[id]):null)}</Info>}
    {!member&&review&&<Info title={L('Why not counted','מדוע לא נספרת')}><span>{lang==='en'?review.reason:'הסיווג במחלוקת או שטרם הוכרע, ולכן הרשימה אינה נספרת. הנימוק המלא מתועד במקור (באנגלית).'}</span>{review.sourceIds.map(id=>full.sources[id]?source(id,full.sources[id]):null)}</Info>}</p>
   {!!l.parties?.length&&<div className="family-point-parties">{l.parties.map(p=>{const mine=mixed&&ownParty(p.id),label=lang==='he'?p.nameHe:englishLabel(p.nameEn,p.nameHe);return <span key={p.id} data-own={mine||undefined}><Slip letters="" color={p.color??l.color} logo={p.logo} name={label} size="sm"/>{mine?<><i className="family-own-dot" aria-hidden/><b>{label}</b><span className="sr-only"> ({L('in this family','במשפחה זו')})</span></>:label}</span>;})}<JointFacts listId={l.id} compact/></div>}
  </article>;})}</div>
  {!lists.length&&<p>{L('No named lists.','אין רשימות מזוהות.')}</p>}
  {before&&<section className="family-point-changes"><h3>{L('Parties since','מפלגות מאז')} {familyDate(before,lang)} <Info title={L('Reading the change','פירוש השינוי')}>{L('Compared under the current counting choice. Representation changes describe recorded constituent identities, not voter movement or the cause of a vote change. Names without English metadata are unofficial transliterations. Unrecorded mergers, splits and renamings stay unknown. Year-only relationship dates may overlap either election year. Whole joint-list votes cannot be divided among parties.','ההשוואה לפי אפשרות הספירה הנוכחית. שינויי ייצוג מתארים זהויות מרכיבים מתועדות, לא תנועת מצביעים או סיבה לשינוי בקולות. מיזוגים, פיצולים ושינויי שם שלא תועדו נשארים לא ידועים. תאריכים ברמת שנה בלבד עשויים לחפוף לשנת אחת הבחירות. אין לפצל קולות של רשימה משותפת בין מפלגותיה.')}</Info></h3>
   {!!joined.length&&<p>{L('Now represented','מיוצגות כעת')}: {joined.map(id=>partyName(id)).join(' · ')}</p>}
   {!!left.length&&<p>{L('No longer represented','אינן מיוצגות עוד')}: {left.map(id=>partyName(id)).join(' · ')}</p>}
   {!joined.length&&!left.length&&<p>{L('No recorded constituent change','אין שינוי מתועד במרכיבים')}</p>}
   {edges.map(e=><p key={e.id}>{relation(e.relation)} · <bdi dir="ltr">{e.date}</bdi>: <bdi dir="ltr">{e.from.map(id=>partyName(id)).join(' + ')} → {e.to.map(id=>partyName(id)).join(' + ')}</bdi> <Info title={L('Relationship sources','מקורות לקשר')}>{e.sources.map(id=>{const s=lineage.sources[id as keyof typeof lineage.sources];return s?source(id,s):null;})}</Info></p>)}
   {previous&&<details><summary>{L('Previous ballot lists','הרשימות בבחירות הקודמות')}</summary>{previous.lists.filter(l=>{const m=membership(f,previous.id);return m.selected.has(l.id)||m.mixed.has(l.id)||m.excluded.has(l.id);}).map(l=><p key={l.id}>{listLabel(l,lang)} · {l.votes.toLocaleString()} {L('votes','קולות')}</p>)}</details>}

  </section>}
  <details><summary>{L('Election notes and sources','הערות ומקורות לבחירות')}</summary><p>{lang==='he'?ds.status.noteHe:ds.status.noteEn}</p>{Object.entries(full.sources).filter(([id])=>(row?.voteSourceIds as string[]|undefined)?.includes(id)).map(([id,s])=>source(id,s))}</details>
  <button className="btn primary" onClick={()=>void openFamilyElection(electionId,f)}>{L('Open this election','פתיחת הבחירות האלה')}</button>
 </div>;
}
