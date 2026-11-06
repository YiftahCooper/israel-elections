# Joint-list opening-faction name matching

Reviewed 2026-11-06. Scope: all 26 elections, all 108 joint lists. Binding method: [BRIEF.md](BRIEF.md) and [source hierarchy](../source-hierarchy.md). Baseline: `cf9935e` (fast-forwarded from origin/main).

## Decision and proof status

The previous matcher removed a limited punctuation set and required identical full names. It ignored the explicit OData `knessetPersonId` retained in `data/meta/bios/kN.json`. Candidate `bio.knesset` URLs use website SiteId, a different namespace; they are never interpreted as PersonID. See [biography format](../../../data/meta/bios/README.md).

Matching now uses (1) an existing high-confidence biography OData ID, (2) unique normalized exact family-first full name, then (3) candidate-scoped, reviewed full-name aliases in `data/meta/joint-facts-name-aliases.json`, each with source and note. Normalization strips Hebrew marks, punctuation/geresh/quotes, turns hyphens into spaces and collapses whitespace; it preserves word boundaries and never drops or guesses middle names. No fuzzy matching is used. Ambiguous names/aliases stay unknown. An attached ID absent from the snapshot is reported rather than reassigned to somebody else. Medium-confidence biography identities are not promoted; exact names or reviewed aliases are required instead.

Opening-day member positions and exactly one active faction remain mandatory. Every unresolved counted candidate is retained in generated `unresolved` diagnostics with candidate ID, printed name, matched PersonID (if any), and reason. The aliases are fallback evidence; the current high-confidence IDs already resolve these examples.

## Before / after by election and list

`unknownFaction` is summed across constituent parties. Lists with no elected seats are included. `unknownElected` (missing constituent-party attribution) is separate and unchanged. Elections with no joint lists have no rows.

| Election | List letters | Before | After |
|---|---|---:|---:|
| k1 | ב | 9 | 0 |
| k1 | נ | 1 | 0 |
| k3 | ב | 5 | 0 |
| k3 | גד | 3 | 0 |
| k4 | גד | 1 | 0 |
| k6 | את | 4 | 0 |
| k6 | חל | 4 | 0 |
| k7 | אמת | 6 | 0 |
| k7 | חל | 6 | 0 |
| k8 | חל טעם | 11 | 0 |
| k8 | אמת | 7 | 0 |
| k8 | גד | 0 | 0 |
| k8 | קנ | 0 | 0 |
| k9 | מחל | 6 | 2 |
| k9 | אמת | 3 | 0 |
| k9 | ו | 1 | 0 |
| k9 | ש | 1 | 0 |
| k10 | מחל | 2 | 0 |
| k10 | אמת | 4 | 0 |
| k10 | ו | 1 | 0 |
| k11 | מחל | 2 | 0 |
| k11 | אמת | 5 | 0 |
| k11 | ו | 1 | 0 |
| k11 | ת | 0 | 0 |
| k11 | עי | 0 | 0 |
| k12 | ג | 0 | 0 |
| k12 | ו | 1 | 0 |
| k12 | הן | 1 | 0 |
| k13 | מרצ | 4 | 0 |
| k13 | ג | 1 | 0 |
| k14 | מחל | 1 | 0 |
| k14 | מרצ | 3 | 0 |
| k14 | ו | 0 | 0 |
| k14 | ג | 0 | 0 |
| k14 | ע | 3 | 0 |
| k15 | אמת | 2 | 0 |
| k15 | ג | 1 | 0 |
| k15 | עם | 1 | 0 |
| k15 | ט | 0 | 0 |
| k15 | ד | 0 | 0 |
| k16 | אמת | 2 | 0 |
| k16 | ל | 1 | 0 |
| k16 | מרצ | 1 | 0 |
| k16 | ג | 1 | 0 |
| k16 | ו | 0 | 0 |
| k16 | עם | 0 | 0 |
| k17 | אמת | 6 | 0 |
| k17 | טב | 3 | 0 |
| k17 | ג | 2 | 0 |
| k17 | עם | 1 | 0 |
| k18 | מחל | 12 | 0 |
| k18 | ג | 2 | 0 |
| k18 | עם | 1 | 0 |
| k18 | ט | 2 | 0 |
| k18 | מרצ | 0 | 0 |
| k18 | ה | 0 | 0 |
| k19 | מחל | 7 | 0 |
| k19 | טב | 6 | 0 |
| k19 | ג | 1 | 0 |
| k19 | עם | 0 | 0 |
| k20 | אמת | 13 | 0 |
| k20 | ודעם | 2 | 0 |
| k20 | טב | 5 | 0 |
| k20 | ג | 3 | 0 |
| k20 | קץ | 0 | 0 |
| k20 | ע | 0 | 0 |
| k21 | מחל | 11 | 0 |
| k21 | פה | 12 | 0 |
| k21 | ג | 5 | 0 |
| k21 | ום | 1 | 0 |
| k21 | טב | 2 | 0 |
| k21 | דעם | 0 | 0 |
| k21 | ז | 0 | 0 |
| k21 | קף | 0 | 0 |
| k22 | פה | 10 | 0 |
| k22 | מחל | 11 | 0 |
| k22 | ודעם | 1 | 0 |
| k22 | ג | 4 | 0 |
| k22 | טב | 2 | 0 |
| k22 | אמת | 5 | 0 |
| k22 | מרצ | 0 | 0 |
| k23 | מחל | 13 | 0 |
| k23 | פה | 10 | 1 |
| k23 | ודעם | 1 | 0 |
| k23 | ג | 4 | 0 |
| k23 | אמת | 3 | 0 |
| k23 | טב | 2 | 0 |
| k24 | מחל | 11 | 0 |
| k24 | ג | 4 | 0 |
| k24 | ט | 3 | 0 |
| k24 | ודעם | 1 | 0 |
| k24 | ת | 1 | 0 |
| k25 | ט | 4 | 0 |
| k25 | ג | 5 | 0 |
| k25 | כן | 5 | 0 |
| k25 | ום | 0 | 0 |
| k25 | ב | 0 | 0 |
| k26 | מחל | 27 | 27 |
| k26 | ב | 7 | 7 |
| k26 | ג | 7 | 7 |
| k26 | ט | 6 | 6 |
| k26 | דרך | 21 | 21 |
| k26 | אמת | 8 | 8 |
| k26 | רק | 12 | 12 |
| k26 | ודם | 11 | 11 |
| k26 | די | 0 | 0 |
| k26 | ני | 0 | 0 |
| k26 | בי | 0 | 0 |
| **Total** | | **402** | **102** |

302 assignments resolved in 75 lists. Historical k1–k25: **303 → 3**. Pending k26: **99 → 99**. The checked-in baseline contains four unknowns for k25 ט (rather than the three in the task report); the table reports the actual generated baseline. In k25, ט **4 → 0**, ג **5 → 0**, כן **5 → 0**.

## Residuals and boundaries

- **k9 מחל, candidates 9-מחל#21 and #24, both כהן יגאל: 2.** No biography OData ID is attached to either. The snapshot contains PersonID 2394 כהן יגאל and PersonID 2399 כהן-אורגד יגאל. Both printed names otherwise resolve to 2394. The matcher now rejects the duplicate elected-person identity rather than counting one member twice. No rank-to-person alias was invented. The k9 fixer must establish the rank-specific identities from official roster evidence. This withholds two previously asserted assignments; it is a separate ambiguity from the 302 newly resolved cases.

- **k23 פה, candidate 23-פה#13, גרמן יעל (Yael German): 1.** Attached PersonID 23596 is absent from the k23 membership snapshot. Existing `data/raw/bios/identity-decisions.reviewed.json` records that Idan Roll replaced her before opening (decision 0088 item 4). Her biography must continue to identify German, not Roll. Correcting the per-election elected/replacement roster belongs to the k23 fixer; this lane conservatively leaves the discrepancy visible rather than inventing a faction assignment.
- **k26: 99**, distributed by list in the table above. The retained membership snapshot has no opening-day positions; the first sitting is pending. Name resolution alone cannot establish opening membership or faction. All remain unknown, including those with known identities. Full candidate-level reasons are retained in `data/meta/joint-facts.json` under `unresolved`.
- The k9 duplicate-candidate identities are the only historical name ambiguity remaining. No owner decision is needed for this matcher.

## Rank-1 sample verification

These are direct inspections of retained official Knesset OData responses (`data/raw/k23/knesset-odata-members.json` and `data/raw/k25/knesset-odata-members.json`, retrieved 2026-11-04). For each sample, the person spelling, opening MK position, active faction interval and faction were checked independently of the generated joint facts. Provenance: rank 1 official record; verification status: confirmed against retained response, not a claim of live page retrieval. The web tool could not load the endpoint. Direct live HTTPS requests subsequently succeeded (HTTP 200, 2026-11-06) with the required project User-Agent and sequential requests at least 1.1 seconds apart: `KNS_Person(30836)` returned איזנקוט גדי; the k25 faction query returned PersonToPositionID 30257, PersonID 30836, FactionID 1098, המחנה הממלכתי, StartDate 2022-11-15 and FinishDate 2025-07-04; `KNS_Person(4395)` returned דיכטר אבי. These live responses agree with the retained rank-1 records. No challenge circumvention was attempted.

| Candidate notice name | OData PersonID / spelling | Opening date | Active opening faction | Official query |
|---|---|---|---|---|
| 23-מחל#11: דיכטר אברהם משה | 4395: דיכטר אבי | 2020-03-16 | הליכוד (942); 2020-03-16–2021-04-06 | [Person](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Person(4395)) / [faction records](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=PersonID%20eq%204395%20and%20KnessetNum%20eq%2023%20and%20PositionID%20eq%2054&$format=json) |
| 25-כן#3: איזנקוט גד | 30836: איזנקוט גדי | 2022-11-15 | המחנה הממלכתי (1098); 2022-11-15–2025-07-04 | [Person](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Person(30836)) / [faction records](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=PersonID%20eq%2030836%20and%20KnessetNum%20eq%2025%20and%20PositionID%20eq%2054&$format=json) |
| 25-ט#11: מעוז אביגדור | 30814: מעוז אבי | 2022-11-15 | הציונות הדתית (1097); 2022-11-15–2022-11-20 | [Person](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Person(30814)) / [faction records](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=PersonID%20eq%2030814%20and%20KnessetNum%20eq%2025%20and%20PositionID%20eq%2054&$format=json) |
| 25-ג#4: מקלב ישראל מאיר אורי | 11835: מקלב אורי | 2022-11-15 | יהדות התורה (1101); 2022-11-15–2023-01-25 | [Person](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Person(11835)) / [faction records](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=PersonID%20eq%2011835%20and%20KnessetNum%20eq%2025%20and%20PositionID%20eq%2054&$format=json) |

Avi Maoz is deliberately assigned to the opening faction הציונות הדתית, not the later נעם faction starting 2022-11-20. This checks temporal correctness as well as identity.

## Reproduction and validation

Regenerate with `node scripts/joint-facts.ts`, then `node scripts/build-datasets.ts`. Inputs are the committed public datasets, biography identity metadata, reviewed alias JSON, and retained official membership/faction snapshots; no network or fuzzy matcher is needed. Runtime: Node v24.18.0. Temporary dependency copies and diagnostic output belong in `.backup-scratch/`.

Field diff against the baseline confirms that only `parties[].factions`, `parties[].unknownFaction`, and the added `unresolved` diagnostics changed. All other list and constituent-party fields are identical; except the two newly withheld k9 duplicate-person assignments, old faction counts never decrease; known faction seats plus unknowns equal each party’s elected count. The dataset build wrote **0 files (38 unchanged)**, so public datasets, family hashes and differential digest remain unchanged. Hash refresh checked all family rows and required zero edits.

Final validation:

- `node scripts/build-datasets.ts`: passed; 0 files written, 38 unchanged. Scratch-only full polling reconciliation is explicitly skipped where retained durable evidence is used by the existing build.
- Family SHA-256 refresh: all current, zero changes; `node scripts/validate-families.ts`: 9 presets across k1–k26 passed.
- `python3 scripts/validate-party-logos.py`: passed, 26 overlays / 184 source records / 135 assets (existing unresolved logo statuses unchanged).
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: final full run executed 93 files / 889 tests: 885 passed, four hit the existing five-second timeout (demographic-turnout, family-runtime, historical-k1-k7-release, historical-k16). Rerunning those four files unchanged with `--testTimeout=120000` passed all 81 tests in 5.11 seconds. Thus every test passed across the full run and targeted rerun. The full run includes all 10 joint-facts tests and the unchanged differential digests. An earlier restricted-sandbox run also encountered `spawnSync EPERM`; the full unrestricted run cleared that error.
- Final allowed-field diff, all 108 before/after table rows, party seat reconciliation and `git diff --check`: passed. Public data and differential tests required no edits. No Playwright, push or integration merge was performed.
