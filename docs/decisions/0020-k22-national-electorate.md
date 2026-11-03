# K22: retain the national electorate and disclose the geographical gap

## Context

The CEC final national results page for the election of 17 September 2019 reports
6,394,030 registered voters. The independent data.gov.il locality file and the
polling-station file each sum to 6,391,218, which is 2,812 fewer.

Every list's votes, 4,436,806 valid votes, 28,362 invalid votes and 4,465,168 votes cast
agree exactly across all three sources. Each locality's list votes and ballot totals
also agree exactly with the sum of its polling stations. The disagreement concerns
registered voters only. We have not established why the published electorates differ.

## Decision

Use 6,394,030 as the dataset's national registered-voter total, because it is the
explicitly published final national electorate. Keep the locality registered-voter
figures exactly as downloaded. Disclose both figures and the unresolved difference
in the dataset status and DATA.md. Do not spread 2,812 invented voters over localities.

The builder requires these exact two electorate totals. Any different discrepancy
fails the build and requires a new investigation. It still checks all national vote
figures and every locality/polling-station vote figure without tolerance.

## Alternatives considered

Using the geographical sum as the national total would contradict the explicit final
national result. Silently adding voters to selected localities would fabricate data.
Treating the discrepancy as a vote-count difference would also be misleading.

## Consequences

National turnout uses the published national electorate. Locality turnout uses each
locality's published electorate. Summing locality electorates will not reproduce the
national electorate; the difference is visible and documented. Exact seat reproduction
is unaffected, because allocation depends on valid votes, which reconcile exactly.
This decision chooses which published total to display; it does not explain the gap.

## Sources

* https://votes22.bechirot.gov.il/nationalresults — retained as data/raw/k22/nationalresults.html.
* data/raw/k22/localities.datagov.json and the k22-ballots-datagov resource in data/raw/SOURCES.json.
* data/raw/k22/reconciliation.json binds the verified polling source and locality output by SHA-256.
