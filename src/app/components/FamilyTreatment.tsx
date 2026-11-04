import './families.css';
import type { Scenario } from '../../model/scenario.ts';
import {useL,useLang} from '../i18n.ts';
import {setState} from '../store.ts';
export function FamilyGroupingLink() { const L=useL(); return <button className="btn" onClick={()=>setState({tool:'families'})}>{L('Apply family as grouping','קיבוץ לפי משפחת מפלגות')}</button>; }
export function FamilyListTreatment({s}:{s:Scenario}) { const L=useL(),lang=useLang(); const f=s.familyDefinition;
  return f?<p className="family-treatment">{L('Family grouping','קיבוץ לפי משפחה')}: {lang==='he'?f.nameHe:f.nameEn} · {policyName(f.defaultMixedPolicy,lang)}</p>:null;
}
const policyName=(v:string,lang:string)=> ({'separate-segment':lang==='he'?'מעורבות בנפרד':'Mixed separately','include-whole-list':lang==='he'?'כל הרשימה המעורבת נכללת':'Include whole mixed list',exclude:lang==='he'?'מעורבות לא נכללות':'Exclude mixed lists'}[v]);
