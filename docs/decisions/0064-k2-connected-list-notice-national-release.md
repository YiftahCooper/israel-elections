# 0064: K2 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k2 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

A fresh search recovered [YP 177, p.1177, PDF p.3](https://olaw.org.il/yalkut/yalkut-0177.pdf), the signed notice containing **צ–סצ** (General Zionists–Sephardim/Oriental Communities). The complete notice was read and is retained as `data/raw/k2/agreements.pdf`. Both partners qualify. All published seats still reproduce; the previous no-connections match was not sufficient evidence of the historical inputs.

The search retried **174–181 with four-digit zero padding**, yielding HTTP 200. Decision 0062's unpadded URLs had returned 404; that retrieval failure did not establish missing issues. The official [gov.il CEC memorandum](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset2/he/archive_knesset2_memorandum1.pdf) was downloaded and its PDF p.3 visually checked: it identifies the pair and cites YP 177. The candidate/results BlobFolder originals remain retained. A fresh NLI newspapers query for התקשרות, bounded to 1951, returned HTTP 403. No newspaper-content inspection or negative finding is claimed. Since the signed official notice was recovered, no missing-agreements caveat is needed.

National valid votes **687,492** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **5,692**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| א | Mapai | 45 | 1–45 | 1 | 1 | All 45 names; ranks 1–45 |
| ב | Mizrahi | 2 | 1–2 | 2 | 1 | All 2 names; ranks 1–2 |
| ג | Agudat Yisrael | 3 | 1–3 | 3 | 1 | All 3 names; ranks 1–3 |
| ד | Poalei Agudat Yisrael | 2 | 1–2 | 4 | 2 | All 2 names; ranks 1–2 |
| ה | Hapoel HaMizrahi | 8 | 1–8 | 5 | 2 | All 8 names; ranks 1–8 |
| ח | Herut | 8 | 1–8 | 6 | 2 | All 8 names; ranks 1–8 |
| יד | Democratic List for Israeli Arabs | 3 | 1–3 | 8 | 2 | All 3 names; ranks 1–3 |
| ל | Yemenite Association | 1 | 1–1 | 8 | 2 | All 1 names; ranks 1–1 |
| מ | Mapam | 15 | 1–15 | 9 | 2 | All 15 names; ranks 1–15 |
| נ | Progress and Work | 1 | 1–1 | 10 | 2 | All 1 names; ranks 1–1 |
| סצ | Sephardim and Oriental Communities | 2 | 1–2 | 10 | 2 | All 2 names; ranks 1–2 |
| ע | Agriculture and Development | 1 | 1–1 | 10 | 2 | All 1 names; ranks 1–1 |
| פ | Progressive Party | 4 | 1–4 | 11 | 2 | All 4 names; ranks 1–4 |
| צ | General Zionists | 20 | 1–20 | 12 | 2 | All 20 names; ranks 1–20 |
| ק | Maki | 5 | 1–5 | 13 | 2 | All 5 names; ranks 1–5 |

**15 winning lists; 120 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k2/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k2.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k2 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k02.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.
