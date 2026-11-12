// What the scenario engine says when it refuses a change, in plain English and Hebrew: what is wrong and what to do.
// Every refusal in src/model uses one of these (tests/action-messages.test.ts walks them all); a list is named in the
// reader's language. A message for a change the screens never send (a malformed file or link) says so plainly.
import { englishLabel } from '../data/names.ts';

export type Msg = { en: string; he: string };
type Named = { shortHe: string; shortEn: string | null };
const en = (l: Named) => englishLabel(l.shortEn, l.shortHe);
const n = (x: number) => x.toLocaleString('en-US');

export const M = {
  invalid: { en: 'This change is not valid, so it was not made.', he: 'השינוי אינו תקין, ולכן לא בוצע.' },
  votesWhole: { en: 'Votes must be a whole number, 0 or more.', he: 'מספר הקולות חייב להיות מספר שלם, 0 או יותר.' },
  votesRange: { en: 'This would leave a vote count below 0 or too large to count. Make the change smaller.', he: 'השינוי היה משאיר מספר קולות מתחת ל־0 או גדול מדי לחישוב. הקטינו את השינוי.' },
  invalidWhole: { en: 'Invalid ballots must be a whole number, 0 or more.', he: 'מספר הקולות הפסולים חייב להיות מספר שלם, 0 או יותר.' },
  registeredWhole: { en: 'Eligible voters must be a whole number, 0 or more.', he: 'מספר בעלי זכות הבחירה חייב להיות מספר שלם, 0 או יותר.' },
  unknownList: { en: 'This list is no longer in the scenario.', he: 'הרשימה הזו כבר אינה בתרחיש.' },
  withdrawn: (l: Named): Msg => ({ en: `${en(l)} has withdrawn. Restore it first to change its votes.`, he: `${l.shortHe} פרשה. החזירו אותה קודם כדי לשנות את הקולות שלה.` }),
  twoLists: { en: 'Choose two different lists.', he: 'בחרו שתי רשימות שונות.' },
  notEnoughVotes: (l: Named, votes: number): Msg => ({ en: `${en(l)} has only ${n(votes)} votes. Move fewer votes.`, he: `לרשימה ${l.shortHe} יש רק ${n(votes)} קולות. העבירו פחות קולות.` }),
  poolTooSmall: (votes: number): Msg => ({ en: `The chosen lists have only ${n(votes)} votes. Move fewer votes.`, he: `לרשימות שנבחרו יש רק ${n(votes)} קולות. העבירו פחות קולות.` }),
  turnoutOver: { en: 'There would be more votes than eligible voters. Make the change smaller.', he: 'היו יותר קולות ממספר בעלי זכות הבחירה. הקטינו את השינוי.' },
  sourceTwice: { en: 'A list is chosen twice as a source. Choose it once.', he: 'רשימה נבחרה פעמיים כמקור. בחרו אותה פעם אחת.' },
  noReceiver: { en: 'Choose at least one list to receive the votes.', he: 'בחרו לפחות רשימה אחת שתקבל את הקולות.' },
  giveAndTake: { en: 'A list cannot both give and receive votes.', he: 'רשימה אינה יכולה גם לתת קולות וגם לקבל אותם.' },
  scaleNegative: { en: 'The percentage must be 0% or more.', he: 'האחוז חייב להיות 0% או יותר.' },
  mergeTwo: { en: 'Choose at least two different lists to merge.', he: 'בחרו לפחות שתי רשימות שונות לאיחוד.' },
  listExists: { en: 'This list already exists. Undo the earlier change or choose another list.', he: 'הרשימה הזו כבר קיימת. בטלו את השינוי הקודם או בחרו רשימה אחרת.' },
  newListsDiffer: { en: 'The new lists must be different from each other.', he: 'הרשימות החדשות חייבות להיות שונות זו מזו.' },
  retention: { en: 'The share of votes kept must be from 0% to 100%.', he: 'שיעור הקולות שנשמרים חייב להיות בין 0% ל־100%.' },
  splitTwo: { en: 'A split needs at least two new lists.', he: 'פיצול צריך לפחות שתי רשימות חדשות.' },
  splitOver: (sum: number, votes: number): Msg => ({ en: `The parts have ${n(sum)} votes, more than the list's ${n(votes)}. Lower them.`, he: `לחלקים יש ${n(sum)} קולות, יותר מ־${n(votes)} הקולות של הרשימה. הקטינו אותם.` }),
  splitTotal: { en: "The parts' votes must add up to the list's votes exactly.", he: 'סכום הקולות של החלקים חייב להיות שווה בדיוק לקולות הרשימה.' },
  splitStranger: { en: 'A part has a candidate who is not on the list.', he: 'באחד החלקים יש מועמד שאינו ברשימה.' },
  splitTwice: { en: 'A candidate can be on only one of the new lists.', he: 'מועמד יכול להופיע רק באחת מהרשימות החדשות.' },
  agreementTwo: { en: 'By law (section 67(a)) an agreement joins exactly two lists. Switch to experimental rules to try other arrangements.', he: 'לפי החוק (סעיף 67(א)) הסכם עודפים מחבר בדיוק שתי רשימות. עברו לכללים ניסיוניים כדי לנסות הסדרים אחרים.' },
  agreementOnce: { en: 'By law (section 67(a)) a list may sign an agreement with only one other list. Switch to experimental rules to try more.', he: 'לפי החוק (סעיף 67(א)) רשימה רשאית לחתום על הסכם עם רשימה אחת בלבד. עברו לכללים ניסיוניים כדי לנסות יותר.' },
  agreementMembers: { en: 'An agreement joins at least two different lists.', he: 'הסכם עודפים מחבר לפחות שתי רשימות שונות.' },
  agreementLists: { en: 'An agreement in that starting point names a list this scenario does not have.', he: 'הסכם בנקודת ההתחלה הזו כולל רשימה שאינה בתרחיש.' },
  agreementSize: { en: 'Agreements must allow at least two lists.', he: 'הסכמי עודפים חייבים לאפשר לפחות שתי רשימות.' },
  candidateName: { en: 'Every candidate needs a name.', he: 'לכל מועמד צריך להיות שם.' },
  candidateTwice: { en: 'A candidate appears twice. Remove one.', he: 'מועמד מופיע פעמיים. הסירו אחד מהם.' },
  rulesByLaw: { en: "The law sets this election's rules. Switch to experimental rules to change them.", he: 'החוק קובע את כללי הבחירות האלה. עברו לכללים ניסיוניים כדי לשנות אותם.' },
  seats: { en: 'Seats must be a whole number from 1 to 1,000.', he: 'מספר המושבים חייב להיות מספר שלם בין 1 ל־1,000.' },
  threshold: { en: 'The threshold must be a percentage from 0 to 100.', he: 'אחוז החסימה חייב להיות בין 0 ל־100.' },
  noScheme: { en: 'This election has no such grouping.', he: 'אין חלוקה כזו בבחירות האלה.' },
  noParty: { en: 'No list has this party.', he: 'אין רשימה עם המפלגה הזו.' },
  noBloc: { en: 'This bloc no longer exists.', he: 'הגוש הזה כבר אינו קיים.' },
  notJoint: { en: 'Only a joint list of several parties can split into factions.', he: 'רק רשימה משותפת של כמה מפלגות יכולה להתפצל לסיעות.' },
  noOfficial: { en: 'The official result is not available, so this cannot be restored.', he: 'התוצאה הרשמית אינה זמינה, ולכן אי אפשר לשחזר.' },
  notInOfficial: { en: 'This list was not in the official result, so there is nothing to restore.', he: 'הרשימה הזו לא הייתה בתוצאה הרשמית, ולכן אין מה לשחזר.' },
  turnoutRange: { en: 'Turnout must be above 0% and at most 100%.', he: 'שיעור ההצבעה חייב להיות מעל 0% ועד 100%.' },
  noVotes: { en: 'There are no votes to scale. Give a list votes first.', he: 'אין קולות לשנות. תנו קודם קולות לרשימה.' },
  noBlank: { en: 'This part cannot start empty.', he: 'החלק הזה אינו יכול להתחיל ריק.' },
  nameGrouping: { en: 'Name the grouping.', he: 'תנו שם לחלוקה.' },
  chooseGrouping: { en: 'Choose a grouping.', he: 'בחרו חלוקה.' },
  chooseRules: { en: 'Choose one of the listed rule sets.', he: 'בחרו אחת ממערכות הכללים שברשימה.' },
  startMismatch: { en: "That starting point does not fit this scenario's lists.", he: 'נקודת ההתחלה הזו אינה מתאימה לרשימות של התרחיש.' },
  matchWithdrawals: { en: 'Withdraw or restore lists to match the starting point first, then copy the votes.', he: 'קודם הוציאו או החזירו רשימות כך שיתאימו לנקודת ההתחלה, ואז העתיקו את הקולות.' },
  turnoutNeedsVotes: { en: 'Give at least one list votes before changing turnout.', he: 'תנו קולות לפחות לרשימה אחת לפני שתשנו את שיעור ההצבעה.' },
  colour: { en: 'Choose a valid colour.', he: 'בחרו צבע תקין.' },
  staleVotes: { en: 'The votes changed meanwhile. Try again.', he: 'הקולות השתנו בינתיים. נסו שוב.' },
  donorsShort: { en: 'The other lists do not have enough votes. Choose a smaller change.', he: 'לרשימות האחרות אין מספיק קולות. בחרו שינוי קטן יותר.' },
  // voter group files (src/model/voterGroups.ts)
  groupsFile: { en: 'This file is not a voter group file this app can open.', he: 'הקובץ הזה אינו קובץ קבוצות מצביעים שהאתר יכול לפתוח.' },
  groupsEmpty: { en: 'The file has no voter groups.', he: 'אין בקובץ קבוצות מצביעים.' },
  groupInvalid: (i: number): Msg => ({ en: `Voter group ${i} in the file is not valid, so nothing was imported.`, he: `קבוצת המצביעים מספר ${i} בקובץ אינה תקינה, ולכן דבר לא יובא.` }),
  // demographic turnout (src/model/demographicTurnout.ts)
  groupUnsafe: { en: 'This turnout change would leave a negative or too large vote count. Choose a smaller change.', he: 'שינוי ההצבעה הזה היה משאיר מספר קולות שלילי או גדול מדי. בחרו שינוי קטן יותר.' },
  groupNoVotes: { en: 'This group cast no votes in the election, so its turnout cannot change.', he: 'הקבוצה הזו לא הצביעה בבחירות, ולכן אי אפשר לשנות את שיעור ההצבעה שלה.' },
  groupWithdrawn: { en: "Restore the withdrawn lists first, then change a group's turnout.", he: 'קודם החזירו את הרשימות שפרשו, ואז שנו את שיעור ההצבעה של הקבוצה.' },
  groupGone: { en: 'This group is no longer available.', he: 'הקבוצה הזו כבר אינה זמינה.' },
  groupData: { en: "This group's localities cannot be used. Choose another group.", he: 'אי אפשר להשתמש ביישובים של הקבוצה הזו. בחרו קבוצה אחרת.' },
  groupOverlap: { en: 'A locality is in two of the chosen groups. Change one group at a time.', he: 'יישוב נמצא בשתיים מהקבוצות שנבחרו. שנו קבוצה אחת בכל פעם.' },
  groupNoRegistered: { en: 'Eligible voters are not known for these localities.', he: 'מספר בעלי זכות הבחירה ביישובים האלה אינו ידוע.' },
  groupRange: { en: "A group's turnout must be from 0% to 100%.", he: 'שיעור ההצבעה של קבוצה חייב להיות בין 0% ל־100%.' },
  groupTotals: { en: 'The locality results do not add up, so this group cannot be changed.', he: 'תוצאות היישובים אינן מסתכמות, ולכן אי אפשר לשנות את הקבוצה הזו.' },
  groupNoList: { en: "A list from the election is no longer in this scenario, so its voters' choice has nowhere to go.", he: 'רשימה מהבחירות כבר אינה בתרחיש, ולכן לקולות שלה אין לאן ללכת.' },
} satisfies Record<string, Msg | ((...args: never[]) => Msg)>;

/** A refused change, with its message in both languages (`message` is the English one). */
export class ActionError extends Error {
  readonly code: string;
  readonly he: string;
  constructor(code: string, msg: Msg) { super(msg.en); this.code = code; this.he = msg.he; }
}

/** What to show for an error from the engine: its message in the reader's language; anything else is a fault in the
 *  app, said plainly (the details go to the console). */
export function errorText(e: unknown, lang: 'he' | 'en'): string {
  if (e instanceof ActionError) return lang === 'he' ? e.he : e.message;
  console.error(e);
  return lang === 'he' ? 'משהו השתבש, והשינוי לא בוצע.' : 'Something went wrong, and the change was not made.';
}
