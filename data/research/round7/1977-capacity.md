# 1977: allocating all 120 seats when an agreement cannot fill its award

Status: implementation handoff for the calculator; no engine changes in this research lane.

## Documented facts

The Knesset adopted the House Committee's rejection of Yaakov Gross's appeal on 1 November 1977. The Committee accepted the CEC's initial one-candidate cap for Flatto-Sharon and explicitly relied on its obligation to seat 120 members. Votes for that list remained in the threshold and quota denominators. Read the retained [plenum, printed p.237 / PDF p.26](https://fs.knesset.gov.il/9/Plenum/9_ptm_253927.pdf), `data/raw/k9/cap-appeal-protocol.pdf`.

The law's 1973 §81(d) and 1969 §82 distinguish national allocation from the pair's internal division. The half-vote restriction is applied again within the pair. This is an allocation restriction, not evidence that Poalei Agudat Yisrael had only two candidates. Sources: `data/raw/research/law-bader-ofer-1973.pdf`; `data/raw/k8-k12/law-1969.pdf`, PDF p.14; retained CEC calculation `archive_knesset9_memorandum-apdx9.pdf`. Their exact locators and source conflicts are retained in decision 0073, 9-Nov addendum. The 114+6 phrase in the appeal transcript differs from statutory list-by-list initial allocation (113+7); both reproduce the final result. Do not silently edit the source's stage counts.

## Reproduced failure and exact recommended rule

With real votes, adding an agreement between `9-פש` and `9-ד` can award the pair four national seats. The internal calculation fills only three: one Flatto-Sharon seat and two PAI seats. National allocation does not currently check that the internal division can actually fill a unit's award. `src/engine/allocate.ts` computes unit capacity from roster sizes only, then performs internal division after national allocation finishes.

Before a remainder seat is awarded to an agreement unit, dry-run its internal division for the proposed new seat count, under the same rules and recorded lotteries. Accept the national award only if that division fills every proposed seat. Otherwise exclude that unit from further remainder awards at this allocation, leave its existing fillable seats intact, and award this seat to the next eligible national quotient. Preserve all votes, the original national quota, qualification and the pair's original whole-quota starting seats. Do not start a new election, renormalise votes, remove the agreement, or give the seat directly to PAI.

This extends the historical fillable-capacity principle to a counterfactual not adjudicated by the cited appeal. Label that extension as inferred. If ALL qualified units genuinely lack capacity, report an infeasible scenario; never invent candidates to guarantee 120.

Regression expectations for U1: official 1977 seats unchanged; Flatto-Sharon+PAI scenario fills 120, Flatto-Sharon 1 and PAI 2; warning identifies both lists, the one returned seat and the inferred national redistribution; Hadash/Sheli partner scenarios still fill 120; total genuinely insufficient candidate capacity remains infeasible; national and internal lottery ties stay explicit. Ensure the dry-run feasibility predicate works with trace off as well as on.

## Official final table

Use the seat vector in `public/data/k9.json` (official result), sourced to YP2326, retained `data/raw/research/k09-results.pdf`. This table is a historical assertion, not the expected output of the changed-agreement scenario. All 120 official seats must remain reproducible.

Official nonzero seats: Likud 43; Alignment 32; Dash 15; NRP 12; Hadash 5; Agudat Yisrael 4; Shlomtzion 2; Sheli 2; Ratz 1; Independent Liberals 1; United Arab List 1; Flatto-Sharon 1; Poalei Agudat Yisrael 1. Total 120.
