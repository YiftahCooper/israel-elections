// National-only early elections. Retained primary evidence gates every public output.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';
import { ISRAEL_1949, ISRAEL_1951 } from '../../../src/engine/rules.ts';
import type { ElectionDataset, ElectionId } from '../../../src/data/schema.ts';
import { META, neutralColor } from '../list-meta.ts';
const ROOT=join(import.meta.dirname,'../../..');
const json=(p:string)=>JSON.parse(readFileSync(join(ROOT,p),'utf8'));
export interface EarlyReview {
  id: ElectionId; reviewedOn: string; resultsSourceId: string; candidateSourceId: string;
  pages: { votes: number; seats: number; invalid: number };
  nationalTotals: { registered: number; votesCast: number; valid: number; invalid: number };
  lists: { letters: string; nameHe: string; votes: number; officialSeats: number }[];
  agreements: { complete: boolean; pairs: [string,string][] | null; note: string; sourceId?: string };
  rosters: { completeWinningRosters: boolean; meetsReleaseStandard?: boolean; reviewedLists: string[]; sourceId?: string };
  releaseBlockers: string[];
}
export interface EarlyRosterReview {
  id: ElectionId; candidateSourceId: string; resultsSourceId: string;
  lists: {
    letters: string; candidatePdfPages: number[]; resultsPdfPages: number[]; truncated: boolean;
    candidates: {rank: number; nameHe: string}[];
    electedCandidateRanks: number[]; electedNames: string[]; excludedCandidateRanks?: number[];
    crossCheck: string;
  }[];
}
export function earlyReview(n:number):EarlyReview { assert(n>=1&&n<=7);return json(`data/raw/k${n}/national.reviewed.json`); }
export function earlyRosterReview(n:number):EarlyRosterReview { return json(`data/raw/k${n}/rosters.reviewed.json`); }
/** Research only: [] means the no-connections counterfactual when notice is missing.
 * Missing rosters are deliberately NOT labelled candidatesUnavailable: the scans exist.
 * This fixture is never returned as a build job or written under public/data/. */
export function earlyResearchDataset(n:number):ElectionDataset {
  const r=earlyReview(n); const e=json('public/data/elections.json').find((e:{id:string})=>e.id===r.id);
  return {
    schemaVersion:1,id:r.id,knesset:n,electionDate:e.date,nameHe:e.nameHe,nameEn:e.nameEn,
    status:{stage:'official-final',asOf:r.reviewedOn,noteHe:'נתוני מחקר בלבד; רשימות המועמדים לא תומללו.',noteEn:'RESEARCH ONLY. No-connections diagnostic when notice missing; candidate rosters unverified.'},
    ruleSetId:n===1?ISRAEL_1949.id:ISRAEL_1951.id,
    totals:{...r.nationalTotals,ballotBoxes:0,localities:0},
    lists:r.lists.map((l,i)=>{const id=`${n}-${l.letters}`,m=META[id];return {
      id,letters:l.letters,nameHe:l.nameHe,shortHe:m?.he??l.nameHe,shortEn:m?.en??null,color:m?.color??neutralColor(i),
      votes:l.votes,withdrawn:false,bloc:null,candidates:[],candidatesSource:r.candidateSourceId,candidatesSecondary:false,
      sponsorsHe:'',partiesHe:null,notesHe:['RESEARCH ONLY — full candidate roster unverified.'],
    };}),
    agreements:(r.agreements.pairs??[]).map((members,i)=>({id:`${n}-agr-${i+1}`,members:members.map(l=>`${n}-${l}`) as [string,string],sourceId:r.agreements.sourceId!})),
    blocs:[],hasLocalities:false,officialSeats:Object.fromEntries(r.lists.map(l=>[`${n}-${l.letters}`,l.officialSeats])),officialSeatsSourceId:r.resultsSourceId,
    sourceIds:[r.resultsSourceId,r.candidateSourceId,'k1-k7-cbs-national-totals'],buildInfo:{builtAt:r.reviewedOn,rawSha256:{}},
  };
}
export function earlyDiagnostic(n:number) {
  const ds=earlyResearchDataset(n),result=allocate(toEngineInput(scenarioFromDataset(ds)));
  return { result, differences:result.lists.filter(l=>l.seats!==ds.officialSeats![l.id]).map(l=>({id:l.id,published:ds.officialSeats![l.id],computed:l.seats})) };
}
function evidenceIds(n:number,r:EarlyReview) {
  return [r.resultsSourceId,r.candidateSourceId,'k1-k7-cbs-national-totals',`k${n}-national-reviewed`,
    ...(r.agreements.sourceId?[r.agreements.sourceId]:[]),...(r.rosters.sourceId?[r.rosters.sourceId]:[]),
    ...(n===3?['k3-candidates-mirror']:[]),
    `k1-k7-law-${n===1?'1948':n===2?'1951':n===3?'1955':n===7?'1969':'1959'}`,
    ...(n===1?['k1-k7-law-1948-312737']:[])];
}
export function verifyEarlyProgress(n:number,opts:{available?:boolean;log?:boolean}={}) {
  const r=earlyReview(n), manifest=json('data/raw/SOURCES.json') as {id:string;file:string;sha256:string}[];
  const sourceIds=evidenceIds(n,r);
  for(const id of sourceIds){const s=manifest.find(s=>s.id===id);assert(s,`missing source ${id}`);assert.equal(createHash('sha256').update(readFileSync(join(ROOT,'data/raw',s.file))).digest('hex'),s.sha256,`${id}: source hash changed`);}
  assert.equal(r.id,`k${n}`);assert.equal(new Set(r.lists.map(l=>l.letters)).size,r.lists.length);
  for(const l of r.lists){assert(Number.isSafeInteger(l.votes)&&l.votes>=0);assert(Number.isInteger(l.officialSeats)&&l.officialSeats>=0);}
  assert.equal(r.lists.reduce((s,l)=>s+l.votes,0),r.nationalTotals.valid);
  assert.equal(r.lists.reduce((s,l)=>s+l.officialSeats,0),120);
  assert.equal(r.nationalTotals.valid+r.nationalTotals.invalid,r.nationalTotals.votesCast);
  const diagnostic=earlyDiagnostic(n);
  const e=json('public/data/elections.json').find((e:{id:string})=>e.id===r.id);
  const releaseReady=r.releaseBlockers.length===0 && r.agreements.complete && r.rosters.meetsReleaseStandard===true;
  if(releaseReady) {
    assert(r.agreements.pairs && r.agreements.sourceId,`${r.id}: connection evidence required`);
    assert.deepEqual(diagnostic.differences,[],`${r.id}: published seats differ`);
    assert.equal(diagnostic.result.seatsAllocated,120);
    if(n===1) {
      // Section 30(c)(3) compares integer quotients: 3375 ties at seats 118/119.
      // The appendix records both final entitlements, not their lottery order.
      const ties=diagnostic.result.remainderSteps.filter(s=>s.tie);
      assert.equal(ties.length,1);assert.equal(ties[0].seatNumber,118);
      assert.deepEqual(diagnostic.result.warnings.map(w=>w.code),['lottery-required']);
      for(const winner of ties[0].tie!.tiedUnitIds) {
        const ds=earlyResearchDataset(n);
        const result=allocate({...toEngineInput(scenarioFromDataset(ds)),lotteryWinners:{[ties[0].tie!.key]:winner}});
        assert.deepEqual(result.warnings,[]);
        assert.deepEqual(Object.fromEntries(result.lists.map(l=>[l.id,l.seats])),ds.officialSeats);
      }
    } else assert.deepEqual(diagnostic.result.warnings,[]);
    const roster=earlyRosterReview(n);
    assert.equal(roster.id,r.id);assert.equal(roster.candidateSourceId,r.candidateSourceId);assert.equal(roster.resultsSourceId,r.resultsSourceId);
    const winners=r.lists.filter(l=>l.officialSeats>0).map(l=>l.letters).sort();
    assert.deepEqual(roster.lists.map(l=>l.letters).sort(),winners);
    assert.deepEqual([...r.rosters.reviewedLists].sort(),winners);
    for(const l of roster.lists) {
      const seats=r.lists.find(x=>x.letters===l.letters)!.officialSeats;
      assert(l.candidates.length>=seats,`${r.id}/${l.letters}: insufficient candidate coverage`);
      assert.deepEqual(l.candidates.map(c=>c.rank),Array.from({length:l.candidates.length},(_,i)=>i+1));
      assert(l.candidates.every(c=>c.nameHe.trim().length>0));
      assert.equal(l.electedCandidateRanks.length,seats);assert.equal(new Set(l.electedCandidateRanks).size,seats);
      assert.deepEqual(l.electedCandidateRanks,[...l.electedCandidateRanks].sort((a,b)=>a-b));
      assert.deepEqual(l.electedNames,l.electedCandidateRanks.map(rank=>l.candidates[rank-1]?.nameHe));
      const excluded=l.excludedCandidateRanks??[];
      assert.deepEqual(l.candidates.filter(c=>!l.electedCandidateRanks.includes(c.rank)).map(c=>c.rank),excluded);
      assert(l.candidatePdfPages.length>0 && l.resultsPdfPages.length>0 && l.crossCheck.length>0);
      assert([...l.candidatePdfPages,...l.resultsPdfPages].every(p=>Number.isInteger(p)&&p>0));
    }
  } else {
    assert(!(opts.available??e.available),`${r.id}: release blocked — ${r.releaseBlockers.join(' ')}`);
    assert(!existsSync(join(ROOT,`public/data/${r.id}.json`)),`${r.id}: unverified public output must not exist`);
  }
  assert(!existsSync(join(ROOT,`public/data/${r.id}-localities.json`)),`${r.id}: locality scans are out of scope`);
  if(opts.log!==false)console.log(`${r.id}: ${releaseReady?'VERIFIED':'UNAVAILABLE'}; ${diagnostic.differences.length} list differences in ${r.agreements.complete?'sourced':'NO-CONNECTIONS DIAGNOSTIC'} allocation; ${r.releaseBlockers.join(' ')}`);
  return {review:r,...diagnostic,releaseReady};
}

export function earlyReleasedDataset(n:number):ElectionDataset {
  const audit=verifyEarlyProgress(n,{log:false});assert(audit.releaseReady,`k${n}: release blocked`);
  const r=audit.review,roster=earlyRosterReview(n),ds=earlyResearchDataset(n);
  const e=json('public/data/elections.json').find((e:{id:string})=>e.id===r.id);
  ds.status={stage:'official-final',asOf:r.reviewedOn,noteHe:e.status.noteHe,noteEn:e.status.noteEn};
  ds.lists=ds.lists.map(l=>{
    const reviewed=roster.lists.find(x=>x.letters===l.letters);
    return {...l,notesHe:[],
      candidates:reviewed?.candidates.map(c=>({...c,id:`${l.id}#${c.rank}`}))??[],
      ...(reviewed?{candidatesTruncated:reviewed.truncated}:{candidatesUnavailable:true}),
    };
  }).sort((a,b)=>(META[a.id]?.order??999)-(META[b.id]?.order??999)||b.votes-a.votes);
  ds.sourceIds=evidenceIds(n,r);
  const manifest=json('data/raw/SOURCES.json') as {id:string;sha256:string}[];
  ds.buildInfo={builtAt:new Date().toISOString(),rawSha256:Object.fromEntries(ds.sourceIds.map(id=>[id,manifest.find(s=>s.id===id)!.sha256]))};
  return ds;
}

/** The shared build-job writer requires locality rows. Emit these national-only
 * datasets here instead, leaving that writer and every later election unchanged. */
export function buildEarlyDataset(n:number):never[] {
  const audit=verifyEarlyProgress(n);
  if(audit.releaseReady)writeFileSync(join(ROOT,`public/data/k${n}.json`),JSON.stringify(earlyReleasedDataset(n)));
  return [];
}
