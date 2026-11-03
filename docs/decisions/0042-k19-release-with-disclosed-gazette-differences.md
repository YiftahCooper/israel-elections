# K19: release 2013 on the CEC final figures, with the gazette differences disclosed

Decided by the parent agent on behalf of the owner, 3 November 2026. Supersedes the "hold release" part of [0041](0041-k19-national-discrepancies-release-held.md); its evidence stands.

## Context

Decision 0041 found two kinds of disagreement between the 2013 results notice in Reshumot (YP 6540) and the CEC's final results, as published on the CEC results site and in the government datastore:

- **The notice's printed valid total is 3,792,472, but its own 32 list counts sum to 3,792,742.** That is the final results' total, and the two numbers have the same digits with "472" and "742" swapped. The notice is therefore internally inconsistent.
- **Three list totals differ:** Likud–Yisrael Beiteinu +109, Kadima −107 and Hayisraelim −2. These net to zero.

No official document explaining these differences, or naming the polling stations involved, was found. Decision 0041 therefore kept the election unavailable.

The CEC final figures are themselves an official publication. They are internally consistent, and every one of the 1,185 locality rows reconciles exactly with the 10,109 polling-station records.

## Decision

Release the 2013 election using the CEC final figures. Disclose both gazette differences in the dataset's status note and the election index.

Before deciding, the allocation was run under both versions of the list votes:

| | Likud–YB | Yesh Atid | Labor | Jewish Home | Shas | UTJ | Hatnuah | Meretz | Ra'am–Ta'al | Hadash | Balad | Kadima |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CEC final | 31 | 19 | 15 | 12 | 11 | 7 | 6 | 6 | 4 | 4 | 3 | 2 |
| Gazette lists | 31 | 19 | 15 | 12 | 11 | 7 | 6 | 6 | 4 | 4 | 3 | 2 |

Both versions are identical to the officially published seats. The disagreement cannot change any seat, any threshold outcome or any agreement result.

## Alternatives considered

- **Keep 2013 unavailable until an official explanation is found.** This withholds a fully reconciled official dataset because of an unexplained difference that is known to be immaterial to every published result. It also offers users nothing in its place.
- **Use the gazette's list counts.** These do not reconcile with the polling-station records, which sum to the CEC final figures. The printed total also contradicts the counts themselves.
- **Adjust polling stations to match the gazette.** This would fabricate data.

## Consequences

The election picker offers 2013. The Sources tab shows the disclosure in both languages. If an official correction or explanation is found later, it should be added to this record, and the dataset's note updated.

## Sources

- Decision 0041 and the retained sources it lists: `data/raw/k19/results.pdf` (YP 6540), the CEC final-results numeric capture, and the data.gov.il locality and polling tables.
- The comparison was computed with this repository's engine (`src/engine/allocate.ts`) on `public/data/k19.json`, with the three gazette list totals substituted.
