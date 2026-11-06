# Data audit k16 (28 January 2003, 16th Knesset): Opus auditor

Independent check of every k16 fact found by `grep -rl k16` (results, rosters, meta, aftermath, context, families,
bios, links, logos, UI text). Base revision `cf9935e`. All checks accessed **2026-11-06** unless stated. No data edited.

Method: rank-1 scans were read visually (results notice YP 5155 pp. 1406–1408; surplus notice YP 5151 p. 1312;
candidate notice YP 5148 pp. 1198, 1202), CBS table 27.2 text-extracted, the CEC polling-station datastore re-summed,
Knesset OData (`KNS_Faction`, `KNS_PersonToPosition` for KnessetNum 16 and GovernmentNum 30, `KNS_Person`) queried
live, and Reshumot YP 5467 (dissolution order) text-extracted. Press via Exa search index. Knesset `main.knesset.gov.il`
and `knesset.gov.il/elections16` returned an HTTP 247 bot challenge to curl; I stopped there and did not use a
challenge-bypassing fetcher.

## Summary

| Class | Count |
|---|---|
| OK | 116 |
| WRONG | 5 |
| UNSUPPORTED | 2 |
| UNVERIFIABLE | 1 |
| DISPUTED | 1 |

Plus 4 sourcing flags (Hebrew Wikipedia as sole basis where better sources exist; a mirror labelled "official").
No English Wikipedia found in any k16 file. No partisan wording found.

## Non-OK findings

| # | File | JSON path | Current | Correct / proposed | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|
| 1 | `data/meta/aftermath/k16.json` | `government.primeMinisters[0].to` (and single-PM list) | Sharon `from 2003-02-27`, `to 2006-05-04`; no other PM | Sharon to **2006-01-04**; add Ehud Olmert, acting PM from 2006-01-04 (designated acting PM, `PositionID 51`), Prime Minister **2006-04-14 → 2006-05-04** | WRONG | Knesset OData `KNS_PersonToPosition?$filter=GovernmentNum eq 30` (rank 1): https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2030&$format=json (rows beyond the first 100 via `$skip=100`) | PersonID 482 (שרון אריאל) PositionID 45 "ראש הממשלה" StartDate 2003-02-27 FinishDate 2006-01-04; PersonID 1064 (אולמרט אהוד) PositionID 51 "ממלא מקום ראש הממשלה" 2003-02-27→2006-04-14; PositionID 45 "ראש הממשלה" 2006-04-14→2006-04-17 and 2006-04-17→2006-05-04 | 2026-11-06 |
| 2 | `data/meta/aftermath/k16.json` | `term.endedBy.date` (+ cite `ipu2006`) | `2005-11-24` ("early dissolution on 24 November 2005", IPU, rank 3) | Dissolution order dated **2005-11-27**, consented by President Katsav, published YP 5467 on **2005-12-08**. Press reports Katsav signed on 23 Nov 2005. Use the Reshumot order (rank 1); IPU's 24 Nov is not supported by either | WRONG | Reshumot YP 5467, p. 728 (rank 1): https://olaw.org.il/yalkut/yalkut-5467.pdf ; Ynet 23.11.05 (rank 4): https://www.ynet.co.il/articles/0,7340,L-3173799,00.html | YP: "צו בדבר פיזור הכנסת … בתוקף סמכותי לפי סעיף 29(א) לחוק–יסוד: הממשלה … ובהסכמת נשיא המדינה, אני מצווה על פיזור הכנסת השש עשרה. כ"ה בחשון התשס"ו (27 בנובמבר 2005) … אריאל שרון ראש הממשלה. אני מסכים. משה קצב נשיא המדינה" (issue dated "8 בדצמבר 2005"). Ynet: "נשיא המדינה, משה קצב, חתם על צו נשיאותי לפיזור הכנסת … הצו נחתם בתנאי שיפורסם ברשימות בשמונה בדצמבר" | 2026-11-06 |
| 3 | `data/raw/k16/national.reviewed.json` (→ `public/data/k16.json` `lists`) | `pollingColumnsNotInGazette.זך.note`; list זך absent from `public/data/k16.json.lists` | "No result line in gazette; zero column in datastore. Not treated as a verified roster or list record." | The results notice explains the column: list **זך, "מורשת אבות" headed by Rabbi Yosef Ba-Gad**, was registered but all its candidates withdrew. Note should quote this; the app could show it as a withdrawn list (`withdrawn: true`, 0 votes), as the schema allows | WRONG (misleading/omitted) | Results notice YP 5155 p. 1406 (rank 1), retained `data/raw/k16/results.pdf` | "הערה: מרשימת המועמדים מורשת-אבות בראשות הרב יוסף בא-גד שסימנה זך התפטרו כל המועמדים." | 2026-11-06 |
| 4 | `data/raw/k16/candidates.reviewed.json` → `public/data/k16.json` | `lists[letters=קך].candidates[rank=10].nameHe` (`16-קך#10`) | `משקוף ארקדי` | `משקוץ ארקדי` (final letter is ץ, not ף; enlarged crop is unambiguous) | WRONG | Candidate notice YP 5148 p. 1202 (rank 1), retained `data/raw/k16/candidates.pdf` (PDF page 12) | "10. משקוץ ארקדי" (list קך, אזרח ומדינה) | 2026-11-06 |
| 5 | `data/raw/bios/knesset-site-mk-names-en.json` → `public/data/k16.json` | siteId 731 `nameEn`; `lists[מחל].candidates[rank=25].nameEn` | `"Moshe  Kahlon"` (two spaces) | `"Moshe Kahlon"` | WRONG (format) | — | — | 2026-11-06 |
| 6 | `data/meta/k16.json` and `public/data/k16.json` | `blocSchemes[id=first-government].date` | `2003-02-28` (from Hebrew Wikipedia) | `2003-02-27`, which also matches `aftermath.government.startDate`. The confidence vote was taken around midnight at the sitting of 27 Feb. UPI places it "shortly after midnight" (28 Feb). Rank 1 (OData) gives 27 Feb, so 27 Feb should win; the two files currently disagree | DISPUTED | OData (rank 1) above: ministers incl. PM StartDate 2003-02-27. Ynet (rank 4) https://www.ynet.co.il/articles/0,7340,L-2461558,00.html ; UPI (rank 4) https://www.upi.com/Defense-News/2003/02/27/Knesset-approves-new-Israeli-government/94801046397374/ | Ynet (updated 28.02.03 00:28): "66 חברי כנסת תמכו בממשלה שהציג אמש (יום ה') ראש הממשלה". UPI: "Sixty-six Knesset members … raised their hands in support shortly after midnight while 48 others … voted against" | 2026-11-06 |
| 7 | `data/raw/SOURCES.json` | `[id=k16-surplus-gazette].description` | "…six pairs for 2003, four for 2006." | YP 5151 (26 Jan 2003) contains only the 2003 notice. Drop "four for 2006", which belongs to a different notice | UNSUPPORTED | YP 5151 p. 1312 (rank 1), retained `data/raw/k16/yp5151-surplus.pdf` | Notice "הודעה בדבר התקשרויות בין רשימות מועמדים לכנסת השש עשרה" lists pairs 1–6 only | 2026-11-06 |
| 8 | `data/meta/aftermath/k16.json` | `gaps[4]` ("Sharon's January 2006 incapacity and Olmert's acting premiership need a direct dated record") | Gap stated as open | Closed by OData (finding 1). Keep the IPU note | UNSUPPORTED (stale gap) | OData as in finding 1 (rank 1) | as finding 1 | 2026-11-06 |
| 9 | `public/data/k16.json` | `totals.envelopeVotes` label | `158296` | Value is correct as **envelope voters** (votes cast, including invalid). Valid envelope votes are 155,933. Confirm the UI labels it as voters, not valid votes | UNVERIFIABLE (label only, UI not inspected) | CEC polling datastore re-summed (rank 1): https://data.gov.il/api/3/action/datastore_search?resource_id=498b48e9-5af6-474d-b7a4-5ac1e21d3a08 | rows `שם ישוב = מעטפות כפולות`: Σמצביעים 158,296; Σכשרים 155,933 (149 rows) | 2026-11-06 |

### Sourcing flags (not counted above)

| File | Path | Issue | Better source reached (rank) |
|---|---|---|---|
| `data/meta/k16.json`; `data/meta/aftermath/k16.json` | `blocSchemes[first-government].sources`, `notes`; `sources.government-research-1/2`; `government.coalition[ב].note` | Coalition membership and date rest on Hebrew Wikipedia (plus OData ministers) | Knesset-hosted coalition agreements, e.g. Likud–National Union, 26.2.2003, https://main.knesset.gov.il/mk/government/documents/coal2003ichudleumi.pdf (rank 1, search-index text; direct fetch is challenged); INN 26 Feb 2003, https://www.israelnationalnews.com/news/39599: "The coalition agreement of the Likud, Shinui, the National Union, and the National Religious Party was signed … The coalition will number 68 MKs." (rank 4); TheMarker/Haaretz 23 Feb 2003 (Likud–NRP agreement signed), https://www.themarker.com/misc/2003-02-23/ty-article/0000017f-e377-d7b2-a77f-e377bd250000 (rank 4) |
| `data/meta/k16.json` | `lists[*].parties[*].sources` (Labor/Meimad, NU's Moledet/Tkuma/YB ranks, Meretz/Democratic Choice, Ra'am/ADP) | Hebrew Wikipedia is the only source for several constituent assignments. All assignments I could check are correct: Melchior #10 Meimad; Bronfman #5 Democratic Choice; Hendel #4 and Ariel #6 Tkuma; Elon #2 and Eldad #7 Moledet; Dehamshe #1 Islamic Movement; el-Sana #2 ADP | No rank 1–3 per-candidate party source reached. The IDI list pages (copies of `knesset.gov.il/elections16/heb/lists/…`) are a candidate lead |
| `data/meta/aftermath/k16.json` | `sources.knesset-history` (`kind: "official"`) | Cited via the Jewish Virtual Library mirror (AICE), not the Knesset page. Quotes are present on the JVL page ("This Government implemented the disengagement plan. After the implementation the Likud split in two, and the Kadima Party was formed.") | Original Knesset page is challenged. Label as a mirror (`kind` secondary/mirror) or replace with OData facts |
| `data/meta/k16.json` | `colours[*]` | Colours come from Hebrew Wikipedia convention (honestly labelled) | n/a (presentation) |

### Observations (not findings)

- **Mafdal 132,370 / Lider 833 vs gazette 132,730 / 883:** the app's choice is right and is disclosed. Printed gazette
  lines sum to 3,148,774, which is 410 more than its own valid total. The polling datastore sums to 132,370 and 833.
  The Knesset's 2003 elections site gives Lider "מספר קולות: 833" (copy of `knesset.gov.il/elections16/heb/lists/list.asp?id=8`
  at https://en.idi.org.il/media/7144/%D7%9C%D7%99%D7%93%D7%A8-16.pdf). IDI's 2003 page
  (https://www.idi.org.il/policy/parties-and-elections/elections/2003, rank 3) gives "מפד"ל | 132,370" and "לידר | 833".
- IDI's 2003 page gives registered voters as 4,720,079. CBS table 27.2 (rank 1) gives 4,720,075, which the app uses.
  CBS wins.
- `radical-right` family for k16 includes only National Union. Herut (נץ; Kleiner/Marzel list, 36,202 votes) is not
  in any family. This is an interpretive choice, not a factual error; noting it for the family owner.
- Party id inconsistency: `data/meta/k16.json` and the dataset use `ram`, while `party-lineage.json` and
  `families/*` use `raam` for the same Ra'am constituent (families record both in `datasetPartyIds`/`partyIds`).
- 16-ק#3 is printed `חיטיב סאמיה` in the scan. The app normalises it to `ח׳טיב סאמיה`, which reads as an intended
  geresh. This is acceptable but not documented in `transcriptionCorrections`.
- During-term replacements (31 later entrants per OData, e.g. Majadele 2004-06-29 for Burg, Rosenblum 2005-12-10
  for Hanegbi) are not modelled in the app. This is out of scope for correctness, but relevant if "who served" is
  ever shown.

## Checked and found OK

| Area | Claim(s) | Source (rank) and quote/evidence |
|---|---|---|
| Totals | electionDate 2003-01-28; registered 4,720,075; votesCast 3,200,773; valid 3,148,364; invalid 52,409 (4 items + date) | CBS st27_02 (rank 1), row "3,148,364 1.6 67.8 3,200,773 4,720,075 28.1.2003 16"; YP 5155 p. 1406: "סך כל הקולות הכשרים 3,148,364", "מספר הקולות שנמצאו פסולים 52,409" |
| Rule set | `il-1992-bader-ofer-1.5`; glossary "1.5% in 1992–2003", "2% … 2006–2013"; `src/engine/rules.ts:17` (3 items) | IDI 2003 page "אחוז החסימה 1.5%"; 2% amendment in force 27.5.2004 (glossary's own law citation) |
| Derived totals | ballotBoxes 7,885; localities 1,171 (2 items) | Datastore re-sum: 7,886 rows of which one is a junk EOF row (`\x1a`). 1,172 distinct codes including that junk = 1,171 |
| 27 list rows | letters, Hebrew name, votes, seats for all 27 lists (מחל…ף); 13 winners total 120 seats (27 items) | YP 5155 pp. 1406–1407, read line by line: e.g. "מחל הליכוד עם אריאל שרון לראשות הממשלה 925,279 … 38", "שס … 258,879 … 11", "עם הרשימה הערבית המאוחדת 65,551 … 2", "סך כל המנדטים 120"; ב and ף as per the observation above |
| Surplus agreements | 6 pairs (אמת–מרצ, יש–רק, ל–כן, ב–ם, שס–ג, ו–ד); notice 20 Jan 2003; published 26 Jan 2003, p. 1312 (6 items) | YP 5151 p. 1312 (rank 1), signed "י"ז בשבט התשס"ג (20 בינואר 2003) מישאל חשין" |
| Elected rosters | All 120 elected names for the 13 winning lists match section 4 (13 items) | YP 5155 p. 1407, section 4 (a)–(יג). Spelling variants only, e.g. "איתן מיקי (מיכאל)", "פורז פוזמנטיר אברהם" |
| Opening membership | Sharansky (#1) not seated, Solodkin (#3) seated at the opening on 2003-02-17. Candidate note, YB list note, `opening-members-k16` event (3 items) | OData opening set: 120 rows StartDate 2003-02-17 including סולודקין מרינה, excluding שרנסקי. Ynet 29.01.03 (rank 4): "עם התפטרותו של שרנסקי, תיכנס לכנסת, השלישית ברשימה במפלגה, ח"כ מרינה סולדקין" |
| Non-winning rosters (sample) | Likud ranks 39–114 sample (Rosenblum 39, Pinian 42, Lasri 53, Danon 59, Ram 72, Admasu 88, Shamir 114); Ale Yarok 1–18; Greens 1–7; Da'am 1–7; Ezrah uMedina 1–9 (5 items) | YP 5148 pp. 1198, 1202 (rank 1), visually compared. Only #10 of קך differs (finding 4) |
| Recommendations | 13 per-list entries (8 recommended Sharon, 5 none), totals 87/33, round date 6 Feb, consultations 3–6 Feb, mandate 9 Feb (17 items) | Walla/Haaretz 6 Feb 2003 (rank 4): "עד כה המליצו סיעות הליכוד, שינוי, ש"ס, האיחוד הלאומי, מפדל, יהדות התורה, עם אחד וישראל בעלייה על שרון. נציגי שאר הסיעות, העבודה, מרצ, בל"ד, חד"ש-תע"ל לא התנגדו…"; Haaretz EN 3 Feb 2003: "Katsav began meeting Monday with representatives"; Haaretz 9 Feb (published 8 Feb 21:00 UTC): "הטיל היום (ראשון)… '87 חברי כנסת המליצו לי'"; INN 9 Feb: "Only Labor (19 seats), Meretz (6), and the Arab parties (8) did not recommend Sharon" |
| Government 30 | number 30; PM Sharon from 2003-02-27; startDate 2003-02-27; endDate 2006-05-04; coalition Likud (incl. YB) + Shinui + NU + NRP = 68; confidence vote 66–48; NRP and Sharansky sworn in 3 Mar; YB faction ends 10 Mar 2003; pm-recommendations and first-government list membership (9 items) | OData GovernmentNum 30 (rank 1): Eitam (763), Orlev (521), Sharansky (535) StartDate 2003-03-03; `KNS_Faction` 53 "ישראל בעלייה בראשות נתן שרנסקי" 2003-02-17→2003-03-10; Olmert PM to 2006-05-04. Ynet 28.02.03: "שני שרי המפד"ל איתם ואורלב והשר שרנסקי יושבעו ביום שני הקרוב"; INN 26 Feb: "The coalition will number 68 MKs"; Elaph 27 Feb: "66 نائبا صوتوا الى جانب الثقة بالحكومة في مقابل 48" |
| Term events | disengagement Aug 2005; Kadima Nov 2005; Sharon stroke 2006-01-04 and Olmert acting; next election 2006-03-28; term start (4 items) | OData Sharon PM ends 2006-01-04; `KNS_Faction` 542 "אחריות לאומית" from 2005-11-23, renamed 562 "קדימה" 2006-01-17; Ynet 22.11.05 "הבחירות יתקיימו ב-28 במרס"; JVL/Knesset text quoted above |
| Joint lists | Constituents of אמת, ל, מרצ, ג, ו, עם and joint-facts counts (6 items) | Official list titles in YP 5155 name the components (e.g. "האיחוד הלאומי - ישראל ביתנו - מולדת - תקומה", "מרצ - הבחירה הדמוקרטית - שחר"); OData later factions: UTJ split 2005-01-12 (422 דגל התורה, 424 אגודת ישראל), Hadash/Ta'al split 2006-02-07 (602, 604) |
| Meta notes | "Am Ehad joined the faction only in 2005"; Hadash–Ta'al split 2006-02-07 (2 items) | OData `KNS_Faction` 502 "העבודה - מימד - עם אחד" 2005-05-23; 50 "חד"ש - תע"ל" ends 2006-02-07 |
| Context | Balad, Bishara, Tibi: CEC disqualification overturned by the Supreme Court (3 items) | IDI https://www.idi.org.il/articles/65951 (rank 3): "2003 \| בל"ד \| הפסילה בוטלה", "2003 \| עזמי בשארה (בל"ד) \| הפסילה בוטלה", "2003 \| אחמד טיבי (חד"ש-תע"ל) \| הפסילה בוטלה" |
| Context | `result-source-comparison-k16` and `-ף` events (2 items) | Arithmetic re-done: printed lines − printed valid = 410 = (132,730 − 132,370) + (883 − 833) |
| Logos | Labor–Meimad, Am Ehad, Ahavat Yisrael (Commons), Hadash, Balad (archived 20 Jan 2003). Evidence matches claims (5 items) | Commons raw pages: "Logo used in an ad for the Labor_meimad List in the Israeli election of 2003"; "Logo of … 'One Nation' Party of Amir Peretz, in 2003", source NLI Ephemera 700128369; Ahavat Yisrael, NLI 700080849, category "Israeli legislative election, 2003" |
| Bios | 135 links: every `knessetPersonId` resolves to the same person as the candidate (spelling variants only, e.g. בן-אליעזר, מח'ול, אברהם-בלילא) (1 item) | OData `KNS_Person` via `data/raw/k16/knesset-odata-members.json` and live checks |
| Party links | No English Wikipedia. IDI platform files live (likud-16.doc, shinui-16.pdf, balad-16.doc → HTTP 200). Hebrew Wikipedia labelled secondary (1 item) | curl with project UA |
| Election context | No PM contest for k16 (direct election abolished 2001); none recorded (1 item) | n/a |
| Aftermath | `knesset-history` quotes present on the cited mirror (1 item) | JVL page text, quoted above |

Total OK items: 116.

## Not done or limited

- Full non-winning rosters (Likud 114, Labor 120, Shinui 120 and others beyond the elected prefix) were spot-checked
  only (finding 4 came from that sample). Herut, Progressive National Alliance, Lehava and Lider rosters remain
  unavailable in the app. Lehava's 12 names are legible on YP 5148 p. 1202 if the fixer wants to add them.
- Knesset `main.knesset.gov.il` pages (government 30 page, elections16 results) were challenged; OData was used
  instead.
