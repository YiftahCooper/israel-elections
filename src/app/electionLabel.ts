import { hebrewPrefix } from './hebrewPrefix.ts';
import type { ElectionIndexEntry } from '../data/schema.ts';
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const ordinalEn = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
/** "2026 · 26th"; the month is added when two elections fall in the same year (2019). */
export function electionLabel(e: ElectionIndexEntry, all: ElectionIndexEntry[], lang: 'he' | 'en') {
  const year = e.date.slice(0, 4);
  const month = Number(e.date.slice(5, 7)) - 1;
  const when = all.filter((x) => x.date.slice(0, 4) === year).length > 1 ? `${(lang === 'he' ? MONTHS_HE : MONTHS_EN)[month]} ${year}` : year;
  return lang === 'he' ? `${when} · הכנסת ${hebrewPrefix('ה', e.knesset)}` : `${when} · ${ordinalEn(e.knesset)} Knesset`;
}
