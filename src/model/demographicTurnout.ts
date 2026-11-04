import { isEnvelopeRow, type LocalityDataset } from '../data/schema.ts';
import { ActionError } from './actions.ts';
import type { Action, Scenario } from './scenario.ts';

export type DemographicAdjustment = { groupId: string } & (
  { turnoutChangePoints: number; turnoutPercent?: never } | { turnoutPercent: number; turnoutChangePoints?: never }
);
const fail = (message: string): never => { throw new ActionError('demographic-turnout', message); };
const count = (n: number) => { if (!Number.isSafeInteger(n) || n < 0) fail('Unsafe or negative vote count.'); return BigInt(n); };
const gcd = (a: bigint, b: bigint): bigint => b ? gcd(b, a % b) : a;
/** Exact decimal interpretation of the finite JS number supplied by the caller. */
function decimal(n: number): [bigint, bigint] {
  if (!Number.isFinite(n)) fail('Turnout must be finite.');
  const [mantissa, exponent = '0'] = String(n).split('e');
  const digits = (mantissa.split('.')[1] ?? '').length - Number(exponent);
  const a = BigInt(mantissa.replace('.', ''));
  return digits >= 0 ? [a, 10n ** BigInt(digits)] : [a * 10n ** BigInt(-digits), 1n];
}
function split(total: bigint, weights: bigint[]): bigint[] {
  const sum = weights.reduce((a,b)=>a+b,0n);
  if (!sum) { if(total) fail('No observed vote mix.'); return weights.map(()=>0n); }
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
  if(data.id!==s.electionId) fail('Election mismatch.');
  if(s.lists.some(l=>l.withdrawn)) fail('Reinstate withdrawn lists before demographic turnout.');
  const votes=s.lists.map(l=>count(l.votes));let invalid=count(s.invalid);
  const seen=new Set<number>();
  for(const adjustment of adjustments){
    const g=data.groups?.find(g=>g.id===adjustment.groupId) ?? fail(`Unknown group ${adjustment.groupId}.`);
    if(!g.codes.length || new Set(g.codes).size!==g.codes.length)fail('Empty or duplicate group membership.');
    const rows=g.codes.map(code=>{
      if(seen.has(code))fail('Overlapping demographic adjustments.');seen.add(code);
      const matches=data.rows.filter(r=>r.code===code);if(matches.length!==1 || isEnvelopeRow(matches[0]))fail('Missing, ambiguous or envelope locality.');return matches[0];
    });
    if(rows.some(r=>r.registered===null))fail('Registered-voter counts unavailable.');
    const reg=rows.reduce((t,r)=>t+count(r.registered!),0n),cast=rows.reduce((t,r)=>t+count(r.votesCast),0n);
    const inv=rows.reduce((t,r)=>t+count(r.invalid),0n);
    if(!reg || cast>reg)fail('Invalid group electorate.');
    const points='turnoutChangePoints' in adjustment && adjustment.turnoutChangePoints!==undefined;
    if(points === (adjustment.turnoutPercent!==undefined))fail('Supply exactly one turnout adjustment.');
    const [n,d]=decimal(points?adjustment.turnoutChangePoints!:adjustment.turnoutPercent!);
    const targetNumerator=(points?cast*100n*d:0n)+reg*n,denominator=100n*d;
    if(targetNumerator<0n || targetNumerator>reg*denominator)fail('Group turnout must be between 0 and 100 percent.');
    const target=(targetNumerator+denominator/2n)/denominator,delta=target-cast;
    const historical=data.listIds.map((_,k)=>rows.reduce((t,r)=>t+count(r.votes[k]),0n));
    if(historical.reduce((a,b)=>a+b,0n)+inv!==cast)fail('Locality totals do not reconcile.');
    // Build rational mapped weights, then clear denominators before Hamilton rounding.
    const mapped=s.lists.map(()=>[0n,1n]);
    historical.forEach((v,k)=>{
      if(!v)return;
      const indices=s.lists.flatMap((l,i)=>l.originIds.includes(data.listIds[k])?[i]:[]);
      if(!indices.length)fail(`Historical list ${data.listIds[k]} has no scenario destination.`);
      const sum=indices.reduce((t,i)=>t+count(s.lists[i].votes),0n);
      for(const i of indices){const weight=sum?count(s.lists[i].votes):1n,den=sum||BigInt(indices.length);
        const [a,b]=mapped[i];const nn=a*den+v*weight*b,dd=b*den,div=gcd(nn,dd);mapped[i]=[nn/div,dd/div];}
    });
    const common=mapped.reduce((t,[,d])=>t/gcd(t,d)*d,1n);
    const weights=[...mapped.map(([n,d])=>n*(common/d)),inv*common];
    const parts=split(delta<0n?-delta:delta,weights),sign=delta<0n?-1n:1n;
    parts.slice(0,-1).forEach((v,i)=>votes[i]+=sign*v);invalid+=sign*parts.at(-1)!;
  }
  const safe=(n:bigint)=>{if(n<0n||n>BigInt(Number.MAX_SAFE_INTEGER))fail('Adjustment would produce negative or unsafe totals.');return Number(n);};
  const allocations=s.lists.map((l,i)=>({listId:l.id,votes:safe(votes[i])}));
  const votesCast=safe(votes.reduce((a,b)=>a+b,invalid));if(votesCast>s.registered)fail('National turnout exceeds registered voters.');
  const action:Action={type:'addVoters',demographic:true,allocations:allocations.map((a,i)=>({...a,votes:a.votes-s.lists[i].votes})),invalid:safe(invalid)-s.invalid,label:JSON.stringify(adjustments)};
  return {votes:Object.fromEntries(allocations.map(a=>[a.listId,a.votes])),invalid:safe(invalid),votesCast,action};
}
