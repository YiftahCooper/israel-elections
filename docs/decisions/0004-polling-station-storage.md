# Keep reproducible polling-station working copies out of durable data

## Context

The nine historical polling-station JSONs occupy about 44 MiB. Including them alongside
the existing raw sources exceeds the owner's approximately 60 MB size limit.

## Decision

Download historical polling-station JSONs into ignored project-local
.backup-scratch/raw/kNN/. Retain their provenance and SHA-256 in SOURCES.json, with paths
relative to data/raw. Retain independent locality inputs, PDFs and the official catalogue
outside scratch. Recover missing polling-station files with fetch-sources.ts using paged
CKAN datastore_search. Existing files are left in place.

## Alternatives considered

Keeping all polling JSONs adds avoidable repository weight. Deleting provenance or retaining
only derived totals would make later verification harder. Moving existing k25/k26 sources
was not authorized and is unnecessary for this implementation.

## Consequences

A clean checkout needs source fetching before historical polling-level reconciliation.
Scratch is gitignored; backup-software exclusion is unverified. DATA.md records one common
regeneration procedure. No existing valuable files or backup settings were changed.

## Sources

* data/raw/votes-knesset.catalogue.json and data/raw/SOURCES.json.
* The nine downloaded JSON files, measured together at about 44 MiB.
* Project .gitignore and the workspace's scratch-storage instructions.
