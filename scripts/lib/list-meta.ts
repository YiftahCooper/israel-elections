// App-assigned presentation metadata. None of this is official data: short names are common
// usage, English names are the names in common English-language use, colours are chosen for
// legibility, and blocs are a common media grouping offered only as an editable default.
// Lists not listed here fall back to their official Hebrew name and a neutral colour.

export interface Meta { he: string; en: string | null; color: string; bloc?: string; order?: number }

export const BLOCS = {
  k25: [
    { id: 'netanyahu', nameHe: 'גוש נתניהו', nameEn: 'Netanyahu bloc', color: '#2f5fa8' },
    { id: 'change', nameHe: 'גוש השינוי', nameEn: 'Change bloc', color: '#2aa198' },
    { id: 'arab', nameHe: 'רשימות ערביות', nameEn: 'Arab lists', color: '#2e8b57' },
  ],
  k26: [
    { id: 'netanyahu', nameHe: 'גוש נתניהו', nameEn: 'Netanyahu bloc', color: '#2f5fa8' },
    { id: 'opposition', nameHe: 'גוש האופוזיציה', nameEn: 'Opposition bloc', color: '#2aa198' },
    { id: 'arab', nameHe: 'רשימות ערביות', nameEn: 'Arab lists', color: '#2e8b57' },
  ],
};

export const META: Record<string, Meta> = {
  // ---- 22nd–24th Knessets: common names; no default blocs (see ADR 0021).
  '22-פה': { he: "כחול לבן", en: "Blue and White", color: '#4388cc' },
  '22-מחל': { he: "הליכוד", en: "Likud", color: '#b5653c' },
  '22-ודעם': { he: "הרשימה המשותפת", en: "Joint List", color: '#648f52' },
  '22-שס': { he: "ש״ס", en: "Shas", color: '#9869b5' },
  '22-ל': { he: "ישראל ביתנו", en: "Yisrael Beiteinu", color: '#438d89' },
  '22-ג': { he: "יהדות התורה", en: "United Torah Judaism", color: '#bc667e' },
  '22-טב': { he: "ימינה", en: "Yamina", color: '#9b853c' },
  '22-אמת': { he: "העבודה–גשר", en: "Labor–Gesher", color: '#6778bd' },
  '22-מרצ': { he: "המחנה הדמוקרטי", en: "Democratic Union", color: '#ad703f' },
  '22-כף': { he: "עוצמה יהודית", en: "Otzma Yehudit", color: '#508c6c' },
  '22-זן': { he: "זהות", en: "Zehut", color: '#a96791' },
  '22-כ': { he: "נעם", en: "Noam", color: '#5386a2' },
  '22-זץ': { he: "צומת", en: "Tzomet", color: '#96834c' },
  '23-מחל': { he: "הליכוד", en: "Likud", color: '#4388cc' },
  '23-פה': { he: "כחול לבן", en: "Blue and White", color: '#b5653c' },
  '23-ודעם': { he: "הרשימה המשותפת", en: "Joint List", color: '#648f52' },
  '23-שס': { he: "ש״ס", en: "Shas", color: '#9869b5' },
  '23-ג': { he: "יהדות התורה", en: "United Torah Judaism", color: '#438d89' },
  '23-אמת': { he: "העבודה–גשר–מרצ", en: "Labor–Gesher–Meretz", color: '#bc667e' },
  '23-ל': { he: "ישראל ביתנו", en: "Yisrael Beiteinu", color: '#9b853c' },
  '23-טב': { he: "ימינה", en: "Yamina", color: '#6778bd' },
  '23-נץ': { he: "עוצמה יהודית", en: "Otzma Yehudit", color: '#ad703f' },
  '23-זץ': { he: "צומת", en: "Tzomet", color: '#508c6c' },
  '24-מחל': { he: "הליכוד", en: "Likud", color: '#4388cc' },
  '24-פה': { he: "יש עתיד", en: "Yesh Atid", color: '#b5653c' },
  '24-שס': { he: "ש״ס", en: "Shas", color: '#648f52' },
  '24-כן': { he: "כחול לבן", en: "Blue and White", color: '#9869b5' },
  '24-ב': { he: "ימינה", en: "Yamina", color: '#438d89' },
  '24-אמת': { he: "העבודה", en: "Labor", color: '#bc667e' },
  '24-ג': { he: "יהדות התורה", en: "United Torah Judaism", color: '#9b853c' },
  '24-ל': { he: "ישראל ביתנו", en: "Yisrael Beiteinu", color: '#6778bd' },
  '24-ט': { he: "הציונות הדתית", en: "Religious Zionism", color: '#ad703f' },
  '24-ודעם': { he: "הרשימה המשותפת", en: "Joint List", color: '#508c6c' },
  '24-ת': { he: "תקווה חדשה", en: "New Hope", color: '#a96791' },
  '24-מרצ': { he: "מרצ", en: "Meretz", color: '#5386a2' },
  '24-עם': { he: "רע״ם", en: "Ra'am", color: '#96834c' },
  '24-יז': { he: "הכלכלית החדשה", en: "New Economic Party", color: '#4388cc' },
  '24-זץ': { he: "צומת", en: "Tzomet", color: '#b5653c' },

  // ---- 25th Knesset (2022)
  '25-מחל': { he: 'הליכוד', en: 'Likud', color: '#2a78d6', order: 1, bloc: 'netanyahu' },
  '25-פה': { he: 'יש עתיד', en: 'Yesh Atid', color: '#1baf7a', order: 5, bloc: 'change' },
  '25-ט': { he: 'הציונות הדתית', en: 'Religious Zionism', color: '#eda100', order: 2, bloc: 'netanyahu' },
  '25-כן': { he: 'המחנה הממלכתי', en: 'National Unity', color: '#9a5bd0', order: 7, bloc: 'change' },
  '25-שס': { he: 'ש״ס', en: 'Shas', color: '#6250d6', order: 3, bloc: 'netanyahu' },
  '25-ג': { he: 'יהדות התורה', en: 'United Torah Judaism', color: '#a0601e', order: 4, bloc: 'netanyahu' },
  '25-ל': { he: 'ישראל ביתנו', en: 'Yisrael Beiteinu', color: '#e87ba4', order: 8, bloc: 'change' },
  '25-עם': { he: 'רע״ם', en: "Ra'am", color: '#008300', order: 9, bloc: 'arab' },
  '25-ום': { he: 'חד״ש–תע״ל', en: "Hadash–Ta'al", color: '#e34948', order: 10, bloc: 'arab' },
  '25-אמת': { he: 'העבודה', en: 'Labor', color: '#eb6834', order: 6, bloc: 'change' },
  '25-מרצ': { he: 'מרצ', en: 'Meretz', color: '#5a7fc0', order: 11, bloc: 'change' },
  '25-ד': { he: 'בל״ד', en: 'Balad', color: '#b0507a', order: 12, bloc: 'arab' },
  '25-ב': { he: 'הבית היהודי', en: 'The Jewish Home', color: '#7d9fc4' },
  '25-אצ': { he: 'חופש כלכלי', en: 'Economic Freedom', color: '#9c8f6e' },
  '25-יז': { he: 'הכלכלית החדשה', en: 'New Economic Party', color: '#8c7aa8' },
  '25-קץ': { he: 'באומץ בשבילך', en: null, color: '#a08f8f' },
  '25-צ': { he: 'צעירים בוערים', en: 'Young People on Fire', color: '#c78f4a' },
  // ---- 26th Knesset (2026)
  '26-מחל': { he: 'הליכוד', en: 'Likud', color: '#2a78d6', order: 1, bloc: 'netanyahu' },
  '26-דרך': { he: 'ישר!', en: 'Yashar!', color: '#1baf7a', order: 6, bloc: 'opposition' },
  '26-רק': { he: 'ביחד', en: 'Together (Bennett)', color: '#9a5bd0', order: 8, bloc: 'opposition' },
  '26-ודם': { he: 'הרשימה המשותפת', en: 'Joint List', color: '#e34948', order: 11, bloc: 'arab' },
  '26-אמת': { he: 'הדמוקרטים', en: 'The Democrats', color: '#eb6834', order: 7, bloc: 'opposition' },
  '26-עם': { he: 'רע״ם', en: "Ra'am", color: '#008300', order: 10, bloc: 'arab' },
  '26-ל': { he: 'ישראל ביתנו', en: 'Yisrael Beiteinu', color: '#e87ba4', order: 9, bloc: 'opposition' },
  '26-ב': { he: 'עוצמה יהודית', en: 'Otzma Yehudit', color: '#eda100', order: 2, bloc: 'netanyahu' },
  '26-ג': { he: 'יהדות התורה', en: 'United Torah Judaism', color: '#a0601e', order: 4, bloc: 'netanyahu' },
  '26-שס': { he: 'ש״ס', en: 'Shas', color: '#6250d6', order: 3, bloc: 'netanyahu' },
  '26-ט': { he: 'הציונות הדתית–זהות', en: 'Religious Zionism–Zehut', color: '#5a7fc0', order: 5, bloc: 'netanyahu' },
  '26-די': { he: 'המילואימניקים והכלכלית', en: 'Reservists & New Economic', color: '#7f8fa6', order: 12 },
  '26-ך': { he: 'עמך ישראל', en: 'Amcha Yisrael', color: '#9c7b5b' },
  '26-כן': { he: 'כחול לבן', en: 'Blue and White', color: '#8aa6cf' },
  '26-נר': { he: 'צבע שחור', en: null, color: '#777777' },
  '26-זך': { he: 'הציבור החרדי', en: null, color: '#8b8378' },
  '26-ני': { he: 'נעם', en: 'Noam', color: '#a58d6a' },
};

const NEUTRAL = ['#8e8e93', '#9a948a', '#8b95a1', '#a1948b', '#93a18b', '#9a8ba1'];
export const neutralColor = (i: number) => NEUTRAL[i % NEUTRAL.length];
