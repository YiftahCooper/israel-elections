import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 432 p.1138; NOT generated from engine output.
const published = {"א": 40, "ב": 11, "גד": 6, "ח": 15, "יד": 2, "יט": 0, "ל": 0, "מ": 9, "נ": 2, "סא": 0, "ע": 1, "פ": 5, "צ": 13, "צח": 0, "ק": 6, "רי": 0, "ש": 0, "תו": 10};
describe('k3: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(3,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(853219n);
    expect(audit.result.quota.num).toBe(6938n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1057795, "votesCast": 876085, "valid": 853219, "invalid": 22866});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(3).hasLocalities).toBe(false);
  });
  it('reproduces every gazetted seat with the complete sourced connections',()=>{
    const a=verifyEarlyProgress(3,{log:false});
    expect(a.result.lists.map(l=>[l.id.slice(l.id.indexOf('-')+1),l.seats])).toEqual(Object.entries(published));
    expect(a.result.seatsAllocated).toBe(120);expect(a.result.warnings).toEqual([]);
    expect(a.review.agreements.complete).toBe(true);
  });
});
