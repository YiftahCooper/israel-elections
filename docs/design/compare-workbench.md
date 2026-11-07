# Compare workbench: two live sides

Design, 7 November 2026 (task V3, design phase). Not implemented yet. Implementation follows in V3c.

Inputs:

- The owner's 7 November paragraph, quoted in §1.
- The V3a prior-art research, `docs/research/compare-prior-art.md` on its branch. Its principles are cited here as P1–P18 and its hard cases as HC.
- The scenario, reference and A/B/C model in [scenario-reference-and-custom-level.md](scenario-reference-and-custom-level.md) and [appearance-and-result-identity.md](appearance-and-result-identity.md).
- [Decision 0017](../decisions/0017-list-lineage-comparisons.md) on list lineage.
- The party registry (`data/meta/parties.json`, `partyAppearances`) and the lineage draft (`data/meta/party-lineage.json`).

Mock-ups (PNG, not committed) are in `.backup-scratch/owner-qs-1107/compare/`, numbered 01–11. Every number in them was computed by this repository's engine and actions (k25 and k26 official data). They are cited below as [M01]–[M11].

## 1. What the owner asked, generalised

> "There should be a compare screen that allows users to compare against scenarios or previous elections, and the key is that they should be able to change both sides of the comparison … copy fields from one scenario to the other, say amount of votes from 2022 to 2026 for a particular party … switch out entire parties … take likud from 2022 and replace likud in 2026 … Generalise the principles … so that the compare screen is truly effective as both an overview and a dynamic comparison."

His examples generalise into eight rules. Every later section applies them.

| # | Rule | His example it generalises |
|---|---|---|
| G1 | **Two equal, live sides.** Either side can be any election's official result, any saved scenario, the current scenario or an unsaved draft. Both sides are editable in place with every editor the app already has. Neither side is privileged. | "change both sides" |
| G2 | **Inputs travel; results recalculate.** Any input can be copied across: votes, turnout and totals, rules, agreements, candidates, constituent parties, identity, groupings, coalitions and colours. Seats, quotas, threshold vote counts and elected members are never copied. They are recalculated on the destination side (P4). | "amount of votes from 2022 to 2026" |
| G3 | **Any granularity.** One cell, one row, a selection of rows, every row of a kind ("all votes"), a whole part (agreements, rules, grouping) or a whole list. | "copy fields" |
| G4 | **Entities, not just numbers.** A list can be replaced wholesale, or added beside the existing lists. Mismatched lists are matched from sourced evidence, or mapped by hand. | "replace Likud 2026 with Likud 2022" |
| G5 | **A copy is an edit with an origin.** It is marked like any edit, says where it came from ("From 2022") and can be restored (mark every edit). | — |
| G6 | **Meaning is chosen, not assumed.** A vote copy can be a count, a share or a change. Where the balancing votes come from is the app's existing vote-source question, asked at the point of use (P8). | — |
| G7 | **One intention, one undo.** Each copy is a single all-or-nothing step on the destination side. The source side never changes (P10). | — |
| G8 | **Overview and workbench are one screen.** The chambers and blocs orient the reader; the aligned rows explain the change and are where editing happens. Editing either side reprices the overview live. | "overview and dynamic comparison" |

## 2. Layout (desktop, 1101 px and wider)

One full-width tool page, top to bottom [M01, M02]:

1. **Panel head.** "Compare", then **Save comparison** and **Share ▾** at the inline end.
2. **Two side cards** with a narrow centre column between them.
   - **Each card** holds:
     - the side picker (election · source);
     - the identity chip (the scenario swatch and name, or "Official result" with the neutral swatch);
     - the side's own undo and redo;
     - **Start over** once the side is edited (**Edit** before then);
     - its chamber (500 px wide at 1500 px);
     - its bloc bar with the 61 marker, and a legend.
   - **Frames.** An edited side's card frame takes its scenario identity colour; an official side keeps the neutral frame. This is the existing "chrome only" rule.
   - **The centre column** holds **⇄ Swap** and the key "Change: right − left".
3. **Toolbar.**
   - Filter: All · Different · Edited · Unmatched, each with a count.
   - Find a list.
   - A switch, "Lists with no seats".
   - The selection bar, when rows are ticked [M11].
   - **Matching** with a "N to check" chip.
4. **Head-to-head table** [M01].
   - Columns: tick box · left list (slip, name, note) · votes · share · seats ‖ centre ‖ seats · share · votes · list (slip, name, note) · row menu (⋯).
   - Names sit on the outer edges and numbers sit next to the centre, so the two seat counts are always adjacent.
   - The centre cell shows the seat change (SeatDelta ▲/▼), the share change in points and the match tag. On hover, focus or selection it also shows the two copy arrows, ← and →. The arrows' space is reserved, so nothing moves (no jumps).
5. **Key numbers and rules**, as a head-to-head band:
   - left value · centre label with its change · right value.
   - Input rows (turnout, registered voters, threshold, rule set, agreements) carry ← and → arrows.
   - Result rows (valid votes, votes per seat, votes with no seat) carry none.
6. **Entering and leaving the Knesset**, plus the candidate note: kept from today's Compare, collapsed by default.

**Physical pinning (Hebrew and English alike).** The left side, the right side and every column pair are pinned left-to-right in both languages, as the chambers already are today [M02, M04, M07]. This follows the owner's 4 November rule: numbers, time and before → after run left to right; only text mirrors.

- Text inside each cell, the panel chrome, menus and side panels mirror as usual.
- A copy arrow points physically at its destination in both languages.
- Its accessible name always says the destination in words: "Copy votes to 2026".

**No jumps.**

- Rows keep their order while editing. Re-sorting happens only through an explicit sort control.
- A row that stops being "Different" stays visible until the filter is re-applied (HC "Small viewport").
- Popovers open beside their anchor and never cover the row being acted on [M05].
- Side panels scroll independently.

## 3. The two sides

### 3.1 What a side can be

The side picker groups its choices. The existing `ChoicePicker` is reused, with the identity swatch shown on every choice:

| Group | Choices |
|---|---|
| This election | Official result · the current scenario · saved scenarios of this election |
| Other elections | Each election's official result, plus that election's saved scenarios as a nested level |
| Drafts | Unsaved comparison drafts kept for this session |

### 3.2 Defaults when Compare opens

These keep today's behaviour.

- **Right side:** the current scenario of the main board.
- **Left side:** today's automatic target:
  - the previous election when nothing is edited;
  - otherwise the loaded reference, or the official result.
- An explicit choice stays selected for the session.

### 3.3 Editing a side

- **Editing an official side** silently creates a draft for that side, with the next free identity colour and a name such as "2022 draft". The official dataset never changes (P1).
- **Same source on both sides.** Choosing the same saved scenario on both sides opens two independent drafts (HC "Both sides opened from one saved scenario").
  - Saving one never overwrites the other silently.
  - Save offers "Save as new" or "Overwrite *name*". This is the existing duplicate-name dialog.
- **The current scenario on the right** is the main board's own session. An edit made in Compare is the same edit as one made on the Overview, with the same history (owner question 2 in notes.md; recommended).
- **A draft side** is a `ScenarioSession` kept in `compare.sides`. Drafts survive switching tabs and elections for the session, like `scenarioDrafts`.

### 3.4 Focus and undo

- One side is *focused*: the one last edited, clicked or keyboard-focused. A 2 px focus ring on its card marks it.
- Ctrl/⌘ Z and Y act on the focused side. Each card's own ↶ ↷ always act on that card.
- The band's undo acts on the main board's session. When the right side is the current scenario, that is the same history.

### 3.5 Swap

Swap exchanges the two side sessions: scenario, history, reference, lock and selection. Change signs reverse. No data changes and nothing is logged.

Pending operations are cancelled with a toast: a selection keeps its rows, while an open copy dialog closes. They are never retargeted by position (HC "Swap during selection").

## 4. Overview

- **Chambers.** Each side's chamber uses its own grouping and colours.
  - Seats gained through that side's own edits are outlined, relative to that side's starting point. The caption says so [M03].
  - Cross-side seat outlines are not drawn: they would imply individual seats moved.
- **Blocs.** Both sides use the same *kind* of grouping when one exists, for example pre-election blocs on both.
  - The kind is chosen with one grouping picker, shared by both sides.
  - Where one side lacks that kind, the picker shows a "different groupings" note rather than inventing a baseline (HC "Different bloc/family definitions").
  - A custom grouping with no counterpart shows only on its own side.
- **Every aggregate opens its rows.**
  - Clicking a bloc segment filters the table to that bloc's members on that side.
  - Clicking a key number opens its popover.
  - Clicking a seat selects its row (Interaction principle 1).
- **Majority.** The 61 line stays on both bloc bars. With experimental chamber sizes, each side shows its own majority, and the table adds a seat-share column (HC on unequal chambers).

## 5. The table and matching

### 5.1 Rows

Each row pairs a set of left lists with a set of right lists:

- one-to-one;
- one-to-none ("New" or "Ended");
- many-to-one ("Merged");
- one-to-many ("Split").

The engine's numbers come from each side's own allocation. Each row shows sums for its sets.

**Merges.** A merged set is summed: Hadash–Ta'al + Balad, 317,352 votes and 5 seats, against the Joint List's 11.

**Splits.** A split is shown as consecutive rows plus a group line:

- The source list's numbers appear once, on its main successor's row.
- Its other successors show "in Religious Zionism" instead of numbers.
- Their change cell says "see group".
- The group line carries the honest comparison: "Religious Zionism 2022 → 3 lists, 14 → 13, ▼ −1" [M01].
- No per-successor share of 2022 votes is ever shown (P16, HC "Joint list later divides").

**Match tags** are words, not icons. English and Hebrew; (i) gives the source of each tag:

| Tag | Hebrew | Meaning | Evidence |
|---|---|---|---|
| Same | אותה | The same party ran, alone or leading the list | Same `partyId` as singleton or leading constituent |
| Renamed | שם חדש | The party is unchanged but renamed | Lineage edge `renamed-to` |
| Joined | הצטרפה | The left party is now a constituent of a joint list led by another party | The left party appears as a non-leading constituent |
| Merged | אוחדו | Several left lists are one list now | Shared constituents, or edge `merged-into` (documented) |
| Split | פוצלה | One left list became several | Constituents spread over several lists, or edge `split-from` |
| New | חדשה | No sourced predecessor | — |
| Ended | הסתיימה | No sourced successor | — |
| Check | לבדיקה | A relation is announced but unconfirmed | Lineage `pending` edge, for example `democrats-2024` |
| Yours | שלכם | Mapped by the user | Comparison mapping |

### 5.2 How rows are matched (cross-election)

1. **Leading party.** Each list's leading party is:
   - the singleton `partyId`; or
   - the constituent of candidate #1 (`SimCandidate.partyId`); or
   - otherwise the first constituent.
2. **Primary pairs.** A right list pairs with the left list that shares its leading party. Each left list is primary for at most one row.
   - Examples: Likud ↔ Likud; Religious Zionism ↔ Religious Zionism–Zehut (both led by Tkuma).
3. **Groups.**
   - Lists that share non-leading constituents form a Merged or Split group, but only when no primary pair already explains them.
   - Hadash–Ta'al and Balad share constituents with the Joint List → Merged.
   - Otzma Yehudit's constituents came from 2022 Religious Zionism → a Split row in the RZ group.
4. **Partner annotations, not groups.**
   - A constituent that moved between unrelated lists annotates both rows instead of chaining them into one group.
   - Example: New Hope moved from National Unity 2022 to Likud 2026. Likud shows "with New Hope"; National Unity shows the move. This prevents the connected-component trap the research warns about.
5. **Lineage edges** add Renamed, Merged and Split pairs between differently-identified parties.
   - Only documented edges count. `pending` edges produce **Check** rows. They are shown, but not used for copying until the user accepts them.
   - Example: Labor → The Democrats is announced, not legally completed. It shares 35 candidates with Labor's 2022 roster [M07].
6. **Everything else** is New or Ended. It is never matched by name, ballot letters or vote rank (P6, HC "Same name/letters").

**Same-election comparisons** keep today's `comparisonGroups` (originIds, decision 0017): merges, splits and added lists become Merged, Split and New rows.

**Display order.** Rows follow the right side's seats, descending. Ended rows come last. The order is stable during edits.

### 5.3 Mapping review and "Map to…"

**Matching** opens a side panel [M07]. It lists every pair with its tag, a one-line reason and a source (i). Its filters are All, To check and Unmatched.

**To check:**

- **Accept for this comparison** turns the pair into a Same/Merged pair with a "Yours" note.
- **No match** removes it.

**Unmatched rows** get **Map to…**, a searchable list of the other side's lists.

- Suggestions are ranked by shared candidates. Person identity is the Knesset member id (`bio.knesset`), never the name alone.
- Example: Yashar! 2026 shares 8 candidates with National Unity 2022 and 1 with Yesh Atid.
- Suggestions are labelled by count, never asserted.

**Mappings are analysis (class B).**

- They are stored with the comparison, never in either scenario.
- They never change a result, a marker or the identity colour.
- They do change which rows copy to which.
- Removing a "Yours" mapping restores the suggestion.
- A user mapping never becomes historical evidence; HC "Source is already synthetic" keeps that origin.

### 5.4 Filters, search and selection

- **Filters.**
  - **Different:** any input or seat differs, including identity, roster, agreements and bloc. "No seat change" never hides these.
  - **Edited:** edited on either side relative to that side's starting point.
  - **Unmatched:** New, Ended or Check rows.
- **No-seat lists.** The "Lists with no seats" switch adds rows where neither side won a seat. It is off by default, except under the Unmatched filter.
- **Search** matches either side's names in both languages, plus historical aliases.
- **Selection.**
  - Tick boxes select rows on either side.
  - The selection bar offers **Copy votes → right**, **← left** and **Clear**.
  - Selection survives filtering. The bar counts selected rows, compatible rows and rows needing a decision (HC "Batch has one invalid item").

## 6. Copy affordances

| Route | Where | What it does |
|---|---|---|
| Centre arrows | On row hover, focus or selection [M04] | Copy that row's votes in the arrow's direction, using the remembered or asked mode (§7.1). Tooltip: "Copy votes to 2026 · Likud". |
| Cell arrows | On hovering a single input cell (votes, share) | Copy that one field. |
| Row menu ⋯ | Every row [M04] | Copy to the right: Votes · Whole list… · Candidates · Colour and logo. Copy to the left: Votes. **Map to…** |
| Selection bar | Ticked rows [M11] | Copy votes for all ticked rows in one step. |
| Band arrows | Key numbers and rules | Copy turnout, registered voters, invalid ballots, threshold, rule set or agreements. |
| Copy… (Expert) | Panel head | A paste-special sheet with field checkboxes × scope (selection / matched rows / all), for bundles. |
| Phone row sheet | Tap a row [M09] | Both sides' values; full-width copy buttons with their outcomes; Edit left / Edit right. |

**Accessibility.**

- Every arrow is a real button whose name says the field and the destination, for example "Copy Likud's votes to 2026".
- After a copy, the change is announced politely: "Likud votes copied to 2026. Likud 30 seats".
- Drag-and-drop is deferred (§12). Every copy has a click, keyboard and touch route.

## 7. Copy semantics

**General rules (all fields):**

- A copy is a *snapshot*: later edits on the source never change it (P11).
- The destination recalculates; the source never changes.
- The whole step validates first and then commits, or nothing changes (P10, `dispatchMany`).
- The preview states the inputs and the recalculated seats, computed by the real engine on a scratch copy [M05, M06].
- A copy into a stale destination is refused and re-previewed (HC "A source draft changes after preview"). Stale means the destination's history moved after the preview opened.
- Copying the same value again replaces it; it never adds it again.

### 7.1 Votes

The question is asked at the point of use [M05]. The dialog shows each option's outcome:

- **Copy as:** Share (recommended default across elections; owner question 1) · Count · Change.
- **Balance with:** Other lists, proportionally · New voters / voters staying home · One list…. This is the existing `voteSource` preference and its labels.
- **Use this choice:** Just this once · For this list · Always. These are the existing scopes, managed in Your settings.

Within one election, Count is the default and no mode question is asked: share and count are then the same thing, up to the totals.

For one list with destination votes `v`, all valid votes `V` and source values `s`, `S`:

| Mode | Target `x` | Exactness |
|---|---|---|
| **Count** | `x = s`. The difference `x − v` is balanced by the vote source (`deltaAction`). | Exact integers. |
| **Share** | `p = s / S`, an exact rational, never the rounded display. With a fixed total (other lists, or one list): `x = p·V`. With new voters: `x = p·(V − v)/(1 − p)`. | Rational arithmetic, rounded to the nearest integer. If rounding would put the list on the other side of the destination threshold from where the exact `p` lies, round toward the exact side. `p = 1`, or `p ≥ 1 −` (other lists' minimum) under new voters, is refused with "Not possible: the other lists would need negative votes". |
| **Change** | `Δ = s − s₀`, where `s₀` is the source row at its side's starting point. Applied as points of share (default) or as a count. Offered only when the source row has an edit. | As for Share or Count. |

**Effects on totals:**

- **Other lists proportionally:** the valid total and turnout stay fixed. Other lists change in proportion (`redistribute`).
- **New voters:** valid votes and votes cast change; registered voters stay fixed, so turnout changes.
  - Gains are capped at the voters staying home (`stayingHome`). A capped copy says "Capped at 1,614,584 voters staying home" in the preview and copies the cap. It never silently scales.
  - A loss sends voters home.
- **One list:** only that list gives or takes. A copy is refused if the donor lacks the votes.
- **Never implicit:** registered voters and invalid ballots never change as a side effect of a vote copy (HC "Different electorate").

**Several rows at once** (selection or "all matched"):

- Copies apply simultaneously, in one transaction.
- Under "other lists proportionally", only lists *outside* the copied set absorb the balance.
- If the copied shares sum to 100% or more, the copy is refused.
- Count for every list replaces the valid total. Then turnout = (valid + invalid) / registered. If votes cast would exceed registered voters, the preview offers "Also copy registered voters" or refuses.
- **"All votes as shares" with unmatched destination lists**, such as Yashar! 2026 copying from 2022:
  - Default: unmatched lists keep their own share, and matched lists divide the rest in the source's proportions.
  - Alternative: "Unmatched lists get no votes", explicit and previewed.

**Groups:**

- **Merged → one** (left two lists, right one list): copying to the one list uses the sum.
- **One → merged** (one into two): needs split weights.
  - Default: the destination lists' own current proportions, labelled "keeps their current balance".
  - Alternative: custom weights.
  - Each such copy carries the existing caveat that a joint list's voters cannot be divided factually.
- **Split groups** are copied as a whole group only. A per-row copy is disabled with "2022 Religious Zionism's votes can't be divided by list". The group copy distributes over the destination lists by their own current proportions, or by custom weights (HC "Joint list later divides").

**Withdrawn lists:**

- A withdrawn destination (Blue and White 2026) offers **Reinstate and copy** as one step. The existing held-votes bookkeeping is kept (HC "Source or target withdrew").
- A withdrawn source copies nothing and says why. A list never receives votes while withdrawn.

### 7.2 Totals and rules

| Field | Copy rule | Action |
|---|---|---|
| Turnout | Copies the percentage. The destination's lists and invalid ballots scale in proportion, so shares are kept. | `setTurnout` |
| Registered voters | Copies the count. The existing warning applies if votes cast would exceed it. | `setTotals` |
| Invalid ballots | As a rate of votes cast (default) or a count. | `setTotals` |
| Threshold % | Copies the exact decimal string. If it differs from the destination's historical law, the side switches to experimental rules (with the Experimental chip) in the same step. | `setMode` + `setRules` |
| Rule set / method | Copies the whole rule set (era preset or the source's rules). One part marker. | `startPart` rules |
| Seats in the Knesset | Expert. Experimental rules, as above. | `setRules` |
| Threshold votes, quota, remainder seats | Results: never copied. | — |

### 7.3 Agreements

- **Copying one agreement** maps both members through the row matching.
- It is refused, with the reason, if a member has no 1:1 counterpart or the pair breaks the destination's rules (size, qualification). Example: "Labor–Meretz: Labor has no confirmed counterpart in 2026".
- If a counterpart already has a partner, the dialog offers **Replace its agreement** or **Skip**.
- **Copying all agreements** is `startPart('agreements')` with the mapped snapshot. Pairs that are not copied are listed in the preview, never dropped silently (HC "Agreement partner does not exist").

### 7.4 Candidates, parties and identity

| Field | Rule |
|---|---|
| Candidates (roster and order) | Replace the destination list's roster with the source roster. Candidates keep their source ids, which are election-prefixed and unique. `originListId` becomes the destination list id, so lineage inside the scenario stays coherent, and a new `importedFrom: {electionId, listId}` keeps the provenance (HC "Cross-era roster import"). Elected members are recalculated only to the supported roster depth. `rosterTruncated` and `rosterUnavailable` travel with the roster. Missing candidates are never invented. |
| Constituent parties | Follow the candidates, since `parties` derives from the roster's `partyId`s. Locked to the candidates choice [M06]. A faction-split state on that list is cleared if its parties change. |
| Name and short names | Optional. Never on by default when the names are identical. |
| Ballot letters | Copied only if no other destination list uses them; otherwise kept, with the reason. |
| Person identity (entering and leaving) | Knesset member id when both sides have it; otherwise the people are treated as different. Never matched by name alone. |

### 7.5 Groupings, coalitions and appearance

| Field | Class | Rule |
|---|---|---|
| A list's bloc | B | Allowed when the destination has the same grouping scheme and bloc id. Otherwise the menu offers "Copy grouping…". |
| A whole grouping | B | `startPart('blocs', saved snapshot)` with list membership mapped. Unmatched destination lists go to No bloc. Marked as an analysis edit. |
| Coalition | B | Membership mapped, with the unmapped lists listed. |
| List colour | C | Appearance only: no marker, no tint (owner's 6 November rule). |
| Logo | C | Only inside **Replace list** with "Colour and logo" ticked. A logo is the list's mark *at that election*, so pasting it alone onto another election's list would misattribute it. |

### 7.6 Never copied

- Seats and elected members: these are results.
- A seat *target* belongs to the What-if inverse search. The row menu may link to it ("Find votes for 32 seats", v1.1).
- Locality and ballot-station results: a national copy never fabricates local allocations, and the map keeps official local results (HC "National edit versus map").

## 8. Replace a list (the Likud example)

The row menu offers **Whole list…** [M06]. The dialog shows the source and destination with their match tag.

**Take from 2022** (checkboxes):

- **Votes** (on), in the chosen mode.
- **Candidates** (on).
- **Constituent parties** (follows the candidates).
- **Name and letters** (off).
- **Colour and logo** (off; appearance).

**Kept from 2026** (one line): rules, agreements, bloc and coalition.

- They are kept because the destination slot keeps its list id.
- Copying them is a separate, explicit act (§7.2–7.5).

**Result in 2026:** the engine's exact seat changes, plus entering and leaving counts with the first names.

- Example: Likud 27 → 30 ▲ +3; Yashar! 21 → 19 ▼ −2; Ra'am 8 → 7 ▼ −1.
- Entering 13, leaving 10.

**Buttons:**

- **Replace:** one step, one part-level marker "Replaced from 2022" on that list.
- **Add as a new list instead:** a new `sim-…` list with the source's identity and roster.
  - Its votes follow the vote dialog; it joins no agreement and sits in No bloc.
  - Ballot letters are kept if free; otherwise the existing new-list letter rule applies.
- **Cancel.**

**Many-to-one replacement** ("Replace the Joint List with 2022 Hadash–Ta'al and Balad") is **Add as new lists** plus withdrawing the destination list. One step, previewed. It is offered only from a Merged or Split row.

Replacing a list with its own election's official version is the existing `resetList` / Restore.

## 9. Provenance and markers

**Field copies.**

- A copied field uses the shared edit marker, with the text "From 2022" (or "From *scenario name*") instead of "Edited" [M03, M10].
- Hover or focus opens the marker's tooltip:
  - field and source;
  - the method, for example "Share 23.41% (2022, official) → 1,332,256";
  - the previous value and the balance policy;
  - "A snapshot: later 2022 edits don't change it";
  - **Restore votes** and **Show in 2022** (scrolls to and flashes the source row).

**Other classes.**

- Whole-list replacement has one part-level marker: "Replaced from 2022". Its induced changes get none, following the whole-part replacement rule.
- Group, grouping and coalition copies use the same marker at their B-class outlets.
- Appearance copies are unmarked.

**After later edits.**

- A later manual edit of the same field turns the marker into "Edited". Its tooltip still lists "first copied from 2022".
- Saving a side quiets its markers against the new reference, as today. The provenance stays in History and in the side's "Since …" summary: "Likud votes from 2022".

**Truth labels stay.** At every level, the side frames, identity chips and markers cannot be hidden.

## 10. Save and share

**Save comparison:**

- Asks for a name. Unsaved draft sides are saved first: they are named "*comparison name* – left/right", and each name is editable in the same dialog.
- The comparison record then stores:
  - `{ id, name, left: SideRef, right: SideRef, mappings, grouping, filter }`;
  - where `SideRef = { kind: 'official', electionId } | { kind: 'saved', id }`.
- Saved comparisons are listed in Scenarios under "Comparisons".

**Share ▾:**

- **Copy link** gives `#c=<b64url(zip({ left: {electionId, name, log}, right: {…}, mappings, grouping }))>`. It reuses the scenario link's encoding for each side.
- Opening the link opens Compare with both sides as drafts. A malformed link uses the existing damaged-link toast.
- **Export image** exports the overview (both chambers and bloc bars), with each side's name on it.

## 11. Levels and phone

### 11.1 Levels

| Capability | Simple | Standard | Expert |
|---|---|---|---|
| Two side pickers, swap, chambers, bloc bars, key numbers | ✓ | ✓ | ✓ |
| Table | Lists with seats; seats and change only | + votes, share; filters; search | + no-seat switch default on; share-points column always |
| Editing sides (votes in the list panel, Start over) | ✓ | ✓ | ✓ |
| Copy votes (centre arrows, row sheet) | ✓ (remembered or asked mode) | ✓ | ✓ |
| Selection and bulk copy | — | ✓ | ✓ |
| Whole list (Replace / Add) | — | ✓ | ✓ |
| Matching panel, Map to… | Tags only | ✓ | ✓ |
| Totals, threshold and rules copy | Turnout only | + registered, threshold | + rule set, seats, invalid rate/count |
| Agreements, grouping, coalition copy | — | ✓ | ✓ |
| Copy… paste-special sheet; As change | — | — | ✓ |

**Never hidden at any level:** markers, frames, Check tags and the "can't be divided" notices. Features hidden at a level stay reachable in place through the existing "More options" disclosure and the Custom level, so each needs a `features.ts` entry.

### 11.2 Phone (760 px and below) [M08–M10]

- **Side cards:** two compact cards side by side (pinned left → right), each 175 px.
  - Each shows: picker, identity chip, a 160 px chamber and the bloc bar numbers.
  - Swap and Save sit in the panel head.
- **Rows.** Each row is one line:
  - right side's slip and name, plus any marker;
  - left seats → right seats and the change, pinned left-to-right;
  - a second line with "2022: *left name(s)*" and the match tag.
- **Row sheet.** Tapping a row opens a bottom sheet [M09]:
  - both sides' figures;
  - copy buttons in both directions, each showing its outcome;
  - **Edit 2022** / **Edit 2026**, which open that side's list panel as a full-screen sheet;
  - the balance policy, with "change".
  - Targets are 44 px. There is no hover.
- **Selection** uses a "Select" toggle in the toolbar, not long-press.
- **Key numbers** stack as head-to-head rows. The matching panel becomes a full-screen sheet.

## 12. Hard cases, each resolved

| Hard case (V3a) | Resolution |
|---|---|
| A joint list later divides | A Split group with one honest group line. There are no per-successor 2022 numbers. Per-row copy is disabled, and the group copy uses explicit weights plus the voters-can't-be-split caveat (§5.1, §7.1). |
| Several lists merge, one constituent elsewhere | Primary pairing plus partner annotations (§5.2.4). A bulk copy refuses to consume one source row twice. Deliberate duplication needs the explicit "Add as new list". |
| Same name or letters, different organisation | Matching never uses names or letters (§5.2.6). Letters are copied only when free. |
| A source that is synthetic or user-mapped | The "Yours" tag and `importedFrom` provenance are kept. History never calls it sourced. |
| Different electorate or valid total | Count and Share are distinct choices, each previewed. Registered voters and invalid ballots never move implicitly (§7.1). |
| Share copy and integer rounding | Exact rational, nearest integer, threshold-side guard, refusal when impossible (§7.1). |
| The source or destination withdrew | Reinstate and copy; never into a withdrawn list (§7.1). |
| Different thresholds, methods or candidate-cap eras | Each side keeps its rules unless they are copied explicitly. A threshold copy turns the side experimental. The preview says "rules differ" when they do. |
| An agreement partner is missing, taken or replaced | Mapped or listed as not copied; Replace or Skip on conflict (§7.3). |
| Roster missing, truncated, duplicated or renamed | Flags travel. Elected members only to the supported depth. Identity by Knesset id (§7.4). |
| Different bloc or family definitions | One shared grouping kind; "different groupings" note; whole-grouping copy maps membership (§4, §7.5). |
| The source changes after preview | A snapshot, plus a stale-destination check (§7). |
| Both sides opened from one saved scenario | Independent drafts; Save as new / Overwrite (§3.3). |
| Swap during selection, mapping or preview | Swap cancels open dialogs and keeps selections by row identity (§3.5). |
| Undo after a copy, then an independent edit | Per-side history: undo on the destination undoes the copy only once later steps are undone (§3.4). |
| A batch has one invalid item | Nothing applies. The bar names the row needing a decision (§5.4). |
| Cross-era roster import | `importedFrom`; `originListId` set to the destination (§7.4). |
| National edit versus map and localities | No local fabrication (§7.6). |
| Missing baseline, unpublished result or load failure | The side shows its load error with Retry. The other side and both drafts stay; it never falls back to another comparator under the same label. |
| A small viewport, or an edited row becomes equal | Rows stay until the filter is re-applied (§2). |
| Extra: the same list on both sides of one election | Its rows show the "Same" tag and its edits only; copying restores a list part, equivalent to Restore. |
| Extra: 1949 or 1951 rules, or the 1977 candidate cap | Rules travel only as whole era presets or exact fields. The cap still applies to an imported roster under the destination's rules. |

## 13. Data model and actions

**Store** (`store.ts`, local additions only):

```ts
compare: {
  left: SideState; right: SideState;   // right.kind === 'current' shares the main session
  focus: 'left' | 'right';
  mappings: MappingOverride[];         // analysis (B), saved with the comparison
  grouping: string | null;             // the shared grouping kind
  filter: 'all' | 'different' | 'edited' | 'unmatched'; zeroSeats: boolean; selected: string[];
}
type SideState = { ref: SideRef | { kind: 'current' } | { kind: 'draft'; id: string }; session?: ScenarioSession };
type MappingOverride = { left: string[]; right: string[]; status: 'accepted' | 'rejected' | 'user' };
```

`compareWith` stays as the left side's initial choice, for link and test compatibility.

**Actions** (`scenario.ts`, `actions.ts`, `actionClassification.ts`):

- `copyFrom`:

  ```ts
  { type: 'copyFrom'; provenance: CopyProvenance; actions: Action[] }
  CopyProvenance = { electionId; sourceName; sourceRef: SideRef | 'draft'; listIds: string[];
                     targetListIds: string[]; fields: string[]; mode: 'count' | 'share' | 'change';
                     policy: SourceChoice; snapshotAt: string }
  ```

  - It applies the inner, already concrete actions in order, so replay needs no access to the source.
  - Classification is `conditional`: fact if any inner action is a fact, analysis if any is analysis.
  - `recordEditScope` records the provenance against each changed path, for the "From 2022" marker.
- `replaceList: { listId; with: SimList; fields: ('votes' | 'candidates' | 'identity' | 'appearance')[]; provenance }`.
  - It is a part-scoped replacement with one marker.
  - The votes change itself is an inner `copyFrom`.
  - `addList` gains optional `candidates`, `parties`, `importedFrom` for "Add as new list".
- `SimCandidate.importedFrom?: { electionId; listId }`. It is class A (candidate field).

**Derivations:**

- New `src/app/compare/match.ts`: `matchRows(left, right, registry, lineage, overrides) → Row[]`.
  - It is pure and unit-tested.
  - Same-election comparisons delegate to `comparisonGroups`.
- New `src/app/compare/copy.ts`: `planCopy(source, dest, rows, fields, mode, policy) → { actions, preview } | Refusal`.
  - It is pure. Its preview uses `allocationOf` on the dest scratch result.

The engine is unchanged.

**Saved and shared format:** `SavedComparison` (above), plus the `#c=` link. Saved scenarios are unchanged. A scenario containing `copyFrom` replays like any log.

## 14. v1 and later

| In v1 | Why |
|---|---|
| Two editable sides from any source; swap; per-side undo and Start over | The core of the request (G1). |
| Overview: chambers, bloc bars, key numbers and rules band | Owner: "visual first" (4 Nov). |
| Head-to-head table with matching tags, group lines, filters, search | Needed to make cross-election copying correct. |
| Copy votes per row, cell, selection and all matched; Count, Share and Change; ask-at-use with three scopes | His named example, generalised (G2, G3, G6). |
| Copy turnout, registered, invalid, threshold, rule set, agreements, grouping, coalition, colour | Cheap once `copyFrom` exists. Same-shape actions. |
| Replace list / Add as new list | His second example (G4). |
| Mapping panel: Check, accept, Map to… with shared-candidate suggestions | Without it, half the rows of a cross-election comparison can't copy. |
| Provenance markers, Restore, Show in source | Mark every edit (G5). |
| Save comparison and share link | Comparisons are worth returning to. |
| Phone row sheet | A two-sided table is unusable at 390 px without it. |

| Later | Why not v1 |
|---|---|
| **Apply a swing to another side** ("2022 → 2026 change applied to 2019"). Generalises Change to a third election. | Needs a three-election picker and a clear uniform-swing caveat (the research warns that a two-party swingometer doesn't transfer). v1.1, on top of `copyFrom`. |
| **Three-way compare** (a common base) | Most comparisons have no meaningful common ancestor. A third column breaks the phone layout. Revisit if users compare many drafts of one election. |
| **Live links** (a field that follows its source) | Needs cycle, unlink, deletion and share semantics (P11). Snapshot plus Restore covers v1. |
| **Drag and drop** between sides | Buttons, menus and the sheet cover every case. Drag adds target-highlight and accessibility work. |
| **Pin rows; difference-only *columns*** | The filters cover most of it. Pinning is cheap but not asked for. |
| **Copy single candidates** or reorder across sides | The roster replace covers the owner's case. Per-candidate copy needs person-identity rules that are not yet settled. |
| **Seat targets** ("give Likud 32") | Belongs to the What-if inverse search. Link from the row menu in v1.1. |
| **Map swipe / locality comparison** | National copies don't produce local results (§7.6). A swipe hides values. |
| **Sync scroll** | Not needed: the head-to-head table is one scroll. |

### Deferred from v1 (b87dd38, 7 Nov)

Built in v1 except for these. Each stays in the spec above; none blocks v1.

- **Grouping and coalition copies** (§7.5). Rows, totals, rules, agreements, candidates and colour copy; groupings and coalitions do not yet.
- **Paste-special sheet** and **Copy all matched** as one control (§6). Bulk copy works through the row selection.
- **One shared grouping picker** for both sides (§4). Each side shows its own scheme in its chamber.
- **Level entries in `features.ts`** for the Compare controls. Levels are gated inside the workbench for now.
- **Export as image** of the workbench.
- **One part-level marker for a whole-list replace** ("Replaced from 2022", §8). v1 marks each copied field "From 2022" instead.
- **Turnout copy markers.** A turnout copy marks invalid ballots only, not every scaled list.
- **Entering/leaving people across elections.** v1 shows them only when both sides are the same election.

### Decided after v1 (coordinator defaults, 7 Nov; the owner may veto)

- **The main scenario always sits on the right** (`COMPARE_MAIN_SIDE`), whatever the years; the side labels carry the year order. This supersedes "the earlier election on the left" (consistent siblings, no jumps).
- **"Lists with no seats"** starts from Settings → Lists with no seats (All: every seatless row; Over 0.5%: those with at least 0.5% on either side; Folded: none); the switch then shows or hides all of them for the visit (docs/design/settings.md). Members of a merged or split group always show, including those with no seats (Balad 2022 in the Joint List row; Noam in the Religious Zionism group).
- **A person on two lists after an import** (Whole list or Candidates) gets an inline warning naming the person and the other list, with a one-tap "Remove from *list*". It never blocks and never removes on its own. People are matched by Knesset member record, never by name.
- **Saved comparisons are listed on the Scenarios page** too, with Open, Copy link and Delete.
- **Share change** in the Change column carries its unit ("pp" / "נק׳ אחוז"), explained in the column header's (i). Its digits follow Settings → Max decimal places through the shared formatter (`fmtPp`: signed, and a non-zero change is never shown as 0, "+<0.1"); both sides' shares use the threshold-safe `fmtPct`.
- **Matching runs from the earlier side to the later one** and is mirrored when the later side is drawn on the left, so a merger or split reads the same whichever side the main scenario sits on. Your pairings are stored in that earlier → later order.

## 15. Test plan

**Unit (vitest):**

- **`match.ts` on k25 ↔ k26:**
  - Likud Same, with New Hope annotated;
  - Yesh Atid → Together Joined;
  - Hadash–Ta'al + Balad → Joint List Merged;
  - Labor → Democrats Check;
  - the Religious Zionism Split group with its group totals;
  - National Unity Split and Ended;
  - Yashar! New;
  - no name or letter matching;
  - each left list primary at most once.
- **`match.ts` coverage:** every adjacent election pair, k1–k26, with no left list consumed twice and no duplicate rows. Same-election comparisons equal `comparisonGroups`.
- **`planCopy` votes:**
  - Count, Share and Change under each `SourceChoice`;
  - the mock-up figures exactly: Likud 2022 → 2026 as share is 1,332,256 votes and 30 seats; as count it is 26 seats;
  - turnout fixed under proportional and changed under new voters;
  - the staying-home cap;
  - refusals (p = 1, insufficient donor, sum ≥ 100%);
  - the threshold-side rounding guard;
  - group copies with default and custom weights;
  - withdrawn reinstate-and-copy;
  - all-or-nothing on an invalid row.
- **Other copy fields:**
  - totals, rules (experimental switch), agreements (mapping, conflict, refusal list), grouping (B only, no result identity), colour (C, no marker);
  - roster import (`importedFrom`, `originListId`, truncation flags, the candidate cap).
- **Actions:**
  - `copyFrom` and `replaceList` replay, classification, `isFactAction` and `isAnalysisAction`;
  - `recordEditScope` provenance;
  - saved-log round trip;
  - undo restores the exact prior scenario.
- **Store:** swap keeps histories and reverses signs; the focus/undo routing; the same saved scenario on both sides gives independent drafts.
- **Links:** `SavedComparison` and the `#c=` link round-trip, and damaged links.

**E2e (Playwright, the real app):**

- **Desktop**, at 1500 and 1024, in he/en and light/dark:
  - open Compare on k26 and k25 (rows and tags);
  - copy Likud votes by share via the arrow and dialog → B shows 30 and the "From 2022" marker → hover tooltip → Undo;
  - Replace list → part marker, entering/leaving;
  - selection bulk copy;
  - Check accept and Map to…;
  - swap;
  - Save comparison → reload → reopen;
  - share link opens.
- **k1 ↔ k2:** the 1949 rules and candidate cap; a threshold copy turns the side experimental.
- **Phone, 390:** row sheet copy, edit-side sheet, 44 px targets, no horizontal page scroll.
- **Pinning:** in Hebrew the left side is 2022 for the chambers, the table and key numbers alike, and arrows point at their destination.
- **No jumps:** the arrow under the pointer stays put after a copy; a row that becomes equal stays until the filter refreshes.
- **Contrast:** tags (including Check), markers, frames and SeatDelta pass AA in both themes by test.

**Visual:** screenshots of the states in the mock-ups, read by the implementer, as in COMMON.md.
