// 2013 (k19): the declared result and the detailed results differ slightly for three lists. The app shows the detailed
// (polling-station) totals; the owner chose to note the difference, not change it (7 Nov). Evidence:
// docs/research/data-audit/k19-resolution.md (owner questions 1–3) and decisions 0041–0042.
const K19: Record<string, { declared: number; detailed: number }> = {
  '19-מחל': { declared: 885_054, detailed: 885_163 },
  '19-כן': { declared: 79_081, detailed: 78_974 },
  '19-יק': { declared: 18_941, detailed: 18_939 },
};
const n = (x: number) => x.toLocaleString('en-US');

/** The (i) beside a 2013 list's votes, or undefined for every other list. */
export function k19ListNote(id: string, lang: 'he' | 'en'): string | undefined {
  const x = K19[id];
  if (!x) return undefined;
  return lang === 'he'
    ? `התוצאה המוכרזת (רשומות וחישוב המנדטים): ${n(x.declared)}. סכום התוצאות המפורטות, המוצג כאן: ${n(x.detailed)}. אין שינוי במנדטים. הסיבה אינה מתועדת.`
    : `Declared result (Reshumot notice and seat calculation): ${n(x.declared)}. The detailed results, shown here, sum to ${n(x.detailed)}. No seat changes. Cause not documented.`;
}

/** Added to 2013's data-status note, which already explains the corrected national total. Each list's pair stays
 *  together, so the figures read in order in Hebrew too. */
export const k19StatusNote = (lang: 'he' | 'en') => lang === 'he'
  ? 'התוצאה המוכרזת (רשומות וחישוב המנדטים), ובסוגריים התוצאות המפורטות המוצגות כאן: הליכוד ביתנו 885,054 (885,163), קדימה 79,081 (78,974), הישראלים 18,941 (18,939). הסיבה אינה מתועדת.'
  : 'Declared result (Reshumot notice and seat calculation), with the detailed results shown here in brackets: Likud–Yisrael Beiteinu 885,054 (885,163), Kadima 79,081 (78,974), Hayisraelim 18,941 (18,939). Cause not documented.';
