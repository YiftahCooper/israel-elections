# k22 reconciliation — 17 September 2019

Fixer: Codex; accessed 6 November 2026. Both independent reports merged after
the fast-forward check against origin/main. Source hierarchy is binding.

Counts after deduplication: **16 finding groups fixed/documented; 0 rejected
groups; 0 owner questions; 5 retained verification limitations.**
Counts are groups, not independently verified scalar facts.

## Independently rechecked evidence

- G, rank 1: [YP 8454, 25 September 2019](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/OZqqMinV~LFxfTj7LC7UkojANzy747BQrZqHtwBxR30=).
  Retained as data/raw/k22/results-gazette.pdf with manifest hash.
  §1: “סך כל הקולות הכשרים 4,436,806”; §2: “מספר הקולות שנמצאו פסולים: 126,704.”
  Vote table has 29 lists, omitting זן/כ/נץ. Elected-name table prints
  “תמנו פנינה (פנחש)”.
- C, rank 1: retained [YP 8420 candidate gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8420.pdf).
  Re-extracted with repository pdfjs. Democratic Union submitting parties:
  “מרצ; מפלגת התנועה הירוקה … מפלגת העצמאות”; elected party columns
  give Meretz 3, Green Movement 1, Independence 1.
- R, rank 1: retained [CEC final results](https://votes22.bechirot.gov.il/nationalresults)
  and locality/reconciliation inputs: valid 4,436,806; invalid 28,362;
  cast 4,465,168. Nine seat-winning lists sum to 4,310,102.
- Z, rank 4: [N12, 1 September](https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-9293fde87fdec61027.htm):
  “מתפקדי מפלגת זהות אישרו … את פרישת המפלגה”.
- N, rank 4: [Walla, 15 September](https://elections.walla.co.il/item/3312758):
  “נעם הודיעה על פרישה”.
- K, contemporary Israeli news (rank 4, corroborated by G):
  [Kipa, 16 September, 22:19](https://www.kipa.co.il/חדשות/מבזקים/946964-פחות-מפלגה-שרצה-מפלגת-כל-ישראל-אחים-לשוויון-חברתי-פרשה/):
  “מפלגת כל ישראל אחים לשוויון חברתי התפטרה היום, 16.9.19.”
  Actual article opened; this goes beyond the Codex auditor's inaccessible index lead.
- P, rank 4: [N12, 23 September](https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-4618f0558ac5d61027.htm):
  “55 המליצו על נתניהו, 54 על גנץ - 11 לא המליצו על אף מועמד”.
  Also reproduces Rivlin's explanation excluding three Balad MKs.
- T, rank 4: [Times of Israel, 23 September](https://www.timesofisrael.com/joint-list-tells-president-only-10-of-its-13-members-are-backing-gantz-for-pm/):
  Tibi's letter: “the recommendation is in the name of ten MKs and not 13”.
- I, rank 3: [IDI, Political Parties in Israel 1992–2021](https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf),
  printed p.534 / PDF p.536: “המפלגה החדשה (עם השם הישן)”.
  Paragraph explicitly dates new-party registration to December 2018.
- J, asset metadata: [Joint List Commons file](https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg):
  August 2019 date and 30 August initial upload, but no official party origin.
  No English Wikipedia article was opened or used.
- B, asset metadata: [Balad Commons file](https://commons.wikimedia.org/wiki/File:Balad.svg):
  4 August 2019, explicit 2019 party-image source. Supports existing limited
  attribution, not independent verification of a campaign-page capture.

## Decisions and files

O = Opus row; F = Codex ID. All paths below refer to inputs; generated datasets
were rebuilt, never hand-edited.

| Finding | Decision / evidence | Files changed |
|---|---|---|
| O1 | Keep 28,362; disclose G's invalid-vote misprint. R reconciles valid + invalid = cast; 126,704 = valid minus votes for seat-winning lists. Arithmetic settles the conflict, with G retained transparently. | raw results gazette, SOURCES.json, k22 builder status notes, generated source catalogue |
| O2/F1 | Zehut withdrawn on 1 September, Z + absence from G. Retain approved roster and zero votes. | data/meta/k22-corrections.json, k22/shared builder, generated k22 |
| O3/F2 | Noam withdrawn on 15 September, N + G. Earlier surplus agreement remains unchanged. | same |
| O4/F6 | Kol Yisrael Ahim withdrew 16 September, K + G. Deciding evidence settles auditor disagreement; zero votes alone were not used as proof. | same |
| O5 | Replace unsupported Odeh clause with Tibi letter excluding Balad at its MKs' request, T + P. | data/meta/aftermath/k22.json |
| O6/F4 | Remove stale “No term event” gap: two accepted events and citations already exist. | same |
| O7 | Restore logical parentheses in four candidate names; C and independent G wording for Tamano. IDs/ranks unchanged. | corrections input, shared builder, generated k22, historical-k22 regression tests |
| O8 | Restore logical parentheses in eight submitting-party strings from C; explicit k22 substitutions only. Raw PDFs and k23/k24 parsing unchanged. | corrections input, shared builder, generated k22 |
| O9 | Restore semicolon placement in five 19-August resignation notes, C p.14492. Corinaldi's 27-August note is already correct and stays unchanged. | k22 transcription config, generated k22 |
| O10 | Refresh k22 cached status and dataset hashes in all nine families and source hashes in registry/lineage; refresh k23 too because of Gesher identity repair. | data/meta/families/*.json, parties.json, party-lineage.json |
| O11 | Keep observed ballot labels, explicitly label five name-history entries as ballot-list display names rather than registered party names. C distinguishes submitting parties from lists; registry already declares dataset-observed provenance. | data/meta/parties.json |
| O12 | Correct CEC page titles, including the identical mislabel on other k22 lists; URL remains the results webpage. | data/meta/party-links/k22.json, generated k22 |
| O13 | Replace inaccessible JPost long quotation and k23 Hebrew-Wikipedia prelude citation with opened contemporary P/T and short quotes. | data/meta/k22.json, aftermath |
| F3 | Separate modern Orly Levy-Abekasis party as gesher-2019; keep gesher for David Levy's 1990s party. I explicitly identifies new registration. No invented continuity edge. Modern k22 AND k23 references must agree. Observed-election appearance periods do not claim foundation/dissolution dates. | registry, lineage, k22/k23 metadata, both party-link files, joint-facts.json, centre/labour families, generated k22/k23 |
| F5 | Remove “party-supplied”; J establishes date/upload but no party origin. Keep medium confidence and state origin unverified; no asset redesign/research. | data/meta/logos/k22.json |
| R3 | All three constituents are already selected in this family, confirmed by C. Democratic Union becomes included extension, not mixed: included 192,495; remaining mixed Labor–Gesher 212,782; whole-list alternative unchanged 405,277. No constituent votes inferred. | data/meta/families/labour-zionist-left.json |

## Retained limitations

These five groups are not rejected findings or owner disputes, and are not passing
audit checks.

| Finding | Recheck and disposition |
|---|---|
| F7 | Rehashed retained Jewish Home page/asset against manifest; header references images/new_logo.png. Payload SHA-1 base32 FF3SNIJKPIOZG6IAJZOVM6DGVYFRW4KE differs from the recorded CDX digest. Existing medium-confidence mismatch caveat accurately preserves unresolved election-period byte identity. |
| F8 | Bio metadata has 169 pattern verification flags. Person-ID matching does not establish every page-body identity or English spelling. No concrete wrong mapping supplied; retain flags and coverage limitation. |
| F9 | Source re-extracted; 1,205 candidates minus 120 opening elected = 1,085 unelected. Identified extraction defects fixed under O7–9. No complete independent cell-by-cell audit of all other names/affiliations performed; no blanket certification. |
| F10 | All 28 colour entries disclaim official party specifications. Decorative colours unchanged; no claim of verified election-period official colours. |
| F11 | B confirms limited Balad attribution; C resolves R3. Broader family interpretations and geographic/demographic labels remain outside complete source re-audit. Parsing/hashes/arithmetic do not prove every historical classification. |

## Owner questions

None. Additional evidence settles withdrawals and Gesher; arithmetic settles the
gazette typo. Remaining limitations are verification gaps, not competing
equally ranked values needing owner adjudication.

## Reproduction and field-diff evidence

Node 24.18.0, repository dependency lock. Temporary extraction/cache/log files live
under .backup-scratch/data-audit/k22. Unique sources remain in data/raw.

Recursive comparison with the merged audit baseline: **54 k22 scalar paths**
(2 status notes, 8 candidate-name fields, 8 sponsor strings, 5 resignation notes,
3 withdrawals, 20 CEC link titles, 8 Gesher party/candidate IDs). **8 k23 paths**
are all Gesher IDs, including one bloc-member reference. Votes, seats, rules,
agreement membership, candidate ranks and IDs unchanged. Source catalogue gains
only the retained gazette. Family metrics change only as described for R3.

No Playwright run. Validation outcomes and differential digest review follow below.

The joint-facts reproducibility check additionally required regenerating the seven
joint-list submission strings from corrected k22 sponsors. Its only additional
changes are logical parentheses; the two modern Gesher IDs remain as documented.

Restoring only baseline k22/k23 arguments to scenarioFromDataset reproduces the old
allocation digest 5ef9e5f9… and model digest 2694440f… exactly. New digests are
ff0c004f… and 185d21d1…. Analysis, validation and rules digests are unchanged.
Engine code was not modified. The fixture comment records why the reviewed
input changes affect hypothetical corpus allocations and model snapshots.

Initial shared dependency caches were read-only; writable cache links were placed
under project scratch. Broad default-timeout failures occurred under measured host
load 78.43 with 8 GiB swap exhausted. The two-worker rerun uses 180-second default
test/hook timeouts, without changing repository timeout policy or test assertions.

Final validation:

- Dataset build: passed; corrected k22/k23 and source catalogue regenerated.
- Joint facts: regenerated from datasets; exact reproducibility check passed.
- Family validation: 9 presets across k1–k26, registry and lineage passed.
- Logo validation: 26 overlays, 184 source records, 135 assets passed;
  143 hosted records, 5 already-unresolved records retained.
- TypeScript: npx tsc -p tsconfig.json --noEmit passed.
- Vitest: **93 files, 886 tests passed**, including historical-k22 and all five
  differential families; 135.86 seconds in the final two-worker run.
- git diff --check: passed. No push, main integration or Playwright.
