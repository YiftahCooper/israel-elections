# 0008: Static browser app and local scenario storage

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

The repository contains a Vite/React application, static election datasets and no application backend.

## Decision

Load datasets as static JSON and calculate scenarios in the browser. Store preferences and explicitly saved scenarios in localStorage; keep unsaved election sessions and undo/redo in memory.

## Alternatives considered

A backend with accounts and synchronised scenarios is an architectural alternative. Rationale not recorded.

## Consequences

The build can be hosted as static files. Saved scenarios belong to that browser and origin, without account synchronisation. Clearing storage can remove them. Refused saves report an error and suggest JSON export.

## Sources

- `package.json`.
- `src/app/store.ts`.
- `src/app/components/TopBar.tsx`.
- `vite.config.ts`.
- Repository history: `ad479ee, 8f1406e, 2fd4152` (3 November 2026).
