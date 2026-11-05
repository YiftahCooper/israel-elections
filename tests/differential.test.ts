// 5 Nov 2026: re-recorded allocation/analysis/model for refreshed official k26 CSVs only.
// Engine/model implementation unchanged; qualifying votes 5,384,948, threshold 184,972,
// quota 44,874; all list seat counts unchanged. Validation/rules digests unchanged.
// Allocation/analysis re-recorded for consequence-only uncertainty warnings. The complete
// corpus matches HEAD after recursively omitting warnings; seat decisions are unchanged.
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
  // Allocation and analysis re-recorded 2026-11-04 for one reviewed engine fix: under a pure divisor method (no quota
  // stage, so no initial seats) the 1949 initial-seat conditions no longer apply. Before, those cases allocated 0 seats
  // or deactivated every surplus agreement; 298 allocation and 19 analysis cases differ, all of that kind. The old
  // engine on the same tree reproduces 8260bc46… and af4237ef…; model, validation and rules digests are unchanged.
  allocation: '5ef9e5f92adbc9c3a25da6553ed8f36a10a1bac990f27c53dd2fe4fc5619c6f6',
  analysis: 'b682af4570daf5cd7967e77afda56c8a9bcb2b5de4850f4d8ebc1652228269e0',
  // Model digest re-recorded for the 1973 party ranks, then for candidate biography links (Candidate.bio): with
  // the build timestamps held fixed and bio not carried, the new code gives the previous digest. Then for three
  // corrected names (0088 addendum: 1955 #24, 1959 #47, 2003 Shinui #14); src unchanged, other digests unchanged.
  // Decision 0089: rights basis on logo refs, Together 2026 logo and resulting build timestamps.
  // Removing those fields/logo and restoring HEAD timestamps reproduces the previous model digest.
  // Live 2026 campaign continuation: new list/constituent logo refs and k26 builtAt only.
  // Restoring HEAD's k26 dataset reproduces all five previous digests; non-logo fields compare equal.
  // Decision 0093: only links and builtAt differ in the 26 datasets; current model on HEAD
  // datasets reproduces bf90d94a..., and the other four digests are unchanged.
  // Likud k20–k25 logos only: all 26 datasets equal to HEAD after omitting logo and builtAt.
  // Labor k25 header logo only; all 26 datasets equal HEAD after omitting logo and builtAt.
  // Labor and Yisrael Beiteinu k24 logos; only logo and builtAt change in all 26 datasets.
  // Yisrael Beiteinu k21–k23 logos; all other dataset fields verified equal to HEAD.
  // k9 dated official print crop: all datasets equal HEAD omitting logo/builtAt.
  // k10 dated official print crop: all datasets equal HEAD omitting logo/builtAt.
  // k12 dated official print crop: all datasets equal HEAD omitting logo/builtAt.
  // Fighters List k1 logo (run 2, 1949–1973); all 26 datasets equal HEAD after omitting logo and builtAt.
  // Web-era run 2 logos (k20–k26); all 26 datasets equal HEAD after omitting logo and builtAt.
  // Likud 1984 print logo (run 3); all 26 datasets equal HEAD after omitting logo and builtAt.
  // Quota/retrieval retry pass: no qualifying additions; all 26 datasets exactly equal HEAD.
  // Keep the model digest unchanged, including logo fields and build timestamps.
  // Party- and bloc-colour separation (decision 0087 revised 2026-11-04): only list colours, bloc-scheme colours and
  // builtAt differ from HEAD in the 26 datasets (141 list colours, 48 bloc colours); every other field verified equal.
  // 5 Nov feedback: English labels/provenance and nearest-period logo refs (F9/F13), then bloc colours
  // and build timestamps; recursively omitting color/builtAt reproduces the previous merged datasets.
  // Other four digests unchanged.
  // k20–k24 stale bloc-note removal: only status.noteEn/noteHe and k20/k21 builtAt differ.
  // Current model with HEAD datasets reproduces da0ff97b…; all other dataset fields verified equal.
  // 5 Nov round 2: official English names of Knesset members (Candidate.nameEn) and build timestamps only; with HEAD's
  // datasets the new code reproduces da0ff97b... and the other four digests.
  // merged: both changes above together (bloc notes + nameEn), no other field differs.
  // k26 pm-recommendations scheme (5 Nov consultations): k26 gains one blocScheme and a new builtAt; no other field differs.
  model: '26489886bfadcc55c30ca1e14a903bdafaeb3c5fe6969c3cedc5f6068693052d',
  validation: '8f1bc0c8c6c951d68b0d926e6acbc30a7aeff235a18166e9df14f13b2fc85ac8',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
