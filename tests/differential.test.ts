// 7 Nov 2026: corrected ballot-letter IDs and retired colour validation change ID-bearing
// corpus outputs. All 708 lists retain identical votes/seats; datasets are recursively
// identical after simultaneous ID replacement and omitting buildInfo. Rules unchanged.
// k16 audit (6 Nov): only k16 dataset changes: two candidate spellings, first-government
// date, logo URL, withdrawn Moreshet Avot with its approved roster and official link,
// plus source hashes/timestamp. Zero-vote withdrawn list changes corpus allocation shape.
// Baseline datasets with current engine reproduce every previous digest exactly.
// k13 audit (6 Nov 2026): reviewed field diff changes three zero-seat list IDs/letters,
// official names, four candidate spellings, Cohen display punctuation, Tehiya source URL
// and build provenance. Numeric inputs/seats unchanged. HEAD k13 in scratch reproduces
// prior allocation/model digests; other 25 datasets and three other digests unchanged.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
// k12 audit (6 Nov): reviewed recursive diff changes only k12 letter/name labels,
// candidate display notes/names, two withheld logos, party link, blocs and status/source metadata.
// Every list/candidate ID, vote, seat, colour and agreement reference is unchanged; only model digest changes.
  // merged with k12 audit fixes: combined digest = union of the separately reviewed changes.
// k13 audit (6 Nov 2026): preserve opaque pre-correction list/candidate IDs;
// corrected ballot letters, names, typography, Tehiya source URL and build provenance
// affect model only. All numeric inputs/seats unchanged. The scratch baseline with
// pre-audit k13 reproduces 4faa7f17…; allocation and three other digests unchanged.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
// k15 stable-ID follow-up: restore opaque IDs 15-ט / 15-קף without changing letters.
// Recursive dataset diff is exactly those ID/reference reversions and builtAt; all
// other 25 datasets unchanged. HEAD k15 substitution reproduces all prior digests.
// k15 audit (6 Nov): only k15 changes: ballot-ID migrations, gazetted names,
// two withdrawn registration records, roster status, Gagula note, two withheld logos and provenance.
// Field diff recorded in k15-resolution.md. Restoring HEAD k15 at scenarioFromDataset
// reproduces all five old digests; src and the other 25 datasets are unchanged.
  // merged with k15 audit fixes: combined digest = union of the separately reviewed changes.
// k11 audit 6 Nov 2026: recursive field diff confirms only corrected ballot letters,
// list/candidate names, neutral identity colours, links, Sarid opposition override,
// asOf and build provenance change. All 25 other datasets, IDs, votes, seats and
// agreements are preserved. Only the model digest changes; no engine/src changes.
  // merged with k11 audit fixes: combined digest = union of the separately reviewed changes.
// k9 audit 6 Nov: 51 recursive dataset paths (identity/display, bios, supporter grouping,
// untranscribed-roster notes, status and provenance); all keys/votes/seats/agreements unchanged.
// Allocation/analysis change only because the candidate-cap warning now distinguishes documented
// 1977 procedure from counterfactual inference. No allocation logic changed; other 25 datasets equal HEAD.
  // merged with k9 audit fixes: combined digest = union of the separately reviewed changes.
// k14 audit (6 Nov): reviewed field diff changes only k14 names/links, roster status,
// eight membership notes, Namir note, logo URL, source hashes and withdrawn zero-vote זך.
// Other 25 datasets are byte-identical. Allocation changes with the extra withdrawn list;
// model carries the corrected labels/notes. Analysis, validation and rules unchanged.
  // merged with k14 audit fixes: combined digest = union of the separately reviewed changes.
// k6 audit: reviewed field diff changes only official list labels/letters, Don-Yihya,
// Rafi logo removal, source provenance and government notes. Stable IDs, votes,
// seats and engine output remain identical; only the model digest changes.
  // merged with k6 audit fixes: combined digest = union of the separately reviewed changes.
// k3 audit 6 Nov 2026: reviewed 24-path dataset diff corrects labels/letters, adds
// withdrawn יז and source metadata; existing IDs, votes/seats and agreements stay fixed.
// Restoring only baseline k3 reproduces all five previous digests; no src changed.
  // merged with k3 audit fixes: combined digest = union of the separately reviewed changes.
// k5 audit: reviewed 19-path diff changes only gazette identities, one name, Liberal notes/logo,
// new withdrawn שו roster/zero-seat entry and provenance. Stable IDs and all existing votes/seats
// stay fixed. Substituting merged HEAD k5 reproduces both old allocation/model digests exactly.
// Other datasets and engine/model source unchanged; other three digests unchanged.
  // merged with k5 audit fixes: combined digest = union of the separately reviewed changes.
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
// k21 audit (6 Nov): 60 reviewed dataset leaves: withdrawal flags, gazette corrections,
// resignation/source notes, CEC link labels and builtAt only. Replacing k21 at
// scenarioFromDataset with merged HEAD reproduces ALL five old digests exactly.
// Only allocation (cancelled lists excluded) and model (display fields) change.
// k18 audit: added the approved withdrawn zero-vote list; corrected names/notes,
// Meretz affiliation, formation-day blocs, and two unproved logo claims. Only k18
// dataset/localities change. Substituting HEAD k18 at scenarioFromDataset reproduces
// bf733b00… allocation and ffb2cc3a… model exactly; engine/model source is unchanged.
  // merged with k18 audit fixes: combined digest = union of the separately reviewed changes.
// k4 audit: only gazette names/letters, Ya’ari correction note, third (inactive) connection,
// grouping label/evidence, link titles and source/build provenance change (35-path field diff).
// All IDs/votes/seats unchanged. Substituting HEAD k4 at scenarioFromDataset reproduces
// prior allocation bf50217e… and model 4faa7f17… exactly; other three digests unchanged.
  // merged with k4 audit fixes: combined digest = union of the separately reviewed changes.
const EXPECTED: Record<Family, string> = {
  // Allocation and analysis re-recorded 2026-11-04 for one reviewed engine fix: under a pure divisor method (no quota
  // stage, so no initial seats) the 1949 initial-seat conditions no longer apply. Before, those cases allocated 0 seats
  // or deactivated every surplus agreement; 298 allocation and 19 analysis cases differ, all of that kind. The old
  // engine on the same tree reproduces 8260bc46… and af4237ef…; model, validation and rules digests are unchanged.
  // merged with the k24 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k20 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k21 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k18 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k16 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k15 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k9 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k14 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k3 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k4 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k5 audit fixes: combined digest = union of the separately reviewed changes.
  allocation: '2bc949a3aaf91af20af8f4704c06b30fcfacf7d534d82c2bdc578d41023bf1a8',
  analysis: 'e1e556de2f73c7ee52dbd64238835a04c50597e216baa6fdb9d2075b1be56f55',
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
  // merged with k21 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k18 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k16 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k12 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k13 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k15 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k11 audit fixes: combined digest = union of the separately reviewed changes.
  // k10 audit (6 Nov): reviewed recursive field diff contains only ten printed letters,
  // three list labels/three link titles, Abu Hatzeira spelling, withheld Telem logo,
  // Unity source URL and build provenance. All IDs/votes/seats and 25 other datasets equal HEAD.
  // Only model output changes; the four engine/validation/rules digests stay unchanged.
  // merged with k10 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k9 audit fixes: combined digest = union of the separately reviewed changes.
  // k17 audit (6 Nov): field walk of every public election dataset confirms only k17 changes:
  // five gazette names, three list names, election-period constituent label, three platform links
  // and buildInfo source hashes/timestamp. Numeric inputs and all four other digests are unchanged.
  // merged with k17 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k14 audit fixes: combined digest = union of the separately reviewed changes.
  // k7 audit: only Tamir nameEn whitespace, Reshimat Shalom sourceId and builtAt differ.
  // Restoring HEAD k7 at scenarioFromDataset reproduces 4faa7f17… exactly; numeric inputs unchanged.
  // merged with k7 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k6 audit fixes: combined digest = union of the separately reviewed changes.
  // k8 audit 6 Nov: recursive field diff limits dataset changes to מס names/link title,
  // Shechterman display name/note, affiliated-list scheme title, unresolved logo removal,
  // and build metadata. Every other election and all engine/model source are unchanged.
  // merged with k8 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k3 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k4 audit fixes: combined digest = union of the separately reviewed changes.
  // merged with k5 audit fixes: combined digest = union of the separately reviewed changes.
  // k2 audit: corrected displayed letters/names, 50 losing-list candidates, status and provenance only.
  // Stable IDs, votes, seats and agreements unchanged; substituting HEAD k2 reproduces all five old digests.
  // merged with k2 audit fixes: combined digest = union of the separately reviewed changes.
  // k1 audit: only eight gazette names, two exclusion-note names, support grouping,
  // affiliated-list scheme title and build provenance differ. IDs/votes/seats/agreements unchanged.
  // Substituting HEAD k1 in memory reproduces 7f24609e…; four non-model digests unchanged.
  // merged with k1 audit fixes: combined digest = union of the separately reviewed changes.
  // U8: concise k24/k25 grouping names, appDefined provenance and regenerated k25 builtAt.
  // Substituting pre-U8 k24/k25 datasets reproduces 7a7c40fc… exactly; other four digests unchanged.
  // U9: baseline comparison isolates 98 model cases to normalized appearance logs and
  // palette-preserving resets; allocation, analysis, validation and rules remain identical.
  // D2 (7 Nov): k15 candidate note now quotes the actual surname-first form.
  // Recursive diff: that note/builtAt only in k15; k20/k24 status and provenance only.
  // Substituting HEAD k15/k20/k24 with current code reproduces 39258ca0… exactly;
  // allocation, analysis, validation and rules digests remain unchanged.
  // Main integration: retained V1c list/bloc display colours only; frozen 4edfdf0
  // reproduces 43ebe1df…; all changed model-case paths end in color.
  // C1 (7 Nov): k13 first-government grouping gains its researched outside-support group; list colours
  // unchanged (a support group never recolours a list). Substituting main's k13 reproduces 33a3eb0c… exactly.
  // 8 Nov evidence fixes: k26 Yisrael Beytenu #8–20 bio.party url/archivedAt (Wayback captures), the 6559 leaflet
  // link moved from 13-ג to 12-עץ, and those three builtAt values (recursive field diff). Substituting HEAD's
  // k12/k13/k26 reproduces 6aed7fa1… and all five digests; the other four are unchanged.
  // 9 Nov builders reproduce committed data: link titles (k15 two stale names; k22–k25 CEC results web pages), the
  // k12 Derekh Eretz results link, k24 New Economic link (not the 2026 joint list), k9 hewiki title, two new k16/k18
  // bios. Substituting HEAD's k9/k12/k15/k16/k18/k22–k25 reproduces c850387b…; the other four are unchanged.
  // MQ (9 Nov): 14 reviewed identity links and 21 gazette-transcribed candidates only.
  // Votes, seats, agreements, rules and the other four differential digests are unchanged.
  // P2 (9 Nov): k26 gazetted (YP 15100): status note/asOf, officialSeatsSourceId and one more source id only.
  // Substituting HEAD's k26 reproduces 26acbc3b… exactly; the other four digests are unchanged.
  // 12 Nov logos: all 26 datasets match HEAD outside logo/builtAt; only this digest changes.
  // DG26: official YP 15023 roster provenance and Beit Yemini's printed name only.
  // Wider print-logo collection (LG2): logos only; all 26 datasets match outside logo/builtAt.
  // All together (merges of 12 Nov): digest recomputed on the merged data; each change reproduced its own digest before the merge.
  // Audit 12 Nov: k22 list כי, one misprinted word of its name corrected (אלחודה → אלוחדה, k22-corrections.json), with its
  // link title. Votes, seats, ids and the other 25 datasets unchanged; only this digest changes.
  // Audit 12 Nov (ax-build-guesses-03): 21 k25/k26 candidate bios gain memberConfirmed (official Knesset identity beside a
  // probable Hebrew Wikipedia link); recursive diff shows only those fields and builtAt. The other four digests are unchanged.
  // fx-scen (12 Nov): refusal wording only. Every engine refusal became plain English with a Hebrew form, and the corpus
  // folds each refused action's message into this digest. 123 of 520 model cases differ, each only in that text (case by
  // case against HEAD's src); engine inputs, seats and validation are identical and the other four digests unchanged.
  // fx-names (12 Nov): k9 Likud ranks 21 and 24 (both printed כהן יגאל) lose their English names, as which rank is which
  // person is not certain; recursive diff of k9 shows only those two nameEn fields and builtAt. Other digests unchanged.
  model: '1ebb9fe1ada719535686c14a6e009d64d8e8a93c6dd83ef68e84400fdd8062ed',
  validation: 'bcf6fe5f3902db11a1017a25e5d7ad881b11d7df0123ee2e2feebdc37b03536b',
  rules: 'bbfef9576f2d5a01b4368b3ab969163cc0a320a39c539e08ee6cb9af64d7843c',
};

const m: Modules = { allocate, minimalChange, sweepVotes, sweepThreshold, goals, applyAction, scenarioFromDataset, toEngineInput,
  validateScenario, historicalRules, electionRuleSetId, toRuleSet, ruleDepartures, RULESETS };

describe('engine and model outputs are identical to the recorded reference', () => {
  const run = families(m);
  for (const fam of FAMILIES) it(fam, () => expect(run[fam]().digest).toBe(EXPECTED[fam]), 30_000);
});
