# K21 independent data audit — Codex

Audited 2026-11-06. Election: 9 April 2019, 21st Knesset. Baseline `d2c1ed0`; `git merge --ff-only origin/main` reported already up to date. Auditor only: no data edits, dataset build, push, or merge into main.

## Summary and counting convention

**OK 54 · WRONG 3 · UNSUPPORTED 2 · UNVERIFIABLE 6 · DISPUTED 0.** These are **65 bounded check groups**, not a count of every scalar or every URL. The 43 per-list groups below check letters, Hebrew registration name, sponsors, votes, seats, registration roster and party-column transcription. Three have a wrong withdrawal flag; their other checked fields pass. Fourteen further passing groups cover national facts, agreements, elected names, membership, geography, metadata and chronology. Eleven non-OK groups are enumerated below, including the three list groups. Unverified groups remain open; this is not certification that every biography link, English spelling or historical family narrative is correct.

The serious confirmed error is **three cancelled lists presented as running**. The results notice **YP 8208, 17 April 2019, pp. 10062–10067**, is reachable but absent from the retained manifest. Numerical results and all 120 gazetted elected names agree with the dataset. No conflicting result was found. The recommendations source ends before Ra’am–Balad’s consultation; its silence cannot establish that party’s decision.

## Inspected source ledger

All accessed **2026-11-06**. URLs identify evidence, not independent votes of confidence. CEC HTML, CEC memorandum and Gazette results are one underlying official election-result family. Gazette mirrors retain rank 1 for the statutory text, with hosting disclosed. Search snippets, blocked requests and internal metadata are not independent historical corroboration.

| ID | Source, rank, inspection and scope | Short verbatim locator / evidence |
|---|---|---|
| S1 | [CEC final national HTML](https://votes21.bechirot.gov.il/nationalresults), rank 1; live HTTP 200, full table read and compared with retained bytes | `תוצאות סופיות רשמיות`; `6,339,729`; `4,340,253`; `4,309,270`; `30,983` |
| S2 | [Results notice YP 8208](https://olaw.org.il/yalkut/yalkut-8208.pdf), rank 1, disclosed olaw mirror; live HTTP 200; all election pages read/extracted, including numbered elected-name cells | `שמות האנשים שנבחרו חברי הכנסת העשרים ואחת`; `4,309,270`; `30,983` |
| S3 | [Candidate notice YP 8168](https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8168.pdf), rank 1; live HTTP 200, all 43 registration sections / 1,580 rows checked with independent PDF extraction | `רשימות המועמדים לכנסת העשרים ואחת`; column labels `שם פרטי`, `שם משפחה`, `השתייכות מפלגתית` |
| S4 | [Connection notice YP 8178](https://olaw.org.il/yalkut/yalkut-8178.pdf), rank 1, disclosed olaw mirror; live HTTP 200, p. 9310 numbered items 1–6 through Melcer signature read | `התקשרו ביניהן לשם חלוקת מנדטים`; `(2019 במרס 31)` |
| S5 | [CEC memorandum / record of proceedings](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset21/he/archive_knesset21_memorandum21.pdf), rank 1; live HTTP 200, PDF page 4 text and rendered scan inspected | **Q1:** `לאחר הפרסום ברשומות בוטלו רשימות` … `בשל התפטרות כל המועמדים מטעמם` |
| S6 | [CEC history index](https://www.gov.il/he/pages/election-committee-history?chapterindex=7), rank 1; indexed extraction read; direct web open had no readable body | `חוברת 8208, עמ' 10062 מיום 17.04.2019` |
| S7 | [Knesset membership OData](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2021%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json), rank 1; live HTTP 200, initial 100 records plus server continuation (21 XML records) read | `StartDate: 2019-04-30T00:00:00`; 121 position IDs exactly match retained record |
| S8 | [Official locality input](https://data.gov.il/api/3/action/datastore_search?resource_id=1a1c7b2b-e819-4ba9-b159-d68e3566c58b), rank 1; retained `data/raw/k21/localities.datagov.json` read completely; no fresh server-wide locality download claimed | Fields `בזב`, `מצביעים`, `פסולים`, `כשרים`; 1,214 records including envelopes |
| S9 | [Official polling input](https://data.gov.il/api/3/action/datastore_search?resource_id=f79f9ba5-fe12-4b90-96cc-916f1b7c1c34), rank 1; retained original in project scratch, SHA-256 checked and every polling record aggregated; locality-verification record is internal evidence, not a new official source | 10,765 polling rows independently aggregated in this audit, all 1,214 locality aggregates match |
| S10 | [IDI April election review](https://www.idi.org.il/policy/parties-and-elections/elections/2019-2/), rank 3; live HTTP 200, totals/results and narrative read | `אחוז החסימה 3.25%`; national totals agree |
| S11 | [Consultations, 16 April](https://www.timesofisrael.com/netanyahu-secures-majority-backing-after-right-wing-parties-recommend-him-as-pm/), rank 4; article body read via web; **incomplete for last consultation** | `the Arab Ra’am-Balad party was meeting with him later Tuesday`; reported totals 65 / 45 |
| S12 | [Hadash–Ta’al consultation, 15 April](https://www.timesofisrael.com/hadash-taal-abstains-from-recommending-a-prime-minister/), rank 4; body read via web; direct shell fetch 403, not bypassed | Odeh: `We are not recommending anyone` |
| S13 | [Mandate, 17 April](https://www.timesofisrael.com/president-officially-taps-netanyahu-to-form-next-government/), rank 4; body read via web; shell 403 | `Netanyahu will have 28 days to form a government` |
| S14 | [Extension, 13 May](https://www.timesofisrael.com/president-rivlin-grants-netanyahu-more-time-to-negotiate-new-government/), rank 4; body read via web; shell 403 | `PM given an extra 14 days` |
| S15 | [13 May liveblog](https://www.timesofisrael.com/liveblog-may-13-2019/), rank 4; web retrieval, deadline locator is the existing citation; do not treat all liveblog items as reviewed | Existing locator: `Netanyahu will now have until May 29 to form the government` |
| S16 | [Results handed to Rivlin, 17 April](https://www.timesofisrael.com/liveblog_entry/central-elections-committee-head-submits-final-election-results-to-rivlin/), rank 4; item body and timestamp read via web | `17 April 2019, 2:18 pm`; `Hanan Melcer hands the election results to President Reuven Rivlin` |
| S17 | [Knesset dissolution, 30 May](https://main.knesset.gov.il/News/PressReleases/pages/press30.05.19.aspx), rank 1; full indexed news text read; direct shell HTTP 247 challenge shell, not executed | `בהצבעה שמית תמכו 74 והתנגדו 45`; next election 17 September 2019 |
| S18 | [IDI disqualification survey](https://www.idi.org.il/articles/65951), rank 3; live HTTP 200, relevant table and Ben-Ari paragraph read | `2019 רע"מ-בל"ד הפסילה בוטלה`; `2019 עופר כסיף`; Ben-Ari disqualification described |
| S19 | [Knesset double-envelope review, 24 March 2019](https://fs.knesset.gov.il/globaldocs/MMM/2e5ce5ea-ec1e-e911-80e1-00155d0a98a9/2_2e5ce5ea-ec1e-e911-80e1-00155d0a98a9_11_10970.pdf), rank 1; live HTTP 200, eight pages extracted/read | `הצבעה במעטפות כפולות`; `לאימות ולספירה בוועדת הבחירות המרכזית בכנסת` |

Primary retrieval fingerprints: S1 SHA-256 `15141335fc826659e5fcdf4c0af7b8e89de5afde1aae72b68c871ca9e703f754` (identical to retained file); S2 `1c55879fd58cacdd1398ac41a6b9382e95d539b0744ea4f03dab6531680b9b09` (378,817 bytes, eight PDF pages); S3 `ed3c03f79ee9976f9d5e776e2eeba8fd2b1eb4c3fd9f4c1374ac9fd41a288db2`; S4 `ad242e01902ab56fb46be6db7003f523a31e8d7576d3ce5e19776ec74847131c`.

## All non-OK findings

Paths use JSONPath; selectors identify stable IDs and avoid dependence on array sorting. A grouped uncertainty is not a finding that every enclosed value is wrong. “Not independently established” is deliberately not a proposed replacement factual value.

| ID | File / exact path or bounded selector | Current value | Correct value / required disposition | Class | Source URL / rank / quote / accessed |
|---|---|---|---|---|---|
| F1 | `public/data/k21.json` `$.lists[40].withdrawn` (`21-ץז`); producer `scripts/lib/historical/k20-k21-common.ts` list construction | `false`, no withdrawal note | `true`; label Ofek Hadash BeKhavod cancelled following resignation of all candidates; preserve registered roster as a historical snapshot | WRONG | [S5](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset21/he/archive_knesset21_memorandum21.pdf), rank 1, PDF p. 4 Q1; scan explicitly names `ץז – אופק חדש בכבוד`; 2026-11-06 |
| F2 | `public/data/k21.json` `$.lists[41].withdrawn` (`21-זנ`); same producer | `false`, no withdrawal note | `true`; Yachad cancelled, not a running zero-vote list | WRONG | S5, rank 1, p. 4 Q1, explicitly names `זנ – יחד בראשות אלי ישי`; 2026-11-06 |
| F3 | `public/data/k21.json` `$.lists[42].withdrawn` (`21-נך`); same producer | `false`, no withdrawal note | `true`; Reform cancelled, not a running zero-vote list | WRONG | S5, rank 1, p. 4 Q1, explicitly names `נך – מפלגת הרפורמה`; 2026-11-06 |
| F4 | `data/raw/SOURCES.json` `$[?(@.id startsWith 'k21-')]`; `public/data/k21.json` `$.sourceIds`, `$.officialSeatsSourceId` | No results Gazette entry/file; seats sourced solely to national HTML | Retain/register YP 8208 pp. 10062–10067 and use it to support final results/elected identities. Current numerical values are confirmed; this is a highest-ranked-evidence retention gap, not numerical misinformation | UNSUPPORTED | [S2](https://olaw.org.il/yalkut/yalkut-8208.pdf) rank 1, title quoted above; [S6](https://www.gov.il/he/pages/election-committee-history?chapterindex=7) identifies notice/date; 2026-11-06 |
| F5 | `data/meta/k21.json` `$.blocSchemes[0].blocs[2].members[1]`, `$.blocSchemes[0].notes[0]`; `data/meta/aftermath/k21.json` `$.recommendationRounds[0].entries[10].status`, corresponding note/totals; generated `$.blocSchemes[0].blocs[2].lists[1]` | Ra’am–Balad classified `none`, inferred as remainder of 65/45; total `none:10` | Obtain an explicit completed-consultation source for Ra’am–Balad, or represent its four seats as not yet verified. Do not infer a party’s decision from a report written before its meeting. Hadash–Ta’al's six seats independently pass under S12 | UNSUPPORTED | [S11](https://www.timesofisrael.com/netanyahu-secures-majority-backing-after-right-wing-parties-recommend-him-as-pm/), rank 4, quote in ledger states meeting was later; 2026-11-06. Targeted Hebrew/English searches found practitioner summary, but no inspected rank 1–4 direct statement for this list |
| U1 | `public/data/k21.json` `$.lists[*].candidates[?(@.nameEn)].nameEn` (121 names) | English names including shortened/conventional forms | Not independently established for all 121. Hebrew names/order pass. Do not label these English strings officially verified solely on the Hebrew Gazette | UNVERIFIABLE | [S3](https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8168.pdf) rank 1 (Hebrew only; this row does not establish English spelling); [S7](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2021&$format=json) membership fields do not establish English forms. No qualifying English quotation for the whole population; 2026-11-06 |
| U2 | `data/meta/bios/k21.json` `$.candidates.*.{knesset,hewiki,party}` and generated candidate `bio` links | 201 candidate records; 173 Knesset objects, 197 Hebrew-Wikipedia objects, 38 party objects; some Knesset verification is only `pattern` | URL-to-person identity / archived campaign relevance not independently verified for every link. OData membership IDs pass separately, not every redirect or biography page | UNVERIFIABLE | URLs are the exact per-record URLs in that file; ranks 1 (Knesset), party self-claim only, 5 (Hebrew Wikipedia). Tried membership API, examined mapping records; did not open all target pages. No whole-population supporting quote; 2026-11-06 |
| U3 | `data/meta/families/*.json` `$.elections[?(@.electionId=='k21')].members[*].classificationEvidence` / `scope` / `treatment` | Nine editorial family selections, including mixed-list treatments | Votes, party identities and explicit editorial labelling checked; independent historical validation of every family boundary remains open. These are interpretations, not primary official classifications | UNVERIFIABLE | Exact source locators are each family's `$.sources`; Gazette S3 confirms electoral partners, not ideological family boundaries. Inspected nine k21 selection blocks; no source-by-source classification audit of all linked histories; 2026-11-06 |
| U4 | `data/meta/logos/k21.json` `$.logos[7].inUseEvidence`, `$.logos[7].inUseDate` (Ta’al) | Campaign page 14 March 2019 links asset; actual retained asset captured 8 July 2019, with reported pre-election Last-Modified; medium confidence | Pre-election page reference established; identity of the exact July bytes with the pre-election artwork remains unproven. Preserve caveat; do not upgrade to high confidence without dated artwork/digest | UNVERIFIABLE | [Official-page archive](https://web.archive.org/web/20190314060443/http://www.a-m-c.org:80/), party self-identity only; [asset](https://web.archive.org/web/20190708185650id_/http://www.a-m-c.org/logo-amc.png). Retained page contains `logo-amc.png`; no pre-election digest held. 2026-11-06 |
| U5 | `data/meta/logos/k21.json` `$.logos[0,1,5].inUseEvidence` / `.licence` (Labor, New Right, UTJ) | Commons-based campaign date and public-domain claims; UTJ expressly says underlying newspaper not inspected | No independent campaign-date or rights adjudication completed. All final-file hashes match. Do not infer underlying newspaper inspection from a Commons description | UNVERIFIABLE | [Labor](https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png), [New Right](https://commons.wikimedia.org/wiki/File:Logo_of_HaYamin_HeHadash.svg), [UTJ](https://commons.wikimedia.org/wiki/File:United_Torah_Judaism_Logo_2019.svg), community provenance, not rank 1 official election evidence; retained claims inspected, original publication not reopened; no independent historical quote; 2026-11-06 |
| U6 | `data/meta/parties.json`, `data/meta/party-lineage.json` and `data/meta/k21.json` `$.colours[*]` beyond the eight k21 electoral-partner edges verified below | Cross-era party history / labels / associated colours, mainly sourced to research or Hebrew-Wikipedia infoboxes | No exhaustive cross-era history / election-era colour audit. Display colours are explicitly non-official conventions; do not promote current infobox colours into verified 2019 campaign specifications | UNVERIFIABLE | Source URLs remain in these records. S3 validates k21 submitting parties, not every formation/merger/year or colour claim. Searched k21 references and inspected source bases and retained official logo evidence; no complete chronology/colour-source recheck; 2026-11-06 |

## Every registered list: checked fields

Each row is one check group. `N` is registered-candidate count, not elected count. Names below reproduce the app for identification. For all rows, S3 supports letters/name/sponsors, candidate given/family names, ranks and printed party columns; S1 supports votes/seats. S2 independently confirms the 40 participating lists' votes and seats; cancelled lists are absent from its results table and their zero votes are placeholders in S1. English short names are app translations/transliterations rather than a claim of official English nomenclature; candidate English names remain U1. Colours and links are covered separately above.

| JSON list index / letters | Current Hebrew registration name | Votes | Seats | N | Verdict |
|---|---|---:|---:|---:|---|
| `0` / `מחל` | הליכוד בהנהגת בנימין נתניהו לראשות הממשלה | 1,140,370 | 35 | 118 | OK |
| `1` / `פה` | כחול לבן בראשות בני גנץ ויאיר לפיד | 1,125,881 | 35 | 120 | OK |
| `2` / `שס` | התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצ"ל | 258,275 | 8 | 117 | OK |
| `3` / `ג` | יהדות התורה והשבת אגודת ישראל-דגל התורה | 249,049 | 8 | 119 | OK |
| `4` / `ום` | חד"ש תע"ל בראשות איימן עודה ואחמד טיבי | 193,442 | 6 | 118 | OK |
| `5` / `אמת` | מפלגת העבודה בראשות אבי גבאי | 190,870 | 6 | 120 | OK |
| `6` / `ל` | ישראל ביתנו בראשות אביגדור ליברמן | 173,004 | 5 | 20 | OK |
| `7` / `טב` | איחוד מפלגות הימין הבית היהודי - האיחוד הלאומי - עוצמה יהודית | 159,468 | 5 | 48 | OK |
| `8` / `מרצ` | מרצ - השמאל של ישראל | 156,473 | 4 | 120 | OK |
| `9` / `כ` | כולנו הימין השפוי בראשות משה כחלון | 152,756 | 4 | 33 | OK |
| `10` / `דעם` | רע"מ - בל"ד הרשימה הערבית המאוחדת ברית לאומית דמוקרטית | 143,666 | 4 | 115 | OK |
| `11` / `נ` | הימין החדש בראשות שקד ובנט | 138,598 | 0 | 24 | OK |
| `12` / `ז` | זהות - תנועה ישראלית יהודית בהנהגת משה פייגלין | 118,031 | 0 | 111 | OK |
| `13` / `נר` | גשר בראשות אורלי לוי אבקסיס | 74,701 | 0 | 18 | OK |
| `14` / `ן` | בט"ח - ביטחון חברתי בראשות סמיון גרפמן | 4,618 | 0 | 12 | OK |
| `15` / `ר` | הרשימה הערבית בראשות מוחמד כנעאן | 4,135 | 0 | 16 | OK |
| `16` / `צק` | צדק חברתי | 3,843 | 0 | 10 | OK |
| `17` / `נץ` | מגן בראשות גל הירש | 3,394 | 0 | 25 | OK |
| `18` / `ק` | צדק לכל כי הגיעה העת למען החי, האדם, והאדמה | 3,281 | 0 | 6 | OK |
| `19` / `זץ` | אורן חזן בראשות "צומת" | 2,417 | 0 | 14 | OK |
| `20` / `י` | ישר - דמוקרטיה אמיתית | 1,438 | 0 | 17 | OK |
| `21` / `נז` | זכויותינו בקולנו | 1,316 | 0 | 10 | OK |
| `22` / `זי` | מפלגת האזרחים הותיקים | 1,168 | 0 | 16 | OK |
| `23` / `קף` | כל ישראל אחים ופעולה לישראל | 1,140 | 0 | 17 | OK |
| `24` / `ףז` | הפיראטים בראשות האינטרנט פתק לשלשול | 819 | 0 | 11 | OK |
| `25` / `ףי` | פשוט אהבה - כי כולן/ם בני אדם | 733 | 0 | 9 | OK |
| `26` / `קי` | ארץ ישראל שלנו | 701 | 0 | 7 | OK |
| `27` / `ףץ` | נ נח - הרשימה הממלכתית - תרימו את הראש | 624 | 0 | 34 | OK |
| `28` / `קן` | מהתחלה | 603 | 0 | 9 | OK |
| `29` / `ךק` | התקווה לשינוי | 562 | 0 | 8 | OK |
| `30` / `ץ` | כלכלה ירוקה - מדינה אחת | 556 | 0 | 19 | OK |
| `31` / `ףך` | חינוך | 518 | 0 | 18 | OK |
| `32` / `יץ` | אחריות למייסדים בראשות חיים דיין | 428 | 0 | 23 | OK |
| `33` / `ןך` | כבוד האדם | 404 | 0 | 10 | OK |
| `34` / `ףנ` | שווים | 401 | 0 | 6 | OK |
| `35` / `ןנ` | מנהיגות חברתית | 385 | 0 | 5 | OK |
| `36` / `ץי` | אני ואתה - מפלגת העם הישראלית בהובלת ד"ר אלון גלעדי | 368 | 0 | 23 | OK |
| `37` / `יז` | מפלגת הגוש התנ"כי | 353 | 0 | 5 | OK |
| `38` / `ין` | איחוד בני הברית בראשות רב חובל בשארה שליאן | 265 | 0 | 7 | OK |
| `39` / `זך` | ברית עולם | 216 | 0 | 1 | OK |
| `40` / `ץז` | אופק חדש בכבוד | 0 | 0 | 12 | WRONG: F1; other checked fields OK |
| `41` / `זנ` | יחד בראשית אלי ישי | 0 | 0 | 18 | WRONG: F2; other checked fields OK |
| `42` / `נך` | מפלגת הרפורמה | 0 | 0 | 11 | WRONG: F3; other checked fields OK |

Independent roster extraction was separate from the repository's PDF parser: pypdf 6.21.4 layout text, Hebrew reading-order normalization, then numbered-cell comparison to given + family + party fields. All **1,580** candidates were covered. Five wrapped cells (ג#33, ז#8, זנ#9, טב#37, ן#2) were manually inspected in the extracted continuation lines; their extra name parts are present and correctly retained. Gazette typos were not silently modernized: for example, the registered Yachad name really prints `יחד בראשית אלי ישי`; its withdrawal notice uses the conventional `בראשות`.

All **120** S2 elected-name cells match the app's winning roster prefixes after ignoring punctuation/spacing and using given-name-first ordering. No pre-first-sitting substitution was found. The live OData position record includes one later member, Merav Michaeli (PersonID 23565), starting **1 August 2019**; later membership must not replace a 17 April gazetted winner. The app does not promise a complete subsequent-membership timeline.

## Fourteen further passing check groups

All are OK within the stated scope; sources, ranks, quotations and access date are in the ledger.

| ID | Bounded claim / paths checked | Evidence and result |
|---|---|---|
| O1 | `public/data/k21.json` `$.id`, `$.knesset`, `$.electionDate`, bilingual election labels | S1/S6: k21 / 21 / 2019-04-09; no direct-PM contest or runoff |
| O2 | `$.totals.{registered,votesCast,invalid,valid}` | S1: 6,339,729 / 4,340,253 / 30,983 / 4,309,270; S2 confirms valid/invalid; S10 independently repeats electorate/cast/valid |
| O3 | `$.ruleSetId`; 3.25% threshold and 120-seat parliamentary contest | S10 confirms percentage; Gazette S2 allocates 120 seats; exact integer threshold is **140,052** (ceiling of 140,051.275); qualifying votes 3,943,254, integer initial quota 32,860. Arithmetic check, not independent reimplementation of the entire election law |
| O4 | `$.agreements[0:6]` | S4 numbered items 1–6: אמת–מרצ; ג–שס; נ–ל; מחל–טב; דעם–ום; ףץ–ףז. Both ineffective pairs retained; no inferred omitted pair |
| O5 | Winning prefixes / `$.officialSeats` / candidate names and order | S2, 120/120 identities/ranks agree; all eleven winning first-ranked candidates agree with Gazette; no candidate-notes entry falsely substitutes a later member |
| O6 | `data/raw/k21/knesset-odata-members.json` `$.positions`; opening date and later-member boundary | S7 live pagination: 121 position IDs equal retained IDs, including 120 opening members at 30 April 2019 and the 1 August later member |
| O7 | `public/data/k21-localities.json` all 1,214 rows, every list vote, electorate/cast/invalid/valid; national locality/envelope totals | Every numerical cell agrees with retained S8. 1,213 real localities + envelope row; envelope cast 240,783, invalid 1,961, valid 238,822. All four national sums agree. All 10,765 retained polling records were independently aggregated by locality and every four-total/list-vote aggregate matched; retained station hash equals manifest. No fresh polling download claimed |
| O8 | Eight `data/meta/k21.json` joint-list party sets and associated `party-lineage` `partners-21-*` edges | S3 headings and party columns confirm Likud–Ahi; Resilience–Yesh Atid–Telem; Aguda–Degel; Hadash–Ta’al; Jewish Home–Tkuma–Jewish National Front/Otzma; Ra’am–Balad; Zehut–Achiezer; Kol Yisrael Ahim–Peula LeYisrael. These are electoral partnerships, not organizational mergers |
| O9 | Joint-list elected constituent counts in `data/meta/joint-facts.json` | S3 candidate columns + S2 elected prefixes yield 34/1; 15/15/5; 4/4; 4/2; 3/2/0; 2/2; zero/zero; zero/zero, in the party order above. Head-party IDs agree with rank 1 affiliation. Faction coverage is explicitly incomplete, not a claim every missing row is unaffiliated |
| O10 | Recommendation choices of the other ten lists; `$.blocSchemes[0].date`; aftermath consultation window | S11/S12: meetings 15–16 April, Likud/Shas/UTJ/URP/Yisrael Beitenu/Kulanu → Netanyahu (65 seats), Blue and White/Labor/Meretz → Gantz (45), Hadash–Ta’al → none (6). End-date 16 April is valid. Ra’am–Balad excluded from this passing group (F5) |
| O11 | Aftermath `$.results.certified` and `$.formation.events[0:2]` | S16 confirms results presentation 17 April; S13 mandate 17 April / 28 days; S14 extension 13 May / 14 days. These remain secondary reports of formal acts; no President's original transcript was recovered |
| O12 | `governmentNote`; aftermath no-government outcome, dissolution date/vote/next election, election-to-election term scope; context no-government / repeated-election entries | S17 confirms 30 May dissolution 74–45 and 17 September election; no new government follows k21. Correctly keeps outgoing government 34 rather than inventing a k21 government 35. The declared election-to-next-election interval is not a claim that the parliamentary term began on polling day |
| O13 | `election-context.json` k21 Ra’am–Balad / Ofer Cassif / Michael Ben-Ari eligibility entries and double-envelope procedure | S18 supports overturned exclusions for Ra’am–Balad and Cassif, final individual Ben-Ari exclusion. S3 approved rosters include Cassif and exclude Ben-Ari. S19 supports 24 March review date, non-military eligible groups, central verification/counting and counting timetable |
| O14 | Retained official-origin logo evidence / final files, distinct joint-list/constituent keys | All nine final-file SHA-256 values match. Retained page/asset manifest hashes match; Likud (both list and constituent keys), Beiteinu and Hadash retained assets independently match retained CDX SHA-1 digests and campaign-page references. Hadash–Ta’al has dated party-publication evidence, not a new independent political history source. U4/U5 preserve limits for the remaining temporal/rights claims |

## Coverage boundaries and editorial checks

- `data/meta/aftermath/k21.json` is explicitly pilot research, not all wired into the app. Empty reaction, term-event and polling arrays are disclosed collection gaps, not claims that nothing happened. SIPRI's pending 4–5 May event was not independently re-researched; no event is falsely displayed as included. The precise 29 May expiry has an existing deadline citation; the full liveblog was not certified line by line.
- `data/meta/election-context.json`, joint facts, party-lineage k21 edges, all nine family k21 blocks, party links, logos, bios and `src` k21/year matches were inspected for scope. No election-specific hard-coded UI claim beyond labels was found in the source search. Broader party histories and all biography destinations remain U2/U3/U6; do not describe this report as full link certification.
- No English Wikipedia link was found in the k21-specific data/metadata checked, and none was opened or used as a lead. Search engines returned some excluded English-Wikipedia results; those were not evidence. Hebrew-Wikipedia colours and biography references are explicitly secondary. Prefer already retained official party artwork for an election-era colour association; an infobox header colour is not an official specification.
- No partisan editorial wording requiring correction was found in the bounded checked claims. Quoted list slogans (for example “the sane right”) are official registered list names, not the app's endorsement. Family classifications are clearly declared editorial interpretations; U3 remains a source-fidelity gap, not a finding of political bias.

## Reproduction and handoff

Read-only verification used Python 3.14 / pypdf 6.21.4; the CEC scan was rendered with Python 3.13 / PyMuPDF 2.1 for manual reading. Downloads, scripts, extracted text and renders live only in `.backup-scratch/data-audit/k21/`; regenerate from the URLs and hashes above. Project User-Agent was used for direct HTTP requests. DNS required the ordinary authorized network execution context; no proxy, challenge, login or paywall bypass was used. Direct shell 403/247 responses and web-index access are distinguished in the ledger.

The fixer should first correct the three withdrawal inputs, retain/register the results Gazette, and replace the incomplete Ra’am–Balad inference with a completed-consultation source. Keep the registered candidate snapshots. Resolve U1–U6 before making broader claims of complete verification. Only this report is committed; the recovered Gazette remains scratch until the fixer retains it under the authorized data workflow.
