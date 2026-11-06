# Appearance and result identity — 6 November 2026

Appearance uses effective scenario values and the existing replayable action log. Colour and purely visual bloc display-name paths are excluded from marker comparisons. A/B shared markers are separate from A-only result comparisons, identity, summaries and chrome. Legacy same-order/same-ID setBlocs actions normalize to setBlocAppearance; membership-changing actions are analysis (B). Separate official per-election appearance preferences survive leaving that result. Factual resets retain palettes; Reset colours retains votes/rules/membership. Constituent party colour editors use the same layer. Family colours are generated from family identity, not user-editable.

A/B/C inventory (containers inherit the nested classifications below; immutable envelope fields are assigned C rather than counted as authored facts):

| Scope | A — result | B — analysis/view | C — appearance/envelope |
| --- | --- | --- | --- |
| Scenario | electionId, mode, rules, registered, invalid, lists, agreements, lotteryWinners | blocs, familyDefinition, partyBlocs, candidateBlocs, customGroupingName, blocSchemes, blocSchemeId, factionSplits, factionSplitBaseline, coalition | schema, version, id, name, description, identityColor, baseBuiltAt, log |
| List | id, originIds, letters, nameHe, shortHe, shortEn, votes, withdrawn, heldVotes, candidates, sponsorsHe, rosterUnavailable, rosterTruncated, parties | bloc | color, logo, synthetic, links |
| Bloc | — | id (custom membership/topology) | nameHe, nameEn, color, appDefined (immutable provenance) |
| Party | id, nameHe, nameEn (identity/roster) | — | color, logo, links |
| Candidate | all roster/order/identity/affiliation fields | — | bio, notes (immutable documentary data) |
| Rules / agreements | all fields | — | — |
| Family definition | vote scaling actions (votes/totals) | membership/links/policies frozen for grouping, historical familyView and mixed-list inspection | generated colour, display title |
| Store containers | datasets, elections, scenario, preview, reference, past, future, saved, sessions, scenarioDrafts (nested classification applies) | — | — |
| Store choices | — | familyView, electionId, markOfficial, compareWith, showComponentSeats, voteSource, preferences, preferenceFor | selectedListId, blocPanel, tool, lang, theme, level, customFeatures, hintDismissed, digits, layout, colorBy, toast, loadError, notice, settingsOpen, preferenceAsk |

The owner's 6 November 2026 rule supersedes the older §2: “It should only actually count as a new scenario and look like a different result from the official one if something tangible changes.” His colour example generalises to grouping membership: it changes analysis, not votes, seats or rules. The coordinator's binding follow-up makes custom bloc/party/candidate membership, topology and grouping names B; coalition membership is B too. They retain shared local markers in the panel, picker, bands and Compare and remain saved/shared/undoable. Grouping-only familyDefinition is B; a family scaling action's vote changes are A. Sourced grouping selection and faction display remain unmarked analysis views. Appearance is C. No analysis-only or appearance-only state changes official result identity or enters the factual summary.


Regression coverage: `tests/analysis-edits.test.ts`, `tests/view-only-actions.test.ts`, `tests/part-markers.test.ts` and their e2e counterparts, alongside the appearance regressions; run the normal build, unit suite and Playwright suite. The differential corpus preserves engine inputs and allocations; analysis classification, local markers and result identity are verified independently.
