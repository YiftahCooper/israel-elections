# 0015: Allocation tests and browser journeys

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Correct arithmetic, valid scenario edits and a usable end-to-end scenario require different kinds of evidence.

## Decision

Use Vitest for engine, model, vote-edit and analysis tests, including exact official 2022 seat reproduction and reported 2026 final-count seat reproduction. Use Playwright/Chromium for scenario journeys, level visibility and election selection. CI also typechecks, rebuilds datasets and builds the app.

## Alternatives considered

Manual-only checks or only browser tests would not provide the current isolated engine assertions. Rationale not recorded for the framework selection.

## Consequences

2026 expected seats in the test are explicitly secondary press-report figures; the dataset has no officialSeats table. Historical-era tests establish rule plumbing only, not seat reproduction for unavailable elections. Tests are finite evidence, not proof of every possible scenario.

## Sources

- `tests/engine.test.ts`.
- `tests/exactness.test.ts`.
- `tests/historical-rules.test.ts`.
- `tests/e2e/success.spec.ts`.
- `tests/e2e/levels.spec.ts`.
- `tests/e2e/elections.spec.ts`.
- `.github/workflows/ci.yml`.
- Repository history: `8053f70, ad479ee, eb62344, 2abba95, b7229cc, 2fd4152` (3 November 2026).
