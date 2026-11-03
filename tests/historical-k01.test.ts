import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from Official Gazette 49 p.400; NOT generated from engine output.
const published = {"א": 46, "ב": 16, "ג": 0, "ח": 14, "ט": 0, "יא": 0, "יג": 0, "יד": 2, "טו": 1, "יח": 0, "יט": 0, "ל": 1, "מ": 19, "נ": 1, "ס": 4, "פ": 5, "פד": 0, "צ": 7, "ק": 4, "ש": 0, "ת": 0};
describe('k1: retained national evidence (not a released dataset)', () => {
  it('reconciles all gazette votes and CBS ballot totals, and protects the availability gate', () => {
    const audit=verifyEarlyProgress(1,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(434684n);
    expect(audit.result.quota.num).toBe(3592n);
    expect(audit.review.nationalTotals).toEqual({"registered": 506567, "votesCast": 440095, "valid": 434684, "invalid": 5411});
    expect(audit.releaseReady).toBe(false);
    expect(()=>verifyEarlyProgress(1,{available:true,log:false})).toThrow('release blocked');
    expect(earlyResearchDataset(1).hasLocalities).toBe(false);
  });
  it('keeps the unresolved seat mismatch visible and does not fabricate inputs to remove it',()=>{
    const a=verifyEarlyProgress(1,{log:false});
    expect(a.differences).toEqual([{"id": "1-ח", "published": 14, "computed": 15}, {"id": "1-צ", "published": 7, "computed": 6}]);
    expect(a.review.agreements.complete).toBe(false);
  });
});
