import {englishLabel} from '../../data/names.ts';
import {useEffect,useState} from 'react';
import type {ElectionDataset,ElectionId} from '../../data/schema.ts';
import {aggregate,membership,type Family} from '../../families/model.ts';
import {fullDefinition} from '../../families/catalogue.ts';
import {historyElections,shortFamilyName} from '../../families/runtime.ts';
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
 const lists=ds.lists.filter(l=>ids.has(l.id)),a=aggregate(f,ds),prev=previous?aggregate(f,previous):null;
 // Compare canonical constituent identities, not election-specific list ids or ballot letters.
 const partyIds=(id:ElectionId)=>{const m=membership(f,id),ids=new Set([...m.selected,...m.mixed,...m.excluded]);return new Set(appearances.filter(p=>p.electionId===id&&ids.has(p.listId)&&p.role!=='alliance').map(p=>canonicalParty(p.partyId)));};
 const partyName=(id:string)=>lang==='he'?partyLabel(id,lang):englishLabel(partyLabel(id,lang),'');
 const now=partyIds(electionId),old=previous?partyIds(previous.id):new Set<string>();
 const joined=[...now].filter(id=>!old.has(id)),left=[...old].filter(id=>!now.has(id));
 const edges=lineage.edges.filter(e=>e.relation!=='electoral-partner'&&before&&e.date.slice(0,4)>=before.electionDate.slice(0,4)&&e.date.slice(0,4)<=ds.electionDate.slice(0,4)&&[...e.from,...e.to].some(id=>now.has(canonicalParty(id))||old.has(canonicalParty(id))));
 const seats=ds.officialSeats??Object.fromEntries(allocationOf(baselineOf(ds)).lists.map(l=>[l.id,l.seats]));
 const status=familyStatus(a,L),mixedDelta=a.mixed!==null&&prev?.mixed!==null&&prev?.mixed!==undefined?a.mixed-prev.mixed:null,delta=prev?.votes!==null&&prev?.votes!==undefined&&a.votes!==null?a.votes-prev.votes:null;
 const relation=(s:string)=>({'merged-into':L('Merged','מיזוג'),'split-from':L('Split','פיצול'),'renamed-to':L('Renamed','שינוי שם')}[s]??s);
 const source=(id:string,s:Family['sources'][string])=><a key={id} href={s.url} target="_blank" rel="noreferrer">{s.kind==='secondary'?L('Secondary source','מקור משני'):L('Source','מקור')} · {s.publisher??id}</a>;
 return <div className="family-point">
  <h3>{shortFamilyName(f,lang)} · {familyDate(historyElections[at],lang)}</h3>
  <div className="family-point-total">{status&&<span>{status}</span>}{a.votes!==null&&!(a.votes===0n&&a.mixed)&&<b>{Number(a.votes).toLocaleString()} {L('counted votes','קולות שנספרו')}</b>}{!!a.mixed&&<span>{Number(a.mixed).toLocaleString()} {L('mixed-list votes · separate','קולות ברשימות מעורבות · בנפרד')}</span>}</div>
  {!ds.officialSeats&&<p className="small muted">{L('Calculated seats · Gazette unverified','מנדטים מחושבים · הפרסום ברשומות לא אומת')} <Info title={L('Seat counts','ספירת מנדטים')}>{L('Calculated from the published vote counts under this election’s rules. Gazetted seat counts are unavailable.','חושב מספירת הקולות שפורסמה לפי כללי הבחירות האלה. ספירת מנדטים שפורסמה ברשומות אינה זמינה.')}</Info></p>}
  <div className="family-point-lists">{lists.map(l=>{const member=row?.members.find(x=>x.listId===l.id),mixed=member?.scope==='mixed',counted=m.selected.has(l.id),separate=m.mixed.has(l.id);return <article key={l.id}>
   <div className="family-point-list"><Slip letters={l.letters} color={l.color} logo={l.logo} name={listLabel(l,lang)} size="sm"/><strong>{listLabel(l,lang)}</strong><span>{l.votes.toLocaleString()} {L('votes','קולות')} · {seats[l.id]??0} {L('seats','מנדטים')}</span></div>
   <p className="small">{mixed?L('Mixed list','רשימה מעורבת'):L('List','רשימה')} · {counted?L('Counted in family','נספרת במשפחה'):separate?L('Shown separately (hatched)','מוצגת בנפרד (מקווקוות)'):L('Not counted','לא נספרת')}{member?.headsList&&` · ${L('Family leads this list','המשפחה מובילה רשימה זו')}`}</p>
   {!!l.parties?.length&&<div className="family-point-parties">{l.parties.map(p=><span key={p.id}><Slip letters="" color={p.color??l.color} logo={p.logo} name={lang==='he'?p.nameHe:englishLabel(p.nameEn,p.nameHe)} size="sm"/>{lang==='he'?p.nameHe:englishLabel(p.nameEn,p.nameHe)}</span>)}</div>}
   <JointFacts listId={l.id}/>
   {member&&<Info title={L('Classification and sources','סיווג ומקורות')}><span>{lang==='en'?member.classificationEvidence.claim:'סיווג מערכתי לפי הגדרת המשפחה; אין הסקה על חלוקת קולות בין המרכיבים.'}</span>{member.classificationEvidence.sourceIds.map(id=>full.sources[id]?source(id,full.sources[id]):null)}</Info>}
  </article>;})}</div>
  {!lists.length&&<p>{L('No named lists.','אין רשימות מזוהות.')}</p>}
  {before&&<section className="family-point-changes"><h3>{L('Since','מאז')} {familyDate(before,lang)}</h3>
   {!(a.votes===0n&&a.mixed)&&<p>{L('Counted votes','קולות שנספרו')}: {delta===null?L('Unknown','לא ידוע'):<bdi dir="ltr">{delta>0n?'+':''}{Number(delta).toLocaleString()}</bdi>}</p>}
   {!!(a.mixed||prev?.mixed)&&<p>{L('Mixed-list votes','קולות ברשימות מעורבות')}: {mixedDelta===null?L('Unknown','לא ידוע'):<bdi dir="ltr">{mixedDelta>0n?'+':''}{Number(mixedDelta).toLocaleString()}</bdi>}</p>}
   {!!joined.length&&<p>{L('Now represented','מיוצגות כעת')}: {joined.map(id=>partyName(id)).join(' · ')}</p>}
   {!!left.length&&<p>{L('No longer represented','אינן מיוצגות עוד')}: {left.map(id=>partyName(id)).join(' · ')}</p>}
   {!joined.length&&!left.length&&<p>{L('No recorded constituent change','אין שינוי מתועד במרכיבים')}</p>}
   {edges.map(e=><p key={e.id}>{relation(e.relation)} · <bdi dir="ltr">{e.date}</bdi>: <bdi dir="ltr">{e.from.map(id=>partyName(id)).join(' + ')} → {e.to.map(id=>partyName(id)).join(' + ')}</bdi> <Info title={L('Relationship sources','מקורות לקשר')}>{e.sources.map(id=>{const s=lineage.sources[id as keyof typeof lineage.sources];return s?source(id,s):null;})}</Info></p>)}
   {previous&&<details><summary>{L('Previous ballot lists','הרשימות בבחירות הקודמות')}</summary>{previous.lists.filter(l=>{const m=membership(f,previous.id);return m.selected.has(l.id)||m.mixed.has(l.id)||m.excluded.has(l.id);}).map(l=><p key={l.id}>{listLabel(l,lang)} · {l.votes.toLocaleString()} {L('votes','קולות')}</p>)}</details>}
   <Info title={L('Reading the change','פירוש השינוי')}>{L('Compared under the current counting choice. Representation changes describe recorded constituent identities, not voter movement or the cause of a vote change. Names without English metadata are unofficial transliterations. Unrecorded mergers, splits and renamings stay unknown. Year-only relationship dates may overlap either election year. Whole joint-list votes cannot be divided among parties.','ההשוואה לפי אפשרות הספירה הנוכחית. שינויי ייצוג מתארים זהויות מרכיבים מתועדות, לא תנועת מצביעים או סיבה לשינוי בקולות. מיזוגים, פיצולים ושינויי שם שלא תועדו נשארים לא ידועים. תאריכים ברמת שנה בלבד עשויים לחפוף לשנת אחת הבחירות. אין לפצל קולות של רשימה משותפת בין מפלגותיה.')}</Info>
  </section>}
  <details><summary>{L('Election notes and sources','הערות ומקורות לבחירות')}</summary><p>{lang==='he'?ds.status.noteHe:ds.status.noteEn}</p>{Object.entries(full.sources).filter(([id])=>(row?.voteSourceIds as string[]|undefined)?.includes(id)).map(([id,s])=>source(id,s))}</details>
  <button className="btn primary" onClick={()=>void openFamilyElection(electionId,f)}>{L('Open this election','פתיחת הבחירות האלה')}</button>
 </div>;
}
