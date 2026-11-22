// Rotation agreements on the government card (16 Nov 2026). The research lane's file may not yet be in this checkout:
// the rules are checked on its recorded shape, and against the file itself whenever it is present.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { aftermathRecords } from '../src/data/aftermath-runtime.ts';
import aftermathNames from 'virtual:aftermath-names';
import { personNames, rotationAgreements, rotationFor, statutory, type RotationAgreement } from '../src/data/rotations.ts';

const shape: RotationAgreement[] = [
  { id: 'a-1984', governmentNumbers: [21, 22], firstPrimeMinister: 'Shimon Peres', secondPrimeMinister: 'Yitzhak Shamir', agreedDate: null, plannedRotationDate: null, plannedIntervalMonths: 25, actualRotationDate: '1986-10-20', outcome: 'occurred', legalMechanism: 'New government formed', sources: [] },
  { id: 'a-2020', governmentNumbers: [35], firstPrimeMinister: 'Benjamin Netanyahu', secondPrimeMinister: 'Benny Gantz', agreedDate: '2020-04-20', plannedRotationDate: '2021-11-17', actualRotationDate: null, outcome: 'did-not-occur', legalMechanism: 'Statutory rotation government', sources: [] },
];

describe('rotation agreements', () => {
  it('an agreement belongs to the government it starts in, not to the one it formed', () => {
    expect(rotationFor(21, shape)?.id).toBe('a-1984');
    expect(rotationFor(22, shape)).toBeUndefined();
    expect(rotationFor(35, shape)?.id).toBe('a-2020');
    expect(statutory(shape[0])).toBe(false);
    expect(statutory(shape[1])).toBe(true);
  });
  it('every prime minister of a rotation, and Gantz who never served, has a Hebrew name in the reviewed records', () => {
    const he = personNames(Object.values(aftermathRecords));
    expect(he.get('Shimon Peres')).toBe('שמעון פרס');
    expect(he.get('Yitzhak Shamir')).toBe('יצחק שמיר');
    expect(he.get('Benny Gantz')).toBe('בני גנץ');
    expect(he.get('Yair Lapid')).toBe('יאיר לפיד');
  });
  it('the names built for the page (vite.config.ts) are those of every record, in the same order', () => {
    expect(aftermathNames).toEqual([...personNames(Object.values(aftermathRecords))]);
  });
  it.runIf(existsSync('data/research/government-rotation-agreements.json'))('the research file: names resolve, governments exist, outcomes are worded', () => {
    const he = personNames(Object.values(aftermathRecords));
    const govs = new Set(Object.values(aftermathRecords).map((r) => r?.government?.number));
    expect(rotationAgreements.length).toBeGreaterThan(0);
    for (const a of rotationAgreements) {
      expect(he.has(a.firstPrimeMinister), a.firstPrimeMinister).toBe(true);
      expect(he.has(a.secondPrimeMinister), a.secondPrimeMinister).toBe(true);
      expect(govs.has(a.governmentNumbers[0]), a.id).toBe(true);
      expect(['occurred', 'occurred-early', 'did-not-occur']).toContain(a.outcome);
      if (a.outcome !== 'did-not-occur') expect(a.actualRotationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.plannedRotationDate ?? a.plannedIntervalMonths, a.id).toBeTruthy();
    }
  });
});
