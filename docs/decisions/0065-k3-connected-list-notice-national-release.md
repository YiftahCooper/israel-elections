# 0065: K3 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k3 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

A fresh search recovered [YP 427, p.1053, PDF p.1](https://olaw.org.il/yalkut/yalkut-0427.pdf), the complete signed notice of **א–יד, פ–ש, צ–צח, סא–ל, נ–ע**. The file is retained as `data/raw/k3/agreements.pdf`. In particular the second pair is **Progressive פ–Popular Economic ש**, not Ahdut HaAvoda. Only א–יד and נ–ע activate; all five remain in the dataset. Every gazetted seat reproduces without changing the formula.

The fresh search retrieved zero-padded mirror issues **425–432**; covers 426–431 were inspected to locate the notice, then its whole three-page issue was read (notice, unrelated land publication, blank page). The retained candidate/results BlobFolder originals were read. The inferred gov.il memorandum URL `memorandum-knesset3/he/archive_knesset3_memorandum1.pdf` returned 404; this is a failed path, not proof of absent CEC records. A fresh NLI query for התקשרות in 1955 returned HTTP 403, so no newspaper content or absence is claimed. The complete official notice removes the missing-agreements qualification.

A second copy of [candidate issue YP 425](https://olaw.org.il/yalkut/yalkut-0425.pdf), retained as `candidates-mirror.pdf`, was used with the results to resolve **אבו-מוך פארס חמדאן** (p.1017, PDF p.13). Other difficult readings were checked at enlarged resolution, including Mapam rank 9 **חיים יהודה**, and the NRP's **זוארץ פריג׳ה**. No modern biographical list supplied a candidate name.

National valid votes **853,219** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **6,938**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| א | Mapai | 40 | 1–40 | 1,2 | 2 | All 40 names; ranks 1–40 |
| ב | National Religious Party | 11 | 1–11 | 3 | 2 | All 11 names; ranks 1–11 |
| גד | Religious Torah Front | 6 | 1–6 | 5 | 2 | All 6 names; ranks 1–6 |
| ח | Herut | 15 | 1–15 | 7 | 3 | All 15 names; ranks 1–15 |
| יד | Democratic List for Israeli Arabs | 2 | 1–2 | 9 | 3 | All 2 names; ranks 1–2 |
| מ | Mapam | 9 | 1–9 | 10 | 3 | All 9 names; ranks 1–9 |
| נ | Progress and Work | 2 | 1–2 | 12 | 3 | All 2 names; ranks 1–2 |
| ע | Agriculture and Development | 1 | 1–1 | 13 | 3 | All 1 names; ranks 1–1 |
| פ | Progressive Party | 5 | 1–5 | 14 | 3 | All 5 names; ranks 1–5 |
| צ | General Zionists | 13 | 1–13 | 16 | 3 | All 13 names; ranks 1–13 |
| ק | Maki | 6 | 1–6 | 18 | 3 | All 6 names; ranks 1–6 |
| תו | Ahdut HaAvoda | 10 | 1–10 | 22 | 3 | All 10 names; ranks 1–10 |

**12 winning lists; 120 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k3/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k3.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k3 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k03.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.
