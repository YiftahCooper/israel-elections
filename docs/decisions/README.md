# Decision records

Records 0001–0019 document source handling and major implemented choices. Records
0005–0019 are retrospective: code and history establish behaviour; unrecorded rationale
is labelled. Suggested alternatives are not evidence of a past design discussion.

| Record | Summary |
|---|---|
| [0001: Historical primary sources](0001-historical-primary-sources.md) | Retain distinct official evidence for results, candidates and agreements. |
| [0002: Secondary and missing data](0002-secondary-and-missing-data.md) | Separate unparsed evidence from missing facts and label secondary fallbacks. |
| [0003: Election-specific threshold eras](0003-threshold-eras.md) | Select 1.5%, 2% or 3.25% by the election’s statutory era. |
| [0004: Polling-station working copies](0004-polling-station-storage.md) | Keep reproducible historical polling inputs in scratch with retained provenance. |
| [0005: Exact rational arithmetic for seat decisions](0005-exact-rational-arithmetic.md) | Use bigint integers and rational pairs in the allocation engine. |
| [0006: Replayable actions and snapshot undo](0006-scenario-actions-and-snapshots.md) | Represent edits as plain-data actions applied by pure transitions. |
| [0007: Retained sources and a strict data build](0007-source-manifest-and-strict-build.md) | Retain raw sources and a provenance manifest with URLs, retrieval times and SHA-256 hashes. |
| [0008: Static browser app and local scenario storage](0008-static-app-and-local-storage.md) | Load datasets as static JSON and calculate scenarios in the browser. |
| [0009: Scenario sharing through URL fragments](0009-url-hash-share-links.md) | Encode election id, name, dataset build timestamp and action log as JSON, compress with deflate-raw and URL-safe Base64, and place the payload in #s=. |
| [0010: Hebrew and English with Hebrew as default](0010-hebrew-english-and-rtl.md) | Default to Hebrew. |
| [0011: Separate historical and experimental rule modes](0011-historical-and-experimental-rules.md) | Historical mode fixes the election-specific rules and rejects setRules actions. |
| [0012: Informal, editable blocs](0012-informal-editable-blocs.md) | Provide app-defined default blocs and allow bloc definitions and list assignments to change. |
| [0013: Three interface levels over one engine](0013-three-interface-levels.md) | Default to Simple: vote editing, candidates, What if, coalitions, walkthrough and sources. |
| [0014: Explicit sources for changed votes](0014-explicit-vote-balancing.md) | Use a shared vote-edit helper for numeric fields, sliders, percentages and quick tools. |
| [0015: Allocation tests and browser journeys](0015-layered-tests-and-ci.md) | Use Vitest for engine, model, vote-edit and analysis tests, including exact official 2022 seat reproduction and reported 2026 final-count seat reproduction. |
| [0016: Expose exactness limits in counterfactual analysis](0016-analysis-proof-status.md) | Rerun the full allocation for candidate changes. |
| [0017: Track list lineage across mergers and splits](0017-list-lineage-comparisons.md) | Keep originIds on lists and originListId on historical candidates. |
| [0018: Report exact ties and record lottery choices](0018-explicit-lottery-outcomes.md) | Detect ties with exact fractions, record tied units and warn lottery-required unless a valid choice is supplied. |
| [0019: Gate election selection on dataset availability](0019-election-availability-and-sessions.md) | Load public/data/elections.json, sort newest first and disable unavailable elections in the picker. |
