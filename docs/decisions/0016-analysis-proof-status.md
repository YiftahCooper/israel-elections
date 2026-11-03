# 0016: Expose exactness limits in counterfactual analysis

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Thresholds, agreements and quota rounding can make seat outcomes non-monotone. A binary search alone cannot establish every smallest seat-changing edit.

## Decision

Rerun the full allocation for candidate changes. Treat threshold goals as monotone; scan smaller seat changes exhaustively within a budget and sample beyond it. Return exactness and non-monotonicity metadata. Vote sweeps also expose exact and step; threshold sweeps use rational qualification breakpoints.

## Alternatives considered

Unqualified binary-search minima or sampled sweeps labelled complete would overstate evidence. Exhaustively scanning every large interval is another alternative. Rationale not recorded for the particular budget beyond the code’s runtime comment.

## Consequences

Exact allocation arithmetic does not imply globally exact analysis searches. Callers must preserve sampled/limited labels. The sensitivity view labels sampled vote sweeps, but SeatSecurity currently drops the exactness flag and describes its figures as exact; that display does not establish global minimality. The default exhaustive budget is 50,000 evaluations; a failed bounded search is not proof that no solution exists.

## Sources

- `src/engine/analysis.ts`.
- `src/app/components/Sensitivity.tsx`.
- `src/app/components/SeatSecurity.tsx`.
- `tests/exactness.test.ts`.
- Repository history: `ad479ee, 2abba95` (3 November 2026).
