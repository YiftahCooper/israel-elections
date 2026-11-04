# Changelog

Notable changes are recorded here using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
conventions. The history records development commits, not tagged releases; the dated entry
below groups all existing commits from 3 November 2026. `package.json` currently says 0.1.0.

## [Unreleased]

### Added

- Twenty-four more elections: 1949, 1951, 1955, 1959, 1961, 1965, 1969, 1973, 1977, 1981, 1984, 1988, 1992, 1996, 1999, 2003, 2006, 2009, 2013, 2015,
  April 2019, September 2019, 2020 and 2021 (Knessets 1–24), built from official sources, under each era's
  allocation law; every
  list's official seats are reproduced exactly (1977 uses an explicitly labelled, inferred rule for
  a list with fewer candidates than seats).
- Per-election bloc groupings (first government and recognised blocs), editable as “Your grouping”;
  constituent parties of joint lists can sit in different blocs without changing votes or seats.
- “Run as separate lists” with editable vote-share assumptions; each part faces the threshold
  separately and the joint list's surplus agreement is dropped.
- Experimental D’Hondt, modified Sainte-Laguë and largest remainder with a Droop quota in Expert.
- Sourced candidate notes for the 1984 Speiser misprint and five replacements before the first sitting.
- 1973 (8th Knesset): its list connections were found in the Central Elections Committee's own seat-calculation record
  (decision 0077); every seat reproduces, all 120 elected members are cross-checked, and three ballot letters and four list
  names were corrected from the notices. All 26 elections are now available.
- English-language Wikipedia is never used or linked; the 2003/2006 membership cross-check now uses the Knesset's official data.
- A 47-term bilingual glossary: (i) icons explain terms in the interface language, with a "learn more" link to the law,
  the Central Elections Committee or the Israel Democracy Institute (every link checked; no Wikipedia).
- Faster: heavy analyses run in background workers (no page freezes), tabs load on demand, searches skip
  provably equal counts (2–8× faster), with results identical to before.
- Accessibility and phone fixes: info icons open on tap, keyboard tab navigation, a readable chamber on phones,
  better contrast, and era-correct method names (no more "Bader–Ofer" for 1949–1969).
- Candidates the official results notice did not seat (e.g. 1999's Deri and Begin) are
  skipped when seats are filled, so the members shown match the notice.
- Clear messages where data is missing: unavailable or partial candidate rosters, and
  elections without locality results.
- A documentation map, contributor guidance and retrospective decision records.
- MIT licence for the code and documentation (official source documents excluded).

### Fixed

- Elected members' names in 1949–1999 re-read from the official scans and checked against the Knesset's
  official opening-day membership for every election: 53 roster corrections (for example 1981 Sarah Doron,
  Dror Zeigerman, Moshe Harif, Mohammed Wattad; 1996 Haim Dayan, Yehuda Lancry). In 1988 the Likud seats now
  follow the results notice: Yosef Goldberg is restored at #32, and Michael Reiser (#25), whom the notice does not list, is not seated.

### Changed

- The build merges party, bloc and colour research from `data/meta/`; associated colours need
  medium/high confidence and readable lightness, with a neighbour check for list colours and
  fallback to the app palette. Build and release tests share `finalizeDataset`.
- Differential digest tests lock engine/model outputs; `PW_PORT` isolates browser-test servers.
  Impeccable design critiques are archived in `.impeccable/`.
- Reworked the project overview for readers who are new to the app; moved detailed
  development guidance into its own document.
- Rebuilding the data no longer rewrites unchanged files: a dataset keeps its build timestamp
  until its content changes, so a clean rebuild leaves nothing to commit or restore. The
  builder shares one set of validation, roster and locality rules across all elections and
  builds elections in parallel (about 3.6 s → 1.2 s here). Published data is unchanged.

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
