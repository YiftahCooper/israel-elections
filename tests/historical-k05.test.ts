import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 869 p.1938; NOT generated from engine output.
const published = {"א": 42, "ב": 12, "ג": 4, "ד": 2, "ח": 17, "יא": 2, "ל": 17, "מ": 9, "נ": 0, "סש": 0, "עט": 0, "ק": 5, "רא": 2, "תו": 8, "שו": 0};
describe('k5: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(5,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(1006964n);
    expect(audit.result.quota.num).toBe(8332n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1271285, "votesCast": 1037030, "valid": 1006964, "invalid": 30066});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(5).hasLocalities).toBe(false);
  });
  it('reproduces every gazetted seat with the complete sourced connections',()=>{
    const a=verifyEarlyProgress(5,{log:false});
    expect(a.result.lists.map(l=>[a.review.lists.find(x=>`5-${x.stableLetters??x.letters}`===l.id)!.letters,l.seats])).toEqual(Object.entries(published));
    expect(a.result.seatsAllocated).toBe(120);expect(a.result.warnings).toEqual([]);
    expect(a.review.agreements.complete).toBe(true);
  });
});

it('retains stable IDs while correcting gazetted letters and preserving the withdrawn roster',()=>{
  const ds=JSON.parse(readFileSync('public/data/k5.json','utf8'));
  expect(ds.lists.find((l:any)=>l.id==='5-סס').letters).toBe('סש');
  const democrats=ds.lists.find((l:any)=>l.id==='5-עע');
  expect([democrats.letters,democrats.nameHe,democrats.votes]).toEqual(['עט','שוחרי הדימוקרטיה',335]);
  const withdrawn=ds.lists.find((l:any)=>l.id==='5-שו');
  expect([withdrawn.withdrawn,withdrawn.votes,ds.officialSeats[withdrawn.id]]).toEqual([true,0,0]);
  expect(withdrawn.candidates.map((c:any)=>[c.rank,c.nameHe])).toEqual([[1,'עמיר חיים'],[2,'מינס מנשה'],[3,'מדהלה אהרן'],[4,'כהן שלמה'],[5,'ציוני משה'],[6,'גלוסקא אברהם']]);
  expect(ds.lists.find((l:any)=>l.letters==='ל').notesHe.join(' ')).toContain('נפטרו');
});
