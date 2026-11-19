/** The letter-by-letter spelling the app once produced for a Hebrew name with no English form ("htzybvr hhrdy …").
 *  The app no longer has it; tests keep it only to prove that no such spelling reaches the screen. */
const roman: Record<string, string> = {'א':"'",'ב':'b','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'h','ט':'t','י':'y','כ':'kh','ך':'kh','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n','ס':'s','ע':"'",'פ':'p','ף':'f','צ':'tz','ץ':'tz','ק':'k','ר':'r','ש':'sh','ת':'t'};
export const romanize = (text: string) => text.replace(/[֑-ׇ]/g, '').replace(/[א-ת]/g, c => roman[c] ?? '').replace(/[״]/g,'"').replace(/[׳]/g,"'").replace(/־/g,'-');
