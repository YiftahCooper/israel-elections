# 1977: an agreement takes only the seats it can fill

Applied by lane U1 on 16 November 2026, from lane R2's research handoff (`data/research/round7/1977-capacity.md` on
main, commit b5fc035b). The owner's card (screens/calc-1977) asked that the 1977 Knesset always have 120 seats.

## Context

The 1977 rules cap a list's seats at its candidates (Flatto-Sharon had one). The Knesset rejected an appeal against
that cap on 1 November 1977 and relied on its duty to seat 120 members (plenum, printed p.237). The official result
already seats 120.

In a changed scenario that puts Flatto-Sharon in a surplus agreement with Poalei Agudat Yisrael, the pair won a fourth
seat nationally that it could not fill inside the pair: Flatto-Sharon is capped at one, and the half-vote restriction
of section 82, applied again within the pair, holds Poalei Agudat Yisrael to two. The app showed 119 seats.

## Decision

Before a remainder seat goes to an agreement whose members have candidate caps, the engine divides the pair's seats
as the law does, with that seat added. If the pair cannot fill every seat, it takes no further seat, and the seat goes
to the next list by quotient. Votes, the quota, qualification and the pair's whole-quota seats are unchanged. No
candidate is invented. A warning names both lists and the seat that moved, and says that applying the rule to a
changed scenario is the app's inference.

One addition to R2's rule: when no other list can take a seat (every other list is capped too), the refused
agreement competes again. Without it, random test scenarios with a capped agreement and no other eligible list seated
far fewer members (64 fell to 11), because a pair's internal half-vote limit grows with its seats. With it, no scenario
in the test corpus seats fewer members than before.

## Result

- Official 1977: unchanged, 120 seats, no warning.
- Flatto-Sharon with Poalei Agudat Yisrael: 120 seats; Flatto-Sharon 1, Poalei Agudat Yisrael 2.
- Hadash or Sheli as Flatto-Sharon's partner: 120 seats.
- Too few candidates overall: still fewer than 120, with the "not every seat could be allocated" warning.

Tests: `tests/rule-uncertainty.test.ts`; the differential digest note in `tests/differential.test.ts`.
