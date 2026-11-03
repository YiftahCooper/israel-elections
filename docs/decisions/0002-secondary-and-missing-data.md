# Secondary evidence and unparsed data

## Context

Historical CEC HTML is blocked to scripted clients. Several candidate PDF formats fail
the current geometry parser. The 16/17 PDFs are image scans; this does not mean their
candidate lists are historically unavailable.

## Decision

No secondary historical data has been incorporated in this checkpoint. Preserve the
retrieved official documents and distinguish "not yet parsed or verified" from "not
available in the source". Do not fill a roster with inferred candidates or affiliations,
and do not release an empty roster as a complete list. The unfinished historical parser
is retained explicitly as a prototype, outside the production builder.

Any later secondary fallback must be cross-checked, get its own manifest record with
`official: false`, and set `candidatesSecondary: true` for affected lists. Preserve a
note explaining what the official source lacked or why it could not be used. Existing
k26 secondary flags are retained.

## Alternatives considered

OCR without review risks plausible-looking name errors. Wikipedia or a newspaper alone
cannot substitute for complete roster and agreement verification. Passing seat tests
cannot establish candidate or agreement-list completeness.

## Consequences

The extension is incomplete. DATA.md names each outstanding gap, and the election index
marks historical datasets unavailable. This avoids exposing speculative data as official.

## Sources

* CEC PDFs retained under data/raw/k16 through data/raw/k24.
* Existing candidatesSecondary and source official fields in src/data/schema.ts and data/raw/SOURCES.json.

## Addendum, 4 November 2026

English-language Wikipedia is excluded entirely: it is never used, cited or linked, at the owner's direction
(unreliable on Israel-related information). Hebrew Wikipedia may only lead to an official document or serve as a
labelled secondary source.
