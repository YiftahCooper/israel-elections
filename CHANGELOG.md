# Changelog

## 4 November 2026 — election context and PM results

- Add sourced, dated election circumstances in an expandable bilingual context layer,
  including list-targeted notes and a single pending-publication warning.
- Show independent 1996/1999 Prime Minister results beside the chamber and a selectable
  2001 PM-only event linked to k15, with neutral majority markers and source-labelled totals.
- Preserve secondary/unverified fields and withdrawn nominees; retain/hash new evidence.
  Knesset datasets, seats and scenario actions are unchanged.
- Add metadata validation, PM reconciliation tests and bilingual/theme/viewport browser coverage.

Notable changes are recorded here using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
conventions. The history records development commits, not tagged releases; the dated entry
below groups all existing commits from 3 November 2026. `package.json` currently says 0.1.0.

## [Unreleased]

### Fixed

- Name saved comparison references consistently in English and Hebrew across list bars,
  accessible deltas, list details, phone results, session summaries and Compare; retain
  real-result labels for dataset-derived figures. Remove the duplicate summary identity.
- Compare matching saved custom bloc groupings, including before/after bars and session
  deltas; keep incompatible groupings without an invented counterpart.
- Commit scenario descriptions and names on blur or Enter as one undoable action.
  Description changes have a bilingual history label and shared edit marker, and replay
  through saves, shares and exports.
- Add B1/B2/B5 browser regressions, helper/grouping/action unit coverage and saved-reference
  screenshots in both languages, themes and desktop/phone sizes.


### Changed

- Saved/loaded scenarios become the edit reference, with a browser setting to mark against
  the official result instead. Shared neutral glyphs explain previous inputs; Compare and
  session summaries name the reference. Candidate ordering is included in the diff.
- Scenarios gain undoable palette colours, chrome-only identity tint, saved/gallery swatches
  and one expandable name chip. Exports add no scenario footer.
- A shared “Start from…” selector resets or reuses blocs, agreements, rules and coalitions.
  Blank blocs create two empty named blocs with every list and party unassigned. Old unnamed
  grouping logs remain replayable. Coalition choices are now undoable scenario inputs.
- The remaining five starting-point editors and Custom level are deferred under the owner's
  bounded first-pass scope; existing level defaults are preserved.

- Wave 1 continuity: phone edit consequences remain visible; majority readouts share wording,
  and coalition membership uses In / Out / Any choices. Baseline, grouping and result status
  labels travel with results; Compare uses percentage points and aligns sourced bloc groupings.
- List edits show their vote-source assumption at every level, source-aware threshold
  checkpoints and search qualifications, plus an explanation linking crossings to the walkthrough.
  History and undo/redo name actions from the existing log. Level gates remain unchanged.

### Fixed

- **Acceptance repairs (4 Nov 2026).** Compare and coalition arithmetic respect member-level bloc moves;
  separately run lists share one official comparison. Seat safety preserves search qualifications.
  Phone election labels and named tools stay visible or accessible; table actions work by keyboard,
  Escape cancels drafts before closing panels, locality results retain historical names, and Compare
  draws change in neutral ink. The counting engine is unchanged.

- **Editing blocs (4 Nov 2026).** Editing blocs was four steps deep (a band, its detail, a Standard-only button, a
  table of menus) and renaming or recolouring was hard to find. Clicking a bloc, or "Edit blocs", now opens a bloc
  editor beside the chamber at every level: each bloc is a card whose name is edited in place and whose colour comes
  from a swatch; its seats are shown against the majority; its lists are chips that move by dragging, or by choosing
  one and then "Move here" (on touch and keyboard too). A party of a joint list moves on its own. "New bloc" and
  delete sit on the cards. Edits become "Your grouping" and the sourced groupings stay under "Start from".

- **Bloc regions easier to see (4 Nov 2026).** The pale bloc tints behind the chamber and in the bloc strip are about
  twice as strong, with a faint edge in the bloc's colour (stronger again in dark mode). The chamber's regions now
  step row by row between neighbouring blocs' seats instead of one straight cut, so no seat sits in another bloc's
  region where rows interleave (a unit test checks every seat).

- **Community gallery, locality map (4 Nov 2026).** The scenario gallery never reached GitHub: it called the
  browser's `fetch` as a method of its own object, which browsers reject ("Illegal invocation"); a unit test now
  guards it. The gallery sits on the Scenarios page in the app's own cards and controls, publishes the current
  scenario's name and description instead of asking for them again, and waits until the scenario has a change. The
  locality map opens fitted to Israel in a tall column on desktop; its drawing layer no longer covers the address
  search after the window narrows (the map frame is always positioned, so Leaflet's layers stay clipped).

### Changed

- **Visual board, owner feedback (4 Nov 2026).** The chamber leads the Overview; lists are a column of seat bars (the
  official seats as an outline, lists below the threshold showing how much of it they reached, split factions with
  their parties); a list opens in a side panel (a drawer on tool pages, a full-screen sheet on phones). Every tool is a
  full-width page that leads with its drawing: Compare shows the two chambers side by side, the blocs against 61 and
  a seat-change bar per list; Coalitions is a builder with a 120-seat bar and each smallest winning coalition drawn;
  Merge & split takes one task at a time with a drawn preview before applying. A new Scenarios page names, describes,
  saves, shares, compares, exports and restores scenarios; What-if questions preview in place and open as named
  scenarios. The election picker no longer flashes white-on-white while browsing it.
- **Redesigned interface ("Market Board", design brief in `.impeccable/surfaces/`).** The official result is the
  opening price and your edits are the session:
  - a navy band (election, level, scenario, undo/redo, save & share, language, theme) and a tools strip under it
    naming every tool at every level (tools above the current level say so and offer that level in place);
  - "What changed": one line of net effects (seats moved against the official result, bloc totals, majority),
    with the undoable history one click away;
  - blocs as pale tinted bands (and chamber wedges) behind their members, with a 61-seat milestone; a band opens
    its members in place, and moving parties between blocs is one button further;
  - the lists as a ruled table (logo, votes, share, seats, change, session trend, surplus partner); a list opens
    inside its own row: votes by number, share or a live slider (the whole board moves while dragging), the exact
    votes to the next seat and to losing one (computed on opening), the surplus partner as a selector with an
    on/off switch, its parties with their logos and blocs, a "Faction split after the election" switch beside
    the "What if they had run separately?" counterfactual, standing, identity and candidates;
  - key figures that open in place ("Votes that won no seat" lists every such list with votes and share);
  - neutral ink for gains and losses; a self-hosted typeface (IBM Plex Sans Hebrew) and drawn icons (Lucide).
  The previous interface is kept on the `legacy-layout` branch and the `layout-v1` tag.

### Added

- Election-specific partisan and neutral links for lists and constituent parties, with validated build/scenario metadata, verified source evidence and an explicit partial-coverage gap inventory (decision 0093).
- Locality results map with live scenario bloc/list colours, bilingual partial search, Photon address lookup, and retained CBS reference coordinates; unmatched and envelope rows remain unplaced.
- Standalone bilingual community scenario gallery backed by public GitHub Issues, with safe share-link publishing, cached browsing, search, filters and likes links (mounting pending).

- Official campaign logos may use fair-use identification (decision 0089), with explicit rights basis,
  campaign-date provenance, byte/hash validation and separate constituent-party emblems.
- Sourced geographic turnout groups for k16 and k18–k26, with bilingual definitions, classification
  years and coverage: Arab localities, kibbutzim, moshavim, Israeli localities in Judea and Samaria,
  Bedouin tribes, and dated Haredi, Druze and development-town reference cohorts. k17 explicitly
  remains unavailable because codes/electorates are missing. Exact demographic turnout model with
  signed replayable actions, overlap rejection and merged/split list mapping (decision 0090).

- Published on GitHub Pages at https://yiftahcooper.github.io/israel-elections/, redeployed on every push to `main`;
  a site icon (the browser no longer requests a missing favicon).
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
- Party logos as used at each election (43 freely licensed files, credited in Sources); other lists keep their ballot letters.
- Candidate biography links: each candidate's Knesset member page, the party's own page (archived from the campaign
  where possible) and Hebrew Wikipedia, labelled as a secondary source; name-only matches are marked "probable".
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

- Phones: no analysis tab scrolls sideways any more (Sources credits, agreement chips, the 1973 walkthrough's long step names and side-by-side sections now wrap or stack). Checked across all 26 elections, three levels and both languages.
- The Sources note no longer says blocs and colours are assigned by the app; they follow the sources given for each grouping and party.
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
