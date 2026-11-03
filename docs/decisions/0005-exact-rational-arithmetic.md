# 0005: Exact rational arithmetic for seat decisions

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Seat allocation compares thresholds and competing quotients, including exact equality. Small rounding errors can change a seat.

## Decision

Use bigint integers and rational pairs in the allocation engine. Compare fractions by cross multiplication and parse decimal thresholds exactly. Convert to rounded decimals for display only.

## Alternatives considered

Floating-point quotient comparisons are the direct alternative. The code explicitly excludes them from seat decisions; wider discussion of numeric libraries is not recorded.

## Consequences

Seat decisions are independent of display precision. The model and some input/turnout calculations still use JavaScript numbers; this decision does not claim that every calculation in the app uses bigint.

## Sources

- `src/engine/rational.ts`.
- `src/engine/allocate.ts`.
- `src/model/scenario.ts`.
- `tests/engine.test.ts`.
- Repository history: `8053f70` (3 November 2026).
- Knesset Elections Law, section 81(a–d); see [law mapping](../ELECTORAL-LAW.md).
