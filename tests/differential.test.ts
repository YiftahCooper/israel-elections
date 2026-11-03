// Output lock for the engine and model. Each digest covers the full serialised output of a seeded
// corpus (tests/differential.cases.ts): every dataset under its own and every other rule set,
// thousands of random elections across all rule semantics with forced lottery outcomes,
// analysis searches and sweeps, random action sequences, damaged imports and rule plumbing.
// The digests were recorded from the engine at 233d58b, before the performance refactor. The model
// and validation digests were re-recorded once, for one reviewed change: experimental scenarios
// whose agreements the engine reports as inactive (too many members, a list in two agreements) now
// pass import validation (4 action-sequence states and 5 damaged imports differ only there).
//
// A changed digest means some output changed. Find the first differing case with
// tests/differential-compare.ts; update a digest only for a reviewed, intended output change.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { goals, minimalChange, sweepThreshold, sweepVotes } from '../src/engine/analysis.ts';
import { RULESETS, ruleDepartures } from '../src/engine/rules.ts';
import { applyAction } from '../src/model/actions.ts';
import { electionRuleSetId, historicalRules, scenarioFromDataset, toEngineInput, toRuleSet, validateScenario } from '../src/model/scenario.ts';
import { FAMILIES, families, type Family, type Modules } from './differential.cases.ts';

const EXPECTED: Record<Family, string> = {
  allocation: '85feb14f047fbc94cd32e062f49f021e5bd1caf9ee0f20b07e97c4f90cc339fa',
  analysis: 'f04635df61b1ca12d56e177f0b249a60ed8056c24b2a003f4a7791f161390ee2',
  model: 'de901db8d023075fb4dccabc331f489af25532a4d3c734a7d25194720541a904',
  validation: '20096790e5f352f39e4bf3074fd757e6fdef00abe16b202c6707329811ee3675',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
