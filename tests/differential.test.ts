// Output lock for the engine and model. Each digest covers the full serialised output of a seeded
// corpus (tests/differential.cases.ts): every dataset under its own and every other rule set,
// thousands of random elections across all rule semantics with forced lottery outcomes,
// analysis searches and sweeps, random action sequences, damaged imports and rule plumbing.
// The digests were recorded from the engine at 233d58b, before the performance refactor. The model
// and validation digests were re-recorded once, for one reviewed change: experimental scenarios
// whose agreements the engine reports as inactive (too many members, a list in two agreements) now
// pass import validation (4 action-sequence states and 5 damaged imports differ only there).
//
// The corpus reads public/data, so a dataset change (a new election, a corrected roster) also changes the
// allocation and model digests. On 4 November 2026 they were re-recorded after 1973 was released; the
// pre-refactor engine (main at 9d8c3c1) produced the same digests on the same data. The model digest was
// re-recorded again after the 4 November roster corrections (53 names; 1988 Likud rank 25 not seated), with
// the same check. Re-recorded once more when candidates gained curated notes (6 candidates): with the two new
// fields switched off, the code gives the earlier digest. And again when the build merged data/meta
// (party colours, constituent parties, bloc schemes): the old code gives the same digest on the same data.
// Model and validation were re-recorded for decision 0087 step 2: scenarios now carry bloc schemes and party
// blocs and start from the default scheme (allocation, analysis and rules digests unchanged). Model
// re-recorded again for the 1973 party ranks and when lists gained their election logos.
//
// Model digest re-recorded for the k25 Yesh Atid logo: dataset is identical after removing logo and builtAt.
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
  allocation: 'aba4d7b5256328d6a1db6591b83369cb066c5c6f0ecb2cc369209b9ee2a7eacf',
  analysis: 'f04635df61b1ca12d56e177f0b249a60ed8056c24b2a003f4a7791f161390ee2',
  // Model digest re-recorded for the 1973 party ranks, then for candidate biography links (Candidate.bio): with
  // the build timestamps held fixed and bio not carried, the new code gives the previous digest. Then for three
  // corrected names (0088 addendum: 1955 #24, 1959 #47, 2003 Shinui #14); src unchanged, other digests unchanged.
  // Decision 0089: rights basis on logo refs, Together 2026 logo and resulting build timestamps.
  // Removing those fields/logo and restoring HEAD timestamps reproduces the previous model digest.
  // Live 2026 campaign continuation: new list/constituent logo refs and k26 builtAt only.
  // Restoring HEAD's k26 dataset reproduces all five previous digests; non-logo fields compare equal.
  model: 'bf90d94a7fab09a9ba7e62eded247acec1346fb5b23aebdfde2267ab79e9c175',
  validation: '8f1bc0c8c6c951d68b0d926e6acbc30a7aeff235a18166e9df14f13b2fc85ac8',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
