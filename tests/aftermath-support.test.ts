import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateGovernmentSupport, validateAftermathRecords } from '../scripts/lib/build/aftermath.ts';
const cite = { source: 'roster', quote: 'appointment' };
const row = { letters: 'A', seats: 3, role: 'member-with-ministries', certainty: 'confirmed', cites: [cite] };
const government = () => ({ membershipCoverage: 'complete', coalition: [structuredClone(row)], coalitionSeats: 3, supportSeats: 0, confidenceVote: { for: 2, against: 117, abstain: 1 }, reconciliation: { status: 'explained', note: 'One member abstained.', expectedFor: 2 }, individuals: [{ id: 'a', nameEn: 'A', nameHe: 'א', fromLetters: 'A', countedInFactionSeats: true, role: 'member-with-ministries', certainty: 'confirmed', vote: 'abstain', cites: [cite] }] });
describe('government support validation', () => {
  it('accepts membership separately from the actual confidence vote', () => expect(() => validateGovernmentSupport(government(), { roster: {} }, 'test')).not.toThrow());
  it('rejects absent or invalid roles instead of assuming membership', () => {
    for (const role of [undefined, 'coalition']) { const g = government(); (g.coalition[0] as any).role = role; expect(() => validateGovernmentSupport(g, { roster: {} }, 'test')).toThrow(/role/); }
  });
  it('rejects double counting individuals and unsupported totals', () => {
    const g = government(); g.coalitionSeats = 4; expect(() => validateGovernmentSupport(g, { roster: {} }, 'test')).toThrow(/member/);
  });
  it('requires traceable evidence and explicit uncertainty', () => {
    const g = government(); g.coalition[0].cites[0].source = 'missing'; expect(() => validateGovernmentSupport(g, { roster: {} }, 'test')).toThrow(/source/);
    const h = government(); h.coalition[0].role = 'other'; h.coalition[0].certainty = 'unknown'; expect(() => validateGovernmentSupport(h, { roster: {} }, 'test')).toThrow();
  });
  it('rejects an arithmetic reconciliation inconsistent with the roll call', () => {
    const g = government(); g.reconciliation.expectedFor = 3; expect(() => validateGovernmentSupport(g, { roster: {} }, 'test')).toThrow(/reconcil/);
  });
});
describe('historical edge cases', () => {
  it('validates every recorded government and the additional Gahal-departure snapshot', () => expect(validateAftermathRecords()).toBe(38));
  const read = (k: number) => JSON.parse(readFileSync(`data/meta/aftermath/k${k}.json`, 'utf8'));
  it('keeps Dayan independent of the opposition Alignment list', () => {
    const g = read(9).government;
    expect(g.individuals.find((x: any) => x.nameEn === 'Moshe Dayan')).toMatchObject({ fromLetters: 'אמת', role: 'member-with-ministries', countedInFactionSeats: false, vote: 'for' });
    expect(g.coalition.some((x: any) => x.letters === 'אמת')).toBe(false);
  });
  it('records both 2021 exceptions and Raam membership without a ministry', () => {
    const g = read(24).government;
    expect(g.coalitionSeats).toBe(62); expect(g.supportSeats).toBe(0);
    expect(g.coalition.find((x: any) => x.letters === 'עם').role).toBe('member-without-ministries');
    expect(g.individuals.map((x: any) => x.vote).sort()).toEqual(['abstain', 'against']);
    expect(g.confidenceVote).toEqual({ for: 60, against: 59, abstain: 1 });
    expect(g.reconciliation.expectedFor).toBe(60);
  });
  it('keeps the Rabin blocking bloc outside the coalition', () => {
    const g = read(13).government;
    expect(g.coalitionSeats).toBe(62); expect(g.supportSeats).toBe(5);
    expect(g.confidenceVote.for).toBe(67);
  });
});
