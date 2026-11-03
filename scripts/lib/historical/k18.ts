import { buildHistorical } from './k18-k19-common.ts';
export async function buildK18() {
  return buildHistorical({ n: 18, date: '2009-02-10', asOf: '2009-02-17',
    pairs: [['אמת', 'מרצ'], ['מחל', 'ל'], ['כן', 'רק'], ['ב', 'ט'], ['זך', 'צי'], ['שס', 'ג'], ['ו', 'עם'], ['חי', 'ה']],
    candidateLeaders: {"אמת": "ברק אהוד", "ב": "הרשקוביץ דניאל", "ג": "ליצמן יעקב", "ד": "זחאלקה ג'מאל", "ו": "ברכה מוחמד", "ט": "כץ יעקב דב", "כן": "לבני ציפי צפורה", "ל": "ליברמן אביגדור", "מחל": "נתניהו בנימין", "מרצ": "אורון חיים", "עם": "צרצור אברהים", "שס": "ישי אליהו"},
    candidateCounts: {"אמת": 120, "אר": 20, "ב": 34, "ג": 120, "ד": 105, "ה": 119, "ו": 119, "זך": 26, "חי": 48, "ט": 24, "ים": 23, "ינ": 9, "יק": 17, "כן": 120, "ל": 26, "מחל": 118, "מרצ": 120, "נ": 9, "נפ": 15, "נץ": 4, "נר": 10, "עם": 115, "פ": 12, "פי": 17, "פק": 2, "ץ": 11, "צי": 31, "ק": 40, "קנ": 9, "קפ": 7, "קץ": 16, "רק": 33, "שס": 114},
    totals: { registered: 5278985, votesCast: 3416587, invalid: 43097, valid: 3373490, ballotBoxes: 9264, localities: 0, envelopeVotes: 186919 },
    noteHe: 'תוצאות רשמיות. פסולים ובעלי זכות בחירה לפי זכרון הדברים של ועדת הבחירות, השונה ממספר הפסולים ברשומות. נתוני היישובים נגזרו מסיכום הקלפיות; ועדה אזורית אינה ידועה (0). המועמדים לפי הפרסום המקורי; שינויים מאוחרים אינם מוחלים. ראו החלטה 0040.',
    noteEn: 'Official results. Invalid ballots and electorate follow the CEC allocation memorandum, differing from the gazette invalid count. Localities are derived from polling stations, not independently sourced; committee is unknown (0). Candidate rosters are the original gazette snapshot; subsequent changes are not applied. See decision 0040.',
  });
}
