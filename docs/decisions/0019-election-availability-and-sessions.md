# 0019: Gate election selection on dataset availability

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

The repository now knows about elections whose sources exist but whose application datasets are unfinished.

## Decision

Load public/data/elections.json, sort newest first and disable unavailable elections in the picker. Include the month where a year has multiple elections. Retain the established k25/k26 fallback if index loading fails. Preserve the current session and undo history when switching elections.

## Alternatives considered

Listing only released elections, or enabling all elections merely because sources were downloaded, are possible alternatives. Rationale not recorded beyond the code comments distinguishing known and verified datasets.

## Consequences

The picker exposes historical coverage gaps without loading unfinished datasets. Sessions are in memory, not durable saves. Availability is a release indicator; it does not erase the pending-publication status of 2026.

## Sources

- `public/data/elections.json`.
- `src/app/store.ts`.
- `src/app/components/TopBar.tsx`.
- `tests/e2e/elections.spec.ts`.
- Repository history: `b7229cc, 2fd4152` (3 November 2026).
