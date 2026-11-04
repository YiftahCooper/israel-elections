import {familyLabel} from '../../families/labels.ts';
import './families.css';
import type { Scenario } from '../../model/scenario.ts';
import {useL,useLang} from '../i18n.ts';
import {setState,useStore} from '../store.ts';
export function FamilyGroupingLink() { const L=useL(); return <button className="btn" onClick={()=>setState({tool:'families'})}>{L('Apply family as grouping','קיבוץ לפי משפחת מפלגות')}</button>; }
export function FamilyListTreatment({s}:{s:Scenario}) { const L=useL(),lang=useLang(); const viewed=useStore(st=>st.familyView); const f=viewed??s.familyDefinition;
  return f?<p className="family-treatment">{familyLabel(f,lang)} · {policyName(f.defaultMixedPolicy,lang)}{viewed&&<button className="btn small ghost" aria-label={L('Clear family view','ניקוי תצוגת המשפחה')} onClick={()=>setState({familyView:null})}>×</button>}</p>:null;
}
const policyName=(v:string,lang:string)=> ({'separate-segment':lang==='he'?'מעורבות בנפרד':'Mixed separately','include-whole-list':lang==='he'?'כל הרשימה המעורבת נכללת':'Include whole mixed list',exclude:lang==='he'?'מעורבות לא נכללות':'Exclude mixed lists'}[v]);
