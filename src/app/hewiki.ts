import { isHebrewWikipedia } from '../data/evidence.ts';

/** Hebrew Wikipedia is used only as a labelled secondary source (owner rule), so every link to it says so in the
 *  link text itself: a tooltip is never seen on a phone. English Wikipedia is never linked at all. */
export const HEWIKI_LABEL: readonly [string, string] = ['Hebrew Wikipedia (secondary)', 'ויקיפדיה העברית (משני)'];

/** The text a source link shows: its publisher's name, or the labelled Hebrew Wikipedia name for a Hebrew Wikipedia
 *  address, whatever the record calls it ("Wikipedia (he)", "Hebrew Wikipedia", "ויקיפדיה העברית"). */
export function sourceLinkText(url: string | undefined, name: string, lang: 'he' | 'en'): string {
  return url && isHebrewWikipedia(url) ? HEWIKI_LABEL[lang === 'he' ? 1 : 0] : name;
}
