// The Turnout tab's election facts (owner, 8 Nov): every election's official totals, the previous election, the
// change between them and the threshold in votes, all read from the datasets, never written by hand.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ELECTION_IDS, type ElectionDataset } from '../src/data/schema.ts';
import { countChange, ELECTION_TOTALS, electionWhen, officialThreshold, previousTotals, totalsOf, turnoutPct } from '../src/app/turnoutFacts.ts';
import { allocationOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

const ds = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;

describe('election totals', () => {
  it('has every election in order, with the dataset totals as published', () => {
    expect(ELECTION_TOTALS.map((t) => t.id)).toEqual([...ELECTION_IDS]);
    for (const id of ELECTION_IDS) {
      const t = ds(id).totals, row = totalsOf(id)!;
      expect([row.registered, row.votesCast, row.valid, row.invalid], id).toEqual([t.registered, t.votesCast, t.valid, t.invalid]);
      expect(row.votesCast, id).toBe(row.valid + row.invalid);
      // a count the source does not report is missing, never 0
      expect(row.ballotBoxes === null || row.ballotBoxes > 0, id).toBe(true);
    }
    expect(totalsOf('k1')!.ballotBoxes).toBeNull();
    expect(totalsOf('k1')!.envelopeVotes).toBeNull();
    expect(totalsOf('k25')!.ballotBoxes).toBe(12545);
  });
  it('compares with the election before; 1949 has none', () => {
    expect(previousTotals('k1')).toBeNull();
    expect(previousTotals('k26')!.id).toBe('k25');
    const now = totalsOf('k26')!, before = previousTotals('k26')!;
    expect(countChange(now.registered, before.registered)).toEqual({ diff: 543_177, rel: (100 * 543_177) / 6_788_804 });
    expect(turnoutPct(before.votesCast, before.registered)).toBeCloseTo(70.6253, 3);
    expect(countChange(5, 0).rel).toBeNull();
  });
  it('gives the threshold in votes exactly as the engine counts it, and none in 1949', () => {
    expect(officialThreshold(totalsOf('k1')!)).toBeNull();
    for (const id of ['k2', 'k13', 'k19', 'k25', 'k26'] as const) {
      const thr = officialThreshold(totalsOf(id)!)!;
      expect(thr.votes, id).toBe(Number(allocationOf(scenarioFromDataset(ds(id))).thresholdVotes));
    }
    expect(officialThreshold(totalsOf('k25')!)!.pct).toBe(3.25);
  });
  it('names a year, with the month when two elections share it', () => {
    expect(electionWhen(totalsOf('k25')!, 'en')).toBe('2022');
    expect(electionWhen(totalsOf('k21')!, 'en')).toBe('April 2019');
    expect(electionWhen(totalsOf('k22')!, 'he')).toBe('ספטמבר 2019');
  });
});
