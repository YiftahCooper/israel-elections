// Spoken labels that mix languages, such as "Likud · seat 5 · <a Hebrew name>" on an English page. An aria-label is one
// string with the page's language, so a screen reader may read the Hebrew with English sounds. Labels with a run in the
// other script are given by a hidden copy instead, each such run marked with its language (WCAG 3.1.2, language of parts).
import { useLang } from '../i18n.ts';

type Lang = 'he' | 'en';
const scriptOf = (word: string): Lang | null => /[֐-׿]/u.test(word) ? 'he' : /[A-Za-z]/.test(word) ? 'en' : null;

/** The label as runs; a run in the other language than the page's carries that language. Spaces, digits and
 *  punctuation between two runs of the same other language stay inside it; elsewhere they belong to the page. */
export function langRuns(text: string, page: Lang): { text: string; lang?: Lang }[] {
  const tokens = text.split(/(\s+)/).filter(Boolean);
  const own = tokens.map(scriptOf);
  const at = (i: number, step: 1 | -1) => { for (let j = i; j >= 0 && j < tokens.length; j += step) if (own[j]) return own[j]; return null; };
  const langs = own.map((l, i) => {
    const lang = l ?? (at(i, -1) === at(i, 1) ? at(i, -1) : null);
    return lang && lang !== page ? lang : undefined;
  });
  const runs: { text: string; lang?: Lang }[] = [];
  tokens.forEach((t, i) => {
    const last = runs[runs.length - 1];
    if (last && last.lang === langs[i]) last.text += t;
    else runs.push(langs[i] ? { text: t, lang: langs[i] } : { text: t });
  });
  return runs;
}

/** The language to mark on a text wholly in the other script than the page's (an English source's name on the Hebrew
 *  page), so a screen reader reads it with the right voice; undefined when it is in the page's language or mixed. */
export function otherLang(text: string, page: Lang): Lang | undefined {
  const runs = langRuns(text, page).filter((r) => /[\p{L}]/u.test(r.text));
  return runs.length > 0 && runs.every((r) => r.lang) ? runs[0].lang : undefined;
}

/** A text shown as it was written (a source's name), marked with its language when that is not the page's. */
export function MarkedText({ text }: { text: string }) {
  const lang = otherLang(text, useLang());
  return lang ? <span lang={lang}>{text}</span> : <>{text}</>;
}

/** whether the label has a run in the other language, so it needs a <LangLabel> */
export const isMixed = (text: string, page: Lang) => langRuns(text, page).some((r) => r.lang);

/** The ARIA naming props for an element: a plain aria-label, or aria-labelledby the <LangLabel> with this id. */
export function nameProps(text: string, page: Lang, id: string): { 'aria-label': string } | { 'aria-labelledby': string } {
  return isMixed(text, page) ? { 'aria-labelledby': id } : { 'aria-label': text };
}

/** The hidden copy of a mixed label (renders nothing when the label is all in the page's language). */
export function LangLabel({ id, text }: { id: string; text: string }) {
  const page = useLang();
  if (!isMixed(text, page)) return null;
  return <span id={id} hidden>{langRuns(text, page).map((r, i) => r.lang ? <span key={i} lang={r.lang}>{r.text}</span> : r.text)}</span>;
}
