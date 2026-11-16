import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { claimCertainty } from '../scripts/lib/build/evidence.ts';
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const aftermath = (k: number) => read(`data/meta/aftermath/k${k}.json`);
it('keeps the 2009 nonparticipants distinct from abstentions in both tally views', () => {
  const d = aftermath(18);
  const event = d.formation.events.find((e: any) => e.type === 'confidence-vote');
  expect(event.votes).toEqual({ for: 69, against: 45, abstain: 0 });
  expect(d.government.confidenceVote).toEqual(event.votes);
  expect(event.textEn).toContain('five nonparticipants');
  expect(event.cites.some((c: any) => c.note?.startsWith('C083:'))).toBe(true);
  expect(claimCertainty(event, d.sources)).toBe('confirmed');
});
it('records the counted 1988 repeat and the later, separate 1990 votes', () => {
  const d = aftermath(12);
  expect(d.government.confidenceVote).toEqual({ for: 84, against: 19, abstain: 3 });
  const successor = d.government.changes.find((g: any) => g.number === 24);
  expect(successor.confidenceVote).toEqual({ for: 62, against: 57, abstain: 1 });
  expect(successor.individuals.find((p: any) => p.id === 'avraham-verdiger')).toMatchObject({ vote: 'abstain', certainty: 'provisional' });
});
it('does not infer the seven unknown 1984 named votes from the aggregate result', () => {
  const people = aftermath(11).government.individuals;
  expect(people).toHaveLength(7);
  for (const p of people) {
    expect(p.vote).toBe('unknown');
    expect(p.note).toContain('530251 searched');
  }
});
it('failed confidence-linked motions do not change continuing support or become government falls', () => {
  const events = read('data/research/knesset-events/k24.json').events;
  for (const id of ['k24-citizenship-confidence', 'k24-kahana-confidence']) {
    const e = events.find((e: any) => e.id === id);
    expect(e.kind).toBe('confidence-vote');
    expect(e.supportEffect).toBe('none-established');
    expect(e.seatsAfter).toBeNull();
    expect(e.certainty).toBe('provisional'); // Unverified cross-vote subclaims retain their own limit.
  }
});
