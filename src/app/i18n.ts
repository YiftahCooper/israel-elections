import { createContext, useContext } from 'react';

export type Lang = 'he' | 'en';
export const LangContext = createContext<Lang>('he');

/** Inline bilingual strings: L('Votes', 'קולות'). Keeps each string next to its use. */
export function useL() {
  const lang = useContext(LangContext);
  return (en: string, he: string) => (lang === 'he' ? he : en);
}
export const useLang = () => useContext(LangContext);

/** Glossary of electoral terms with exact definitions (shown in tooltips and on the Sources tab). */
export const GLOSSARY: { id: string; he: string; en: string; defHe: string; defEn: string }[] = [
  { id: 'valid', he: 'קולות כשרים', en: 'Valid votes', defHe: 'כל הקולות שנספרו לטובת רשימה כלשהי, כולל רשימות שלא עברו את אחוז החסימה. אינם כוללים פתקים פסולים.', defEn: 'Every vote counted for any list, including lists that failed the threshold. Excludes invalid ballots.' },
  { id: 'threshold', he: 'אחוז החסימה', en: 'Electoral threshold', defHe: 'רשימה משתתפת בחלוקת המנדטים רק אם קיבלה לפחות 3.25% מכלל הקולות הכשרים (סעיף 81(א)). המספר המינימלי של קולות משתנה עם סך הקולות הכשרים.', defEn: 'A list takes part in seat allocation only if it receives at least 3.25% of all valid votes (section 81(a)). The minimum number of votes therefore changes whenever the valid total changes.' },
  { id: 'qualifying', he: 'קולות שהשתתפו בחלוקת המנדטים', en: 'Qualifying votes', defHe: 'סך הקולות של הרשימות שעברו את אחוז החסימה.', defEn: 'The total votes of the lists that passed the threshold.' },
  { id: 'unrepresented', he: 'קולות שלא השתתפו בחלוקת המנדטים', en: 'Unrepresented votes', defHe: 'קולות כשרים שניתנו לרשימות שלא עברו את אחוז החסימה. הם נספרים באחוז החסימה אך לא בחלוקה.', defEn: 'Valid votes for lists below the threshold. They count towards the threshold but not towards seats.' },
  { id: 'quota', he: 'המודד הכללי', en: 'General quota', defHe: 'סך הקולות המשתתפים חלקי מספר חברי הכנסת, מעוגל כלפי מטה למספר שלם (סעיף 81(ב)). כל רשימה מקבלת תחילה מנדט לכל מודד שלם.', defEn: 'Qualifying votes divided by the number of seats, rounded down to a whole number (section 81(b)). Each list first receives one seat per whole quota.' },
  { id: 'baderofer', he: 'שיטת בדר–עופר', en: 'Bader–Ofer method', defHe: 'המנדטים שנותרו מחולקים אחד־אחד: לכל רשימה מחשבים קולות ÷ (מנדטים + 1), והגבוה ביותר זוכה; החישוב חוזר אחרי כל מנדט (סעיף 81(ד)). שוויון מוכרע בהגרלה.', defEn: 'Remaining seats are awarded one at a time: for each list compute votes ÷ (seats + 1); the highest wins, and the calculation repeats after every seat (section 81(d)). Exact ties are decided by lottery.' },
  { id: 'surplus', he: 'הסכם עודפים', en: 'Surplus-vote agreement', defHe: 'שתי רשימות שהתקשרו נחשבות לרשימה אחת רק בשלב חלוקת המנדטים הנותרים, ורק אם שתיהן עברו את אחוז החסימה (סעיף 82(א)). המנדטים שזכו בהם מחולקים ביניהן מחדש באותה שיטה (סעיף 82(ב)).', defEn: 'Two lists in an agreement count as one list only in the remainder stage, and only if both passed the threshold (section 82(a)). The seats they win are then re-divided between them by the same method (section 82(b)).' },
  { id: 'listquota', he: 'מודד רשימה', en: 'Next-seat quotient', defHe: 'קולות הרשימה (או הצמד) ÷ (מנדטים שכבר קיבלה + 1). זה הקריטריון לכל מנדט נוסף.', defEn: 'The list’s (or pair’s) votes ÷ (seats already won + 1): the figure compared for every further seat.' },
  { id: 'cap', he: 'מגבלת מחצית המנדטים', en: 'Half-seats cap', defHe: 'רשימה שקיבלה לא יותר ממחצית הקולות המשתתפים וכבר זכתה במחצית המנדטים אינה משתתפת עוד בחלוקת העודפים (סעיף 81(ד)(4)).', defEn: 'A list with no more than half the qualifying votes that already holds half the seats takes no further part in the remainder stage (section 81(d)(4)).' },
  { id: 'envelopes', he: 'מעטפות חיצוניות', en: 'Double envelopes', defHe: 'קולות של מצביעים שהצביעו מחוץ לקלפי שלהם (חיילים, מאושפזים, נציגויות ועוד). בקבצי התוצאות הם מרוכזים ביישוב מדומה (סמל 9999), ולכן אחוז ההצבעה ברמת היישוב אינו כולל אותם.', defEn: 'Votes of people who voted away from their own polling station (soldiers, patients, diplomats and others). The results files group them under a pseudo-locality (code 9999), so locality-level turnout excludes them.' },
];
