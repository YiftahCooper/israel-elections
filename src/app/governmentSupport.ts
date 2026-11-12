import type { GovernmentParticipant, GovernmentSupportRole } from '../data/aftermath.ts';
export type SupportGroup = GovernmentSupportRole | 'unknown';
const ORDER: SupportGroup[] = ['member-with-ministries', 'member-without-ministries', 'outside-support', 'confidence-vote-only', 'abstained-by-arrangement', 'other', 'unknown'];
/** Group the recorded relationships; neither a vote nor an unknown classification establishes membership. */
export function supportRoleGroups(rows: GovernmentParticipant[]) {
  return ORDER.map(role => ({ role, rows: rows.filter(row => (row.certainty === 'unknown' ? 'unknown' : row.role) === role) })).filter(group => group.rows.length);
}
type NamedList = { letters: string; nameHe: string; shortHe: string; shortEn?: string | null };
/** The name shown for a recorded faction: its ballot list (by letters, else a list whose Hebrew name it carries),
 *  else the record's English faction name; with neither, the Hebrew name, flagged `hebrew` so it is marked
 *  lang="he". Never a letter-by-letter transliteration (c-aftermath-11). */
export function participantName<T extends NamedList>(entry: Pick<GovernmentParticipant, 'letters' | 'factionNameHe' | 'factionNameEn'>, lists: readonly T[], lang: 'he' | 'en', list?: T) {
  const found = list ?? (entry.letters ? lists.find(l => l.letters === entry.letters) : lists.find(l => l.nameHe === entry.factionNameHe || l.shortHe === entry.factionNameHe));
  if (found) return { list: found, name: lang === 'he' || !found.shortEn ? found.shortHe : found.shortEn, hebrew: lang === 'en' && !found.shortEn };
  const he = entry.factionNameHe ?? entry.letters ?? '';
  return { list: undefined, name: lang === 'en' && entry.factionNameEn ? entry.factionNameEn : he, hebrew: lang === 'en' && !entry.factionNameEn };
}
