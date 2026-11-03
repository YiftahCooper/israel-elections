# 0006: Replayable actions and snapshot undo

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Users edit election inputs while retaining a historical baseline, and need to undo edits and reopen scenarios after a data rebuild.

## Decision

Represent edits as plain-data actions applied by pure transitions. Keep the action log with the scenario. Save and share actions for replay against the current dataset; keep whole scenario snapshots for undo/redo. Batch actions apply as one undoable step or fail together.

## Alternatives considered

Storing only full copies for every saved scenario, or undoing through inverse actions, are possible alternatives. Rationale not recorded beyond the comments describing replay and structurally shared snapshots.

## Consequences

Historical data stays separate from edits. Replay can skip actions that no longer apply and reports their number. Undo history is held in memory and is distinct from the durable saved action log.

## Sources

- `src/model/actions.ts`.
- `src/model/scenario.ts`.
- `src/app/store.ts`.
- `tests/model-hardening.test.ts`.
- Repository history: `8053f70, ad479ee, 8f1406e` (3 November 2026).
