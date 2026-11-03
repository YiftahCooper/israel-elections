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
| [0020: K22 national electorate](0020-k22-national-electorate.md) | Keep the CEC national electorate (6,394,030) and disclose the 2,812-voter gap to the locality files. |
| [0021: K22–K24 gazettes and reconciliation](0021-k22-k24-gazettes-and-reconciliation.md) | Gazetted rosters, complete official agreement notices and portable locality digests for 2019b–2021. |
| [0030: K20–K21 release evidence](0030-k20-k21-release-evidence.md) | Official rosters, agreements and reproducible verification for 2015 and April 2019. |
| [0040: K18 sources and derived localities](0040-k18-verified-sources-and-derived-localities.md) | 2009: official sources; localities derived from polling stations; invalid votes follow the CEC memorandum (the gazette repeats 2006's 49,684). |
| [0041: K19 national discrepancies](0041-k19-national-discrepancies-release-held.md) | 2013: evidence on the gazette/CEC final differences (release hold superseded by 0042). |
| [0042: K19 release with disclosed differences](0042-k19-release-with-disclosed-gazette-differences.md) | Release 2013 on the CEC final figures: both versions give exactly the same seats. |
| [0050: K16–K17 progress without release](0050-k16-k17-verified-progress-without-release.md) | Keep 2003 and 2006 unavailable until rosters and documented discrepancies are resolved. |
| [0051: K16–K17 allocation rules](0051-k16-k17-historical-allocation-evidence.md) | Check the 2003 and 2006 rules without trusting the archive folder's date. |

Records 0020–0059 are grouped by election era; numbers in between are left free for that era.
| [0087: Constituent parties, blocs and colours](0087-constituent-parties-blocs-and-colours.md) | Parties inside joint lists travel with their candidates; per-seat bloc membership; sourced per-election bloc schemes and colours. |
