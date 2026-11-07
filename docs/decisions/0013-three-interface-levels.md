# 0013: Three interface levels over one engine

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

The earlier interface had two levels. The latest interface commit introduces Simple, Standard and Expert while retaining a single scenario and calculation path.

## Decision

Default to Simple: vote editing, candidates, What if, coalitions, walkthrough and sources. Standard adds comparisons, structure/agreement edits, seat security, charts, history and scenario management. Expert adds identity/candidate editing, turnout, sensitivity, rules, localities and chamber display controls. Persist the chosen level and migrate the former explore/advanced settings.

## Alternatives considered

The earlier two-level arrangement is evidenced in history. Rationale not recorded beyond code comments describing minimal, common consequential, and all-tool views.

## Consequences

Levels control visibility, not which allocation engine runs. Simple always balances vote edits proportionally, even if another source was chosen at a higher level. Hidden edits remain part of the scenario.

## Sources

- `src/app/App.tsx`.
- `src/app/components/TopBar.tsx`.
- `src/app/store.ts`.
- `tests/e2e/levels.spec.ts`.
- Repository history: `98f4518, 2fd4152` (3 November 2026).

7 November 2026: owner pre-release direction supersedes saved-format compatibility requirements. Corrected ballot letters now correct internal list/candidate IDs, and old browser level names are no longer migrated.
