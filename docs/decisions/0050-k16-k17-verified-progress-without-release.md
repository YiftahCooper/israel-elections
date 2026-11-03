# Keep the 2003 and 2006 elections unavailable despite successful seat checks

## Context

The owner requires exact national reconciliation, complete verified candidate rosters,
complete agreements and locality data with no invented fields. Reading the retained scans
and summing the official polling rows exposed differences that were not documented before.
The results notices do not state the electorate or total turnout: section 84 lists votes,
invalid votes, seats and elected names. Those missing totals cannot be transcribed from them.

For 2003, Yalkut HaPirsumim 5155 p. 1406 prints 132,730 votes for Mafdal and 883 for
Lider. Polling rows have 132,370 and 833. The printed list counts sum to 3,148,774,
410 above the same page's stated 3,148,364 valid votes. The Knesset's own historical
seat-allocation example corroborates 132,370 for Mafdal, but that is not a formal
correction to the gazette. No correction for Lider was verified.

For 2006, Yalkut HaPirsumim 5514 pp. 2464–2465 gives 3,137,064 valid and 49,684
invalid votes. Every list count agrees with the datastore. However, datastore turnout
is 3,186,739, giving 49,675 invalid votes, nine below the gazette. The official CBS
summary independently reports that turnout. No correction or authoritative explanation
for the nine votes was verified.

The 2003 datastore has 7,886 records, one of which is an XLS end-of-file sentinel.
Its 7,885 actual rows include 149 double-envelope batches. The batches repeat 158,296
in the field named “voters”; adding that to the ordinary stations would inflate the
national electorate. Ordinary-station electorate is exactly 4,720,075. The 2006 source
has 8,426 rows, also including 149 envelope batches, with no electorate or numeric
locality-code fields. Neither table supplies regional committee numbers.

## Decision

Keep both elections `available: false` and emit no public national or locality files.
The new `buildK16()` and `buildK17()` registrations run evidence checks and return no
public build jobs while those release gates remain blocked. A premature index change
to available makes the build fail with the reasons. This is verified progress, not a
completed implementation of either release builder.

Retain a reviewed transcription of each gazette, exact polling sums and a small digest
of derived locality rows in `data/raw/kNN/`. Preserve both sides of every discrepancy.
National electorate and turnout are supplemental official CBS facts, explicitly labelled;
they are not attributed to the gazette. The reviewed JSON is a project-produced derivative
(`official: false` in the source manifest), not a new official publication.

Derive research locality groups by numeric code for 2003 and exact trimmed locality name
for 2006, keeping missing fields null. These are not `LocalityDataset` files. They include
1,172 and 1,150 groups respectively, including one double-envelope group each. Their
SHA-256 is computed from compact `JSON.stringify(rows)` in the documented builder order.
No independent locality source exists for either election. Check all station rows and the
digest when scratch exists; otherwise log the skipped polling check and still validate
retained hashes, national arithmetic and seat reproduction. Fetching sources restores the
polling input; it does not resolve the recorded differences.

Retain the complete official surplus notices from the disclosed olaw.org.il mirror:
YP 5151 p. 1312 (six pairs, published 26 January 2003) and YP 5510 p. 2386 (four pairs,
published 26 March 2006). Both were visually read in full, including the last pair and
signature. Agreement completeness comes from those notices, not from seat reproduction.

Use polling counts only in conspicuously labelled in-memory research fixtures to exercise
`scenarioFromDataset` → `toEngineInput` → `allocate`. Every list's seats match the gazette
exactly: 120 seats in each election, thresholds 47,226 and 62,742, quotas 25,138 and
24,619. This does not resolve the national discrepancies or prove the rosters.

Candidate verification is explicitly partial: only the largest list's first candidate and
terminal rank were checked against the candidate scan. In 2003, Likud begins with
שרון אריאל and ends at rank **114**, not the 120 initially submitted. In 2006, Kadima
begins with אולמרט אהוד and ends at 120. Do not invent the remaining names or claim full
candidate-count coverage. Do not add `candidatesUnavailable`: the official rosters exist
and remain verifiable, even though their transcription is unfinished. No secondary roster
was incorporated. No application schema or UI files were changed.

## Alternatives considered

Silently using the polling numbers would hide disagreements with the statutory publication.
An assumed correction based on a plausible printing error would exceed the evidence.
Using zero, generated locality codes or present-day committee mappings would invent data.
An empty roster marked unavailable would wrongly imply there is no verifiable roster.
Releasing only a national dataset would still leave the required candidate and locality
gates unsatisfied. We retain the verified work without claiming release readiness.

## Consequences

The task's two release datasets are incomplete. Full rosters, authoritative treatment of
the national discrepancies, and a supported representation of missing locality metadata
remain prerequisites. The parent's merge can retain useful national tests, complete primary
agreements and reproducible reconciliation without making either election usable prematurely.
The existing k25/k26 build continues to work in a clean checkout.

The digest makes a repeat derivation comparable, but cannot independently establish locality
truth when the polling copy is absent. The seat tests validate the diagnostic national
fixtures, not nonexistent committed application datasets or unverified candidate rosters.

## Sources

* Retained CEC results: `data/raw/k16/results.pdf`, YP 5155 pp. 1406–1407;
  `data/raw/k17/results.pdf`, YP 5514 pp. 2464–2465.
* Retained candidates: YP 5148 pp. 1197–1198 (Likud); YP 5504 pp. 2192–2193 (Kadima).
* https://olaw.org.il/yalkut/yalkut-5151.pdf — p. 1312, notice dated 20 January 2003.
* https://olaw.org.il/yalkut/yalkut-5510.pdf — p. 2386, notice dated 23 March 2006.
* https://data.gov.il/api/3/action/datastore_search?resource_id=498b48e9-5af6-474d-b7a4-5ac1e21d3a08
* https://data.gov.il/api/3/action/datastore_search?resource_id=70f8bc93-8d98-4c20-ad7c-768af713f1c5
* https://www.cbs.gov.il/he/publications/DocLib/2023/ShnatonElectionsTheKnessetandGovernment.27/st27_02.pdf
  — table 27.2, 29 August 2023, retained once under k16 and referenced by both elections.
* https://main.knesset.gov.il/EN/About/Lexicon/pages/seats.aspx — supporting Mafdal figure;
  search-index extraction inspected; direct access to archived CEC HTML was refused (403).
* `data/raw/SOURCES.json`, both `national.reviewed.json` and `reconciliation.reviewed.json` files.
