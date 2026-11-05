# Release review — 5 November 2026

Review of ab7ebce, with local repairs on `t3/4f6e1793`. Verdict: **READY WITH CAVEATS**, with the verification limits below. No push, deployment, engine changes or dataset changes.

## Confirmed defects and repairs

- Full names must remain readable without widening the page. Renaming a bloc to a long sentence widened a 390px Hebrew phone to 488px; an unbroken name also escaped the bloc legend. Allow wrapping in the change summary and phone legend. The same rule repairs official long list names in the merge picker (k22 previously reached 424px). Four bilingual/theme regressions include unbroken names and undo; two more cover the k22 picker.
- Counts must remain legible on their actual background. Compare used white counts on pale bloc regions (measured contrast 1.29–1.46:1). Use theme ink. Family scaling repeated counts in pink strips at 3.52:1; remove those duplicates and retain the adjacent exact counts. Party colours and calculation inputs are unchanged.
- A tool must release asynchronous work when it closes. Leaflet's `_onZoomTransitionEnd` called `_getMapPanePos` after navigation removed the pane, throwing on `_leaflet_pos`. Disable Leaflet's delayed zoom transition; map selection and zoom remain available. A real zoom → navigate regression reproduced the exception before the change and passes after it. No dependency upgrade or private Leaflet patch.

## Evidence and limits

- TypeScript, production Vite build, 712 unit tests (80 files), and the final frozen-build run of all 233 browser checks pass (3.5 minutes, two workers). Earlier audit runs included a graphics timeout during a rebuild and a test-title collection mismatch; the graphics case passed serially and both are superseded by the complete clean run. Nine new browser tests are in `tests/e2e/release-readiness.spec.ts`.
- Two scripted sweeps each checked 1,530 states: all 26 elections and 15 tool tabs in Hebrew/light at 390px; k26/k25/k12/k1 additionally at 360/390/768/1024/1440 in Hebrew/English × light/dark. Final sweep: no application exceptions, no document horizontal overflow, no unnamed enabled controls according to the scripted check. It is coverage of visited states, not every possible edit.
- Eight first-visit journeys (Hebrew first, then English; both themes; 1440/390) performed source selection, a first vote edit, undo, share-link generation, k25 Meretz to four seats, merge Labor/Meretz, Compare, save and reload. Eight Expert journeys enabled experimental mode, chose 1.5%, opened the allocation result, waited for seat-safety rows and ran sensitivity. Existing browser fixtures cover joint-list facts, family counting, shared-link replay, reference switches, and historic law. Sixteen additional historic journeys (k1/k12 × languages × themes × sizes) typed a one-seat increase, opened the historic allocation result and Compare, reloaded the edited election and undid back to the original seat count. Both historic target elections also participated in the tool and graphics matrices.
- `@axe-core/playwright` is absent. Fallback checks inspected visible control names, roles through Playwright locators, text contrast against composited ancestor backgrounds, and the existing keyboard/focus tests. The contrast scan covered all 15 tools in both languages/themes; final scan found no failures in its evaluable HTML text. It skips gradients, opacity effects and SVG text; no screen reader, OS high contrast or physical-device pass was performed. No WCAG conformance claim.
- Public gallery requests returned HTTP 403 from `https://api.github.com/repos/YiftahCooper/israel-elections/issues?labels=scenario&state=open&per_page=100&page=1`. The app shows its unavailable state. Local saves and links work. Original map tile requests also returned some 403s; the final sweep stubbed tiles with HTTP 204 to isolate application lifecycle errors and avoid repeated requests to the external provider. No authenticated fallback or circumvention was attempted.
- The 2026 Gazette verification caveat remains intact. This review did not independently authenticate election data or confirm Gazette publication.

## Performance regression

Only release tag: `layout-v1` (4e0ee47, pre-redesign, 4 November). Built it from `git archive` using the same installed dependencies, served it on 5572 and the candidate on 5571. Node 24.18.0, Vite 8.3.5, Playwright 1.64.1; seven new Chromium pages per version, Hebrew Simple/light, no network throttling. Time is navigation to the first visible chamber, not LCP or a mobile network benchmark. Concurrent audit load varied, so timing differences are indicative and cannot be attributed solely to the code changes.

| Measurement | layout-v1 | candidate |
| --- | ---: | ---: |
| All emitted JS + CSS, bytes | 571,613 | 2,860,386 |
| Same assets individually gzip-compressed, bytes | 184,724 | 568,450 |
| Median first chamber, ms | 94 | 157 |
| Individual first chamber samples, ms | 110, 93, 92, 98, 96, 94, 93 | 168, 171, 152, 147, 160, 152, 157 |

Totals include lazy tools, family datasets and workers, not just the initial download; fonts and public data are excluded. The candidate main entry is about 518KB minified / 148KB gzip; registry chunk about 650KB / 50KB. Vite warns about chunks over 500KB. This is a real payload regression across the redesign; broader code/data splitting is outside a low-risk release repair. Local first display remains fast; constrained-network performance is unproven.

## Reproduction and screenshots

Use the lockfile dependencies, `npx tsc -p tsconfig.json --noEmit`, `npx vitest run --maxWorkers=2`, `npx vite build`, and `PW_PORT=5572 npx playwright test --workers=2`. Rerun a failed spec serially before classifying it. All disposable browser output belongs in `.backup-scratch/`.

Inspected captures under `.backup-scratch/rc-audit/release/`: `before-{he,en}-{light,dark}-{1440,390}.png`; all eight `summary-after-*.png`; `summary-before-he-light-390.png`; all sixteen contact sheets `contact-{he,en}-{light,dark}-{0,4,8,12}.png`; `final-he-light-k26-tab-compare.png`, `final-en-dark-k26-tab-families.png`, `expert-sens-he-dark-390.png`, `journey-en-light-390.png`, `history-k1-he-light-390.png` and `history-k12-en-dark-1440.png`. The screenshot filenames describe language/theme/size; screenshots and routine logs are not committed. Source, inputs and assertions for the repairs are retained in the regression tests.

Owner decisions: preserve full long names, remove redundant in-strip counts, and trade map zoom animation for reliable immediate navigation. No preference decision blocks release. Caveats to communicate: external gallery/maps availability, larger bundle, partial accessibility coverage and unverified 2026 Gazette publication.
