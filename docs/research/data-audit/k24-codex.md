# k24 independent audit — Codex

Audited 2026-11-06 against commit `53cca36c5a2c3442d64ebc40835139a5d93106b3`. Role: Auditor. No data edited and no dataset build run. `git merge --ff-only origin/main` reported already up to date.

## Summary and counting convention

**Core results, all registered Hebrew candidate names/ranks, the 120 opening members, surplus agreements and formation chronology checked. Lower-priority coverage remains partial**, especially biography destinations, English personal names and the historical/ideological claims behind family classifications. This is not an exhaustive factual clearance of every field in the repository.

Counts are **grouped audit rows**, not individual scalar fields: **OK 59; WRONG 2; UNSUPPORTED 3; UNVERIFIABLE 4; DISPUTED 1**. The 39 list rows each group the Hebrew identity, vote count, seats and registered roster. The 20 additional OK rows are enumerated below. Counts exclude advisory sourcing observations and the explicitly unaudited scope at the end. A non-OK evidence claim does not mean the associated historical event is false.

The most consequential factual error found is `withdrawn:false` for Demokratit (רק), whose entire roster resigned before polling day. Its zero-vote row in the CEC results is not evidence that it contested the election. No national vote/seat-total error or opening-membership mismatch was found.

## Sources and access

All source access dates below are **2026-11-06**. Ranks follow `source-hierarchy.md`. These are independent reads, including when a source already cited by the project was the strongest accessible record. English Wikipedia was not opened or used as evidence or a lead. Incidental links in search results/Commons pages were ignored.

| Key | Source URL | Rank / inspected evidence |
|---|---|---|
| CEC | https://votes24.bechirot.gov.il/nationalresults | 1; live HTML, all rows read; identical bytes to retained `nationalresults.html` |
| G | https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-9476.pdf | 1; YP 9476, 14 March 2021, pp.4248–4274; full text read, extraction exceptions inspected as page images; live bytes match retained PDF |
| S | https://olaw.org.il/yalkut/yalkut-9478.pdf | 1 for the reproduced statutory notice, non-government host; YP 9478 p.4284, six agreements; live bytes match retained PDF |
| M | https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2024%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json | 1; live JSON, both pages read, following `odata.nextLink` with `$skiptoken=23828`; 157 positions, 120 distinct opening members |
| CBS | https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf | 1; published 4 July 2024; row 24 confirms date/electorate/cast/valid |
| I | https://www.idi.org.il/policy/parties-and-elections/elections/2021-1/ | 3; 38 competing lists, 13 elected lists, threshold, independent results table |
| R1 | https://www.timesofisrael.com/netanyahu-secures-most-nominations-for-premiership-after-new-hope-abstains/ | 4; article body explicitly gives every list's recommendation and seat count, 5 April 2021 |
| R1b | https://elections.walla.co.il/item/3427440 | 4; independently reports recommendation camps on 5 April |
| R2 | https://www.ynetnews.com/article/r1NizEeOO | 4; 5 May 2021; updated positions and expiration of Netanyahu mandate |
| R2b | https://en.globes.co.il/en/article-rivlin-asks-lapid-to-form-a-government-1001370105 | 4; dated 5 May; quotes Rivlin and the 56/7 totals |
| F | https://main.knesset.gov.il/EN/News/PressReleases/Pages/press14621d.aspx | 1; official confirmation vote and investiture report, dated 14 June about Sunday night |
| GOV | https://main.knesset.gov.il/en/mk/government/Pages/governments.aspx?govid=36 | 1; indexed official government record with PM dates and 13 June 2021–29 December 2022 government dates; direct subsequent open returned no readable text; indexed record is the access basis |
| P | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/prospectuses_18k_report_2021/he/Prospectuses_prospectuses_18k_report_2021.pdf | 1; State of Israel report, p.D-17; all eight coalition parties and government start |
| D | https://main.knesset.gov.il/News/PressReleases/pages/press30062022b.aspx | 1; independent discovery of the dissolution report: 30 June, 92–0, election 1 November |
| Q | https://en.idi.org.il/media/16382/israeli_voice_index_data_2105_eng-first.pdf | 3 under project hierarchy; original survey data, all three pages inspected |

Shell retrieval used the prescribed project User-Agent. Initial sandbox DNS failed; ordinary authorised network retrieval then succeeded, without a proxy, regional routing or bypass. The web fetch of G returned 403; the normal workspace request to the same URL returned 200. The cited dissolution URL ending `D.aspx` returned a location-denial page; no bypass was attempted. Scratch contains reproducible retrievals/extractions only, not the sole copy of source evidence.

## All non-OK findings

Paths are JSONPath-like selectors; `lists[letters=…]` means the object selected by ballot letters, not an array index. Generated fields must ultimately be fixed through their inputs by the fixer.

| ID | File and exact JSON path | Current value / claim | Correct value or required evidence | Class | Source URL; rank; verbatim evidence; accessed |
|---|---|---|---|---|---|
| N1 | `public/data/k24.json` `$.lists[38].withdrawn` (id `24-רק`) | `false` | `true`: all candidates resigned before election day. Retain the registered roster as a historical snapshot and the official zero-vote row; do not equate that row with an active list. | WRONG | https://www.zman.co.il/live/206586/ ; 4, report dated 19 March 2021: “כל חברי הרשימה התפטרו בפני יושב ראש ועדת הבחירות המרכזית”; https://www.idi.org.il/policy/parties-and-elections/elections/2021-1/ ; 3: “בבחירות התמודדו 38 רשימות מועמדים”; 2026-11-06. Primary resignation notice not recovered in targeted gov.il searches. |
| N2 | `data/meta/families/{arab-arab-jewish,centre,haredi,herut-likud,labour-zionist-left,national-religious,radical-right,religious-parties,russian-speaking-immigrant}.json` `$.elections[23].datasetStatus.noteEn` / `.noteHe` | Ends “No default blocs assigned.” / “ללא שיוך לגושים.” | Snapshot's assertion is stale: `public/data/k24.json $.defaultBlocScheme` is `first-government`, with three bloc schemes. Remove/rewrite the statement to match that same hashed dataset. Hash itself is correct. | WRONG | Local inspected source `public/data/k24.json` (software-state evidence, historical rank N/A): “first-government”; file SHA-256 `773cd0de309fa2d9691034381fe44f16f55e470ab0d7c4901a19b034dc6a0498`; 2026-11-06. |
| N3 | `data/meta/logos/k24.json` `$.logos[1].status`, `.confidence`, `.inUseEvidence` (New Hope) | `verified`, `medium`; community reconstruction dated 1 March 2021 is treated as verified campaign use | Commons proves uploader/date/licence, not party adoption or actual campaign use. Keep the explicitly admitted gap or downgrade until dated campaign evidence is inspected. No claim that the depicted logo is wrong. | UNSUPPORTED | https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png ; community metadata, unranked (outside ranks 1–5): “Source Own work”; “Date 1 March 2021”; “Author Dmitry Pechenkov”; 2026-11-06. The current note itself admits official-source derivation is not supplied. |
| N4 | `data/meta/aftermath/k24.json` `$.term.inclusionRuleNote`, `$.term.events[id=majority-lost-2022].cites`, `$.term.events[id=lebanon-maritime-2022].cites[0]` | Selected-event rule requires two contemporary sources including one official for each event | The Silman event has retrospective IDI/IPF/EJPR citations and no official contemporary one. The maritime official citation is dated 12 October, two weeks before the signing it is attached to. Add an actual qualifying official event record or state an exception honestly. Historical facts themselves corroborated below. | UNSUPPORTED | https://www.gov.il/he/pages/event-press121022 ; 1 as cited (quote held in input): “הממשלה אישרה להניח את ההסכם על שולחן הכנסת למשך 14 יום”; that supports laying the proposal, not signing on 27 October. https://13tv.co.il/item/news/politics/state-policy/lshei-903305559/ ; 4: “27.10.2022”. https://www.walla.co.il/news/politics/3499134 ; 4: “6 באפריל 2022”; 2026-11-06. gov.il quoted text not independently fetched in this audit; the mismatch is visible even taking its retained quote at face value. |
| N5 | `data/meta/bios/k24.json` `$.candidates.*.knesset.url` where `.knesset.verified == "pattern"` (162 destinations) | Inferred site-number links, under high-confidence candidate records | Membership PersonIDs were checked, but this does not verify that each unrelated website siteId resolves to that person's biography. Pattern is not destination verification. No incorrect destination is asserted. | UNVERIFIABLE | M (rank 1) confirms `PersonID` and membership, not website route mapping. Representative current path for Edelstein: `https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/1`; direct official government/news page access showed empty/denied responses in this audit. No 162-page destination sweep was performed; 2026-11-06. |
| N6 | `public/data/k24.json` `$.lists[*].candidates[*].nameEn` (146 populated names) | English personal-name renderings | Hebrew gazette and retained Knesset person table do not establish all preferred English spellings. Full English-name verification remains open; not a finding of a wrong identity. | UNVERIFIABLE | G and M, rank 1; G column headings: “שם פרטי”, “שם משפחה”; official Hebrew-name records inspected, comprehensive English biography evidence unavailable/unread; 2026-11-06. |
| N7 | `data/meta/k24.json` `$.colours[*].sources`, `.color`, `.basis` | Hebrew-Wikipedia infobox colours, sometimes explicitly including 2026 colour history | Colour choices are qualified as display colours, so no official-colour error is alleged. The claimed exact current infobox values and election-era applicability were not independently verified. Archived campaign assets support some broad colour associations but do not establish every hex code. | UNVERIFIABLE | Hebrew-Wikipedia URLs stored in each entry, rank 5; retained claim example: “צבע כותרת = 214785”. Retained rank-1-for-own-logo party evidence was inspected for eight logo entries, not a historical hex-code specification. No infobox revision-by-revision read was performed; 2026-11-06. |
| N8 | `public/data/k24.json` `$.totals.ballotBoxes`; `data/raw/k24/reconciliation.json $.pollingStations` | `12926` | CEC history reports 13,685 polling stations. Reconciliation counts 12,926 result rows. These may have different scopes (e.g. special stations/envelopes), so do not replace one mechanically. Explain/count the excluded categories before presenting a universal total. | DISPUTED | https://www.gov.il/he/pages/election-committee-history?chapterIndex=2 ; 1 indexed table: “כנסת 24 2021 … 13,685”; retained official results-derived reconciliation (rank 1 underlying data; row-count derivation by project): “pollingStations”:12926. Both values inspected, scope difference not settled; 2026-11-06. |
| N9 | `data/meta/k24.json` `$.lists[*].parties[*].sources[*].quote` for joint-list party allocations | Quotes append English text “— party column for these candidates: …” | Separate the verbatim submission header from the auditor's interpretation of candidate party columns. A header listing sponsors does not alone prove every rank assignment; supply page/rank locators. This is an evidence-format defect, not a demonstrated allocation error. | UNSUPPORTED | G, rank 1; real heading “השתייכות מפלגתית”. The appended English explanation is absent from this Hebrew gazette; full PDF and relevant page images inspected; 2026-11-06. |
| N10 | `data/meta/aftermath/k24.json` `$.sources.knesset-news-2022-06-30.url` | `https://main.knesset.gov.il/News/PressReleases/Pages/press30062022D.aspx` | Exact cited page not readable. A separately found official page ending `press30062022b.aspx` supports the dissolution fact. This is not proof D never existed. | UNVERIFIABLE | Exact stored URL, rank 1, live response: “The site is temporarily inaccessible from your location”; replacement D above: “בקריאה השלישית תמכו 92 חברי כנסת ללא מתנגדים”; 2026-11-06. |

## Every list: results and registered rosters

Each row below is one **OK** grouped check of `public/data/k24.json $.lists[i]`: `letters`, `nameHe`, `sponsorsHe`, `votes`, registered `candidates[].rank/givenHe/familyHe/nameHe`, and `$.officialSeats[list.id]`. Gazette sponsor/name spelling and punctuation are preserved; candidate `nameHe` is family-first in the app, while gazette columns are given-first. Short English labels explicitly marked unofficial/transliterated are display choices, not evidence of an official English name. Candidate English spellings, colours, biography targets and withdrawal flags are excluded from these grouped OK checks (see N1, N5–N7).

CEC is rank 1 for votes/seats; G is rank 1 for ballot identity and registered roster. The numeric cells below transcribe the CEC row; the Hebrew list-name cells transcribe G. All accessed 2026-11-06. Zero-vote withdrawn Demokratit remains an OK *registered roster/results-row* check, not an active-contestant check.

| Index / letters | Hebrew name (G) | Votes (CEC) | Seats (CEC) | Registered candidates checked (G) | Class |
|---|---|---:|---:|---:|---|
| 0 / מחל | הליכוד בהנהגת בנימין נתניהו לראשות הממשלה | 1,066,892 | 30 | 120 | OK |
| 1 / פה | יש עתיד בראשות יאיר לפיד | 614,112 | 17 | 120 | OK |
| 2 / שס | התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצ"ל | 316,008 | 9 | 120 | OK |
| 3 / כן | כחול לבן בראשות בני גנץ | 292,257 | 8 | 55 | OK |
| 4 / ב | ימינה בראשות נפתלי בנט | 273,836 | 7 | 38 | OK |
| 5 / אמת | מפלגת העבודה בראשות מרב מיכאלי | 268,767 | 7 | 71 | OK |
| 6 / ג | יהדות התורה והשבת אגודת ישראל – דגל התורה | 248,391 | 7 | 120 | OK |
| 7 / ל | ישראל ביתנו בראשות אביגדור ליברמן | 248,370 | 7 | 23 | OK |
| 8 / ט | הציונות הדתית בראשות בצלאל סמוטריץ' | 225,641 | 6 | 21 | OK |
| 9 / ודעם | הרשימה המשותפת (חד"ש, תע"ל, בל"ד) | 212,583 | 6 | 120 | OK |
| 10 / ת | תקווה חדשה בהנהגת גדעון סער לראשות הממשלה | 209,161 | 6 | 62 | OK |
| 11 / מרצ | מרצ – השמאל של ישראל | 202,218 | 6 | 120 | OK |
| 12 / עם | הרשימה הערבית המאוחדת | 167,064 | 4 | 116 | OK |
| 13 / יז | הכלכלית החדשה בראשות פרופסור ירון זליכה | 34,883 | 0 | 21 | OK |
| 14 / ר | רפא – רק בריאות בראשות דוקטור אריה אבני | 17,346 | 0 | 11 | OK |
| 15 / ףז | הפיראטים | 1,309 | 0 | 13 | OK |
| 16 / כך | אני ואתה – מפלגת העם הישראלית | 1,291 | 0 | 7 | OK |
| 17 / רנ | התקווה לשינוי | 1,189 | 0 | 4 | OK |
| 18 / י | המפץ החברתי – גימלאים | 811 | 0 | 4 | OK |
| 19 / קץ | משפט צדק בראשות ד"ר לריסה עמיר טרימבובלר | 729 | 0 | 7 | OK |
| 20 / זץ | צומת – עצמאים, חקלאים, כפרים | 663 | 0 | 10 | OK |
| 21 / רף | מפלגת עם שלם – בראשות הרב חיים אמסלם | 592 | 0 | 6 | OK |
| 22 / קך | סדר חדש לשינוי שיטת הבחירות והממשל בישראל בראשות עו"ד אביטל אופק | 514 | 0 | 7 | OK |
| 23 / נ | קמ"ה – קידום מעמד הפרט | 486 | 0 | 4 | OK |
| 24 / ק | נועם קולמן, לירון עופרי וסולי וולף הבלתי אפשרי, אפשרי | 463 | 0 | 2 | OK |
| 25 / כ | הלב היהודי בראשות אלי יוסף | 443 | 0 | 5 | OK |
| 26 / צי | עצמנו עצמאים וליברלים | 441 | 0 | 7 | OK |
| 27 / יק | מפלגת הגוש התנ"כי | 429 | 0 | 7 | OK |
| 28 / ני | עולם חדש בראשות יורם אדרי | 429 | 0 | 40 | OK |
| 29 / ינ | ברית השותפות לאיחוד לאומי בהנהגת רב חובל ב. שליאן | 408 | 0 | 11 | OK |
| 30 / ז | הישראלים | 395 | 0 | 6 | OK |
| 31 / קי | מפלגת שמע בראשות נפתלי גולדמן | 395 | 0 | 4 | OK |
| 32 / ץ | דעם – כלכלה ירוקה מדינה אחת | 385 | 0 | 14 | OK |
| 33 / יר | מנהיגות חברתית | 256 | 0 | 5 | OK |
| 34 / צכ | מען (יחד) לעידן חדש | 253 | 0 | 49 | OK |
| 35 / צף | חץ | 226 | 0 | 6 | OK |
| 36 / נר | "אנחנו" – בראשות עו"ד מוש חוג'ה | 220 | 0 | 5 | OK |
| 37 / יף | כבוד האדם, בראשות עו"ד ארקדי פוגץ' | 196 | 0 | 11 | OK |
| 38 / רק | דמוקרטית – חירות, שיוויון וערבות הדדית | 0 | 0 | 34 | OK |

**Roster method and limits.** All 1,406 registered entries were compared by rank, given name and family name to the independently extracted gazette. 1,369 matched directly after whitespace/punctuation normalisation. All 37 exceptions were checked against page images (including some family/given columns extracted in reverse order). Examples: Likud #13 is visually צחי, not the extracted יצח; Yesh Atid #36 is הדר, not רהד; Maan #25 is עלאא, not אעלא; Blue and White #17's surname order and #38's compound given-name order are supported by the page. These are extraction artifacts, not app errors. No contemporary source was used to silently replace gazette spelling. Registration is deliberately different from election-day eligibility and opening membership.

## Other checks found OK — 20 grouped rows

| ID | File / path / checked claim | Evidence, source URL key, rank and short quote (accessed 2026-11-06) | Class |
|---|---|---|---|
| O1 | `public/data/k24.json` `$.knesset`, `$.electionDate`, `$.totals.{registered,votesCast,valid,invalid}`: 24; 23 March; 6,578,084; 4,436,365; 4,410,052; 26,313 | CEC and CBS, rank 1. CEC “תוצאות סופיות רשמיות”; numeric row matches. Invalid also independently equals cast minus valid. | OK |
| O2 | `$.ruleSetId`: 120 seats, 3.25%, Bader–Ofer; glossary 112 initial seats | I, rank 3: “3.25%”; https://www.idi.org.il/www.idi.org.il/articles/33757?page=2 rank 3: “חולקו 112 מנדטים בסבב הראשון”. Independent calculation from qualifying list votes reproduces initial 112; final published seats sum to 120. | OK |
| O3 | `$.agreements[0]`: ת–ב | S rank 1, statutory pair (1), “תקווה חדשה” / “ימינה”. | OK |
| O4 | `$.agreements[1]`: ל–פה | S rank 1, pair (2), “ישראל ביתנו” / “יש עתיד”. | OK |
| O5 | `$.agreements[2]`: מחל–ט | S rank 1, pair (3), “הליכוד” / “הציונות הדתית”. | OK |
| O6 | `$.agreements[3]`: יז–כן, including ineffective below-threshold partner | S rank 1, pair (4), “הכלכלית החדשה” / “כחול לבן”. | OK |
| O7 | `$.agreements[4]`: אמת–מרצ | S rank 1, pair (5), “מפלגת העבודה” / “מרצ”. | OK |
| O8 | `$.agreements[5]`: שס–ג; six-pair completeness | S rank 1, final numbered pair (6), Shas / UTJ; no seventh pair before signature. | OK |
| O9 | Elected-prefix identity and pre-opening replacement: 119 prefix members plus Silman #8 instead of Davidi #3; `data/meta/candidate-notes.json $.notes[5]`, context `$.events[id=opening-members-k24]` | M rank 1: 120 distinct PersonIDs at “2021-04-06T00:00:00”; exact set equals metadata identities with that substitution. https://www.mako.co.il/news-politics/2022_q1/Article-6f7d536f3bdff71026.htm rank 4 independently dates Silman's swearing-in to “6 באפריל 2021”. | OK |
| O10 | Joint-list sponsors, elected party splits and head-party IDs: מחל 29 Likud/1 Atid Ehad; ג 4 Degel/3 Aguda; ט 4 Tkuma/1 Otzma/1 Noam; ודעם 3 Hadash/2 Taal/1 Balad; ת 5 New Hope/1 Derech Eretz. Metadata, `joint-facts[87..91]`, five lineage electoral-partner edges | G rank 1, sponsor headings and elected candidate party columns; page images 4250,4254,4259,4273 and Joint List roster. Likud #28 is explicitly “עתיד אחד”; Hendel #4 “דרך ארץ”. This establishes registered party allocation, not separate constituent votes. | OK |
| O11 | `data/meta/k24.json $.blocSchemes[id=pm-recommendations]` and aftermath round r1, all 13 entries: Netanyahu 52, Lapid 45, Bennett 7, none 16 on 5 April | R1 rank 4 enumerates all parties/counts; R1b independently corroborates. Short quote R1: “Netanyahu had been endorsed by 52 MKs”. Netanyahu: מחל/שס/ג/ט; Lapid: פה/כן/ל/אמת/מרצ; Bennett: ב; none: ת/ודעם/עם. | OK |
| O12 | Aftermath r2, 5 May: Lapid 56, Bennett 7, return to Knesset 52, none 5, Joint List 5/1 split | R2 rank 4: “five out of six MKs”; R2b quotes Rivlin: “now has 56”. Raam's no recommendation explicitly reported by R2, not inferred from cooperation. Identity of the dissenting Joint List MK is not supplied by the app. | OK |
| O13 | Formation events: consultations 5 April; Netanyahu mandate 6 April/28 days, expired midnight 4 May; Lapid mandate 5 May/28 days; success notification 2 June, Bennett first | https://www.walla.co.il/news/politics/3427771 rank 4: “6/4/2021”; R2/R2b and https://www.timesofisrael.com/lapid-informs-president-he-can-form-government-removing-netanyahu-from-power/ rank 4: “Thirty-five minutes before a midnight deadline”. Exact minute conflict is intentionally not resolved in app; date and before-midnight statement are supported. | OK |
| O14 | Government 36: confidence 13 June, 60–59–1; coalition eight parties; 62 election-list seats explicitly qualified, not 62 supportive MKs; government end 29 December 2022; PM rotation 1 July | F and GOV rank 1; P p.D-17 lists all eight coalition parties. F: “with one abstention”; GOV: “Until: 29 December 2022”. Election-list arithmetic 17+8+7+7+7+6+6+4=62; excluding Chikli gives 61 potential supporters, al-Harumi abstention gives 60 yes. Bennett's `.to=2022-06-30` is an inclusive last-day convention; official boundary is 1 July, not a factual contradiction. | OK |
| O15 | Aftermath budget, loss of majority, dissolution, maritime agreement historical dates/statements (independent of N4 selection rule) | https://www.calcalist.co.il/local_news/article/s1xw0aldt rank 4: “61 מול 59”; https://www.ynet.co.il/news/article/s1wqzbwvf rank 4 confirms first since March 2018. Walla N4 corroborates 6 April loss of majority; D rank 1 confirms 30 June/92–0/1 November; Channel 13 N4 confirms 27 October separate signing. | OK |
| O16 | Issue polling Q4: conditional new-government priority, fieldwork 30–31 May, adult national sample 615 Hebrew/150 Arabic; all eight general-public percentages and labels | Q rank 3, pp.2–3; values in app order 28.9/27.7/10.4/8.2/8.0/5.2/6.5/5.2 match the general-public column, not the Jewish/Arab columns. Quote: “national sample of the entire adult population of Israel aged 18 and older”. Sum 100.1 is ordinary rounding, not an error. | OK |
| O17 | Context repeat elections, 23 March election, 6 April opening; Mara'ana eligibility reversed by Supreme Court | CBS and M rank 1 for dates; G preamble expressly identifies Supreme Court case 1156/21 dated 28 February. https://www.israelhayom.co.il/article/856327 rank 4: “בית המשפט העליון הפך הערב”; https://main.knesset.gov.il/About/History/Pages/KnessetHistory.aspx?kns=24 rank 1 indexed history gives opening 6 April 2021 and term to 15 November 2022. No direct-PM contest is claimed for 2021. | OK |
| O18 | Eight retained official campaign-logo evidence chains (entries 4–11); source attribution, page/asset dates, raw/display hashes | `data/raw/SOURCES.json` logo-k24 entries and exact Wayback URLs in each `.rawEvidence`; rank 1 for each party's own mark only. Each retained page references the asset basename; raw SHA-256 and hosted SHA-256 independently recomputed and match all eight entries. E.g. `https://web.archive.org/web/20210301153126/https://zionutdatit.org.il/` contains `zionut-logo-1.png`. Duplicate list/constituent entries were checked separately but count here as one group. No new image research or claim of rights adjudication. | OK |
| O19 | Three Commons descriptions other than New Hope: Blue and White 2021 attribution/PD-textlogo, Raam cited February 2021 Panet edition vs 2022 vector date, Otzma party-email derivation and missing author | https://commons.wikimedia.org/wiki/File:Blue_and_White_logo_2021.svg : “white color re-painted”; https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg : “9 June 2022”; https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_2021_logo.svg : “Otzma Yehudit via email”. Unranked community metadata, confirms precisely the metadata claims, not independent authentication of the underlying email/newspaper or an official colour standard. | OK |
| O20 | Nine family snapshots: list identities, votes, valid denominator, SHA-256 and numerical sums/percentages | CEC rank 1 for ballots; local snapshot evidence for derived arithmetic. All selected list votes match official national rows; core and mixed sums independently recomputed. E.g. Arab/Arab–Jewish 212,583+167,064+385=380,032; religious core 248,391+316,008+167,064=731,463. Classifications themselves are editorial/inferred and are not certified by this arithmetic check; stale status note is N2. | OK |

## Sourcing and editorial observations

- Mishpat Tzedek's current name is **supported by G**, “משפט צדק בראשות ד״ר לריסה עמיר טרימבובלר”. CEC's results page instead says “משפט צדק, לרפורמה במערכת המשפט”. This is a real source disagreement, but not a reason to overwrite the app: the specifically approved-name gazette is closer to that act. Add a source discrepancy note. A February court-agreement lead also supports the later name; no unsupported interpolation is needed.
- First-government membership has better evidence than the existing Hebrew-Wikipedia citations: P expressly names all eight coalition parties, including Raam. The 62/61/60 distinction is already explained; do not “correct” all three to the same number.
- `knesset-blocs-2021` still uses Hebrew Wikipedia alone for the 52/51/11/6 grouping. R1 establishes the 52 camp and New Hope's anti-Netanyahu position, but does not independently establish every political grouping choice. Preserve attribution and do not turn a parliamentary interpretation into an official bloc classification. Same warning applies to infobox colours (N7).
- `ipf-election-timeline` is from Israel Policy Forum, an advocacy organisation: https://israelpolicyforum.org/about/ says “advances policy ideas”. Under the project's explicit exclusion of advocacy NGOs, it should not be counted as an eligible independent chronology supporting promotion of events. This is a source-policy issue, not proof the Silman or budget facts are false. The stored Crisis Group and NYT sources were not used to validate any fact in this audit.
- No partisan evaluative wording was found in the inspected app-facing k24 context/formation text. Names printed by parties on their registered ballots are attributed names, not the project's endorsement. The family radical-right classification expressly calls itself a broad contested interpretation; ideological labels require that qualification.

## Remaining scope and limits

These are **not additional cleared facts** and are not silently folded into the OK counts:

1. All 176 biography records were inventoried; the 120 opening PersonIDs match the live official membership set. A complete HTTP/identity verification of all Knesset, Hebrew-Wikipedia and any party biography destinations remains undone (N5). The seven records without a Knesset verification marker also need checking; old archive-date annotations were not re-fetched.
2. Later-rank joint-party affiliations beyond the elected prefix were inspected in the gazette's party-column layout, but a fresh full rank-by-rank party-allocation reconciliation was not completed. No mismatch was demonstrated. The 1,406 Hebrew name/rank check is separate and complete as described.
3. `parties.json` party profile histories, classifications, cross-election continuity and every source behind the nine families were inventoried for k24 appearances but not independently re-researched in full. The five k24 electoral-partner edges and registered sponsors are covered by O10; broader merger/ideological history is not. There is no claimed constituent-vote split: null is correct for unknowable internal ballots.
4. Locality and demographic-group data were found in `k24-localities.json`, `k24-locality-names.json`, `k24-locations.json`; a row-by-row live CKAN/CBS reconciliation, geographic name/coordinate and demographic membership audit was not completed. Do not infer such clearance from matching national totals. `totals.localities=1214` and `envelopeVotes=425512` remain outside independently confirmed counts; N8 records the polling-station scope conflict.
5. Full `party-links/k24.json` destination checks and per-link source-card wording were not completed. Their CEC whole-election URLs are accessible; Hebrew-Wikipedia links are explicitly secondary. No English-Wikipedia URL was found in the inspected k24-specific data, as distinct from incidental Commons outbound links.
6. Aftermath `formation.conflicts` exact-minute alternatives were not all reopened; the date-level statement was verified. Pending/nonpromoted term events and the empty all-or-none election-reaction collection are intentional gaps, not factual claims of absence.

## Reproduction evidence

No build/test suite was run: this report does not change runtime data. Verification consisted of primary-source comparisons and independent calculations, not merely running the app's existing historical tests. Source bytes: G SHA-256 `08a1558dd6e4b972c143665402c5b21598b13c80699270a0e52d62eb153d42a1`; S `5f0c3da2c59b8697e95f2f977774ef425259274376743cef0803199ca729bcfa`; CEC `e31ce3b85b448a76100636c8b3d6d186df69afc44c54455fdabf7060037c8db3`. These match retained source hashes. Live membership position-ID set equals the retained 157-record set exactly; 120 distinct members have the opening start date. PDF tooling installed only in `.backup-scratch/data-audit/k24-codex/python`: pypdf 6.21.4 and PyMuPDF reporting binding 2.1 / MuPDF 1.28.6; standard Python 3.14. Gazette text normalisation discarded whitespace/punctuation for comparison, followed by visual inspection of all exceptions; it was never used to overwrite retained bytes or names.
