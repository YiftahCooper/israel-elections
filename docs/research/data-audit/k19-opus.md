# Data audit k19 (22 January 2013, 19th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `d2c1ed0` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 519 | Counted per field: 10 national totals; date and Knesset number; 32 lists × letters, votes and seats; 30 list names; threshold and full seat reproduction; 7 surplus pairs; 120 elected names; 120 elected Knesset person IDs; 6 later entrants' IDs; 9 joint-list party assignments; 4 joint-facts rows; government and recommendation bloc schemes; 14 aftermath facts; 5 context events; status note; 7 logo entries; 37 list link targets; 9 family dataset hashes; 2 UI threshold statements |
| WRONG | 6 | Context event attached to the wrong list; Hatnua logo is a 2019 redesign; Balad name copies a gazette misprint; 2 stale aftermath gaps; leading space in the UTJ name |
| UNSUPPORTED | 4 | Constituent-party assignments resting on Hebrew Wikipedia alone (better sources exist); one non-verbatim gazette quote; Meretz logo date is an uploader's assertion imported from English Wikipedia; one stale doc line |
| UNVERIFIABLE | 0 | |
| DISPUTED | 1 | Per-list votes for Likud–Beiteinu, Kadima and Hayisraelim: CEC final results vs the statutory results notice YP 6540, both rank 1 |

Main points:

- **The official results notice is retained.** `data/raw/k19/results.pdf` is Reshumot YP 6540 (30 Jan 2013), the
  "הודעה על תוצאות הבחירות לכנסת התשע עשרה". I rendered it and checked every vote, seat and elected name against it.
- **All results reproduce.** A fresh pull of both data.gov.il datastores (10,109 polling rows; 1,184 localities) gives
  exactly the app's registered, cast, invalid and valid totals and all 32 list totals. My own Bader-Ofer run (2%
  threshold 75,854.84; 7 pairs from YP 6530) gives all 120 gazetted seats.
- **All 120 elected names and Knesset IDs check out.** All 120 elected names match YP 6540 §4 in order (spelling
  follows the candidate gazette YP 6524; differences are only spelling variants). All 120 Knesset person IDs in
  `bios/k19.json` equal the opening membership in a fresh Knesset OData pull, with no extras and none missing.
- **Recommendations (82 for Netanyahu, 38 none), formation dates, the 68–48 vote, the 93–0 dissolution and the term
  dates are all confirmed.**
- No English Wikipedia URL anywhere (`grep en.wikipedia` = 0 in `data/meta/k19.json`, `aftermath/k19.json`,
  `bios/k19.json`, `logos/k19.json`, `party-links/k19.json` and `public/data/k19.json`). One indirect use: see #9.
- **Withdrawn lists.** None of the 32 lists shown withdrew. The two approved rosters that did not run, זה ("עתיד אחד – נלחמים
  בסם החדש") and פך ("נצח"), are absent from the dataset by documented design (DATA.md §K19). The data.gov datastore
  confirms they had zero-vote columns. So the k22 class of error ("withdrew but `withdrawn:false`") does not occur here.
- **Reversed parentheses.** None found in any k19 name, sponsor or note. The 9 candidate names with bracketed
  nicknames are correctly ordered, e.g. `עמרם אהובה (יצחק)`.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M | `data/meta/election-context.json` | `events[id="result-source-comparison-k19-הי"]` (`.id`, `.listId`) | `listId: "19-הי"` (Moreshet Avot, 461 votes; identical in both sources) | `listId: "19-יק"` (Hayisraelim), id `…-k19-יק`. The event text itself names "−2 Hayisraelim". Moreshet Avot has no discrepancy. | WRONG | YP 6540 p. 2492 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-results.pdf; data.gov ballots datastore (1) https://data.gov.il/api/3/action/datastore_search?resource_id=432d3185-545a-41d9-8c72-d10ee515919c | YP 6540: "הי מורשת אבות 461"; "יק הישראלים 18,941". Datastore sums: הי = 461, יק = 18,939 | 2026-11-06 |
| 2 | M | `data/meta/logos/k19.json` | `logos[0]` (צפ, `logos/hatnuah-2013.svg`, `inUseEvidence`, `status: verified`) | Hosted SVG sha256 `10365577…` presented as the 2013 campaign logo, on the basis that "Commons records the original design upload on 27 November 2012" | The hosted file is the current Commons revision: a **26 Jan 2019 "update"**, cleaned up on 13 Mar 2019. It is a bare red-and-blue "התנועה." wordmark. The pre-2019 revision (transferred from he.wikipedia, original upload 2012-11-27) is a different design: white "התנועה." on dark blue with "בראשות ציפי לבני". The 2012 date does not support the hosted artwork. Withhold the logo or re-source the pre-2019 revision with its own dated evidence. | WRONG | Wikimedia Commons file history (API) https://commons.wikimedia.org/wiki/File:Hatnuah_logo.svg (provenance record) | imageinfo: "2019-03-13T19:40:19Z Sokuya Clean up"; "2019-01-26T18:28:58Z רונאלדיניו המלך update"; "2015-03-18T12:40:45Z PanchoS … Date = {{Original upload date\|2012-11-27}}". sha256 of the current original = `10365577e441…` = hosted file; the 2015 revision is `c3b73d46…` | 2026-11-06 |
| 3 | L | `data/raw/k19/results.pdf` → `public/data/k19.json` | `lists[10].nameHe` (19-ד) | `בל"ד - אלתג'אלווטני אלדמוקרטי` | `בל"ד - אלתג'מוע אלווטני אלדמוקרטי`. YP 6540 really prints the merged misprint (checked on the rendered page). The approved candidate notice YP 6524 and the agreement notice YP 6530 both print the correct name. Keep the YP 6524 form and add a note. | WRONG | YP 6524 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset19-cand.pdf; YP 6530 p. 2156 (1) https://olaw.org.il/yalkut/yalkut-6530.pdf | YP 6524: "כינוי הרשימה : בל"ד - אלתג'מוע אלווטני אלדמוקרטי"; YP 6530: ".3 בל"ד - אלתג'מוע אלווטני אלדמוקרטי - ד" | 2026-11-06 |
| 4 | L | `data/meta/aftermath/k19.json` | `gaps[3]` | "No included term event meets the two-chronology rule; candidate list is not a factual chronology." | Remove (stale). `term.events` holds two events with two independent chronologies each (Protective Edge: IDF, SIPRI, Reuters, OCHA; dismissals: IDI ×2, IPU). | WRONG | Internal; SIPRI YB 2015 Annex C (3) https://www.sipri.org/sites/default/files/SIPRIYB15cC.pdf; IDI (3) https://en.idi.org.il/articles/6104 | SIPRI: "…launches Operation Protective Edge against Gaza"; IDI: "On December 2, 2014, Prime Minister Benjamin Netanyahu fired Finance Minister Yair Lapid and Justice Minister Tzipi Livni." | 2026-11-06 |
| 5 | L | `data/meta/aftermath/k19.json` | `gaps[0]` | "CEC certification date not retrieved." | The retained YP 6540 notice is signed by CEC chair Rubinstein "י"ז בשבט התשע"ג" = **28 January 2013**. Its printed Gregorian "(18 בינואר 2013)" is a gazette misprint: 1 Shevat 5773 = 12 Jan 2013, and the same notice is dated "י"ט בשבט התשע"ג … 30.1.2013". Record 2013-01-28 with a note on the misprint, or keep the gap with that explanation. | WRONG | YP 6540 p. 2495 (1), URL as #1 | "י"ז בשבט התשע"ג (18 בינואר 2013) … אליקים רובינשטיין … יושב ראש ועדת הבחירות המרכזית"; header: "י"ט בשבט התשע"ג 6540 30 בינואר 2013" | 2026-11-06 |
| 6 | L | `data/meta/k19.json` → `public/data/k19.json` | `lists[2].nameHe` (meta), `lists[5].nameHe` (public, 19-ג) | `" יהדות התורה והשבת, אגודת ישראל - דגל התורה"` (leading space) | `"יהדות התורה והשבת, אגודת ישראל - דגל התורה"` | WRONG | YP 6540 (1), URL as #1 | "ג … יהדות התורה והשבת, אגודת ישראל - דגל התורה" | 2026-11-06 |
| 7 | L | `data/meta/k19.json` | `lists[1].parties[*].sources` (טב: jewish-home 1,3,5,6,8,9,11,12; tkuma 2,4,7,10,13); `lists[2].parties[*].sources` (ג: Agudah 1,3,5,6; Degel 2,4,7); `lists[3].parties[2]` (mada 5); `lists[0].parties[0].evidenceGroups[1]` (Rivlin #11) | Hebrew Wikipedia is the only source. The assignments themselves are correct. | Keep the assignments and add rank-4 sources. For Tkuma, Jewish Press 19 Nov 2012 lists the Tkuma slate in order (Ariel, Ben Dahan, Kalfa, Strook, Horowitz, Eyal) and Ynetnews gives the merged ranks 1–15. Rivlin's Likud membership is on his Knesset MK page (rank 1). | UNSUPPORTED (Hebrew WP sole basis) | Jewish Press (4) https://jewishpress.com/national-union-chooses-mks-uri-ariel-replaces-katz-as-party-chair/; Ynetnews (4) https://www.ynetnews.com/articles/0,7340,L-4313682,00.html; INN (4) https://www.israelnationalnews.com/news/162803 | Jewish Press: "Following Ariel, Tekuma/National Union's list is as follows: … Rabbi Eli Ben Dahan, Zevulon Kalpa, Orit Strook, Hillel Horowitz, and … Nachi Eyal." Ynetnews: "1. Naftali Bennett 2. Uri Ariel 3. Nissan Slomiansky 4. Rabbi Eliyahu Ben Dahan … 13. Rabbi Hillel Horwitz" | 2026-11-06 |
| 8 | L | `data/meta/k19.json` | `lists[3].sources[0].quote` (עם) | "כינוי הרשימה : הרשימה הערבית המאוחדת - התנועה הערבית להתחדשות - המפלגה הערבית הדמוקרטית", attributed to the candidate gazette | Not verbatim: YP 6524 p. 1992 prints "המפלגה **העקבית** הדמוקרטית" (a gazette typo, checked on the rendered page). The app's list name is right. Quote and cite YP 6540 instead, or quote YP 6524 exactly and note the typo. | UNSUPPORTED | YP 6524 p. 1992 (1); YP 6540 (1) | YP 6524: "הרשימה הערבית המאוחדת - התנועה הערבית להתחדשות – המפלגה העקבית הדמוקרטית"; YP 6540: "…המפלגה הערבית הדמוקרטית" | 2026-11-06 |
| 9 | L | `data/meta/logos/k19.json` | `logos[1]` (מרצ, `inUseEvidence`) | "Commons dates the party-website design to December 2012…" | Literally true, but the date is an unsourced `Date = 2012-12` field on a page **imported by FileImporter from English Wikipedia**. Commons' own history starts on 28 Jul 2016, and the file was revised on 1 Aug 2022. No dated 2013 usage was inspected. Treat this as unproven provenance (lower confidence or re-source), not as verified. | UNSUPPORTED | Commons raw page https://commons.wikimedia.org/w/index.php?title=File:Meretz_Logo.svg&action=raw | "<!--This file was moved here using FileImporter from https://en.wikipedia.org/wiki/File:Meretz_Logo.svg--> … \|Date = 2012-12" | 2026-11-06 |
| 10 | L | `docs/DATA.md` | line 384 (§"K19 implementation") | "Thus **k19 remains `available: false`**" | Stale. `public/data/elections.json` has k19 `available: true`, and DATA.md's own table (line 97) says "Released on the CEC final figures". | UNSUPPORTED (stale doc) | Internal | `"id": "k19", … "available": true` | 2026-11-06 |
| 11 | M | `data/raw/k19/final-results.capture.json` → `public/data/k19.json` | `lists[0].votes` (מחל), `lists[11].votes` (כן), `lists[17].votes` (יק) | 885,163 / 78,974 / 18,939 (CEC final web results; data.gov polling and locality datastores) | Statutory notice YP 6540 §1: **885,054 / 79,081 / 18,941**. Seats are identical either way, and the gazette's printed total (3,792,472) is itself a misprint of its own sum (3,792,742). The data already discloses this (decisions 0041–0042, status note, list notes, context events). But source-hierarchy.md says that within rank 1 "the official notice beats a later summary". The current choice follows the polling-station sums rather than that rule, so it needs confirming as an owner decision. | DISPUTED | (a) YP 6540 p. 2492 (1); (b) data.gov ballots + localities datastores (1), fresh pull: 10,109 + 1,184 rows; (c) CEC Results_eng page (1), HTTP 403 to scripts, not re-read | (a) "מחל … 885,054"; "כן … 79,081"; "יק … 18,941"; "סך כל הקולות הכשרים 3,792,472". (b) column sums: מחל 885,163; כן 78,974; יק 18,939; כשרים 3,792,742 | 2026-11-06 |

Recommendation on #11: keep the CEC/datastore figures. They reconcile to every polling station and to their own
totals, while the gazette is internally inconsistent. Record this as an explicit exception to the same-rank rule
(statutory notice internally inconsistent; station-level official data agree) rather than leave it implicit.

## Gaps and observations (not counted above)

- **Later entrants without bios.** `bios/k19.json` has `null` for `19-אמת#17` "מגדלה גאלב" (Ghaleb Majadele;
  OData PersonID 2014, MK from 2014-12-14, replacing Ben-Eliezer) and for `19-מחל#34` "ליטינצקי ליאון" (OData
  PersonID 11235, MK from 2014-11-05). Both served in the 19th Knesset. The 6 other later entrants (Shama-Hacohen,
  Ben Tzur, Miller, Zellner, Edri, Horowitz) have IDs that match OData. Source: fresh OData pull,
  `KNS_PersonToPosition?$filter=KnessetNum eq 19 and (PositionID eq 43 or PositionID eq 61)`, 128 rows over 2 pages,
  plus `KNS_Person(2014)` "מג'אדלה ראלב" and `KNS_Person(11235)` "ליטינצקי לאון".
- **No replacement notes for k19.** `data/meta/candidate-notes.json` has no k19 entries, so the roster shows no
  "replaced X on date" notes, although `k19.json` party assignments already use ranks 32–34 and טב #13. This matches
  the documented "later changes are not applied" policy. It is listed here because the brief asks whether
  replacements are noted.
- **Withdrawn rosters.** זה and פך are omitted rather than shown as withdrawn, unlike k23, which shows Tzomet
  explicitly withdrawn. This is documented in DATA.md and is a consistency choice for the owner, not an error.
- **Gazette misprints the app does not use:** YP 6524's page footers print "2.1.2012" for 2.1.2013; YP 6524 prints
  "בהכוונת" for Am Shalem where YP 6540 and YP 6530 print "בראשות" (the app follows the latter, correctly).
- `blocSchemes[0].sources` (first government) cites Hebrew Wikipedia twice, plus OData. IDI and JTA (cited in the
  aftermath file) would be better second sources for the coalition and date.
- `aftermath/k19.json` has `status: "pilot"` and says it is "not wired into the app". Its facts were audited anyway.

## Checked and found OK

| Area | What | Source (rank) | Evidence |
|---|---|---|---|
| Totals | registered 5,656,705; cast 3,833,646; invalid 40,904; valid 3,792,742; 10,109 boxes; 1,184 localities | data.gov.il ballots datastore `432d3185…` and localities datastore `c20cdcef…` (1), fresh pulls; YP 6540 §2 (1) for invalid | Datastore column sums match exactly. YP 6540: ".2 מספר הקולות שנמצאו פסולים 40,904" |
| Envelopes | Code 875: cast 215,789, invalid 2,840, valid 212,949 | as above | Localities file sums (cast 3,617,857; invalid 38,064) + envelope row = national totals |
| Date / number | 2013-01-22; 19th Knesset | YP 6524 / YP 6540 (1); IPU (official) | "הבחירות לכנסת התשע עשרה" |
| 32 lists | Letters, names (30 OK; see #3, #6) and votes for the 29 lists not in #11 | YP 6540 §1 (1), rendered p. 2492; datastore (1) | Every value equal |
| Seats | 31/19/15/12/11/7/6/6/4/4/3/2; 20 lists 0 | YP 6540 §3 (1) | Independent Bader-Ofer run: all 120 match; threshold 75,854.84 → 12 lists pass (Kadima 78,974 passes either way) |
| Surplus | אמת–פה, ג–שס, ד–ו, זך–צק, טב–מחל, כן–ץ, צפ–מרצ | YP 6530 p. 2156 (1), dated 13 Jan 2013 | All 7 pairs as listed |
| Elected | 120 names in rank order | YP 6540 §4 (1) | Set-equal names for all 120. Spelling variants follow YP 6524 (e.g. סויד/סוייד, חוטובלי ציפי/צפורה, פירון/פרון, ועקנין/וקנין, בן דהן אליהו מיכאל/אלי) |
| Rosters | 1,595 candidates; spot checks ץ 15, קנ 14, רק 10, עם #1–6 | YP 6524 (1) | Counts and order match the rendered pages |
| Knesset IDs | 120 elected + 6 later entrants | Knesset OData (1), fresh pull | Opening set (StartDate 2013-02-05) = elected set exactly |
| Joint lists | מחל: Likud 20 / YB 11 elected (+#32 Likud, #33–34 YB); טב 8/4 (+#13 Tkuma); ג 4/3; עם Ra'am 3, Ta'al 1, Mada #5 | OData factions 2014–15 (1); Jewish Press, Ynetnews, INN (4); YP 6524 p. 1992 (1) for סאנע טלב #5 | Assignments correct (sourcing gap: #7) |
| Joint facts | 4 rows (seats, elected per party) | Internal vs above | Consistent |
| Government | 33rd government (Netanyahu III), sworn in 18 Mar 2013; Likud-Beiteinu 31, Yesh Atid 19, Jewish Home 12, Hatnua 6 = 68; opposition 52 | IDI, Kenig 19 Mar 2013 (3) https://en.idi.org.il/articles/6889; JTA (4) | "On March 18, 2013, the 33rd government … Likud-Beiteinu (31 seats), Yesh Atid (19), Habayit Hayehudi (12), and Tzipi Livni's Hatnua (6)" |
| Recommendations | 30–31 Jan 2013; Netanyahu 82 (מחל, פה, טב, שס, ג, כן); none 38 (אמת, צפ, מרצ, עם, ו, ד) | Walla 1 Feb 2013 (4) https://news.walla.co.il/item/2612671; ynet 31 Jan 2013 (4); Behadrei Haredim 31 Jan 2013 (4) | Walla: "בסיכום יומיים של התייעצויות, 82 חברי כנסת המליצו על נתניהו … מלבד קדימה, המפלגות האחרות בגוש השמאל לא המליצו על איש". Lapid spoke "ביום רביעי" (30 Jan). Balad's placement follows from 82 + 38 = 120 and is correctly qualified in its note |
| Formation | Tasked 2 Feb; extension 2 Mar to 16 Mar; informed 16 Mar; vote 68–48 with 4 absent, 18 Mar | ToI 16 Mar and 2 Mar 2013 (4), read via Exa (direct HTTP 403); JTA 18 Mar 2013 (4) | "Peres charged him with the task on February 2"; "allowing him through March 16"; "by a vote of 68 to 48, with four absent" |
| Knesset sworn in | 5 Feb 2013 | OData StartDate (1); IPU (official) | "Date of the first session of the new parliament: 5 February 2013" |
| Term events | Protective Edge 8 Jul–26 Aug 2014 (named as an Israeli operation after rocket attacks); Lapid and Livni dismissed 2 Dec 2014 | SIPRI YB 2015 (3); IDI ×2 (3) | Quotes confirmed in the source text. Wording meets the editorial stance |
| End of term | Dissolution law 8 Dec 2014, 93–0, election 17 Mar 2015; government ended 14 May 2015 | ynet 9 Dec 2014 (4) https://www.ynet.co.il/articles/0,7340,L-4601174,00.html; News1 (4); JTA and Haaretz 14 May 2015 (4) | "93 חברי כנסת תמכו בפיזור הכנסת ללא מתנגדים"; "approved and sworn in … 61-59" |
| Context | Zoabi disqualification reversed; double envelopes moved a seat from Ra'am–Ta'al to Jewish Home; result-comparison events for מחל and כן | IDI 65951 (3); Knesset RIC paper 24 Mar 2019 (3) https://fs.knesset.gov.il/globaldocs/MMM/2e5ce5ea-ec1e-e911-80e1-00155d0a98a9/2_2e5ce5ea-ec1e-e911-80e1-00155d0a98a9_11_10970.pdf | RIC: "בבחירות לכנסת ה-19 (2013), עבר מנדט אחד מרשימת רע"מ-תע"ל לרשימת הבית היהודי" |
| Status note | Gazette total 3,792,472 vs list sum 3,792,742 (Δ 270); differences +109/−107/−2 | YP 6540 (1) | Recomputed |
| Logos | Kadima (Commons log 25 Oct 2012 "מדויק מpdf באתר המפלגה"; hosted = current sha); Likud-Beiteinu withheld as unresolved; Hadash (artwork carries the ballot letter ו); Jewish Home list and party (CDX digest SWOWEK… from 2012-12-18 through 2013-01-22); Ta'al (CDX DEXNGM… last pre-poll row 2011-09-03); Balad (CDX U7VEQT… last pre-poll row 2010-07-12) | Commons API; Wayback CDX API | Claims match the evidence (except #2 and #9) |
| Links | 37 list and party links | YP 6540 is the results notice, so the "הודעת התוצאות" titles are correct here (unlike k22). The hewiki targets for זך (Gil, ran as דור בוני הארץ), צק, נ and נץ are the right entities | he.wikipedia raw text checked |
| Families | 9 files, k19 `datasetSha256` | sha256 of `public/data/k19.json` = `6b6373ab…` | All current |
| UI | Threshold "2% in 2006–2013" (glossary, What-if) | Election law as amended 2014 (well known; not re-fetched) | Consistent with the k19 rule set `il-2004-bader-ofer-2` (threshold 1/50) |

Access notes: gov.il CEC result pages and main.knesset.gov.il returned bot challenges or 403 to scripts. They were not
circumvented; Exa or other outlets were used instead. Times of Israel returned 403 directly and was read via Exa.
