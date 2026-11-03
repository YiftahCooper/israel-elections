# Publish verified rosters and explicit per-list transcription limitations

## Authority and evidence

The owner authorized `candidatesUnavailable: true`, `candidates: []` and an explanatory
note for a particular list whose roster could not be read reliably after a genuine
attempt. This is used per list, never as a claim that the official gazette lacks a roster.
The result is **not a full-roster release**: 14 of 27 k16 lists and 13 of 31 k17 lists
still have incomplete verification. This limitation is prominent in dataset/index status.
It supersedes 0050's blanket refusal to use the fallback under the owner's new decision.

Both complete scans were rendered with locked `pdfjs-dist` and
`wasmUrl = node_modules/pdfjs-dist/wasm/`. PNGs, enlarged crops, attempted full
transcriptions and OCR comparison material are in ignored `.backup-scratch/` only.
The scans remain the source, not OCR or a reconstructed modern list. Only confidently
read names are retained in published rosters. Unresolved drafts are not published.

Each `candidates.reviewed.json` records the last printed rank, gazette pages, and either
a contiguous verified roster or an unavailable flag with the specific unresolved ranks.
For the latter the problem is the current transcription's inability to verify exact
spelling, not proof that the source is objectively illegible to every reader. The full
roster is omitted rather than filling gaps with guessed names. The builder reads this
reviewed JSON, never the PDF. SHA-256 in SOURCES and buildInfo protects the retained
artifact. Counts and contiguous ranks are integrity checks, not independent name proof.

## Membership and reserve checks

Attempted `main.knesset.gov.il/mk/Pages/Members.aspx?KnessetID=16` and `=17` via web
retrieval; neither returned usable membership content. A direct request returned an
HTTP 247 challenge; the faction page redirected to the explicit geographic denial
`https://www.knesset.gov.il/maintenance-page-geo`. Attempted official URLs are recorded
in SOURCES as attempts, not successful official verification.

Fallback identity cross-checks use Wikipedia's separate lists of members of the
sixteenth and seventeenth Knessets, labelled **secondary** in SOURCES. The tables include
later changes: compare original membership by reversing those replacements. Every
seat-winning list has a cross-check record (elected ranks and scan spellings) and a
second enlarged reading of at least the next five printed ranks. Cross-checking
identities does not make the secondary table authority for gazette Hebrew spellings.
No secondary name transcription is mixed into published rosters (`candidatesSecondary`
remains false).

There is one genuine inauguration exception: **k16 Yisrael BaAliyah** registered
Sharansky #1 and Edelstein #2. Sharansky withdrew after the election; Solodkin #3
served at inauguration. Ynet's contemporaneous 29 January 2003 report corroborates the
withdrawal. Preserve the registered order and explain the difference in Hebrew notes.
The app selects the first n registered candidates; it does not model this withdrawal.
All other elected identity sets match the original members, allowing common-name
variants (e.g. Effi/Efraim, Tommy/Yosef and Amir/Armond) and ignoring subsequent changes.

For k17, in particular, do not mistake later substitutes (Hermesh, Ben-Israel, Plesner,
Molla, Haim Katz, Edelstein, Rotem, Nafa, Bahaina, Shanan, Litinetsky, Maklev, Pollack
and Greenfield) for the original elected ranks. Kadima's original 29 include Reichman,
Peres, Breznitz and Yitzhaki. The 2006 government's inauguration date is not the
Knesset's swearing-in date.

The eight readable archived primary CEC pages are retained in
`data/raw/k17/candidates-archive.crosscheck.json`. They resolved UTJ and Shas exact
spellings and Kadima's wrapped family/given names. Their given-name-first order is
not copied as the public surname-first format. Attempts to retrieve the remaining
archived pages returned 403; they did not clear the other per-list limitations.

## Coverage

`0*` means the entire roster is deliberately unavailable, **not zero registered candidates**.
Numbers in “Printed” are the last printed ranks. The unresolved ranks explain the
per-list fallback; full bilingual reasons and retained prefix checks are in the JSON.

### k16

| Letters | Published candidates | Printed | Gazette pages | Unresolved exact spelling at ranks |
|---|---:|---:|---|---|
| אמת | 0* | 120 | 1192 | 34, 62, 88, 116 |
| ב | 0* | 120 | 1192, 1193 | 34, 43, 86, 112 |
| ג | 0* | 120 | 1193, 1194 | 26, 97, 114 |
| ד | 0* | 118 | 1194, 1195 | 66, 92 |
| ו | 0* | 118 | 1195 | 33, 46, 81 |
| ז | 17 | 17 | 1196 | — |
| זנ | 10 | 10 | 1196 | — |
| ט | 7 | 7 | 1196 | — |
| יש | 0* | 120 | 1196, 1197 | 64, 100 |
| כן | 24 | 24 | 1197 | — |
| ל | 35 | 35 | 1197 | — |
| מחל | 114 | 114 | 1197, 1198 | — |
| מרצ | 0* | 120 | 1198, 1199 | 71, 95 |
| ם | 0* | 119 | 1199 | 27, 69, 118 |
| נ | 17 | 17 | 1200 | — |
| נץ | 0* | 25 | 1200 | 11, 14 |
| עם | 0* | 119 | 1200, 1201 | 6, 32, 93 |
| פה | 18 | 18 | 1201 | — |
| ף | 0* | 11 | 1201 | 8, 11 |
| צ | 11 | 11 | 1201 | — |
| צף | 0* | 77 | 1201, 1202 | 39, 74 |
| ק | 7 | 7 | 1202 | — |
| קך | 10 | 10 | 1202 | — |
| קנ | 18 | 18 | 1202 | — |
| קץ | 0* | 12 | 1202 | 2 |
| רק | 7 | 7 | 1202 | — |
| שס | 0* | 111 | 1203 | 29, 53, 61 |

### k17

| Letters | Published candidates | Printed | Gazette pages | Unresolved exact spelling at ranks |
|---|---:|---:|---|---|
| אמת | 0* | 120 | 2184 | 54, 99 |
| ג | 120 | 120 | 2185 | — |
| ד | 0* | 120 | 2186 | 62, 108, 116 |
| ה | 22 | 22 | 2187 | — |
| ו | 0* | 119 | 2187, 2188 | 30, 60, 78 |
| ז | 30 | 30 | 2188 | — |
| זה | 10 | 10 | 2188 | — |
| זך | 16 | 16 | 2189 | — |
| חץ | 0* | 61 | 2189 | 6, 38, 41 |
| טב | 0* | 120 | 2190 | 12, 65, 96 |
| יש | 0* | 100 | 2191 | 59, 89 |
| כ | 0* | 10 | 2192 | 2 |
| כן | 120 | 120 | 2192, 2193 | — |
| כץ | 10 | 10 | 2193 | — |
| ל | 23 | 23 | 2193 | — |
| מחל | 0* | 119 | 2194 | 60, 80, 117 |
| מרצ | 0* | 120 | 2195 | 64, 95, 106 |
| נץ | 0* | 19 | 2196 | 4, 10 |
| עם | 0* | 117 | 2196, 2197 | 49, 78, 101 |
| פ | 24 | 24 | 2197 | — |
| פז | 7 | 7 | 2197 | — |
| פכ | 21 | 21 | 2198 | — |
| פץ | 10 | 10 | 2198 | — |
| ף | 0* | 11 | 2197 | 3, 7 |
| צה | 11 | 11 | 2198 | — |
| ק | 55 | 55 | 2198, 2199 | — |
| קז | 14 | 14 | 2199 | — |
| קנ | 27 | 27 | 2199 | — |
| קפ | 0* | 32 | 2200 | 19, 22 |
| רק | 26 | 26 | 2200 | — |
| שס | 118 | 118 | 2200, 2201 | — |

## Application limitation and validation contract

No `src/app/` files were changed. `src/app/derive.ts:53` treats an empty roster on a
seat-winning list as vacant seats, which is incorrect for these unavailable-roster
records. The dataset status and list notes disclose missing verification, but the
existing UI has no dedicated `candidatesUnavailable` treatment; its candidate panel also
says “No candidates registered” for these missing-data arrays. This is a known product
limitation, not a historical claim of empty seats. Likewise the registered-order
simulation does not substitute Solodkin for Sharansky in 2003.

Tests consume committed public JSONs and assert every gazetted seat, both k16 vote
sets, era threshold/quota, all agreement pairs, leader and terminal ranks, explicit
candidate counts for every list (including fallback zeros), totals and locality sums.
The builder validates the retained review hashes, all complete rosters' rank ranges,
all winning lists' recorded membership/five-reserve checks, and locality digests.
A passing test does not upgrade the 27 unavailable rosters to verified ones.

## Sources

* `data/raw/k16/candidates.pdf`, YP 5148 pp. 1192–1203; `data/raw/k17/candidates.pdf`, YP 5504 pp. 2184–2201.
* https://en.wikipedia.org/wiki/List_of_members_of_the_sixteenth_Knesset — secondary; original membership and later replacements.
* https://en.wikipedia.org/wiki/List_of_members_of_the_seventeenth_Knesset — secondary; distinguish original membership from later replacements.
* https://www.ynet.co.il/articles/0,7340,L-2403135,00.html — contemporaneous secondary report of Sharansky's withdrawal, 29 January 2003.
* Both `candidates.reviewed.json` files; `data/raw/SOURCES.json` supplies provenance and failed official attempts.

## Executed release checks

`npx tsc -p tsconfig.json --noEmit`, `node scripts/fetch-sources.ts`,
`node scripts/build-datasets.ts` and `npx vitest run` completed successfully
(8 test files, 97 tests). The scratch-free simulation moved `.backup-scratch/raw`
aside, rebuilt, verified all four k16/k17 public JSONs matched the normal build
exactly after removing only `buildInfo.builtAt`, and restored scratch. k25/k26
rewrites were checked to contain only timestamp changes and restored before commit.

These checks establish reproducible arithmetic, retained-input integrity and the
explicit roster contracts. They do not establish names for unavailable rosters or
resolve the source discrepancies recorded in 0052.

## Addendum, 4 November 2026: official membership cross-check replaces English Wikipedia

The owner does not accept English-language Wikipedia as a source. The two fallback identity cross-checks
(`k16-membership-secondary`, `k17-membership-secondary`) are replaced by the Knesset's official OData
service (`k16-membership-odata`, `k17-membership-odata`), retained as `data/raw/k16|k17/knesset-odata-members.json`.
Comparing the opening membership (17 February 2003; 17 April 2006) with every elected member in the
datasets matched all 240 identities, allowing only spelling and short-name forms (for example יוסף/יוסי,
אברהם/אברהם-בלילא, מגדלה/מג'אדלה). The one substantive difference is Sharansky, elected per the 2003
results notice, whose seat Solodkin held at the opening; the OData record confirms that caveat officially.
No dataset value changed. The English Wikipedia URLs listed in the Sources section below are historical
references only and are no longer used.
