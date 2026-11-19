import type { Lang } from './i18n.ts';
export const appLocale = (lang: Lang) => lang === 'he' ? 'he-IL' : 'en-GB';
// Each answer is kept: toLocaleDateString builds a new formatter on every call, and every edit re-renders lists of
// dates (the election picker writes all 26), so on a slow phone that was a noticeable share of each edit's work.
const formatted = new Map<string, string>();
export function formatDate(value: string, lang: Lang): string {
  const key = `${lang} ${value}`, hit = formatted.get(key);
  if (hit !== undefined) return hit;
  if (formatted.size > 4000) formatted.clear();
  const out = formatDateNow(value, lang);
  formatted.set(key, out);
  return out;
}
function formatDateNow(value: string, lang: Lang): string {
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
  return text.replace(/(?<![\w./-])\d{4}-\d{2}-\d{2}(?![\w/]|-\w|\.\w)/g, (d) => formatDate(d, lang))
    // a date written the Israeli way, day.month.year ("ynet, 29.1.2003", "בימים 1–8.4.2019"), reads like every other
    // date on screen (one date format per language); a day range keeps its first day. Never inside an address or a
    // file name, and only for a real day and month.
    .replace(/(?<![\w./%-])(?:(\d{1,2})[–-])?(\d{1,2})\.(\d{1,2})\.(\d{4})(?![\w/%]|\.\w)/g, (all, from, d, m, y) => {
      if (+m < 1 || +m > 12 || +d < 1 || +d > 31 || (from && (+from < 1 || +from >= +d))) return all;
      const day = formatDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, lang);
      return from ? `${from}–${day}` : day;
    });
}
