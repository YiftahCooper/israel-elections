# K18: use the CEC memorandum for ballot totals and derive localities

## Context

The 2009 national results gazette (YP 5917, pp. 2400–2404) supplies 33 participating
lists, their votes and their seats. Its valid votes and every list's vote count agree
with the government polling table. However, its invalid count is 49,684. The CEC's
allocation memorandum, PDF page 3, instead says 43,097 invalid, 3,416,587 cast,
3,373,490 valid and 5,278,985 eligible voters. These ballot totals agree exactly with
the polling table. The difference in invalid ballots is 6,587. No formal gazette
erratum was located in issues 5918–5940; the memorandum is the independently
published official basis for the exception, not evidence that an erratum exists.

## Decision

Use the memorandum's national ballot totals, and the gazette's list votes and seats.
Do not modify any polling row. Derive 1,156 locality rows and one double-envelope
summary (code 0) from all 9,264 source rows. This is derived data, not independent
locality verification. Keep the envelope summary's published registered field
(186,919), but exclude it from the national electorate: it repeats voters already
registered at their home stations. The remaining 5,278,985 equals the memorandum.
The dataset status explicitly labels the derivation and the invalid-count exception.

Use all eight pairs in the complete statutory notice in YP 5912, p. 2254. In its
published order: Labor/Meretz, Likud/Yisrael Beiteinu, Kadima/Greens, Jewish Home/
National Union, Gil/Tzabar, Shas/UTJ, Hadash/Ra'am–Ta'al, Strong Israel/Green
Movement–Meimad. The PDF is retained from the olaw.org.il mirror, explicitly disclosed
in provenance. Reading the complete notice establishes its eight pairs; reproducing
seats alone would not establish completeness of ineffective agreements.

Parse the original approved rosters in YP 5909, checking every terminal rank, every
contiguous rank and every attached name fragment. All 33 participating lists have
rosters (1,613 candidates); the additional approved פח roster is not in the final
participating-list table. Later resignation notices are not applied: this is a
snapshot of the candidate gazette, not a record of subsequent membership. Main-list
leaders and the largest list's first candidate (Livni) are checked in tests. Do not
infer individual sponsoring parties; sponsor fields remain empty/null. Regional
committee is absent from the tables and represented by 0, disclosed in status.
No default blocs are assigned: later coalition membership is not treated as a
complete classification of voters or lists.

## Alternatives considered

Using the gazette's invalid count would break valid + invalid = cast and contradict
both the memorandum and source rows. Adjusting localities to match it would invent
votes. Retaining polling JSON adds avoidable size; omitting all durable geographic
evidence would make CI unable to verify its inputs.

## Consequences

K18 is available. The real scenario-to-engine path reproduces every gazetted seat,
threshold 67,470 and quota 27,246. A committed locality SHA-256 and source fingerprint
support clean-checkout verification; full polling reconciliation runs whenever scratch
is present. Ordinary builds never replace the fingerprint. DATA.md documents the
explicit regeneration command. The checksum establishes integrity of the reviewed
aggregate, not an independent election source. No schema extension is needed.

## Sources

* CEC results gazette: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset18-results.pdf
* CEC allocation memorandum: https://www.gov.il/apps/elections/elections-knesset-18/heb/about/Electoral_result.pdf
* Candidate gazette: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset18-cand.pdf
* Agreement notice, primary publication via mirror: https://olaw.org.il/yalkut/yalkut-5912.pdf
* Polling API: https://data.gov.il/api/3/action/datastore_search?resource_id=840edb33-90ac-4176-8ad9-4cdcb8e5caa5
* Files, retrieval timestamps and SHA-256: data/raw/SOURCES.json.
