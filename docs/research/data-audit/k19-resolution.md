# K19 fixer resolution — 6 November 2026

Inputs: both independent reports, merged from `t3/76331997` and `t3/175a00af` after
`origin/main` was already up to date. Binding policy: the 6 November Hebrew-first
[source hierarchy](../source-hierarchy.md). All source checks below: 6 November 2026.

**Disposition: 16 corrected or resolved finding groups, 2 rejected proposed changes,
3 owner questions, 4 retained verification limitations.** These are 25 distinct groups:
Opus #11 maps to Codex F09–F11; other duplicate findings count once. A coverage
limitation is not an invented factual error or an owner dispute.

## Deciding evidence first: YP 6546

Downloaded and read the final page of [YP 6546](https://olaw.org.il/yalkut/yalkut-6546.pdf),
12 February 2013, printed p.2874. It explicitly references YP 6540 p.2492, §1, the
valid-vote total: `במקום "3,792,472" צריך להיות "3,792,742"`.
This is a rank-1 official correction served by the disclosed olaw mirror. Retained
unchanged as `data/raw/k19/results-correction.pdf`, SHA-256
`997628f9f5b6d556b62e2547489cbc9b6fbd64fa721c6eff687577ae1074cc24`,
registered as `k19-results-correction`. The later official correction settles the
national total. It does **not** amend any list vote count. No court/station cause
is inferred. The three remaining rank-1 conflicts are below.

## Finding decisions

Source abbreviations (directly read unless qualified):

- **R**: [YP 6540, results](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-results.pdf), retained original, rank 1.
- **C**: [YP 6524, approved candidates](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-cand.pdf), retained original, rank 1.
- **Q**: YP 6546 above, rank 1.
- **B**: [Rahat and Kenig, המפלגות בישראל 1992–2021](https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf), IDI academic book, rank 2.
- **Y**: [Ynet, 2 February 2013](https://www.ynet.co.il/articles/0,7340,L-4340075,00.html), rank 4.

| Finding | Re-check and decision | Source / short evidence | Changed files |
|---|---|---|---|
| F01 | Corrected: retain/register formal correction and verify its hash during builds. | Q, quoted above. | raw PDF, SOURCES, common builder, generated sources/k19 |
| F02 | Corrected: national typo has an official correction; list discrepancies remain separate. Preserve historical decision text with a dated addendum. | Q corrects only `סך כל הקולות הכשרים`. | k19 builder notes, election-context, DATA, decision 0041 |
| F03 | Reject mandatory addition to participating dataset. Withdrawal is real, but omission is the explicitly documented participating-only snapshot, not a false `withdrawn:false` record. Approved roster remains in C. Document official withdrawal evidence. | [CEC notice index](https://www.gov.il/apps/elections/elections-knesset-19/heb/cec/NoticeList49f6.html?NoticeType=ann), rank 1, 20 Jan: `עתיד אחד – נלחמים בסם החדש` / `לא תתמודד`. R has 32 participating rows. | DATA scope clarification |
| F04 | Same decision as F03; no participating list is falsely labelled. This rejects the proposed scope change, not the auditor's withdrawal fact. | [CEC notice](https://www.gov.il/apps/elections/elections-knesset-19/heb/cec/NoticeListc4dc.html?NoticeId=242), rank 1: `17.1.13` / `ולא ישתתפו בבחירות`. | DATA scope clarification |
| F05 / Opus 1 | Corrected event attachment: הי → יק. | R: `יק הישראלים 18,941`; הי is `מורשת אבות 461`. | election-context |
| F06 / Opus 4 | Removed stale assertion that no term event qualifies. Two events and their chronology pairs actually exist. This is a structural research-state correction. | aftermath `term.events`: `protective-edge-2014`, `ministers-dismissed-2014`. | aftermath |
| F07 | Corrected obsolete Balad evidence gap; keep no-recommendation value. | Y explicitly says `וכך נהגו גם נציגי מרצ, התנועה, רע"מ-תע"ל, חד"ש ובל"ד` after saying Labor recommended no candidate. | meta k19 and aftermath sources/notes |
| F08 / Opus 10 | Corrected stale unavailable statement; decision 0042 and election index already release k19. | Local release-state readback: `available: true`. | DATA |
| F09 | Owner question 1; no numeric change. | R versus final CEC capture/datastore, both rank 1. | Resolution only |
| F10 | Owner question 2; no numeric change. | Same. | Resolution only |
| F11 / Opus 11 | Owner question 3; no numeric change. | Same. | Resolution only |
| F12 | Withhold Hadash exact artwork: pre-poll HTML path does not prove post-poll bytes. Opus accepted it, but Codex's narrower provenance objection wins. | Retained `data/raw/logos/k19/` page/asset and manifest: page 10 Jan, asset 27 Jan. Party primary for its own logo; no pre-poll digest. | logos k19/sources, remove unreferenced public asset, generated k19 |
| F13 / Opus 7 | Resolve source weakness without changing ranks: add Hebrew reporting, academic table and qualified official Rivlin biography. Keep no invented party assignments. | B table 8.5 p.442, 2013 column identifies all seven UTJ candidates' parties. B p.364 identifies Taleb a-Sana with Mada; [Ynet 24 Jan](https://www.ynet.co.il/articles/mobile/0,7340,L-4336803,00.html) places him fifth. [Walla 29 Nov](https://news.walla.co.il/item/2591767) gives merged Jewish Home/Tkuma ranks; [Kipa 18 Nov](https://www.kipa.co.il/חדשות/חברי-מרכז-תקומה-קבעו-את-רשימת-המפלגה/) names the six Tkuma candidates. [INN](https://www.israelnationalnews.com/news/162803) corroborates the 15-person merge. [Knesset Rivlin lexicon](https://main.knesset.gov.il/About/Lexicon/pages/rivlin.aspx) indexed text gives party affiliation; live page location-denied, explicitly qualified in metadata. | meta k19; joint-facts **source URLs only** refreshed |
| F14 | Retain verification limitation; no demonstrated wrong name. Re-ran parser and compared every participating name/rank (1,595) with generated output: exact. Inspected template exclusion and unattached-fragment/rank checks. This proves reproducibility, not independent visual certification of all 1,475 unelected cells. | C, original snapshot; parser's 20 occluded-template exclusion is explicit and checked. | None |
| F15 | Retain verification limitation. Bio mappings and opening IDs are retained; neither successful parsing nor ID equality certifies 204 link destinations or all English spellings. No evidence supports replacing a name or link. | `bios/k19.json`, retained `knesset-odata-members.json`; external link provenance remains as stated. | None |
| F16 | Retain verification limitation. Re-ran family validator across all nine families; confirms references, hashes and cached facts, not independent historical continuity. Keep existing unresolved ancestry labels; no invented edges. | registry/lineage/families retain observed-local and unresolved evidence statuses. | Nine family hashes; Balad cached name |
| F17 | Resolved independent support for 68–48 and four absent. | [Hebrew Ynet 18 March](https://www.ynet.co.il/articles/0,7340,L-4358012,00.html), rank 4: `68 תומכים מול 48 מתנגדים וארבעה חברי כנסת שנעדרו`. | aftermath citation |
| F18 | Retain verification limitation. Colours explicitly say they are associations, not official specifications. Chronology/poll gaps describe retrieved research, not proof that a poll never existed. No historical colour or polling value invented. | Re-read colours' basis/confidence and aftermath inclusionRule/issuePolling. | None |
| F19 | Resolved factual core with reachable independent Hebrew sources; no need to claim original judgment was inspected. | [IDI eligibility table](https://www.idi.org.il/articles/65951), rank 2: 2013 Zoabi, `הפסילה בוטלה`; Ynet 24 Jan (above), rank 4: Jewish Home 12 / Raam–Taal 4 after envelopes. | None; existing values supported |
| Opus 2 | Withhold Hatnua artwork. Codex's acceptance of the original-upload date did not establish revision identity. | Commons API imageinfo history independently re-read: `2019-01-26 ... update`, then `2019-03-13 ... Clean up`; the 2012 date belongs to an earlier design. | logos k19/sources; remove unused public SVG; generated k19 |
| Opus 3 | Correct Balad identity using the approved-name notice, rather than repeat the malformed results name. Codex's “OK” matched the typo but does not defeat the approved-name source closer to the naming act. | C: `בל"ד - אלתג'מוע אלווטני אלדמוקרטי`; R: `בל"ד - אלתג'אלווטני אלדמוקרטי`. | k19 builder/meta, generated k19, family cached name |
| Opus 5 | Replace blank certification gap with explicit conflicting printed dates. Do not manufacture an unqualified certification event. | R signature: `י"ז בשבט התשע"ג (18 בינואר 2013)`. Hebrew date = 28 Jan; parenthesized date predates polling. | aftermath gap |
| Opus 6 | Trim UTJ leading space in input metadata. Generated name was already trimmed by results parser. | R/C identity. | meta k19 |
| Opus 8 | Replace non-verbatim candidate-notice quotation with the results-notice quotation. Approved snapshot's typo is not silently “quoted” correctly. | C prints `העקבית`; R prints `הערבית` and wrapped `הדמוקרטית`. | meta k19; joint source provenance |
| Opus 9 | Withhold Meretz artwork pending dated evidence. Its Commons metadata date is not independent proof of 2013 use; no English-Wikipedia source used. | [Commons file history](https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg): first listed upload 28 July 2016, current bytes revised 1 Aug 2022. | logos k19/sources; remove unused public SVG; generated k19 |

The optional later-entrant bios and replacement-note observations are not converted
into historical-snapshot changes. Candidate scope remains the original approved
participating rosters. No universal audit certificate is claimed for F14–F16/F18.

The cross-election exact-name-matching/Unknown-count defect is left to the dedicated
agent: **no change to `scripts/joint-facts.ts`, faction counts, Unknown counts or
matching rules**. Only k19 `sources` and `secondarySources` URLs in the generated
cache are refreshed to follow corrected provenance; every other field was asserted
equal before writing. Academic support is retained in metadata even though the
existing cache compiler does not enumerate academic-kind sources.

## Owner questions

YP 6546 does not settle these. No source inspected supplies a later list-level
correction or an authenticated earlier polling snapshot explaining the deltas.
The final CEC data are retained pending the owner's decision, preserving decision
0042's released dataset and the visible source-disagreement notices.

| Question | Competing values and best source per side | Recommendation |
|---|---|---|
| 1. Likud–Beiteinu votes | **885,054** — R §1 p.2492, rank 1 statutory notice; **885,163** — [CEC final results](https://www.gov.il/apps/elections/eng/list/Results_eng.html), retained numeric capture, independently reconciling to [official locality data](https://data.gov.il/api/3/action/datastore_search?resource_id=c20cdcef-4d42-4241-a41b-6ca7ae51002d), rank 1 administrative record. | Explicitly authorize retaining the final CEC figures as the exception: they reconcile to locality/polling sums. The notice normally wins within rank under the binding hierarchy; this recommendation is not an assertion that the exception has been newly approved. |
| 2. Kadima votes | **79,081** — R, rank 1; **78,974** — same CEC final capture and locality data, rank 1. | Same recommendation; preserve both sourced values. Seats remain two either way. |
| 3. Hayisraelim votes | **18,941** — R, rank 1; **18,939** — same CEC final capture and locality data, rank 1. | Same recommendation; preserve both sourced values. Seats remain zero either way. |

All three differences sum to zero. Both versions sum to the corrected national
total and reproduce exactly the same 120 seats. Thus the grand-total correction
cannot be used as evidence that the three gazetted list counts were corrected.

## Verification and reproduction

- `node scripts/build-datasets.ts`: passed, all elections; only k19 and generated source manifest written. No manual generated dataset edits.
- Nine family dataset hashes refreshed, plus the cached Balad name; `node scripts/validate-families.ts`: passed.
- `python3 scripts/validate-party-logos.py`: passed (26 overlays, 184 source records, 132 assets; 140 hosted references, 8 unresolved).
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: **885 tests passed across 93 files**, including historical-k19 (7 tests) and all five differential families. No Playwright. The first sandbox run denied the gallery test's Node subprocess (EPERM); the authorized ordinary-permission rerun passed.

Recursive before/after field diff of k19: only `status.noteEn/noteHe`, Balad
`nameHe/notesHe`, three removed `logo` fields, appended `sourceIds`, correction
`buildInfo.rawSha256` and `builtAt`. All votes, seats, candidates and locality data
are unchanged; every other election dataset is unchanged. The model differential
digest was refreshed only after that check. Using HEAD's k19 dataset in a scratch
copy of the corpus with current application code reproduced the previous model
digest `2694440f…`; corrected data gives `2f01010a…`. Allocation, analysis,
validation and rules digests are unchanged.

Build full station reconciliation was explicitly skipped because ignored polling
scratch is absent; retained locality fingerprints, independent k19 locality rows,
envelope derivation and national arithmetic passed. This is not a new full pull
of the 10,109 polling records. Reproduction uses the locked dependencies, retained
raw inputs and documented fetch/regeneration procedure in DATA.md. Routine logs,
PDF extraction and digest harnesses are disposable `.backup-scratch/k19-fixer/`;
backup exclusion for this worktree was not independently verified.
