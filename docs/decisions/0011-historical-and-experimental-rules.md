# 0011: Separate historical and experimental rule modes

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Vote counterfactuals under election law differ from changing the electoral system itself.

## Decision

Historical mode fixes the election-specific rules and rejects setRules actions. Experimental mode permits changes such as threshold, seats and remainder method. Returning to historical mode restores the election’s preset and disables enabled agreements incompatible with the historical pair rules.

## Alternatives considered

Allowing rule edits without changing the mode would blur their status. Rationale not recorded beyond the validation messages and departure labels.

## Consequences

Historical means the rules match the election’s preset, not that the edited votes are historical facts. The interface labels experimental mode and lists rule departures. Earlier threshold-era mappings are recorded separately in 0003.

## Sources

- `src/engine/rules.ts`.
- `src/model/actions.ts`.
- `src/model/scenario.ts`.
- `src/app/components/Panels.tsx`.
- `tests/historical-rules.test.ts`.
- Repository history: `8053f70, ad479ee, b7229cc` (3 November 2026).
- Knesset Elections Law, sections 67, 81–82; see [law mapping](../ELECTORAL-LAW.md).
