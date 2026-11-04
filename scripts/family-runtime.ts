/** Build-only compiler. Evidence remains in metadata and is never bundled into the profile. */
import { readFileSync, readdirSync } from 'node:fs';
import type { Family } from '../src/families/model.ts';
import type { ElectionDataset } from '../src/data/schema.ts';
export function compileFamilyRuntime(root = process.cwd()) {
  const read = (path: string) => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
  const elections = Array.from({ length: 26 }, (_, i) => {
    const d = read(`public/data/k${i+1}.json`) as ElectionDataset;
    return { id: d.id, date: d.electionDate, valid: d.totals.valid, pending: d.status.stage !== 'official-final', lists: d.lists.map(l => [l.id, l.votes] as const) };
  });
  const families = readdirSync(`${root}/data/meta/families`).filter(p => p.endsWith('.json')).map(path => {
    const f = read(`data/meta/families/${path}`) as Family;
    return { id:f.id, revision:f.revision, status:f.status, nameHe:f.nameHe, nameEn:f.nameEn, labelEn:f.labelEn, labelHe:f.labelHe, definition:f.definition, definitionHe:f.definitionHe,
      policy:f.defaultMixedPolicy, elections:f.elections.map(e => ({id:e.electionId,
        members:e.members.map(m=>[m.listId, m.scope === 'mixed' ? 2 : m.scope === 'extension' ? 1 : 0, m.treatment === 'include' ? 0 : m.treatment === 'separate-segment' ? 1 : m.treatment === 'exclude' ? 2 : 3] as const),
        reviews:e.reviewCandidates.map(m=>m.listId),
        totals:[0,2].map(scope=>e.members.filter(m=>scope===2?m.scope==='mixed':m.treatment==='include').reduce((sum,m)=>sum+Number(elections.find(d=>d.id===e.electionId)!.lists.find(l=>l[0]===m.listId)![1]),0)) })) };
  }).sort((a,b)=>a.id==='haredi'?-1:b.id==='haredi'?1:a.id.localeCompare(b.id));
  return {version:1, elections, families};
}
export type FamilyRuntime = ReturnType<typeof compileFamilyRuntime>;
