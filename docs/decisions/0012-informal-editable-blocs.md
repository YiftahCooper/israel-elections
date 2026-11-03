# 0012: Informal, editable blocs

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Coalition exploration needs groupings of lists, while statutory seat allocation operates on lists and surplus agreements.

## Decision

Provide app-defined default blocs and allow bloc definitions and list assignments to change. Calculate bloc totals from allocated list seats; do not feed bloc membership into allocation.

## Alternatives considered

Fixed political classifications or no bloc grouping are possible alternatives. Rationale not recorded for the particular default memberships.

## Consequences

Bloc majorities are scenario summaries, not official CEC classifications or coalition predictions. Editing a bloc changes group totals and presentation, not seat allocation. Colours and labels are application metadata.

## Sources

- `scripts/lib/list-meta.ts`.
- `src/model/scenario.ts`.
- `src/model/actions.ts`.
- `src/app/components/KeyStats.tsx`.
- `src/app/components/SeatSecurity.tsx`.
- Repository history: `8053f70, ad479ee, 98f4518` (3 November 2026).
