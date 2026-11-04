# Sourced locality groups and exact demographic turnout deltas

Status: **implemented** in the implementation worktree, pending parent integration. Written
4 November 2026. Related: 0087 (merged/split lists and constituent parties), 0088 (source fidelity).

## Context

A geographic turnout scenario needs sourced membership and the selected places' own party mix.
Election results cannot identify individual voters' demographic identities. The existing turnout
UI derives preference presets from party vote thresholds, which cannot establish demographic
membership. Locality data are available from k16 onward, but k17 lacks codes and electorates.

## Decision

1. Add compact groups and coverage to locality JSON, using retained CBS annual tables and
   separately dated published cohorts. Match CBS codes only; exclude every envelope row.
   Primary historical election datasets remain untouched. The k18/k19 retained locality fingerprints
   continue to verify the exact original fields; demographic metadata is stripped before that
   comparison and independently regenerated from hashed classification inputs.
2. Prefer election-year CBS tables; use the latest retrieved full file, 2024, for k26. Haredi
   authorities use an explicit 2021 IDI named cohort, Druze localities a ≥95% 2022 CBS cohort,
   development towns the dated 15-town CBS research definition. These are fixed geographic
   references when applied to other years, never historical population estimates.
3. Exclude mixed Jewish–Arab cities from ethnic/religious groups. A separately sourced
   development-town membership may still include a mixed city. Deliver only Bedouin tribes;
   do not pretend the tribe code covers all Bedouin towns. k17 stays unavailable.
4. Reject simultaneous overlapping groups. Aggregate historical ballots/electorates once per
   group. Round the target turnout half-up, and apportion the signed ballot delta with exact
   largest remainders, including invalid ballots. Merge by origins and split by current scenario
   votes; divide all-zero sharers equally. Reject missing destinations and negative results.
5. Extend the existing `addVoters` action with an explicit `demographic:true` signed-delta path.
   Its label records the supplied adjustments. Existing actions retain their behavior. This
   avoids adding an action discriminator requiring changes to the parallel UI implementation.
   The action logs/replays/shares without fetching locality data. The pure model returns the
   final totals and the action together; input objects are never mutated.
6. Each calculation is a historical-relative incremental delta. The UI must manage a baseline
   for slider previews; repeatedly applying the same action intentionally accumulates it.

## Alternatives and consequences

A union of overlapping groups would need a policy for competing target turnouts; rejection is
unambiguous. Matching k17 names could join unrelated or changed places and still cannot provide
missing registration counts; it is refused. A demographic vote-share cutoff would circularly
classify places using election results; only sourced geographic classifications are used.

The fixed cohorts preserve a reviewable definition but cannot establish time-varying historical
demographics. Their dates and caveats must be visible. The model makes no inference about
individual behavior or the preferences of actual abstainers. Negative deltas after extensive
scenario edits may be impossible and are rejected. Existing history UI wording says “Added” even
for a negative demographic delta; the parent UI can use the marker to describe that appropriately.

## Evidence and verification

See [research and full coverage](../research/locality-demographics.md), `data/raw/SOURCES.json`,
`tests/demographic-turnout.test.ts`, and historical builder integration tests. Source originals
and normalized inputs are retained with hashes. No network is required to rebuild. Verification
includes a second byte-identical build, TypeScript, unit tests and the production Vite build.
The differential reference digests must remain unchanged: no engine or existing-action behavior
is intentionally changed by this feature.
