# Graphics audit — 4 November 2026

Scope: chamber, BlocBar, ListBars, Compare, Charts, Sensitivity, Walkthrough,
Figures, independent PM results, LocalityMap legends and BlocPanel. This is an
implementation and automated geometry audit, not a measured comprehension study.

## Intended rules, recorded before implementation

Derived from DESIGN.md (visual language, list column, blocs, chamber and motion),
PRODUCT.md and explorables P2/P4/P9:

- Colour identifies a list; a named Expert colour mode can instead identify its
  constituent party or bloc. Colour never expresses gain or loss.
- A pale region expresses bloc membership behind the member marks. Unassigned
  seats remain unassigned, explicitly labelled “No bloc”. Grouping never changes allocation.
- A dashed outline expresses the active reference. Losses live in a separately
  labelled coloured reference chamber, never as extra occupied seats. Saved scenario or official
  result comes from the existing reference preference; structural comparisons use
  connected origins, never a duplicated baseline for each split child.
- Hatching marks below-threshold votes. Having zero seats alone does not imply
  failure to qualify, especially in early elections.
- Solid neutral ink expresses change; gain/loss direction also has text or a
  distinct outline. The evidence persists after animation.
- The neutral edit glyph identifies an edited input, not an allocation gain.
- The labelled 61 marker expresses a majority on a full 120-seat denominator.
  Experimental chamber sizes retain their explicit total and computed majority.
  The independent PM ballot instead uses its explicitly labelled 50% vote marker.
- Names must not collide with marks, other names or the drawing boundary.
  All modes retain equivalent meaning in Hebrew/English, both themes and reduced motion.

P2 supports persistent reference evidence rather than animation alone; P4 supports
keeping explanations beside their marks; P9 supports stable denominators and
question-specific views. These are design inferences from the study, not claims
that its sources experimentally validated this implementation.

## Findings and repairs

| Visual | Violation / evidence | Repair or retained contract |
|---|---|---|
| Chamber, arc | Side rails allowed names to extend into seats. Their vertical spacing depended on distribution; long names and many lists could collide. | All names use a wrapping HTML legend below the fixed drawing. Numeric centre readout stays in the empty centre. |
| Chamber, blocks | A row per list changed the tray height and positions as lists entered. | Fixed 20 × 6 tray, independent of list count; same seat ordering and colour modes as arc. |
| Chamber regions | No-bloc region was transparent; blank grouping removed all regions. Angular region paths excluded the lower halves of endpoint seats. | Neutral no-bloc tint and dotted boundary/key, including blank groupings. Each region is the union of per-row annular sectors. Boundaries use arcs and radial edges; internal shared edges are omitted. No disk unions remain. |
| Chamber identity | List mode used constituent colours for some seats. | List mode always uses the list colour. Constituent colours remain in explicitly selected party mode. |
| Chamber comparison | No persistent drawn gain/loss evidence. | Solid ink gain outlines and a separate, labelled coloured reference hemicycle; dashed outlines there identify losses. Changed-list old → new and signed differences form a compact row, collapsed above five on desktop and visible on phones. No inferred seat-transfer pairing. Structural edits aggregate connected origins once. |
| BlocBar | No reference geometry; padding and gaps distorted small bloc widths. Member colour could differ from chamber list mode. | Dashed reference strip on the same total scale, named reference, zero horizontal gaps/padding in proportional geometry, list-colour pieces and neutral dotted no-bloc corridor. Custom groupings without a counterpart do not invent a reference. |
| ListBars | Dashed baseline alone did not isolate the changed segment. Zero seats was used as a proxy for below threshold. | Persistent neutral delta segment; qualification determines threshold encoding. A list that falls below threshold retains a separate seat-reference track so the vote-threshold denominator is never confused with seats. |
| Compare chambers | Global reference could leak into paired chambers. | Each pair explicitly supplies its comparison reference, using the compatible grouping. |
| Compare bloc bars | Saturated bloc bars replaced the pale-region grammar. | Pale bloc regions and neutral dotted no-bloc region; full denominator, no minimum widths. Existing labelled totals remain. |
| Compare differences / slope | Difference bars already used neutral ink. Dense slope labels could run beyond the bottom. | Retain neutral difference bars. Slope height grows with list count; labels back-propagate from the lower bound; reference endpoint is dashed. |
| Charts | Waffle pattern IDs were reused; threshold-distance view implied a percentage threshold in 1949. | Unique pattern IDs, explicit no-threshold explanation. Add the shared persistent reference/delta drawing above the analytical charts. Vote and seat share retain named, separate denominators. |
| Sensitivity | Selected-list sweep alone was insufficient persistent evidence of all current scenario changes. | Shared origin-aware change drawing accompanies the sweep; existing sampled/verified qualifications remain. |
| Walkthrough | Numerical stages alone did not retain the current scenario’s comparison. | Shared reference/delta drawing stays above the mechanism steps and evidence tables. |
| Figures | Inspected: values, stage totals, threshold and turnout denominators; edited rule glyphs. | Retain their direct numeric encodings and labelled official turnout comparator; no party colour is used for change. Figures are not a separate seat-allocation picture. |
| PM result bars | Inspected in source and existing browser matrix: independent ballots, neutral bars, labelled 50% rule. | Retain; no invented Knesset seat comparison or party colour assigned to PM candidates. |
| LocalityMap legends | Inspected: explicit Winning list / Winning bloc mode and tie/unassigned/no-vote key. | Retain mode-specific categorical legend and warning that national vote edits are not geographically distributed. No scenario delta overlay is fabricated for historical local counts. |
| BlocPanel | Inspected: pale cards, list/party identity swatches, seat meters, neutral input edit glyphs. | Retain; concurrent branch owns the grouping selector and this file was untouched. |
| Standalone export | Moving names outside SVG would remove them from downloads; CSS-only reference outlines would lose styling. | Export appends a bounded two-column legend and includes the separately labelled coloured reference chamber and freezes computed theme ink, fills and dash styles; browser download test checks Meretz 4 / Balad 5 and absence of unresolved CSS tokens. |
| Motion / themes | Region transition lacked its own reduced-motion override. | Disable region, seat and chart transitions under reduced motion; persistent marks use theme ink tokens. |

The starting checkout already had 120 fixed arc positions. The owner's reported
extra-row failure was not reproduced by that arc implementation; the variable
block tray and missing no-bloc treatment were demonstrable. This repair does not
claim to have reproduced an absent historical implementation.

## Verification and reproduction

- `npx tsc -p tsconfig.json --noEmit`.
- `npx vitest run --maxWorkers=2`: 594 tests after merging the controls branch and adding review regressions.
- `npx vite build`, then `PW_PORT=5314 npx playwright test`: 144 browser tests.
- `tests/graphics-cases.ts` retains the exact stress inputs. Owner fixture verifies
  Meretz 4 and Balad 5; additional cases cover five entering small lists, blank
  grouping, partial unassignment, a one-seat list, a list above 60, merge, split,
  1949’s full list set and long names.
- New browser matrix checks every election and stress case in both layouts,
  languages, themes and 1440×900 / 390×844 sizes, with reduced motion and
  all three explicit colour modes. Checks include 120 actual seat
  elements, seat bounds, 16 perimeter samples inside the seat's own region,
  pairwise legend-label non-overlap, legend bounds and page overflow.
- Region containment is sampled around the seat perimeter, not an analytic proof
  over every point. HTML wrapping eliminates SVG text-width estimates.
- Captures: `.backup-scratch/graphics-audit/<case>-<language>-<theme>-<size>.png`;
  80 full-page arc stress screenshots plus 80 chamber block captures. Contact sheets `review-*.png` are disposable inspection
  material. Recreate captures by running the graphics Playwright spec after the
  production build. Retained source, fixture inputs and package-lock.json provide
  the reproduction record; routine logs and renders stay in scratch.
- Shared preview returned `ERR_CONNECTION_REFUSED` twice; browser verification
  used local Playwright Chromium instead.

No engine, dataset, live service, push or merge into main is included. The controls
branch was explicitly merged **from main** during the review follow-up; reference
integration touches its header/list files only where needed.

## Mid-task research amendment

Read main's `docs/research/prior-art-families-and-controls.md`, principle 10 and
“Seat transplantation” / “Animation as evidence”. Its comparison recommendation
is an inference; its Flourish observations do not establish persistent rings or
seat-to-seat identity. Accordingly, loss ghosts were removed from the occupied
chamber before delivery. Current occupancy is exactly 120; the separate baseline
miniature now contains the reference’s 120 coloured seats, with losses outlined. Neutral
gain outlines describe schematic list ordinals. No connector or animation pairs
a lost seat with a gaining list. A static per-list old → new and signed difference
readout accompanies the chamber. Connected-origin merge/split groups receive a
single combined readout rather than invented per-child historical allocations.
The export carries the same labelled coloured reference. Tests check 120 reference
seats, nine loss outlines in the owner case, and Meretz/Balad's signed
readouts with reduced motion enabled.


## Review follow-up to e311201

1. **Reference mismatch reproduced in the owner screenshot.** The summary ignored
   markOfficial. `useActiveReference` now owns reference selection and its label;
   summaries, list details/bars, edit markers, PartEdits, Compare defaults, exports
   and graphics share it. The merged ScenarioSwitcher retains the actual loaded
   checkpoint separately for draft recovery, while its comparison follows the
   active reference. The regression toggles official → loaded → official and checks
   the summary, chamber and Compare baseline each time.
2. **No-bloc members appeared at the end.** `blocDisplayOrder` inserts No bloc
   between the halves of the declared blocs, without reordering those blocs.
   Chamber, reference chamber, BlocBar, reference strip and Compare use this
   physical left-to-right order in Hebrew and English; 61 counts from the left.
3. **Jagged region geometry.** `annularRegions` derives each row’s first/last
   member angle ± half the row pitch, between radial midpoints. Its fill is the
   union of those annular sectors; its outline omits shared internal arcs.
   Borders consist of concentric arcs and radial edges, with no padded disks.
4. **Uninformative empty baseline grid.** Replaced by the coloured reference
   hemicycle, at roughly 30% size, labelled with the active reference. Lost seats
   are outlined there; current gains remain outlined in the main chamber. Each
   diagram has its own 120 seats. No seat-transfer connector is drawn.
5. **Repeated captions and jargon.** One short line explains gains and names the
   small chamber; further explanation is in (i). No bloc is a normal legend swatch.
6. **Duplicated list panel.** Under-chamber change evidence uses compact changed
   rows. More than five rows collapse on desktop; phones show every row.
7. **Controls integration.** Merged main at 352f3d5 (merge cc0622e), retaining both
   branches. Removed the original grouping and colour selects at source, deleted
   the CSS hiding rule, and changed the graphics matrix to drive BoardChoices.
   Existing Grouping tests already use its buttons; grep found no remaining tests
   driving either removed native selector. Matrix assertions prohibit duplicates.

Review verification retains all 26 elections and all stress inputs in both
languages/themes/viewport sizes and both layouts. The 160 captures were regenerated
and inspected, including the owner case at full size. Shared preview was available
for this follow-up; it confirmed the fixed owner state in the actual board.


The added closed-disclosure visibility assertion caught a missing closing media
brace during conflict resolution: desktop comparison/ordering rules had become
nested inside the controls branch’s phone/tablet media rule. Restored that boundary
and added an explicit closed-disclosure hiding rule. Assertions now check collapsed
desktop rows, visible phone rows, the miniature width ratio and physical strip order.

The full merged suite also exposed an election-picker automation race: closing
the dialog starts an async election load, but `choose()` previously returned at
close. With k24's data delayed, it returned while the committed picker still said
k26. The helper now waits for the committed `data-value` before a test opens a list.
A regression exercises delayed data and immediate list opening; the deliberate
failed-load test drives the refusal directly instead of awaiting success.


## Small end-bloc follow-up after main 3fe06a1

Merged main first (fast-forward), including the families work. Read the families
branch’s 1988 capture: Haredi’s 13 seats were correctly allocated, but stroking
radial row edges made the region’s near-horizontal end steps look like stray
lines through and between seats.

Removed region outline rendering and outline-path generation altogether, in both
the current and reference chambers. Regions are fill-only annular row sectors.
Visual review rejected narrow cut-out aisles: their row steps echoed the unwanted
lines. Adjacent regions now meet as uninterrupted pale fills, without strokes or
cut-out seams. Seats never move and remain inside their own region.
The seat gain/loss outlines remain distinct from region fills.

Added `small-first-bloc-1988` using the real Haredi family grouping and
`small-last-bloc-1988` with the declared bloc order reversed. Both assert that the
end group has exactly 13 seats. They participate in the full Hebrew/English ×
light/dark × desktop/phone matrix and both chamber layouts. Browser assertions
reject any stroked region or separate outline path, while retaining the 120-seat,
containment, label bounds and overflow checks. New captures use those case names
under `.backup-scratch/graphics-audit/` (32 added arc/block captures).


Final verification for this follow-up: TypeScript and production build; 636 unit
checks and 158 browser checks, including all prior elections/stress cases and the
two new end-bloc fixtures. The matrix now writes 192 captures (160 prior plus 32
new), with 120 current seats, fill-only regions, containment and label/viewport
invariants retained. The new first/last cases were visually inspected in both
languages, themes, sizes and layouts.
