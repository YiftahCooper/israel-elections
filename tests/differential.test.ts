// k15 stable-ID follow-up: restore opaque IDs 15-ט / 15-קף without changing letters.
// Recursive dataset diff is exactly those ID/reference reversions and builtAt; all
// other 25 datasets unchanged. HEAD k15 substitution reproduces all prior digests.
// k15 audit (6 Nov): only k15 changes: ballot-ID migrations, gazetted names,
// two withdrawn registration records, roster status, Gagula note, two withheld logos and provenance.
// Field diff recorded in k15-resolution.md. Restoring HEAD k15 at scenarioFromDataset
// reproduces all five old digests; src and the other 25 datasets are unchanged.
// 6 Nov 2026 k22 audit: reviewed scalar diff changes only status, logical Hebrew
// punctuation, CEC link titles, three withdrawal flags and distinct modern Gesher
// IDs (also k23). Withdrawal flags affect hypothetical corpus allocations; model
// snapshots also carry roster/party fields. No engine implementation changed.
// k20 audit 6 Nov 2026: field diff permits only יך withdrawal/note, Saadi displayNameHe/notes,
// status count-definition notes and builtAt. Votes, seats, raw names/ranks and all src unchanged.
// Allocation changes because scenarios carry withdrawn; model also carries display notes.
  // merged with k20 audit fixes: combined digest = union of the separately reviewed changes.
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

// k24 audit (6 Nov): recursive field diff confirms only k24 status/source metadata,
// project-grouping labels, four candidate notes, withdrawn Demokratit and New Hope logo removal change.
// Allocation changes because the cancelled zero-vote list is excluded; model also carries display fields.
// All 25 other datasets and engine/model source are unchanged; analysis/validation/rules retain their digests.
const EXPECTED: Record<Family, string> = {
  // Allocation and analysis re-recorded 2026-11-04 for one reviewed engine fix: under a pure divisor method (no quota
  // stage, so no initial seats) the 1949 initial-seat conditions no longer apply. Before, those cases allocated 0 seats
  // or deactivated every surplus agreement; 298 allocation and 19 analysis cases differ, all of that kind. The old
  // engine on the same tree reproduces 8260bc46… and af4237ef…; model, validation and rules digests are unchanged.
  // merged with the k24 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k20 audit fixes: combined digest = union of the separately reviewed changes.
  allocation: '5857d33b899e504cfed7848cdf52c06ef62782adc838b9af33de99f5d797ea5b',
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
  // 5 Nov: pm-recommendations schemes appended for k10, k11, k12, k16, k17; in those five datasets only blocSchemes
  // (new last entry; earlier schemes equal) and buildInfo differ from HEAD. Allocation/analysis/validation/rules unchanged.
  // merged with the 2009–2026 recommendations branch (k18, k19, k20, k26 schemes; field-verified on that branch).
  // merged with the 1949–1973 recommendations branch (k4, k7, k8 schemes; field-verified on that branch).
  // merged with the 1949–2006 logos run 3 (only list/party logo fields and builtAt differ; path walk 5 Nov).
  // merged with the 2009–2026 logos run (only list/party logo fields and builtAt differ; path walk 5 Nov).
  // 0089 same-election correction: field-by-field diff against integ-1105 found only
  // 212 removed list/party logo refs and 23 builtAt changes; other four digests unchanged.
  // merged with logos run 4 (year-only print evidence; only 6 logo fields and builtAt differ; path walk 5 Nov).
  // merged with logos run 4b (k18–k26 same-election logos; only 17 logo fields and builtAt differ; path walk 5 Nov).
  // U6 synthetic artwork: 212 of 520 model cases differ only in the new synthetic field;
  // recursively omitting it exactly reproduces HEAD in every case (allocation/analysis unchanged).
  // merged with the k22 audit fixes (data only); the combined digest is the union of the two reviewed changes.
  // k23 audit: five gazette name/party-cell corrections and two Hebrew link labels (17 leaves).
  // Substituting merged HEAD's k23 dataset at scenarioFromDataset reproduces 2694440f…;
  // all other 25 datasets and the other four digests are unchanged.
  // merged with the k23 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with the k24 audit fixes: combined digest = union of the separately reviewed changes.
  // k25 audit: recursive field comparison confirms only 61 whitespace-only nameEn changes across k18–k26,
  // k25 app-defined grouping labels, its New Economic Party link, one unproved logo removal and build timestamps.
  // All numeric inputs and the other four differential digests are unchanged.
  // merged with the k25 audit fixes: combined digest = union of the separately reviewed changes.
  // k26 audit: only official results status/seat provenance, two name-variant notes, bloc evidence,
  // completed recommendation scheme and buildInfo differ; all other datasets equal HEAD (field diff 6 Nov).
  // Allocation, analysis, validation and rules digests are unchanged.
  // merged with the k26 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k20 audit fixes: combined digest = union of the separately reviewed changes.
  // K19 audit: only status notes, corrected Balad name/note, three withheld logos, sourceIds/rawSha256
  // and builtAt changed (recursive field diff); HEAD k19 with current src reproduces 2694440f….
  // All four non-model digests unchanged. See docs/research/data-audit/k19-resolution.md.
  // merged with k19 audit fixes: combined digest = union of the separately reviewed changes.
  model: '65183270b15bf5bf30c165e6b21e8b8c03f5ba585343ca370f962baf0979a41c',
  validation: '8f1bc0c8c6c951d68b0d926e6acbc30a7aeff235a18166e9df14f13b2fc85ac8',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
