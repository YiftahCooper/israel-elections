# 0069a: K6 national release — correct the misread connection, retain the law

3 November 2026. Status: accepted national release under the owner's explicit
conditional authorization. Supersedes the k6 hold in 0068 and the k6-specific
allocation uncertainty in 0060–0062. Historical prose in those records is preserved;
it describes a failed transcription, not an alternative statutory interpretation.

## Decisive primary evidence

[YP 1225, 24 October 1965, p.189, PDF p.1](https://olaw.org.il/yalkut/yalkut-1225.pdf)
is already retained as `data/raw/k6/agreements.pdf`, SHA-256
`73f7d7ba1be0a209876addf8de3af08d44e29bd05200b39d84b1159ed0d45bb2`.
The official publication is supplied by the disclosed olaw mirror.

Fresh enlarged visual inspection of the **whole signed notice** establishes:

1. Alignment, letters **את**, with **רשימת קדמה ופתוח, האותיות רא**.
2. Rafi, letters **כא**, with **רשימת השלום** (the Peace List). The printed letters after it are not
   **כס** on an enlarged reading (the second letter resembles ג or נ, not ס), but no 1965 list bears
   such letters; the Peace List's ballot letters in the results notice are **כס**, so the pair is matched
   by the printed list name. *(Parent review, 3 Nov 2026: the earlier wording said the notice prints כס.)*

The first partner is **Progress and Development (רא)**. The earlier **Cooperation
and Brotherhood (יא)** reading is contradicted by **both the printed name and the
printed letters**. No notice was missing, no third pair was invented, and the PDF
bytes did not change. The error was in `national.reviewed.json` and its dependent
records/tests. Peace's 5,536 votes still fail the 1% threshold, so the second pair
remains present but inactive. The corrected first pair was read before testing it;
seat agreement is validation, not how the connection was chosen.

## Allocation and counterevidence

The unchanged `ISRAEL_1951` preset gives qualifying votes **1,185,823**, quota
**9,881**, **114** individual whole-quota seats and **6** remainder seats.
Alignment has 44 initial seats; Progress and Development has 2. Their pooled
**466,809** votes and **46** initial seats leave **12,283** unused votes.

The national remainder awards go to:

| Unit | Unused votes before the award | Extra seats |
|---|---:|---:|
| את–רא | 12,283 | 1 |
| ב | 9,156 | 1 |
| ו | 7,651 | 1 |
| יא | 6,583 | 1 |
| כא | 6,399 | 1 |
| לע | 5,775 | 1 |

The pair's **47** seats are re-divided at quota **floor(466,809/47) = 9,932**:
initial **44+2**, then the one internal remainder seat to Alignment, final **45+2**.
HaOlam HaZeh's 4,243 unused votes do not win a second seat. All **17** published
list seat counts now match, total **120**, without warnings. K2–K5 and K7 still
match under the same preset, including in the independent law reference.

A regression retains the old את–יא input as an explicitly **incorrect-input
counterfactual**: it still gives Alignment 44 / HaOlam HaZeh 2. This isolates the
cause without changing the law to fit a target. No engine semantics, preset values,
optional RuleSet fields, scenario behavior or app files change.

## Hypotheses checked and search limits

The acceptance criterion was a statute in force on 2 November 1965 or an official
CEC notice/calculation supporting an explanation that reproduces every seat.

| Claim / hypothesis | Evidence inspected and result | Verdict |
|---|---|---|
| (a) Different 1965 law, rounding, or internal division | Retained [1959 law](https://fs.knesset.gov.il/3/law/3_lsr_311002.pdf), ss.37–39, PDF pp.7–8, and [1969 original](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf), ss.81–83, PDF pp.14–15. Fresh full visual read of [1965 Amendment 5](https://fs.knesset.gov.il/5/law/5_lsr_208032.pdf), SH465 pp.264–265, and [Amendment 6](https://fs.knesset.gov.il/5/law/5_lsr_208033.pdf), p.266. No allocation amendment in those acts: committee representation, registration/naming, and civil-service eligibility change. The wider retained chain was recorded in 0060. | No support as the cause; unnecessary after correcting the primary input. Not a claim to have audited every administrative instrument. |
| (b) A different remainder definition / Hagenbach–Bischoff / Bader variant | The 1959 s.37(d) explicitly subtracts quota × seats and allows one further seat per list; s.38 combines connected lists only for that stage and re-divides by s.37. The corrected input reproduces all seats with that wording. | Refuted as a required explanation. No second pair award or recomputed national pair quota adopted. |
| (c) Official CEC calculation appendix | Inspected retained research inventory and the indexed official history entry. Fresh direct GETs of the previously inferred `memorandum-knesset6/he/archive_knesset6_memorandum1.pdf`, the sibling `memorandum-apdx1.pdf`, and history BlobFolder `knesset6-memorandum.pdf` each returned 404. Guide page, legacy index and public ContentApi attempt returned 403. | Not found in this bounded search; not evidence that no appendix exists. Not needed for resolution: the official notice supplies the incorrect input's correction. |
| (d) National vote transcription differs from the results | Every one of 17 rows re-read from [YP 1230 p.311](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-results.pdf), PDF p.1. All match the reviewed table, including Gahal 256,957. Sum 1,206,728; invalid 37,978; published seats from pp.312–313. | Refuted for the retained vote table. The confirmed error is the **agreement partner**, outside the proposed vote-figure hypothesis. |

Further leads were retrieved into scratch: Knesset Constitution Committee protocol
[7_ptv_581938](https://fs.knesset.gov.il/7/Committees/7_ptv_581938.pdf) (14 PDF pages),
plenary [7_ptm_253093](https://fs.knesset.gov.il/7/Plenum/7_ptm_253093.pdf) (47 PDF pages),
and the [2005 Knesset research note on agreements](https://fs.knesset.gov.il/globaldocs/MMM/0e2a5af0-9732-e811-80de-00155d0a0235/2_0e2a5af0-9732-e811-80de-00155d0a0235_11_6854.pdf).
Their extracted text was searched as discovery material; no complete protocol review
or 1965 calculation confirmation is claimed. Secondary encyclopedic coverage pointed
to את–רא and prompted the decisive re-read; it is **not release authority**.
Indexed HaOlam HaZeh issues 1471 (10 November 1965) and 1841 (13 December 1972)
were additional leads, but direct PDF GETs returned 404; indexed snippets are not
accepted evidence. No guessed memorandum URL or secondary account supplies the rule.

Confidence in the resolved cause is high: the retained primary notice directly
contradicts the old name/letters; correcting only that input reproduces every seat
under the unchanged statute-based method. The remaining archival-search limits do
not undermine that explanation. Counterfactual legal edge cases in 0060 remain
qualified; historical reproduction does not settle unspecified ties or shortages.

## Roster coverage and elected cross-check

[YP 1222](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-cand.pdf)
provides the registered names. [YP 1230](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-results.pdf),
PDF pp.2–3, supplies all elected names. Both PDFs were already retained and hash-bound.
Names were transcribed visually and compared identity by identity, retaining candidate
spellings, old names and honorifics with punctuation/spacing normalized. Enlarged
crops resolved Gahal's טיאר אברהם אלברט-ראול, Rafi's גז מטילדה, and the registered
אהרון spellings. The results sometimes shorten names or hyphenate differently.

| Letters | Seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected check |
|---|---:|---|---|---|---|
| את | 45 | 1–45 | 2,3 | 2 | All 45 |
| ב | 11 | 1–11 | 5 | 2 | All 11 |
| ג | 4 | 1–4 | 7 | 2 | All 4 |
| ד | 2 | 1–2 | 9 | 3 | All 2 |
| ו | 3 | 1–3 | 11 | 3 | All 3 |
| חל | 26 | 1–26 | 13 | 3 | All 26 |
| יא | 2 | 1–2 | 15 | 3 | All 2 |
| כא | 10 | 1–10 | 17 | 3 | All 10 |
| לע | 5 | 1–5 | 20 | 3 | All 5 |
| מ | 8 | 1–8 | 23 | 3 | All 8 |
| ק | 1 | 1–1 | 27 | 3 | All 1 |
| רא | 2 | 1–2 | 29 | 3 | All 2 |
| ש | 1 | 1–1 | 31 | 3 | All 1 |

**13 winning lists, 120 registered candidates, 120 elected identities checked.**
All elected mappings are contiguous prefixes; the notice skips none of these ranks,
so no `notSeated` flag is needed. Every winner has `candidatesTruncated: true`;
zero-seat כס, נס, עס, סס have `candidatesUnavailable: true`. The scans contain later
and losing candidates, but those names are not promoted. No full-roster claim.

## Release and verification

K6 is available with `hasLocalities: false`, bilingual coverage/correction notes,
and no locality file. The release builder still checks source hashes, totals,
connections, roster coverage and exact seats; no gate is waived. Tests independently
pin all vote/seat values and both pairs, verify the corrected pair's internal quota,
retain the old diagnostic as a counterfactual, and include K6 in the full early-release
and elected-name checks. Law-reference tests also compare all six sibling-era cases.

Reproduce with locked npm dependencies, `npx tsc -p tsconfig.json --noEmit`,
`node scripts/build-datasets.ts`, `node scripts/check-colours.ts`, `npx vitest run`,
and a rebuild without `.backup-scratch/raw`. Primary sources and reviewed inputs are
committed; render/search/dependency working copies stay in ignored `.backup-scratch/`.
K6 visual inspection used PyMuPDF 2.1, scales 2–5, from the retained PDF bytes.
No backup-system exclusion is assumed. No push or deployment is authorized here.

Validation completed: TypeScript, dataset build, colour checks, and **38 test files /
336 tests passed**, including `datasets.test.ts` and `elected-names.test.ts` for K6.
The CI-style rebuild passed with `.backup-scratch/raw` absent; that path was already
absent in this worktree, so nothing needed moving or restoring. Unrelated election
JSONs whose only difference was `buildInfo.builtAt` were restored before commit.


## Addendum, 6 November 2026: ballot transcription correction

Fresh inspection of YP 1230 p.311 and YP 1222 p.131 confirms that the Peace List is **כנ**, not כס. The premise in 0069a that no list bore כנ was false; the signed YP 1225 connection is **כא–כנ**. The correct effective pair remains את–רא. ענ (Brotherhood) and פש (Young Israel) replace the other misread letters. Internal IDs stay unchanged as opaque keys by coordinator decision; displayed/exported letters come from the corrected field. See [k06 resolution](../research/data-audit/k06-resolution.md). Historical text above is superseded on these points.

7 November 2026: the owner superseded the pre-release ID compatibility requirement. Internal list and candidate IDs now follow corrected ballot letters; see [identity correction](../research/data-audit/2026-11-07-list-identities.md). Historical findings above are retained.
