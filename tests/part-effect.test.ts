import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { PARTS, type Part } from '../src/model/parts.ts';
import { startEffect } from '../src/model/partEffect.ts';
import { applyAction } from '../src/model/actions.ts';

for (const election of ['k26', 'k25', 'k12', 'k1']) {
  const base = scenarioFromDataset(JSON.parse(readFileSync(`public/data/${election}.json`, 'utf8')) as ElectionDataset);
  for (const part of Object.keys(PARTS) as Part[]) it(`${election}: official ${part} is unchanged`, () => {
    expect(startEffect(base, { type: 'startPart', part, source: 'official' }, base)).toBe('same');
  });
  for (const part of ['identity', 'candidates'] as const) it(`${election}: official ${part} is unchanged for every list`, () => {
    for (const list of base.lists) expect(startEffect(base, { type: 'startPart', part, listId: list.id, source: 'official' }, base)).toBe('same');
  });
  it(`${election}: a real withdrawal still offers structure restoration`, () => {
    const changed = applyAction(base, { type: 'setWithdrawn', listId: base.lists[0].id, withdrawn: true });
    expect(startEffect(changed, { type: 'startPart', part: 'structure', source: 'official' }, base)).toBe('change');
  });
}
