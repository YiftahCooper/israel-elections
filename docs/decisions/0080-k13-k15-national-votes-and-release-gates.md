# K13–K15: gazetted national inputs, exact seats, incomplete release gates

## Evidence and decision

Retain reviewed national transcriptions from the **Knesset** result tables in YP 4021
pp. 3776–3777 (1992), YP 4414 pp. 3482–3483 (1996), and YP 4757 pp. 3376–3378
(1999). Sources are the official gov.il scans already retained in `data/raw/research/`.
Their hashes are now also registered in `data/raw/SOURCES.json`. Expected seats in the
three historical tests are separate transcriptions of the published section 3/4 tables,
not calculations copied from engine output. All zero-seat lists are included.

| Election | Lists | Valid | Invalid | Cast | Registered | Threshold | Quota |
|---|---:|---:|---:|---:|---:|---:|---:|
| k13 | 25 | 2,616,841 | 21,102 | 2,637,943 | 3,409,015 | 39,253 | 20,715 |
| k14 | 20 | 3,052,130 | 67,702 | 3,119,832 | 3,933,250 | 45,782 | 24,779 |
| k15 | 31 | 3,309,416 | 64,332 | 3,373,748 | 4,285,428 | 49,642 | 25,936 |

Every gazetted list count sums exactly to valid. Valid plus the gazetted invalid count
agrees with the official CBS table 27.2 turnout. Registered and cast supplement the
notices from CBS; they are not falsely attributed to a gazette field. No disagreement
between these official totals was found. No list was adjusted to force agreement.

For k14, Likud–Gesher–Tzomet is **767,401** on p. 3482. The secondary IDI and
Atmor–Stoll tables' **767,951** creates the previously reported 550-vote error. Use the
gazette. The research's 1,000-vote shortfall in the 1992 IDI table is likewise no reason
to replace a gazetted count. Neither secondary table supplies production votes.

The PM ballots are separate: k14 PM valid **2,972,589**, k15 PM valid **3,193,494**.
Neither enters national Knesset valid votes, thresholds, turnout or invalid votes here.

## Gates and consequences

All three research fixtures reproduce **every** gazetted seat through
`scenarioFromDataset → toEngineInput → allocate`, fill 120 seats, validate as scenarios
and have no unresolved lottery or other warnings. This proves allocation consistency,
not full dataset readiness or agreement completeness.

Keep all three **unavailable** and emit **no** public k13/k14/k15 dataset or locality
file. The complete winning-list rosters have not been transcribed. The guarded builders
run during a clean build, verify source hashes and national arithmetic, and reject an
availability flip. They return no public build job, following the existing k16/k17
preflight convention. `researchDataset()` is diagnostic only, explicitly labelled,
and never written to public/data. Geographic counts of zero in that fixture mean no
geography supplied, not an official station or locality count.

No usable reconciled locality table is established. The 1996 odata ordinary-station
workbook omits outside envelopes according to the retained research; this work does
not fill that gap by subtracting national totals and inventing a locality. The 1999
mixed summary/detail workbook has not been fully reconciled. `hasLocalities: false`
is the intended release choice unless a later full reconciliation succeeds. Localities
are optional and are not themselves the blocking gate. No secondary locality output
is presented as official.

Verified candidate coverage and agreement search limits are in decision 0081.
Historical law evidence and its limits are in decision 0082. No engine change was made.
