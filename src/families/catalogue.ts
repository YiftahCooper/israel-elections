import { appearances, canonicalParty, parties } from './registry.ts';
import { emptyCatalogue, parseFamily, validFamily, type Catalogue, type Family } from './model.ts';
const files = import.meta.glob('../../data/meta/families/*.json', { eager:true, import:'default' });
export const builtins: Family[] = Object.entries(files).filter(([p])=>!p.endsWith('.draft.json')).map(([,x])=>{ if(!validFamily(x)) throw new Error('Invalid built-in family'); return x; }).sort((a,b)=>a.id==='haredi'?-1:b.id==='haredi'?1:a.nameEn.localeCompare(b.nameEn));
const KEY='israel-elections:families:v1';
export function readCatalogue(): Catalogue { try { const x=JSON.parse(localStorage.getItem(KEY)??'null'); if(x?.version===1 && Array.isArray(x.users) && x.users.every(validFamily) && Array.isArray(x.hidden) && x.hidden.every((h:unknown)=>typeof h==='string')) return x; } catch { /* unavailable */ } return emptyCatalogue(); }
export function writeCatalogue(c:Catalogue) { localStorage.setItem(KEY,JSON.stringify(c)); }
export function importPreset(text:string):Family {
 const f=parseFamily(text), knownLists=new Set(appearances.map(a=>a.listId)), knownParties=new Set(parties.map(p=>p.id));
 for(const row of f.elections) for(const m of row.members) if(!knownLists.has(m.listId)||!m.partyIds.every(p=>knownParties.has(canonicalParty(p)))) throw new Error('Unknown membership');
 for(const row of f.elections) for(const m of row.reviewCandidates) if(!knownLists.has(m.listId)) throw new Error('Unknown review list');
 if([...(f.included??[]),...(f.disabled??[])].some(id=>!knownLists.has(id)) || f.links?.some(l=>!knownParties.has(canonicalParty(l.from))||!knownParties.has(canonicalParty(l.to)))) throw new Error('Unknown override or link');
 return f;
}
