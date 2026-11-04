# Roster corrections from re-read scans and an official membership audit of every election

Status: **accepted** (numbered and merged by the parent on 4 November 2026; the parent independently confirmed the 1988 Likud correction against the Knesset opening membership). Written on 4 November 2026. It corrects reviewed
transcriptions for k1–k5, k7 and k9–k15, extends the k8–k12 roster gate, and retains the Knesset
OData opening membership for k1–k26 as official identity cross-checks. It amends 0084 (the 1992
"given-name variant") and the contiguous elected-rank rule that 0072 applies to k8–k12. It does not
change any vote, seat, agreement or rule.

## Context

Research for the party metadata found elected ranks whose dataset names belong to no member of the
Knesset (`datasetRosterConflicts` in `data/meta/k10.json`, `k11.json` and `k14.json`, and notes for
1969 and 1984). The earlier elected-name "cross-checks" had copied the same misreadings, so they
could not catch them. Every flagged page was therefore read again from the retained scans. The same
comparison was then repeated systematically for all 26 elections.

## Decision

1. **The scans decide.** Each name is what the official candidate notice prints at that rank. The
   official results notice and the Knesset record are cross-checks, never a source of names. A
   correction is made only where the printed text was read at high zoom, in both notices where
   both exist. `from`, `to` and the page references are logged in a `corrections` array in the reviewed JSON.
2. **A gazette misprint stays a gazette reading.** 1984 Alignment #16 is printed "שפירא אליהו" in
   the candidate notice itself (YP 3073 p. 2826), but "שפייזר אליהו" (Eliyahu Speiser) in the results notice
   (YP 3081 p. 3007). The candidate reading is kept with its recorded spelling variant. If the owner prefers the
   results spelling for display, that is a separate presentation decision.
3. **Seats follow the results notice.** Where the results notice omits a registered candidate above
   the last elected rank, that candidate is `notSeated`, as in k1–k7 and k13–k15. The k8–k12
   builder now accepts strictly increasing elected ranks. Each gap must carry a written reason in
   `electedCrossCheck.notSeated`, and the names are compared rank by rank. The only use so far
   is 1988 Likud #25 רייסר מיכאל.
4. **A replacement after the results notice is shown, not modelled.** Some members named elected in the results notice
   were replaced before the opening: 1955 Progressive #2 Kol by Idov Cohen, 2003 Sharansky by Solodkin, and 2015 Yisrael
   Beiteinu #4 Shohat by Ilatov. In 2020 Yael German was replaced by Idan Roll and in 2021 Alon
   Davidi by Idit Silman; for these two no CEC results notice naming members is retained. The app keeps the results-notice or
   registered order and does not substitute. The audit table documents each case.
5. **Official identity cross-checks.** The Knesset OData snapshots (PositionID 43/61, the faction
   rows with PositionID 54, and the person names) are retained as `data/raw/kNN/knesset-odata-members.json` with
   `kNN-membership-odata` manifest entries, following `k16-membership-odata`. The existing k16 and
   k17 files are unchanged. For k26, OData has only faction rows dated for the 10 November 2026
   opening; they are retained as a provisional check, explicitly labelled as such.

## The flagged ranks: what the scans print

| Election, list, rank | Dataset had | Candidate notice | Results notice | Result |
|---|---|---|---|---|
| 1969 Alignment 29 | רייזר-ששון צבי | דינשטיין צבי (YP 1563 p. 207) | דינשטיין צבי (YP 1573 p. 434) | corrected |
| 1981 Likud 31 | דרורי שרה | דורון שרה (YP 2721 p. 2059) | דורון שרה (YP 2727 p. 2192) | corrected |
| 1981 Likud 32 | וירג׳מן דרור | זייגרמן דרור (p. 2059) | זייגרמן דרור (p. 2192) | corrected |
| 1981 Likud 38 | רבי צבי | רנר צבי (p. 2059) | רנר צבי (p. 2192) | corrected |
| 1981 Likud 46 | יגורי יצחק | זיגר יצחק (p. 2059) | זיגר יצחק (p. 2192) | corrected |
| 1981 Alignment 17 | חריש משה | חריף משה (YP 2721 p. 2048) | חריף משה (YP 2727 p. 2191) | corrected |
| 1981 Alignment 30 | בן-אהרן אברהם | כץ־עוז אברהם (p. 2048) | כץ־עוז אברהם (p. 2191) | corrected |
| 1981 Alignment 33 | ורד תמר | ותד מחמד (p. 2048) | ותד מחמד (p. 2191) | corrected |
| 1981 Alignment 40 | רון אמיר | רון אמרי (p. 2048) | רון אמרי (p. 2191) | corrected |
| 1981 Alignment 45 | נעים עבד | נעים רענן (p. 2048) | נעים רענן (p. 2191) | corrected |
| 1984 Alignment 16 | שפירא אליהו | שפירא אליהו (YP 3073 p. 2826) | שפייזר אליהו (YP 3081 p. 3007) | kept: gazette misprint (decision 2) |
| 1984 Alignment 37 | רן נחמן | רז נחמן (p. 2826) | רז נחמן (p. 3007) | corrected |
| 1984 Shinui 3 | ששי וידאן | עטשי זיידאן (p. 2828) | עטשי זיידאן (p. 3007) | corrected |
| 1996 Likud–Gesher–Tzomet 15 | ריבלין חיים | דיין חיים (YP 4408 p. 3290) | דיין חיים (YP 4414 p. 3483) | corrected; ריבלין ראובן is #33, not elected |
| 1996 Likud–Gesher–Tzomet 30 | ליבני יהודה | לנקרי יהודה (p. 3290) | לנקרי יהודה (p. 3483) | corrected |

The ranks were already correct: only the names were misread. The party `candidateRanks` in
`data/meta` (Gesher 30, Tzomet 15, the 1981 Herut/Liberal/Labor splits) therefore point to the right people. The
meta files now name them correctly, and the resolved conflicts are recorded in
`resolvedRosterConflicts`. `datasetRosterConflicts` is empty in k7, k10, k11 and k14.

## Corrections found by the systematic audit

These are the further identity errors found by the audit. All were read in both notices unless noted.

- **1949** United Religious Front #15 צנובר → צוובנר אברהם חיים (p. 317, p. 401). Also #7 לונשטיין → לוינשטין, a spelling fix.
- **1951** Mapai #22 שרף → שפר זאב; #37 טברסקי דינה → טברסקי ז׳ניה; #38 → אזניה (איזנשטט) ברוך (pp. 1141, 1241).
  General Zionists (p. 1152 and results page 2): #8 בז׳רנו, #14 סוזייב, #16 ד״ר סטופ אברהם (not סוסמן),
  #19 זיסמן (not יסמן), #20 פרלשטין. Mapam #10 בסטוני; Agriculture and Development #1 חמדאן פארס.
- **1955** General Zionists #9 בז׳רנו, #10 סוזייב, #13 פרלשטיין (p. 1020, p. 1139). **1961** Liberal #18 פרלשטיין (p. 1808, p. 1939).
- **1959** Progress and Development #1 א-ז׳אהר אחמד and #2 נח׳לה אליאס (p. 68, p. 265).
- **1969** Alignment #32 פינברג-סירני עדה (a spelling fix).
- **1977** Arab list ים #1 סייף אלאדין מוחמד סעיד חוסיין זועבי (p. 1324, p. 1495).
- **1981** spelling fixes on the same pages: Likud #20 צפורי; Alignment #27, #28, #32, and the results reading of #38 (אשל תמיר).
- **1984** Likud #19 זיגר יצחק (not יגר); #23 ויינשטיין; Alignment #40 גרוסמן ארקין חיה (pp. 2826, 2832; pp. 3007, 3008).
- **1988 Likud.** Printed rank 32 גולדברג יוסף (YP 3588 p. 155) had been dropped, so the dataset's
  ranks 32–40 were printed ranks 33–41. The results notice (YP 3591 pp. 243–244) does not list
  רייסר מיכאל (#25) among the 40 elected; position 31 is יוסף גולדברג. The roster is now 41
  ranks, #25 is `notSeated`, and the elected members now match the Knesset's opening membership.
  The reason Reiser was not seated is not stated in either notice and is not inferred. Shinui #2 is
  פורז-פוזמנטיר אברהם (not פורזומנסקי).
- **1992** Labor #14 אור אורי in both notices (YP 4017 p. 3620; YP 4021 p. 3776). This amends 0084: the accepted
  "given-name variant" אור אריה was a misreading, and its build exception is removed.
- **1996** UAL #3 אלסאנע טלב; Labor #7 זוילי and #20 גולדשמידט; Likud #31 בדש פיני פנחס; Meretz #7 פורז
  פוזמנטיר אברהם.
- **1999** UAL #2 סאנע טלב (not צאנע; YP 4748 p. 3044, YP 4757 p. 3378).

All other residual differences are legitimate. They are earlier surnames printed in 1949–1977,
printed transliterations, the replacements in item 4, and the 1984 misprint. The per-election table is in
[elected-names-odata-audit.md](../research/elected-names-odata-audit.md).

## Limits

- This is an identity audit plus the spelling slips seen on re-read pages. The earlier
  transcriptions also contain spelling-level errors that leave the surname recognisable; there was
  no exhaustive letter-by-letter re-read of every elected name. Ranks below the elected ones were not audited.
- Two agents' readings (1949–1965 and 1973–2022) were each checked against their crops before
  any change. The 1955 candidate scan and its "mirror" are the same file (same SHA-256), so they do
  not give an independent second reading.
- The k26 comparison uses pre-opening faction rows, not sworn-in membership.

## Validation

`node scripts/build-datasets.ts` passes and writes only the affected datasets.
`npx tsc -p tsconfig.json --noEmit` is clean, and `npm test` passes.
`tests/roster-corrections.test.ts` pins every corrected name. It also checks the shown elected
members and, where the surname is still the same, the OData PersonID of the opening-day member.
`tests/historical-k12.test.ts` pins the 1988 Likud order and the not-seated #25.

## Addendum, 4 November 2026: three names the surname-only audit missed

The candidate biography review ([candidate-bios.md](../research/candidate-bios.md)) matches each elected member to a
Knesset PersonID by full name. It flagged names that this audit had passed on a surname match alone. Each one was re-read
at high zoom in both notices:

- **1955** Mapai #24 **יוספטל סנטה**, not יוספטל גיורה (YP 425 p. 1005; YP 432 p. 1138). The occupation is in the feminine form
  (חקלאית). Senta Yoseftal (PersonID 2378) sat in the third Knesset. Giora Yoseftal first sat in the fourth.
- **1959** Mapai #47 **טברסקי ז׳ניה**, not טברסקי דינה (YP 704 p. 46; YP 717 p. 264): the same misreading corrected above for 1951.
- **2003** Shinui #14 **דורון חמי נחמיה**, not דורון תמי נחמיה (YP 5148 p. 1196; YP 5155 p. 1407).

The 2006 Shas #11 entry stays **אמסלם אמיל**, as the candidate notice clearly prints it. The Knesset records the member as
Haim Amsalem; no official source explains the difference. Seats and allocations are unchanged. The reviewed rosters
record each correction with its evidence, and `tests/roster-corrections.test.ts` pins all three.

הוחלט לתקן שמות מועמדים שנבחרו לפי קריאה חוזרת של הסריקות הרשמיות. בכל מקרה הבדיקה נעשתה
בהודעת המועמדים ובהודעת התוצאות, עם הפניה לעמוד. הושוו כל הנבחרים בכל 26 הבחירות להרכב
הכנסת ביום פתיחתה לפי נתוני ה-OData הרשמיים של הכנסת, והקבצים נשמרו. ההבדלים שנותרו מוסברים:
שמות משפחה קודמים, צורות כתיב כפי שנדפסו, מחליפים לפני פתיחת הכנסת, וטעות דפוס אחת בילקוט ב-1984.
