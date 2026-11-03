# K1–K7: primary allocation clauses and explicit simulation limits

3 November 2026. Scope: the 1949 and 1951–1969 allocation rules, not later eras.

## Primary evidence

All documents below are retained in `data/raw/k1/`, with source URLs and SHA-256
in `data/raw/SOURCES.json` (ids beginning `k1-k7-law-`). They were downloaded from
the Knesset's primary Reshumot archive, not from the unofficial transcription.
The latter was a discovery aid; its amendment labels were not reliable enough to
substitute for reading the acts (in particular the 1949 publication amendment).

* [1948 ordinance](https://fs.knesset.gov.il/0/law/0_lsr_312706.pdf), Official Gazette
  33, supplement A, pp. 52–60; ss. 26, 30–32, PDF pp. 5–6.
* [1951 Second Knesset Elections Law](https://fs.knesset.gov.il/1/law/1_lsr_208018.pdf),
  SH 74 pp. 110–123; ss. 29, 38–40, PDF pp. 5, 7.
* [1955 consolidation](https://fs.knesset.gov.il/2/law/2_lsr_311000.pdf), SH 174,
  pp. 30 onward; ss. 33, 43–45, PDF pp. 6, 8–9.
* [1959 consolidation](https://fs.knesset.gov.il/3/law/3_lsr_311002.pdf), SH 281,
  p. 114 onward; ss. 26, 37–39, PDF pp. 5, 7–8.
* [Original 1969 consolidation](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf),
  SH 556, p. 103 onward; ss. 67, 81–83, PDF pp. 11, 14–15.

The retained amendment set covers the 1948 soldiers ordinance, the five numbered
1948–1949 amendments (the fifth is post-election and changes publication timing,
not allocation); 1951 amendments 1–5; the 1955 replacement and consolidation;
1955 amendments 1–3; the 1958 repeal and the two pre-consolidation 1959 amendments;
the two post-consolidation 1959 amendments; 1961 amendments 3–4; 1965 amendments
5–6; the indirect 1966 register amendment; 1968 amendment 8; 1969 amendment 9;
and the July/October 1969 amendment, validation act and temporary provisions.
No change to the allocation formulas below was found. Consolidations provide
additional point-in-time checks. This is a comparison of allocation clauses,
not a claim to have audited every electoral procedure or administrative instruction.
Some filenames use their retrieval grouping year (1958) for acts published in 1959;
the actual act title/date in the PDF governs.

## Rules represented

1949 s.30(a) uses **floor(all valid / 121)**, without a percentage threshold.
Initial seats are whole quotas. Only lists with at least one initial seat compete
in the repeated highest-average stage. The quotient is votes / (current seats + 1),
**discarding fractions before comparing** under s.30(c)(3). Equal integer quotients
require the Central Committee's lottery. No half-seats cap appears. Section 31
combines two connected lists only for the remainder stage, and only when each
has an initial seat. The pair is divided afresh by s.30, including the pair's
seat count **plus one** as quota divisor. One connection per list (s.26).

1951 s.38 and the corresponding 1955/1959/1969 clauses use a **1% threshold**,
**floor(qualifying votes / 120)**, initial whole quotas, then largest unused vote
remainders. The text awards **one additional seat per competing list**. There is
no half-seats cap. Both partners must independently pass the threshold; the pair
counts as one remainder competitor with summed votes and summed initial seats,
and its total seats are divided afresh by the same formula. The allocation
clauses do **not** specify how equal remainders are decided. We do not silently
claim the 1973 lottery provision existed earlier.

The clauses elect names from the head of the registered list. They contain no
express redistribution procedure for a list winning more seats than candidates.
No candidate-count cap or invented replacement names are introduced here.
That case remains legally unverified, including in hypothetical early scenarios.

## Engine choices and limits

Add `ISRAEL_1949` and `ISRAEL_1951`. New optional fields default to modern behavior:
`quotaSeatOffset` (0), `remainderRequiresInitialSeat` (false),
`agreementRequiresInitialSeat` (false), `quotientRounding` (`exact`),
`largestRemainderRepeat` (true), `tiePolicy` (`lottery`). Early presets select
respectively offset 1/initial-seat eligibility/floor comparisons, or a single
largest-remainder pass and an unspecified tie policy.

`thresholdPct: '0'` means **no statutory percentage threshold**, not an imposed
0.83% threshold. The natural whole-quota entry condition is modeled separately.
The existing `bader-ofer` engine method is reused as a highest-average calculation
with the 1949 options; this is not a claim that Bader–Ofer legislation dates to 1949.

For unspecified ties, keep the existing warning-code union (the app exhaustively
switches on it and this task forbids app edits): `lottery-required` carries
`data.tiePolicy: 'unspecified'` and an English diagnostic explicitly saying that
the inspected statute gives no tie procedure. A supplied outcome is a scenario
choice, not proof of a historical lottery. The UI must recognize that distinction
before releasing these eras. Likewise the modern UI's small-vote explanation for
quota over-allocation needs a 1949 alternative: the seats-plus-one divisor can
cause it with large votes, including inside pairs. The engine warns and uses its
existing exact-Hare simulation fallback, not a claimed statutory resolution.

**The 1965 sourced-input mismatch in 0061 means the full historical application
of the largest-remainder agreement clauses is still unverified.** The preset
implements the literal inspected clauses; random-reference agreement confirms
code consistency, not that missing CEC interpretation has been recovered. Do not
release k6, reinterpret connected-unit quotas or permit a second pair remainder
seat merely to force the published result. A contemporaneous allocation memorandum
or ruling is needed to resolve that discrepancy.

## Correction addendum — 1965 connection (3 November 2026)

Fresh visual inspection of the retained YP 1225 p.189 reads **את–רא**,
Alignment–Progress and Development, not את–יא. The printed name and letters both
contradict the earlier transcription. Correcting that input reproduces every k6
seat without changing the engine; all elected names are now checked and k6 is
released nationally. [0069a](0069a-k6-corrected-connection-national-release.md)
supersedes the 1965-specific mismatch/hold above. Other stated legal limits remain.
