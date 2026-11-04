# Prior art: combined plan

4 November 2026. This file combines five studies:

| Short name | Report | What it covers |
|---|---|---|
| **FOSS** | `prior-art-foss.md` | 12 open-source election tools, with their code read |
| **IL** | `prior-art-israel.md` | Israeli sites, used hands-on |
| **World** | `prior-art-products-world.md` | international election sites, used hands-on |
| **Tools** | `prior-art-tools.md` | parameter and scenario tools: En-ROADS, Desmos, Excalidraw and others |
| **Expl** | `prior-art-explorables.md` | explorable explanations: Nicky Case, Distill, PhET and others |

The studies ran against the app as it stood just before the ten evaluation fixes (E1–E10) were merged. Where a fix already covers a finding, the plan says so.

**Verdict.** No study found a product worth copying wholesale. None found a reason to change the engine, the stack or the static deployment. Every report reached the same conclusion: the app's weakness is **continuity**. The edit, its consequence, the baseline and the assumptions it rests on should be visible together. The fix is to extend what already exists, not to add more tools.

## Where the reports agree (ranked)

"Votes" counts how many of the five reports independently recommend the item. The impact and effort ratings are the reports' own estimates, not measurements. Wave 1 is small or medium work with high agreement.

### Wave 1: continuity (do first)

| # | Change | Votes | Where | Notes |
|---|---|---|---|---|
| 1 | **The phone result strip.** While the phone edit sheet is open, a compact strip stays visible. It shows the selected list's seats and change, how many lists changed, and the active bloc or coalition total against 61. | 4 (Expl P1, World P3, Tools P3, IL #10) | `ListSidePanel.tsx`, `styles.css` | Reuse the existing preview. Proof: cross the threshold at 390×844 and read the coalition consequence without closing the sheet. |
| 2 | **One majority readout everywhere.** Show `X / 120 · Y short of 61` or `Y above 61`, in the same wording and position, on the bloc bar, in coalitions and next to the chamber. Coalition choices become explicit In / Out / Any controls in place of the three-click cycle. | 4 (World P1/P4, IL C1/#2, FOSS #8, Tools P3) | `Blocs.tsx`, `SeatSecurity.tsx` (`Coalitions`), `Hemicycle.tsx` | Keep the constraints and the minimal-winning list. |
| 3 | **Every number carries its baseline, grouping and status.** <ul><li>ChangeSummary becomes "Since official result".</li><li>Bloc totals name the active grouping and its date ("first government, 2022").</li><li>Compare states which scenario is the baseline.</li><li>Share changes are shown in percentage points.</li><li>A small status chip reads: official, pending gazette, hypothetical or experimental rule.</li><li>"No seats changed" must not hide vote, agreement or grouping changes.</li></ul> | 5 (World P6/P7, IL #1/#8/C2, Tools P8, Expl P2, FOSS #4) | `ChangeSummary.tsx`, `Blocs.tsx`, `Compare.tsx`, `TopBar.tsx` | IL saw a grouping-only edit appear as seat gains (`0 → 64`). That was before E1, so recheck it now. |
| 4 | **Explain the threshold crossing where it happens.** <ul><li>Use the familiar wording "מתחת לאחוז החסימה".</li><li>Show how many votes the list needs to cross, naming the vote source.</li><li>After a crossing, add one computed sentence: "passed the threshold, so qualifying votes and every allocation were recalculated", with a link to the walkthrough step.</li><li>Offer "just below / at / just above" checkpoints so a one-vote boundary can be reached without the slider.</li></ul> | 4 (IL #4/C4, World P5, Expl P4/P6, Tools P4) | `ListBars.tsx`, `ListDetail.tsx`, `Figures.tsx` | Never hardcode 3.25%; it differs by era. Never say the seats came from one rival. |
| 5 | **Named undo and history.** The button reads "History · 2 edits", and the undo tooltip names the action ("Undo: changed agreement partner"). | 1 (Tools P7), but S effort and supports #3 | `ChangeSummary.tsx`, `TopBar.tsx` | Reuse the action log. Do not create a second history. |
| 6 | **Show the vote-source assumption at every level.** A compact line reads "Votes come from: other lists proportionally". In Simple it is read-only and explains itself; it expands where the level allows. | 3 (Tools P5, Expl P6, World P10) | `ListDetail.tsx`, `SourcePicker.tsx` | Simple keeps its default. The assumption just stops being invisible. |

### Wave 2: sharing and explaining (medium)

| # | Change | Votes | Where |
|---|---|---|---|
| 7 | **Share the question, not just the inputs.** <ul><li>A "Copy snapshot link" carries a versioned view envelope: tool, selected list, coalition and compare target. It stays separate from the replay log.</li><li>A recipient-facing capsule reads "2022 baseline · Meretz 3.30% · votes drawn proportionally · official rules · first-government grouping".</li><li>Browser save, downloaded file, link and gallery are named distinctly.</li></ul> | 5 (FOSS #2, World P9, Tools P9, Expl P10, IL #8) | `store.ts` (`shareLink`), `TopBar.tsx`, `Scenarios.tsx` |
| 8 | **A composed figure export.** One image holds the election, scenario title, chamber, legend, coalition against 61, changes against baseline, source and date, and a "hypothetical scenario" label. It comes in square and wide formats. | 2 (FOSS #1, World P6) | `Hemicycle.tsx` exporter, with the chamber layout extracted first (FOSS #7) |
| 9 | **Starter questions on the opening board.** Offer two or three neutral, reversible challenges, for example "Can this list enter without new voters?" or "Can an agreement change seats when votes stay fixed?". Each opens the real editable scenario with its assumption shown and is undone as one action. | 4 (Tools P6, Expl P7, FOSS #3/#9, World P10) | `WhatIf.tsx`, `ScenarioGallery.tsx`, `App.tsx` |
| 10 | **Walkthrough, first step.** A five-stage overview with counts: all lists → qualifying → whole-quota seats → remainder seats → 120 (2022: 113 + 7). Each stage opens in place. | 3 (IL #5, Expl P3/P5, FOSS #3) | `Walkthrough.tsx` |

### Wave 3: larger work (after the demo)

- **Walkthrough as a drawing** (Expl P3/P4, L).
  - A persistent seat tray of 120 positions.
  - Quotient tracks with the winner labelled on the mark.
  - The exact table stays below as evidence.
- **Map modes with named denominators** (FOSS #5, IL #9, World P8, Expl P9, L).
  - Modes: selected list's share, absolute votes, turnout, and change between elections.
  - Keep "no data" distinct from zero.
  - Equal-sized dots are not voter weights.
- **Structure preview as a transformation** (Expl P8).
  - Source vote bars above the merged bar, with the threshold marker.
  - Never invent seat-transfer ribbons.
- **Entry tools** (IL #6/#7).
  - Searchable surplus-agreement partners.
  - Batch name and vote paste, with a preview and one undo.
- **Sensitivity marker** (Expl P6). The current input is marked on the seat staircase, and sampled and verified boundaries are drawn differently.
- **Independent engine checks** (FOSS #6). Reference fixtures from two independent open-source libraries (Votelib and one other), covering ties and threshold edges. This is engineering-only.
- **Task-grouped navigation and a task finder** with Hebrew aliases (Tools P10, IL #10).

## One decision for the owner: what the levels do

Tools P2 ("very high impact") and World P10 recommend that levels set **how much is open by default**, not **what is reachable**. Today a Simple user who wants to change a selected list's agreement has to switch the whole interface level. The alternative is an in-place "More options" that opens just that section.

PRODUCT.md already says "levels hide depth, never the existence of a feature" and "complexity is … never forced on the default view". In-place disclosure satisfies both, so I recommend it. It still changes how levels behave, so it is your call. Until you decide, the plan treats Wave 1 #6 as read-only in Simple.

## Already covered by E1–E10

- **Exactness labels (FOSS #4).** E4 fixed this in the seat-safety view. The label still needs to travel into `ListDetail.tsx` and exports; that is part of #3.
- **Phone election selector squeezed** (FOSS, IL C9). Fixed by E5.
- **Compare ignoring party-level blocs** (related to IL #1). Fixed by E1. The grouping-only display still needs a recheck under #3.
- **Escape inside inputs, keyboard reach for table rows, icon-button names.** Fixed by E9, E7 and E6.

## Keep: the app already does these better

All five reports independently listed these strengths:

- The exact, era-specific engine with an inspectable trace.
- Live preview with one undoable commit per edit.
- Reversible structural edits: merge and split, agreements, blocs.
- Neutral ink for changes, not red and green.
- The hatched threshold row.
- "No bloc" for historically excluded lists.
- Era-honest details, such as "no threshold" in 1949 and lottery warnings.
- Verified period logos.
- A static, account-free app in Hebrew and English with both themes.

## Avoid

The reports agree on avoiding these:

- Animation as the main explanation. A difference must remain after a highlight fades.
- Red and green gain/loss colouring.
- Ideological or "likely coalition" presets presented as neutral facts.
- Merging Arab lists into one actor, or permanently assigning Haredi parties to a bloc.
- Fake vote-flow or seat-transfer ribbons.
- Tweening seat counts through fractions.
- Polling or probability features without a separately calibrated model.
- Importing a backend, a state library or R/Python into production.
- Copying code from non-FOSS comparators. OWID's current Grapher, the Israeli map site, the vote-transfer explorer and Senedd are reference-only.

## Order and delegation

1. **Wave 1, as one Codex branch.** #1–#6, with e2e proofs in the eight demo-bar combinations, plus a recheck of the grouping-only Compare display.
2. **Re-evaluate against `docs/acceptance/demo-bar.md`.** Then the owner's 15-minute play test.
3. **Wave 2 in two parallel Codex branches.**
   - Sharing: #7 and #8.
   - Explaining: #9 and #10.
4. **Wave 3, chosen after the play test.**
