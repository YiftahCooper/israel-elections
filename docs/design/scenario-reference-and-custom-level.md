# Scenario references, new groupings and the custom level

Owner requests, 4 November 2026. Design agreed in conversation; to be implemented after Wave 1 of `docs/research/prior-art-synthesis.md` merges, because it touches the same components (`ChangeSummary`, `Blocs`, `TopBar`, `store`).

## 1. Every editable area can start fresh, not only blocs

The owner's bloc example is one case of a general principle:

> **Imagining something new must never require dismantling what is there.**

Each editable area of a scenario is a *part*. Today the parts are:

- votes
- lists and their names, letters and colours
- merges, splits and withdrawals
- surplus agreements
- blocs
- coalitions
- candidates and their order
- rules
- turnout and totals

Each part gets the same **Start from…** control, next to where that part is edited. The control has up to four choices:

- **Official result.** This is the reset.
- **A sourced preset**, where the part has presets: bloc groupings, rule sets of other eras, historical agreements.
- **That part of another saved scenario.** Parts combine, so one scenario can take its blocs from "Unity government" and its votes from "Meretz passes".
- **Blank**, where blank means something:
  - blocs: an empty, named grouping (the owner's example);
  - agreements: no agreements;
  - a coalition: nobody in it;
  - candidates: an empty order to build;
  - a new list: a list with no votes.

  Blank is not offered where it is meaningless. "No votes" is not a scenario.

Starting fresh is one undoable action. It is named where the part has names, and it is marked as edited. The control has one shared component and one action shape, so a part cannot be left out. A unit test checks that every part in the registry offers it.

### The bloc case

Here is how the principle applies to blocs. Today a custom grouping is made by editing a sourced preset: deleting, adding and renaming its blocs. Instead, a **+** button beside the grouping dropdown in the bloc panel will:

1. Ask for a name ("Unity government", "ממשלת אחדות").
2. Create a grouping with that name and two empty blocs (renamable; "+ New bloc" adds more). Every list and party starts in the **No bloc** pool, ready to be dragged or moved.

Details:

- The grouping's name appears wherever sourced groupings show theirs: the dropdown, bloc summaries and Compare. It carries an **edited** marker, never a date or source.
- It is an ordinary undoable action. Add a `name` to the custom grouping in the scenario, so `setBlocs` can carry it; `blocSchemeId: null` keeps meaning "not a sourced grouping".

## 2. Three classes of change; only appearance is exempt

**Owner decision, 7 November 2026** (supersedes the 6 November "analysis" class): bloc membership *is* a scenario change; only appearance is exempt. His 6 November words still set the test for appearance:

> “It should only actually count as a new scenario and look like a different result from the official one if something tangible changes. If it's just things like changing the block colours, that's arbitrary and shouldn't confusingly render as different from the actual election results.”

The colour fix is restricted to colours; anything that changes what the screen says is a change.

- **A — result:** votes, turnout/totals, list topology and identities, candidate rosters/order, agreements, lottery outcomes and allocation rules. Counted, listed in History, marked, scenario tint.
- **B — grouping and coalition:** bloc membership of lists, parties and members; creating, renaming or deleting a bloc; custom and family groupings and their names; coalition roles (In / Support / Abstain / Out / Any). Counted, listed in History, marked and tinted exactly like A. Where a change summary appears (top-bar summary line, History, the scenario switcher, Scenarios), a scenario whose only changes are B adds “Votes and seats unchanged” / “הקולות והמנדטים לא השתנו”. Choosing a sourced grouping, and faction counting, remain unmarked views. A family vote-scaling operation is A.
- **C — appearance:** list, party, bloc and family colours, display choices, sort order and view toggles. Never counted, marked or tinted; saved/shared with the scenario and retained for the official result. Recolouring a bloc is C; renaming it is B.

Identity, tint, counts and markers all use the same A+B comparison (`referenceChanges`; `resultChanges` is the same set). See [the complete field inventory](appearance-and-result-identity.md).

**Whole-part replacement.** A starting point, rule preset or family grouping replaces a part
and receives one marker at that part. Its induced list, bloc or agreement changes receive no
individual markers. A later individual edit compares with the replacement checkpoint; its
marker appears once even when the same field has several UI outlets. This applies to every
part in the registry, including list-scoped identity/candidate replacements. Undo restores
the previous scopes. Replaying the ordinary action log reconstructs scopes without changing
the saved format. Numerical seat comparisons always use the active reference, independently
of marker scopes.

**Reference.** Markers show differences from the *reference*:

- With no scenario loaded, the reference is the official result.
- Saving a scenario, or loading a saved one, makes that scenario the reference.
  - The view becomes clean: its own changes are no longer flagged one by one.
  - New edits are marked against it.
  - Compare and "Since …" summaries name it ("Since *Unity government*").
- This lets people switch between saved scenarios and compare them cleanly.

**Scenario colour, not repeated labels.** Revised 4 November 2026 after owner feedback: no repetitive "hypothetical" text.

- **Identity colour (A and B).** Every changed scenario has an identity colour, chosen from a scenario palette and editable. The colour is visible wherever scenarios are chosen (the saved list, the gallery, Compare's pickers), so a scenario is recognisable before it is opened.
- **Official result.** It always uses one reserved, untinted (neutral) treatment, and no scenario can choose it. An unsaved edited state gets the default scenario tint.
- **Chrome only.** The colour tints the app chrome: the top-bar band, the board frame, and the frames of Compare's two sides. It never tints seats, lists or bloc regions, because those colours are data.
- **One quiet text cue.** Colour alone fails for colour-blind readers and for cropped screenshots. So there is a single chip in the top bar: a swatch plus the scenario name. It expands on demand to list the changes from the official result.
  - It appears once, not under every change, and carries no change count while collapsed.
  - Exports carry the same one line in their footer.
- **Per-item edit markers** stay as a small glyph only. Their text lives in the tooltip.

**Setting.** "Mark differences from: the loaded scenario (default) / always the official result". The second option keeps every per-item marker against the real election.

A scenario is the existing `SavedScenario`: a name plus an action log replayed from the official data. Its parts retain result edits (A), grouping/coalition changes (B) and appearance (C) independently. No new storage model is needed. Add one piece of store state, `reference`: the replayed scenario at save or load time, or null for official. Also add one derive helper, `referenceChanges`, which supplies part/item markers, and `markerReference` for their previous values.

## 3. Levels: three presets plus Custom

Levels decide **what is open by default**, not what is reachable.

- **Reachable from anywhere.** Any section hidden at the current level can be opened in place ("More options") without switching the whole interface.
- **Keeping an opened section.** After opening a section in place, the user can choose "Keep this visible". This turns the level into **Custom (based on Simple)**: Simple plus that section.
- **Custom level page.** Custom also has a page listing every tool and section, grouped by task, each with a show / collapsed / hidden switch, and "Reset to Simple / Standard / Expert".
- **One registry.** A single feature registry drives the three presets and Custom, so a feature cannot exist in one and be forgotten in another.
- **Never hideable.** Truth labels cannot be hidden at any level, including Custom: the scenario badge, edit markers, exact/sampled qualifiers, publication-status warnings and data qualifications.
- **Scope of the preference.** The level is a browser preference, not part of a scenario or share link.
- **Testing.** E2e tests cover the three presets plus two representative Custom configurations; the registry has a unit test that every feature appears in each preset.

## Order

1. Shared edit marker plus reference state, including the setting and the badge.
2. New grouping button.
3. Feature registry, in-place disclosure and Custom.
