import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const data = JSON.parse(readFileSync('data/research/government-rotation-agreements.json', 'utf8'));
it('keeps failed and early rotations separate from scheduled succession', () => {
  const [old, gantz, lapid] = data.agreements;
  expect(old.governmentNumbers).toEqual([21, 22]);
  expect(old.plannedRotationDate).toBeNull();
  expect(old.plannedIntervalMonths).toBe(25);
  expect(gantz.outcome).toBe('did-not-occur');
  expect(gantz.actualRotationDate).toBeNull();
  expect(lapid.plannedRotationDate).toBe('2023-08-27');
  expect(lapid.actualRotationDate).toBe('2022-07-01');
  expect(lapid.outcome).toBe('occurred-early');
});
it('does not silently convert month precision or a formation notice into a signed date', () => {
  expect(data.agreements[0].agreedDate).toBeNull();
  expect(data.agreements[2].agreedDate).toBeNull();
  expect(data.agreements[2].agreementNotifiedDate).toBe('2021-06-02');
  for (const agreement of data.agreements) {
    expect(agreement.sources.length).toBeGreaterThan(1);
    expect(agreement.sources.every((s: any) => (s.url || s.path) && s.locator && s.inspection)).toBe(true);
  }
});
