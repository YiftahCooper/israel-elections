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
 if(ds.id==='k17')return {...loc,groups:[],demographicNoteEn:'Not available for 2006: its results by locality have no locality codes and no registered-voter counts.',demographicNoteHe:'לא זמין ל־2006: בתוצאות לפי יישוב אין סמלי יישוב ואין מספרי בעלי זכות בחירה.'};
 const electionYear=Number(ds.electionDate.slice(0,4));
 const year=Math.min(electionYear,2024);
 const sourceIds=[`cbs-${year}`,`cbs-${year}-normalized`,'cbs-intro','idi-haredi','cbs-druze-2022','cbs-development'];
 verifySources(sourceIds,check);
 const classes=rawJson<Classification[]>(`demographics/cbs-${year}-normalized.json`);
 const byCode=new Map(classes.map(c=>[c.code,c]));
 // Subdistrict 77 of district 7 is Hebron (Kiryat Arba, Karmel, Otniel ...), not Gaza: the Gaza Strip localities were district 8
 // in the 2003 file. The Jewish community in Hebron votes under the committee's code 3400, which no CBS file lists.
 const HEBRON=3400;
 const defs:{id:string;he:string;en:string;year:number;sources:string[];definitionEn:string;definitionHe:string;test:(c:Classification)=>boolean;extra?:number[]}[]=[
 {id:'arab',he:'יישובים ערביים',en:'Arab localities',year,sources:sourceIds.slice(0,3),definitionEn:'Localities that the Central Bureau of Statistics classes as non-Jewish, including Druze and Circassian ones, and Bedouin tribes. Mixed Jewish–Arab localities are not included.',definitionHe:'יישובים שהלמ״ס מסווגת כלא יהודיים, כולל יישובים דרוזיים וצ׳רקסיים, ושבטי בדווים. יישובים מעורבים יהודיים–ערביים אינם כלולים.',test:c=>c.religion===2||c.religion===3},
 {id:'kibbutzim',he:'קיבוצים',en:'Kibbutzim',year,sources:sourceIds.slice(0,3),definitionEn:'Localities that the Central Bureau of Statistics classes as kibbutzim.',definitionHe:'יישובים שהלמ״ס מסווגת כקיבוצים.',test:c=>c.form===330},
 {id:'moshavim',he:'מושבים',en:'Moshavim',year,sources:sourceIds.slice(0,3),definitionEn:'Localities that the Central Bureau of Statistics classes as moshavim, including collective moshavim.',definitionHe:'יישובים שהלמ״ס מסווגת כמושבים, כולל מושבים שיתופיים.',test:c=>c.form===310||c.form===320},
 {id:'judea-samaria',he:'יישובים ישראליים ביהודה ושומרון',en:'Israeli localities in Judea and Samaria',year,sources:sourceIds.slice(0,3),definitionEn:'Localities in the Central Bureau of Statistics’ Judea and Samaria district, and the Jewish community in Hebron.',definitionHe:'היישובים במחוז יהודה ושומרון של הלמ״ס, וכן היישוב היהודי בחברון.',test:c=>c.district===7,extra:[HEBRON]},
 {id:'bedouin-tribes',he:'שבטי בדווים',en:'Bedouin tribes',year,sources:sourceIds.slice(0,3),definitionEn:'Localities that the Central Bureau of Statistics classes as Bedouin tribes. This is not all recognised Bedouin towns.',definitionHe:'יישובים שהלמ״ס מסווגת כשבטי בדווים. אין אלה כל היישובים הבדואיים המוכרים.',test:c=>c.form===460},
 {id:'haredi',he:'שבע הרשויות החרדיות (הגדרת 2021)',en:'Seven Haredi authorities (2021 reference)',year:2021,sources:['idi-haredi'],definitionEn:'The seven local authorities on the Israel Democracy Institute’s 2021 list: Bnei Brak, Modi’in Illit, Beitar Illit, Elad, Rekhasim, Qiryat Yearim and Immanuel. The same list is used for every election.',definitionHe:'שבע הרשויות המקומיות ברשימה של המכון הישראלי לדמוקרטיה משנת 2021: בני ברק, מודיעין עילית, ביתר עילית, אלעד, רכסים, קריית יערים ועמנואל. אותה רשימה משמשת לכל מערכות הבחירות.',test:c=>haredi.includes(c.code)},
 {id:'druze',he:'יישובים דרוזיים — לפחות 95% ב-2022',en:'Druze localities — ≥95% in 2022',year:2022,sources:['cbs-druze-2022',...(ds.id==='k18'?['k18-ballots-datagov']:[])],definitionEn:'The 13 localities where at least 95% of residents were Druze at the end of 2022, according to the Central Bureau of Statistics. The same list is used for every election; the merged Carmel City of 2009 is left out because it also included Isfiya.',definitionHe:'13 היישובים שבהם לפחות 95% מהתושבים היו דרוזים בסוף 2022, לפי הלמ״ס. אותה רשימה משמשת לכל מערכות הבחירות; עיר כרמל המאוחדת של 2009 אינה כלולה, כי כללה גם את עספיא.',test:c=>druze.includes(c.code)&&!(ds.id==='k18'&&c.code===494)},
 {id:'development-towns',he:'עיירות פיתוח — רשימת מחקר הלמ״ס 2007',en:'Development towns — CBS research list 2007',year:2007,sources:['cbs-development'],definitionEn:'The 15 development towns on a 2007 Central Bureau of Statistics research list; not a current official list.',definitionHe:'15 עיירות הפיתוח ברשימת מחקר של הלמ״ס משנת 2007; לא רשימה רשמית עדכנית.',test:c=>development.includes(c.code)},
 ];
 const groups:LocalityGroup[]=defs.flatMap(d=>{
  const rows=loc.rows.filter(r=>!isEnvelopeRow(r)&&r.code!==null&&(byCode.has(r.code)&&d.test(byCode.get(r.code)!)||!!d.extra?.includes(r.code)));
  if(!rows.length)return [];
  const valid=rows.reduce((t,r)=>t+r.valid,0);
  return [{id:d.id,nameHe:d.he,nameEn:d.en,classificationYear:d.year,sourceIds:d.sources,definitionHe:d.definitionHe,definitionEn:d.definitionEn,codes:rows.map(r=>r.code!).sort((a,b)=>a-b),coverage:{localities:rows.length,registered:rows.some(r=>r.registered===null)?null:rows.reduce((t,r)=>t+r.registered!,0),valid,nationalValidShare:valid/ds.totals.valid}}];
 });
 return {...loc,groups,demographicNoteEn:'The figures count everyone voting in these places, not only members of the group. Double-envelope votes are not included.',demographicNoteHe:'הנתונים כוללים את כל המצביעים ביישובים אלה, לא רק את בני הקבוצה. קולות המעטפות הכפולות אינם כלולים.'};
}
