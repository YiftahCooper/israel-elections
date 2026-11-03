# 0009: Scenario sharing through URL fragments

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Users need to pass a scenario to someone else without a server-side scenario database.

## Decision

Encode election id, name, dataset build timestamp and action log as JSON, compress with deflate-raw and URL-safe Base64, and place the payload in #s=. Load the referenced dataset and replay actions when opening a link.

## Alternatives considered

A server-stored short identifier or a full dataset embedded in each link are possible alternatives. Rationale not recorded.

## Consequences

Links carry edits rather than a frozen dataset. Rebuild notices and replay failures qualify the result. Links are not encrypted, and large logs produce long URLs. Reading a link requires browser compression support.

## Sources

- `src/app/store.ts`.
- `src/app/App.tsx`.
- `tests/e2e/success.spec.ts`.
- Repository history: `ad479ee, 8f1406e` (3 November 2026).
