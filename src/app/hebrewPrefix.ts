/** Attach a Hebrew one-letter prefix to a name, keeping foreign/digit starts distinct.
 * Ignore invisible direction marks when identifying the first visible character. */
export function hebrewPrefix(prefix: 'מ' | 'ל' | 'ב' | 'ו' | 'ש' | 'ה' | 'כ', name: string | number): string {
  const text = String(name);
  const lead = text.match(/^[\s\p{Cf}]*/u)![0], first = text.slice(lead.length);
  // The app's own definite names ("התוצאה הרשמית") lose their article after ב, ל and כ: "בתוצאה הרשמית", never
  // "בהתוצאה". A name a reader typed is left whole, since its leading ה may be part of the word ("הסכם").
  if ((prefix === 'ב' || prefix === 'ל' || prefix === 'כ') && APP_DEFINITE.test(first)) return `${prefix}${lead}${first.slice(1)}`;
  return `${prefix}${first && !/^[א-תװ-ײ]/u.test(first) ? '־' : ''}${text}`;
}

/** Definite names the app itself writes and passes to a prefix: sides of a comparison, the seat method. */
export const APP_DEFINITE_NAMES = ['התוצאה הרשמית', 'העבודה שלכם', 'התרחיש הנוכחי', 'הבחירות האלה', 'השארית הגדולה ביותר', 'הממוצע הגדול ביותר', 'הכנסת'];
const APP_DEFINITE = new RegExp(`^(${APP_DEFINITE_NAMES.join('|')})(?![א-ת])`, 'u');

// Names whose leading ה is part of the word, not the article: "הסתדרות הציונים", "התאחדות הספרדים", "הס־מס".
const LEADING_HE_IN_WORD = /^(הסתדרות|התאחדות|התאגדות|הס[־-]|הר\s)/u;
/** The same for the name of a list, party, bloc or family, or another fixed definite name ("התוצאה הרשמית"):
 * ב, ל and כ take the place of the definite article, as Hebrew writes them: "לבית היהודי", "בתוצאה הרשמית",
 * not "להבית היהודי". Not for names a reader typed (a saved scenario), whose leading ה may be part of the word. */
export function hebrewPrefixName(prefix: 'מ' | 'ל' | 'ב' | 'ו' | 'ש' | 'כ', name: string): string {
  const lead = name.match(/^[\s\p{Cf}]*/u)![0], rest = name.slice(lead.length);
  if ((prefix === 'ב' || prefix === 'ל' || prefix === 'כ') && /^ה[א-ת]/u.test(rest) && !LEADING_HE_IN_WORD.test(rest)) return `${prefix}${lead}${rest.slice(1)}`;
  return hebrewPrefix(prefix, name);
}
