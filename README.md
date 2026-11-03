# Israeli Elections Explorer & Simulator · סייר הבחירות לכנסת

An interactive web application for exploring and simulating Israeli Knesset elections, with an exact,
tested implementation of the statutory seat allocation (threshold, general quota, Bader–Ofer remainder
allocation, surplus-vote agreements and their internal division). Hebrew (right-to-left) and English.

Elections included: **2022 (25th Knesset)** and **2026 (26th Knesset)**.

## What you can do

* See the 120-seat Knesset with every seat linked to the candidate who holds it; full registered candidate lists with the elected highlighted.
* Edit any list's votes (exact number, ±, percentages, set a share of valid votes) and choose **where changed votes come from**: new or abstaining voters (valid total changes), a specific other list, or all other lists proportionally. These are different counterfactuals and are never mixed.
* Exact boundaries: the minimum votes to pass the threshold or win the next seat, and how many votes can be lost before losing one — each verified at *n* and *n − 1* votes, and applicable in one click.
* Merge and split lists (including by constituent party, where the official data records it), add lists, edit candidate lists (reorder, insert, rename, remove), withdraw lists.
* Create, toggle and remove surplus-vote agreements; see each agreement's exact seat effect.
* Step through the allocation seat by seat with every competing quotient (exact fractions), including the internal division inside agreement pairs.
* Compare with the historical result or any saved scenario, including structure changes: seat-change explanations, bloc totals, candidates entering and leaving.
* Sensitivity: sweep a list's votes and find every point where seats change; sweep the threshold from 1% to 5% with exact breakpoints; find the smallest transfer that flips a bloc majority.
* Hypothetical turnout modelling, optionally seeded from official locality results (clearly labelled as a model).
* Explore official results for every locality.
* Experimental mode: change seats, threshold, remainder method (Bader–Ofer, pre-1973 largest remainder, Sainte-Laguë), agreement size and more. Every departure from Israeli law is listed.
* Undo/redo, a full change history, saved scenarios, share links, JSON import/export, CSV export, SVG/PNG export of the chamber.

## Data and provenance

All election figures come from official sources; see `data/raw/SOURCES.json` (URL, retrieval time, SHA-256) and the in-app *Sources* tab.

| Data | 2022 | 2026 |
|---|---|---|
| Votes by list, totals | CEC official final results page + data.gov.il datastore (polling stations and localities; reconciled exactly) | CEC result files `media26.bechirot.gov.il/files/expb.csv` and `expc.csv` (reconciled exactly) |
| Candidate lists | Reshumot, Yalkut HaPirsumim 10852 (20.10.2022), parsed from the PDF | CEC per-list pages on gov.il (with per-candidate parties, resignations and disqualifications) |
| Surplus agreements | CEC press release, 23.10.2022 | Reshumot, Yalkut HaPirsumim 15045, p. 1098 (19.10.2026) |

**Status of 2026:** the CEC has published the final count; the law requires publication in Reshumot by 4 November 2026,
and the results may change until then. The app shows this status. Two 2026 candidate rosters (צומת בית ישראל, and the
withdrawn כחול לבן) come from a secondary transcription (bechirot.fyi), because the official pages could not be
retrieved; they are labelled as secondary. List colours, short and English names and the default blocs are assigned by
the app for legibility and are not official.

## Run it

Requires Node.js 22 or later.

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # engine, analysis and model tests (vitest)
npm run build      # static site in dist/
npx playwright test   # end-to-end test of the full "definition of success" sequence
```

The built site is static (no server) and can be hosted anywhere.

## Rebuild the data

```sh
node scripts/fetch-sources.ts            # download sources that are reachable by script
node scripts/fetch-sources.ts --refresh  # re-download (e.g. after the 2026 results are gazetted)
node scripts/build-datasets.ts           # rebuild public/data/*.json; fails loudly on any inconsistency
npm test                                 # confirm the engine still reproduces the official results
```

The builder checks that list votes sum to valid votes in every row, that locality and polling-station totals agree,
that candidate ranks are contiguous, and that every agreement appears in its official source. Saved and shared
scenarios store their changes, not copies of the data, so they are re-applied to corrected data automatically.

## Architecture

```
src/engine/   exact seat allocation (bigint, no floating point), analysis (marginal votes, sweeps, comparison) — no UI dependency
src/model/    scenario state and pure actions (every edit is a logged, replayable action)
src/data/     versioned dataset schema
src/app/      React interface (store, components, Hebrew/English, light/dark)
scripts/      source fetching and dataset building
data/raw/     the official source files and their provenance manifest
public/data/  generated datasets loaded by the app
tests/        unit, property and end-to-end tests
docs/         the statutory text and how the engine implements it
```

See [docs/ELECTORAL-LAW.md](docs/ELECTORAL-LAW.md) for the law, its mapping to code and the validation results.

## Not included (yet)

Earlier elections (the architecture and data pipeline are designed for them: data.gov.il holds results back to the
16th Knesset and the CEC history page links the earlier candidate gazettes); English transliterations of candidate
names; candidate portraits and party logos (usage rights); later changes in Knesset membership (resignations,
replacements, the Norwegian Law); polling-station-level simulation.

Not affiliated with the Central Elections Committee or any party.
