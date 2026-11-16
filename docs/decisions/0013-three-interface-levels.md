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

9 November 2026: the owner decided that where added votes come from is asked at every level, Simple included, with the same Just this once / For this list / Always choices. The consequence above ("Simple always balances vote edits proportionally") is superseded: changing level no longer resets the vote source, and Simple's question offers Other lists or New voters (the higher levels also offer one named list). Settings now shows every setting at every level, ordered Simple, Standard, Expert.

12 November 2026 (audit c-levels-13): the Decision paragraph above describes the first split and is out of date. The
split in force is the feature registry, `src/app/features.ts` (`TOOL_FEATURES`, `FEATURES`), which is the source of
truth from now on. At the time of writing: Simple has the Overview, After the election, Party families, Scenarios,
What if…, Coalitions, How seats were allocated and Sources; Standard adds Merge & split, Seat safety and Charts;
Expert adds Turnout, Sensitivity, Localities and Rules. Side by side opens from the comparison strip at every level
(owner, 12 November 2026). Tools above the level stay listed, greyed out, under their heading; pressed, they ask
whether to switch to their level or add the tool to this one (16 November 2026). Sections inside pages above the
level are folded behind a chip, not hidden. A list's notes on the sources are a data qualification: shown at every
level and not a choice. Since 16 November 2026 there is no Custom level: the user's own choices (a tool or detail
added to the level or taken from it) are kept across level changes, counted by a chip beside the level buttons and
listed in Settings, where every tool and detail has a row under its level (Shown, Folded or Greyed out, Hidden; a
detail with no folded form has a switch). The level differences that components read directly became features of
the registry (c-levels-12, answered: move every difference).
