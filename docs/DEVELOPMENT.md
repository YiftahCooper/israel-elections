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
Outside CI, without `PW_PORT`, an existing server on 4174 is reused, which may serve
another checkout's build. Set `PW_PORT` (for example `PW_PORT=4190 npm run test:e2e`)
to require a fresh server on that port; an occupied port fails.

[CI](../.github/workflows/ci.yml) runs dependency installation, TypeScript checking,
a dataset rebuild, unit tests, the production build and Chromium end-to-end tests.
It has no separate lint command. Do not substitute a successful Vite build for type checking.

[Pages](../.github/workflows/pages.yml) publishes `dist/` to GitHub Pages on every push to `main`.
It is skipped while the repository is private (free plans serve Pages from public repositories only).
After making the repository public, choose Settings → Pages → Source → GitHub Actions once.
The build uses relative asset paths (`base: './'`), so it works under `/<repository>/`.

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

In the interface these searches (seat security, list boundaries, vote sweeps, bloc majorities)
run on a small Web Worker pool (`src/app/analysisPool.ts`), or on the main thread when workers
are unavailable, with the same code (`src/app/analysisTasks.ts`). Tab panels other than each
level's first tab are separate chunks, prefetched once the page is idle, and `index.html`
preloads the default election's dataset.

## Saving, sharing and corrections

Saved scenarios and preferences use this browser’s `localStorage`. Unsaved per-election
sessions and undo history are in memory. Clearing browser storage removes saved scenarios;
use JSON export for a portable copy. A refused save reports an error and suggests export.

Saved entries and share links contain an election id, name, dataset build timestamp and
action log. Share links compress the payload with deflate-raw, encode it as URL-safe Base64
and put it after `#s=`. They need the referenced dataset to replay; they are not encrypted.
The loader reports skipped actions and a changed dataset timestamp. The timestamp changes only
when a rebuild changes the dataset's content, but any content counts (a note, a name or a
figure), so that notice does not by itself prove that source figures changed.

JSON export contains the full scenario; import checks its structure. It is distinct from
the action-log payload used for saved entries and share links. CSV exports contain list
results; the chamber can be exported as SVG or PNG.

## Source pipeline

`npm run data:fetch` retrieves missing sources; use
`node scripts/fetch-sources.ts --refresh` to refresh reachable inputs. Review source and
manifest changes before accepting them. `npm run data:build` rebuilds `public/data/`
from retained inputs and records source hashes and a build timestamp.

A rebuild rewrites only files whose content changed. For each dataset the builder serializes
the new result with the existing file's `buildInfo.builtAt`; if that matches the file byte for
byte, the file is left untouched and keeps its timestamp. Any other difference writes the file
with a new `builtAt`, so `builtAt` records when that dataset's content last changed. Locality
files and `sources.json` have no timestamp and are written only when their bytes differ. A
clean rebuild therefore leaves `git status` clean; the final log line counts written and
unchanged files. (k22–k24 set `builtAt` from their sources' retrieval times instead.)

Elections build in parallel worker threads (up to eight; about 1.2 GB peak memory with all
polling scratch present). Logs and files are still emitted in election order, and the first
failed check stops the build with a non-zero exit. `BUILD_JOBS=1 npm run data:build` builds
serially in one thread (about 0.45 GB), which is easier to debug; `BUILD_JOBS=n` sets the pool size.

Checks reconcile national/list totals, locality/polling-station totals, candidate ranks
and source evidence for agreements. These checks are explicit, not a guarantee that every
possible parsing error is caught. The manifest records hashes; the builder’s recording of
those hashes is not a fresh integrity audit of every input file.

`scripts/build-datasets.ts` lists the builders in election order and writes their output. Each
election has its own module in `scripts/lib/historical/` (k1–k26, with shared code per era in
`kNN-kMM-common.ts`); era-specific quirks such as envelope codes, column spellings and printed
gazette exceptions are written and explained there. Rules common to every era live in
`scripts/lib/build/`: `sources.ts` (paths, manifest, hash verification), `validate.ts` (national
totals, agreement membership, exact seat reproduction), `locality.ts` (row reading, polling
aggregation and reconciliation, locality datasets), `roster.ts` (rank contiguity, roster flags,
not-seated candidates), `records.ts` (list and agreement records, seat order), `cec-html.ts`
(CEC national-results pages) and `output.ts` (the no-churn writer). Serialized key order still
differs between eras; `records.ts` keeps each era's order so that rebuilt files stay identical.

Before writing each dataset, `finalizeDataset` in `scripts/lib/build/finalize.ts` sorts
lists into seat order, applies candidate notes (`notes.ts`) and merges party, bloc and colour
metadata (`meta.ts`). Release tests use the same step when comparing a builder's output to
the published dataset; testing the bare builder would omit these fields. See [metadata](DATA.md#party-bloc-colour-and-candidate-metadata).

`scripts/lib/parse-historical-gazette.ts` is an unfinished prototype outside the build. Historical polling-station working copies
are recovered into `.backup-scratch/raw/`; see [DATA.md](DATA.md) and decision
[0004](decisions/0004-polling-station-storage.md) for storage and recovery details.

Keep disposable downloads, caches and diagnostics in `.backup-scratch/`. Retain unique
source inputs, accepted outputs and the provenance needed to reproduce them outside
scratch. The lockfile pins npm dependencies; with unchanged inputs a rebuild leaves every
generated file byte-for-byte identical. Do not create a second data ledger.

Design review findings are archived in [`.impeccable/critique/`](../.impeccable/critique/),
including the 4 November 2026 critique. [PRODUCT.md](../PRODUCT.md) records the intended
audience and product principles, with inferences marked for owner review.

## Test scope and current limits

Vitest covers official 2022 seats, reported 2026 final-count seats, exact threshold and
agreement cases, randomised D’Hondt comparisons, scenario actions, vote edits and analysis.
The 2026 comparison is explicitly secondary; `officialSeats` remains null in that dataset.
Per-election tests (`tests/historical-kNN.test.ts`) reproduce the official seats of 2009–2021.

`tests/differential.test.ts` locks full serialised outputs with digests for allocation,
analysis, model actions, validation and rules. Its seeded corpus includes every dataset
under different rule sets, random elections, searches, action sequences and damaged imports.
A changed digest means output changed; investigate before re-recording. The corpus reads
`public/data/`, so source corrections and metadata changes can also change digests.
Re-record only for a reviewed, intended output change; for a refactor, compare old and new
code against the same data. The comparison helper named in the test documents:

```sh
mkdir -p .backup-scratch/old
git archive <old-rev> src | tar -x -C .backup-scratch/old
node tests/differential-compare.ts .backup-scratch/old/src src
```

The helper reports differing cases per family. With one root
(`node tests/differential-compare.ts src`) it prints digests for a deliberate re-recording.

Playwright covers the election picker, interface levels and a scenario involving a merger,
added voters, an agreement change, boundary tools, comparison, saving and share-link replay.
These tests do not certify all possible scenarios or constitute an accessibility audit.

All 26 elections are available. Not implemented: complete 1949–2006 rosters, English candidate transliterations,
candidate portraits/party logos, later membership replacements and polling-station-level
simulation. Locality results can seed a hypothetical turnout model; that model is not
an official forecast.
