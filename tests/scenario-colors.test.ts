import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { loadDataset } from './helpers.ts';
import { describe, expect, it } from 'vitest';
import { migrateSavedColors, nextScenarioColor, savedColor, SCENARIO_PALETTE } from '../src/app/scenarioIdentity.ts';
import type { Action } from '../src/model/scenario.ts';
const entry = (id: string, electionId = 'k25', log: Action[] = []) => ({ id, electionId, savedAt: `2026-01-${id.padStart(2, '0')}`, log });
describe('automatic scenario identities', () => {
  it('chooses the least-used colour within this election', () => {
    const saved = [entry('1', 'k25', [{ type: 'setIdentityColor', color: SCENARIO_PALETTE[0] }]), entry('2', 'k26', [{ type: 'setIdentityColor', color: SCENARIO_PALETTE[1] }])];
    expect(nextScenarioColor(saved, 'k25')).toBe(SCENARIO_PALETTE[1]);
  });
  it('migrates missing colours by save order, without changing explicit colours or input', () => {
    const input = [entry('3'), entry('1'), entry('2', 'k25', [{ type: 'setIdentityColor', color: SCENARIO_PALETTE[0] }])];
    const migrated = migrateSavedColors(input);
    expect(savedColor(migrated[1].log)).toBe(SCENARIO_PALETTE[1]);
    expect(savedColor(migrated[0].log)).toBe(SCENARIO_PALETTE[2]);
    expect(migrated[2].log).toEqual(input[2].log);
    expect(input[0].log).toEqual([]);
    expect(migrateSavedColors(migrated)).toEqual(migrated);
  });
});

it('every offered identity colour can be applied, exported and replayed', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  for (const color of SCENARIO_PALETTE) {
    const coloured = applyAction(base, { type: 'setIdentityColor', color });
    expect(coloured.identityColor).toBe(color);
    expect(validateScenario(coloured)).toEqual([]);
  }
});

it('preserves explicit colours saved before the new default palette', () => {
  const base = scenarioFromDataset(loadDataset('k25'));
  const old = applyAction(base, {type:'setIdentityColor',color:'#65508a'});
  expect(validateScenario(old)).toEqual([]);
  expect(savedColor(old.log.map(e=>e.action))).toBe('#65508a');
});
