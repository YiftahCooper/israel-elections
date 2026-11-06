/** Shared by screen labels, native options, SVG/image exports and textual descriptions. */
export interface GroupingName { nameHe: string; nameEn: string; appDefined?: boolean }
export const appGroupingTag = (lang: string) => lang === 'he' ? 'יישומון' : 'App';
export const appGroupingExplanation = (lang: string) => lang === 'he'
  ? 'היישומון הגדיר חלוקה זו לצורך השוואה; זו אינה חלוקה רשמית או חלוקה שהייתה מוכרת בזמן הבחירות.'
  : 'The app defined this grouping for comparison; it is not an official or contemporaneous grouping.';
export function groupingName(g: GroupingName, lang: string): string {
  return `${lang === 'he' ? g.nameHe : g.nameEn}${g.appDefined ? ` · ${appGroupingTag(lang)}` : ''}`;
}
