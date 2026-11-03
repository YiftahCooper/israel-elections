# K13–K15: 1.5% Bader–Ofer preset and point-in-time limits

The original **Amendment No. 23 (1991)**, Sefer HaHukkim 1369, 23 October 1991,
p. 2, replaces 1% in section 81(a) with **1.5%**. It changes no other allocation
parameter. The retained official Knesset threshold review independently places
Knessets 13–16 in that era. K13, k14 and k15 therefore map to existing `ISRAEL_1992`.
The three mapping additions leave the other agents' earlier eras untouched.

The original **Amendment No. 4 (1973)**, Sefer HaHukkim 692, p. 108, was read in
full: section 81(d) uses repeated `votes / (seats + 1)`, a lottery on equal quotients,
and the **half-seats cap** for a list without more than half of qualifying votes.
This is the statutory source of the current preset's `remainderMethod: bader-ofer`
and `majorityCap: true`; “majority cap” must not be misread as a 61-seat cap.

The current preset also specifies 120 seats, floor quota, pair-only agreements,
both partners independently qualifying, remainder-stage combination, and full internal
re-division. The recovered 1996/1999 notices are explicit section 67 publications of
pairs. The official CEC consolidated-law text for sections 67 and 82 corroborates
one partner per list, independent threshold qualification and section 81 re-division:
https://www.gov.il/apps/elections/elections-knesset-17/heb/law/ElectionLaw.html.
It is **2006 text**, not proof of the complete point-in-time amendment chain for 1992,
1996 and 1999. The retained original threshold and Bader–Ofer amendments support
the chosen preset; no conflicting modeled rule was found. A complete intervening
amendment-chain audit, including period-specific agreement wording, remains unverified.
Do not describe that as completed historical-law certification.

All three gazetted results reproduce with this preset, without warnings. This is
additional empirical evidence, not proof that every hypothetical historical scenario
is legally equivalent. Synthetic tests cover reset/import plumbing for each id; actual
historical tests separately verify published seats. There is no evidence requiring an
engine change, and none is made. The candidate release blockers remain in decision 0080.

Source PDFs and their hashes: `research/law-threshold-1991.pdf` (R3),
`research/law-bader-ofer-1973.pdf` (R2), and the retained threshold review (R1) in
`research/MANIFEST.json`; R2/R3 also have k13–k15 SOURCES entries.
