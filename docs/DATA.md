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
| k18 | 2009-02-10 | data.gov.il polling stations; CEC candidates and results gazettes | None | Verified candidate extraction, agreements and complete validation |
| k19 | 2013-01-22 | data.gov.il localities and polling stations; CEC candidates and results gazettes | None | Gazette corrections, verified candidate extraction, agreements and validation |
| k20 | 2015-03-17 | data.gov.il localities and polling stations; CEC candidates and results gazettes; agreement notice YP 7001 | None | Verified candidate extraction and complete validation |
| k21 | 2019-04-09 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 8168; agreement notice YP 8178 | None | Verified candidate extraction and complete validation |
| k22 | 2019-09-17 | CEC national HTML; data.gov.il localities and fully reconciled polling stations; candidate gazette YP 8420; complete agreement notice YP 8430 (mirror) | None | Released: all seats reproduced; electorate disagreement disclosed below; rosters are gazette snapshots |
| k23 | 2020-03-02 | CEC national HTML; data.gov.il localities and fully reconciled polling stations; candidate gazette YP 8698; complete agreement notice YP 8708 (mirror) | None | Released: all seats reproduced; gazetted rosters, including explicitly withdrawn Tzomet |
| k24 | 2021-03-23 | CEC national HTML; data.gov.il localities and fully reconciled polling stations; candidate gazette YP 9476; complete agreement notice YP 9478 (mirror) | None | Released: all seats reproduced; rosters are gazette snapshots |
| k25 | 2022-11-01 | CEC HTML, data.gov.il localities and polling stations, candidate gazette and CEC agreement press release | None | No extension-specific gap; existing engine reproduction test passes |
| k26 | 2026-10-27 | CEC locality/polling CSVs, captured official candidate pages, agreement gazette | Two rosters: bechirot.fyi, explicitly marked secondary | Gazetted final seats remain unavailable in the existing dataset |

The three historical agreement PDFs are **primary statutory publications retrieved from
an olaw.org.il mirror**, not independent secondary descriptions. Their manifest publisher,
URL and description explicitly disclose the mirror. Pair parsing and completeness still
require verification. No historical agreements have been inferred from engine output.

All downloads have URL, publisher, retrieval time, byte size and SHA-256 in
`data/raw/SOURCES.json`. A source's presence establishes provenance, not successful parsing.
No unparsed roster is represented as an empty, supposedly complete roster in an app dataset.

## K22–K24 verified datasets

K22, K23 and K24 are built by their isolated modules in `scripts/lib/historical/`.
Every published seat count, including zero-seat lists, is reproduced through the
application's scenario-to-engine path in `tests/historical-kNN.test.ts`. The tests
also fix national totals, thresholds/quotas, every roster count, party leaders and all
agreement pairs. All candidate data is official: 1,205 candidates in K22, 1,097 in K23,
and 1,406 in K24. No schema extension or secondary/unavailable candidate flag is needed.
The rosters are the approved-list gazette snapshots, before subsequent resignation
notices, rather than a reconstruction of amended election-day or later membership.
This limitation is stated in dataset status; known relevant notices appear in list notes.
No default blocs are assigned (decision 0021).

The complete statutory notices are YP 8430 p. 14634 (K22, five pairs), YP 8708
pp. 4468–4469 (K23, three pairs), and YP 9478 p. 4284 (K24, six pairs), retained
from the disclosed olaw.org.il mirror. This includes K22 Noam–Otzma Yehudit and K24
New Economic Party–Blue and White, whose partners do not both qualify. Exact seats
verify effective agreement behaviour; completeness comes from reading each entire
numbered notice through its signature, not from allocation output.

K22's CEC national electorate is **6,394,030**, but both geographical sources sum to
**6,391,218**. Only registered voters differ, by **2,812**; every list vote and all
valid/invalid/cast totals reconcile exactly. The dataset uses the explicit final national
electorate and leaves locality figures unchanged. The cause has not been verified;
dataset status discloses both totals. Decision 0020 records the reasoning and exact gate.
K23 and K24 national figures agree with the geographical sums without an exception.

K22–K24 CI evidence lives in each `data/raw/kNN/reconciliation.json`. It binds the
polling-source and locality-source SHA-256 values, station count, the station-derived
locality vote rows sorted by code, and the entire generated locality dataset. A build
with `.backup-scratch/raw/kNN/ballots.datagov.json` runs full reconciliation. A build
without it logs the skipped full check and still requires the retained source hashes
and generated locality digests to match. Tests compare committed datasets to rebuilt
outputs. No polling JSON is committed. This is retained verification evidence, not a
fresh polling check in CI or a CEC signature.

To reproduce K22–K24 verification, install locked dependencies with `npm ci`, run
`node scripts/fetch-sources.ts`, `node scripts/build-datasets.ts`, and `npx vitest run`.
If an intentionally updated source requires new reconciliation evidence, first investigate
the change and then explicitly write `reconciliationRecord(n)` from
`scripts/lib/historical/k22-k24-common.ts` as formatted JSON plus a newline to the
corresponding `data/raw/kNN/reconciliation.json`. That exported function requires the
real polling download and fails unless the national and locality checks pass. Rebuild
and review the resulting data changes; normal builds never rewrite this evidence.

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
* Knesset 19's retained original results gazette says **3,792,472** valid votes, while the
  data.gov.il polling rows total **3,792,742**. The 270-vote difference needs an official
  correction or other explanation before asserting exact national reconciliation.
  The datastore also spells Meretz's column `מרץ`, versus ballot letters `מרצ` in Reshumot.
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
