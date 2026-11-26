import { buildHistorical } from './k22-k24-common.ts';

export async function buildK24() {
  return buildHistorical({
    n: 24, date: '2021-03-23',
    noteEn: '38 lists ran; Demokratit withdrew. The 12,926 polling-station results are 12,127 ordinary polling stations and 799 central counts of double-envelope votes. The Elections Committee\'s 2021 annual report counts 13,756 polling stations, including those abroad and not counting army bases; its historical summary gives 13,685.',
    noteHe: 'התמודדו 38 רשימות; דמוקרטית פרשה. 12,926 תוצאות הקלפי הן 12,127 קלפיות רגילות ו־799 ספירות מרכזיות של מעטפות כפולות. בדוח השנתי של ועדת הבחירות לשנת 2021 נמנו 13,756 קלפיות, כולל נציגויות בחו״ל ובלי מחנות צה״ל; בסקירה ההיסטורית שלה מופיע 13,685.',
    counts: {"אמת": 71, "ב": 38, "ג": 120, "ודעם": 120, "ז": 6, "זץ": 10, "ט": 21, "י": 4, "יז": 21, "ינ": 11, "יף": 11, "יק": 7, "יר": 5, "כ": 5, "כך": 7, "כן": 55, "ל": 23, "מחל": 120, "מרצ": 120, "נ": 4, "ני": 40, "נר": 5, "עם": 116, "ףז": 13, "פה": 120, "ץ": 14, "צי": 7, "צכ": 49, "צף": 6, "ק": 2, "קי": 4, "קך": 7, "קץ": 7, "ר": 11, "רנ": 4, "רף": 6, "רק": 34, "שס": 120, "ת": 62},
    // Shown: none. The three resignations before polling day are noted beside each candidate (data/meta/candidate-notes.json).
    readerNotes: {},
    // the official notice text, checked verbatim against the gazette
    notes: {"צכ": ["סיזאר אבו סאלם מרשימת \"מען (יחד) לעידן חדש\" התפטר מרשימת המועמדים ביום י\"ט באדר התשפ\"א (3 במרס 2021;)"], "זץ": ["יאיר שמואל פרג'ון מרשימת \"צומת - עצמאים, חקלאים, כפרים\" התפטר מרשימת המועמדים ביום כ\"ו באדר התשפ\"א (10 במרס 2021;)"], "ת": ["שלמה ברק מרשימת \"תקווה חדשה בהנהגת גדעון סער לראשות הממשלה\" התפטר מרשימת המועמדים ביום כ\"ו באדר התשפ\"א (10 במרס 2021.)"]},
    leaders: {"מחל": "נתניהו בנימין", "פה": "לפיד יאיר", "שס": "דרעי אריה מכלוף", "כן": "גנץ בנימין", "ב": "בנט נפתלי", "אמת": "מיכאלי מירב", "ג": "גפני משה רפאל", "ל": "ליברמן אביגדור", "ט": "סמוטריץ בצלאל יואל", "ודעם": "עודה איימן", "ת": "סער גדעון משה", "מרצ": "הורוביץ ניצן", "עם": "עבאס מנסור"},
  });
}
