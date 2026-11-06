# k07 audit resolution — 6 November 2026

Both reports merged from `t3/c667687c` and `t3/71974f76`. Fixer followed
BRIEF.md and the 6 November source hierarchy on origin/main. No push or main
merge; no Playwright. Stable list/candidate IDs remain unchanged.

Counting deduplicated finding groups: **12 fixed or documented, 1 rejected,
1 retained verification limitation, 0 owner questions**. Partially accepted F06
is counted once under fixed/documented, not again under rejected.

## Independent evidence recheck

- **K (rank 1):** [Knesset government-15 positions](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2015&$format=json).
  Fresh normal-HTTP response, prescribed User-Agent, 86 records, no nextLink;
  retained in `data/raw/k7/government-15-positions.json`, hashed in SOURCES.json.
  PersonIDs 2179, 2320, 2442, 2512, 2609, 3257 all have
  `StartDate: 1969-12-15T00:00:00`, `FinishDate: 1970-08-06T00:00:00`.
- **P (rank 1):** [15 December 1969 formation protocol](https://fs.knesset.gov.il/7/Plenum/7_ptm_253121.pdf).
  Fresh official PDF, text and rendered pp.2/45 inspected. Page 2:
  “ביום 10 בנובמבר 1969 הטיל עלי כבוד נשיא המדינה את התפקיד להרכיב ממשלה”;
  “הממשלה המוצעת תכלול שש סיעות, המייצגות ביחד 102 חברי כנסת”.
  Page 45: “בעד הבעת אמון לממשלה — 90; נגד — 10; נמנעים — 4”.
- **C/G (rank 1):** retained YP 1563 candidate notice, pp.232/235 (PDF 27/30),
  and YP 1573 results notice p.433 (PDF 1), rendered and visually inspected.
  C: “הכינוי: הרשימה הממלכתית”, “הכינוי: רשימת השלום”. G vote table:
  “רשימה ממלכתית”, “רשימת שלום”; heading “כינוי הרשימה”.
- **J6/J10 (rank 3 contemporary wire):** opened both actual JTA article bodies
  over ordinary HTTP (web fetch separately returned 403).
  [6 November report](https://www.jta.org/archive/mrs-meir-other-labor-leaders-striving-to-reconcile-opposing-factions):
  “President Zalman Shazar began consultations last Saturday”.
  [10 November report](https://www.jta.org/archive/shazar-finishes-consultations-with-all-parties-told-all-support-mrs-meir-for-premier):
  consultations ended “today”; mandate expected “tomorrow”; electorate
  “1,758,658”. Original bulletin PDF retrieval reset the connection; no bypass.
  Thus Saturday 1 November is supported, 9 November conclusion is not established.
- **B (rank 1 retained response):** official English-name capture, siteId 679:
  “Shmuel  Tamir (Katznelson)”. Two internal spaces are in the original.
  Raw capture preserved; display correction is explicitly reviewed metadata.
- **CBS (rank 1):** retained CBS table input and reviewed national totals preserve
  1,748,710; neither auditor identifies contrary official evidence. J10 is lower
  ranked and its 1,758,658 is not adopted. No fresh CBS retrieval claimed.

## Decisions

O = Opus finding number; F = Codex ID. Generated files were rebuilt from inputs.

| Finding | Decision and evidence | Input changes |
|---|---|---|
| O1/F05 | Fixed: all six ministerial tenures end 6 August 1970 (K). Keep the correct formation snapshot 102; add dated departure, Gahal's 26 seats removed, remaining election-list seats 76 = 56+12+4+2+2. Explicitly distinguish this calculation from contemporary faction splits and confidence votes. | aftermath/k7.json; retained K and manifest |
| O2/F01 | Fixed: six Gahal ministers, four MKs plus Weizman/Dulzin. K independently establishes all six positions. Preserve the old four-MK tabulation as scoped evidence, not a total minister count. | k7.json |
| O3/F04 | Fixed: remove copied government-14 gap; actual limitation is later faction/membership reconstruction. | aftermath/k7.json |
| O4 | Fixed garbled mandate and vote quotes against rendered P pp.2/45. Parentheses restored; OCR 0ו corrected to 10. Dates and vote values already correct. | aftermath/k7.json |
| O5 | Fixed only k7 Tamir display spacing, using B. Preserve raw capture and all IDs. Scoped reviewed name in bios input; builder consumes it only for this candidate/election. | bios/k7.json; lib/build/bios.ts; bios regression expectation |
| O6 | Fixed sourceId to k7-results-gazette: Reshimat Shalom matches G, not C's HaShalom. No English label change. | k7.json |
| O7 | Documented: five registry name-history entries are observed ballot-list display names, not registered party-name assertions. G's column heading establishes their scope. Preserve observed labels, add explicit notes. | parties.json, k7 entries only |
| O8 | Resolved by act-specific scope: G is the primary record for results-table labels; retain its names and disclose C's approved-list variants. No competing vote, identity or stable-key values. These are variant names for the same lists, not an unresolved owner choice. | k7.json list notes |
| F02 | Fixed stale k7 registry hash; refresh only k7 references across registry, lineage and all nine families after final rebuild. | parties.json, party-lineage.json, families/*.json |
| F03 | Fixed: P establishes 10 November mandate; remove continuing one-day uncertainty and add primary citation. J10 is an expectation, superseded by the completed-act record. | k7.json |
| F06 | Partly accepted: remove unsupported 9 November end from round and formation event. Reject missing-start implication: J6 explicitly establishes last Saturday, 1 November; add it to round/event citations. End remains unknown rather than substituting article publication date for dispatch date. | aftermath/k7.json |
| F07 | Fixed unsupported evidence claim: retain decorative Mapam colour as an app display choice; remove the quotation implying the cited 1969 page proves its hexadecimal value. No historical-colour claim remains. | k7.json |
| F09 | Reject replacement of electorate: keep official CBS 1,748,710 over J10's 1,758,658 (rank 1 beats 3). Disagreement recorded here; no numeric input changed. | none |

## Additional source-quality observations and retained limits

- Replaced the first-government secondary-only support caveat and citation with P's
  official six-faction/102-member formation speech in meta and aftermath. This is
  the formation snapshot, not evidence for Gahal's continued membership after 1970.
- **F08 retained limitation:** re-read 120 bios and local source mappings; no
  concrete wrong person supplied. Gahal has 15 Herut/11 Liberal assigned members;
  24 of 26 have individual evidence arrays, two Herut entries do not. Existing
  confidence/basis flags remain; linked page bodies and every party affiliation
  are not newly certified. Correct official IDs do not prove every linked article.
  No invented data or blanket passing-audit claim.
- No new withdrawn/cancelled-list error: the retained results table contains the
  same 16 positive-vote lists. k22/k24 withdrawal mechanism is unnecessary here.
- Regenerated-data joint-facts check: k7's Alignment and Gahal entries have zero
  unknown elected members and zero unknown component-faction mappings. No residue
  requiring input correction; `scripts/joint-facts.ts` unchanged.
- Family classification suggestions, chronology selection, pending issue polling,
  reactions and later replacements remain declared research/selection limits.
  No new partisan category or unresearched historical assertion introduced.

## Owner questions

None. Remaining evidence limits do not present equally ranked competing values.

## Reproduction and verification

Node 24.18.0; repository dependency lock; existing shared installed packages.
Reproducible extraction/renders/logs and local Vite caches are under
`.backup-scratch/data-audit/k7` / `.backup-scratch/`. Unique official response is
retained outside scratch. No global cache/temp configuration changed.

`BUILD_JOBS=2 node scripts/build-datasets.ts`; refresh only k7 hashes;
`node scripts/validate-families.ts`; `python3 scripts/validate-party-logos.py`;
`npx tsc -p tsconfig.json --noEmit`;
`npx vitest run --maxWorkers=2 --testTimeout=120000 --hookTimeout=120000`.

Recursive generated-data diff against merged audit HEAD finds only three k7
scalar changes: Tamir nameEn whitespace, נס englishName.sourceId, builtAt.
All 25 other national datasets unchanged; votes/seats/rules/rosters/IDs unchanged.
Restoring baseline k7 only at scenarioFromDataset reproduces the previous model
digest 4faa7f17… exactly; new digest 7a4f8713…. Other four digest families pass.
Aftermath and research evidence notes are separate inputs, not copied into the
national dataset. Dataset source catalogue additionally gains the retained K.

On-screen label changes: **“Shmuel  Tamir (Katznelson)” → “Shmuel Tamir (Katznelson)”**.
No scheme names, bloc labels, list names, or data-status labels changed.
New aftermath departure text records Gahal's six ministers/102→76 on 6 August 1970;
mandate/quote/gap notes corrected and the unproved consultation end removed.

Final validation: dataset rebuild successful; 9 family presets; 26 logo overlays,
184 source records and 131 assets validated; TypeScript passed. Full suite: 98
files / 925 tests, initially 922 passed and three failed (two expected audit
assertion/digest updates, one sandbox EPERM in the gallery subprocess). After
reviewing the three-field diff and updating the scoped name expectation/model
digest, all four affected/new files passed: 14/14 tests. Thus all 925 tests have
passed across the full run and targeted recheck, including historical releases
and all five differential families. Default-timeout run was stopped after a
load-related timeout; the completed suite used 120-second limits.
