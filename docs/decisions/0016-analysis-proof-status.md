# 0016: Expose exactness limits in counterfactual analysis

Retrospective record of implemented behaviour, documented on 3 November 2026.
Alternatives below are comparisons, not a claim that a design discussion took place.

## Context

Thresholds, agreements and quota rounding can make seat outcomes non-monotone. A binary search alone cannot establish every smallest seat-changing edit.

## Decision

Rerun the full allocation for candidate changes. Treat threshold goals as monotone; scan smaller seat changes exhaustively within a budget and sample beyond it. Return exactness and non-monotonicity metadata. Vote sweeps also expose exact and step; threshold sweeps use rational qualification breakpoints.

## Alternatives considered

Unqualified binary-search minima or sampled sweeps labelled complete would overstate evidence. Exhaustively scanning every large interval is another alternative. Rationale not recorded for the particular budget beyond the code’s runtime comment.

## Consequences

Exact allocation arithmetic does not imply globally exact analysis searches. Callers must preserve sampled/limited labels. The sensitivity view labels sampled vote sweeps, but SeatSecurity currently drops the exactness flag and describes its figures as exact; that display does not establish global minimality. The default exhaustive budget is 50,000 evaluations; a failed bounded search is not proof that no solution exists.

## Sources

- `src/engine/analysis.ts`.
- `src/app/components/Sensitivity.tsx`.
- `src/app/components/SeatSecurity.tsx`.
- `tests/exactness.test.ts`.
- Repository history: `ad479ee, 2abba95` (3 November 2026).

## Addendum, 4 November 2026: provably equal counts are skipped

The searches still visit every count they report on, but for new-voter moves, transfers and vote
sweeps they now skip ranges that provably allocate identically: every engine decision there either
flips once at a fixed count or changes in one direction, so two counts with the same recorded
decisions bound a range with the same outcome. `tests/analysis-regions.test.ts` checks this count by
count on random elections under every rule set. Proportional redistribution uses largest-remainder
splitting, which is not monotone, so it gets no skipping. Results are identical to the exhaustive
search (`tests/differential.test.ts`).

## Correction, 12 November 2026: Seat safety keeps the exactness flag

The Consequences paragraph describes the code of 3 November 2026. It is no longer true that SeatSecurity drops the
exactness flag. Since `84c71777` (4 November) the worker carries each search's qualification (exact, sampled, or
not found within the limit) into the rows, and since `337c77b0` (5 November) the table shows it: an exact minimum
as a plain number, a figure found by sampling as "≤ n" (the smallest may be lower), "> limit" when an exact search
found none within the limit, and "?" when sampling found none, with a key below the table; the tightest-seats
summary uses only exact figures. `tests/security-qualification.test.ts` checks that the qualifications reach the
rows. The original reasoning above is unchanged (audit 12 Nov, ax-screens-d-05).

## Addendum, 13 November 2026: what each screen says about its proof, and ties

What the screens show now (audit 12 Nov 2026, c-analysis-code-05; the reasoning above is unchanged):

- Seat safety keeps each figure's qualification: a plain number is a proven minimum; "≤ n" was found by sampling (the
  smallest may be lower); "> limit" means an exact search found none within the limit; "?" that sampling found none;
  "—" that it is not possible (under the 1977 candidate cap, every candidate on the list already has a seat, said in
  its title); "*" that fewer votes already reach an exact tie for the seat (below). A key under the table names the
  marks that appear; the closest-calls summary uses exact figures only.
- List details: the line under the vote goals says "proven minimum" or "sampled; minimum unproven"; a seat count
  typed or stepped to that was found by sampling says so when it is applied (c-analysis-code-06); the boundary goals
  refuse a figure that is not exact.
- Votes to flip a majority: pairs whose search could not test every count are searched again, every count below the
  best answer; "At most" stays only while a pair is still open.

Ties (c-results-engine-02, decided by the integrator): every "votes to gain / lose a seat" search, in every tool, now
reports the first count at which the change is certain whatever the outcome of an exact tie. The engine reports the
ties it met but did not decide (`OpenTie`); the search judges the goal under every outcome of those ties (at most 256
outcomes; beyond that the answer is marked not exact), and keeps the smallest count that reaches the goal only through
a tie as `lotteryFrom`, which the screens say beside the figure ("A tie decided by lot is possible from N votes"; for
1951–1969, when the law set no rule for a tie, "an exact tie, for which the law of the time set no rule"). The
alternative outcomes' decisions are added to the record that the range-skipping of 4 November compares, so it stays
sound. `tests/lottery-ties.test.ts` checks the answers vote by vote on real elections and on small elections built to
tie, under every rule set; the analysis digest in `tests/differential.test.ts` moved for 74 of 818 searches, each
explained in that file.

Stored results (c-analysis-code-04 and -07): results kept in the browser carry a version that is a hash of the engine
and analysis sources, worked out at build time (`scripts/analysis-version.ts` through `vite.config.ts`), so a result
worked out by other code is never read; they are limited to 40 results and 1.5 million characters, oldest out first,
and give way to the user's own work when storage is full.
