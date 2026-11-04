# International election products: hands-on study

Studied 4 November 2026. Recommendation: improve the continuity between an edit and its consequence, rather than adding more tools. The strongest references are NOS for coalition manipulation, NRK for explanatory hierarchy, Nowcast EU for editing beside a baseline, and the Guardian for explaining comparisons. None is a complete model for this product.

## Scope, evidence and limits

The decision is what an Israeli, Hebrew-first, exact Knesset simulator should adopt from non-Israeli products. “Best” here means useful transferable interaction evidence: orientation, input-to-result feedback, explanation of majority and threshold, comparison integrity, and phone behaviour. This is a purposive selection, not a claim to have ranked every election website. Eight principal products are examined below; ARD and NZ are additional partial-load cases, and ABC and ZEIT are access failures. Products with a strong narrow pattern can also have serious weaknesses.

**Evidence vocabulary:** **O** = observed in the rendered interface, including attempted actions; **D** = the product's own text or instructions, not independent validation; **I** = inference/recommendation. The E1–E10 records below are the claim ledger. A recommendation's P-number links to those records; shared screenshots, text extraction and Jina captures of one product are one evidence family, not independent corroboration. Publisher pages are primary evidence for their interface, not proof of their accuracy or effectiveness. No user study, screen-reader audit, conversion measurement or electoral-engine validation was performed.

All screenshots referenced here are under the gitignored `.backup-scratch/prior-art/products/`; filenames below are relative to that directory. They are local, disposable working evidence, **not committed report assets**. The prose preserves the consequential observations if scratch is removed. Screenshots have no permanence guarantee and are not a substitute for the cited public URLs. Desktop was 1440×900; phone was 390×844, by viewport resize, not real-device testing. Captures show particular scroll positions, not necessarily the page top. Initial and operated states are distinguished. Animating numbers in immediate NOS desktop captures were intermediate; the settled phone capture shows 66.

Playwright used the direct-request User-Agent `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. No email address was submitted. Jina search/read/screenshot tools were also used; their API does not expose a target User-Agent override, so their upstream User-Agent is unverified. Ordinary cookie rejection was used on the Guardian. No paywall, login, CAPTCHA or challenge was circumvented. English Wikipedia was neither opened nor used as evidence; it appeared in one unsolicited search result and was excluded.

### Local comparison baseline

Read `README.md`, `PRODUCT.md`, `DESIGN.md`, then relevant component source. `npm install --cache .backup-scratch/npm-cache` failed on DNS (`EAI_AGAIN`). Used a scratch copy of the existing main-checkout dependencies; the package manifests were not edited. `npx vite build` passed with Vite 8.3.5, Node 24.18.0, Playwright 1.64.1; `npx vite preview --port 5341` served the production build. No app code was changed.

The local interaction window ran approximately 10:13–10:25 UTC, interleaved with external research. This was an exploratory session, not a timed usability experiment or ten uninterrupted minutes of exclusive attention. Operations: switch Hebrew/English, choose 2022, open Likud, change votes to 1,250,000 and undo; open coalition builder and load the historical coalition; inspect Compare; move Meretz from 3.16% to 3.30%; save locally and activate share-link creation; inspect Localities in Expert; use the Hebrew phone editor; switch to English/dark; load a What-if and undo; inspect Merge & split and allocation walkthrough. Inspected controls are not claimed as completed mergers, turnout edits or a successful share round-trip.

**O:** the Meretz edit yielded 4 seats; historical coalition went from 64 to 62; 4 seats appeared as “No bloc”. This is an excellent distinction: a historically excluded party must not silently acquire a historical government affiliation. National edits explicitly do not change historical locality votes. A phone editor replaced the board with a full-screen sheet: party seat total stayed visible, but chamber/bloc consequences were behind it. Main phone page width measured 390px. Two Close controls matched a broad selector; the sheet's own header Close worked when scoped to the sheet. This is locator ambiguity, not evidence that human closing is broken.

Local screenshots: `app-simple-desktop.png`, `app-vote-edit.png`, `app-coalition-desktop.png`, `app-coalition-selected.png`, `app-compare.png`, `app-threshold-crossing.png`, `app-localities-desktop.png`, `app-phone-he.png`, `app-phone-editor-he.png`, `app-phone-dark.png`, `app-whatif-phone.png`, `app-structure-phone.png`, `app-walkthrough-phone.png`.

## Ten principles to adopt

Effort is a relative implementation estimate, not a schedule: S = focused component work; M = coordinated UI/state work; L = new data/geometry capability. Impact is an inference about comprehension, to verify with task-based testing. Each recommendation extends existing behaviour rather than presuming a missing feature.

### P1. Answer the majority question before asking readers to decode the chamber

**Evidence O/D:** NRK leads with the winning side, 88 versus 81, and “85 mandates gives a majority” (E1). BBC puts a labelled 326 line on its opening seat chart (E5). Reuters puts “270 electoral votes to win” under the power bar (E6). NOS's coalition gauge gives a single large selected-seat count (E2).

**I, adopt:** keep the 120-seat chamber, but pair the selected grouping with a concise “62 of 120 · 1 above 61” sentence; retain the grouping name and historical/hypothetical status. At present the board labels majority and the coalition tool already shows a shortfall; the increment is an explicit surplus and consistent placement, not a new majority widget. Change `Blocs.tsx` (`BlocBar`), `Hemicycle.tsx` and `SeatSecurity.tsx` (`Coalitions`). **Impact high; effort S.** Acceptance: a first-time reader can name the grouping and its distance to 61 without counting dots. Avoid NRK's winner portraits or a binary left/right frame for Israel.

### P2. Put input, current outcome and reference outcome in the same visual neighbourhood

**Evidence O:** Nowcast EU puts 2025 share, editable share, computed seats and seat delta in one compact row; it fits the tested phone width (E3). NOS pairs previous/current bars (E2). EC shows actual 2024 shares directly above the inputs (E4).

**I, adopt:** in `ListDetail.tsx`, put “official 3.16% / 0 seats → scenario 3.30% / 4 seats” next to the share field. `ListBars.tsx` already has reference outlines and changes; preserve those, but do not make a visitor scan the board to recover the reference while editing. Keep full comparison in `Compare.tsx`. **Impact high; effort S.** Acceptance: reader identifies both the original and edited value from the editor alone. Do not import Nowcast's red/green gain colouring; this app's neutral ink rule is better.

### P3. Keep consequences visible on a phone while the editor occupies the screen

**Evidence O:** local phone sheet hides the board, although it retains the selected party's seats. NOS places gauge and touch-sized party choices in the same section (E2); Nowcast keeps seats beside input fields (E3). These are examples of local feedback, not proof of better task completion.

**I, adopt:** a compact persistent strip in `ListSidePanel.tsx`: selected list seats and delta, changed-seat count, active bloc total and distance to 61. Expand to `ChangeSummary.tsx` details when requested. Use logical positioning, respect Hebrew RTL, and avoid duplicating the entire chamber or obscuring candidates. **Impact high; effort M.** Acceptance: complete a threshold-crossing edit at 390×844 and understand its coalition consequence without closing the sheet. Verify keyboard focus and zoom separately before claiming accessibility.

### P4. Make coalition selection simple first; put exclusions behind an explicit control

**Evidence O/D:** NOS uses party toggles, a reset, selected total and majority marker (E2). ARD offers party visibility controls above/below a fixed seat distribution (E7). Our app has richer include/exclude/neutral cycling, presets and minimal winning coalitions.

**I, adopt:** retain all coalition capabilities, but make the common “add/remove from my coalition” interaction a two-state choice at Simple; expose “rule out” through a clearly labelled optional constraint control. Give each state a text equivalent. The present three-click cycle can turn removal into exclusion unintentionally; that risk is an inference, not a measured error rate. Work in `SeatSecurity.tsx` (`Coalitions`), `coalitions.ts` only if state contracts require it. **Impact high; effort M.** Acceptance: removing a party never creates an invisible restriction. Keep the app's political-feasibility disclaimer and minimal-winning explanation.

### P5. Explain a discontinuity where the voter encounters it

**Evidence O/D:** NRK gives near-threshold parties a separate 4% graphic and shows additional equalisation mandates; a nearby explanation distinguishes direct and equalisation seats (E1). NZ exposes effective votes, list/electorate seats, overhang and a quotient-table section, though its calculation failed in this environment (E10).

**I, adopt:** extend the existing threshold row and `Figures.tsx` drilldown with an event explanation after a crossing: “Meretz passed 3.25%; its votes now participate in allocation. Other lists and the Labor agreement also affect the seat changes.” Link to `Walkthrough.tsx` at the relevant step. Do not claim all four seats came from one rival or that votes directly map to a fixed number of seats. `ChangeSummary.tsx`, `ListDetail.tsx`, `WhatIf.tsx` are the entry points. **Impact high; effort M.** Exact causal decomposition requires engine evidence; start with verifiable threshold/eligibility events, not speculative prose.

### P6. Every delta must carry its baseline and unit

**Evidence O/D:** Guardian explains modelled 2019 boundaries versus defending party at dissolution; BBC labels change since 2019. Their Labour changes differ (+214 versus +211) even though both show 412 seats (E8/E5). Nowcast explicitly names its delta column “+/- 2025” (E3).

**I, adopt:** keep the existing “official result” labels, and make the election date, data status and comparison mode travel with every comparison/export. Name vote-share changes in percentage points, not percent. When comparing split/merged identities, show which predecessor lists were combined. `Compare.tsx`, `ChangeSummary.tsx`, `Scenarios.tsx` (`ResultBar`), `TopBar.tsx` export code. **Impact high; effort M.** Acceptance: a screenshot/export can be interpreted without the surrounding session. The external discrepancy is evidence of contextual differences, not evidence that either publisher is arithmetically wrong.

### P7. Separate data status from visual certainty

**Evidence O/D:** NRK has “decided” plus a dated update; Reuters distinguishes called races, lead strength and count status; BBC says counting complete and 650/650 declared (E1/E6/E5). Old NOS and Reuters pages still retain “Live” chrome, a useful counterexample (E2/E6).

**I, adopt:** keep the app's 2026 publication-pending banner; add a small stable status near the election/scenario title and retain it on shared views. Distinguish official baseline, pending gazette, hypothetical scenario, experimental rule and provisional lottery. `TopBar.tsx`, `App.tsx`, `Scenarios.tsx`, `Panels.tsx` Sources. **Impact high; effort S–M.** Acceptance: a simulated seat total never looks like a newly certified result. Do not add refresh timers or election-night animation to historical static data.

### P8. Map modes should answer different questions, with their denominators named

**Evidence O/D:** Guardian offers familiar geography versus one equal hexagon per constituency; NOS offers geography versus population and winning party versus turnout; Reuters separates calls from lead/count status; BBC exposes geographic/cartogram and changed-hands controls (E8/E2/E6/E5). Some controls were inspected but not successfully operated; see records.

**I, adopt:** first improve the existing `LocalityMap.tsx` and `Panels.tsx` locality search/table journey: keep selection and search across modes, put the mode's question in the legend, and show the actual historical denominator/date. A future population- or voter-weighted view could counter land-area bias, but Israeli localities are not parliamentary constituencies and an equal-locality tile is not equal voting power. **Impact medium; effort S for labels/state, L for new geometry.** Preserve the existing warning that national scenario edits are not geographic predictions. Test need before adding a cartogram.

### P9. Share the assumption set, not just the picture

**Evidence O/D:** 270toWin labels consensus/user maps and offers Copy Link, embed/image controls and reset (E9). NOS includes link/WhatsApp controls next to coalition output (E2). EC's submission serialises inputs and model options in the URL, including the invalid-input case observed here (E4).

**I, adopt:** extend the app's existing share/export flow with a recipient-facing capsule: “2022 baseline · Meretz 3.30% · funded proportionally · official rules · historical government grouping.” Include base-data version and warnings where already available; show what is saved in-browser versus portable. `TopBar.tsx`, `Scenarios.tsx`, `store.ts` (`shareLink`), `Compare.tsx`. **Impact high; effort M.** Acceptance: a fresh-session recipient can tell what was assumed before modifying it. No claim here that external share links were successfully reopened; only local link generation and external controls were exercised.

### P10. Layer by the reader's question, and offer a clear recovery path

**Evidence O/D:** NRK moves from national outcome to threshold explanation to government alternatives to local discovery (E1). NOS labels section navigation by tasks (E2). EC reveals Scotland/tactical inputs on request, but its error names internal model variables and asks visitors to reason about hidden residual shares (E4). NZ is a counterexample to making a long expert form the entry point (E10).

**I, adopt:** retain Simple/Standard/Expert and the existing named tools. Add brief task descriptions to the muted higher-level destinations and an in-place level upgrade that keeps scenario/context. Existing scenario gallery/What-if questions are a stronger starting point than a general “Randomise” button. Errors should state what happened, what remains valid and one recovery action. `App.tsx`, `WhatIf.tsx`, `ScenarioGallery.tsx`, `SourcePicker.tsx`, `ui.tsx`. **Impact medium–high; effort S–M.** Acceptance: someone can find “make two lists run together” from Simple without knowing the level taxonomy. Do not remove the direct expert forms needed for precise research.

## Product records and observation ledger

Each E-number is one publisher/deployment family. Dates describe the inspected edition, not a claim that the interaction exists on every historical page. Screenshots and attempted operations are direct observations; mechanics described only in page copy are marked D. “Not verified” does not mean absent.

### E1 — NRK, Norway parliamentary results 2025

[Public result](https://www.nrk.no/valg/2025/resultat/). Public broadcaster; results edition updated 10 September 2025 in the inspected header. Sources: rendered desktop/phone, Playwright controls, Jina read. Depth: outcome, party expansion, threshold and government explanations, locality search. Screens: `nrk-desktop.png`, `nrk-phone.png`, `nrk-operated-desktop.png`, `nrk-operated-phone.png`.

**O, first impression:** dark blue header with locality search and timestamp, then an exceptionally direct outcome: left side won, 88 versus 81, majority 85. Party-colour blocks sit inside those totals; the numbers do not require interpreting a hemicycle. Phone keeps the same question/answer hierarchy and legible large totals. Portraits add personality but imply a contest between leaders and use substantial vertical space.

**O/D, interaction and depth:** activated “Vis alle partier” (show all parties), entered Oslo into locality search. These are exploration controls, not simulated vote editing. Below the result, a dedicated threshold section shows 4.74%, 4.20%, 3.69% and the extra mandates won, then explains the statutory distinction. Government alternatives have numerical totals and narrative context, including minority governments. That context matters: a majority meter alone is not a complete description of government formation.

**O, signs and limits:** labelled search input, native radio controls in the party/locality area, visible textual counts and direction arrows supplement colour. A full keyboard or assistive-technology journey was not tested. No scenario save/share flow verified; irrelevant to a read-only results page. **I, transferable strength:** explain the consequential rule immediately after showing its consequence; separate political context from arithmetic. Supports P1, P5, P7, P10. High confidence in hierarchy, moderate in transfer to Israel; Norway's equalisation threshold is not Israel's exclusion threshold.

### E2 — NOS, Netherlands Tweede Kamer 2025

[Public result](https://app.nos.nl/nieuws/tk2025/). Public broadcaster; 2025 edition, inspected in 2026. The trailing slash matters: the slashless URL returned `NoSuchKey` through Jina, while the public slash URL loaded in Playwright. Screens: `nos-desktop.png`, `nos-phone.png`, `nos-coalition-desktop.png`, `nos-coalition-phone.png`. Depth: national summary, coalition toggles/reset, navigation, map controls and local/table sections inspected.

**O, hierarchy:** a latest-municipality ticker, task-based contents navigation, tight national vote-gap summary, then paired 2023/2025 seat bars. The bars make comparison explicit, but use grey/red for election years rather than party identity. Sidebar navigation becomes a compact “Snel naar” section selector on phone. This is a useful transformation of navigation, not simply a smaller desktop sidebar.

**O, editing:** selected D66, VVD and CDA in the majority finder; settled total 66, matching the displayed party seats 26+22+18. Large party pills, a coloured semi-donut, vertical majority marker and “begin opnieuw” reset make the model discoverable. Reset returned the selected total to zero. The desktop screenshot was taken mid-animation (35), while phone shows the settled 66: do not treat transient animation frames as data disagreement. There is no vote-share editing in this tool.

**O/D, depth and sharing:** coalition has adjacent WhatsApp/link/mail controls and a more-information disclosure; no message sent and no recipient round-trip tested. Voter-flow section gives “where to/where from”, with a party selector and an explicit survey source. Map offers largest/second party, turnout and turnout change, geography/population. These are separate questions, not arbitrary styles. Local results and full national table follow. Phone coalition pills remain usable, although the sticky ticker/section selector can consume the gauge's top edge at some scroll positions.

**O, signs/limits:** rendered text includes a natural-language top-five chart summary and numerical counterparts to graphics; party controls are buttons. Colour is still heavily relied on for selected pills; no contrast audit. The old page still says “Live”, despite its table's last-update age. **I:** adopt task navigation, gauge-local controls and chart summaries; avoid a stale live label and animations long enough to obscure the current value. Supports P1–P4, P7–P10.

### E3 — Nowcast EU, Germany interactive seat calculator

[Public calculator](https://nowcast-eu.github.io/Germany/calculator). Independent practitioner product; inspected current deployment with 2025 reference column. Not an official statutory authority. Screens: `germany-desktop.png`, `germany-phone.png`, `germany-edited-desktop.png`, `germany-edited-phone.png`, `germany-baseline-desktop.png`. Depth: numeric edit, calculate and baseline/result switch; coalition controls and map inspected.

**O, hierarchy and edit:** starts with a table, not a decorative map. Every row shows party identity, previous vote percentage, editable percentage, computed seats and delta. Changed Union input to 30 and clicked Calculate; its displayed seat total became 203. Switched coalition baseline to 2025 (Union 208, SPD 120), then back to Result (Union 203, SPD 89). These are specific session outcomes, not validated forecasts. Initial state already differed from 2025; the page was not starting at official results.

**O/D, complexity:** Calculate, Reset and Randomise are explicit. Coalition panel labels itself user generated, uses party chips and “0 / 630; majority 316”. A constituency map and settings sit below. The page declares that this is a simplified version of its regular model, with omitted concentration/incumbency/demographic effects. The coalition chip selection attempt hit a hidden duplicate text node, so successful coalition manipulation is not claimed.

**O, phone/signs:** narrow table and three-column chips fit 390px in the capture. That density has costs: small text and number fields, weakly explicit form labels, red/green deltas, tiny settings gear. No share or undo sequence verified. A consequential negative: after the edit the total read **100.8%**, yet the page produced 630 seats without an evident adjacent invalid-total warning. Do not infer the precise normalisation policy from that alone.

**I:** borrow co-location of reference, input and result; retain this project's stronger vote-budget semantics, neutrality and exact-law explanations. Supports P2, P3, P6, P10; counterevidence against treating simplicity as sufficient correctness.

### E4 — Electoral Calculus, user-defined poll

[Public predictor](https://www.electoralcalculus.co.uk/userpoll.html). Practitioner/consultancy; 2024 reference, current deployment inspected. Screens: `electoral-calculus-desktop.png`, `electoral-calculus-advanced.png`, `electoral-calculus-result.png`, `electoral-calculus-phone.png`. Depth: form entry, Scotland disclosure, submit, error recovery attempt; Jina full page read.

**O/D, orientation:** plain-language promise and explanatory paragraphs precede the form. Actual 2024 shares are immediately above predicted GB shares. Scotland and tactical assumptions are opt-in; output scope and constituency boundaries are explicit selectors. “All changed seats” is the default output task; regional and historic-boundary modelling are available without cluttering the smallest form.

**O, operation:** filled CON 25, LAB 30, LIB 15, Reform 20, Green 8, expanded Scotland and submitted. It rejected a calculated 106.6% total, incorporating residual categories not editable in that visible five-party set. Error text exposed internal variable names and a model function. A second lower-total submission was attempted, but its result screenshot failed, so a successful prediction is not claimed. URL carried the submitted fields and the error, demonstrating serialisation, not a verified share workflow.

**O, phone/signs:** form labels and numeric inputs exist, but table columns and long explanations demand substantial navigation at 390px. Direct numeric control is appropriate for experts; the long introduction delays the reward for beginners. No dedicated undo observed; no reset/save success verified. **I:** preserve context via reference values and scoped advanced disclosures; improve recovery by explaining remaining vote budget before submit. Supports P2, P9, P10. Accuracy of its seat model was out of scope.

### E5 — BBC, UK general election results 2024

[Public result](https://www.bbc.com/news/election/2024/uk/results). Public broadcaster; 2024 results archive. Screens: `bbc-desktop.png`, `bbc-phone.png`, `bbc-operated-desktop.png`, `bbc-operated-phone.png`. Depth: opening result, party table, constituency search and map controls; Jina read. Initial role-locator attempts timed out; ordinary button selectors later allowed Cartogram and Changed hands activation, followed by Oxford search.

**O/D, orientation:** even on phone the first election graphic shows seats by party, a labelled 326 majority line, zero seats remaining, numeric totals and change since 2019. Below, “counting complete / 650 of 650” states the denominator and status. Party cards break seats, change, total votes, share and share change into explicit labels.

**O/D, controls/depth:** constituency lookup, Results map/Cartogram, Changed hands, zoom/reset/key controls were present in DOM. Those controls are not simulation inputs. Later selected Cartogram and Changed hands, entered Oxford; the phone capture shows the hexagon view and Oxford East / Oxford West and Abingdon suggestions. A keyboard suggestion-selection attempt did not establish a successful constituency drilldown. Share/Copy link controls present; no share round-trip. Phone opening bar is strong evidence of purposeful small-screen composition; the phone map/search capture demonstrates a practical alternative to manipulating geography, but complete local drilldown remains unverified.

**O, signs:** skip/content and accessibility help links, full party-name textual equivalents to abbreviated seat bars, and words for seats gained/lost. This is evidence of accommodation, not a WCAG verdict. **I:** borrow explicit units, completion denominators and text equivalents; avoid forcing the UK constituency model into an Israeli national allocation. Supports P1, P6–P8.

### E6 — Reuters, US presidential results 2024

[Public result](https://www.reuters.com/graphics/USA-ELECTION/RESULTS/zjpqnemxwvx/president/). News agency; 2024 archive updated December 2024 in the inspected header. Screens: `reuters-desktop.png`, `reuters-phone.png`, `reuters-operated-desktop.png`, `reuters-operated-phone.png`. Jina returned Access Denied for the slashless path; the public slash URL loaded in Playwright without challenge. This difference is an access observation, not a technique for defeating access controls.

**O, hierarchy:** after site/ad space and latest calls, a large title, office tabs, then 226/312 electoral votes with a labelled 270 threshold. Popular votes and percentages sit below the electoral tally. Called/flip information is separately represented. This is especially good separation of metrics that readers might otherwise conflate.

**O/D, controls:** map views expose called races, geographic/cartogram, strength of lead and vote-count status. Initial role-locator attempts timed out. A later ordinary menu-opening sequence allowed activation of Cartogram and Vote count status; the subsequent capture still showed the called-races geography, so completed map rendering in the selected mode is not established. Buttons/legend copy nevertheless establish the distinct questions. State navigation provides detail rather than vote manipulation; no scenario editor/save was expected. Phone capture was made, but no full phone state drilldown completed.

**O, signs/counterevidence:** skip-to-content and explicit keyboard ticker instructions; textual candidate totals. Heavy news/ad chrome postpones the main chart. “Live” persists on the archived result. **I:** separate allocation/majority, vote share and data completeness; adopt clear status labels without copying stale live presentation. Supports P1, P7, P8. Does not demonstrate a proportional-seat simulator.

### E7 — ARD/tagesschau, Germany coalition calculator 2025 — partial load

[Article](https://www.tagesschau.de/inland/bundestagswahl/koalitionsrechner-bundestagswahl-2025-100.html); [public embedded calculator](https://www.tagesschau.de/wahl/archiv/2025-02-23-BT-DE/koalitionsrechner.html). Public broadcaster. Screens: `ard-desktop.png`, `ard-phone.png`, `ard-selected-desktop.png`, `ard-selected-phone.png`, `ard-settled-desktop.png`, `ard-settled-phone.png`. Depth: article, public iframe, attempted party toggle.

**O/D:** article names the coalition question in plain language. Public iframe exposes 630 total seats, party counts, majority 316 and instructions to show/hide parties by clicking above or below. It also names the federal returning officer as source. The article's simpler-language and sign-language destinations are visible.

**O, limitation:** iframe loaded without intended styling/graphics here. Clicking SPD/Union button wrappers did not produce a supported selected-total change: it remained zero. Neither intended graphical polish nor working selection is established. Mobile screenshot shows cramped unstyled buttons. No save/share/undo success verified. This is a partial inspection, excluded from the principal eight-product recommendation set. **I:** the instruction and duplicated placement suggest keeping controls near both representations, but P4 relies primarily on working NOS evidence; do not claim ARD excels hands-on from this run.

### E8 — Guardian, UK results 2024

[Public result](https://www.theguardian.com/politics/ng-interactive/2024/jul/04/uk-general-election-results-2024-live-in-full). Newspaper; July 2024 edition. Screens: `guardian-desktop.png`, `guardian-phone.png` (initial consent), `guardian-operated-desktop.png`, `guardian-operated-phone.png` (after ordinary cookie rejection). Jina read supports methodology details. Depth: outcome, Results explained, map mode, locality search, comparison methodology.

**O/D, orientation:** headline explains the national outcome, seat totals show change, declaration count says 650/650. “Results explained” expands baseline qualifications near the headline summary. Latest seat cards distinguish holds/gains and the former holder. The expanded explanation distinguishes modelled boundary changes from unchanged constituencies and the defending party at dissolution; it also qualifies an absolute versus working majority.

**O, interactions:** rejected optional cookies in the consent frame; opened Results explained; used Map type and selected Proportional; entered Oxford in the election-specific search. Phone screenshot shows matching Oxford East / Oxford West and Abingdon options under the search, with the methodological explanation above. Map mode copy explains geography as familiar country shape and proportional as one hexagon per constituency. No scenario editing or saving was expected; share exists but was not round-trip tested.

**O, signs/limits:** input accessible name and useful placeholder; named controls and explanatory alternatives to visual geometry. Initial full-screen consent hides content, substantial advertising space delays the result, and the archive retains dated live-feed language. **I:** borrow the baseline disclosure and search path; keep this app's direct start and neutral voice. Supports P6, P8, P10. Guardian narrative interpretation is editorial and should not be transplanted as an Israeli political judgement.

### E9 — 270toWin, current Senate interactive map

[Public product](https://www.270towin.com/). Commercial election site; homepage on inspection was 2026 Senate, not a presidential map. Screens: `270-desktop.png`, `270-phone.png`, `270-operated-desktop.png`, `270-operated-phone.png`. Depth: three time views, interactive view, copy-link control, palette/share/reset inventory.

**O/D, hierarchy:** explains current chamber, seats contested, and net gain required. Three named views separate current Senate, contested 2026 and future Senate. Power bar distinguishes uncontested seats from contest ratings and tossups, rather than recolouring everything as a prediction. Rating palette labels safe/likely/leans/toss-up. Consensus-map identity is visible; documentation labels user-generated maps separately.

**O, operation:** switched to future Senate via the visible label, returned to Interactive Map and activated the visible Copy Link control. Hidden duplicate/radio inputs initially caused locator failures; visible labels worked. No fresh-session link replay or state-colour edit was completed, so do not infer their correctness. Reset, map library and embed/image controls were inspected, not all executed. No social/email message sent.

**O, phone/counterevidence:** three view choices stack, but operated 390px capture crops the wide map and parts of the tally; large ad space postpones the tool. Accessibility signs include labelled radio controls and named share/embed buttons; keyboard selection of map states was not tested. **I:** adopt view identity and portable-state semantics, not the desktop-width map or ad density. Supports P7, P9. Transferable value is state organisation, not a recommendation to colour Israeli localities as national scenario predictions.

### E10 — New Zealand Electoral Commission, MMP calculator — partial load

[Official calculator](https://elections.nz/stats-and-research/mmp-seat-allocation-calculator). Electoral authority, page states updated September 2026. Screens: `nz-desktop.png`, `nz-calculated-desktop.png`, `nz-phone.png`. Jina text extraction empty; its screenshot service returned a temporary capture URL. Playwright exposed the full HTML form but missing styling/calculation.

**O/D:** visitors choose percentage or absolute party votes, optionally enter electorate seats, add named other parties and Calculate. Inputs have party-specific labels. Instructions state threshold exceptions and that excessive electorate totals are auto-adjusted. Output headings distinguish votes won, effective vote share, entitlement, electorate seats, list MPs, total MPs and overhang; quotient table and below-threshold list are offered. This is unusually useful conceptual decomposition for specialists.

**O, failed action/mobile:** filled National 45, Labour 40, Greens 10, NZ First 5 and clicked Calculate. Current totals/output remained empty/zero. At 390px the partially loaded document measured 559px wide and overflowed. This is not a fair judgement of the fully functioning product's phone design. No successful result, reset, save or share verified. **I:** learn from precise input labels and decomposed accounting, but do not copy the long form or claim a usable calculator from this visit. Supports P5 context only; excluded from principal eight.

## What to avoid

- **A beautiful map that implies the wrong denominator.** Geographic area, residents, votes, parliamentary seats and coalition support are different measures. An Israeli locality map cannot become a seat map by recolouring polygons. Keep the current historical-votes warning.
- **A majority picture mistaken for political permission.** Norway's minority-government context, US Senate vice-presidential tie breaking, and UK working-majority conventions do not transfer as Israeli rules. Continue computing 61 and saying coalition arithmetic does not establish political feasibility.
- **Explanations that arrive after an opaque error.** EC's hidden residual shares/internal-variable error and Nowcast's visible 100.8% total are warnings against copying expert forms without budgeting and validation. Keep explicit transfer/turnout assumptions.
- **Colour doing all the work.** Keep names, numbers, drawn deltas, grouping labels and selected-state text. Do not inherit red/green positive/negative judgements or portray blocs as intrinsically good/bad.
- **Showy animation as evidence.** NOS's intermediate gauge value was not its final sum. Result updates must not encourage screenshots of false settled states; reduced-motion and stable text matter more than an animated arc.
- **Treating a fixed feature inventory as progressive disclosure.** Layers should reduce the work needed for a question, not require knowing which product tier contains it. Conversely, hiding all expert destinations would violate this app's findability principle.
- **Desktop geometry squeezed into a phone.** 270toWin's cropped map and NZ/ARD's degraded loads are reminders to inspect actual rendering, not infer phone quality from responsive CSS or marketing.
- **Importing publisher overhead.** Advertising gaps, support appeals, consent walls, portraits and old “Live” labels delay understanding. A static public-interest simulator has no reason to reproduce them.
- **Copying external engine assumptions or closed code.** None of this research validates an outside seat engine or authorises copying its implementation/assets. Generalise interaction principles; keep the project's exact Israeli-law engine and retained sources.

## What this project already does better — keep

**Observed locally:** immediate vote edits, a transparent source for those votes, undo, historical government presets, explicit shortfall to 61, a majority bar on fixed total seats, minimal-winning coalition suggestions and a plain explanation of “minimal”, threshold long-tail treatment, candidate entry marks, share/save/export destinations, and the national-versus-locality warning. These capabilities coexist in one app; the public results sites studied mostly answer read-only questions. Do not rebuild them merely because a reference has a more dramatic graphic.

**Observed in local UI and source, not independently validated here:** exact integer/fraction allocation, era-specific rules, replayable scenario actions, source manifests, lottery and provisional-data qualifications, bilingual glossary, reduced-motion intent and Hebrew-first logical layout. The research did not rerun all election tests or establish legal correctness. README also qualifies 2026 publication status and historical roster coverage; preserve those qualifications rather than repeating an unqualified “every official result is verified” claim.

The combination of Hebrew RTL, equal English support, historical sources, constituent-party bloc membership and hypothetical elections is more specific to the task than any outside product. A newly qualifying Meretz remaining outside a *historical government* bloc is correct semantics, not an invitation to auto-assign it to an assumed camp.

## Decision map, challenge pass and confidence

| Conclusion | Supporting observations | Counterevidence / limits | Confidence and what would change it |
|---|---|---|---|
| P1 majority orientation | E1, E2, E5, E6 | Current app already has 61/shortfall; binary frames do not transfer | High that references show it; medium predicted incremental impact. Test first-time majority answers. |
| P2 co-located reference/edit/result | E2, E3, E4; local editor | E3 accepts 100.8%; E4 has opaque errors | High observed layout; medium comprehension inference. Test precise edits and reference recall. |
| P3 phone consequence strip | Local phone sheet; E2/E3 local feedback | Extra sticky chrome can consume screen; no comparative user test | Medium. Compare task completion with/without a compact strip at 390px and zoom. |
| P4 simpler coalition toggle | E2; E7 instructions only | App's exclusions are valuable; no evidence users actually miscycle | Medium. Preserve explicit constraints and test removal/exclusion distinction. |
| P5 rule explanations by consequence | E1; local threshold crossing; E10 headings | Norwegian/NZ rules differ; no external evidence of exact causal seat tracing | High for contextual explanation, medium implementation scope. Engine-supported event explanations only. |
| P6 baseline on deltas | E3, E5, E8 | Baselines can legitimately differ; exports not round-trip tested | High semantic need. Review every generated comparison artefact. |
| P7 distinguish status | E1/E5/E6 and local banner | E2/E6 stale live chrome; current app already warns | High need, medium added value. Test shared-view interpretation. |
| P8 map questions/denominators | E2/E5/E6/E8 | Several mode attempts failed; new cartogram may add cost without benefit | High for labels, low–medium for new geometry. Need locality task evidence before building. |
| P9 assumption-preserving shares | E4/E9 controls, local share generation | No recipient round-trip completed; cannot claim preservation verified | Medium. Inspect fresh-context import/link replay and data-version mismatch. |
| P10 question-led depth/recovery | E1/E2/E4; local What-if | Expert tables remain necessary; existing levels already implement much | Medium–high. Test finding merge/split from Simple and recovery from a bad input. |

This is a design recommendation set, not implementation approval or a release checklist. The confidence levels concern the stated scoped claims, not product correctness or accessibility compliance. The counterevidence pass deliberately tested invalid totals, mobile cropping, partial loads, stale live states and contradictory-looking deltas. No timings, user preference statistics, conversion rates or accessibility scores were measured.

## Search and access record

Searches used Jina `search_web`, then selected pages were read with `read_url` and loaded through Playwright. Jina `capture_screenshot_url` was exercised on the NZ calculator; it returned a temporary hosted screenshot link, not a durable local artifact. Local evidence screenshots were saved by Playwright. Shared preview tools were tried first; exact-size Playwright was then used as explicitly requested. One preview tab opened for EC was closed at completion.

Discovery queries (grouped by intent; snippets were discovery only):

- `election MMP calculator New Zealand Electoral Commission`
- `coalition calculator Germany 2025 Zeit Guardian`
- `2024 election results Guardian Reuters BBC map`
- `ABC 2025 election calculator senate 270towin`
- `site.zeit.de 2025 koalitionsrechner bundestagswahl`
- `site.abc.net.au news elections 2025 calculator`
- `site.theguardian.com politics ng-interactive 2024 jul 04 general election results`
- `site.nos.nl coalitiewijzer 2025 zetels`
- `ZDF koalitionsrechner Bundestagswahl 2025 interaktiv`
- `NRK 2025 valg koalisjon kalkulator`
- `ABC senate calculator 2025 election`
- `interactive coalition calculator Germany 2025 percentages seats sliders`
- `site.abc.net.au/news/elections/federal/2025/results calculator`
- `site.ft.com germany election 2025 coalition calculator`

Selection favoured a coherent set of tasks over brand coverage: eight principal accessible products (NRK, NOS, Nowcast EU, Electoral Calculus, BBC, Reuters, Guardian, 270toWin), two partial-load products (ARD, NZ). The strongest comparisons are the operated calculators/coalition and explanation flows; BBC's map/search controls were operated, while complete constituency drilldown remained unresolved. This is international prior art across Norway, Netherlands, Germany, UK, US and NZ, not balanced geographic representation. No Spanish/Portuguese calculator was inspected deeply; no superiority claim against those unstudied products is warranted.

Other candidates and access outcomes:

- [ABC lower-house calculator](https://www.abc.net.au/res/sites/news-projects/elections-calculator-lower/1.1.0/index.html): blank rendered page and empty Jina extraction. Both requested viewport captures retained as `abc-desktop.png`, `abc-phone.png`. [ABC 2025 results](https://www.abc.net.au/news/elections/federal/2025/results) alternative timed out. Excluded from design claims rather than describing remembered functionality. Senate-calculator search returned unrelated US material; no Australian Senate product studied.
- [ZEIT 2025 results](https://www.zeit.de/politik/deutschland/2025-02/bundestagswahl-2025-wahlergebnisse-wahlkreise-live): error page with an explicit automated-access restriction. Stopped; no attempt to circumvent. `zeit-desktop.png`, `zeit-phone.png` document the failure, not the results product.
- FT search surfaced election polling coverage; not opened or treated as studied. ZDF, Politpro and other candidate names surfaced in search only. No public archive capture was needed for the final selection; inaccessible products were replaced or labelled partial.

Accounting: eight principal product deployments, two partial inspections, two excluded publisher families (ABC and ZEIT). Same-publisher URLs/tools do not increase independent-family counts. Search-engine result totals and downstream request/asset counts are not available as meaningful coverage measures. Full keyboard coverage, phone hardware behaviour, screen-reader output, engine correctness and successful external share replay: **not measured**. Underlying product publication dates are given where the interface states them; exact deployment build versions are **not available**. Effort estimates are relative author judgement.

Reproduction: use the listed canonical pages with the specified User-Agent, Chromium/Playwright 1.64.1, viewports 1440×900 and 390×844; decline optional cookies through ordinary controls; repeat the explicit actions in each record. Production app: use the repository's dependency lock, `npx vite build`, then `npx vite preview --port 5341`. Put temporary profiles, dependency copies and captures under project `.backup-scratch/`. Public pages may change, and a fresh run cannot reproduce an inaccessible historical deployment exactly; the retained prose records what was observed. Scratch exclusion was verified with `git check-ignore`, not with an external backup system.
