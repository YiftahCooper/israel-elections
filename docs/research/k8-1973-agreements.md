# 1973 (k8) surplus-vote agreements: search log and result

Research date: 4 November 2026 (Israel time; files retrieved 3 November 2026 22:01 UTC).

## Verdict

**Found and verified from an official source.** The Central Elections Committee for the
8th Knesset's own seat-calculation record lists **six** connections between candidate
lists (התקשרויות בין רשימות מועמדים). Running the repository engine (`ISRAEL_1973`) with
exactly those six pairs reproduces **every one of the 21 gazetted seat counts**:
120 seats allocated, no warnings, threshold 15,669 and quota 12,424. The pairs were
taken from the document, not fitted to the result.

| # | Pair (letters as printed) | Lists | Effect |
|---|---|---|---|
| 1 | ב + גד | NRP + Religious Torah Front | 190,361 votes → 15 seats → 10 + 5 |
| 2 | חל טעם + ער | Likud + Arab Israeli List | none: ער 3,269 votes, below threshold |
| 3 | סנ + ענ | Popular Movement + Movement for Brotherhood | none: both below threshold |
| 4 | קנ + ז | Moked + Black Panthers | none: ז 13,332 votes, below threshold |
| 5 | רא + עא | Progress and Development + Arab List for Bedouin and Villagers | 39,012 votes → 3 seats → 2 + 1 |
| 6 | לע + רצ | Independent Liberals + Ratz | 91,583 votes → 7 seats → 4 + 3 |

The Alignment (אמת) had no connection.

**A second finding blocks direct integration.** The existing transcription
`data/raw/k8/national.reviewed.json` misreads three ballot letters and four list names.
Both the retained official results gazette (YP 1979 p. 608) and the CEC appendix show
the correct forms. The pairs above use the **printed** letters (`לע`, `סנ`). The builder
validates agreement members against the dataset letters, so the letter corrections must
be applied together with the pairs. See "Transcription corrections" below.

## Decisive source

| Field | Value |
|---|---|
| Title (cover) | ועדת הבחירות המרכזית לכנסת השמינית — **נספח לזכרון דברים על תוצאות הבחירות לכנסת השמינית** (פרטי חישוב של חלוקת המנדטים) (סעיפים 81, 82 ו־83 לחוק הבחירות לכנסת [נוסח משולב], תשכ״ט–1969) |
| Form | טופס 30 (תקנה 125), the statutory form for the CEC results memorandum |
| Publisher | Central Elections Committee for the 8th Knesset. The scan is hosted on gov.il (`dynamiccollectorresultitem/memorandum-knesset8`), scanned by Imagestore systems Ltd.; PDF creation date 30 December 2021 |
| Date | Calculation for the 31 December 1973 election. Handwritten dedication on the cover is dated 8.1.74; the results notice YP 1979 is dated 11.1.1974 |
| URL | <https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset8/he/archive_knesset8_memorandum-apdx.pdf> |
| Original | HTTP 200, `application/pdf`, 24 pages, 28,395,623 bytes, SHA-256 `38fd80b493f0c8fb9591bab873c5ac0f46404de0d842c10123d6d8ca3f62b3b6` |
| Kind | **Official** (primary CEC calculation record) |
| Retained | `data/raw/k8/cec-memorandum-appendix-1973.extract.pdf` holds 8 unaltered pages: source PDF pages 1, 2, 6, 7, 12, 13, 14 and 18 (cover and printed pp. 3, 10, 11, 16, 17, 18, 22). It is 9,580,705 bytes, SHA-256 `d87b9f3d66a6e5f0a9f50a86f6b85c18686a325ddc4a56735f03ca215e013b98`, registered in `SOURCES.json` as `k8-cec-memorandum-appendix`. The full file is over the 10 MB retention limit; the extract's pages render pixel-identically to the original (checked with PyMuPDF at 72 dpi). |

### Exact quotations (transcribed from the scan)

Printed p. 10, section ז:

> ז. התקשרויות בין רשימות מועמדים:
> 1. רשימות ב+גד התקשרו ביניהן: רשימה ב קיבלה 130,349 קול; רשימה גד קיבלה 60,012 קול; הרשימות ב+גד קיבלו יחד 190,361 קול; 15 מנדטים
> 2. רשימות חל טעם+ער התקשרו ביניהן: [blank]
> 3. רשימות סנ+ענ התקשרו ביניהן: [blank]
> 4. רשימות קנ+ז התקשרו ביניהן: [blank]

Printed p. 11:

> 5. רשימות רא+עא התקשרו ביניהן: רשימה רא קיבלה 22,604 קול; רשימה עא קיבלה 16,408 קול; הרשימות רא+עא קיבלו יחד 39,012 קול; 3 מנדטים
> 6. רשימות לע+רצ התקשרו ביניהן: רשימה לע קיבלה 56,560 קול; רשימה רצ קיבלה 35,023 קול; הרשימות לע+רצ קיבלו יחד 91,583 קול; 7 מנדטים

The figures are handwritten into a printed form. The blank items are lists below the 1%
threshold, which under section 82(a) cannot share remainders.

Section יב, "חלוקת המנדטים בין הרשימות הקשורות ביניהן לפי סעיף 67 לחוק", printed pp. 16–18:

- ב+גד: quota 190,361 / 15 = 12,690, giving 10 + 4 with 1 remaining. Remainder averages:
  ב 11,849, גד 12,002, so גד gets it. Final **ב 10, גד 5**.
- לע+רצ: quota 91,583 / 7 = 13,083, giving 4 + 2 with 1 remaining. Averages: לע 11,312,
  רצ 11,674, so רצ gets it. Final **לע 4, רצ 3**.
- רא+עא: quota 39,012 / 3 = 13,004, giving 1 + 1 with 1 remaining. Averages: רא 11,302,
  עא 8,204, so רא gets it. Final **רא 2, עא 1**.

Section יג, printed p. 22, "החלוקה הסופית": אמת 51, ב 10, גד 5, ו 4, חל טעם 39, לע 4,
עא 1, קנ 1, רא 2, רצ 3, all others "—"; total 120. This is identical to YP 1979 p. 608.

### How it was found (secondary lead)

The **Hebrew Wikipedia** article [הבחירות לכנסת השמינית](https://he.wikipedia.org/wiki/הבחירות_לכנסת_השמינית)
has a section "הסכמי עודפים" (revision 43470653, 2026-06-22T09:28:08Z). It lists the same
six pairs by party name, with footnotes explaining that three had no effect. It cites the
gov.il appendix above:

> הסכמי עודפים נחתמו בין הרשימות הבאות: הליכוד - רשימה ערבית ישראלית. מפד"ל - חזית דתית תורתית.
> קידמה ופיתוח - רשימה ערבית לבדואים וכפריים. ליברלים עצמאיים - רצ. מוקד - הפנתרים השחורים.
> תנועה לאחווה - תנועה עממית.

The raw API response is retained as `data/raw/k8/hewiki-k8-rev43470653.json`
(85,589 bytes, SHA-256 `8565669c…613641`, `k8-hewiki-agreements`, `official: false`).
Wikipedia is **secondary** and was used only to find the official document. The
agreement inputs come from the CEC scan, read directly. Both sources agree pair for pair.

## Reproduction with the repository engine

Scratch script (kept in `.backup-scratch/k8agr/repro/reproduce-proposal.ts`, reproduced
here because scratch is disposable):

```ts
// Run from the repository root: node <this file>
import { readFileSync } from 'node:fs';
import { researchDataset, type Review } from '<root>/scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '<root>/src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '<root>/src/model/scenario.ts';
const base: Review = JSON.parse(readFileSync('data/raw/k8/national.reviewed.json', 'utf8'));
const p = JSON.parse(readFileSync('data/raw/k8/agreements.proposed.json', 'utf8'));
const fix = Object.fromEntries(p.letterCorrections.map((c: { from: string; to: string }) => [c.from, c.to]));
const lists = base.lists.map(l => ({ ...l, letters: fix[l.letters] ?? l.letters }));
const review: Review = { ...base, lists, agreements: p.agreements };
const s = scenarioFromDataset(researchDataset({ review, rosters: [], releaseReady: false }));
const r = allocate(toEngineInput(s));
// compare r.lists[*].seats with lists[*].officialSeats
```

Output (Node 24.18.0, worktree at `233d58b`):

```
none: validate=[] threshold=15669 quota=12424/1 allocated=120 warnings=[]
  seats: אמת=52 ב=11 גד=5 ו=4 חל טעם=39 לע=4 עא=1 קנ=1 רא=1 רצ=2
  DIFFERENCES: אמת 52 vs 51; ב 11 vs 10; רא 1 vs 2; רצ 2 vs 3
proposed: validate=[] threshold=15669 quota=12424/1 allocated=120 warnings=[]
  seats: אמת=51 ב=10 גד=5 ו=4 חל טעם=39 לע=4 עא=1 קנ=1 רא=2 רצ=3
  EXACT: all 21 gazetted seat counts reproduced
```

The "none" run reproduces the previously recorded diagnostic exactly. With only the
three effective pairs the result is identical, which confirms that the ineffective pairs
do not change the allocation. The engine's pair totals (15, 3, 7) and within-pair
splits (10/5, 2/1, 4/3) match the CEC's printed pp. 10–11 and 16–18.

**Not checked:** the CEC's cross-list remainder table on printed pp. 12–14 (PDF pages
8–10) and the half-seat clause page (printed p. 15) were not compared step by step with
the engine's remainder steps. Only the final result and the pair stages were compared.

## Transcription corrections required in `national.reviewed.json`

These were read from the retained official results gazette `research/k08-results.pdf`
(YP 1979 p. 608, rows and seat table, rendered at 300 dpi) and confirmed independently in
the CEC appendix p. 3 (list table citing YP 1954 p. 88) and p. 22. Votes and seats are
unaffected.

| Row | Dataset now | Official |
|---|---|---|
| 9 | `ל` המפלגה הליברלית העצמאית | **`לע`** (same name) |
| 11 | `סז` תנועה עממית | **`סנ`** (same name) |
| 18 | `רם` רשימת מגינים בישראל | **`רה` רשימת תימנים בישראל** |
| 8 | רשימה הלכה (מיסודו של הליגה להגנה יהודית בארה״ב) | רשימת הליגה (מיסודה של הליגה להגנה יהודית בא״י) |
| 13 | תנועת לאחדות | תנועה לאחוה |
| 17 | קדמה ופיתוח | קידמה ופיתוח |
| 12 | רשימה ערבית לבדווים וכפריים | רשימה ערבית לבדוים וכפרים (historical spelling) |

Consequences for integration:

- `scripts/lib/list-meta.ts` keys `8-ל`, `8-סז` and `8-רם` must become `8-לע`, `8-סנ` and
  `8-רה`. The `8-רם` and `8-ענ` display names must also change.
- `tests/historical-k8.test.ts`: the `published` map key `ל` must become `לע`, and the
  `unresolved` expectations should be replaced by exact reproduction.
- `8-רא` and `8-עא` share colour `#008300`. `check-colours.ts` may reject this on release.
- `data/raw/k8/national.reviewed.json` must be re-hashed in SOURCES (`k8-national-reviewed`).

The machine-readable form is in `data/raw/k8/agreements.proposed.json`.

## Search log

| # | Query / URL | Site | Result |
|---|---|---|---|
| 1 | `הסכם עודפים 1973 הבחירות לכנסת השמינית` (WebSearch) | general | Pointed to hamichlol.org.il and IDI pages. The search summary found no pair list. Dead end on its own. |
| 2 | he.wikipedia.org/wiki/הבחירות_לכנסת_השמינית (WebFetch, then MediaWiki API) | Hebrew Wikipedia | **Hit.** Section "הסכמי עודפים" lists the six pairs and cites the gov.il CEC appendix. Retained. |
| 3 | gov.il BlobFolder `…/memorandum-knesset8/he/archive_knesset8_memorandum-apdx.pdf` (curl) | gov.il, official | **Decisive.** HTTP 200, 28.4 MB, 24 pages. Section ז pp. 10–11 lists the connections; pp. 16–18 pair division; p. 22 final. |
| 4 | `…/memorandum-knesset8/he/archive_knesset8_memorandum.pdf` (guessed main memorandum) | gov.il | HTTP 404. The main memorandum was not found under that name. |
| 5 | `…/memorandum-knesset9/he/archive_knesset9_memorandum-apdx.pdf` (guessed sibling) | gov.il | HTTP 404. Not pursued further (out of scope). |
| 6 | gov.il/he/departments/dynamiccollectorresultitem/memorandum-knesset8 (landing page) | gov.il | HTTP 403 for curl and WebFetch (bot protection). Not circumvented. Landing-page metadata not captured. |
| 7 | `gov.il "memorandum-knesset8" זכרון דברים תוצאות הבחירות לכנסת השמינית` (WebSearch) | general | Not indexed. Found only `memorandum-knesset18` and the 18th-Knesset PubsCollection page. |
| 8 | idi.org.il/policy/parties-and-elections/elections/1973/ | IDI | Results table only; no agreements. |
| 9 | main.knesset.gov.il/mk/elections/Pages/ElectionsResults8.aspx | Knesset | Script-rendered; WebFetch saw no content. No agreement text recovered. |
| 10 | retained `research/k08-results.pdf` p. 2 (YP 1979 p. 608), re-rendered at 150 and 300 dpi | official, already retained | Confirmed votes and seats; exposed the letter and name errors above. |

Not repeated, because they are already recorded in decisions 0071, 0074 and 0076 and in
`k8/search.reviewed.json`: olaw Yalkut issues 1950–1978, candidate YP 1954, the CEC
station scan, and CBS 461 queries. None of those locations contained this document. It sits in a separate
gov.il collection (`dynamiccollectorresultitem/memorandum-knessetN`), not in
`guide/election-committee-history`.

Not used: the National Library (blocks automated access; no proxies or circumvention),
Firecrawl (out of credits), and Google Books (unnecessary once the official record was found).

### Leads for later work (not pursued)

- Source PDF pages 19–24 (printed pp. 23–28), "יד. שמות הנבחרים", hold a **handwritten**
  list of elected members. PDF pages 20–22 look nearly blank in the scan, so the section
  may be incomplete or faint. It could support the separate k8 roster blocker, but it was
  not inspected beyond the first page (18 Alignment names starting מאיר גולדה).
- The gov.il collection pattern `dynamiccollectorresultitem/memorandum-knessetN` may hold
  equivalent CEC calculation records for other elections, with different file names.

## Storage

Durable: the 8-page extract, the Wikipedia API snapshot, the proposal JSON and this log.
Scratch (`.backup-scratch/k8agr/`, reproducible): the full 28 MB original (re-downloadable
from the URL above; SHA-256 recorded), page renders, crops, the PyMuPDF helper scripts
and the reproduction script. PyMuPDF 2.1 (MuPDF 1.28.6) ran via `uv run --with pymupdf` with
`UV_CACHE_DIR=.backup-scratch/uv-cache`.
