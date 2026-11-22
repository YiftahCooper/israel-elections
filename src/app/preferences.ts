import { COPY_WORDS } from './compare/copyText.ts';

/** One registry for action-time questions and their Settings controls. Values are stable storage IDs. */
export const PREFERENCES = {
  voteSource: {
    label: ['Votes come from', 'מקור הקולות'],
    options: [
      { value: 'proportional', label: ['Other lists', 'שאר הרשימות'] },
      { value: 'new', label: ['People who stayed home', 'מי שלא הצביעו'] },
      { value: 'citizens', label: ['New citizens', 'אזרחים חדשים'] },
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
  /** How votes copied from another election start out (12 Nov 2026: adjusted for the number of eligible voters first).
   *  Within one election a copy is always the same number of votes. Each stored method is named as the Copy votes box
   *  shows it (22 Nov 2026: "Number of votes", with or without the adjustment, and "Share of valid votes"). */
  copyMode: {
    label: ['Copy votes: default method', 'העתקת קולות: שיטת ברירת המחדל'],
    options: [
      { value: 'eligible', label: COPY_WORDS.adjusted },
      { value: 'count', label: COPY_WORDS.notAdjusted },
      { value: 'share', label: COPY_WORDS.share },
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
export const sourceChoice = (v: string): import('./voteEdit.ts').SourceChoice => v.startsWith('t:') ? { kind: 'transfer', listId: v.slice(2) } : { kind: v === 'new' ? 'new' : v === 'citizens' ? 'citizens' : 'proportional' };
/** A question's default answer is stored plain when it is used without asking ("Set as default" with "Don't ask
 *  again"), and as `ask:<answer>` when the question is still asked each time, starting on that answer (owner,
 *  19 Nov 2026: the default and not asking are two separate choices). */
export const ASK_PREFIX = 'ask:';
/** The default answer, whether or not it is still asked. */
export const defaultAnswer = (v: string | undefined): string | undefined => (v?.startsWith(ASK_PREFIX) ? v.slice(ASK_PREFIX.length) : v);
/** Whether the question is asked: always without a default, and with one unless "Don't ask again" was chosen. */
export const asksEachTime = (v: string | undefined): boolean => !v || v.startsWith(ASK_PREFIX);
/** The stored form of a default answer. */
export const storedDefault = (answer: string, ask: boolean): string => (ask ? ASK_PREFIX : '') + answer;
export function validAnswers(value: unknown): PreferenceAnswers {
  if (!value || typeof value !== 'object') return {};
  const answers: PreferenceAnswers = {};
  for (const id of Object.keys(PREFERENCES) as PreferenceId[]) {
    const raw = (value as Record<string, unknown>)[id];
    // joint lists by party is a switch, never asked
    const v = typeof raw === 'string' && id !== 'jointSeats' ? defaultAnswer(raw) : raw;
    if (typeof v === 'string' && (PREFERENCES[id].options.some(o => o.value === v) || (id === 'voteSource' && v.startsWith('t:') && v.length > 2))) answers[id] = raw as string;
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
