import { isEnvelopeRow, type LocalityDataset } from '../data/schema.ts';
import { historicalLocalVotes } from './historicalLocalVotes.ts';
import { ActionError, M, type Msg } from './messages.ts';
import type { Action, Scenario } from './scenario.ts';

export type DemographicAdjustment = { groupId: string } & (
  { turnoutChangePoints: number; turnoutPercent?: never } | { turnoutPercent: number; turnoutChangePoints?: never }
);
const fail = (msg: Msg): never => { throw new ActionError('demographic-turnout', msg); };
const count = (n: number) => { if (!Number.isSafeInteger(n) || n < 0) fail(M.groupUnsafe); return BigInt(n); };
const gcd = (a: bigint, b: bigint): bigint => b ? gcd(b, a % b) : a;
/** Exact decimal interpretation of the finite JS number supplied by the caller. */
function decimal(n: number): [bigint, bigint] {
  if (!Number.isFinite(n)) fail(M.invalid);
  const [mantissa, exponent = '0'] = String(n).split('e');
  const digits = (mantissa.split('.')[1] ?? '').length - Number(exponent);
  const a = BigInt(mantissa.replace('.', ''));
  return digits >= 0 ? [a, 10n ** BigInt(digits)] : [a * 10n ** BigInt(-digits), 1n];
}
function split(total: bigint, weights: bigint[]): bigint[] {
  const sum = weights.reduce((a,b)=>a+b,0n);
  if (!sum) { if(total) fail(M.groupNoVotes); return weights.map(()=>0n); }
  const out=weights.map(w=>total*w/sum);
  const order=weights.map((w,i)=>({i,r:total*w%sum})).sort((a,b)=>a.r>b.r?-1:a.r<b.r?1:a.i-b.i);
  let left=total-out.reduce((a,b)=>a+b,0n);
  for(const {i} of order){if(!left)break;out[i]++;left--;}
  return out;
}
/** Incremental deltas from historical group turnout/mix, added to current scenario totals.
 * Reject overlapping adjustments, missing data/origins, withdrawn lists and negative results.
 * Splits use current scenario vote shares; all-zero sharers divide equally. */
export function demographicTurnout(s: Scenario, data: LocalityDataset, adjustments: DemographicAdjustment[]) {
  count(s.registered);
  if(data.id!==s.electionId) fail(M.invalid);
  if(s.lists.some(l=>l.withdrawn)) fail(M.groupWithdrawn);
  const votes=s.lists.map(l=>count(l.votes));let invalid=count(s.invalid);
  const seen=new Set<number>();
  for(const adjustment of adjustments){
    const g=data.groups?.find(g=>g.id===adjustment.groupId) ?? fail(M.groupGone);
    if(!g.codes.length || new Set(g.codes).size!==g.codes.length)fail(M.groupData);
    const rows=g.codes.map(code=>{
      if(seen.has(code))fail(M.groupOverlap);seen.add(code);
      const matches=data.rows.filter(r=>r.code===code);if(matches.length!==1 || isEnvelopeRow(matches[0]))fail(M.groupData);return matches[0];
    });
    if(rows.some(r=>r.registered===null))fail(M.groupNoRegistered);
    const reg=rows.reduce((t,r)=>t+count(r.registered!),0n),cast=rows.reduce((t,r)=>t+count(r.votesCast),0n);
    const inv=rows.reduce((t,r)=>t+count(r.invalid),0n);
    if(!reg || cast>reg)fail(M.groupData);
    const points='turnoutChangePoints' in adjustment && adjustment.turnoutChangePoints!==undefined;
    if(points === (adjustment.turnoutPercent!==undefined))fail(M.invalid);
    const [n,d]=decimal(points?adjustment.turnoutChangePoints!:adjustment.turnoutPercent!);
    const targetNumerator=(points?cast*100n*d:0n)+reg*n,denominator=100n*d;
    if(targetNumerator<0n || targetNumerator>reg*denominator)fail(M.groupRange);
    const target=(targetNumerator+denominator/2n)/denominator,delta=target-cast;
    const historical=data.listIds.map((_,k)=>rows.reduce((t,r)=>t+count(r.votes[k]),0n));
    if(historical.reduce((a,b)=>a+b,0n)+inv!==cast)fail(M.groupTotals);
    // Build rational mapped weights, then clear denominators before Hamilton rounding.
    const totals=historicalLocalVotes(s.lists,data.listIds,historical);
    if(totals.has(null))fail(M.groupNoList);
    const mapped=s.lists.map(l=>totals.get(l.id)!);
    const common=mapped.reduce((t,{den})=>t/gcd(t,den)*den,1n);
    const weights=[...mapped.map(({num,den})=>num*(common/den)),inv*common];
    const parts=split(delta<0n?-delta:delta,weights),sign=delta<0n?-1n:1n;
    parts.slice(0,-1).forEach((v,i)=>votes[i]+=sign*v);invalid+=sign*parts.at(-1)!;
  }
  const safe=(n:bigint)=>{if(n<0n||n>BigInt(Number.MAX_SAFE_INTEGER))fail(M.groupUnsafe);return Number(n);};
  const allocations=s.lists.map((l,i)=>({listId:l.id,votes:safe(votes[i])}));
  const votesCast=safe(votes.reduce((a,b)=>a+b,invalid));if(votesCast>s.registered)fail(M.turnoutOver);
  const action:Action={type:'addVoters',demographic:true,allocations:allocations.map((a,i)=>({...a,votes:a.votes-s.lists[i].votes})),invalid:safe(invalid)-s.invalid,label:JSON.stringify(adjustments)};
  return {votes:Object.fromEntries(allocations.map(a=>[a.listId,a.votes])),invalid:safe(invalid),votesCast,action};
}
