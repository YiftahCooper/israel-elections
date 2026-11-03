# Election data: coverage and remaining verification

The app offers **nine verified election datasets: k18–k26** (2009–2026). For each, the engine
reproduces every list's officially published seats, checked by `tests/historical-kNN.test.ts`
and `tests/engine.test.ts` (2026: the reported final count, pending gazettement).
Official sources for **k16–k17** (2003–2006) are retained, but those elections have not yet
passed every release gate; `public/data/elections.json` marks them unavailable.

## Sources by election

| Id | Election date | Official source files retained | Secondary data used | Still missing from a released dataset |
|---|---|---|---|---|
| k8 | 1973-12-31 | YP 1979 p. 608 national votes/seats; YP 1954 rosters; CBS totals | None | Unavailable: missing agreement set, four diagnostic seat mismatches, full winning rosters and complete period-law comparison |
| k9 | 1977-05-17 | YP 2326 pp. 1494–1496; YP 2319 rosters and all six agreements; CBS totals | None | Unavailable: Flatto-Sharon/Sheli seat mismatch; unfillable-seat legal procedure and other winning rosters unverified |
| k10 | 1981-06-30 | YP 2727 pp. 2190–2191; YP 2721 rosters; YP 2720 p. 2027 agreements (mirror); CBS totals | None | All seats reproduced; unavailable pending full winning rosters and complete period-law comparison; no localities |
| k11 | 1984-07-23 | YP 3081 pp. 3006–3008; YP 3073 rosters and four agreements (mirror); CBS totals | None | All seats reproduced; Alignment 120-person roster verified; other winning rosters and complete period-law comparison block release |
| k12 | 1988-11-01 | YP 3591 p. 242; YP 3588 rosters and five agreements p. 170; CBS totals | None | All seats reproduced; unavailable pending full winning rosters and complete period-law comparison; no localities |
| k13 | 1992-06-23 | Results YP 4021; candidates YP 4017; CBS totals; reviewed national table | No secondary inputs used | Unavailable: full winning rosters incomplete; agreement notice not recovered; all gazetted seats reproduced with no agreements assumed; no locality dataset (0080–0082) |
| k14 | 1996-05-29 | Results YP 4414; candidates YP 4408; complete six-pair YP 4411 notice (mirror); CBS totals | No secondary inputs used | Unavailable: winning rosters incomplete (Third Way complete); all seats reproduced; no locality dataset; secondary 550-vote error excluded (0080–0082) |
| k15 | 1999-05-17 | Results YP 4757; candidates YP 4748; recovered complete nine-pair YP 4755 notice (mirror); CBS totals | No secondary inputs used | Unavailable: full winning rosters incomplete; all gazetted seats reproduced; no locality dataset (0080–0082) |
| k16 | 2003-01-28 | Polling stations; CEC candidates/results; complete agreement notice YP 5151; official CBS totals; reviewed national transcription and locality digest | No secondary rosters; project derivatives labelled | Two gazette vote discrepancies (410 total); full rosters; locality committee metadata; release blocked |
| k17 | 2006-03-28 | Polling stations; CEC candidates/results; complete agreement notice YP 5510; official CBS totals; reviewed national transcription and locality digest | No secondary rosters; project derivatives labelled | Nine-invalid-vote discrepancy; full rosters; locality code/electorate/committee fields; release blocked |
| k18 | 2009-02-10 | Polling stations; CEC candidate/results gazettes; allocation memorandum; YP 5912 agreement notice (mirror) | None | Released; derived localities and sourced invalid-count exception disclosed (0040) |
| k19 | 2013-01-22 | Localities/polling; CEC candidate/results gazettes; final-results numeric capture; decisions book; YP 6530 agreements (mirror) | None | Released on the CEC final figures; gazette total/list differences disclosed, seats identical either way (0041, 0042) |
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
* Knesset 19's gazette prints **3,792,472**, but its own list counts sum to
  **3,792,742**. Final CEC web results and polling rows agree on the latter. Three
  list totals also differ: Likud +109, Kadima −107, Hayisraelim −2 (net zero).
  No official explanation or affected-station attribution was found. Decision 0041 records
  the evidence and search limits; decision 0042 releases k19 on the CEC final figures because
  both versions give exactly the same seats (tested in `tests/historical-k19.test.ts`). Meretz's
  datastore column `מרץ` is explicitly mapped to official `מרצ` and tested.
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

`node scripts/build-datasets.ts` builds every available election (k18–k26) with strict checks.
For k16–k17 it validates the retained evidence but emits no dataset.

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

## Knessets 8–12: national evidence and explicit release holds

The isolated k8–k12 preflights run during every data build, bind retained originals and
reviewed transcriptions to their manifest SHA-256 values, check national arithmetic,
check agreement membership and compare every list's seats through the application's
scenario-to-engine path. They emit **no public dataset** and reject a premature
`available: true` change. These are evidence preflights, not completed release builders.
Locality extraction was deliberately excluded: fixtures specify `hasLocalities: false`.
No locality file or station-derived count is published; fixture zero counts are placeholders.

| Election | Lists | Valid | Invalid | Cast (CBS) | Registered (CBS) | Agreement coverage | Allocation evidence |
|---|---:|---:|---:|---:|---:|---|---|
| k8 | 21 | 1,566,855 | 34,243 | 1,601,098 | 2,037,478 | Unknown; no pairs invented | Without agreement inputs: Alignment 52 vs 51, NRP 11 vs 10, Progress and Development 1 vs 2, Ratz 2 vs 3 |
| k9 | 22 | 1,747,820 | 23,906 | 1,771,726 | 2,236,293 | All six, YP 2319 p. 1319 | Uncapped Flatto-Sharon 2 vs 1; Sheli 1 vs 2; every other list matches |
| k10 | 31 | 1,937,366 | 17,243 | 1,954,609 | 2,490,014 | All three, YP 2720 p. 2027 | Every published seat, including zero-seat lists, matches; threshold 19,374, quota 15,312 |
| k11 | 26 | 2,073,321 | 18,081 | 2,091,402 | 2,654,613 | All four, YP 3073 p. 2839 | Every seat matches; threshold 20,734, quota 16,786 |
| k12 | 27 | 2,283,123 | 22,444 | 2,305,567 | 2,894,267 | All five, YP 3588 p. 170 | Every seat matches; threshold 22,832, quota 18,563 |

Every gazette list sum equals its printed valid total; valid plus gazetted invalid equals
CBS turnout. No vote was adjusted to reconcile a secondary table. The known IDI 1984
+90 and 1988 −365 (academic +6) row-sum errors are not imported. Exact gazette
spellings and punctuation are normalized only for readability, not replaced by modern
party identities. No default blocs are assigned. Display metadata is application-assigned.

The new agreement discoveries are **1981**, in the issue immediately preceding the
candidate gazette, and **1988**, inside the already retained candidate issue. Complete
numbered notices were read through their signatures, including ineffective pairs. The
1981 PDF is retained and registered with its olaw mirror explicitly disclosed. Originals
already under `data/raw/research/` are referenced rather than copied.

Roster coverage is deliberately partial: k9's entire one-person Flatto-Sharon list,
**שרון סמואל**, YP 2319 p. 1330, agrees with the elected name in YP 2326 p. 1496;
k11's entire **120-person Alignment roster**, YP 3073 p. 2826, has contiguous ranks
and its first 44 names checked against YP 3081 p. 3007. They are retained in
`candidates.reviewed.json`. K8/K10 Alignment first names and terminal rank 120 were
checked, not their complete rosters. No k12 roster has been transcribed. All remaining
winning rosters still need complete transcription and elected-rank comparison. No
untranscribed official roster is labelled absent from the archives or released as empty.

Decisions [0070](decisions/0070-1973-rules-and-unfillable-seat-hold.md) and
[0071](decisions/0071-k8-k12-national-evidence-release-holds.md) give legal verification
limits, the bounded 1973 agreement search and exact blockers. Reproduce the retained
checks with locked dependencies, `node scripts/build-datasets.ts` and `npx vitest run`;
no ignored scratch file is needed. Scan inspection used pdfjs-dist 6.5.438 with its
`wasmUrl` pointed at `node_modules/pdfjs-dist/wasm/`; renders stay in `.backup-scratch/`.

## Knessets 13–15: national evidence verified; releases held on rosters

The isolated k13/k14/k15 preflights check retained source hashes, every gazetted list
vote, national arithmetic, and every official seat through the app scenario pipeline.
All three allocate 120 seats without warnings. Knesset votes alone are used for 1996
and 1999; their separate prime-minister ballots are excluded. Gazette valid/invalid
plus official CBS cast/electorate reconcile exactly, without a list adjustment.
For k14 the gazette has Likud–Gesher–Tzomet **767,401**, excluding the secondary
tables' erroneous 550 extra votes. Decisions 0080–0082 record the evidence and limits.

1996's complete six-pair notice is YP 4411 p. 3398; 1999's newly recovered nine-pair
notice is YP 4755 p. 3305. Both are official statutory publications on a disclosed
olaw.org.il mirror. The 1992 notice remains unfound in the bounded search documented
in 0081; empty sourced agreement inputs reproduce seats but do not prove no agreements
existed. No pairs are inferred. No locality dataset has passed reconciliation; fixtures
use `hasLocalities: false` and no public locality file is emitted.

Reviewed candidate evidence covers Labor/Israel One's first ten names in each election
and all **12** Third Way candidates in 1996, checked against elected ranks. It does
**not** meet full winning-list roster coverage. All three remain unavailable and no
public k13/k14/k15 JSON is produced. Reviewed JSON and hashed primary sources are
committed; clean builds require no scratch or downloads. Full original rosters,
all-elected-rank cross-checks, later candidate amendments and an exhaustive historical
allocation-law amendment-chain check remain unverified. The exact 1.5% rule mapping,
original threshold amendment and original Bader–Ofer half-seats cap are documented
separately from those gaps.
