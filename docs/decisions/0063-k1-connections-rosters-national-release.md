# 0063: K1 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k1 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

The [official CEC calculation appendix](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset1/he/archive_knesset1_memorandum-apdx1.pdf), retained as `data/raw/k1/allocation-appendix.pdf`, printed p.5 / PDF p.6, lists **ב–ל, ט–יג, יא–יד, מ–ת, ס–צ**. All five are retained. Only ב–ל and ס–צ have an initial seat for each partner and activate under ordinance s.31(a). This is contemporary application evidence, independent of the seat comparison. It resolves Herut **15→14** and General Zionists **6→7** without changing votes or rules.

The appendix's national worksheet (PDF pp.7–10) corroborates the 3,592 national quota and connected remainder units. Its pair worksheets (PDF pp.11,13) print quotas **3,187** and **3,162**, producing **16+1** and **4+7**. The first worksheet's handwritten denominator appears as 17 although its 3,187 quotient requires 18; the other explicitly writes 11+1. The statutory seats-plus-one interpretation and the printed quotas agree. This manuscript inconsistency is disclosed, not silently used to change the engine.

Ordinance s.30(c)(3) compares integer quotients. Mapai's third quotient and the religious/Yemenite pair's second are both **3,375**. The simulator encounters the tie at seats **118–119**; each tied unit receives a seat whichever wins first. Both choices reproduce all final list seats. The historical lottery order was not recovered and is **not supplied as an invented outcome**. The build checks both choices. The narrowly scoped k1 branch in `tests/datasets.test.ts` checks both instead of requiring zero lottery warnings; no engine warning is suppressed.

The January publication amendment requires daily newspapers. The follow-up NLI query for התקשרות in 1949 returned HTTP 403; that is an access limit, not a negative archive result. The official allocation appendix itself supplies the connection set. The CEC main memorandum was also retrieved; it adds no necessary release input.

National valid votes **434,684** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **3,592**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| א | Mapai | 46 | 1–50 | 2 | 2,3 | All 46 names; exclude registered 10,12,13,29 |
| ב | United Religious Front | 16 | 1–16 | 3 | 3 | All 16 names; ranks 1–16 |
| ח | Herut | 14 | 1–17 | 5 | 3 | All 14 names; exclude registered 10,15,16 |
| יד | Democratic List of Nazareth | 2 | 1–2 | 7 | 3 | All 2 names; ranks 1–2 |
| טו | Fighters List | 1 | 1–1 | 7 | 3 | All 1 names; ranks 1–1 |
| ל | Yemenite Association | 1 | 1–1 | 7 | 3 | All 1 names; ranks 1–1 |
| מ | Mapam | 19 | 1–19 | 8 | 3 | All 19 names; ranks 1–19 |
| נ | WIZO | 1 | 1–1 | 9 | 4 | All 1 names; ranks 1–1 |
| ס | Sephardim and Oriental Communities | 4 | 1–4 | 10 | 4 | All 4 names; ranks 1–4 |
| פ | Progressive Party | 5 | 1–6 | 11 | 4 | All 5 names; exclude registered 3 |
| צ | General Zionists | 7 | 1–7 | 13 | 4 | All 7 names; ranks 1–7 |
| ק | Maki | 4 | 1–4 | 14 | 4 | All 4 names; ranks 1–4 |

**12 winning lists; 128 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k1/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k1.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k1 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k01.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.

UI follow-up required: the current candidate view labels the first N registered rows as elected. It must consume the reviewed exclusion mappings before describing the historical elected identities accurately; do not reorder or delete registered candidates to hide the distinction. No `src/app/` file was changed.

UI follow-up: preserve the 3,375 integer tie and explain that both choices produce the same final seats. The historical lottery order is unknown.
