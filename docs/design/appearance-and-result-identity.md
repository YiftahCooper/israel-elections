# Appearance and result identity — 6 November 2026

Appearance uses effective scenario values and the existing replayable action log. Colour and bloc display-name paths are excluded from inputDiffs, hence shared markers, summaries, exports and chrome. Legacy same-order/same-ID setBlocs actions normalize to setBlocAppearance; membership-changing actions remain factual. Separate official per-election appearance preferences survive leaving that result. Factual resets retain palettes; Reset colours retains votes/rules/membership. Constituent party colour editors use the same layer. Family colours are generated from family identity, not user-editable.

A/B/C inventory (containers inherit the nested classifications below; immutable envelope fields are assigned C rather than counted as authored facts):

| Scope | A — result | B — analysis/view | C — appearance/envelope |
| --- | --- | --- | --- |
| Scenario | electionId, mode, rules, registered, invalid, lists, agreements, lotteryWinners, blocs, familyDefinition, partyBlocs, candidateBlocs | blocSchemes, blocSchemeId, factionSplits, factionSplitBaseline, coalition | schema, version, id, name, description, identityColor, baseBuiltAt, log, customGroupingName |
| List | id, originIds, letters, nameHe, shortHe, shortEn, bloc, votes, withdrawn, heldVotes, candidates, sponsorsHe, rosterUnavailable, rosterTruncated, parties | — | color, logo, synthetic, links |
| Bloc | id (custom membership/topology) | — | nameHe, nameEn, color, appDefined (immutable provenance) |
| Party | id, nameHe, nameEn (identity/roster) | — | color, logo, links |
| Candidate | all roster/order/identity/affiliation fields | — | bio, notes (immutable documentary data) |
| Rules / agreements | all fields | — | — |
| Family definition | membership/links/policies frozen by grouping/scaling | historical familyView and mixed-list inspection | generated colour, display title |
| Store containers | datasets, elections, scenario, preview, reference, past, future, saved, sessions, scenarioDrafts (nested classification applies) | — | — |
| Store choices | — | familyView, electionId, markOfficial, compareWith, showComponentSeats, voteSource, preferences, preferenceFor | selectedListId, blocPanel, tool, lang, theme, level, customFeatures, hintDismissed, digits, layout, colorBy, toast, loadError, notice, settingsOpen, preferenceAsk |

Custom bloc/party/candidate membership deliberately stays A: docs/design/scenario-reference-and-custom-level.md section 2 and existing U7 tests explicitly require it. Coalition inspection stays B under U7. No owner question.


Regression coverage: `tests/appearance.test.ts` and `tests/e2e/appearance.spec.ts`; run the normal build, unit suite and Playwright suite. The differential corpus preserves engine inputs and allocations; only appearance log normalization and grouping bookkeeping change.
