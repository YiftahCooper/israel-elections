# 0010: Hebrew and English with Hebrew as default

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

The interface presents Israeli election data and Hebrew registered candidate names.

## Decision

Default to Hebrew. Offer English through inline bilingual interface strings and persist the choice. Set document language and direction to he/rtl or en/ltr whenever the language changes.

## Alternatives considered

An English-only interface, or a separate translation catalogue, are possible alternatives. Rationale not recorded; the i18n helper comment says inline strings keep text next to its use.

## Consequences

The same interface supports both directions. Interface translation does not imply translated candidate names: English candidate transliterations are not provided.

## Sources

- `src/app/i18n.ts`.
- `src/app/App.tsx`.
- `src/app/store.ts`.
- `src/app/components/TopBar.tsx`.
- Repository history: `ad479ee` (3 November 2026).
