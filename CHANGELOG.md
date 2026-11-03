# Changelog

Notable changes are recorded here using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
conventions. The history records development commits, not tagged releases; the dated entry
below groups all existing commits from 3 November 2026. `package.json` currently says 0.1.0.

## [Unreleased]

### Added

- Twenty-two more elections: 1949, 1951, 1955, 1959, 1961, 1969, 1977, 1981, 1984, 1988, 1992, 1996, 1999, 2003, 2006, 2009, 2013, 2015,
  April 2019, September 2019, 2020 and 2021 (Knessets 1–24 except 1965 and 1973), built from official sources, under each era's
  allocation law; every
  list's official seats are reproduced exactly (1977 uses an explicitly labelled, inferred rule for
  a list with fewer candidates than seats).
- Party colours follow the same party across elections.
- The election picker lists 1965 and 1973 as not yet available while they are verified.
- Candidates the official results notice did not seat (e.g. 1999's Deri and Begin) are
  skipped when seats are filled, so the members shown match the notice.
- Clear messages where data is missing: unavailable or partial candidate rosters, and
  elections without locality results.
- A documentation map, contributor guidance and retrospective decision records.

### Changed

- Reworked the project overview for readers who are new to the app; moved detailed
  development guidance into its own document.

## 2026-11-03

### Added

- An exact Bader–Ofer seat calculator with official-source datasets for 2022 and 2026,
  source records, dataset consistency checks and allocation tests (`8053f70`).
- A Hebrew/English explorer with a seat chamber, candidates, vote editing, mergers,
  splits, surplus agreements, comparisons, turnout modelling and analysis. Browser-local
  scenario saving, share links, import/export and automated checks followed (`ad479ee`).
- “What if…” tools, seat security, coalition views, clearer comparisons and reset controls
  (`98f4518`).
- Historical sources for **2003–2021**, plus election-specific 1.5%, 2% and 3.25%
  threshold presets. Those historical elections are **not yet available**: datasets
  still need building and verification (`b7229cc`).
- Three interface levels — **Simple, Standard and Expert** — and an election picker
  that marks unfinished datasets unavailable. Switching elections retains work during
  the current session (`2fd4152`).

### Changed

- Unified vote controls around an explicit choice of where votes come from, and introduced
  a simpler starting view (`98f4518`); the later three-level interface replaces that
  earlier two-level arrangement (`2fd4152`).

### Fixed

- Vote-slider behaviour and vote-edit consistency (`98f4518`).
- Browser-test setup for tools that required the earlier Advanced view (`eb62344`).
- 2026 data parsing and candidate handling, scenario replay/reset behaviour, invalid-edit
  checks and several display problems found during review (`8f1406e`).
- Analysis claims for sampled searches and sweeps, comparison handling after structural
  changes, allocation walkthrough details and further model/data checks (`2abba95`).
