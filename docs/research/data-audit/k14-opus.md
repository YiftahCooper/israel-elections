# Data audit k14 (29 May 1996, 14th Knesset and direct PM election): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `ece8a47` (contains `53cca36` and
`origin/main`). Accessed: 2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited; no dataset build run.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 419 | Counted per field: 7 totals/rules, 20 lists × letters/votes/seats (60), 16 list names, 120 elected names, 120 elected-member Knesset IDs, 6 agreement pairs, 50 joint-list rank assignments, 11 first-government bloc memberships, 12 government facts, 8 PM-ballot facts, 6 aftermath/term facts, 3 logo claims |
| WRONG | 11 | 1 registered list missing (withdrew); 4 list names that are not the official names; 2 low-level name spellings; Ora Namir note contradicted by a retained official notice; stale aftermath gap; stale lineage hash; broken logo link; over-stated "unresolved" status |
| UNSUPPORTED | 2 | PM invalid/cast cited to an unretrieved MFA page (values confirmed elsewhere); UAL and Meretz constituent ranks rest on Hebrew Wikipedia only |
| UNVERIFIABLE | 1 | Formal correction notice (תיקון טעות) to YP 4414: not searched exhaustively |
| DISPUTED | 1 | PM percentages: the app computes 50.50 / 49.50; the official notice prints 50.49 / 49.51 |

Main findings:

1. **A 21st registered list is missing.** The candidate notice YP 4408 (9 May 1996) registers **זך, "מורשת-אבות"**
   (Moreshet Avot, Rabbi Yosef Ba-Gad). YP 4411 p. 3398 (28 May 1996) records that **all its candidates resigned on
   27 May 1996**, and the results notice YP 4414 omits it. The app has 20 lists and no trace of this one.
2. **Four ballot names are not the official names**, in both the registered-candidates notice (YP 4408) and the
   results notice (YP 4414). The reviewed transcription and every derived file carry them, and English short names
   are built on the wrong Hebrew: ק is "Unity for **Aliyah**", not "for Peace"; פא is the "**Progressive**
   Alliance", not "Democratic Alliance"; דן is the "**Settlement** Party", not "Development Party"; ת reads
   "תלם אמונה **יהדות** בדרכי נועם", not "**תימן**". IDI's 1996 table (rank 2) independently agrees with the
   gazettes.
3. **Retained official notice not used: YP 4411 also holds the candidate-resignation notices.** It is retained as
   `k14-agreements-gazette`, but it is registered only for the agreements. It gives the date of Ora Namir's
   resignation (21 May 1996), which the app says cannot be inferred. It also records that Ahmad Tibi resigned
   from the head of list נ on 21 May 1996.
4. **PM ballot:** candidates, votes, valid total and the result are confirmed against the official notice. The
   invalid (148,681) and cast (3,121,270) figures are correct, but they are cited to an MFA page that the project
   never retrieved. Better sources exist (see finding 13). The app's percentages round differently from the
   gazette's printed ones.

All seat counts reproduce exactly: Bader–Ofer, 1.5% threshold (45,782 votes) and the six agreements from YP 4411.
Recomputed independently: אמת 34, מחל 32, שס 10, ב 9, מרצ 9, כן 7, ו 5, ג 4, הד 4, ע 4, ט 2.

No English Wikipedia anywhere in the k14 files (`grep -c en.wikipedia` = 0 in `data/meta/k14.json`,
`aftermath/k14.json`, `bios/k14.json`, `logos/k14.json`, `party-links/k14.json`, `data/raw/k14/*.json`,
`data/raw/pm/reviewed-transcription.json`, and in the k14 events of `election-context.json`).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).
YP = Yalkut HaPirsumim (Reshumot). Retained PDFs: YP 4408 = `data/raw/research/k14-candidates.pdf`
(`k14-candidates-gazette`); YP 4411 = `data/raw/research/yp4411-agreements-1996.pdf` (`k14-agreements-gazette`);
YP 4414 = `data/raw/research/k14-results.pdf` (`k14-results-gazette`). All gazette quotes were read from rendered
scans at 150–200 dpi.

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k14/national.reviewed.json` (and the build → `public/data/k14.json`) | `lists` (no entry); `public/data/k14.json` `lists` (20 entries) | Moreshet Avot absent | Add list **זך "מורשת-אבות"**, `withdrawn: true`, 0 votes, as for k23 Tzomet. Withdrawal date: all candidates resigned on **27 May 1996**. | WRONG | YP 4408 p. 3289 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-cand.pdf; YP 4411 p. 3398 (1) https://olaw.org.il/yalkut/yalkut-4411.pdf; YP 4414 pp. 3482–3483 (1), which omits the list; *Dictionary of the Israeli-Palestinian Conflict* via encyclopedia.com (2–4) https://www.encyclopedia.com/politics/dictionaries-thesauruses-pictures-and-press-releases/moreshet-avot-ancestral-patrimony-hebrew | YP 4408: "אות הרשימה: זך / הכינוי: מורשת-אבות / 1. בא-גד יוסף 2. לוי מנחם 3. גרוס שלמה 4. מוסקוביץ אריה צבי". YP 4411: "אות הרשימה: זך / הכינוי: מורשת-אבות / כל המועמדים ברשימה זו התפטרו ביום ט' בסיון התשנ"ו (27 במאי 1996)." Dictionary: "withdrew his candidacy a few days before the elections" | 2026-11-06 |
| 2 | H | `data/raw/k14/national.reviewed.json`; `scripts/lib/list-meta.ts:159`; `data/meta/parties.json`; `data/meta/party-links/k14.json` | `lists[17].nameHe`; `"14-ק"` he/en; `parties[id=vehicle-14-ק].nameHe/nameEn` and `.names[date=1996-05-29]`; `lists["14-ק"][0].titleHe` | "אחדות למען השלום בראשות אפרים גור" / short "אחדות למען השלום" / "Unity for Peace" | "**אחדות למען העליה בראשות אפרים גור**" (gazette spelling; IDI writes העלייה) / short "אחדות למען העלייה" / "Unity for Aliyah" | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3293 (1); IDI 1996 (2) https://www.idi.org.il/policy/parties-and-elections/elections/1996/ | YP 4414: "ק אחדות למען העליה בראשות אפרים גור 22,741". YP 4408: "אות הרשימה: ק / הכינוי: אחדות למען העליה בראשות אפרים גור". IDI: "אחדות למען העלייה \| 22,741" | 2026-11-06 |
| 3 | H | as #2 | `lists[16].nameHe`; `"14-פא"`; `parties[id=vehicle-14-פא]`; `lists["14-פא"][0].titleHe` | "הברית הדמוקרטית" / "Democratic Alliance" | "**הברית המתקדמת**" / "Progressive Alliance" | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3293 (1); IDI 1996 (2) | YP 4414: "פא הברית המתקדמת 13,983". YP 4408: "אות הרשימה: פא / הכינוי: הברית המתקדמת" (head: זידאן מוחמד). IDI: "הברית המתקדמת \| 13,983" | 2026-11-06 |
| 4 | H | as #2 | `lists[4].nameHe`; `"14-דן"` (line 146); `parties[id=vehicle-14-דן]`; `lists["14-דן"][0].titleHe` | "מפלגת ההתפתחות" / "Development Party" | "**מפלגת ההתישבות**" (as printed; modern spelling ההתיישבות) / "Settlement Party" | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3288 (1); IDI 1996 (2) | YP 4414: "דן מפלגת ההתישבות 5,533". YP 4408: "אות הרשימה: דן / הכינוי: מפלגת ההתישבות" (head: לוינגר אליעזר). IDI: "מפלגת ההתיישבות \| 5,533" | 2026-11-06 |
| 5 | M | `data/raw/k14/national.reviewed.json`; `data/meta/parties.json`; `data/meta/families/haredi.json:1840`; `data/meta/families/religious-parties.json:2700` | `lists[19].nameHe`; `parties[id=telem-emuna].nameHe` and `.names[date=1996-05-29].nameHe`; family `listId "14-ת"` `nameHe` | "תלם אמונה **תימן** בדרכי נועם בראשות הרב יוסף עזרן" | "תלם אמונה **יהדות** בדרכי נועם בראשות הרב יוסף עזרן" | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3294 (1); YP 4411 p. 3398, agreement 5 (1) | YP 4414: "ת תלם אמונה יהדות בדרכי נועם בראשות הרב יוסף עזרן 12,737". YP 4411: "מולדת - ט עם תלם אמונה יהדות בדרכי נועם בראשות הרב יוסף עזרן - ת." | 2026-11-06 |
| 6 | L | `data/raw/k14/national.reviewed.json`; `scripts/lib/list-meta.ts:152`; `data/meta/parties.json` | `lists[10].nameHe`; `"14-כן".he`; `parties[id=yisrael-baaliyah].names[date=1996-05-29].nameHe` | "ישראל בעליה בראשותו של נתן שרנסקי" / short "ישראל בעליה" | "ישראל **בעלייה** בראשותו של נתן שרנסקי" (both notices) | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3290 (1) | "כן ישראל בעלייה בראשותו של נתן שרנסקי 174,994" | 2026-11-06 |
| 7 | L | `data/raw/k14/national.reviewed.json`; `data/meta/k14.json`; `data/meta/parties.json` | `lists[12].nameHe`; `lists[1].nameHe` (מרצ); `parties[id=vehicle-14-מרצ].names[0].nameHe` | "מרצ - ישראל הדמוקרטית רצ מפם שינוי" | "מרצ - ישראל הדמוקרטית רצ, מפ"ם, שינוי" (commas and gershayim dropped) | WRONG | YP 4414 p. 3482 (1); YP 4408 p. 3290 (1) | "מרצ - ישראל הדמוקרטית רצ, מפ"ם, שינוי 226,275" | 2026-11-06 |
| 8 | M | `data/meta/election-context.json` (line 890); build note → `public/data/k14.json` | `events[id=registered-not-declared-k14-אמת].textEn/textHe`; `lists[0].notesHe[0]` | "No resignation date or cause is inferred from the omission." Hebrew: "אורה נמיר (18) **מופיע** … אך **אינו מופיע**"; notesHe "נמיר אורה (מקום 18) **אינו מופיע**…" | She **resigned from the list on 21 May 1996** (YP 4411, already retained). Cause: appointment as ambassador to China. Fix the Hebrew gender: "מופיעה", "אינה מופיעה". Add YP 4411 as a related source. | WRONG | YP 4411 p. 3398 (1); Jewish Women's Archive encyclopedia (2) https://jwa.org/encyclopedia/article/namir-ora; Ynet (4) https://www.ynet.co.il/articles/0,7340,L-5545022,00.html | YP 4411: "אות הרשימה: אמת / הכינוי: העבודה / מועמדת מס' 18 - נמיר אורה - התפטרה ביום ג' בסיון התשנ"ו (21 במאי 1996)." JWA: "In May 1996 … she took up a new career as a diplomat: she was appointed Israel's ambassador to China" | 2026-11-06 |
| 9 | L | `data/meta/aftermath/k14.json` | `gaps[0]` | "Certification date and official first-sitting record not retrieved; …" | Stale. YP 4414 (retained) is signed 5 June 1996 (י"ח בסיון התשנ"ו), and the retained OData file gives the opening on 1996-06-17 for 120 members. Replace the gap with these dates. (The file is not yet wired into the app: no `aftermath` reference in `src/`.) | WRONG | YP 4414 p. 3483 (1); `data/raw/k14/knesset-odata-members.json` (1) | YP 4414: "י"ח בסיון התשנ"ו (5 ביוני 1996) … תאודור אור … יושב ראש ועדת הבחירות המרכזית"; OData: 120 rows with `StartDate 1996-06-17` | 2026-11-06 |
| 10 | L | `data/meta/party-lineage.json` | `sources.k14.sha256` | `3938db2f3d61463bf1d99deaa3473657be1fab46f2354adaf8a20adebb58959a` | `sha256(public/data/k14.json)` = `4d53f49c582c546aa8dd8df0180a0a4238f065939f3028791aab42a3f9a37006`, which all 9 family files already carry. Refresh after the fixes. | WRONG | Internal | n/a | 2026-11-06 |
| 11 | L | `data/meta/logos/k14.json` | `logos[2].sourceUrl` (יד) | `https://commons.wikimedia.org/wiki/Yamin_Yisrael_logo.jpg` (HTTP 404) | `https://commons.wikimedia.org/wiki/File:Yamin_Yisrael_logo.jpg`. The claim itself is OK (see the OK table). | WRONG | Commons API (n/a) | `curl` of current URL: 404 | 2026-11-06 |
| 12 | L | `data/meta/election-context.json` (line 1015) | `events[id=result-source-comparison-k14].source.evidence` (shown as "Unresolved:") | `"unresolved"` | Resolved in favour of the gazette. The rank 1 notice (list votes), rank 1 CBS table 27.2 (totals) and rank 2 IDI (list votes) agree. The differing MFA table is lower in the hierarchy and was never retrieved. "Unresolved" over-states a dispute. | WRONG | YP 4414 (1); CBS (1) https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf; IDI (2) | CBS: "3,052,130 \| 2.2 \| 79.3 \| 3,119,832 \| 3,933,250 \| 29.5.1996 \| 14" | 2026-11-06 |
| 13 | L | `data/meta/election-context.json`; `data/raw/pm/reviewed-transcription.json` | `pmContests[id=pm1996].totals.invalid.source`, `.totals.cast.source` | MFA page, `verification: report-only` (HTTP 403, not retained) | **Values correct** (148,681; 3,121,270). Re-cite to sources that load. Maariv 31 May / 2 Jun 1996 (3) as tabulated by the Institute for Palestine Studies: https://www.palestine-studies.org/ar/node/35409. J. Weekly, 7 Jun 1996 (4): https://jweekly.com/1996/06/07/election-appeals-rejected/. HCJ 3895/96 (1) confirms that blank PM ballots are invalid by law. | UNSUPPORTED | as listed | IPS (citing Maariv): "عدد المقترعين: 3,121,270 / الأصوات الصالحة: 2,972,589 / الأصوات الملغاة (بما فيها الأوراق البيض): 148,681". J. Weekly: "Some 148,681 ballots cast last week were invalidated by the Central Election Committee." | 2026-11-06 |
| 14 | L | `data/meta/k14.json` | `lists[letters=ע].parties[*].sources`; `lists[letters=מרצ].parties[id=ratz/mapam].sources` | UAL: ADP ranks [2,3], Ra'am [1,4]. Meretz: Ratz [1,4,5,8], Mapam [2,6,9]. Sources: Hebrew Wikipedia only (UAL confidence "medium"). | Values match my knowledge and are internally consistent. A rank 1–4 source was not found in this pass. Flagged as Hebrew Wikipedia used as the sole basis. Candidate sources: Knesset member pages (party line), IDI party pages. | UNSUPPORTED | Hebrew Wikipedia (5) | n/a | 2026-11-06 |
| 15 | L | UI: `src/app/components/ElectionContext.tsx:61-62` (computed) | PM shares | 50.50% / 49.50% (`toFixed(2)` of 50.4955 / 49.5045) | YP 4414 p. 3483 prints **50.49% / 49.51%** (truncated so the pair sums to 100). Rank 1 printed figure vs. arithmetic rounding; both derive from the same counts. Recommend showing the gazette's printed shares, or a note. | DISPUTED | YP 4414 p. 3483 (1) | "א. נתניהו בנימין 1,501,023 50.49% / ב. פרס שמעון 1,471,566 49.51% / ס"ה קולות כשרים 2,972,589" | 2026-11-06 |
| 16 | L | `data/meta/election-context.json` | `events[id=result-source-comparison-k14].textEn` ("no formal result-correction notice has been verified") | — | I did not search the YP issues after 4414 for a תיקון טעות to the results notice (time). No contrary evidence: the rank 1 CBS table and rank 2 IDI totals equal the gazette's. | UNVERIFIABLE | — | Tried: YP 4414's own contents (the "תיקון טעויות" on p. 3488 concerns land notices, not the election) | 2026-11-06 |

### Omissions (not counted above; facts the app should hold but does not)

| # | Sev | What | Evidence (rank) | Quote |
|---|---|---|---|---|
| O1 | M | **List נ (Arab Union, Ahmad Tibi):** Tibi (#1) and #113 resigned from the list on 21 May 1996, and Tibi publicly withdrew from the race. The list stayed on the ballot, and its 2,087 votes are counted in YP 4414, so `withdrawn: false` is correct by the official record. The app has no context event. Recommend an event on `14-נ`. | YP 4411 p. 3398 (1); JTA, 22 May 1996 (3) https://www.jta.org/archive/arafat-adviser-bows-out-of-race | YP 4411: "אות הרשימה: נ … מועמד מס' 1 - טיבי אחמד - התפטר ביום ג' בסיון התשנ"ו (21 במאי 1996). מועמד מס' 113 - סעדיה אוסאמה - התפטר ביום ג' בסיון התשנ"ו (21 במאי 1996)." JTA: "Dr. Ahmed Tibi … has announced his withdrawal from the Knesset race." |
| O2 | L | **Other pre-election resignations in YP 4411** are not recorded: Moledet #93 Hirshfeld Ilan (9 May 1996); NRP #20 Boknik David (14 May 1996) and #44 Silbetzki Rachel (9 May 1996). None affects who was elected. | YP 4411 p. 3398 (1) | "מועמד מס' 20 - בוכניק דוד - התפטר ביום כ"ה באייר התשנ"ו (14 במאי 1996)" |
| O3 | L | **Eight mid-term replacements are not noted anywhere.** The rosters stop at the elected prefix, so the replacements are not in the app: Ben-Elissar→Rivlin 1996-09-01; Libai→Cabel 1996-10-15; A. Stern→Slomiansky 1997-05-12; Hammer→Gabay 1998-01-20; Shahal→R. Haj Yahia 1998-03-20; Gafni→Leizerson 1998-10-23; Olmert→Y. Katz 1998-11-18; Badash→Shmueli 1998-11-30. The data needed is already in the retained OData file. | `data/raw/k14/knesset-odata-members.json` (1): `positions` with StartDate ≠ 1996-06-17 and FinishDate ≠ 1999-06-07 | e.g. PersonID 476 ריבלין ראובן StartDate 1996-09-01; PersonID 2196 בן-אלישר אליהו FinishDate 1996-09-01 |
| O4 | L | **PM contest:** the 50% rule and the blank-ballot ruling are not recorded on `pm1996`. Under Basic Law: The Government §13(a), a candidate needs more than half of the valid votes. HCJ 3895/96 (decided before the 5 June notice) held that blank PM ballots are invalid; counting them would have left neither candidate above 50%. | HCJ 3895/96 (1) https://judgments.org.il/judgments/%D7%91%D7%92%D7%A6-3895-96-%D7%A2%D7%95%D7%93-%D7%99%D7%A2%D7%A7%D7%91-%D7%98%D7%9C-%D7%94%D7%A2%D7%95%D7%AA%D7%A8-%D7%91%D7%91%D7%92%D7%A6-3895-96-2-%D7%A2%D7%95%D7%93-%D7%A9%D7%9C%D7%95/ (mirror of the Supreme Court judgment; the official court site was not reached) | "השאלה הניצבת בפנינו … אילו נלקחו פתקי ההצבעה הריקים במניין הקולות הכשרים, לא היה זוכה איש מבין שני המועמדים … ביותר ממחצית הקולות הכשרים" |
| O5 | L | `docs`/manifest: `k14-agreements-gazette` (YP 4411) is described only as the agreement notice. It also contains both resignation notices for the 14th Knesset (p. 3398). Recommend widening its manifest description so the fixer uses it for #1, #8 and O1–O2. | YP 4411 cover (1) | "הודעה בדבר התפטרות מועמדים לכנסת הארבע-עשרה … 3398" |

### Notes for the fixer

- **Do not use IDI's 1996 table for votes.** It has two typos against the gazette: Meretz **226,775** (gazette
  226,275) and Men's Rights **2,388** (gazette 2,338). It is reliable for the list names in #2–#4.
- Hebrew Wikipedia's 1996 results table gives letter **תא** for Telem Emuna; the gazettes print **ת**. The app's `ת`
  is correct.
- The candidate-list letters, ranks, and the elected-member reconciliation (Labor rank 18 skipped) are correct. Only
  the explanatory text in #8 is wrong.

## Checked and OK

| Area | Items | Source (rank) | Quote / basis |
|---|---|---|---|
| Election date 1996-05-29; Knesset 14 | 2 | YP 4414 p. 3483 (1); CBS 27.2 (1) | "שהתקיימו ביום י"א בסיון התשנ"ו (29 במאי 1996)"; CBS "29.5.1996 \| 14" |
| Eligible 3,933,250; votes cast 3,119,832; invalid 67,702; valid 3,052,130 | 4 | YP 4414 p. 3482 (1) (invalid, valid); CBS 27.2 (1) (eligible, cast, 2.2% invalid); IDI 1996 (2) | YP: "2. מספר הקולות שנמצאו פסולים 67,702"; "ס"ה הקולות הכשרים 3,052,130". CBS row as in #12. 3,052,130 + 67,702 = 3,119,832 |
| Rule set `il-1992-bader-ofer-1.5` (1.5% threshold, Bader–Ofer, half-seats cap) | 1 | Amendment 23 (1991) and Amendment 4 (1973), retained (1); recomputed seats match | Threshold 45,782; every seat reproduced |
| 20 lists: letters | 20 | YP 4414 p. 3482 (1) | אמת ב ג ד דן הד ו ז ט יד כן מחל מרצ נ ע פ פא ק שס ת |
| 20 lists: votes | 20 | YP 4414 p. 3482 (1); IDI 1996 (2) except two IDI typos | Sum = 3,052,130 exactly |
| 20 lists: seats (`officialSeats`) | 20 | YP 4414 p. 3482 §3 (1) | 34, 9, 4, 4, 5, 2, 7, 32, 9, 4, 10 = 120; others 0 |
| List names (Hebrew) | 16 | YP 4414 p. 3482 (1); YP 4408 (1) | All except ק, פא, דן, ת (WRONG #2–#5); כן and מרצ spelling only (#6–#7, counted as OK for identity) |
| Surplus agreements: 6 pairs, complete | 6 | YP 4411 p. 3398 (1) | "1. העבודה - אמת עם מרצ … 2. מפד"ל … ב עם יהדות התורה … ג. 3. הדרך השלישית … הד עם ישראל בעליה … כן. 4. … ו עם … ע. 5. מולדת - ט עם תלם אמונה … ת. 6. הליכוד גשר צומת - מחל עם ש"ס … שס." |
| Elected names, 120 in printed order, incl. Labor rank 18 skipped | 120 | YP 4414 §4 pp. 3482–3483 (1); YP 4408 (1) | e.g. "(א) … 17. מסאלחה נואף 18. בן-מנחם אלי"; registered rank 18 "נמיר אורה" |
| Elected-member Knesset person IDs | 120 | Retained OData (1) | All 120 `bios` `knessetPersonId` values = the 120 OData members with StartDate 1996-06-17; none missing; surname matches (4 spelling variants: בן-צור, חאג'-יחיא, גוז'נסקי, חטיב/כטיב = same persons) |
| Joint lists: Likud–Gesher–Tzomet 22/5/5 (32 ranks) | 32 | OData faction rows 1999 (1) for 20 members; ParlGov / Hebrew Wikipedia (5) for the rest; split confirmed by `joint-facts` | Gesher 2,9,14,21,30; Tzomet 3,8,15,20,31 |
| Joint lists: Hadash–Balad (5), UTJ (4), Shinui in Meretz (2) | 11 | OData faction rows (1) | e.g. "PersonID 558 בשארה עזמי: FactionName "ברית לאומית דמוקרטית""; Ravitz "דגל התורה"; Porush, Halpert "אגודת ישראל"; Poraz "שינוי" |
| Joint lists: Ratz/Mapam (7), ADP/Ra'am (4) | 7 (+4 in #14) | Hebrew Wikipedia (5) | Correct but sourced only to Hebrew Wikipedia; see #14 |
| First-government bloc scheme: coalition מחל, שס, ב, כן, ג, הד (66); opposition אמת, מרצ, ו, ע, ט (54); date 1996-06-18 | 11 | OData GovernmentNum 27 ministers (1); JTA (3) "a 66-seat majority"; Hebrew Wikipedia (5) | Seats sum 32+10+9+7+4+4 = 66 |
| Government 27; PM Netanyahu; start 1996-06-18; end 1999-07-06; confidence vote 62–50; coalition seats 66 | 6 | OData (1); Washington Post 19 Jun 1996 (4) "endorsed by a vote of 62-50"; Hebrew Wikipedia, Knesset 14 article (5) "ברוב של 62 מול 50"; JTA 6 Jul 1999 (3) | — |
| Direct election, no recommendation round | 2 | Basic Law: The Government 1992 (1); YP 4414 p. 3484 (1) | "לפי החישובים דלעיל … נבחר לראש הממשלה: בנימין נתניהו" |
| Dissolution law 1999-01-04; next election 1999-05-17 | 2 | Supreme Court judgment, file 99001020 (Zamir J., 17 Jan 1999) (1) https://supremedecisions.court.gov.il/Home/Download?fileName=99001020_I01.txt&path=HebrewVerdicts%5C99%5C020%5C001%5CI01&type=4 | "ביום ט"ז בטבת התשנ"ט (4.1.1999) התקבל בכנסת … חוק התפזרות הכנסת הארבע-עשרה … הבחירות לכנסת החמש-עשרה יערכו ביום ב' בסיון התשנ"ט (17.5.1999)" |
| Term events: Hebron Protocol (1997-01), Wye River Memorandum (1998-10) | 2 | Knesset history via JVL (1, mirror); MFA (1); Hebrew Wikipedia (5) | Knesset approved Hebron 16 Jan 1997 (87–17); Wye 17 Nov 1998 |
| PM: candidates Netanyahu and Peres only (no withdrawn nominees) | 2 | YP 4408 p. 3286 (1) | "שמות המועמדים לראש הממשלה … 1. נתניהו בנימין 2. פרס שמעון" |
| PM: votes 1,501,023 / 1,471,566; valid 2,972,589; result Netanyahu | 4 | YP 4414 p. 3483–3484 (1) | Quoted in #15; "המועמד בנימין נתניהו … קיבל יותר ממחצית הקולות הכשרים" |
| PM: invalid 148,681; cast 3,121,270 | 2 | Maariv via IPS (3); J. Weekly (4) | Values OK; citation UNSUPPORTED (#13). 2,972,589 + 148,681 = 3,121,270 |
| Logos: Likud–Gesher–Tzomet, Third Way, Yamin Yisrael claimed for 1996 | 3 | Wikimedia Commons file metadata (as evidence of the NLI ephemera items) | LGT: "Logo … as seen on a campaign material from the 1996 Israeli Election" (NLI 700074998); Third Way: "used in flyers and ads … during the 1996 Israeli Legislative Election" (NLI 700129420); Yamin Yisrael: category "1996 elections in Israel", NLI IE4160829 |
| Families: dataset hashes for k14 | 9 | Internal | All 9 family files carry `4d53f4…` = current `public/data/k14.json` (lineage is stale, #10) |
| Editorial stance | — | — | No partisan wording found in k14 texts. IDI's intro phrase "ארגוני הסירוב הפלסטינים" is not in the app. |
