import { expect, it } from 'vitest';
import { allocationOf, blocPieces, comparisonGroups, groupingBaseline, majorityText, nonSeatChanges } from '../src/app/derive.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';
import { listSearch } from '../src/app/analysisTasks.ts';
import { perturb } from '../src/engine/analysis.ts';
import { allocate } from '../src/engine/allocate.ts';
import { loadDataset } from './helpers.ts';
const base = scenarioFromDataset(loadDataset('k25'));
it('grouping-only switches compare identical seats under the active scheme', () => {
  for (const scheme of base.blocSchemes!) {
    const s = applyAction(base, { type: 'applyBlocScheme', schemeId: scheme.id });
    const b = groupingBaseline(s, base)!;
    expect(blocPieces(s, allocationOf(s))).toEqual(blocPieces(b, allocationOf(base)));
    expect(comparisonGroups(s, allocationOf(s), base, allocationOf(base)).every(g => g.seatsA === g.seatsB)).toBe(true);
  }
});
it('custom grouping has no fabricated official counterpart', () => {
  expect(groupingBaseline({...base, blocSchemeId:null}, base)).toBeNull();
});
it('majority wording covers below, at and above in both languages and other chamber sizes', () => {
  expect(majorityText(60,120,'en')).toBe('60 / 120 · 1 short of 61');
  expect(majorityText(61,120,'en')).toBe('61 / 120 · 0 above 61');
  expect(majorityText(64,120,'he')).toBe('64 / 120 · 3 מעל 61');
  expect(majorityText(6,10,'en')).toBe('6 / 10 · 0 above 6');
});
it('reports non-seat changes even when an agreement changes no seats', () => {
  const s = applyAction(base, {type:'removeAgreement', id:base.agreements[0].id});
  expect(nonSeatChanges(s,base,'en')).toContain('agreements changed');
  expect(nonSeatChanges(s,base,'he')).toContain('הסכמי העודפים השתנו');
});
it('threshold search provides adjacent one-vote checkpoints with either denominator assumption', () => {
  const l = base.lists.find(l => l.shortEn === 'Meretz')!;
  for (const src of [{kind:'new'} as const, {kind:'proportional',listIds:[] as string[]} as const]) {
    const input = toEngineInput(base);
    const m = listSearch(input, src, 'qualify', l.id, 0);
    expect(m.exact && m.found).toBe(true);
    const k = m.votes!;
    expect(allocate(perturb(input,l.id,src,k-1n)!).lists.find(x=>x.id===l.id)!.qualified).toBe(false);
    expect(allocate(perturb(input,l.id,src,k)!).lists.find(x=>x.id===l.id)!.qualified).toBe(true);
    expect(allocate(perturb(input,l.id,src,k+1n)!).lists.find(x=>x.id===l.id)!.qualified).toBe(true);
  }
});
