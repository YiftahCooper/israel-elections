# 0067: K5 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k5 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

A fresh search recovered [YP 865, p.1843, PDF p.1](https://olaw.org.il/yalkut/yalkut-0865.pdf), the complete signed notice of **ב–ד, מ–תו, יא–רא**. All three activate and every published seat still reproduces. The source is retained as `data/raw/k5/agreements.pdf`; no pair was inferred from the matching allocation.

Zero-padded mirror issues **863–869** returned HTTP 200; covers 864–868 were inspected and the complete three-page notice issue was read. Candidate/results BlobFolder originals were read. The inferred gov.il `memorandum-knesset5/he/archive_knesset5_memorandum1.pdf` returned 404. A fresh NLI query for התקשרות in 1961 returned HTTP 403; no newspaper search result or absence is claimed. The recovered official notice removes the missing-agreements caveat.

The Liberal results notice explicitly omits registered ranks **9 (איכילוב עזרא)** and **11 (ד״ר כנוביץ שמעון)** and lists 17 elected identities through registered rank **19**. The review retains all 19 contiguous registered candidates and maps the elected order to ranks **1–8,10,12–19**. The parenthetical's reason is not used to make a biographical claim: in particular this release does **not** assert that either person died before the election. Candidate ranks remain as registered.

National valid votes **1,006,964** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **8,332**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| א | Mapai | 42 | 1–42 | 1,2 | 2 | All 42 names; ranks 1–42 |
| ב | National Religious Party | 12 | 1–12 | 4 | 2 | All 12 names; ranks 1–12 |
| ג | Agudat Yisrael | 4 | 1–4 | 6 | 2 | All 4 names; ranks 1–4 |
| ד | Poalei Agudat Yisrael | 2 | 1–2 | 8 | 3 | All 2 names; ranks 1–2 |
| ח | Herut | 17 | 1–17 | 10 | 3 | All 17 names; ranks 1–17 |
| יא | Cooperation and Brotherhood | 2 | 1–2 | 13 | 3 | All 2 names; ranks 1–2 |
| ל | Liberal Party | 17 | 1–19 | 13,14 | 3 | All 17 names; exclude registered 9,11 |
| מ | Mapam | 9 | 1–9 | 16 | 3 | All 9 names; ranks 1–9 |
| ק | Maki | 5 | 1–5 | 19 | 3 | All 5 names; ranks 1–5 |
| רא | Progress and Development | 2 | 1–2 | 21 | 3 | All 2 names; ranks 1–2 |
| תו | Ahdut HaAvoda | 8 | 1–8 | 22 | 3 | All 8 names; ranks 1–8 |

**11 winning lists; 122 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k5/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k5.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k5 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k05.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.

UI follow-up required: the current candidate view labels the first N registered rows as elected. It must consume the reviewed exclusion mappings before describing the historical elected identities accurately; do not reorder or delete registered candidates to hide the distinction. No `src/app/` file was changed.
