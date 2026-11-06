# Data audit k01 (25 January 1949, Constituent Assembly / 1st Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `bad7f8f` (contains `53cca36`; `origin/main`
is an ancestor). Accessed: 2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build or test run.

Primary documents read page by page (rendered at 150–600 dpi from the retained PDFs):

- **Results notice**: עיתון רשמי 49, 7 Feb 1949, pp. 400–402, "הודעה על תוצאות הבחירות לאסיפה המכוננת"
  (`data/raw/research/k01-results.pdf` = https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-results.pdf).
- **Candidate notice**: עיתון רשמי 43, 19 Jan 1949, pp. 316–329, "פרסום רשימות המועמדים"
  (`data/raw/research/k01-candidates.pdf` = https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-cand.pdf).
- **CEC calculation appendix** (`data/raw/k1/allocation-appendix.pdf`), PDF pp. 6 and 11.
- **CBS table 27.2** (`data/raw/research/cbs-national-totals-2024.pdf`).
- **Knesset plenum records**: sitting 12, 10 Mar 1949 (https://fs.knesset.gov.il/1/Plenum/1_ptm_250182.pdf, including
  the full roll call); sitting 186, 1 Nov 1950 (https://fs.knesset.gov.il/1/Plenum/1_ptm_250247.pdf); gov4.pdf
  (https://main.knesset.gov.il/mk/government/documents/gov4.pdf).
- **Fresh Knesset OData pull**: `KNS_PersonToPosition?$filter=KnessetNum eq 1 and (PositionID eq 43 or PositionID eq 61)`,
  130 rows over 2 pages.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 421 | Counted per field: 6 national facts; 21 lists × letters, name, votes, seats (84); 21 withdrawn statuses; 5 connections; seat reproduction; 2 UI threshold statements; 114 of 120 elected names; 6 of 8 not-seated names; 120 Knesset person IDs; 17 joint-list party assignments; 6 government-1 facts; 9 formation steps; 1 recommendation round; 3 term facts; 1 context event; 1 status note; 9 logo year claims; 9 dataset hashes; 6 other |
| WRONG | 14 | 6 elected-member names and 2 not-seated names differ from both gazettes (#1–7, #13); one English-name formatting slip (#14); WIZO and Yemenites shown as opposition although they voted confidence (#8); 2 stale aftermath gaps (#9–10); 6 broken logo source links (#11, one finding); stale `parties.json` hash (#12) |
| UNSUPPORTED | 3 | Consultation date cites only the "tomorrow" bulletin; support-list membership rests on Hebrew Wikipedia when the roll call is available; anachronistic "המערך" in a 1949 bloc name |
| UNVERIFIABLE | 0 | |
| DISPUTED | 0 | IDI's per-list figures differ for two lists, but the rank-1 gazette and CBS settle it (see observations) |

Main points:

- **Results are correct and complete.** All 21 list votes and seats match the gazette table (p. 400). The votes sum to
  434,684, which equals CBS's valid votes. CBS gives registered 506,567 and votes cast 440,095, and the gazette gives
  invalid 5,411 (440,095 − 434,684 = 5,411). The five connections (ב–ל, ט–יג, יא–יד, מ–ת, ס–צ) match the CEC appendix
  (p. 5). The CEC's own division (p. 9) gives ב–ל 17 seats, split 16 + 1. My own calculation reproduces all 120 seats:
  highest averages among lists that reached one quota, with the eligible connections, and no list differs from the
  gazette.
- **No withdrawn-list error.** The candidate notice prints exactly the 21 lists the app shows: א ב ג ח ט יא יג יד טו
  יח יט ל מ נ ס פ פד צ ק ש ת. IDI also says "מבין 21 הרשימות שהתמודדו". All `withdrawn:false` values are correct.
- **All 120 opening members are correct identities.** A fresh OData pull gives 120 members starting 1949-02-14. Their
  PersonIDs equal the 120 `knessetPersonId`s of seated candidates in `bios/k1.json`, with none missing and none
  extra. The withdrawal mapping (Mapai 10, 12, 13, 29; Herut 10, 15, 16; Progressives 3) matches the gazette's
  explicit section 32(ב) notes.
- **But 8 printed names differ from both gazettes.** Three are on the Herut list (#4's birth name, and the names of
  the not-seated #10 and #16). The others are Sheetrit, Kaptan-Gil, Ben-Gurion's dropped maqaf, Landau's
  parenthesis and al-Zoubi's dropped surname (findings 1–7 and 13).
- **Formation and government facts are confirmed by the primary plenum record**: the 73–45 confidence vote of 10 Mar
  1949, the 69–42–2 vote of 1 Nov 1950, the mandate of 24 Feb 1949 (כ"ה שבט), and resignations on 16 Oct 1950 and
  14 Feb 1951. The roll call shows that WIZO and the Yemenite Association voted **for** government 1, but the app
  lists them as opposition (finding 8).
- There is **no English Wikipedia** in any k1 file (`grep en.wikipedia` = 0 in `data/meta/k1.json`,
  `aftermath/k1.json`, `bios/k1.json`, `logos/k1.json`, `party-links/k1.json`, `public/data/k1.json` and
  `data/raw/k1/*.json`). **No reversed parentheses** were found in any name, but Landau's parenthesis is misplaced
  (#7).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).
"Both gazettes" means the candidate notice (עיתון רשמי 43) and the results notice (עיתון רשמי 49), both rank 1, with
the URLs given above. `rosters.reviewed.json` is the input; `public/data/k1.json` is what the app shows.

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M | `data/raw/k1/rosters.reviewed.json` → `public/data/k1.json` | rosters `lists[letters="ח"].candidates[3]` and `.electedNames[3]`; public `lists[id="1-ח"].candidates[3].nameHe` (`1-ח#4`) | `בןאליעזר (רובובסקי) אריה` | `בן-אליעזר (זברובסקי) אריה`. The birth name is **זברובסקי**, not רובובסקי, and the maqaf (hyphen) is missing. | WRONG | Candidate notice p. 319 (1); results notice p. 401 (1) | Cand.: "4. בן־אליעזר (זברובסקי), אריה (1913), עובד, תל־אביב"; Results: "4. בן־אליעזר (זברובסקי), אריה" | 2026-11-06 |
| 2 | M | same files | rosters `lists[ח].candidates[9]`; public `1-ח#10` `.nameHe`; public `lists[1-ח].notesHe[0]` | `שוינשל ד״ר אברהם` | `ווינשל ד״ר אברהם` (Dr Abraham Weinshall). The results notice prints "לאחר **ש**ווינשל", i.e. "after Weinshall". The transcription merged the conjunction ש into the surname. | WRONG | Candidate notice p. 319 (1); results notice p. 401 (1) | Cand.: "10. ווינשל ד"ר, אברהם (1893), עורך־דין, חיפה"; Results: "לאחר שווינשל ד"ר אברהם, רובין מאיר, ודאהן מ. משה התפטרו" | 2026-11-06 |
| 3 | M | same files | rosters `lists[ח].candidates[15]`; public `1-ח#16` `.nameHe`; public `lists[1-ח].notesHe[2]` | `כהן מ׳ משה` | `דאהן מ׳ משה`. Both gazettes print דאהן; the results notice has "ודאהן" ("and Dahan"). | WRONG | Candidate notice p. 319 (1); results notice p. 401 (1) | Cand.: "16. דאהן, מ. משה (1889), סוחר, ירושלים, רח׳ הרצל"; Results: "…רובין מאיר, ודאהן מ. משה התפטרו" | 2026-11-06 |
| 4 | M | same files | rosters `lists[ס].candidates[0]`, `.electedNames[0]`; public `1-ס#1` `.nameHe` | `שיטרית בכור שלום` | `שטרית בכור שלום`. Both gazettes print it without the yod. bios already links "בכור-שלום שטרית". | WRONG | Candidate notice p. 324 (1); results notice p. 402 (1) | Cand.: "1. שטרית, בכור שלום (53), עו"ד, תל־אביב"; Results: "1. שטרית, בכור שלום" | 2026-11-06 |
| 5 | M | same files | rosters `lists[צ].candidates[5]`, `.electedNames[5]`; public `1-צ#6` `.nameHe` | `קסטן גיל (ליפשיץ) יעקב` | `קפטן גיל (ליפשיץ) יעקב`. Both gazettes print **קפטן** (Captain). | WRONG | Candidate notice p. 327 (1); results notice p. 402 (1) | Cand.: "6. קפטן גיל (ליפשיץ), יעקב (40), עובד רמחל חנוך"; Results: "6. קפטן גיל (ליפשיץ), יעקב" | 2026-11-06 |
| 6 | L | same files | rosters `lists[א].candidates[0]`, `.electedNames[0]`; public `1-א#1` `.nameHe` | `בןגוריון דוד` | `בן-גוריון דוד` (or `בן־גוריון`). The maqaf was dropped in transcription; other entries keep the hyphen (`בן-צבי`, `בן-אשר`). | WRONG | Candidate notice p. 316 (1); results notice p. 400 (1) | Cand.: "1. בן־גוריון, דוד (1887), ראש הממשלה ושר הבטחון"; Results: "1. בן־גוריון, דוד" | 2026-11-06 |
| 7 | L | same files | rosters `lists[ח].candidates[7]`, `.electedNames[7]`; public `1-ח#8` `.nameHe` | `לנדאו (הנריך) חיים` | `לנדאו חיים (הנריך)`. The parenthesis is an alternative given name, so it follows חיים, in the same pattern the app already uses for `באדר ד״ר יוחנן (יאן)`. | WRONG | Candidate notice p. 319 (1); results notice p. 401 (1) | Cand.: "8. לנדאו, חיים (הנריך) (1916), עובד, רמת־גן"; Results: "8. לנדאו, חיים (הנריך)" | 2026-11-06 |
| 8 | M | `data/meta/k1.json` → `public/data/k1.json`; `data/meta/aftermath/k1.json` | `blocSchemes[id="first-government"].blocs[id="opposition"].members` (letters נ, ל); `.notes[0]`; aftermath `government.coalition`, `.coalitionSeatsNote` | נ (WIZO, 1) and ל (Yemenite Association, 1) are listed as **opposition**. The scheme's own definition is "lists that joined **or supported** the government at its formation". Support-only lists are said to "rest on Hebrew Wikipedia". | On 10 Mar 1949 both voted **for** government 1. The roll call adds up exactly: for = Mapai 45 (Ben-Zvi absent) + URF 16 + Progressives 4 (Granovsky absent) + Sephardim 4 + Nazareth 2 + WIZO 1 + Yemenites 1 = 73; against = Mapam 19 + Herut 14 + GZ 7 + Maki 4 + Fighters 1 = 45. Either move נ and ל to a "supported without ministers" group, or redefine the scheme as "parties in the government" and note their supporting votes. Cite the roll call for the Nazareth list's support instead of Hebrew Wikipedia. | WRONG | Knesset plenum, sitting 12, 10 Mar 1949 (1) https://fs.knesset.gov.il/1/Plenum/1_ptm_250182.pdf | Roll call: "בעד (כהן רחל) ויצ"ו"; "בעד (גלוסקא זכריה) התימנים"; "סיף-אלדין מחמד מעיד … בעד (נצרת) הרשימה הדמוקראטית של"; "ג'רגורה אמין סלים … בעד"; "נעדר (בן-צבי יצחק) מפא"י"; "נעדר (גרנובסקי אברהם) המפלגה הפרוגרסיבית"; result: "הביעה הכנסת הראשונה ב־73 קולות נגד 45 … אמונה בממשלה" | 2026-11-06 |
| 9 | L | `data/meta/aftermath/k1.json` | `gaps[0]` | "Official result-certification date and the first sitting are not transcribed" | Stale. The results notice is signed "ח׳ בשבט תש״ט (7 בפברואר 1949)" by M. Dunkelblum (chair) and D. Bar-Rav-Hai (deputy chair). The first sitting is 14 Feb 1949: all 120 opening OData rows have StartDate 1949-02-14. | WRONG | Results notice p. 402 (1); Knesset OData (1) `KNS_PersonToPosition?$filter=KnessetNum eq 1 and (PositionID eq 43 or PositionID eq 61)` | "ח׳ בשבט תש״ט (7 בפברואר 1949) ועדת הבחירות המרכזית לאסיפה המכוננת מ. דונקלבלום יושב ראש"; OData: 120 rows "StartDate": "1949-02-14T00:00:00" | 2026-11-06 |
| 10 | L | `data/meta/aftermath/k1.json` | `gaps[5]` | "Replacement-coalition snapshots are partial: government 14's faction splits and current seat counts require a separate audit…" | Remove. This is template text from another election: k1 has governments 1–2 only, and `changes[1].coalition` is complete for government 2. `gaps[7]` also repeats `gaps[3]`. | WRONG | Internal (`government.changes` holds governments 1 and 2 only) | n/a | 2026-11-06 |
| 11 | L | `data/meta/logos/k1.json` (→ `public/data/k1.json` `lists[].logo.sourceUrl`) | `logos[2..7].sourceUrl` (ג, יח, ת, פד, יג, ט) | e.g. `https://commons.wikimedia.org/wiki/Hatzohar_1949.png` | `https://commons.wikimedia.org/wiki/File:Hatzohar_1949.png` (the `File:` namespace is missing; same for `Haredi_List.png`, `Popular_Arab_Bloc.png`, `Working_and_Religious_Women_List.png`, `Yitzhak_Gruenbaum_List.png`, `For_Jerusalem_List.png`). The same pattern occurs 30 times across `data/meta/logos/*.json`. | WRONG | HTTP check (provenance) | `404 https://commons.wikimedia.org/wiki/Hatzohar_1949.png`; `404 …/wiki/Haredi_List.png`; `200 …/wiki/File:Hatzohar_1949.png` | 2026-11-06 |
| 12 | L | `data/meta/parties.json` | `sources.k1.sha256` (locator `public/data/k1.json`) | `b14a976b23503fd665236fbd488c44f61edf04823ccff56badc25e91b5c52a90` | `11ae6547993e3607a659a89e318084f41d0345bc47cd22d1af5525648cf4f230` (current file; equal to `party-lineage.json` and all 8 family files that cite k1). All 26 election hashes in `parties.json` are stale. | WRONG | `sha256sum public/data/k1.json` | n/a | 2026-11-06 |
| 13 | L | `data/raw/k1/rosters.reviewed.json` → `public/data/k1.json` | `1-יד#1` `.nameHe` | `אלזועבי סיף-אלדין-מחמד סעיד` | `אלזועבי סיף-אלדין-מחמד סעיד אלזועבי`. The trailing family name is dropped, although the list's #2 keeps its trailing `ג׳רג׳ורה`. | WRONG | Candidate notice p. 321 (1); results notice p. 401 (1) | Cand.: "1. אלזועבי, סיף־אלדין־מחמד סעיד אלזועבי (1913), חקלאי"; Results: "1. אלזועבי, סיף־אלדין־מחמד סעיד אלזועבי" | 2026-11-06 |
| 14 | L | `public/data/k1.json` (English-name input) | `1-מ#10` `.nameEn` | `"Berl   Repetur"` (three spaces) | `"Berl Repetur"` | WRONG | Internal formatting | n/a | 2026-11-06 |
| 15 | L | `data/meta/aftermath/k1.json` | `recommendationRounds[0].date`, `.cites`; `formation.events[0]` (1949-02-22) | Date supported only by JTA, 21 Feb 1949: "invited … to consult with him **tomorrow**". The date depends on the bulletin dateline. | Keep 1949-02-22 but cite the direct report: JTA, 23 Feb 1949 (datelined the previous day), "President Weizmann **today began** negotiations… Other parties whose representatives saw President Weizmann today were the Mapai, Religious Bloc, General Zionists and Progressives." The project's own research note already uses it. | UNSUPPORTED | JTA (3) https://www.jta.org/archive/weizmann-sees-party-lesders-on-new-govt-mapam-outlines-conditions-for-participation | "February 23, 1949 … President Weizmann today began negotiations with the various Israeli parties represented in the Constituent Assembly on the formation of a Cabinet." | 2026-11-06 |
| 16 | L | `data/meta/k1.json` → `public/data/k1.json` | `blocSchemes[id="first-government"].sources[1]`, `.notes[0]` | Coalition and opposition membership of the non-ministerial lists rests on Hebrew Wikipedia only. | A rank-1 source is reachable: the roll call (finding 8). Keep Hebrew Wikipedia only as a labelled secondary source. | UNSUPPORTED (Hebrew WP sole basis) | Plenum 10 Mar 1949 (1), as #8 | as #8 | 2026-11-06 |
| 17 | L | `data/meta/k1.json` → `public/data/k1.json` | `blocSchemes[id="labour-affiliated-arab-lists"].nameHe` / `.nameEn` | `מפא"י/המערך והרשימות הערביות המסונפות אליה` / "Mapai/Alignment and…" | For 1949, "מפא"י והרשימות הערביות המסונפות אליה". The Alignment (המערך) did not exist until 1965. The bloc's own label is already correct ("מפא"י ורשימות הלוויין"). | UNSUPPORTED (anachronism) | IDI 1965 (2) https://www.idi.org.il/policy/parties-and-elections/elections/1965/ | (Alignment first ran in 1965) | 2026-11-06 |

## Observations (not counted above)

- **IDI's per-list table differs from the gazette for two lists**: IDI gives הגוש העובד 3,205 and רשימת היהדות
  המסורתית 241, while the gazette prints 3214 and 239 (checked at 300 dpi). The gazette figures sum exactly to CBS's
  434,684 valid votes; IDI's do not (434,677). So the rank-1 sources settle it and the app is right. The fixer may
  want to add a one-line note naming the IDI difference, since the source policy says "record a disagreement".
  Source: `data/raw/research/idi-1949.html`, "הגוש העובד 3,205 … רשימת היהדות המסורתית 241".
- **Withdrawal notes could be more precise.** `notesHe` on 1-א, 1-ח and 1-פ say the candidate "אינו מופיע בין
  הנבחרים… המנדט עבר למועמד הבא". The results notice states positively that they **resigned** ("התפטרו", under
  section 32(ב)), and names the replacement (e.g. "רזיאל־נאור אסתר, היתה לציר… לאחר ש… התפטרו"). After findings 2 and
  3 are fixed, the notes can say this.
- **Mid-term replacements are not noted.** `candidate-notes.json` has no k1 entries. OData shows 10 changes during the
  term, for example: Kelmer (URF #16) left on 1949-03-11 and Eliyahu Mazor entered the same day (`k1.json` notes
  this); Taviv left on 1950-04-20 and Yitzhak Kanev entered; and Remez, Tabenkin, Bar-Nir, Hushi, Sheftel, Simhoni,
  Frumkin and Lamm left in 1951, replaced by Menachem Ratzon, Baruch Azania, Herzl Berger, Zhenia Tversky, Israel
  Yeshayahu, Menachem Cohen, David Livschitz and Rafael Bash. This follows the documented "later changes not applied"
  policy.
- **Term-start convention**: `term.start` is the election day (1949-01-25), as in k2 and k3, while k19 uses the first
  sitting. The convention is inconsistent across elections; k1's first sitting is 1949-02-14.
- **End of term**: `endedBy.type = "election"` on 1951-07-30 is correct as a date, and the gap honestly says that the
  dissolving act was not retrieved. Leads: חוק המעבר לכנסת השניה, תשי"א-1951 was "נתקבל בכנסת ביום כ״ז באדר ב׳ תשי״א
  (4 באפריל 1951)" (Wikisource text of ס״ח תשי״א 104, rank 5 as a lead only). The separate election-date law ("חוק
  לקביעת יום הבחירות לכנסת השנייה") is reported as passed about a week later. Neither is among the retained
  `data/raw/k1/law-1951*.pdf` files, which are the main 1951 election law and its amendments. The Reshumot text should
  be fetched before any date is recorded.
- **Losing-list rosters are omitted.** The candidate notice has full rosters for all 9 lists without seats, and the
  app marks them `candidatesUnavailable`. This is documented in DATA.md and decision 0063, but the rosters are in a
  retained official source.
- **Haredi List logo**: the Commons description says only "Symbol of the Haredi List of Eliyahu Kitov"; the year
  comes from the category. The gazette confirms the person: list יח #1 is "מוקוטובסקי (מוקוטוב), אברהם אליהו", Eliyahu
  Kitov's birth name. The claim holds at the stated medium confidence.

## Checked and found OK

| Area | Claims | Source (rank) and evidence |
|---|---|---|
| Election date, Knesset number | 2 | CBS 27.2 (1) "25.1.1949 … 1"; IDI 1949 (2) "הבחירות לאסיפה המכוננת 25.1.1949" |
| Registered 506,567; cast 440,095; valid 434,684; invalid 5,411 | 4 | CBS 27.2 (1) "434,684 1.2 86.9 440,095 506,567 25.1.1949"; results notice p. 402 (1) "מספר הקולות שנמצאו פסולים: 5411"; IDI (2) "506,567 … 434,684 … 86.9%" |
| 21 lists: letters, Hebrew names, votes, seats | 84 | Results notice p. 400 (1) table, read row by row at 300 dpi (e.g. "א — מפלגת פועלי ארץ־ישראל ובלתי מפלגתיים 155274 46"; "יא — הגוש העובד אלכתלה אלעאמלה 3214 —"; "ת — הגוש העממי הערבי 2812 —"). Sum = 434,684 = CBS valid. |
| `withdrawn:false` for all 21; no missing list | 21 | Candidate notice pp. 316–329 (1): exactly these 21 list headers; IDI "מבין 21 הרשימות… נכנסו לכנסת 12" |
| 5 connections | 5 | CEC appendix p. 5 (1): "ב+ל … ט+י"ג … י"א+י"ד … מ+ת … ס+צ"; p. 9: "ב ו־ל (17 מנדטים) … 16 … 1" |
| Seat reproduction (rule `il-1949-highest-average-0`, quota 1/121 = 3,592) | 1 | Own calculation: highest averages over lists with at least one quota (9 lists below it), connections of eligible pairs; 0 differences from the gazette |
| Glossary 1949 threshold text (0.83%, whole quota) | 2 | IDI 1949 (2) "אחוז החסימה 0.83%"; `src/app/glossary-data.ts:212–219` |
| Elected names (gazette spelling) | 114 of 120 | Both gazettes; the 6 exceptions are findings 1, 4, 5, 6, 7 and 13 |
| Not-seated names and ranks | 6 of 8 | Results notice: Mapai "דיין משה, שמחוני אסף, פלגי יואל ונצר (נוסוביצקי) משה התפטרו"; Progressives "שקול משה התפטר" (ש + קול); Herut רובין מאיר. The 2 exceptions are findings 2 and 3. |
| Knesset person IDs of the 120 seated | 120 | Fresh OData pull: 120 PersonIDs with StartDate 1949-02-14 = the app's 120, set-equal |
| URF constituent assignments (16) and WIZO (1) | 17 | Knesset MK biographies and OData factions, as cited in `k1.json`; joint-facts 7/4/3/2 matches; Kelmer→Mazor change on 1949-03-11 matches OData |
| Government 1: number, PM, start 1949-03-10, end 1950-11-01, ministerial lists (Mapai 7, URF 3, Prog 1, Seph 1), Nazareth list supporting | 6 | Plenum 10 Mar 1949 (1) roll call and "בממשלה שהורכבה ע"י דוד בן־גוריון"; plenum 1 Nov 1950 (1) "בזה נכונה הממשלה החדשה"; IDI (2) "12 שרים … 73 חברי כנסת" |
| Formation steps: consultations 22 Feb, mandate 24 Feb (כ"ה שבט), vote 73–45; Oct 1950 Ben-Gurion → Rosen → Ben-Gurion sequence (3); gov 2 vote 69–42–2 on 1950-11-01; resignations 1950-10-16 and 1951-02-14 | 9 | gov1.pdf (1) "ביום כ"ה שבט"; Hebrew calendar: 8 Shevat = 7 Feb (gazette header), so 25 Shevat = 24 Feb; plenum 250182 (1) "הביעה הכנסת הראשונה ב־73 קולות נגד 45"; gov2.pdf (1); plenum 250247 (1) "69 … בעד, 42 נגד, 2 נמנעים"; gov4.pdf (1) "ב־16 באוקטובר 1950 … ב־14 בפברואר 1951" |
| Recommendation round r1: 12 lists with their seats, all "unknown" | 1 | Seats match the gazette; JTA bulletins of 21 and 23 Feb 1949 (3) report consultations but no per-faction recommendations, so "unknown" is honest |
| Term: UN admission 1949-05-11; Harari resolution June 1950; next election 1951-07-30 | 3 | UN GA 207th meeting (1) "formally declared Israel admitted"; IDI constitutional history (2) "ביוני 1950 קיבלה הכנסת הראשונה"; CBS (1) "30.7.1951" |
| Context event "constituent-assembly" (became the First Knesset on 16 Feb 1949) | 1 | Knesset Lexicon (1) https://main.knesset.gov.il/About/Lexicon/pages/asefa.aspx "ב־16 בפברואר 1949 קיבלה האספה המכוננת את חוק המעבר, תש"ט–1949, שבו הפכה את עצמה לכנסת הראשונה" |
| Status note (official-final, ties at seats 118–119) | 1 | DATA.md §K1–K7; consistent with the gazette and appendix |
| Logo year claims (WIZO, Fighters, Hatzohar, Haredi, Popular Arab Bloc, Working Religious Women, Gruenbaum, For Jerusalem, Herut poster) | 9 | Commons raw descriptions (provenance): "Logo/symbol of the WIZO political party, 1949"; "…Hatzohar during the election of 1949"; "…Popular Arab Bloc in the 1949 Israeli legislative election"; etc. Each file has a **single** Commons revision (API imageinfo), so there is no later-redesign risk. Herut: the retained scan prints "שבת ל׳ כסלו 1-1-49", and 30 Kislev 5709 = Sat 1 Jan 1949. |
| Dataset hashes citing k1 | 9 | `party-lineage.json` and the 8 family files with k1 rows = `11ae6547…` = current `public/data/k1.json` |
| Other: no English Wikipedia; ballot-letter fields; `hasLocalities:false`; DATA.md k1 row and table §K1–K7 (21 lists, quota 3,592, 12/128/120) | 6 | Internal consistency checks against the above sources |

## Sources consulted that do not appear above

- Exa fetch of the Knesset Lexicon. A direct curl got HTTP 247 (a bot check), and I did not try to get round it.
- JTA, 21 Feb 1949: https://www.jta.org/archive/weizmann-summons-leaders-of-all-parties-in-assembly-to-consult-today-on-cabinet-make-up
- Wikimedia Commons API and raw pages for the 8 Commons logo files.
- JPress (NLI) was not attempted: the access-etiquette note says it is challenge-blocked.
