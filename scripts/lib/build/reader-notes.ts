// Reader wording for list notes whose text sits in a hash-pinned reviewed record (data/raw/kNN/*.reviewed.json).
// The record keeps its research wording and fingerprint; the dataset shows the plain sentence below instead
// (clarity pass, 26 Nov 2026). Each entry quotes the record's note exactly, so a changed record fails the build
// rather than showing an out-of-date sentence.

const READER: Record<string, { record: string; reader: string }[]> = {
  'k3/יז': [{
    record: 'כל מועמדי הרשימה התפטרו לפני הבחירות: ילקוט הפרסומים 429, עמ׳ 1087, הודעה מ־20.7.1955 שפורסמה ב־24.7.1955. אין לרשימה שורת תוצאות בילקוט 432; אפס אינו ספירת קולות משתתפת.',
    reader: 'כל מועמדי הרשימה התפטרו לפני הבחירות (הודעה מ־20.7.1955), והרשימה לא התמודדה.',
  }],
  'k15/ני': [{
    record: 'המועמד היחיד, מרדכי קרפל, התפטר ב־14 במאי 1999 (י״פ 4754, עמ׳ 3269). הרשימה אינה מופיעה בתוצאות הסופיות; אפס הקולות הוא ערך תצוגה לרשימה שפרשה.',
    reader: 'המועמד היחיד, מרדכי קרפל, התפטר ב־14 במאי 1999, והרשימה לא התמודדה.',
  }],
  'k15/ק': [{
    record: 'מועמדים 1, 3 ו־4 התפטרו ב־29 באפריל 1999; מועמד 2 התפטר ב־5 במאי 1999 (י״פ 4751, עמ׳ 3184). הרשימה אינה מופיעה בתוצאות הסופיות; אפס הקולות הוא ערך תצוגה לרשימה שפרשה.',
    reader: 'המועמדים במקומות 1, 3 ו־4 התפטרו ב־29 באפריל 1999, ומקום 2 ב־5 במאי 1999; הרשימה לא התמודדה.',
  }],
};

/** The notes of list `letters` in election `id`, with every recorded research note replaced by its reader wording. */
export function readerListNotes(id: string, letters: string, notes: readonly string[]): string[] {
  const entries = READER[`${id}/${letters}`];
  if (!entries) return [...notes];
  for (const e of entries) if (!notes.includes(e.record)) throw new Error(`reader-notes.ts: ${id}/${letters} record note changed; update its reader wording`);
  return notes.map((n) => entries.find((e) => e.record === n)?.reader ?? n);
}
