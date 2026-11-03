# 0007: Retained sources and a strict data build

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Votes, candidates and agreements arrive in different source formats and must reconcile before they become application inputs.

## Decision

Retain raw sources and a provenance manifest with URLs, retrieval times and SHA-256 hashes. Build datasets from those inputs and throw errors for failed explicit checks, including vote reconciliation, roster ranks and agreement evidence. Record source hashes in build metadata.

## Alternatives considered

Manual unsupported totals or a builder that silently accepts inconsistencies would remove these checks. Rationale not recorded beyond the implemented checks and source metadata.

## Consequences

The build is auditable, but a passing build proves only its implemented checks. Recording manifest hashes is not a new hash audit of every input. Only k25/k26 are built; historical sources have separate release gaps.

## Sources

- `scripts/fetch-sources.ts`.
- `scripts/build-datasets.ts`.
- `data/raw/SOURCES.json`.
- `.github/workflows/ci.yml`.
- Repository history: `8053f70, 8f1406e, 2abba95, b7229cc` (3 November 2026).
- See [data coverage](../DATA.md) and records 0001–0004 for historical-source qualifications.
