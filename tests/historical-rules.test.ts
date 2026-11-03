import { describe, expect, it } from 'vitest';
import { ISRAEL_1992, ISRAEL_2004, ISRAEL_2014 } from '../src/engine/rules.ts';
import { electionRuleSetId, historicalRules, scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import type { ElectionId } from '../src/data/schema.ts';
import { loadDataset } from './helpers.ts';

describe('historical statutory threshold eras', () => {
  for (let n = 16; n <= 26; n++) {
    const id = `k${n}` as ElectionId;
    const preset = n === 16 ? ISRAEL_1992 : n <= 19 ? ISRAEL_2004 : ISRAEL_2014;
    it(`${id}: dataset rules and historical reset use its own era`, () => {
      // Synthetic dataset tests rule plumbing only; it is NOT historical seat evidence.
      const ds = { ...loadDataset('k25'), id, ruleSetId: preset.id };
      const base = scenarioFromDataset(ds);
      expect(electionRuleSetId(id)).toBe(preset.id);
      expect(toEngineInput(base).rules.threshold).toEqual(preset.threshold);
      const experimental = applyAction(base, { type: 'setMode', mode: 'experimental' });
      const edited = applyAction(experimental, { type: 'setRules', patch: { thresholdPct: '7', seats: 33 } });
      for (const ctx of [{}, { base }]) {
        const restored = applyAction(edited, { type: 'setMode', mode: 'historical' }, undefined, ctx);
        expect(restored.rules).toEqual(historicalRules(preset.id));
        expect(toEngineInput(restored).rules.threshold).toEqual(preset.threshold);
      }
      // the engine input is labelled with the election's own statute, and a saved scenario re-imports
      expect(toEngineInput(base).rules.id).toBe(preset.id);
      expect(toEngineInput(experimental).rules.id).toBe('experimental');
      expect(validateScenario(JSON.parse(JSON.stringify(base)))).toEqual([]);
    });
  }
  it('stores exact rational thresholds and rejects unknown eras', () => {
    expect(ISRAEL_1992.threshold).toEqual({ num: 3n, den: 200n });
    expect(ISRAEL_2004.threshold).toEqual({ num: 1n, den: 50n });
    expect(ISRAEL_2014.threshold).toEqual({ num: 13n, den: 400n });
    expect(() => historicalRules('unverified')).toThrow('unknown rule set');
    expect(validateScenario({ ...scenarioFromDataset(loadDataset('k25')), electionId: 'k27' })).toContain('unknown election "k27"');
  });
});
