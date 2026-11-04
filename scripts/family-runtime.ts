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
  // Party-id aliases (legacy constituent ids) resolve to the registry's canonical ids.
  const registry = read('data/meta/parties.json') as { parties: { id: string; aliases?: { id: string }[] }[] };
  const canonical = new Map<string, string>(registry.parties.flatMap(p => [[p.id, p.id] as [string, string], ...(p.aliases ?? []).map(a => [a.id, p.id] as [string, string])]));
  const metaCache = new Map<string, { lists?: { letters: string; seats?: number; parties?: { id: string; candidateRanks?: number[] }[] }[] }>();
  const meta = (id: string) => { if (!metaCache.has(id)) { try { metaCache.set(id, read(`data/meta/${id}.json`)); } catch { metaCache.set(id, {}); } } return metaCache.get(id)!; };
  /** A joint list LED by the family counts whole for it: the family's own parties hold the list's first place and at least
   *  two thirds of the seats it won (e.g. Likud 2026: 26 of 27, New Hope 1). Lists are never split; a genuine partnership
   *  (Likud–Yisrael Beiteinu 2013, 20 of 31) stays mixed. Seatless lists and lists without candidate-party data stay mixed. */
  const led = (electionId: string, m: Family['elections'][number]['members'][number]) => {
    const letters = (m as { letters?: string }).letters;
    const list = meta(electionId).lists?.find(l => l.letters === letters);
    const won = list?.seats ?? 0;
    if (!list?.parties?.length || won < 1) return false;
    const mine = new Set(m.partyIds.map(id => canonical.get(id) ?? id));
    const owner = new Map<number, string>(list.parties.flatMap(p => (p.candidateRanks ?? []).map(r => [r, canonical.get(p.id) ?? p.id] as [number, string])));
    if (!mine.has(owner.get(1) ?? '')) return false;
    let held = 0; for (let r = 1; r <= won; r++) if (mine.has(owner.get(r) ?? '')) held++;
    return 3 * held >= 2 * won;
  };
  const families = readdirSync(`${root}/data/meta/families`).filter(p => p.endsWith('.json')).map(path => {
    const f = read(`data/meta/families/${path}`) as Family;
    for (const e of f.elections) for (const m of e.members) if (m.scope === 'mixed' && m.partyIds.length && led(e.electionId, m)) { m.scope = 'led'; m.treatment = 'include'; }
    return { id:f.id, revision:f.revision, status:f.status, nameHe:f.nameHe, nameEn:f.nameEn, labelEn:f.labelEn, labelHe:f.labelHe, definition:f.definition, definitionHe:f.definitionHe,
      policy:f.defaultMixedPolicy, elections:f.elections.map(e => ({id:e.electionId,
        members:e.members.map(m=>[m.listId, m.scope === 'led' ? 3 : m.scope === 'mixed' ? 2 : m.scope === 'extension' ? 1 : 0, m.treatment === 'include' ? 0 : m.treatment === 'separate-segment' ? 1 : m.treatment === 'exclude' ? 2 : 3] as const),
        reviews:e.reviewCandidates.map(m=>m.listId),
        totals:[0,2].map(scope=>e.members.filter(m=>scope===2?m.scope==='mixed':m.treatment==='include').reduce((sum,m)=>sum+Number(elections.find(d=>d.id===e.electionId)!.lists.find(l=>l[0]===m.listId)![1]),0)) })) };
  }).sort((a,b)=>a.id==='haredi'?-1:b.id==='haredi'?1:a.id.localeCompare(b.id));
  return {version:1, elections, families};
}
export type FamilyRuntime = ReturnType<typeof compileFamilyRuntime>;
