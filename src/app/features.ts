export type Preset = 'simple' | 'standard' | 'expert';
export type Visibility = 'show' | 'collapsed' | 'hidden';
export const TOOL_FEATURES = [
  ['board', 'Explore', 'Overview', 'תמונת מצב', 'simple'],
  ['after', 'Explore', 'After the election', 'אחרי הבחירות', 'simple'],
  ['families', 'Explore', 'Party families', 'משפחות מפלגות', 'simple'],
  ['scenarios', 'Explore', 'Scenarios', 'תרחישים', 'simple'],
  ['whatif', 'Explore', 'What if…', 'מה אם…', 'simple'],
  ['coal', 'Explore', 'Coalitions', 'קואליציות', 'simple'],
  ['walk', 'Explore', 'How seats were allocated', 'חלוקת המנדטים', 'simple'],
  ['structure', 'Edit', 'Merge & split', 'איחוד ופיצול', 'standard'],
  ['security', 'Analyse', 'Seat safety', 'ביטחון המנדטים', 'standard'],
  ['charts', 'Analyse', 'Charts', 'תרשימים', 'standard'],
  ['turnout', 'Edit', 'Turnout', 'שיעור הצבעה', 'expert'],
  ['sens', 'Analyse', 'Sensitivity', 'רגישות', 'expert'],
  ['loc', 'Analyse', 'Localities', 'יישובים', 'expert'],
  ['rules', 'Edit', 'Rules', 'כללים', 'expert'],
  ['sources', 'Explore', 'Sources', 'מקורות', 'simple'],
] as const;
export const FEATURES = [...TOOL_FEATURES,
  // Side by side opens from the comparison strip, not as a tab, at every level (owner, 12 Nov 2026, C5b)
  ['compare', 'Analyse', 'Side by side', 'זו לצד זו', 'simple'],
  ['familyEdit', 'Edit', 'Family definitions and your versions', 'הגדרות משפחות והגרסאות שלכם', 'standard'],
  ['familyScale', 'Edit', 'Scale family votes', 'שינוי קולות למשפחה', 'standard'],
  ['familyGrouping', 'Edit', 'Apply family grouping', 'קיבוץ לפי משפחה', 'standard'],
  // Merge & split → Merge lists: the merged list's name, letters, candidate order and colour (the id is historical)
  ['splitIdentity', 'Edit', 'Merged list details', 'פרטי הרשימה המאוחדת', 'standard'],
  ['voteStart', 'Edit', 'Restore or copy votes', 'שחזור או העתקת קולות', 'standard'],
  ['chamberOptions', 'Explore', 'Chamber options', 'אפשרויות המליאה', 'expert'],
  ['chamberLegend', 'Explore', 'Export the chamber', 'ייצוא המליאה', 'standard'],
  ['voteFigures', 'Analyse', 'Vote totals', 'סיכומי קולות', 'standard'],
  ['expertFigures', 'Analyse', 'Detailed figures', 'נתונים מפורטים', 'expert'],
  ['jointEditing', 'Edit', 'Joint-list editing', 'עריכת רשימה משותפת', 'standard'],
  ['voteSource', 'Edit', 'Vote source', 'מקור הקולות', 'standard'],
  ['agreements', 'Edit', 'Edit surplus agreements', 'עריכת הסכמי עודפים', 'standard'],
  ['standing', 'Edit', 'Bloc and withdrawal', 'גוש ופרישה', 'standard'],
  ['identity', 'Edit', 'Name and colour', 'שם וצבע', 'expert'],
  ['candidateEdit', 'Edit', 'Candidate editing', 'עריכת מועמדים', 'expert'],
  ['allocation', 'Analyse', 'How the list won its seats', 'איך הרשימה זכתה במנדטים', 'expert'],
  // Details that used to follow the level directly (owner, 16 Nov 2026: every difference between levels can be set
  // one by one). Each is shown or not; none has a folded form (SHOW_OR_HIDE).
  ['agreementMarks', 'Explore', 'Agreement marks', 'סימוני הסכמי עודפים', 'standard'],
  ['candidateDetail', 'Explore', 'Full candidate list', 'רשימת מועמדים מלאה', 'standard'],
  ['whatIfAll', 'Explore', 'Every What if question', 'כל שאלות "מה אם"', 'standard'],
  ['timelineEvents', 'Explore', 'More timeline events', 'עוד אירועים בציר הזמן', 'standard'],
  ['timelineAllEvents', 'Explore', 'Every timeline event', 'כל האירועים בציר הזמן', 'expert'],
  ['historySources', 'Explore', 'Sources in party history', 'מקורות בהיסטוריית המפלגות', 'expert'],
  ['turnoutFacts', 'Analyse', 'Turnout facts', 'נתוני ההצבעה', 'standard'],
  ['turnoutCounts', 'Analyse', 'Ballot boxes and envelopes', 'קלפיות ומעטפות כפולות', 'expert'],
  ['jointVotes', 'Analyse', 'Party votes in joint lists', 'קולות המפלגות ברשימה משותפת', 'expert'],
  ['allocationFormulas', 'Analyse', 'Exact quotients', 'מנות מדויקות', 'expert'],
  ['compareTools', 'Analyse', 'Side by side tools', 'כלי ההשוואה', 'standard'],
  ['compareExpert', 'Analyse', 'Side by side: method and invalid ballots', 'זו לצד זו: שיטה וקולות פסולים', 'expert'],
  ['oneListSource', 'Edit', 'Votes from one list', 'קולות מרשימה אחת', 'standard'],
  ['copyVotesButton', 'Edit', 'Copy votes button', 'כפתור העתקת קולות', 'standard'],
  ['copyMethods', 'Edit', 'Copy votes: more methods', 'העתקת קולות: שיטות נוספות', 'standard'],
  ['copyChangeMethods', 'Edit', 'Copy votes: copy the edit', 'העתקת קולות: העתקת השינוי', 'expert'],
  ['rulesCopy', 'Edit', 'Copy the rules', 'העתקת הכללים', 'expert'],
  // Coalitions: MKs who vote apart from their list (owner, 16 Nov 2026: Expert only, and folded even there)
  ['mkVotes', 'Analyse', 'MKs apart from their list', 'חברי כנסת בנפרד מרשימתם', 'expert'],
] as const;
export type FeatureId = typeof FEATURES[number][0];
/** The one source of every tool and section name (tab strip, Custom page, disclosures) and of level names. */
export const featureLabel = (id: FeatureId): readonly [string, string] => { const f = FEATURES.find(x => x[0] === id)!; return [f[2], f[3]]; };
export const LEVEL_LABELS: Record<Preset, readonly [string, string]> = { simple: ['Simple', 'פשוט'], standard: ['Standard', 'רגיל'], expert: ['Expert', 'מומחה'] };
/** The user's own fourth complexity: a named one plus the user's choices (owner, 19 Nov 2026). */
export const CUSTOM_LABEL: readonly [string, string] = ['Custom', 'מותאם אישית'];
/** What the three (four) are called as a whole (owner, 19 Nov 2026: "complexity"). */
export const COMPLEXITY_LABEL: readonly [string, string] = ['Complexity', 'רמת מורכבות'];
export const RANK: Record<Preset, number> = { simple: 0, standard: 1, expert: 2 };
const TOOL_IDS: readonly string[] = TOOL_FEATURES.map(f => f[0]);
/** What each complexity shows. A section above the complexity is hidden, not folded (owner, 26 Nov 2026: folds that
 *  open to a higher complexity's controls only confused). A tool tab above it stays listed, greyed out, and asks to
 *  switch or add it (owner, 16 Nov 2026). The Custom complexity can still fold or show any section. */
export const PRESETS = Object.fromEntries((['simple', 'standard', 'expert'] as const).map(level =>
  [level, Object.fromEntries(FEATURES.map(([id,,,, min]) => [id, RANK[level] >= RANK[min] ? 'show' : TOOL_IDS.includes(id) ? 'collapsed' : 'hidden']))])) as Record<Preset, Record<FeatureId, Visibility>>;
/** Always shown, never a feature: a list's notes on the sources are among the data qualifications (audit 12 Nov 2026). */
export const TRUTH_LABELS = ['editMarkers', 'scenarioChip', 'searchQualifiers', 'publicationWarnings', 'dataQualifications'] as const;
/** Features with no folded form: the Custom page offers Show or Hidden only (Side by side is a button or nothing). */
export const SHOW_OR_HIDE: readonly FeatureId[] = ['compare', 'agreementMarks', 'candidateDetail', 'whatIfAll', 'timelineEvents',
  'timelineAllEvents', 'historySources', 'turnoutFacts', 'turnoutCounts', 'jointVotes', 'allocationFormulas', 'compareTools',
  'compareExpert', 'oneListSource', 'copyVotesButton', 'copyMethods', 'copyChangeMethods', 'rulesCopy'];
/** The visibility a level gives a feature on its own, before the user's own choices. */
export const presetOf = (id: FeatureId, level: Preset): Visibility => PRESETS[level][id];
/** The user's own choices that differ from what this level gives (the ones shown and undone in Settings). */
export function ownChoices(custom: Partial<Record<FeatureId, Visibility>> | null | undefined, level: Preset): FeatureId[] {
  if (!custom) return [];
  return FEATURES.map(f => f[0]).filter(id => id !== 'board' && custom[id] !== undefined && shownAs(id, custom[id]!) !== shownAs(id, PRESETS[level][id]));
}
/** A two-way feature has no folded form: Collapsed means not shown. */
export const shownAs = (id: FeatureId, v: Visibility): Visibility => SHOW_OR_HIDE.includes(id) && v === 'collapsed' && id !== 'compare' ? 'hidden' : v;
/** The level a feature first appears at. */
export const featureLevel = (id: FeatureId): Preset => FEATURES.find(f => f[0] === id)![4];

/** Short previews for the visibility cards, in the same order as their bilingual labels. */
export const FEATURE_PREVIEWS: Record<FeatureId, readonly [string, string]> = {
  families: ['Seats and votes of related parties across elections', 'מנדטים וקולות של מפלגות קרובות לאורך הבחירות'],
  familyEdit: ['Select lists, link partners and save your own version', 'בחירת רשימות, קישור שותפים ושמירת גרסה משלכם'],
  familyScale: ['Proportional vote changes in one election', 'שינוי יחסי בקולות במערכת בחירות אחת'],
  familyGrouping: ['Family, mixed lists and everyone else', 'משפחה, רשימות מעורבות וכל השאר'],
  after: ['Recommendations, the government and events in the term', 'המלצות, הממשלה ואירועים בכנסת'],
  board: ['Seats, lists and blocs', 'מנדטים, רשימות וגושים'],
  scenarios: ['Save and reuse your experiments', 'שמירה ושימוש חוזר בתרחישים'],
  whatif: ['Try a change and see who gains', 'שינוי קולות ובדיקת הנהנים'],
  coal: ['Choose lists and count a majority', 'בחירת רשימות ובדיקת רוב'],
  walk: ['Follow each seat award', 'מעקב אחר חלוקת כל מנדט'],
  structure: ['Combine lists or run them separately', 'איחוד רשימות או התמודדות בנפרד'],
  compare: ['Two results side by side', 'שתי תוצאות זו לצד זו'],
  security: ['Votes needed to gain or lose a seat', 'קולות להשגת מנדט או לאובדנו'],
  charts: ['Compare votes and seats visually', 'השוואה חזותית של קולות ומנדטים'],
  turnout: ['Change turnout and invalid ballots', 'שינוי שיעור ההצבעה והפתקים הפסולים'],
  sens: ['Explore seats across a range of votes', 'מנדטים לאורך טווח קולות'],
  loc: ['Browse votes on a map', 'עיון בקולות על מפה'],
  rules: ['Method, threshold, chamber size', 'שיטה, אחוז חסימה, גודל הכנסת'],
  sources: ['Official records and data coverage', 'מקורות רשמיים וכיסוי הנתונים'],
  splitIdentity: ['Name, letters, colour and candidate order', 'שם, אותיות, צבע וסדר המועמדים'],
  voteStart: ['The official votes, or a saved scenario’s', 'הקולות הרשמיים, או של תרחיש שמור'],
  chamberOptions: ['Arc or blocks; colour by list or bloc', 'קשת או משבצות; צביעה לפי רשימה או גוש'],
  chamberLegend: ['Download the seat diagram as SVG or PNG', 'הורדת תרשים המושבים כ־SVG או PNG'],
  voteFigures: ['Valid votes, and votes that won seats or none', 'קולות כשרים, וקולות שזכו או לא זכו במנדט'],
  expertFigures: ['Quota and allocation statistics', 'מודד ונתוני חלוקת מנדטים'],
  jointEditing: ['Parties within a joint list', 'מפלגות בתוך רשימה משותפת'],
  mkVotes: ['One MK’s vote in the confidence vote', 'ההצבעה של חבר כנסת אחד בהצבעת האמון'],
  voteSource: ['Where added votes come from', 'מהיכן מגיעים הקולות הנוספים'],
  agreements: ['Two lists pool their leftover votes', 'שתי רשימות מאחדות את קולות העודף שלהן'],
  standing: ['Move a list to another bloc, or take it out of the race', 'העברת רשימה לגוש אחר, או הוצאתה מההתמודדות'],
  identity: ['Names, ballot letters and colours', 'שמות, אותיות וצבעים'],
  candidateEdit: ['Reorder, add or remove candidates', 'סידור, הוספה והסרת מועמדים'],
  allocation: ['Seats from full quotas and from leftover votes', 'מנדטים ממודד שלם ומקולות עודפים'],
  agreementMarks: ['Each list’s surplus-vote partner, under its name', 'השותפה להסכם העודפים, מתחת לשם הרשימה'],
  candidateDetail: ['Every candidate, not only those elected', 'כל המועמדים, לא רק הנבחרים'],
  whatIfAll: ['All the questions, not only the first four', 'כל השאלות, לא רק ארבע הראשונות'],
  timelineEvents: ['Events beyond the main ones', 'אירועים מעבר לעיקריים'],
  timelineAllEvents: ['Minor events too', 'גם אירועים משניים'],
  historySources: ['The source for each change', 'המקור לכל שינוי'],
  turnoutFacts: ['Votes cast, valid and invalid votes, turnout history', 'מצביעים, קולות כשרים ופסולים, היסטוריית ההצבעה'],
  turnoutCounts: ['Polling-station results and double envelopes', 'תוצאות קלפי ומעטפות כפולות'],
  jointVotes: ['Each party’s votes under its joint list', 'קולות כל מפלגה מתחת לרשימה המשותפת'],
  allocationFormulas: ['How each quotient is worked out', 'איך מחושבת כל מנה'],
  compareTools: ['Search, pick rows, and see changes in share', 'חיפוש, בחירת שורות ושינוי בשיעור הקולות'],
  compareExpert: ['Rows for the seat method and invalid ballots', 'שורות לשיטת החלוקה ולקולות הפסולים'],
  oneListSource: ['Added votes come from a list you pick', 'הקולות הנוספים באים מרשימה שבוחרים'],
  copyVotesButton: ['Shown above the lists while comparing', 'מוצג מעל הרשימות בזמן השוואה'],
  copyMethods: ['Number of votes or share of valid votes, and remembering the choice', 'מספר קולות או שיעור מהקולות הכשרים, וזכירת הבחירה'],
  copyChangeMethods: ['Copy how a list’s votes changed, not the votes themselves', 'העתקת השינוי בקולות הרשימה, ולא הקולות עצמם'],
  rulesCopy: ['On Rules while comparing: copy the threshold, rules or agreements', 'בכללים בזמן השוואה: העתקת אחוז החסימה, הכללים או ההסכמים'],
};
