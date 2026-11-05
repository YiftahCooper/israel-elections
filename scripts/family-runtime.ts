/** Build-only compiler. Evidence remains in metadata and is never bundled into the profile. */
import { readFileSync, readdirSync } from 'node:fs';
import type { Family } from '../src/families/model.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
export function compileFamilyRuntime(root = process.cwd()) {
  const read = (path: string) => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
  const byId = new Map<string, ElectionDataset>();
  const elections = Array.from({ length: 26 }, (_, i) => {
    const d = read(`public/data/k${i+1}.json`) as ElectionDataset; byId.set(d.id, d);
    return { id: d.id, date: d.electionDate, valid: d.totals.valid, pending: d.status.stage !== 'official-final', lists: d.lists.map(l => [l.id, l.votes] as const),
      // Short names let chart hover name the lists behind a point without loading the election dataset.
      names: Object.fromEntries(d.lists.map(l => [l.id, [l.shortHe, l.shortEn ?? null] as const])) };
  });
  const dataset = (id: string) => byId.get(id)!;
  // Party-id aliases (legacy constituent ids) resolve to the registry's canonical ids.
  const registry = read('data/meta/parties.json') as { parties: { id: string; aliases?: { id: string }[] }[] };
  const canonical = new Map<string, string>(registry.parties.flatMap(p => [[p.id, p.id] as [string, string], ...(p.aliases ?? []).map(a => [a.id, p.id] as [string, string])]));
  const metaCache = new Map<string, { lists?: { letters: string; seats?: number; parties?: { id: string; candidateRanks?: number[] }[] }[] }>();
  const meta = (id: string) => { if (!metaCache.has(id)) { try { metaCache.set(id, read(`data/meta/${id}.json`)); } catch { metaCache.set(id, {}); } } return metaCache.get(id)!; };
  // Rank one is a fact; whether heading a joint list counts it whole is a reader's visible policy.
  const heads = (electionId: string, m: Family['elections'][number]['members'][number]) => {
    const list = meta(electionId).lists?.find(l => l.letters === (m as {letters?:string}).letters);
    const owners = list?.parties?.filter(p => p.candidateRanks?.includes(1)) ?? [];
    return owners.length === 1 && m.partyIds.some(id => (canonical.get(id) ?? id) === (canonical.get(owners[0].id) ?? owners[0].id));
  };
  // A mixed list names its constituent parties; the family's own parties are flagged so a hatched bar can say who is meant.
  const composition = (electionId: string, m: Family['elections'][number]['members'][number]) => {
    const own = new Set(m.partyIds.map(id => canonical.get(id) ?? id));
    return (dataset(electionId).lists.find(l => l.id === m.listId)?.parties ?? []).map(p => [p.id, canonical.get(p.id) ?? p.id, p.nameHe, p.nameEn ?? null, own.has(canonical.get(p.id) ?? p.id) ? 1 : 0] as const);
  };
  const families = readdirSync(`${root}/data/meta/families`).filter(p => p.endsWith('.json')).map(path => {
    const f = read(`data/meta/families/${path}`) as Family;
    return { id:f.id, revision:f.revision, status:f.status, nameHe:f.nameHe, nameEn:f.nameEn, labelEn:f.labelEn, labelHe:f.labelHe, definition:f.definition, definitionHe:f.definitionHe,
      policy:f.defaultMixedPolicy, elections:f.elections.map(e => ({id:e.electionId,
        members:e.members.map(m=>[m.listId, m.scope === 'led' ? 3 : m.scope === 'mixed' ? 2 : m.scope === 'extension' ? 1 : 0, m.treatment === 'include' ? 0 : m.treatment === 'separate-segment' ? 1 : m.treatment === 'exclude' ? 2 : 3, heads(e.electionId,m), m.scope === 'mixed' ? composition(e.electionId,m) : null] as const),
        reviews:e.reviewCandidates.map(m=>m.listId),
        totals:[0,2].map(scope=>e.members.filter(m=>scope===2?m.scope==='mixed':m.treatment==='include').reduce((sum,m)=>sum+Number(elections.find(d=>d.id===e.electionId)!.lists.find(l=>l[0]===m.listId)![1]),0)) })) };
  }).sort((a,b)=>a.id==='haredi'?-1:b.id==='haredi'?1:a.id.localeCompare(b.id));
  return {version:1, elections, families};
}
export type FamilyRuntime = ReturnType<typeof compileFamilyRuntime>;
