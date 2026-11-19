# Bombadil exploratory testing

[Bombadil](https://github.com/antithesishq/bombadil) clicks, types and scrolls through the app at random and checks
properties after every step. `spec.js` holds:

- Bombadil's default properties: no uncaught exception, no unhandled promise rejection, no console error, no HTTP error.
- `noHorizontalScroll`: the page never scrolls sideways.
- `noLeakedValues`: "[object Object]", "undefined" or "NaN" never appears in visible text.
- `seatChartsShow120`: every Knesset seat chart shows 120 seats and 120 in its centre.
- `directionMatchesLanguage`: `html[dir]` agrees with `html[lang]` and with the pressed Language button.
- `actionsMix`: Bombadil's default actions, reweighted so the 120 seat buttons and page reloads do not crowd out the
  rest of the app.

The spec is plain JavaScript so the project typecheck skips it; the `@antithesishq/bombadil` modules come bundled in
the binary (v0.7.10 tested, from the GitHub releases page).

## Run

```bash
npx vite build
node node_modules/vite/bin/vite.js preview --port 4350 --strictPort &   # note the PID; stop it afterwards
CHROME=~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome \
  heavy bombadil browser test --headless --instrument-javascript "" \
  --time-limit 12m --output-path .backup-scratch/bombadil-run \
  http://localhost:4350/ tests/bombadil/spec.js
```

- `--instrument-javascript ""` matters: with coverage instrumentation on (the default) our bundle stalls every step
  and a run manages about 45 actions a minute instead of about 350. `--chrome-virtual-time-policy Advance` is slower too.
- The app opens in Hebrew; the random clicks reach the Language switch during a run. Add `--width 390 --height 844`
  for a phone-sized run.
- `--output-path` must be new (or add `--output-path-overwrite`).

Violations print in the console log and the run exits non-zero. `bombadil browser inspect <output-path>` opens a
viewer of the trace with screenshots; `--reproduce <output-path>` (instead of `--time-limit`) replays a run.
