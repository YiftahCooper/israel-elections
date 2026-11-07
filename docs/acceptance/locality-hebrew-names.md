# Hebrew locality name verification (2026-11-07)

The Hebrew resolver preserves the CEC source row and accepts CBS replacements only for punctuation/whitespace differences. [Counts and all retained conflicts](../research/locality-hebrew-names.md) are generated from the official retained inputs.

Native-size inspection: 1500×1000 and 390×1000, k25/k26, light/dark. Each case captures the corrected code 964 name and Lakiya (1060) in the Negev. Labels are legible, RTL parentheses stay with the name, and corrected map/search/detail/table names agree. Background tiles are deliberately blocked to isolate this application's labels and avoid external map-service dependence. The screenshots verify labels, not the basemap.

| Election | Width | Theme | Corrected Kudayrat label | Lakiya area |
| --- | ---: | --- | --- | --- |
| k25 | 1500 | light | [PNG](locality-hebrew-names/hebrew-corrected-k25-1500-light.png) | [PNG](locality-hebrew-names/hebrew-labels-k25-1500-light.png) |
| k25 | 1500 | dark | [PNG](locality-hebrew-names/hebrew-corrected-k25-1500-dark.png) | [PNG](locality-hebrew-names/hebrew-labels-k25-1500-dark.png) |
| k25 | 390 | light | [PNG](locality-hebrew-names/hebrew-corrected-k25-390-light.png) | [PNG](locality-hebrew-names/hebrew-labels-k25-390-light.png) |
| k25 | 390 | dark | [PNG](locality-hebrew-names/hebrew-corrected-k25-390-dark.png) | [PNG](locality-hebrew-names/hebrew-labels-k25-390-dark.png) |
| k26 | 1500 | light | [PNG](locality-hebrew-names/hebrew-corrected-k26-1500-light.png) | [PNG](locality-hebrew-names/hebrew-labels-k26-1500-light.png) |
| k26 | 1500 | dark | [PNG](locality-hebrew-names/hebrew-corrected-k26-1500-dark.png) | [PNG](locality-hebrew-names/hebrew-labels-k26-1500-dark.png) |
| k26 | 390 | light | [PNG](locality-hebrew-names/hebrew-corrected-k26-390-light.png) | [PNG](locality-hebrew-names/hebrew-labels-k26-390-light.png) |
| k26 | 390 | dark | [PNG](locality-hebrew-names/hebrew-corrected-k26-390-dark.png) | [PNG](locality-hebrew-names/hebrew-labels-k26-390-dark.png) |

The browser tests also check original CEC alias search, corrected names in the nearest-locality message, and JSON downloads containing both displayed `nameHe` and original `cecNameHe` with source metadata. Tarabin remains CEC because the nearest CBS edition differs in letters.

Reproduce with the repository lockfile dependencies and Chromium installed: `npx tsc --noEmit`, `npx vitest run --maxWorkers=3`, `npx vite build`, then `PW_PORT=4287 npx playwright test --workers=3`. The visual cases live in `tests/e2e/locality-map.spec.ts`; new captures go to `.backup-scratch/`. Pinned CBS parser dependencies and name-data regeneration are documented in `scripts/build-locality-hebrew-names.ts`.

Verification toolchain: Node 24.18.0, TypeScript 7.0.2, Vitest 5.1.0, Vite 8.3.5, Playwright 1.64.1. TypeScript, the 1,250-test unit suite and production build pass.

Final full browser run: `PW_PORT=4294 npx playwright test --workers=3` — **693 passed** (8.4 minutes). The nine new map/export/address cases and four Sources cases also passed as focused checks. All 16 linked captures were inspected at their original 1500×1000 or 390×1000 resolution. The earlier full run exposed one obsolete test expecting the locality download to remain a static link; its replacement checks the actual generated JSON and the retained raw CEC download, and the final full run passed.
