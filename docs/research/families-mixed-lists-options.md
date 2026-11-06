# Mixed lists in Party families: counting and presentation

6 November 2026 · Lane R3 · design proposal, **no production change or owner approval implied**.

**Recommendation:** keep mixed ballots separate by default; replace the line/bar mixture with **two aligned bar panels**, one for unmixed ballots and one for whole mixed lists. Show both from the outset. A cleaner chart does not require calling a joint ballot “votes for Likud anyway”.

Evidence labels: **Observed** = repository data, source text or rendered interface; **derived** = arithmetic on those inputs; **proposed** = this note's editorial/design judgment. Local results are not independently re-certified here. In particular, k26 remains pending Gazette verification. “Family” always means the named definition, not the identity of voters.

## What exists today

**Observed in code and the running light-theme interface.** Party families opens on Haredi, with family chips across the top. Selecting more chips adds shared-scale family plots. There are two historical measures: **share of valid votes** and **absolute votes**, covering all 26 elections. There is **no historical seat line** in these charts. Seats appear in election breakdowns and the current-election scaling preview.

Immediately under the family description, **above the charts**, is “Mixed lists (family + other parties)” with four visible buttons:

| Button | What it actually counts/draws |
|---|---|
| Show hatched — default | The line counts unmixed lists. Narrow hatched columns show whole mixed-list ballots above that total. At an election with only mixed lists the line breaks; it does not plot a measured family zero. |
| Count if family heads it | Adds a mixed list's **entire** vote total when a family party occupies registered rank 1. Other mixed lists remain hatched. |
| Count all | Adds every identified mixed list in full. |
| Leave out | Omits mixed ballots from the chart total; inspection and the exact table still disclose excluded ballots. |

**“One click away” literally:** if you are already looking at this family, click **Show hatched** once to return from another policy, or **Count if family heads it** once to leave the hatched policy. No dialog, checkbox, or level change. From Overview it takes one click on **Party families**, then a click on the policy; choosing Likud also takes a family-chip click, and deselecting Haredi takes another if you want only Likud. Scrolling may be needed on small screens. The selector is available at **Simple, Standard and Expert**. Membership editing, grouping and vote scaling belong to Standard and Expert by default. When several families are selected, the selector affects the **active family**, not all families at once.

The policy is remembered **per family in this browser**; it does not create a personal copy. Editing one list's membership does create a personal copy. Exact figures are below the plots; clicking a chart election opens its breakdown, rather than immediately navigating away.

Current screenshots (scratch files, intentionally not committed):

- [English control, Simple level](../../.backup-scratch/r3/current-control-en.png) — default Haredi.
- [Likud, English](../../.backup-scratch/r3/current-likud-en.png).
- [Likud, Hebrew](../../.backup-scratch/r3/current-likud-he.png).

Code anchors: `src/app/components/Families.tsx:19–22,33,41–49,71–93`; `FamilyCharts.tsx:12–20,43–84`; `src/app/features.ts:5,21–23`. These are repository line locators, not external political evidence.

## What we decided before

These are actual retained words, with line locators. The newer paragraph in the README supersedes its older paragraph; reading only the older paragraph gives the wrong current rule.

| Record | Exact relevant words | Status now |
|---|---|---|
| `docs/research/party-families.md:97` | “**Separate mixed segment — default.**” | Research recommendation, implemented default. |
| Same, `:98` | “Counts every ballot for this family by the user's declared convention.” | Whole-list counting is an explicit convention, not constituent measurement. |
| Same, `:101` | “Do not call unmixed-only and whole-list totals statistical confidence bounds.” | Still applies to every visual alternative. |
| `data/meta/families/README.md:85–88` | “the family's own parties hold the list's first place **and** at least two thirds of the seats the list won” | **Historical implementation**, subsequently removed. It kept 2013's 20/31 mixed. |
| Same, `:93–97` | “The runtime no longer promotes mixed lists to `led` using an inferred two-thirds seat threshold.” / “The default is **Separate**” / “when a family party occupies rank 1, with no seat-share cutoff.” | Latest written rule; compiler and membership resolver agree. |
| `CHANGELOG.md:65` | “Mixed family ballots stay separate by default; an explicit head-party policy and per-list overrides replace the hidden two-thirds rule.” | Confirms the replacement. |
| `docs/research/party-families.md:82` | “Gahal and early Likud are all-in under an organisational **Herut–Likud alliance trunk** convention” | A family-boundary choice, not evidence that Liberal voters were Revisionists. |
| `docs/research/prior-art-families-and-controls.md:13` | “Show a mixed joint list as a mixed observation; never manufacture component votes.” | Design recommendation; its following text proposes a separately named whole-joint-list series. |

Also relevant: `party-families.md:118` says “A parliamentary split after polling day must not change the historical ballot composition.” Its `:80–84` qualifications distinguish the family variants. The current national-religious JSON is **stricter** than the older matrix's broad option: 2021–22 Tkuma/Noam are selected constituents, Otzma is outside, so those lists are mixed.

A search of all `docs/decisions/` files for families/mixed/heads/dominant found no ADR settling the mixed-family counting rule; unrelated roster “family name” hits are not decisions about this question. The evidence is the research, README, changelog and enacted code. This note does **not** establish that the owner personally approved every earlier research recommendation.

**Settled in current software:** never split historical votes into constituents; separate default; optional rank-1 rule; no hidden two-thirds cutoff; per-list override; frozen scenario definitions retained. **Still open editorially:** whether that default is desirable, how broad each family should be, and how to make the chart readable. “Dominant party” has no single agreed meaning: first place, most elected members, organisational identity and presumed voter motive are different claims. None establishes voter motive.

## Six decisions, rather than one

| Decision | Choices and consequences | Proposed answer |
|---|---|---|
| Counting | Never add mixed ballots; add if family heads; add if family has most elected seats; always add; curate each list. | Separate globally. Offer whole-list conventions visibly. “Never” means not in the family total, not erased. |
| Quantity | Whole-list votes; seats of the family's elected members; both in separate views. | Both, separately labelled. Votes are ballots for the list; seats can be constituent counts when affiliation is known. Never multiply votes by the seat fraction. |
| Drawing | Stack, band, election bars, two panels, current line/hatching. | Two panels; the same visual grammar for every election. |
| Defaults | One rule for everyone or different defaults per family. | One global starting rule, remembered per-family user override. Family boundaries may differ; counting semantics should not silently differ. |
| Other tabs | Just a chart preference or also the meaning of grouping and editing. | Use the explicit definition for actions; show affected lists before applying. Keep factual coalition/faction history separate. |
| Persistence | Browser preference, personal definition, saved action, share link. | Keep these distinctions; proposed shared family views must carry definition revision, policy, overrides, metric and visual. Never reinterpret old scenarios when a default changes. |

If “most seats” is offered, define it as **strictly more than half of the list's elected members**, summing all selected constituent parties. A plurality (“largest component”) is a different rule. A tie fails strict majority; zero seats and incomplete affiliations are **unknown/ineligible**, not proof of a minor role. Use election-day elected affiliations, not later opening factions or current simulated seats. Otherwise a vote edit could itself change which votes count as family votes.

## Real cases: what the rules produce

The table concerns each named joint list, not the family's other lists in the same election. **S** = keep all these ballots separately visible; **W** = add the whole list once; **?** = evidence cannot establish the test. Never = S and Always = W for **every mixed row below**. “Curated” has no automatic result: it must record S or W for each list; this proposal starts every currently mixed row at S and permits a named W override. That is deliberately not another concealed dominance formula.

Numbers below are **family elected members / all elected members**, derived by joining each preset's `partyIds` to `data/meta/joint-facts.json` (legacy Labor aliases resolved). H = head rule; M = strict majority rule. Neither H nor M allocates constituent votes.

| Family and ballot | Seats | H | M | What could mislead |
|---|---:|:---:|:---:|---|
| Likud, 1996 Likud–Gesher–Tzomet | 22/32 | W | W | Includes ten partners' seats and all shared ballots under Likud. Never makes an apparently missing Likud year. |
| Likud, 2009 Likud–Ahi | 27/27 | W | W | A partner with no elected member still shares the ballot; no elected Ahi member does not prove zero Ahi-motivated votes. |
| Likud, 2013 Likud Beiteinu | 20/31 | W | W | Most-seats and head both count all 31; the former two-thirds test would not. Counting this whole list for the immigrant family too duplicates the same ballots. |
| Likud, Apr 2019 with Ahi | 34/35 | W | W | One reserved place changes strict-family continuity, without measuring any change in voters. |
| Likud, Sep 2019 / 2020 with Kulanu | 31/32; 35/36 | W | W | A small parliamentary partner still has unknown votes. Standalone Kulanu in 2015/Apr 2019 is not automatically Likud ancestry. |
| Likud, 2021 with Atid Ehad | 29/30 | W | W | Another small partner, not Yisrael Beiteinu. |
| Likud, 2026 with New Hope | 26/27 | W | W | Yes: local retained submission records include New Hope, ranks 9, 88, 89. One elected, two low-ranked: none of this measures their vote contribution. Publication status remains provisional. |
| Labour, 1999 One Israel (Labour–Gesher–Meimad) | 23/26 | W | W | The short “Labour–Meimad” name omits Gesher. The national-religious family's Meimad gets only 1/26 and does not head it: H/M give S there. |
| Labour, 2003 and 2006 Labour–Meimad | 18/19 each | W | W | The one Meimad seat cannot divide the ballots. For Meimad's family H/M give S. |
| Labour & left, 2015 Zionist Union | 19/24 | W | W | Hatnuah's five elected members are outside this preset; selected Green Movement has zero. A centre view can share the same ballot. |
| Labour & left, Sep 2019 Labour–Gesher | 5/6 | W | W | Not a measured five-sixths Labour vote. |
| Labour & left, Sep 2019 Democratic Union | 5/5 | W | W | **Still mixed in current metadata**, although all listed constituents and elected members are selected Meretz/Green Movement/Independence. This is a metadata inconsistency to resolve, not evidence of an unnamed outside party. A narrower Labour trunk would differ. |
| Labour & left, 2020 Labour–Gesher–Meretz | 6/7 | W | W | Broad family sums Labour 3 + Meretz 3; Labour alone is 3/7 and fails M despite heading the list. This is a boundary decision before a counting decision. |
| National-religious, 1999 National Union | 1/4 | S | S | Tkuma is a small partner; counting all would absorb Moledet/Herut ballots. |
| National-religious, 2003 National Union | 2/7 | S | S | The head is Yisrael Beiteinu, not Tkuma. |
| National-religious, 2006 National Union–NRP | 7/9 | S | W | Moledet heads it, though Tkuma/Ahi/NRP hold a majority: head and dominance diverge. |
| National-religious, 2009 National Union | 2/4 | W | S | Tkuma heads but has exactly half. No majority; plurality would need another tie rule. |
| National-religious, 2009 Green Movement–Meimad | 0/0 | W | ? | Meimad heads a seatless list. Seat dominance is undefined, despite nonzero ballots. |
| National-religious, Apr 2019 Union of Right-Wing Parties | 5/5 | W | W | Otzma outside the family won no elected place; that does not turn its ballots into known family support. |
| National-religious, Sep 2019 Yamina | 4/7 | S | W | New Right heads; family is the majority. Tkuma headed in 2009, was a minor partner in 2003, and a majority partner with NRP in 2006: leadership is election-specific. |
| National-religious, 2020 Yamina | 3/6 | S | S | New Right heads; exact tie. |
| National-religious, 2021 / 2022 Religious Zionism alliance | 5/6; 8/14 | W | W | Selected Tkuma+Noam; Otzma is outside. Counting the whole list hides respectively 1 and 6 Otzma seats. Tkuma **alone** is 7/14 in 2022 and fails strict majority. |
| National-religious, 2022 Jewish Home | 0/0 | S | ? | New Right heads, selected Jewish Home partners below it. No elected seats cannot answer dominance. |
| National-religious, 2026 Tkuma–Zehut–Atid Ehad | 4/6 | W | W | Two elected partners outside selected Tkuma; not identical to the 2022 alliance. |

**All-family alliances are a different case.** UTJ's Aguda+Degel and its selected historical partners are wholly Haredi under that definition: all rules count the list once; no mixed-policy test is needed. Similarly, Hadash–Ta'al–Ra'am–Balad Joint List is wholly inside the broad Arab & Arab–Jewish preset. Under a narrower communist/Hadash family it becomes mixed: Hadash heads the 2015 list but has only 5/13 elected places (H=W, M=S, Never=S, Always=W, curated undecided). Under a religious/Ra'am family it is mixed and does not head. A joint list is not inherently “mixed”; it is mixed **relative to a definition**.

**1949 United Religious Front:** national-religious Mizrachi/Hapoel HaMizrachi hold 11/16 and the head, so H/M=W; Aguda/Poalei Aguda hold 5/16 and do not head, so H/M=S for Haredi. Never=S and Always=W for both; proposed curation=S. The broad religious preset can count it whole once. Counting whole for both narrower families doubles the same ballots. Its Haredi constituent vote total is unknown, not zero (preserve the research's null qualification).

**Splits and missing facts:** later faction splits (e.g. Likud Beiteinu or the Joint List) never revise the election ballot. Opening factions may differ from candidate affiliations and need a separately dated seat view. Where head/affiliation data are absent, H/M must say unknown rather than infer from the list name. Low-ranked selected members can make a list mixed even with zero elected family members: H usually fails; M fails if other affiliations are complete, otherwise unknown; Always adds all ballots; Never and proposed curation keep them separate. There is no real rank-1 tie: conflicting rank-1 records are an evidence problem, not an editorial tiebreak.

A correction to the question's chronology: **Yisrael Beiteinu shared Likud's ballot in 2013, not continuously during 2009–2022.** The 2009 partner is Ahi; later examples involve Ahi, Kulanu and Atid Ehad. The current preset has unmixed Likud in 2015 and 2022. Also, the research matrix does not override the later JSON's stricter national-religious choices.

## Cascading effects

| Area | Consequence and proposed safeguard |
|---|---|
| Totals and percentages | Including a mixed list adds its full ballots to the numerator; the valid-ballot denominator stays the election's total. Below-threshold votes still count as votes. Constituent seat share uses the list's elected members, or 120 for a Knesset seat share: never call either a vote share. A strict total of zero is “no unmixed ballots counted”, not no family support. |
| Continuity | A line dropping to zero because of a new electoral partner tells a false story of collapse. A line joining across a missing observation also implies knowledge. Two panels show the shift of electoral vehicle without either device. A whole-list connecting line must say what it includes. |
| Comparing families | Family definitions overlap, even without mixed lists (e.g. Tkuma in national-religious and radical-right presets). Do not sum their percentages. If presenting a combined total, deduplicate **election-list IDs** and display shared ballots once; a stack of family totals is invalid. The present app uses separate plots and explicitly says overlaps are not added. |
| Family-derived blocs | `groupingAction` and `resolve` currently produce Family / Mixed / Everyone else for one election. A head-policy change can move an entire list, all its seats and outside partners into the selected bloc. Applying this grouping is explicit; it does not prove a political bloc or change official coalition history. A multi-family partition would need a separate, explicit rule for overlaps. |
| Vote scaling | The requested `scaleFamilyVotes` concept is currently implemented as `scaleAction` → `familyOperation: scale` (`src/families/model.ts`, `src/model/actions.ts`), not a symbol called `scaleFamilyVotes`. It scales **whole selected lists**, not selected MKs' votes. Under Separate, mixed lists are not targets and can be donor lists when “Other lists” funds the change. Under Heads/All they can become targets, affecting every partner. Preview target lists and donors, state whose whole ballots move, keep rounding/conservation and undo. Do not use constituent seat counts as weights. |
| Saved scenarios and links | Browser policy alone is not a portable historical-view link. Applied grouping/scaling actions freeze the definition and allocations in the scenario log; exports carry those actions. Preserve replay of older saved definitions, including older `led` entries; do not silently replace them with today's policy. Proposed family-view sharing needs explicit versioned view state, not a claim that today's browser preference is already shared. |
| Compare | Changing a view preference does not edit election results or create a seat difference. Compare must explain whether it compares the same definition on both sides or compares definitions. Family grouping/actions can change scenario grouping and vote allocations; list/constituent identity and measured election facts must survive. Do not present adding partners to a definition as electoral growth. |
| Coalitions | Coalition seats follow the lists, constituent/faction facts and scenario actually selected. A family policy is not a coalition membership rule. Post-election departures belong on dated faction/coalition views, not retroactively in election vote totals. |
| Exports | A family JSON export includes the currently viewed policy; an ordinary image/CSV proposal must include family revision, exclusions/overrides, counting rule, denominator, date, pending/unknown flags and distinct whole-joint-list fields. A plain “Likud votes” column would conceal the convention. No new chart-export implementation is claimed here. |
| Legend and access | Use “Unmixed list ballots” / “Whole mixed-list ballots; internal split unknown”, rather than “family part / partner part” on a votes chart. Distinguish with solid versus outline, labels and shape, not colour alone. Provide exact tables, keyboard election inspection, focus and full list names. These mock-ups are static design evidence, **not a WCAG audit**. |
| Hebrew / LTR graphics | Mirror page headings, controls and explanatory text for Hebrew; keep chart chronology and numeric axes explicitly LTR. Isolate dates, signed deltas and percentages with `bdi`. Label 2019 elections by month/Knesset. Do not reverse political list names or assume arrows mean the same direction in both languages. |

One additional evidence issue deserves attention before implementation: Democratic Union's mixed flag contradicts its selected constituent set. This analysis preserves the current result and discloses the inconsistency; it does not repair metadata or invent an excluded constituent.

## Five visual options, rendered

Each PNG is a **five-option comparison sheet**, with all 26 observations, in the app's light palette: Likud `#2565d0`, national-religious `#a89a00`, navy/grey chrome. This is 20 rendered mock-ups across two families × two languages × five options. The sheets use equal election spacing, clearly stated, to expose dense recent-election changes. Actual current screenshots above retain the app's date spacing. Month labels identify selected ticks; a production view needs all full dates on inspection. The mock-ups are not interactive product screens.

| Option | What you see | Benefit / cost |
|---|---|---|
| 1. Stacked bars + total line | Solid **unmixed whole-list ballots**, outlined **whole mixed-list ballots**, black line through their sum. | Clean continuity, but the total line is explicitly the including-whole-lists measure. The outline is not a measured partner share. For a **seat** view, solid family-member seats plus outlined other-member seats is valid where affiliations are known; show an additional unknown segment if needed. Never transfer that seat split onto votes. |
| 2. Range band | Solid unmixed-total line, dashed including-all-joint-ballots boundary, pale space between. | Compact; handles elections with both kinds. The plunge of the strict total and enormous band still dominate Likud. It is a conditional allocation envelope within identified ballots, **not** a confidence interval, estimate of support, or a bound on all voters of that tendency. |
| 3. Election bars | One stable bar grammar per election: solid unmixed, outline/J for joint; named partner examples beneath. | Cleanest compact single panel; no implied interpolation. The total height represents whole identified lists, including mixed ones, even when they are excluded from the strict headline. Expanding a bar must label the actual list/partners. Component seat segments can be a separate seat mode. |
| 4. Two aligned panels — recommended | Upper: unmixed ballots. Lower: entire mixed-list ballots. Equal scales, aligned election positions, no connecting line. | Honest under every counting rule and no visual jump between line and pillar. Costs vertical room. A chosen counting convention changes a separately labelled headline and membership marks; it does not disguise the factual mixed nature of a ballot. |
| 5. Current design, reference | Line interrupted at mixed-only elections, thin hatched range columns. | Preserves current semantics but makes partnership changes look like holes in a trend. Included for comparison, not recommended. Actual interface captures are linked separately. |

Open the sheets:

- [Likud · English](../../.backup-scratch/r3/herut-likud-en.png)
- [Likud · Hebrew](../../.backup-scratch/r3/herut-likud-he.png)
- [National-religious · English](../../.backup-scratch/r3/national-religious-en.png)
- [National-religious · Hebrew](../../.backup-scratch/r3/national-religious-he.png)

**Unknowns remain visible:** these are ballots cast for electoral lists. No panel supplies constituent votes. No-data and unresolved states must have a labelled unavailable mark, rather than a blank that can be mistaken for zero. The prototype sheets use the repository's selected/mixed arithmetic, not estimates of constituent support; they do not model changes of counting policy, simulated results or a new historical seat chart.

**Reproduction record:** inputs are `data/meta/families/{herut-likud,national-religious}.json` plus their 26 referenced `public/data/kN.json` files at this document's parent commit. For each election sum `treatment: include` records as U, sum `scope: mixed` records as J, divide each by `totals.valid` and multiply by 100. Keep lists once within each set. There are no unresolved selected records in these two plotted presets. In the 1080×220 SVG: x=50+39×electionIndex, y=178−140×share/max, max=50% (Likud) or 40% (national-religious); panels in option 4 each use height 62 with baselines 86/178 and the same maxima. Stacks use U and J; the total line uses U+J; band boundaries use U/U+J. Reference lines break when U=0 and J>0. Render white surfaces, muted grid, solid versus outline marks, explanatory bilingual labels and no constituent allocation. HTML/generator/capture script remain in `.backup-scratch/r3/`; rerun `python3 .backup-scratch/r3/generate.py`, then `node .backup-scratch/r3/capture.mjs` while the existing app preview is available at 5173. Capture tool: Playwright 1.64.1 / Chromium headless shell build 1248, 1280×1830, light theme. Initial app screenshots used the shared preview browser. The prototype source and PNGs are intentionally scratch-only as requested; the formulas and source references above retain the design specification independently of scratch survival. The directory is gitignored; no claim is made about an external backup system's exclusions.

## Recommendation and owner decisions

**Counting default: Separate. Visual: two aligned panels (4).** Change the selector label to **“Keep mixed ballots separate”** / **“הפרדת פתקים של רשימות מעורבות”**; “Show hatched” currently mixes a counting decision with a drawing technique. Keep the optional **“Count whole list if a family party is first”** convention visible. Display the current rule next to any headline total; on inspection show list votes, family elected members, other elected members and unknown affiliations as distinct quantities.

This gives Likud a coherent historical page without claiming to know New Hope's, Kulanu's or Yisrael Beiteinu's voters. It also works for Meimad as a minor partner, the 1949 shared front, seatless alliances and the national-religious/Otzma boundary. A different counting preference can be used with the **same clean visual**, so an editorial decision need not dictate chart geometry.

Only the following questions need the owner's judgment; technical facts and metadata inconsistencies should be resolved from evidence, not put to him for ratification:

| Owner choice | Recommended answer |
|---|---|
| Should the default headline mean strict unmixed ballots, or all ballots on family-led vehicles? | Strict unmixed ballots, named precisely, with mixed ballots equally visible immediately below. If continuity is the priority, use an explicitly titled **“Family-led electoral lists”** headline rather than “votes for the family”. |
| Is the extra height of two panels acceptable? | Yes. Use metric selection (share / votes / seats) rather than four tiny panels on phones; keep one common election cursor. This is a proposal, not current behaviour. |
| Should particular family boundaries expand, e.g. early Liberals in Likud, New Right in national-religious, Otzma with Tkuma? | Retain named existing interpretations; offer distinct broader variants. Never silently equate Otzma with the NRP lineage. Review the Democratic Union inconsistency from sources before changing its classification. |
| Allow remembered and shared alternatives? | Yes: per-family remembered override; shared view freezes its rule/revision. Per-list curation is an inspectable personal definition. No silent family-specific default exceptions. |

Validation scope: examined current source, all nine preset files through their common schema/selected cases, the retained matrices and policy history; rendered the current selector in Simple level and the four bilingual sheets. Static mock-ups were visually reviewed; no production code, classification or scenario format was changed. No usability study, screen-reader certification or new historical-source verification is claimed.
