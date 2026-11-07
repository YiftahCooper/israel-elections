import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
// Independently read from YP 717 p.264; NOT generated from engine output.
const published = {"א": 47, "ב": 12, "גד": 6, "ח": 17, "טש": 0, "יא": 2, "יד": 0, "יס": 0, "לש": 0, "מ": 9, "נ": 0, "סר": 0, "סש": 0, "ע": 1, "פ": 6, "צ": 8, "ק": 3, "רא": 2, "רט": 0, "רי": 0, "רנ": 0, "ש": 0, "שת": 0, "תו": 7};
describe('k4: released national evidence', () => {
  it('reconciles all gazette votes and CBS ballot totals, and clears the evidence gate', () => {
    const audit=verifyEarlyProgress(4,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(969337n);
    expect(audit.result.quota.num).toBe(7800n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1218483, "votesCast": 994306, "valid": 969337, "invalid": 24969});
    expect(audit.releaseReady).toBe(true);
    expect(earlyResearchDataset(4).hasLocalities).toBe(false);
  });
  it('keeps saved IDs while displaying gazetted ballot letters and all three connections', () => {
    const ds = JSON.parse(readFileSync('public/data/k4.json', 'utf8'));
    for (const [id, letters] of [['4-טש','טש'],['4-סש','סש'],['4-רנ','רנ']]) expect(ds.lists.find((l: {id: string}) => l.id === id).letters).toBe(letters);
    expect(ds.agreements.map((a: {members: string[]}) => a.members)).toContainEqual(['4-תו','4-שת']);
    expect(ds.lists.find((l: {id: string}) => l.id === '4-א').candidates[4]).toMatchObject({id:'4-א#5', nameHe:'שטרית בכור שלום'});
  });
  it('resolves the former one-seat gap with contemporary connection evidence',()=>{
    const a=verifyEarlyProgress(4,{log:false});
    expect(a.differences).toEqual([]);
    expect(a.result.seatsAllocated).toBe(120);
    expect(a.review.agreements.complete).toBe(true);
  });
});
