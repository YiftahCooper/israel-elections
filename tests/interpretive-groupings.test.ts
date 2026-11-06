import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

describe('interpretive grouping provenance', () => {
  for (const id of ['k24', 'k25']) it(`${id} keeps concise names and app provenance through scenarios and imports`, () => {
    const ds: ElectionDataset = JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
    const scheme = ds.blocSchemes!.find(g => g.id === (id === 'k24' ? 'knesset-blocs-2021' : 'pre-election-blocs'))!;
    expect(scheme).toHaveProperty('appDefined', true);
    expect(scheme.nameEn).not.toMatch(/\(/);
    const s = applyAction(scenarioFromDataset(ds), { type: 'applyBlocScheme', schemeId: scheme.id });
    expect(s.blocs.every(b => 'appDefined' in b && b.appDefined === true)).toBe(true);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });
});

import { groupingName, appGroupingExplanation } from '../src/app/groupingName.ts';
it('marks names in both languages without changing sourced names', () => {
  const g = { nameEn: 'Comparison groups', nameHe: 'קבוצות להשוואה', appDefined: true };
  expect(groupingName(g, 'en')).toBe('Comparison groups · App');
  expect(groupingName(g, 'he')).toBe('קבוצות להשוואה · יישומון');
  expect(groupingName({...g, appDefined: false}, 'en')).toBe('Comparison groups');
  expect(appGroupingExplanation('en')).toContain('not an official or contemporaneous');
  expect(appGroupingExplanation('he')).toContain('אינה חלוקה רשמית');
});
