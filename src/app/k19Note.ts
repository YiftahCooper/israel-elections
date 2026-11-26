// 2013 (k19): the declared result and the detailed results differ slightly for three lists. The app shows the declared
// result, by which the seats were handed out (owner, 16 Nov 2026; decision 0094), and notes the detailed figures, which
// the 2013 map and list of places add up to. Evidence: docs/research/data-audit/k19-resolution.md, decisions 0041–0042.
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
  // plain words (clarity pass, 26 Nov 2026): which figure is shown and why, the other figure, and that it is unexplained
  return lang === 'he'
    ? `אלה הקולות שהוכרזו, ולפיהם חולקו המנדטים. בספירה המפורטת לפי יישובים: ${n(x.detailed)}. הפער אינו מוסבר.`
    : `These are the declared votes, which decided the seats. The detailed count by place gives ${n(x.detailed)}; the difference is unexplained.`;
}

/** Added to 2013's data-status note, which already explains the corrected national total. Each list's pair stays
 *  together, so the figures read in order in Hebrew too. */
export const k19StatusNote = (lang: 'he' | 'en') => lang === 'he'
  ? 'מוצגים הקולות שהוכרזו, ולפיהם חולקו המנדטים. בספירה המפורטת לפי יישובים (בסוגריים) יש הבדל קטן בשלוש רשימות: הליכוד ביתנו 885,054 (885,163), קדימה 79,081 (78,974), הישראלים 18,941 (18,939). הפער אינו מוסבר.'
  : 'Shown: the declared votes, which decided the seats. The detailed count by place (in brackets) differs slightly for three lists: Likud–Yisrael Beiteinu 885,054 (885,163), Kadima 79,081 (78,974), Hayisraelim 18,941 (18,939). The difference is unexplained.';
