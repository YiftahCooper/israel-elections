# Israeli Elections Explorer & Simulator · סייר הבחירות לכנסת

Explore Israeli Knesset election results and see how changing votes changes the 120 seats.
This bilingual Hebrew/English app is for curious voters, students and anyone who wants to
understand seat allocation, with detailed tools for researchers and developers.

<!-- Screenshot to be added by the owner. -->
![The elections explorer and seat simulator](docs/screenshot.png)

## What you can do

Choose an election, select a list and change its votes to watch the seats move.
The three interface levels use the same exact Bader–Ofer allocation engine:

| Level | Tools |
|---|---|
| **Simple** (default) | Chamber and party cards, vote editing balanced proportionally across other lists, elected candidates, “What if…”, coalitions, allocation walkthrough and sources. Undo and start over. |
| **Standard** | Adds a choice of vote source, comparisons, mergers, splits and surplus agreements, seat security, charts and change history. Save, share, import and export scenarios; withdraw or remove lists. |
| **Expert** | Adds candidate and list identity editing, turnout models, sensitivity analysis, experimental electoral rules, locality results and chamber display options. |

Hebrew is the default, with right-to-left layout. English and light/dark themes are available.
The election picker marks unfinished datasets as “not yet available”.

## Data and provenance

Votes, candidates and surplus agreements come from Central Elections Committee (CEC),
data.gov.il and Reshumot sources. Raw files and a manifest record source URLs, retrieval
times and SHA-256 hashes. Two 2026 candidate rosters use a labelled secondary source.
Colours, short names and default blocs are assigned by the app.

**Available:** 2015, April 2019, September 2019, 2020, 2021, 2022 and 2026 (Knessets 20–26).
Official sources for 2003–2013 (Knessets 16–19) have been added, but those elections are
**not yet available**: their datasets have not yet passed every verification check.
See [Data coverage and provenance](docs/DATA.md) for sources, qualifications and gaps.

## Accuracy and limits

The engine uses exact integer and fraction arithmetic for seat decisions. Tests reproduce
every list’s official **2022** seat count exactly, including all 120 seats.
For **2026**, tests reproduce the seat totals reported from the CEC final count; that test’s
comparison figures are labelled as secondary press reports. The dataset has no gazetted
official seat table yet and records final publication as pending as of 3 November 2026.
Availability is recorded in [the election index](public/data/elections.json).

Tests also cover threshold boundaries, surplus agreements, statutory ties and model actions.
An exact tie requires a lottery outcome; the app warns when it is showing a provisional winner.
Large seat searches and vote sweeps can use sampling; exact arithmetic alone does not
guarantee that every smallest change or breakpoint has been found.
See [Electoral law and validation](docs/ELECTORAL-LAW.md).

## Run locally

Install **Node.js 22.18 or later**; CI uses **Node.js 24**. In the project folder:

```sh
npm ci
npm run dev
```

Open the address printed by Vite (normally `http://localhost:5173`).
The production build is a static site; it needs no application backend.

## Tests and checks

```sh
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser tests use the production build, so build before running them.
See [Development](docs/DEVELOPMENT.md) for CI details and test scope.

## Rebuild the data

```sh
npm run data:fetch
npm run data:build
npm test
```

Fetching recovers missing sources; `node scripts/fetch-sources.ts --refresh` downloads
fresh copies. The builder produces every available election's dataset and stops on
failed consistency checks; for 2003–2013 it checks the evidence gathered so far but emits no dataset.
Read [Data coverage](docs/DATA.md) before changing sources or publishing rebuilt files.

## Project structure

| Folder | Contents |
|---|---|
| `src/engine/` | Exact allocation and analysis, independent of the interface |
| `src/model/` | Scenario inputs and replayable editing actions |
| `src/app/` | React interface, browser storage and Hebrew/English text |
| `src/data/` | Dataset types and versioning |
| `scripts/` | Source fetching and dataset building |
| `data/raw/` | Retained sources and provenance manifest |
| `public/data/` | Generated datasets loaded by the app |
| `tests/` | Unit, property and browser tests |
| `docs/` | Data, law, development and decision records |

## Documentation

- [Documentation map](docs/README.md)
- [Data coverage and provenance](docs/DATA.md)
- [Electoral law and validation](docs/ELECTORAL-LAW.md)
- [Development](docs/DEVELOPMENT.md)
- [Decision records](docs/decisions/README.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Disclaimer

Not affiliated with the Central Elections Committee or any political party.
Blocs are informal, editable groupings, not official electoral classifications.
Scenarios and turnout models are hypothetical, not forecasts. Candidate displays follow
registered lists and do not track later changes in Knesset membership.

## Licence

Licence: to be decided by the owner.
