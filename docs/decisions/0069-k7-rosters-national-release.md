# 0069: K7 national release — sourced connections and reviewed candidate prefixes

3 November 2026. Status: accepted for the national dataset. Owner authority: the current task permits winning-list prefixes covering all elected members, with explicit truncation, and losing-list rosters marked unavailable. This supersedes decisions 0061–0062's release hold **for k7 only**; decision 0060's legal limitations remain unless expressly resolved here.

## Evidence and allocation

The already retained complete signed [YP 1565 notice, p.246, PDF p.2](https://olaw.org.il/yalkut/yalkut-1565.pdf) supplies **יא–רא**, Cooperation and Brotherhood–Progress and Development. Both qualify; the existing 1% floor-Hare/largest-remainder preset reproduces every published seat. The notice is an official publication on the olaw mirror, not a secondary description.

The winning candidate prefixes from YP 1563 were now visually transcribed and compared name by name to the elected names in YP 1573, PDF pp.2–3. Every mapping is ranks 1 through the published seat count. Alignment requires 56 names across candidate PDF pp.2–3; Gahal 26 across pp.4–5. Later ranks remain untranscribed. No new agreement or allocation-rule inference was needed.

National valid votes **1,367,743** reconcile with CBS; invalid/cast/registered totals are unchanged. Quota **11,274**. Every published list seat count, including all zero-seat lists, matches; **120/120 seats**. Original gazettes, reviewed national/roster JSON, and connection evidence are SHA-256 bound in `SOURCES.json` and the built dataset.

## Roster coverage and elected cross-check

Names come from the retained official candidate gazette and were visually compared with the official elected names. Tables use **1-based PDF pages**, not printed page numbers. Every prefix is contiguous from rank 1; the final-rank column is its coverage, not a claim to the full registered list. `candidatesTruncated: true` applies to every winning list. The elected record preserves candidate spelling (including old surnames and honorifics), with punctuation/spacing normalized; it is not a second diplomatic transcription of results typography.

| Letters | List | Official = computed seats | Registered ranks retained | Candidate PDF pages | Results PDF pages | Elected cross-check |
|---|---|---:|---|---|---|---|
| אמת | Alignment | 56 | 1–56 | 2,3 | 2 | All 56 names; ranks 1–56 |
| ב | National Religious Party | 12 | 1–12 | 9 | 2 | All 12 names; ranks 1–12 |
| ג | Agudat Yisrael | 4 | 1–4 | 11 | 3 | All 4 names; ranks 1–4 |
| ד | Poalei Agudat Yisrael | 2 | 1–2 | 17 | 3 | All 2 names; ranks 1–2 |
| ו | Rakah | 3 | 1–3 | 15 | 3 | All 3 names; ranks 1–3 |
| חל | Gahal | 26 | 1–26 | 4,5 | 3 | All 26 names; ranks 1–26 |
| ט | Free Centre | 2 | 1–2 | 13 | 3 | All 2 names; ranks 1–2 |
| יא | Cooperation and Brotherhood | 2 | 1–2 | 23 | 3 | All 2 names; ranks 1–2 |
| לע | Independent Liberals | 4 | 1–4 | 7 | 3 | All 4 names; ranks 1–4 |
| עמ | National List | 4 | 1–4 | 27 | 3 | All 4 names; ranks 1–4 |
| ק | Maki | 1 | 1–1 | 21 | 3 | All 1 names; ranks 1–1 |
| רא | Progress and Development | 2 | 1–2 | 24 | 3 | All 2 names; ranks 1–2 |
| ש | HaOlam HaZeh | 2 | 1–2 | 19 | 3 | All 2 names; ranks 1–2 |

**13 winning lists; 120 registered names retained; all 120 elected identities cross-checked.** Machine-readable page references, names and elected rank mappings: [`rosters.reviewed.json`](../../data/raw/k7/rosters.reviewed.json). Lists winning zero seats have empty candidate arrays and `candidatesUnavailable: true`: their scans exist, but those names were not transcribed. No guesses or secondary candidate names are released.

## Release and limits

`public/data/k7.json` is emitted with `hasLocalities: false`; no locality file is emitted. `ballotBoxes` and `localities` are zero placeholders for unavailable detail, not a claim that no polling stations existed. `elections.json` marks k7 available and states prefix/losing-list coverage in both languages. This is a national and registered-roster release, not a reconstruction of later Knesset membership.

The build validates retained hashes, totals, connections, contiguous prefixes, explicit exclusions, 120 elected-name mappings and exact seats. `tests/historical-k07.test.ts` fixes the gazette seat table independently; `historical-k1-k7-release.test.ts` checks the public file and coverage. See DATA.md for reproduction and the clean-checkout check. Runtime caches/renders are disposable scratch, outside the durable evidence.
