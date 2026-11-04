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
