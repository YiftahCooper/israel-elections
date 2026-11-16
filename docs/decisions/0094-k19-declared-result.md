# K19: the main table shows 2013's declared result

Decided by the owner on 16 November 2026 (Round 6 questions, card y2013), applied by lane U1. Changes which of the two official vote counts [0042](0042-k19-release-with-disclosed-gazette-differences.md) put in the dataset; its evidence and the disclosure stand.

## Context

The Central Elections Committee published the 2013 result twice. Three lists differ:

| List | Declared result (YP 6540) | CEC final results (polling stations) | Difference |
|---|---|---|---|
| Likud–Yisrael Beiteinu | 885,054 | 885,163 | +109 |
| Kadima | 79,081 | 78,974 | −107 |
| Hayisraelim | 18,941 | 18,939 | −2 |

The differences net to zero, so the valid total (3,792,742, as formally corrected by YP 6546) is the same. The declared result is the one printed in the gazette, by which the seats were handed out. The CEC final results add up every polling station's count. No document explains the gap, and no seat depends on it (0042's table).

## Decision

`public/data/k19.json` carries the declared result for every list. Each of the three lists keeps a source note with its polling-station sum, and the list panel's (i) and the election's status note give both figures.

## Consequences

- The 2013 map and the list of places add up to the polling-station sums, so their totals differ from the main table by up to 109 votes for these three lists; the status note says so.
- The builder checks that the declared result differs from the polling-station sums and from the CEC final capture by exactly the three documented amounts and no others.
- Family metadata that caches 2013 list votes (`data/meta/families/`) follows the dataset.

## Sources

The sources listed in 0041 and 0042: `data/raw/k19/results.pdf` (YP 6540), `data/raw/k19/results-correction.pdf` (YP 6546), `data/raw/k19/final-results.capture.json` and the data.gov.il locality table.
