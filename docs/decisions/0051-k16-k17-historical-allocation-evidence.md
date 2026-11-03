# Check the 2003 and 2006 rules without trusting the archive folder's date

## Context

The 2003 election used 1.5%, while the 2006 election used 2%. The owner also asked
whether agreement eligibility, the half-seats cap or quota rounding changed. A page in
an election's archive is not necessarily a snapshot of the law on that election day.

## Decision

Keep `ISRAEL_1992` for 28 January 2003 and `ISRAEL_2004` for 28 March 2006.
The CEC's contemporaneous 2003 allocation explanation states 1.5%. The 2006 consolidated
law, labelled updated 1 January 2006, states 2% in section 81(a). The Knesset's threshold
history dates the increase to May 2004, after the 2003 election.

The 2006 section 81(b) uses the whole-number quotient as the general quota. Section
81(d)(4) stops a list with no more than half the qualifying votes from receiving more
than half the seats through remainders. Section 82(a) combines a pair only in the remainder
stage and only when each partner passes the threshold individually; 82(b) re-divides the
pair's seats using section 81. These are the same modeled clauses as today's implementation.
No additional engine rule difference was identified.

The statutory text currently served under the **2003** archive already shows Amendment 51
and a **2%** threshold. It therefore cannot prove the exact point-in-time 2003 consolidated
wording. Its other allocation clauses agree with the 2006 text, and the CEC's 2003 allocation
explanation supports the floor quota and pair method. Treat this as corroboration, not an
exhaustive audit of every amendment in force on 28 January 2003. The precise pre-election
consolidation and complete amendment chain have not been independently reconstructed.

The 2006 law's relevant clauses were inspected through the search provider's indexed text;
direct HTML fetches returned 403. The statutory quotations below are short identifying
excerpts, not a claim to have retained a whole downloaded law page:

* 81(b): `והמספר השלם היוצא מן החילוק יהיה "המודד"`.
* 81(d)(4): `רשימה שלא קיבלה יותר ממחצית כל הקולות הכשרים`.
* 82(a): `ובלבד שכל אחת מהן בפני עצמה קיבלה את אחוז הקולות הקבוע בסעיף 81(א)`.

## Alternatives considered

Applying today's threshold would reject historical qualifying lists. Reading the 2% value
from the 2003 archive and treating it as contemporary law would make the same timing error.
Claiming an exhaustive historical legal audit from archive URLs or seat reproduction alone
would overstate what was verified.

## Consequences

The existing presets need no edits. The research fixtures reproduce the actual seat counts
under those presets. The identified archive-date limitation remains explicit; it does not
become proof that another allocation clause changed. Both election releases are still blocked
by the independent data gaps in decision 0050.

## Sources

* https://www.gov.il/apps/elections/elections-knesset-16/heb/about/seats_system.html
* https://www.gov.il/apps/elections/elections-knesset-16/heb/laws/elections_law.html
  — later-updated text, including Amendment 51; not a 2003 point-in-time snapshot.
* https://www.gov.il/apps/elections/elections-knesset-17/heb/law/ElectionLaw.html
  — explicitly updated 1 January 2006; sections 81–82.
* https://main.knesset.gov.il/EN/About/Lexicon/Pages/ElectoralThreshold.aspx
* `src/engine/rules.ts`, `docs/ELECTORAL-LAW.md`, and tests `historical-k16.test.ts` and
  `historical-k17.test.ts` (seat evidence, not statutory-source substitutes).
