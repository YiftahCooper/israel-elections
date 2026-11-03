# Elected names against the Knesset's opening membership, 1949–2026

Audit of 4 November 2026. For every election, the members the app shows as elected
(`electedOf` in `src/app/derive.ts` over `scenarioFromDataset`, with seats from `allocate`,
so `notSeated` candidates are skipped) were compared with the Knesset OData membership on the
Knesset's opening day. Every substantive difference was then checked in the official scans.
The resulting corrections and the reasoning behind them are in
[the draft decision record](../decisions/DRAFT-roster-corrections-and-odata-audit.md).

## Method

- **Official membership.** `KNS_PersonToPosition` rows with PositionID 43 or 61 (male or female
  MK) for the Knesset, together with `KNS_Person` names and the PositionID 54 rows (faction
  member). The members whose `StartDate` is the earliest date for that Knesset are the opening
  membership. There are exactly 120 for each of Knessets 1–25. The responses were fetched with curl,
  with `$format=json` appended to every request, including the `odata.nextLink` pages. They are
  retained as `data/raw/kNN/knesset-odata-members.json` (manifest ids `kNN-membership-odata`).
  The k16 and k17 files are the snapshots retained earlier and have no faction rows.
- **26th Knesset.** At retrieval OData had no MK positions for Knesset 26. It did have 120
  faction-membership rows, all starting on the scheduled opening day, 10 November 2026. These
  were used as a provisional comparison. They are not proof of who will be sworn in.
- **Matching.** Matching was by surname, then given name, within the list's opening faction.
  Matches tolerate vowel letters (ו/י/א), punctuation, final-letter forms and common short
  forms (יוסי/יוסף, אלי/אליהו, גבי/גבריאל and so on). The matching is a screening aid. Every
  residual pair below was decided by reading the scans or the printed form, not by the matcher.
- **Scans.** Each candidate notice and results notice was rendered with pdf.js in Playwright and
  read letter by letter at high zoom. Crops are in ignored scratch. Printed page numbers are in
  the reviewed JSON `corrections` entries.

"Legitimate" below means that the dataset reproduces what the official notices print, and that
the difference from the opening membership has a stated, non-transcription cause.

## Summary

| Election | Opening day (OData) | Same person, same or variant name | Legitimate differences | Corrected in this pass |
|---|---|---:|---:|---:|
| k1 1949 | 1949-02-14 | 106 | 14 | 2 |
| k2 1951 | 1951-08-20 | 118 | 2 | 10 |
| k3 1955 | 1955-08-15 | 116 | 4 | 3 |
| k4 1959 | 1959-11-30 | 117 | 3 | 2 |
| k5 1961 | 1961-09-04 | 120 | 0 | 1 |
| k6 1965 | 1965-11-22 | 119 | 1 | 0 |
| k7 1969 | 1969-11-17 | 119 | 1 | 2 |
| k8 1973 | 1974-01-21 | 119 | 1 | 0 |
| k9 1977 | 1977-06-13 | 118 | 2 | 1 |
| k10 1981 | 1981-07-20 | 120 | 0 | 14 |
| k11 1984 | 1984-08-13 | 119 | 1 | 5 |
| k12 1988 | 1988-11-21 | 120 | 0 | 4 |
| k13 1992 | 1992-07-13 | 119 | 1 | 1 |
| k14 1996 | 1996-06-17 | 118 | 2 | 7 |
| k15 1999 | 1999-06-07 | 119 | 1 | 1 |
| k16 2003 | 2003-02-17 | 119 | 1 | 0 |
| k17 2006 | 2006-04-17 | 119 | 1 | 0 |
| k18 2009 | 2009-02-24 | 119 | 1 | 0 |
| k19 2013 | 2013-02-05 | 119 | 1 | 0 |
| k20 2015 | 2015-03-31 | 118 | 2 | 0 |
| k21 2019a | 2019-04-30 | 120 | 0 | 0 |
| k22 2019b | 2019-10-03 | 120 | 0 | 0 |
| k23 2020 | 2020-03-16 | 119 | 1 | 0 |
| k24 2021 | 2021-04-06 | 119 | 1 | 0 |
| k25 2022 | 2022-11-15 | 120 | 0 | 0 |
| k26 2026 | provisional, 2026-11-10 | 120 | 0 | 0 |

The first two numeric columns count the 120 elected members after correction. "Corrected" counts
corrected candidate records, and includes spelling-only fixes found on the pages that were
re-read. Elections k1–k15 had 53 corrections in all. Of these, 33 changed which person the
dataset named, or misnamed a member beyond a spelling variant. The rest were spelling-only.

## Legitimate differences, by election

| Election | List and rank, dataset name as printed | Opening-day OData record | Why it is legitimate |
|---|---|---|---|
| k1 | א#6 מאירסון גולדה; #8 רובשוב זלמן; #15 פישמן עדה; #23 אהרונוביץ זלמן; #24 דינבורג בן-ציון; #31 שריבמן ראובן; #32 קוסוי יונה; #38 גלובמן עקיבא; #42 ליבנשטין אליעזר; #44 גורפינקל ישראל; #46 גרבובסקי מאיר | מאיר גולדה; שזר זלמן; מימון עדה; ארן זלמן; דינור בן-ציון; שרי ראובן; כסה יונה; גוברין עקיבא; ליבנה אליעזר; גורי ישראל; ארגוב מאיר | Printed under their surnames of 1949; OData uses the later Hebrew surnames. Each is the only unmatched pair in the Mapai faction with the same given name. The 1951 results notice itself prints "מימון (פישמן) עדה", "ארן (אהרונוביץ) זלמן", "ארגוב (גרבובסקי) מאיר" and "שרי (שריבמן) ראובן". |
| k1 | מ#8 ריפטין יעקב; מ#15 אידלסון ישראל | ריפתין יעקב; בר-יהודה ישראל | ט as printed in both 1949 notices. Idelson is printed "בר-יהודה אידלסון ישראל" in 1951. |
| k1 | ב#1 פישמן הרב יהודה לייב; ב#15 צוובנר אברהם חיים | מימון יהודה לייב; שאג אברהם חיים | Earlier surnames, as printed. The unmatched pair is unique within the United Religious Front faction. |
| k1 | פ#2 גרנובסקי אברהם | גרנות אברהם | Earlier surname, as printed. The other k1 aliases (שרתוק/שרת, לוביאניקר/לבון, רוזנבליט/רוזן, פרדר הרברט/פורדר ישעיהו, רובין הנס/חנן, the forms with parentheses) matched without help. |
| k2 | א#5 מאירסון גולדה; א#31 גורפינקל ישראל | מאיר גולדה; גורי ישראל | As in k1. |
| k3 | א#4 מאירסון גולדה; ב#5 רוזנברג ישראל שלמה; גד#5 ינקלביץ זלמן | מאיר גולדה; בן-מאיר שלמה-ישראל; בן-יעקב זלמן | Earlier surnames, as printed in both 1955 notices (candidate pp. 1007, 1009). |
| k3 | פ#2 קול משה | כהן אידוב (Progressive) | The results notice (p. 1139) prints קול משה among the five elected Progressives; כהן אידוב is candidate #6 (p. 1018). Kol was replaced before the opening. The app seats the members the results notice names, so this is not modelled, like Sharansky in 2003. |
| k4 | ב#5 הרב ד״ר רוזנברג ישראל-שלמה; מ#9 כמיס יוסף; רא#1 א-ז׳אהר אחמד | בן-מאיר שלמה-ישראל; חמיס יוסף; א'-דאהר אחמד | Earlier surname; כ as printed in both 1959 notices; ז׳ as printed in both (pp. 68, 265). |
| k6 | רא#2 נכלה אליאס | נחלה אליאס | כ as printed in both 1965 notices (pp. 140, 313). |
| k7 | חל#23 קצנלבוגן בן-ציון | קשת בן-ציון | Earlier surname, printed in both 1969 notices (pp. 210, 435). |
| k8 | חל טעם#38 שחטרמן אברהם | שכטרמן אברהם | The candidate notice prints שחטרמן; the results notice prints שכטרמן. The spelling variant is already recorded. |
| k9 | מחל#35 דייקסל מיכאל; ים#1 סייף אלאדין מוחמד סעיד חוסיין זועבי | דקל מיכאל; אלזועבי סיף-אלדין | Earlier surname, as printed (pp. 1328, 1496); the full printed name form. The form שרון סמואל (פש#1) is printed as such; OData has פלאטו-שרון שמואל. |
| k11 | אמת#16 שפירא אליהו | שפייזר אליהו | The candidate notice itself misprints "שפירא אליהו" (YP 3073 p. 2826, read at 12x); the results notice prints שפייזר (p. 3007). The candidate reading is kept with the recorded variant. This is a gazette misprint, not a transcription error. |
| k13 | מרצ#9 חאג יחיא וליד | צאדק חאג'-יחיא וליד | Printed form, without the first name צאדק. |
| k14 | מרצ#9 חאג׳ יחיא וליד; ע#4 כטיב טופיק | צאדק חאג'-יחיא וליד; חטיב תאופיק | Printed forms (pp. 3290, 3292, 3483). |
| k15 | עם#2 סאנע טלב | אלסאנע טלב | Printed form (corrected from צאנע). |
| k16 | כן#1 שרנסקי נתן | סולודקין מרינה | Sharansky withdrew after the election; decision 0053. |
| k17, k18 | עם#3 סאנע טלב | אלסאנע טלב | Printed form in both notices. |
| k19 | טב#7 קלפה זבולון | כלפה זבולון | Printed form in both notices (pp. 1985, 2474). |
| k20 | ל#4 שוחט אילן; אמת#21 סבטלוב קסניה | אילטוב רוברט; סבטלובה קסניה | Results notice YP 7010 p. 4372 prints שוחט אילן as elected. אילטוב רוברט (candidate #7, p. 3945) sat from the opening, so Shohat was replaced before it. סבטלוב is the printed form. |
| k23 | פה#13 גרמן יעל | רול עידן | German is candidate #13 (p. 3928). רול (printed "עדן", candidate #34) sat from the opening. No retained CEC document names the elected members, so the replacement is shown only by the official Knesset record. |
| k24 | ב#3 דוידי אלון | סילמן עידית | As for k23: Davidi is candidate #3 (p. 4249), Silman #8. |

Under the Norwegian law (from 2015), ministers resign their seats after the opening. Comparing the opening day
avoids those changes, and none affects the table. Short and long given-name forms, such as
אלי/אליהו, גבי/גבריאל, אבי/אביגדור, טלי/רויטל, דבי/דבורה, אתי/אסתר, are the same person and
are not listed.

## Corrections

All corrections are logged, with pages, in the `corrections` array of each reviewed JSON.
k1–k7 are in `rosters.reviewed.json`, k9–k12 in `candidates.reviewed.json`, and k13–k15 in both
`candidates.reviewed.json` and `elected.reviewed.json`. The draft decision record lists them in
full. Names that changed identity:

- **k1** ב#15 צנובר → צוובנר אברהם חיים.
- **k2** א#22 שרף → שפר זאב; א#37 טברסקי דינה → ז׳ניה; צ#16 סוסמן → ד״ר סטופ אברהם; צ#19 יסמן → זיסמן
  שלום; צ#20 פלדשטיין → פרלשטין שלמה; ע#1 המדאן → חמדאן פארס; צ#14 סוייב → סוזייב זלמן.
- **k3** צ#10 סוייב → סוזייב; צ#13 פלדשטיין → פרלשטיין. **k5** ל#18 פלדשטיין → פרלשטיין.
- **k7** אמת#29 רייזר-ששון צבי → דינשטיין צבי.
- **k9** ים#1 → סייף אלאדין מוחמד סעיד חוסיין זועבי.
- **k10** אמת #17 חריף משה, #30 כץ-עוז אברהם, #33 ותד מחמד, #40 רון אמרי, #45 נעים רענן; מחל #31 דורון
  שרה, #32 זייגרמן דרור, #38 רנר צבי, #46 זיגר יצחק.
- **k11** אמת#37 רז נחמן; מחל#19 זיגר יצחק; הן#3 עטשי זיידאן.
- **k12** Likud: printed rank 32 גולדברג יוסף had been dropped, shifting ranks 32–40. Rank 25
  רייסר מיכאל is not among the elected in the results notice and is now `notSeated`. Shinui #2 is פורז-פוזמנטיר אברהם.
- **k13** אמת#14 אור אורי. The "given-name variant" אור אריה accepted in decision 0084 was a misreading.
- **k14** מחל#15 דיין חיים (not "ריבלין חיים"; ריבלין ראובן is printed at #33); #30 לנקרי יהודה; ע#3 אלסאנע טלב.
- **k15** עם#2 סאנע טלב.

Spelling-only corrections were made on the same re-read pages, for example k10 צפורי, הראל אהרן,
חריש מיכאל; k11 ויינשטיין, גרוסמן ארקין חיה; k14 זוילי, גולדשמידט, בדש פיני פנחס, פורז
פוזמנטיר; k2 אזניה (איזנשטט), בז׳רנו, בסטוני; k1 לוינשטין; k4 נח׳לה; k7 פינברג-סירני.

## Not covered

This is an identity audit. A different person, or a garbled name, is caught by the OData
comparison. A spelling error that still leaves a recognisable surname is not. The re-read pages
showed that the earlier 1949–1999 transcriptions also contain spelling-level slips. Those seen
were corrected, but no letter-by-letter re-read of every elected name in every election was done.
Candidates below the elected ranks were not audited.

## Reproduction

The reproduction steps are:

1. Fetch the queries recorded in each snapshot's `queries` field, using curl and `$format=json`.
2. Take the earliest `StartDate` (for k26, the faction rows).
3. Compare with `electedOf(scenarioFromDataset(ds), seat)` for each list.

The ad hoc matcher and fetch script used here were kept in ignored scratch (`.backup-scratch/tools/`) and
are not part of the build. Each corrected name, and its OData PersonID where the surname still matches, is pinned in
`tests/roster-corrections.test.ts`.
