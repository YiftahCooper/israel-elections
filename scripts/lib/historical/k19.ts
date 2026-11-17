import { buildHistorical } from './k18-k19-common.ts';
export async function buildK19() {
  const built = await buildHistorical({ n: 19, date: '2013-01-22', asOf: '2013-01-30',
    pairs: [['אמת', 'פה'], ['ג', 'שס'], ['ד', 'ו'], ['זך', 'צק'], ['טב', 'מחל'], ['כן', 'ץ'], ['צפ', 'מרצ']],
    candidateLeaders: {"אמת": "יחימוביץ' רחל שלי", "ג": "ליצמן יעקב", "ד": "זחאלקה גמאל", "ו": "ברכה מוחמד", "טב": "בנט נפתלי", "כן": "מופז שאול", "מחל": "נתניהו בנימין", "מרצ": "גלאון זהבה", "עם": "צרצור אברהים", "פה": "לפיד יאיר", "צפ": "לבני ציפי", "שס": "ישי אליהו"},
    candidateCounts: {"אמת": 120, "ג": 120, "ד": 117, "הי": 25, "הפ": 15, "הק": 11, "ו": 120, "ז": 9, "זך": 19, "טב": 79, "יק": 7, "כן": 92, "מחל": 119, "מרצ": 120, "נ": 8, "ני": 10, "נץ": 54, "נק": 9, "עם": 112, "פ": 34, "פה": 120, "פז": 17, "פי": 11, "פנ": 11, "פץ": 12, "צפ": 46, "צק": 13, "ץ": 15, "ק": 44, "קנ": 14, "רק": 10, "שס": 82},
    totals: { registered: 5656705, votesCast: 3833646, invalid: 40904, valid: 3792742, ballotBoxes: 10109, localities: 0, envelopeVotes: 215789 },
    noteHe: 'תוצאות רשמיות של ועדת הבחירות. קולות הרשימות לפי התוצאה המוכרזת בהודעה ברשומות (י"פ 6540), שלפיה חולקו המנדטים; סך הכשרים המודפס בה, 3,792,472, תוקן רשמית ל־3,792,742 בי"פ 6546 (12 בפברואר 2013, עמ׳ 2874). בתוצאות הסופיות באתר ועדת הבחירות, המתואמות עם כל הקלפיות, שלוש רשימות שונות במעט (הליכוד ביתנו 109+, קדימה 107−, הישראלים 2−), ולכן סיכומי המפה ורשימת היישובים שונים מהטבלה הראשית בעד 109 קולות. אותם מנדטים בדיוק בשתי הגרסאות. מעטפות חיצוניות (875) נגזרו מהקלפיות. המועמדים לפי הפרסום המקורי; שינויים מאוחרים אינם מוחלים.',
    noteEn: 'Official Central Elections Committee results. List votes follow the declared result in the gazette notice (Yalkut HaPirsumim 6540), by which the seats were handed out; its printed valid total, 3,792,472, was formally corrected to 3,792,742 by Yalkut HaPirsumim 6546 (12 February 2013, p.2874). In the Central Elections Committee final results, which reconcile with every polling station, three lists differ slightly (Likud–Yisrael Beiteinu +109, Kadima −107, Hayisraelim −2), so the map and the list of places differ from the main table by up to 109 votes. Both versions give exactly the same seats. External envelopes (code 875) are derived from polling rows. Candidate rosters are the original gazette snapshot; later changes are not applied.',
  });
  // The approved name in YP 6524 controls identity; YP 6540 merges two words in error.
  const balad = built.ds.lists.find(l => l.letters === 'ד')!;
  balad.nameHe = 'בל"ד - אלתג\'מוע אלווטני אלדמוקרטי';
  balad.notesHe.push('השם לפי הודעת המועמדים בי"פ 6524; בי"פ 6540 נדפס בטעות אלתג\'אלווטני.');
  return built;
}
