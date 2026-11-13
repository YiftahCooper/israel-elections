import {useEffect,useState} from 'react';
import {fullDefinition} from '../../families/catalogue.ts';
import {citedSources,type Family} from '../../families/model.ts';
import {useL,useLang} from '../i18n.ts';
export function FamilyEvidence({family}:{family:Family}) {
 const [full,setFull]=useState<Family|null>(null),[error,setError]=useState(false),L=useL(),lang=useLang();
 useEffect(()=>{let live=true;fullDefinition(family).then(f=>{if(live)setFull(f);}).catch(()=>setError(true));return()=>{live=false;};},[family]);
 if(!full)return <p role="status">{error?L('Evidence could not be loaded.','לא ניתן לטעון את הראיות.'):L('Loading evidence…','טעינת ראיות…')}</p>;
 const limitationsHe=(full.id==='haredi'||full.forkedFrom?.id==='haredi')?[
 'נבדקו נתוני כל 26 מערכות הבחירות, אך לא כל רשימה קטנה סווגה. רשימות שדרושות עליהן עוד ראיות רשומות בנפרד ואינן נספרות.',
 'ב־1949 אין מספר קולות נפרד לאגודת ישראל ולפועלי אגודת ישראל; הקולות של המפלגות עצמן אינם ידועים, והם אינם אפס.',
 'נתוני 2026 מבוססים על התוצאות הסופיות הרשמיות של ועדת הבחירות, כפי שפורסמו ברשומות (ילקוט הפרסומים 15100, 4.11.2026).',
 'מפלגות שכבר רשומות כחלק מרשימה נשארות כך גם כשלא ברור שרשימת המועמדים שלמה. מפלגה שהוצע לקשר לרשימה אינה נוספת לנתוני הבחירות מעצם ההצעה.',
 'המפלגות המוצעות הן מפלגות שחסר להן קישור לרשימות שבהן הופיעו. חלקן כבר קיימות בנתונים, ולא כולן מפלגות חדשות.'
 ]:[
 'הסיווג מבוסס על המקורות שנסקרו במחקר. הוא פרשנות, לא סיווג רשמי.',
 'רשימות קטנות שזהותן לא הוכרעה, ומקרי גבול מבחינה רעיונית, עוד דורשים בדיקה; הם מפורטים ברשימת המקרים שהוצאו ובמחלוקות.'
 ];
 return <div className="family-evidence"><h3>{lang==='he'?full.nameHe:full.nameEn}</h3><p>{lang==='he'?full.definitionHe:full.definition}</p><p>{L('Revision','גרסה')}: {full.revision}</p><p>{L('Selected ballots, never a demographic estimate. Whole mixed lists remain a convention, not a constituent vote split.','פתקים לרשימות נבחרות, לא אומדן דמוגרפי. הכללת רשימה מעורבת שלמה היא מוסכמה ולא פיצול קולות למרכיבים.')}</p>{citedSources(full).map(([id,s])=><p key={id}>{s.url?<a href={s.url} target="_blank" rel="noreferrer">{s.publisher??L('Source','מקור')}</a>:L('Election data stored in the app','נתוני הבחירות השמורים באפליקציה')}{lang==='en'&&typeof s.support==='string'&&` — ${s.support}`}</p>)}<h3>{L('Limitations','מגבלות')}</h3><ul>{(lang==='he'?limitationsHe:Array.isArray(full.limitations)?full.limitations:[]).map((s,i)=><li key={i}>{String(s)}</li>)}</ul></div>;
}
