# Hebrew locality name verification (2026-11-07)

The Hebrew resolver preserves the CEC source row and accepts CBS replacements for punctuation, strict-prefix truncation and deterministic spelling equivalence, after excluding recorded historical transitions. Rejected visibly truncated CEC names show CBS separately in the table and tooltip. [Counts and all retained conflicts](../research/locality-hebrew-names.md) are generated from the official retained inputs.

Native-size inspection: 1500×1000 and 390×1000, k16/k25/k26, light/dark. Each case captures the corrected code 964 name and Lakiya (1060) in the Negev. Labels are legible, RTL parentheses stay with the name, and corrected map/search/detail/table names agree. Background tiles are deliberately blocked to isolate this application's labels and avoid external map-service dependence. The screenshots verify labels, not the basemap.


The 24 captures (k16/k25/k26 × 1500/390 × light/dark × corrected label and Lakiya area) are routine evidence and are not kept in the repository; they are regenerated into `.backup-scratch/` by `tests/e2e/locality-map.spec.ts`.

The browser tests also check original CEC alias search, corrected names in the nearest-locality message, and JSON downloads containing both displayed `nameHe` and original `cecNameHe` with source metadata. Tarabin remains CEC because the nearest CBS edition differs in letters.

Reproduce with the repository lockfile dependencies and Chromium installed: `npx tsc --noEmit`, `npx vitest run --maxWorkers=3`, `npx vite build`, then `PW_PORT=4287 npx playwright test --workers=3`. The visual cases live in `tests/e2e/locality-map.spec.ts`; new captures go to `.backup-scratch/`. Pinned CBS parser dependencies and name-data regeneration are documented in `scripts/build-locality-hebrew-names.ts`.

Verification toolchain: Node 24.18.0, TypeScript 7.0.2, Vitest 5.1.0, Vite 8.3.5, Playwright 1.64.1. TypeScript, the 1,268-test unit suite and production build pass.

Follow-up verification merged `origin/main` at `58232ba` (merge commit `9c8504c`). All 21 Hebrew resolver/data cases and the full 1,268-test unit suite pass, together with TypeScript and the production build. All 13 focused map/export cases pass, including k16 retained-truncation CBS disclosure. All 24 linked captures were refreshed and inspected at native resolution.

Final follow-up full run: `PW_PORT=4302 npx playwright test --workers=3` — **697 passed** (8.6 minutes), after merging main. Totals across elections: 47 parentheses repairs (overlapping the other categories), 34 truncation recoveries, 387 spelling substitutions, 26 retained rename/merger conflicts, and 33 retained other same-code conflicts. Another 1,165 rows have no CBS code/name match and keep tidied CEC; these are included in the report's “Kept (other)” totals and broken out separately. The repaired but still truncated `סואעד (חמרייה) (שב` stays CEC because CBS is shorter, with `(CBS: סואעד (חמרייה))` disclosed beside it.
