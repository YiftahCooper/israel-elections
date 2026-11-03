# K22–K24: gazetted rosters, complete agreements and portable reconciliation evidence

## Context

These three elections have official final national HTML, independent locality tables,
polling-station tables and text-bearing candidate gazettes. Their table layouts differ
from K25: two groups of top-aligned names, wrapping across several lines, sometimes
with party columns. The generic historical parser was an unfinished prototype.

Polling-station downloads are reproducible scratch material and absent in CI. A clean
build still needs evidence that its retained locality output matches a fully reconciled
source. Seat reproduction alone cannot prove complete rosters or agreement notices.

## Decision

Use an isolated K22–K24 parser. It reads the gazette's printed column labels and
geometry, joins split headings, preserves wrapped names and explicit candidate party
labels, requires every table text fragment and rank to be consumed exactly once,
checks contiguous ranks and each roster's reviewed final rank, and checks the leaders
of every seat-winning list. YP 9476 pp. 4266–4267 has a shifted, extra table heading;
use the name alignments visible in its body, with explicit code and regression tests.
No names are guessed, modernized or taken from a secondary roster.

The rosters represent the lists in the candidate gazette, before subsequent resignation
notices. They do not purport to reconstruct election-day amendments or later Knesset
membership. Dataset status says so. Retain relevant known resignation notices in list
notes. K23 Tzomet is explicitly withdrawn in YP 8708; its gazetted roster remains
available for inspection with zero votes and zero seats.

Use the complete numbered section 67 notices in YP 8430 p. 14634 (five pairs),
YP 8708 pp. 4468–4469 (three pairs), and YP 9478 p. 4284 (six pairs). Retain all pairs,
including those with a below-threshold or withdrawn partner. The new K22/K24 PDFs are
primary statutory publications retrieved from the olaw.org.il mirror, disclosed in
the source manifest. Parse the notice independently, column by column, through its
signature; check paragraph numbering, pair count and unique membership.

After full reconciliation, retain data/raw/kNN/reconciliation.json with source hashes,
polling-station count, a SHA-256 of the station-derived locality vote projection sorted
by code, and a SHA-256 of the entire generated locality dataset. The projection excludes
registered voters, names and committee metadata, matching K25's reconciliation contract.
Recompute it from polling rows whenever scratch exists. Without scratch, log that the
full check is skipped and require retained locality output and source hashes to match
the record. The normal builder must never regenerate or bless the record automatically.

Keep default blocs empty. No grouping based on the government actually formed has
been verified for these builds. In particular, a joint electoral list does not establish
that all its members later joined the same coalition. Users can define their own
groupings. Display names and colours remain application metadata, not official
electoral facts.

## Alternatives considered

Reusing the prototype would lose name fragments and misread changing columns. Releasing
only major-list candidates would conceal available official rosters. Inferring agreements
from seat outcomes would miss inactive pairs. Committing full polling JSON would add
avoidable repository weight. Skipping every geographical check in CI would leave the
committed locality dataset unprotected. Applying an incomplete set of resignation
notices would misleadingly imply a fully amended roster.

## Consequences

All three builders validate votes, seats, rosters and agreements against retained
sources. Every list's official seat count is tested, including zero-seat lists.
Thresholds and general quotas are K22 144,197 / 35,917, K23 149,178 / 37,943, and
K24 143,327 / 36,210. Candidate totals are 1,205, 1,097 and 1,406 respectively.
No secondary or unavailable roster flags, and no schema change, are needed.

The clean-checkout digest is evidence of a previous full reconciliation, not a fresh
polling download or an independent digital signature from the CEC. Changed sources
require fetching, investigation and explicit regeneration. K22's electorate discrepancy
is separately documented in decision 0020. Exhaustive subsequent roster amendments
and later membership changes remain outside these gazette snapshots.

## Sources

* Candidate gazettes retained as data/raw/k22/candidates.pdf (YP 8420),
  data/raw/k23/candidates.pdf (YP 8698), data/raw/k24/candidates.pdf (YP 9476).
* https://olaw.org.il/yalkut/yalkut-8430.pdf — mirrored official agreement notice.
* https://olaw.org.il/yalkut/yalkut-8708.pdf — mirrored official agreement and resignation notices.
* https://olaw.org.il/yalkut/yalkut-9478.pdf — mirrored official agreement and resignation notices.
* https://votes22.bechirot.gov.il/nationalresults (also votes23 and votes24).
* data/raw/SOURCES.json for exact official CKAN URLs, hashes and retrieval timestamps.
