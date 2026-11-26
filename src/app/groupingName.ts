/** Shared by screen labels, native options, SVG/image exports and textual descriptions. */
export interface GroupingName { nameHe: string; nameEn: string; appDefined?: boolean }
export const appGroupingTag = (lang: string) => lang === 'he' ? 'לא רשמי' : 'Unofficial';
export const appGroupingExplanation = (lang: string) => lang === 'he'
  ? 'חלוקה לצורך השוואה בין בחירות; זו אינה חלוקה רשמית ולא חלוקה שהייתה מקובלת בזמן הבחירות.'
  : 'A grouping for comparing elections; not an official one, nor one used at the time.';
/** Pass a scheme only when its own marked label is visible in the same display context. */
export function groupingName(g: GroupingName, lang: string, markedScheme?: { appDefined?: boolean }): string {
  return `${lang === 'he' ? g.nameHe : g.nameEn}${g.appDefined && !markedScheme?.appDefined ? ` · ${appGroupingTag(lang)}` : ''}`;
}
