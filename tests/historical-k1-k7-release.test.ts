import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { earlyReview, earlyRosterReview, verifyEarlyProgress } from '../scripts/lib/historical/k1-k7-common.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Transcribed from the complete notices, including connections that could not activate.
const connections: Record<number,string[][]> = {
  1:[['ב','ל'],['ט','יג'],['יא','יד'],['מ','ת'],['ס','צ']],
  2:[['צ','סצ']],3:[['א','יד'],['פ','ש'],['צ','צח'],['סא','ל'],['נ','ע']],
  4:[['א','רא'],['יא','ע']],5:[['ב','ד'],['מ','תו'],['יא','רא']],
  6:[['את','רא'],['כא','כס']],7:[['יא','רא']],
};
const quotas:Record<number,number>={1:3592,2:5692,3:6938,4:7800,5:8332,6:9881,7:11274};
const coverage:Record<number,Record<string,number>>={
  1:{א:50,ב:16,ח:17,יד:2,טו:1,ל:1,מ:19,נ:1,ס:4,פ:6,צ:7,ק:4},
  2:{א:45,ב:2,ג:3,ד:2,ה:8,ח:8,יד:3,ל:1,מ:15,נ:1,סצ:2,ע:1,פ:4,צ:20,ק:5},
  3:{א:40,ב:11,גד:6,ח:15,יד:2,מ:9,נ:2,ע:1,פ:5,צ:13,ק:6,תו:10},
  4:{א:47,ב:12,גד:6,ח:17,יא:2,מ:9,ע:1,פ:6,צ:8,ק:3,רא:2,תו:7},
  5:{א:42,ב:12,ג:4,ד:2,ח:17,יא:2,ל:19,מ:9,ק:5,רא:2,תו:8},
  6:{את:45,ב:11,ג:4,ד:2,ו:3,חל:26,יא:2,כא:10,לע:5,מ:8,ק:1,רא:2,ש:1},
  7:{אמת:56,ב:12,ג:4,ד:2,ו:3,חל:26,ט:2,יא:2,לע:4,עמ:4,ק:1,רא:2,ש:2},
};
const index=JSON.parse(readFileSync('public/data/elections.json','utf8')) as {id:string;available:boolean;status:{noteHe:string;noteEn:string}}[];

describe.each([1,2,3,4,5,6,7])('k%i built national release',n=>{
  const ds:ElectionDataset=JSON.parse(readFileSync(`public/data/k${n}.json`,'utf8'));
  const reviewed=earlyReview(n),roster=earlyRosterReview(n);
  const input=toEngineInput(scenarioFromDataset(ds)),result=allocate(input);
  it('binds retained sources, reconciles totals, and matches every published seat and quota',()=>{
    expect(verifyEarlyProgress(n,{log:false}).releaseReady).toBe(true);
    expect(ds.id).toBe(`k${n}`);expect(ds.knesset).toBe(n);
    expect(index.find(e=>e.id===ds.id)?.available).toBe(true);
    expect(ds.hasLocalities).toBe(false);expect(existsSync(`public/data/k${n}-localities.json`)).toBe(false);
    expect(ds.totals).toEqual({...reviewed.nationalTotals,ballotBoxes:0,localities:0});
    expect(ds.lists.reduce((s,l)=>s+l.votes,0)).toBe(ds.totals.valid);
    expect(ds.totals.valid+ds.totals.invalid).toBe(ds.totals.votesCast);
    expect(Object.fromEntries(ds.lists.map(l=>[l.letters,l.votes]))).toEqual(Object.fromEntries(reviewed.lists.map(l=>[l.letters,l.votes])));
    expect(ds.officialSeats).toEqual(Object.fromEntries(reviewed.lists.map(l=>[`${n}-${l.letters}`,l.officialSeats])));
    expect(Object.fromEntries(result.lists.map(l=>[l.id,l.seats]))).toEqual(ds.officialSeats);
    expect(result.seatsAllocated).toBe(120);expect(result.quota).toEqual({num:BigInt(quotas[n]),den:1n});
    expect(validateScenario(scenarioFromDataset(ds))).toEqual([]);
    expect(ds.agreements.map(a=>a.members.map(id=>id.slice(id.indexOf('-')+1)))).toEqual(connections[n]);
    expect(ds.sourceIds).toContain(`k${n}-rosters-reviewed`);
    expect(Object.keys(ds.buildInfo.rawSha256)).toEqual(ds.sourceIds);
    expect(Object.values(ds.buildInfo.rawSha256).every(h=>/^[a-f0-9]{64}$/.test(h))).toBe(true);
    expect(ds.status.noteHe).toContain('דרגות');expect(ds.status.noteEn).toContain('later ranks');
  });
  it('preserves every contiguous registered prefix and the reviewed elected-rank cross-check',()=>{
    expect(Object.fromEntries(roster.lists.map(l=>[l.letters,l.candidates.length]))).toEqual(coverage[n]);
    expect(roster.lists.reduce((s,l)=>s+l.electedNames.length,0)).toBe(120);
    for(const list of ds.lists){
      const rr=roster.lists.find(l=>l.letters===list.letters);
      if(ds.officialSeats![list.id]===0){expect(list.candidates).toEqual([]);expect(list.candidatesUnavailable).toBe(true);continue;}
      expect(rr).toBeDefined();expect(list.candidatesTruncated).toBe(true);expect(list.candidatesUnavailable).toBeUndefined();
      expect(list.candidatesSecondary).toBe(false);expect(list.candidatesSource).toBe(reviewed.candidateSourceId);
      expect(list.candidates.map(({id,notSeated,notes,displayNameHe,...c})=>{expect(id).toBe(`${list.id}#${c.rank}`);return c;})).toEqual(rr!.candidates);
      // candidates the results notice skipped (below the last elected rank) are flagged not seated, and only they
      const lastElected=Math.max(...rr!.electedCandidateRanks);
      expect(list.candidates.filter(c=>c.notSeated).map(c=>c.rank)).toEqual(list.candidates.filter(c=>c.rank<lastElected&&!rr!.electedCandidateRanks.includes(c.rank)).map(c=>c.rank));
      expect(list.candidates.map(c=>c.rank)).toEqual(Array.from({length:coverage[n][list.letters]},(_,i)=>i+1));
      expect(rr!.electedCandidateRanks.length).toBe(ds.officialSeats![list.id]);
      expect(rr!.electedNames).toEqual(rr!.electedCandidateRanks.map(r=>list.candidates[r-1].nameHe));
      expect(rr!.candidatePdfPages.length).toBeGreaterThan(0);expect(rr!.resultsPdfPages.length).toBeGreaterThan(0);
    }
  });
});

it('pins the 1949 withdrawals and 1961 Liberal exclusions to their registered ranks',()=>{
  const r1=earlyRosterReview(1);
  expect(r1.lists.find(l=>l.letters==='א')!.excludedCandidateRanks).toEqual([10,12,13,29]);
  expect(r1.lists.find(l=>l.letters==='ח')!.excludedCandidateRanks).toEqual([10,15,16]);
  expect(r1.lists.find(l=>l.letters==='פ')!.electedCandidateRanks).toEqual([1,2,4,5,6]);
  const liberal=earlyRosterReview(5).lists.find(l=>l.letters==='ל')!;
  expect(liberal.excludedCandidateRanks).toEqual([9,11]);expect(liberal.electedCandidateRanks.at(-1)).toBe(19);
  expect(liberal.candidates[10].nameHe).toBe('ד״ר כנוביץ שמעון');
  expect(earlyRosterReview(3).lists.find(l=>l.letters==='מ')!.candidates[8].nameHe).toBe('חיים יהודה');
});
