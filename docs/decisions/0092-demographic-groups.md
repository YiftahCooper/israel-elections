# 0092 — People-group evidence gates and exact scenario edits

Implemented in the task worktree, pending parent integration. 4 November 2026.
Related: 0090 (geographic turnout), 0087 (origins), 0091 (faction splits).

## Context

The requested unit is a group of people with election-specific eligible size, turnout and
valid-list preferences. The existing locality API observes places, excludes mixed cities and
cannot infer all individual identities. The owner requires solid evidence for normal use,
explicit speculative opt-in for estimates, and absent numbers/refused edits for insufficient
evidence. Completeness must not be manufactured from party anecdotes or incompatible surveys.

## Decision

1. Keep separate reviewed `groups-kNN.reviewed.json` and public `kNN-groups.json` siblings,
   leaving historical national/locality schemas and the old place API working. Grade each
   measure (`solid`, `estimate`, `insufficient`) with a reason and provenance. An insufficient
   measure omits its value. All delivered dimensions are explicitly partial; members within
   a dimension must be disjoint. Retain source originals and hashes for offline rebuilding.
2. Do not turn geographic subset electorates, adult-population percentages or pooled survey
   respondent proportions into national group sizes. Retain locality references as supporting
   evidence only. Current research delivers no complete usable national three-measure baseline;
   the nationwide feature should be deferred with the current evidence. Four religious groups
   have estimate-grade split evidence in 2021 and 2022; this does not make them editable.
3. Expose grade, availability mode and reasons through `groupAvailability`. Require all three
   baseline measures even for split-only edits. Block unattributed residuals, because removing
   their historical ballots would require inventing list destinations. Estimates require
   `{speculative:true}`; opt-in never overrides insufficient evidence. Published rounded totals
   may pass storage validation within 0.1 point but simulation requires an exact 100% split.
4. Pure `demographicGroups` computes baseline and target casts from exact decimal rational
   percentages, rounds half-up, scales invalids with historical national invalid/cast unless
   a graded source supplies a group rate, and apportions valid ballots by Hamilton. Subtract
   baseline from target. Merge/split historical origins with current scenario vote proportions,
   equal when all sharers have zero votes. Reject duplicates and all cross-dimension batches.
5. Clamp removals at available list/invalid counts and return explicit requested/applied deltas.
   Do not redistribute clamped amounts. Reject any remaining impossible national total. Return
   a self-contained existing signed `addVoters` action; its label records edits, evidence grades
   and clamping. Existing action logging/undo/share paths need no new union variant.
6. Per owner's later direction, defer ballot-box mixed-city extension. No assignments or
   implementation are included. A future mapping must use externally sourced addresses,
   catchments/statistical areas and demographics, never electoral preferences. Expected gains,
   cost and remaining bias are documented in the research note.

## Alternatives and consequences

Combining adult CBS shares, self-report turnout and ecological party preferences would create
a superficially complete baseline with incompatible populations; rejected. Renormalizing a
published “other” share into named parties would invent votes; rejected. A nationwide inference
from seven Haredi authorities would omit large communities and overstate representativeness;
rejected. Refusal preserves honest missingness but leaves no national sliders available today.
The generic model and tested gating remain ready for later compatible reviewed datasets.
Clamping may change the intended net ballot delta; callers must display the returned report.
Independent baseline/target rounding can differ by one ballot from apportioning a signed delta;
this is deliberate and tested. Repeated dispatch accumulates historical-relative edits.

## Verification

See `tests/demographic-groups.test.ts`, the unchanged locality API tests, and
[research and source accounting](../research/demographic-groups.md). Required checks are the
offline dataset build twice with byte comparison, TypeScript and the full unit suite. No UI,
engine arithmetic, national historical inputs or differential reference digests are changed.
