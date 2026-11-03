# Election data: coverage and remaining verification

The app offers **seven verified election datasets: k20–k26** (2015–2026). For each, the engine
reproduces every list's officially published seats, checked by `tests/historical-kNN.test.ts`
and `tests/engine.test.ts` (2026: the reported final count, pending gazettement).
Official sources for **k16–k19** (2003–2013) are retained, but those elections have not yet
passed every release gate; `public/data/elections.json` marks them unavailable.

## Sources by election

| Id | Election date | Official source files retained | Secondary data used | Still missing from a released dataset |
|---|---|---|---|---|
| k16 | 2003-01-28 | Polling stations; CEC candidates/results; complete agreement notice YP 5151; official CBS totals; reviewed national transcription and locality digest | No secondary rosters; project derivatives labelled | Two gazette vote discrepancies (410 total); full rosters; locality committee metadata; release blocked |
| k17 | 2006-03-28 | Polling stations; CEC candidates/results; complete agreement notice YP 5510; official CBS totals; reviewed national transcription and locality digest | No secondary rosters; project derivatives labelled | Nine-invalid-vote discrepancy; full rosters; locality code/electorate/committee fields; release blocked |
| k18 | 2009-02-10 | data.gov.il polling stations; CEC candidates and results gazettes | None | Verified candidate extraction, agreements and complete validation |
| k19 | 2013-01-22 | data.gov.il localities and polling stations; CEC candidates and results gazettes | None | Gazette corrections, verified candidate extraction, agreements and validation |
| k20 | 2015-03-17 | data.gov.il localities and polling stations; CEC candidate gazette YP 7000, results YP 7010; agreement notice YP 7001 (mirror) | None | Released: every list’s seats reproduced; all 1,196 locality rows reconcile with 10,414 polling rows; 1,284 registered candidates; complete four-pair notice |
| k21 | 2019-04-09 | data.gov.il localities and polling stations; CEC national HTML; candidate gazette YP 8168; agreement notice YP 8178 (mirror) | None | Released: every list’s seats reproduced; all 1,214 locality rows reconcile with 10,765 polling rows; 1,580 registered candidates; complete six-pair notice |
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

## Knessets 16–17: verified progress, not released datasets

Both remain `available: false`, with no `k16.json`, `k17.json` or public locality files.
The per-election preflights run during `build-datasets.ts`, validate retained evidence and
refuse a premature availability change. They return no public build jobs while blocked.
This is intentional partial implementation, not a claim that either release builder is complete.

* **k16:** results gazette YP 5155 p. 1406 prints Mafdal **132,730** and Lider **883**;
  polling sums are **132,370** and **833**. Printed counts sum to **3,148,774**, whereas
  the gazette's valid total and polling sum are **3,148,364**. The Knesset's official
  allocation example supports Mafdal's polling count; no formal correction was verified
  for either difference. Invalid **52,409**, cast **3,200,773**. Excluding the envelope
  batches' repeated “voters” field gives electorate **4,720,075**, matching official CBS.
  There are **7,885** polling rows, including **149** envelope batches; one separate XLS
  EOF record is explicitly excluded. The **1,172** research locality groups include the
  envelope group. Committee identifiers are missing and remain null in research rows.
* **k17:** all **31** gazetted list counts and **3,137,064** valid votes agree exactly
  with **8,426** polling rows (including **149** envelope batches). Gazette invalid is
  **49,684**, but datastore cast **3,186,739** minus valid is **49,675**. Official CBS
  corroborates that turnout and electorate **5,014,622**. No correction explaining the
  nine votes was verified. The source supplies neither numeric locality codes, electorate
  nor committee identifiers; **1,150** research groups use exact trimmed locality names.
  Required unknown fields stay null; these research rows are not `LocalityDataset` files.

Neither results gazette states registered voters or total turnout. The retained official
CBS table (`data/raw/k16/cbs-national-summary.pdf`, table 27.2, source CEC) supplements
those facts; the transcriptions explicitly use null for their absence from the gazette.

Agreements were read in full from official scanned notices mirrored by olaw.org.il:
**YP 5151 p. 1312** (26 January 2003) contains all six pairs: Labor–Meretz,
Shinui–Greens, National Union–Yisrael BaAliyah, Mafdal–Am Ehad, Shas–UTJ and Hadash–Balad.
**YP 5510 p. 2386** (26 March 2006) contains all four: Labor–Meretz, Shas–UTJ,
Hadash–Balad and Yisrael Beiteinu–Likud. Completeness is from the entire notices,
including their final pair and signature, not inferred from the seat outcome.

Tests reproduce **every list's gazetted seats** through the application scenario pipeline
using explicitly labelled research fixtures with polling counts. k16: threshold **47,226**,
quota **25,138**; k17: threshold **62,742**, quota **24,619**. This verifies allocation,
not the missing release gates. Candidate checks cover only the largest list's first name
and terminal rank: Likud's **שרון אריאל**, **114** names in YP 5148 pp. 1197–1198;
Kadima's **אולמרט אהוד**, **120** in YP 5504 pp. 2192–2193. Full rosters, contiguous
ranks and counts for all other lists remain unverified. No secondary roster or fabricated
name was used, and no `candidatesUnavailable` field was added: verifiable scans exist.

Each `data/raw/kNN/national.reviewed.json` preserves the gazette values, discrepancy
records and partial candidate checks. Each `reconciliation.reviewed.json` retains per-list
polling sums, source SHA-256 and the SHA-256 of derived research locality rows. The rows
are reproducible by `derivePolling()` in `scripts/lib/historical/k16-k17-common.ts` from
fetched scratch input; its comment defines ordering and serialization. No polling JSON
or intermediate render is committed. When scratch is absent the build logs a clear
polling-check skip, but still checks retained source/derivative hashes, national arithmetic,
agreement structure and every official seat. This does not independently validate missing
locality rows. Decisions **0050–0051** record the evidence and the historical-law caveat.

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

`node scripts/build-datasets.ts` builds every available election (k20–k26) with strict checks.
For k16–k17 it validates the retained evidence but emits no dataset; k18–k19 are not yet built.

## K20 and K21 release verification

K20 and k21 are built by their isolated modules in `scripts/lib/historical/`. Their
per-election tests check independently transcribed official seats for every list, totals,
threshold/quota, every roster's audited final rank, major-list leaders, and the complete
numbered agreement notices. K20 uses the gazetted original final result (YP7010); k21
uses the CEC final national HTML. No secondary or unavailable rosters are used. Both
datasets leave optional blocs empty. Candidate order is the official registration order,
with known k20 resignation notices explicitly labelled; later membership and the complete
history of withdrawals/resignations are outside scope. Regional committees are absent
from these sources and use sentinel 0. See decision [0030](decisions/0030-k20-k21-release-evidence.md).

K20's gazette omits the electorate: the two official data.gov.il tables both total
5,881,696 registered voters. They match every gazetted list vote, 4,210,884 valid and
43,854 invalid ballots (4,254,738 cast). K21's HTML and both tables agree on all list
votes, 6,339,729 registered, 4,340,253 cast, 4,309,270 valid and 30,983 invalid.
K20's threshold/quota are 136,854/33,511; k21's are 140,052/32,860. The candidate
parser retains the singleton k20 roster יך, normalizes the text-layer rank “01” to 10
for יץ, and coalesces only identical duplicate ranks אמת #100 and שס #70 in k21.

For k20/k21, `locality-verification.json` in each raw directory retains the SHA-256 of
canonical derived locality rows, the official polling file SHA-256, and polling row count.
The builders always verify locality sums against official national figures and the retained
digest. When scratch polling files exist they also reconcile every locality/list/ballot total
exactly. A clean-checkout build explicitly logs that full polling reconciliation was skipped
and verifies the retained digest instead; the historical tests also hash the committed
public locality rows. Recover polling files with the existing `fetch-sources.ts` command
for full verification. No polling JSON is committed. Evidence is never rewritten by a build;
if source data changes, review it and repeat full reconciliation before replacing its digest.
The canonical representation and regeneration parameters are recorded once in decision 0030.
