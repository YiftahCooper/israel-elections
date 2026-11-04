import type { DemographicGroupDataset, GroupMeasure } from '../data/schema.ts';
import { ActionError } from './actions.ts';
import { validateDemographicGroups } from './validateDemographicGroups.ts';
import { groupAvailability } from './groupEvidence.ts';
import type { Action, Scenario } from './scenario.ts';
export { groupAvailability } from './groupEvidence.ts';
export interface GroupEdit { groupId: string; turnoutPct?: number; turnoutChangePoints?: number; split?: Record<string, number> }
const fail=(s:string):never=>{throw new ActionError('demographic-groups',s);};
type Q=[bigint,bigint];
const gcd=(a:bigint,b:bigint):bigint=>b?gcd(b,a%b):a;
const q=(a:bigint,b=1n):Q=>{if(b<=0n)fail('Invalid denominator');const g=gcd(a<0n?-a:a,b);return [a/g,b/g];};
const add=(a:Q,b:Q)=>q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const mul=(a:Q,b:Q)=>q(a[0]*b[0],a[1]*b[1]);
function decimal(n:number):Q {
 if(!Number.isFinite(n))fail('Non-finite number');
 const [m,e='0']=String(n).split('e'),p=(m.split('.')[1]??'').length-Number(e),a=BigInt(m.replace('.',''));
 return p>=0?q(a,10n**BigInt(p)):q(a*10n**BigInt(-p));
}
const pct=(n:number):Q=>{if(n<0||n>100)fail('Percentage outside 0–100');return mul(decimal(n),q(1n,100n));};
const whole=(n:number):bigint=>{if(!Number.isSafeInteger(n)||n<0)fail('Invalid count');return BigInt(n);};
const safe=(n:bigint)=>{if(n<0n||n>BigInt(Number.MAX_SAFE_INTEGER))fail('Unsafe total');return Number(n);};
const round=(v:Q)=>(2n*v[0]+v[1])/(2n*v[1]);
function value<T>(m:GroupMeasure<T>):T {if(m.grade==='insufficient')fail('Insufficient group evidence: '+m.reason);return m.value!;}
function apportion(total:bigint,weights:Q[]):bigint[]{
 const den=weights.reduce((t,w)=>t/gcd(t,w[1])*w[1],1n),ws=weights.map(w=>w[0]*(den/w[1])),sum=ws.reduce((a,b)=>a+b,0n);
 if(!sum){if(total)fail('Empty vote split');return ws;}
 const out=ws.map(w=>total*w/sum),order=ws.map((w,i)=>({i,r:total*w%sum})).sort((a,b)=>a.r>b.r?-1:a.r<b.r?1:a.i-b.i);
 let left=total-out.reduce((a,b)=>a+b,0n);for(const {i} of order){if(!left)break;out[i]++;left--;}return out;
}
/** Historical-relative incremental edits. Split edits are percentages among VALID voters.
 * Reject all cross-dimension combinations (unknown intersections); within a dimension the
 * reviewed definition promises disjoint membership. Current-origin shares resolve split lists.
 * Baseline and target integer allocations are rounded independently, then subtracted. */
export function demographicGroups(s:Scenario,data:DemographicGroupDataset,edits:GroupEdit[],options:{speculative?:boolean}={}) {
 if(s.electionId!==data.id)fail('Election mismatch');
 validateDemographicGroups(data,[...new Set(s.lists.flatMap(l=>l.originIds))]);
 if(s.lists.some(l=>l.withdrawn))fail('Reinstate withdrawn lists first');
 const deltas=s.lists.map(()=>0n);let invalidDelta=0n;
 const seen=new Set<string>(),dimensions=new Set<string>();
 const evidence: {groupId:string;grade:string;mode:string;reasons:string[]}[]=[];
 const mapped=(shares:Record<string,number>)=>{
  const weights=s.lists.map(()=>q(0n));let total=q(0n);
  for(const [id,share] of Object.entries(shares)){
   const v=pct(share);total=add(total,v);if(!v[0])continue;
   const indices=s.lists.flatMap((l,i)=>l.originIds.includes(id)?[i]:[]);
   if(!indices.length)fail(`No scenario destination for ${id}`);
   const sum=indices.reduce((t,i)=>t+whole(s.lists[i].votes),0n);
   for(const i of indices)weights[i]=add(weights[i],mul(v,q(sum?whole(s.lists[i].votes):1n,sum||BigInt(indices.length))));
  }
  if(total[0]!==total[1])fail('Split must sum exactly to 100 (include all lists; no residual guessing)');
  return weights;
 };
 for(const edit of edits){
  if(seen.has(edit.groupId))fail('Duplicate overlapping group');seen.add(edit.groupId);
  const g=data.groups.find(g=>g.id===edit.groupId)??fail('Unknown group');
  if(!data.dimensions.some(d=>d.id===g.dimension))fail('Unknown dimension');
  dimensions.add(g.dimension);if(dimensions.size>1)fail('Overlapping groups across dimensions');
  const availability=groupAvailability(g);evidence.push({groupId:g.id,...availability});
  if(availability.mode==='unavailable')fail('Insufficient or unattributed group evidence: '+availability.reasons.join('; '));
  if(availability.mode==='speculative'&&!options.speculative)fail('Speculative group requires explicit opt-in');
  const size=value(g.electorate),registered='eligible'in size?whole(size.eligible):round(mul(q(whole(data.national.registered)),pct(size.sharePct)));
  if(registered>whole(data.national.registered))fail('Group exceeds electorate');
  const baseline=pct(value(g.turnout));let target=baseline;
  if(edit.turnoutPct!==undefined&&edit.turnoutChangePoints!==undefined)fail('Supply one turnout edit');
  if(edit.turnoutPct!==undefined)target=pct(edit.turnoutPct);
  if(edit.turnoutChangePoints!==undefined)target=add(baseline,mul(decimal(edit.turnoutChangePoints),q(1n,100n)));
  if(target[0]<0n||target[0]>target[1])fail('Turnout outside 0–100');
  if(edit.turnoutPct===undefined&&edit.turnoutChangePoints===undefined&&!edit.split)fail('Empty edit');
  const oldSplit=value(g.split);if(oldSplit.otherPct)fail('Unattributed split');
  const oldWeights=mapped(oldSplit.lists),newWeights=edit.split?mapped(edit.split):oldWeights;
  const rate=g.invalidRate?pct(value(g.invalidRate)):q(whole(data.national.invalid),whole(data.national.votesCast));
  const oldCast=round(mul(q(registered),baseline)),newCast=round(mul(q(registered),target));
  const oldInvalid=round(mul(q(oldCast),rate)),newInvalid=round(mul(q(newCast),rate));
  const before=apportion(oldCast-oldInvalid,oldWeights),after=apportion(newCast-newInvalid,newWeights);
  after.forEach((v,i)=>deltas[i]+=v-before[i]);invalidDelta+=newInvalid-oldInvalid;
 }
 const clamped:{listId:string;requestedDelta:number;appliedDelta:number}[]=[];
 s.lists.forEach((l,i)=>{const n=whole(l.votes);if(n+deltas[i]<0n){clamped.push({listId:l.id,requestedDelta:-safe(-deltas[i]),appliedDelta:l.votes===0?0:-l.votes});deltas[i]=-n;}});
 if(whole(s.invalid)+invalidDelta<0n){clamped.push({listId:'invalid',requestedDelta:-safe(-invalidDelta),appliedDelta:s.invalid===0?0:-s.invalid});invalidDelta=-whole(s.invalid);}
 const votes=Object.fromEntries(s.lists.map((l,i)=>[l.id,safe(whole(l.votes)+deltas[i])]));
 const invalid=safe(whole(s.invalid)+invalidDelta),votesCast=safe(Object.values(votes).reduce((t,v)=>t+BigInt(v),BigInt(invalid)));
 if(votesCast>s.registered)fail('National turnout exceeds registered electorate');
 const signed=(n:bigint)=>n<0n?-safe(-n):safe(n);
 const action:Action={type:'addVoters',demographic:true,allocations:s.lists.map((l,i)=>({listId:l.id,votes:signed(deltas[i])})),invalid:signed(invalidDelta),label:JSON.stringify({kind:'people-groups',edits,evidence,clamped})};
 return {votes,invalid,votesCast,deltas:Object.fromEntries(action.allocations.map(a=>[a.listId,a.votes])),invalidDelta:action.invalid,clamped,evidence,action};
}
