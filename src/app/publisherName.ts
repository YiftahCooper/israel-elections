// A source's name in the reader's language, for the term timeline and the MK pages. Israeli institutions and Hebrew
// publications have Hebrew names; English-language publications keep their own names (reader-text pass, 17 Nov 2026).
const HE: Record<string, string> = {
  'Knesset': 'הכנסת',
  'Knesset House Committee': 'ועדת הכנסת',
  'Knesset Research and Information Center': 'מרכז המחקר והמידע של הכנסת',
  'Knesset News': 'חדשות הכנסת',
  'Knesset open data': 'הכנסת, מאגר המידע הפתוח',
  'Israel Democracy Institute': 'המכון הישראלי לדמוקרטיה',
  'Central Elections Committee': 'ועדת הבחירות המרכזית',
  'Central Elections Committee chair': 'יו״ר ועדת הבחירות המרכזית',
  'Hebrew Wikipedia': 'ויקיפדיה העברית',
  'Israel Hayom': 'ישראל היום',
  'Globes': 'גלובס',
  'Walla': 'וואלה',
  'Makor Rishon': 'מקור ראשון',
  'Calcalist': 'כלכליסט',
  'Kipa': 'כיפה',
  'Reshet 13': 'רשת 13',
  'Zman Yisrael': 'זמן ישראל',
  'Zman Israel': 'זמן ישראל',
  'Maariv': 'מעריב',
  'Haaretz': 'הארץ',
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_HE = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'];
const dateHe = (t: string) => t.replace(new RegExp(`\\b(\\d{1,2}) (${MONTHS.join('|')}) (\\d{4})\\b`), (_, d, m, y) => `${d} ${MONTHS_HE[MONTHS.indexOf(m)]} ${y}`);
/** Knesset records named in English by their parts ("Knesset, Divrei HaKnesset, 5 July 2021") */
const PATTERNS: [RegExp, (m: RegExpExecArray) => string][] = [
  [/^Knesset, Divrei HaKnesset, (.+)$/, (m) => `הכנסת, דברי הכנסת, ${dateHe(m[1])}`],
  [/^Knesset, plenum record, sitting (\d+), (.+)$/, (m) => `הכנסת, פרוטוקול המליאה, ישיבה ${m[1]}, ${dateHe(m[2])}`],
  [/^Knesset, Basic Law: The Government, section (\d+)$/, (m) => `הכנסת, חוק־יסוד: הממשלה, סעיף ${m[1]}`],
];

/** the name to show: the record's own Hebrew name, else a known Hebrew name, else the name as recorded */
export function publisherIn(lang: 'he' | 'en', name: string, he?: string): string {
  if (lang !== 'he') return name;
  if (he) return he;
  if (HE[name]) return HE[name];
  for (const [re, to] of PATTERNS) { const m = re.exec(name); if (m) return to(m); }
  return name;
}
