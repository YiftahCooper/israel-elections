import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 1230 p.312; NOT generated from engine output.
const published = {"את": 45, "ב": 11, "ג": 4, "ד": 2, "ו": 3, "חל": 26, "יא": 2, "כא": 10, "כס": 0, "לע": 5, "מ": 8, "נס": 0, "עס": 0, "סס": 0, "ק": 1, "רא": 2, "ש": 1};
describe('k6: retained national evidence (not a released dataset)', () => {
  it('reconciles all gazette votes and CBS ballot totals, and protects the availability gate', () => {
    const audit=verifyEarlyProgress(6,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(1206728n);
    expect(audit.result.quota.num).toBe(9881n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1499709, "votesCast": 1244706, "valid": 1206728, "invalid": 37978});
    expect(audit.releaseReady).toBe(false);
    expect(()=>verifyEarlyProgress(6,{available:true,log:false})).toThrow('release blocked');
    expect(earlyResearchDataset(6).hasLocalities).toBe(false);
  });
  it('keeps the unresolved seat mismatch visible and does not fabricate inputs to remove it',()=>{
    const a=verifyEarlyProgress(6,{log:false});
    expect(a.differences).toEqual([{"id": "6-את", "published": 45, "computed": 44}, {"id": "6-ש", "published": 1, "computed": 2}]);
    expect(a.review.agreements.complete).toBe(true);
  });
});
it('k6: retains the entire signed primary notice, including ineffective connections',()=>{
  const a=verifyEarlyProgress(6,{log:false});
  expect(a.review.agreements.pairs).toEqual([["את", "יא"], ["כא", "כס"]]);
  expect(a.result.agreements.map(x=>x.active)).toEqual([true,false]);
});
