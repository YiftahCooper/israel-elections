# Browser tests (Playwright)

```sh
npx vite build                      # the tests run against the built site (vite preview), so build first
PW_PORT=4360 npx playwright test --workers=2
```

`PW_PORT` gives each checkout its own preview server. On the shared machine, run suites through `heavy` and with at most
two workers.

## A slow run before a release: `PW_SLOW=1`

GitHub's runner is several times slower than a desktop. A test that reads the page before it has finished (a map that
is still sliding, a scroll asked for on the next frame, bands easing to new widths) passes here and fails there. To see
those failures before CI does, run the suite with every page's CPU slowed:

```sh
PW_SLOW=1 PW_PORT=4360 heavy npx playwright test --workers=2 --reporter=line
```

- Every page is slowed 4 times through Chrome's own CPU throttling (`PW_SLOW_RATE=6` for more). This covers the default
  page, `browser.newContext()` / `newPage()` and pages the app opens itself.
- Test and `expect` timeouts are stretched by the same factor, so what fails is a race, not a test that merely needs
  longer.
- It works because every spec imports `test` and `expect` from `./fixtures`, not from `@playwright/test`
  (`tests/e2e-imports.test.ts` keeps it so).

Run it before a release, and after changing anything that animates, measures or scrolls.

## Waiting without fixed timeouts

Never `waitForTimeout` for something to finish: wait for the thing itself.

- `waitForStill(page, selectors)` (`settle.ts`): until those elements' boxes and the scroll positions have kept still for
  6 frames, however long a frame takes. Use it before measuring after a click, a resize, a scroll or an animation.
- `boxesNow(a, b, …)`: several boxes read in one step, so nothing moves between the reads.
- `panelSettled(page)`: the analysis panel's lazy screen has loaded and its text has stopped changing.
- `frames(page, n)`: for a check that something did *not* happen on the next frames.
- `settleMap` / `mapLayout` (`map-settle.ts`): the same for the Localities map and its canvas.
- Hover timing (`hover-timing.ts`): the page records when the pointer moved and when the box appeared, changed or
  went, and the test compares those times with the app's own delays, instead of waiting a fixed time from the runner.
- `hoverSeat` (`seat-hover.ts`): hovering seat after seat; goes round the open card when it covers the next seat, and
  reads the card once it has stopped changing.
- Something written a moment later (the workspace is saved 250 ms after the last change): `expect.poll` on the stored
  value.
- A value the test makes late on purpose (a slow download): hold the route on a promise and release it when the test is
  ready, instead of a timed delay.

A fixed wait is right only where the time itself is what is tested: a message that must stay open for its full time,
or proving that nothing happens or moves for a while (no download, nothing stored, the page stays put).
