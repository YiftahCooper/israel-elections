/** One registry for action-time questions and their Settings controls. Values are stable storage IDs. */
export const PREFERENCES = {
  voteSource: {
    label: ['Votes come from', 'הקולות מגיעים מ'],
    options: [
      { value: 'proportional', label: ['Other lists', 'שאר הרשימות'] },
      { value: 'new', label: ['New voters', 'מצביעים חדשים'] },
    ],
  },
  comparison: {
    label: ['Mark differences from', 'סימון הבדלים לעומת'],
    options: [
      { value: 'reference', label: ['Loaded scenario', 'התרחיש הטעון'] },
      { value: 'official', label: ['Official result', 'התוצאה הרשמית'] },
    ],
  },
} as const;
export type PreferenceId = keyof typeof PREFERENCES;
export type PreferenceAnswers = Partial<Record<PreferenceId, string>>;
export type PreferenceAsk = {
  id: PreferenceId; key: string; title: string; exclude?: string[];
  run: (answer: string) => void; cancel?: () => void;
};
export const sourceValue = (src: import('./voteEdit.ts').SourceChoice) => src.kind === 'transfer' ? `t:${src.listId}` : src.kind;
export const sourceChoice = (v: string): import('./voteEdit.ts').SourceChoice => v.startsWith('t:') ? { kind: 'transfer', listId: v.slice(2) } : { kind: v === 'new' ? 'new' : 'proportional' };
export function validAnswers(value: unknown): PreferenceAnswers {
  if (!value || typeof value !== 'object') return {};
  const answers: PreferenceAnswers = {};
  for (const id of Object.keys(PREFERENCES) as PreferenceId[]) {
    const v = (value as Record<string, unknown>)[id];
    if (typeof v === 'string' && (PREFERENCES[id].options.some(o => o.value === v) || (id === 'voteSource' && v.startsWith('t:') && v.length > 2))) answers[id] = v;
  }
  return answers;
}
