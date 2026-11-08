In short: make comparison available where the reader already is. Keep the larger two-result view for detailed work. Put the result that was open on the left, and the chosen comparison on the right. Let users copy votes there, with words that explain both the destination and the calculation.

The owner's eligible-voter idea is useful and different from the existing vote-share option. With this branch's data, copying Likud's 2022 support into 2026 gives **1,204,575 votes when adjusted for eligible voters**, or **1,332,255 votes when preserving its share of valid votes** and keeping the destination's valid-vote total fixed. Neither is a prediction. They answer different questions.

# Rethinking Compare

Research handoff, 8 November 2026. Notes only: no application changes or approved visual design. This extends [the earlier prior-art research](compare-prior-art.md) and [the earlier workbench design](../design/compare-workbench.md); it does not replace their records. The code, rather than the earlier design's “not implemented yet” heading, establishes what exists now.

## What the owner is asking for

**What this is.** A way to keep looking at an election, a party's history or a party-family chart while adding something to compare it with. For example, open the 2026 result, choose 2022, inspect Likud in both, and try using its earlier support in the current result. A party family is an explicitly defined group of parties, not one organisation.

**Why the choice matters.** A separate page has room for detailed editing, but takes the reader away from the party or chart they were inspecting. Adding every editor to every chart would make ordinary reading crowded. I recommend one comparison choice that stays with the reader, a small amount of comparison in each relevant view, and an “Open full comparison” route for detailed copying. This is a proposed direction, not a demonstrated usability result.

The latest owner message changes two earlier recommendations. The current scenario should start on the left in English. The previous-election line under every party should appear during comparison; showing it outside comparison should be an optional setting. Keep the earlier decisions in their documents as history. The owner has **not** settled which vote-copy method should be the default, or whether Hebrew should reverse the sides.

## 1. What Compare actually does today

These are code-reading findings at `39b993d284d4a6d35290956a85b2b71180d0c249`, not a browser test. File and function references are in the appendix.

### Opening it and choosing the two results

- Compare is a separate tool page. If both sides are identical within one election and the other side has no draft, it shows choices for something useful to compare, rather than two identical chambers.
- Normally, the **left** side is the comparison and the **right** side is the scenario open on the main results board. This is true in **English and Hebrew**. The two-result area is explicitly left-to-right; text within it follows the chosen language. Swapping sides changes their positions and reverses the displayed subtraction. It does not copy anything.
- The other result can be this election's official result, the active reference, a different saved scenario from this election, or another election's official result. It does **not** offer arbitrary saved scenarios from another election in this picker. Only the other side gets this picker; the main side follows the main board.
- With the automatic choice, an unchanged scenario compares with the previous available election. Otherwise it compares with the active reference, falling back to the official result. A failed other-election load reports an error and switches to the historical/reference choice. This fallback is another reason the comparison name must stay conspicuous.
- Both sides can have votes edited and can receive copies. The main side shares the board's scenario and undo history. Editing the other side creates a separate session draft, with its own undo, redo and Start over. This is not yet two equally complete editors: opening a list's ordinary detail panel is supported on the main side; other-side list names are plain text and its chamber clicks are intercepted.

### What is on the page

Two result summaries with chambers, identities and undo controls; Swap and the equation “right result − left result”; a paired list table; All / Different / Edited / Unmatched filters; search; seatless-list visibility; Matching; and key numbers and rules. The chambers reuse the existing compact chamber component. Within the same election there is also a collapsed list of candidates entering and leaving. Across elections, that candidate-change section is not shown.

The table pairs lists and shows votes, valid-vote shares, seats, seat changes and changes in share. On narrower layouts share columns disappear; on phones votes and ordinary row arrows disappear too. Tapping a row opens both sets of figures and named commands. Split-group arrows remain available on the group line. Row order uses starting-point results, so a vote edit does not reorder the table.

There is a material limit in “Different”: across elections, equal seats and no edit marks or split group can hide a row even when its votes or share differ. Do not carry this definition into the redesign. A comparison should let the reader choose whether “different” means votes, shares, seats or inputs.

### What the arrows copy

| Where the arrow sits | What it does today | What it does not mean |
| --- | --- | --- |
| Between two list rows | Copies that row's **votes** towards the side the arrow points at. The current or remembered calculation and balancing choice apply. | It does not copy seats, turnout, names or the whole party. |
| On a split-group line | Copies the group's total votes once. Multiple receiving lists retain their existing relative vote weights; if all are zero, the planner uses equal weights. | It does not discover which party the old joint-list voters supported. The receiving weights are a scenario assumption. |
| Beside Turnout | Copies the source turnout percentage, using the destination's eligible-voter count. Votes for lists and invalid ballots scale through the existing turnout edit. | It does not copy the number who voted, or just one list's votes. |
| Beside Registered voters | Copies the raw registered-voter count, provided it can accommodate votes already cast. | It does not adjust a party for electorate growth. |
| Beside Invalid ballots | Copies their raw count, subject to the destination capacity check. Expert only. | It does not copy the invalid-ballot rate. |
| Beside Threshold, Seat method, Agreements | Copies that input, recalculating the destination. Rules from another era can make it an experimental result. Agreements use compatible one-to-one list pairings; omissions are reported. | It never copies the resulting seat allocation. |

Ordinary row arrows show on hover, keyboard focus or selection. On devices without hover, enabled arrows are shown, until the phone layout replaces them with row details. Their accessible labels name votes and the destination. The visible icon alone still leaves the calculation unexplained, exactly as the owner's question demonstrates.

Across elections, the vote dialog offers **Share of the vote** and **Number of votes**. Share currently means **share of all valid votes**. Expert also offers **Change from its starting point** when the source's vote count was edited: this transfers the change in valid-vote share, not a historical election-to-election swing. Within one election the ordinary option is Count. There is no eligible-voter-share method yet.

A second choice says how to balance the edit: other lists proportionally; one named list; or people voting/staying home. The first two keep the total fixed. The last keeps other lists' votes fixed and changes participation. Consequently, even “copy share” can yield different counts. Remembered answers can let an arrow apply immediately. Votes as… reopens the choice. Answers can apply once, for the receiving list, or always; settings can change them later.

The row menu also offers whole-list replacement, candidate copying, colour copying and adding an unmatched source as a new list, beyond Simple. Whole-list copying lets the reader choose votes, candidates and constituent parties, name/letters and colour. Destination rules, agreements and blocs are separate operations. Imported candidates can trigger a duplicate-person decision. Every numerical copy recalculates seats; numerical copies have origin marks and one undo step. Colour-only copies do not acquire a result-edit mark.

### When a party has no counterpart

“New” or “Ended” means **no established counterpart in these records**, not proof that an organisation was born or dissolved. Ordinary vote arrows are disabled. Standard and Expert can open Matching and use Map to…, or add an unmatched source as a new list through the row menu. An unverified relationship marked Check must be accepted before ordinary copying. Nothing should quietly become zero.

Matching uses party identities and usable recorded relationships, leading parties and joint-list constituents. Same-election scenarios use their recorded list origins. Names, ballot letters, party colour and vote rank are not identity rules. Confirmed and probable relationships can be usable under the history rules. The labels distinguish Same, Renamed, Joined, Ran jointly, Merged, Split, New, Ended, Check and Yours. Matching explains the relation and offers sources; it can accept/reject a check, remove a personal pairing, and suggest matches ranked by shared candidates with confirmed Knesset identities. A personal pairing is saved with the comparison; it does not rewrite historical evidence.

A source joint list and its later separate contestants can be compared as a group. Its votes are counted once. A minor party moving to another list can instead appear as a note, so one moved partner does not automatically combine otherwise unrelated lists into one giant group.

### Saving and sharing

Save comparison stores both results' election identifiers, names and action logs, presentation swap and personal pairings in this browser. Copy link makes a compressed `#c=` link with that information. Opening it loads the main result onto the board and the other as a comparison draft; no cross-browser live link is created. Filters, scroll position, selected rows, per-side undo stacks and remembered settings are not part of that link. Later source edits do not change a completed copy. See the appendix for important limits on replay and source versions.

## 2. What other tools contribute

The following adds election-specific and in-place comparison evidence to the earlier report's merge-editor and typed-copy precedents. These were **read-only public HTML or documentation inspections**, not operated workflows. Borrow/avoid statements are my recommendations. Evidence IDs lead to narrow locators and access limits in the appendix.

| Example | What the inspected source shows | Borrow | Avoid |
| --- | --- | --- | --- |
| **Our World in Data** [R1] | Grapher documentation describes selectable entities, chart/table views and an optional relative-mode control. This is comparison inside the chart's existing controls, not a separate mandatory comparison page. | “Compare with…” in the party/history chart; keep the same dates and measure when adding a second series. | Calling every relative view “share”. Relative growth, share of valid votes and share of eligible voters have different denominators. Documentation is not evidence that every OWID chart exposes these controls. |
| **FT, UK 2024 results** [R2] | A Data view control lists 2024 results / Change / 2019 notional results, alongside map type and constituency filters. The page explains that earlier results were adjusted to the new boundaries. | A visible Results / Change choice without leaving the page; a short, inspectable explanation of what makes two results comparable. | Treating modelled boundary equivalents as original counts. The fetched page's uninitialised totals are not evidence for final election numbers. |
| **BBC, UK 2024 results** [R3] | Party summaries place seats and their change beside vote share and its change; the map offers changed-hands information. | Make the exact comparison year visible beside a signed change. Offer a changed-only view as a view, not an edit. | Inferring that simultaneous changes prove voters moved between those parties. Published change figures are not a two-sided editor. |
| **Federal Returning Officer, Germany 2025** [R4] | One result page includes seat changes, vote counts, shares and differences from 2021 in percentage points, plus eligible voters and turnout. | The denominator belongs beside the results. Keep percentage points distinct from percentage growth. | Importing Germany's first/second vote distinction into the Israeli ballot, or assuming a changed chamber size is harmless to raw-seat comparisons. |
| **Wahlrecht historical Bundestag table** [R5] | Repeated election columns put percentage and seat count together; the 2021 column has an explicit main-election qualifier. | An exact multi-election history table behind a compact chart; preserve election-version qualifications. | Showing 26 narrow year columns on a phone, or assuming a research table is a copying interface. |
| **ParlGov codebook** [R6] | Explicit party/election coding, alliance handling and inclusion rules; the main rule includes parties above 1% with stated additions. | Reuse stable organisation identities and expose why an alliance year differs from a solo year. | Copying its coverage threshold: this app needs losing lists too. A database coding system does not establish a good end-user comparison layout. |
| **Electoral Calculus** [R7] | Enter national support beside actual reference figures; expose regional/tactical assumptions and boundary choices. Its historical model article contrasts additive and proportional changes and explains failures. | Show the reference, assumption and resulting number together. Separate carrying a result from carrying a change. | Calling the Israeli arithmetic a forecast, or presenting the archived 2007 model as its current method: the article explicitly says it has been superseded. |
| **270toWin** [R8] | The public page separates current composition, consensus forecast and the interactive map; map sharing has its own controls. | Keep actual / forecast / your experiment visibly different. Carry that distinction into shared comparisons. | A click-to-colour map as an exact vote editor, or copying electoral-college allocations as Knesset inputs. |
| **Israel Democracy Institute, Hebrew election/party catalogue** [R9] | Separate routes to party histories and full election results, including lists below the threshold. Its 2022 page also provides eligible-voter and turnout context. | Entry into comparison from either a party or an election; preserve below-threshold votes and historical context. | Treating a party-history narrative as permission to divide joint-list votes. This is institutional history/results publishing, not verified scenario-copy functionality. |
| **Walla, Hebrew election hub** [R10] | Previous-election navigation and poll/result context in the same election hub. | Year context should be available where the reader already is; keep polls clearly separate. | Media bloc definitions as permanent historical identities. No two-sided editor was established by this inspection. |
| **Meld** [R11; earlier C02 revisited] | Corresponding differences have local copy controls and previous/next navigation; the default is replacement, while modifiers can change meaning. | Copy beside a difference, and Next difference for long tables. | Hidden modifier-dependent meaning. A vote button should say what will be copied and where. |

**NYT limit.** Its 2024 presidential results URL returned HTTP 403 [R12]. No feature claims, screenshot or substitute access are inferred. No login, paywall, CAPTCHA or rate-limit bypass was attempted. The brief names examples rather than requiring every named publisher to be accessible.

### Which comparison patterns fit here?

These are proposed applications, not visual designs for approval. No visual option is being selected without mock-ups.

| Pattern | Useful task | Main cost or failure mode |
| --- | --- | --- |
| In-place “Compare with…” | While reading 2026, turn on 2022 figures; while reading Likud history, add another party. OWID and FT support the general control pattern. | The selected comparison must stay visible when changing views, so its effects do not become mysterious. |
| Two aligned result views | Edit Likud in either election; inspect two chambers and exact votes. Retain the current detailed view as this route. | Repeating a full screen everywhere uses too much space; independent editing and undo must be clear. |
| Paired bars or a pale reference bar | Show Likud's current and comparison support directly beside its row. | Party colour already means identity. Use outline/pattern and words for the reference; do not recolour parties or let overlapping bars hide values. This proposal still needs mock-ups. |
| Signed difference | Read “+2 seats” or “−1.3 percentage points” rapidly; FT/BBC/German results show this family of presentation. | A difference alone hides whether the comparison is 2→4 or 40→42. Keep both values reachable. |
| Swing calculator | Apply a specified gain/loss to a destination scenario. | It needs a defined starting result and balancing rule; a national swing cannot manufacture local results. |
| Overlay or swipe | An optional map comparison, with identical extent and scale. Earlier research C11 explains the precedent. | A reveal hides part of one result and is unsuitable as the main exact-value editor. National edits supply no observed local votes. |

## 3. Six ways to carry votes between elections

**What this is.** Choosing what “use Likud's 2022 support in 2026” preserves. **Why it matters.** The electorate grew, turnout changed and the valid-vote total changed. Copying one of these measures cannot preserve all three. Do not call one universally correct.

### Real input numbers used here

These are this repository's numbers, not a new independent verification of the elections. The 2026 dataset calls itself CEC official-final, approved on 4 November; its note still says Gazette publication was unverified as of 6 November. Keep that qualification. Every resulting copy below is hypothetical.

| Input | 2015 | 2022 | 2026 destination |
| --- | ---: | ---: | ---: |
| Eligible voters on register | 5,881,696 | 6,788,804 | 7,331,981 |
| Valid votes | 4,210,884 | 4,764,742 | 5,691,426 |
| Invalid ballots | 43,854 | 29,851 | 25,971 |
| Likud votes | 985,408 | 1,115,336 | 1,167,591 |
| Joint List votes | 446,583 | Not used here | 500,755 |

The two Joint Lists are not assumed to have identical membership. The 2015→2026 example below is a **deliberate whole-list numerical experiment**. Review constituents and choose a destination or an aggregate first; it is not a claim that the matcher should equate those lists or that a constituent has its own measured vote share.

### The methods, in everyday terms

| Method | What stays the same; worked example | Strength | Pitfall and suggested level |
| --- | --- | --- | --- |
| **Number of votes** | Copy Likud's 1,115,336 votes from 2022, or the Joint List's 446,583 from 2015. Balance the difference in 2026 under the chosen policy. | Exact and easily understood. Good for two scenarios with the same electorate. | Old counts become relatively smaller in a growing electorate. Standard; no method menu in Simple. |
| **Share of valid votes** | Likud's 23.408109% of valid 2022 votes becomes **1,332,255** in 2026. The Joint List's 10.605445% in 2015 becomes **603,601**. Here the 2026 valid total is fixed and other lists supply/receive the difference. | Preserves relative electoral strength for allocation before destination thresholds/rules act. | Also carries the source turnout context indirectly. With other lists fixed instead, Likud needs **1,382,580**, not 1,332,255, to reach that share. Standard; keep a clear default. |
| **Share of eligible voters** | Likud's 16.429050% of the 2022 register becomes **1,204,575** against the 2026 register. The Joint List's 7.592759% in 2015 becomes **556,700**. | Directly answers the owner's population-growth question without assuming the same turnout. | This adjusts for growth of the **register**, not necessarily resident population. It preserves participation as part of party support. Needs valid registered totals on both sides and a budget choice. Standard; recommended additional method, with default still open. |
| **Uniform change in share** | In an **illustrative edited 2022 scenario**, increase Likud's share by 2 percentage points. Carry that gain to its existing 2026 share: **1,281,420 votes** at fixed 2026 valid total. | Tests “what if the same gain happened here?” instead of replacing support. | Requires two source states; copying an untouched official result supplies no gain. Large negative swings can imply negative votes. Expert. This is a one-party share change, not the two-party swingometer's half-difference convention. |
| **Proportional change in share** | In an **illustrative edited 2022 scenario**, give Likud 10% more relative support: 23.408109% becomes 25.748920%. Apply the 1.10 multiplier to 2026's current share: **1,284,350 votes**, at fixed valid total. | Distinguishes “grow by a tenth” from “add ten points”; useful when comparing differently sized parties. | Needs a non-zero source starting share and sufficient balancing votes. Multiplying every party equally then renormalising changes nothing; selective scaling needs an explicit remainder policy. Expert; new behaviour. |
| **Carry turnout separately** | Use 2022 turnout, 4,794,593 / 6,788,804, against the 2026 register: **5,178,212 cast ballots** rather than 5,717,397. Scale destination list votes and invalid ballots proportionally, preserving its party balance up to integer rounding. | Separates “who votes?” from “which list gets the votes?”. Existing turnout copying is a foundation. | Turnout includes invalid ballots. Do not treat it as valid-vote share, or copy it after an eligible-share edit without warning that scaling changes that edit. A plain turnout control can remain in Simple; copying it belongs with the comparison tools. |

The illustrated +2-point and ×1.10 edits are chosen experimental parameters applied to real source figures. They are not observed historical changes. Uniform and proportional swing are alternative assumptions, not competing claims about what voters actually did. Electoral Calculus's archived comparison [R7] is useful precisely because it shows the limitations of those assumptions.

### Which totals change?

The **measurement** and **where the votes come from** are two separate questions. Keep both in the preview.

- **Other lists supply the difference.** Valid votes, invalid ballots and turnout stay fixed. For eligible-share Likud, 36,984 votes move from other lists to bring 1,167,591 up to 1,204,575. For valid-share Likud, 164,664 move. This is redistribution, not new turnout.
- **People voting or staying home supply the difference.** Other lists and invalid ballots stay fixed. Eligible-share copying still targets 1,204,575, but valid votes rise to 5,728,410 and cast ballots to 5,754,381. The app must check the register has room. The current planner caps an individual copy to the available non-voters; the preview must state any shortfall instead of implying it achieved the requested measure.
- **A named list supplies the difference.** The total stays fixed, but only that list loses/gains the balancing votes. Refuse the operation if it cannot supply them.

For multiple selected lists, compute all targets together. Round once deterministically and balance exactly; never silently normalise targets into a different request. A missing counterpart needs a decision before a bulk operation. Copying every list's eligible share can reproduce source participation after electorate growth; retaining destination invalid ballots is a separate assumption that must be named.

**Important denominator caveat.** The register is not a count of residents who can readily attend a polling station. Contemporary Ynet reporting attributes the resident/registered distinction to CBS and notes overseas citizens [R13]. That is one news report, **provisional under the source policy**, not a newly verified CBS series. Do not subtract an estimated expatriate count from this app's register. A resident-only method would need comparable sourced totals for both elections and a separate name. Nor does register growth mean each party's potential electorate grew proportionally.

**Early elections.** I checked all 26 current national datasets: none lacks registered, cast, valid or invalid totals. The early-election risk remains a validation requirement for incomplete imports or future data, not a present national-data gap. If a denominator is unknown, zero or inconsistent, show the method as unavailable; never reconstruct it from a rounded turnout percentage. The first election has no previous election, and several elections share a calendar year: use election identity and month, not year alone.

### Recommended copy wording

Use “Copy votes to Likud · 2026”, then show three full choices from Standard upward:

- “Use the same number of votes: 1,115,336.”
- “Keep its share of valid votes: 1,332,255 votes here.”
- “Adjust for eligible voters: 1,204,575 votes here.”

Show the balance choice and affected total immediately below. Put the formula, exact source fraction and origin behind (i). Keep the owner's once / for this list / always choices. After a remembered choice, the visible command or adjacent summary must still say which method will run. A standalone arrow cannot communicate that.

## 4. Comparing party and family histories

The party-history panel is already live. It has a compact seat history and a larger sheet with seats or valid-vote share, event/evidence details and an exact table. In joint-list years, own elected members are solid and partners are hatched; vote share belongs to the **whole list**. The family screen already selects multiple families with shared scales, a shared election cursor and explicit mixed-list counting policies. Do not rebuild that facility under another name.

I recommend these extensions:

1. **From a party's history, choose another party.** Open Likud and add Yisrael Beiteinu. Keep the same election dates and measure, with synchronised selection. In 2013 both appeared on the same ballot. The two history panels must say “same joint list”; they cannot show two independent piles of votes or add them. For seats, distinguish each party's own elected members from the whole joint list.
2. **Compare the same party at two elections.** Select 2022 and 2026 points; show both raw votes and the chosen denominator. Offer “Use these votes in 2026…” only after the user chooses a source point and a receiving scenario. Merely adding a history series must not edit anything.
3. **Keep family comparisons inside the family screen.** Reuse its existing multi-family selection and shared dates/scales. Show each definition and mixed-list policy, and explicitly mark overlaps. The owner has not yet settled the treatment of mixed joint-list years and tall bars. Preserve that open decision; neither trim partners nor count the whole mixed list silently.
4. **Compare alternative definitions of one family.** A personal family definition and the sourced one can share a chart and exact table. Label the definition difference, not just the numerical difference. This changes the analysis; applying a vote change is a subsequent explicit operation.
5. **Link the history and full comparison.** Selecting a pair of election points can open the detailed two-result view with those elections selected and the relevant list highlighted. Closing it returns to the same history and selected dates.

Use shared scales by default. On phones, keep the same dates across vertically arranged charts and present both values together when inspecting a point. Do not independently auto-scale two charts and make a small party look as large as a large one. Missing/not-contested years need gaps or explicit labels, not a line falsely connecting zero support. No copied national result creates a new observed locality history.

## 5. Concrete priorities and likely effort

These estimates are **unmeasured planning judgements**, not delivery promises. They assume one developer familiar with this repository, reuse of existing editors and copy planners, and time for bilingual/phone checks and focused tests. They exclude historical research, owner review delays and major shared-state rewrites. Rows overlap and must not be added mechanically.

| Rank | Proposed capability and example | Value / effort | Rough developer time and reason |
| --- | --- | --- | --- |
| 1 | Name the copy field, method and destination; Likud 2022 → 2026 shows the resulting count before applying. | Very high / small | 1–2 days: existing planner/dialog reuse, bilingual copy, remembered-choice and phone checks. |
| 2 | Start with the open result on the left; name both sides; preserve swap and each draft's undo. 2026 stays recognisable after opening 2022. | High / small–medium | 1–2 days: presentation default plus swap/link compatibility and bilingual checks. Hebrew physical placement remains for owner review. |
| 3 | Add eligible-voter copying and totals preview. Likud becomes 1,204,575 under a fixed-total policy. | Very high / medium | 2–4 days: exact fraction planner, capacity/rounding/bulk cases, provenance/settings/share compatibility and tests. |
| 4 | Add “Compare with…” to the current results view; previous-election lines appear only while active unless enabled in Settings. | High / medium | 3–5 days: shared selection/lifecycle, row/chamber context and small-screen design. Keep the existing full view reachable. |
| 5 | Explain unmatched and split rows at the copy point. A 2015 Joint List copy asks which 2026 lists receive it and how totals divide. | High / medium | 2–4 days: reuse Matching; improve explicit destination/group and assumption handling. No silent guessed constituent votes. |
| 6 | Add party-history comparison and a route to the full comparison. Likud and Yisrael Beiteinu flag their shared 2013 ballot. | High / medium–large | 3–6 days: paired series/cursors, own-seat/whole-list treatment, missing years, exact table and phone checks. |
| 7 | Reuse family multi-selection; add definition comparison and overlap explanations. | Medium–high / medium | 2–4 days after the owner's mixed-list decision; definition and overlap handling dominate. |
| 8 | Next difference, field-aware difference filtering and selection summary. Find changed votes even when seats stayed equal. | Medium / small–medium | 1–3 days: filter semantics, stable focus/order and hidden-selection checks. |
| 9 | Add proportional change beside the existing share-change option; carry a +10% experiment to another election. | Specialist / medium | 2–4 days: new arithmetic, zero/negative/remainder cases and explicit source-baseline selection. Expert only. |
| 10 | Optional overlay/reference bars or map reveal. | Unproven / medium | Prototype and test before estimating production. No map projection from national edits. |

Start with ranks 1–3, then make comparison available on the existing results view. This resolves the owner's concrete confusion while preserving the working engine and editing history. A full replacement of the comparison system is not justified by the evidence. Later design work should show separate readable mock-ups for each visual alternative, in English, Hebrew and phone layouts; this research does not choose their appearance.

### Decisions that genuinely remain with the owner

No answer is needed to use this research as design input.

- **Default across elections.** “Adjust for eligible voters” preserves support relative to the register. “Keep share of valid votes” preserves relative strength among actual valid ballots. The first matches the owner's stated question better; the second matches the existing default and may be expected for seat experiments. I recommend offering both from Standard, with explicit counts. Decide the default after seeing the same example in a copy preview.
- **Hebrew placement.** The owner clearly prefers the open result on the left in English and is unsure about Hebrew. I recommend keeping physical sides the same in both languages, with Hebrew text mirrored within them, so charts and arrow destinations remain stable. This is a recommendation, not an approved change to Hebrew behaviour.
- **Simple.** I recommend read-only comparison with both result names and a route to Standard for copying, rather than multiple copy methods. This would reduce today's Simple editing capability and needs an explicit design decision, rather than being treated as already agreed.

## Technical appendix

### A. Implementation references and design discrepancies

Paths are relative to this repository. Function names are stable locators for this source-reading audit.

| Evidence ID | File / locator | Establishes |
| --- | --- | --- |
| L1 | [Compare.tsx](../../src/app/components/Compare.tsx): `Compare`, `useCompareChoices`, `EmptyCompare` | Automatic baseline, actual picker limitations, load-error fallback, main/other models and shared board editing. |
| L2 | [sides.ts](../../src/app/compare/sides.ts): `COMPARE_MAIN_SIDE`, `dispatchSide`, `comparisonOf`, `openComparison`, `saveComparison` | Right default, comparator drafts/history, saved/link payload and replay. |
| L3 | [Workbench.tsx](../../src/app/compare/Workbench.tsx): `Workbench`, `qualifies`, `copyVotes`, `menuItems`, `KeyBand`, `People` | Actual content, field routes, filter gap, copy preferences, selection and candidate-section limits. |
| L4 | [copy.ts](../../src/app/compare/copy.ts): `planVotes`, `planTotals`, `planRules`, `planAgreements`, `planWholeList` | Exact current arithmetic, capacity caps, group weights, fields and omissions. |
| L5 | [dialogs.tsx](../../src/app/compare/dialogs.tsx): `CopyVotesDialog`, `MatchingPanel`, `MapTo`, `WholeListDialog`, `RowSheet`; [answers.ts](../../src/app/compare/answers.ts) | Exposed methods/levels, pairing controls, phone commands and remembered answers. |
| L6 | [match.ts](../../src/app/compare/match.ts): `matchRows`, `copyUnit`, `personKey`; [relations.ts](../../src/history/relations.ts) | Identity/continuation evidence and usability, grouped copies and user pairings. |
| L7 | [PartyHistory.tsx](../../src/app/components/PartyHistory.tsx): `useHistory`, `PartyHistorySection`, `HistorySheet`; [Families.tsx](../../src/app/components/Families.tsx) | Existing history views; whole-list vote caveat; existing multi-family comparison. |
| L8 | [k20](../../public/data/k20.json), [k25](../../public/data/k25.json), [k26](../../public/data/k26.json): `totals`, named list `votes`, `status` | Local numerical inputs and publication qualifications; all `k1`–`k26` totals checked for non-zero completeness. |
| L9 | [compare.css](../../src/app/compare/compare.css): `.cmp-sides`, table media rules and arrow rules | Physical LTR result order, text direction, phone hiding and group controls. |
| O1 | Owner message, 8 November late, question 8 and following paragraph; brief `task-cr-compare-research.txt` | Eligible-share idea, English placement preference, comparison mode and default-off previous-election row request. Private input, not external corroboration. |

The earlier workbench design is a proposal, not an accurate inventory. In particular, it describes independent pickers for both sides, saved scenarios from other elections, broad editing, per-cell copy arrows and an Expert paste-special sheet. These are not all exposed by the inspected implementation. `SideCard` has no separate bloc-bar component below its chamber; do not promise the proposed layout merely because the design lists it. This report distinguishes implemented row/field commands from those proposed routes.

Share payload version 1 carries action logs and election IDs, **not immutable dataset snapshots or build hashes**. It preserves the experiment's instructions, not guaranteed bit-for-bit reproduction against a future changed dataset. Each completed copy embeds its computed destination actions, but there is no independent preserved source-dataset version. A future eligible mode needs compatible provenance/validation and a decision about older readers; do not simply add a label while retaining ambiguous `share` provenance. Add comparative history selections to a future link format deliberately; the existing link has none.

### B. Exact arithmetic and reproduction

Let source list votes be `s`, source valid votes `S`, source register `E_s`; destination list votes `v`, destination valid votes `V`, destination register `E_d`. Use integer/rational arithmetic and nearest integer, halves up, rather than rounded displayed percentages.

- Count: `x = s`.
- Fixed-total valid share: `x = round(s × V / S)`.
- Valid share with other destination lists fixed: `x = round(s × (V − v) / (S − s))`. Multiple copied shares must be solved jointly, not successively.
- Eligible share: `x = round(s × E_d / E_s)`. The balance policy does not change this target; it changes other votes or turnout. Never alter the register to make the request fit.
- Uniform source change: `d = s_edited / S_edited − s_start / S_start`; fixed-total destination `x = round((v / V + d) × V)`.
- Proportional source change: `r = (s_edited / S_edited) / (s_start / S_start)`; fixed-total destination `x = round((v / V) × r × V)`. Refuse undefined zero-baseline ratios; do not call them infinite growth.
- Turnout: `C_new = round(E_d × C_source / E_s)`, where `C` includes invalid ballots. Apportion that count across destination lists and invalid ballots deterministically. Existing `setTurnout` behaviour is the integration point.

The existing valid-share planner has a threshold-side rounding guard and a capacity cap for single-row participation copies. A new eligible-share planner must compare the resulting rational **valid-vote** share against the destination threshold under its chosen balance policy; the eligible percentage itself is not the electoral threshold. Show if capacity prevents reaching the target, or refuse it explicitly. Validate both denominator availability and internal consistency (`valid + invalid = cast ≤ registered`). Validate the whole selection before applying; source lists must not be counted twice.

The examples can be reproduced with Python 3's standard library from the retained JSON inputs. This minimal calculation does not invoke the allocation engine and makes **no seat prediction**:

```python
import json
from fractions import Fraction as F

def load(k):
    with open(f"public/data/k{k}.json") as f:
        return json.load(f)

def nearest(x):  # non-negative Fraction; halves up
    return (2*x.numerator + x.denominator) // (2*x.denominator)

dst = load(26)
V, E = dst["totals"]["valid"], dst["totals"]["registered"]
for k, name in [(25, "Likud"), (20, "Joint List")]:
    src = load(k)
    s = next(l["votes"] for l in src["lists"] if l.get("shortEn") == name)
    v = next(l["votes"] for l in dst["lists"] if l.get("shortEn") == name)
    S, Es = src["totals"]["valid"], src["totals"]["registered"]
    print(name, s, nearest(F(s*V, S)), nearest(F(s*E, Es)),
          nearest(F(s*(V-v), S-s)),
          nearest(F(E*src["totals"]["votesCast"], Es)))
print("Illustrative Likud +2pp", nearest(F(1167591) + F(2*V, 100)))
print("Illustrative Likud x1.10", nearest(F(1167591*11, 10)))
```

Expected rows: Likud `1115336 1332255 1204575 1382580 5178212`; Joint List `446583 603601 556700 615802 5303854`; swing examples `1281420` and `1284350`. The Joint List turnout result carries 2015 turnout across the **whole** destination, not just that list.

### C. External evidence ledger

Question: which comparison/copy/history behaviour serves the owner's tasks without misrepresenting votes? As-of date: 8 November 2026. Criteria: preserve context; expose denominators and destination; keep official data distinct; permit reversible edits; avoid invented continuity or constituent votes. Scope: public product documentation/interfaces, repository code/data and supplied owner instructions. No app implementation, empirical usability ranking or independent election-result recount.

All entries below are public web sources retrieved with Python `urllib` using `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`, then inspected as text. R6 was inspected by PDF text extraction using the repository's available `pdfjs-dist`. Sources are primary for their **own interface or coding rules**, not independent evidence of usability. R13 is contemporary reporting. Each numbered publisher/product is one evidence family; R1 pages share OWID, R7 pages share Electoral Calculus, R9 pages share IDI. BBC and FT reference the same underlying 2019 notional-results work, so those numbers would not be independent corroboration.

| ID / publisher | Direct source and narrow locator | Supported observation / limitations |
| --- | --- | --- |
| R1 / OWID | [Grapher schema](https://docs.owid.io/projects/grapher/schema-reference/), “Chart types and tabs”, “Entity selection”, `hideRelativeToggle`; [FAQs](https://ourworldindata.org/faqs), chart sources and live/archived embeds | Optional in-place comparison controls and source transparency. Schema can describe features absent from a particular chart. The old how-to URL redirected to FAQs; no invented tutorial claim. |
| R2 / FT | [UK 2024 results](https://ig.ft.com/uk-general-election/2024/results/), “Data view”, constituency filters and “Notional results” footer | In-page results/change/baseline choices. Static text says JavaScript is required; no control operated, no final totals inferred. Published election page dated 2024. |
| R3 / BBC | [UK 2024 results](https://www.bbc.com/news/election/2024/uk/results), party summary “Change compared with 2019”, “Share change”, “Changed hands” | Counts and shares with explicit reference. Read-only 2024 page; not a copying simulator. |
| R4 / Federal Returning Officer | [Germany 2025 national result](https://www.bundeswahlleiterin.de/en/bundestagswahlen/2025/ergebnisse/bund-99.html), “Distribution of seats”, “Result table”, “Persons entitled to vote” | Official count/share/percentage-point distinctions and denominator. Charts were not operated. |
| R5 / Wahlrecht | [Bundestag results](https://www.wahlrecht.de/ergebnisse/bundestag.htm), election-year table and 2021 footnote | Longitudinal percent/seat table; no UI/copy test. |
| R6 / ParlGov | [Codebook PDF](https://www.parlgov.org/data/codebook.pdf), “Parties / Coding rules”, “Elections” | Identity/alliance coverage and >1% inclusion rule with additions. Downloaded 38-page PDF, inspected extracted text; no product-interface operation. Earlier `/documentation/codebook/` returned 404. |
| R7 / Electoral Calculus | [User-defined poll](https://www.electoralcalculus.co.uk/userpoll.html), reference rows, “Seat Boundaries”, “Notes”; [Strong Transition Model 2007](https://www.electoralcalculus.co.uk/blogs/strongmodel.html), opening caveat and “Model comparison”; [FAQ](https://www.electoralcalculus.co.uk/faq.html), “Isn’t UNS inaccurate?” | Explicit assumptions; additive/proportional failure modes. Historical model dated 28 October 2007 and now marked superseded, not a current forecasting recommendation. Old root model URL returned 404. |
| R8 / 270toWin | [Public home/map](https://www.270towin.com/), “Current”, “Consensus Forecast”, “Interactive Map Above”, “Share Map” | Distinct actual/forecast/interactive contexts. No map edited; do not infer copy semantics. |
| R9 / IDI | [Hebrew parties/elections](https://www.idi.org.il/policy/parties-and-elections/), “מערכות בחירות” and party-history introduction; [2022 result](https://en.idi.org.il/israeli-elections-and-parties/elections/2022/), “Number Eligible Voters”, “Voter Turnout” | Party and election entry routes, below-threshold coverage and denominators. Institutional history; totals are not independently rechecked here. |
| R10 / Walla | [Election hub](https://elections.walla.co.il/), previous-election links and election/poll sections | Hebrew year navigation/context only; no operated comparison editor. Live page may change. |
| R11 / Meld | [Dealing with changes](https://help.gnome.org/meld/file-changes.html), “Navigating between changes”, “Changing changes” | Local directional replacement and navigation. Documentation only, ©2012; no claim about current election-user preferences. |
| R12 / NYT | [2024 presidential results](https://www.nytimes.com/interactive/2024/11/05/us/elections/results-president.html) | HTTP 403. Excluded from feature evidence. |
| R13 / Ynet | [Registered voters abroad](https://www.ynetnews.com/article/hk5ryml3fl), opening article paragraphs on CBS register versus residence | Contemporary report; one source, provisional historical claim. The fetched article text did not expose a precise publication timestamp; pre-27-October election context is explicit. Obtain the original CBS release before publishing resident-only calculations. |

No English Wikipedia was used as a source or pointer. Search discovery used managed web search, whose User-Agent is not configurable here; direct source retrieval and the evidence above used the required User-Agent. No blocked source was bypassed. No HTTP 429 occurred in the direct fetches. A guessed IDI article path returned 404 and is excluded. Screenshots were not collected: text and documentation suffice for this research-only handoff, and an unoperated page must not be presented as visual validation.

Accounting: 13 numbered source entries across 13 publisher/product families, including **one blocked entry excluded from substantive evidence**. Three products have multiple inspected supporting documents: OWID (two), Electoral Calculus (three, including its FAQ for context) and IDI (two), with no extra independence implied. Direct initial/follow-up retrievals: 20 requests, 16 successful documents and four failed paths; one additional successful OWID fetch was a connectivity check of the same redirected document. Search-result counts and full web coverage are not measured; exhaustiveness is not claimed. Application/browser interactions and usability tests: none. Working downloads and extraction scripts are disposable under project-local `.backup-scratch/compare-rethink/`; the compact durable record is this report, its locators, code revision, formulas and retained repository inputs. Reproducibility of the local calculations does not depend on re-downloading web pages.

### D. Challenge pass and conclusion map

| Conclusion / criterion / status | Supporting evidence | Counterevidence or scope limit | Confidence and what could change it |
| --- | --- | --- | --- |
| C1: Put comparison controls in existing views while retaining detailed comparison; context criterion **passes as recommendation**. | O1, L1–L3, L7; R1–R3, R9 | L3 already supplies useful detailed editing; no study shows a global mode is faster. | Medium: strong task fit, read-only precedents. Test opening/completing/closing a comparison without losing context in both languages; failures could favour a dedicated view. |
| C2: Add eligible-share copying alongside valid share; denominator criterion **passes**. | O1, L4, L8; arithmetic in B | R13 bounds what the register means; turnout and valid share answer other questions. | High for arithmetic, medium for default choice. Resident-register discrepancies or task tests could change the default, not the distinction. |
| C3: Make copy field/method/destination visible; clarity criterion **passes as recommendation**. | O1, L3–L5; R7, R11 | Repeated dialogs can obstruct work; remembered answers already bypass them. | High task rationale, medium usability. Use readable remembered-method summaries; test if users can predict outcome before applying. |
| C4: Reuse histories with shared scales and joint-list qualifications; no-invented-votes criterion **passes**. | L6–L8; R6, R9 | Two series may contain the same ballot; family mixed-list treatment remains an owner decision. | High correctness constraint, medium layout confidence. New sourced membership data may resolve identities, never unobserved constituent vote totals. |
| C5: Open-result-left is the English direction; Hebrew **unresolved owner preference**. | O1 | L2/L9 currently pin main right in both languages; neither convention proves the user's preference for Hebrew. | High on English request; recommend stable physical positions for Hebrew subject to mock-ups and owner review. |
| C6: Swing stays optional Expert experimentation; separation of observation/assumption **passes**. | L4–L5, L8; R7 | Additive negatives, zero-baseline ratios and destination balancing make general multi-party swing more complex than a slider. | High limits, medium priority. Demand for repeated source-change experiments could justify building it sooner. |

The challenge pass looked specifically for reasons to reject an all-purpose compare mode: the existing workbench already handles difficult edits; family comparison already exists; UK boundary-adjusted history is modelled; the Electoral Calculus model page is explicitly historical; relative growth is not a vote denominator; the register includes overseas citizens; and two party histories can repeat one joint ballot. These narrow the proposal rather than being treated as minor footnotes.

### E. Handoff and validation

Research ready for design, with default method, Hebrew placement, Simple editing and family mixed-list treatment explicitly open. No application code, historical identities or source facts were changed. No visual options were approved. No new TODO ledger or historical decision record is needed for this research handoff.

Validation for this document-only change: reproduce the integer examples, inspect code-to-claim links and source locators, check all local Markdown links and `git diff --check`, and confirm only this document and one changelog line enter the commit. Application TypeScript/unit/e2e suites and the common brief's screenshot matrix do not validate research prose, so they were not run. No server or browser was started. Commit on the assigned worktree branch only; no push or merge.
