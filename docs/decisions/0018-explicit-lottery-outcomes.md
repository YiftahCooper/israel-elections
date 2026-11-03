# 0018: Report exact ties and record lottery choices

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Section 81(d)(2) requires a CEC lottery when the highest quotients tie. A deterministic simulation still needs a displayed result.

## Decision

Detect ties with exact fractions, record tied units and warn lottery-required unless a valid choice is supplied. Use the first tied unit provisionally. Key recorded choices by stage, step and sorted tied ids so a choice cannot decide a different tied set.

## Alternatives considered

Silently resolving a tie by floating-point error or pretending a deterministic choice is the statutory lottery would misstate the result. Rationale not recorded for choosing the first tied unit as the provisional display.

## Consequences

Repeated calculations are deterministic but a provisional tied seat is not an official lottery outcome. Changing the tied set prevents reuse of an unrelated recorded choice.

## Sources

- `src/engine/allocate.ts`.
- `src/engine/types.ts`.
- `src/model/actions.ts`.
- `tests/engine.test.ts`.
- Repository history: `8053f70, 8f1406e` (3 November 2026).
- Knesset Elections Law, section 81(d)(2); see [law mapping](../ELECTORAL-LAW.md).
