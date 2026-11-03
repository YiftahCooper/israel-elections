import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 869 p.1938; NOT generated from engine output.
const published = {"א": 42, "ב": 12, "ג": 4, "ד": 2, "ח": 17, "יא": 2, "ל": 17, "מ": 9, "נ": 0, "סס": 0, "עע": 0, "ק": 5, "רא": 2, "תו": 8};
describe('k5: retained national evidence (not a released dataset)', () => {
  it('reconciles all gazette votes and CBS ballot totals, and protects the availability gate', () => {
    const audit=verifyEarlyProgress(5,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(1006964n);
    expect(audit.result.quota.num).toBe(8332n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1271285, "votesCast": 1037030, "valid": 1006964, "invalid": 30066});
    expect(audit.releaseReady).toBe(false);
    expect(()=>verifyEarlyProgress(5,{available:true,log:false})).toThrow('release blocked');
    expect(earlyResearchDataset(5).hasLocalities).toBe(false);
  });
  it('reproduces every gazetted seat in the explicitly unsourced no-connections diagnostic',()=>{
    const a=verifyEarlyProgress(5,{log:false});
    expect(a.result.lists.map(l=>[l.id.slice(l.id.indexOf('-')+1),l.seats])).toEqual(Object.entries(published));
    expect(a.result.seatsAllocated).toBe(120);expect(a.result.warnings).toEqual([]);
    expect(a.review.agreements.complete).toBe(false);
  });
});
