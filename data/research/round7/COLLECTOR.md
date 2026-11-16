# Saved official-page reconciliation

`collector-checks.json` is a bounded offline pass over the supplied browser captures. Its job inventory, artifact hashes, JSON source pointers, grouped gap references and field-scoped claims distinguish confirmed observations from outstanding review. `reviewedDecisions` records corrections with before/after, effective dates, sources and limits. `conclusionMap` records the resulting conclusions. This is not complete validation of every historical claim on every page.

Run the checker again as batches arrive:

```
python3 data/research/round7/collector-check.py REPOSITORY COLLECTOR_DIRECTORY OUTPUT_DIRECTORY
```

Use project-local `.backup-scratch/` for OUTPUT_DIRECTORY. Python 3's standard library suffices. No network or data mutation occurs. The optional `pdf-texts.json` in OUTPUT_DIRECTORY contains page-by-page pdfjs extraction: `{job, file, sha256, pages: [text, ...]}`. Without it, PDF propositions stay unverified. The script deliberately does not apply corrections automatically. Review mismatches for effective date, list/faction identity, name order, exact legal scope and source completeness before updating inputs and rebuilding.

The checker compares exact quoted propositions, ordered CEC rosters, faction membership envelopes, all-term member unions through retained site/person crosswalks, replacement dates through retained tenures, earlier CEC candidate names by rank/name tokens and MK detail-page identity names. Exact punctuation/spacing normalisation is not fuzzy identity resolution. It inventories other content as not covered with reasons. Multiple captures, translations and datasets from the Knesset are not independent sources.

Official English faction labels are observations at capture time. They do not establish historical rename dates. The two dated Tehiya–Tzomet observations and the two language observations for faction 1108 retain their separate scopes. The 2026 Shas page includes post-election withdrawals; its current roster is not substituted for the election-day roster. Tzeva Shahor's pre-election withdrawal does correct the election-day roster from 18 to 17.

Original HTML used for confirmations is retained losslessly as gzip under `data/raw/collector-r7/`. `SOURCES.json` hashes the retained gzip bytes and separately records `pageSha256` for the saved original HTML. Inspected PDFs supporting quoted propositions and contemporary faction-name observations are also retained. The Registrar extract excludes contact fields; its source record separately hashes the supplied original page. Older source bytes before the roster correction are preserved losslessly. No source original was silently discarded.
