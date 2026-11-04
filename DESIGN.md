---
name: Israeli Elections Explorer
description: An exact Knesset seat simulator laid out as a market board, with the official result as the opening price and the user's edits as the session.
colors:
  shell-navy: "#0e2f56"
  shell-navy-raised: "#1b4675"
  shell-ink: "#ffffff"
  shell-ink-quiet: "#c9d6e6"
  page-ground: "#e8ecf0"
  surface: "#ffffff"
  surface-quiet: "#f4f6f8"
  open-tint: "#edf2f8"
  ink: "#15171a"
  ink-secondary: "#454d55"
  muted: "#5d656e"
  rule: "#dde2e7"
  rule-strong: "#c4cbd3"
  axis: "#b5bdc6"
  switch-off: "#7d8791"
  chart-grid: "#e7eae8"
  focus-blue: "#2160c4"
  threshold-rust: "#9b3a24"
  threshold-hatch-a: "#f6e5df"
  threshold-hatch-b: "#fbf3f0"
  error-red: "#b42318"
  warn-bg: "#fff3d1"
  warn-ink: "#5e4100"
  error-bg: "#fde8e6"
  experimental-violet: "#5b47c9"
  ballot-slip: "#ffffff"
typography:
  brand:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "tnum"
  title:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  body-dense:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  label:
    fontFamily: "IBM Plex Sans Hebrew, Segoe UI, system-ui, Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.45
  formula:
    fontFamily: "ui-monospace, Cascadia Mono, SF Mono, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
rounded:
  hairline: "2px"
  tag: "3px"
  slip: "4px"
  control: "5px"
  panel: "6px"
  pill: "999px"
spacing:
  xxs: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  fade: "28px"
components:
  band:
    backgroundColor: "{colors.shell-navy}"
    textColor: "{colors.shell-ink}"
    padding: "8px 16px"
    height: "52px"
  band-tool-hover:
    backgroundColor: "{colors.shell-navy-raised}"
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 11px"
    height: "32px"
  button-hover:
    backgroundColor: "{colors.surface-quiet}"
  button-active:
    backgroundColor: "{colors.open-tint}"
  button-primary:
    backgroundColor: "{colors.shell-navy}"
    textColor: "{colors.shell-ink}"
    rounded: "{rounded.control}"
    padding: "4px 11px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.shell-navy-raised}"
  button-small:
    rounded: "{rounded.control}"
    padding: "2px 8px"
    height: "28px"
  segment-pressed:
    backgroundColor: "{colors.shell-navy}"
    textColor: "{colors.shell-ink}"
    padding: "4px 11px"
    height: "30px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 8px"
    height: "32px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "10px 12px"
  table-header:
    backgroundColor: "{colors.surface-quiet}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "7px 8px"
  table-row-open:
    backgroundColor: "{colors.shell-navy}"
    textColor: "{colors.shell-ink}"
  table-row-detail:
    backgroundColor: "{colors.open-tint}"
    padding: "10px 12px 14px"
  threshold-row:
    textColor: "{colors.threshold-rust}"
    typography: "{typography.label}"
    padding: "4px 10px"
  tab-active:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "9px 10px 7px"
  ballot-slip:
    backgroundColor: "{colors.ballot-slip}"
    rounded: "{rounded.slip}"
    width: "58px"
    height: "32px"
---

# Design System: Israeli Elections Explorer

## Overview

**Creative North Star: "The Market Board"**

The screen reads like a stock-exchange board or a business-press market table. The official result is the opening price; every edit the user makes is the session, and the board reprices live. A navy shell band sits over a cool grey ground, and the picture leads: the chamber is the centre of the board, the lists are a column of seat bars, and an opened list sits in a side panel beside them. Each tool is a full-width page of its own, drawn rather than written, and the board keeps its state when you come back. Nothing is a card grid, and no feature hides behind a menu.

Density is high and deliberate. One workhorse face with tabular figures carries everything at almost one size; rank comes from weight and from the navy marker on the selected list, not from big type. Party colour belongs to the parties: it appears in their ballot slips, seats, wedges and the pale tinted corridors of their blocs, never in the interface chrome. Change is drawn in neutral ink with a small drawn triangle, never green or red, so no camp is ever coloured as winning or losing.

The same board serves three levels (Simple, Standard, Expert). Levels thin the board by removing columns and controls; they never move a feature behind a click or hide that it exists. Hebrew right-to-left is the default and English left-to-right is equal; both have light and dark themes.

**Key Characteristics:**
- Navy shell band (52px) over a cool grey ground; white, hairline-ruled surfaces.
- One face (IBM Plex Sans Hebrew, self-hosted 400/500/600/700) with tabular figures everywhere.
- One data type size; rank carried by weight and the reversed navy plate.
- Opened in place: figures and bloc corridors expand beneath themselves; a list opens in the side panel; tools are pages.
- Party colour only as party identity; change in neutral ink.
- The threshold is a hatched rule inside the table.
- Flat surfaces; shadow only on floating layers.
- Logical (inline-start/end) layout throughout, so the board mirrors cleanly between Hebrew and English.

## Colors

A restrained cool-neutral board with one navy accent; the only saturated colour on screen belongs to the parties.

### Primary
- **Exchange Navy** (shell-navy): the shell band, primary buttons, pressed segment buttons, the selected list's hairline outline, the border of an opened figure, the active tab underline, the majority milestone's label, a checked switch and range-slider accent.
- **Raised Navy** (shell-navy-raised): hover state on the band's tools and on primary buttons; the selected row's plate in the dark theme.
- **Band Ink** (shell-ink) and **Band Quiet Ink** (shell-ink-quiet): text on navy; the quiet ink carries secondary text on the band 

### Secondary
- **Focus Blue** (focus-blue): focus outlines (2px, offset 2px), links, text caret, selection tint (26% mix), and the one-shot "tick" flash when a seat count changes (30% mix fading out over 1.2s). In the dark theme it also takes over the active-tab underline and the checked switch.

### Tertiary
- **Threshold Rust** (threshold-rust) on a hatch of **threshold-hatch-a** and **threshold-hatch-b**: only the threshold rule in the lists column.
- **Experimental Violet** (experimental-violet): outline and text of the "Experimental rules" chip; nothing else.

### Neutral
- **Cool Ground** (page-ground): the page behind all panels.
- **Surface** (surface): panels, tables, inputs, buttons, the tools strip.
- **Quiet Surface** (surface-quiet): table headers, hover on rows, ghost buttons and figures, callouts, the info banner, formulas.
- **Open Tint** (open-tint): an opened list's detail row, an opened figure's head, pressed buttons, selected rows in tool tables.
- **Ink** (ink), **Secondary Ink** (ink-secondary), **Muted** (muted): text in three steps; muted is for column headers, meta lines, placeholders and quiet labels.
- **Rule** (rule) and **Strong Rule** (rule-strong): hairlines between rows and around panels; control borders and table-header undersides use the strong rule.
- **Axis** (axis): chart axes, the sparkline baseline, hover borders on controls, the info button's ring.
- **Chart Grid** (chart-grid), **Switch Off** (switch-off).
- **Ballot Slip** (ballot-slip): the paper of the ballot-letter tile; stays near-white in both themes because a ballot slip is paper.
- **Status**: error-red (danger text and controls, error toast), warn-bg/warn-ink (the provisional-result banner), error-bg (error banner).

**Dark theme.** `[data-theme="dark"]` remaps every token rather than adding new ones: navy deepens (#0a2240 band, #173a63 raised), the ground goes near-black (#0f1215) under #171b20 surfaces, ink lightens to #e8eaec, rules to #29303a/#3a434e, focus to #78a8ff, threshold rust to #f0a184 on a #2f201c/#251a17 hatch, and the floating shadow becomes `0 8px 28px rgba(0,0,0,.5)`. Bloc corridors rise from a 14% to a 22% tint and dimmed seats from .22 to .38 opacity so they stay legible.

### Named Rules
**The Neutral Ink Rule.** Change is drawn in ink (600 weight) with a drawn 8px triangle mark, never green or red. Colour on this board means "this party", never "good" or "bad" for a camp.

**The Party Owns Its Colour Rule.** Party and bloc colours come from the data (passed in as a per-element colour variable) and appear only as identity: ballot-slip borders, seats, chamber wedges, bloc pieces, coalition chips, and pale regions (12% for elected candidates, 14% / 22% dark for bloc corridors, 20% for an included coalition chip). They never colour buttons, tabs or chrome.

**The One Navy Rule.** Navy is the only interface accent. It marks where you are (band, selected row, pressed choice, open tool), not decoration.

## Typography

**Display Font:** none; there is no display tier.
**Body Font:** IBM Plex Sans Hebrew (with Segoe UI, system-ui, Arial, sans-serif), self-hosted at 400/500/600/700.
**Label/Mono Font:** ui-monospace stack, only for formulas and code-like values.

**Character:** A single sturdy grotesque, Hebrew-native, that reads as a newspaper market table: compact, tabular, unshowy. Tabular figures are set on the body so every column of numbers aligns.

### Hierarchy
- **Brand** (700, 16px; 15px on phones): the product name in the band only.
- **Headline** (700, 15px, 1.25): section headings, seat counts in the table, figure values, the election selector on the band.
- **Title** (700, 14px, 1.25): panel headers, the active tab, key facts in an opened list.
- **Body** (400, 14px, 1.45): the base. Dense surfaces (band tools, tables in tools, banners, session line, tabs) run at 13.5px; form fields, popovers and secondary meta at 13px.
- **Label** (600, 12.5px): table column headers, the threshold rule, section titles inside detail (700, secondary ink), chips, figure keys (400). 12px for row sub-names; 11px only for the milestone tag, the info glyph and chart text (11.5px).

### Named Rules
**The One Size Rule.** Data sits between 12.5px and 15px. Rank is carried by weight (400 / 600 / 700) and by the navy selection outline; the chamber, the seat counts in the lists column and the opened list's seat total are the deliberate exceptions, because they are the picture.

**The Tabular Rule.** Every number is tabular and end-aligned in its column; percentages and counts never jitter as they reprice.

## Layout

**The board (the Overview tab).** A sticky 52px band, then a sticky one-line tools strip naming the Overview, Scenarios and every tool, then (once edited) a one-line "What changed" summary led by the scenario's name, any banners, and the work area (padding 12px 16px 28px, 12px gaps). The board is the lists column (`minmax(300px, 380px)`) and the centre (the chamber, the bloc strip, the figures); choosing a list, or a bloc, adds a third column, the side panel (`minmax(360px, 430px)`); a list's panel takes precedence over the bloc editor. **Tool pages** (every other tab) are one full-width panel; choosing a list from a tool page opens the same panel as a drawer from the inline-end edge.

**Desktop (1101px and up).** The lists column and the side panel are sticky (top 100px) and scroll on their own (max height 100vh minus 112px).

**Below 1100px.** One column, same order.

**Phones (760px and below).** The band becomes static and wraps (brand on its own line, tool labels hidden to icons, the election selector occupies its own full-width line); the tools strip sticks to the top as a single sideways-scrolling row whose trailing edge fades over 32px (the fade flips side in right-to-left). The board stacks: chamber, blocs, figures, then the lists; the side panel becomes a full-screen sheet; bloc corridor labels give way to a legend of full bloc names beneath the strip. Gutters tighten to 8px. At 600px two-column field grids stack and what-if rows reflow to question over answer, action beside.

**Rhythm.** A 2/4/6/8/12/16px scale. 8px between controls in a row, 12px between panels, 16px band and page gutters on desktop, 6–8px on phones. Table cells are 5px 8px; panel headers 8px 12px; panel bodies 10px 12px.

**Levels.** Simple, Standard and Expert are one layout. Standard adds votes and the surplus partner to each list's line; change marks appear only after an edit. Every tool is listed at every level: those of the current level first, the rest after a quiet muted label, opening with an offer to switch level in place.

**Direction.** All spacing, borders and positions use logical properties (inline-start/end, block-start/end), so the whole board mirrors between Hebrew and English. The chamber, charts and formulas are pinned left-to-right (formulas as isolated LTR runs) because geometry and arithmetic do not mirror.

## Elevation & Depth

Flat by default. Depth is conveyed by tone (ground, surface, quiet surface, open tint, navy plate) and 1px rules. Only things that float above the board carry a shadow.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 6px 24px rgba(14, 47, 86, .16), 0 1px 3px rgba(14, 47, 86, .10)`; dark `0 8px 28px rgba(0, 0, 0, .5)`): the save-and-share menu, info popovers, the chamber tooltip, the toast.
- **Switch knob** (`0 1px 2px rgba(0,0,0,.25)`): the switch thumb only.

### Named Rules
**The Flat Board Rule.** Panels, tables, figures and corridors never cast a shadow. If it sits on the board, it is ruled, not lifted.

## Shapes

Gently squared. Panels, figures, popovers and toasts take a 6px radius; controls (buttons, inputs, selects, segmented groups, bloc corridors, the majority bar) 5px; ballot slips and candidate rows 4px; the milestone tag 3px; colour swatches and seat-security bars 2px. Chips are full pills (999px) and relax to a 10px radius when their text must wrap. Borders are 1px hairlines; 1.5px (2px large) for a ballot slip's party-coloured edge; 2px for the opened row's bottom rule, the majority milestone (dashed) and the candidate cut-off line (dashed); 2.5px for the active-tab underline. Seats are circles.

## Components

### Buttons
Quiet, flat and squared; the navy fill is reserved for the one decisive action.
- **Shape:** 5px radius, minimum height 32px (28px small), 6px gap for an inline 16px Lucide icon (14px small).
- **Default:** surface fill, strong-rule border, ink text, padding 4px 11px.
- **Hover / Active / Focus:** hover to quiet surface with an axis border; pressed to the open tint; focus is the global 2px focus-blue outline offset 2px. Disabled at 45% opacity.
- **Primary:** navy fill and border, band ink; hover to raised navy.
- **Ghost:** transparent until hover (quiet surface). **Danger:** error-red text only. **Icon-only:** 30px square.
- **Band tools:** transparent on navy, 13.5px, hover to raised navy; labels drop to icons on phones.

### Segmented choice
A choice among options shows the current option: a strong-rule group of buttons split by hairlines, the pressed one filled navy with band ink at 600 weight. On the band it inverts: transparent buttons, white pressed button with navy text. Used for level, language and chamber view.

### Switch
On/off state is always a switch, never a verb button: a 32 x 18px track (switch-off grey, navy when on, focus blue when on in dark) with a white 14px knob that slides along the inline axis in 0.15s.

### Chips
- **Style:** pill, strong-rule border, surface fill, 12.5px.
- **State:** ok (secondary-ink border), no (error-red text, mixed red border), experimental (violet). Coalition chips are larger (13.5px, 3px 10px) and, when included, fill with a 20% party tint and a party-coloured border at 600; excluded ones fade to 50% and strike through.

### Inputs / Fields
- **Style:** surface fill, strong-rule border, 5px radius, 4px 8px padding, 32px high; numeric inputs end-aligned.
- **Focus:** global focus-blue outline; caret in focus blue. Hover lifts the border to axis.
- **Labels:** stacked above, 13px secondary ink, 3px gap. The election selector on the band is reversed: white fill, navy 700 text.

### Panels
- **Corner Style:** 6px. **Background:** surface. **Shadow Strategy:** none (Flat Board Rule). **Border:** 1px rule.
- **Header:** 14px 700 title in an 8px 12px strip ruled off beneath. **Body:** 10px 12px.

### Navigation (band and tools strip)
The band holds brand, election, level, scenario name, undo/redo, start over, save and share (a floating menu), language and theme. Under it the tools strip names every tool on one line as tabs: 13.5px secondary ink at 500, hover to ink, the selected tab 700 ink with a 2.5px navy underline (focus blue in dark). Tools above the current level stay listed in muted 400 after a muted label separated by a hairline.

### Lists Column (signature)
Every list is a row: ballot slip or logo, name (600), an 8px seat bar on one scale for all lists (the official seats as a dashed outline when they differ), a 12px muted line (votes at Standard, share, surplus partner), and the seats (700 18px) with a drawn change mark. Lists that won no seat sit below the hatched threshold rule; their bar shows the share of the threshold reached, with a rust tick at the threshold. A split faction lists its parties beneath its row. Choosing a row opens the list in the side panel; the row takes a navy hairline outline and the open tint.

### Threshold Rule (signature)
A full-width row inside the table: rust 12.5px 600 text on a -45 degree 6px hatch of the two threshold tints, with rust hairlines above and below, and an underlined link to show the folded long tail.

### Bloc Strip (signature)
Blocs are soft regions, not extra bars: each bloc is a 5px-radius corridor filled with a pale tint of its colour, holding a 14px strip of its members' colour pieces (1px gaps) and a 13px label (name, 700 seat count). Corridors grow with their seats (0.3s); hover gives a 45% coloured border, the opened one a full coloured border. A corridor (or "Edit blocs") opens the bloc editor in the side panel: one card per bloc tinted 13% (20% dark) inside a 1px border in its colour, its name an input edited in place, a 26px colour swatch opening a ten-colour palette (plus a free colour), its seats against the majority with a thin meter, and its members as chips (joint lists as a list over its parties, each party movable alone). A chip moves by drag, or by choosing it (2px focus outline, a "Moving …" status) and then "Move here" on a card; the latter is the touch and keyboard path. Cards that can take the chosen chip get a dashed border. A 2px dashed ink milestone marks the majority (61) with a small navy tag.

### Ballot Slip
Party identity as a paper ballot: 58 x 32px (76 x 46px large), near-white paper, a 1.5px border in the party colour, ballot letters 700 12.5px in near-black, or the party's own logo contained inside (on a dark plate when the logo is light).

### Figures
Key numbers as a dense auto-fill grid of 132px-minimum tiles: 12.5px secondary key, 700 15px value, 12.5px muted note. Each opens in place across the full row: navy border, open-tint head, its detail below a hairline.

### Chamber
A 120-seat hemicycle (or blocks), always on the 120-seat scale. Seats fill with party colour (0.35s); when a list is selected the rest dim to .22 (.38 dark). A floating tooltip uses the Pop shadow.

### Session Summary and Banners
"What changed" is a single 13.5px line on surface with a hairline beneath: 700 label, then net moves in ink. Banners are full-width 13.5px strips: warn (amber ground, brown ink), error (pale red), info (quiet surface, dismissible).

### Motion
State moves, it does not perform: switch 0.15s; corridors and colour pieces 0.3s ease; seat fill 0.35s; chart bars 0.4s; the majority bar 0.45s; a changed seat count flashes focus blue once over 1.2s. All of it stops under reduced motion.

## Do's and Don'ts

### Do:
- **Do** draw change in ink at 600 weight with the drawn triangle mark (Neutral Ink Rule).
- **Do** open things where they are: a figure across its grid row, a bloc in the side panel beside the chamber, which redraws as it is edited; a list in the side panel; a tool as its own page.
- **Do** keep data between 12.5px and 15px and rank it by weight and the navy plate.
- **Do** set every number tabular and end-aligned.
- **Do** show party colour only as identity (slip border, seat, wedge, piece, pale region) and bloc membership only as a pale tinted region behind members.
- **Do** use a switch for on/off and a segmented control or selector showing the current option for a choice.
- **Do** use logical properties for every spacing, border and position; pin the chamber, charts and formulas to LTR.
- **Do** remap tokens under `[data-theme="dark"]` rather than adding theme-specific colours, and raise tint and dim levels so regions stay legible in dark.
- **Do** let levels remove columns and controls while every tool stays listed.

### Don't:
- **Don't** colour change, gains or losses green or red, or colour a camp as winning or losing.
- **Don't** use party or bloc colour on buttons, tabs, banners or other chrome.
- **Don't** add a second interface accent beside navy (focus blue is for focus, links and the change flash only).
- **Don't** lift panels, tables, figures or corridors with shadows; shadow is for floating layers only.
- **Don't** let text replace the picture: every tool page leads with its drawing (chambers, bars against the 61 line, seat-change bars), and tables come after it.
- **Don't** draw a bloc as an extra bar; it is a soft region behind its members.
- **Don't** shrink a seat graphic off the 120-seat scale.

### Comparison and table interaction

Lists that ran separately share one comparison against their origin-connected official group,
using the same grouping as Compare. Their individual seat bars and detail headers have no
change badge or official outline. The Overview states the combined and official seats once.
Coalition chips use member-assigned bloc pieces: a party seated outside its list’s bloc has
its own named chip, with those seats removed from the list chip. This remains arithmetic only.
Table names that open details are native buttons with the standard visible focus ring.
Escape restores an uncommitted field first; otherwise it closes the open panel.


### Continuity at the edit (Wave 1)
The phone list sheet keeps a compact, sticky result strip above its scrolling content:
selected seats and delta since the official result, number of lists with changed seats,
and the selected list's assigned bloc totals. For an unassigned list, show the active
grouping's bloc totals and explicitly say it has no assigned bloc. Reuse the live preview;
never add another chamber. Inputs and the strip must fit together at 390×844.

Majority text follows the same pattern beside the chamber, above the bloc strip, and
above the coalition bar: “X / 120 · Y short of 61” or “Y above 61” (including zero above
at 61). Experimental chamber sizes use their own total and majority. Name the sourced
grouping and date, or its description when no date is recorded. Coalition members use
explicit In / Out / Any segmented choices, with constraints and minimal winning results
preserved.

Session changes say “Since official result”; vote, agreement and grouping changes remain
visible even without seat changes. Compare names its baseline and measures share changes
in percentage points. Different sourced groupings are compared under the active scheme;
custom groupings carry no invented official counterpart. Status beside the election says
official, pending gazette, hypothetical, or experimental rule. History and undo/redo name
edits from the existing action log.

The vote-source assumption is visible at every level, read-only in Simple. Threshold
checkpoints use the source-aware exact search: just below, first qualifying vote, just
above. Search qualifiers travel with margins; the crossing sentence opens the threshold
step of the walkthrough. No percentage threshold controls appear for 1949.

### Election context and independent PM ballots

The header is followed by a compact native “About this election” disclosure, with dated,
bilingual, source-labelled events. Publication status occupies this disclosure's summary
and body, replacing the former duplicate warning. List-targeted events also appear inside
the relevant list panel. Context is immutable and remains distinct from scenario history.

The 1996/1999 PM panel sits in the chamber column at every level, including Simple.
Two equally styled neutral bars use the existing muted/surface/rule tokens, logical inline
coordinates and a visible 50%-of-valid-PM-votes marker. Names, votes and percentages are
text; totals/provenance and withdrawn nominees expand in place. 2001 is a separate PM-only
picker option, with no chamber or scenario tools and a direct return to k15. It never
creates a Knesset id or changes k15's result. Aggregate results imply no individual vote flows.
### Scenario references and identity (bounded first pass)

The saved or loaded action-log replay is the marker reference; otherwise it is the official
result. A browser preference can pin markers to the official result. All input glyphs use
`differsFromReference` with stable entity-ID paths. Saving quiets markers while the scenario
keeps its identity. “Since …” and Compare name the saved reference; Compare also offers the
official result explicitly. Candidate order is an input, not just candidate membership.

Scenario identity uses a reserved five-colour palette (violet, slate, ochre, mauve, sage).
The official treatment is the untinted navy shell with neutral frames, outside that palette.
Scenario colour affects only the band, board frame and comparison frames. The existing
status position contains one quiet swatch-and-name chip, with changes expanded on demand;
there is no collapsed count or repeated hypothetical label. Saved choices and the gallery
show identity swatches. Edit glyphs use neutral ink and an outline; hover and keyboard focus
explain the previous value in the active language. Export annotations describe edited inputs;
exports add no scenario footer or extra scenario text (owner revision, 4 November 2026).

`StartFrom` is the shared starting-point selector. This pass connects blocs, agreements,
rules and coalitions to one `startPart` action, replayable and undoable as one step. Blocs
can start as a named pair of empty neutral blocs with every list, party and member unassigned;
the plus button invokes that same blank action. Rules offer sourced era presets; agreements
and coalitions offer meaningful blank states. Saved parts come from same-election logs;
agreements referencing missing lists are refused. Coalition choices now live in the scenario
log, preserving undo, share and saved-part reuse rather than disappearing on navigation.

### Completed parts and Custom preferences

All nine parts share `StartFrom` and the replayable `startPart` action. Votes have no blank
choice. Candidates can start with an empty order for the selected list; new lists default
to zero votes. Identity and candidate starting points are local to the selected list.
Saved parts require the same election and matching target lists; mismatched withdrawals
must be restored before copying votes. No invented presets are offered where no source exists.
Structure restores the source's list topology and agreements; surviving list IDs retain
independently edited names, votes and candidates, with withdrawal ballots reconciled.
Turnout/totals copies electorate, invalid ballots and the valid total, apportioned across
the current lists in their current proportions.

Change values use one bilingual formatter across the scenario chip, glyph tooltips and
export annotations: formatted numbers, names, named agreements and labelled rule values.
Colour changes show a bordered swatch with a text alternative. Unknown/removed entities
receive a translated description, never a machine identifier.

`features.ts` defines the task groups, bilingual labels and preset visibility of tools
and optional sections. The base preset remains a browser preference; Custom stores only
visibility overrides beside it. Neither enters scenario logs or share links. The header
opens the Custom page and identifies Custom's base. Choosing a preset clears overrides.
Hidden tools leave the strip but remain discoverable on the Custom page; collapsed sections
and hidden local sections open in place through “More options”. “Keep this visible” persists
that section without expanding the rest of the interface. Presets preserve the initial
Simple data density; disclosures make additional controls reachable without a level change.

Truth labels are outside visibility configuration: edit glyphs, scenario chip, exact/sampled
qualifiers, publication warnings and data qualifications. Candidate source qualifications
remain beside the candidate display regardless of the editing controls. Registry completeness,
in-place agreement editing, Custom persistence/reset, blank candidates with undo, and human
change values have automated coverage.

Agreement markers sit beside the partner names. Removed agreements have individually named
rows rather than an orphaned cluster of glyphs. Marker labels resolve removed entities from
the reference, and their portal tooltips clamp to the viewport in both text directions.
Rule starting points name the era, method, threshold and inferred candidate cap where relevant;
storage identifiers remain internal in selectors and history.
