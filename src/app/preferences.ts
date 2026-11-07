/** One registry for action-time questions and their Settings controls. Values are stable storage IDs. */
export const PREFERENCES = {
  voteSource: {
    label: ['Votes come from', 'הקולות מגיעים מ'],
    options: [
      { value: 'proportional', label: ['Other lists', 'שאר הרשימות'] },
      { value: 'new', label: ['New voters', 'מצביעים חדשים'] },
    ],
  },
  jointSeats: {
    label: ["Count joint lists’ seats by party", 'ספירת מנדטים ברשימות משותפות לפי מפלגה'],
    options: [
      { value: 'off', label: ['Off', 'כבוי'] },
      { value: 'on', label: ['On', 'פעיל'] },
    ],
  },
  comparison: {
    label: ['Mark differences from', 'סימון הבדלים לעומת'],
    options: [
      { value: 'reference', label: ['Loaded scenario', 'התרחיש הטעון'] },
      { value: 'official', label: ['Official result', 'התוצאה הרשמית'] },
    ],
  },
  /** Compare: how votes copied between elections are read (within one election a copy is always the count). */
  copyMode: {
    label: ['Copy votes between elections as', 'העתקת קולות בין בחירות לפי'],
    options: [
      { value: 'share', label: ['Share of the vote', 'שיעור מהקולות'] },
      { value: 'count', label: ['Number of votes', 'מספר הקולות'] },
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

/** Read only recognised, election-scoped item answers. Entity existence is checked against
 * the scenario when used: custom lists may only exist in a restored browser workspace. */
export function validItemAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, answer]) => {
    const match = /^(voteSource|copyMode):(k(?:[1-9]|1[0-9]|2[0-6])):(list|bloc):(.+)$/.exec(key);
    return match && typeof answer === 'string' && validAnswers({ [match[1]]: answer })[match[1] as PreferenceId] === answer;
  }));
}
