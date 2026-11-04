# The demo bar

The minimum the explorer must meet before it is called a good demo. Each box is something to actually do
and observe, not a feeling. A box passes only if it passes in **all eight combinations**: Hebrew and English,
light and dark, desktop (1440×900) and phone (390×844, touch).

"Blocker": stops the task, shows something false, or breaks the page. "Major": the task completes but a
first-time visitor would likely get stuck, misread it, or need instructions. "Minor": craft (alignment,
wording, spacing, a sluggish moment).

**Pass mark:** every box ticked, no blocker, no major; then the owner plays for 15 minutes and nothing makes
him stop.

## 1. True

- [ ] Every election's official result reproduces exactly (automated: `npx vitest run`).
- [ ] Nothing shown is invented: every logo, link, bloc grouping and note has a source; gaps are labelled as
      gaps (no English Wikipedia anywhere).

## 2. The eight tasks (each with no dead end and no outside instructions)

- [ ] **Understand a result.** Open the app, pick an election: who won, how many seats each list has, which
      blocs exist and whether any reaches 61, which lists fell below the threshold.
- [ ] **Change votes, see seats move.** Raise or lower a list's votes; the chamber, blocs, list bars and
      "What changed" all update; Undo returns exactly to before.
- [ ] **Merge or split.** Merge two lists, and split a joint list (both "ran separately" and "split after
      the election"); the result is explained and undoable.
- [ ] **Blocs and coalitions.** Rename, recolour, add and delete a bloc; move a list and a single party of a
      joint list between blocs (by drag and by tap); build a coalition to 61 in the Coalitions tool.
- [ ] **Compare.** Compare the scenario with the official result and with a saved scenario; the differences
      are drawn, not only listed.
- [ ] **Save, share, reopen.** Name and save a scenario; copy its share link; open the link in a fresh tab
      and get the same scenario; export and import it.
- [ ] **Why did a seat go there?** From a list, find out why it got its last seat (allocation walkthrough,
      surplus agreements, votes to the next seat).
- [ ] **Explore places** (Expert): the locality map shows results by place and follows the scenario's colours.

## 3. Joined up

- [ ] An edit made in any tool shows everywhere it applies (chamber, blocs, lists, What changed, Compare).
- [ ] Undo and Redo work after an edit in every tool; switching election and back keeps the work.
- [ ] The same thing is called the same name and drawn the same way on every page.

## 4. Crafted

- [ ] No horizontal scrolling, clipped or overlapping text in any of the eight combinations.
- [ ] No console errors or failed requests during the eight tasks.
- [ ] Every control is reachable and operable by keyboard; focus is visible; Escape closes what it opened.
- [ ] Text and controls meet contrast in both themes; colour is never the only signal.
- [ ] First view on a phone is usable within ~3 s on a normal connection; no edit freezes the page.

## 5. Honest about what is unfinished

- [ ] Anything half-built is hidden or clearly marked as partial (with what is missing).
