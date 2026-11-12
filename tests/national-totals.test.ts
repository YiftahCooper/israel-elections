// Every national count a builder supplies is a whole, non-negative number, whatever else reconciles
// (audit 12 Nov, ax-build-guesses-04: invalid −1 or cast 120.5 passed).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { checkDatasetTotals, checker, checkNationalTable } from '../scripts/lib/build/validate.ts';

const rows = [{ letters: 'א', votes: 120, seats: 120 }];
const table = (totals: Parameters<typeof checkNationalTable>[3]) => () => checkNationalTable(checker('t'), 'k99', rows, totals);

describe('national table', () => {
  it('accepts a consistent table, with or without the optional totals', () => {
    expect(table({ valid: 120, invalid: 3, votesCast: 123, registered: 200 })).not.toThrow();
    expect(table({ valid: 120 })).not.toThrow();
  });
  it('rejects a negative or fractional count, alone or reconciling', () => {
    for (const bad of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(table({ valid: 120, invalid: bad, votesCast: 120 + bad, registered: 200 }), `invalid ${bad}`).toThrow(/invalid national totals/);
      expect(table({ valid: 120, invalid: bad }), `invalid ${bad} alone`).toThrow(/invalid national totals/);
      expect(table({ valid: 120, votesCast: bad }), `cast ${bad} alone`).toThrow(/invalid national totals/);
      expect(table({ valid: 120, registered: bad }), `registered ${bad} alone`).toThrow(/invalid national totals/);
    }
    expect(table({ valid: 120, invalid: 0.5, votesCast: 120.5 }), 'electorate omitted').toThrow(/invalid national totals/);
  });
});

describe('every published dataset', () => {
  const all = Array.from({ length: 26 }, (_, i): ElectionDataset => JSON.parse(readFileSync(`public/data/k${i + 1}.json`, 'utf8')));
  it('has whole, reconciling national totals', () => {
    for (const ds of all) expect(() => checkDatasetTotals(checker('t'), ds), ds.id).not.toThrow();
  });
  it('fails on a negative, fractional or unreconciled total', () => {
    const ds = all[24];
    const bad = (t: Partial<ElectionDataset['totals']>) => () => checkDatasetTotals(checker('t'), { ...ds, totals: { ...ds.totals, ...t } });
    expect(bad({ invalid: -1, votesCast: ds.totals.votesCast - ds.totals.invalid - 1 })).toThrow(/invalid national totals/);
    expect(bad({ ballotBoxes: 1.5 })).toThrow(/invalid national totals/);
    expect(bad({ envelopeVotes: -3 })).toThrow(/invalid national totals/);
    expect(bad({ votesCast: ds.totals.votesCast + 1 })).toThrow(/cast ≠ valid \+ invalid/);
    expect(bad({ registered: ds.totals.votesCast - 1 })).toThrow(/turnout exceeds electorate/);
    expect(bad({ valid: ds.totals.valid + 1, votesCast: ds.totals.votesCast + 1 })).toThrow(/list votes do not sum to valid/);
  });
});
