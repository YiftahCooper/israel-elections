# K20 and K21: official rosters, agreements and reproducible verification

## Context

The 2015 and April 2019 elections had retained official sources, but no usable datasets.
Their candidate publications have different column layouts. A parser that merely checks
consecutive ranks can silently omit a final candidate, a one-person list, or a wrapped
name. The results must also work in a clean checkout without committing large polling
station tables.

## Decision

Use the final national results in Yalkut HaPirsumim 7010, pages 4370–4373, for k20 votes,
invalid ballots and seats. That notice does not publish registered voters. Both official
data.gov.il tables independently sum to **5,881,696 registered voters**, **4,254,738 cast**,
**43,854 invalid**, and **4,210,884 valid**. Retain those official totals; do not imply that
the electorate was read from the gazette. No numerical disagreement was found.

For k21, use the retained CEC national HTML, explicitly labelled official final results:
**6,339,729 registered**, **4,340,253 cast**, **30,983 invalid**, **4,309,270 valid**.
Both data.gov.il tables agree with it, including every list's votes. Its dataset `asOf`
is the retained source's capture date (3 November 2026), not an inferred certification date. Expected seats in
the tests are transcribed from these publications, independently of the engine.

Parse every registered roster from YP7000 (k20) and YP8168 (k21), using each table's
own column labels and positions. Preserve separate given/family names and explicitly
printed candidate parties. Every table text fragment must attach to a candidate;
conflicting duplicates, missing names and non-contiguous ranks fail the build.
Check every list's count against its printed end rank and all winning lists' first
candidate against their published leaders. K20 has 1,284 candidates in 26 lists;
k21 has 1,580 in 43 lists. No roster is secondary or unavailable.

Two source peculiarities need explicit treatment. YP7000 page 3944 encodes the last
rank of יץ as “01”, after ranks 7–9; read it as rank 10, סעיד בדראן. YP8168 repeats
identical rows for Labor (אמת) rank 100, עדנה סולודר, on page 9023 and Shas rank 70,
שמעון בן שלמה, on page 9046. Keep each candidate once at the printed rank. Do not
invent a missing candidate to make every list contain 120 people. K20's YP7001 also
reports resignations by נטליה ילינסון (Likud), סעיד בדראן and אבו עאבד ראאף (יץ).
Retain gazetted registration order and explicitly label these notices in list notes.
These resignations do not change the elected candidates. Later Knesset replacements
and a complete history of withdrawals/resignations are outside this dataset's scope.

Read each agreement notice in its printed column order through its signature date.
YP7001 page 3954 contains four numbered pairs: אמת–מרצ, ג–שס, טב–מחל, כ–ל.
YP8178 page 9310 contains six: אמת–מרצ, ג–שס, נ–ל, מחל–טב, דעם–ום, ףץ–ףז.
These are the complete numbered notices, including pairs involving lists that failed
the threshold. Completeness is supported by the notices, not inferred from seat
reproduction. Their olaw.org.il hosting is a disclosed mirror of primary publications.
No evidence of an additional pair was found in these complete notices; no wider
archive search for later correcting notices was performed.

Normalize only the external-envelope group to the application's code 9999. K20 uses
code 0 with a null name in the locality file but code 875 with the explicit name
“מעטפות חיצוניות” in its polling file. K21 uses 99999 in both. Neither source supplies
regional committee numbers: use the existing schema's numeric sentinel 0, not an
invented committee assignment. Preserve all ordinary locality codes.

When scratch polling files exist, validate their provenance hashes, every row's totals,
national totals and list votes, and every locality's exact aggregation of its polling
stations. Retain a small `locality-verification.json` per election, with the SHA-256 of
canonical derived locality rows, polling file SHA-256, and polling row count. Without
scratch files, log the skipped full reconciliation explicitly and still check locality
rows against the retained digest and official national totals. Unit tests also hash the
committed public locality rows. No build automatically rewrites verification evidence.

Assign common short names and presentation colours. Assign no default blocs: a k20
coalition changed during its tenure, and no government was formed from k21. Optional
political groupings would add interpretation unrelated to the verified results.

## Alternatives considered

Secondary candidate transcriptions are unnecessary because both official gazettes can
be parsed. Inferring candidates or agreements from seat outcomes would hide gaps.
Dropping zero-vote lists would lose their verified rosters. Keeping all polling JSON in
git would add roughly 10 MiB for these two elections alone. Unconditionally skipping
polling checks would discard the strongest reconciliation evidence when it is available.

## Consequences

Both elections can be released after all checks pass. K20 reproduces every published
seat, with threshold 136,854 and quota 33,511. K21 does so with threshold 140,052 and
quota 32,860. The build fails on any seat difference. This verifies the original final
results, not later court changes or changes in Knesset membership.

The digests establish consistency with the polling-verified release; they do not replace
an independent reconciliation on changed source files. Updating evidence requires
fetching the polling source again, examining any source changes, and completing full
reconciliation. Regenerate canonical rows with the same field order as the public
locality dataset, sorted by normalized code, and vote columns in national-result order;
hash compact `JSON.stringify(rows)` with SHA-256. Keep the evidence durable, not in
scratch. No schema or UI changes are needed.

## Sources

* `data/raw/SOURCES.json`: URLs, publisher, mirror disclosure, retrieval times and SHA-256.
* CEC YP7000: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset20-cand.pdf
* CEC YP7010: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset20-results.pdf
* CEC YP8168: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8168.pdf
* CEC k21 national results: https://votes21.bechirot.gov.il/nationalresults
* YP7001, primary notice via mirror: https://olaw.org.il/yalkut/yalkut-7001.pdf
* YP8178, primary notice via mirror: https://olaw.org.il/yalkut/yalkut-8178.pdf
* Official data.gov.il resource IDs and paged API URLs are retained in SOURCES.json;
  catalogue: https://data.gov.il/api/3/action/package_show?id=votes-knesset
