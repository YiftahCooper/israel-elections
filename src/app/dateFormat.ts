import type { Lang } from './i18n.ts';
export const appLocale = (lang: Lang) => lang === 'he' ? 'he-IL' : 'en-GB';
export function formatDate(value: string, lang: Lang): string {
  // Preserve source precision: month-only records must not acquire a fabricated day.
  const monthOnly = /^\d{4}-\d{2}$/.test(value);
  if (!monthOnly && !/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = monthOnly ? `${value}-01` : value.slice(0, 10);
  return new Date(date + 'T12:00:00Z').toLocaleDateString(appLocale(lang), { timeZone: 'UTC', ...(monthOnly ? { month: 'short', year: 'numeric' } : { dateStyle: 'medium' }) });
}
/** Stored research text (candidate notes, source records, logo credits) keeps the ISO dates it was written with;
 *  on screen each is written in the app's date format, in the language of the text around it (a Hebrew note
 *  "ב־3 במרץ 2021", an English source record "3 Mar 2021" also on the Hebrew page). A date inside a file name or an
 *  identifier ("…-2022-10-23.pdf") is left alone. */
export function datesInText(text: string): string {
  const lang: Lang = (text.match(/[֐-׿]/g)?.length ?? 0) > (text.match(/[A-Za-z]/g)?.length ?? 0) ? 'he' : 'en';
  return text.replace(/(?<![\w./-])\d{4}-\d{2}-\d{2}(?![\w/]|-\w|\.\w)/g, (d) => formatDate(d, lang));
}
