# Election data: coverage and remaining verification

The app offers **twenty-six verified election datasets: every election from 1949 to 2026**. For each, the engine reproduces every list's officially published seats, checked by
`tests/historical-kNN.test.ts` and `tests/engine.test.ts` (2026: the reported final count, pending gazettement).
Rosters list everyone elected; many lists' later candidates (and some rosters of lists without seats) are not
transcribed, and the data says so.

## Locality demographic groups

k16 and k18–k26 locality datasets now include sourced geographic groups with bilingual definitions,
classification years, CBS-code membership and coverage. k17 explicitly has no groups: its locality
rows lack both CBS codes and registered electorates. Groups describe **places, not people**;
mixed Jewish–Arab cities and double envelopes are excluded from ethnic/religious membership.
See [definitions, retained sources, model contract and per-election coverage](research/locality-demographics.md)
and [decision 0090](decisions/0090-demographic-turnout.md). The ordinary dataset build attaches the
classifications deterministically and verifies source hashes; it requires no network access.

## Source policy

Official sources come first: the law, the Central Elections Committee, Reshumot, the Knesset (including its
OData service), the Central Bureau of Statistics and gov.il. Secondary sources are labelled as such in
`SOURCES.json` and in the app. **English-language Wikipedia is never used, cited or linked**: the owner
considers it unreliable on Israel-related information. Hebrew Wikipedia may serve only as a lead to an
official document or as a labelled secondary source. Evidence tiers, corroboration and the certainty of
historical claims follow [source-policy.md](source-policy.md).

## Party, bloc, colour and candidate metadata

All 26 elections have research inputs in `data/meta/kNN.json`. These record constituent
parties of joint lists, sourced candidate affiliations, per-election bloc schemes and
associated colours, with sources, confidence and caveats. Hebrew Wikipedia is labelled
secondary; English Wikipedia is never used or linked. See the [metadata format and research
logs](../data/meta/README.md) and [decision 0087](decisions/0087-constituent-parties-blocs-and-colours.md).
The election tables below describe results and roster sources; metadata has its own evidence.

The build merges these inputs through `scripts/lib/build/meta.ts`: ballot letters become
list ids, recorded candidate ranks gain party ids, and bloc membership resolves to lists,
parties or individual candidates. The default is the first government formed after the
election, otherwise pre-election blocs, otherwise another recorded scheme. Regrouping seats
does not change votes or seat allocation. Sources and research caveats remain in `data/meta/`;
the generated dataset carries the fields the app needs, rather than the full evidence record.

An associated list or constituent-party colour needs **medium or high confidence** and
CIE **L* 25–82** for readability in both themes. List colours also undergo a **ΔE76 ≥20**
check between neighbouring seat-winning lists in seat order. A colliding associated colour
falls back to the cross-election app colour, normally for the smaller list first; the build
does not shift its lightness. Constituent-party colours receive the confidence and lightness
checks, but not this neighbour check; a party without one uses its list's colour. These are
display colours, not a claim that every colour is an official party specification.

`data/meta/candidate-notes.json` holds six sourced bilingual notes: the 1984 Eliyahu Speiser
misprint and five replacements before a Knesset's first sitting (Kol, Sharansky, Shohat,
German and Davidi). `scripts/lib/build/notes.ts` adds the notes and Speiser's corrected
`displayNameHe`, preserving the candidate notice's `nameHe`. Notes appear in the roster and
chamber tooltip; they never substitute a replacement member or change seats. A missing
candidate id fails the build. See [decision 0088](decisions/0088-roster-corrections-and-odata-audit.md)
and the [official membership audit](research/elected-names-odata-audit.md).

Party logos (`data/meta/logos/kNN.json`, attached by `scripts/lib/build/logos.ts`) are shown only when a
verified copy of the logo used at that election is held in `public/logos/`, with `rights` set to
`free-licence` or `fair-use-identification`, its licence/rights notice, attribution and source.
New fair-use entries require an official origin and campaign-use date; archives record their URL and timestamp.
Final bytes and SHA-256 are checked, and original SHA-256 is retained. Newly retained campaign evidence lives under `data/raw/logos/kNN/`, registered in
`data/raw/SOURCES.json` with `archiveUsed` and separate `captureTimestamp` metadata. Logo entries
and their source cards use optional `rawEvidence.page` / `rawEvidence.asset` manifest IDs; the logo
validator verifies the retained files offline. Page/use and asset capture timestamps remain distinct. Constituent entries keyed by party id
attach to `list.parties[].logo`; joint lists retain their own emblems. A party objection means removal
([decision 0089](decisions/0089-party-logos-fair-use.md)); the Sources tab lists the credits. Lists and constituents without election-specific evidence use Hebrew ballot letters in both interface languages. Cross-election logo reuse is disabled (0089 addendum, 5 November 2026).

Candidate biography links (`data/meta/bios/kNN.json`, attached by `scripts/lib/build/bios.ts`) follow the
same order: the Knesset's member page (official), the party's own page (partisan, archived from the campaign
where possible) and Hebrew Wikipedia (shown as a secondary source). Matches made by name rather than an
official identifier are shown as "probable". The build fails on an unknown candidate id or an English Wikipedia
link, and imported scenarios may carry only `https:` links. Method and coverage: `docs/research/candidate-bios.md`.

## Sources by election

| Id | Election date | Official source files retained | Secondary data used | Still missing from a released dataset |
|---|---|---|---|---|
| k1 | 1949-01-25 | Results and candidate gazettes; CBS totals; CEC allocation appendix; five connections; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0063) |
| k2 | 1951-07-30 | Results and candidate gazettes; CBS totals; YP 177 connection notice; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0064) |
| k3 | 1955-07-26 | Results and candidate gazettes; CBS totals; YP 427 five-pair notice; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0065) |
| k4 | 1959-11-03 | Results and candidate gazettes; CBS totals; YP 709 two connection notices; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0066) |
| k5 | 1961-08-15 | Results and candidate gazettes; CBS totals; YP 865 three-pair notice; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0067) |
| k6 | 1965-11-02 | Results and candidate gazettes; CBS totals; YP 1225 two-pair notice; corrected reviewed connections; reviewed roster prefixes | None | Released national dataset; all seats and 120 elected names verified; later ranks, losing rosters and localities omitted (0069a) |
| k7 | 1969-10-28 | Results and candidate gazettes; CBS totals; YP 1565 one-pair notice; reviewed national table; reviewed roster prefixes | None | Released national dataset; winning prefixes and elected cross-checks verified; later ranks, losing rosters and localities omitted (0069) |
| k8 | 1973-12-31 | Results YP 1979 and candidate YP 1954 gazettes; CBS totals; CEC Form 30 appendix (connections, pair splits, elected list); reviewed national table and roster prefixes | Hebrew Wikipedia only as a lead to the CEC appendix | Released national dataset; winning prefixes (Ratz complete) and elected cross-checks verified; later ranks, losing rosters and localities omitted (0077) |
| k9 | 120 across all 13 winners | 120/120 (119 gazette + 1 official Knesset OData) | released |
| k10 | 120 across all 10 winners | 120/120 | released |
| k11 | 196 across all 15 winners, including complete Alignment 120 | 120/120 | released |
| k12 | 121 across all 15 winners | 120/120 | released |
| k13 | 1992-06-23 | Results YP 4021; candidates YP 4017; CBS totals; reviewed national table | No secondary inputs used | Released: every elected name cross-checked in 121 registered candidates; all winning rosters truncated; zero-seat rosters unavailable; agreement notice not recovered (possibly missing ineffective pairs); every seat reproduced; no localities (0083–0086) |
| k14 | 1996-05-29 | Results YP 4414; candidates YP 4408; complete six-pair YP 4411 notice (mirror); CBS totals | No secondary inputs used | Released: every elected name cross-checked in 129 registered candidates; Third Way full (12), other winners truncated; zero-seat rosters unavailable; six agreement pairs; every seat reproduced; no localities; secondary 550-vote error excluded (0083–0086) |
| k15 | 1999-05-17 | Results YP 4757; candidates YP 4748; recovered complete nine-pair YP 4755 notice (mirror); CBS totals | No secondary inputs used | Released: every elected name cross-checked in 122 registered candidates; all winning rosters truncated; zero-seat rosters unavailable; nine agreement pairs; every seat reproduced; no localities (0083–0086) |
| k16 | 2003-01-28 | CEC results/candidate scans; YP 5151 agreements; CBS electorate; retained reviewed roster and locality JSONs with hashes | Prior secondary membership checks and Sharansky withdrawal report; elected-name comparison now uses official notices | All 120 elected ranks covered; 10 truncated winning rosters, 4 unavailable non-winning rosters; printed-vote discrepancy and withdrawal caveat |
| k17 | 2006-03-28 | CEC results/candidate scans; YP 5510 agreements; CBS electorate; retained reviewed roster and locality JSONs with hashes | Prior secondary membership checks; elected-name comparison now uses official notices | All 120 elected ranks covered; 7 truncated winning rosters, 6 unavailable non-winning rosters; nine-cast-vote discrepancy |
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
The original release left blocs empty (decision 0021); the metadata merge now supplies
sourced schemes and a default grouping (0087).

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

## Knessets 16–17: available with explicit candidate limitations

Both national and locality datasets are built and `available: true`. Decisions
[0052](decisions/0052-k16-k17-national-and-locality-release-policy.md) and
[0053](decisions/0053-k16-k17-candidate-review-and-release-limitations.md) record the
owner-approved treatment and the earlier roster limitations.
[0054](decisions/0054-k16-k17-elected-roster-coverage.md) supersedes 0053's winning-list
unavailable fallback: every winning list must publish at least all elected ranks, with
`candidatesTruncated: true` when later registered ranks are omitted. It records current
counts/pages and official elected-name comparisons. The other source limitations in
0052 and historical-law caveat in 0051 remain.

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

Candidate and results scans were rendered at **scale 4** with locked **pdfjs-dist 6.5.438**,
`wasmUrl` pointing to `node_modules/pdfjs-dist/wasm/`, and `@napi-rs/canvas 1.1.0`.
Every winning list now includes ranks **1..seats** or its already complete roster:
**13 / 12 winning lists**, **120 elected ranks each**, and **368 / 719 total published
candidate names**. The previously unavailable winning lists publish exactly their elected
prefixes (**73 / 55 added names**). Their remaining ranks are omitted, with
`candidatesTruncated: true` and bilingual coverage reasons. **10 / 7 winning rosters**
are truncated; **4 / 6 non-winning rosters** still have `candidatesUnavailable: true`,
empty arrays and the original unresolved-rank reasons. Complete rosters have neither flag.
Likud 2003 retains **114** candidates; Kadima 2006 retains **120**. No guessed names
or padding are published. Full coverage tables are in 0054.

The retained `candidates.reviewed.json` files independently transcribe **section 4** of
**YP 5155 pp. 1407–1408** and **YP 5514 pp. 2465–2468**. Every elected registered name
is compared in rank order with that notice, with page references and explicit literal
name variants (given-name order, punctuation or hyphenation). Both readings are retained;
tests accept only the enumerated differences, never general fuzzy matching. The official
results notice also resolves the 2006 Yisrael Beiteinu wrapped surname: **אהרון-** is the
continuation of **לנדבר** at rank 7, not rank 8's given name. The candidate-notice trailing
hyphen is retained; the results notice omits it. Earlier readings of **חסון ארדי ישראל**
and Labor's **מגדלה גאלב** are corrected from both scans. No elected identity or rank
replacement between the candidate and results notices was found.

The membership identity cross-check now uses the Knesset's official OData service
(`k16-membership-odata`, `k17-membership-odata`; retained snapshots in `data/raw/k16|k17/knesset-odata-members.json`).
The same check now covers every election (`kNN-membership-odata`, 4 November 2026). It led to 53 scan-verified
roster corrections in 1949–1999, including 1988 Likud #25 (Reiser) not seated and #32 (Goldberg) restored.
Every remaining difference is explained in [the audit](research/elected-names-odata-audit.md).
All 120 elected members of each Knesset match the opening membership apart from spelling and short-name
forms, except the Sharansky/Solodkin case below, which the OData opening membership confirms.
The earlier secondary membership comparisons remain under `previousMembershipCrossCheck`
for history; they do not supply the new names or the official cross-check. The distinct
post-election exception remains: Sharansky #1 and Edelstein #2 are both printed as elected
in the 2003 results notice, but Sharansky later withdrew and Solodkin #3 served at
inauguration (0053, contemporaneous secondary Ynet report). The registered roster stays
in printed order. An official withdrawal/correction notice has not been verified.

**Application limits (no app/model files changed):** the elected-name view still selects
the first n registered candidates without applying Sharansky's withdrawal. All official
seats now have candidate coverage; scenarios awarding more seats than a retained prefix
can exhaust the transcribed names. Truncation discloses missing later ranks, not the
absence of further registered candidates. Unavailable rosters now belong only to lists
that won no seats.

`localities.reviewed.json` retains the rows themselves, not just a digest. The builder
checks manifest SHA-256, every row's arithmetic and list sums, the original compact-row
digest, candidate rank/coverage flags, official elected-name comparisons and retained
reserve evidence. If polling scratch exists it repeats all station aggregation; otherwise it explicitly logs the
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

`node scripts/build-datasets.ts` builds every available election with strict checks.

## K20 and K21 release verification

K20 and k21 are built by their isolated modules in `scripts/lib/historical/`. Their
per-election tests check independently transcribed official seats for every list, totals,
threshold/quota, every roster's audited final rank, major-list leaders, and the complete
numbered agreement notices. K20 uses the gazetted original final result (YP7010); k21
uses the CEC final national HTML. No secondary or unavailable rosters are used. Both
datasets now gain sourced bloc schemes through the metadata merge (0087). Candidate order
is the official registration order,
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
The approved פח roster is retained with zero votes and withdrawn status: all 12 candidates resigned (YP 5912 p. 2254). Locality zero columns are appended after the original source fingerprint is validated.

Decision 0040 documents the national exception: YP 5917 prints 49,684 invalid votes,
but the CEC allocation memorandum and polling table agree on 43,097. National totals
are 5,278,985 registered, 3,416,587 cast, 3,373,490 valid. The envelope summary's
186,919 registered field is retained geographically but excluded from the national
registered sum, avoiding double counting voters already registered in their home
localities. `ballotBoxes` counts 9,264 source rows, including that single aggregate
row; it is not a claim about the physical number of envelope boxes. Regional committee
is absent and represented by 0, labelled in status. Sponsoring-party fields are
empty/null because those affiliations are not stated separately in this gazette.
Sourced bloc schemes and eligible associated colours now come from `data/meta/` (0087);
display names and fallback colours are editorial metadata.

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
zero-vote rosters זה and פך are absent from the final participating-list table. The CEC
[20 January notice](https://www.gov.il/apps/elections/elections-knesset-19/heb/cec/NoticeList49f6.html?NoticeType=ann)
confirms עתיד אחד (זה) withdrew; its
[17 January notice](https://www.gov.il/apps/elections/elections-knesset-19/heb/cec/NoticeListc4dc.html?NoticeId=242)
confirms נצח (פך) withdrew. These approved rosters remain recoverable from YP 6524;
they are not represented as participating lists or as zero-vote electoral failures.

All 1,184 independent locality rows agree exactly with their polling sums. Code 875
(external envelopes) is absent from that file: its row is derived from 228 polling
records and retained as `data/raw/k19/envelopes.derived.json`, with source hash.
Together the 1,185 rows reconcile with all 10,109 polling records and national totals.
The external group contributes 212,949 valid, 2,840 invalid, 215,789 cast and zero
registered. Regional committee is unavailable (0); sponsors are empty/null and no
blocs are inferred. Dataset status labels the derived envelope row through this
source decision and the outstanding discrepancy; all rosters use official evidence.

Decision 0041 distinguishes the printed grand-total inconsistency from the net-zero
three-list differences. YP 6546 (12 February 2013), p.2874 formally corrects the
total to 3,792,742; the retained correction does not amend list votes. Decision
0042 released k19 (`available: true`) on the disclosed final CEC figures. The
remaining rank-1 list-vote conflict is recorded in the k19 audit resolution.
The decisions book does not establish station origins for the three differences.

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

## K1–K7: seven national releases

The owner-approved roster standard for these elections is a **contiguous registered
prefix from rank 1 covering every elected member**, checked name by name against the
official results notice. Complete later ranks are optional. This standard releases
**k1–k7**. Decisions 0063–0069 and 0069a supersede 0061–0062's
holds election by election; 0069a resolves the k6 hold in 0068. The earlier decisions and research document remain dated
investigation records, not current release status.

| Id | Valid votes | Lists | Quota | Complete connection evidence | Result | Winning lists / registered names / elected identities checked |
|---|---:|---:|---:|---|---|---|
| k1 | 434,684 | 21 | 3,592 | CEC allocation appendix p.5 (PDF p.6): ב–ל, ט–יג, יא–יד, מ–ת, ס–צ | All seats match; both choices in an integer-quotient tie yield the same totals | 12 / 128 / 120 |
| k2 | 687,492 | 17 | 5,692 | YP 177 p.1177: צ–סצ | All seats match | 15 / 120 / 120 |
| k3 | 853,219 | 18 | 6,938 | YP 427 p.1053: א–יד, פ–ש, צ–צח, סצ–ל, נ–ע | All seats match | 12 / 120 / 120 |
| k4 | 969,337 | 24 | 7,800 | YP 709 p.125: א–רא, יא–ע | All seats match; resolves former Mapai/Cooperation gap | 12 / 120 / 120 |
| k5 | 1,006,964 | 15 (14 contested) | 8,332 | YP 865 p.1843: ב–ד, מ–תו, יא–רא | All seats match | 11 / 122 / 120 |
| k6 | 1,206,728 | 17 | 9,881 | YP 1225 p.189: את–רא, כא–כנ | All seats match; corrected misread partner רא (Progress and Development), formerly יא | 13 / 120 / 120 |
| k7 | 1,367,743 | 16 | 11,274 | YP 1565 p.246: יא–רא | All seats match | 13 / 120 / 120 |

All seven national tables reconcile list votes and invalid/cast/registered totals
with retained CBS table 27.2. Each release preserves every gazetted list, including
zero-seat lists. No secondary vote correction or fitted agreement is used. The
1949 and 1959 one-seat differences were resolved by **contemporary official
connection evidence**, with the existing rules. The 1965 difference came from a
transcription error in the retained notice: **את–רא**, not את–יא. Fresh inspection
of both the printed party name and letters resolves every seat without an engine
change; see [0069a](decisions/0069a-k6-corrected-connection-national-release.md).

A fresh connected-list search for 1951, 1955 and 1961 recovered the notices on the
olaw mirror by using **four-digit zero padding** (`0177`, `0427`, `0865`). Decision
0062's unpadded URLs had returned 404, which was a retrieval failure, not evidence
of absent issues. The new decisions record issue bounds, gov.il BlobFolder checks
and fresh NLI newspaper-query attempts (HTTP 403; content inaccessible). Every
signed notice was read in full, including inactive pairs. Since notices were found,
no released election uses an assumed empty agreement set. The 1949 CEC calculation
appendix supplies all five connections despite the newspaper archive access limit.

**88 winning lists; 850 registered candidates retained; 840 elected identities
cross-checked.** Each released `data/raw/kN/rosters.reviewed.json` contains candidate
and results PDF page references, contiguous registered ranks, reviewed elected
identities in candidate spelling, and explicit elected-rank mappings. Old names and
honorifics are retained; commas, hyphens and typographical spacing are normalized.
The record is not a modern membership list or a diplomatic results transcription.

For 1949, Mapai registered ranks 10,12,13,29, Herut 10,15,16 and Progressive 3 were
excluded in the official results; prefixes extend to ranks **50,17,6** respectively.
The 1961 Liberal notice excludes ranks **9,11** and declares replacements through
**19** elected. YP 869 p.1939 explicitly states that both excluded candidates had died.
The current UI still labels the first N registered candidates as elected; it needs
the retained mappings to describe those historical elected identities accurately.
No registered rank is deleted or moved to make that UI assumption appear true.

All released winning lists have `candidatesTruncated: true`. Losing-list candidate
arrays are empty with `candidatesUnavailable: true`; the scans exist, but those
rosters were not transcribed. Bilingual dataset/index notes state that coverage.
Every release has **`hasLocalities: false`** and no locality JSON; zero `ballotBoxes`
and `localities` are unavailable-detail placeholders. Polling/locality scans were
outside this task. K6 now emits `public/data/k6.json`; no locality file is emitted.

1949 integer quotients tie at seats **118–119**, at 3,375. The historical order is
unknown. The build and dataset tests try **both** choices and require the same
published final seats; they preserve the engine's lottery warning. A narrowly
scoped k1 check extends the general `datasets.test.ts` criterion to prove that
invariance instead of inventing a lottery outcome. No engine rule was changed.

Reproduction requires only committed inputs: install the lockfile dependencies,
then run `npx tsc -p tsconfig.json --noEmit`, `node scripts/build-datasets.ts`,
`node scripts/check-colours.ts` and `npx vitest run`. The early modules hand
national-only outputs to the shared writer only after all evidence gates pass.
Tests fix gazetted seats independently and check built totals,
quota, complete pairs, source hashes, candidate coverage/ranks and elected mappings.
The CI-style rebuild also succeeds with `.backup-scratch/raw` absent (already absent
in this worktree). Scratch absence does not bypass any early-election check.

Scans were rendered using locked **pdfjs-dist 6.5.438**, with `wasmUrl` pointing to
`node_modules/pdfjs-dist/wasm/`, at scale 2.5–3 and higher-detail crops/renders for
unclear text. Rendering/search copies and dependency caches live in
`.backup-scratch/`; retained PDFs, reviewed JSON, hashes and decisions reproduce the
release without those copies. Git ignores scratch; no backup-software exclusion is
assumed. Per-list coverage tables and source links are in decisions
[0063](decisions/0063-k1-connections-rosters-national-release.md),
[0064](decisions/0064-k2-connected-list-notice-national-release.md),
[0065](decisions/0065-k3-connected-list-notice-national-release.md),
[0066](decisions/0066-k4-connected-lists-resolve-seat-gap.md),
[0067](decisions/0067-k5-connected-list-notice-national-release.md),
[0069](decisions/0069-k7-rosters-national-release.md) and
[0069a](decisions/0069a-k6-corrected-connection-national-release.md), which resolves
[0068](decisions/0068-k6-allocation-gap-remains-held.md). K6 renders used PyMuPDF 2.1
at scale 2–5; retained source scans and reviewed JSON are the durable evidence.

## Knessets 8–12: national evidence and explicit release holds

The isolated k8–k12 modules bind retained originals and reviewed transcriptions to
manifest SHA-256 values, check national arithmetic and agreement membership, and
compare every list's seats through the scenario-to-engine path. **K9–K12 are released**
as national-only JSON with `hasLocalities: false`. K8 emits no public dataset and
rejects a premature availability flip. Zero station/locality counts mean unavailable data.

| Election | Lists | Valid | Invalid | Cast (CBS) | Registered (CBS) | Agreement coverage | Allocation evidence |
|---|---:|---:|---:|---:|---:|---|---|
| k8 | 125 across all 10 winners, including complete Ratz 8 | 120/120 (plus the CEC appendix, third reading) | released (0077) |
| k9 | 120 across all 13 winners | 120/120 (119 gazette + 1 official Knesset OData) | released |
| k10 | 120 across all 10 winners | 120/120 | released |
| k11 | 196 across all 15 winners, including complete Alignment 120 | 120/120 | released |
| k12 | 121 across all 15 winners | 120/120 | released |

Every gazette list sum equals its printed valid total; valid plus invalid equals CBS
turnout. No vote was adjusted to reconcile a secondary table. The known IDI 1984 +90
and 1988 −365 (academic +6) row-sum errors are not imported. Sourced default blocs are
now merged from `data/meta/` (0087). Complete published agreement notices include
ineffective pairs; they are
not reconstructed from seats. The 1981 agreement PDF is an official gazette on the
disclosed olaw mirror; 1984 and 1988 notices are inside their candidate issues.

| Election | Winning-list ranks retained | Elected-name comparison | Release |
|---|---:|---:|---|
| k8 | 125 across all 10 winners, including complete Ratz 8 | 120/120 (plus the CEC appendix, third reading) | released (0077) |
| k9 | 120 across all 13 winners | 120/120 (119 gazette + 1 official Knesset OData) | released |
| k10 | 120 across all 10 winners | 120/120 | released |
| k11 | 196 across all 15 winners, including complete Alignment 120 | 120/120 | released |
| k12 | 121 across all 15 winners | 120/120 | released |

The owner's roster standard requires contiguous leading ranks covering everyone
elected, transcribed from the candidate gazette and compared name by name against
the results notice. Decision [0088](decisions/0088-roster-corrections-and-odata-audit.md)
allows documented gaps in elected ranks: 1988 Likud #25 is not seated and #32 is restored.
The comparisons use those elected ranks, with the official OData supplement for k9 Ratz
documented below.
Later ranks are optional (`candidatesTruncated: true`); nonwinning
lists have empty arrays and `candidatesUnavailable: true` when not transcribed.
This describes dataset coverage, not absence of the official archives. Reviewed JSON
retains page references, elected names and spelling/alias differences. Dataset status
explains coverage in Hebrew and English. Full point-in-time amendment-chain checking
and subsequent roster changes remain unverified limitations, **not release gates**.

K9's optional candidate cap reproduces every official seat, but **the procedure is
inferred from the officially published result because the statutory text was not located**.
ההליך לשנת 1977 מוסק מהתוצאה הרשמית שפורסמה משום שנוסח החוק המסדיר אותו לא אותר.
Both copies of YP 2326 omit Ratz's elected-name paragraph. The official Knesset OData
API now supplies the final cross-check: **אלוני שולמית**, PersonID **2143**, MK record
**997** and Ratz faction record **27111** (FactionID **405**), both starting on the first
session, **13 June 1977**. This matches registered rank 1 in YP 2319 p.1330; no gazette
correction is claimed. The original response and position definitions are retained under
`data/raw/k9/` and hashed in SOURCES. The k9-specific verifier checks the official
identity, opening service dates and faction; the shared gazette-only verifier is unchanged.
The released dataset and picker disclose this source and the inferred cap in both languages.
Seven k9 name transcription errors flagged during the API comparison were corrected only
after rereading both official scans (YP2319 pp.1320,1325,1328; YP2326 pp.1495–1496);
exact before/after names and page references are in `k9/search.reviewed.json`.

K8's renewed bounded search checked **all 24 covers/contents, YP1955–1978**, including
late notices through 10 January 1974; all **13 PDF pages** of candidate YP1954 for notice
layout, through its p.98 signature and digitization page; and PDF pages **1–6 and 263**
of the **263-page official station scan**. No agreement notice was recovered. The station
pages inspected are tables, not a verified complete CBS 461 methodological volume.
Targeted Hebrew CEC/government/CBS queries confirmed the CBS 461 catalogue reference but
did not locate the full volume or a CEC report. Exact queries, URLs, download hashes and
inspection limits are in `k8/search.reviewed.json`. Interior gazette pages and the whole
station scan were not searched exhaustively. No pairs are inferred; the four seat
mismatches and unfinished rosters keep k8 unavailable. This does not establish nonexistence.

The requested additional **k10–k15 opening-membership comparison** is retained as
`k9/opening-membership-cross-check.reviewed.json`, a project extraction from official
OData, with all pagination URLs/hashes, opening-date records, 120 selected members and
factions per election, and every unmatched dataset/API name. It uses the app's `electedOf`
selection, including `notSeated`, rather than treating every leading registered rank as
seated. After punctuation-only normalization, exact matches are **99, 102, 106, 103, 106, 101**
out of 120 respectively. The remaining differences include aliases/middle names and
substantive discrepancies requiring gazette review, including k10's בן-אהרן אברהם and
ורד תמר, k11's שפירא אליהו and רן נחמן, k12's רייסר מיכאל versus opening member
גולדברג יוסף, and k14's ריבלין חיים and ליבני יהודה. None of these other elections
was changed. These are comparison findings, not a claim that every unequal string is a
different person or that API spelling overrides the registered gazette spelling.

Decisions [0072](decisions/0072-k8-k12-roster-release-standard.md),
[0073](decisions/0073-k9-candidate-cap-inference.md),
[0074](decisions/0074-k8-agreements-search-and-hold.md) and
[0075](decisions/0075-k8-k12-release-evidence.md) supersede the earlier release holds in
0070–0071 and give per-list coverage, elected checks, agreement pairs and seat tables,
including **both K9 procedures**. [0076](decisions/0076-k9-ratz-release-and-k8-search.md)
supersedes the k9 name-cross-check hold and records the new official evidence, k8 search
and cross-election findings. SOURCES registers the bounded search records.
Reproduce with locked dependencies, `node scripts/build-datasets.ts`,
`node scripts/check-colours.ts`, `npx tsc -p tsconfig.json --noEmit` and `npx vitest run`.
No scratch input is required. pdfjs-dist 6.5.438 uses its matching wasm directory;
routine renders/downloads remain in `.backup-scratch/`.

## Knessets 13–15: released national datasets and verified elected prefixes

The k13/k14/k15 builders verify retained scan and reviewed-JSON hashes, every gazetted
list vote, national arithmetic and every official seat through the app scenario pipeline.
All three allocate 120 seats without warnings. Knesset votes alone are used for 1996
and 1999; their separate prime-minister ballots are excluded. Gazette valid/invalid
plus official CBS cast/electorate reconcile exactly, without a list adjustment.
For k14 the gazette has Likud–Gesher–Tzomet **767,401**, excluding the secondary
tables' erroneous 550 extra votes. The rule evidence and its limits remain in 0082.

The owner-approved release standard (0083) requires every elected name, rather than
full winning-list rosters. Candidate gazettes YP 4017 / 4408 / 4748 were visually
transcribed using pdfjs-dist 6.5.438 with its wasm directory configured. Independent
results-section-4 transcriptions from YP 4021 / 4414 / 4757 cross-check all **360**
elected names. Reviewed candidate JSON has printed page references; separate
`elected.reviewed.json` files have results pages and explicit registered-rank mappings.
The k13 scan omits several roster starts; seven retained **official-gazette facsimiles
hosted by IDI** fill those pages, with individual provenance in SOURCES. No secondary
name list or handwritten annotation supplies a candidate name.

Coverage: **121** registered candidates in k13; **129** in k14, including the full
**12-person Third Way** roster; **122** in k15. Every other winning roster is marked
`candidatesTruncated: true`; all zero-seat lists have empty candidates and
`candidatesUnavailable: true`. Original registered ranks remain contiguous from 1.
They include Arens (1992), Namir (1996), Begin and Deri (1999), although the elected
notice omits those names; the explicit cross-check maps include every successor.
Only Deri's exact departure date (19 May 1999, after the election) is established
by the retained results notice. Other separate withdrawal notices/dates remain
unverified, and no pre-election renumbering is inferred. The 1992 Labor reading
`אור אריה` was later found to be a transcription error: both notices print `אור אורי`.
Decision [0088](decisions/0088-roster-corrections-and-odata-audit.md) corrects it and removes
the earlier spelling exception. See 0084 for every list's coverage table, page provenance and reconciliation details.

1996's complete six-pair notice is YP 4411 p. 3398; 1999's complete nine-pair notice
is YP 4755 p. 3305. Both are statutory publications on the disclosed olaw mirror,
and ineffective pairs are retained. The repeat 1992 search did not recover the notice:
YP 4017 p. 3654 was identified as a secondary discovery lead, but is absent in the
retrieved official/olaw scans; the linked Nevo PDF returned 403. Per the explicit
fallback decision in 0085, k13 releases with `agreements: []` because seats still
reproduce exactly. Both languages warn that agreements that did not affect seats may
be missing. No pair is inferred from seat reproduction.

All three are available as `public/data/kNN.json`, with matching bilingual status notes
in the picker. They set `hasLocalities: false`; no locality file is emitted. Geographic
counts of zero mean no supplied geography, not official zero station/locality counts.
Tests compare built files to the verified builder, independent official seat/totals
constants, threshold/quota, agreement pairs, all elected names and contiguous ranks.
Clean builds require retained evidence and locked dependencies, with no scratch or
network downloads. Original later roster ranks, separate withdrawal chronology and
an exhaustive historical-law amendment chain remain outside the verified scope.

Party reading links (`data/meta/party-links/kNN.json`, decision 0093) distinguish **partisan**
material from **neutral** accounts on both lists and constituent parties. Campaign-period
archived official sites are preferred; live official sites are permitted for 2026. Party
platforms held by IDI remain partisan and name the archive host. Neutral sources prefer
Knesset faction pages, then labelled Hebrew Wikipedia, CEC records and academic profiles.
Whole-election CEC records are labelled as such; they are not party platforms. The build
rejects unknown ids, non-HTTPS URLs and English Wikipedia, including archive-wrapped URLs;
scenario imports validate link fields too. Coverage is partial: all missing kinds have
reasons in the overlays. Method and coverage: `docs/research/party-links.md`.

### Direct Prime Minister results and election context

The read-only metadata in `data/meta/election-context.json` adds 1996/1999 PM ballots
alongside k14/k15 and the standalone 6 February 2001 election during k15. It does not
change any Knesset votes or seats. Candidate/valid totals come from YP 4414 p.3483,
YP 4757 p.3376 and YP 4960 p.1628. The latter is retained from olaw.org.il, a disclosed
public mirror of official content (SHA-256 in the source manifest). Independent PM invalid/cast
totals for 1996 are the report's official MFA transcription, explicitly unverified in this
build after HTTP 403; 1999 uses the labelled secondary IDI introductory chapter p.8;
2001 uses the gazette. Never substitute the Knesset turnout or infer individual vote flows.
The 1999 withdrawn nominees are secondary IDI history, with no invented zero-vote results.

Seeded context covers the Constituent Assembly, the 1973 postponement, the 1977
Flatto-Sharon capacity qualification, separate 2019–2022 elections and k26's existing pending
publication status. This is not a complete historical event register. Redistribution authority
in 1977, primary 1999 PM invalid/cast totals, 1999 printed-slip withdrawal instructions and
a government-hosted 2001 download remain unresolved.
