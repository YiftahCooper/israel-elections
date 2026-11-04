export type Preset = 'simple' | 'standard' | 'expert';
export type Visibility = 'show' | 'collapsed' | 'hidden';
export const TOOL_FEATURES = [
  ['board', 'Explore', 'Overview', 'תמונת מצב', 'simple'],
  ['scenarios', 'Explore', 'Scenarios', 'תרחישים', 'simple'],
  ['whatif', 'Explore', 'What if…', 'מה אם…', 'simple'],
  ['coal', 'Explore', 'Coalitions', 'קואליציות', 'simple'],
  ['walk', 'Explore', 'How seats were allocated', 'שלבי החלוקה', 'simple'],
  ['structure', 'Edit', 'Merge & split', 'איחודים ופיצולים', 'standard'],
  ['compare', 'Analyse', 'Compare', 'השוואה', 'standard'],
  ['security', 'Analyse', 'Seat safety', 'ביטחון המנדטים', 'standard'],
  ['charts', 'Analyse', 'Charts', 'תרשימים', 'standard'],
  ['turnout', 'Edit', 'Turnout', 'הצבעה', 'expert'],
  ['sens', 'Analyse', 'Sensitivity', 'רגישות', 'expert'],
  ['loc', 'Analyse', 'Localities', 'יישובים', 'expert'],
  ['rules', 'Edit', 'Rules', 'כללים', 'expert'],
  ['sources', 'Explore', 'Sources', 'מקורות', 'simple'],
] as const;
export const FEATURES = [...TOOL_FEATURES,
  ['splitIdentity', 'Edit', 'Split list identity', 'זהות הרשימה בפיצול', 'standard'],
  ['voteStart', 'Edit', 'Vote starting point', 'נקודת מוצא לקולות', 'standard'],
  ['chamberOptions', 'Explore', 'Chamber options', 'אפשרויות המליאה', 'expert'],
  ['chamberLegend', 'Explore', 'Chamber legend', 'מקרא המליאה', 'standard'],
  ['voteFigures', 'Analyse', 'Vote totals', 'סיכומי קולות', 'standard'],
  ['expertFigures', 'Analyse', 'Detailed figures', 'נתונים מפורטים', 'expert'],
  ['jointEditing', 'Edit', 'Joint-list editing', 'עריכת רשימה משותפת', 'standard'],
  ['voteSource', 'Edit', 'Vote source', 'מקור הקולות', 'standard'],
  ['agreements', 'Edit', 'Agreement editing', 'עריכת הסכמי עודפים', 'standard'],
  ['standing', 'Edit', 'Standing and withdrawal', 'מעמד ופרישה', 'standard'],
  ['identity', 'Edit', 'List identity', 'זהות הרשימה', 'expert'],
  ['candidateEdit', 'Edit', 'Candidate editing', 'עריכת מועמדים', 'expert'],
  ['allocation', 'Analyse', 'Allocation detail', 'פירוט החלוקה', 'expert'],
  ['notes', 'Explore', 'Official list notes', 'הערות רשמיות לרשימה', 'standard'],
] as const;
export type FeatureId = typeof FEATURES[number][0];
export const RANK: Record<Preset, number> = { simple: 0, standard: 1, expert: 2 };
export const PRESETS = Object.fromEntries((['simple', 'standard', 'expert'] as const).map(level =>
  [level, Object.fromEntries(FEATURES.map(([id,,,, min]) => [id, RANK[level] >= RANK[min] ? 'show' : 'collapsed']))])) as Record<Preset, Record<FeatureId, Visibility>>;
export const TRUTH_LABELS = ['editMarkers', 'scenarioChip', 'searchQualifiers', 'publicationWarnings', 'dataQualifications'] as const;

/** Short previews for the visibility cards, in the same order as their bilingual labels. */
export const FEATURE_PREVIEWS: Record<FeatureId, readonly [string, string]> = {
  board: ['Seats, lists and blocs', 'מנדטים, רשימות וגושים'],
  scenarios: ['Save and reuse your experiments', 'שמירה ושימוש חוזר בתרחישים'],
  whatif: ['Try a change and see who gains', 'שינוי קולות ובדיקת הנהנים'],
  coal: ['Choose lists and count a majority', 'בחירת רשימות ובדיקת רוב'],
  walk: ['Follow each seat award', 'מעקב אחר חלוקת כל מנדט'],
  structure: ['Combine lists or run them separately', 'איחוד רשימות או ריצה בנפרד'],
  compare: ['Two results side by side', 'שתי תוצאות זו לצד זו'],
  security: ['Votes needed to gain or lose a seat', 'קולות להשגת מנדט או לאובדנו'],
  charts: ['Compare votes and seats visually', 'השוואה חזותית של קולות ומנדטים'],
  turnout: ['Model participation and invalid ballots', 'הדמיית השתתפות ופתקים פסולים'],
  sens: ['Explore seats across a range of votes', 'מנדטים לאורך טווח קולות'],
  loc: ['Browse votes on a map', 'עיון בקולות על מפה'],
  rules: ['Method, threshold and chamber size', 'שיטה, אחוז חסימה וגודל הכנסת'],
  sources: ['Official records and data coverage', 'מקורות רשמיים וכיסוי הנתונים'],
  splitIdentity: ['Name and colour of each new list', 'שם וצבע לכל רשימה חדשה'],
  voteStart: ['Restore or copy vote totals', 'שחזור או העתקת מספרי קולות'],
  chamberOptions: ['Arc or blocks; colour by list or bloc', 'קשת או גושים; צביעה לפי רשימה או גוש'],
  chamberLegend: ['List names beside the seat diagram', 'שמות הרשימות לצד תרשים המושבים'],
  voteFigures: ['Valid, qualifying and unrepresented votes', 'קולות כשרים, משתתפים וללא ייצוג'],
  expertFigures: ['Quota and allocation statistics', 'מודד ונתוני חלוקת מנדטים'],
  jointEditing: ['Parties within a joint list', 'מפלגות בתוך רשימה משותפת'],
  voteSource: ['Where added votes come from', 'מהיכן מגיעים הקולות הנוספים'],
  agreements: ['Pair lists for surplus seats', 'צימוד רשימות לחלוקת עודפים'],
  standing: ['Contest, withdraw or restore a list', 'התמודדות, פרישה או החזרת רשימה'],
  identity: ['Names, ballot letters and colours', 'שמות, אותיות וצבעים'],
  candidateEdit: ['Reorder, add or remove candidates', 'סידור, הוספה והסרת מועמדים'],
  allocation: ['Whole-quota and remainder seats', 'מנדטים במודד ובחלוקת עודפים'],
  notes: ['Qualifications from the published record', 'סייגים מתוך הפרסום הרשמי'],
};
