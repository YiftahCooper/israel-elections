/** One registry for action-time questions and their Settings controls. Values are stable storage IDs. */
export const PREFERENCES = {
  voteSource: {
    label: ['Votes come from', 'מקור הקולות'],
    options: [
      { value: 'proportional', label: ['Other lists', 'שאר הרשימות'] },
      { value: 'new', label: ['New voters', 'מצביעים חדשים'] },
    ],
  },
  jointSeats: {
    label: ['Joint lists by party', 'רשימות משותפות לפי מפלגה'],
    options: [
      { value: 'off', label: ['Off', 'כבוי'] },
      { value: 'on', label: ['On', 'פעיל'] },
    ],
  },
  comparison: {
    label: ['Mark changes since', 'סימון שינויים מאז'],
    options: [
      { value: 'reference', label: ['Opened scenario', 'התרחיש שנפתח'] },
      { value: 'official', label: ['Official result', 'התוצאה הרשמית'] },
    ],
  },
  /** How votes copied from another election start out (12 Nov 2026: the share of eligible voters first). Within one
   *  election a copy is always the same number of votes. */
  copyMode: {
    label: ['Copy votes: default method', 'העתקת קולות: שיטת ברירת המחדל'],
    options: [
      { value: 'eligible', label: ['Same share of eligible voters', 'אותו חלק מבעלי זכות הבחירה'] },
      { value: 'share', label: ['Same share of valid votes', 'אותו חלק מהקולות הכשרים'] },
      { value: 'count', label: ['Same number of votes', 'אותו מספר קולות'] },
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

/** Read only recognised item answers: election-scoped list and bloc answers, and "Mark changes since" for one saved
 * scenario. Entity existence is checked against the scenario when used: custom lists may only exist in a restored
 * browser workspace. */
export function validItemAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, answer]) => {
    const match = /^(voteSource|copyMode):(k(?:[1-9]|1[0-9]|2[0-6])):(list|bloc):(.+)$/.exec(key) ?? /^(comparison)::(.+)$/.exec(key);
    return match && typeof answer === 'string' && validAnswers({ [match[1]]: answer })[match[1] as PreferenceId] === answer;
  }));
}
