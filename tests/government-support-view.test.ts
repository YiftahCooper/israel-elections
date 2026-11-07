import { expect, it } from 'vitest';
import { supportRoleGroups } from '../src/app/governmentSupport.ts';
import type { GovernmentParticipant } from '../src/data/aftermath.ts';
const row = (role: GovernmentParticipant['role'], certainty: GovernmentParticipant['certainty'] = 'confirmed'): GovernmentParticipant => ({ letters: 'א', seats: 4, role, certainty, cites: [] });
it('never groups an unknown relationship under members, even when a nominal role is present', () => {
  const groups = supportRoleGroups([row('member-with-ministries', 'unknown'), row('other', 'unknown')]);
  expect(groups.map(g => g.role)).toEqual(['unknown']);
  expect(groups[0].rows).toHaveLength(2);
});
it('keeps membership, non-ministerial membership, support, votes and abstention arrangements separate', () => {
  const roles = ['member-with-ministries', 'member-without-ministries', 'outside-support', 'confidence-vote-only', 'abstained-by-arrangement', 'other'] as const;
  expect(supportRoleGroups(roles.map(r => row(r))).map(g => g.role)).toEqual(roles);
});
it('preserves provisional qualifications and unknown seat counts without inventing totals', () => {
  const entry = { ...row('outside-support', 'provisional'), seats: null };
  expect(supportRoleGroups([entry])[0].rows[0]).toEqual(entry);
});
