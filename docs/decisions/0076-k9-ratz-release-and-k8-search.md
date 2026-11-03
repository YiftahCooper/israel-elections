# K9 release: official Ratz opening membership; K8 agreement search remains held

## Decision and authority

Release **k9 (1977)** as national-only data, `available: true`, `hasLocalities: false`.
The owner accepts the candidate-cap inference provided its status note remains explicit
in Hebrew and English. The optional `seatsCappedAtCandidates` preset remains enabled
only for k9. All six published agreements reproduce every gazetted seat, including
Flatto-Sharon 1 and Sheli 2. No engine, application or other election data is changed.

This supersedes the **missing Ratz elected-name release hold** in 0073/0075, not the
legal uncertainty. **The candidate-cap procedure is inferred from the officially
published result because the statutory text was not located.** Unknown full roster
capacities remain unbounded, so capacity-sensitive counterfactuals are not certified.
The full intervening amendment chain remains an unverified limitation.

הכנסת התשיעית משוחררת כנתונים ארציים בלבד. הגבלת מספר המנדטים למספר המועמדים
מוסקת מהתוצאה הרשמית שפורסמה משום שנוסח החוק המסדיר אותה לא אותר. ההסקה
ומגבלותיה מפורטות בהערת המצב בשתי השפות. פסקת הנבחרת של רצ חסרה בי״פ 2326;
ההצלבה הושלמה ברישומי החברות הרשמיים של הכנסת מיום הישיבה הראשונה.

## Official Ratz evidence

[Official Knesset ParliamentInfo OData response](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%209%20and%20PersonID%20eq%202143%20and%20(PositionID%20eq%2061%20or%20PositionID%20eq%2054)&$expand=KNS_Person&$format=json):

- PersonID **2143**, surname **אלוני**, given name **שולמית**.
- PersonToPositionID **997**, PositionID **61**, female Knesset member.
- PersonToPositionID **27111**, PositionID **54**, faction member; FactionID **405**,
  FactionName **ר"ץ**.
- Both records start **1977-06-13**, the first session/opening date, and finish
  **1981-07-20**. The API's KNS_KnessetDates record 136 independently gives the opening
  session date. This is opening membership, not a later replacement.
- YP2319 p.1330 registers **אלוני שולמית** as Ratz's rank **1**, matching exactly.
  YP2326 still contains only 119 elected names; no supplementary gazette notice is claimed.

The original two-record response is `data/raw/k9/ratz-odata.json` (source
`k9-ratz-odata`); original API position definitions are `k9/odata-positions.json`.
Both are official sources registered with URL, bytes, timestamp and SHA-256 in SOURCES.
The Ratz cross-check has **no printed pages**; its note identifies the exact API records.
All other 119 elected names retain their results-notice source and printed page references.

The k9-specific verifier preserves the national/roster/agreement/hash/allocation checks
and adds identity, date and faction checks for this single supplementary source. This
is isolated in `scripts/lib/historical/k9.ts` to respect the requested k8/k9 scope;
the shared K8–K12 gazette-only verifier and other elections remain unchanged. Builds
use retained evidence without network access or scratch dependencies.

### Corrections supported by rereading both official scans

The additional API comparison exposed seven k9 transcription errors. Each was reread in
both the retained candidate and results scans before correction. API names alone were
not substituted into the registered roster. Historical spellings and aliases elsewhere
remain as printed, for example דייקסל מיכאל versus the API's דקל מיכאל.

| List / rank | Previous transcription | Corrected transcription | Candidate / elected printed pages |
|---|---|---|---|
| אמת13 | ילין אהרן | ידלין אהרן | 1320 /1495 |
| אמת31 | אמוראי עדיאל (עדיאל) | אמוראי עדי(אל) | 1320 /1495 |
| יש5 | זרע מאיר | זורע מאיר | 1325 /1496 |
| יש13 | ששי וידאן | עטשי זידאן | 1325 /1496 |
| מחל16 | ידלין הלל | זיידל הלל | 1328 /1496 |
| מחל29 | ריבוביץ (רום) יוסף | רבינוביץ (רום) יוסף | 1328 /1496 |
| מחל30 | בריאן גוסטב | בדיאן גוסטב | 1328 /1496 |

## K8: exact renewed search and outcome

No official complete agreement notice was located. Keep k8 unavailable; no public k8
JSON is emitted. Never infer pairs from the result. The no-agreement diagnostic remains
Alignment52 versus51, NRP11 versus10, Progress and Development1 versus2, Ratz2 versus3.
Winning rosters/elected-name checks remain unfinished; the allocation blocker was not
removed, so no release roster reconstruction was attempted.

Inspection on 3 November 2026:

- Downloaded olaw gazette issues **1955–1978**, all 24, and visually rechecked every
  **cover/contents**. This includes the late-December notices and issues through
  **10 January 1974**, after the postponed **31 December 1973** election and before the
  YP1979 result. YP1972/1974 carry election emergency directions, not agreement notices.
  **Not every internal page was read or OCR-searched.**
- Inspected **all 13 PDF pages** of retained candidate YP1954: cover/financing directions
  p.87, candidate layouts pp.88–98 through signature, final digitization page. No
  agreement notice identified. This is a notice/layout check, not a full name transcription.
- Downloaded the [official CEC station scan](https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%208%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A41.pdf),
  **263 PDF pages, 16,954,260 bytes**. Inspected PDF pages **1–6 and263**: archive cover
  and station tables. No agreement notice or methodology introduction found there.
  The full scan was **not** inspected and is **not** claimed to be the complete CBS 461
  methodological volume.
- Targeted queries: `"1973" "התקשרות" "רשימות" בחירות`,
  `"הבחירות לכנסת השמינית" "הסכמי"`, `site.cbs.gov.il "461" "בחירות"`,
  `"ועדת הבחירות" "השמינית" "דין וחשבון"`,
  `"תוצאות הבחירות לכנסת השמינית" "461"`,
  `site.gov.il "השמינית" "התקשרויות"`,
  `"ילקוט" "1973" "התקשרות בין רשימות"`,
  `"ועדת הבחירות המרכזית לכנסת השמינית" "דין"`.
  The official CBS catalogue confirms publication 461; the full volume/CEC election
  report and an agreement list were not located/retrieved.

Exact URLs, bytes, hashes, queries and limitations are retained as a follow-up in
`data/raw/k8/search.reviewed.json`, hashed in SOURCES. Downloads and renders remain
reproducible scratch material. No backup-system exclusion is asserted. This bounded
search does **not** establish that no notice/report exists.

## Additional k10–k15 official opening-membership comparison

The API worked, so all six requested released elections were checked. Followed every
`odata.nextLink`, preserving `$format=json` (the service drops it from its next link).
Positions 43/61 identifies male/female MKs;54 gives faction membership. Opening dates come
from KNS_KnessetDates. Service interval filter: start <= opening and finish > opening
(or null). Each election has **120 distinct opening members and 120 faction members**.

Compared with the app's actual `electedOf(scenarioFromDataset(dataset))`, using official
seats and honoring `notSeated`. A naive leading-rank comparison would incorrectly flag
Arens k13, Namir k14, Deri and Begin k15. Normalization strips punctuation/whitespace
only; no fuzzy identity match is accepted as proof.

| Election | Opening date | Paginated rows fetched | Exact normalized names /120 | Unequal names requiring interpretation |
|---|---|---:|---:|---:|
| k10 | 1981-07-20 | 267 | 99 | 21 |
| k11 | 1984-08-13 | 275 | 102 | 18 |
| k12 | 1988-11-21 | 322 | 106 | 14 |
| k13 | 1992-07-13 | 282 | 103 | 17 |
| k14 | 1996-06-17 | 338 | 106 | 14 |
| k15 | 1999-06-07 | 333 | 101 | 19 |

These unequal strings are **not all different people**: many are abbreviated names,
middle names, historical surnames and spelling variants. Material findings include:

- **k10:** dataset בן-אהרן אברהם and ורד תמר have no matching opening names; API
  instead includes כץ-עוז אברהם (2413) and ותד מחמד (2328). Apparent transcription
  differences also include דרורי שרה, וירג׳מן דרור, רבי צבי, יגורי יצחק,
  חריש משה, חרש מיכאל and נעים עבד. Each needs gazette reinspection before correction.
- **k11:** dataset שפירא אליהו /רן נחמן /ששי וידאן versus official
  שפייזר אליהו (2659) /רז נחמן (2606) /עטשי זיידאן (2523).
- **k12:** dataset seats רייסר מיכאל; opening API instead has גולדברג יוסף (2237).
  This requires review of timing/corrections, not automatic replacement.
- **k13:** dataset אור אריה versus official אור אורי (2132).
- **k14:** dataset ריבלין חיים /ליבני יהודה versus official דיין חיים (2276) /
  לנקרי יהודה (2444).
- **k15:** the19 unequal strings appear compatible with aliases, shortened names and
  historical spellings. No distinct unexplained person discrepancy asserted; equivalence
  has not been independently certified from string similarity.

No k10–k15 data is corrected. The complete selected official opening records, all request
URLs/original response hashes, matched names and **every unmatched name on both sides**
are retained in `k9/opening-membership-cross-check.reviewed.json`. This is explicitly a
**project extraction**, not a byte-for-byte official publication; SOURCES marks it
`official: false`. The compact original Ratz response is retained separately as official.

## Verification

On 3 November 2026, Node 24.18.0 and locked dependencies:

- `npx tsc -p tsconfig.json --noEmit`: passed.
- `node scripts/build-datasets.ts`: passed; k9 emitted, k8 explicitly held.
- `node scripts/check-colours.ts`: passed for all **18 available elections**. The first
  check caught adjacent k9 Flatto-Sharon/Poalei Agudat Yisrael colours at Lab distance 14.3
  (required >=20). The k9 builder now darkens Flatto-Sharon from `#9d7a45` to `#79502e`;
  the shared palette and all other elections remain unchanged.
- `npx vitest run`: **36 files, 302 tests passed**, including k9 built-file comparison,
  all published seats, official Ratz evidence rejection cases, `datasets.test.ts` and
  `elected-names.test.ts`.
- CI simulation: `.backup-scratch/raw` was already absent in this worktree, so no
  directory existed to move/restore. A separate direct-shell rebuild without it passed;
  k9's complete semantic output was identical after excluding `buildInfo.builtAt`.
  The earlier Node child-process wrapper was restricted by the environment; it was
  replaced by that successful direct-shell run.
- Other elections' generated JSON was compared with HEAD, proving timestamp-only
  differences, then restored with scoped `git checkout` before commit.
- `git diff --check`: passed. No push or deployment authorized/performed.

The passing tests establish arithmetic, retained evidence checks and dataset behavior;
they do not resolve the cap's missing legal text, the k8 agreement gap, or the separate
k10–k15 name discrepancies recorded above.
