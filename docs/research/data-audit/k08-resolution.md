# k08 reconciliation — 31 December 1973

Fixer: Codex, 6 November 2026. Fast-forward check against origin/main was already current;
both auditor branches were merged. The origin/main source hierarchy governs these decisions.
No push, main-branch merge, Playwright, or change to scripts/joint-facts.ts.

**19 deduplicated finding groups: 14 fixed or resolved with additional evidence,
2 proposed repairs rejected, 3 retained verification limitations, 0 owner questions.**
O numbers refer to Opus; W/S/V IDs refer to Codex. A finding group can cover several fields.

## Independently inspected evidence

- **R (rank 1):** retained [YP 1979](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset8-results.pdf),
  data/raw/research/k08-results.pdf, printed pp.608–609. Visually re-read the name of מס
  (“תנועה לשויון חברתי”) and Likud ranks 13 (“אברמוב שניאור זלמן”) and 38 (“שכטרמן אברהם”).
- **C (rank 1):** retained [YP 1954](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset8-cand.pdf),
  data/raw/research/k08-candidates.pdf, pp.91,93. The candidate notice prints “שחטרמן אברהם”,
  “אברמוב שנאור זלמן”, and “תנועה לשויון חברתי”. These are genuine differences between notices.
- **G16 (rank 1):** [Knesset sitting 21, 10 March 1974](https://fs.knesset.gov.il/8/Plenum/8_ptm_253620.pdf),
  ordinary project-UA download. Page 1 reproduces the presidential letter dated 30 January:
  “הטלתי היום על חברת־הכנסת גולדה מאיר את התפקיד להרכיב ממשלה”. Meir's statement on PDF p.3
  dates the Egypt disengagement agreement to 18 January 1974.
- **G17 (rank 1):** [Knesset sitting 53, 3 June 1974](https://fs.knesset.gov.il/8/Plenum/8_ptm_253635.pdf),
  ordinary project-UA download. Rabin's opening statement on p.1 says the Syria agreement was
  signed in Geneva on 31 May 1974, and explicitly credits the outgoing Meir government.
  The two signing dates therefore precede Rabin's cabinet. Egypt also precedes the opening sitting.
- **I73 (rank 2):** [IDI, בחירות 1973](https://www.idi.org.il/policy/parties-and-elections/elections/1973/),
  Hebrew article opened. Confirms the Alignment/minority-list connection and 68-seat coalition:
  “ועם רשימות המיעוטים מנתה 68 חברי כנסת”. Its modernized מס spelling does not override R/C.
- **I77 (rank 2):** [IDI, בחירות 1977](https://www.idi.org.il/policy/parties-and-elections/elections/1977/),
  Hebrew article opened: “פיטוריהם של שרי המפד״ל בעקבות הימנעותם בהצבעת אי-אמון”.
  Decides the agency of the departure, independently of the existing IPU “excluded” citation.
- **J17 (contemporaneous press; rank 3 analogue, outside the expressly named JPress titles):**
  [original JTA bulletin, 17 January 1974](http://pdfs.jta.org/1974/1974-01-17_012.pdf), p.3,
  retrieved with the project User-Agent and visually read. Dateline: “JERUSALEM, Jan. 16 (JTA)”.
  Describes Katzir meeting Labor and Likud that day; Labor “reportedly suggested” Meir;
  Bader made “no suggestions”. This resolves the web archive's next-day heading without making
  it an official recommendation transcript. Direct archive article remained 403; HTTPS PDF reset,
  while the original HTTP locator returned 200 normally. No access-control workaround was used.
- **L (asset metadata, unranked):** ordinary HTTP-200 Commons imageinfo response for page 92768459,
  “File:Frente Religioso de la Torah logo.png”. Credit links to an NLI 1973 collection page;
  DateTimeOriginal is “2020-07-31”. Neither is an inspected 1973 campaign item. This supports
  attribution/licence metadata, not the claimed campaign date. No replacement image researched.

## Decisions, by finding

| Finding | Decision and evidence | Inputs changed |
|---|---|---|
| O1; Codex roster commentary | Fixed display to שכטרמן אברהם using R and Knesset person 2645; C's misprint stays in nameHe. The explicit coordinator decision authorizes the existing Speiser-style display mechanism. Neither ID nor rank changes. | candidate-notes.json |
| O2; Codex O26 wording | Fixed: Rabin removed the ministers, following abstentions. I77 supports dismissal; existing IPU says excluded. No voluntary departure implied. | aftermath/k8.json |
| O3; Codex O24 note | Fixed: both agreements signed under Meir. G16/G17 provide direct evidence; no need to rely on the inaccessible MFA/ISA pages or an advocacy database. | aftermath/k8.json |
| O4 / W03 | Fixed government-14 boilerplate. Replaced with the actual coverage limit: formation snapshots for governments 16/17, later changes within 17 not transcribed. No invented later seat count. | aftermath/k8.json |
| O5 / W04 | Fixed mandate-date uncertainty using the dated presidential letter G16. Date stays 30 January; note explicitly resolves the losing JTA archive heading. | k8.json bloc scheme |
| O6 / W06 | Fixed nonexistent rosters.reviewed locator to existing candidates.reviewed.json; file field was already correct. | raw/SOURCES.json |
| O7 | Fixed anachronistic scheme title to The Alignment and its affiliated Arab lists / המערך והרשימות הערביות המסונפות אליו. R identifies the election list; I73 supports affiliation. Also strengthened first-government support-list provenance with I73 instead of sole reliance on Hebrew Wikipedia. | k8.json; aftermath/k8.json |
| O8 | **Rejected as a required repair.** Existing notes explicitly identify PDF-extraction order/OCR, and src does not render aftermath quotations. Their strings are evidence extracts, not incorrectly transcribed display names. Do not silently rewrite the recorded extraction as verbatim Hebrew. Newly added reading-order excerpts are separately labelled. | No alteration to old quotations |
| O9 | Fixed provenance ambiguity: explicitly label the 1973 nrp/rakah/kach observations as ballot-list names, not verified registered-party names. R supports the ballot names; no legal-party name invented. The registry already marks these observed-local-dataset. | parties.json limitations (k8 only) |
| O10 | **Rejected display substitution.** C genuinely prints שנאור, R prints שניאור, and the retained OData agrees with R. Decision 0088 makes C authoritative for roster readings and allows spelling variants; the reviewed roster already records this variant. Unlike the explicitly authorized Shechterman repair, a missing yod does not establish an identity error requiring a display override. Preserve the registered spelling, with the disagreement recorded here. | None |
| O11 / V03 | **Retained limitation.** Re-read the recommendation entries, G16 and J17: no record there establishes personal nominees for the other eight lists. Unknown (30 seats) is appropriate, distinct from no recommendation. No coalition-derived recommendations added. | None |
| W01 | Fixed מס to תנועה לשויון חברתי, exactly as R/C, including short label, unofficial English transliteration, link title and vehicle-name copies. Opus's blanket all-names-OK claim loses to both scans on this specific row. | raw/k8/national.reviewed.json; meta/k8.json; party-links/k8.json; parties.json; scripts/lib/list-meta.ts (single k8 row) |
| W02 | Fixed stale parties.json k8 dataset hash; refreshed only k8 references in registry, lineage and family files after regeneration. Other-election hashes unchanged. | parties.json; party-lineage.json; families/*.json |
| W05 | Fixed stale partial/not-released scope. Official-final k8 exists, releaseBlockers is empty; roster coverage limits remain explicit. | raw/k8/national.reviewed.json; corresponding manifest bytes/hash |
| S01; Opus logo OK | Fixed overclaim: status unresolved, provenance text explicitly says historical use unverified. L establishes a credit assertion, not actual 1973 use; Opus also says the underlying NLI item was not opened. Existing unresolved-logo mechanism retains asset/licence but removes it from the dataset/UI. Confidence medium remains metadata confidence, not verification of campaign use. | logos/k8.json |
| V01 | Resolved access limitation using original J17 p.3. Existing reported positions supported; preserved the “reportedly” qualification explicitly in scheme notes. No official written recommendation claimed. | k8.json; aftermath/k8.json original-bulletin citation |
| V02 | Resolved: J17 p.3 explicitly says Jan.16 and today; keep 1974-01-16, add original-bulletin locator and quote. Opus correct on this date. | k8.json; aftermath/k8.json |
| V04 | **Retained verification limitation.** Retained OData opening membership and official English-name extraction are available and the elected mappings match them. This does not prove all 240 linked biography destinations were freshly inspected. No demonstrated bad identity/link to repair; no such exhaustive certification made. | None |
| V06 | **Retained verification limitation.** Re-read colour convention/source declarations and party links; I73 indeed associates platform links with the lists, but that does not certify every platform's contents or Wikipedia CSS value. No historical-colour claim or demonstrated incorrect link established; leave the disclosed conventions intact. | None |

The supplementary faction-count flags were rechecked against regenerated joint-facts.json:
Likud 17/13/4/4/1, Alignment 44/7, Torah Front 3/2, Moked 1/0; all unknownElected counts
are zero. No residue of the name-matching bug found and no joint-facts script change made.
These allocations retain their disclosed secondary-affiliation provenance; faction matching does
not independently prove every internal-party affiliation. No withdrawn or cancelled list identified:
the same 21 published participating lists have positive results; no withdrawal flag changed.

## Owner questions

None. The source hierarchy, existing roster policy and explicit coordinator decision settle the
available corrections. Inaccessible/missing evidence is retained as a limitation, not a fabricated dispute.

## Generated output and validation

The recursive field diff against the merged audit-report HEAD permits only these k8 changes:
מס full/short Hebrew names, short English transliteration and link title; Shechterman's displayNameHe
and cited note; affiliated-Arab-lists scheme title in both languages; removal of the unresolved גד logo;
and build timestamp/raw-source hash. Every vote, seat, agreement, candidate nameHe/rank/ID,
list ID, ballot letters, status and other-election dataset is unchanged. sources.json changes only
k8 manifest metadata. src and all engine/model code are unchanged.

The sole changed differential family is model (520 cases), now
5e32c44790d90ad6671399bdbb3e06823af7f348db95342e7814f5859865ac9e.
Allocation (6,832 cases), analysis (818), validation (601) and rules (364) keep their previous digests.
A comment records the reviewed changes beside the model digest. Added one historical-k8 regression
covering display/registered-name separation, stable IDs, Hebrew/English labels and unresolved-logo exclusion.

Checks: dataset build; validate-families (9 presets across k1–k26); logo validator
(26 overlays, 184 sources, 131 assets); tsc --noEmit; full Vitest --maxWorkers=2.
Final result: **97 test files passed, 923 tests passed**. Initial sandbox run passed 920/922: expected
model snapshot update plus gallery child-process EPERM. Re-ran with the permitted child-process capability.
No Playwright.

Reproduction: use the repository lockfile dependencies and Node 24.18.0. PDF inspection used
PyMuPDF (VersionBind 2.1) in project scratch; retained official scans,
source URLs, page numbers, input changes and quotes above are the durable record. Scratch contains
only reproducible dependency/PDF/extraction/render/test working material; no backup exclusion asserted.

## On-screen label/status changes for coordinator

- שחטרמן אברהם → שכטרמן אברהם (shown name; registered name unchanged), with new bilingual source note.
- התנועה לשוויון חברתי → תנועה לשויון חברתי (full/short names and result-link title prefix).
- HaTnua LeShivyon Hevrati → Tnua LeShivyon Hevrati (unofficial transliteration).
- מפא״י/המערך והרשימות הערביות המסונפות אליה (רשימות לוויין) → המערך והרשימות הערביות המסונפות אליו.
- Mapai/Alignment and its affiliated Arab (satellite) lists → The Alignment and its affiliated Arab lists.
- גד logo: displayed → absent (overlay verified → unresolved; dataset official-final status unchanged).
- Aftermath NRP wording: ministers left → Rabin removed the ministers (both languages; aftermath is not wired into UI).
