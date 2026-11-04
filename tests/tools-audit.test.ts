import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { ruleChanges } from '../src/app/derive.ts';

const k1 = (): ElectionDataset => JSON.parse(readFileSync(join(import.meta.dirname, '..', 'public', 'data', 'k1.json'), 'utf8'));

it('names the 1949 law by its own method and lists its hidden rules when they change', () => {
  let s = scenarioFromDataset(k1());
  s = applyAction(s, { type: 'setMode', mode: 'experimental' });
  s = applyAction(s, { type: 'setRules', patch: { remainderMethod: 'sainte-lague', remainderRequiresInitialSeat: false, agreementRequiresInitialSeat: false } });
  const en = ruleChanges(s, 'en');
  expect(en[0]).toBe('remainder seats by Sainte-Laguë (law: highest averages)');
  expect(en).toContain('remainder seats also for lists without a whole quota');
  expect(ruleChanges(s, 'he')).toHaveLength(en.length);
});
