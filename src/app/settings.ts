import type { FeatureId, Preset } from './features.ts';

/** Personal display settings (docs/design/settings.md). One registry drives the popup, its search, the resets
 *  and the tests. Every level shows every setting, in tiers by `min`: Simple first, then Standard, then Expert (owner,
 *  9 Nov 2026). Values are sparse: only what the user set is stored, so level-dependent and later
 *  defaults reach untouched settings. Settings are never scenario edits. */
type Bi = readonly [string, string];
export type GroupId = 'top' | 'general' | 'lists' | 'chamber' | 'numbers' | 'editing' | 'analysis' | 'access';
export const GROUPS: { id: GroupId; label: Bi }[] = [
  { id: 'top', label: ['Detail level', 'רמת פירוט'] },
  { id: 'general', label: ['General', 'כללי'] },
  { id: 'lists', label: ['Lists & parties', 'רשימות ומפלגות'] },
  { id: 'chamber', label: ['Seat chart', 'תרשים המליאה'] },
  { id: 'numbers', label: ['Numbers', 'מספרים'] },
  { id: 'editing', label: ['Editing', 'עריכה'] },
  { id: 'analysis', label: ['Analysis', 'ניתוח'] },
  { id: 'access', label: ['Accessibility', 'נגישות'] },
];

export interface SettingValues {
  theme: 'device' | 'light' | 'dark';
  density: 'compact' | 'comfortable';
  starterTip: boolean;
  openOn: 'overview' | 'last';
  listSymbol: 'logo' | 'letters';
  partyColourInSeats: boolean;
  jointListParties: 'none' | 'seated' | 'all';
  seatlessLists: 'over' | 'all' | 'folded';
  withdrawnLists: boolean;
  listOrder: 'seats' | 'votes' | 'bloc' | 'name';
  voteCounts: boolean;
  lastTimeRows: boolean;
  allCandidates: boolean;
  chamberLayout: 'hemicycle' | 'blocks';
  seatColour: 'list' | 'bloc' | 'party';
  blocShading: boolean;
  referenceChamber: boolean;
  chamberKey: boolean;
  dimUnselected: boolean;
  decimals: number;
  splitWarning: boolean;
  confirmStartOver: boolean;
  hoverPreviews: boolean;
  communityScenarios: boolean;
  compareWith: 'previous' | 'official';
  optionPreviews: boolean;
  textSize: 'normal' | 'large';
  reduceMotion: boolean;
  hoverPopups: boolean;
  preferTables: boolean;
  keepMessages: boolean;
}
export type SettingId = keyof SettingValues;
/** Rows backed by other stores: the language and level (app state) and the point-of-use questions (PREFERENCES). */
export type ExternalId = 'level' | 'lang' | 'jointByParty' | 'voteSource' | 'markChanges' | 'copyMode';
export type RowId = SettingId | ExternalId;

export type Control = 'toggle' | 'seg' | 'decimals';
export interface SettingRow {
  id: RowId; group: GroupId; label: Bi; info?: Bi; control: Control | 'level' | 'lang' | 'choice';
  options?: readonly { value: string; label: Bi }[];
  /** the row's tier in Settings (Simple, Standard or Expert); every level shows every tier */
  min: Preset; only?: Preset; feature?: FeatureId;
  synonyms: string;
}
export const DECIMAL_CHOICES = [0, 1, 2, 3] as const;

const o = (value: string, en: string, he: string) => ({ value, label: [en, he] as Bi });
/** Registry order is display order. */
export const SETTINGS: readonly SettingRow[] = [
  { id: 'level', group: 'top', control: 'level', min: 'simple', label: ['Detail level', 'רמת פירוט'],
    info: ['Decides which tools and settings are shown. Hidden edits and settings keep working.', 'קובעת אילו כלים והגדרות מוצגים. עריכות והגדרות מוסתרות ממשיכות לפעול.'],
    options: [o('simple', 'Simple', 'פשוט'), o('standard', 'Standard', 'רגיל'), o('expert', 'Expert', 'מומחה')], synonyms: 'mode level complexity custom מצב רמה מורכבות מותאם' },

  { id: 'lang', group: 'general', control: 'lang', min: 'simple', label: ['Language', 'שפה'], options: [o('he', 'עברית', 'עברית'), o('en', 'English', 'English')], synonyms: 'language hebrew english שפה עברית אנגלית' },
  { id: 'theme', group: 'general', control: 'seg', min: 'simple', label: ['Theme', 'ערכת צבעים'],
    info: ['Device follows your phone or computer, also when it changes at night.', 'לפי המכשיר: כמו בטלפון או במחשב, גם כשזה משתנה בלילה.'],
    options: [o('device', 'Device', 'לפי המכשיר'), o('light', 'Light', 'בהיר'), o('dark', 'Dark', 'כהה')], synonyms: 'dark night light mode colours theme כהה לילה בהיר מצב' },
  { id: 'density', group: 'general', control: 'seg', min: 'simple', label: ['Spacing', 'ריווח'],
    info: ['Comfortable adds space between rows. Touch targets stay large in both.', 'מרווח מוסיף רווח בין השורות. יעדי המגע נשארים גדולים בשני המצבים.'],
    options: [o('compact', 'Compact', 'צפוף'), o('comfortable', 'Comfortable', 'מרווח')], synonyms: 'density dense padding compact צפיפות צפוף מרווח' },
  { id: 'starterTip', group: 'general', control: 'toggle', min: 'simple', only: 'simple', label: ['Starter tip', 'טיפ פתיחה'],
    info: ['The one-line tip under the Overview. Turn on to see it again.', 'שורת העצה בתחתית תמונת המצב. הפעילו כדי לראות אותה שוב.'], synonyms: 'hint tips help onboarding עצה רמז עזרה' },
  { id: 'openOn', group: 'general', control: 'seg', min: 'standard', label: ['Open on', 'פתיחה ב־'],
    info: ['Where the app opens. A share link wins, and your unsaved work is restored either way.', 'היכן היישום נפתח. קישור שיתוף קודם, והעבודה שלא נשמרה משוחזרת בכל מקרה.'],
    options: [o('overview', 'Overview', 'תמונת מצב'), o('last', 'Last tool', 'הכלי האחרון')], synonyms: 'start page startup home tab פתיחה דף בית לשונית' },

  { id: 'listSymbol', group: 'lists', control: 'seg', min: 'simple', label: ['List symbol', 'סמל הרשימה'],
    info: ['Logo: the verified symbol from that election, else the letters. Ballot letters: always the letters.', 'סמל: הסמל המאומת מאותן בחירות, אחרת האותיות. אותיות הפתק: תמיד האותיות.'],
    options: [o('logo', 'Logo', 'סמל'), o('letters', 'Ballot letters', 'אותיות הפתק')], synonyms: 'logo icon ballot letters slip לוגו סמל אותיות פתק' },
  { id: 'jointByParty', group: 'lists', control: 'choice', min: 'simple', label: ['Joint lists by party', 'רשימות משותפות לפי מפלגה'],
    info: ['Each party on a joint list shows as its own faction. Votes and seats don’t change. Saved scenarios keep their choice.', 'כל מפלגה ברשימה משותפת מוצגת כסיעה נפרדת. הקולות והמנדטים אינם משתנים. תרחישים שמורים שומרים את הבחירה שלהם.'],
    synonyms: 'joint list split faction party seats default משותפת פיצול סיעה מפלגה ברירת מחדל' },
  { id: 'partyColourInSeats', group: 'lists', control: 'toggle', min: 'simple', label: ['Party colour in seats', 'צבע המפלגה במושבים'],
    info: ['For a list counted by party, each seat shows the party colour inside the list colour.', 'ברשימה שנספרת לפי מפלגה, כל מושב מציג את צבע המפלגה בתוך צבע הרשימה.'], synonyms: 'colour color inner component split צבע פנימי' },
  { id: 'jointListParties', group: 'lists', control: 'seg', min: 'simple', label: ['Parties under joint lists', 'מפלגות ברשימה משותפת'],
    info: ['The parties listed under a joint list counted by party. With seats: only parties that had someone elected, e.g. not Atid Ehad (2022). All: also those with no seats. A party you gave its own bloc always shows; every party stays on the list’s own page.', 'המפלגות שמוצגות מתחת לרשימה משותפת שנספרת לפי מפלגה. עם מנדטים: רק מפלגות שנבחר מטעמן מישהו, למשל לא עתיד אחד (2022). כולן: גם אלה ללא מנדטים. מפלגה ששייכתם לגוש משלה מוצגת תמיד; כל המפלגות מופיעות בעמוד הרשימה.'],
    options: [o('none', 'Lists only', 'רשימות בלבד'), o('seated', 'With seats', 'עם מנדטים'), o('all', 'All', 'כולן')],
    synonyms: 'parties constituent factions zero 0 seats empty hidden below threshold מפלגות מרכיבות סיעות אפס 0 מנדטים ריק חסימה' },
  { id: 'seatlessLists', group: 'lists', control: 'seg', min: 'simple', label: ['Lists with no seats', 'רשימות ללא מנדטים'],
    info: ['How many lists that won no seat show at first. ‘Show all’ still opens the rest; a list you changed always shows.', 'כמה רשימות שלא זכו במנדט מוצגות בהתחלה. ‘הצגת הכול’ עדיין פותח את השאר; רשימה ששיניתם מוצגת תמיד.'],
    options: [o('over', 'Over 0.5%', 'מעל 0.5%'), o('all', 'All', 'כולן'), o('folded', 'Folded', 'מקופלות')], synonyms: 'zero 0 seats below threshold small tail אפס 0 מנדטים חסימה קטנות' },
  { id: 'withdrawnLists', group: 'lists', control: 'toggle', min: 'standard', label: ['Lists that withdrew', 'רשימות שפרשו'],
    info: ['Lists that withdrew before election day and got no votes. A list you withdrew is always shown.', 'רשימות שפרשו לפני יום הבחירות ולא קיבלו קולות. רשימה שאתם הוצאתם מוצגת תמיד.'], synonyms: 'withdrawn withdrew zero votes פרישה פרשו אפס קולות' },
  { id: 'listOrder', group: 'lists', control: 'seg', min: 'standard', label: ['Order lists by', 'סדר הרשימות'],
    info: ['Bloc: the same order as the seats in the chamber.', 'גוש: באותו סדר כמו המושבים במליאה.'],
    options: [o('seats', 'Seats', 'מנדטים'), o('votes', 'Votes', 'קולות'), o('bloc', 'Bloc', 'גוש'), o('name', 'Name', 'שם')], synonyms: 'sort order ranking מיון סדר' },
  { id: 'voteCounts', group: 'lists', control: 'toggle', min: 'simple', label: ['Vote counts', 'מספרי קולות'],
    info: ['The number of votes beside each list’s share.', 'מספר הקולות ליד אחוז הקולות של כל רשימה.'], synonyms: 'votes numbers totals count קולות מספרים' },
  { id: 'lastTimeRows', group: 'lists', control: 'toggle', min: 'standard', label: ['Compared with last time', 'השוואה לבחירות הקודמות'],
    info: ['A line under each list: its seats at the previous election and the change (2022: 5 ▲6). Compare and the list panel always show the comparison.', 'שורה מתחת לכל רשימה: המנדטים בבחירות הקודמות והשינוי (2022: 5 ▲6). ההשוואה וחלונית הרשימה מציגות את ההשוואה תמיד.'], synonyms: 'previous last election history since change predecessor קודמות היסטוריה שינוי' },
  { id: 'allCandidates', group: 'lists', control: 'toggle', min: 'standard', label: ['All candidates', 'כל המועמדים'],
    info: ['Opens a list’s full roster. Off: the elected and the next few first.', 'פותח את רשימת המועמדים המלאה. כבוי: הנבחרים והבאים בתור תחילה.'], synonyms: 'candidates roster members names מועמדים חברים שמות' },

  { id: 'chamberLayout', group: 'chamber', control: 'seg', min: 'expert', feature: 'chamberOptions', label: ['Layout', 'פריסה'],
    info: ['The shape only; every seat stays the same.', 'הצורה בלבד; כל מושב נשאר אותו מושב.'],
    options: [o('hemicycle', 'Arc', 'קשת'), o('blocks', 'Blocks', 'גושים')], synonyms: 'arc hemicycle blocks chamber shape קשת חצי עיגול מליאה צורה' },
  { id: 'seatColour', group: 'chamber', control: 'seg', min: 'expert', feature: 'chamberOptions', label: ['Colour seats by', 'צביעת מושבים לפי'],
    info: ['Party: each seat by its member’s party, also inside joint lists.', 'מפלגה: כל מושב לפי מפלגת חבר הכנסת, גם ברשימות משותפות.'],
    options: [o('list', 'List', 'רשימה'), o('bloc', 'Bloc', 'גוש'), o('party', 'Party', 'מפלגה')], synonyms: 'colour color seats צבע מושבים' },
  { id: 'blocShading', group: 'chamber', control: 'toggle', min: 'standard', feature: 'chamberOptions', label: ['Bloc backgrounds', 'רקע לגושים'],
    info: ['The tinted areas behind each bloc. Off: seats only.', 'האזורים הצבועים מאחורי כל גוש. כבוי: מושבים בלבד.'], synonyms: 'shading regions wedges tint background הצללה אזורים רקע' },
  { id: 'referenceChamber', group: 'chamber', control: 'toggle', min: 'standard', feature: 'chamberOptions', label: ['Comparison chamber', 'מליאת השוואה'],
    info: ['A small chamber of the result you compare with, shown when seats change. Outlines still mark gains.', 'מליאה קטנה של התוצאה להשוואה, כשמנדטים משתנים. המתארים עדיין מסמנים מושבים שנוספו.'], synonyms: 'reference mini small chamber before ייחוס קטנה לפני' },
  { id: 'chamberKey', group: 'chamber', control: 'toggle', min: 'standard', feature: 'chamberOptions', label: ['List key', 'מקרא הרשימות'],
    info: ['The list names under the seats. On a phone it always shows, since seats have no labels there.', 'שמות הרשימות מתחת למושבים. בטלפון הוא מוצג תמיד, כי למושבים אין שם תוויות.'], synonyms: 'legend key names מקרא שמות' },
  { id: 'dimUnselected', group: 'chamber', control: 'toggle', min: 'standard', feature: 'chamberOptions', label: ['Dim other seats', 'עמעום שאר המושבים'],
    info: ['When a list is chosen, the other seats and rows fade.', 'כשבוחרים רשימה, שאר המושבים והשורות מתעמעמים.'], synonyms: 'dim fade highlight selection עמעום הדגשה בחירה' },

  { id: 'decimals', group: 'numbers', control: 'decimals', min: 'simple', label: ['Max decimal places', 'ספרות אחרי הנקודה (מרבי)'],
    info: ['Percentages show at most this many, without trailing zeros. Tap, hover or focus one for its exact value. Next to the threshold a share gets one more digit, so it never looks like it is on the other side.', 'אחוזים מוצגים עם לכל היותר כמה ספרות, בלי אפסים בסוף. נגיעה, ריחוף או מיקוד מציגים את הערך המדויק. ליד אחוז החסימה מוצגת ספרה נוספת, כדי שהאחוז לא ייראה בצד השני שלו.'],
    synonyms: 'decimal precision percent % digits rounding דיוק אחוז עשרוניות עיגול' },

  { id: 'splitWarning', group: 'editing', control: 'toggle', min: 'standard', label: ['Joint-list split warning', 'אזהרה בפיצול רשימה משותפת'], info: ['When splitting a joint list, remind that the split is an assumption for the scenario. Turn on to see it again.', 'בפיצול רשימה משותפת, תזכורת שהפיצול הוא הנחה לתרחיש. הפעילו כדי לראות אותה שוב.'], synonyms: 'split warning remember assumption פיצול אזהרה הנחה' },
  { id: 'voteSource', group: 'editing', control: 'choice', min: 'simple', label: ['Votes come from', 'הקולות מגיעים מ־'],
    info: ['Other lists: from all, in proportion; turnout stays. New voters: turnout changes. Ask: you choose at each edit.', 'שאר הרשימות: מכולן, באופן יחסי; ההצבעה לא משתנה. מצביעים חדשים: ההצבעה משתנה. לשאול: בוחרים בכל עריכה.'],
    synonyms: 'source donor ask default remember balance מקור תורם לשאול ברירת מחדל זכירה' },
  { id: 'markChanges', group: 'editing', control: 'choice', min: 'simple', label: ['Mark changes since', 'סימון שינויים מאז'],
    info: ['Opened scenario: only your newer changes are marked. Official result: every difference is marked.', 'התרחיש שנפתח: מסומנים רק השינויים החדשים. התוצאה הרשמית: מסומן כל הבדל.'],
    synonyms: 'differences markers reference ask default הבדלים סימונים ייחוס לשאול ברירת מחדל' },
  { id: 'copyMode', group: 'editing', control: 'choice', min: 'standard', feature: 'compare', label: ['Copy votes between elections as', 'העתקת קולות בין בחירות לפי'],
    info: ['Compare: a list’s votes copied from another election. Share of the vote keeps its strength; Number of votes copies the count. Ask: you choose at each copy.', 'השוואה: קולות של רשימה שמועתקים מבחירות אחרות. שיעור מהקולות שומר על כוחה; מספר הקולות מעתיק את המספר. לשאול: בוחרים בכל העתקה.'],
    synonyms: 'copy compare share count elections ask default remember העתקה השוואה שיעור מספר בחירות לשאול ברירת מחדל זכירה' },
  { id: 'confirmStartOver', group: 'editing', control: 'toggle', min: 'simple', label: ['Confirm start over', 'אישור לפני התחלה מחדש'],
    info: ['Asks before clearing all changes. Undo can always restore them.', 'שאלה לפני מחיקת כל השינויים. תמיד אפשר לשחזר עם ביטול.'], synonyms: 'reset confirm start over dialog איפוס אישור התחלה' },
  { id: 'hoverPreviews', group: 'editing', control: 'toggle', min: 'standard', label: ['Hover previews', 'תצוגה מקדימה בריחוף'],
    info: ['Pointing at a step or goal button previews its result. Nothing changes until you press.', 'הצבעה על כפתור צעד או יעד מציגה את התוצאה מראש. דבר אינו משתנה עד הלחיצה.'], synonyms: 'preview hover pointer stepper ריחוף תצוגה מקדימה' },
  { id: 'communityScenarios', group: 'editing', control: 'toggle', min: 'standard', feature: 'scenarios', label: ['Community scenarios', 'תרחישי הקהילה'],
    info: ['Loads the community list on the Scenarios page. Off: your own saves and links only.', 'טעינת רשימת הקהילה בעמוד התרחישים. כבוי: רק השמירות והקישורים שלכם.'], synonyms: 'gallery community shared network גלריה קהילה רשת' },

  { id: 'compareWith', group: 'analysis', control: 'seg', min: 'standard', feature: 'compare', label: ['Compare with', 'השוואה מול'],
    info: ['What Compare shows on the other side when it opens. You can change it there.', 'מה מוצג בצד השני כשההשוואה נפתחת. אפשר לשנות שם.'],
    options: [o('previous', 'Previous election', 'הבחירות הקודמות'), o('official', 'Official result', 'התוצאה הרשמית')], synonyms: 'compare comparison previous official השוואה קודמות רשמית' },
  { id: 'optionPreviews', group: 'analysis', control: 'toggle', min: 'standard', label: ['Option previews', 'תצוגה מקדימה באפשרויות'],
    info: ['Small seat charts beside choices such as groupings. Off: names only, faster on slow phones.', 'תרשימי מושבים קטנים ליד אפשרויות כמו חלוקות. כבוי: שמות בלבד, מהיר יותר בטלפונים איטיים.'], synonyms: 'thumbnails mini charts previews תמונות ממוזערות תרשימים' },

  { id: 'textSize', group: 'access', control: 'seg', min: 'simple', label: ['Text size', 'גודל טקסט'],
    info: ['Large makes all text and controls about 15% bigger.', 'גדול מגדיל את כל הטקסט והבקרים בכ־15%.'],
    options: [o('normal', 'Normal', 'רגיל'), o('large', 'Large', 'גדול')], synonyms: 'font bigger zoom size readability גופן גדול הגדלה קריאות' },
  { id: 'reduceMotion', group: 'access', control: 'toggle', min: 'simple', label: ['Reduce motion', 'הפחתת תנועה'],
    info: ['Stops moving bars, seats and smooth scrolling. Your device’s reduce-motion setting always applies.', 'עוצר תנועה של עמודות, מושבים וגלילה. הגדרת הפחתת התנועה במכשיר חלה תמיד.'], synonyms: 'animation moving motion transitions אנימציה תנועה מעברים' },
  { id: 'hoverPopups', group: 'access', control: 'toggle', min: 'simple', label: ['Popups on hover', 'חלוניות בריחוף'],
    info: ['(i), seat details and chart values open when the pointer rests on them. Off: click only. Touch and keyboard always work.', '(i), פרטי מושב וערכי תרשים נפתחים כשהעכבר עליהם. כבוי: בלחיצה בלבד. מגע ומקלדת פועלים תמיד.'], synonyms: 'tooltip hover popup click info חלונית ריחוף לחיצה מידע' },
  { id: 'preferTables', group: 'access', control: 'toggle', min: 'simple', label: ['Tables instead of charts', 'טבלאות במקום תרשימים'],
    info: ['Charts, family history and Localities open as tables. Each page can still switch.', 'תרשימים, היסטוריית משפחות ויישובים נפתחים כטבלאות. בכל עמוד אפשר עדיין להחליף.'], synonyms: 'table exact screen reader map טבלה מדויק קורא מסך מפה' },
  { id: 'keepMessages', group: 'access', control: 'toggle', min: 'simple', label: ['Keep messages open', 'הודעות נשארות פתוחות'],
    info: ['Short messages, such as ‘Saved’, stay until you close them.', 'הודעות קצרות, כמו ‘נשמר’, נשארות עד שסוגרים אותן.'], synonyms: 'toast notification message timeout הודעה התראה' },
];

/** Factory defaults; a function of the level where noted. Each is one value here, so the owner can change it. */
export function settingDefault<K extends SettingId>(id: K, level: Preset): SettingValues[K] {
  const d: SettingValues = {
    theme: 'device', density: 'compact', starterTip: true, openOn: 'overview',
    listSymbol: 'logo', partyColourInSeats: level !== 'simple', jointListParties: level === 'simple' ? 'none' : level === 'standard' ? 'seated' : 'all', seatlessLists: 'over', withdrawnLists: true,
    listOrder: 'seats', voteCounts: level !== 'simple', lastTimeRows: false, allCandidates: false,
    chamberLayout: 'hemicycle', seatColour: 'list', blocShading: true, referenceChamber: true, chamberKey: true, dimUnselected: true,
    decimals: level === 'expert' ? 3 : level === 'standard' ? 2 : 1, splitWarning: true,
    confirmStartOver: true, hoverPreviews: true, communityScenarios: true, compareWith: 'previous', optionPreviews: true,
    textSize: 'normal', reduceMotion: false, hoverPopups: true, preferTables: false, keepMessages: false,
  };
  return d[id];
}
const EXTERNAL: ReadonlySet<RowId> = new Set<ExternalId>(['level', 'lang', 'jointByParty', 'voteSource', 'markChanges', 'copyMode']);
export const SETTING_IDS = SETTINGS.map(r => r.id).filter((id): id is SettingId => !EXTERNAL.has(id));

/** Is a stored value acceptable for this setting? Anything else falls back to the default, silently. */
export function validSetting(id: SettingId, v: unknown): boolean {
  const def = settingDefault(id, 'standard');
  if (id === 'decimals') return typeof v === 'number' && (DECIMAL_CHOICES as readonly number[]).includes(v);
  if (typeof def === 'boolean') return typeof v === 'boolean';
  const row = SETTINGS.find(r => r.id === id);
  return typeof v === 'string' && !!row?.options?.some(x => x.value === v);
}
export function validSettings(value: unknown): Partial<SettingValues> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, unknown> = {};
  for (const id of SETTING_IDS) { const v = (value as Record<string, unknown>)[id]; if (validSetting(id, v)) out[id] = v; }
  return out as Partial<SettingValues>;
}
export const settingValue = <K extends SettingId>(values: Partial<SettingValues>, id: K, level: Preset): SettingValues[K] =>
  (values[id] ?? settingDefault(id, level)) as SettingValues[K];

export const SETTINGS_KEY = 'israel-elections:settings';
export type SettingsRecord = { v: 2; values: Partial<SettingValues> };
/** Which rows a level shows: all of them (owner, 9 Nov 2026), except a row that exists only at one level (the
 *  Simple starter tip). Custom shows its base level's rows. */
export function rowVisible(row: SettingRow, level: Preset): boolean {
  return !row.only || row.only === level;
}
/** Settings tiers, in display order: the rows of each tier sit under its own separator. */
export const TIERS: readonly Preset[] = ['simple', 'standard', 'expert'];
export const rowTier = (row: SettingRow): Preset => row.only ?? row.min;

const fold = (t: string) => t.toLowerCase().normalize('NFKD').replace(/[֑-ׇ]/g, '').replace(/[‘’'"״׳]/g, '');
/** Bilingual search: labels, options, (i) text and synonyms in both languages, whatever the interface language. */
export function rowMatches(row: SettingRow, query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  const hay = fold([...row.label, ...(row.info ?? []), ...(row.options ?? []).flatMap(x => x.label), row.synonyms].join(' '));
  return q.split(/\s+/).every(w => hay.includes(w));
}

export const isExternal = (id: RowId): id is ExternalId => EXTERNAL.has(id);
