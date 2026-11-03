import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 1573 p.434; NOT generated from engine output.
const published = {"אמת": 56, "ב": 12, "ג": 4, "ד": 2, "ו": 3, "חל": 26, "ט": 2, "יא": 2, "כן": 0, "לע": 4, "נס": 0, "עמ": 4, "פז": 0, "ק": 1, "רא": 2, "ש": 2};
describe('k7: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(7,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(1367743n);
    expect(audit.result.quota.num).toBe(11274n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1748710, "votesCast": 1427981, "valid": 1367743, "invalid": 60238});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(7).hasLocalities).toBe(false);
  });
  it('reproduces every gazetted seat',()=>{
    const a=verifyEarlyProgress(7,{log:false});
    expect(a.result.lists.map(l=>[l.id.slice(l.id.indexOf('-')+1),l.seats])).toEqual(Object.entries(published));
    expect(a.result.seatsAllocated).toBe(120);expect(a.result.warnings).toEqual([]);
    expect(a.review.agreements.complete).toBe(true);
  });
});
it('k7: retains the entire signed primary notice, including ineffective connections',()=>{
  const a=verifyEarlyProgress(7,{log:false});
  expect(a.review.agreements.pairs).toEqual([["יא", "רא"]]);
  expect(a.result.agreements.map(x=>x.active)).toEqual([true]);
});
