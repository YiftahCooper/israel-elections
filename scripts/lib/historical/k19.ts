import { buildHistorical } from './k18-k19-common.ts';
export async function buildK19() {
  return buildHistorical({ n: 19, date: '2013-01-22', asOf: '2013-01-30',
    pairs: [['אמת', 'פה'], ['ג', 'שס'], ['ד', 'ו'], ['זך', 'צק'], ['טב', 'מחל'], ['כן', 'ץ'], ['צפ', 'מרצ']],
    candidateLeaders: {"אמת": "יחימוביץ' רחל שלי", "ג": "ליצמן יעקב", "ד": "זחאלקה גמאל", "ו": "ברכה מוחמד", "טב": "בנט נפתלי", "כן": "מופז שאול", "מחל": "נתניהו בנימין", "מרצ": "גלאון זהבה", "עם": "צרצור אברהים", "פה": "לפיד יאיר", "צפ": "לבני ציפי", "שס": "ישי אליהו"},
    candidateCounts: {"אמת": 120, "ג": 120, "ד": 117, "הי": 25, "הפ": 15, "הק": 11, "ו": 120, "ז": 9, "זך": 19, "טב": 79, "יק": 7, "כן": 92, "מחל": 119, "מרצ": 120, "נ": 8, "ני": 10, "נץ": 54, "נק": 9, "עם": 112, "פ": 34, "פה": 120, "פז": 17, "פי": 11, "פנ": 11, "פץ": 12, "צפ": 46, "צק": 13, "ץ": 15, "ק": 44, "קנ": 14, "רק": 10, "שס": 82},
    totals: { registered: 5656705, votesCast: 3833646, invalid: 40904, valid: 3792742, ballotBoxes: 10109, localities: 0, envelopeVotes: 215789 },
    noteHe: 'נתוני בדיקה בלבד — הבחירות אינן זמינות באינדקס. הקולות לפי התוצאות הסופיות באתר ועדת הבחירות ובמאגר הממשלתי. מעטפות חיצוניות (875) נגזרו מהקלפיות; יתר היישובים ממקור נפרד. ברשומות מופיע סך כשרים נמוך ב־270, ושלוש רשימות שונות. הסבר רשמי לשינויים וזיהוי הקלפיות טרם אומתו. המועמדים לפי הפרסום המקורי; שינויים מאוחרים אינם מוחלים. ועדה אזורית אינה ידועה (0). ראו החלטה 0041.',
    noteEn: 'Verification dataset; unavailable in the election index. Votes follow the CEC final results and government datastore. External envelopes (code 875) are derived from polling rows; other localities are independently sourced. The gazette valid total is 270 lower and three list totals differ. An official explanation and affected polling stations remain unverified. Candidate rosters are the original gazette snapshot; subsequent changes are not applied. Committee is unknown (0). See decision 0041.',
  });
}
