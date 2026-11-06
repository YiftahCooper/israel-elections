# UI lane integration repairs — 6 November 2026

Base: `5f2a4f3`. No upstream merge. Classification uses the lane diffs, not the old test expectation alone.

| Original failure | Evidence and classification | Resolution |
| --- | --- | --- |
| Charts Table pointer click stays unpressed | Code regression. U5 `30e9aad` appends `.band { flex-wrap: wrap }`, overriding the desktop compact rule. The two-row sticky band covered the switch when the existing test scrolled it to 160px. | Restore a single desktop row; the unchanged real-pointer Charts test passes. |
| Three metadata-only saves share a colour | Stale test. U7 `a2eb7a7` explicitly gives snapshots with unchanged facts neutral swatches (`ScenarioSwitcher` preview); its acceptance record classifies names as metadata. | Test neutral named official snapshot separately, and require three distinct colours for three factually edited saves. |
| English/Hebrew phone band is 266px | Code regression plus incompatible old height budget. U5 adds 44px phone targets and wraps `.band-actions` internally. | Keep actions on one row; tighten gaps; four readable rows total 204px. Exception rationale below. |
| English light/dark desktop band is 96px | Code regression from the same U5 wrap override and the full brand width. | Stable 280px election slot, short bilingual brand at desktop, 230px scenario slot, nonwrapping actions. Desktop is 54px, below the unchanged 60px test limit. |
| Description lacks factual Edited marker | Stale test. U7 `a2eb7a7` removes description from `inputDiffs`; `ACTION_CLASSIFICATION` explicitly makes it author metadata, saveable and undoable without a factual marker or tint. | Assert no marker/history and an enabled save, while retaining both blur and Enter undo checks and coalition-selection preservation. |
| Scenario slot is 190px at 1024/1500 | Code regression. `git log -S 'flex: 0 1 190px'` identifies U5 `30e9aad`. | Restore a nonshrinking 230px slot; retain the original >200px and readable-label assertions. |
| Sourced grouping lacks History | Stale test. U7 `a2eb7a7` changes ChangeSummary to `factLog(s)` and classifies `applyBlocScheme` as view-only. | Require no factual History and “No changes yet”; retain grouping undo. Auto Compare now correctly opens the previous election (`c4e7904`); explicit same-election comparison has no differences. |

## Phone budget exception

A 390px viewport has 370px inside the header gutters. A 170px band can accommodate at most three 44px rows. Even without gaps, three rows offer 1110px of horizontal control space. The eight action targets alone need at least 352px; the labelled levels occupy 262px; the scenario slot must exceed 200px; the election needs two 44px arrows plus its readable date/Knesset selector; About/publication status occupies 151px in English; the short brand occupies 60px. These exceed the three-row budget even before inter-control spacing. Keeping all controls directly available and their labels readable therefore requires four rows. No targets were reduced or controls hidden behind a menu.

The repaired phone layout measures 44 + 44 + 46 + 46px for the election, About/scenario, levels and actions rows, plus three 4px gaps and 12px outer padding = 204px. The two segmented groups include their borders. The phone bound is changed from 170px to this measured 204px; desktop's 60px bound and scenario's >200px bound are unchanged. The existing U5 tests check hit areas and viewport containment in both languages at 1500/1280/1024/768/390, across k26/k25/k1. Existing header stability tests check elections and first edits.

## Reproduction and visual evidence

Build with `npm run build`; serve on 5491. Scratch scripts and PNGs live in `.backup-scratch/ui-integ-fix/` (not committed). `matrix.mjs` captures k26/k25/k1 for Hebrew/English, light/dark, 1500/1024/390. Files follow `<lang>-<theme>-<width>-<election>.png`. Dependencies are copied into scratch because the shared dependency directory is read-only and Vite writes `.vite-temp` there. No dependency versions changed.

Visual review uses three scratch contact sheets (`contact-k26.png`, `contact-k25.png`, `contact-k1.png`) retaining every matrix header. The initial view exposed an unnecessarily truncated election label at 1024px; restoring the stable 280px election slot keeps the readable date/Knesset label while the short desktop brand provides sufficient room. No height or target allowance changed for this refinement.

## Checks

- Production build and `npx tsc -p tsconfig.json --noEmit`: pass.
- `npx vitest run --maxWorkers=2`: 919 passed, three default-5s timeouts during shared-host contention (biography-links and two What-if cases). Full recheck with `--testTimeout=20000`: **922 passed, 97 files**.
- Final targeted Playwright run, `PW_PORT=5491 ... --workers=2`: **79 passed** in nine files: charts-screen, controls-design, qa2-leftovers, polish, reference-repairs, top-overview-qa2, wave-one, header-controls-u5 and view-only-actions. This covers all original ten failures, every edited spec, and retained hit-target/view-only regressions. Earlier Hebrew all-election timeouts passed on recheck without test timeout or application changes.
- All 36 final matrix headers read in the contact sheets. Measured height is 54px / 94px / 204px at 1500 / 1024 / 390 in both languages/themes across k26/k25/k1; no document width exceeds its viewport. No full e2e suite, push, merge or deployment.
