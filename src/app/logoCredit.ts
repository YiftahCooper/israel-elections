// A party logo's licence and credit as a visitor reads them, in either language (review faults S1/S2, 19 Nov 2026).
// The stored attribution is a research record: it can open with a project id ("yesh-atid — …") and carries processing
// notes ("Resized to at most 256 px"). The screen says who the image is credited to and where it was found, in the
// page's language; the full record stays in the downloadable data.
import type { LogoRef } from '../data/schema.ts';
import { hebrewInEnglish } from '../data/names.ts';

type Lang = 'he' | 'en';
type Logo = Pick<LogoRef, 'attribution' | 'sourceUrl'>;

/** The licence in words: fair use, public domain, or the free licence's own name (CC BY-SA 4.0 is a name in both languages). */
export function logoLicence(logo: Pick<LogoRef, 'rights' | 'licence'>, lang: Lang): string {
  const he = lang === 'he';
  if (logo.rights === 'fair-use-identification') return he ? 'שימוש הוגן לזיהוי; הזכויות שמורות לבעליהן' : 'Fair use for identification; copyright with the rights holder';
  const l = logo.licence.trim();
  if (/^public domain/i.test(l)) return he ? 'נחלת הכלל' : 'Public domain';
  if (/^cc0/i.test(l)) return he ? 'נחלת הכלל (CC0)' : 'Public domain (CC0)';
  const cc = l.match(/^CC BY(-SA)? \d\.\d/);
  if (cc) return he ? `רישיון ${cc[0]}` : cc[0];
  return he ? 'רישיון חופשי' : 'Free licence';
}

const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
export const isCommons = (logo: Pick<LogoRef, 'sourceUrl'>) => host(logo.sourceUrl).endsWith('wikimedia.org');

/** Where the image was found: by its address, or the archive the record says held the page. */
function place(logo: Logo, lang: Lang): string {
  const h = host(logo.sourceUrl), he = lang === 'he';
  if (h.endsWith('wikimedia.org')) return he ? 'ויקישיתוף' : 'Wikimedia Commons';
  if (h.endsWith('jabotinsky.org')) return he ? 'ארכיון מכון ז׳בוטינסקי' : 'Jabotinsky Institute archive';
  if (h.endsWith('idi.org.il')) return he ? 'המכון הישראלי לדמוקרטיה' : 'Israel Democracy Institute';
  if (h.endsWith('zionistarchives.org.il')) return he ? 'הארכיון הציוני המרכזי' : 'Central Zionist Archives';
  if (h === 't.me') return he ? 'טלגרם' : 'Telegram';
  if (h.endsWith('facebook.com')) return he ? 'פייסבוק' : 'Facebook';
  if (h.endsWith('archive.org') || /Internet Archive/.test(logo.attribution)) return he ? 'אתר המפלגה, בארכיון האינטרנט' : 'the party’s website, in the Internet Archive';
  return he ? 'אתר המפלגה' : 'the party’s website';
}

/** Institutions that Commons credits, named in the page's language. */
const INSTITUTION: Record<string, readonly [string, string]> = {
  'הספרייה הלאומית': ['National Library of Israel', 'הספרייה הלאומית'],
  'National Library of Israel': ['National Library of Israel', 'הספרייה הלאומית'],
  'ארכיון הציוני': ['Central Zionist Archives', 'הארכיון הציוני המרכזי'],
};
/** The author Commons credits, when the record names one: not "unknown", not the uploader's own drawing, not an
 *  upload history. A Hebrew name inside English text is isolated so it reads right to left. */
function commonsAuthor(attribution: string, lang: Lang): string | null {
  const first = attribution.split(';')[0].trim();
  if (!first || /^(unknown author|own work|author not recorded|the original uploader)/i.test(first) || /^(Commons )?File:/.test(first)) return null;
  const known = INSTITUTION[first];
  if (known) return known[lang === 'he' ? 1 : 0];
  return lang === 'en' ? hebrewInEnglish(first) : first;
}

/** What the image is credited to (null when the record names no one beyond the place) and where it was found. */
export function logoCredit(logo: Logo, lang: Lang): { by: string | null; where: string } {
  const where = place(logo, lang), he = lang === 'he', a = logo.attribution;
  if (isCommons(logo)) return { by: commonsAuthor(a, lang), where };
  const item = a.match(/item\s+(\d+)/i)?.[1];
  if (item && host(logo.sourceUrl).endsWith('jabotinsky.org')) return { by: he ? `פריט ${item}` : `item ${item}`, where };
  const issue = /זו הדרך/.test(a) ? a.match(/issue\s+(\d+)/i)?.[1] : undefined;
  if (issue) return { by: null, where: he ? `זו הדרך (עיתון מק״י), גיליון ${issue}` : `Zo HaDerekh (Maki newspaper), issue ${issue}` };
  if (/דוברות ש״ס/.test(a)) return { by: he ? 'דוברות ש״ס' : 'Shas spokesperson', where };
  if (/poster/i.test(a)) return { by: he ? 'כרזת בחירות' : 'Campaign poster', where };
  if (/brochure/i.test(a)) return { by: he ? 'עלון בחירות' : 'Campaign brochure', where };
  if (/platform/i.test(a)) return { by: he ? 'מצע הבחירות' : 'Campaign platform', where };
  return { by: he ? 'הסמל הרשמי' : 'Official mark', where };
}

export const logoCreditLine = (logo: Logo, lang: Lang) => { const c = logoCredit(logo, lang); return c.by ? `${c.by} · ${c.where}` : c.where; };
