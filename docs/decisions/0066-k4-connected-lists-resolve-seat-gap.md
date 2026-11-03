# 0066: K4 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k4 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

The fresh zero-padded mirror search **704–717** located two separately signed connection notices on [YP 709, p.125, PDF p.1](https://olaw.org.il/yalkut/yalkut-0709.pdf): **א–רא** (Mapai–Progress and Development) and **יא–ע** (Cooperation and Brotherhood–Agriculture and Development). The whole issue is retained as `data/raw/k4/agreements.pdf`. Both connections activate.

These sourced inputs resolve **Mapai 48→47** and **Cooperation and Brotherhood 1→2** under the existing single-pass largest-remainder preset. The suggested Mapai–Cooperation connection was a research hypothesis; the actual notice connects each to a different Arab list. No proposed connection was selected because it fit the seats. The no-connections counterfactual and the sourced result are kept distinct.

Candidate/results BlobFolder originals and the retained 1959 ss.37–39 were checked; no quota or rounding change was necessary. The inferred gov.il memorandum path returned 404. The NLI newspapers query for עודפים in 1959 returned HTTP 403, so it establishes no absence. The official signed notices are sufficient for the released connections.

National valid votes **969,337** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **7,800**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| א | Mapai | 47 | 1–47 | 1,2 | 2 | All 47 names; ranks 1–47 |
| ב | National Religious Party | 12 | 1–12 | 4 | 2 | All 12 names; ranks 1–12 |
| גד | Religious Torah Front | 6 | 1–6 | 6 | 2 | All 6 names; ranks 1–6 |
| ח | Herut | 17 | 1–17 | 8 | 3 | All 17 names; ranks 1–17 |
| יא | Cooperation and Brotherhood | 2 | 1–2 | 11 | 3 | All 2 names; ranks 1–2 |
| מ | Mapam | 9 | 1–9 | 12 | 3 | All 9 names; ranks 1–9 |
| ע | Agriculture and Development | 1 | 1–1 | 16 | 3 | All 1 names; ranks 1–1 |
| פ | Progressive Party | 6 | 1–6 | 17 | 3 | All 6 names; ranks 1–6 |
| צ | General Zionists | 8 | 1–8 | 19 | 3 | All 8 names; ranks 1–8 |
| ק | Maki | 3 | 1–3 | 21 | 3 | All 3 names; ranks 1–3 |
| רא | Progress and Development | 2 | 1–2 | 24 | 3 | All 2 names; ranks 1–2 |
| תו | Ahdut HaAvoda | 7 | 1–7 | 25 | 3 | All 7 names; ranks 1–7 |

**12 winning lists; 120 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k4/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k4.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k4 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k04.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.
