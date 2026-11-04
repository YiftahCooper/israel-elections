import {useEffect,useState} from 'react';
import {fullDefinition} from '../../families/catalogue.ts';
import type {Family} from '../../families/model.ts';
import {useL,useLang} from '../i18n.ts';
export function FamilyEvidence({family}:{family:Family}) {
 const [full,setFull]=useState<Family|null>(null),[error,setError]=useState(false),L=useL(),lang=useLang();
 useEffect(()=>{let live=true;fullDefinition(family).then(f=>{if(live)setFull(f);}).catch(()=>setError(true));return()=>{live=false;};},[family]);
 if(!full)return <p role="status">{error?L('Evidence could not be loaded.','לא ניתן לטעון את הראיות.'):L('Loading evidence…','טעינת ראיות…')}</p>;
 const limitationsHe=(full.id==='haredi'||full.forkedFrom?.id==='haredi')?[
 'נבדקו כל 26 הקבצים המקומיים, אך אין טענה לסיווג ממצה של כל רשימה קטנה. מקרים הדורשים ראיות נוספות נשארים מפורשים ולא נכללים בשקט.',
 'ב־1949 אין מספר קולות נפרד לאגודת ישראל ולפועלי אגודת ישראל; נתון הליבה אינו ידוע ואינו אפס.',
 'נתוני 2026 שומרים על מעמד הספירה הסופית שטרם פורסמה ברשומות; אין כאן אישור עצמאי חדש לתוצאות.',
 'מזהי המרכיבים הקיימים נשמרו גם כששלמות רשימת המועמדים אינה ודאית. הצעות למיפוי רשימות יחיד אינן הופכות אותן אוטומטית למרכיבים בנתוני הבחירות.',
 'מזהי המפלגות המוצעים מציינים מיפויי הופעה חסרים, ובהם גם זהויות קנוניות שכבר קיימות, ולא בהכרח מפלגות חדשות במאגר.'
 ]:[
 'הטיוטה נשענת על סקירת המקורות המוגדרת במחקר. הסיווג הוא פרשנות ואינו סיווג רשמי.',
 'זהויות של רשימות קטנות וגבולות אידאולוגיים שטרם הוכרעו דורשים סקירה נוספת; הם מפורטים במקרים המוחרגים ובמחלוקות שבמרשם.'
 ];
 return <div className="family-evidence"><h3>{lang==='he'?full.nameHe:full.nameEn}</h3><p>{lang==='he'?full.definitionHe:full.definition}</p><p>{L('Revision','גרסה')}: {full.revision}</p><p>{L('Selected ballots, never a demographic estimate. Whole mixed lists remain a convention, not a constituent vote split.','פתקים לרשימות נבחרות, לא אומדן דמוגרפי. הכללת רשימה מעורבת שלמה היא מוסכמה ולא פיצול קולות למרכיבים.')}</p>{Object.entries(full.sources).map(([id,s])=><p key={id}>{s.url?<a href={s.url} target="_blank" rel="noreferrer">{s.publisher??L('Source','מקור')}</a>:L('Local election record','פרסום הבחירות המקומי')}{lang==='en'&&typeof s.support==='string'&&` — ${s.support}`}</p>)}<h3>{L('Limitations','מגבלות')}</h3><ul>{(lang==='he'?limitationsHe:Array.isArray(full.limitations)?full.limitations:[]).map((s,i)=><li key={i}>{String(s)}</li>)}</ul></div>;
}
