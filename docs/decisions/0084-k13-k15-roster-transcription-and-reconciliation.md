# K13–K15: roster transcriptions and elected-name reconciliation

## Evidence and treatment

All names were visually read from pdfjs-dist **6.5.438** renders, with `wasmUrl`
pointing to `node_modules/pdfjs-dist/wasm/`. No OCR or secondary name list supplies
production names. Working renders belong in `.backup-scratch/k13-k15/` and are
reproducible from the retained PDFs. Build/test use the reviewed JSON without PDF
parsing or scratch. Install the lockfile dependencies, then run
`node scripts/build-datasets.ts` to regenerate public data.

The retained gov.il **YP 4017** scan and the olaw mirror are byte-identical and omit
many printed pages, including winning-roster starts. IDI's seven **facsimiles of the
same official gazette** fill those pages: files `data/raw/k13/yp4017-*.pdf`, with
individual URLs, hashes and host disclosure in SOURCES. Only the printed typesetting
was transcribed; handwritten ticks, underlines and party labels were ignored. These
are mirrored primary pages, not IDI-authored roster data. Other k13 names use the
retained gov.il scan. K14 uses YP 4408; k15 uses YP 4748.

`candidates.reviewed.json` records each candidate's printed page and the roster's
source id; `elected.reviewed.json` independently records results section 4 names in
printed order (YP 4021 pp. 3776–3777, YP 4414 pp. 3482–3483, YP 4757 pp. 3377–3378).
Every one of the **360** elected names is compared, by list and position. This is an
agent visual transcription and cross-check; no separate human review is claimed.

Resolved differences, without inventing withdrawal dates:

* **1992 Labor, rank 14:** YP 4017 p. 3620 prints `אור אריה`; YP 4021 p. 3776
  prints `אור אורי`. Both occupy the same rank between the same candidates. Treat
  this as a given-name variant and retain the registered spelling, with an exact,
  rank-specific exception in reviewed JSON. This is the only non-punctuation name
  difference accepted by the build.
* **1992 Likud:** registered rank 2 `ארנס משה` (YP 4017 p. 3636) is absent from
  YP 4021 section 4. Elected rank 1 matches registered rank 1; elected ranks 2–32
  match registered ranks 3–33. Retain the 33-name original prefix and explicit map.
  The separate resignation notice and exact date were not recovered; no pre-election
  withdrawal date is inferred from omission.
* **1996 Labor:** registered rank 18 `נמיר אורה` (YP 4408 p. 3286) is absent
  from section 4 of YP 4414. Elected positions 1–17 match registered ranks 1–17;
  elected positions 18–34 match ranks 19–35. Retain all first 35 registered names.
  The separate withdrawal notice and exact date remain unverified.
* **1999 National Union:** registered rank 1 `בגין זאב בנימין` (YP 4748 p. 3040)
  is absent from YP 4757 section 4. Its four elected names match registered ranks
  2–5. Retain all first five names and the explicit map. The departure's timing is
  not established by these two notices. Retained YP 4751 p. 3184, 4753 p. 3261
  and 4754 p. 3269 were also read: their candidate-withdrawal notices do not resolve
  this omission. No speculative pre-election renumbering is made.
* **1999 Shas:** YP 4757 p. 3378 explicitly records registered rank 1
  `דרעי אריה מכלוף` resigning on **19 May 1999**, after election day. Section 4
  lists registered ranks 2–18 as the 17 elected names. Retain the first **18** original
  candidates, including Deri. Do not silently replace the original head with later
  membership.

A preliminary low-resolution reading of 1996 Likud's elected rank 4 looked like
`מרידור יצחק`; a larger pdfjs render resolves it as `מרדכי יצחק`, matching the
candidate gazette. No exception or guessed correction is needed.

Totals: **121** registered candidates in k13, **129** in k14 and **122** in k15.
Only the 12-person Third Way roster is complete. All other winning lists have
truncated prefixes; every zero-seat list is explicitly unavailable. “Ranks” below
means original registered ranks, contiguous from 1. Full published counts identify
the candidate notice, not an assertion that all later withdrawal history is checked.

## K13 (1992)

| List (letters) | Seats | Ranks transcribed | Coverage |
|---|---:|---|---|
| העבודה בראשות רבין (אמת) | 44 | 1–44 | Truncated |
| מפד״ל חזית דתית לאומית - המזרחי הפועל המזרחי (ב) | 6 | 1–6 | Truncated |
| יהדות התורה המאוחדת - אגודת ישראל - דגל התורה - הרב יצחק פרץ (ג) | 4 | 1–4 | Truncated |
| התנועה הלאומית הדמוקרטית ועליה (ד) | 0 | — | Unavailable |
| פיקנטי בראשות משה בדש (דף) | 0 | — | Unavailable |
| חזית דמוקרטית לשלום ולשוויון - המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים (ו) | 3 | 1–3 | Truncated |
| ציפר (זה) | 0 | — | Unavailable |
| מולדת (ט) | 3 | 1–3 | Truncated |
| התקוה - תנועה חברתית לרווחה בראשות צ׳רלי ביטון (יד) | 0 | — | Unavailable |
| התורה הארץ בראשות הרב משה לוינגר (יז) | 0 | — | Unavailable |
| מפלגת חוק הטבע (ים) | 0 | — | Unavailable |
| תל״י התנועה להתחדשות ישראל (כי) | 0 | — | Unavailable |
| הליכוד (מחל) | 32 | 1–33 | Truncated |
| מרצ - ישראל הדמוקרטית - רצ מפם שינוי (מרצ) | 12 | 1–12 | Truncated |
| על גלגלים (נ) | 0 | — | Unavailable |
| תנועת נפגעי משכנתאות חסרי דיור ועולים משוחררים (נז) | 0 | — | Unavailable |
| מפלגת נשים (נס) | 0 | — | Unavailable |
| המפלגה הדמוקרטית הערבית (ע) | 2 | 1–2 | Truncated |
| הרשימה המתקדמת לשלום (פ) | 0 | — | Unavailable |
| צומת - התנועה להתחדשות ציונית ובלתי מפלגתיים (ץ) | 8 | 1–8 | Truncated |
| גימלאים עולים קשישים בישראל (ק) | 0 | — | Unavailable |
| גאולת ישראל בראשות הרב אליעזר מזרחי (קל) | 0 | — | Unavailable |
| המפלגה הליברלית החדשה בראשות יצחק מודעי (קנ) | 0 | — | Unavailable |
| ש״ס - התאחדות הספרדים שומרי תורה (שס) | 6 | 1–6 | Truncated |
| תחיה (ת) | 0 | — | Unavailable |

## K14 (1996)

| List (letters) | Seats | Ranks transcribed | Coverage |
|---|---:|---|---|
| העבודה (אמת) | 34 | 1–35 | Truncated |
| מפד״ל המפלגה הדתית לאומית המזרחי - הפועל המזרחי (ב) | 9 | 1–9 | Truncated |
| יהדות התורה המאוחדת אגודת ישראל - דגל התורה (ג) | 4 | 1–4 | Truncated |
| אירגון הפעולה הדמוקרטי דע״ם (ד) | 0 | — | Unavailable |
| מפלגת ההתפתחות (דן) | 0 | — | Unavailable |
| הדרך השלישית להסכמה לאומית (הד) | 4 | 1–12 | Full |
| חזית דמוקרטית לשלום ולשוויון (המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים) והברית הלאומית הדמוקרטית (ו) | 5 | 1–5 | Truncated |
| מפלגת זכויות הגבר במשפחה - רע״ש (ז) | 0 | — | Unavailable |
| מולדת (ט) | 2 | 1–2 | Truncated |
| ימין ישראל (יד) | 0 | — | Unavailable |
| ישראל בעליה בראשותו של נתן שרנסקי (כן) | 7 | 1–7 | Truncated |
| הליכוד גשר צומת (מחל) | 32 | 1–32 | Truncated |
| מרצ - ישראל הדמוקרטית רצ מפם שינוי (מרצ) | 9 | 1–9 | Truncated |
| האיחוד הערבי לקידמה והתחדשות בראשות ד״ר אחמד טיבי (נ) | 0 | — | Unavailable |
| המפלגה הדמוקרטית הערבית - הרשימה הערבית המאוחדת (ע) | 4 | 1–4 | Truncated |
| גימלאי ישראל לכנסת - גיל (פ) | 0 | — | Unavailable |
| הברית הדמוקרטית (פא) | 0 | — | Unavailable |
| אחדות למען השלום בראשות אפרים גור (ק) | 0 | — | Unavailable |
| ש״ס התאחדות הספרדים העולמית שומרי תורה (שס) | 10 | 1–10 | Truncated |
| תלם אמונה תימן בדרכי נועם בראשות הרב יוסף עזרן (ת) | 0 | — | Unavailable |

## K15 (1999)

| List (letters) | Seats | Ranks transcribed | Coverage |
|---|---:|---|---|
| ישראל אחת בראשות אהוד ברק - העבודה גשר מימד (אמת) | 26 | 1–26 | Truncated |
| המפד״ל - המפלגה הדתית לאומית המזרחי - הפועל המזרחי (ב) | 5 | 1–5 | Truncated |
| יהדות התורה המאוחדת והשבת אגודת ישראל - דגל התורה (ג) | 5 | 1–5 | Truncated |
| אלתג׳מע אלוטני אלדימוקרטי (בל״ד) (ד) | 2 | 1–2 | Truncated |
| הדרך השלישית עם הגולן בראשות אביגדור קהלני (הד) | 0 | — | Unavailable |
| חזית דמוקרטית לשלום ולשוויון - חד״ש (המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים) (ו) | 3 | 1–3 | Truncated |
| מפלגת זכויות הגבר במשפחה - רע״ש (ז) | 0 | — | Unavailable |
| מורשת אבות בראשות הרב בא-גד (זך) | 0 | — | Unavailable |
| האיחוד הלאומי - מולדת חרות תקומה (ט) | 4 | 1–5 | Truncated |
| לב - עולים למען ישראל (ים) | 0 | — | Unavailable |
| שינוי - התנועה החילונית בראשות לפיד ופורז (יש) | 6 | 1–6 | Truncated |
| ישראל בעליה בראשות נתן שרנסקי (כן) | 6 | 1–6 | Truncated |
| ישראל ביתנו בראשות אביגדור ליברמן (ל) | 4 | 1–4 | Truncated |
| עם אחד בראשות עמיר פרץ - סיעת העובדים והגימלאים בישראל (ם) | 2 | 1–2 | Truncated |
| הליכוד בראשות בנימין נתניהו (מחל) | 19 | 1–19 | Truncated |
| מרצ ישראל הדמוקרטית (מרצ) | 10 | 1–10 | Truncated |
| מפלגת המרכז הפרוגרסיבית (מיוסדת ע״י יוצאי רומניה) (נ) | 0 | — | Unavailable |
| מפלגת הנגב (נץ) | 0 | — | Unavailable |
| הרשימה הערבית המאוחדת (עם) | 5 | 1–5 | Truncated |
| פנינה רוזנבלום (פ) | 0 | — | Unavailable |
| מפלגת המרכז בראשות יצחק מרדכי (פה) | 6 | 1–6 | Truncated |
| כח לגימלאים בראשות גדעון בן ישראל (פז) | 0 | — | Unavailable |
| צומת - התנועה לציונות מתחדשת (ץ) | 0 | — | Unavailable |
| מפלגת הקזינו - עזרא טיסונה מוסד ההימורים הישראלי (קז) | 0 | — | Unavailable |
| אירגון הפעולה הדמוקרטי דע״ם (קם) | 0 | — | Unavailable |
| עלה ירוק (קנ) | 0 | — | Unavailable |
| ערבי חדש (קף) | 0 | — | Unavailable |
| תקווה (קץ) | 0 | — | Unavailable |
| מפלגת חוק הטבע (רם) | 0 | — | Unavailable |
| הירוקים (רק) | 0 | — | Unavailable |
| ש״ס התאחדות הספרדים העולמית שומרי תורה (שס) | 17 | 1–18 | Truncated |

## Addendum, 4 November 2026: the 1992 "given-name variant" was a misreading

On re-reading, YP 4017 p. 3620 prints **אור אורי** at Labor rank 14, as YP 4021 p. 3776 does. The rank-specific
exception was removed and the roster corrected. Also corrected: 1996 Likud–Gesher–Tzomet #15 דיין חיים and #30 לנקרי
יהודה, and 1999 UAL #2 סאנע טלב, among others. The "independent" 1996 elected readings had repeated the
roster's misreadings. See the [decision 0088](0088-roster-corrections-and-odata-audit.md).
