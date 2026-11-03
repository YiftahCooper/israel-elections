// National-only early elections. Retained primary evidence gates every public output.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';
import { ISRAEL_1949, ISRAEL_1951 } from '../../../src/engine/rules.ts';
import type { ElectionDataset, ElectionId } from '../../../src/data/schema.ts';
import { agreementRecords, inKeyOrder, listRecord, officialSeatsOf, seatOrder } from '../build/records.ts';
import { candidateId, notSeatedNoteHe, notSeatedRanks, rosterFlags } from '../build/roster.ts';
import { indexEntry, OUT, rawJson, verifySources } from '../build/sources.ts';
import { allocateDataset, checker, checkNationalTable, seatDifferences, type Check } from '../build/validate.ts';

const check: Check = checker('k1–k7 evidence');
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
export function earlyReview(n:number):EarlyReview { assert(n>=1&&n<=7);return rawJson(`k${n}/national.reviewed.json`); }
export function earlyRosterReview(n:number):EarlyRosterReview { return rawJson(`k${n}/rosters.reviewed.json`); }

/** k1–k7 serialize color/votes earlier and sponsors/parties later than other eras; roster flags last. */
const EARLY_LIST_KEYS = ['id', 'letters', 'nameHe', 'shortHe', 'shortEn', 'color', 'votes', 'withdrawn', 'bloc', 'candidates', 'candidatesSource',
  'candidatesSecondary', 'sponsorsHe', 'partiesHe', 'notesHe', 'candidatesUnavailable', 'candidatesTruncated'];

/** Research only: [] means the no-connections counterfactual when notice is missing.
 * Missing rosters are deliberately NOT labelled candidatesUnavailable: the scans exist.
 * This fixture is never returned as a build job or written under public/data/. */
export function earlyResearchDataset(n:number):ElectionDataset {
  const r=earlyReview(n); const e=indexEntry(r.id)!;
  return {
    schemaVersion:1,id:r.id,knesset:n,electionDate:e.date,nameHe:e.nameHe,nameEn:e.nameEn,
    status:{stage:'official-final',asOf:r.reviewedOn,noteHe:'נתוני מחקר בלבד; רשימות המועמדים לא תומללו.',noteEn:'RESEARCH ONLY. No-connections diagnostic when notice missing; candidate rosters unverified.'},
    ruleSetId:n===1?ISRAEL_1949.id:ISRAEL_1951.id,
    totals:{...r.nationalTotals,ballotBoxes:0,localities:0},
    lists:r.lists.map((l,i)=>listRecord(n,i,{letters:l.letters,nameHe:l.nameHe,votes:l.votes,candidatesSource:r.candidateSourceId,
      notesHe:['RESEARCH ONLY — full candidate roster unverified.']},EARLY_LIST_KEYS)),
    agreements:agreementRecords(n,r.agreements.pairs??[],r.agreements.sourceId!),
    blocs:[],hasLocalities:false,officialSeats:officialSeatsOf(n,r.lists.map(l=>({letters:l.letters,seats:l.officialSeats}))),officialSeatsSourceId:r.resultsSourceId,
    sourceIds:[r.resultsSourceId,r.candidateSourceId,'k1-k7-cbs-national-totals'],buildInfo:{builtAt:r.reviewedOn,rawSha256:{}},
  };
}
export function earlyDiagnostic(n:number) {
  const ds=earlyResearchDataset(n),result=allocateDataset(ds);
  return { result, differences:seatDifferences(ds,result).map(({id,official,computed})=>({id,published:official,computed})) };
}
function evidenceIds(n:number,r:EarlyReview) {
  return [r.resultsSourceId,r.candidateSourceId,'k1-k7-cbs-national-totals',`k${n}-national-reviewed`,
    ...(r.agreements.sourceId?[r.agreements.sourceId]:[]),...(r.rosters.sourceId?[r.rosters.sourceId]:[]),
    ...(n===3?['k3-candidates-mirror']:[]),
    `k1-k7-law-${n===1?'1948':n===2?'1951':n===3?'1955':n===7?'1969':'1959'}`,
    ...(n===1?['k1-k7-law-1948-312737']:[])];
}
export type EarlyAudit = ReturnType<typeof verifyEarlyProgress>;
export function verifyEarlyProgress(n:number,opts:{available?:boolean;log?:boolean}={}) {
  const r=earlyReview(n);
  const rawSha256=verifySources(evidenceIds(n,r),check);
  assert.equal(r.id,`k${n}`);
  checkNationalTable(check,r.id,r.lists.map(l=>({letters:l.letters,votes:l.votes,seats:l.officialSeats})),r.nationalTotals);
  const diagnostic=earlyDiagnostic(n);
  const e=indexEntry(r.id)!;
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
    assert(!existsSync(join(OUT,`${r.id}.json`)),`${r.id}: unverified public output must not exist`);
  }
  assert(!existsSync(join(OUT,`${r.id}-localities.json`)),`${r.id}: locality scans are out of scope`);
  if(opts.log!==false)console.log(`${r.id}: ${releaseReady?'VERIFIED':'UNAVAILABLE'}; ${diagnostic.differences.length} list differences in ${r.agreements.complete?'sourced':'NO-CONNECTIONS DIAGNOSTIC'} allocation; ${r.releaseBlockers.join(' ')}`);
  return {review:r,...diagnostic,releaseReady,rawSha256};
}

export function earlyReleasedDataset(n:number,audit:EarlyAudit=verifyEarlyProgress(n,{log:false})):ElectionDataset {
  assert(audit.releaseReady,`k${n}: release blocked`);
  const r=audit.review,roster=earlyRosterReview(n),ds=earlyResearchDataset(n);
  const e=indexEntry(r.id)!;
  ds.status={stage:'official-final',asOf:r.reviewedOn,noteHe:e.status.noteHe,noteEn:e.status.noteEn};
  ds.lists=seatOrder(ds.lists.map(l=>{
    const reviewed=roster.lists.find(x=>x.letters===l.letters);
    // the verifier proved excludedCandidateRanks are exactly the registered candidates not elected
    const excluded=notSeatedRanks(reviewed?.electedCandidateRanks??[],(reviewed?.candidates??[]).map(c=>c.rank));
    return inKeyOrder({...l,
      notesHe:(reviewed?.candidates??[]).filter(c=>excluded.has(c.rank)).map(notSeatedNoteHe),
      candidates:reviewed?.candidates.map(c=>({...c,id:candidateId(l.id,c.rank),...(excluded.has(c.rank)?{notSeated:true}:{})}))??[],
      ...rosterFlags(!reviewed?'unavailable':reviewed.truncated?'truncated':'complete','explicit'),
    },EARLY_LIST_KEYS) as unknown as ElectionDataset['lists'][number];
  }));
  ds.sourceIds=evidenceIds(n,r);
  ds.buildInfo={builtAt:new Date().toISOString(),rawSha256:audit.rawSha256};
  return ds;
}

/** Release job for a verified national-only dataset; [] while the election is blocked. */
export function buildEarlyDataset(n:number) {
  const audit=verifyEarlyProgress(n);
  return audit.releaseReady?[()=>({ds:earlyReleasedDataset(n,audit),loc:null})]:[];
}
