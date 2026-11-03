// Early-election evidence preflight. No public dataset is emitted until every release gate passes.
import { readFileSync, existsSync } from 'node:fs';
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
  rosters: { completeWinningRosters: boolean; reviewedLists: string[] };
  releaseBlockers: string[];
}
export function earlyReview(n:number):EarlyReview { assert(n>=1&&n<=7);return json(`data/raw/k${n}/national.reviewed.json`); }
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
export function verifyEarlyProgress(n:number,opts:{available?:boolean;log?:boolean}={}) {
  const r=earlyReview(n), manifest=json('data/raw/SOURCES.json') as {id:string;file:string;sha256:string}[];
  const sourceIds=[r.resultsSourceId,r.candidateSourceId,'k1-k7-cbs-national-totals',`k${n}-national-reviewed`,...(r.agreements.sourceId?[r.agreements.sourceId]:[])];
  for(const id of sourceIds){const s=manifest.find(s=>s.id===id);assert(s,`missing source ${id}`);assert.equal(createHash('sha256').update(readFileSync(join(ROOT,'data/raw',s.file))).digest('hex'),s.sha256,`${id}: source hash changed`);}
  assert.equal(r.id,`k${n}`);assert.equal(new Set(r.lists.map(l=>l.letters)).size,r.lists.length);
  for(const l of r.lists){assert(Number.isSafeInteger(l.votes)&&l.votes>=0);assert(Number.isInteger(l.officialSeats)&&l.officialSeats>=0);}
  assert.equal(r.lists.reduce((s,l)=>s+l.votes,0),r.nationalTotals.valid);
  assert.equal(r.lists.reduce((s,l)=>s+l.officialSeats,0),120);
  assert.equal(r.nationalTotals.valid+r.nationalTotals.invalid,r.nationalTotals.votesCast);
  const diagnostic=earlyDiagnostic(n);
  const e=json('public/data/elections.json').find((e:{id:string})=>e.id===r.id);
  assert(!(opts.available??e.available),`${r.id}: release blocked — ${r.releaseBlockers.join(' ')}`);
  assert(!existsSync(join(ROOT,`public/data/${r.id}.json`)),`${r.id}: unverified public output must not exist`);
  assert(!existsSync(join(ROOT,`public/data/${r.id}-localities.json`)),`${r.id}: locality scans are out of scope`);
  if(opts.log!==false)console.log(`${r.id}: UNAVAILABLE; ${diagnostic.differences.length} list differences in ${r.agreements.complete?'sourced':'NO-CONNECTIONS DIAGNOSTIC'} allocation; ${r.releaseBlockers.join(' ')}`);
  return {review:r,...diagnostic,releaseReady:false as const};
}
