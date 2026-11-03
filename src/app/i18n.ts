import { createContext, useCallback, useContext } from 'react';

export type Lang = 'he' | 'en';
export const LangContext = createContext<Lang>('he');

/** Inline bilingual strings: L('Votes', 'קולות'). Keeps each string next to its use.
 * The function is stable for a language, so it can sit in hook dependency lists without
 * invalidating memoised work on every render. */
export function useL() {
  const lang = useContext(LangContext);
  return useCallback((en: string, he: string) => (lang === 'he' ? he : en), [lang]);
}
export const useLang = () => useContext(LangContext);

/** Glossary of electoral terms (tooltips and the Sources tab). Content and verified sources live in
 *  glossary-data.ts; see docs/research/glossary-sources.md. */
export { GLOSSARY_TERMS as GLOSSARY, type GlossaryTerm } from './glossary-data.ts';
