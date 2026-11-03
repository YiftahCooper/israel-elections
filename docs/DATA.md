# Election data: coverage and remaining verification

This checkout contains **four available election datasets: k16, k17, k25 and k26**.
The k16/k17 releases use the explicitly approved source precedence and per-list roster
fallback described below; they are **not full-roster releases**. Elections k18–k24
remain unavailable pending their independent release gates.

## Sources by election

| Id | Election date | Official source files retained | Secondary data used | Still missing from a released dataset |
|---|---|---|---|---|
| k16 | 2003-01-28 | CEC results/candidate scans; YP 5151 agreements; CBS electorate; retained reviewed roster and locality JSONs with hashes | Secondary membership identity cross-checks and Sharansky withdrawal report; roster spellings from scans | Available with 14 explicitly unavailable complete rosters; documented printed-vote discrepancy and UI caveats |
| k17 | 2006-03-28 | CEC results/candidate scans; YP 5510 agreements; CBS electorate; retained reviewed roster and locality JSONs with hashes | Secondary membership identity cross-checks; roster spellings from scans | Available with 13 explicitly unavailable complete rosters; documented nine-cast-vote discrepancy and UI caveat |
| k18 | 2009-02-10 | data.gov.il polling stations; CEC candidates and results gazettes | None | Verified candidate extraction, agreements and complete validation |
| k19 | 2013-01-22 | data.gov.il localities and polling stations; CEC candidates and results gazettes | None | Gazette corrections, verified candidate extraction, agreements and validation |
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
* Knesset 19's retained original results gazette says **3,792,472** valid votes, while the
  data.gov.il polling rows total **3,792,742**. The 270-vote difference needs an official
  correction or other explanation before asserting exact national reconciliation.
  The datastore also spells Meretz's column `מרץ`, versus ballot letters `מרצ` in Reshumot.
* The Knesset 24 results page succeeded on retry; a fallback national total is unnecessary.

## Knessets 16–17: available with explicit candidate limitations

Both national and locality datasets are built and `available: true`. Decisions
[0052](decisions/0052-k16-k17-national-and-locality-release-policy.md) and
[0053](decisions/0053-k16-k17-candidate-review-and-release-limitations.md) record the
owner-approved treatment, candidate counts/pages for every list and remaining limits.
They supersede the relevant release gates in 0050; 0051's historical-law caveat remains.

* **k16:** 27 lists. Use official polling list votes, including Mafdal **132,370** and
  Lider **833**. YP 5155 p. 1406 prints **132,730** and **883**, making its list sum
  **3,148,774**, **410 above** its own valid total **3,148,364**. Both printed figures
  and the inconsistency remain in Hebrew list notes. The official Knesset historical
  table corroborates Mafdal 132,370; no formal correction is asserted. Gazette valid
  **3,148,364** and invalid **52,409** imply cast **3,200,773**. Official CBS supplies
  registered **4,720,075**. With polling votes, the threshold is **47,226**, quota
  **25,138**. Using the inconsistent printed votes instead gives threshold **47,232**,
  quota **25,141**, and **exactly the same seats for every list**; tests assert both.
* **k17:** 31 lists. All list counts match the gazette and polling sums. Use gazette
  valid **3,137,064**, invalid **49,684**, and cast = their sum **3,186,748**. CBS
  supplies registered **5,014,622**. Polling cast **3,186,739** is **9 lower**, implying
  invalid **49,675**; CBS corroborates the lower turnout. No authoritative explanation
  is known. Preserve the gap rather than altering locality rows. Threshold **62,742**,
  quota **24,619**; every gazetted seat reproduces.

The retained official CBS table (`data/raw/k16/cbs-national-summary.pdf`, table 27.2,
29 August 2023, source CEC) is referenced by both elections. Dataset status and SOURCES
explicitly distinguish its electorate from gazette valid/invalid totals and derived cast.

Agreements are the complete previously reviewed official notices: **YP 5151 p. 1312**
(six pairs: Labor–Meretz, Shinui–Greens, National Union–Yisrael BaAliyah, Mafdal–Am Ehad,
Shas–UTJ and Hadash–Balad) and **YP 5510 p. 2386** (four: Labor–Meretz, Shas–UTJ,
Hadash–Balad and Yisrael Beiteinu–Likud). Notices are primary publications obtained
from the disclosed olaw.org.il mirror, not inferred from seat reproduction.

Locality JSONs contain **1,172 / 1,150** groups, including one explicitly flagged
double-envelope row each. Bilingual notes explain they are sums of official polling
stations because no official locality table exists. k16 retains source numeric codes;
k17 code and registered are null. Committee is null in both. Envelope registered is
null, excluding the bogus repeated “voters” field. Counts excluding envelopes are
**1,171 / 1,149** localities. k16 has **7,885** actual polling rows (one separate EOF
sentinel excluded); k17 **8,426**; both include **149** envelope batches.

Candidate scans were rendered with pdfjs and its local `wasmUrl`, then visually
transcribed. The retained `candidates.reviewed.json` files contain page references,
last printed ranks and either contiguous complete names or the explicitly authorized
per-list unavailable fallback. **295 / 664 candidate names** are published. **14 / 13
complete rosters remain unverified**, with `candidatesUnavailable: true`, empty arrays
and Hebrew reasons naming unresolved ranks. This does not mean no official roster
exists. Likud 2003 has exactly **114** names beginning **שרון אריאל**; Kadima 2006 has
**120**, beginning **אולמרט אהוד**. No padding or guessed names are published.

For every winning list, the reviewed artifact records elected identity cross-checks
and a second reading of the next five non-elected scan ranks, even when the complete
roster remains unavailable. Official Knesset membership pages were inaccessible;
**labelled secondary membership tables** were used, reversing subsequent replacements
rather than comparing with end-of-term membership. Yisrael BaAliyah 2003 has a real
exception: Sharansky #1 withdrew after the election; Edelstein #2 and Solodkin #3 served
at inauguration. The registered roster remains in its printed order, with an explanatory
note and a contemporaneous Ynet source. The source manifest distinguishes successful
secondary evidence from failed official-page attempts.

**Known app limitations (no app files changed):** the existing candidate-capacity warning
treats missing rosters as vacant seats and the candidate panel says “No candidates registered”, and the elected-name view selects the first n
registered candidates without applying Sharansky's withdrawal. Those are UI/model
limitations, not claims that historical seats were vacant or that Sharansky was sworn in.

`localities.reviewed.json` retains the rows themselves, not just a digest. The builder
checks manifest SHA-256, every row's arithmetic and list sums, the original compact-row
digest, candidate rank integrity and retained membership/reserve evidence. If polling
scratch exists it repeats all station aggregation; otherwise it explicitly logs the
skipped additional check and rebuilds from retained inputs. The original national review
and reconciliation JSONs remain historical evidence of the source disagreements.

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

`node scripts/build-datasets.ts` builds **k16/k17/k25/k26**. The k16/k17 tests read the
public datasets and verify every official seat, era threshold/quota, agreement pairs,
national totals, locality columns and explicit candidate counts/limitations. k18–k24
remain unbuilt. To simulate a clean checkout, move `.backup-scratch/raw` aside, rebuild,
and restore it; k16/k17 retained reviewed JSONs and digests suffice without those copies.
