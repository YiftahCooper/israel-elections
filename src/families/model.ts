import type { ElectionDataset, ElectionId } from '../data/schema.ts';
import type { Action, Scenario } from '../model/scenario.ts';
import type { SourceChoice } from '../app/voteEdit.ts';
export type MixedPolicy = 'separate-segment' | 'include-whole-list' | 'exclude';
export interface Member { listId: string; partyIds: string[]; scope: string; treatment: string; classificationEvidence: { status: string; sourceIds: string[]; claim: string }; [key: string]: unknown }
export interface Family {
  schemaVersion: 1; id: string; revision: string; status: string; nameHe: string; nameEn: string;
  definition: string; definitionHe?: string; defaultMixedPolicy: MixedPolicy;
  sources: Record<string, { url?: string; publisher?: string; [key: string]: unknown }>;
  elections: { electionId: ElectionId; members: Member[]; reviewCandidates: { listId: string; nameHe?: string; reason: string; sourceIds: string[] }[]; [key: string]: unknown }[];
  disabled?: string[]; included?: string[]; links?: { from: string; to: string; type: 'lineage' | 'electoral-partner'; electionId?:string; sourceEdgeId?:string }[];
  forkedFrom?: { id: string; revision: string }; [key: string]: unknown;
}
const obj = (x: unknown): x is Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x);
const strings = (x: unknown): x is string[] => Array.isArray(x) && x.every(y => typeof y === 'string') && new Set(x).size === x.length;
export function validFamily(x: unknown): x is Family {
  if (!obj(x) || x.schemaVersion !== 1 || !['id','revision','status','nameHe','nameEn','definition'].every(k => typeof x[k] === 'string' && x[k].length > 0) || !['separate-segment','include-whole-list','exclude'].includes(x.defaultMixedPolicy) || !obj(x.sources) || !Array.isArray(x.elections)) return false;
  for (const s of Object.values(x.sources)) { if (!obj(s)) return false; if (s.url) { try { const u = new URL(s.url); if (u.protocol !== 'https:' || /(^|\.)en\.(m\.)?wikipedia\.org$/i.test(u.hostname)) return false; } catch { return false; } } }
  if (new Set(x.elections.map((e: any) => e.electionId)).size !== x.elections.length) return false;
  for (const e of x.elections) {
    if (!obj(e) || !/^k([1-9]|1[0-9]|2[0-6])$/.test(e.electionId) || !Array.isArray(e.members) || !Array.isArray(e.reviewCandidates)) return false;
    if (new Set(e.members.map((m: any) => m.listId)).size !== e.members.length) return false;
    for (const m of e.members) if (!obj(m) || typeof m.listId !== 'string' || !m.listId.startsWith(e.electionId.slice(1)+'-') || !strings(m.partyIds) || !['core','extension','mixed'].includes(m.scope) || !['include','mixed','separate-mixed-segment','separate-segment','exclude','unresolved'].includes(m.treatment) || !obj(m.classificationEvidence) || typeof m.classificationEvidence.claim !== 'string' || !strings(m.classificationEvidence.sourceIds) || !m.classificationEvidence.sourceIds.every((s: string) => Object.hasOwn(x.sources, s))) return false;
    for (const m of e.reviewCandidates) if (!obj(m) || typeof m.listId !== 'string' || !m.listId.startsWith(e.electionId.slice(1)+'-') || typeof m.reason !== 'string' || !strings(m.sourceIds) || !m.sourceIds.every((s: string) => Object.hasOwn(x.sources,s))) return false;
  }
  if (x.disabled !== undefined && !strings(x.disabled) || x.included !== undefined && !strings(x.included)) return false;
  if (x.links !== undefined && (!Array.isArray(x.links) || !x.links.every((l: any) => obj(l) && typeof l.from === 'string' && typeof l.to === 'string' && l.from !== l.to && ['lineage','electoral-partner'].includes(l.type)))) return false;
  return true;
}
export function parseFamily(text: string): Family { const x: unknown = JSON.parse(text); if (!validFamily(x)) throw new Error('Invalid family definition'); return structuredClone(x); }
export function membership(f: Family, election: ElectionId) {
  const row = f.elections.find(e => e.electionId === election);
  const selected = new Set<string>(), mixed = new Set<string>();
  for (const m of row?.members ?? []) if (!f.disabled?.includes(m.listId)) {
    if (m.scope === 'mixed' || m.treatment.includes('mixed')) mixed.add(m.listId);
    else if (m.treatment === 'include') selected.add(m.listId);
  }
  for (const id of f.included ?? []) if (id.startsWith(election.slice(1)+'-')) selected.add(id);
  for (const id of mixed) { if (f.defaultMixedPolicy === 'include-whole-list') selected.add(id); else selected.delete(id); }
  for (const id of selected) mixed.delete(id);
  if (f.defaultMixedPolicy === 'exclude') mixed.clear();
  return { selected, mixed, known: !!row };
}
export function aggregate(f: Family, ds: ElectionDataset) {
  const m = membership(f, ds.id); const knownIds = new Set(ds.lists.map(l => l.id));
  const unresolved = !m.known || !!f.elections.find(e=>e.electionId===ds.id)?.members.some(m=>m.treatment==='unresolved'&&!f.included?.includes(m.listId)&&!f.disabled?.includes(m.listId)) || [...m.selected,...m.mixed].some(id => id.startsWith(ds.id.slice(1)+'-') && !knownIds.has(id));
  const sum = (ids: Set<string>) => ds.lists.reduce((v,l) => v + (ids.has(l.id) ? BigInt(l.votes) : 0n),0n);
  return { votes: unresolved ? null : sum(m.selected), mixed: unresolved ? null : sum(m.mixed), valid: BigInt(ds.totals.valid), status: unresolved ? 'unknown' : !m.selected.size && !m.mixed.size ? 'did-not-contest' : 'observed' };
}
export function resolve(f: Family, s: Scenario) {
  const { selected, mixed } = membership(f,s.electionId);
  return s.lists.map(l => { const origins = l.originIds; const hits = origins.filter(id => selected.has(id)).length;
    const isMixed = origins.some(id => mixed.has(id)) || hits > 0 && hits < origins.length;
    return { ...l, family: isMixed ? (f.defaultMixedPolicy === 'include-whole-list' ? 'selected' : f.defaultMixedPolicy === 'exclude' ? 'other' : 'mixed') : hits ? 'selected' : 'other' };
  });
}
/** Integer-only largest remainders, stable input-order tie breaking. */
export function distribute(total: bigint, weights: bigint[]): number[] {
  const sum = weights.reduce((a,b)=>a+b,0n); if (sum === 0n) { if (total === 0n) return weights.map(()=>0); throw new Error('Zero weights'); }
  const base = weights.map(w=> total*w/sum); let rest = total-base.reduce((a,b)=>a+b,0n);
  const order = weights.map((w,i)=>({ i, r:total*w%sum })).sort((a,b)=>a.r>b.r?-1:a.r<b.r?1:a.i-b.i);
  for (const {i} of order) { if (rest-- <= 0n) break; base[i]++; }
  return base.map(n=> { if (n<0n || n>BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Unsafe votes'); return Number(n); });
}
export function decimal(x: string) { if (!/^\d+(\.\d{1,6})?$/.test(x)) throw new Error('Invalid decimal'); const [a,b='']=x.split('.'); return { n:BigInt(a+b), d:10n**BigInt(b.length) }; }
export function scaleAction(f: Family, s: Scenario, mode: 'multiplier'|'share', value: string, source: SourceChoice): Extract<Action, {type:'familyOperation';operation:'scale'}> {
  const lists=resolve(f,s), members=lists.filter(l=>l.family==='selected'&&!l.withdrawn);
  const current=members.reduce((a,l)=>a+BigInt(l.votes),0n), valid=s.lists.reduce((a,l)=>a+BigInt(l.votes),0n);
  if (!current) throw new Error('zero-family');
  const {n,d}=decimal(value); let target: bigint;
  if (mode==='multiplier') target=(current*(100n*d+n)+50n*d)/(100n*d);
  else { if (n>100n*d) throw new Error('target'); target=source.kind==='new' ? (n===100n*d ? -1n : (n*(valid-current)+(100n*d-n)-1n)/(100n*d-n)) : (valid*n+50n*d)/(100n*d); }
  const donors=lists.filter(l=>l.family!=='selected'&&!l.withdrawn&&(source.kind!=='transfer'||l.id===source.listId));
  const donorTotal=donors.reduce((a,l)=>a+BigInt(l.votes),0n), delta=target-current;
  if (target<0n || source.kind!=='new' && (donorTotal<delta || donorTotal===0n && delta!==0n)) throw new Error('donors');
  const allocations=members.map((l,i)=>({listId:l.id,before:l.votes,votes:distribute(target,members.map(l=>BigInt(l.votes)))[i]}));
  if(source.kind!=='new') { const shares=distribute(donorTotal-delta,donors.map(l=>BigInt(l.votes))); donors.forEach((l,i)=>allocations.push({listId:l.id,before:l.votes,votes:shares[i]})); }
  return { type:'familyOperation', definition:structuredClone(f), operation:'scale', allocations, source, target:Number(target), registeredDelta:source.kind==='new'?Number(delta):0 };
}
export function groupingAction(f: Family,s: Scenario,lang: 'he'|'en' = 'he'): Action {
  return {type:'familyOperation',definition:structuredClone(f),operation:'group', name:lang==='he'?f.nameHe:f.nameEn, placements:Object.fromEntries(resolve(f,s).map(l=>[l.id,l.family]))};
}
export interface Catalogue { version:1; users:Family[]; hidden:string[] }
export const emptyCatalogue = ():Catalogue=>({version:1,users:[],hidden:[]});
export function fork(f:Family):Family { return {...structuredClone(f),id:`personal-${crypto.randomUUID()}`, revision:new Date().toISOString(),status:'personal',forkedFrom:{id:f.id,revision:f.revision}}; }
export function visibility(c:Catalogue,id:string,hide:boolean):Catalogue { return {...c,hidden:hide?[...new Set([...c.hidden,id])]:c.hidden.filter(x=>x!==id)}; }
