# Development

The app runs in the browser. Vite builds the React/TypeScript interface into `dist/`;
there is no application backend, account service or shared scenario database.
Use Node.js >=22.18 (CI uses 24) and `npm ci` to install the locked dependencies.

## Commands and checks

Run commands from the repository root. `npm run dev` starts Vite; `npm run build`
produces the static site and `npm run preview` serves that build locally.
`npm test` runs Vitest once; `npm run test:watch` keeps it running while editing.
`npm run typecheck` checks TypeScript without emitting files.

For browser tests, first run `npm run build`, install Chromium with
`npx playwright install chromium`, then run `npm run test:e2e`.
Playwright serves the build on port 4174 using `playwright.config.ts` and puts results
in `.backup-scratch/test-results/`. CI installs Chromium with `--with-deps` on Linux.

[CI](../.github/workflows/ci.yml) runs dependency installation, TypeScript checking,
a dataset rebuild, unit tests, the production build and Chromium end-to-end tests.
It has no separate lint command. Do not substitute a successful Vite build for type checking.

## Calculation and scenario model

`src/engine/allocate.ts` handles qualification, quota seats, remainder seats and the
internal division of surplus agreements. `rational.ts` compares bigint fractions by
cross multiplication; decimal rounding is for display. See [the law mapping](ELECTORAL-LAW.md).

`src/model/scenario.ts` describes editable election inputs. `actions.ts` returns new
scenario states without changing its inputs. `src/app/store.ts` holds the active scenario,
undo/redo snapshots and per-election sessions. All interface levels use the same engine.

Every list vote control uses `src/app/voteEdit.ts`. Proportional redistribution, transfers
and new voters are different counterfactuals. Simple always uses proportional balancing;
Standard and Expert expose the choice. Percentage entry and turnout modelling use numeric
rounding before integer votes reach the engine; the whole interface is not bigint arithmetic.

`src/engine/analysis.ts` reruns allocation to test counterfactuals. Threshold searches use
monotonicity; non-monotone seat searches check smaller changes exhaustively within a budget,
and use sampling beyond it. Inspect `exact`, `nonMonotonic`, `reason` and sweep `step` before
claiming global minimality or complete breakpoint coverage. The sensitivity view labels
sampled vote sweeps, but the current seat-security table drops the search exactness flag
and still describes its figures as exact. Treat large seat-security minima with that limit.

## Saving, sharing and corrections

Saved scenarios and preferences use this browser’s `localStorage`. Unsaved per-election
sessions and undo history are in memory. Clearing browser storage removes saved scenarios;
use JSON export for a portable copy. A refused save reports an error and suggests export.

Saved entries and share links contain an election id, name, dataset build timestamp and
action log. Share links compress the payload with deflate-raw, encode it as URL-safe Base64
and put it after `#s=`. They need the referenced dataset to replay; they are not encrypted.
The loader reports skipped actions and a changed dataset timestamp. A rebuild alone changes
the timestamp, so that notice does not by itself prove that source figures changed.

JSON export contains the full scenario; import checks its structure. It is distinct from
the action-log payload used for saved entries and share links. CSV exports contain list
results; the chamber can be exported as SVG or PNG.

## Source pipeline

`npm run data:fetch` retrieves missing sources; use
`node scripts/fetch-sources.ts --refresh` to refresh reachable inputs. Review source and
manifest changes before accepting them. `npm run data:build` rebuilds `public/data/`
from retained inputs and records source hashes and a build timestamp.

Checks reconcile national/list totals, locality/polling-station totals, candidate ranks
and source evidence for agreements. These checks are explicit, not a guarantee that every
possible parsing error is caught. The manifest records hashes; the builder’s recording of
those hashes is not a fresh integrity audit of every input file.

The production builder covers k16–k26; each historical election has its own module in
`scripts/lib/historical/`. `scripts/lib/parse-historical-gazette.ts` is an unfinished prototype outside the build. Historical polling-station working copies
are recovered into `.backup-scratch/raw/`; see [DATA.md](DATA.md) and decision
[0004](decisions/0004-polling-station-storage.md) for storage and recovery details.

Keep disposable downloads, caches and diagnostics in `.backup-scratch/`. Retain unique
source inputs, accepted outputs and the provenance needed to reproduce them outside
scratch. The lockfile pins npm dependencies; generated dataset timestamps mean rebuilds
are not byte-for-byte identical. Do not create a second data ledger.

## Test scope and current limits

Vitest covers official 2022 seats, reported 2026 final-count seats, exact threshold and
agreement cases, randomised D’Hondt comparisons, scenario actions, vote edits and analysis.
The 2026 comparison is explicitly secondary; `officialSeats` remains null in that dataset.
Per-election tests (`tests/historical-kNN.test.ts`) reproduce the official seats of 2009–2021.

Playwright covers the election picker, interface levels and a scenario involving a merger,
added voters, an agreement change, boundary tools, comparison, saving and share-link replay.
These tests do not certify all possible scenarios or constitute an accessibility audit.

Not implemented: released 1949–1999 datasets, complete 2003/2006 rosters, English candidate transliterations,
candidate portraits/party logos, later membership replacements and polling-station-level
simulation. Locality results can seed a hypothetical turnout model; that model is not
an official forecast.
