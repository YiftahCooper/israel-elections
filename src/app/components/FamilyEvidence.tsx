import { MarkedText } from './LangLabel.tsx';
import {useEffect,useState} from 'react';
import {fullDefinition} from '../../families/catalogue.ts';
import {citedSources,type Family} from '../../families/model.ts';
import {useL,useLang} from '../i18n.ts';
import {PageAndQuote} from './BookQuote.tsx';
import {sourceLinkText} from '../hewiki.ts';
/** A family's definition, the sources its placements cite and its limitations, as a reader sees them: each source named by
 *  who published it, the official results once (not once per election), never the research notes kept with a source. */
export function FamilyEvidence({family}:{family:Family}) {
 const [full,setFull]=useState<Family|null>(null),[error,setError]=useState(false),L=useL(),lang=useLang();
 useEffect(()=>{let live=true;fullDefinition(family).then(f=>{if(live)setFull(f);}).catch(()=>setError(true));return()=>{live=false;};},[family]);
 if(!full)return <p role="status">{error?L('Evidence could not be loaded.','לא ניתן לטעון את הראיות.'):L('Loading evidence…','טעינת ראיות…')}</p>;
 const name=(s:Family['sources'][string])=>(lang==='he'&&s.publisherHe)||s.publisher||L('Source','מקור');
 const cited=citedSources(full),results=cited.filter(([,s])=>s.kind==='repository-dataset'),others=cited.filter(([,s])=>s.kind!=='repository-dataset');
 const limitations=(lang==='he'&&Array.isArray(full.limitationsHe)?full.limitationsHe:Array.isArray(full.limitations)?full.limitations:[]) as unknown[];
 return <div className="family-evidence"><h3>{lang==='he'?full.nameHe:full.nameEn}</h3><p>{lang==='he'?full.definitionHe:full.definition}</p><p>{L('It counts ballots for the chosen lists and never guesses who voted for them. A mixed list’s votes cannot be split among its parties; the vote chart’s solid line estimates the family’s part by its elected members, and says so.','נספרים פתקים לרשימות שנבחרו, בלי לנחש מי הצביע להן. אי אפשר לפצל קולות של רשימה מעורבת בין מפלגותיה; הקו המלא בתרשים הקולות מעריך את חלק המשפחה לפי נבחריה, ואומר זאת.')}</p>
  {!!results.length&&<p>{name(results[0][1])}</p>}
  {others.map(([id,s])=><p key={id}>{s.url?<a href={s.url} target="_blank" rel="noreferrer"><MarkedText text={sourceLinkText(s.url, name(s), lang)} /></a>:name(s)}<PageAndQuote locator={s.locator}/></p>)}
  <h3>{L('Limitations','מגבלות')}</h3><ul>{limitations.map((s,i)=><li key={i}>{String(s)}</li>)}</ul></div>;
}
