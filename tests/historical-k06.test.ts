import { describe, expect, it } from 'vitest';
import { earlyResearchDataset, earlyReleasedDataset, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
// Independently read from YP 1230 p.312; NOT generated from engine output.
const published = {"את": 45, "ב": 11, "ג": 4, "ד": 2, "ו": 3, "חל": 26, "יא": 2, "כא": 10, "כנ": 0, "לע": 5, "מ": 8, "נס": 0, "ענ": 0, "פש": 0, "ק": 1, "רא": 2, "ש": 1};
describe('k6: corrected primary connections and national release', () => {
  it('reconciles every gazette vote and CBS ballot totals, and passes the release gate', () => {
    const audit=verifyEarlyProgress(6,{log:false});
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.officialSeats]))).toEqual(published);
    expect(audit.result.totalValid).toBe(1206728n);
    expect(audit.result.quota.num).toBe(9881n);
    expect(audit.review.nationalTotals).toEqual({"registered": 1499709, "votesCast": 1244706, "valid": 1206728, "invalid": 37978});
    // Independently re-read from YP 1230 p.311, including all four nonwinning lists.
    expect(Object.fromEntries(audit.review.lists.map(l=>[l.letters,l.votes]))).toEqual({
      את:443379,ב:107966,ג:39795,ד:22066,ו:27413,חל:256957,יא:16464,כא:95328,
      כנ:5536,לע:45299,מ:79985,נס:2135,ענ:11244,פש:1990,ק:13617,רא:23430,ש:14124,
    });
    expect(audit.releaseReady).toBe(true);
    expect(verifyEarlyProgress(6,{available:true,log:false}).releaseReady).toBe(true);
    expect(earlyResearchDataset(6).hasLocalities).toBe(false);
  });
  it('reproduces all 17 seat counts without changing the allocation rule or vote inputs',()=>{
    const a=verifyEarlyProgress(6,{log:false});
    expect(a.differences).toEqual([]);
    expect(Object.fromEntries(a.result.lists.map(l=>[earlyResearchDataset(6).lists.find(x=>x.id===l.id)!.letters,l.seats]))).toEqual(published);
    expect(a.result.warnings).toEqual([]);
    expect(a.result.units.find(u=>u.isAgreement)).toMatchObject({
      memberIds:['6-את','6-רא'],votes:466809n,initialSeats:46,remainderSeats:1,seats:47,
    });
    expect(a.result.internalDivisions[0]).toMatchObject({
      quota:{num:9932n,den:1n},initial:{'6-את':44,'6-רא':2},final:{'6-את':45,'6-רא':2},
    });
    expect(a.review.agreements.complete).toBe(true);
  });
});
it('k6: retains the entire signed primary notice, including ineffective connections',()=>{
  const a=verifyEarlyProgress(6,{log:false});
  // YP 1225 p.189 explicitly prints both קדמה ופתוח and רא, not שיתוף ואחווה / יא.
  expect(a.review.agreements.pairs).toEqual([["את", "רא"], ["כא", "כנ"]]);
  expect(a.result.agreements.map(x=>x.active)).toEqual([true,false]);
});

it('preserves the former 44/2 diagnostic as a transcription-error counterfactual',()=>{
  const input=toEngineInput(scenarioFromDataset(earlyResearchDataset(6)));
  input.agreements[0].members=['6-את','6-יא'];
  const a=allocate(input);
  expect(a.lists.filter(l=>l.seats!==published[earlyResearchDataset(6).lists.find(x=>x.id===l.id)!.letters as keyof typeof published])
    .map(l=>[l.id,l.seats])).toEqual([['6-את',44],['6-ש',2]]);
});

it('k6: corrects letters while preserving stable keys and the elected Don-Yihya identity',()=>{
  const ds=earlyResearchDataset(6);
  expect(ds.lists.filter(l=>['6-כס','6-עס','6-סס'].includes(l.id)).map(l=>[l.id,l.letters])).toEqual([['6-כס','כנ'],['6-עס','ענ'],['6-סס','פש']]);
  expect(ds.agreements[1].members).toEqual(['6-כא','6-כס']);
  expect(earlyReleasedDataset(6).lists.find(l=>l.letters==='ב')!.candidates[10]).toMatchObject({id:'6-ב#11',nameHe:'דון יחיא שבתאי'});
});
