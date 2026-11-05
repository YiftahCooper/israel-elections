/** Conservative script transliteration for legacy/user-created names without English metadata.
 * Unpointed Hebrew cannot establish vowels. Curated dataset names take priority. */
const roman: Record<string, string> = {'א':"'",'ב':'b','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'h','ט':'t','י':'y','כ':'kh','ך':'kh','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n','ס':'s','ע':"'",'פ':'p','ף':'f','צ':'tz','ץ':'tz','ק':'k','ר':'r','ש':'sh','ת':'t'};
export const romanize = (text: string) => text.replace(/[\u0591-\u05C7]/g, '').replace(/[א-ת]/g, c => roman[c] ?? '').replace(/[״]/g,'"').replace(/[׳]/g,"'").replace(/־/g,'-');
export const englishLabel = (english: string | null | undefined, hebrew: string) => romanize(english || hebrew);
