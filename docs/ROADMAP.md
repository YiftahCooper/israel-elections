# Later: features, checks and additions

Work that is agreed or proposed but not part of the current round. Each item says what it is, why it waits, and what
would let it go ahead. Keep this list current: add an item when a decision says "later", and remove it (with the
release or commit that did it) when it is done. Known faults that are still open are also disclosed in the data-gaps
register (`docs/data-gaps.md`).

## Checks and known faults

- **MK history: the "N places short" count.** For a candidate who was not elected, MK history says how far below the
  last seat they stood. The count includes every candidate above them, also anyone who was elected but did not take
  the seat, so it can be one or more too high. No case is known on screen today. Needed: a check over every stored list
  that compares the count with the candidates who actually took seats, then the fix.
- **Facts no outside source has confirmed yet.** The audit of 12–13 November could not confirm thousands of stored
  facts because several official sites refuse automated reading. The page collector (a browser extension that fetches
  pages from the owner's own browser) is meant to close most of this; each fetched batch is checked against the stored
  data, and the register is updated.

## Features

- **Votes against one's own government.** Show when a minister or coalition member voted against the government in a
  recorded Knesset vote (for example the Defence Minister's vote in 2023). Waits for research into which such votes are
  reliably recorded by name; votes that did not defeat a law are hard to establish.
- **Election-law eras in the Coalitions tool.** The tool applies today's law to every election for release 1. Later:
  each election's own rules (the required majority, the investiture rules of each era).
- **Rotation agreements.** Show an agreed rotation of Prime Ministers (an alternate Prime Minister) where the government
  is shown, even when the rotation never took place. Research and display are in progress.

## Before release 1

- **A full review, screen by screen and level by level**, by independent reviewers, as a reader would use the app, on
  a phone and a desktop, in Hebrew and English.
