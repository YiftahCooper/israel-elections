import { isEnvelopeRow, type ElectionDataset, type LocalityDataset, type LocalityGroup } from '../../../src/data/schema.ts';
import { rawJson, verifySources } from './sources.ts';
interface Classification {code:number;nameHe:string;religion:number|null;form:number|null;district:number|null;subdistrict:number|null}
const check = (ok: unknown, message:string): asserts ok => {if(!ok)throw new Error(message);};
const haredi=[6100,3797,3780,1309,922,1137,3660];
const druze=[494,502,480,4201,1296,1295,4001,485,496,525,4203,4502,546];
const development=[31,9200,2200,2034,831,874,1063,99,246,2560,2630,1034,2800,1031,812];
/** Apply geographic reference definitions, matching codes only, never names or vote preferences. */
export function attachDemographics(ds:ElectionDataset, loc:LocalityDataset):LocalityDataset {
 if(ds.knesset<16)return loc;
 if(ds.id==='k17')return {...loc,groups:[],demographicNoteEn:'Unavailable: 2006 locality results have neither CBS codes nor registered-voter counts.',demographicNoteHe:'לא זמין: תוצאות היישובים ב-2006 חסרות סמלי יישוב ומספרי בעלי זכות בחירה.'};
 const electionYear=Number(ds.electionDate.slice(0,4));
 const year=Math.min(electionYear,2024);
 const sourceIds=[`cbs-${year}`,`cbs-${year}-normalized`,'cbs-intro','idi-haredi','cbs-druze-2022','cbs-development'];
 verifySources(sourceIds,check);
 const classes=rawJson<Classification[]>(`demographics/cbs-${year}-normalized.json`);
 const byCode=new Map(classes.map(c=>[c.code,c]));
 const defs:{id:string;he:string;en:string;year:number;sources:string[];definitionEn:string;definitionHe:string;test:(c:Classification)=>boolean}[]=[
 {id:'arab',he:'יישובים ערביים',en:'Arab localities',year,sources:sourceIds.slice(0,3),definitionEn:'CBS non-Jewish localities (religion code 2) and Bedouin tribes (3); mixed Jewish–Arab localities (4) excluded. Includes Druze and Circassian localities.',definitionHe:'יישובים לא יהודיים (דת 2) ושבטי בדווים (3) לפי הלמ״ס; יישובים יהודיים–ערביים מעורבים (4) אינם כלולים. כולל יישובים דרוזיים וצ׳רקסיים.',test:c=>c.religion===2||c.religion===3},
 {id:'kibbutzim',he:'קיבוצים',en:'Kibbutzim',year,sources:sourceIds.slice(0,3),definitionEn:'CBS current locality form 330 (33 before 2007).',definitionHe:'צורת יישוב שוטפת 330 בלמ״ס (33 לפני 2007).',test:c=>c.form===330},
 {id:'moshavim',he:'מושבים',en:'Moshavim',year,sources:sourceIds.slice(0,3),definitionEn:'CBS current locality forms 310/320: moshavim and collective moshavim.',definitionHe:'צורות יישוב שוטפות 310/320: מושבים ומושבים שיתופיים.',test:c=>c.form===310||c.form===320},
 {id:'judea-samaria',he:'יישובים ישראליים ביהודה ושומרון',en:'Israeli localities in Judea and Samaria',year,sources:sourceIds.slice(0,3),definitionEn:'CBS district 7; subdistrict 77 (Gaza in older files) excluded.',definitionHe:'מחוז 7 בלמ״ס, ללא נפה 77 (חבל עזה בקבצים ישנים).',test:c=>c.district===7&&c.subdistrict!==77},
 {id:'bedouin-tribes',he:'שבטי בדווים',en:'Bedouin tribes',year,sources:sourceIds.slice(0,3),definitionEn:'CBS current locality form 460: Bedouin tribes only; not all recognized Bedouin towns.',definitionHe:'צורת יישוב שוטפת 460: שבטי בדווים בלבד; לא כל היישובים הבדואיים המוכרים.',test:c=>c.form===460},
 {id:'haredi',he:'שבע הרשויות החרדיות (הגדרת 2021)',en:'Seven Haredi authorities (2021 reference)',year:2021,sources:['idi-haredi'],definitionEn:'Fixed IDI seven-authority list (2021 population table): Bnei Brak, Modi’in Illit, Beitar Illit, Elad, Rekhasim, Qiryat Yearim, Immanuel. Political authority definition, not a CBS religion flag; projected onto this election, not a contemporaneous classification.',definitionHe:'רשימה קבועה של שבע רשויות במכון הישראלי לדמוקרטיה (נתוני 2021): בני ברק, מודיעין עילית, ביתר עילית, אלעד, רכסים, קריית יערים ועמנואל. הגדרת רשות פוליטית, לא דת בלמ״ס; קבוצת ייחוס המוחלת על הבחירות ולא סיווג בן הזמן.',test:c=>haredi.includes(c.code)},
 {id:'druze',he:'יישובים דרוזיים — לפחות 95% ב-2022',en:'Druze localities — ≥95% in 2022',year:2022,sources:['cbs-druze-2022',...(ds.id==='k18'?['k18-ballots-datagov']:[])],definitionEn:'Fixed 13 localities with ≥95% Druze population in CBS release 124/2024 table B, end 2022; projected onto this election. Mixed-religion Arab localities below 95% excluded. The merged 2009 Carmel City row (494) is excluded because it also includes Isfiya.',definitionHe:'13 יישובים שבהם לפחות 95% דרוזים בלוח ב בהודעת הלמ״ס 124/2024, סוף 2022; קבוצת ייחוס המוחלת על הבחירות. יישובים ערביים מעורבי דתות מתחת לסף אינם כלולים. עיר כרמל המאוחדת ב-2009 (494) אינה כלולה משום שהיא כוללת גם את עספיא.',test:c=>druze.includes(c.code)&&!(ds.id==='k18'&&c.code===494)},
 {id:'development-towns',he:'עיירות פיתוח — רשימת מחקר הלמ״ס 2007',en:'Development towns — CBS research list 2007',year:2007,sources:['cbs-development'],definitionEn:'Fixed 15-town research definition in CBS working paper 25, p.81 (2007); not a current statutory eligibility list.',definitionHe:'רשימת 15 עיירות בנייר עבודה 25 של הלמ״ס, עמ׳ 81 (2007); הגדרת מחקר, לא רשימת זכאות חוקית עדכנית.',test:c=>development.includes(c.code)},
 ];
 const groups:LocalityGroup[]=defs.flatMap(d=>{
  const rows=loc.rows.filter(r=>!isEnvelopeRow(r)&&r.code!==null&&byCode.has(r.code)&&d.test(byCode.get(r.code)!));
  if(!rows.length)return [];
  const valid=rows.reduce((t,r)=>t+r.valid,0);
  return [{id:d.id,nameHe:d.he,nameEn:d.en,classificationYear:d.year,sourceIds:d.sources,definitionHe:d.definitionHe,definitionEn:d.definitionEn,codes:rows.map(r=>r.code!).sort((a,b)=>a-b),coverage:{localities:rows.length,registered:rows.some(r=>r.registered===null)?null:rows.reduce((t,r)=>t+r.registered!,0),valid,nationalValidShare:valid/ds.totals.valid}}];
 });
 return {...loc,groups,demographicNoteEn:'Places, not people. Envelopes excluded. CBS year '+year+'; separately dated fixed-reference definitions are not historical demographic estimates.',demographicNoteHe:'מקומות, לא אנשים. מעטפות חיצוניות אינן כלולות. שנת הלמ״ס '+year+'; הגדרות ייחוס המתוארכות בנפרד אינן אומדנים דמוגרפיים היסטוריים.'};
}
