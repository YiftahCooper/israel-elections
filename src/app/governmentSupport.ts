import type { GovernmentParticipant, GovernmentSupportRole } from '../data/aftermath.ts';
export type SupportGroup = GovernmentSupportRole | 'unknown';
const ORDER: SupportGroup[] = ['member-with-ministries', 'member-without-ministries', 'outside-support', 'confidence-vote-only', 'abstained-by-arrangement', 'other', 'unknown'];
/** Group the recorded relationships; neither a vote nor an unknown classification establishes membership. */
export function supportRoleGroups(rows: GovernmentParticipant[]) {
  return ORDER.map(role => ({ role, rows: rows.filter(row => (row.certainty === 'unknown' ? 'unknown' : row.role) === role) })).filter(group => group.rows.length);
}
