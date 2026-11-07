# V1c colour guard — 7 November 2026

The party-fill policy below is superseded by [the canonical-colour review fix](v1d-party-colours.md). The shared guard, scenarios, blocs, families, map and picker work remains in place.

The shared policy is `src/data/colourGuard.ts`, built on the existing CIEDE2000/OKLab implementation in `src/data/colour.ts`. Assignment, display variants, picker advice, build-time separation and tests use it. Colour distance is a project readability rule, not a WCAG formula. Text contrast uses unrounded sRGB luminance: 4.5:1 for ordinary text; meaningful mark boundaries use 3:1. See [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Inventory and policy

| Co-displayed context | Distinctness | Background/foreground treatment |
| --- | --- | --- |
| Winning lists: chamber, list column, chart legend, bloc strip, waffles and compare | Existing election policy: ΔE00 ≥15 for every pair, ≥20 for adjacent lists. National seat-winning list colours are unchanged; 13 clashing national-seat losers get display variants when they can win a locality. | Source fills retained; neutral outlines supply ≥3:1 boundaries in both themes. Labels accompany colour. |
| Joint-list constituents: chamber/Blocks, hover, legend, list bars, bloc chips, family point sheets, compare and chart/PNG/SVG exports | ΔE00 ≥20 between historical siblings globally; neutral separator contrasts ≥3:1 with dot and ring. All parties include the lead. | One resolver serves every outlet. Custom choices are exact and advisory. |
| Bloc identities and bands | Solid identities ≥20; actual 14% light/22% dark region tints ≥8 from one another and No bloc. | Region border uses theme secondary ink, checked against each tint. Cards/chips/corridor text is checked on its actual mixtures. Geometry is unchanged. |
| Families: chips, history lines, points, hatching, grouped views | Nine shipped identities ≥20; grouping neutrals ≥15. New personal copies receive a separate persisted display colour. | Marks checked on both panel and quiet plot surfaces. Numeric policy icon chooses black/white ink for ≥4.5:1. |
| Saved scenarios, switchers, saved cards and compare sides | Global assignment across elections; farthest passing unused palette colour, then a derived colour. Shipped palette ≥20. | Chrome uses black/white foreground selected from its actual identity colour, including hover/selected states. Arbitrary valid hex identities survive replay, share and export. |
| Map legend classes | Categorical list/bloc identities (including national seat losers that win a locality), plus tie/unassigned/no-vote black; neutral clears ≥20 from all shipped winning lists and blocs. | Opaque point fills; outer white and inner dark outlines preserve boundaries over arbitrary tiles. Legend uses theme secondary-ink borders. No sequential colour scale exists. |
| Custom list, merge, party, bloc and scenario pickers | Local co-display checks, using the same thresholds and backgrounds. Bloc advice also checks region tints. | Bilingual inline warning, suggested nearest alternative, explanation behind (i). A choice is never blocked or silently replaced. |

Text/mark pairs inventoried by the sweep: primary, secondary and muted text, links/focus, error/experimental text, gains/losses on page/panel/quiet/open surfaces; both shell inks on shell and shell hover; warning and error panels; threshold text on both hatch colours; ballot-paper ink; scenario chrome foreground/selected/hover; family numeric policy marks; bloc card/chip/strip mixtures; chart/list/seat/swatch boundaries; map fill/halo and legend boundaries. Decorative gridlines, disabled controls, hatched background fills and dimmed de-emphasised items are not claimed as independently meaningful 3:1 marks. Logos retain their sourced artwork and paper backing.

The sweep reads real CSS tokens and the renderer's tint mixtures. `party-colours.test.ts` checks the app's actual chamber/column neighbour orders in every election. `party-display-colours.test.ts` checks every joint list, including non-elected siblings, and resolver consistency with seat holders and bloc pieces.

## Root cause and stable party bases

“Save as” inherited the source identity and assigned a colour only when missing. It now assigns for each new saved identity; colours already used in **any election** are reserved. The finite-palette validator also used to discard derived identities; valid hex values now survive the whole document lifecycle. Existing explicit choices remain unchanged.

The appearance index in `src/data/party-colour-research.json` includes retained low-confidence research. It does not promote confidence or add a factual dataset colour. An election's own recorded party colour wins; where that election has no record, the party's most frequently recorded colour is its stable canonical base (hex-order tie-break). A party with no recorded/supplied colour uses a hash of its party id, independent of election/list/theme/locale. Explicit scenario party edits override research exactly.

Party fills are now compiled once over the complete historical co-appearance graph. Ring colours never influence the fill. Lower-priority conflicting parties move by hue/chroma while keeping OKLCH lightness within .02 of the base. Genuine recorded-year variants are explicit; registry aliases share one party identity. Neutral separators provide the contrast boundary in both themes. See [the review-fix report](v1d-party-colours.md), [per-party stability counts](party-colour-stability.csv), [every global adjustment](party-colour-adjustments.json), and [the before/after table against 92aab28](party-colour-before-after.csv).

## Preset changes

[All old → new values and reasons](colour-preset-changes.json) are retained: 13 locality-leading list entries, 93 bloc entries, five scenario choices, six family choices, nine bloc-editor option changes/removals, one map neutral, and 39 generated family-group colour variants (166 records total). No party research colour, confidence, vote, seat, membership, roster, national seat-winning list colour, build timestamp or engine input changed. Family evidence files only refresh their dataset hashes after the bloc display-field changes.

Family-generated groupings also pass their generated bloc identities through the shared guard, including the mixed/other categories. The bloc editor now offers seven mutually separated choices. Three redundant choices were removed; further automatic colours are derived against the currently displayed grouping. The light/dark corridor consequence label uses primary ink; chart boundaries use secondary ink; family mixed marks retain full opacity. These changes fix mark/text legibility without changing research artwork or election facts.

Reproduce the research index with `node scripts/build-party-colour-research.ts`; regenerate party exception/before-after evidence with `node scripts/report-party-colours.ts` (`92aab28` is the fixed review baseline). `node scripts/repair-colour-presets.ts` is a read-only proposal; `--write` applies colour fields only and coalesces its change report. The final proposal is empty (idempotent).

## Verification and limits

TypeScript and all 1,003 Vitest tests pass. Browser verification covers Hebrew/English, light/dark, 1500/1024/390 pixels, k26/k25/k1, plus k24/k19/k16 constituent charts and 3× crops. Screenshots and the Playwright capture script are under `.backup-scratch/v1c/`; advice screenshots are also produced by the committed e2e test. All 83 targeted e2e checks plus the corrected split-party compatibility check pass (84 targeted cases). The fresh full e2e run passes all 569 tests with two workers (16.1 minutes). TypeScript, production build and all 1,003 unit tests pass. The sole outdated full-suite assertion required the old lead-party/list-colour fallback; it now checks the requested ΔE ≥20 separation.

Screenshot examples: `party-dots-3x-light.png`, `party-dots-3x-dark.png`; `k25-he-light-Arc-390.png`, `k24-en-dark-Blocks-1500.png`; `advice-en-light-390.png`; `families-he-dark-390.png`; `loc-en-light-1500.png`; `family-group-en-dark-1500.png` (all under `.backup-scratch/v1c/`). Capture parameters are in `capture.mjs`, `capture-surfaces.mjs` and `capture-family-group.mjs` in that directory.

No finite RGB gamut can give unlimited categories a fixed pairwise ΔE. The assigner never repeats an available distinct palette entry; after palette exhaustion it searches a deterministic RGB grid, and if the requested margin itself is exhausted, returns the best unused margin. Picker advice exposes a remaining clash; labels and outlines continue to identify the items. This is not a claim of colour-vision-deficiency simulation or whole-app WCAG conformance.

Final verification logs are reproducible scratch output: `.backup-scratch/v1c/tsc-final.log`, `unit-ready.log`, `targeted-release.log`, `list-contract.log`, `e2e-verified.log` and `build-release.log`. The preview is served on port 4197; tests use port 4198 (the focused compatibility check used 4199). No push, merge or deployment was performed.
