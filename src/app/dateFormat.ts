import type { Lang } from './i18n.ts';
export const appLocale = (lang: Lang) => lang === 'he' ? 'he-IL' : 'en-GB';
export function formatDate(value: string, lang: Lang): string {
  // Preserve source precision: month-only records must not acquire a fabricated day.
  const monthOnly = /^\d{4}-\d{2}$/.test(value);
  if (!monthOnly && !/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const date = monthOnly ? `${value}-01` : value.slice(0, 10);
  return new Date(date + 'T12:00:00Z').toLocaleDateString(appLocale(lang), { timeZone: 'UTC', ...(monthOnly ? { month: 'short', year: 'numeric' } : { dateStyle: 'medium' }) });
}
