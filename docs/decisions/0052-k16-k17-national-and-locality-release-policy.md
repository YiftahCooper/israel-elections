# Release k16/k17 with explicit national source precedence and retained locality sums

## Authority and relationship

The project owner explicitly selected these treatments in the implementation task on
3 November 2026. This decision supersedes the national-discrepancy and locality-schema
release gates in 0050, while preserving its observations. Decision 0051's legal evidence
and historical-law caveat remain unchanged. Candidate limitations are recorded in 0053.

## National figures

**2003:** use official polling sums for every list, including Mafdal **132,370** and
Lider **833**. YP 5155 p. 1406 instead prints **132,730** and **883**. Printed list votes
sum to **3,148,774**, exceeding that page's own valid total **3,148,364** by **410**.
The official Knesset historical table independently corroborates Mafdal **132,370**.
No formal gazette correction was located; the choice is an explicit source-precedence
decision, not a claim that a correction was published. Both printed figures and the
inconsistency are preserved in Hebrew list notes and the original national review JSON.

Running both complete vote sets through `scenarioFromDataset` → `toEngineInput` →
`allocate`, with the six gazetted agreements and the 1.5% preset, gives:

| Vote set | Sum of list votes | Threshold (ceiling) | Floor quota | Seats |
|---|---:|---:|---:|---|
| Official polling (released) | 3,148,364 | 47,226 | 25,138 | Identical to every gazetted list |
| Printed gazette figures (counterfactual) | 3,148,774 | 47,232 | 25,141 | Identical to every gazetted list |

Both allocations are exactly: Likud 38; Labor–Meimad 19; Shinui 15; Shas 11;
National Union 7; Meretz 6; Mafdal 6; UTJ 5; Hadash–Ta'al 3; Am Ehad 3;
Balad 3; Yisrael BaAliyah 2; UAL 2. All other lists have zero. Tests assert both
allocations, not merely their total of 120.

Use gazette valid **3,148,364**, invalid **52,409**, and their sum **3,200,773**
cast votes. Registered **4,720,075** comes from the retained official CBS table 27.2.
The source/status labels explicitly distinguish the CBS electorate from gazette votes.

**2006:** use gazette valid **3,137,064**, invalid **49,684**, and their sum
**3,186,748** cast votes. Registered **5,014,622** comes from the same retained CBS
publication, referenced by both elections. Polling-station cast votes are **3,186,739**,
**9 lower**; their implied invalid count is **49,675**. CBS corroborates the lower cast
figure. No authoritative explanation for the nine votes is known. We preserve this gap;
we do not change polling rows to manufacture agreement with the national gazette.

## Localities and reproducibility

Emit 1,172 k16 rows and 1,150 k17 rows, each including one double-envelope group,
summed from the official polling tables. Their public bilingual notes explain that no
official locality table exists for these elections. These are derived sums, not an
independent official locality-source reconciliation.

Preserve absent committee numbers as null in both elections. In k17, code and registered
are also null; grouping uses exact trimmed locality names. The k16 numeric codes are
retained, including envelope code 0. Mark both envelope groups `envelopes: true` and keep
their registered field null. Never sum the bogus repeated envelope “voters” field.
National locality counts exclude the envelope group: **1,171 / 1,149**. Polling-row
counts are **7,885 / 8,426**, including 149 envelope batches each; k16 excludes one EOF
sentinel, not a polling station.

Commit `localities.reviewed.json` alongside each reconciliation digest. The builder
hashes compact `JSON.stringify(rows)` in the existing derivation order and compares it
to `derivedRowsSha256`. It checks every row's arithmetic, national list sums, column
alignment and null metadata. With scratch polling input present it additionally repeats
the entire derivation and source-hash reconciliation. Without scratch, retained rows,
source PDFs, reviewed JSONs and manifest SHA-256 digests suffice to rebuild. A digest
checks retained integrity; it does not substitute for independent locality evidence.

## Sources and limits

* `data/raw/k16/results.pdf`, YP 5155 pp. 1406–1407; `data/raw/k17/results.pdf`, YP 5514 pp. 2464–2465.
* `data/raw/k16/cbs-national-summary.pdf`, official CBS table 27.2 (29 August 2023).
* https://main.knesset.gov.il/About/History/pages/knessethistory.aspx?kns=16 — indexed official table inspected; direct page returned no readable body.
* Both `national.reviewed.json` and `reconciliation.reviewed.json` files preserve the original observations.
* `data/raw/SOURCES.json` records the official CKAN source URLs and hashes and labels project derivatives `official: false`.

No source conflict has been silently removed. Registration of a public dataset does not
claim that its incomplete candidate rosters are complete; see 0053 and per-list notes.
