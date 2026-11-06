# K19: retain final CEC figures, hold release pending an official explanation

## Context

YP 6540 p. 2492 prints 3,792,472 valid votes. Adding its 32 list counts gives
3,792,742 instead. This is an observed arithmetic inconsistency of 270, not evidence
of 270 identifiable missing ballots. The digit transposition is a plausible
explanation, but no official statement explicitly calling it a typo was found.

The CEC's final official results web page and government polling table both give
3,792,742 valid, 40,904 invalid, 3,833,646 cast and 5,656,705 eligible voters. There
are also three list-level changes between the gazette and that final publication:

| Ballot letters | Gazette | CEC final / datastore | Change |
|---|---:|---:|---:|
| מחל (Likud–Yisrael Beiteinu) | 885,054 | 885,163 | +109 |
| כן (Kadima) | 79,081 | 78,974 | −107 |
| יק (Hayisraelim) | 18,941 | 18,939 | −2 |

These changes sum to zero. All other list totals match. They do not explain the
printed grand-total discrepancy. The gazette supplies no polling-level table, so
national differences cannot identify which stations changed.

## Decision

Build a clearly labelled verification dataset using the final CEC national figures,
not invented corrections to polling rows. Retain a numeric capture of all 32 lists
from the official final page because direct scripted HTML requests return 403.
The capture is a manual transcription of an official source, not a secondary source.
Check every captured list against the dataset and every locality against polling
rows. Keep k19 `available: false`: the requested official explanation and polling
station attribution remain unresolved even though seats and geographical arithmetic
pass. Preserve the original gazette and disclose all three list exceptions in notes.

Use all seven pairs from the complete notice in YP 6530 p. 2156: Labor/Yesh Atid,
UTJ/Shas, Balad/Hadash, Dor Bonei Haaretz/Social Justice, Jewish Home/Likud–Yisrael
Beiteinu, Kadima/Am Shalem, Hatnuah/Meretz. The statutory publication was retrieved
from the disclosed olaw.org.il mirror. The complete notice, including ineffective
pairs, is checked separately from seat reproduction.

Keep all 1,184 independent locality rows. Each matches its polling sum exactly.
The independent file omits code 875, external envelopes: derive that row from its
228 polling rows (212,949 valid, 2,840 invalid, 215,789 cast, zero registered).
Retain this small aggregate and source fingerprint separately. With it, all 1,185
rows reconcile with the 10,109 polling records and national results. Map datastore
`מרץ` explicitly to ballot letters `מרצ`; never guess columns. Regional committee
is absent and labelled unknown (0). No political blocs or candidate party affiliations
are inferred.

Use original approved rosters in YP 6524, not the occluded Labor template repeated
in twenty PDF marked-content objects. Check each terminal rank and all name fragments;
identical repeated overflow rows are deduplicated only when the names match exactly.
One rank is incorrectly encoded as `551` in the PDF text on PDF page 7, x=174.8076:
visual inspection confirms **117** for טאהא ואסף. Apply that narrow text-decoding
correction explicitly, producing 117 Balad candidates and 1,595 candidates across
the 32 participating lists. The two extra approved rosters זה and פך have no votes
and are absent from the final participating-list table. Later resignations are not
applied. No secondary or unavailable rosters are needed; no schema change is needed.

## Alternatives considered

Using the printed 3,792,472 with its own list counts is internally inconsistent.
Subtracting 270 from selected stations would fabricate data. Treating the three
list changes as proof of their station origins would exceed the evidence. Keeping
k19 available merely because the engine returns 120 correct seats would skip the
user's explicit investigation gate.

## Consequences

The dataset is useful verified progress but is not released through the election
selector. Every gazetted seat is reproduced exactly; threshold is 75,855 and quota
29,366. Candidate counts, leaders and all seven agreements have regression tests.
Checksums support CI without scratch; full reconciliation runs when scratch exists.

Searches covered gazette issues 6524–6535 for agreements and 6541–6570 for corrections,
plus the CEC decisions book. The latter's pp. 362 and 367–368 discuss disqualification
of Tayibe 1, Yarka 2 and Sakhnin 26, and investigations elsewhere. They do **not**
connect those stations with the +109/−107/−2 changes or explain the printed 270.
No causal attribution is made. This search was not an exhaustive audit of all later
gazettes or every CEC document. A later official correction/explanation or earlier
polling snapshot is still needed to satisfy the outstanding request.

## Sources

* Gazette: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-results.pdf
* Final CEC publication: https://www.gov.il/apps/elections/eng/list/Results_eng.html
* Candidate gazette: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-cand.pdf
* Agreement notice via mirror: https://olaw.org.il/yalkut/yalkut-6530.pdf
* CEC decisions book: https://www.gov.il/apps/elections/elections-knesset-19/heb/law/Decisions2012-13.pdf
* Localities: https://data.gov.il/api/3/action/datastore_search?resource_id=c20cdcef-4d42-4241-a41b-6ca7ae51002d
* Polling: https://data.gov.il/api/3/action/datastore_search?resource_id=432d3185-545a-41d9-8c72-d10ee515919c
* Retained sources, hashes and retrieval details: data/raw/SOURCES.json.

## 6 November 2026 evidence addendum

YP 6546 (12 February 2013), p.2874, formally corrects the grand total:
במקום "3,792,472" צריך להיות "3,792,742". Retained as
`data/raw/k19/results-correction.pdf` with manifest ID `k19-results-correction`,
retrieved from https://olaw.org.il/yalkut/yalkut-6546.pdf. This supersedes the
research-state statement above that no official typo correction was found. It
does not amend any of the three list totals or establish their station origins.
Release state was already superseded by decision 0042. The same-rank list-vote
dispute is recorded for the owner in `docs/research/data-audit/k19-resolution.md`.
