import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 181 p.1241; NOT generated from engine output.
const published = {"א": 45, "ב": 2, "ג": 3, "ד": 2, "ה": 8, "ח": 8, "טח": 0, "יד": 3, "ל": 1, "מ": 15, "נ": 1, "סצ": 2, "ע": 1, "פ": 4, "צ": 20, "ק": 5, "ש": 0};
describe('k2: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(2,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(687492n);
    expect(audit.result.quota.num).toBe(5692n);
    expect(audit.review.nationalTotals).toEqual({"registered": 924885, "votesCast": 695007, "valid": 687492, "invalid": 7515});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(2).hasLocalities).toBe(false);
  });
  it('reproduces every gazetted seat with the complete sourced connections',()=>{
    const a=verifyEarlyProgress(2,{log:false});
    expect(a.result.lists.map(l=>[l.id.slice(l.id.indexOf('-')+1),l.seats])).toEqual(Object.entries(published));
    expect(a.result.seatsAllocated).toBe(120);expect(a.result.warnings).toEqual([]);
    expect(a.review.agreements.complete).toBe(true);
  });
});
