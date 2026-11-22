// Words for Compare copies, shared by the History list, the markers and the Compare screen.
import type { CopyProvenance } from '../../model/scenario.ts';
import type { Lang } from '../i18n.ts';

const FIELDS: Record<CopyProvenance['field'], [string, string]> = {
  votes: ['votes', 'הקולות'], list: ['whole list', 'הרשימה כולה'], candidates: ['candidates', 'המועמדים'],
  turnout: ['turnout', 'שיעור ההצבעה'], registered: ['registered voters', 'בעלי זכות הבחירה'], invalid: ['invalid ballots', 'הקולות הפסולים'],
  threshold: ['threshold', 'אחוז החסימה'], rules: ['rules', 'הכללים'], agreements: ['surplus agreements', 'הסכמי העודפים'], colour: ['colour', 'הצבע'],
};
export const copyFieldLabel = (f: CopyProvenance['field'], lang: Lang) => FIELDS[f][lang === 'he' ? 1 : 0];

/** "2022", or the scenario's name; the official result of the same election is named as such. */
export function copySourceName(p: Pick<CopyProvenance, 'official' | 'sourceName' | 'electionId'>, lang: Lang, destElectionId?: string) {
  if (p.official && destElectionId === p.electionId) return lang === 'he' ? 'התוצאה הרשמית' : 'the official result';
  return p.sourceName;
}
/** The marker's word in place of "Edited". */
export function fromLabel(p: Pick<CopyProvenance, 'official' | 'sourceName' | 'electionId'>, lang: Lang, destElectionId?: string) {
  const name = copySourceName(p, lang, destElectionId);
  return lang === 'he' ? (/^\d/.test(name) ? `מ־${name}` : `מ${name}`) : `From ${name}`;
}
/** The Copy votes methods' names (22 Nov 2026), [English, Hebrew]: the box, the Whole list dialog and Settings use
 *  the same words. */
export const COPY_WORDS = {
  votes: ['Number of votes', 'מספר קולות'],
  adjust: ['Adjust for the number of eligible voters', 'התאמה לגודל ציבור הבוחרים'],
  adjusted: ['Votes adjusted for the number of eligible voters', 'קולות לפי גודל ציבור הבוחרים'],
  notAdjusted: ['Number of votes, not adjusted', 'מספר קולות, ללא התאמה'],
  share: ['Share of valid votes', 'שיעור מהקולות הכשרים'],
  edit: ['Copy the edit', 'העתקת השינוי'],
  change: ['Change in vote share', 'שינוי בשיעור הקולות'],
  ratio: ['Vote multiplier', 'מכפיל הקולות'],
} as const satisfies Record<string, readonly [string, string]>;
/** What each (i) says. */
export const COPY_INFO = {
  adjust: ['Scales the copied vote count by the change in the number of people eligible to vote.', 'מספר הקולות המועתק גדל או קטן לפי היחס בין מספר בעלי זכות הבחירה בשתי הבחירות.'],
  share: ['Keeps the same share of all valid votes, including votes for lists below the threshold.', 'שומר על אותו שיעור מכלל הקולות הכשרים, כולל קולות לרשימות שלא עברו את אחוז החסימה.'],
  change: ['Adds the source list’s change in percentage points to the destination list’s share.', 'מוסיף לשיעור הקולות כאן את השינוי בנקודות אחוז ברשימת המקור.'],
  ratio: ['Multiplies the destination list’s votes by the same factor as the source list’s change since its starting point.', 'מכפיל את מספר הקולות כאן ביחס שבין מספר הקולות ברשימת המקור עכשיו למספרם בתחילת התרחיש.'],
  /** why the adjusted count cannot be offered */
  noAdjust: ['Not adjusted for the number of eligible voters: that number is not known for both elections.', 'ללא התאמה לגודל ציבור הבוחרים: מספר בעלי זכות הבחירה אינו ידוע בשתי הבחירות.'],
  /** beside a seat preview: why the share of seats differs from the share of votes */
  seats: ['Seats are divided only among the lists that pass the threshold: votes for lists below it are not counted, so a list’s share of the seats can differ from its share of the votes.', 'המנדטים מתחלקים רק בין הרשימות שעברו את אחוז החסימה: קולות לרשימות שלא עברו אותו אינם נספרים, ולכן חלקה של רשימה במנדטים יכול להיות שונה מחלקה בקולות.'],
} as const satisfies Record<string, readonly [string, string]>;

const MODES: Record<NonNullable<CopyProvenance['mode']>, [string, string]> = {
  share: ['share of valid votes', 'חלק מהקולות הכשרים'], eligible: ['share of eligible voters', 'חלק מבעלי זכות הבחירה'],
  count: ['count', 'מספר'], change: ['change', 'שינוי'], ratio: ['growth', 'יחס גידול'],
};
export const copyModeLabel = (m: CopyProvenance['mode'], lang: Lang) => MODES[m ?? 'count'][lang === 'he' ? 1 : 0];

export function describeCopy(p: CopyProvenance, names: string[], lang: Lang, destElectionId?: string) {
  const he = lang === 'he', what = copyFieldLabel(p.field, lang), from = copySourceName(p, lang, destElectionId);
  const who = names.length ? `${names.join(' + ')}: ` : '';
  const how = p.value ? ` (${p.mode ? `${copyModeLabel(p.mode, lang)} ` : ''}${p.value})` : '';
  return he ? `${who}${what} הועתקו מ${/^\d/.test(from) ? '־' : ''}${from}${how}` : `${who}${what} copied from ${from}${how}`;
}

/** The text before a marker's previous value: "Edited: was " or "From 2022 (share 23.41%) · was ". One wording for the
 *  marker, its tooltip, the CSV and the export, so a copied value is described the same everywhere. */
export function markerLead(origin: CopyProvenance | undefined, lang: Lang, destElectionId?: string) {
  if (!origin) return lang === 'he' ? 'נערך: קודם ' : 'Edited: was ';
  const how = origin.value ? ` (${origin.mode ? copyModeLabel(origin.mode, lang) + ' ' : ''}${origin.value})` : '';
  return `${fromLabel(origin, lang, destElectionId)}${how} · ${lang === 'he' ? 'קודם ' : 'was '}`;
}
