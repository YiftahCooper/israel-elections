# 0017: Track list lineage across mergers and splits

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Comparing a merged or split scenario with history cannot rely on current list ids alone.

## Decision

Keep originIds on lists and originListId on historical candidates. Merges combine origins; splits retain them; newly added lists start their own lineage. Compare connected origin groups across allocations and use candidate ids to report entrants and departures.

## Alternatives considered

Id-only comparisons or matching list names are alternatives. Rationale not recorded beyond the comments describing lineage and structural comparison.

## Consequences

Comparisons can follow structural edits without treating every renamed or merged list as unrelated. Connected-group seat changes do not attribute a merged result uniquely to each original party.

## Sources

- `src/model/scenario.ts`.
- `src/model/actions.ts`.
- `src/engine/analysis.ts`.
- `src/app/components/Compare.tsx`.
- `tests/analysis-model.test.ts`.
- Repository history: `ad479ee, 8f1406e, 2abba95` (3 November 2026).
