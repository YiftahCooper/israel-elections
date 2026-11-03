# Election data: coverage and remaining verification

This checkout contains **two usable election datasets, k25 and k26**. The historical
extension is incomplete. Official sources for k16–k24 have been downloaded, but no
new election has passed all release gates. Do not describe those sources as nine
verified application datasets. `public/data/elections.json` explicitly marks them unavailable.

## Sources by election

| Id | Election date | Official source files retained | Secondary data used | Still missing from a released dataset |
|---|---|---|---|---|
| k16 | 2003-01-28 | data.gov.il polling stations; CEC candidates and results gazettes | None | National transcription, full candidates, agreements, electorate and validation |
| k17 | 2006-03-28 | data.gov.il polling stations; CEC candidates and results gazettes | None | National transcription, full candidates, agreements, electorate and validation |
| k18 | 2009-02-10 | Polling stations; CEC candidate/results gazettes; allocation memorandum; YP 5912 agreement notice (mirror) | None | Released; derived localities and sourced invalid-count exception disclosed (0040) |
| k19 | 2013-01-22 | Localities/polling; CEC candidate/results gazettes; final-results numeric capture; decisions book; YP 6530 agreements (mirror) | None | Built and seat-verified, but unavailable pending official discrepancy explanation and station attribution (0041) |
| k20 | 2015-03-17 | data.gov.il localities and polling stations; CEC candidates and results gazettes; agreement notice YP 7001 | None | Verified candidate extraction and complete validation |
| k21 | 2019-04-09 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 8168; agreement notice YP 8178 | None | Verified candidate extraction and complete validation |
| k22 | 2019-09-17 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 8420 | None | Verified candidate extraction, complete agreement notice and validation |
| k23 | 2020-03-02 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 8698; agreement notice YP 8708 | None | Verified candidate extraction and complete validation |
| k24 | 2021-03-23 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 9476 | None | Verified candidate extraction, agreements and complete validation |
| k25 | 2022-11-01 | CEC HTML, data.gov.il localities and polling stations, candidate gazette and CEC agreement press release | None | No extension-specific gap; existing engine reproduction test passes |
| k26 | 2026-10-27 | CEC locality/polling CSVs, captured official candidate pages, agreement gazette | Two rosters: bechirot.fyi, explicitly marked secondary | Gazetted final seats remain unavailable in the existing dataset |

The three historical agreement PDFs are **primary statutory publications retrieved from
an olaw.org.il mirror**, not independent secondary descriptions. Their manifest publisher,
URL and description explicitly disclose the mirror. Pair parsing and completeness still
require verification. No historical agreements have been inferred from engine output.

All downloads have URL, publisher, retrieval time, byte size and SHA-256 in
`data/raw/SOURCES.json`. A source's presence establishes provenance, not successful parsing.
No unparsed roster is represented as an empty, supposedly complete roster in an app dataset.

## Findings requiring care

* Knessets 16 and 17's candidate and result PDFs are scans, with no PDF text layer.
  Rendering through pdfjs requires its `wasmUrl` pointing at `node_modules/pdfjs-dist/wasm/`;
  without that, these image pages can appear blank. The data itself is present.
* Both XLS resources are served successfully through `datastore_search`; an XLS parser is
  unnecessary for those result tables. Knesset 17's table lacks registered-voter counts
  and numeric locality codes. Those must not be fabricated.
* Knessets 16–18 have no independent locality resources in the catalogue. Locality tables
  would need to be derived from polling stations and explicitly labelled as derived;
  this cannot be presented as independent source reconciliation.
* Candidate layouts change: surname/given-name order, two versus three column groups,
  party columns, repeated headers, page margins, and appended unrelated notices.
  `scripts/lib/parse-historical-gazette.ts` is an **unfinished parser prototype**. It fails
  on several retained PDFs and must not be wired into production builds yet. Contiguous
  ranks alone do not prove that the last candidates or name fragments were captured.
* Knesset 19's gazette prints **3,792,472**, but its own list counts sum to
  **3,792,742**. Final CEC web results and polling rows agree on the latter. Three
  list totals also differ: Likud +109, Kadima −107, Hayisraelim −2 (net zero).
  No official explanation or affected-station attribution was found; k19 stays
  unavailable. Decision 0041 records the evidence and search limits. Meretz's
  datastore column `מרץ` is explicitly mapped to official `מרצ` and tested.
* The Knesset 24 results page succeeded on retry; a fallback national total is unnecessary.

## Size and rebuilding

The nine historical polling-station JSONs occupy about **44 MiB**; together with the
existing raw sources, retaining all of them under data/raw would exceed the requested
roughly 60 MB limit. They are therefore downloaded into the project-local, ignored
`.backup-scratch/raw/kNN/` directory. Their manifest `file` paths are relative to data/raw
and resolve there. Source PDFs, the CKAN catalogue, and independent locality inputs
remain durable in data/raw (about 23 MiB total at this checkpoint).

Run `node scripts/fetch-sources.ts` to recover missing polling-station copies through the
paged official CKAN API. It discovers resource IDs from the retained package catalogue;
`--refresh` refreshes the catalogue and source files. Node >=22.18 and the locked npm
dependencies are required. This is reproducible working material, not the only copy of
unique data. Scratch's git exclusion is verified; no claim is made about backup software.

`node scripts/build-datasets.ts` still builds **only k25/k26** with their existing strict
checks. Success is not evidence that k16–k24 build. The new rule-era tests use synthetic
inputs to test resetting rules; nine actual per-election reproduction, threshold/quota,
candidate-leader and agreement tests are still required before releasing those datasets.

## K18 implementation and validation

K18 now builds 33 participating lists with 1,613 candidates from the official gazette,
eight complete surplus agreements from mirrored YP 5912 p. 2254, and 1,157 geographic
rows derived from polling stations (1,156 localities and the code 0 double-envelope
summary). The data's status explicitly labels the derivation; there is no independent
locality source. Every gazetted seat is reproduced through the scenario model, with
threshold 67,470 and quota 27,246. Every roster's final rank and contiguous sequence
are checked; Kadima #1 is לבני ציפי צפורה, alongside the other main-list leaders.
The original approved roster snapshot is retained; later resignations are not applied.
The approved פח roster has no final votes and is not included among participating lists.

Decision 0040 documents the national exception: YP 5917 prints 49,684 invalid votes,
but the CEC allocation memorandum and polling table agree on 43,097. National totals
are 5,278,985 registered, 3,416,587 cast, 3,373,490 valid. The envelope summary's
186,919 registered field is retained geographically but excluded from the national
registered sum, avoiding double counting voters already registered in their home
localities. `ballotBoxes` counts 9,264 source rows, including that single aggregate
row; it is not a claim about the physical number of envelope boxes. Regional committee
is absent and represented by 0, labelled in status. Sponsoring-party fields are
empty/null because those affiliations are not stated separately in this gazette.
No blocs are assigned; display names and colours are editorial metadata.

## K19 implementation and remaining release gate

K19 builds 32 participating lists, 1,595 candidates and all seven pairs from mirrored
YP 6530 p. 2156. The CEC's final national publication independently supports every
list's datastore votes, 5,656,705 registered, 3,833,646 cast, 40,904 invalid and
3,792,742 valid. A numeric capture is retained with its manual-transcription method
explicit in SOURCES.json; its publisher is official, not secondary. Every gazetted
seat is reproduced, threshold 75,855 and quota 29,366. Candidate counts and main-list
leaders are tested, including largest-list #1 נתניהו בנימין. The parser excludes twenty
occluded repeated Labor template objects; one corrupt PDF-text rank (`551`) is
explicitly decoded as the visibly printed `117` (Balad, PDF p. 7). It fails on
unattached name fragments, conflicting duplicates, missing names or rank gaps. Names
follow the original candidate gazette; later resignations are not applied. Approved
zero-vote rosters זה and פך are absent from the final participating-list table.

All 1,184 independent locality rows agree exactly with their polling sums. Code 875
(external envelopes) is absent from that file: its row is derived from 228 polling
records and retained as `data/raw/k19/envelopes.derived.json`, with source hash.
Together the 1,185 rows reconcile with all 10,109 polling records and national totals.
The external group contributes 212,949 valid, 2,840 invalid, 215,789 cast and zero
registered. Regional committee is unavailable (0); sponsors are empty/null and no
blocs are inferred. Dataset status labels the derived envelope row through this
source decision and the outstanding discrepancy; all rosters use official evidence.

Decision 0041 distinguishes the 270 grand-total inconsistency from the net-zero
three-list differences. No earlier station snapshot or official explanation was
located. The CEC decisions book names several disqualified/investigated stations,
but does not connect them to these differences; attributing the deltas to them would
be speculation. Thus **k19 remains `available: false`**, despite passing numerical,
roster and agreement checks. Its status and affected lists' notes disclose the gap.
No UI code or schema change was made.

### K18/K19 reproducibility without committed polling JSON

`node scripts/build-datasets.ts` validates the committed locality datasets against
`data/raw/kNN/localities.sha256.json` and each fingerprint's polling-source hash.
It checks every national/list/row total, roster counts/ranks, full agreement notice
and exact engine seats. With scratch present it additionally checks every locality
against the full polling table; without scratch it logs that this reconciliation is
skipped. CI still checks the reviewed locality SHA-256 and national results. K19
also checks its independent locality input and retained envelope aggregate. A hash
is an integrity check of the reviewed derivation, not independent source evidence.

To deliberately regenerate these aggregates after fetching scratch, run
`node scripts/lib/historical/k18-k19-common.ts --regenerate-localities`, review the
dataset and fingerprint diffs, then run the normal builder and tests. This explicit
command regenerates k18 from polling and k19 from polling only after independent
locality reconciliation. Ordinary builds never replace the accepted fingerprints.
The retained source IDs, hashes, locked dependencies and this command supply the
reproduction record; polling JSON remains ignored scratch. Tests are in
`tests/historical-k18.test.ts` and `tests/historical-k19.test.ts`.

K18/K19 integration note for the parent: the existing UI assumes that every
external-envelope row uses code 9999 (`Turnout.tsx` and `Panels.tsx`, plus the glossary).
These historical sources use code 0 (k18) and 875 (k19). The source codes are preserved;
the UI needs an election-aware envelope predicate and accurate derived-source labels
before its locality presets can exclude these rows correctly. No `src/app/` file was
changed in this branch, as required by the shared-file boundary.
