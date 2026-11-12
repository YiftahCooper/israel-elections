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

it('a pure divisor method in 1949 still fills the Knesset even with the 1949 initial-seat conditions left on', async () => {
  const { allocationOf } = await import('../src/app/derive.ts');
  for (const method of ['sainte-lague', 'dhondt', 'modified-sainte-lague'] as const) {
    let s = scenarioFromDataset(k1());
    s = applyAction(s, { type: 'setMode', mode: 'experimental' });
    // the conditions stay true here on purpose: the engine itself must ignore them without a quota stage
    s = applyAction(s, { type: 'setRules', patch: { remainderMethod: method, remainderRequiresInitialSeat: true, agreementRequiresInitialSeat: true } });
    const r = allocationOf(s);
    expect(r.lists.reduce((n, l) => n + l.seats, 0), method).toBe(120);
  }
});

it('c-state-code-12: the experimental-rules banner names every way the rules differ from the law, for every era on every election', async () => {
  const { ELECTION_IDS } = await import('../src/data/schema.ts');
  const { RULESETS, ruleDepartures } = await import('../src/engine/rules.ts');
  const { electionRuleSetId, historicalRules, toRuleSet } = await import('../src/model/scenario.ts');
  for (const e of ELECTION_IDS) {
    const law = historicalRules(electionRuleSetId(e));
    for (const id of Object.keys(RULESETS)) {
      const rules = historicalRules(id);
      const s = { electionId: e, rules } as Parameters<typeof ruleChanges>[0];
      const en = ruleChanges(s, 'en'), he = ruleChanges(s, 'he');
      const differ = ruleDepartures(toRuleSet(rules, null), toRuleSet(law, null));
      expect(en, `${id} on ${e}: ${differ.join(', ')}`).toHaveLength(differ.length);
      expect(he).toHaveLength(differ.length);
      expect(new Set(en).size).toBe(en.length);
    }
  }
  // 1977 with the 1973 rules: the candidate cap, which moved two seats (Sheli 2 → 1, Flatto-Sharon 1 → 2)
  expect(ruleChanges({ electionId: 'k9', rules: historicalRules('il-1973-bader-ofer-1') } as Parameters<typeof ruleChanges>[0], 'en')).toEqual(['candidate cap off']);
});
