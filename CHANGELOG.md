# Changelog

## 6 November 2026 — data audit

- k15: corrected ballot identities and gazetted names, restored two withdrawn registrations, clarified PM/dissolution evidence and roster coverage, and withheld unverified logos.
- k24: corrected Demokratit’s withdrawal, retained official final notices, clarified opening membership and polling-station scope, added candidate resignation notes, and corrected overstated source and logo verification claims.
- k19: retained the formal Gazette total correction, repaired list identity, context and stale research notes, strengthened constituent sourcing and withheld three unproven campaign logos.
- k21: corrected three withdrawn lists, gazette name/sponsor transcriptions and resignation notes; retained official results and replaced recommendation inference with explicit reports.
- k18: retain withdrawn Mahapach BeHinuch; correct formation-day coalition, Meretz affiliation, names and dated source claims.
- k16: corrected government/succession and dissolution chronology, two candidate names and roster extent; retained withdrawn Moreshet Avot and clarified source and envelope-voter claims.
- k13: corrected official list names and ballot letters, four candidate spellings, and Government 25’s end (22 November 1995, with Peres as acting prime minister).
- k12: corrected seven ballot-letter readings and list names while retaining stable IDs, settled the opening coalition at 95–25, documented Reiser’s death, and qualified unsupported recommendations and campaign logos.
- k11: corrected ballot labels and small-list identities with stable IDs, removed Shiluv from Sheli’s family/lineage, corrected candidate #61 and the 97-MK coalition, and refreshed sourced aftermath gaps.

## 5 November 2026 — release review

- Scenarios mark unsaved changes, reopen saved versions while keeping drafts, and resolve duplicate names with overwrite, numbered copy or a custom name.
- Synthetic lists use divided constituent ballot tiles, marked split parts and clean new-list letters through the shared logo path, comparison records, chamber legends and image exports.

- Compare opens unchanged results against the previous election, including when saved scenarios exist; explicit comparison choices stay selected, edits use the usual official result/reference, and the earliest election keeps its chooser.

- Turnout can no longer pass 100% through vote edits: “new voters” come only from registered voters who stayed home, in the vote field, slider, quick buttons, seat searches, seat security, bloc totals and What if… presets; the list panel shows how many stayed home. Lowering registered voters below votes cast still warns rather than blocks.
- Personal editing preference: count joint lists’ seats by party by default, with an inline remembered default, unedited baselines and portable saved/shared faction counting.

- After the election (research): sourced "Recommendations to the President" groupings for 1984, 1988, 2003 and 2006, and a partial one for 1981; 1977 and 1992 documented as gaps, 1996/1999 as direct-election years with no recommendation round (docs/research/pm-recommendations-1977-2006.md).
- Recommendations to the President: new partial 2026 record (4–5 Nov consultations; Likud pending) and 2009–2022 re-verified against news reports (2013: Kadima recommended Netanyahu, 82; 2009: all 12 factions sourced). See docs/research/pm-recommendations-2009-2026.md.
- Research: recommendations to the President after the 1949–1973 elections (docs/research/pm-recommendations-1949-1973.md); added sourced `pm-recommendations` bloc schemes for 1959, 1969 and 1974, with undocumented lists shown as “Not stated in source”.
- Owner answers: use Hebrew ballot-letter logo fallbacks and neutral constituent badges, shorten data status with full details behind (i), and isolate Hebrew-only candidate names with an English explanation.

- QA2 leftovers: use shared analysis/settings pickers, tighten stable list-panel spacing, place global notices after the work area, and compact the phone header while keeping every control directly available.

- Analysis screens: fixed-scale seat-safety tracks, stable sensitivity loading, complete threshold labels and round axis ticks, nearby chart names with Hebrew phone alignment, inline formula help and compact allocation tables, equal comparison options and compact aligned coalition rows.
- Editing screens: suppress unchanged resets, keep questions independent and edit controls steady, preserve locked explanations, clarify turnout steps and disabled actions, and align locality search and sticky map.
- QA2 Overview and header: keep phone scenarios readable, selection widths and election header slots stable, expose tab scrolling, toggle figure popovers natively, align values and isolate sums, trim the arc’s empty margin, keep show-more triggers before their content, wrap grouping names, unify fallback identities, and show sourced Hebrew member names in given-name order. Shared labels wrap between words; Sources leads with English labels and retains original credits.

- Corrected the English and Hebrew data-status notes for k20–k24 by removing obsolete claims that no default blocs are assigned.

- List panel: Knesset members appear under their official English names (Knesset website) in English mode, with the registered Hebrew name beside them; English link and sponsor labels carry no Hebrew or letter-by-letter text; candidate links say less with detail behind (i); "Restore list" appears only for non-vote edits; renaming a candidate no longer moves its row; component parties without a colour get a distinguishable one on candidates, party rows and when split. Shared controls: short pickers open without a search box and re-choosing the current option is not an edit; secondary-source chips are neutral, not error red; dark-mode sliders are visible; small buttons match a 32px field beside them.
- Overview: the "Since official result" line is always present at one fixed height (sticky on wider screens, History as a popover), so a first edit no longer pushes the page down; the lists column keeps its width when a list opens; focus stays clear of the sticky bars; seat changes are said once (the line), not again under the chamber; Hebrew bloc counts no longer merge with their majority note; the government picker shows its whole name on phones; change bars sit beside their names; What if… previews keep Hebrew names on the reading side.
- How seats were allocated: seven numbered stages on one line (seats or pairs of the open stage beneath, a slider for divisor methods), a seat tray that fills seat by seat, a new surplus-agreements step, every list with the threshold line drawn, full-height tables, era-correct rule text and arithmetic (1949 quota gate and pair quota, 1951–69 remainders, 1977 candidate cap), and edits marked against the reference at each stage.
- Compare offers saved scenarios, the previous or any other election and What-if questions when nothing differs, instead of two identical results; compares two elections side by side without pairing their lists; replaces the crowded slope chart with a seat dumbbell that keeps tied lists readable; and keeps change bars, tracks and signs left to right in Hebrew.
- Rules tab renamed Rules & settings: settings sit in their own card (display, editing questions with each remembered per-list answer and Ask again); each era's law is named, its own rules (1949, 1951–1969, 1977) are shown, thresholds carry their years, locked fields look locked, and rule edits are marked at their field.
- Merge & split: previews and a new "Changed lists" record compare a split once with all its parts (no more "27 → 0" per part); the page stays put after applying; split vote shares are shown as a bar with votes and are editable in place; split parts and new lists get distinguishable colours; each era's surplus-agreement rule is stated; tabs no longer jump.
- Section reset and copy controls appear only when they would change something (“Official turnout”, “Copy from…”, “Remove all agreements”). Turnout models one voter group at a time — sourced CBS locality groups, vote-share localities or typed numbers — with a turnout slider, measured vote mix, seat-change preview, increases and decreases, and saved, exported and imported voter-group presets.
- Distinguish joint-list component candidates and seats with party tints and list-colour envelopes, include component identities in chamber exports, and prevent component-row logo overlap. Component seat colours can be disabled under Rules → Display.
- Keep family-chart hover facts out of page flow, clarify mixed-list counting, and open election breakdowns with named lists, logos, votes, seats and sourced constituent changes before navigating.
- Coalitions: a chosen coalition opens beneath its own row (nothing above it moves), party cards keep In/Out/Any in one place, one “Clear the coalition” replaces three identical resets, “Pivotal” is named only when it tells partners apart, and In lists that already win are said to. Scenarios: Save shows Official / unsaved / Saved, the gallery has one status line, and visitors read only the Pages index — never the GitHub API — waiting out failures and 429/503 Retry-After across reloads.
- Party families: mixed lists are defined where they are chosen (Show hatched / Count if family heads it / Count all / Leave out, each with its chart mark); hover names each hatched list's parties (family's own in bold) and the change since the previous election without loading or taking the pointer; the election breakdown leads with votes, share, seats and their change, orders counted → hatched → not counted, and counts only a mixed list's family parties as represented; membership editing no longer jumps while lists load; Hebrew quick percentages read left to right.
- Keep coalition inspection independent of In/Out filters, show partner seats and pivotal members, and expose local resets. Clarify scenario save/share flow, align name/description fields and bound option widths; serve the community gallery from an automatically generated Pages index instead of anonymous visitor API calls.

- Clarify vote sources, section replacements, joint-list actions and edited markers; remove single-vote nudges and let sliders cover the valid-vote total. Preference prompts offer one-use, item and global scopes with one explicit Apply action.
- Complete English list labels with sourced, explicitly unofficial transliterations where needed; localise menus, exports and identity captions. Show year-labelled nearest-period logos, preserve component logos through splits, and replace bare party squares with monograms.
- Keep list and bloc panels within the viewport with independent body scrolling; prevent edit anchoring jumps. Figures open consistent popovers without reflow. Keep floating content inside the viewport and move the footer independence note into About. Define block-group boundaries, enlarge bloc strips, and separate default bloc/scenario colours while preserving saved choices.

- Keep long edited bloc names and official list names readable on phones, restore contrast for Compare counts, and show family scaling counts once beside their strips.
- Charts: whole list names (stacked above bars on phones), one list order and edge lines in both waffles, votes→seats read left to right in Hebrew, and "Votes with no seat" counted as on the overview (1949 lists that won nothing, no false "below threshold"); table names open their list, and switching to the table no longer shrinks or scrolls the page.
- Prevent map zoom completion from accessing a destroyed pane after tool navigation.
- Seat safety: lay out every row at once and fill figures in place; keep the chart left to right in Hebrew; quote one figure per seat change (votes to lose / gain a seat); show lists below the threshold against it; name the vote source; stop failing on election switch.
- Sensitivity answers on opening, with no Run or Search: plain headings, a threshold drop-out chart, tables against the current result, a bloc seats meter with the result checked against the chamber, and pickers that follow the election.
- Sources: English publishers and descriptions on English pages, official sources listed first, project records named instead of dead links, "not in the data" instead of zero locality counts, one credit per logo (English first, Commons labelled secondary once), method and limits above the glossary, data downloads, and no layout shift when the source list loads; About events in date order.
- What if… answers that move no seat now show what does change (a joint list as the sum of its parts, the threshold in votes, agreements that moved nothing); every question's (i) states its assumptions, including surplus agreements a merger ends, and points to the election's sources. Questions and merged lists use the lists' own names, and each (i) sits on its question's line.
- Localities: English mode names every locality in English (CBS names, including 2006 by exact name; a few labelled project transliterations) on the map, table and lists; the basemap is muted and dark in dark theme; a selected locality shows who leads, by how much, and the bloc breakdown; the address field is styled as an input, a blocked tile server is reported, and zooming no longer scrolls the page.

## 5 November 2026 — concise tool pages

- Keep tool instructions brief in Hebrew and English; retain modelling assumptions, provenance and correctness caveats in named info controls. What-if questions keep their vote and seat consequences visible, with separate assumption controls and reduced-motion-aware navigation.
- Sensitivity ranges and seats/majority fractions retain left-to-right numeric order in Hebrew.

## 5 November 2026 — preferences at the action

- Keep vote-slider previews responsive by leaving edit comparisons and exact searches on committed inputs; capture releases outside the slider, reserve feedback space, and highlight seat changes and majority crossings with reduced-motion support.

- Shorten board guidance and keep joint-list assumptions, provenance and graphic explanations in (i). Clear stale share links after edits and keep the phone save/share menu inside the viewport.

- Choose vote source, then “For this list” or “Always”; saved-scenario opens ask which comparison to mark. Both use one preference dialog and resettable settings in Rules → Editing.
- Keep numeric ± rows and sliders left to right in Hebrew as in English; preserve RTL labels and page layout.

## 5 November 2026 — seat counts you can type; one question for where votes come from

- Joint lists show their head party, elected component seats and opening factions, with sources and unknowns in (i). Mixed family ballots stay separate by default; an explicit head-party policy and per-list overrides replace the hidden two-thirds rule.

- Refresh the 2026 CEC count from the 4 November official files; replace the expired Gazette deadline with an explicit publication-verification caveat.
- A list's seat count is editable (typed or ±1): the engine finds the fewest votes that give it and applies them as one ordinary, marked and undoable vote edit. When no vote count gives exactly that number (e.g. 1 seat just past the threshold), the list lands on the nearest possible count and says so.
- Every vote edit (seat count, votes, goals, share, slider, bloc votes) asks where the votes come from (other lists, new voters, or one list) in one shared dialog, and works its target out under that answer. "Remember" stops asking; the choice lives in Rules → Editing. An unremembered answer holds while the same list or bloc is edited.
- Family scaling chooses its vote source in place.

## 4 November 2026 — party families audit

- Stop plotting elections where a family ran only in mixed lists as zero; stack the mixed range on the whole-list value and state the hatching once in a legend.
- Say "not counted" (only mixed or contested lists) instead of "did not contest"; show excluded mixed votes in tooltips and exact figures.
- Make the mixed-list policy a remembered view that never forks a preset; name personal copies distinctly and let Manage delete them.
- Give the nine families mutually distinct colours; use round axis values and decade ticks; place tooltips beside the point.
- Scale families down as well as up; preview the family's seats before/after with the delta and majority line; keep signs and arrows in Hebrew reading order.
## 4 November 2026 — scenario switching and app chrome (release-candidate audit)

- One switching path everywhere (switcher, Save & share menu, Scenarios page, share links, imports): unsaved work, including an opened share link, is kept as a session draft; resuming a draft removes it from the list; a saved scenario opens with its own undo history.
- A share link pasted into an open tab opens; a damaged link says so. Deleting the open saved scenario keeps it open as unsaved work (the switcher no longer shows a blank "Switch scenario"); the menu's delete now confirms.
- A duplicate gets its own colour and history; an unsaved draft already shows the colour saving will give it.
- One name per tool: the tab strip, Custom page and level names come from `features.ts`. The Overview cannot be collapsed or hidden.
- The tools strip stays one line and sticks under a wrapped band (tablets); About opens on screen on phones, names each list's events and closes on Escape or an outside press; undo/redo mirror in Hebrew; banners keep their dismiss button beside the text; load errors are plain with the technical reason quiet.
## 4 November 2026 — list controls audit

- Every vote goal shows the signed change it makes; "Restore votes" sits beside the goals once a list is edited.
- The vote field steps with ↑/↓ (PageUp/PageDown ×10), reads Arabic-Indic digits and 10k/1.2m, and marks an entry it cannot apply; the default step is 10k (1k in small early elections).
- Withdrawn lists show no stale search, threshold goals or threshold-crossing note; the withdrawal is marked at its switch and each list row carries one marker.
- Surplus partners are explained once in the lists header and never cut off; seatless lists of 1949 sit under "Lists that won no seat".
- Undo labels name the list moved; the Hebrew transfer line reads right to left; tall logos stay inside their slip; ballot letters are larger.
- On phones the lists follow the chamber directly; on tablets the list sheet keeps a readable width.
## 4 November 2026 — tool pages audit

- 1949 with a divisor method (Rules, What if… "Pure proportional representation") no longer leaves all 120 seats unallocated; the 1949-only rules are shown and editable in experimental mode, and the banner names the 1949 method correctly.
- How seats were allocated: the quota formula follows the election's law (seats + 1 in 1949, Droop, unrounded, divisor methods without a quota stage); no "0% threshold" formula; named first steps; exact quotients for every method.
- Charts, Compare and Sensitivity charts keep readable text on phones; Hebrew charts put labels, waffle order and the comparison baseline on the reading side; vote bars are outlined so they read in dark mode.
- Sensitivity: a sweep keeps the range it was run for; long searches can be cancelled; reversed or empty threshold ranges are refused.
- A merged list keeps its first list's colour; seat transitions ("27 → 25") read correctly in Hebrew; source descriptions are no longer scrambled on the Hebrew Sources page.
- State shown as state: the bloc filling a coalition, the loaded smallest coalition and the threshold preset in force are highlighted; repeated "unchanged"/"off"/"active" labels removed; What if… answers drawn as coloured chips and wording fits elections with turnout above 80% or a 2% law.
## 4 November 2026 — overview graphics and colour audit

- Separate party colours in every election (CIEDE2000; all pairs ≥15, neighbours ≥20; both themes), keeping well-known parties' colours, and separate bloc tints from each other and from No bloc.
- Draw chamber regions with smooth boundaries that enclose exactly their seats; fix seat order along the baseline.
- One consistent collapsed-feature toggle; chamber colour and layout choices sit together under Chamber options.
- Blocs bar: show the reference only when it differs, state each bloc's majority once, keep the 61 marker off labels; export legend, Hebrew and dark mode corrected.

## 4 November 2026 — mark replacements once

- Mark whole-part starting points, grouping changes and rules presets once at the part; later individual edits use the replacement as their checkpoint.
- Deduplicate shared marker outlets and keep exports/reference summaries consistent.
- Highlight seat counts only when they differ from the active reference.
- Carry the family chart colour into its bloc, with muted grey for everyone else and distinct sand for mixed lists.

## 4 November 2026 — concise family grouping labels

- Add bilingual short labels to all nine family presets while retaining full titles in their information sheets.
- Omit empty Mixed blocs and repeated family names/majority claims from family session summaries.
- Label and tint each member row consistently, retaining seat order for separated members.
## 4 November 2026 — fill-only chamber regions

- Remove region border strokes from current and reference chambers. Keep pale
  regions uninterrupted, without changing seat positions or counts.
- Add 1988 Haredi grouping stress cases with a 13-seat first and last bloc, covering
  both themes, languages and viewport sizes and rejecting region-outline strokes.


## 4 November 2026 — visual family profiles

- Replace family/compare dropdowns with stable-colour selection chips and hero charts with exact tooltips, pending points and shared scales.
- Move membership and historic-partner editing into a cross-election sheet; collapse exact figures and put import/export in Manage.
- Preview scaling with before/after seat strips; retain an unedited family lens and labelled member brackets on Overview.
- Compile a 41 KB runtime payload, lazy-load evidence/registry, and verify nested ChoicePicker dialogs and all responsive states.


## 4 November 2026 — party families

- Add nine sourced draft family interpretations with date-based share/count charts, exact totals and mixed-list policies.
- Add personal preset forks, hide/restore, browser-only storage, import/export and previewed registry relationship suggestions.
- Add atomic undoable family grouping and proportional vote scaling with frozen definitions and exact integer conservation.
- Keep one Haredi metadata source and validate all nine built-ins; add family model and bilingual/theme/viewport browser coverage.


## 4 November 2026 — graphics review and controls integration

- Use one active reference for summaries, edit markers, list details, Compare
  defaults, graphics and exports; preserve the scenario-switching checkpoint.
- Move No bloc between declared blocs and keep the majority scale counted from
  the physical left in Hebrew and English. Draw clean annular region unions.
- Show a small coloured reference chamber with outlined losses; simplify captions
  and use compact changed-list readouts, collapsed on desktop above five changes.
- Merge the controls branch from main, remove duplicate native grouping/colour
  selectors and their CSS hiding rule, and drive BoardChoices in browser tests.


## 4 November 2026 — graphics consistency

- Keep chamber geometry fixed, move names to wrapping legends, and enclose
  unassigned seats in explicit neutral No bloc regions in both themes.
- Add persistent neutral gain ordinal outlines, a labelled empty baseline loss miniature, dashed bloc references
  and list delta segments with old → new / signed readouts; share origin-aware change drawings across analysis tools.
- Correct list colour mode, Compare region treatment, dense slope label bounds,
  threshold qualification semantics and reduced-motion region transitions.
- Add 26-election and stress-case geometry/label checks plus bilingual theme and
  viewport screenshot coverage; record the audit and encoding contract.

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

### Added

- Always-visible scenario switcher with identity and result previews, Official result, and
  recoverable unsaved session drafts retaining undo history.
- Searchable election timeline with era groups, repeat-election dates and a distinct 2001
  PM-only marker, nearby elections and a preview/Open boundary; shared keyboard-operated
  pickers become phone sheets.
- Preview pickers for grouping, saved starting parts and colouring.
- Source-aware fine/coarse vote steps, searched “Reach next seat” with exact/sampled status,
  paired 1pp transfers, minimum-seat actions, threshold checkpoints,
  bloc scaling, turnout steps and reuse of official turnout, total steps and era thresholds.
- Browser coverage for scenario switching and unsaved recovery, keyboard/phone election
  navigation, exact +1 seat, +10k and undo, and bilingual/theme/viewport screenshots.

### Changed

- Simplify election browsing to one era timeline with official seat bars and in-place Open;
  keep neighbour arrows beside the header trigger and spell out repeated-election months.
- Replace quick-action walls with a shared numeric stepper, relevant goals and a More menu.
- Automatically balance scenario identity colours, deterministically migrate older saves,
  and show only exceptional source/rule details in switcher rows.
- Replace era side stripes with muted labels and hairline rules.

- Warn in both languages when candidate-cap counterfactuals depend on the inferred 1977
  procedure, and when known candidate shortages have no modelled procedure. Preserve the
  original 1977 result without a warning and unknown rosters without invented capacities.
- Qualify unresolved early ties only when they change seats; disclose internal quota
  fallbacks. Keep warnings beside affected lists and in the banner.
- Replace Custom dropdowns with grouped visibility segments and previews, fix its tab
  selection, bound chamber labels, and move About beside the election picker.
- Cover all elections' rendered chamber bounds and capture both languages/themes/viewports.


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

- Show bilingual human change values and colour swatches instead of serialized inputs.
  Name removed agreements beside their markers, keep tooltips inside phone viewports, and
  label rule starting points by era, method, threshold and candidate cap (acceptance B3/B4).
- Complete shared starting points for votes, identity, structure, candidates and totals;
  blank candidate orders and zero-vote new lists are undoable.
- Add a single feature registry, in-place optional controls and browser-persisted Custom
  visibility settings with task groups and preset resets. Truth labels remain visible.

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
