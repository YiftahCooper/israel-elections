# k17 (28 March 2006) data audit — Opus auditor

Auditor: Claude Opus 5.5, 6 November 2026. Method: [BRIEF.md](BRIEF.md). Source ranks: [source-hierarchy.md](../source-hierarchy.md).
No data was edited. Scans were re-rendered locally (pdfjs-dist, scale 2.5–6) from the retained files, and every
elected name in the results notice was read again, independently of `candidates.reviewed.json`.

## Summary

| Class | Count | Notes |
|---|---|---|
| OK | ≈467 claims | Grouped in the OK table below. |
| WRONG | 13 | Includes 5 elected-member names, 3 ballot-list names, the joint-list faction counts (known bug), the "dissolution" date and 3 stale texts. |
| UNSUPPORTED | 0 | |
| UNVERIFIABLE | 2 | UTJ #6 constituent party; the 2006 name of Ahi. |
| DISPUTED | 1 | National Union–NRP's first recommendation. The data already records it. |
| Omissions (not a class) | 2 | Yisrael Beiteinu's 2006–2008 period in the coalition; Shas #11's English name. |
| Minor/provenance notes | 4 | Not factual errors. |

English Wikipedia: none found in any k17 file (`grep en.wikipedia` over meta, bios, links, logos, raw and public data).
Editorial stance: no partisan wording found. Term events name Hezbollah and Hamas as terrorists, which follows the stance.

**Most serious findings**

1. Five elected MKs' names differ from both official notices. These are Yisrael Beiteinu #3 Hasson (ארדי vs printed **אדוי**), NU–NRP #7 Gabbay (ברוך vs **בדור**), NU–NRP #5 (סלומינסקי vs **סולומינסקי**), Likud #10 Livnat (אהובה vs **אהבה**) and the Landver trailing hyphen. `candidates.reviewed.json` also records the wrong forms as `resultsNamesHe`, so the "checked name by name against section 4" claim in the dataset status is not true for these ranks.
2. Three ballot names of seat-winning lists differ from the gazettes: Meretz, Balad and Ra'am–Ta'al. The wrong forms are copied into `parties.json` and three family files.
3. `aftermath` formation.events[2] and term.endedBy say "The Knesset dissolved" on 10 November 2008. The Knesset passed no dissolution law (OData). Elections followed the President's 27 October notice under Basic Law: The Government ss. 10–11. A 10 November start is also arithmetically inconsistent with a 10 February election.
4. `joint-facts.json` faction counts for all four k17 joint lists are wrong (the known name-matching bug). Correct opening counts are below.
5. Stale gap texts. The "certification date not retrieved" gap is answered by the retained results notice (signed 4 April, published 5 April 2006). The party-links gap says IDI supplied no Kadima, Labor or NU–NRP platform, but IDI hosts all three.

## Non-OK findings

| # | File | JSON path | Current | Correct | Class | Source | Rank | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | data/raw/k17/candidates.reviewed.json → public/data/k17.json | `lists[14]` (ל) `.candidates[2].nameHe`, plus `electedCrossCheck.namesHe[2]`, `resultsNamesHe[2]` and `transcriptionCorrections` (ל rank 3, "after") | חסון ארדי ישראל | חסון אדוי ישראל | WRONG | Candidate notice YP 5504 p. 2193 (`k17-candidates-gazette`, https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset17-cand.pdf); results notice YP 5514 p. 2467 (`k17-results-gazette`, …/knesset17-results.pdf) | 1 | p. 2193 rank 3: family "חסון", given "אדוי ישראל"; p. 2467 §4(ח) 3: "חסון אדוי ישראל". Read at scale 5–6; the second letter is clearly ד and the third ו. The earlier corrections "ארני" and "ארדי" are both misreadings. | 2026-11-06 |
| 2 | same | `lists[9]` (טב) `.candidates[6].nameHe` and both crossCheck arrays | גבאי אליהו ברוך | גבאי אליהו בדור | WRONG | YP 5504 p. 2190 rank 7; YP 5514 p. 2466 §4(ו) 7 | 1 | Both notices: "גבאי — אליהו בדור". Corroborated by Hebrew WP (rank 5): "אליהו בדור גבאי (נולד ב-5 בינואר 1943)" | 2026-11-06 |
| 3 | same | `lists[9]` (טב) `.candidates[4].nameHe` and both crossCheck arrays | סלומינסקי ניסן | סולומינסקי ניסן | WRONG | YP 5504 p. 2190 rank 5; YP 5514 p. 2466 §4(ו) 5 | 1 | Both notices: "סולומינסקי — ניסן". Knesset OData spells the MK "סלומינסקי ניסן"; keep the printed form and note the variant, as for other names. | 2026-11-06 |
| 4 | same | `lists[15]` (מחל) `.candidates[9].nameHe` and both crossCheck arrays | לבנת לימור אהובה | לבנת לימור אהבה | WRONG | YP 5504 p. 2194 rank 10; YP 5514 p. 2468 §4(ט) 10 | 1 | Both notices: "לבנת — לימור אהבה" | 2026-11-06 |
| 5 | same | `lists[14]` (ל) `.candidates[6].nameHe` (and namesHe/nameVariants) | לנדבר אהרון- סופיה סוניה | לנדבר-אהרון סופיה סוניה, or the results-notice form לנדבר אהרון סופיה סוניה | WRONG (hyphen-split artefact) | YP 5504 p. 2193; YP 5514 p. 2467 | 1 | p. 2193 prints "לנדבר" with "אהרון–" wrapped on the next line of the family-name column. p. 2467 prints "לנדבר אהרון". The same notice wraps Kadima #40 as "שמאלוב–" over "ברקוביץ'", which the data correctly joins as "שמאלוב-ברקוביץ'". A hyphen at the end of a wrapped line is the compound joiner, not a trailing character. | 2026-11-06 |
| 6 | data/raw/k17/national.reviewed.json → public/data/k17.json; also data/meta/parties.json (line ≈11182), data/meta/families/labour-zionist-left.json (≈2896) | `lists[16]` (מרצ) `.nameHe` | מרצ - ישראל החברתית דמוקרטית | מרצ - ישראל חברתית דמוקרטית | WRONG | YP 5514 p. 2464 §1, p. 2465 §3, p. 2468 §4(י); YP 5504 p. 2195 header; Knesset OData KNS_Faction 640 "מרצ-ישראל חברתית דמוקרטית" | 1 | "מרצ – ישראל חברתית דמוקרטית" (no ה, in all three places) | 2026-11-06 |
| 7 | national.reviewed.json → public; parties.json (≈10296); families/arab-arab-jewish.json (≈3174) | `lists[2]` (ד) `.nameHe` | אלתג׳מוע אלווטני אל דמוקרטי - בל״ד | אלתג׳מוע אלווטני אל דימוקרטי - בל״ד | WRONG | YP 5514 p. 2464 §1, p. 2466 §4(ג); YP 5504 p. 2186; YP 5510 p. 2386 pair 3; OData KNS_Faction 626 "אלתג'מוע אלווטני אל דימוקרטי-בל"ד" | 1 | "אלתג'מוע אלווטני אל דימוקרטי – בל"ד" | 2026-11-06 |
| 8 | national.reviewed.json → public; data/meta/k17.json; parties.json (≈13392, 13398); families/arab-arab-jewish.json (≈3110); families/religious-parties.json (≈3544) | national `lists[18]` (עם) `.nameHe`; meta `lists[3].nameHe` | הרשימה הערבית המאוחדת והתנועה הערבית להתחדשות | הרשימה הערבית המאוחדת התנועה הערבית להתחדשות | WRONG | YP 5514 p. 2464 §1, p. 2468 §4(יא); YP 5504 p. 2196 header; OData KNS_Faction 636 (same text) | 1 | "הרשימה הערבית המאוחדת התנועה הערבית להתחדשות" (no ו) | 2026-11-06 |
| 9 | data/meta/joint-facts.json | `17-אמת`, `17-טב`, `17-ג` and `17-עם`: `.parties[].factions[].seats` and `unknownFaction` | Labor 12 + 6 unknown, Meimad 1; Moledet 2, Tkuma 1+1, Ahi 1+1, NRP 2+1; Agudat 3+1, Degel 1+1; Ra'am 2, Ta'al 1, ADP 0+1 unknown | All in the list's faction at the opening (17 April 2006), unknown 0: Labor 18, Meimad 1 (faction 624, 19); Moledet 2, Tkuma 2, Ahi 2, NRP 3 (faction 642, 9); Agudat 4, Degel 2 (faction 632, 6); Ra'am 2, Ta'al 1, ADP 1 (faction 636, 4) | WRONG (known name-matching bug) | Knesset OData `KNS_PersonToPosition?$filter=KnessetNum eq 17 and PositionID eq 54`, **all 183 rows across 2 pages** | 1 | Opening rows (StartDate 2006-04-17): 624 → 19, 642 → 9, 632 → 6, 636 → 4. Note: the cited URL without following `odata.nextLink` returns only 100 rows (624 → 10, 642 → 7, 632 → 2, 636 → 3), so pagination may also contribute. | 2026-11-06 |
| 10 | data/meta/aftermath/k17.json | `formation.events[2]` (type knesset-dissolved, date 2008-11-10, textEn/He), `term.endedBy.date` and `.textEn/He` | "The Knesset dissolved" on 2008-11-10 | No dissolution law passed. On 2008-10-27 President Peres notified the Speaker that no government could be formed (Basic Law: The Government s. 10). No 61-MK request came within 21 days (until about 17 November), so under s. 11 the election fell on the last Tuesday before the end of 90 days: 10 Feb 2009. Suggested wording: "After Livni failed to form a government, the President notified the Speaker on 27 October 2008 that no government could be formed; elections were held on 10 February 2009." | WRONG | (a) Knesset OData KNS_Bill, KnessetNum 17, Name contains "התפזרות": five private bills, none passed (StatusID 104/150); (b) Globes, 27 Oct 2008, https://www.globes.co.il/news/article.aspx?did=1000391733 (rank 4); (c) Hebrew WP "הכנסת השבע עשרה" (rank 5, lead only); the IPU (cited, rank 3) says "early dissolution on 10 November 2008" | 1/4 | Globes: "יודיע הנשיא ליו"ר הכנסת כי הוא אינו רואה אפשרות להקמת ממשלה. מרגע זה תחל ספירה של 21 יום … אם לא יוגש מכתב כזה, יודיע הנשיא ליו"ר הכנסת על הליכה לבחירות והן צפויות להתקיים בתוך 90 יום". Arithmetic: 10 Nov + 90 days = 8 Feb (Sunday), so the last Tuesday would be 3 Feb, not 10 Feb. 17 Nov + 90 = 15 Feb, so the last Tuesday is 10 Feb ✓. | 2026-11-06 |
| 11 | data/meta/aftermath/k17.json | `gaps[0]` | "Certification date and official first-sitting record not retrieved" | Results notice signed 4 April 2006 by Justice Dorit Beinisch and published in YP 5514 on 5 April 2006 (retained `k17-results-gazette`). First sitting: 17 April 2006 (OData faction memberships start 2006-04-17; `joint-facts` openingDate already uses it). | WRONG (stale gap) | YP 5514 p. 2468; OData KNS_Faction 622–690 StartDate | 1 | "ו' בניסן התשס"ו (4 באפריל 2006) … דורית ביניש … יושבת ראש ועדת הבחירות לכנסת השבע עשרה"; masthead "5514 … 5 באפריל 2006" | 2026-11-06 |
| 12 | data/meta/party-links/k17.json | `gaps["17-כן"].partisan`, `gaps["17-אמת"].partisan`, `gaps["17-טב"].partisan` | "IDI row matching and reviewed live/archive sources did not supply this identity" | IDI's 2006 page hosts platforms for all three: `/media/6739/kadima-17.pdf`, `/media/6670/עבודה-17.pdf`, `/media/6434/ihud-mafdal_2006.doc`. These should be added as partisan platform links, as for Shas and Likud. | WRONG (stale gap) | https://en.idi.org.il/israeli-elections-and-parties/elections/2006/ | 3 | The table shows "Platform" for Kadima, Labor Party and National Union; HTML hrefs as listed | 2026-11-06 |
| 13 | public/data/k17.json (generated from the build's status text) | `status.noteEn` / `noteHe` | "Every winning list includes all elected ranks, checked name by name against section 4 of the official results notice; literal name variants are documented." | It becomes true once findings 1–5 are fixed. Until then, 5 elected names do not match section 4. | WRONG (consequential) | as #1–5 | 1 | — | 2026-11-06 |
| 14 | data/meta/k17.json | `lists[2]` (ג) `.parties[0].candidateRanks` (rank 6, Yaakov Cohen → Agudat Yisrael) | Agudat | Probably right, but rank 1 cannot decide: Cohen left in July 2008 (Maklev, Degel #7, entered 2008-07-31), before the factions split on 2008-12-18. The only basis is Hebrew WP. | UNVERIFIABLE | OData PositionID 54 rows: Maklev StartDate 2008-07-31; factions 1039/1041 lack Cohen | 1 (tried) / 5 | "אגודת ישראל: יעקב ליצמן, מאיר פרוש, שמואל הלפרט, יעקב כהן, יהושע פולק" (WP, as cited) | 2026-11-06 |
| 15 | data/meta/k17.json, joint-facts.json | `lists[1]` (טב) `.parties[2].nameHe` | אח"י – ציונות דתית לאומית מתחדשת | Possibly right for 2006. The Knesset's December 2008 split faction is "אח"י - ארץ, חברה, יהדות". No 2006 primary source was found for the party's registered name. | UNVERIFIABLE | OData KNS_Faction 1040 | 1 (tried) | "אח"י - ארץ, חברה, יהדות" (2008-12-23) | 2026-11-06 |
| 16 | data/meta/aftermath/k17.json, data/meta/k17.json | `recommendationRounds[0].entries` (טב) | status none, with a note on the conflict | Already disclosed. INN says "initially endorsed Peretz", while Ynet (cited) says it asked for more time. The President's final statement records no other candidate. | DISPUTED (rank 4 vs rank 4; recorded) | https://www.israelnationalnews.com/news/101500 (5 Apr 2006); https://www.globes.co.il/news/article.aspx?did=1000081213 (6 Apr 2006) | 4 | Globes: "78 מחברי הכנסת הבאה תמכו במועמדותו של אולמרט … וזאת ללא התנגדות, או המלצה על מועמד אחר" | 2026-11-06 |

### Omissions (no wrong claim, but a fact the app should hold)

| File | Path | Missing | Source | Rank | Quote / value |
|---|---|---|---|---|---|
| data/meta/aftermath/k17.json | `government.changes` | Yisrael Beiteinu joined Government 31 on 30 Oct 2006 (Lieberman: Deputy PM and minister for strategic threats, then Minister of Strategic Affairs) and left on 18 Jan 2008. Only the 2008 Livni failure is recorded. | Knesset OData `KNS_PersonToPosition?$filter=GovernmentNum eq 31` | 1 | ליברמן אביגדור, PositionID 50 "סגן ראש הממשלה", 2006-10-30 → 2008-01-18; PositionID 39 "השר לנושאים אסטרטגיים", 2006-12-04 → 2008-01-18 |
| data/raw/k17/candidates.reviewed.json / bios | Shas `candidates[10]` (rank 11) `nameEn` | No English name; every other elected MK has one. The MK is Haim Amsalem (OData person 4418, "אמסלם חיים"), and the bios file already links him. Suggest nameEn "Haim Amsalem" with a note that the gazette prints "אמסלם אמיל". | OData; YP 5514 p. 2468 §4(יב) 11 "אמסלם אמיל" | 1 | — |

### Minor and provenance notes (not factual errors)

- `data/meta/election-context.json` `events[53].source.publisherHe` and `relatedSources[0].publisherHe` contain English text ("Central Elections Committee / Reshumot", "Project derivation …"). This is a localisation gap.
- `data/meta/party-lineage.json` sources `k17.sha256` is `f63ef83e…`, while the current `public/data/k17.json` is `d61fed68…` (the families files already use d61fed68). The hash is stale.
- Party-id mismatch for Ra'am: `datasetPartyIds` "ram" vs `partyIds`/lineage "raam" (families/arab-arab-jewish.json, religious-parties.json; party-lineage edge `partners-17-עם`).
- `data/raw/k17/national.reviewed.json` `scope` ("No complete candidate roster has been verified") and `releaseBlockers` describe the pre-release state. The dataset is released.
- The confidence-vote citation `vote2006` is a PTI/Rediff interview page. Ynet (rank 4) states it directly: "ברוב של 65 ח"כים מול 49 נגד ו-4 נעדרים אישרה אמש (יום ה') הכנסת את הממשלה ה-31" (https://www.ynet.co.il/articles/0,7340,L-3247196,00.html). Suggest replacing or adding it.

## Checked and OK

Sources: **G-R** = results notice YP 5514 (5 Apr 2006), pp. 2464–2468, retained scan; **G-C** = candidate notice YP 5504 (12 Mar 2006), pp. 2184–2201; **G-A** = YP 5510 (26 Mar 2006) p. 2386; **IDI** = https://en.idi.org.il/israeli-elections-and-parties/elections/2006/ (rank 3, accessed 2026-11-06); **OD** = Knesset OData (rank 1, live, 2026-11-06).

| Claim(s) | Count | Value(s) | Source(s) |
|---|---|---|---|
| Election date | 1 | 2006-03-28 | IDI "28.3.2006"; G-R title |
| Registered voters | 1 | 5,014,622 | IDI "Number Eligible Voters 5,014,622" (agrees with CBS 27.2) |
| Valid votes | 1 | 3,137,064 | G-R p. 2464 "סך כל הקולות הכשרים 3,137,064"; IDI |
| Invalid votes | 1 | 49,684 | G-R p. 2465 §2 "49,684" |
| Cast = valid + invalid; polling cast 9 lower (disclosed) | 2 | 3,186,748 / 3,186,739 | G-R; IDI "Total Votes 3,186,739" (IDI uses the polling figure) |
| Threshold 2% (rule set il-2004-bader-ofer-2; glossary "2% in 2006–2013") | 2 | 2% | IDI "Electoral Threshold 2%" |
| Votes for all 31 lists | 31 | as in `national.reviewed.json` | G-R p. 2464, every row; IDI table, every row |
| Seats for all 31 lists (12 winners, total 120) | 31 | as in `officialSeats` | G-R p. 2465 §3; IDI |
| Ballot letters for all 31 lists | 31 | — | G-R p. 2464 |
| Hebrew ballot names, 28 of 31 (all except #6–8) | 28 | — | G-R p. 2464 (read at scale 2.5–6) |
| Number of lists 31; no list withdrew (`withdrawn: false`) | 31 | — | 31 lists transcribed from G-C; 31 in G-R and IDI |
| Elected names, 115 of 120 (all of Kadima 29, Labor 19, Shas 12, UTJ 6, Meretz 5, Ra'am–Ta'al 4, Hadash 3, Balad 3 and Gil 7; Likud 11/12, YB 9/11, NU–NRP 7/9) | 115 | — | G-R pp. 2465–2468 §4, read independently; G-C where the reading was in doubt |
| Kadima #38–#40 wrap (רבנר ליאת יונית / רפופורט שי אביטל / שמאלוב-ברקוביץ' יוליה) | 3 | — | G-C p. 2193; the official CEC archive line "שי אביטל רפופורט" (`candidates-archive.crosscheck.json`) |
| Opening membership: 120 members, faction sizes 29/19/12/12/11/9/7/6/5/4/3/3 | 1 | — | OD KNS_PersonToPosition, all 183 rows |
| Surplus agreements: 4 pairs (Labor–Meretz, Shas–UTJ, Hadash–Balad, YB–Likud), signed 23 Mar 2006, published 26 Mar 2006 | 6 | — | G-A p. 2386: "1. העבודה – מימד … – אמת עם מרצ-יחד … – מרצ", "כ"ג באדר התשס"ו (23 במרס 2006)" |
| Labor–Meimad faction split 2008-12-18 (meta note) | 1 | — | OD KNS_Faction 624 FinishDate 2008-12-18; 1044, 1046 start 2008-12-18 |
| Constituents: Labor ranks 1–9 and 11–19, Meimad 10 | 2 | — | OD faction 1046 מימד: מלכיאור מיכאל (rank 10); 1044 holds the others |
| Constituents: NU–NRP (Moledet 1, 8; Tkuma 3, 9; Ahi 4, 6; NRP 2, 5, 7) | 4 | — | OD December 2008 factions: 1045 Moledet = Elon, Eldad; 1040 Ahi = Eitam, Levy; 1042 Jewish Home = Orlev, Slomiansky, Gabbay (NRP) and Hendel, Ariel (Tkuma). Consistent; suggest citing OD next to the Hebrew WP sources. |
| Constituents: UTJ Degel 2, 4, 7; Agudat 1, 3, 5, 8 | 2 | — | OD 1041 דגל התורה = Gafni, Ravitz, Maklev; 1039 אגודת ישראל = Litzman, Porush, Halpert, Pollak |
| Constituents: Ra'am 1, 4; Ta'al 2; ADP 3 | 3 | — | G-R §4(יא) order; parties per data (medium confidence, not contradicted) |
| Recommendations: Kadima, Labor, Shas, Gil, UTJ, Meretz → Olmert (78); Likud, YB, Ra'am–Ta'al, Hadash, Balad none; total 78/42; date 2006-04-06; mandate 6 Apr; Labor's 2 Apr Peretz recommendation switched by phone on 4 Apr | 14 | — | Globes 6 Apr 2006 (quote above; "יו"ר העבודה, עמיר פרץ הודיע לו טלפונית שלשום בערב"); INN 5 Apr 2006 ("Kadima, Labor, Shas and the Pensioners' Party all endorsed Olmert … Likud, Yisrael Beiteinu and all three Arab parties declined"; "Katsav is to meet with the United Torah Judaism Party on Thursday"). UTJ's 6 follow arithmetically from 78. |
| Government 31: number, PM Olmert, 2006-05-04 → 2009-03-31; coalition Kadima, Labor, Shas, Gil = 67; opposition 53 | 6 | — | OD GovernmentNum 31: אולמרט אהוד PositionID 45 2006-05-04 → 2009-03-31; IDI "four parliamentary groups: Kadima, the Labor Party, Shas and Gil … majority of 67 MKs" |
| Confidence vote 65–49 on 4 May 2006 | 1 | — | Ynet (quote above), INN 103099 "In a vote of 65 against 49, with four Knesset Members absent" |
| Livni's failure to form a government, 26 Oct 2008; next election 10 Feb 2009 | 2 | — | N12/Mako 26 Oct 2008: "ציפי ליבני … הודיעה לנשיא המדינה כי בתום 35 ימים של משא ומתן כשלה בניסיון להקים ממשלה"; IDI 2009 introduction PDF "ב־26 באוקטובר הודיעה לבני לנשיא … 10 בפברואר 2009" |
| Term events: Second Lebanon War 12 Jul–14 Aug 2006; Hamas takeover of Gaza June 2007; Winograd final report 30 Jan 2008; Cast Lead 27 Dec 2008–18 Jan 2009 | 4 | — | Cited MFA/CRS/IPU (not re-opened); IDI 2009 introduction (https://www.idi.org.il/media/5015/elections2009_mavo.pdf, rank 3): "השתלט על עזה ביוני 2007", "מבצע עופרת יצוקה … שהסתיימה שלושה שבועות לפני הבחירות", the abduction preceding the Lebanon war |
| Logos: NU–NRP (Commons "200d" typo; Ynet campaign launch 21 Feb 2006) and Shinui (Commons cites NLI 2006 ephemera) | 2 | — | Commons file pages (raw wikitext); Ynet L-3219211 "פורסם: 21.02.06" |
| Bio links: Knesset member pages | 132 | — | Every `mk-personal-details/{SiteId}` maps through OD KNS_MkSiteCode to the right person (Majadele OK; later-term MKs resolve to their own records) |
| Party links: hewiki targets (Kadima, Likud, YB, UTJ, Meretz, Balad, Brit Olam, Tzomet) and IDI 2006 platform files (Shas, Likud, YB, Gil, Meretz, Hadash) | 14 | — | he.wikipedia API extracts (Brit Olam: "מפלגה ישראלית שהוקמה בשנת 2005 … התמודדה בבחירות בשנים 2006"); IDI page hrefs |
| UI text: glossary threshold "2% in 2006–2013"; LocalityMap note that 2006 localities lack CBS codes | 2 | — | IDI; DATA.md / retained polling source |

## Not checked (time)

- Non-winning rosters and later ranks of the complete rosters (Kadima 120, UTJ 120, Shas 118, etc.) beyond the spot checks above.
- Locality and polling sums (8,426 boxes, 1,149 localities, 174,484 envelope votes).
- List colours (display conventions, sourced to Hebrew WP).
- Hebrew Wikipedia bio titles for non-MK candidates (11 medium-confidence matches).
- `parties.json` k17 entries beyond the name strings in findings 6–8.
