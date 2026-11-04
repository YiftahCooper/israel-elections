# Prior art: tools that lead to understanding through visuals

Research date: 4 November 2026. Scope: interaction design for this repository, not a ranking of electoral systems or a redesign of its arithmetic. Read `README.md`, `PRODUCT.md`, `DESIGN.md` and the components named below. **Recommendation: extend the board's existing live-edit model into every tool, especially the allocation walkthrough and turnout. Preserve its exact engine, neutral identity colours, historical qualifications and reversible actions.**

“Every tool leads to a visual” should mean **an input produces an inspectable visual consequence in the same task**, with an explanation of what changed and what did not. It does not mean decorating every form with another chamber. An import needs a visual validation/preview; sharing needs the visual being shared; a rule edit needs a result and a mechanism. Source documents and exact tables remain essential evidence.

## Method and evidence boundaries

Best means useful to this app on five criteria: a short action-to-feedback loop; a visible causal mechanism; beginner entry with deeper inspection; a readable phone adaptation; honest assumptions. The ten core works below were opened at 1440 × 1000 and 390 × 844 CSS pixels in Chromium using Playwright. Phone means a narrow viewport, **not a physical touch-device test**. Dragging used mouse events, including at phone size; no claim of touch or screen-reader validation is made. These are expert observations, not an experiment with Israeli voters.

Evidence labels throughout:

- **O**: observed by operating the page or directly inspecting this app's source/rendered output.
- **D**: documented by the creator or a research paper, read through Jina; not necessarily reproduced in the browser.
- **I**: inference/recommendation for this app; anticipated impact, not measured learning improvement.
- **U**: unresolved or access-limited.

The scratch evidence root is `.backup-scratch/prior-art/explorables/` (already gitignored). Paths below are relative to that root. Screenshots are local working evidence, deliberately absent from this commit; the URLs and interaction recipes are the durable reproduction record. Reproduce with `npm install`, `npx vite build`, `npx vite preview --port 5343`; use the repository's installed Playwright/Chromium and the two viewport sizes above. Browser and direct HTTP requests used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Jina's tools do not expose an upstream User-Agent override; that header cannot be attested for Jina-managed fetching. No email was submitted, no English Wikipedia page used or cited, and no paywall or security checkpoint bypassed.

Jina `search_web` supplied discovery, `read_url` supplied primary passages, and `capture_screenshot_url` successfully captured Case's opening screen (temporary service URL; local Playwright captures below are the retained evidence). `extract_pdf` was attempted on both the PhET paper and Robertson et al.; it rejected their hosts as outside its allowed PDF sources. `read_url` successfully extracted their text instead. Observable's notebook was blocked by a Vercel checkpoint in both reader/browser; public Observable documentation was readable. Consequently Observable is supplemental documented evidence, not an operated notebook. The selection covers ten interactive works plus published guidance; it is not an exhaustive review of every publisher named in the brief.

## Ten principles to adopt, in priority order

Effort is comparative implementation scope, including bilingual copy, phone layout and appropriate verification: **S** = one existing component/pattern; **M** = coordinated UI components; **L** = new explanatory representation plus engine-trace integration. No calendar estimates without implementation discovery. Impact is a design hypothesis.

### P1. Keep the changed input and its consequence in one view

**Evidence:** O1 Victor's scrubbable tax changes its dependent analysis immediately; O3 Distill keeps sliders directly below the trajectory; O9 Desmos keeps the parameter and line linked. The app already does this on desktop through `ListDetail.tsx`'s `LiveSlider` and `previewAction` (O11). Its phone side panel is a full-screen sheet, so the overview chamber is no longer the persistent feedback surface (O11/source).

**I — adopt:** Put a compact result strip in the vote editor: selected list's seats, changed-list deltas, and the relevant bloc's distance to 61. Keep the vote input and this strip simultaneously visible at 390px. Reuse the scenario preview; commit once on release as today. The full chamber remains on Overview. Extend the same pattern to `Turnout.tsx`, `Panels.tsx`'s Rules, and agreement controls in `Structure.tsx`.

**Impact high / effort M.** Proof task: change votes on a phone and identify the seat consequence without dismissing the editor. Confidence high that co-visibility is missing; whether the compact strip is sufficient needs testing.

### P2. Keep the baseline visible; transient animation is supplementary

**Evidence:** O3 Distill leaves a trajectory trace; O10 OWID changes representations while retaining entity choices. O11 Compare already has paired chambers and signed difference bars. D13 Robertson et al.'s scatterplot study found static traces/small multiples stronger for analysis than animation. That is counterevidence to making animation the main explanation, not proof that every seat transition animation is harmful.

**I — adopt:** Keep the official-result dashed seat-bar outline from `ListBars.tsx`; add an explicit before/current key wherever reused. In `Compare.tsx`, lead with the existing changed-list bars, then the paired chambers. Offer “changes only / all lists” as a stateful choice. Keep stable list ordering while editing; permit explicit re-sort after the gesture. Preserve exact zero-change states. A neutral brief highlight can draw attention, but the delta must remain after it fades.

**Impact high / effort S–M.** Proof task: after a highlight disappears, identify every net seat change and which scenario is the baseline. Confidence high on persistent differences, medium on the preferred ordering.

### P3. Draw the mechanism, not just the final answer

**Evidence:** O4/D4 Setosa turns errors into literal squares and then exposes the objective they sum to. O8 PhET lets the learner see a plank respond to weight position and switch on force vectors. O3 Distill's slider changes a path through a landscape. These reveal intermediate structure rather than only a score.

**I — adopt:** Rebuild the presentation of `Walkthrough.tsx` around a persistent vote-to-seat drawing backed by `AllocationResult`: threshold gate → qualifying-vote pool → whole-quota seats → remainder competition → pair division → final 120. The quota step currently contains only a formula and explanation; the remaining-seat steps primarily use tables (O11). Show a fixed 120-position seat tray, leaving unallocated positions outlined. Draw quotient comparisons as labelled horizontal tracks; do not imply raw votes physically migrate through a surplus agreement. Keep the current exact table as the inspectable evidence beneath the picture. Each historical method must use its actual trace and vocabulary.

**Impact very high / effort L.** Proof task: explain why the next seat went to this unit, including the second allocation inside an agreement. Confidence high on the presentation gap, medium on the proposed visual grammar until prototyped.

### P4. Link a short explanation to the exact marks it explains

**Evidence:** O2 Case draws the voter-to-candidate connection and labels the chosen candidate in the same widget. O3 Distill labels Starting Point, Solution and Optimum on the plot. O8 PhET's mass labels sit at the objects. Victor's reactive paragraph demonstrates that explanation itself can depend on the reader's state (O1).

**I — adopt:** In `Walkthrough.tsx`, select a quotient bar to expose its numerator and denominator at that bar; label the winner there. In `Hemicycle.tsx`, `ListBars.tsx`, `Candidates.tsx` and `Blocs.tsx`, share a selected-list identity so selecting a list highlights its seats, candidate cutoff and bloc membership. Add one computed sentence at the changed marks: “This list passed the threshold; qualifying votes and all allocations were recalculated.” If votes changed but seats did not, say so and show distance to the next relevant event.

**Impact high / effort M.** Proof task: point to both the changed quantity and the mark carrying its explanation. Confidence medium; linked selection needs usability checking with crowded labels.

### P5. Introduce one question at a time; layer representations as well as controls

**Evidence:** O2/D2 Case begins with one voter/two candidates, then a crowd, a spoiler, alternative ballots and a sandbox. O8/D8 PhET separates Intro, Balance Lab and Game. D12 Datawrapper recommends simple views before complex ones. The project already provides Simple/Standard/Expert without changing engines (O11).

**I — adopt:** Simple walkthrough: qualifying/nonqualifying groups, counted seats, a single next-seat contest with optional “show the calculation”. Standard: all contestants and agreements. Expert: fractions, tie/lottery state and era-specific rules. Keep tools discoverable exactly as PRODUCT requires; do not equate progressive explanation with hiding the tool's existence. Give Simple one question in view, not an Expert table with fewer columns.

**Impact high / effort M.** Proof task: a beginner explains threshold vs allocation without needing the quotient formula; an expert reaches the exact values without changing scenario. Confidence medium; PhET's physics results do not establish electoral learning outcomes.

### P6. Make discontinuities explorable and name the balancing assumption

**Evidence:** O2/D2 Case uses counterexamples to show that a small change can reverse an outcome. O9/D9 Desmos lets users control parameter interval/step and coordinate expressions. O11 the app's vote slider crosses discrete outcomes; its source determines whether other votes shrink, transfer or new voters are added. `Sensitivity.tsx` already plots a vote sweep but threshold sensitivity is tabular.

**I — adopt:** In `ListDetail.tsx`, add labelled “just below / at crossing / just above” checkpoints tied to the chosen vote source. In `Sensitivity.tsx`, put a current-input marker on the seat staircase; selecting an interval previews its result and opens the relevant count step. Draw sampled coverage differently from verified event boundaries. Never call a sampled point the exact smallest change. Integer seat counts must jump, not tween through 4.6 seats. A slider's coarse step must not be the only way to reach a one-vote boundary.

**Impact high / effort M–L.** Proof task: show why two identical-looking vote increases can give different results under different sources. Confidence high on the need, medium on efficient exhaustive breakpoint computation; no new engine guarantee is assumed.

### P7. Start exploration with small, reversible challenges

**Evidence:** D8 PhET explicitly cautions that telling students simply to play is not sufficient motivation; its research also warns about over-prescriptive guidance. O2/D2 Case supplies constrained experiments; O11 `WhatIf.tsx` already generates scenario previews from real actions against the historical baseline.

**I — adopt:** Extend `WhatIf.tsx` and `ScenarioGallery.tsx` with optional tasks: “Can this list enter without new voters?”, “Can an agreement change seats when both partners' votes stay fixed?”, “Does proportionally higher turnout necessarily change the seats?” Each opens the relevant visual with its input highlighted and lets the reader try before revealing the engine result. Show the preset's assumptions and that it starts from the historical result, not the user's edited scenario. Select examples across parties/eras by transparent criteria, not a preferred political outcome.

**Impact medium–high / effort S–M.** Proof task: a first-time visitor can pose and test a question, then undo it. Confidence medium: motivation and neutrality need user testing.

### P8. Preview structural changes as a visible transformation with honest lineage

**Evidence:** O11 Merge already previews exact net changes before Apply; Compare already groups merged/split origins. O7/D7 Guardian compares systems with repeated unit-seat displays and nearby method descriptions. O2 Case uses a concrete intervention to explain a structural change.

**I — adopt:** In `Structure.tsx` put selected source-list vote bars above the retained vote bar(s), threshold marker(s), then the existing seat-difference preview. A retention control moves the amount retained and a labelled abstention remainder. Splitting exposes each new list against the same threshold. A slim identity connector may represent actual list lineage; **never invent seat-transfer ribbons between gaining and losing parties**. Agreement switches should show compact net-change marks even when there is no seat effect, and an inline paired-quotient comparison when requested.

**Impact high / effort M.** Proof task: distinguish pooling votes, changing candidate order, and changing only an agreement. Confidence high that the current preview is a useful foundation, medium on the added transformation layout.

### P9. Choose the visual by the question, retaining scale and denominator

**Evidence:** D12 Datawrapper distinguishes shares, changes, flows and geography, warning that circle sections are harder to compare than bars. D14 its cartogram guidance explicitly trades geographic recognition against population representation. O7/D7 Guardian's alternatives include different total seat counts. O10/D10 OWID gives chart/map/table representations of one selection.

**I — adopt:** Chamber (`Hemicycle.tsx`) for composition and selected candidates; common-baseline list bars for comparing totals; signed bars for changes; the bloc corridor plus explicit 61 marker for majority; a staircase for threshold sensitivity; geography for location. Preserve PRODUCT's pale bloc regions behind members rather than replacing them with more saturated bloc bars. Do not rescale a 120-seat composition to its largest party. In `LocalityMap.tsx`, keep historical-locality context on the map; national edits are not geographically measured. Equal-radius locality dots are not voter weights. Add a selected-locality vote-share bar and, only if needed for the task, a separately labelled vote-weighted symbol mode; do not replace the map with an unexplained cartogram.

**Impact high / effort S for chart roles, M for map additions.** Proof task: distinguish “many places” from “many voters” and “share of valid votes” from “share of qualifying votes”. Confidence high on denominator requirements, medium on whether a second map encoding earns its complexity.

### P10. Treat a scenario visual as a reproducible argument

**Evidence:** O10/D10 OWID places data sources and share/download beside the visual; its documented design retains selection across representations. D15 Observable expresses dependencies explicitly and recomputes dependent cells. O11 the project has replayable action logs, saved/shareable scenarios, provenance and provisional-result warnings.

**I — adopt:** `Scenarios.tsx`, `TopBar.tsx` and `ChangeSummary.tsx` should present a compact scenario visual carrying election, historical/experimental mode, baseline, vote-source assumption and relevant data qualification. Save/share should preview that actual state; restoring should recover the same result and selected view where supported. Avoid a separate editable chart-state model that can drift from `scenario`/allocation. Label delayed analysis as pending; discard results belonging to an old scenario. Exact calculations and sampled searches need distinct claims even in a beautiful export.

**Impact high for trust / effort M.** Proof task: open a shared scenario in a fresh browser and recover the same inputs, seat totals and qualifications. Confidence high on reproducibility, medium on exactly which view state should be encoded.

## Concrete screen sketches (proposals, not implemented)

### 1. Overview and vote editor

Keep the market board: list bars at inline-start, chamber in the centre, selected list at inline-end; mirror the shell in Hebrew without mirroring arithmetic. Under the selected list's vote input, draw its vote bar reaching toward the threshold and, when qualified, a local seat staircase. Dashed marks show the official baseline. The source selector sits immediately above the graphic: “proportionally from other lists”, “from this list”, or “new voters”, whichever the level supports. Under the graphic, persistent signed deltas show affected lists, even those whose own vote count was not edited. Selecting a delta highlights the same list in the chamber. Blocs remain pale corridors behind members with an explicit majority marker.

On a phone the editor sheet begins with a compact result strip, then the input; candidates follow below. The reader can drag, see the result, and undo without closing the sheet. If nothing changes, the strip says “No seat changed” and shows the next known event rather than pretending the control failed. Threshold distance and exact breakpoint are different labels, because new votes also move the threshold in votes.

### 2. How seats were allocated

The top half is a persistent 120-position seat tray plus one active mechanism. At threshold, vote bars are tested against a labelled gate; excluded votes remain visible in a hatched group, not erased. At quota, a qualifying-vote band is partitioned into quota-sized units, with an explicit remainder; a caption states which denominator is being used. At whole-quota allocation, filled positions appear by list and unallocated positions remain outlines. Next-seat steps show labelled quotient bars, current seats and the next denominator; the winning unit gets an outline and one new filled position. An agreement opens a clearly bounded second contest for its internal division. Exact fractions and the existing table remain one disclosure away.

Start, back, next and a scrub timeline work without playback. The user may pause and inspect every state. “Why this seat?” from another tool jumps to the relevant step. Historical methods, candidate caps and lottery ties retain their actual semantics; a provisional winner is visibly provisional. No animated token claims that an agreement literally transfers surplus ballots between parties.

### 3. Merge & split and agreements

Start with the existing task selector and list chips. Choosing Labor and Meretz draws their two historical vote bars as inputs and a combined bar as the proposed joint list, with a threshold rule shared across the vote scale. A retention slider shortens the combined bar and enlarges a hatched abstention remainder, labelled as an assumption. The next band is the existing exact seat-change preview, including parties outside the proposed merger. The apply button stays adjacent to it. Candidate ordering is an expandable consequence preview, showing who occupies the cutoff; it must not imply the ordering itself changes seat totals.

Split reverses this arrangement: one source bar, multiple named result bars each facing its own threshold. “Move a constituent party to another bloc” changes the pale grouping region; “run as separate lists” changes the allocation. Show those as distinct operations. An agreement uses a bracket between the still-separate lists and an optional two-stage quotient drawing, not a merged vote bar.

### 4. Compare

Begin with named scenario selectors and the changed-list difference bars already present, on one symmetric signed axis with numeric labels. A persistent baseline sentence says exactly what is held constant. Below, paired 120-seat chambers keep the same list order; selecting a changed row highlights the relevant lists in both. “All lists” exposes the full paired values/table and slope chart. New/split/merged identities show their origin grouping rather than disappearing from one side. Entrants/leavers appear as candidate-cutoff rows only where roster evidence supports them.

On phones, use aligned before/after list rows with signed deltas above the two stacked chambers; do not force the reader to memorize the first chamber. Preserve the existing caveat that net seat changes do not identify a unique donor for each gained seat. A changed grouping is visibly different from changed votes.

### 5. Turnout, with a route to the locality map

Above the existing group/preference fields, draw a population strip: registered electorate → current voters → additional voters → valid additional votes distributed to lists. Changing hypothetical turnout updates those quantities and a compact national seat-difference preview before Apply. Current turnout remains a baseline tick, the invalid fraction is a labelled hatch, and party preference shares visibly sum to 100% after normalization. A selected assumption stays editable beside its marks.

If the group comes from localities, show a miniature selection map plus its measured historical totals. Link to the full `LocalityMap.tsx` view to inspect places. Keep “historical local votes; scenario grouping” on that visual. Do not colour localities as though national added voters had been measured there. Warn at the assumption itself that local-area composition does not establish how each person votes. The present implementation only models turnout increases; keep that restriction explicit rather than drawing unsupported negative additional voters.

## Per-work inspection notes and reproduction recipes

These records distinguish the interaction actually exercised from deeper mechanisms described in the article. A rendered control is not proof that its whole model was tested. All core works have opening desktop/phone captures named `<id>-desktop.png` and `<id>-phone.png`; the more useful interaction captures are specified below. Load the canonical source URL in the source ledger, then follow the recipe.

### O1 / D1 — Bret Victor, Explorable Explanations (2011; postscript 2024)

**Change/consequence, observed:** Dragged the underlined tax in the Proposition 21 reactive paragraph from $18 to $32 on desktop, then back on the narrow viewport. Dependent revenue, total budget and the paragraph's conclusion changed together. See `victor-adjusted-desktop.png`, `victor-adjusted-phone.png`. The opening capture is less useful than the scrolled interaction capture.

**Layering/explanation:** The editable number is embedded in the claim it qualifies. The page separately introduces reactive documents, explorable examples and contextual information. Its filter example documents multiple coordinated representations; the filter itself was read, not exhaustively exercised. The proposition's model is explicitly illustrative, not a verified policy analysis.

**Generalises to:** Make assumptions inspectable where conclusions are read (P1, P4, P10). Do not adopt invisible drag-only text: expose an ordinary input/keyboard alternative and discoverable affordance. A live paragraph is useful but would not alone satisfy this project's visual requirement; pair it with the relevant bars or seats.

### O2 / D2 — Nicky Case, To Build a Better Ballot (2016)

**Change/consequence, observed:** Dragged inside the first voter/candidate canvas, in its `play/model1.html` iframe, at both viewport sizes. A line connects the voter to the closest candidate and the “votes for” label identifies the current choice. See `case-drag-desktop.png`, `case-drag-phone.png`. This recipe tests the first model; the crowd, alternative voting methods and final sandbox were inspected through article text, not all mechanically validated.

**Layering/explanation:** One voter precedes a crowd; the spoiler intervention precedes alternative ballots; counterexamples precede unrestricted exploration. Meaningful shapes and a linking line give local explanation. The narrow screenshot visibly crops large text and the model's surrounding layout: a strong teaching sequence does not establish a good phone implementation.

**Generalises to:** One question per experiment, explicit manipulation cues, counterexample presets (P4–P7). Borrow the teaching form, not US-specific political assertions, dated examples, a normative ranking of systems, or a spatial-preference model as though it described Israeli voters.

### O3 / D3 — Gabriel Goh / Distill, Why Momentum Really Works (2017)

**Change/consequence, observed:** Dragged the first SVG slider handle; desktop caption changed to step-size 0.0046 and the optimization trajectory changed. Repeated a reverse drag at 390px. See `distill-adjusted-desktop.png`, `distill-adjusted-phone.png`. No native HTML range input is used for this control.

**Layering/explanation:** The hero supplies parameter names, contour context, persistent path and direct labels. Later sections develop the mathematical explanation and decomposed views. This is deeper technical reading, not evidence that first-time voters should see equations at entry.

**Generalises to:** Keep a trace/reference and show a mechanism in a stable frame (P1–P4). Distill's continuous path is not a license to interpolate integer seats. Narrow rendering was exercised, but there was no full mobile reading-comprehension test.

### O4 / D4 — Setosa, Ordinary Least Squares Regression Explained Visually

**Change/consequence, observed:** Dragged a haloed sample point on desktop; the displayed fitted expression changed from `0.00 + 1.00 * hand size` to `5.00 + 0.81 * hand size`. Baseline desktop/phone screenshots: `setosa-desktop.png`, `setosa-phone.png`. Initial follow-up attempts encountered unstable SVG marks and a changing radius selector. A later attempt scrolled the point halo into view and successfully dragged it at both sizes: `setosa-drag-desktop.png`, `setosa-drag-phone.png`; the resulting fitted expression begins `3.36 + …`. The opening captures are baselines, not manipulated states.

**Layering/explanation:** Dials tune scalar parameters; halos cue draggable points. The text then exposes error as the distance to the line and squared error as actual squares, followed by a two-variable plane. That deeper sequence is documented/read; the desktop point experiment was the operated portion.

**Generalises to:** Reveal what the objective or intermediate quantity *means* geometrically (P3, P5). For allocation, the parallel is qualifying votes, quota, quotient and seat tray, not a decorative error square. The narrow layout and the failed second action are reasons to require reliable non-drag controls.

### O5 / D5 — Bartosz Ciechanowski, Gears (2020)

**Change/consequence, observed:** Dragged the first custom `.slider_knob` controlling fan speed on desktop and narrow viewport. See `gears-adjusted-desktop.png`, `gears-adjusted-phone.png`: one local control is directly under its object, and a pause affordance is adjacent. The phone screenshot keeps fan and slider together.

**Layering/explanation:** The article begins with rotation before torque and tooth geometry. D5 its later disc example lets the reader move time backward/forward and leaves traces, with flattened arcs exposing why different radii travel different distances. Those later mechanisms were read; they are not claimed as operated here. A global pause is documented on the page.

**Generalises to:** Keep the object stable while progressively exposing forces/structure; make playback pausable and reversible (P1, P3, P5). Do not import mechanical realism or 3D rendering costs where a 2D quotient plot explains the count better.

### O6 / D6 — The Pudding / Matt Daniels, How Music Taste Evolved (2017)

**Change/consequence, observed:** Entered through “PLAY 1997”; the ranking display advanced from the May 1997 state to July, changing the #1 song, line traces and labels. Separate attempts to click the small Play control were intercepted by the opening overlay; entry through the large invitation worked. See `pudding-play-desktop.png`, `pudding-play-phone.png`. A year change was attempted but not verified; no successful audio playback is claimed.

**Layering/explanation:** A familiar question and start year invite participation; lines, dates and song labels explain changing ranks in the same field. The page offers a year index and pause/play, with methodology in the article. Reader-extracted text and the rendered starting view differed in some time/title details; use the browser capture for operated-state claims and do not infer the site's current dataset from the extracted method alone.

**Generalises to:** Optional guided entry and persistent trajectories (P2, P7). Avoid an overlay that obscures controls, sound as required explanation, or a compulsory long animated tour of historical elections.

### O7 / D7 — The Guardian, How could Great Britain look under proportional representation? (30 September 2026)

**Change/consequence:** The rendered piece offers constituency/postcode search and repeated system comparisons. Typing “Oxford” returned “Oxford East” and “Oxford West and Abingdon”. Initial pointer selection was obstructed; initial screenshots show a cookie overlay and are **not evidence of a completed selection**. After dismissing the ordinary cookie dialogue with “No, thank you” in its iframe, selecting Oxford East on desktop and Oxford West and Abingdon at 390px succeeded. The local explanation and representation cards updated to the constituency. See `guardian-selected-desktop.png`, `guardian-selected-phone.png`; earlier `guardian-area-*.png` captures show the obstruction. No access-control bypass was used.

**Layering/explanation, read:** National summaries precede geographic comparisons and local lookup; repeated seat units use “1 square = 1 seat”, and method descriptions explain how each electoral system works. D7 methodology states constituency assumptions, exclusions and that AMS has a different total seat count from the other models. Those are modelling scenarios, not interchangeable factual outcomes.

**Generalises to:** Repeat a consistent unit/scale, let users locate a personally meaningful case, put assumptions at the comparison (P8–P10). This is one newsroom example, not independent corroboration from Guardian, NYT, FT, Reuters and ABC. Searches for ABC/FT did not produce a stronger operated fit during this pass; paywalled work was not pursued.

### O8 / D8 — PhET, Balancing Act, plus its research/design guidance

**Change/consequence, observed:** Entered Intro, dragged a 5kg extinguisher onto the plank, changed the support switch and enabled force display, using screenshot-derived coordinates because the rendered SVG supplied no useful accessible locators in this session. See `phet-intro-desktop.png`, `phet-force-desktop.png`, `phet-force-phone.png`. Narrow rendering was captured after the manipulation; independent phone manipulation was not verified. This older sim letterboxes/scales the activity at phone size rather than becoming a native phone form.

**Layering/explanation:** Intro / Balance Lab / Game provide increasing task freedom. Mass, forces, position labels and plank response keep the explanation attached to the objects; switches reveal additional measurement tools. D8 the research page describes individual think-aloud interviews in simulation design. Adams's paper discusses minimal guidance, multiple representations and how excessive guidance can narrow exploration.

**Generalises to:** Design constrained affordances and optional challenges, then test them with actual learners (P3, P5, P7). Physics-education evidence does not quantify benefits for election literacy; avoid claims such as “PhET proves voters will understand our app”.

### O9 / D9 — Desmos Graphing Calculator and slider guidance

**Change/consequence, observed:** Typed `y=mx+b`, accepted “all” sliders, then changed slope with the keyboard on desktop and intercept at 390px. The line and parameter expressions updated together. See `desmos-model-desktop.png`, `desmos-adjusted-desktop.png`, `desmos-adjusted-phone.png`.

**Layering/explanation:** A compact expression becomes controllable only when a free parameter needs it. The graph remains the same object as precision, interval and step are exposed. D9 shared variables may drive multiple expressions; endpoints and step sizes can be adjusted. Its general algebra editor is itself expert-oriented.

**Generalises to:** One model, multiple synchronized views; both exact entry and coarse exploration (P1, P6). Do not make voters enter formulas or political axes before they can ask a question. No claim that GeoGebra was separately operated.

### O10 / D10 — Our World in Data Grapher, Life expectancy; redesign guidance

**Change/consequence, observed:** Opened with Israel/UK/US selected, switched Line → Bar on desktop and Table on a narrow viewport. Entity choices persisted, direct value labels appeared, and source/unit context stayed near the display. See `owid-bar-desktop.png`, `owid-table-phone.png` plus baseline captures. This tests representation switching, not every selector or download/export path.

**Layering/explanation:** A readable default exposes chart/map/table and relevant controls; the source and metric definition accompany the graph. D10 the redesign describes small multiples and aligned scales as options. The current browser UI uses Line/Bar tabs rather than only the older documentation's generic Chart label: an explicit version-fit distinction.

**Generalises to:** Alternate views of the same state, stable entity selection, visible definitions/sources and reproducible sharing (P2, P9, P10). Do not turn every tool into a generic chart configurator or mistake the number of geographic marks for a population statistic.

## What this project already does well (O11)

- The exact allocation model is separated from the interface. `LiveSlider` previews while dragging and commits once; undo is a model operation, not a cosmetic reset.
- `ListBars.tsx` already supplies a historical reference outline and a threshold-specific visual for lists outside the Knesset. The chamber gives immediate composition, not only a numeric table.
- `Structure.tsx` already computes a pre-apply preview on a copy of the scenario; it includes indirect changes to other lists. Do not replace that with hand-authored scenario headlines.
- `Compare.tsx` already offers paired chambers, bloc comparisons, signed seat bars, candidate entries/exits, exact tables and an explicit caveat against invented seat donors. Improve hierarchy and mobile context rather than rebuilding it wholesale.
- `WhatIf.tsx` uses ordinary replayable actions and engine-computed previews. `ChangeSummary.tsx` keeps a persistent session consequence instead of relying solely on a flash.
- Blocs are election-specific sourced groupings or clearly user-defined ones; `Blocs.tsx` can represent constituent parties separately. Grouping is not an electoral allocation rule.
- Tool names remain discoverable across levels. Hebrew RTL, equal English support, neutral change ink, party identity colours and light/dark tokens are strong constraints to retain.
- The locality map explicitly distinguishes historical local votes from current scenario grouping and national edits. Provenance and the 2026 final-publication qualification are visible. README's pending gazette qualification must travel with any “official result” visual/export where relevant.

## What to avoid

1. **A chamber on every page as decoration.** Show the mechanism answering the page's question; keep a compact result reference only when useful.
2. **Animation as the only evidence.** Users should not need visual memory, timed playback or motion tolerance to compare results. Retain static deltas and step controls.
3. **Smoothly interpolated seats, invented vote flows, or unique seat donors.** Net changes are exact; a transfer narrative may not be defined by the method.
4. **A full-screen phone form whose feedback is behind it.** Keep a small result inside the editor. Narrow viewport captures are not proof of touch usability.
5. **Drag-only precision.** Sliders explore, numbers and event checkpoints reach exact boundaries; all must agree on the vote source.
6. **An unrestricted sandbox with no useful starting question, or an unskippable tour.** Offer optional short experiments with reversible state.
7. **Politically loaded gains/losses or selective preset framing.** Neutral signed marks, symmetric treatment, sourced identities and transparent example criteria.
8. **Misleading geography.** No local-seat implication in a nationwide constituency; no fabricated geographic redistribution; no ecological inference from locality totals to individuals. Cartograms introduce their own recognition errors.
9. **Overstated certainty.** Distinguish exact allocation, sampled search, unresolved statutory tie, roster gaps and pending official publication. A precise-looking plot cannot repair an unsupported input.
10. **Visual polish mistaken for usability evidence.** Validate the task and data abstraction before optimizing rendering. Munzner's nested model is a useful challenge to “the owner wants visuals, therefore any visual is better”.

## Sources and claim ledger

Canonical pages below were opened/read, except where explicitly limited. Publication dates are taken from the work/page when available; unspecified dates are not inferred from search-engine crawl dates. Access date for every source is 4 November 2026. IDs identify evidence families, not a claim of independent studies: a creator's page, its screenshot and its documentation belong to the same family.

| ID / family | Primary source and kind | Material claim supported / status | Access and limitation |
|---|---|---|---|
| 1 / Victor | [Explorable Explanations](https://worrydream.com/ExplorableExplanations/) — creator essay, 2011, 2024 postscript | O1/D1: adjustable assumptions update a reactive explanation; supports P1/P4/P10 | Jina + Playwright, paragraph operated; filter example read |
| 2 / Case | [To Build a Better Ballot](https://ncase.me/ballot/) — creator interactive essay, 2016 | O2/D2: concrete manipulation and sequenced counterexamples; supports P4–P7 | Jina + Playwright; first model operated, broader methods read |
| 3 / Distill | [Why Momentum Really Works](https://distill.pub/2017/momentum/) — Goh, technical visual article, 2017 | O3/D3: parameter/trace/direct labels in one frame; supports P1–P4 | Jina + Playwright, hero slider operated |
| 4 / Setosa | [OLS Explained Visually](https://setosa.io/ev/ordinary-least-squares-regression/) — Powell/Lehe, creator interactive | O4/D4: point edits and literal geometric errors; supports P3/P5 | Jina + Playwright; point drags operated at both sizes; initial failure recovered |
| 5 / Ciechanowski | [Gears](https://ciechanow.ski/gears/) — creator technical essay, 2020 | O5/D5: local controls, progressive mechanical structure, time traces; supports P1/P3/P5 | Jina + Playwright; fan operated, later disc traces read |
| 6 / Pudding | [How Music Taste Evolved](https://pudding.cool/2017/03/music-history/) — Daniels / The Pudding, 2017 | O6/D6: temporal rankings and inviting entry; supports P2/P7 | Jina + Playwright; entry/playback operated, smaller control obstructed |
| 7 / Guardian | [How could Great Britain look under PR?](https://www.theguardian.com/politics/ng-interactive/2026/sep/30/how-could-britain-look-under-proportional-representation-see-the-results-for-your-area) — Voce/Kirk, newsroom model, 2026 | O7/D7: system comparison, local lookup, explicit assumptions/denominators; supports P8–P10 | Jina + Playwright; local lookup operated at both sizes after normal consent dismissal |
| 8 / PhET | [Balancing Act](https://phet.colorado.edu/en/simulations/balancing-act), [runnable sim](https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html), [research](https://phet.colorado.edu/en/research) — University of Colorado | O8/D8: layered exploration and designed learning affordances; supports P3/P5/P7 | Jina + Playwright; Intro operated, no electoral-learning study |
| 8a / PhET | [Student engagement and learning with PhET interactive simulations](https://phet.colorado.edu/publications/MPTL_2010_PhET_final.pdf) — W. K. Adams, 2010 paper | D8: guidance can constrain exploration; contextualizes P5/P7 | Jina reader text; figure extraction rejected host; same project family as 8 |
| 9 / Desmos | [Calculator](https://www.desmos.com/calculator), [Sliders and Movable Points](https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph) — creator product/guidance | O9/D9: immediate parameter–graph feedback and exact interval/step control; supports P1/P6 | Playwright calculator + Jina guidance; not a learning-outcome study |
| 10 / OWID | [Life expectancy Grapher](https://ourworldindata.org/grapher/life-expectancy?tab=chart&country=ISR~GBR~USA), [redesign guidance](https://ourworldindata.org/redesigning-our-interactive-data-visualizations) — OWID product/creator account, guidance 2023 | O10/D10: preserved selection across views and nearby sources; supports P2/P9/P10 | Playwright + Jina; current tabs differ from 2023 screenshots |
| 11 / this repository | `README.md`, `PRODUCT.md`, `DESIGN.md`, `src/app/components/` — local files and rendered build | O11: actual capabilities/gaps and component mapping; contextual evidence for all P1–P10 | Read plus local Playwright session; user-owned app is not independent validation of its own quality |
| 12 / Datawrapper | [Chart types guide](https://www.datawrapper.de/blog/chart-types-guide) — creator/practitioner guidance, 2025 | D12: choose encoding for question; bars vs circle sections; simple before complex; supports P5/P9 | Jina + rendered desktop/phone guide, not an independently operated simulator |
| 13 / Robertson et al. | [Effectiveness of Animation in Trend Visualization](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tvcg2008-trendvis.pdf) — academic study, 2008 | D13: static depictions outperformed animation for studied analysis tasks; challenges animation-only P2 | Jina text, figure extraction rejected host; scatterplot task, not seat-allocation UI |
| 14 / Datawrapper | [Introducing Cartograms](https://www.datawrapper.de/blog/cartograms) — practitioner guidance, 2018 | D14: representation/recognition tradeoffs; supports and limits P9 | Jina read; same publisher family as 12, not a second independent experiment |
| 15 / Observable | [Observable JavaScript](https://observablehq.com/documentation/cells/observable-javascript) — official documentation | D15: referenced cells recompute and views expose values; supports P10 | Jina read; [notebook](https://observablehq.com/@observablehq/introduction-to-reactive-javascript) blocked; `observable-desktop.png`, `observable-phone.png` record checkpoint, not successful use |
| 16 / Munzner | [A Nested Model for Visualization Design and Validation](https://www.cs.ubc.ca/labs/imager/tr/2009/NestedModel/) — academic framework, 2009 | D16: task/data abstraction errors propagate downstream; contextual challenge to all principles | Jina primary abstract read; not a new empirical evaluation of this app |

### Conclusion map and remaining uncertainty

| Conclusion | Supporting evidence | Challenge / scope | Confidence and what could change the recommendation |
|---|---|---|---|
| P1 co-visible feedback | O1/O3/O9, local O11 | Phone sheets have limited space; narrow viewport only | High on gap; user task failure with compact feedback would require another layout |
| P2 persistent comparison | O3/O10/O11, D13 | Animation can be engaging; study is about trend scatterplots | High on retaining static evidence; test alternative ordering rather than claim it is proven |
| P3 mechanism drawings | O3/O4/O8, O11 walkthrough source | New diagram could confuse or misrepresent historical methods | High on need, medium on proposed grammar; require beginner explanations plus specialist trace checks |
| P4 linked explanations | O1/O2/O3/O8 | Many linked marks may overload or move focus unexpectedly | Medium; keyboard and learner task testing can reject a linkage |
| P5 representation layering | D2/D8/D12, O11 | Excessive restriction can prevent discovery | Medium; test novice task success and expert access together |
| P6 discontinuity exploration | D2/D9, O11 sensitivity/source | Exact minimum finding is harder than exact allocation | High on precise labels, medium on search UI; benchmark actual guarantees and latency |
| P7 optional challenges | D2/D8, O11 presets | Motivation evidence comes from educational contexts; political selection bias | Medium; observed learner use and balanced prompt review may change examples |
| P8 structural preview | O11 Merge/Compare, D7 | Lineage is not a unique seat-transfer explanation | High on retain preview, medium on new glyphs; test distinction between grouping/merging/agreement |
| P9 question-driven encoding | D12/D14, O7/O10/O11 | Every map/cartogram sacrifices something; chamber still valuable for composition | High on denominator/scale, medium on extra map mode; do not add it absent a useful task |
| P10 reproducible visuals | O10/O11, D15 | Documentation of reactivity is not proof of trust or comprehension | High on state integrity; fresh-browser restore/export checks determine supported view-state scope |

Accounting: ten core interactive works inspected; no claim that all controls in those works were exercised. Three academic texts/frameworks were read (Adams, Robertson et al., Munzner); two belong to educational/visualization evidence, none measures this app's voters. Datawrapper's two pages are one publisher family. Observable contributes documentation only. Learning gains, task times, physical-phone usability, accessibility conformance and exhaustive publisher coverage were **not measured**. Tool-internal upstream request counters and User-Agent were **not available**. No source-count claim substitutes for those limits.

## App session and delivery checks

The focused local-app session ran **10:23:38–10:33:42 UTC (10 minutes 4 seconds)**, after an initial inspection beginning 10:12:40 UTC. It included operating controls, inspecting rendered results and reading corresponding implementations; it was not a timed usability study or ten minutes of continuous pointer motion. Toolchain observed: Node 24.18.0, Vite 8.3.5, Playwright 1.64.1, Chromium 156.0.8078.4. `npm install` completed and `npx vite build` succeeded. Preview initially hit sandbox `EPERM`; the authorized local preview then ran on port 5343. The shared-preview attempt reported `ERR_CONNECTION_REFUSED`; research used Playwright as requested.

| Exercised path | Observation | Scratch captures |
|---|---|---|
| Simple → Likud slider, 2022 | Two keyboard increments produced two undoable edits but no seat movement; the session said so | `app-en-vote-desktop.png`, `app-en-vote-after.png` |
| Standard → Merge Labor/Meretz | Full-retention preview: 326,785 pooled votes, combined 4 → 9 seats; lowering retention updated the pre-apply preview | `app-merge-preview.png`, `app-merge-retention.png` |
| Surplus agreements | First agreement switched off; alone this moved no seats. Later tests retained that change, so are not pristine single-edit counterfactuals | `app-agreements.png`, `app-compare-desktop.png` |
| Meretz vote entry → Compare | Set Meretz to 160,000 votes with proportional balancing: Meretz 0 → 4, Labor 4 → 5, five other lists lost one each. Four seats were unassigned to blocs: do not automatically count an entering list as opposition | `app-meretz-crossing-desktop.png`, `app-compare-changed-desktop.png`, `app-compare-phone.png` |
| Phone editor, light/dark | Selected-list total and margins remain in the sheet; chamber/other lists are behind it. Close the sheet to reach shell controls | `app-phone-editor.png`, `app-phone-editor-dark.png` |
| Expert turnout | Changed turnout 50 → 75 for a million-person group; 1% invalid gives 247,500 added valid votes; custom 100% allocation updates the table, with no pre-apply national seat drawing | `app-turnout.png`, `app-turnout-assumption.png` |
| Expert sensitivity | Ran selected Likud over 150,000–170,000 votes: it stayed on five seats across a breakpoint at 168,344, while Religious Zionism/Hadash–Ta'al changed. Selected-list-only feedback would miss this event | `app-sensitivity.png`, `app-sensitivity-run.png` |
| Localities | Opened map, searched Jerusalem, switched to table and searched ירושלים. Map labels historical local totals and national-edit limitations; 1214/1215 localities placed | `app-localities.png`, `app-locality-search.png`, `app-locality-table.png` |
| Allocation | Stepped through threshold, quota, initial and remainder; inspected 1949/1969 and Hebrew/dark narrow rendering. Tables dominate the mechanism explanation | `app-walk-threshold.png`, `app-walk-quota.png`, `app-walk-initial.png`, `app-walk-remainder.png`, `app-1949-walk.png`, `app-1949-quota.png`, `app-1969-remainder.png`, `app-he-dark-walk-phone.png` |
| Coalition/scenarios/history | Toggled Likud in coalition building; opened What if and Scenarios; saved locally, exercised undo/redo. Share menu inspected, not fresh-browser link equivalence | `app-coalitions-he.png`, `app-coalition-toggle.png`, `app-whatif.png`, `app-scenarios.png`, `app-share.png`, `app-session-end.png` |

### Visual contract beyond the five sketches

These are **I**, not delivered changes. They make the owner's requirement checkable across tools.

| Component/tool | Visual consequence |
|---|---|
| `Hemicycle.tsx` | Selecting a seat links list, candidate and pale bloc region; retain baseline/delta evidence |
| `BlocPanel.tsx`, `Blocs.tsx` | Moving a constituent updates corridors/majority, visibly leaving allocation unchanged |
| Coalitions in `SeatSecurity.tsx` | Include/exclude updates the existing majority graphic on the full seat scale; suggested coalitions highlight their members |
| `SeatSecurity.tsx` | Gain/loss margins become an interval with current position and source assumption; retain limit/sampling labels |
| `Charts.tsx` | Votes-versus-seats and threshold distance answer specific questions with explicit denominators and linked selection |
| Rules in `Panels.tsx` | Rule changes preview composition and affected-list differences; experimental label travels with the result |
| `Sensitivity.tsx` | Affected-list deltas accompany the existing staircase; threshold sweep leads with intervals before exact tables |
| `ScenarioGallery.tsx`, `Scenarios.tsx` | Selection/import leads to visual result plus validated assumptions; invalid data gives a diagnostic, not a fabricated chart |
| Save/share in `TopBar.tsx` | Preview the actual result/qualifications being shared; exports stay tied to scenario state |
| Sources/history in `Panels.tsx`, `ChangeSummary.tsx` | Quantity → derivation/source; action → before/after. Keep citations readable, not a decorative network |

Delivery checks: document whitespace, scratch screenshot references and component paths; staged diff must contain only this document. No app test-suite result is asserted: app code was not changed. Dependency installs, build outputs, browser scripts and screenshots remain ignored working material. No push or merge is authorized for this research task.
