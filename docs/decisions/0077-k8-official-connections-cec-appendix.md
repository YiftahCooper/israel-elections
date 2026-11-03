# K8: official 1973 connections found; letter corrections; seats reproduced

Status: **accepted** for the agreements and corrections (the parent re-read both scan pages, printed pp. 10–11, on 4 November 2026: all six pairs and every vote figure match); integration into the build is pending. Supersedes, if
accepted, the agreement hold in 0074 and the k8 part of 0076. The roster hold (0072)
is unaffected.

## Decision

Use the six connections listed by the Central Elections Committee for the 8th Knesset in
its **Form 30 (regulation 125) appendix to the results memorandum** ("נספח לזכרון דברים
על תוצאות הבחירות לכנסת השמינית — פרטי חישוב של חלוקת המנדטים"), section ז, printed pp. 10–11:

**ב–גד, חל טעם–ער, סנ–ענ, קנ–ז, רא–עא, לע–רצ.**

Three of them have no effect, because one or both partners fall below the 15,669-vote
threshold (section 82(a)). They remain in the sourced input, as with the ineffective
1988 pair (0071). With all six, the unchanged engine and `ISRAEL_1973` reproduce every
one of the 21 gazetted seat counts in YP 1979 p. 608: 120 allocated, no warnings,
threshold 15,669, quota 12,424. The CEC's own pair re-divisions (printed pp. 16–18:
10/5, 4/3, 2/1) and final table (p. 22) match the engine. **The pairs are read from the
document, not inferred from the seats.**

Correct three ballot letters and four list names in `k8/national.reviewed.json`. Each
was re-read in YP 1979 p. 608 and independently in the appendix p. 3:
`ל`→`לע`, `סז`→`סנ`, `רם`→`רה` (רשימת תימנים בישראל, not "מגינים"), and the names of כך,
ענ (תנועה לאחוה), רא (קידמה ופיתוח) and עא, as printed. Votes and seats do not change.
Rename the matching `list-meta.ts` keys.

הוועדה המרכזית לבחירות לכנסת השמינית פירטה שש התקשרויות בין רשימות בנספח לזכרון
הדברים (טופס 30), סעיף ז, עמ׳ 10–11. שלוש מהן לא השפיעו, משום שאחת הרשימות לא עברה את אחוז
החסימה. עם ההתקשרויות שפורסמו, המנוע משחזר את כל המנדטים שפורסמו ברשומות. הזוגות
נקראו מהמסמך הרשמי ולא הוסקו מן התוצאה. אותיות הרשימות תוקנו לפי ילקוט הפרסומים 1979.

## Evidence

- Official: <https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset8/he/archive_knesset8_memorandum-apdx.pdf>.
  The full file is 28,395,623 bytes, SHA-256 `38fd80b4…62b3b6`. The retained 8-page
  unaltered extract `k8/cec-memorandum-appendix-1973.extract.pdf` is source
  `k8-cec-memorandum-appendix`.
- Secondary lead only: Hebrew Wikipedia revision 43470653 (`k8-hewiki-agreements`), which
  names the same six pairs and cites the appendix.
- Search log, quotations and reproduction output: `docs/research/k8-1973-agreements.md`.
  Machine-readable proposal: `data/raw/k8/agreements.proposed.json`.

## Limits

- The document is a scanned form, partly handwritten, not a Reshumot section 67 notice.
  No gazette notice of the connections was located (0074). The CEC calculation record is
  the operative official record of how the seats were computed. It is not proof that a
  gazette notice never existed.
- The CEC's cross-list remainder table (printed pp. 12–14) was not compared step by
  step with the engine's remainder steps; only the pair stages and final seats were.
- The amendment-chain and roster limits of 0070 and 0072 still apply. K8 becomes
  release-ready only once the winning rosters and elected names are also complete.

## Integration checklist (for the parent)

1. Apply `letterCorrections` and `nameCorrections`, set `agreements` from the proposal
   (`complete: true`, `page: 10`), set `allocationCheck` to `exact: true` with no
   differences, drop the agreement blocker, add `k8-cec-memorandum-appendix` to
   `sourceIds`, and re-hash `k8-national-reviewed`.
2. Rename `list-meta.ts` keys `8-ל`/`8-סז`/`8-רם` and update the display names.
   Recheck colours: `8-רא` and `8-עא` share `#008300`.
3. Update `tests/historical-k8.test.ts`: key `לע`, exact reproduction, sourced pairs.
4. Run the standard checks (`npm ci`, build, colours, tsc, vitest).
