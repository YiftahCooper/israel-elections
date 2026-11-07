// Words for Compare copies, shared by the History list, the markers and the Compare screen.
import type { CopyProvenance } from '../../model/scenario.ts';
import type { Lang } from '../i18n.ts';

const FIELDS: Record<CopyProvenance['field'], [string, string]> = {
  votes: ['votes', 'הקולות'], list: ['whole list', 'הרשימה כולה'], candidates: ['candidates', 'המועמדים'],
  turnout: ['turnout', 'שיעור ההצבעה'], registered: ['registered voters', 'בעלי זכות הבחירה'], invalid: ['invalid ballots', 'הקולות הפסולים'],
  threshold: ['threshold', 'אחוז החסימה'], rules: ['rules', 'הכללים'], agreements: ['surplus agreements', 'הסכמי העודפים'], colour: ['colour', 'הצבע'],
};
export const copyFieldLabel = (f: CopyProvenance['field'], lang: Lang) => FIELDS[f][lang === 'he' ? 1 : 0];

/** "2022", or the scenario's name; the official result of the same election is named as such. */
export function copySourceName(p: Pick<CopyProvenance, 'official' | 'sourceName' | 'electionId'>, lang: Lang, destElectionId?: string) {
  if (p.official && destElectionId === p.electionId) return lang === 'he' ? 'התוצאה הרשמית' : 'the official result';
  return p.sourceName;
}
/** The marker's word in place of "Edited". */
export function fromLabel(p: Pick<CopyProvenance, 'official' | 'sourceName' | 'electionId'>, lang: Lang, destElectionId?: string) {
  const name = copySourceName(p, lang, destElectionId);
  return lang === 'he' ? (/^\d/.test(name) ? `מ־${name}` : `מ${name}`) : `From ${name}`;
}
export const copyModeLabel = (m: CopyProvenance['mode'], lang: Lang) =>
  m === 'share' ? (lang === 'he' ? 'שיעור' : 'share') : m === 'change' ? (lang === 'he' ? 'שינוי' : 'change') : (lang === 'he' ? 'מספר' : 'count');

export function describeCopy(p: CopyProvenance, names: string[], lang: Lang, destElectionId?: string) {
  const he = lang === 'he', what = copyFieldLabel(p.field, lang), from = copySourceName(p, lang, destElectionId);
  const who = names.length ? `${names.join(' + ')}: ` : '';
  const how = p.value ? ` (${p.mode ? `${copyModeLabel(p.mode, lang)} ` : ''}${p.value})` : '';
  return he ? `${who}${what} הועתקו מ${/^\d/.test(from) ? '־' : ''}${from}${how}` : `${who}${what} copied from ${from}${how}`;
}

/** The text before a marker's previous value: "Edited: was " or "From 2022 (share 23.41%) · was ". One wording for the
 *  marker, its tooltip, the CSV and the export, so a copied value is described the same everywhere. */
export function markerLead(origin: CopyProvenance | undefined, lang: Lang, destElectionId?: string) {
  if (!origin) return lang === 'he' ? 'נערך: קודם ' : 'Edited: was ';
  const how = origin.value ? ` (${origin.mode ? copyModeLabel(origin.mode, lang) + ' ' : ''}${origin.value})` : '';
  return `${fromLabel(origin, lang, destElectionId)}${how} · ${lang === 'he' ? 'קודם ' : 'was '}`;
}
