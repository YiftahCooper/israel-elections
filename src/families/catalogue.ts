import { emptyCatalogue, parseFamily, validFamily, type Catalogue, type Family } from './model.ts';
import {builtins} from './runtime.ts';
export {builtins};
const evidence = import.meta.glob('../../data/meta/families/*.json', { import:'default' });
export async function fullDefinition(f:Family):Promise<Family> {
 if(f.status==='personal') return f;
 const loader=evidence[`../../data/meta/families/${f.id}.json`];
 if(!loader) throw new Error('Missing family evidence');
 const full=await loader(); if(!validFamily(full)) throw new Error('Invalid family evidence'); return {...full,elections:full.elections.map(e=>({...e,members:e.members.map(m=>({...m,headsList:builtins.find(x=>x.id===f.id)?.elections.find(x=>x.electionId===e.electionId)?.members.find(x=>x.listId===m.listId)?.headsList}))}))};
}
const KEY='israel-elections:families:v1';
export function readCatalogue(): Catalogue { try { const x=JSON.parse(localStorage.getItem(KEY)??'null'); if(x?.version===1 && Array.isArray(x.users) && x.users.every(validFamily) && Array.isArray(x.hidden) && x.hidden.every((h:unknown)=>typeof h==='string')) return x; } catch { /* unavailable */ } return emptyCatalogue(); }
/** Writes this tab's change (`prev` to `next`), family by family, on top of what is stored now, so a family saved in
 *  another open tab is never written over (audit 12 Nov 2026, c-robustness-07). Returns what is now stored. */
export function writeCatalogue(next:Catalogue, prev:Catalogue=next):Catalogue {
 const now=readCatalogue(), same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
 const users=new Map(now.users.map(f=>[f.id,f]));
 for(const id of new Set([...prev.users,...next.users].map(f=>f.id))){
  const was=prev.users.find(f=>f.id===id), is=next.users.find(f=>f.id===id);
  if(same(was,is)) continue;
  if(is) users.set(id,is); else users.delete(id);
 }
 const hidden=new Set(now.hidden);
 for(const id of next.hidden) if(!prev.hidden.includes(id)) hidden.add(id);
 for(const id of prev.hidden) if(!next.hidden.includes(id)) hidden.delete(id);
 const merged:Catalogue={version:1,users:[...users.values()],hidden:[...hidden]};
 localStorage.setItem(KEY,JSON.stringify(merged));
 return merged;
}
export async function importPreset(text:string):Promise<Family> {
 const {appearances,canonicalParty,parties}=await import('./registry.ts');
 const f=parseFamily(text), knownLists=new Set(appearances.map(a=>a.listId)), knownParties=new Set(parties.map(p=>p.id));
 for(const row of f.elections) for(const m of row.members) if(!knownLists.has(m.listId)||!m.partyIds.every(p=>knownParties.has(canonicalParty(p)))) throw new Error('Unknown membership');
 for(const row of f.elections) for(const m of row.reviewCandidates) if(!knownLists.has(m.listId)) throw new Error('Unknown review list');
 if([...(f.included??[]),...(f.disabled??[])].some(id=>!knownLists.has(id)) || f.links?.some(l=>!knownParties.has(canonicalParty(l.from))||!knownParties.has(canonicalParty(l.to)))) throw new Error('Unknown override or link');
 return f;
}
