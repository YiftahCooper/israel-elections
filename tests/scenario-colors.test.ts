import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
import { describe, expect, it } from 'vitest';
import { nextScenarioColor, SCENARIO_PALETTE } from '../src/app/scenarioIdentity.ts';
import type { Action } from '../src/model/scenario.ts';
const entry = (id: string, electionId = 'k25', log: Action[] = []) => ({ id, electionId, savedAt: `2026-01-${id.padStart(2, '0')}`, log });
describe('automatic scenario identities', () => {
  it('chooses an unused distinct colour across all elections', () => {
    const saved = [entry('1', 'k25', [{ type: 'setIdentityColor', color: SCENARIO_PALETTE[0] }]), entry('2', 'k26', [{ type: 'setIdentityColor', color: SCENARIO_PALETTE[1] }])];
    expect([SCENARIO_PALETTE[0],SCENARIO_PALETTE[1]]).not.toContain(nextScenarioColor(saved,'k25'));
    expect(nextScenarioColor(saved,'k25')).toBe(nextScenarioColor(saved,'k26'));
  });
});

it('every offered identity colour can be applied, exported and replayed', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  for (const color of [...SCENARIO_PALETTE,'#0080ff']) {
    const coloured = applyAction(base, { type: 'setIdentityColor', color });
    expect(coloured.identityColor).toBe(color);
    expect(validateScenario(coloured)).toEqual([]);
  }
});

it('retains valid custom identity colours', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  expect(applyAction(base,{type:'setIdentityColor',color:'#65508a'}).identityColor).toBe('#65508a');
});
