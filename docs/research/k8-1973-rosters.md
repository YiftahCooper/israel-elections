# K8 (1973): winning-list rosters and elected-name cross-check

Reviewed 4 November 2026. This is data only, and the build does not read it yet. The
parent wires k8 into the build. This document covers the roster blocker in 0072 and 0077.
The agreements are covered in [k8-1973-agreements.md](k8-1973-agreements.md) and ADR 0077.

## Result

- All **10 seat-winning lists** have official candidate ranks transcribed. Each list's
  ranks start at 1 and run without gaps up to its seat count. All **120** elected names
  were read independently in the results notice and compared one by one.
- **No candidate was skipped and none is marked `notSeated`.** In every winning list the
  results notice seats exactly registered ranks 1..seats, in order.
- A third independent official reading agrees. The CEC appendix (Form 30), section יד
  "שמות הנבחרים", printed pp. 23–28, lists the same 120 people in the same order.
- The Knesset OData opening membership (21 January 1974) has 120 MKs and 120 faction
  members. 102 match exactly after removing punctuation. The other 18 pair one-to-one
  within the same faction as spelling or shortened-name variants. No different person
  and no replacement before the opening session is indicated.
- Ballot letters use the 0077 corrections. The Independent Liberals are **לע**. The other
  two corrections, סנ and רה, are zero-seat lists and have no roster here.

| Letters | Seats | Transcribed / published | Candidate p. | Results p. | CEC p. | Variants |
|---|---:|---:|---|---|---|---:|
| אמת | 51 | 51 / 120 | 88 | 609 | 23–25 | 3 |
| ב | 10 | 10 / 113 | 89 | 609 | 25–26 | 2 |
| גד | 5 | 5 / 91 | 90 | 609 | 26 | 0 |
| ו | 4 | 4 / 120 | 97 | 609 | 26 | 0 |
| חל טעם | 39 | 39 / 120 | 91 | 609 | 26–28 | 2 |
| לע | 4 | 4 / 120 | 92 | 609 | 28 | 0 |
| עא | 1 | 1 / 50 | 94 | 610 | 28 | 1 |
| קנ | 1 | 1 / 120 | 95 | 610 | 28 | 0 |
| רא | 2 | 2 / 44 | 96 | 610 | 28 | 0 |
| רצ | 3 | **8 / 8 (complete)** | 96 | 610 | 28 | 0 |

The published roster size is the last printed rank. Every list except רצ is truncated
(`complete: false`). The 11 zero-seat lists were not transcribed. They are unavailable
in this dataset, not absent from the gazette. Candidate pages: מס and סנ are on p. 93,
ענ, ער and פ on p. 94, רה and רס on p. 96, ש on p. 97, ז on pp. 90–91, and יא and כך on p. 92.

## Sources (all official, already or newly retained)

| Source ID | What | Pages used |
|---|---|---|
| `k8-candidates-gazette` | YP 1954, 21 Oct 1973, "רשימות המועמדים לכנסת השמינית" (`research/k08-candidates.pdf`) | printed 88–98 (PDF 2–12) |
| `k8-results-gazette` | YP 1979, 11 Jan 1974, results notice, section (4) "שמות האנשים שנבחרו חברי הכנסת השמינית" (`research/k08-results.pdf`) | printed 609–610 (PDF 3–4) |
| `k8-cec-elected-appendix` | **New**: unaltered 6-page extract of the CEC memorandum appendix (`k8/cec-memorandum-appendix-1973-elected.extract.pdf`) | printed 23–28 (source PDF 19–24) |
| `k8-opening-membership-cross-check-reviewed` | **New**: project extraction of Knesset OData; cross-check only | — |

The candidate notice was published on **21 October 1973**, before the election was
postponed to 31 December. No later candidate-change notice was located. Earlier agents
checked the covers and contents of YP 1955–1978 (0076), but not every page. Independently
of that, the results notice and the CEC appendix both seat exactly the gazetted ranks
1..seats, so no amendment affects any elected rank. They do not prove that later ranks
were never amended.

The appendix extract: the full file was re-downloaded on 4 November 2026 (HTTP 200,
28,395,623 bytes, SHA-256 `38fd80b4…62b3b6`, identical to 0077). The extract was made
with PyMuPDF `insert_pdf` and is 7,215,843 bytes, SHA-256 `77c288ec…d580c7`. All six
pages render pixel-identically to the source pages at 72 dpi. It is separate from the
earlier 8-page extract, whose hash 0077 relies on.

## Method

Pages were rendered with pdf.js 6.5.438 in headless Chromium at 1.5× for layout and at
5–16× zoom for reading, letter by letter. Elected ranks were read in the candidate
notice and, separately, in the results notice. The two readings were then compared.
Names keep the printed surname/given-name order. The maqaf is stored as ASCII `-`, as in
the k9–k12 files. Gershayim and geresh use `״` and `׳`. Titles are kept as printed
(ד״ר in Likud ranks 2, 3 and 5). No name came from OData or any secondary source.
Renders and the generator are reproducible scratch material in `.backup-scratch/k8r/`.
The reviewed JSON is the durable record.

## Explicit variants (candidate notice vs results notice)

Each one is recorded in `spellingVariants` with a note. All are the same person.

| List / rank | YP 1954 (candidate) | YP 1979 (results) | Difference |
|---|---|---|---|
| אמת 7 | ישעיהו שרעבי ישראל | ישעיהו-שרעבי ישראל | maqaf |
| אמת 19 | גרוסמן אורקין חייקה | גרוסמן-אורקין חייקה | maqaf (see doubtful readings) |
| אמת 40 | (יודין) דרניצקי יהודה | יודין (דרניצקי) יהודה | bracket placement |
| ב 1 | בורג יוסף שלמה | בורג שלמה יוסף | given-name order |
| ב 7 | אבו חצירא אהרון | אבו-חצירא אהרון | maqaf |
| חל טעם 13 | אברמוב שנאור זלמן | אברמוב שניאור זלמן | yod |
| חל טעם 38 | שחטרמן אברהם | שכטרמן אברהם | ח / כ |
| עא 1 | אבו רביעה חמאד | אבו-רביעה חמאד | maqaf |

Where checked, the CEC appendix follows the candidate notice. It writes שנאור (p. 27)
and שחטרמן, (יודין) דרניצקי and בורג יוסף שלמה (pp. 25, 28). It also writes אבו רביעה
with a clear final ו (p. 28).

## Doubtful readings

- **אמת 19, p. 88.** There is a raised print mark inside "אורקין", between ו and ר. At
  10× it is not a letter. The reading is אורקין, matching the results notice p. 609 and
  the CEC appendix p. 24.
- **עא 1, p. 94.** The final letter of "אבו" has a slightly long stroke, so it could be
  read as ן. It is read as ו because of the results notice ("אבו-רביעה", p. 610) and the
  clear ו in the CEC appendix p. 28.
- **חל טעם 29, p. 91.** At 1.5× the first letter looks like ב. At 12× it is clearly נ
  (נוף), in both the candidate notice and the results notice p. 609. The CEC
  handwriting, p. 27, is ambiguous between ג and נ. This does not change the reading.
- **CEC appendix p. 23.** Punch holes partly cover the first letters of דיין, פרס and
  ידלין. The order and the remaining letters still match.
- **רצ 1, p. 610.** The results notice has a speck inside "שולמית". The reading is not
  affected.

## Knesset OData opening-membership cross-check

The request was `KNS_PersonToPosition?$filter=KnessetNum eq 8 and (PositionID eq 43 or PositionID eq 61 or PositionID eq 54)&$expand=KNS_Person&$format=json`.
All 4 pages were fetched by following `odata.nextLink` and re-adding `$format=json`, for
316 rows in total. The opening date comes from `KNS_KnessetDates` id 50: 1974-01-21.
The interval filter keeps records with start ≤ opening and finish > opening (or null),
as in 0076. That leaves **120 MKs and 120 faction members**.

Normalization removes whitespace, hyphens, quotes, brackets and ד״ר. Each API name is
then matched against either the results reading or the candidate reading. **102 match
exactly.** The remaining 18 were paired by reading within the same faction. Each pair
shows one of these differences:

- shortened or alternative given names: שריד יוסי, אליאב אריה לובה, חזני מיכאל, בורג
  יוסף, בן-מאיר יהודה, תמיר שמואל, נסים משה, פלומין יחזקאל, נוף עקיבא;
- an older surname moved into the given name: דרניצקי יהודה (יודין);
- a single surname: גרוסמן חייקה;
- a later double surname: כהן-אבידב מאיר;
- spelling: ידלין/יריב/בן-אהרן with אהרן, אבוחצירא אהרן, ארליך שמחה, שינמן פנחס.

These pairings are interpretation, not identity proof. Every request URL and response
hash, every opening member, every unmatched name on both sides and the 18 pairings are
kept in `data/raw/k8/opening-membership-cross-check.reviewed.json`. API names were never
substituted for gazetted names.

## Files

- `data/raw/k8/rosters.reviewed.json`: per winning list, the ReviewedRoster shape from
  `scripts/lib/historical/k8-k12-common.ts`. It holds `letters`, `complete`,
  `publishedCount`, `pages`, and `candidates[{rank,nameHe,page}]`. It also embeds
  `electedCrossCheck{sourceId,pages,ranks,namesHe,note,spellingVariants}`, the k9–k12
  format.
- `data/raw/k8/elected.reviewed.json`: the independent reading of results section 4, in
  the k13–k15 shape: `names`, `candidateRanks` and `resultsPages`, plus the CEC pages.
  `tests/elected-names.test.ts` reads this file first.
- `data/raw/k8/cec-memorandum-appendix-1973-elected.extract.pdf`: the new official
  extract.
- `data/raw/k8/opening-membership-cross-check.reviewed.json`: the OData cross-check.

### Integration notes for the parent (not done here; scripts and tests untouched)

1. `k8-k12-common.ts` currently reads `data/raw/k8/candidates.reviewed.json` and requires
   source ID `k8-candidates-reviewed`. Either point k8 at `rosters.reviewed.json` with
   source ID `k8-rosters-reviewed`, or rename the file. The contents already pass that
   verifier's roster checks, which were re-run in Python against this file.
2. `national.reviewed.json` still uses `ל`. The roster uses `לע`, so apply the 0077 letter
   corrections first, or the "unknown roster letters" assertion fails.
3. Then set `candidateChecks.completeWinningRostersVerified: true`, drop the roster
   blocker, and add the new source IDs to `sourceIds`.
