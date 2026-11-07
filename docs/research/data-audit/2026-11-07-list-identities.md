# Corrected pre-release list identities — 7 November 2026

The owner's pre-release instruction supersedes the earlier compatibility policy: internal list IDs follow `${knesset}-${correct ballot letters}`. Candidate IDs retain registered ranks under the corrected list ID. No aliases or ID migration remain.

## Changed IDs

| Election | Old → corrected IDs |
| --- | --- |
| k2 | `2-ה` → `2-ו`; `2-טח` → `2-טת` |
| k3 | `3-סא` → `3-סצ` |
| k4 | `4-טט` → `4-טש`; `4-סט` → `4-סש`; `4-רו` → `4-רנ` |
| k5 | `5-סס` → `5-סש`; `5-עע` → `5-עט` |
| k6 | `6-כס` → `6-כנ`; `6-עס` → `6-ענ`; `6-סס` → `6-פש` |
| k9 | `9-הם` → `9-הפ`; `9-חך` → `9-זך`; `9-ים` → `9-ימ`; `9-סם` → `9-ספ`; `9-פז` → `9-פ`; `9-פח` → `9-פז` |
| k10 | `10-הם` → `10-הס`; `10-טן` → `10-טז`; `10-יש` → `10-טי`; `10-ים` → `10-ימ`; `10-יפ` → `10-יס`; `10-נן` → `10-נז`; `10-נכ` → `10-נס`; `10-פז` → `10-סז`; `10-קנ` → `10-קז`; `10-קן` → `10-קי` |
| k11 | `11-הם` → `11-הס`; `11-טן` → `11-טס`; `11-פט` → `11-כט`; `11-נ` → `11-ס`; `11-עי` → `11-עד` |
| k12 | `12-זב` → `12-זכ`; `12-זפ` → `12-זעמ`; `12-טף` → `12-טיף`; `12-יע` → `12-יענ`; `12-מעם` → `12-מעש`; `12-קק` → `12-קם`; `12-קצץ` → `12-קמע` |
| k13 | `13-נז` → `13-נד`; `13-נס` → `13-נכ`; `13-קנ` → `13-קן` |
| k15 | `15-ט` → `15-יט`; `15-קף` → `15-קפ` |

## Removed compatibility mechanisms

- `legacyId` fields in reviewed national inputs and their TypeScript interfaces.
- Early-election `keyLetters`, k8–k12 `stableId`, and k13–k15 `LEGACY_ID_LETTERS` / `keyLetters` / `stableLetters` mappings.
- k9 lookup of old IDs to preserve corrected-list display metadata; the six corrected lists now use their actual IDs directly.
- Browser level migration from `explore`/`advanced` to `simple`/`expert`.
- The old `israel-elections:vote-source` preference-key fallback, including the browser test fixture.
- Automatic assignment of colours to older saved action logs (`migrateSavedColors`). New scenario colour assignment remains.
- Acceptance of the retired scenario identity palette solely for older explicit saved colours.
- Hardcoded family short-label lookup for legacy saved family snapshots; definitions without optional short labels now use their own names.

`scenarioDocument.ts` and `preferences.ts` contain current validation and document behaviour, with no saved-format migration to remove. Family party aliases reconcile a sourced registry with constituent identities; script transliteration supplies missing display metadata. These remain because they serve current data rather than stored-format compatibility. Scenario replay, invalid-input checks and build-version notices remain current save/share functionality.

## Numeric and reference verification

[Before/after table](2026-11-07-list-identities.csv): all 708 lists in all 26 elections have identical ballot letters, votes and official seats. Exactly 44 IDs change across 11 elections. A recursive comparison of the baseline against the rebuilt datasets, applying the ID replacements simultaneously and excluding `buildInfo`, has **zero other differences**. This also checks candidate rosters, allocation inputs, colours, agreements and all generated metadata.

References were updated in family catalogues, party registry/appearances, party links and lineage, candidate biographies and identity decisions, election context, list metadata, historical candidate-cap evidence, and generated public datasets/source manifests. No existing aftermath or logo overlay keyed on an affected old ID. Family dataset hashes and retained-input manifest hashes were refreshed.

Differential allocation, analysis, model and validation digests were refreshed because complete serialized outputs include the changed IDs and validation error paths. The rules digest is unchanged. No electoral arithmetic changed.

## Reproduction

Baseline commit: `754c93bdc88e52ae7c00684052522b21dbc2c151`. Inputs and dependencies are retained in Git and `package-lock.json`; verification used Node 24.18.0 and Python 3.14. Recover baseline national datasets with `git show <baseline>:public/data/kN.json`, match lists by their unchanged `letters`, and compare votes and `officialSeats[old/new id]`. The mapping above supplies simultaneous replacements for recursive comparison. The CSV preserves all before/after values.

Run `node scripts/build-datasets.ts`, `node scripts/joint-facts.ts`, `node scripts/validate-families.ts`, then `python3 scripts/validate-party-logos.py`. Typecheck with `npx tsc -p tsconfig.json --noEmit`. Unit verification uses `npx vitest run --maxWorkers=2`; on the contended shared machine the unchanged locality rebuild exceeded its five-second limit, while the full suite passed with `--testTimeout=30000`. Browser checks use the isolated build (`npx vite build`), `PW_PORT=43128 npx playwright test tests/e2e/historical-identities.spec.ts tests/e2e/elections.spec.ts --workers=1`, and the full suite on `PW_PORT=43127` with `--workers=2`.

## Verification evidence

Dataset build → joint facts → family validation → logo validation passed in the requested order. All nine family catalogues validate across k1–k26; logo validation covers 26 overlays, 184 source records and 131 assets. TypeScript passed. The final unit run passed **103 files / 965 tests** with the shared-machine timeout allowance above; a focused historical run passed **31 files / 196 tests**. Final-build election, family and corrected-ID browser regressions passed **31 tests**, including Hebrew and English list-detail checks.

Captured and inspected 36 screenshots under `.backup-scratch/d1/`: k1/k25/k26 × Hebrew/English × light/dark × widths 1500/1024/390. Contact sheets are `k1-contact.png`, `k25-contact.png`, and `k26-contact.png`. These routine diagnostics are deliberately outside the durable source record.

The full browser run encountered the obsolete assertion that stored `advanced` levels migrate to `Expert`; the assertion now checks the requested no-migration fallback to `Simple`. Eight graphics-audit cases exceeded their 180-second budgets. A fresh build of the **unchanged baseline commit** reproduced the same `page.evaluate: Test timeout of 180000ms exceeded` failure for Hebrew/light/desktop on port 43129. This is observed baseline failure under the current shared-machine conditions, not a geometry assertion. No Hemicycle or unrelated graphics code was changed.

Final full-browser result: **538 passed / 14 failed (552 cases, 45.8 minutes)**. Five transient list-loading/map-loading/layout failures passed independent final-build rechecks; the obsolete level-migration assertion was replaced and passed. Final-build focused checks total **60 passed** (31 election/family/identity + 25 level/list-control + 4 map/layout rechecks). The remaining eight graphics timeouts are documented above, with the unchanged-baseline reproduction. The baseline and this patch both time out in the same case; no unrelated graphics fix was attempted in this data lane. No push or merge.
