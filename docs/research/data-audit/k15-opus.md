# Data audit k15 (17 May 1999, 15th Knesset): Opus auditor

Independent check of every k15 fact found by `grep -rl k15`: results, rosters, meta, aftermath, context, PM contests,
families, lineage, bios, links, logos and UI text. Base revision `5e117f0`. All checks accessed **2026-11-06**. No data
edited.

**Method.** Rank-1 scans were read visually at 4–10× zoom, rendered locally with PyMuPDF:
- results notice YP 4757 (25 May 1999), pp. 3376–3378, retained `data/raw/research/k15-results.pdf`;
- candidate notice YP 4748 (9 May 1999), pp. 3036–3049, every list header, retained `data/raw/research/k15-candidates.pdf`;
- candidate-change notices YP 4751 p. 3184, YP 4753 p. 3261 and YP 4754 p. 3269, retained `data/raw/research/yp475*-candidate-changes-1999.pdf`;
- agreement and PM-withdrawal notice YP 4755 p. 3305, retained `data/raw/k15/yp4755-agreements.pdf`;
- YP 4756 cover (fresh download from olaw.org.il);
- YP 4960 p. 1628, retained `data/raw/pm/yp4960.pdf`.

Other sources:
- CBS table 27.2 and the IDI 1999 PDF p. 8: text-extracted or read visually.
- Knesset OData, queried live: `KNS_PersonToPosition`, PositionID 45 for governments 28–29, and GovernmentNum 28.
- Retained OData members file, re-analysed.
- Seats recomputed from the transcribed votes: 1.5% threshold, d'Hondt/Bader–Ofer, the nine agreements.
- Press found through the Exa search index.

## Summary

| Class | Count |
|---|---|
| OK | 303 |
| WRONG | 13 |
| UNSUPPORTED | 1 |
| UNVERIFIABLE | 0 |
| DISPUTED | 0 |

What the 303 OK checks cover:
- **Results:** 31 vote counts, 31 seat counts, 29 letters, 23 list names, 9 agreement pairs, 5 totals and the date.
- **Rosters:** 119 elected names and 2 not-seated heads.
- **PM contests:** 1999 and 2001, 18 values.
- **Government and formation:** about 20 facts.
- **Term events:** 6.
- **Joint-list compositions:** 5 (National Union, UTJ, One Israel, UAL and Balad).
- **Faction notes:** 3.
- **Other:** context events, logos, bios IDs and source hashes.

Also: 5 sourcing flags and 1 wording flag. No English Wikipedia in any k15 file. No partisan wording found.

## Non-OK findings

| # | File | JSON path | Current | Correct / proposed | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|
| 1 | `data/raw/k15/national.reviewed.json` → `public/data/k15.json` | `lists` (and `officialSeats`) | Two registered lists absent: **ק "קול הסביבה"** and **ני "מנהיגות יהודית לישראל"** | Add both as `withdrawn: true`, 0 votes, with the notice dates: ק, all four candidates resigned (ranks 1, 3, 4 on 29 Apr 1999; rank 2 on 5 May 1999); ני, its only candidate resigned on 14 May 1999. The candidate notice has 33 lists; the results notice has 31 | WRONG (missing withdrawn lists) | Candidate notice YP 4748 pp. 3044, 3046 (rank 1); YP 4751 p. 3184 (rank 1), https://olaw.org.il/yalkut/yalkut-4751.pdf ; YP 4754 p. 3269 (rank 1), https://olaw.org.il/yalkut/yalkut-4754.pdf | YP 4748: "אות הרשימה: ק / הכינוי: קול הסביבה / 1. קרמר רוני 2. קליין דוד 3. שוגרמן דוד 4. בסעוד שחל"; "אות הרשימה: ני / הכינוי: מנהיגות יהודית לישראל / 1. קרפל מרדכי". YP 4751: "אות הרשימה: ק … המועמדים: מס' 1. רוני קרמר; מס' 3. דוד שוגרמן; מס' 4. שחל מסעוד, ברשימה זו התפטרו ביום י"ג באייר התשנ"ט (29 באפריל 1999). מועמד מס' 2, דוד קליין, התפטר ביום י"ט באייר התשנ"ט (5 במאי 1999). בכך התפטרו כל המועמדים ברשימה זו." YP 4754: "אות הרשימה: ני … המועמד: מס' 1. מרדכי קרפל, ברשימה זו התפטר ביום כ"ח באייר התשנ"ט (14 במאי 1999). בכך התפטרו כל המועמדים ברשימה זו." | 2026-11-06 |
| 2 | `data/raw/k15/national.reviewed.json`, `candidates.reviewed.json`, `elected.reviewed.json`; `data/meta/k15.json`; `data/meta/logos/k15.json`; `data/meta/election-context.json` (`events[id=registered-not-declared-k15-ט]`, its `listId`); `party-lineage.json` (`partners-15-ט`); `parties.json` (`vehicle-15-ט`); `public/data/k15.json` (`15-ט`, agreement `15-agr-2`, bloc lists) | National Union `letters` | `ט` | **`יט`** | WRONG | Results notice YP 4757 pp. 3376–3377; candidate notice YP 4748 p. 3040; agreement notice YP 4755 p. 3305 (all rank 1) | p. 3376: "יט האיחוד הלאומי - מולדת חרות תקומה 100,181"; p. 3377: "(ו) מרשימת האיחוד הלאומי - מולדת חרות תקומה (יט)"; YP 4755: "(2) האיחוד הלאומי מולדת חרות תקומה - יט עם ישראל בעליה בראשות נתן שרנסקי - כן" | 2026-11-06 |
| 3 | same set of files (`15-קף`) | "New Arab" `letters` | `קף` (final form) | **`קפ`** (non-final, as printed) | WRONG | YP 4757 p. 3376; YP 4748 p. 3047; YP 4754 p. 3269 (rank 1) | "קפ הערבי החדש 2,042"; "אות הרשימה: קפ / כינוי הרשימה: הערבי החדש" | 2026-11-06 |
| 4 | `data/raw/k15/candidates.reviewed.json` (`שס` rank 18), `elected.reviewed.json` (`שס` names[16]) → `public/data/k15.json` `15-שס#18.nameHe` | Shas rank 18 | `גאגולה יצחק` | **`גאגולה איסק`**, as both notices print it. The OData `KNS_Person` 485 form "יצחק גאגולה" was substituted silently. If the later form is preferred, record it as a `candidate-notes.json` display note, citing both | WRONG | Candidate notice YP 4748 p. 3048; results notice YP 4757 p. 3378 (rank 1) | p. 3048: "18. גאגולה איסק"; p. 3378: "17. גאגולה איסק" | 2026-11-06 |
| 5 | `data/raw/k15/national.reviewed.json` → `public/data/k15.json`, `parties.json` `vehicle-15-ד` | `ד.nameHe` | `אלתג׳מע אלוטני אלדימוקרטי (בל״ד)` | **`אלתג׳מע אלוחדוי אלדמוקרטי (בל״ד)`** (results notice) | WRONG | YP 4757 pp. 3376–3377 (rank 1); candidate notice YP 4748 p. 3038 reads close to it ("אלת׳גמע אלוחדוי אלדמוקרסי (בל"ד)" at the best zoom available) | p. 3376: "ד אלתג'מע אלוחדוי אלדמוקרטי (בל"ד) 66,103"; p. 3377: "(ד) מרשימת אלתג'מע אלוחדוי אלדמוקרטי (בל"ד)" | 2026-11-06 |
| 6 | as above, `נץ` | `nameHe` (+ `parties.json` `vehicle-15-נץ`) | `מפלגת הנגב` | **`מפלגת נגב`** | WRONG | YP 4757 p. 3376; YP 4748 p. 3044 (rank 1) | "נץ מפלגת נגב 4,324"; "אות הרשימה: נץ / הכינוי: מפלגת נגב" | 2026-11-06 |
| 7 | as above, `קז` | `nameHe` (+ `vehicle-15-קז`) | `מפלגת הקזינו - עזרא טיסונה מוסד ההימורים הישראלי` | **`מפלגת הקזינו - עזרא טיסונה מיסוד ההימורים בישראל`** | WRONG | YP 4757 p. 3376; YP 4748 p. 3046 (rank 1) | "קז מפלגת הקזינו - עזרא טיסונה מיסוד ההימורים בישראל 6,540" | 2026-11-06 |
| 8 | as above, `קף` | `nameHe`, `shortHe` (+ `vehicle-15-קף`) | `ערבי חדש` | **`הערבי החדש`** | WRONG | YP 4757 p. 3376; YP 4748 p. 3047 (rank 1) | "קפ הערבי החדש 2,042" | 2026-11-06 |
| 9 | as above, `קם` | `nameHe` (+ `parties.json` `daam`) | `אירגון הפעולה הדמוקרטי דע״ם` | **`ארגון הפעולה הדמוקרטי דע״ם`** | WRONG (spelling) | YP 4757 p. 3376; YP 4748 p. 3047 (rank 1) | "קם ארגון הפעולה הדמוקרטי דע"ם 2,151" | 2026-11-06 |
| 10 | as above, `ב`, `זך`, `שס` | `nameHe` (+ `parties.json` `nrp`, `shas`, `vehicle-15-זך`) | `המפד״ל - המפלגה הדתית לאומית המזרחי - הפועל המזרחי`; `מורשת אבות בראשות הרב בא-גד`; `ש״ס התאחדות הספרדים העולמית שומרי תורה` | Punctuation as printed: `המפד״ל - המפלגה הדתית לאומית, המזרחי - הפועל המזרחי`; `מורשת־אבות בראשות הרב בא־גד`; `ש״ס - התאחדות הספרדים העולמית שומרי תורה` | WRONG (format) | YP 4757 pp. 3376–3378 (rank 1) | "ב המפד"ל - המפלגה הדתית לאומית, המזרחי - הפועל המזרחי"; "זך מורשת־אבות בראשות הרב בא־גד"; "שס ש"ס - התאחדות הספרדים העולמית שומרי תורה" | 2026-11-06 |
| 11 | `public/data/k15.json` `lists[15-אמת].shortEn` (generator input); `parties.json` `vehicle-15-אמת.names[].nameEn` | One Israel English short name | `Labor–Meimad` | **`One Israel`**. "Labor–Meimad" is the faction's name from 15 May 2001, after Gesher left; it is anachronistic for the 1999 ballot. `shortHe` is already `ישראל אחת` | WRONG | Results notice YP 4757 (rank 1); Knesset OData `KNS_PersonToPosition` PositionID 54, KnessetNum 15 (rank 1), retained `data/raw/k15/knesset-odata-members.json` | YP: "ישראל אחת בראשות אהוד ברק - העבודה גשר מימד"; OData: faction "ישראל אחת" from 1999-06-07, then "העבודה - מימד" from 2001-05-15 | 2026-11-06 |
| 12 | `data/meta/aftermath/k15.json` | `term.endedBy.date`, `.textEn`, `.textHe` (cite `ipu2003`) | `2002-11-11`, "The Knesset set 28 January 2003 for the early election after Sharon initiated dissolution." | The ending act is Sharon's **dissolution of the Knesset with President Katsav's consent on 5 Nov 2002** (Basic Law: The Government 1992, s. 22). On 11 Nov 2002 the Knesset Constitution Committee only decided **not to change** the statutory date, 28 Jan 2003. Proposed: date `2002-11-05`, text "PM Sharon dissolved the Knesset with the President's consent; the election followed on 28 January 2003." The dissolution order's Reshumot publication was not located, so cite the CEC chair's decision and the press | WRONG | CEC chair decision, 3 Mar 2004 (rank 1, hosted on a third-party site): https://lacuna.co.il/posts/election_date/04-1.pdf ; Globes 5.11.2002 (rank 4): https://www.globes.co.il/news/article.aspx?did=632324 ; Haaretz/Walla 11.11.2002 (rank 4): https://finance.walla.co.il/item/307122 ; IDI, The Elections in Israel 2003, intro (rank 2): https://www.idi.org.il/media/5020/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA2003-%D7%9E%D7%91%D7%95%D7%90.pdf | CEC: "בתאריך ל׳ בחשוון תשס״ג (5.11.2002) … הורה ראש-הממשלה אריאל שרון, בהסכמת נשיא-המדינה, על פיזור הכנסת החמש־עשרה. זאת, מכוח סמכותו לפי סעיף 22". Globes: "בשעה 10:00 בבוקר הודיע נשיא המדינה, משה קצב, כי הוא מסכים לבקשתו של אריאל שרון … לפזר את הכנסת". Walla: "ועדת החוקה של הכנסת החליטה היום (שני) כי הבחירות לכנסת ה-16 יתקיימו ב-28 בינואר, כפי שקובע החוק". IDI: "בחמישה בנובמבר הלך שרון לנשיא משה קצב … ביקש ממנו לפזר את הכנסת … לפי סעיף 22" | 2026-11-06 |
| 13 | `data/meta/party-lineage.json`, `data/meta/parties.json` | `sources.k15.sha256` | `87e7add2a362ad72c7ce6bab9fff8f41a0b00c07ffc32089a6cc04216d2fe9fe` | `84cfed841ca367e1d6049d6f762e718dc7c1d2bd8ad78f2ea2b7e27cd3edffe1`, the current `public/data/k15.json`, which all nine family files already carry. `node scripts/validate-families.ts` passes, so these two hashes are not checked | WRONG (stale hash) | `sha256sum public/data/k15.json` | — | 2026-11-06 |
| 14 | `data/meta/aftermath/k15.json` | `gaps[0]`, `gaps[3]` (second half), `gaps[4]` | (0) "Certification date and official first-sitting record not retrieved"; (3) "all Barak-to-Sharon intermediate formal steps remain unfilled"; (4) "Government endDate is the established succession/death date … a dedicated primary tenure source should be added" | Stale. (0) The results notice is retained and dated 25 May 1999 (YP 4757); OData gives the first sitting as 1999-06-07. (3)/(4) OData `PositionID 45` gives Barak as PM from 1999-07-06; his record breaks at **2000-12-12** (his resignation; caretaker afterwards); he is PM to 2001-03-07; Sharon is PM from 2001-03-07. The "death" wording is template text that does not apply | UNSUPPORTED (stale gap) | Knesset OData (rank 1): https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=PositionID%20eq%2045%20and%20(GovernmentNum%20eq%2028%20or%20GovernmentNum%20eq%2029)&$format=json ; YP 4757 cover (rank 1) | PersonID 2226: GovernmentNum 28, 1999-07-06→2000-12-12 and 2000-12-12→2001-03-07; PersonID 482: GovernmentNum 29, from 2001-03-07. YP 4757: "4757 … 25 במאי 1999" | 2026-11-06 |

### Sourcing flags (not counted above)

| File | Path | Issue | Better source reached (rank) |
|---|---|---|---|
| `data/meta/election-context.json` | `pmContests[pm1999].candidates[mordechai,begin,bishara].source` | Withdrawals cite the IDI web page (rank 2). It is correct ("שלושת האחרונים פרשו מהמירוץ במהלך הקמפיין") but undated | **YP 4755 p. 3305** (rank 1), retained: "הודעה בדבר התפטרות מועמדים לראש הממשלה … (1) המועמד עזמי בשארה התפטר ביום א' בסיון התשנ"ט (16.5.1999); (2) המועמד יצחק מרדכי התפטר ביום א' בסיון התשנ"ט (16.5.1999); (3) המועמד בנימין זאב בגין התפטר ביום א' בסיון התשנ"ט (16.5.1999)". Use it and add the date 1999-05-16 |
| `data/meta/k15.json`; `data/meta/aftermath/k15.json` | `blocSchemes[first-government]`; `government.coalition[ג].note` ("left on 1999-09-05") | Coalition membership and UTJ's exit date rest on Hebrew Wikipedia | Day is consistent with Dei'ah veDibur (Degel HaTorah's English weekly, so party-affiliated), 8 Sep 1999: after the turbine moved on Shabbat Nitzavim (4 Sep 1999), "On motzei Shabbos … The next day, party representatives sent a letter to the Prime Minister announcing their resignation from the coalition" (https://chareidi.org/archives5760/succos/positive.htm). Walla 2001 (rank 4) confirms "בספטמבר באותה שנה פרשה סיעת יהדות התורה מהקואליציה". The 75 seats are also confirmed by MERIP and LA Times, 6 Jul 1999. A rank 1–3 dated source for 5 Sep was not reached |
| `data/meta/k15.json` | `lists[*].parties[*].sources` (Labor ranks, Meimad, UTJ split, UAL split) | Hebrew Wikipedia is the only basis for several constituent assignments. All I could check are right: Gesher #3 and #18 (OData "גשר" from 2001-03-07); Begin #1 and Kleiner #4 Herut (OData "חרות - התנועה הלאומית" from 2000-02-01; IDI party page); Tibi #2 Ta'al (OData from 1999-12-21) | IDI party pages (rank 2), e.g. https://en.idi.org.il/israeli-elections-and-parties/parties/national-union : "originally a joint list of three small right-wing parties: Tekuma, Moledet and Herut. Benny Begin was placed at the head of the list" |
| `data/meta/aftermath/k15.json` | `sources.knesset-history` (`kind: "official"`) | Cited through the Jewish Virtual Library mirror | Label it as a mirror, or replace it with OData facts |
| `data/meta/logos/k15.json` | `logos[centre-party-1999].licence` | Commons claims "CC BY-SA 4.0" with author "הספרייה הלאומית" for an NLI ephemera item. The year claim is supported by the Commons description ("Logo of the Centre Party of Israel (1999-2003)"; NLI item 700081877), but the licence is the uploader's assertion, not NLI's | Not re-researched (out of scope) |

### Wording flag

- `aftermath/k15.json` `term.events[october-riots].textEn` reads "Protests and clashes … police killed Arab citizens."
  The cited Knesset history, the Israeli official account, says "riots broke out in the Israeli Arab sector".
  Under the editorial stance, the official term **riots** (מהומות אוקטובר) is the accepted framing. Suggest "Riots
  broke out in Arab communities in Israel; police fire killed Arab citizens", keeping the existing IDI citation.

## Checked and found OK

| Area | What | Source (rank) |
|---|---|---|
| Totals | Date 1999-05-17; registered 4,285,428; votes cast 3,373,748; valid 3,309,416; invalid 64,332 | CBS st27_02 (1): "3,309,416 1.9 78.7 3,373,748 4,285,428 17.5.1999 15"; YP 4757 p. 3376 "סך כל הקולות הכשרים 3,309,416", p. 3377 "מספר הקולות שנמצאו פסולים: 64,332" |
| List votes | All 31 counts match the notice digit for digit; they sum to 3,309,416 | YP 4757 p. 3376 (1) |
| Seats | All 31 `officialSeats` match (total 120). Recomputed independently from the votes (threshold 49,641.24; 15 lists pass; nine agreements; d'Hondt/Bader–Ofer): no mismatch | YP 4757 p. 3377 (1); 1991 and 1973 amendments (1) |
| Letters | 29 of 31 match (exceptions: findings 2, 3) | YP 4757; YP 4748 (1) |
| Names | 23 of 31 `nameHe` match the notice (exceptions: findings 5–10) | YP 4757 (1) |
| Agreements | 9 pairs match, complete: אמת–מרצ, יט–כן, יש–רק, ם–ל, מחל–ב, עם–ו, פ–פז, פה–הד, שס–ג; notice dated 17 May 1999 | YP 4755 p. 3305 (1) |
| Rule set | 1.5% threshold, Bader–Ofer; `il-1992-bader-ofer-1.5`; glossary "1.5% ב-1992–2003" | Retained laws (1) |
| Elected | 119 of 120 names match section 4 (exception: finding 4). The OData opening membership (1999-06-07) has 120 MKs; every app name matches an OData surname, apart from geresh spellings | YP 4757 pp. 3377–3378 (1); OData (1) |
| Not seated | Deri (#1 Shas) resigned 19 May 1999. Begin (#1 NU) absent from section 4. App text "No resignation date … inferred" is accurate: no Reshumot notice found (YP 4757 lists only Deri; YP 4756 cover has none) | YP 4757 p. 3378 (1): "המועמד: מס' 1. אריה מכלוף דרעי … התפטר ביום ד' בסיון התשנ"ט (19 במאי 1999)". Begin announced on 19 May (JTA 20 May 1999, rank 4: https://www.jta.org/1999/05/20/default/begin-resigns-from-knesset-after-11-years-as-lawmaker-2) |
| PM 1999 | Barak 1,791,020; Netanyahu 1,402,474; valid 3,193,494; Barak had more than half the valid votes and was elected under s. 13(a); five registered candidates, three withdrawn | YP 4757 p. 3376 (1): "56.08 … 43.92 … סך כל הקולות הכשרים: 3,193,494 … וקיבל יותר ממחצית הקולות הכשרים"; YP 4748 p. 3049 (1), five names |
| PM 1999 totals | Cast 3,372,952; invalid 179,458 (they reconcile with valid). IDI adds that the invalid count includes 9,826 votes for withdrawn candidates | IDI 1999 p. 8 (2): "בבחירות לראשות הממשלה השתתפו 3,372,952 … נפסלו 179,458 קולות (5.3%) … שהצביעו למועמדים שכבר הסירו את מועמדותם (9,826 קולות)" |
| PM 2001 (`pm2001`, k15) | Date 2001-02-06; Sharon 1,698,077; Barak 1,023,944; valid 2,722,021; invalid 83,917; cast 2,805,938 | YP 4960 p. 1628 (1), retained |
| Government 28 | Number 28; PM Barak; 1999-07-06 → 2001-03-07; Sharon government 29 from 2001-03-07; seven lists, 75 seats; UTJ in the coalition without ministers (no UTJ MK among the OData ministers) | OData PositionID 45 and GovernmentNum 28 (1); JTA 6 Jul 1999 (3) |
| Formation | No recommendation round under the direct-election law (`recommendationsNotApplicable`); 2001 confidence vote 72–21 | Basic Law: The Government 1992 (1); Houston Chronicle (4) |
| Opposition | Eight lists, 45 seats | Arithmetic over YP 4757 |
| Term events | Lebanon withdrawal 2000-05; Camp David 2000-07; Second Intifada 2000-09; October 2000; PM-only election 2001-02-06; Defensive Shield 2002-03-29 → 05-10 | Cited MOD/MFA/Knesset/IDI chronologies (1–2), quotes present |
| `term.end` | 2003-01-28 | IDI 2003 (2) |
| Faction notes | Gesher left One Israel on 2001-03-07; Tibi's Ta'al faction from 1999-12-21; Herut faction (Kleiner) from 2000-02-01 | OData PositionID 54 (1) |
| Context events | `registered-not-declared-k15-שס`, `…-ט` (apart from the list letter, finding 2) | YP 4757 (1) |
| Bios | All 122 bios records carry the correct OData `PersonID`; Deri and Begin are correctly absent from K15 membership | OData (1) |
| Logos | National Union 1999 (Commons: "סמליל מפלגת "האיחוד הלאומי" (בחירות 99)"); Centre Party (Commons: "1999-2003", NLI 700081877). Both claims match their evidence | Commons API, live |
| Source hashes | `k15-results-gazette`, `k15-candidates-gazette`, `k15-agreements-gazette` match their retained files; the nine family files carry the current dataset hash | `sha256sum` |
| English Wikipedia | None in any k15 data file or in `public/data/k15.json` | grep |

### Observations (not findings)

- `aftermath.term.candidatesPending[Ze'evi]`: OData gives Rehavam Ze'evi's membership ending **2001-10-17** and Uri
  Ariel entering on 2001-10-17. That is a rank 1 direct dated record that could promote the event.
- The candidate notice prints Edelstein as "אדלשטיין יולי-יואל" (with a hyphen); the results notice prints "יולי
  יואל". The app keeps the candidate form, and the difference is already recorded in `candidates.reviewed.json`.
- The 6 July 1999 confidence tally (75–29, UPI caption) remains held out, as the gap says. ABC (7 Jul 1999) and
  MERIP give no tally.
- I created a gitignored `node_modules` symlink to run the read-only validator and removed it afterwards.
