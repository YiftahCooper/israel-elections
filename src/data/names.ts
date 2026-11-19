/** A Hebrew name set inside English text: wrapped in Unicode right-to-left isolates (RLI … PDI), so it reads right to
 *  left and its punctuation (a dash, a gershayim) stays with it, in plain strings, labels and copied text alike. */
export const hebrewInEnglish = (hebrew: string) => /[֐-׿]/.test(hebrew) ? `⁧${hebrew}⁩` : hebrew;
/** A name for an English screen: its recorded English form, else the Hebrew name itself (isolated, see above). Never a
 *  machine transliteration: unpointed Hebrew cannot establish vowels, so a letter-by-letter spelling is unreadable. */
export const englishLabel = (english: string | null | undefined, hebrew: string) => english || hebrewInEnglish(hebrew);
