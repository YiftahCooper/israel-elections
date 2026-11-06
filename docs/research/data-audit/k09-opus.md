# Data audit k9 (17 May 1977, 9th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `2e15191` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited.

The two retained gazettes are image-only scans (no text layer). I rendered every page (pdfjs + @napi-rs/canvas, 3–6×)
and read them directly; page numbers below are the printed gazette pages.

- **YP 2319** (9 May 1977), candidates notice: `data/raw/research/k09-candidates.pdf`
  = https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-cand.pdf
- **YP 2326** (29 May 1977), results notice ("הודעה על תוצאות הבחירות לכנסת התשיעית", signed 26 May 1977):
  `data/raw/research/k09-results.pdf`
  = https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-results.pdf

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 287 | Counted per field: 6 totals/date fields; 22 × votes and 22 × seats; 16 letters; 17 list names; 6 agreements; 119 elected names; 120 opening-day OData identities (counted once per list, 13); 12 joint-list constituents; 2 bloc schemes' core fields (8); 9 recommendation entries + 2 round dates; formation (mandate, 21 days, vote 63–53, vote date, 13 ministers, PM, gov. number, start/end); term (start, end, dissolving act date, 7 events); 1 context event; 5 logos; 10 dataset hashes; glossary/UI text (3) |
| WRONG | 12 | 6 losing lists with wrong ballot letters and/or official names (H); UAL letters `ים`/`ימ`; one elected name; losing-list rosters marked unavailable though printed; propagated wrong names in parties/links/English labels; stale aftermath notes; whitespace |
| UNSUPPORTED | 3 | Missing English names/bios for the two elected "כהן יגאל"; DMC accession day; party names that are list names |
| UNVERIFIABLE | 1 | Positions of four one-seat lists in the 1977 consultations (already recorded as a gap) |
| DISPUTED | 1 | Flatto-Sharon placed in "opposition" in the first-government scheme although he voted confidence and the PM counted 63 supporters |

**Main finding.** Five of the nine losing lists, plus the United Arab List, carry ballot letters and/or official names that
are not those printed in **both** official notices (YP 2319 candidates and YP 2326 results). The project's reviewed
transcription `data/raw/k9/national.reviewed.json` labels these as gazette values (`gazetteVotes`), but the letters and
names do not match the gazette; the vote figures do. One list name (`הם` "דמוקרטים בצדק") does not correspond to any
list in 1977: the 1,085-vote list is `הפ` "דו־קיום בצדק". The errors propagate to `data/meta/k9.json`
(`englishName`), `data/meta/parties.json` (`vehicle-9-*`), `data/meta/party-links/k9.json` titles and list IDs
(`9-הם`, `9-חך`, `9-סם`, `9-פז`, `9-פח`, `9-ים`).

The aftermath file (`data/meta/aftermath/k9.json`, status `pilot`) is not referenced anywhere in `src/` or `scripts/`
(`grep -rln aftermath src scripts` = 0), so its findings are low severity.

No English Wikipedia anywhere in the k9 files (`grep -c en.wikipedia` = 0 in `data/meta/k9.json`, `aftermath/k9.json`,
`bios/k9.json`, `logos/k9.json`, `party-links/k9.json`, `public/data/k9.json`).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording, formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote (verbatim from the scan) | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k9/national.reviewed.json` → `public/data/k9.json`; also `data/meta/k9.json`, `parties.json`, `party-links/k9.json` | `lists[letters=הם]` `.letters`, `.nameHe`, `.shortHe`, `.shortEn` (`9-הם`) | `הם` / `דמוקרטים בצדק` / en "Demokratim BeTzedek" | `הפ` / `דו־קיום בצדק` (Arab list; rank 1 "שלבי־מסארוה שווקת האמז מחמוד"). English transliteration e.g. "Du-Kiyum BeTzedek" ("Coexistence with Justice") | WRONG | YP 2326 p.1494 §1 (1); YP 2319 p.1323 (1) | p.1494: "הפ  דו־קיום בצדק  1,085"; p.1323: "אותיות הרשימה: "הפ" — הכינוי: דו קיום בצדק" | 2026-11-06 |
| 2 | H | as #1 | `lists[letters=זה].nameHe`, `.shortHe`, `.shortEn`; `k9.json lists[letters=זה].englishName.label` | `התנועה להתחדשות חברתית בראשותו של מרדכי בן־פורת` | `התנועה להתחדשות ציונית חברתית בראשותו של מרדכי בן־פורת` (word "ציונית" missing) | WRONG | YP 2326 p.1494 (1); YP 2319 p.1324 (1) | p.1324: "אותיות הרשימה: "זה" — הכינוי: התנועה להתחדשות ציונית חברתית בראשותו של מרדכי בן־פורת" | 2026-11-06 |
| 3 | H | as #1 | `lists[letters=חך]` `.letters`, `.nameHe`, `.shortHe` (`9-חך`) | `חך` / `בית ישראל, ברית נאמני תימן ועדות ישראל` | `זך` / `בית ישראל, ברית יוצאי תימן ועדות ישראל` | WRONG | YP 2326 p.1494 (1); YP 2319 p.1324 (1) | p.1494: "זך  בית ישראל, ברית יוצאי תימן ועדות ישראל  9,505"; p.1324: "אותיות הרשימה: "זך" — הכינוי: בית ישראל ברית יוצאי תימן ועדות ישראל" | 2026-11-06 |
| 4 | H | as #1, and `national.reviewed.json agreements.pairs[5]` | `lists[letters=סם].letters` (`9-סם`); agreement `["רצ","סם"]` | `סם` | `ספ` | WRONG | YP 2326 p.1494 (1); YP 2319 pp.1319, 1329 (1) | p.1329: "אותיות הרשימה: "ספ" — הכינוי: תנועת הרפורמה הערבית"; p.1319 agreement 6: "התנועה לזכויות האזרח — רצ עם תנועת הרפורמה הערבית — ספ" | 2026-11-06 |
| 5 | H | as #1 | `lists[letters=פז]` `.letters`, `.nameHe`, `.shortHe` (`9-פז`) | `פז` / `הפנתרים הציוניים, רשימת ציבור ודורשי עבודה` (1,798 votes) | `פ` / `הפנתרים הציוניים, רשימת עובדי ייצור וועדי עובדים` | WRONG | YP 2326 p.1494 (1); YP 2319 p.1329 (1) | p.1329: "אות הרשימה: "פ" — הכינוי: הפנתרים הציוניים, רשימת עובדי ייצור וועדי עובדים" | 2026-11-06 |
| 6 | H | as #1 | `lists[letters=פח]` `.letters`, `.nameHe`, `.shortHe` (`9-פח`) | `פח` / `חופש, חזית פועלים, פנתרים שחורים, ישראל הצעירה, יוצאי עדות, ועדי שכונות עוני ובלתי מפלגתיים` (2,498 votes) | `פז` / `חופש, חזית פועלים, פנתרים שחורים, ישראל הצעירה, יוצאי עודד, ועדי שכונות עוני ובלתי מפלגתיים` ("עודד", not "עדות") | WRONG | YP 2326 p.1494 (1); YP 2319 p.1329 (1) | p.1329: "אותיות הרשימה: "פז" — הכינוי: חופש, חזית פועלים, פנתרים שחורים, ישראל הצעירה, יוצאי עודד, ועדי שכונות עוני ובלתי מפלגתיים" | 2026-11-06 |
| 7 | M | as #1, and `national.reviewed.json agreements.pairs[0]`, `data/meta/k9.json blocSchemes[*].members`, `aftermath/k9.json recommendationRounds[0].entries[12]` | `lists[letters=ים].letters` (`9-ים`) | `ים` (final mem) | `ימ` (non-final mem), as printed in all three official places. The same gazette uses final forms where a list chose them (`זך`, `כך`), and the app already keeps the non-final `כנ`. | WRONG | YP 2319 pp.1319, 1324 (1); YP 2326 pp.1494, 1495 (1) | p.1324: "אותיות הרשימה: "ימ" — הכינוי: הרשימה הערבית המאוחדת"; p.1319: "הרשימה הערבית המאוחדת — ימ"; p.1495: "מהרשימה הערבית המאוחדת (ימ) —" | 2026-11-06 |
| 8 | M | `data/raw/k9/candidates.reviewed.json` → `public/data/k9.json`; `data/meta/k9.json` | `lists[letters=אמת].ranks[15].nameHe` (rank 16) and the `elected` array; `public` `lists[id=9-אמת].candidates[15].nameHe`; `k9.json lists[1].parties[0].members[rank=16].nameHe` | `אשל תמר (שדה)` | `אשל תמר (עדה)` | WRONG | YP 2326 p.1495 §4(א) (1); YP 2319 p.1320 (1) | p.1495: "16. אשל תמר (עדה)" (checked at 6× zoom); p.1320 identical | 2026-11-06 |
| 9 | M | `public/data/k9.json` (build flag from inputs) | `lists[9-הם, 9-זה, 9-חך, 9-כה, 9-כך, 9-נס, 9-סם, 9-פז, 9-פח].candidatesUnavailable` | `true`, with `candidatesSource: "k9-candidates-gazette"` | The retained candidates gazette prints every losing roster: הפ 9 (p.1323), זה 13 and זך 43 (p.1324), כה 24 (p.1326), כך 8 (p.1327), נס 12, ספ 19, פ 11 (p.1329), פז 57 (pp.1329–1330). "Unavailable" is not true. Transcribe, or relabel as "not transcribed". | WRONG | YP 2319 pp.1323–1330 (1) | p.1327: "אותיות הרשימה: "כך" — הכינוי: תנועת כך מיסודו של הרב מאיר כהנא … 1. כהנא מאיר 2. פוטלסקי משה 3. כהן רחמים …" | 2026-11-06 |
| 10 | M | `public/data/k9.json`, `data/meta/bios/k9.json` | `lists[9-מחל].candidates[20].nameEn`, `candidates[23].nameEn`; `bios/k9.json candidates["9-מחל#21"]`, `["9-מחל#24"]` | `""` (empty) and no bio entry (118 of 120 elected have bios) | #21 Yigal Cohen (La'am, Knesset PersonID 2394); #24 Yigal Cohen-Orgad (Herut, PersonID 2399), the identification `data/meta/k9.json` already makes. The gazette prints both as "כהן יגאל", so the English name is the only thing telling them apart. | UNSUPPORTED | Knesset OData `KNS_Person` 2394 "כהן יגאל", 2399 "כהן-אורגד יגאל" (1) (retained in `data/raw/k9/knesset-odata-members.json`); YP 2326 p.1496 (1) | p.1496: "21. כהן יגאל … 24. כהן יגאל" | 2026-11-06 |
| 11 | M | `data/meta/k9.json`, `data/meta/parties.json`, `data/meta/party-links/k9.json` | `k9.json lists[letters=הם/זה/חך/פז/פח].englishName.label`; `parties.json parties[id=vehicle-9-הם/-זה/-חך/-סם/-פז/-פח].names[0].nameHe`; `partyAppearances[listId=9-הם…9-פח].listId`; `party-links/k9.json lists["9-הם"…"9-פח"][0].titleHe` | Copies of the wrong names/letters in #1–#7 (e.g. link title "דמוקרטים בצדק — הודעת התוצאות לכנסת 9", which links to the very notice that prints "דו־קיום בצדק") | Same corrections as #1–#7, including list IDs (`9-הפ`, `9-זך`, `9-ספ`, `9-פ`, `9-פז`, `9-ימ`). Note the ID collision risk: the current `9-פז` (Zionist Panthers) must become `9-פ`, and the current `9-פח` (Hofesh) must become `9-פז`. | WRONG | as #1–#7 (1) | — | 2026-11-06 |
| 12 | M | `data/meta/k9.json` | `blocSchemes[id=first-government].blocs[id=opposition].members` (contains `פש`) and `.blocs[id=coalition].seats` 61 | Flatto-Sharon in opposition; coalition 61 | Disputed placement. The scheme's own rule is "lists that joined or supported the government at its formation", and it counts Agudat Yisrael, which supported without ministers. Flatto-Sharon also supported the government in the investiture vote, and Begin told the Knesset his government rested on 63 MKs (43+2+12+4 + Dayan + Flatto-Sharon). The Hebrew Wikipedia government page lists Flatto-Sharon in the opposition. Either move `פש` to the coalition (62 by list seats; Dayan sat in the Alignment faction) or reword the rule and add a note. | DISPUTED | Knesset plenum 20 Jun 1977, 9_ptm_254065.pdf (1); JTA 21 Jun 1977 (4); Hebrew WP (5) | Plenum (Begin): "ממשלה זו, הנשענת על 63 חברי כנסת"; JTA: "Voting for the government were Likud, the National Religious Party (NRP) and Aguda bloc, Moshe Dayan and Samuel Flatto-Sharon." | 2026-11-06 |
| 13 | L | `data/meta/aftermath/k9.json` | `government.changes[0].date`, `.notes[0]`, `.cites[0]` | `1977-10`; "Exact day not confirmed by a primary source (secondary gives 25 October…)" | `1977-10-24`: Knesset OData gives the start date of the three DMC ministers (Tamir, Justice; Katz, Welfare; Amit, Transport and Communications), and Begin's interim tenure of those portfolios ends the same day. The hewiki "25 באוקטובר" is contradicted. `data/meta/k9.json` `blocSchemes[0].notes[1]` already states 24 October. | UNSUPPORTED | Knesset OData `KNS_PersonToPosition?$filter=GovernmentNum eq 18` (1) https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2018&$format=json | Rows: "1977-10-24 … PersonID 2676 משרד המשפטים שר המשפטים"; "1977-10-24 … 3260 … שר הרווחה"; "1977-10-24 … 2527 … שר התחבורה"; "PersonID 2179 שר המשפטים 1977-06-20 → 1977-10-24" | 2026-11-06 |
| 14 | L | `data/meta/aftermath/k9.json` | `results.knessetSwornIn.cites`, `.confidence`, `.notes[0]`; `gaps[3]` | First sitting 13 Jun 1977 rests on Hebrew WP only ("Only a labelled secondary source retrieved"); gap says first-sitting date and DMC date "use a labelled secondary source" | Value is right. Cite the retained rank-1 OData (`k9-membership-odata`: all 120 opening MK records start "1977-06-13") and #13. Update the stale gap text and raise confidence. | WRONG | `data/raw/k9/knesset-odata-members.json` (1) | `"StartDate": "1977-06-13T00:00:00"` (120 records) | 2026-11-06 |
| 15 | L | `data/meta/parties.json` | `parties[id=nrp|poalei-agudat-yisrael|agudat-yisrael].names[date=1977-05-17].nameHe` | List ballot names ("חזית דתית לאומית, המזרחי, הפועל המזרחי ובלתי מפלגתיים", "המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים", "יהדות התורה, אגודת ישראל") | These are list names (כינוי הרשימה), not party names. Label them as list names, or record the party names. This is the same issue as k22 finding 11. | UNSUPPORTED | YP 2319 pp.1321–1322 (1) | "הכינוי: המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים" | 2026-11-06 |
| 16 | L | `public/data/k9.json` (from name data) | `lists[9-יש].candidates[3].nameEn` | `"Shmuel  Tamir (Katznelson)"` (double space) | `"Shmuel Tamir (Katznelson)"` | WRONG | — | — | 2026-11-06 |
| 17 | L | `data/meta/aftermath/k9.json` | `recommendationRounds[0].entries[9..12]` (ד, לע, רצ, ים: status `unknown`) | unknown | Still unknown. JPost 31 May–8 Jun 1977 and 5 Jun 1977 (#14030, not in the cited set) read: no position reported for these four lists. | UNVERIFIABLE | Internet Archive JPost 1977 OCR (3) | Jun 6: "President Ephraim Katzir yesterday received MK-elect Samuel Flatto Sharon, thus concluding his consultations with representatives of all parties successful in the elections." | 2026-11-06 |

### Notes for the fixer

- **Root cause of #1–#7.** The vote and seat columns of `national.reviewed.json` are correct; only the `letters` and
  `nameHe` of rows 5, 7, 8, 9, 17, 18 and 19 were not taken from the gazette. All seven corrections are visible on one
  page of YP 2326 (p.1494, §1). Each is independently confirmed by the list header in YP 2319. The `allocationCheck`
  is unaffected: these are all below-threshold lists except `ימ`, whose votes and seat are correct.
- **Hebrew dash forms.** The gazette uses `—` in some names ("המערך — מפלגת העבודה…", "הדור החדש — תנועת…");
  the data uses `–`. This is typographic and not counted as an error.
- **Agudat Yisrael name.** The results notice prints "יהדות התורה, אגודת ישראל"; the candidates notice and the
  results §4(ג) print it without the comma. The data follows the results table. OK.
- **Ratz elected name.** YP 2326 §4 has twelve paragraphs (א–יב), and Ratz (seat table: 1) has none. I confirm the
  omission noted in `search.reviewed.json`. The data's use of Knesset OData (Shulamit Aloni, from 13 Jun 1977)
  matches YP 2319 p.1330 rank 1 "אלוני שולמית". OK. I did not search beyond YP 2327–2334 for a correction notice.

## Checked and found OK

| Area | Claim(s) | Evidence (rank) |
|---|---|---|
| Totals | valid 1,747,820; invalid 23,906 | YP 2326 p.1494 (1): "ס"ה 1,747,820"; "(2) מספר הקולות שנמצאו פסולים: 23,906" |
| Totals | registered 2,236,293; cast 1,771,726; election 17.5.1977; Knesset 9 | CBS table 27.2 (2024), retained `cbs-national-totals-2024.pdf` (1): "1,747,820 1.3 79.2 1,771,726 2,236,293 17.5.1977 9". Arithmetic: 1,747,820 + 23,906 = 1,771,726 ✓ |
| Votes, 22 lists | every `gazetteVotes` value; sum = 1,747,820 | YP 2326 p.1494 (1), read line by line |
| Seats, 13 lists | 32/12/4/1/5/1/15/2/1/43/1/1/2; sum 120 | YP 2326 pp.1494–1495 §3 (1) |
| List names, 17 lists | אמת, ב, ג, ד, ו, ים (name), יש, כה, כך, כנ, לע, מחל, נס, פש, רצ, ש, ספ (name) | YP 2326 p.1494 (1); YP 2319 headers (1) |
| Letters, 16 lists | אמת, ב, ג, ד, ו, זה, יש, כה, כך, כנ, לע, מחל, נס, פש, רצ, ש | as above |
| Surplus agreements | 6 pairs: אמת–ימ, לע–יש, מחל–כנ, ב–ג, ש–נס, רצ–ספ (letter forms per #4, #7) | YP 2319 p.1319 (1), signed 8 May 1977 |
| Candidate cap | Flatto-Sharon list has exactly one candidate; the seat table gives 1. My independent Bader–Ofer run (threshold 1% = 17,478.2; quota 14,173.76; six agreements) gives uncapped פש 2, ש 1, and with the cap פש 1, ש 2. This matches the official table. Legal basis not located; the app already labels it an inference. | YP 2319 p.1330: "אותיות הרשימה: "פש" — הכינוי: פלאטו שרון … 1. שרון סמואל" (1); law SH 692 (1973) (1) |
| Elected names, 119 | all ranks of אמת (except #8), ב, ג, ד, ו, ימ, יש, כנ, לע, מחל, פש, ש, compared character by character with YP 2326 §4. This includes "הרב דרוקמן חיים", "גל (גלס) דוד", "רבינוביץ (רום) יוסף", "שריד יוסף (יוסי)", "אמוראי עדי(אל)", "סייף אלאדין מוחמד סעיד חוסיין זועבי" and "ביטון שלום צ׳רלי" | YP 2326 pp.1495–1496 (1) |
| Opening membership | the 120 MKs whose OData StartDate is 1977-06-13 match the 120 elected (spelling variants only); no pre-opening replacement, so no candidate note is needed | `data/raw/k9/knesset-odata-members.json` (1), re-matched independently |
| Faction sizes at opening | הליכוד 43, מערך 32, ד"ש 15, מפד"ל 12, חד"ש 5, אגו"י 4, שלומציון 2, של"י 2, ר"ץ 1, רע"ם 1, ל"ע 1, פא"י 1, פלאטו שרון 1 | same file, PositionID 54 |
| Joint-list constituents | Likud = Herut, Liberals, La'am, Ahdut (Seidel); Alignment = Labor, Mapam (ranks 5, 10, 19, 26); Hadash = Rakah, Black Panthers (Biton); Sheli = Independent Socialists, Moked, Meri, Panthers | Knesset member bios (1) per member where cited; IDI scan of YP 2319 (2); Hebrew WP (5) as labelled secondary. Medium-confidence members without per-person evidence are labelled as such. |
| Government | number 18; PM Begin; sworn 20 Jun 1977; 13 ministers; PM interim holder of Welfare, Justice, Transport and Communications | Knesset plenum, 3rd sitting, 20 Jun 1977, https://fs.knesset.gov.il/9/Plenum/9_ptm_254065.pdf (1): "ישיבה כ' (ד' בתמוז תשל"ז 20 ביוני 1977)"; minister list; "בתקופת מעבר קצרה יהיה ראש הממשלה אחראי למשרדי הרווחה, המשפטים, התחבורה והתקשורת" |
| Confidence vote | 63–53 | same (1): "63 בעד ההצעה להביע אמון בממשלה 53 נגד ההצעה … נתקבלה" |
| Mandate | 7 Jun 1977, on the recommendation of factions forming a large majority | same (1): "ביום ג' כ"א סיון תשל"ז, 7 ביוני 1977, הואיל נשיא המדינה, מכוח סמכותו ועל־פי המלצתן של סיעות בכנסת המייצגות רוב מכריע של חבריה" |
| Government end / PM tenure | 1981-08-05; Begin continuous (gov. 19 also Begin); no acting PM gap | Knesset OData GovernmentNum 18 (1): positions run to 1981-08-05 |
| Coalition at formation | Likud, Shlomtzion, NRP, Agudat Yisrael (support without ministers); DMC joined later; Dayan as individual minister | plenum (1); JTA 21 Jun 1977 (4); JPost 6 Jun 1977 (3). See #12 for Flatto-Sharon. |
| Recommendations (9 entries) | מחל→Begin; אמת none ("At this stage, we are not"); יש and ב→Begin; ג and כנ→Begin; ו other (Rakah: largest-party convention not binding); ש other ("moderate statesman, such as Haim Zadok … or Yitzhak Navon"); פש→Begin | JPost OCR (3), all quotes re-found verbatim in the Internet Archive text: 31 May, 1 Jun ("After hearing from Bar-Lev…"), 2 Jun ("Leaders of the Democratic Movement for Change and of the National Religious Party … asked President Ephraim [Katzir] yesterday to select Menahem Begin"), 3 Jun, 6 Jun ("Flatto Sharon voiced his support for a government led by Menahem Begin, yet dissented from the 'cooling-down' economic policies…") |
| Round dates | 30 May – 5 Jun 1977 (5 Jun was a Sunday; the consultations ended with Flatto-Sharon) | JPost 31 May and 6 Jun (3) |
| End of term | dissolving act = חוק התפזרות הכנסת התשיעית, התשמ"א-1981, passed 10 Feb 1981 (2nd/3rd reading, plenum session 419), SH 1006 p.114, 19 Feb 1981; election 30 Jun 1981. `endedBy.date 1981-02-10` is the act's date, not a later procedural step. | Knesset OData `KNS_Bill` 174522 and `KNS_PlmSessionItem` (1): "ישיבת מליאה בתאריך 10/02/1981" status 114/117; `KNS_IsraelLaw` 2000620 PublicationDate 1981-02-19; IPU (2) |
| Term events | Sadat visit (20 Nov 1977), Peace Now (1978), Coastal Road massacre (11 Mar 1978, terrorists named as such), Operation Litani (Mar 1978), Camp David approval (Sep 1978), peace treaty (Mar 1979), Iraqi reactor (7 Jun 1981). Dates and wording consistent with the cited official and academic chronologies; the editorial stance is respected. | as cited (1–2); not re-fetched individually |
| Context event | `flatto-capacity`: one candidate, 35,049 votes, one seat | YP 2319 p.1330, YP 2326 pp.1494–1496 (1) |
| UI text | `src/app/glossary-data.ts:638–639`, `src/app/derive.ts:124`, `Walkthrough.tsx:104` (candidate-cap explanation) | consistent with the above |
| Logos | Alignment 1977 (Commons "Alignment (1977).png", dated 1977, cites NLI IE5020789); Dash (Commons: "ran in the 1977 Israeli election", AP footage); Shlomtzion (founded 1977; single-election party); Flatto-Sharon (NLI "1977B-PlatoSharon" image); Likud (Jabotinsky item 34361 dated 1977-04-28). The evidence supports the claimed year at the stated medium confidence. | Commons file pages read via API (attribution only); retained Jabotinsky page |
| Dataset hashes | `party-lineage.json` k9 sha256 and all nine `families/*.json` `elections[8]` hashes = `5094bf60…6fd8` = current `public/data/k9.json`. Will need refreshing after the fixes. | `sha256sum public/data/k9.json` |
| Colours | labelled as Hebrew WP convention with no official source (accurate self-description) | — |

## Hebrew Wikipedia as sole basis (flag only)

- `data/meta/k9.json` `colours[*]`: Hebrew WP only, explicitly labelled a convention. Acceptable as labelled.
- Party splits: `lists[אמת].parties` (Labor/Mapam assignment), `lists[ו]`, `lists[ש]`. Hebrew WP is the only
  list-level source. Many members have Knesset-bio evidence (rank 1), but 19 members carry no per-person evidence
  (`confidence: medium`). Knesset OData faction rows for 1977 show only the joint faction names (מערך, חד"ש, של"י),
  so they cannot settle the splits.
- `aftermath/k9.json` `government.changes[0]` (DMC date) and `results.knessetSwornIn`: Hebrew WP only, while rank-1
  OData is available (#13, #14).
