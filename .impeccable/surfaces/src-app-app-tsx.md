---
version: 1
slug: "src-app-app-tsx"
primary_target: "src/app/App.tsx"
related_targets: []
---

# Main explorer screen

Scope: the single working screen of the explorer (header, change summary, bloc strip, lists table with in-place list detail, chamber, figures, tools). Mode: Operate.

Audience and job: voters, students and specialists change an election and read the consequences; everything is in view at the chosen level, with no menus between the user and a feature (owner, 4 Nov 2026). Levels thin the same screen; they never move features behind clicks. Controls appear only where they mean something.

## Direction contract

THESIS: The official result is the opening price and the user's edits are the session. Every list is a ruled row carrying its numbers, opened in place for its controls. Refuses the card-grid dashboard with tabs at the bottom and a separate detail column.

OWN-WORLD: Navy shell band (#0e2f56) over a cool grey ground and white ruled table surfaces; one workhorse face (IBM Plex Sans Hebrew) with tabular figures; one data type size, rank carried by weight; the selected row's header reversed onto a navy plate; the threshold a hatched rule inside the table; blocs as pale tinted corridors and chamber wedges; change in neutral ink with drawn up/down marks, never green or red for a camp.

STORY: The visitor reads the result at a glance (bloc strip, chamber, table), changes a list in its own row and watches seats move everywhere live, finds every tool by name in the tools strip under the band (the open tool's panel sits in the side column), and reads "What changed" as a short net summary of the session.

FIRST VIEWPORT: 52px navy band (name, election, level, scenario, undo/redo, save/share, language, theme); under it a one-line tools strip naming every tool (this level's first, the rest after a quiet label); a one-line "What changed" summary only once edited; the bloc strip with its grouping selector and a 61 milestone; below, two columns: the lists table (about 56%) and a sticky side column (own scroll, fade cue) with the chamber, figure tiles that open in place, and the open tool's panel. Phone: one column in the same order, the band static, the tools strip a single sideways-scrolling row with a faded edge, the table showing list, share, seats and change. (Amended after the finish review: 12 tool names cannot fit one line in the side column, so the names moved to the strip.)

FORM: Market Board (Tel Aviv Stock Exchange boards and business-press market tables), position 6 of 7 on the ordered list of round 2. seed:28783aa7ffb1730e

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Raises carried from the declined challengers
- Every list that ran is a row (no Main/All filter hiding the rest); the long tail is folded below the threshold rule, one click to open.
- Each fact appears once, where it is used.
- One data type size; rank by weight and the reversed plate.
- Every seat graphic keeps the 120-seat scale.
- The selected list lights up in every view while the rest dim.
- Dragging a vote slider recomputes live.

## Unresolved
- Demographic groups: people-based model pending its evidence verdict (solid vs speculative setting).
