# Data audit k06 (2 November 1965, 6th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `68b836a` (contains `53cca36`). Every source
below was accessed on 2026-11-06. Method: [BRIEF.md](BRIEF.md) with [source-hierarchy.md](../source-hierarchy.md).
No data was edited and no build was run.

Primary documents were read as page images, not OCR. The retained scans were decoded losslessly (CCITT → PNG) and
read at full or 2–3× zoom:

- YP 1230 (results notice, pp. 311–313), `data/raw/research/k06-results.pdf`, sha256 `44d56ab6…`;
- YP 1222 (approved candidate lists, pp. 113–142), `data/raw/research/k06-candidates.pdf`, sha256 `c9268c72…`;
- YP 1225 (connection notice, p. 189), `data/raw/k6/agreements.pdf`, sha256 `73f7d7ba…`.

URLs (all rank 1): results https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-results.pdf;
candidates https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-cand.pdf;
YP 1225 https://olaw.org.il/yalkut/yalkut-1225.pdf.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 355 | Counted per field: 6 national facts (date, Knesset number, registered, cast, valid, invalid); 17 list votes; 17 seat counts; 14 ballot letters; 12 list names; 1 connection pair; 1% threshold and full seat reproduction; 119 elected names; 120 Knesset person IDs; Alignment split and opening date; 11 government/formation facts; 15 recommendation facts; 5 term facts; 1 context event; 2 logos; 10 dataset hashes; 1 rule-set statement |
| WRONG | 13 | 3 ballot letters, also used in the connection pair, ids and docs (#1); 5 list names (#2–#6); 1 elected name (#7); PM tenure skips the acting PM (#8); a decision record repeats the letter error (#9); join dates in a bloc note (#10); 2 stale aftermath gaps (#11–#12); stale hash in parties.json (#13) |
| UNSUPPORTED | 6 | Two satellite lists counted in the coalition on Hebrew Wikipedia alone (#14); Gahal constituent split on Hebrew Wikipedia alone (#15); Rafi logo marked `verified` on a 2018 reconstruction (#16); coalition tabulation omits the Independent Liberals minister (#17); recommendation-round dates (#18); satellite bloc scheme on Hebrew Wikipedia alone (#19) |
| UNVERIFIABLE | 2 | Government 14 abstention count, where OCR reads the digit as "ו" (#20); whether any later corrigendum to YP 1230 exists (#21) |
| DISPUTED | 0 | |

Main points:

- **The official results notice is retained** and is YP 1230 (12 Nov 1965), "הודעה על תוצאות הבחירות לכנסת
  השישית". It is signed by Moshe Landau on "י״ד בחשון תשכ״ו (9 בנובמבר 1965)". Every vote, seat and elected name was
  checked against it.
- **All votes, seats and national totals are correct.** The 17 list votes sum to 1,206,728, matching the gazette's
  printed total and CBS table 27.2. My own largest-remainder run reproduces all 120 gazetted seats: 1% threshold
  12,067.28; כנ, נס, ענ and פש fail it; quota 9,881.86; את+רא combined win 47, split 45/2.
- **Three ballot letters are wrong (H).** The app has כס, עס and סס where YP 1230, YP 1222 and YP 1225 all print
  **כנ, ענ and פש**. Decision 0069a explicitly rejected the correct reading of כנ.
- **Four list names have a wrong or missing word, and one mixes two spellings.** The worst: list ענ is shown as
  "רשימת תנועת לאורה" (English "Reshimat Tnuat Leora"). Both notices print **"רשימת התנועה לאחוה"**.
- **One elected name is wrong:** NRP #11 is "דיין יחיא שבתי". Both notices print **"דון יחיא שבתאי"** (Shabtai
  Don-Yihya). The other 119 names match YP 1230 §4, allowing for spelling variants that follow YP 1222 (for
  example אהרון/אהרן, עבדל/עבדול).
- **All 120 Knesset person IDs** in `bios/k6.json` match the OData opening membership of 22 Nov 1965 exactly, with
  none missing and no extras.
- **Withdrawn and cancelled lists.** YP 1222 approves exactly the 17 lists in YP 1230, so none is missing or wrongly
  marked `withdrawn:false`. The disqualified Socialist List (al-Ard) was never approved. It is correctly a context
  event, not a list.
- **Government and confidence votes check out.** Government 13: mandate 4 Kislev 5726 = 28 Nov 1965; confidence
  71–41 on 12 Jan 1966. Government 14: mandate 11 Mar 1969; confidence 84–12 on 17 Mar 1969. The full plenum
  records support all four. The PM tenure, however, skips Yigal Allon's acting premiership (#8).
- No English Wikipedia anywhere: `grep en.wikipedia` = 0 in `data/meta/k6.json`, `aftermath/k6.json`,
  `bios/k6.json`, `logos/k6.json`, `party-links/k6.json` and `public/data/k6.json`.
- No reversed Hebrew parentheses: `כהן (כהנא) קלמן`, `(רפ"י)`, `(מפ"ם)` and `(גח"ל)` are all correctly ordered.
- No partisan wording found.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k6/national.reviewed.json` → `public/data/k6.json`; also `data/meta/k6.json`, `party-links/k6.json`, `parties.json`, `tests/historical-k06.test.ts`, `docs/DATA.md` l.435 | national: `lists[8].letters`, `lists[12].letters`, `lists[13].letters`, `agreements.pairs[1][1]`; meta: `lists[3].letters`, `lists[2].letters`, `lists[5].letters`; public: `lists[14]`, `lists[13]`, `lists[16]` (`id`, `letters`), `agreements[1].members[1]`, `officialSeats` keys | `כס` (Peace), `עס` (Movement for Brotherhood), `סס` (Young Israel); list ids `6-כס`, `6-עס`, `6-סס`; pair `כא–כס` | **`כנ`**, **`ענ`**, **`פש`**; ids `6-כנ`, `6-ענ`, `6-פש`; pair **`כא–כנ`**. A נ/ס and פ/ס misreading: on the same zoomed page, list נס prints its ס clearly differently. | WRONG | YP 1230 p.311 (1); YP 1222 pp.131, 136, 137 (1); YP 1225 p.189 (1) | YP 1230 §1: "כנ רשימת השלום 5,536"; "ענ רשימת התנועה לאחוה 11,244"; "פש ישראל הצעירה תנועת ספרדים ובני עדות מזרח 1,990". YP 1222: "אותיות הרשימה : כנ. הכינוי : רשימת השלום"; "אותיות הרשימה : ענ. הכינוי : רשימת התנועה לאחוה"; "אותיות הרשימה : פש. הכינוי : ישראל הצעירה תנועת ספרדים…". YP 1225: "רשימת השלום, האותיות כנ" | 2026-11-06 |
| 2 | H | `national.reviewed.json`, `data/meta/k6.json` → `public/data/k6.json`; `party-links/k6.json`; `parties.json` | national `lists[12].nameHe`; meta `lists[2].nameHe`, `lists[2].englishName.label`; public `lists[13].nameHe`, `.shortHe`, `.shortEn`; `party-links` `lists["6-עס"][0].titleHe` | `רשימת תנועת לאורה`; English "Reshimat Tnuat Leora" | **`רשימת התנועה לאחוה`** (transliteration e.g. "Reshimat HaTnua LeAhva"). The list does not appear in YP 1230 §3–§4, so no seats are involved. | WRONG | YP 1230 p.311 (1); YP 1222 p.136 (1) | YP 1230: "ענ רשימת התנועה לאחוה 11,244"; YP 1222: "ענ. הכינוי : רשימת התנועה לאחוה" (8 candidates follow, headed "גבאי עזרא") | 2026-11-06 |
| 3 | M | `national.reviewed.json` → `public/data/k6.json`; `families/arab-arab-jewish.json`; `party-links/k6.json` | national `lists[6].nameHe`; public `lists[10].nameHe`; family `elections[k6].members[2].nameHe` | `שיתוף ואחווה` | **`השיתוף והאחוה`**, as the official name in all three places it is printed. The modern spelling may stay as `shortHe`. | WRONG | YP 1230 pp.311, 312, 313 (1); YP 1222 p.128 (1) | YP 1230 §1: "יא השיתוף והאחוה 16,464"; §4(ז): "מרשימת השיתוף והאחוה — יא"; YP 1222: "אותיות הרשימה : יא. הכינוי : השיתוף והאחוה" | 2026-11-06 |
| 4 | M | `national.reviewed.json`, `data/meta/k6.json` → `public/data/k6.json` | national `lists[0].nameHe`; meta `lists[0].nameHe`; public `lists[0].nameHe`; every family/joint-facts copy | `רשימת המערך לאחדות פועלי ישראל, מפלגת פועלי ארץ-ישראל, מפלגת אחדות העבודה פועלי ציון ובלתי מפלגתיים` | **`רשימת המערך לאחדות פועלי ארץ-ישראל, מפלגת פועלי ארץ-ישראל, מפלגת אחדות העבודה—פועלי ציון ובלתי מפלגתיים`**: "ארץ" is missing from the first clause, and the dash before פועלי ציון is dropped | WRONG | YP 1230 p.311 and §3 p.312 (1); YP 1225 p.189 (1) | YP 1230: "רשימת המערך לאחדות פועלי ארץ־ישראל, מפלגת פועלי ארץ־ישראל, מפלגת אחדות העבודה—פועלי ציון ובלתי מפלגתיים"; YP 1225: "המערך לאחדות פועלי ארץ־ישראל, מפלגת פועלי ארץ ישראל, מפלגת אחדות העבודה — פועלי ציון ובלתי מפלגתיים" | 2026-11-06 |
| 5 | L | `national.reviewed.json`, `data/meta/k6.json` → `public/data/k6.json` | national `lists[8].nameHe`; meta `lists[3].nameHe`, `englishName.label`; public `lists[14].nameHe`, `.shortHe`, `.shortEn` | `רשימת שלום`; "Reshimat Shalom" | **`רשימת השלום`**; "Reshimat HaShalom" | WRONG | YP 1230 p.311 (1); YP 1222 p.131 (1); YP 1225 p.189 (1) | "כנ רשימת השלום 5,536"; "הכינוי : רשימת השלום"; "רשימת השלום, האותיות כנ" | 2026-11-06 |
| 6 | L | `national.reviewed.json` → `public/data/k6.json`; `families/arab-arab-jewish.json` | national `lists[15].nameHe`; public `lists[8].nameHe`; family `members[1].nameHe` | `קידמה ופתוח`, a hybrid matching no official printing | YP 1230 (the results notice) prints **`קדמה ופיתוח`**; YP 1222 prints `קידמה ופיתוח`; YP 1225 prints `קדמה ופתוח`. Use the YP 1230 form, and note the variants. `shortHe` `קידמה ופיתוח` is fine. | WRONG | YP 1230 pp.311–313 (1); YP 1222 p.141 (1); YP 1225 (1) | YP 1230: "רא קדמה ופיתוח 23,430"; "(יב) מרשימת קדמה ופיתוח — רא"; YP 1222: "ר״א. הכינוי : קידמה ופיתוח"; YP 1225: "רשימת קדמה ופתוח, האותיות רא" | 2026-11-06 |
| 7 | M | `data/raw/k6/rosters.reviewed.json` → `public/data/k6.json` | rosters `lists[ב].candidates[10].nameHe` and `electedNames[10]`; public `lists[2].candidates[10].nameHe` (`6-ב#11`) | `דיין יחיא שבתי` | **`דון יחיא שבתאי`**. Knesset OData PersonID 2272 is "דון-יחיא שבתאי"; `nameEn` "Shabtai Don-Yehiya" is already right. The roster `crossCheck` claim ("visually compared name by name") did not catch this. | WRONG | YP 1222 p.116 (1); YP 1230 p.312 (1); OData (1) `data/raw/k6/knesset-odata-members.json` | YP 1222: ".11 דון יחיא שבתאי … עתונאי"; YP 1230 §4(ב): ".11 דון יחיא שבתאי"; OData: `{'PersonID': 2272, 'LastName': 'דון-יחיא', 'FirstName': 'שבתאי'}` | 2026-11-06 |
| 8 | M | `data/meta/aftermath/k6.json` | `government.primeMinisters` (single entry `to: "1969-03-17"`); `government.changes[0].textEn` | Eshkol PM 1966-01-12 → 1969-03-17 | Eshkol **1966-01-12 → 1969-02-26** (died in office). Add **Yigal Allon, acting PM (ראש הממשלה בפועל), 1969-02-26 → 1969-03-17**. Government 13's end date of 17 Mar 1969 is right. | WRONG | Knesset OData (1) https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2013&$format=json; plenum 17 Mar 1969 (1) https://fs.knesset.gov.il/6/Plenum/6_ptm_252808.pdf | OData: PersonID 2173 (Eshkol) "ראש הממשלה 1966-01-12 → 1969-02-26"; PersonID 2142 (Allon) "ראש הממשלה בפועל 1969-02-26 → 1969-03-17". Plenum: "תוך שעות ספורות אחרי פטירת ראש הממשלה המנוח נבחר ראש הממשלה בפועל" | 2026-11-06 |
| 9 | L | `docs/decisions/0069a-k6-corrected-connection-national-release.md` l.19–21; `docs/DATA.md` l.435; `docs/decisions/0068…` l.7 | text | 0069a reads the second YP 1225 letter as resembling "ג or נ, not ס", but sets it aside because "no 1965 list bears such letters; the Peace List's ballot letters in the results notice are **כס**" | The premise is false: YP 1230 and YP 1222 both print **כנ**. The enlarged reading was right. Correct the decision record (by addendum) and DATA.md to "כא–כנ". | WRONG | YP 1230 p.311 (1); YP 1222 p.131 (1) | "כנ רשימת השלום"; "אותיות הרשימה : כנ." | 2026-11-06 |
| 10 | L | `data/meta/k6.json` | `blocSchemes[0].notes[1]` | "Rafi joined on 1 June 1967 and Gahal on 5 June 1967 (Hebrew Wikipedia, הכנסת השישית)" | Both joined together. The official appointment start for all three new ministers is **1967-06-05**: Dayan (Rafi), and Begin and Yosef Sapir (Gahal). The government decision was taken on 1 June. Use one date for both, from the rank 1 record. | WRONG | Knesset OData (1), URL as #8 | PersonID 2277 (Dayan) "שר הביטחון 1967-06-05"; 2179 (Begin) "שר בלי תיק 1967-06-05"; 2512 (Y. Sapir) "שר במשרד ראש הממשלה 1967-06-05" | 2026-11-06 |
| 11 | L | `data/meta/aftermath/k6.json` | `gaps[4]` | "Six-Day War is dated only to 1967 here; a direct chronology with the opening and closing days has not been transcribed." | Remove (stale). `term.events[six-day-war]` has `date 1967-06-05`, `endDate 1967-06-10`, cited to CFR and the UN S/7930/Add.2. | WRONG | Internal | `"date": "1967-06-05" … "endDate": "1967-06-10"` | 2026-11-06 |
| 12 | L | `data/meta/aftermath/k6.json` | `gaps[0]` | "Official result-certification date and the first sitting are not transcribed" | Both are now available. The retained YP 1230 notice is signed **9 Nov 1965**, published 12 Nov 1965. The first sitting was **22 Nov 1965** (the OData opening StartDate, already in `knesset-odata-members.json` and joint-facts `openingDate`). | WRONG | YP 1230 p.313 (1); OData (1) | "י״ד בחשון תשכ״ו (9 בנובמבר 1965) משה לנדוי יושב ראש ועדת הבחירות המרכזית לכנסת השישית"; OData StartDate "1965-11-22" | 2026-11-06 |
| 13 | L | `data/meta/parties.json` | `sources.k6.sha256` | `750331fe…` | `ad32bb4902bc523b3b15bff896a87c2c7b949f9724ed0e06fb13b34f07020aae`, the current `public/data/k6.json`. Systemic: all 26 `sources.kN.sha256` in parties.json are stale. The 9 family files and party-lineage.json are current. | WRONG | Internal (`sha256sum public/data/k6.json`) | — | 2026-11-06 |
| 14 | M | `data/meta/k6.json`; `data/meta/aftermath/k6.json` | `blocSchemes[0].blocs[0].members` (contains `רא`, `יא`) and `.seats` 75; `government.coalition`, `coalitionSeats` 75 | Coalition = 7 lists, 75 seats, with the two Arab satellite lists counted in. Hebrew Wikipedia is the only source for them. | Eshkol's own statement to the Knesset names **five** coalition factions: Alignment, NRP, Mapam, Independent Liberals and Poalei Agudat Yisrael, i.e. **71 seats**, which equals the 71 confidence votes. Show רא and יא as supporting satellite lists, not coalition members, or label them clearly and keep 71 as the coalition figure. | UNSUPPORTED (Hebrew WP sole basis, against a rank 1 statement) | gov13.pdf (1) https://main.knesset.gov.il/mk/government/documents/gov13.pdf; plenum 12 Jan 1966 (1) https://fs.knesset.gov.il/6/Plenum/6_ptm_252623.pdf | "הודעתי … על הרכבת ממשלה חדשה הכוללת את הסיעות: המערך לאחדות פועלי ארץ ישראל, המפלגה הדתית-לאומית, מפלגת הפועלים המאוחדת, המפלגה הליברלית העצמאית ומפלגת פועלי אגודת ישראל. אקווה … כי הסיעות שאינן משתתפות בממשלה…" | 2026-11-06 |
| 15 | L | `data/meta/k6.json` | `lists[1].parties[*].sources` (חל: herut ranks 1,3,…,21,23–26; liberal 2,…,22) | Hebrew Wikipedia is the only source; the split is 15 Herut and 11 Liberals | Plausible, and consistent with OData (one faction "גוש חרות ליברלים" for all 26), but no rank 1–4 source was cited or found in this pass. The Alignment split, by contrast, is corroborated by IDI's annotated YP 1222 scan (מא/א marks; rank 21 Haktin marked א). | UNSUPPORTED (Hebrew WP sole) | IDI scan (2) https://www.idi.org.il/media/7012/כנסת-6-מערך.pdf for the Alignment only | — | 2026-11-06 |
| 16 | L | `data/meta/logos/k6.json` | `logos[0]` (כא, `logos/rafi-1965.svg`, `status: "verified"`) | Claimed as the 1965 Rafi emblem, status verified | The hosted file (sha256 `59a1d799…`, 2,433 bytes) is the Commons **2022-06-05** "Completing the logo" revision of an **own-work upload dated 2018-09-15** with no cited source. The entry's own `inUseEvidence` admits "without an inspected contemporary artefact". `verified` overstates this; downgrade or withhold. The Alignment and Rakah logos cite NLI ephemera items and are OK. | UNSUPPORTED | Commons raw page and file history https://commons.wikimedia.org/wiki/File:Rafi.svg | "|date=2018-09-15 |source={{own}} |author=[[User:RaphaelQS…]]"; "2022-06-05T18:02:56Z RaphaelQS Completing the logo … 2433" | 2026-11-06 |
| 17 | L | `data/meta/k6.json`; `aftermath/k6.json` | `blocSchemes[0].sources[0].quote`; `government.cites[0].quote` (coalition-1) | "Ministers at swearing-in by their Knesset faction (project tabulation): {'NON-MK': 4, 'מפלגה דתית לאומית': 3, 'מערך': 11}" | The tabulation omits Moshe Kol (Independent Liberals, PersonID 2575, Tourism and Development). OData's faction file gives his faction as "ליברלים עצמאיים". There are 3 distinct non-MK ministers (2662, 2210, 2220), not 4. Regenerate the tabulation. | UNSUPPORTED (quote does not match source) | Knesset OData (1), URL as #8, plus `knesset-odata-members.json` factionMemberships | PersonID 2575 "קול משה" "שר התיירות"/"שר הפיתוח" 1966-01-12; faction "ליברלים עצמאיים" | 2026-11-06 |
| 18 | L | `data/meta/aftermath/k6.json` | `recommendationRounds[0].date` / `.endDate`; `formation.events[0]` | 1965-11-24 → 1965-11-26, citing only the JTA 26 Nov item | The cited JTA item gives no start date. The JTA 24 Nov bulletin says "The President's consultation will start tomorrow", so the start is 24 or 25 Nov depending on dateline. The 26 Nov item ("proposed today") is a bulletin date, not a meeting date. Cite the 24 Nov item and mark the dates approximate. Positions (Gahal and Rafi → Eshkol) and seat counts are OK. | UNSUPPORTED | JTA 24 Nov 1965 (3) https://www.jta.org/archive/israel-president-starts-talks-today-on-formation-of-new-cabinet | "The President's consultation will start tomorrow with a meeting with the Mapai-Achdut Avoda alignment faction." | 2026-11-06 |
| 19 | L | `data/meta/k6.json` | `blocSchemes[1]` (labour-affiliated-arab-lists) | Hebrew Wikipedia is the only source | Widely documented, but cite a rank 1–4 source. IDI party pages or the Knesset faction history would serve. | UNSUPPORTED (Hebrew WP sole) | — | — | 2026-11-06 |
| 20 | L | `data/meta/aftermath/k6.json` | `formation.events[5].votes.abstain` (1) | 1 | The PDF text layer reads "12 נגד ו נמנע", so the digit is OCR'd as "ו". The page image was not rendered. | UNVERIFIABLE | plenum 17 Mar 1969 (1), URL as #8 | "בעד ההצעה להביע אמון 84 … 12 נגד ו נמנע" | 2026-11-06 |
| 21 | L | `data/raw/SOURCES.json` | `k6-results-gazette` | YP 1230 treated as final | I did not search for a later Yalkut corrigendum to YP 1230 (an error class seen elsewhere). None is cited or known. | UNVERIFIABLE | — | — | 2026-11-06 |

Note for the fixer: #1 renames three list ids. `tests/historical-k06.test.ts`, the `officialSeats` keys,
party-links keys, parties.json `listId`s and the k6 family rows will all follow.

## Gaps and observations (not counted)

- **No replacements are shown.** OData records 12 later entrants in Knesset 6:
  - זוארץ פריג'ה, 1965-12-01;
  - דגני עמוס, 1965-12-08;
  - גולן יצחק, 1966-01-11;
  - ארבלי-אלמוזלינו שושנה, 1966-01-17;
  - ורטמן משה, 1966-01-17;
  - כהן-צידון שלמה, 1966-10-16;
  - לין אמנון, 1967-01-28;
  - בהיר אריה, 1967-02-20;
  - ורדיגר אברהם, 1967-12-21;
  - גולומב דוד, 1968-12-09;
  - אליעד נסים, 1968-12-23;
  - אנקוריון ארי, 1969-02-26.

  `candidate-notes.json` has no k6 entries, and rosters stop at the elected prefix. This matches the documented
  policy; it is listed because the brief asks.
- **Faction changes are not reflected.** OData shows the 1968 mergers: Rafi members' "רשימת פועלים ישראלית" faction
  ends on 1968-01-23. Nothing in aftermath records the Israeli Labor Party (Jan 1968) or the Alignment with Mapam
  (Jan 1969). These would be candidate term events.
- **Name spellings.** The candidate gazette (YP 1222) and the results notice (YP 1230) differ in places, e.g.
  `בקר אהרון`/`בקר אהרן`, `אוזן אהרון`/`אוזן אהרן`, `זועבי עבדל-עזיז`/`זועבי עבדול-עזיז`. The roster follows
  YP 1222 by design. #7 is a real misreading, not a variant.
- **`aftermath/k6.json` is `status: "pilot"`** and says it is "not wired into the app". Its facts were audited anyway.
- **IDI hosts an annotated YP 1222 copy** with handwritten מא/א marks:
  https://www.idi.org.il/media/7012/כנסת-6-מערך.pdf. It is a better second source for the Alignment split than
  Hebrew Wikipedia; the data already cites it.

## Checked and found OK

| Item | Value in data | Source (rank) | Evidence |
|---|---|---|---|
| Election date, Knesset number | 1965-11-02, 6 | YP 1230 (1); CBS table 27.2 (1) `data/raw/research/cbs-national-totals-2024.pdf` | CBS: "2.11.1965 6"; YP 1230 title "לכנסת השישית" |
| Registered, cast, valid, invalid | 1,499,709 / 1,244,706 / 1,206,728 / 37,978 | CBS 27.2 (1); YP 1230 §1–§2 (1) | CBS row: "1,206,728 3.1 83.0 1,244,706 1,499,709 2.11.1965 6"; YP 1230: "סה״כ 1,206,728"; "מספר הקולות שנמצאו פסולים: 37,978" |
| 17 list votes | e.g. את 443,379; חל 256,957; ב 107,966; כא 95,328; מ 79,985; לע 45,299; ג 39,795; ו 27,413; רא 23,430; ד 22,066; יא 16,464; ש 14,124; ק 13,617; ענ 11,244; כנ 5,536; נס 2,135; פש 1,990 | YP 1230 p.311 (1) | All 17 read off the page image; the sum equals the printed total |
| 17 seat counts | 45, 11, 4, 2, 3, 26, 2, 10, 5, 8, 1, 2, 1, and 0 for four lists | YP 1230 §3 p.312 (1) | "את 45; ב 11; ג 4; ד 2; ו 3; חל 26; יא 2; כא 10; לע 5; מ 8; ק 1; רא 2; ש 1" |
| 14 ballot letters | את ב ג ד ו חל יא כא לע מ נס ק רא ש | YP 1230 (1); YP 1222 (1) | as printed |
| 12 list names | ב, ג, ד, ו, חל, כא, לע, מ, נס, פש, ק, ש. ש follows YP 1230 §4 "כוח חדש"; §1 prints "כח חדש" | YP 1230 (1); YP 1222 (1) | as printed |
| Connection את–רא | `agreements[0]` | YP 1225 p.189 (1) | "(1) המערך … האותיות את עם רשימת קדמה ופתוח, האותיות רא"; signed 19 Oct 1965 |
| 1% threshold, largest remainder, `il-1951-largest-remainder-1` | `ruleSetId` | Elections Law 1959 as cited in YP 1230 (1); own computation | Recomputed: 12 lists pass, quota 9,881.86, all 120 seats match |
| 119 elected names | all except #7 | YP 1230 §4 pp.312–313 (1) | compared name by name |
| 120 Knesset person IDs | `bios/k6.json` | OData (1) | set-equal to the 120 opening members (StartDate 1965-11-22) |
| Alignment split, Mapai 36 / Ahdut HaAvoda 9; joint-facts `openingDate` 1965-11-22 | `k6.json lists[0]`; `joint-facts.json` | IDI annotated YP 1222 (2); OData (1) | handwritten "א" against ranks 3, 6, 11, 17, 21, 26 on p.113; the rest from the following pages, not re-read |
| Government 13: number, start 1966-01-12, PM Eshkol, 5 ministerial factions | `blocSchemes[0]`, `aftermath.government` | gov13.pdf (1); OData (1) | "הישיבה העשרים-ואחת … כ׳ בטבת תשכ״ו (12 ינואר 1966)"; Kahana (PAI) deputy minister from 1966-01-17 |
| Mandate to Eshkol, 1965-11-28 | `formation.events[1]` | gov13.pdf (1) | "ביום ד׳ בכסלו תשכ״ו הטיל עלי נשיא המדינה…" (4 Kislev 5726 = 28 Nov 1965; 5726 is a 353-day year) |
| Extension, Dec 1965–Jan 1966 | `formation.events[2]` | gov13.pdf (1) | "ביום א׳ בטבת וביום ט״ו בטבת מסרתי לנשיא דין-וחשבון … הנשיא הואיל להאריך" |
| Confidence 71–41, 12 Jan 1966 | `formation.events[3]` | plenum 6_ptm_252623 (1) | "ברוב של 71 נגד 41 הביעה הכנסת אמון לממשלה" |
| Government 14: mandate 1969-03-11; confidence 84–12 on 1969-03-17; PM Meir | `formation.events[4–5]`, `government.changes[0]` | plenum 6_ptm_252808 (1); OData (1) | "ביום כ״א באדר תשכ״ט 11 במארס 1969 הטיל עלי … להרכיב ממשלה"; "בעד … 84 … 12 נגד"; Meir PersonID 2448 PM from 1969-03-17 |
| Recommendations: Gahal (26) and Rafi (10) → Eshkol; other 11 lists unknown; seat counts | `recommendationRounds[0].entries` | JTA 26 Nov 1965 (3) | "the Gahal combination of Herut and Liberals and … Rafi … proposed today to President Zalman Shazar that he entrust the formation of a new Cabinet to Premier Levi Eshkol" |
| Term events: military administration ended in 1966; Six-Day War 5–10 Jun 1967; national unity government June 1967 | `term.events` | Knesset history via JVL; IDI; MFA; CFR; UN (2–3) | as cited; the dates agree with OData's 1967-06-05 appointments |
| Term end and `endedBy` regular election 1969-10-28 | `term` | IDI (2); IPU (2) | "28.10.1969"; "upon the normal expiry of the previous legislature" |
| Context: Socialist List disqualified; appeal rejected | `election-context.json eligibility-final-k6-0` | IDI (2) https://www.idi.org.il/articles/65951 | "1965 רשימת הסוציאליסטים הערעור נדחה"; "בית המשפט העליון קיבל את החלטת הוועדה בפסק דין ירדור" |
| Logos: Alignment `את`, Rakah `ו` | `logos/k6.json [1], [2]` | Commons pages citing NLI ephemera 700094557 / 700098530 (provenance) | "Logo of the First Alignment (1965-68) …"; "Logo of the New Communist List, or Rakah, from 1965" |
| Dataset hashes | 9 family files and `party-lineage.json` `sources.k6` = `ad32bb49…` | Internal | equal to the current `public/data/k6.json` |
| Rakah link target | `party-links 6-ו` → he.wikipedia המפלגה הקומוניסטית הישראלית | Hebrew WP (5) | `רק"ח` redirects there, to the section "1965–1989: רק"ח" |
| Withdrawn lists | none | YP 1222 (1) vs YP 1230 (1) | same 17 lists in both |
