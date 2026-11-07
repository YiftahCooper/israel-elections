import type { Lang } from './i18n.ts';
export const appLocale = (lang: Lang) => lang === 'he' ? 'he-IL' : 'en-GB';
export function formatDate(value: string, lang: Lang): string {
  // Preserve source precision: a year alone must not acquire a fabricated day.
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Date(value.slice(0, 10) + 'T12:00:00Z').toLocaleDateString(appLocale(lang), { timeZone: 'UTC', dateStyle: 'medium' });
}
