import type { Lang } from './i18n.ts';

/** Local adapter until V6's shared locale formatter lands. Keep source precision; never infer a day. */
export function formatAfterDate(value: string, lang: Lang): string {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-GB', {
    year: 'numeric', ...(month ? { month: 'short' as const } : {}),
    ...(day ? { day: 'numeric' as const } : {}), timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month ?? 1) - 1, Number(day ?? 1))));
}
