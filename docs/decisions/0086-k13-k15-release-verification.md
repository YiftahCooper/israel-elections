# K13–K15: released artifacts and verification

Enacted 2026-11-03 under the roster standard in 0083. All three picker entries are
available and the public national datasets are emitted. No deployment or push is
part of this worktree release.

| Election | Lists | Registered candidates retained | Elected names checked | Full / truncated / unavailable rosters | Agreements | Threshold | Quota |
|---|---:|---:|---:|---|---:|---:|---:|
| k13 | 25 | 121 | 120 | 0 / 10 / 15 | 0 (notice not recovered) | 39,253 | 20,715 |
| k14 | 20 | 129 | 120 | 1 / 10 / 9 | 6 | 45,782 | 24,779 |
| k15 | 31 | 122 | 120 | 0 / 15 / 16 | 9 | 49,642 | 25,936 |

Every official seat, including zero seats, reproduces with 120 allocated and no
warnings. Totals and allocation inputs remain the gazetted/CBS figures established
in 0080. Agreement pairs remain those established in 0081; the 1992 fallback is
explicitly authorized and disclosed in 0085. Full per-list coverage is in 0084.

Validation completed:

* `npx tsc -p tsconfig.json --noEmit` — pass.
* `node scripts/build-datasets.ts` — pass, including k13/k14/k15 public files.
* Build with `.backup-scratch/raw` absent — pass. This fresh worktree already had no
  such directory; the guarded move/build/restore procedure therefore needed no move.
  Production inputs and the reviewed JSON all come from retained `data/raw/`.
* `node scripts/check-colours.ts k13 k14 k15` — all pass; the required no-argument
  `node scripts/check-colours.ts` also passes for every available election.
* `npx vitest run` — **22 files, 212 tests pass**, including all three historical
  suites and `tests/datasets.test.ts` for the newly available elections.
* `git diff --check` — pass. Source ids are unique and public sources match SOURCES.

The first full test run correctly rejected two stale generated English status notes
after a wording edit; regenerating the datasets resolved this. The final checks above
used the regenerated artifacts. No test expectation was loosened to accept stale data.

A fresh `npm ci` failed on DNS resolution in this environment. Verification used a
scratch copy of the main checkout's installed dependencies: the two package-lock files
have identical SHA-256 `61aed9b84837bd5175877323ff7c106e50b3423c538c9faaf34dad4cac698253`,
and all **52 present locked package versions** match the lockfile. pdfjs-dist is
6.5.438 and Node is 24.18.0. No dependency or lockfile was changed. Fresh network
installation and browser interaction were not independently verified.

Rebuilding updates some other elections' `buildInfo.builtAt`; those unrelated JSON
changes are restored before committing, as instructed. The shared build loop changes
only to allow national-only jobs with no locality artifact. No application or engine
code changes are included.

Remaining limits are disclosed rather than certified away: the 1992 agreement notice,
separate departure chronology for Arens/Namir/Begin, all untranscribed later and
zero-seat rosters, locality derivations, exhaustive allocation-law amendment history,
and independent human transcription review. These do not change the observed
all-elected-name coverage or exact official-seat reproduction under the approved
release standard.
