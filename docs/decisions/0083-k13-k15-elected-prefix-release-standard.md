# K13–K15: release on verified elected-prefix rosters

Accepted 2026-11-03 by explicit project-owner instruction for this release.
This changes the full-winning-roster gate in 0080/0081; it does not rewrite their
historical findings or the allocation-law limits in 0082.

Every winning list must have a contiguous prefix of the officially registered roster,
covering **every elected name** independently read in results section 4, and at least
as many candidates as seats won. Later ranks are optional. Any incomplete roster is
marked `candidatesTruncated: true`. Untranscribed zero-seat lists have
`candidatesUnavailable: true` and `candidates: []`. The source scans exist; here
“unavailable” describes the untranscribed dataset roster, not absence of a gazette.

Names use the candidate gazette's surname/given-name order. Reviewed JSON retains
printed candidate pages, independent elected names and results pages. Explicit
`candidateRanks` map elected positions to the original registered ranks when the
results notice omits a registered candidate. No renumbering or replacement of original
registered candidates is hidden. Those prefixes extend far enough to include each
successor. The four omissions and one given-name variant are recorded in 0084.
The dataset's candidate ranks represent the registered notice, not later membership.

The builder verifies source hashes (including the reviewed JSON), national arithmetic,
every published seat, contiguous candidate ranks, all 120 elected identities and every
explicit name-variant resolution. It fails on an unexplained elected-name mismatch.
Punctuation/spacing differences are ignored only for comparison; stored names retain
the source reading. This verifies the retained evidence, not an exhaustive audit of
all intervening withdrawal notices or amendments.

Release all three as `official-final` with bilingual roster-coverage notes and
`hasLocalities: false`; no locality dataset is emitted. Keep the existing 1.5% rule
preset and engine unchanged. Nonwinning rosters and optional localities do not hold
this owner-authorized release. The missing 1992 agreement notice has its separate
explicit release decision in 0085.
