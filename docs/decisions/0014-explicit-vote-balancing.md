# 0014: Explicit sources for changed votes

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Increasing a list’s votes can mean new turnout or transfers from other lists. Those assumptions change the total valid votes and therefore threshold calculations.

## Decision

Use a shared vote-edit helper for numeric fields, sliders, percentages and quick tools. Offer new voters, a transfer from a named list, or proportional redistribution. Simple fixes the choice to proportional balancing. Limit edits by available votes and use integer apportionment for redistribution.

## Alternatives considered

Independent handlers for each control were replaced by unified editing in history. Silently mixing new votes and transfers would represent different counterfactuals as one. Further rationale not recorded.

## Consequences

Analysis and edits must use the same source assumption. New voters changes the valid total; feasible transfers and redistributions conserve it. Degenerate proportional edits with no recipients or donors can fall back to setVotes, so conservation is not unconditional.

## Sources

- `src/app/voteEdit.ts`.
- `src/app/store.ts`.
- `src/engine/analysis.ts`.
- `src/model/actions.ts`.
- `tests/vote-edit.test.ts`.
- Repository history: `98f4518, 8f1406e, 2fd4152` (3 November 2026).
