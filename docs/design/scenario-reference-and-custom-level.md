# Scenario references, new groupings and the custom level

Owner requests, 4 November 2026. Design agreed in conversation; to be implemented after Wave 1 of `docs/research/prior-art-synthesis.md` merges, because it touches the same components (`ChangeSummary`, `Blocs`, `TopBar`, `store`).

## 1. Start a new grouping from nothing

Today a custom grouping is made by editing a sourced preset: deleting, adding and renaming its blocs. Instead, a **+** button beside the grouping dropdown in the bloc panel will:

1. Ask for a name ("Unity government", "ממשלת אחדות").
2. Create a grouping with that name and two empty blocs (renamable; "+ New bloc" adds more). Every list and party starts in the **No bloc** pool, ready to be dragged or moved.

Details:

- The grouping's name appears wherever sourced groupings show theirs: the dropdown, bloc summaries and Compare. It carries an **edited** marker, never a date or source.
- It is an ordinary undoable action. Add a `name` to the custom grouping in the scenario, so `setBlocs` can carry it; `blocSchemeId: null` keeps meaning "not a sourced grouping".

## 2. Mark every edit; the reference decides what counts as an edit

Principle: **anything not true of the real election is marked at a glance.** This covers votes, names, colours, groupings, agreements, rules, merges and turnout.

One shared marker is used everywhere:

- a small "edited" glyph plus the accent outline already used for changed seats;
- hover or focus shows "Edited: was X";
- in exports, the marker is printed as text.

**Reference.** Markers show differences from the *reference*:

- With no scenario loaded, the reference is the official result.
- Saving a scenario, or loading a saved one, makes that scenario the reference.
  - The view becomes clean: its own changes are no longer flagged one by one.
  - New edits are marked against it.
  - Compare and "Since …" summaries name it ("Since *Unity government*").
- This lets people switch between saved scenarios and compare them cleanly.

**Never mistakable for the real result.** Whenever the current state differs from the official result, a persistent scenario badge stays visible. This holds even when the item markers are quiet because a saved scenario is the reference.

- The badge reads "Hypothetical · *name* · 7 changes from the official result".
- It expands to list those changes.
- It cannot be dismissed, and it travels into shares and exports.

**Setting.** "Mark differences from: the loaded scenario (default) / always the official result". The second option keeps every per-item marker against the real election.

A scenario is the existing `SavedScenario`: a name plus an action log replayed from the official data. The changes it holds (votes, names, colours, groupings…) are its parts. No new storage model is needed. Add one piece of store state, `reference`: the replayed scenario at save or load time, or null for official. Also add one derive helper, `differsFromReference(path)`, which every marker uses.

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
