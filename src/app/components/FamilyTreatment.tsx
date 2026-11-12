import {familyLabel} from '../../families/labels.ts';
import {membership,resolve} from '../../families/model.ts';
import './families.css';
import type { Scenario } from '../../model/scenario.ts';
import {useL,useLang} from '../i18n.ts';
import {setState,useShown,useStore} from '../store.ts';
export function FamilyGroupingLink() { const L=useL(); return useShown('families') && <button className="btn" onClick={()=>setState({tool:'families'})}>{L('Apply family as grouping','קיבוץ לפי משפחת מפלגות')}</button>; }
export function FamilyListTreatment({s}:{s:Scenario}) { const L=useL(),lang=useLang(); const viewed=useStore(st=>st.familyView); const f=viewed??s.familyDefinition;
  // The mixed-list policy is named only where this election has mixed lists for it to act on.
  const mixed=!!f&&(()=>{const m=membership(f,s.electionId);return m.mixed.size+m.excluded.size>0||(f.defaultMixedPolicy==='include-whole-list'&&resolve({...f,defaultMixedPolicy:'separate-segment'},s).some(l=>l.family==='mixed'));})();
  return f?<p className="family-treatment">{familyLabel(f,lang)}{mixed&&<> · {policyName(f.defaultMixedPolicy,lang)}</>}{viewed&&<button className="btn small ghost" aria-label={L('Clear family view','ניקוי תצוגת המשפחה')} onClick={()=>setState({familyView:null})}>×</button>}</p>:null;
}
// Same vocabulary as the Party families "Mixed lists" choice.
const policyName=(v:string,lang:string)=> ({'include-headed-list':lang==='he'?'רשימות מעורבות: נספרות אם המשפחה בראש':'Mixed lists: counted if family heads it','separate-segment':lang==='he'?'רשימות מעורבות: בקווקוו, לא נספרות':'Mixed lists: hatched, not counted','include-whole-list':lang==='he'?'רשימות מעורבות: נספרות':'Mixed lists: counted',exclude:lang==='he'?'רשימות מעורבות: הושמטו':'Mixed lists: left out'}[v]);
