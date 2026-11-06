# k22 independent Codex audit — 17 September 2019

Accessed: **2026-11-06**. Baseline: `53cca36` (`origin/main`); branch `t3/267e4ee9`. Auditor only: no data edits, dataset builds, push or integration merge. The requested initial `git merge --ff-only origin/main` returned “Already up to date.”

This is a **qualified, partial audit**, not certification of every fact. The national results, all opening elected identities, recommendation totals, formation chronology and locality transcription received substantive checks. The 1,085 unelected roster entries, all English spellings, every individual biography destination, geographic classifications and family interpretations have not received complete independent source checks. Their grouped limitations below must not be read as passing checks.

Counts use **claim groups**, not scalar JSON fields or people: **OK 79; WRONG 4; UNSUPPORTED 1; UNVERIFIABLE 6; DISPUTED 0**. Group boundaries are the numbered non-OK rows and the explicit counts in the OK ledger. A group may contain many fields; these are not 90 individually verified historical facts. Confirmed results and editorial spelling differences are kept separate.

## Non-OK findings

Paths select objects by their stable IDs where an array is involved. Source ranks follow `source-hierarchy.md`; “unranked” means a provenance declaration outside its historical-source ladder. All rows accessed 2026-11-06.

| ID / class | File and exact path | Current value | Correct value / disposition | Source URL; rank; verbatim evidence |
|---|---|---|---|---|
| F1 WRONG | `public/data/k22.json` `$.lists[29].withdrawn` (`22-זן`); builder `scripts/lib/historical/k22-k24-common.ts`, `buildHistorical` | `false` | `true`; retain the official zero votes and approved roster, distinguish withdrawal from a contested zero-vote list. | https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-9293fde87fdec61027.htm ; rank 4; “מתפקדי מפלגת זהות אישרו הערב (ראשון) את פרישת המפלגה מהמרוץ לבחירות לכנסת ה-22” (1 September 2019). |
| F2 WRONG | `public/data/k22.json` `$.lists[31].withdrawn` (`22-כ`); same builder | `false` | `true`; withdrawal announced 15 September 2019. | https://elections.walla.co.il/item/3312758 ; rank 4; title “נעם הודיעה על פרישה”. Independent corroboration: https://www.mako.co.il/news-israel-elections/2020/Article-cc510001c9baf61027.htm says three of 32 registered lists withdrew, including Zehut and Noam. |
| F3 WRONG | `data/meta/parties.json` `$.parties[?(@.id=="gesher")]` (`names`, `activePeriod`, `sources`); `data/meta/party-lineage.json` `$.edges[?(@.id=="partners-22-אמת")].from`; `data/meta/k22.json` `$.lists[?(@.letters=="אמת")].parties[?(@.id=="gesher")].id` | One party entity combines 1996/1999 and 2019/2020 appearances. | Separate the 1990s David Levy party from the new Orly Levy-Abekasis party. Preserve each election’s correct display name. Do not infer continuous organisational identity from a reused name. | https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf ; rank 3; PDF p.536 / printed p.534: “המפלגה החדשה )עם השם הישן( כדין אצל רשם המפלגות.” Surrounding text dates registration to December 2018 and describes two separate parties (previous PDF page). |
| F4 WRONG | `data/meta/aftermath/k22.json` `$.gaps[5]` | “No term event satisfies the two-chronology rule in this pass.” | Remove/update stale gap: `$.term.events` now contains two accepted events. This is an internal research-record inconsistency, not a false election result. | Same file `$.term.events[0:2]`, rank: repository evidence, not an external historical authority; verbatim “indictment-announcement-2019”, “us-peace-plan-2020”. |
| F5 UNSUPPORTED | `data/meta/logos/k22.json` `$.logos[0].inUseEvidence` (`ודעם`) | “Commons dates this party-supplied variant to August 2019…” | Commons confirms its asserted date and 2019 upload, but does not establish that the variant was party-supplied. Remove that provenance claim or supply actual party-origin evidence. No redesign/image research requested. | https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg ; unranked asset metadata; “Date August 2019”; Source and Author both link to **English Wikipedia’s Joint List article**, rather than an official party site. No English Wikipedia link was followed. |
| F6 UNVERIFIABLE | `public/data/k22.json` `$.lists[30].withdrawn` (`22-נץ`) | `false`, zero votes | Investigate the third withdrawn list; do not set true solely because votes are zero. An indexed Kipa headline identifies this list as withdrawn, but the article was not reached. | https://www.mako.co.il/news-israel-elections/2020/Article-cc510001c9baf61027.htm ; rank 4; “32 נרשמו אך שלוש”; https://www.kipa.co.il/הכותבים-שלנו/חדשות/page/6657/ index headline “מפלגת כל ישראל אחים לשוויון חברתי פרשה”, article inaccessible in web tool. Gazette p.14492 only proves **Michael Corinaldi’s individual resignation**, not the whole list’s withdrawal. |
| F7 UNVERIFIABLE | `data/meta/logos/k22.json` `$.logos[8]` (`jewish-home`), campaign-byte identity | `status: "verified"`, medium confidence; explicitly acknowledged CDX/replay digest mismatch | Campaign HTML reference is supported, but exact election-period asset identity remains unresolved. Keep the existing caveat; do not silently promote to high confidence. | https://web.archive.org/web/20190821141704/http://baityehudi.org.il/ ; official party self-identification via archive; retained page references `images/new_logo.png`. The metadata records “Index/payload mismatch unresolved”; 2019 index digest `MWNXYMDODAIPTYKVMVKPH2KOZQFXWN6U` differs from retained payload `FF3SNIJKPIOZG6IAJZOVM6DGVYFRW4KE`. No archive bypass attempted. |
| F8 UNVERIFIABLE | `data/meta/bios/k22.json` `$.candidates.*.{knesset.url,hewiki.url}`; `public/data/k22.json` `$.lists[*].candidates[*].{nameEn,bio}` | 190 candidate biography entries; English names on roster entries | Opening elected person IDs are checked separately below. This is not validation of every website/site-ID mapping, English spelling or 70 other biographies. Keep pattern-derived matching distinct from opened-page identity verification. | https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/988 ; rank 1 intended destination; official HTML service returned a location-unavailable page in this access context (history page test); no location workaround used. Record entry says `verified: "pattern"`; that is not a page-body identity proof. |
| F9 UNVERIFIABLE | `public/data/k22.json` `$.lists[*].candidates[rank > officialSeats[list.id]]`; corresponding party assignments in `data/meta/k22.json` | 1,085 unelected approved-roster entries in 32 lists | Source exists and was downloaded, but no complete independent cell-by-cell transcription audit of these 1,085 entries was finished. Do not extrapolate opening-membership verification to them. | https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8420.pdf ; rank 1; YP 8420, pp.14466–14492, title “רשימות המועמדים לכנסת העשרים ושתיים”. pypdf 6.1.3 text extraction inspected; multi-column Hebrew reversals prevent treating an automated string search as proof of all names/ranks. |
| F10 UNVERIFIABLE | `data/meta/k22.json` `$.colours[*]` (28 entries) | Hebrew-Wikipedia infobox colours; explicitly not official specifications | Decorative choices are not historical errors; exact infobox/official-colour assertions were not reopened individually. Flag sole rank-5 provenance and avoid claiming these are verified election-specific official colours. | Per-entry `sources[0].url` (28 precise locators retained in the file); rank 5; common disclaimer “Not an official party specification.” No inference from later party branding. |
| F11 UNVERIFIABLE | `data/meta/logos/k22.json` `$.logos[2]` (`balad`); `data/meta/families/*.json` k22 membership interpretations; `public/data/k22-locations.json`, `k22-locality-names.json` | Balad campaign-use claim; family and geographic labels | These evidence families remain outside the completed independent checks. Family seat arithmetic derives from checked votes/seats, but ideological/organisational classification needs its own source reading. Geographic coordinates/names/demographic classifications likewise require their underlying geographic sources. | Per-entry source references in these files; ranks vary. No supporting quotation independently obtained for this group; not counted OK merely because files parse or hashes match. |

F8–F11 are explicit coverage limitations, not assertions that the underlying data is false. F6 is a specific unresolved withdrawal claim. F7 was already disclosed by the dataset; the audit does not turn an acknowledged uncertainty into a contradiction.

## Evidence and confirmed checks

The following source abbreviations are exact retrieval routes, all accessed 2026-11-06:

- **R**: CEC final national results, rank 1: https://votes22.bechirot.gov.il/nationalresults. Fresh project-UA HTTP 200, 26,182 bytes; SHA-256 `ef809c556d0d661b059568d01a1459279aaa4ff28dfa3f5b2e96e0b92d651211`, identical to retained raw file. Final-status heading: “תוצאות סופיות רשמיות”.
- **C**: CEC/Reshumot candidate gazette YP 8420, rank 1: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8420.pdf. Fresh HTTP 200, 496,808 bytes; SHA-256 `abcdbca3e43095cc37613d0660c108bbff7f95cc9935e1d3ca2ded2d31b5428b`. Approved-list name is the app’s name source; it can differ slightly from R.
- **A**: Reshumot YP 8430 p.14634, rank 1 document on disclosed olaw mirror: https://olaw.org.il/yalkut/yalkut-8430.pdf. Fresh HTTP 200, 180,330 bytes; SHA-256 `e799d4dcc8ea2df69263c32cd3c776696a5a0d72fb418567d102f551ef41ff16`. Heading “הודעה בדבר התקשרויות בין רשימות מועמדים”.
- **K**: official Knesset OData, rank 1: `https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2022%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json`. Followed **relative `odata.nextLink`** with JSON format: 121 positions, of which exactly 120 start `2019-10-03T00:00:00`. Faction query `PositionID eq 54`: 148 rows. `KNS_Person?$filter=PersonID eq …&$format=json` queried every retained person ID in batches of 25: 121 identities. No truncated first-page assumption. Evidence field quote: `"StartDate":"2019-10-03T00:00:00"`.
- **L**: CEC via data.gov.il, rank 1: https://data.gov.il/api/3/action/datastore_search?resource_id=bd22cd14-138c-4917-931a-ef628c2a5a30&limit=10000 . Fresh 1,214 records, API total 1,214; **all records identical** to retained `localities.datagov.json`. Row `"שם ישוב":"מעטפות חיצוניות"`, `"מצביעים":282442`.

### Every list: national result and identity (32 OK groups)

Each row checks `public/data/k22.json $.lists[i].{letters,votes,nameHe,shortEn}` and `$.officialSeats[list.id]`. Ballot letters, votes and seats agree with R. Hebrew names agree with C, allowing whitespace and source-specific spelling. English short labels are identified translations/transliterations, not claimed official CEC English names; exact English styling remains subject to F8. R includes three zero-vote entries: their arithmetic is correct even though withdrawal flags need separate review.

| Index / letters | English label | Votes | Seats | Name-source check |
|---|---|---:|---:|---|
| 0 / פה | Blue and White | 1,151,214 | 33 | OK R/C |
| 1 / מחל | Likud | 1,113,617 | 32 | OK R/C |
| 2 / ודעם | Joint List | 470,211 | 13 | OK R/C |
| 3 / שס | Shas | 330,199 | 9 | OK R/C |
| 4 / ל | Yisrael Beiteinu | 310,154 | 8 | OK R/C |
| 5 / ג | United Torah Judaism | 268,775 | 7 | OK R/C |
| 6 / טב | Yamina | 260,655 | 7 | OK R/C |
| 7 / אמת | Labor–Gesher | 212,782 | 6 | OK R/C |
| 8 / מרצ | Democratic Union | 192,495 | 5 | OK R/C |
| 9 / כף | Otzma Yehudit | 83,609 | 0 | OK R/C |
| 10 / זץ | Tzomet | 14,805 | 0 | OK R/C |
| 11 / כי | HaAhdut HaAmamit – Al Wahda Al Shaabiya | 5,946 | 0 | OK R/C |
| 12 / יז | Adom Lavan | 4,358 | 0 | OK R/C |
| 13 / צ | Tzedek | 3,053 | 0 | OK R/C |
| 14 / רק | Ron Kobi – HaYamin HaHiloni | 2,395 | 0 | OK R/C |
| 15 / נך | Kavod VeShivyon | 1,545 | 0 | OK R/C |
| 16 / ק | Zkhuyotenu BeKolenu | 1,473 | 0 | OK R/C |
| 17 / ףז | HaPiratim | 1,236 | 0 | OK R/C |
| 18 / ז | Otzma Kalkalit | 1,193 | 0 | OK R/C |
| 19 / נ | Mitkademet | 1,033 | 0 | OK R/C |
| 20 / קץ | Kama – Kidum Maamad HaPrat | 994 | 0 | OK R/C |
| 21 / קך | Seder Hadash | 928 | 0 | OK R/C |
| 22 / זכ | Mifleget HaDemokratura | 736 | 0 | OK R/C |
| 23 / צן | Tzafon | 725 | 0 | OK R/C |
| 24 / ינ | HaTnua HaNotzrit HaLiberalit | 610 | 0 | OK R/C |
| 25 / ץ | Daam | 592 | 0 | OK R/C |
| 26 / יף | Kvod HaAdam | 542 | 0 | OK R/C |
| 27 / יק | Mifleget HaGush HaTanakhi | 497 | 0 | OK R/C |
| 28 / י | Manhigut Hevratit | 434 | 0 | OK R/C |
| 29 / זן | Zehut | 0 | 0 | OK R/C |
| 30 / נץ | Kol Yisrael Ahim LeShivyon Hevrati | 0 | 0 | OK R/C |
| 31 / כ | Noam | 0 | 0 | OK R/C |

R’s transcription differs from C at a few places: e.g. `הורוביץ` versus C/app `הורביץ`, R `אלוחדה` versus C/app `אלחודה`, and R `שומרי התורה` versus C/app `שומרי תורה`. These are **not** wrong list identities: the app explicitly uses the approved gazette wording. The app’s `nameHe` is not a verbatim copy of the final-results table, and should not be described as one.

### Elected members (9 OK groups, 120 identities)

For each winning list, checked its complete elected rank prefix against C and its identity set against fresh K. All 120 `knessetPersonId` values in the associated biography entries are unique and comprise **exactly** K’s 120 opening members. 84 names match after punctuation/whitespace normalisation; the remaining 36 were reviewed as formal-name/common-name or spelling variants, with no missing/extra opening member. These mappings check identities, not every biography URL (F8). Examples: C `גבריאל אשכנזי` / K `גבי אשכנזי`; C `ארמונד עמיר פרץ` / K `עמיר פרץ`; C `קטרין שיטרית` / K `קטי קטרין שטרית`. Printed names must not be silently replaced just because OData uses a common name.

| List | Elected ranks checked | Result |
|---|---|---|
| פה | 1–33 | OK C/K |
| מחל | 1–32 | OK C/K |
| ודעם | 1–13 | OK C/K |
| שס | 1–9 | OK C/K |
| ל | 1–8 | OK C/K |
| ג | 1–7 | OK C/K |
| טב | 1–7 | OK C/K |
| אמת | 1–6 | OK C/K |
| מרצ | 1–5 | OK C/K |

K’s additional later member is `יוראי להב הרצנו`; he is not an extra opening elected candidate. No k22-specific pre-opening replacement note is claimed in `candidate-notes.json`. C p.14492 confirms the six **individual candidate** resignation notes already attached to losing lists; none should be mistaken for a whole-list withdrawal.

### Joint lists and constituent counts (7 OK groups)

Checked C’s submitting-party headings and elected-party column assignments against `data/meta/k22.json`, `joint-facts.json` and `party-lineage.json` partner edges. These are legal submitting affiliations at this election, not necessarily later faction membership or popular political affiliation.

| Letters | Elected constituent split | Evidence |
|---|---|---|
| פה | israel-resilience: 15; yesh-atid: 13; telem: 5 | OK C, party-affiliation column |
| מחל | likud: 31; kulanu: 1 | OK C, party-affiliation column |
| ודעם | hadash: 5; balad: 3; taal: 2; raam: 3 | OK C, party-affiliation column |
| ג | agudat-yisrael: 4; degel-hatorah: 3 | OK C, party-affiliation column |
| טב | new-right: 3; jewish-home: 2; tkuma: 2 | OK C, party-affiliation column |
| אמת | labor: 5; gesher: 1 | OK C, party-affiliation column |
| מרצ | meretz: 3; green-movement: 1; independence: 1 | OK C, party-affiliation column |

Notable checks: C assigns Moshe Kahlon (#5) and Eli Cohen (#15) to Likud, while Yifat Shasha-Biton (#29) is Kulanu. Do not “correct” those legal affiliations from political memory. C names Democratic Union’s submitting party `העצמאות`; using `independence` for Yair Golan is supported by that legal record even where political reporting calls his organisation Israel Democratic. Gesher’s **k22 membership** is correct; F3 concerns cross-era identity conflation.

### Other OK claim groups (31)

| Groups | Path / claim | Source and brief evidence |
|---:|---|---|
| 1 | `$.knesset`, `$.electionDate`, `$.totals.{registered,votesCast,valid,invalid}`, final status | R: 22; 2019-09-17; 6,394,030 / 4,465,168 / 4,436,806 / 28,362. Sum of all 32 list votes equals valid votes; valid + invalid equals cast. |
| 1 | `$.ruleSetId` 3.25% threshold, parliamentary contest | Knesset history indexed official page https://main.knesset.gov.il/About/History/pages/knessethistory.aspx?kns=22 states “אחוז החסימה 144197 (3.25%)”; IDI independent election table https://www.idi.org.il/policy/parties-and-elections/elections/2019-september/ confirms 3.25%. Full allocation-law implementation was not re-audited here. |
| 1 | `$.totals.{localities,envelopeVotes}`, locality numeric transcription, 2,812 electorate discrepancy | L: 1,213 geographic localities plus code 9999 external envelopes; 282,442 external-envelope cast votes. All 1,214 rows × 32 list-vote cells and numeric turnout columns match generated localities. Two double-space locality names are normalised only. L electorate sums to 6,391,218; the national total remains 6,394,030. The app correctly says the discrepancy’s cause is unverified. Polling-station count 10,901 is retained reconciliation evidence, not independently re-derived in this pass. |
| 5 | `$.agreements[0:5].members` | A paragraphs (1)–(5), all checked: מחל–טב; מרצ–אמת; שס–ג; פה–ל; כ–כף. No inference that an agreement implies the list ultimately contested. |
| 1 | `data/meta/k22.json $.blocSchemes[0]` and aftermath recommendation round: all nine list choices, 55–54–11, date 23 Sep | Rank 4 independent report https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-4618f0558ac5d61027.htm , dated 23 Sep: “55 המליצו על נתניהו, 54 על גנץ - 11 לא המליצו”. UTJ/Yamina→Netanyahu; Labor–Gesher/Democratic Union→Gantz; previous-day Likud/Shas→Netanyahu, Blue and White→Gantz, Yisrael Beiteinu→none; Joint List splits 10/3. Letter text independently reproduced at https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-1ea3a38157c5d61027.htm : “בשם 10 חברי כנסת ... ולא 13”. Direct presidential letters were not recovered. The JPost URL opened only headline/body-shell here, so its repository long quotation was not independently revalidated. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[0]`: 2019-09-25 Netanyahu mandate; 28 days | Rank 4, https://www.timesofisrael.com/rivlin-tasks-netanyahu-with-forming-next-government-after-unity-talks-fail/amp/; “tasked Benjamin Netanyahu”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[1]`: 2019-10-21 Netanyahu returns mandate | Rank 4, https://www.timesofisrael.com/netanyahu-tells-president-he-cant-form-government-now-its-gantzs-turn-to-try/; “returned the mandate”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[2]`: 2019-10-23 Gantz mandate; 28 days | Rank 4, https://www.timesofisrael.com/liveblog_entry/rivlin-tasks-gantz-with-forming-next-government/; “Gantz will have 28 days”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[3]`: 2019-11-20 Gantz fails/returns mandate | Rank 4, https://www.timesofisrael.com/making-history-knesset-set-to-enter-21-day-grace-period-for-forming-government/; “handing the mandate back”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[4]`: 2019-11-21 parliamentary 21 days starts, ends midnight 11 December | Rank 4, https://www.timesofisrael.com/making-history-knesset-set-to-enter-21-day-grace-period-for-forming-government/; “begins Thursday and ends at midnight on December 11”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[5]`: 2019-12-11 expiry without 61 signatures | Rank 4, https://www.timesofisrael.com/israel-calls-another-election-for-march-the-third-in-a-year/amp/; “no such candidate was nominated”. Date checked against article publication/body, not guessed from URL. |
| 1 | `data/meta/aftermath/k22.json $.formation.events[6]`: 2019-12-12 dissolution law, next election 2 March 2020; no new government | Rank 3, https://en.idi.org.il/articles/38887; “the Knesset passed a law to dissolve the 22nd Knesset”. Date checked against article publication/body, not guessed from URL. |
| 3 | `election-context.json` events `sequence-k22`, `no-government-k22`, `candidate-exclusion-final-k22` | Five 2019–2022 elections: rank 1 State Comptroller https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2025/2025-05/2025-05-301-Elections.pdf , “חמש מערכות בחירות רצופות”. No new government: formation sources above. Marzel/Gopstein excluded individually after CEC approval: rank 3 https://www.idi.org.il/articles/65951 , “על אף שגם במקרה שלהם ועדת הבחירות המרכזית אישרה את מועמדותם”; rank 4 contemporary https://www.ynet.co.il/articles/mobile/0,7340,L-5575260,00.html (25 Aug 2019). |
| 2 | Aftermath `$.term.events[0:2]`, 21 Nov indictment decision and 28 Jan US peace proposal | Rank 3 https://www.brookings.edu/articles/timeline-a-tumultuous-fall-in-israeli-politics/ , entry 21 Nov “Netanyahu indicted”; body distinguishes decision announcement. Rank 1 https://trumpwhitehouse.archives.gov/briefings-statements/president-donald-j-trumps-vision-peace-prosperity-brighter-future-israel-palestinian-people/ , “Issued on: January 28, 2020”. Chronology-selection compliance was not fully rechecked against every cited chronology. |
| 10 | Logos indices 1,3,4,5,6,7,9,10,11,12: declared source/date/asset evidence | Index 1 Commons https://commons.wikimedia.org/wiki/File:Yamina_logo.svg expressly cites 21 Aug 2019 newspaper p.9; this verifies the attribution claim, not a newly inspected newspaper scan. Other nine entries: checked retained campaign HTML image references, original-asset manifest SHA-256, public display SHA-256 and the stored SHA-1/base32 digest bridges where present; all match. Actual retained snippets include `logo_header.png` (Yesh Atid), `images/layout_images/logo.svg` (Likud), `logo2.png` (Beiteinu), `images/logo.png` (Hadash), `logo-amc.png` (Ta’al), `logo-header.png` (Israel Democratic), `logo-new.png` (Democratic Union), `/img/NewYaminLogo.png` (New Right). These are party self-identification evidence, not policy/ideology authorities. Repeated Likud list/constituent entries are one evidence family. F7 remains separate. |

### Source fidelity and remaining limits

- No English Wikipedia URLs were found in the election-specific input/output records reviewed. **F5 does identify an indirect English-Wikipedia provenance dependency in Commons metadata.** No English Wikipedia article was opened or used as a research lead. Search engines incidentally returned excluded results; none was used.
- Hebrew Wikipedia is not the sole support for the recommendation totals: N12 independently confirms them. However the stored recommendation source `recommendations-2` points to the **23rd** election article, whose historical prelude discusses the 22nd; prefer the direct contemporary 22nd-election report above. Colour and many biography references remain rank 5 and were not upgraded.
- Domestic political claims examined are factual/attributed. No partisan wording requiring correction was found in the checked app narratives. The external Walla article contains partisan quotations; those are not adopted as the project’s voice.
- The app’s status says approved-gazette rosters before later resignations. Do not confuse those rosters with an election-day ballot or with later Knesset replacements. No new government card should be created for k22; the retained record correctly describes failed formation. Government 34’s continuation, all detailed legal rule clauses, all family classifications, party-link destinations, geographic locations/demographic groups and remaining chronology-selection claims still need independent verification beyond this pass.
- `src/` search found only the k22 schema identifier and the Joint List 2015–2020 grouping comment (`src/app/whatIf.ts`), consistent with C for k22. No additional k22-specific UI historical narrative was found by searches for k22 / September 2019 / ספטמבר 2019.
- Shell DNS failed inside the sandbox; the same ordinary-network project-UA fetches succeeded with network permission. CEC history HTML returned HTTP 403 and Knesset history HTML a location-denial page; neither was bypassed. Official OData remained directly accessible. Temporary PDF/text/JSON copies and pinned pypdf 6.1.3 live only under project `.backup-scratch/data-audit/k22/`; the report retains URLs, queries, versions, relevant quotes and source hashes needed to reproduce the substantive checks.
