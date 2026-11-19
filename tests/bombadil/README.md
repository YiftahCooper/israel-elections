# Bombadil exploratory testing

[Bombadil](https://github.com/antithesishq/bombadil) clicks, types and scrolls through the app at random and checks
properties after every step. `spec.js` holds:

- Bombadil's default properties: no uncaught exception, no unhandled promise rejection, no console error, no HTTP error.
- `noHorizontalScroll`: the page never scrolls sideways.
- `noLeakedValues`: "[object Object]", "undefined" or "NaN" never appears in visible text.
- `seatChartsShow120`: every Knesset seat chart shows 120 seats and 120 in its centre.
- `directionMatchesLanguage`: `html[dir]` agrees with `html[lang]` and with the pressed Language button.
- `turnoutMatchesCounts`: the Turnout tile's percentage equals ballots cast ÷ registered voters (as its window lists
  them) to the precision shown.
- `listSeatsAddUp`: the seats in the Lists column, and in the Charts results table, add up to 120 (to the seat
  chart's figure when experimental rules change the seat count).
- `noTextOffScreenSideways`: below 500 px wide, no visible text runs off the left or right edge of the screen (text
  in a box that scrolls sideways, or cut short by an ellipsis, does not count).
- `actionsMix`: Bombadil's default actions, reweighted so the 120 seat buttons and page reloads do not crowd out the
  rest of the app, plus three custom actions from `switches.js` at about 1–2% of steps each: switch the language,
  pick another election, change the complexity. They go through the app's own controls (opening the phone menu or
  Settings when the control is not on screen).

`spec-english.js` is the same spec for an English session: while the app is in Hebrew, switching to English is by
far the likeliest next step (weight 1000 to 1), so about 98% of steps run in English.

The specs are plain JavaScript so the project typecheck skips them; the `@antithesishq/bombadil` modules come bundled
in the binary. Tested with v0.8.0 (npm `@antithesishq/bombadil@0.8.0`, binary in its `binaries/` folder); v0.7.10
also runs them but freezes part-way through many runs.

## Run

```bash
npx vite build
node node_modules/vite/bin/vite.js preview --port 4350 --strictPort &   # note the PID; stop it afterwards
mkdir -p .backup-scratch/bombadil-run
CHROME=~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome \
  heavy bombadil browser fuzz --headless --instrument-javascript "" --swarm --parallelism 2 \
  --time-limit-fuzz 15m --time-limit-run 60s --output-path .backup-scratch/bombadil-run/run.bin \
  http://localhost:4350/ tests/bombadil/spec.js        # or spec-english.js; add --width 390 --height 844 for a phone
```

`fuzz` runs many one-minute runs, each in a fresh browser, two at a time; `--swarm` gives each run a random subset of
the action kinds. In v0.8.0 `--output-path` names a trace file (for `fuzz`, a base: run-0.bin, run-1.bin, …), and
`bombadil trace --json <file>` prints a trace as JSON lines. The `headless-shell` Chrome variant of v0.8.0 stalls on
this app after the first step; use the full Chromium.

- `--instrument-javascript ""` matters: with coverage instrumentation on (the default) our bundle stalls every step
  and a run manages about 45 actions a minute instead of about 350. `--chrome-virtual-time-policy Advance` is slower too.
- The app opens in Hebrew; use `spec-english.js` for a mostly English session.
- `--output-path` must be new (or add `--output-path-overwrite`).

Violations print in the console log and the run exits non-zero. `bombadil browser inspect <output-path>` opens a
viewer of the trace with screenshots; `--reproduce <output-path>` (instead of `--time-limit`) replays a run.
