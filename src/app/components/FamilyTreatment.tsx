import {familyLabel} from '../../families/labels.ts';
import {membership,resolve} from '../../families/model.ts';
import './families.css';
import type { Scenario } from '../../model/scenario.ts';
import {useL,useLang} from '../i18n.ts';
import {setState,useStore} from '../store.ts';
export function FamilyGroupingLink() { const L=useL(); return <button className="btn" onClick={()=>setState({tool:'families'})}>{L('Apply family as grouping','קיבוץ לפי משפחת מפלגות')}</button>; }
export function FamilyListTreatment({s}:{s:Scenario}) { const L=useL(),lang=useLang(); const viewed=useStore(st=>st.familyView); const f=viewed??s.familyDefinition;
  // The mixed-list policy is named only where this election has mixed lists for it to act on.
  const mixed=!!f&&(()=>{const m=membership(f,s.electionId);return m.mixed.size+m.excluded.size>0||(f.defaultMixedPolicy==='include-whole-list'&&resolve({...f,defaultMixedPolicy:'separate-segment'},s).some(l=>l.family==='mixed'));})();
  return f?<p className="family-treatment">{familyLabel(f,lang)}{mixed&&<> · {policyName(f.defaultMixedPolicy,lang)}</>}{viewed&&<button className="btn small ghost" aria-label={L('Clear family view','ניקוי תצוגת המשפחה')} onClick={()=>setState({familyView:null})}>×</button>}</p>:null;
}
const policyName=(v:string,lang:string)=> ({'include-headed-list':lang==='he'?'כולל אם המשפחה בראש':'Include if family heads list','separate-segment':lang==='he'?'מעורבות בנפרד':'Mixed separately','include-whole-list':lang==='he'?'כל הרשימה המעורבת נכללת':'Include whole mixed list',exclude:lang==='he'?'מעורבות לא נכללות':'Exclude mixed lists'}[v]);
