# K8–K12: original Bader–Ofer text, and hold the unfillable-seat exception

## Evidence and decision

Add `ISRAEL_1973`, exact threshold **1/100**, to the rule registry and map election
ids 8–12 to it. The original **Amendment No. 4**, not No. 5, is SH 692 p. 108,
9 April 1973, retained in `data/raw/research/law-bader-ofer-1973.pdf`.
It replaces only section 81(d). Its paragraphs (1)–(3) use votes divided by existing
seats plus one, repeated until allocation finishes; equal quotients require a CEC
lottery. Paragraph (4) stops a list at half the seats if it did not receive more than
half the qualifying votes. All these clauses already match the engine.

The original consolidated law, **SH 556, 14 April 1969**, retrieved directly from the
Knesset and retained as `data/raw/k8-k12/law-1969.pdf`, establishes:

* Printed p. 116, section 81(a): at least 1% of all valid votes.
* Section 81(b): the **whole number** from qualifying votes divided by Knesset size;
  section 81(c): whole quotas per list. Keep floor rounding, not an exact Hare quota.
* Section 82(a): two linked lists combine only for the 81(d) remainder stage, only
  if each independently passes the threshold. Section 82(b) re-divides their seats
  using section 81, consistent with the engine's full pair re-division.
* Printed p. 113, section 67(a): at most one partner; no consequence except section 82.
* Printed p. 116, section 83: members are the names at the head of the list, in order.

The 1977, 1981, 1984 and 1988 section 67 notices explicitly confirm pairs of lists.
The 1984 notice also cites the temporary 1984 law, SH p. 166, section 34. A complete
primary amendment-chain comparison of every intervening ordinary/temporary statute
through 1988 **has not been completed**. The preset expresses verified base provisions,
not a claim that every exceptional circumstance has been reconstructed. Keep that
remaining legal check as a release blocker. Do not silently borrow a modern archive
page as point-in-time evidence.

No new optional `RuleSet` field is justified by the provisions verified so far.
The allocation engine and today's defaults are unchanged. The independent reference
test now also checks the 1973 preset, including 1% boundaries, ties and the existing
small-number fallback. Existing modern-era reference cases are unchanged.

## Flatto-Sharon: unresolved authority, no invented redistribution

The **official** 1977 results, YP 2326 pp. 1494–1495, publish **35,049** votes and
**one** seat for **פש**, Flatto-Sharon, and **two** for Sheli (**ש**). The candidate
notice, YP 2319 p. 1330, contains exactly one name, **שרון סמואל**. The elected
member in YP 2326 p. 1496 is the same name. This is not Shlomtzion (**כנ**), a
separate list with 33,947 votes, two seats and a Likud agreement.

Using the gazette's votes and all six sourced agreements, the existing engine gives
Flatto-Sharon **two**, Sheli **one**, and every other list its published seats.
In particular, the NRP's **12 seats already match**. The frequently repeated secondary
claim that the extra seat went to the NRP does not explain this allocation diagnostic.
This observation does not itself establish the legal reason for Sheli's result.

Neither section 81 as amended in 1973 nor section 83 in the retrieved original states
an explicit procedure for redistributing an unfillable seat. Section 83 alone establishes
who becomes a member; it is insufficient authority for a particular reallocation
algorithm. No contemporaneous CEC ruling, judicial decision or other operative provision
explaining this case was verified. General web discovery did not recover one.

**Do not implement a candidate cap or edit votes to make the published seats appear.**
That would convert an inference into a statutory claim. K9 remains unavailable, with
an explicit mismatch regression test rather than a falsely passing reproduction test.
The required legal procedure remains unfinished work, not a verified absence from law.
If recovered, implement its precise scope behind an explicitly named optional rule,
carry it through scenarios/import validation, and extend the independent reference
algorithm before releasing K9. No UI change is needed for the currently added preset;
a future capacity rule would need an explanation in the Rules panel.

## Sources

* [Original 1973 Amendment No. 4](https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf), SH 692 p. 108.
* [Original 1969 consolidated law](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf), SH 556 pp. 113, 116.
* [1977 results, official government copy](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-results.pdf), YP 2326 pp. 1494–1496.
* [1977 candidates and agreements, official government copy](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-cand.pdf), YP 2319 pp. 1319, 1330.
* Retained research R1, Knesset threshold history, printed p. 11; retained 1991
  Amendment No. 23 changes 1% to 1.5%, first used in 1992.
* Source URLs, bytes, retrieval timestamps and SHA-256: `data/raw/SOURCES.json`;
  original research source ledger: `data/raw/research/MANIFEST.json`.
