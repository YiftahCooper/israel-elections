# U7 — View choices and factual scenario edits (6 November 2026)

The official result remains neutral when its display changes. A sourced grouping is another view of the same dataset. Membership edits and custom groupings remain hypothetical, even when seats do not change.

## Action classification

Every member of the `Action` union is covered by `ACTION_CLASSIFICATION`, checked by TypeScript and by a unit test which independently enumerates the union from its source.

| Classification | Action types |
| --- | --- |
| View only | `applyBlocScheme`, `setFactionSplit`, `setCoalition` |
| Author metadata; no factual marker or tint | `setIdentityColor`, `rename`, `setDescription` |
| Facts / calculation | `setVotes`, `transfer`, `addVoters`, `redistribute`, `scaleAll`, `setTurnout`, `setTotals` |
| List structure, identity and candidates | `merge`, `split`, `addList`, `removeList`, `setWithdrawn`, `setListMeta`, `candidates`, `resetList`, `resetVotes`, `resetCandidates` |
| Rules and agreements | `setAgreement`, `removeAgreement`, `setRules`, `setMode`, `setLottery` |
| Custom grouping / membership | `setBlocs`, `setPartyBloc`, `familyOperation` (both custom grouping and vote scaling) |
| Payload dependent restoration | `restore`: blocs selects the sourced default view; agreements, totals and lottery restore factual inputs. |
| Payload dependent | `startPart`: coalition inspection and sourced bloc presets/official/sourced snapshots are view choices; other replacements edit facts. |

Author metadata remains part of save-checkpoint comparison, so naming or describing an official snapshot remains saveable. A named snapshot can have its own saved/draft identity while its election facts stay official and neutral. It does not make a view-only result hypothetical. Existing no-op filtering remains in place.

Other state was already separate from scenario actions: colour-by, chamber layout, digits, tabs/tools, selected list, compare target, language/theme/level, component-seat colours, historical family lens and mixed-family display policy. These retain their existing persistence behaviour. Family **grouping/scaling actions** explicitly create custom inputs and remain edits.

## Root cause and generalisation

- `scenarioKey`, ChangeSummary, History, Scenarios and ScenarioSwitcher counted raw log entries. They now classify factual actions separately from display and author metadata.
- `inputDiffs` treated choosing another sourced scheme, coalition inspection and faction counting as changed inputs. Sourced schemes now compare with the same sourced scheme; custom membership still compares against the last sourced choice. This also fixes EditMarker, exports and non-seat change summaries. Chamber export captions use the same action classification.
- App chrome formerly tinted any loaded reference or explicit identity colour. Tint now requires factual differences from the official baseline. Saved view-only identities also get neutral swatches and an official reference label. Publication eligibility is unchanged, preserving sharing of authored snapshots.
- Save checkpoint comparison excludes view actions and timestamps, while checking factual differences. Choosing a sourced grouping after custom membership still registers that the custom membership was removed.
- Migration is semantic and non-destructive: old saves, workspace logs and shared links replay unchanged. Their view steps and assigned identity colours no longer imply hypothetical facts. No schema bump, deletion, rewriting of saved content or loss of undo/share state is needed.

`setFactionSplit` only changes seat-holder presentation; `toEngineInput` is identical before and after. Moving a party uses `setPartyBloc` or a list's bloc patch, detaches the sourced scheme, and remains marked.

## Verification

Type-check and production build pass. All 892 unit tests pass (94 files; `--maxWorkers=2 --testTimeout=20000` accommodates historical source parsing on the shared machine). All 33 affected browser tests pass (grouping, factions, save state, switching, references and sharing), as do all 36 visual-matrix cases. The full e2e run was stopped/skipped on coordinator instruction because parallel lanes overloaded the host; integration will run the full suite serially. The targeted browser runner preserves the standard configuration except shared-host allowances: 30-second assertions, 180-second test/server limits and direct Vite startup. Browser evidence is in `.backup-scratch/u7/`, generated on port 5487. The retained regression covers official → PM recommendations → neutral/no markers/no changes → shared link → membership move → tint/marker. The scratch visual matrix covers k26/k25/k1, Hebrew/English, light/dark, widths 1500/1024/390.

No data, allocation rules or deployment were changed. Save semantics beyond excluding view-only choices remain in lane U4; marker styling remains in lane U5.

## U4 integration

Dirty status resolves the saved entry by id and replays that checkpoint before comparison, falling back to the loaded reference. It compares effective factual inputs with `inputDiffs` and current author metadata, rather than raw or filtered action history, so restoring a value becomes clean again. View steps remain in the persisted log. Saved named views retain their saved identity and neutral factual styling; grouping changes do not add the U4 unsaved star.

Integration checks: TypeScript and the production app build pass; 918 unit tests pass in 97 files. Targeted browser coverage uses the nine U4/U7-touched spec files on port 5489 with one worker: 72 passed, with only the two baseline header assertions failing. The existing `top-overview-qa2` header-slot width assertions at 1024 and 1500 also fail on unmerged `ff3733d` (expected >200px; U5 defines a 190px slot); those assertions and header styles are preserved for coordinator follow-up. The combined regression verifies official/no-star → saved view/no-star after grouping → vote edit/star. No dataset build or full e2e suite was run.
