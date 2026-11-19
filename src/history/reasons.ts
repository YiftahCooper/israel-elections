// Why a seat changed hands, in words: one table for the term timeline's lines, the seat card and MK history (owner,
// 16 Nov 2026: show the reason for each replacement wherever the data has one). The reason codes come from the
// research files (data/research/knesset-events `replacement.reason`, data/research/knesset-member-changes
// `replacements[].reason`). A code not listed here is matched by its words; anything else shows no reason, never a
// guess. "unknown" is no reason.

/** Hebrew: masculine, feminine, and the neutral form for someone the Knesset's record gives no gender for */
type Words = { en: string; he: readonly [string, string, string] };
/** [code or pattern, words]: the first match wins, so the specific codes come before the general patterns. */
const REASONS: readonly (readonly [RegExp, Words])[] = [
  [/^norwegian-return$/, { en: 'Norwegian law', he: ['החוק הנורבגי', 'החוק הנורבגי', 'החוק הנורבגי'] }],
  [/norweg|נורבג/i, { en: 'Norwegian law', he: ['החוק הנורבגי', 'החוק הנורבגי', 'החוק הנורבגי'] }],
  [/^resignation-plea-agreement$/, { en: 'Resigned under a plea agreement', he: ['התפטר במסגרת הסדר טיעון', 'התפטרה במסגרת הסדר טיעון', 'התפטרות במסגרת הסדר טיעון'] }],
  [/^resignation-new-election-list$/, { en: 'Resigned to run on another list', he: ['התפטר כדי להתמודד ברשימה אחרת', 'התפטרה כדי להתמודד ברשימה אחרת', 'התפטרות לשם התמודדות ברשימה אחרת'] }],
  [/^(assassinat|murder)|נרצח/i, { en: 'Assassinated', he: ['נרצח', 'נרצחה', 'רצח בעת הכהונה'] }],
  [/^killed|נהרג/i, { en: 'Killed', he: ['נהרג', 'נהרגה', 'מוות בעת הכהונה'] }],
  [/death|died|deceased|נפטר/i, { en: 'Died in office', he: ['נפטר בעת כהונתו', 'נפטרה בעת כהונתה', 'פטירה בעת הכהונה'] }],
  [/^appoint|מינוי/i, { en: 'Left on appointment to another office', he: ['פרש לרגל מינוי לתפקיד אחר', 'פרשה לרגל מינוי לתפקיד אחר', 'פרישה לרגל מינוי לתפקיד אחר'] }],
  [/resign|התפטר/i, { en: 'Resigned', he: ['התפטר', 'התפטרה', 'התפטרות'] }],
];

/** The words for a recorded reason the seat was freed ("Resigned", "Died in office"), or null when none is recorded. */
export function reasonWords(reason: string | null | undefined, gender: 'f' | 'm' | null, lang: 'he' | 'en'): string | null {
  if (!reason || reason === 'unknown') return null;
  const hit = REASONS.find(([re]) => re.test(reason));
  if (!hit) return null;
  return lang === 'en' ? hit[1].en : hit[1].he[gender === 'm' ? 0 : gender === 'f' ? 1 : 2];
}

/** Why someone came in, from the same recorded reason (the seat was freed by it): "Norwegian law", "after a death". */
export function entryWords(reason: string | null | undefined, lang: 'he' | 'en'): string | null {
  if (!reason || reason === 'unknown') return null;
  if (/norweg|נורבג/i.test(reason)) return lang === 'en' ? 'Norwegian law' : 'החוק הנורבגי';
  if (/^(assassinat|murder)|נרצח|^killed|נהרג|death|died|deceased|נפטר/i.test(reason)) return lang === 'en' ? 'after a death' : 'אחרי פטירה';
  if (/^appoint|מינוי/i.test(reason)) return lang === 'en' ? 'after an appointment' : 'אחרי מינוי';
  if (/resign|התפטר/i.test(reason)) return lang === 'en' ? 'after a resignation' : 'אחרי התפטרות';
  return null;
}
