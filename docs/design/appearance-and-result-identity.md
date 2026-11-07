# Appearance and result identity — 6 November 2026, revised 7 November 2026

Appearance uses effective scenario values and the existing replayable action log. Only colour paths are excluded from comparisons. A and B are both counted changes with the same markers, identity, History and chrome; B adds the note “Votes and seats unchanged” where the change summary appears. A setBlocs that keeps every bloc's id, order and names (a recolour) normalises to setBlocAppearance (colour only); renaming, adding or removing a bloc stays setBlocs, a change. Separate official per-election appearance preferences survive leaving that result. Factual resets retain palettes; Reset colours retains votes/rules/membership. Constituent party colour editors use the same layer. Family colours are generated from family identity, not user-editable.

A/B/C inventory (containers inherit the nested classifications below; immutable envelope fields are assigned C rather than counted as authored facts):

| Scope | A — result | B — grouping/coalition (counted) or view | C — appearance/envelope |
| --- | --- | --- | --- |
| Scenario | electionId, mode, rules, registered, invalid, lists, agreements, lotteryWinners | blocs, familyDefinition, partyBlocs, candidateBlocs, customGroupingName, blocSchemes, blocSchemeId, factionSplits, factionSplitBaseline, coalition | schema, version, id, name, description, identityColor, baseBuiltAt, log |
| List | id, originIds, letters, nameHe, shortHe, shortEn, votes, withdrawn, heldVotes, candidates, sponsorsHe, rosterUnavailable, rosterTruncated, parties | bloc | color, logo, synthetic, links |
| Bloc | — | id (custom membership/topology), nameHe, nameEn | color, appDefined (immutable provenance) |
| Party | id, nameHe, nameEn (identity/roster) | — | color, logo, links |
| Candidate | all roster/order/identity/affiliation fields | — | bio, notes (immutable documentary data) |
| Rules / agreements | all fields | — | — |
| Family definition | vote scaling actions (votes/totals) | membership/links/policies frozen for grouping, historical familyView and mixed-list inspection | generated colour, display title |
| Store containers | datasets, elections, scenario, preview, reference, past, future, saved, sessions, scenarioDrafts (nested classification applies) | — | — |
| Store choices | — | familyView, electionId, markOfficial, compareWith, showComponentSeats, voteSource, preferences, preferenceFor | selectedListId, blocPanel, tool, lang, theme, level, customFeatures, hintDismissed, digits, layout, colorBy, toast, loadError, notice, settingsOpen, preferenceAsk |

Owner decision, 7 November 2026, supersedes the 6 November “analysis” class: bloc membership is a scenario change; only appearance is exempt. B fields (bloc topology, list/party/candidate membership, bloc and grouping names, family grouping definitions, coalition roles) are counted, listed in History, marked and tinted like A; they leave votes and seats unchanged, which the summaries say. Store choices in column B (sourced grouping selection, faction counting, comparison settings) remain views and are not counted. Appearance (C) never counts.


Regression coverage: `tests/analysis-edits.test.ts`, `tests/view-only-actions.test.ts`, `tests/part-markers.test.ts`, `tests/coalition-roles.test.ts`, `tests/e2e/change-class.spec.ts` and the appearance regressions; run the normal build, unit suite and Playwright suite.
