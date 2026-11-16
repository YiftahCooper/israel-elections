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
it('a coalition counted below its lists’ seats names those lists and what all its lists won; otherwise nothing', async () => {
  const { listsBelowTheirSeats } = await import('../src/app/governmentSupport.ts');
  const seats: Record<string, number> = { 'ב': 7, 'פה': 17 };
  const rows: GovernmentParticipant[] = [{ letters: 'ב', seats: 6, role: 'member-with-ministries', certainty: 'confirmed', cites: [] }, { letters: 'פה', seats: 17, role: 'member-with-ministries', certainty: 'confirmed', cites: [] }, { letters: 'ג', seats: 4, role: 'outside-support', certainty: 'confirmed', cites: [] }];
  const r = listsBelowTheirSeats(rows, 23, (l) => seats[l]);
  expect(r?.won).toBe(24);
  expect(r?.lists.map((x) => [x.row.letters, x.won, x.row.seats])).toEqual([['ב', 7, 6]]);
  expect(listsBelowTheirSeats(rows.map((x) => ({ ...x, seats: seats[x.letters!] ?? 4 })), 24, (l) => seats[l])).toBeNull();
  expect(listsBelowTheirSeats(rows, null, (l) => seats[l])).toBeNull();
  expect(listsBelowTheirSeats([{ ...rows[0], letters: 'x' }], 6, (l) => seats[l])).toBeNull();
});
