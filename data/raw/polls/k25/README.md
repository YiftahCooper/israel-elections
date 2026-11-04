# k25 polling archive research pilot

Research inputs only; see `docs/research/polling-archive.md` for scope, source selection, legal/methodological caveats and implementation proposal.

- `polls.json`: manual transcriptions from 19 captured original outlet articles. Twelve rows total 120; two inconsistent complete rows are quarantined; five are partial. All scenario loading is disabled.
- `schema.draft.json`: JSON Schema 2020-12 for this draft, not an application API.
- `coverage.json`: 34 secondary-index candidate dates/outlets, with 15 uncollected publications. No secondary poll estimates are copied.
- `sources.json`: source identity, original/final URL, retrieval timestamp, SHA-256 and local capture path. Null archive URLs are explicitly unverified.
- `cec-13-final-supplement.json`: visually transcribed original pollster submission, separately preserving unweighted percentage denominators and conflicting metadata. Its combined don't-know/nonvoter share is not undecided alone.
- `sources/`: original HTML and three PDFs, retained as evidence at the user's request. Full pages include unrelated navigation/current recommendations; only the dated article is poll evidence. **Third-party source materials are not covered by the repository MIT licence. Review redistribution rights before public publication.**

Missing means unknown/untranscribed, never zero. `reportedNameHe` holds a literal short prose label, not necessarily the entire ballot label on the original graphic. `mappingStatus` is an editorial crosswalk to k25 list IDs; it is not supplied by the publisher. Records with `reviewed-draft` status have had basic source/arithmetic checks, not independent double entry or production approval. Partial article access is not proof of a paywall; no protected access was bypassed.

To reproduce collection, fetch each original URL in `sources.json` using User-Agent `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)` into project `.backup-scratch/`, honor HTTP 429/Retry-After, and compare SHA-256 before any re-transcription. Current news pages can change, so retained captures are the evidence for these exact transcriptions. The date/outlet-only index was `https://themadad.com/allpolls25/`; its captured hash is in `coverage.json`. The Hebrew Wikipedia k25 page was only a labelled secondary locator index. No English Wikipedia was opened or used.

Capture tools: Python 3 standard-library urllib + HTMLParser, curl; PDF inspection used pypdf and Pillow installed only under scratch. The authoritative regeneration inputs are the retained source bytes and explicit manual transcription, not a dependency on those libraries or on repeat downloads. No copied source/dependency tree, scratch output or build cache is retained here. JSON can be checked with Python `jsonschema` against `schema.draft.json`; separately check source hashes, references, date bounds, unique IDs, dataset mapping targets and complete seat sums. Known 119/121 source conflicts must remain quarantined, not rewritten to pass a sum check.

## Retained article copies are not in this public repository

The `capturePath` files (`sources/*.html`) are full copies of news articles. They are copyrighted prose, so they are kept out of the public repository. They remain in the local research branch `t3/5f8b5a14` (commit `c44c22e`), and each one's SHA-256 is recorded in `sources.json`. The transcribed figures in `polls.json` are facts with full attribution.
