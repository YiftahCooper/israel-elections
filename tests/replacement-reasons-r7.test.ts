import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const read = (k: number) => JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8'));
for (const [k, person, date] of [[13, 2595, '1995-11-04'], [15, 417, '2001-10-17']] as const) {
  it(`keeps the sourced cause of death separate from successor pairing in K${k}`, () => {
    const d = read(k), r = d.replacements.find((x: any) => x.leavingPersonId === person);
    expect(r.date).toBe(date);
    expect(r.reason).toBe('death');
    expect(r.reasonDetail).toBe('assassination');
    expect(r.reasonCites.length).toBeGreaterThan(0);
    for (const c of r.reasonCites) {
      expect(d.sources[c.source].kind).toBe('official');
      expect(c.quote.length).toBeGreaterThan(0);
    }
    if (k === 13) expect(r.enteringPersonId).toBeNull();
    else expect(r.pairingBasis).toContain('unverified');
  });
}
it('does not infer Remez’s termination reason from his membership endpoint alone', () => {
  const d = read(1);
  expect(d.replacements.find((r: any) => r.leavingPersonId === 2613).reason).toBe('unknown');
});
