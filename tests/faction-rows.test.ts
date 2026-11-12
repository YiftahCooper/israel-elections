// Which faction records the MK history and the seat cards show (scripts/lib/faction-rows.ts).
import { describe, expect, it } from 'vitest';
import { shownRows, zeroLength } from '../scripts/lib/faction-rows.ts';

describe('faction rows', () => {
  it('a record with the same start and end and no times of day lasts no time; one with times does', () => {
    expect(zeroLength({ factionId: 1, start: '2022-08-15', end: '2022-08-15' })).toBe(true);
    expect(zeroLength({ factionId: 1, start: '2006-02-01', end: '2006-02-01', startTime: '10:01', endTime: '10:59' })).toBe(false);
    expect(zeroLength({ factionId: 1, start: '2022-08-15', end: null })).toBe(false);
  });
  it('same-day records in time order, then the one that continues; zero-length records dropped; cut to the term', () => {
    const rows = [
      { factionId: 590, start: '2006-02-01', end: '2006-04-17' },
      { factionId: 45, start: '2006-02-01', end: '2006-02-01', startTime: '12:01', endTime: '12:59' },
      { factionId: 1078, start: '2006-02-01', end: '2006-02-01', startTime: '10:01', endTime: '10:59' },
      { factionId: 9, start: '2006-02-01', end: '2006-02-01' },
      { factionId: 1038, start: '2005-05-17', end: '2006-02-01' },
    ];
    expect(shownRows(rows, { start: '2005-05-18', end: '2006-04-10' }).map((f) => [f.factionId, f.start, f.end])).toEqual([
      [1038, '2005-05-18', '2006-02-01'], [1078, '2006-02-01', '2006-02-01'], [45, '2006-02-01', '2006-02-01'], [590, '2006-02-01', '2006-04-10']]);
  });
});
