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
  reliably recorded by name; votes that did not defeat a law are hard to establish. Research of 16 November found named,
  recorded dissent for selected cases (Chikli, the citizenship law, Gallant on conscription, retained-profits taxation),
  not a complete census; the timeline already shows the votes in its data (Standard if the government lost, Expert if it
  won).
- **Election-law eras in the Coalitions tool.** The tool applies today's law to every election for release 1. Later:
  each election's own rules (the required majority, the investiture rules of each era).

## Layout and settings

- **One-row top bar on medium screens.** Between 761 and 1399 px wide the top bar takes two rows. One row needs
  something taken out of it, which is a design choice for the owner.
- **A shared scenario never overrides the viewer's own settings.** Opening someone else's scenario leaves every
  setting unchanged (tested), but the scenario still shows joint lists the way its author chose while it is open. The
  viewer's own setting should win.
- **Colour changes in Settings.** The Colours list can name another election whose colours were changed back to the
  official ones; resetting another election's colours from Settings takes effect the next time it is opened;
  recolouring a saved scenario marks it unsaved, although colours are not part of the result.
- **Formation dots on phones.** On After the election, the dots of a government's formation name their event on hover
  only; a touch shows nothing.
- **Registered names on the Overview list.** The list composition still writes "(registered as …)" in brackets; Party
  history already puts the registered name behind an (i). The same rule should apply on the Overview.

## Before release 1

- **A full review, screen by screen and level by level**, by independent reviewers, as a reader would use the app, on
  a phone and a desktop, in Hebrew and English.
- **How "probable" facts are shown.** Count the facts still marked probable, per screen and election, and let the owner
  choose: keep today's wording, or show them plainly with the source (book and page) in the (i). Few dozen: keep as is;
  hundreds or more: consider the plain style. Decided by the owner near release (16 Nov 2026).
