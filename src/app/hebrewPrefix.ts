/** Attach a Hebrew one-letter prefix to a name, keeping foreign/digit starts distinct.
 * Ignore invisible direction marks when identifying the first visible character. */
export function hebrewPrefix(prefix: 'מ' | 'ל' | 'ב' | 'ו' | 'ש' | 'ה' | 'כ', name: string | number): string {
  const text = String(name);
  const first = text.replace(/^[\s\p{Cf}]*/u, '');
  return `${prefix}${first && !/^[א-תװ-ײ]/u.test(first) ? '־' : ''}${text}`;
}
