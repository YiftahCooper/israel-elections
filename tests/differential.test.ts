// Output lock for the engine and model. Each digest covers the full serialised output of a seeded
// corpus (tests/differential.cases.ts): every dataset under its own and every other rule set,
// thousands of random elections across all rule semantics with forced lottery outcomes,
// analysis searches and sweeps, random action sequences, damaged imports and rule plumbing.
// The digests were recorded from the engine at 233d58b, before the performance refactor.
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
  model: '7a69527d0d1bd3a7789f52a72c7412b3212cb1888c624befe6c00023ea2db78d',
  validation: '4d8741471a1575336664be50f4b6eaf47bf93c698775d0d9b90c2484e631e976',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
