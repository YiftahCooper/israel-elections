# Canonical party colours — review fix

This replaces the per-list dot-fill policy in `92aab28`. The shared guard and scenario/list/bloc/family/map/picker changes are retained. Current main is integrated, including After the election and Compare; the integration keeps main's corrected IDs and election facts, and retains V1c's display-palette changes.

## Acceptance

- **215 / 267 appearances (80.5%) keep the exact recorded or stable-id base**, compared with 36 / 267 in the rejected pass. The remaining 52 use one global sibling-separation decision, never a ring-driven adjustment.
- **43 canonical parties appear in at least two elections. 34 have exactly one display colour overall.** Every party has exactly one display colour for each recorded base. The other nine have actual recorded changes: Agudat Yisrael, Balad, Degel HaTorah, Hadash, Labor, Mapam, Meretz, Ra'am and Yisrael Beiteinu. Each has two source bases and two display colours. The source file and canonical/year base difference are listed explicitly.
- **Zero unresolved historical co-appearance pairs.** A regression fixture also verifies that an impossible graph is reported explicitly and does not produce election-specific repairs.
- Research colours and confidence flags are unchanged. Registry aliases (`israeli-labor-party`, `mada`, `ram`) resolve to their canonical parties, rather than receiving separate identities.

[Every multi-election party and its distinct-colour count](party-colour-stability.csv) · [All 267 before/after appearances](party-colour-before-after.csv) · [Every global adjustment](party-colour-adjustments.json).

| Party | `92aab28` k24 / k25 | New k24 and k25 fill |
| --- | --- | --- |
| Otzma Yehudit | `#fdcabd` / `#771e06` | `#fd254a` (base `#f0491c`; global separation from Tkuma) |
| Ta'al | `#61510e` / `#f2cb06` | `#f2cb06` (exact base) |
| Tkuma | `#f47e49` / `#ffeee7` | `#f47e49` (exact base) |
| Noam | `#5793a6` / `#044554` | `#3f7b8d` (exact base) |

Hadash, Balad, Agudat and Degel retain their documented older/newer research bases. Balad's newer orange and Degel's older blue need global sibling variants; the same variant is used in every appearance of that base. They do not vary with rings, themes or elections.

## Mechanism and boundaries

`partyPalette.ts` builds the full sibling graph once. Priority is recorded confidence, then historical appearance count, then stable party id. A conflicting lower-priority node uses the nearest passing hue/chroma candidate at its source OKLCH lightness (1° hue / .01 chroma search). Later siblings' bases are reserved where possible to avoid unnecessary cascades. Only if no candidate passes at that lightness are ±.01 and then ±.02 permitted. If the graph cannot be cleared, the unresolved edge, distance and appearances are retained explicitly; there is no per-election fallback. Missing research uses a canonical-party-id base.

`build-party-colour-research.ts` compiles that palette into the appearance index; rendering only looks it up. An election may select another version only when its own research records a different colour. `partyDisplayColor.ts` supplies the same fill to charts, party rows, candidates, family details, compare seat data, legends and exports. Explicit user colour choices remain exact and advisory.

`PartyDot.tsx` supplies a neutral boundary rather than changing the fill. A single black/white separator is chosen when it contrasts at least 3:1 with both fills. Otherwise an inner and outer neutral hairline each contrast with their respective fill. The separator is about 1.5 CSS pixels at 1×, with non-scaling SVG strokes; the 3× raster has correspondingly more device pixels. Arc, Blocks, the reference chamber, waffle dots, hover/legend keys and standalone SVG/PNG exports use the same treatment. Ring colour is excluded from party-picker clash/contrast advice.

The global decisions and source index are regenerated with `node scripts/build-party-colour-research.ts`; the stability, adjustments and before/after tables with `node scripts/report-party-colours.ts` (fixed baseline `92aab28`).

## Visual and test evidence

Screenshots and capture scripts are in `.backup-scratch/v1d/`. The `party-dots-3x-light.png` / `party-dots-3x-dark.png` sheets retain the prior 1800-pixel width and original k16/k19/k24/k25 layout. Additional `party-history-3x-*.png` sheets inspect the eight requested parties across every election k16–k26 where a constituent dot is drawn. Empty cells mean no joint-list dot to crop, not necessarily that the party had no seats. Per-party acceptance counts include all appearances, including parties without elected seats.

Integrated main through `fc6e7f7` (After the election and the latest Compare refinements). TypeScript and the production build pass. All **1,158 unit tests in 118 files** pass with two workers and a 30-second test timeout; the unchanged demographic source-rebuild fixture took 5.25 seconds under host load on the first run, exceeding Vitest's default five-second timeout. The merged build also passes **43 targeted e2e checks** covering constituent dots, component seats, appearance, Compare and After the election.

The final full e2e run passes **600 / 600 tests** with two workers (18.2 minutes). Visual inspection covered Hebrew/English, light/dark, widths 1500/1024/390 and the original-size light/dark 3× crop sheets, including all eight requested parties across k16–k26. Reproducible capture scripts and the concise verification logs are under `.backup-scratch/v1d/`.
